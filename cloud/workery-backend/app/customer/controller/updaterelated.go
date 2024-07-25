package controller

import (
	"fmt"
	"log/slog"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/bartmika/arraydiff"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

// UpdateRelatedByUser function will update the user account.
func (impl *CustomerControllerImpl) UpdateRelatedByUser(sessCtx mongo.SessionContext, cust *c_s.Customer) error {
	if cust.UserID.IsZero() {
		return httperror.NewForBadRequestWithSingleField("user_id", "customer does not have a `user_id` in record")
	}

	u, err := impl.UserStorer.GetByID(sessCtx, cust.UserID)
	if err != nil {
		impl.Logger.Error("get user by email error", slog.Any("error", err))
		return err
	}

	// If user account does not exist then skip it.
	if u == nil {
		return nil
	}

	// u.Type = cust.Type
	u.OrganizationName = cust.OrganizationName
	u.OrganizationType = cust.OrganizationType
	u.Name = fmt.Sprintf("%s %s", cust.FirstName, cust.LastName)
	u.LexicalName = fmt.Sprintf("%s, %s", cust.LastName, cust.FirstName)
	u.FirstName = cust.FirstName
	u.LastName = cust.LastName
	u.Email = strings.ToLower(cust.Email)
	// u.IsOkToEmail = cust.IsOkToEmail
	u.Phone = cust.Phone
	// u.PhoneType = cust.PhoneType
	// u.PhoneExtension = cust.PhoneExtension
	// u.IsOkToText = cust.IsOkToText
	// u.OtherPhone = cust.OtherPhone
	// u.OtherPhoneExtension = cust.OtherPhoneExtension
	// u.OtherPhoneType = cust.OtherPhoneType
	u.Country = cust.Country
	u.Region = cust.Region
	u.City = cust.City
	u.ModifiedAt = time.Now()
	u.ModifiedByUserID = cust.ModifiedByUserID
	u.ModifiedByUserName = cust.ModifiedByUserName
	u.ModifiedFromIPAddress = cust.ModifiedFromIPAddress

	return nil
}

// UpdateRelatedByTags function will take the inputted `tags` with the customer.
func (impl *CustomerControllerImpl) UpdateRelatedByTags(sessCtx mongo.SessionContext, cust *c_s.Customer, modifiedTIDs []primitive.ObjectID) error {
	oldTIDs := []primitive.ObjectID{}
	for _, skillSet := range cust.Tags {
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
		impl.Logger.Debug("adding tag to customer",
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

		// Step 2: Create the customer tag.
		ass := &c_s.CustomerTag{
			ID:          ss.ID,
			Text:        ss.Text,
			Description: ss.Description,
			Status:      ss.Status,
		}
		cust.Tags = append(cust.Tags, ass)

		// For debugging purposes only.
		impl.Logger.Debug("added tag for customer",
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
	var newTags []*c_s.CustomerTag
	for _, ss := range cust.Tags {
		if !idMap[ss.ID] {
			newTags = append(newTags, ss)
		}
	}
	cust.Tags = newTags

	////
	//// Update in the database.
	////

	if err := impl.CustomerStorer.UpdateByID(sessCtx, cust); err != nil {
		impl.Logger.Error("database update error", slog.Any("error", err))
		return err
	}

	impl.Logger.Debug("updated tag for customer",
		slog.Any("Tags", cust.Tags)) // For debugging purposes only.

	return nil
}

// UpdateRelatedByOrders function will take the inputted `order` with the customer.
func (impl *CustomerControllerImpl) UpdateRelatedByOrders(sessCtx mongo.SessionContext, cust *c_s.Customer) error {
	res, err := impl.OrderStorer.ListByCustomerID(sessCtx, cust.ID)
	if err != nil {
		impl.Logger.Error("database list by customer id error",
			slog.Any("customer_id", cust.ID),
			slog.Any("error", err))
		return err
	}
	for _, o := range res.Results {
		o.CustomerFirstName = cust.FirstName
		o.CustomerLastName = cust.LastName
		o.CustomerName = cust.Name
		o.CustomerLexicalName = cust.LexicalName
		o.CustomerGender = cust.Gender
		o.CustomerGenderOther = cust.GenderOther
		o.CustomerBirthdate = cust.BirthDate
		o.CustomerEmail = cust.Email
		o.CustomerPhone = cust.Phone
		o.CustomerPhoneType = cust.PhoneType
		o.CustomerPhoneExtension = cust.PhoneExtension
		o.CustomerOtherPhone = cust.OtherPhone
		o.CustomerOtherPhoneExtension = cust.OtherPhoneExtension
		o.CustomerOtherPhoneType = cust.OtherPhoneType
		o.CustomerFullAddressWithoutPostalCode = cust.FullAddressWithoutPostalCode
		o.CustomerFullAddressURL = cust.FullAddressURL
		o.CustomerTags = make([]*o_s.OrderTag, 0)
		for _, tag := range cust.Tags {
			o.CustomerTags = append(o.CustomerTags, &o_s.OrderTag{
				ID:          tag.ID,
				Text:        tag.Text,
				Description: tag.Description,
			})
		}
		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("database update error",
				slog.Any("customer_id", cust.ID),
				slog.Any("error", err))
			return err
		}
	}
	return nil
}

// UpdateRelatedByTaskItems function will take the inputted `TaskItem` with the customer.
func (impl *CustomerControllerImpl) UpdateRelatedByTaskItems(sessCtx mongo.SessionContext, cust *c_s.Customer) error {
	res, err := impl.TaskItemStorer.ListByCustomerID(sessCtx, cust.ID)
	if err != nil {
		impl.Logger.Error("database list by customer id error",
			slog.Any("customer_id", cust.ID),
			slog.Any("error", err))
		return err
	}
	for _, o := range res.Results {
		o.CustomerFirstName = cust.FirstName
		o.CustomerLastName = cust.LastName
		o.CustomerName = cust.Name
		o.CustomerLexicalName = cust.LexicalName
		o.CustomerGender = cust.Gender
		o.CustomerGenderOther = cust.GenderOther
		o.CustomerBirthdate = cust.BirthDate
		o.CustomerEmail = cust.Email
		o.CustomerPhone = cust.Phone
		o.CustomerPhoneType = cust.PhoneType
		o.CustomerPhoneExtension = cust.PhoneExtension
		o.CustomerOtherPhone = cust.OtherPhone
		o.CustomerOtherPhoneExtension = cust.OtherPhoneExtension
		o.CustomerOtherPhoneType = cust.OtherPhoneType
		o.CustomerFullAddressWithoutPostalCode = cust.FullAddressWithoutPostalCode
		o.CustomerFullAddressURL = cust.FullAddressURL
		o.CustomerTags = make([]*ti_s.TaskItemTag, 0)
		for _, tag := range cust.Tags {
			o.CustomerTags = append(o.CustomerTags, &ti_s.TaskItemTag{
				ID:          tag.ID,
				Text:        tag.Text,
				Description: tag.Description,
			})
		}
		if err := impl.TaskItemStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("database update error",
				slog.Any("customer_id", cust.ID),
				slog.Any("error", err))
			return err
		}
	}
	return nil
}
