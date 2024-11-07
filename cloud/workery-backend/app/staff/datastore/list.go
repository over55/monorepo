package datastore

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl StaffStorerImpl) ListByFilter(ctx context.Context, f *StaffPaginationListFilter) (*StaffPaginationListResult, error) {
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
	if !f.HowDidYouHearAboutUsID.IsZero() {
		filter["how_did_you_hear_about_us_id"] = f.TenantID
	}
	if f.Type > 0 {
		filter["Type"] = f.Type
	}
	if f.FirstName != "" {
		filter["first_name"] = bson.M{"$regex": primitive.Regex{Pattern: f.FirstName, Options: "i"}}
	}
	if f.LastName != "" {
		filter["last_name"] = bson.M{"$regex": primitive.Regex{Pattern: f.LastName, Options: "i"}}
	}
	if f.Email != "" {
		filter["email"] = bson.M{"$regex": primitive.Regex{Pattern: f.Email, Options: "i"}}
	}
	if f.Phone != "" {
		filter["phone"] = f.Phone
	}
	if f.Status != 0 {
		filter["status"] = f.Status
	}
	if !f.CreatedAtGTE.IsZero() {
		filter["created_at"] = bson.M{"$gt": f.CreatedAtGTE} // Add the cursor condition to the filter
	}
	if len(f.InVehicleTypeIDs) > 0 {
		filter["vehicle_types._id"] = bson.M{"$in": f.InVehicleTypeIDs}
	}
	if len(f.AllVehicleTypeIDs) > 0 {
		filter["vehicle_types._id"] = bson.M{"$all": f.AllVehicleTypeIDs}
	}

	// Create a slice to store conditions
	var conditions []bson.M

	// Add filter conditions to the slice
	if !f.JoinDateGTE.IsZero() {
		conditions = append(conditions, bson.M{"join_date": bson.M{"$gte": f.JoinDateGTE}})
	}
	if !f.JoinDateGT.IsZero() {
		conditions = append(conditions, bson.M{"join_date": bson.M{"$gt": f.JoinDateGT}})
	}
	if !f.JoinDateLTE.IsZero() {
		conditions = append(conditions, bson.M{"join_date": bson.M{"$lte": f.JoinDateLTE}})
	}
	if !f.JoinDateLT.IsZero() {
		conditions = append(conditions, bson.M{"join_date": bson.M{"$lt": f.JoinDateLT}})
	}

	// Combine conditions with $and operator
	if len(conditions) > 0 {
		filter["$and"] = conditions
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
	results := []*Staff{}
	hasNextPage := false
	for cursor.Next(ctx) {
		document := &Staff{}
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
		nextCursor, err = impl.newPaginatorNextCursorForFull(f, results)
		if err != nil {
			return nil, err
		}
	}

	return &StaffPaginationListResult{
		Results:     results,
		NextCursor:  nextCursor,
		HasNextPage: hasNextPage,
	}, nil
}
