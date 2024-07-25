package datastore

import (
	"encoding/base64"
	"fmt"
	"strings"

	"github.com/bartmika/timekit"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	OrderAscending  = 1
	OrderDescending = -1
)

type OrderIncidentPaginationListFilter struct {
	// Pagination related.
	Cursor    string
	PageSize  int64
	SortField string
	SortOrder int8 // 1=ascending | -1=descending

	// Filter related.
	TenantID    primitive.ObjectID
	OrderType   int8
	OrderWJID   uint64
	Status      int8
	SearchTitle string
}

// OrderIncidentPaginationListResult represents the paginated list results for
// the associate records.
type OrderIncidentPaginationListResult struct {
	Results     []*OrderIncident `json:"results"`
	NextCursor  string           `json:"next_cursor"`
	HasNextPage bool             `json:"has_next_page"`
}

// newPaginationFilter will create the mongodb filter to apply the cursor or
// or ignore it depending if a cursor was specified in the filter.
func (impl OrderIncidentStorerImpl) newPaginationFilter(f *OrderIncidentPaginationListFilter) (bson.M, error) {
	if len(f.Cursor) > 0 {
		// STEP 1: Decode the cursor which is encoded in a base64 format.
		decodedCursor, err := base64.RawStdEncoding.DecodeString(f.Cursor)
		if err != nil {
			return bson.M{}, fmt.Errorf("Failed to decode string: %v", err)
		}

		// STEP 2: Pick the specific cursor to build or else error.
		switch f.SortField {
		case "title":
			// STEP 3: Build for `lexical_name` field.
			return impl.newPaginationFilterBasedOnString(f, string(decodedCursor))
		case "created_at":
			// STEP 3: Build for `join_date` field.
			return impl.newPaginationFilterBasedOnTimestamp(f, string(decodedCursor))
		default:
			return nil, fmt.Errorf("unsupported sort field for `%v`, only supported fields are `title` and `created_at`", f.SortField)
		}
	}
	return bson.M{}, nil
}

func (impl OrderIncidentStorerImpl) newPaginationFilterBasedOnString(f *OrderIncidentPaginationListFilter, decodedCursor string) (bson.M, error) {
	// Extract our cursor into two parts which we need to use.
	arr := strings.Split(decodedCursor, "|")
	if len(arr) < 1 {
		return nil, fmt.Errorf("cursor is corrupted for the value `%v`", decodedCursor)
	}

	// The first part will contain the name we left off at. The second part will
	// be last ID we left off at.
	str := arr[0]
	lastID, err := primitive.ObjectIDFromHex(arr[1])
	if err != nil {
		return bson.M{}, fmt.Errorf("Failed to convert into mongodb object id: %v, from the decoded cursor of: %v", err, decodedCursor)
	}

	switch f.SortOrder {
	case OrderAscending:
		filter := bson.M{}
		filter["$or"] = []bson.M{
			{f.SortField: bson.M{"$gt": str}},
			{f.SortField: str, "_id": bson.M{"$gt": lastID}},
		}
		return filter, nil
	case OrderDescending:
		filter := bson.M{}
		filter["$or"] = []bson.M{
			{f.SortField: bson.M{"$lt": str}},
			{f.SortField: str, "_id": bson.M{"$lt": lastID}},
		}
		return filter, nil
	default:
		return nil, fmt.Errorf("unsupported sort order for `%v`, only supported values are `1` or `-1`", f.SortOrder)
	}
}

func (impl OrderIncidentStorerImpl) newPaginationFilterBasedOnTimestamp(f *OrderIncidentPaginationListFilter, decodedCursor string) (bson.M, error) {
	// Extract our cursor into two parts which we need to use.
	arr := strings.Split(decodedCursor, "|")
	if len(arr) < 1 {
		return nil, fmt.Errorf("cursor is corrupted for the value `%v`", decodedCursor)
	}

	// The first part will contain the name we left off at. The second part will
	// be last ID we left off at.
	timestampStr := arr[0]
	lastID, err := primitive.ObjectIDFromHex(arr[1])
	if err != nil {
		return nil, fmt.Errorf("Failed to convert into mongodb object id: %v, from the decoded cursor of: %v", err, decodedCursor)
	}

	timestamp, err := timekit.ParseJavaScriptTimeString(timestampStr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse javascript timestamp: `%v`", err)
	}

	switch f.SortOrder {
	case OrderAscending:
		filter := bson.M{}
		filter["$or"] = []bson.M{
			{f.SortField: bson.M{"$gt": timestamp}},
			{f.SortField: timestamp, "_id": bson.M{"$gt": lastID}},
		}
		return filter, nil
	case OrderDescending:
		filter := bson.M{}
		filter["$or"] = []bson.M{
			{f.SortField: bson.M{"$lt": timestamp}},
			{f.SortField: timestamp, "_id": bson.M{"$lt": lastID}},
		}
		return filter, nil
	default:
		return nil, fmt.Errorf("unsupported sort order for `%v`, only supported values are `1` or `-1`", f.SortOrder)
	}
}

// newPaginatorOptions will generate the mongodb options which will support the
// paginator in ordering the data to work.
func (impl OrderIncidentStorerImpl) newPaginationOptions(f *OrderIncidentPaginationListFilter) (*options.FindOptions, error) {
	options := options.Find().SetLimit(f.PageSize)

	// DEVELOPERS NOTE:
	// We want to be able to return a list without sorting so we will need to
	// run the following code.
	if f.SortField != "" {
		options = options.
			SetSort(bson.D{
				{f.SortField, f.SortOrder},
				{"_id", f.SortOrder}, // Include _id in sorting for consistency
			})
	}

	return options, nil
}

// newPaginatorNextCursor will return the base64 encoded next cursor which works
// with our paginator.
func (impl OrderIncidentStorerImpl) newPaginatorNextCursor(f *OrderIncidentPaginationListFilter, results []*OrderIncident) (string, error) {
	var lastDatum *OrderIncident

	// Remove the extra document from the current page
	results = results[:]

	// Get the last document's _id as the next cursor
	lastDatum = results[len(results)-1]

	// Variable used to store the next cursor.
	var nextCursor string

	switch f.SortField {
	case "title":
		nextCursor = fmt.Sprintf("%v|%v", lastDatum.Title, lastDatum.ID.Hex())
		break
	case "created_at":
		timestamp := lastDatum.CreatedAt.UnixMilli()
		nextCursor = fmt.Sprintf("%v|%v", timestamp, lastDatum.ID.Hex())
		break
	default:
		return "", fmt.Errorf("unsupported sort field in options for `%v`, only supported fields are `title` and `created_at`", f.SortField)
	}

	// Encode to base64 without the `=` symbol that would corrupt when we
	// use the http url argument. Special thanks to:
	// https://www.golinuxcloud.com/golang-base64-encode/
	encoded := base64.RawStdEncoding.EncodeToString([]byte(nextCursor))

	return encoded, nil
}
