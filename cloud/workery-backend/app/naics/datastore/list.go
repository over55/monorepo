package datastore

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl NorthAmericanIndustryClassificationSystemStorerImpl) ListByFilter(ctx context.Context, f *NorthAmericanIndustryClassificationSystemPaginationListFilter) (*NorthAmericanIndustryClassificationSystemPaginationListResult, error) {
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

	if f.CodeStr != "" {
		filter["code_str"] = bson.M{"$regex": primitive.Regex{Pattern: f.CodeStr, Options: "i"}}
	}

	if f.IndustryTitle != "" {
		filter["industry_title"] = bson.M{"$regex": primitive.Regex{Pattern: f.IndustryTitle, Options: "i"}}
	}

	// impl.Logger.Debug("listing filter:",
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
	results := []*NorthAmericanIndustryClassificationSystem{}
	hasNextPage := false
	for cursor.Next(ctx) {
		document := &NorthAmericanIndustryClassificationSystem{}
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

	return &NorthAmericanIndustryClassificationSystemPaginationListResult{
		Results:     results,
		NextCursor:  nextCursor,
		HasNextPage: hasNextPage,
	}, nil
}
