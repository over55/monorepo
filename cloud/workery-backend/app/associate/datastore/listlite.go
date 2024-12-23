package datastore

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AssociateLite represents the limited detail of a associate which is to be
// displayed in a list view.
type AssociateLite struct {
	ID                  primitive.ObjectID   `bson:"_id" json:"id"`
	FirstName           string               `bson:"first_name" json:"first_name"`
	LastName            string               `bson:"last_name" json:"last_name"`
	Name                string               `bson:"name" json:"name"`
	LexicalName         string               `bson:"lexical_name" json:"lexical_name"`
	Email               string               `bson:"email" json:"email"`
	Phone               string               `bson:"phone" json:"phone,omitempty"`
	PhoneType           int8                 `bson:"phone_type" json:"phone_type"`
	PhoneExtension      string               `bson:"phone_extension" json:"phone_extension"`
	OtherPhone          string               `bson:"other_phone" json:"other_phone"`
	OtherPhoneExtension string               `bson:"other_phone_extension" json:"other_phone_extension"`
	OtherPhoneType      int8                 `bson:"other_phone_type" json:"other_phone_type"`
	Status              int8                 `bson:"status" json:"status"`
	Type                int8                 `bson:"type" json:"type"`
	AvatarObjectKey     string               `bson:"avatar_object_key" json:"avatar_object_key"`
	AvatarFileType      string               `bson:"avatar_file_type" json:"avatar_file_type"`
	AvatarFileName      string               `bson:"avatar_file_name" json:"avatar_file_name"`
	Birthdate           time.Time            `bson:"birthdate" json:"birthdate"`
	JoinDate            time.Time            `bson:"join_date" json:"join_date"`
	Nationality         string               `bson:"nationality" json:"nationality"`
	Gender              int8                 `bson:"gender" json:"gender"`
	GenderOther         string               `bson:"gender_other" json:"gender_other"`
	OrganizationName    string               `bson:"organization_name" json:"organization_name"`
	OrganizationType    int8                 `bson:"organization_type" json:"organization_type"`
	Country             string               `bson:"country" json:"country,omitempty"`
	Region              string               `bson:"region" json:"region,omitempty"`
	City                string               `bson:"city" json:"city,omitempty"`
	PostalCode          string               `bson:"postal_code" json:"postal_code,omitempty"`
	AddressLine1        string               `bson:"address_line1" json:"address_line1,omitempty"`
	AddressLine2        string               `bson:"address_line2" json:"address_line2,omitempty"`
	SkillSets           []*AssociateSkillSet `bson:"skill_sets" json:"skill_sets,omitempty"`
	Tags                []*AssociateTag      `bson:"tags" json:"tags,omitempty"`
}

func (impl AssociateStorerImpl) LiteListByFilter(ctx context.Context, f *AssociatePaginationListFilter) (*AssociatePaginationLiteListResult, error) {
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
	if f.Role > 0 {
		filter["role"] = f.Role
	}
	if f.Type > 0 {
		filter["type"] = f.Type
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
	if f.OrganizationName != "" {
		filter["organization_name"] = bson.M{"$regex": primitive.Regex{Pattern: f.OrganizationName, Options: "i"}}
	}
	if !f.CreatedAtGTE.IsZero() {
		filter["created_at"] = bson.M{"$gt": f.CreatedAtGTE} // Add the cursor condition to the filter
	}
	if len(f.InSkillSetIDs) > 0 {
		filter["skill_sets._id"] = bson.M{"$in": f.InSkillSetIDs}
	}
	if len(f.AllSkillSetIDs) > 0 {
		filter["skill_sets._id"] = bson.M{"$all": f.AllSkillSetIDs}
	}
	if len(f.InTagIDs) > 0 {
		filter["tags._id"] = bson.M{"$in": f.InTagIDs}
	}
	if len(f.AllTagIDs) > 0 {
		filter["tags._id"] = bson.M{"$all": f.AllTagIDs}
	}
	if len(f.InInsuranceRequirementIDs) > 0 {
		filter["insurance_requirements._id"] = bson.M{"$in": f.InInsuranceRequirementIDs}
	}
	if len(f.AllInsuranceRequirementIDs) > 0 {
		filter["insurance_requirements._id"] = bson.M{"$all": f.AllInsuranceRequirementIDs}
	}
	if len(f.InVehicleTypeIDs) > 0 {
		filter["vehicle_types._id"] = bson.M{"$in": f.InVehicleTypeIDs}
	}
	if len(f.AllVehicleTypeIDs) > 0 {
		filter["vehicle_types._id"] = bson.M{"$all": f.AllVehicleTypeIDs}
	}
	if f.IsJobSeeker != 0 {
		filter["is_job_seeker"] = f.IsJobSeeker
	}
	if f.HasTaxID != 0 {
		filter["tax_id"] = bson.M{"$ne": ""}
	}
	if len(f.IDs) > 0 {
		filter["_id"] = bson.M{"$in": f.IDs}
	}

	// Create a slice to store conditions
	var conditions []bson.M

	// Add filter conditions to the slice
	if !f.CommercialInsuranceExpiryDateGTE.IsZero() {
		conditions = append(conditions, bson.M{"commercial_insurance_expiry_date": bson.M{"$gte": f.CommercialInsuranceExpiryDateGTE}})
	}
	if !f.CommercialInsuranceExpiryDateGT.IsZero() {
		conditions = append(conditions, bson.M{"commercial_insurance_expiry_date": bson.M{"$gt": f.CommercialInsuranceExpiryDateGT}})
	}
	if !f.CommercialInsuranceExpiryDateLTE.IsZero() {
		conditions = append(conditions, bson.M{"commercial_insurance_expiry_date": bson.M{"$lte": f.CommercialInsuranceExpiryDateLTE}})
	}
	if !f.CommercialInsuranceExpiryDateLT.IsZero() {
		conditions = append(conditions, bson.M{"commercial_insurance_expiry_date": bson.M{"$lt": f.CommercialInsuranceExpiryDateLT}})
	}

	if !f.PoliceCheckGTE.IsZero() {
		conditions = append(conditions, bson.M{"police_check": bson.M{"$gte": f.PoliceCheckGTE}})
	}
	if !f.PoliceCheckGT.IsZero() {
		conditions = append(conditions, bson.M{"police_check": bson.M{"$gt": f.PoliceCheckGT}})
	}
	if !f.PoliceCheckLTE.IsZero() {
		conditions = append(conditions, bson.M{"police_check": bson.M{"$lte": f.PoliceCheckLTE}})
	}
	if !f.PoliceCheckLT.IsZero() {
		conditions = append(conditions, bson.M{"police_check": bson.M{"$lt": f.PoliceCheckLT}})
	}

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
	results := []*AssociateLite{}
	hasNextPage := false
	for cursor.Next(ctx) {
		document := &AssociateLite{}
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

	return &AssociatePaginationLiteListResult{
		Results:     results,
		NextCursor:  nextCursor,
		HasNextPage: hasNextPage,
	}, nil
}
