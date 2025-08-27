package datastore

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl NationalOccupationalClassificationStorerImpl) CountByFilter(ctx context.Context, f *NationalOccupationalClassificationPaginationListFilter) (int64, error) {
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

	// FIXED: Match the list logic for code search
	if f.CodeStr != "" {
		filter["$or"] = []bson.M{
			{"code_str": bson.M{"$regex": primitive.Regex{Pattern: f.CodeStr, Options: "i"}}},
			{"code": bson.M{"$regex": primitive.Regex{Pattern: f.CodeStr, Options: "i"}}},
		}
	}

	// FIXED: Case-insensitive search for unit group title
	if f.UnitGroupTitle != "" {
		filter["unit_group_title"] = bson.M{"$regex": primitive.Regex{Pattern: f.UnitGroupTitle, Options: "i"}}
	}

	// FIXED: Full-text search - only add if no other specific searches
	if f.SearchText != "" && f.CodeStr == "" {
		filter["$text"] = bson.M{"$search": f.SearchText}
	}

	impl.Logger.Debug("counting w/ filter:",
		slog.Any("filter", filter))

	// Use the CountDocuments method to count the matching documents.
	count, err := impl.Collection.CountDocuments(ctx, filter)
	if err != nil {
		impl.Logger.Error("database count error", slog.Any("error", err))
		return 0, err
	}

	return count, nil
}
