package datastore

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl NationalOccupationalClassificationStorerImpl) ListByFilter(ctx context.Context, f *NationalOccupationalClassificationPaginationListFilter) (*NationalOccupationalClassificationPaginationListResult, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Create the paginated filter based on the cursor
	filter, err := impl.newPaginationFilter(f)
	if err != nil {
		return nil, err
	}

	// Add filter conditions to the filter
	if !f.TenantID.IsZero() {
		filter["tenant_id"] = f.TenantID
	}

	if f.Status != 0 {
		filter["status"] = f.Status
	}

	// FIXED: Use proper regex search for code
	if f.CodeStr != "" {
		// Try to match both code and code_str fields
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
	// This prevents conflicts with $or operator
	if f.SearchText != "" && f.CodeStr == "" {
		filter["$text"] = bson.M{"$search": f.SearchText}
	}

	// Debug logging
	impl.Logger.Debug("listing filter:",
		slog.Any("filter", filter),
		slog.String("SearchText", f.SearchText),
		slog.String("CodeStr", f.CodeStr),
		slog.String("UnitGroupTitle", f.UnitGroupTitle))

	// Include additional filters for our cursor-based pagination pertaining to sorting and limit.
	options, err := impl.newPaginationOptions(f)
	if err != nil {
		return nil, err
	}

	// Execute the query
	cursor, err := impl.Collection.Find(ctx, filter, options)
	if err != nil {
		impl.Logger.Error("database find error", slog.Any("error", err))
		return nil, err
	}
	defer cursor.Close(ctx)

	// Retrieve the documents and check if there is a next page
	results := []*NationalOccupationalClassification{}
	hasNextPage := false
	for cursor.Next(ctx) {
		document := &NationalOccupationalClassification{}
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
	if hasNextPage && len(results) > 0 {
		nextCursor, err = impl.newPaginatorNextCursor(f, results)
		if err != nil {
			return nil, err
		}
	}

	return &NationalOccupationalClassificationPaginationListResult{
		Results:     results,
		NextCursor:  nextCursor,
		HasNextPage: hasNextPage,
	}, nil
}
