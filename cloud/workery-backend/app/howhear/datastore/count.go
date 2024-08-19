package datastore

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

func (impl HowHearAboutUsItemStorerImpl) CountByFilter(ctx context.Context, f *HowHearAboutUsItemPaginationListFilter) (int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 24*time.Second)
	defer cancel()

	// Create the filter based on the cursor
	filter := bson.M{}

	// Add filter conditions to the filter
	if !f.TenantID.IsZero() {
		filter["tenant_id"] = f.TenantID
	}

	// if f.ExcludeArchived {
	// 	filter["status"] = bson.M{"$ne": HowHearAboutUsItemStatusArchived} // Do not list archived items! This code
	// }
	if f.Status != 0 {
		filter["status"] = f.Status
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
