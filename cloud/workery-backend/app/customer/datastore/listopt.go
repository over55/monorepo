package datastore

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (impl CustomerStorerImpl) ListAsSelectOptionByFilter(ctx context.Context, f *CustomerListFilter) ([]*CustomerAsSelectOption, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Get a reference to the collection
	collection := impl.Collection

	startAfter := "" // The ID to start after, initially empty for the first page

	// Pagination query
	query := bson.M{}
	options := options.Find().
		SetLimit(int64(f.PageSize)).
		SetSort(bson.D{{f.SortField, f.SortOrder}})

	// Add filter conditions to the query
	if !f.TenantID.IsZero() {
		query["tenant_id"] = f.TenantID
	}

	if startAfter != "" {
		// Find the document with the given startAfter ID
		cursor, err := collection.FindOne(ctx, bson.M{"_id": startAfter}).DecodeBytes()
		if err != nil {
			log.Fatal(err)
		}
		options.SetSkip(1)
		query["_id"] = bson.M{"$gt": cursor.Lookup("_id").ObjectID()}
	}

	if f.Type > 0 {
		query["type"] = f.Type
	}
	if f.FirstName != "" {
		query["first_name"] = bson.M{"$regex": primitive.Regex{Pattern: f.FirstName, Options: "i"}}
	}
	if f.LastName != "" {
		query["last_name"] = bson.M{"$regex": primitive.Regex{Pattern: f.LastName, Options: "i"}}
	}
	if f.Email != "" {
		query["email"] = bson.M{"$regex": primitive.Regex{Pattern: f.Email, Options: "i"}}
	}
	if f.Phone != "" {
		query["phone"] = f.Phone
	}
	if f.Status != 0 {
		query["status"] = f.Status
	}
	if !f.CreatedAtGTE.IsZero() {
		query["created_at"] = bson.M{"$gt": f.CreatedAtGTE} // Add the cursor condition to the filter
	}
	if f.OrganizationName != "" {
		query["organization_name"] = bson.M{"$regex": primitive.Regex{Pattern: f.OrganizationName, Options: "i"}}
	}
	if len(f.IDs) > 0 {
		query["_id"] = bson.M{"$in": f.IDs}
	}

	// Full-text search
	if f.SearchText != "" {
		query["$text"] = bson.M{"$search": f.SearchText}
	}

	options.SetSort(bson.D{{f.SortField, 1}}) // Sort in ascending order based on the specified field

	// Retrieve the list of items from the collection
	cursor, err := collection.Find(ctx, query, options)
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(ctx)

	var results = []*CustomerAsSelectOption{}
	if err = cursor.All(ctx, &results); err != nil {
		panic(err)
	}

	return results, nil
}
