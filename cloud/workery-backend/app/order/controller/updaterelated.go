package controller

import (
	"context"
	"log/slog"

	"github.com/bartmika/arraydiff"
	o_c "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// UpdateRelatedBySkillSets function will take the inputted `skill sets` with the order.
func (impl *OrderControllerImpl) UpdateRelatedBySkillSets(ctx context.Context, o *o_c.Order, modifiedSSIDs []primitive.ObjectID) error {
	oldSSIDs := []primitive.ObjectID{}
	for _, skillSet := range o.SkillSets {
		oldSSIDs = append(oldSSIDs, skillSet.ID)
	}

	// See what are the differences between the two arrays of type `uint64` data-types.
	addIDs, keepIDs, removedIDs := arraydiff.ObjectIDs(oldSSIDs, modifiedSSIDs)

	// For debugging purposes only.
	impl.Logger.Debug("skill sets changes",
		slog.Any("added", addIDs),
		slog.Any("keep", keepIDs),
		slog.Any("removed", removedIDs))

	////
	//// Add new skill sets.
	////

	for _, addID := range addIDs {
		// For debugging purposes only.
		impl.Logger.Debug("adding skill set to order",
			slog.Any("SkillSetID", addID))

		// Step 1: Lookup the skill set.
		ss, err := impl.SkillSetStorer.GetByID(ctx, addID)
		if err != nil {
			impl.Logger.Error("database get by id error", slog.Any("error", err))
			return err
		}
		if ss == nil {
			return httperror.NewForForbiddenWithSingleField("message", "skill set does not exist")
		}

		// Step 2: Create the order skill set.
		ass := &o_c.OrderSkillSet{
			ID:          ss.ID,
			Category:    ss.Category,
			SubCategory: ss.SubCategory,
			Description: ss.Description,
			Status:      ss.Status,
		}
		o.SkillSets = append(o.SkillSets, ass)

		// For debugging purposes only.
		impl.Logger.Debug("added skill set for order",
			slog.Any("SkillSetID", addID))
	}

	////
	//// Remove skill sets.
	////

	// Create a map to quickly check if an ID should be deleted
	idMap := make(map[primitive.ObjectID]bool)
	for _, id := range removedIDs {
		idMap[id] = true
	}

	// Create a new slice without the items to be deleted
	var newSkillSets []*o_c.OrderSkillSet
	for _, ss := range o.SkillSets {
		if !idMap[ss.ID] {
			newSkillSets = append(newSkillSets, ss)
		}
	}
	o.SkillSets = newSkillSets

	////
	//// Update in the database.
	////

	if err := impl.OrderStorer.UpdateByID(ctx, o); err != nil {
		impl.Logger.Error("database update error", slog.Any("error", err))
		return err
	}

	impl.Logger.Debug("updated skill set for order",
		slog.Any("Skill Sets", o.SkillSets)) // For debugging purposes only.

	return nil
}

// UpdateRelatedByTags function will take the inputted `tags` with the order.
func (impl *OrderControllerImpl) UpdateRelatedByTags(ctx context.Context, o *o_c.Order, modifiedTIDs []primitive.ObjectID) error {
	oldTIDs := []primitive.ObjectID{}
	for _, tag := range o.Tags {
		oldTIDs = append(oldTIDs, tag.ID)
	}

	// See what are the differences between the two arrays of type `uint64` data-types.
	addIDs, keepIDs, removedIDs := arraydiff.ObjectIDs(oldTIDs, modifiedTIDs)

	// For debugging purposes only.
	impl.Logger.Debug("tags changes",
		slog.Any("added", addIDs),
		slog.Any("keep", keepIDs),
		slog.Any("removed", removedIDs))

	////
	//// Add new tags.
	////

	for _, addID := range addIDs {
		// For debugging purposes only.
		impl.Logger.Debug("adding tags to order",
			slog.Any("TagID", addID))

		// Step 1: Lookup the tag.
		t, err := impl.TagStorer.GetByID(ctx, addID)
		if err != nil {
			impl.Logger.Error("database get by id error", slog.Any("error", err))
			return err
		}
		if t == nil {
			return httperror.NewForForbiddenWithSingleField("message", "tag does not exist")
		}

		// Step 2: Create the order tag.
		ass := &o_c.OrderTag{
			ID:          t.ID,
			Text:        t.Text,
			Description: t.Description,
			Status:      t.Status,
		}
		o.Tags = append(o.Tags, ass)

		// For debugging purposes only.
		impl.Logger.Debug("added tag for order",
			slog.Any("TagID", addID))
	}

	////
	//// Remove tags.
	////

	// Create a map to quickly check if an ID should be deleted
	idMap := make(map[primitive.ObjectID]bool)
	for _, id := range removedIDs {
		idMap[id] = true
	}

	// Create a new slice without the items to be deleted
	var newTags []*o_c.OrderTag
	for _, t := range o.Tags {
		if !idMap[t.ID] {
			newTags = append(newTags, t)
		}
	}
	o.Tags = newTags

	////
	//// Update in the database.
	////

	if err := impl.OrderStorer.UpdateByID(ctx, o); err != nil {
		impl.Logger.Error("database update error", slog.Any("error", err))
		return err
	}

	impl.Logger.Debug("updated tag for order",
		slog.Any("Tags", o.Tags)) // For debugging purposes only.

	return nil
}

// // UpdateRelatedByInsuranceRequirements function will take the inputted `insurance requirements` with the order.
// func (impl *OrderControllerImpl) UpdateRelatedByInsuranceRequirements(ctx context.Context, a *o_c.Order, modifiedIRIDs []primitive.ObjectID) error {
// 	oldIRIDs := []primitive.ObjectID{}
// 	for _, skillSet := range o.InsuranceRequirements {
// 		oldIRIDs = append(oldIRIDs, skillSet.ID)
// 	}
//
// 	// See what are the differences between the two arrays of type `uint64` data-types.
// 	addIDs, keepIDs, removedIDs := arraydiff.ObjectIDs(oldIRIDs, modifiedIRIDs)
//
// 	// For debugging purposes only.
// 	impl.Logger.Debug("insurance requirement changes",
// 		slog.Any("added", addIDs),
// 		slog.Any("keep", keepIDs),
// 		slog.Any("removed", removedIDs))
//
// 	////
// 	//// Add new skill sets.
// 	////
//
// 	for _, addID := range addIDs {
// 		// For debugging purposes only.
// 		impl.Logger.Debug("adding insurance requirement to order",
// 			slog.Any("InsuranceRequirementID", addID))
//
// 		// Step 1: Lookup the skill set.
// 		ir, err := impl.InsuranceRequirementStorer.GetByID(ctx, addID)
// 		if err != nil {
// 			impl.Logger.Error("database get by id error", slog.Any("error", err))
// 			return err
// 		}
// 		if ir == nil {
// 			return httperror.NewForForbiddenWithSingleField("message", "insurance requirement does not exist")
// 		}
//
// 		// Step 2: Create the order skill set.
// 		air := &o_c.OrderInsuranceRequirement{
// 			ID:          ir.ID,
// 			TenantID:    ir.TenantID,
// 			Name:        ir.Name,
// 			Description: ir.Description,
// 			Status:      ir.Status,
// 		}
// 		o.InsuranceRequirements = append(o.InsuranceRequirements, air)
//
// 		// For debugging purposes only.
// 		impl.Logger.Debug("added insurance requirement for order",
// 			slog.Any("InsuranceRequirementID", addID))
// 	}
//
// 	////
// 	//// Remove skill sets.
// 	////
//
// 	// Create a map to quickly check if an ID should be deleted
// 	idMap := make(map[primitive.ObjectID]bool)
// 	for _, id := range removedIDs {
// 		idMap[id] = true
// 	}
//
// 	// Create a new slice without the items to be deleted
// 	var newInsuranceRequirements []*o_c.OrderInsuranceRequirement
// 	for _, ir := range o.InsuranceRequirements {
// 		if !idMap[ir.ID] {
// 			newInsuranceRequirements = append(newInsuranceRequirements, ir)
// 		}
// 	}
// 	o.InsuranceRequirements = newInsuranceRequirements
//
// 	////
// 	//// Update in the database.
// 	////
//
// 	if err := impl.OrderStorer.UpdateByID(ctx, a); err != nil {
// 		impl.Logger.Error("database update error", slog.Any("error", err))
// 		return err
// 	}
//
// 	impl.Logger.Debug("updated insurance requiremens for order",
// 		slog.Any("insurance requirements", o.InsuranceRequirements)) // For debugging purposes only.
//
// 	return nil
// }
//
// // UpdateRelatedByVehicleTypes function will take the inputted `vehicle types` with the order.
// func (impl *OrderControllerImpl) UpdateRelatedByVehicleTypes(ctx context.Context, a *o_c.Order, modifiedVTIDs []primitive.ObjectID) error {
// 	oldVTIDs := []primitive.ObjectID{}
// 	for _, skillSet := range o.VehicleTypes {
// 		oldVTIDs = append(oldVTIDs, skillSet.ID)
// 	}
//
// 	// See what are the differences between the two arrays of type `uint64` data-types.
// 	addIDs, keepIDs, removedIDs := arraydiff.ObjectIDs(oldVTIDs, modifiedVTIDs)
//
// 	// For debugging purposes only.
// 	impl.Logger.Debug("vehicle types changes",
// 		slog.Any("added", addIDs),
// 		slog.Any("keep", keepIDs),
// 		slog.Any("removed", removedIDs))
//
// 	////
// 	//// Add new skill sets.
// 	////
//
// 	for _, addID := range addIDs {
// 		// For debugging purposes only.
// 		impl.Logger.Debug("adding vehicle type to order",
// 			slog.Any("VehicleTypeID", addID))
//
// 		// Step 1: Lookup the skill set.
// 		ss, err := impl.VehicleTypeStorer.GetByID(ctx, addID)
// 		if err != nil {
// 			impl.Logger.Error("database get by id error", slog.Any("error", err))
// 			return err
// 		}
// 		if ss == nil {
// 			return httperror.NewForForbiddenWithSingleField("message", "vehicle type does not exist")
// 		}
//
// 		// Step 2: Create the order skill set.
// 		ass := &o_c.OrderVehicleType{
// 			ID:          ss.ID,
// 			TenantID:    ss.TenantID,
// 			Name:        ss.Name,
// 			Description: ss.Description,
// 			Status:      ss.Status,
// 		}
// 		o.VehicleTypes = append(o.VehicleTypes, ass)
//
// 		// For debugging purposes only.
// 		impl.Logger.Debug("added vehicle type for order",
// 			slog.Any("VehicleTypeID", addID))
// 	}
//
// 	////
// 	//// Remove skill sets.
// 	////
//
// 	// Create a map to quickly check if an ID should be deleted
// 	idMap := make(map[primitive.ObjectID]bool)
// 	for _, id := range removedIDs {
// 		idMap[id] = true
// 	}
//
// 	// Create a new slice without the items to be deleted
// 	var newVehicleTypes []*o_c.OrderVehicleType
// 	for _, ss := range o.VehicleTypes {
// 		if !idMap[ss.ID] {
// 			newVehicleTypes = append(newVehicleTypes, ss)
// 		}
// 	}
// 	o.VehicleTypes = newVehicleTypes
//
// 	////
// 	//// Update in the database.
// 	////
//
// 	if err := impl.OrderStorer.UpdateByID(ctx, a); err != nil {
// 		impl.Logger.Error("database update error", slog.Any("error", err))
// 		return err
// 	}
//
// 	impl.Logger.Debug("updated vehicle types for order",
// 		slog.Any("Vehicle Types", o.VehicleTypes)) // For debugging purposes only.
//
// 	return nil
// }
//
// // UpdateRelatedByTags function will take the inputted `tags` with the order.
// func (impl *OrderControllerImpl) UpdateRelatedByTags(ctx context.Context, a *o_c.Order, modifiedTIDs []primitive.ObjectID) error {
// 	oldTIDs := []primitive.ObjectID{}
// 	for _, skillSet := range o.Tags {
// 		oldTIDs = append(oldTIDs, skillSet.ID)
// 	}
//
// 	// See what are the differences between the two arrays of type `uint64` data-types.
// 	addIDs, keepIDs, removedIDs := arraydiff.ObjectIDs(oldTIDs, modifiedTIDs)
//
// 	// For debugging purposes only.
// 	impl.Logger.Debug("tags changes",
// 		slog.Any("added", addIDs),
// 		slog.Any("keep", keepIDs),
// 		slog.Any("removed", removedIDs))
//
// 	////
// 	//// Add new tags.
// 	////
//
// 	for _, addID := range addIDs {
// 		// For debugging purposes only.
// 		impl.Logger.Debug("adding tag to order",
// 			slog.Any("TagID", addID))
//
// 		// Step 1: Lookup the tag.
// 		ss, err := impl.TagStorer.GetByID(ctx, addID)
// 		if err != nil {
// 			impl.Logger.Error("database get by id error", slog.Any("error", err))
// 			return err
// 		}
// 		if ss == nil {
// 			return httperror.NewForForbiddenWithSingleField("message", "tag does not exist")
// 		}
//
// 		// Step 2: Create the order tag.
// 		ass := &o_c.OrderTag{
// 			ID:          ss.ID,
// 			TenantID:    ss.TenantID,
// 			Text:        ss.Text,
// 			Description: ss.Description,
// 			Status:      ss.Status,
// 		}
// 		o.Tags = append(o.Tags, ass)
//
// 		// For debugging purposes only.
// 		impl.Logger.Debug("added tag for order",
// 			slog.Any("TagID", addID))
// 	}
//
// 	////
// 	//// Remove tags.
// 	////
//
// 	// Create a map to quickly check if an ID should be deleted
// 	idMap := make(map[primitive.ObjectID]bool)
// 	for _, id := range removedIDs {
// 		idMap[id] = true
// 	}
//
// 	// Create a new slice without the items to be deleted
// 	var newTags []*o_c.OrderTag
// 	for _, ss := range o.Tags {
// 		if !idMap[ss.ID] {
// 			newTags = append(newTags, ss)
// 		}
// 	}
// 	o.Tags = newTags
//
// 	////
// 	//// Update in the database.
// 	////
//
// 	if err := impl.OrderStorer.UpdateByID(ctx, a); err != nil {
// 		impl.Logger.Error("database update error", slog.Any("error", err))
// 		return err
// 	}
//
// 	impl.Logger.Debug("updated tag for order",
// 		slog.Any("Tags", o.Tags)) // For debugging purposes only.
//
// 	return nil
// }
