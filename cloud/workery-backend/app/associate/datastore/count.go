package datastore

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl AssociateStorerImpl) CountByFilter(ctx context.Context, f *AssociatePaginationListFilter) (int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 12*time.Second)
	defer cancel()

	// Create the filter based on the cursor
	filter := bson.M{}

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

	// impl.Logger.Debug("counting w/ filter:",
	// 	slog.Any("filter", filter))

	// Use the CountDocuments method to count the matching documents.
	count, err := impl.Collection.CountDocuments(ctx, filter)
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (impl AssociateStorerImpl) CountAllJobSeekersByTenantID(ctx context.Context, tid primitive.ObjectID) (int64, error) {
	filter := &AssociatePaginationListFilter{
		TenantID:    tid,
		IsJobSeeker: AssociateIsJobSeekerYes,
	}

	// Use the CountDocuments method to count the matching documents.
	count, err := impl.Collection.CountDocuments(ctx, filter)
	if err != nil {
		return 0, err
	}

	return count, nil
}
