package datastore

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl OrderStorerImpl) CountByFilter(ctx context.Context, f *OrderPaginationListFilter) (int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Create the filter based on the cursor
	filter := bson.M{}

	// Add filter conditions to the filter
	if !f.TenantID.IsZero() {
		filter["tenant_id"] = f.TenantID
	}
	if f.CustomerOrganizationName != "" {
		filter["customer_organization_name"] = bson.M{"$regex": primitive.Regex{Pattern: f.CustomerOrganizationName, Options: "i"}}
	}
	if !f.CustomerID.IsZero() {
		filter["customer_id"] = f.CustomerID
	}
	if f.AssociateOrganizationName != "" {
		filter["associate_organization_name"] = bson.M{"$regex": primitive.Regex{Pattern: f.AssociateOrganizationName, Options: "i"}}
	}
	if !f.AssociateID.IsZero() {
		filter["associate_id"] = f.AssociateID
	}
	if f.ExcludeArchived {
		filter["status"] = bson.M{"$ne": OrderStatusArchived} // Do not list archived items! This code
	}
	if f.Status != 0 {
		filter["status"] = f.Status
	}
	if f.Type != 0 {
		filter["type"] = f.Type
	}
	if !f.ModifiedByUserID.IsZero() {
		filter["modified_by_user_id"] = f.ModifiedByUserID
	}
	if f.CustomerFirstName != "" {
		filter["customer_first_name"] = bson.M{"$regex": primitive.Regex{Pattern: f.CustomerFirstName, Options: "i"}}
	}
	if f.CustomerLastName != "" {
		filter["customer_last_name"] = bson.M{"$regex": primitive.Regex{Pattern: f.CustomerLastName, Options: "i"}}
	}
	if f.CustomerEmail != "" {
		filter["customer_email"] = bson.M{"$regex": primitive.Regex{Pattern: f.CustomerEmail, Options: "i"}}
	}
	if f.CustomerPhone != "" {
		filter["customer_phone"] = f.CustomerPhone
	}
	if f.AssociateFirstName != "" {
		filter["associate_first_name"] = bson.M{"$regex": primitive.Regex{Pattern: f.AssociateFirstName, Options: "i"}}
	}
	if f.AssociateLastName != "" {
		filter["associate_last_name"] = bson.M{"$regex": primitive.Regex{Pattern: f.AssociateLastName, Options: "i"}}
	}
	if f.AssociateEmail != "" {
		filter["associate_email"] = bson.M{"$regex": primitive.Regex{Pattern: f.AssociateEmail, Options: "i"}}
	}
	if f.AssociatePhone != "" {
		filter["associate_phone"] = f.AssociatePhone
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
	if len(f.Statuses) > 0 {
		filter["status"] = bson.M{"$in": f.Statuses}
	}
	if f.OrderWJID != "" {
		// NOTE: This is how you find the exact.
		// wjidInt, err := strconv.ParseUint(f.OrderWJID, 10, 64)
		// if err == nil {
		// 	filter["wjid"] = bson.M{"$eq": wjidInt}
		// }

		filter["tenant_id_with_wjid"] = bson.M{"$regex": primitive.Regex{Pattern: f.OrderWJID, Options: "i"}}
	}

	// Create a slice to store conditions
	var conditions []bson.M

	// Add filter conditions to the slice
	if !f.AssignmentDateGTE.IsZero() {
		conditions = append(conditions, bson.M{"assignment_date": bson.M{"$gte": f.AssignmentDateGTE}})
	}
	if !f.AssignmentDateGT.IsZero() {
		conditions = append(conditions, bson.M{"assignment_date": bson.M{"$gt": f.AssignmentDateGT}})
	}
	if !f.AssignmentDateLTE.IsZero() {
		conditions = append(conditions, bson.M{"assignment_date": bson.M{"$lte": f.AssignmentDateLTE}})
	}
	if !f.AssignmentDateLT.IsZero() {
		conditions = append(conditions, bson.M{"assignment_date": bson.M{"$lt": f.AssignmentDateLT}})
	}
	if !f.InvoiceServiceFeePaymentDateGTE.IsZero() {
		conditions = append(conditions, bson.M{"invoice_service_fee_payment_date": bson.M{"$gte": f.InvoiceServiceFeePaymentDateGTE}})
	}
	if !f.InvoiceServiceFeePaymentDateGT.IsZero() {
		conditions = append(conditions, bson.M{"invoice_service_fee_payment_date": bson.M{"$gt": f.InvoiceServiceFeePaymentDateGT}})
	}
	if !f.InvoiceServiceFeePaymentDateLTE.IsZero() {
		conditions = append(conditions, bson.M{"invoice_service_fee_payment_date": bson.M{"$lte": f.InvoiceServiceFeePaymentDateLTE}})
	}
	if !f.InvoiceServiceFeePaymentDateLT.IsZero() {
		conditions = append(conditions, bson.M{"invoice_service_fee_payment_date": bson.M{"$lt": f.InvoiceServiceFeePaymentDateLT}})
	}
	if !f.CompletionDateGTE.IsZero() {
		conditions = append(conditions, bson.M{"completion_date": bson.M{"$gte": f.CompletionDateGTE}})
	}
	if !f.CompletionDateGT.IsZero() {
		conditions = append(conditions, bson.M{"completion_date": bson.M{"$gt": f.CompletionDateGT}})
	}
	if !f.CompletionDateLTE.IsZero() {
		conditions = append(conditions, bson.M{"completion_date": bson.M{"$lte": f.CompletionDateLTE}})
	}
	if !f.CompletionDateLT.IsZero() {
		conditions = append(conditions, bson.M{"completion_date": bson.M{"$lt": f.CompletionDateLT}})
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

func (impl OrderStorerImpl) CountByAssociateID(ctx context.Context, tenantID primitive.ObjectID) (int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Create the filter based on the cursor
	filter := bson.M{}

	// Add filter conditions to the filter
	if !tenantID.IsZero() {
		filter["associate_id"] = tenantID
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

func (impl OrderStorerImpl) CountByTenantID(ctx context.Context, tenantID primitive.ObjectID) (int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Create the filter based on the cursor
	filter := bson.M{}

	// Add filter conditions to the filter
	if !tenantID.IsZero() {
		filter["tenant_id"] = tenantID
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
