package datastore

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl OrderIncidentStorerImpl) CountByFilter(ctx context.Context, f *OrderIncidentPaginationListFilter) (int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Create the filter based on the cursor
	filter := bson.M{}

	// Add filter conditions to the filter
	if !f.TenantID.IsZero() {
		filter["tenant_id"] = f.TenantID
	}
	if f.Status != 0 {
		filter["status"] = f.Status
	}

	// FIXED: Search implementation - must match ListByFilter for accurate counts
	if f.SearchTitle != "" {
		// Option 1: Use MongoDB text search (requires text index which is already created)
		// This will use the text index on title and description fields
		// filter["$text"] = bson.M{"$search": f.SearchTitle}

		// Option 2: Use regex search on specific fields (more flexible for partial matches)
		filter["$or"] = []bson.M{
			{"title": bson.M{"$regex": primitive.Regex{Pattern: f.SearchTitle, Options: "i"}}},
			{"description": bson.M{"$regex": primitive.Regex{Pattern: f.SearchTitle, Options: "i"}}},
		}
	}

	// impl.Logger.Debug("counting w/ filter:",
	// 	slog.Any("filter", filter))

	// Use the CountDocuments method to count the matching documents.
	count, err := impl.Collection.CountDocuments(ctx, filter)
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (impl OrderIncidentStorerImpl) CountByTenantID(ctx context.Context, tenantID primitive.ObjectID) (int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Create the filter based on the cursor
	filter := bson.M{}

	// Add filter conditions to the filter
	if !tenantID.IsZero() {
		filter["tenant_id"] = tenantID
	}

	// impl.Logger.Debug("counting w/ filter:",
	// 	slog.Any("filter", filter))

	// Use the CountDocuments method to count the matching documents.
	count, err := impl.Collection.CountDocuments(ctx, filter)
	if err != nil {
		return 0, err
	}

	return count, nil
}
