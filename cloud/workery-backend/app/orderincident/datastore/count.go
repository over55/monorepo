package datastore

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl OrderIncidentStorerImpl) CountByFilter(ctx context.Context, f *OrderIncidentPaginationListFilter) (int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 24*time.Second)
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
	if f.SearchTitle != "" {
		filter["text"] = bson.M{"$regex": primitive.Regex{Pattern: f.SearchTitle, Options: "i"}}
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
	ctx, cancel := context.WithTimeout(context.Background(), 24*time.Second)
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
