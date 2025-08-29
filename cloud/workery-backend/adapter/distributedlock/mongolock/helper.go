package mongolock

import (
	"context"
	"fmt"
	"time"
)

// LockGuard provides a convenient way to work with distributed locks
type LockGuard struct {
	dl    DistributedLock
	key   string
	owner string
}

// NewLockGuard creates a new lock guard that automatically releases the lock when done
func NewLockGuard(dl DistributedLock) *LockGuard {
	return &LockGuard{
		dl: dl,
	}
}

// WithLock executes a function while holding a distributed lock
func (lg *LockGuard) WithLock(ctx context.Context, key string, ttl time.Duration, fn func() error) error {
	owner, err := lg.dl.Acquire(ctx, key, ttl)
	if err != nil {
		return fmt.Errorf("failed to acquire lock for key %s: %w", key, err)
	}

	defer func() {
		releaseErr := lg.dl.Release(context.Background(), key, owner)
		if releaseErr != nil {
			// Log the error but don't return it since the main operation might have succeeded
			fmt.Printf("failed to release lock for key %s: %v\n", key, releaseErr)
		}
	}()

	return fn()
}

// AcquireLock acquires a lock and returns a function to release it
func (lg *LockGuard) AcquireLock(ctx context.Context, key string, ttl time.Duration) (func(), error) {
	owner, err := lg.dl.Acquire(ctx, key, ttl)
	if err != nil {
		return nil, fmt.Errorf("failed to acquire lock for key %s: %w", key, err)
	}

	lg.key = key
	lg.owner = owner

	releaseFn := func() {
		releaseErr := lg.dl.Release(context.Background(), key, owner)
		if releaseErr != nil {
			fmt.Printf("failed to release lock for key %s: %v\n", key, releaseErr)
		}
	}

	return releaseFn, nil
}

// KeepAlive continuously extends a lock's TTL until the context is cancelled
func (lg *LockGuard) KeepAlive(ctx context.Context, key string, owner string, ttl time.Duration) {
	ticker := time.NewTicker(ttl / 2) // Extend at half the TTL interval
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			err := lg.dl.Extend(ctx, key, owner, ttl)
			if err != nil {
				// Log error but continue trying
				fmt.Printf("failed to extend lock for key %s: %v\n", key, err)
			}
		}
	}
}
