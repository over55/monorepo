package controller

import (
	"fmt"
	"log/slog"
	"math"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/bartmika/arraydiff"
	a_c "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

// UpdateRelatedByUser function will update the user account.
func (impl *AssociateControllerImpl) UpdateRelatedByUser(sessCtx mongo.SessionContext, a *a_s.Associate) error {
	if a.UserID.IsZero() {
		return httperror.NewForBadRequestWithSingleField("user_id", "associate does not have a `user_id` in record")
	}

	u, err := impl.UserStorer.GetByID(sessCtx, a.UserID)
	if err != nil {
		impl.Logger.Error("get user by email error", slog.Any("error", err))
		return err
	}

	// If user account does not exist then skip it.
	if u == nil {
		return nil
	}

	// Assign based on user role - assume traditonal associate else assign job seeker.
	role := int8(u_s.UserRoleAssociate)
	if a.IsJobSeeker == a_s.AssociateIsJobSeekerYes {
		role = int8(u_s.UserRoleAssociateJobSeeker)
	}

	// Update the
	// u.Type = a.Type
	u.Role = role
	u.OrganizationName = a.OrganizationName
	u.OrganizationType = a.OrganizationType
	u.Name = fmt.Sprintf("%s %s", a.FirstName, a.LastName)
	u.LexicalName = fmt.Sprintf("%s, %s", a.LastName, a.FirstName)
	u.FirstName = a.FirstName
	u.LastName = a.LastName
	u.Email = strings.ToLower(a.Email)
	// u.IsOkToEmail = a.IsOkToEmail
	u.Phone = a.Phone
	// u.PhoneType = a.PhoneType
	// u.PhoneExtension = a.PhoneExtension
	// u.IsOkToText = a.IsOkToText
	// u.OtherPhone = a.OtherPhone
	// u.OtherPhoneExtension = a.OtherPhoneExtension
	// u.OtherPhoneType = a.OtherPhoneType
	u.Country = a.Country
	u.Region = a.Region
	u.City = a.City
	u.ModifiedAt = time.Now()
	u.ModifiedByUserID = a.ModifiedByUserID
	u.ModifiedByUserName = a.ModifiedByUserName
	u.ModifiedFromIPAddress = a.ModifiedFromIPAddress
	u.ReferenceID = a.ID

	// If staff inputted email then auto-assume the email was already verified.
	if u.Email != "" {
		u.WasEmailVerified = true
	}

	if err := impl.UserStorer.UpdateByID(sessCtx, u); err != nil {
		impl.Logger.Error("database update error", slog.Any("error", err))
		return err
	}

	impl.Logger.Debug("updated user for associate",
		slog.Any("user_id", u.ID)) // For debugging purposes only.

	return nil
}

// UpdateRelatedBySkillSets function will take the inputted `skill sets` with the associate.
func (impl *AssociateControllerImpl) UpdateRelatedBySkillSets(sessCtx mongo.SessionContext, a *a_c.Associate, modifiedSSIDs []primitive.ObjectID) error {
	oldSSIDs := []primitive.ObjectID{}
	for _, skillSet := range a.SkillSets {
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
		impl.Logger.Debug("adding skill set to associate",
			slog.Any("SkillSetID", addID))

		// Step 1: Lookup the skill set.
		ss, err := impl.SkillSetStorer.GetByID(sessCtx, addID)
		if err != nil {
			impl.Logger.Error("database get by id error", slog.Any("error", err))
			return err
		}
		if ss == nil {
			return httperror.NewForForbiddenWithSingleField("message", "skill set does not exist")
		}

		// Step 2: Create the associate skill set.
		ass := &a_c.AssociateSkillSet{
			ID:          ss.ID,
			Category:    ss.Category,
			SubCategory: ss.SubCategory,
			Description: ss.Description,
			Status:      ss.Status,
		}
		a.SkillSets = append(a.SkillSets, ass)

		// For debugging purposes only.
		impl.Logger.Debug("added skill set for associate",
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
	var newSkillSets []*a_c.AssociateSkillSet
	for _, ss := range a.SkillSets {
		if !idMap[ss.ID] {
			newSkillSets = append(newSkillSets, ss)
		}
	}
	a.SkillSets = newSkillSets

	////
	//// Update in the database.
	////

	if err := impl.AssociateStorer.UpdateByID(sessCtx, a); err != nil {
		impl.Logger.Error("database update error", slog.Any("error", err))
		return err
	}

	impl.Logger.Debug("updated skill set for associate",
		slog.Any("Skill Sets", a.SkillSets)) // For debugging purposes only.

	return nil
}

// UpdateRelatedByInsuranceRequirements function will take the inputted `insurance requirements` with the associate.
func (impl *AssociateControllerImpl) UpdateRelatedByInsuranceRequirements(sessCtx mongo.SessionContext, a *a_c.Associate, modifiedIRIDs []primitive.ObjectID) error {
	oldIRIDs := []primitive.ObjectID{}
	for _, skillSet := range a.InsuranceRequirements {
		oldIRIDs = append(oldIRIDs, skillSet.ID)
	}

	// See what are the differences between the two arrays of type `uint64` data-types.
	addIDs, keepIDs, removedIDs := arraydiff.ObjectIDs(oldIRIDs, modifiedIRIDs)

	// For debugging purposes only.
	impl.Logger.Debug("insurance requirement changes",
		slog.Any("added", addIDs),
		slog.Any("keep", keepIDs),
		slog.Any("removed", removedIDs))

	////
	//// Add new skill sets.
	////

	for _, addID := range addIDs {
		// For debugging purposes only.
		impl.Logger.Debug("adding insurance requirement to associate",
			slog.Any("InsuranceRequirementID", addID))

		// Step 1: Lookup the skill set.
		ir, err := impl.InsuranceRequirementStorer.GetByID(sessCtx, addID)
		if err != nil {
			impl.Logger.Error("database get by id error", slog.Any("error", err))
			return err
		}
		if ir == nil {
			return httperror.NewForForbiddenWithSingleField("message", "insurance requirement does not exist")
		}

		// Step 2: Create the associate skill set.
		air := &a_c.AssociateInsuranceRequirement{
			ID:          ir.ID,
			Name:        ir.Name,
			Description: ir.Description,
			Status:      ir.Status,
		}
		a.InsuranceRequirements = append(a.InsuranceRequirements, air)

		// For debugging purposes only.
		impl.Logger.Debug("added insurance requirement for associate",
			slog.Any("InsuranceRequirementID", addID))
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
	var newInsuranceRequirements []*a_c.AssociateInsuranceRequirement
	for _, ir := range a.InsuranceRequirements {
		if !idMap[ir.ID] {
			newInsuranceRequirements = append(newInsuranceRequirements, ir)
		}
	}
	a.InsuranceRequirements = newInsuranceRequirements

	////
	//// Update in the database.
	////

	if err := impl.AssociateStorer.UpdateByID(sessCtx, a); err != nil {
		impl.Logger.Error("database update error", slog.Any("error", err))
		return err
	}

	impl.Logger.Debug("updated insurance requiremens for associate",
		slog.Any("insurance requirements", a.InsuranceRequirements)) // For debugging purposes only.

	return nil
}

// UpdateRelatedByVehicleTypes function will take the inputted `vehicle types` with the associate.
func (impl *AssociateControllerImpl) UpdateRelatedByVehicleTypes(sessCtx mongo.SessionContext, a *a_c.Associate, modifiedVTIDs []primitive.ObjectID) error {
	oldVTIDs := []primitive.ObjectID{}
	for _, skillSet := range a.VehicleTypes {
		oldVTIDs = append(oldVTIDs, skillSet.ID)
	}

	// See what are the differences between the two arrays of type `uint64` data-types.
	addIDs, keepIDs, removedIDs := arraydiff.ObjectIDs(oldVTIDs, modifiedVTIDs)

	// For debugging purposes only.
	impl.Logger.Debug("vehicle types changes",
		slog.Any("added", addIDs),
		slog.Any("keep", keepIDs),
		slog.Any("removed", removedIDs))

	////
	//// Add new skill sets.
	////

	for _, addID := range addIDs {
		// For debugging purposes only.
		impl.Logger.Debug("adding vehicle type to associate",
			slog.Any("VehicleTypeID", addID))

		// Step 1: Lookup the skill set.
		ss, err := impl.VehicleTypeStorer.GetByID(sessCtx, addID)
		if err != nil {
			impl.Logger.Error("database get by id error", slog.Any("error", err))
			return err
		}
		if ss == nil {
			return httperror.NewForForbiddenWithSingleField("message", "vehicle type does not exist")
		}

		// Step 2: Create the associate skill set.
		ass := &a_c.AssociateVehicleType{
			ID:          ss.ID,
			Name:        ss.Name,
			Description: ss.Description,
			Status:      ss.Status,
		}
		a.VehicleTypes = append(a.VehicleTypes, ass)

		// For debugging purposes only.
		impl.Logger.Debug("added vehicle type for associate",
			slog.Any("VehicleTypeID", addID))
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
	var newVehicleTypes []*a_c.AssociateVehicleType
	for _, ss := range a.VehicleTypes {
		if !idMap[ss.ID] {
			newVehicleTypes = append(newVehicleTypes, ss)
		}
	}
	a.VehicleTypes = newVehicleTypes

	////
	//// Update in the database.
	////

	if err := impl.AssociateStorer.UpdateByID(sessCtx, a); err != nil {
		impl.Logger.Error("database update error", slog.Any("error", err))
		return err
	}

	impl.Logger.Debug("updated vehicle types for associate",
		slog.Any("Vehicle Types", a.VehicleTypes)) // For debugging purposes only.

	return nil
}

// UpdateRelatedByTags function will take the inputted `tags` with the associate.
func (impl *AssociateControllerImpl) UpdateRelatedByTags(sessCtx mongo.SessionContext, a *a_c.Associate, modifiedTIDs []primitive.ObjectID) error {
	oldTIDs := []primitive.ObjectID{}
	for _, skillSet := range a.Tags {
		oldTIDs = append(oldTIDs, skillSet.ID)
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
		impl.Logger.Debug("adding tag to associate",
			slog.Any("TagID", addID))

		// Step 1: Lookup the tag.
		ss, err := impl.TagStorer.GetByID(sessCtx, addID)
		if err != nil {
			impl.Logger.Error("database get by id error", slog.Any("error", err))
			return err
		}
		if ss == nil {
			return httperror.NewForForbiddenWithSingleField("message", "tag does not exist")
		}

		// Step 2: Create the associate tag.
		ass := &a_c.AssociateTag{
			ID:          ss.ID,
			Text:        ss.Text,
			Description: ss.Description,
			Status:      ss.Status,
		}
		a.Tags = append(a.Tags, ass)

		// For debugging purposes only.
		impl.Logger.Debug("added tag for associate",
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
	var newTags []*a_c.AssociateTag
	for _, ss := range a.Tags {
		if !idMap[ss.ID] {
			newTags = append(newTags, ss)
		}
	}
	a.Tags = newTags

	////
	//// Update in the database.
	////

	if err := impl.AssociateStorer.UpdateByID(sessCtx, a); err != nil {
		impl.Logger.Error("database update error", slog.Any("error", err))
		return err
	}

	impl.Logger.Debug("updated tag for associate",
		slog.Any("Tags", a.Tags)) // For debugging purposes only.

	return nil
}

// UpdateRelatedByOrders function will take the inputted `order` with the associate.
func (impl *AssociateControllerImpl) UpdateRelatedByOrders(sessCtx mongo.SessionContext, associate *a_s.Associate) error {
	var balanceOwingAmount float64 = 0

	res, err := impl.OrderStorer.ListByAssociateID(sessCtx, associate.ID)
	if err != nil {
		impl.Logger.Error("database list by associate id error",
			slog.Any("associate_id", associate.ID),
			slog.Any("error", err))
		return err
	}
	for _, o := range res.Results {
		// Tally up the total paid in service fees. If negative then Over55
		// owes the associate, if positive value then assocaite owes Over55.
		balanceOwingAmount += o.InvoiceBalanceOwingAmount

		// Update the related information in the work order.
		o.AssociateFirstName = associate.FirstName
		o.AssociateLastName = associate.LastName
		o.AssociateName = associate.Name
		o.AssociateLexicalName = associate.LexicalName
		o.AssociateGender = associate.Gender
		o.AssociateGenderOther = associate.GenderOther
		o.AssociateBirthdate = associate.BirthDate
		o.AssociateEmail = associate.Email
		o.AssociatePhone = associate.Phone
		o.AssociatePhoneType = associate.PhoneType
		o.AssociatePhoneExtension = associate.PhoneExtension
		o.AssociateOtherPhone = associate.OtherPhone
		o.AssociateOtherPhoneExtension = associate.OtherPhoneExtension
		o.AssociateOtherPhoneType = associate.OtherPhoneType
		o.AssociateFullAddressWithoutPostalCode = associate.FullAddressWithoutPostalCode
		o.AssociateFullAddressURL = associate.FullAddressURL
		o.AssociateTags = make([]*o_s.OrderTag, 0)
		o.AssociateServiceFeeID = associate.ServiceFeeID
		o.AssociateServiceFeeName = associate.ServiceFeeName
		o.AssociateServiceFeePercentage = associate.ServiceFeePercentage
		for _, tag := range associate.Tags {
			o.AssociateTags = append(o.AssociateTags, &o_s.OrderTag{
				ID:          tag.ID,
				Text:        tag.Text,
				Description: tag.Description,
			})
		}
		o.AssociateSkillSets = make([]*o_s.OrderSkillSet, 0)
		for _, ss := range associate.SkillSets {
			o.AssociateSkillSets = append(o.AssociateSkillSets, &o_s.OrderSkillSet{
				ID:          ss.ID,
				Category:    ss.Category,
				SubCategory: ss.SubCategory,
				Description: ss.Description,
				Status:      ss.Status,
			})
		}
		o.AssociateInsuranceRequirements = make([]*o_s.OrderInsuranceRequirement, 0)
		for _, t := range associate.InsuranceRequirements {
			o.AssociateInsuranceRequirements = append(o.AssociateInsuranceRequirements, &o_s.OrderInsuranceRequirement{
				ID:          t.ID,
				Name:        t.Name,
				Description: t.Description,
				Status:      t.Status,
			})
		}
		o.AssociateVehicleTypes = make([]*o_s.OrderVehicleType, 0)
		for _, vt := range associate.VehicleTypes {
			o.AssociateVehicleTypes = append(o.AssociateVehicleTypes, &o_s.OrderVehicleType{
				ID:          vt.ID,
				Name:        vt.Name,
				Description: vt.Description,
				Status:      vt.Status,
			})
		}
		o.AssociateTaxID = associate.TaxID

		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("database update error",
				slog.Any("associate_id", associate.ID),
				slog.Any("error", err))
			return err
		}
	}

	// Round the balance owing to 2 decimal places.
	balanceOwingAmount = math.Floor(balanceOwingAmount*100) / 100

	impl.Logger.Debug("associate balance owing amount updated",
		slog.Any("new_balanceOwingAmount", balanceOwingAmount),
		slog.Any("old_balanceOwingAmount", associate.BalanceOwingAmount))

	// Update the associate with the new total owing amount.
	associate.BalanceOwingAmount = balanceOwingAmount
	if err := impl.AssociateStorer.UpdateByID(sessCtx, associate); err != nil {
		impl.Logger.Error("associate update by id error",
			slog.Any("associate_id", associate.ID),
			slog.Any("error", err))
		return err
	}
	return nil
}

// UpdateRelatedByTaskItems function will take the inputted `order` with the associate.
func (impl *AssociateControllerImpl) UpdateRelatedByTaskItems(sessCtx mongo.SessionContext, associate *a_s.Associate) error {
	res, err := impl.TaskItemStorer.ListByAssociateID(sessCtx, associate.ID)
	if err != nil {
		impl.Logger.Error("database list by associate id error",
			slog.Any("associate_id", associate.ID),
			slog.Any("error", err))
		return err
	}
	for _, ti := range res.Results {
		ti.AssociateFirstName = associate.FirstName
		ti.AssociateLastName = associate.LastName
		ti.AssociateName = associate.Name
		ti.AssociateLexicalName = associate.LexicalName
		ti.AssociateGender = associate.Gender
		ti.AssociateGenderOther = associate.GenderOther
		ti.AssociateBirthdate = associate.BirthDate
		ti.AssociateEmail = associate.Email
		ti.AssociatePhone = associate.Phone
		ti.AssociatePhoneType = associate.PhoneType
		ti.AssociatePhoneExtension = associate.PhoneExtension
		ti.AssociateOtherPhone = associate.OtherPhone
		ti.AssociateOtherPhoneExtension = associate.OtherPhoneExtension
		ti.AssociateOtherPhoneType = associate.OtherPhoneType
		ti.AssociateFullAddressWithoutPostalCode = associate.FullAddressWithoutPostalCode
		ti.AssociateFullAddressURL = associate.FullAddressURL
		ti.AssociateTags = make([]*ti_s.TaskItemTag, 0)
		for _, tag := range associate.Tags {
			ti.AssociateTags = append(ti.AssociateTags, &ti_s.TaskItemTag{
				ID:          tag.ID,
				Text:        tag.Text,
				Description: tag.Description,
			})
		}
		ti.AssociateSkillSets = make([]*ti_s.TaskItemSkillSet, 0)
		for _, ss := range associate.SkillSets {
			ti.AssociateSkillSets = append(ti.AssociateSkillSets, &ti_s.TaskItemSkillSet{
				ID:          ss.ID,
				Category:    ss.Category,
				SubCategory: ss.SubCategory,
				Description: ss.Description,
				Status:      ss.Status,
			})
		}
		ti.AssociateInsuranceRequirements = make([]*ti_s.TaskItemInsuranceRequirement, 0)
		for _, t := range associate.InsuranceRequirements {
			ti.AssociateInsuranceRequirements = append(ti.AssociateInsuranceRequirements, &ti_s.TaskItemInsuranceRequirement{
				ID:          t.ID,
				Name:        t.Name,
				Description: t.Description,
				Status:      t.Status,
			})
		}
		ti.AssociateVehicleTypes = make([]*ti_s.TaskItemVehicleType, 0)
		for _, vt := range associate.VehicleTypes {
			ti.AssociateVehicleTypes = append(ti.AssociateVehicleTypes, &ti_s.TaskItemVehicleType{
				ID:          vt.ID,
				Name:        vt.Name,
				Description: vt.Description,
				Status:      vt.Status,
			})
		}
		ti.AssociateTaxID = associate.TaxID
		ti.AssociateServiceFeeID = associate.ServiceFeeID
		ti.AssociateServiceFeeName = associate.ServiceFeeName
		ti.AssociateServiceFeePercentage = associate.ServiceFeePercentage
		if err := impl.TaskItemStorer.UpdateByID(sessCtx, ti); err != nil {
			impl.Logger.Error("database update error",
				slog.Any("associate_id", associate.ID),
				slog.Any("error", err))
			return err
		}
	}
	return nil
}
