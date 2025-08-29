package mongolock

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	c "github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

var (
	ErrLockAlreadyHeld = errors.New("lock is already held by another process")
	ErrLockNotHeld     = errors.New("lock is not held by this process")
	ErrLockExpired     = errors.New("lock has expired")
)

// Lock represents a distributed lock entry in MongoDB
type Lock struct {
	ID        primitive.ObjectID `bson:"_id"`
	Key       string             `bson:"key"`
	Owner     string             `bson:"owner"`
	ExpiresAt time.Time          `bson:"expires_at"`
	CreatedAt time.Time          `bson:"created_at"`
}

// DistributedLock provides distributed locking capabilities using MongoDB
type DistributedLock interface {
	// Acquire attempts to acquire a lock for the given key
	Acquire(ctx context.Context, key string, ttl time.Duration) (string, error)

	// TryAcquire attempts to acquire a lock without blocking
	TryAcquire(ctx context.Context, key string, ttl time.Duration) (string, bool, error)

	// Release releases a lock held by the given owner
	Release(ctx context.Context, key string, owner string) error

	// Extend extends the TTL of an existing lock
	Extend(ctx context.Context, key string, owner string, ttl time.Duration) error

	// IsLocked checks if a key is currently locked
	IsLocked(ctx context.Context, key string) (bool, error)

	// GetLockInfo returns information about a lock
	GetLockInfo(ctx context.Context, key string) (*Lock, error)

	// ForceRelease forcefully releases a lock (admin operation)
	ForceRelease(ctx context.Context, key string) error

	// Cleanup removes all expired locks
	Cleanup(ctx context.Context) error
}

type mongoDistributedLock struct {
	collection *mongo.Collection
	logger     *slog.Logger
	uuidGen    uuid.Provider
}

// NewDistributedLock creates a new MongoDB-based distributed lock
func NewDistributedLock(cfg *c.Conf, logger *slog.Logger, dbClient *mongo.Client, uuidProvider uuid.Provider) DistributedLock {
	logger.Debug("distributed lock initializing...")

	collection := dbClient.Database(cfg.DB.Name).Collection("distributed_locks")

	// Create indexes for efficient operations
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "key", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "expires_at", Value: 1}},
			Options: options.Index().SetExpireAfterSeconds(0), // TTL index
		},
		{
			Keys: bson.D{{Key: "owner", Value: 1}},
		},
	}

	_, err := collection.Indexes().CreateMany(ctx, indexes)
	if err != nil {
		logger.Error("failed to create indexes for distributed locks", slog.Any("error", err))
	}

	logger.Debug("distributed lock initialized with mongodb backend")

	return &mongoDistributedLock{
		collection: collection,
		logger:     logger,
		uuidGen:    uuidProvider,
	}
}

// Acquire attempts to acquire a lock with retries
func (dl *mongoDistributedLock) Acquire(ctx context.Context, key string, ttl time.Duration) (string, error) {
	owner := dl.uuidGen.NewUUID()

	// Retry logic with exponential backoff
	maxRetries := 10
	baseDelay := 100 * time.Millisecond

	for i := 0; i < maxRetries; i++ {
		// Try to acquire the lock
		acquired, err := dl.tryAcquireInternal(ctx, key, owner, ttl)
		if err != nil {
			return "", fmt.Errorf("failed to acquire lock: %w", err)
		}

		if acquired {
			dl.logger.Debug("lock acquired",
				slog.String("key", key),
				slog.String("owner", owner),
				slog.Duration("ttl", ttl))
			return owner, nil
		}

		// Check if context is cancelled
		select {
		case <-ctx.Done():
			return "", ctx.Err()
		default:
		}

		// Wait before retrying with exponential backoff
		delay := baseDelay * time.Duration(1<<uint(i))
		if delay > 5*time.Second {
			delay = 5 * time.Second
		}

		timer := time.NewTimer(delay)
		select {
		case <-ctx.Done():
			timer.Stop()
			return "", ctx.Err()
		case <-timer.C:
		}
	}

	return "", ErrLockAlreadyHeld
}

// TryAcquire attempts to acquire a lock without blocking
func (dl *mongoDistributedLock) TryAcquire(ctx context.Context, key string, ttl time.Duration) (string, bool, error) {
	owner := dl.uuidGen.NewUUID()
	acquired, err := dl.tryAcquireInternal(ctx, key, owner, ttl)
	if err != nil {
		return "", false, err
	}

	if acquired {
		dl.logger.Debug("lock acquired (try)",
			slog.String("key", key),
			slog.String("owner", owner))
		return owner, true, nil
	}

	return "", false, nil
}

// tryAcquireInternal performs the actual lock acquisition attempt
func (dl *mongoDistributedLock) tryAcquireInternal(ctx context.Context, key string, owner string, ttl time.Duration) (bool, error) {
	now := time.Now()
	expiresAt := now.Add(ttl)

	lock := Lock{
		ID:        primitive.NewObjectID(),
		Key:       key,
		Owner:     owner,
		ExpiresAt: expiresAt,
		CreatedAt: now,
	}

	// Try to insert the lock document
	_, err := dl.collection.InsertOne(ctx, lock)
	if err != nil {
		// Check if it's a duplicate key error
		if mongo.IsDuplicateKeyError(err) {
			// Lock already exists, check if it's expired
			var existingLock Lock
			findErr := dl.collection.FindOne(ctx, bson.M{"key": key}).Decode(&existingLock)
			if findErr != nil {
				if findErr == mongo.ErrNoDocuments {
					// Lock was just released, try again
					return false, nil
				}
				return false, findErr
			}

			// If the lock is expired, try to update it (not replace)
			if existingLock.ExpiresAt.Before(now) {
				filter := bson.M{
					"key":        key,
					"expires_at": bson.M{"$lt": now},
				}

				// Use UpdateOne instead of ReplaceOne to avoid changing _id
				update := bson.M{
					"$set": bson.M{
						"owner":      owner,
						"expires_at": expiresAt,
						"created_at": now,
					},
				}

				result, updateErr := dl.collection.UpdateOne(ctx, filter, update)
				if updateErr != nil {
					return false, updateErr
				}

				return result.ModifiedCount > 0, nil
			}

			return false, nil
		}
		return false, err
	}

	return true, nil
}

// Release releases a lock held by the given owner
func (dl *mongoDistributedLock) Release(ctx context.Context, key string, owner string) error {
	filter := bson.M{
		"key":   key,
		"owner": owner,
	}

	result, err := dl.collection.DeleteOne(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to release lock: %w", err)
	}

	if result.DeletedCount == 0 {
		return ErrLockNotHeld
	}

	dl.logger.Debug("lock released",
		slog.String("key", key),
		slog.String("owner", owner))

	return nil
}

// Extend extends the TTL of an existing lock
func (dl *mongoDistributedLock) Extend(ctx context.Context, key string, owner string, ttl time.Duration) error {
	filter := bson.M{
		"key":        key,
		"owner":      owner,
		"expires_at": bson.M{"$gt": time.Now()}, // Only extend non-expired locks
	}

	update := bson.M{
		"$set": bson.M{
			"expires_at": time.Now().Add(ttl),
		},
	}

	result, err := dl.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to extend lock: %w", err)
	}

	if result.ModifiedCount == 0 {
		// Check if lock exists but is expired or owned by someone else
		var lock Lock
		findErr := dl.collection.FindOne(ctx, bson.M{"key": key}).Decode(&lock)
		if findErr == mongo.ErrNoDocuments {
			return ErrLockNotHeld
		}
		if lock.Owner != owner {
			return ErrLockNotHeld
		}
		return ErrLockExpired
	}

	// dl.logger.Debug("lock extended",
	// 	slog.String("key", key),
	// 	slog.String("owner", owner),
	// 	slog.Duration("ttl", ttl)) // Commented out to reduce log noise

	return nil
}

// IsLocked checks if a key is currently locked
func (dl *mongoDistributedLock) IsLocked(ctx context.Context, key string) (bool, error) {
	filter := bson.M{
		"key":        key,
		"expires_at": bson.M{"$gt": time.Now()},
	}

	count, err := dl.collection.CountDocuments(ctx, filter)
	if err != nil {
		return false, fmt.Errorf("failed to check lock status: %w", err)
	}

	return count > 0, nil
}

// GetLockInfo returns information about a lock
func (dl *mongoDistributedLock) GetLockInfo(ctx context.Context, key string) (*Lock, error) {
	var lock Lock
	err := dl.collection.FindOne(ctx, bson.M{"key": key}).Decode(&lock)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get lock info: %w", err)
	}

	return &lock, nil
}

// ForceRelease forcefully releases a lock (admin operation)
func (dl *mongoDistributedLock) ForceRelease(ctx context.Context, key string) error {
	result, err := dl.collection.DeleteOne(ctx, bson.M{"key": key})
	if err != nil {
		return fmt.Errorf("failed to force release lock: %w", err)
	}

	if result.DeletedCount > 0 {
		dl.logger.Warn("lock forcefully released",
			slog.String("key", key))
	}

	return nil
}

// Cleanup removes all expired locks
func (dl *mongoDistributedLock) Cleanup(ctx context.Context) error {
	filter := bson.M{
		"expires_at": bson.M{"$lt": time.Now()},
	}

	result, err := dl.collection.DeleteMany(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to cleanup expired locks: %w", err)
	}

	if result.DeletedCount > 0 {
		dl.logger.Info("cleaned up expired locks",
			slog.Int64("count", result.DeletedCount))
	}

	return nil
}
