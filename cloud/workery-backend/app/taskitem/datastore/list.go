package datastore

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

func (impl TaskItemStorerImpl) ListByFilter(ctx context.Context, f *TaskItemPaginationListFilter) (*TaskItemPaginationListResult, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	filter, err := impl.newPaginationFilter(f)
	if err != nil {
		return nil, err
	}

	// Add filter conditions to the filter
	if !f.TenantID.IsZero() {
		filter["tenant_id"] = f.TenantID
	}
	if !f.CustomerID.IsZero() {
		filter["customer_id"] = f.CustomerID
	}
	if !f.AssociateID.IsZero() {
		filter["associate_id"] = f.AssociateID
	}
	if !f.OrderID.IsZero() {
		filter["order_id"] = f.OrderID
	}
	if f.OrderWJID != 0 {
		filter["order_wjid"] = f.OrderWJID
	}
	if f.ExcludeArchived {
		filter["status"] = bson.M{"$ne": TaskItemStatusArchived} // Do not list archived items! This code
	}
	if f.Status != 0 {
		filter["status"] = f.Status
	}
	if f.Type != 0 {
		filter["type"] = f.Type
	}
	if f.IsClosed == 1 {
		filter["is_closed"] = true
	}
	if f.IsClosed == 2 {
		filter["is_closed"] = false
	}
	if len(f.InSkillSetIDs) > 0 {
		filter["skill_sets._id"] = bson.M{"$in": f.InSkillSetIDs}
	}
	if len(f.AllSkillSetIDs) > 0 {
		filter["skill_sets._id"] = bson.M{"$all": f.AllSkillSetIDs}
	}

	// // For debugging purposes only.
	// impl.Logger.Debug("listing filter:",
	// 	slog.Any("Cursor", f.Cursor),
	// 	slog.Int64("PageSize", f.PageSize),
	// 	slog.String("SortField", f.SortField),
	// 	slog.Int("SortOrder", int(f.SortOrder)),
	// 	// slog.Any("TenantID", f.TenantID),
	// 	slog.Any("filter", filter))

	// Include additional filters for our cursor-based pagination pertaining to sorting and limit.
	options, err := impl.newPaginationOptions(f)
	if err != nil {
		return nil, err
	}

	// Include Full-text search
	if f.SearchText != "" {
		filter["$text"] = bson.M{"$search": f.SearchText}
	}

	// Execute the query
	cursor, err := impl.Collection.Find(ctx, filter, options)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	// var results = []*ComicSubmission{}
	// if err = cursor.All(ctx, &results); err != nil {
	// 	panic(err)
	// }

	// Retrieve the documents and check if there is a next page
	results := []*TaskItem{}
	hasNextPage := false
	for cursor.Next(ctx) {
		document := &TaskItem{}
		if err := cursor.Decode(document); err != nil {
			return nil, err
		}
		results = append(results, document)
		// Stop fetching documents if we have reached the desired page size
		if int64(len(results)) >= f.PageSize {
			hasNextPage = true
			break
		}
	}

	// Get the next cursor and encode it
	var nextCursor string
	if hasNextPage {
		nextCursor, err = impl.newPaginatorNextCursor(f, results)
		if err != nil {
			return nil, err
		}
	}

	return &TaskItemPaginationListResult{
		Results:     results,
		NextCursor:  nextCursor,
		HasNextPage: hasNextPage,
	}, nil
}
