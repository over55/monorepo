package datastore

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl SkillSetStorerImpl) CountByFilter(ctx context.Context, f *SkillSetPaginationListFilter) (int64, error) {
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
	// if !f.CreatedAtGTE.IsZero() {
	// 	filter["created_at"] = bson.M{"$gt": f.CreatedAtGTE} // Add the cursor condition to the filter
	// }
	if f.SearchText != "" {
		filter["sub_category"] = bson.M{"$regex": primitive.Regex{Pattern: f.SearchText, Options: "i"}}
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
