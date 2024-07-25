package controller

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	com_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type OrderOperationTransferRequest struct {
	OrderID     primitive.ObjectID `bson:"order_id" json:"order_id"`
	ClientID    primitive.ObjectID `bson:"client_id" json:"client_id,omityempty"`
	AssociateID primitive.ObjectID `bson:"associate_id" json:"associate_id,omityempty"`
}

func (impl *OrderControllerImpl) validateOperationTransferRequest(ctx context.Context, dirtyData *OrderOperationTransferRequest) error {
	e := make(map[string]string)

	if dirtyData.OrderID.IsZero() {
		e["order_id"] = "missing value"
	}

	if dirtyData.ClientID.IsZero() && dirtyData.AssociateID.IsZero() {
		e["client_id"] = "either this `associate_id` must be picked"
		e["associate_id"] = "either this `client_id` must be picked"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *OrderControllerImpl) Transfer(ctx context.Context, req *OrderOperationTransferRequest) (*o_s.Order, error) {
	//
	// Get variables from our user authenticated session.
	//

	tid, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userRole, _ := ctx.Value(constants.SessionUserRole).(int8)
	userHasStaffRole, _ := ctx.Value(constants.SessionUserHasStaffRole).(bool)
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	switch userRole {
	case u_s.UserRoleExecutive, u_s.UserRoleManagement, u_s.UserRoleFrontlineStaff:
		break
	default:
		impl.Logger.Error("you do not have permission to create a client comment")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to create a client comment")
	}

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateOperationTransferRequest(ctx, req); err != nil {
		impl.Logger.Warn("validation error", slog.Any("error", err))
		return nil, err
	}

	// Apply protection based on ownership and role.
	if !userHasStaffRole {
		impl.Logger.Error("authenticated user is not staff role error",
			slog.Any("order_id", req.OrderID),
			slog.Any("user_role", userRole),
			slog.Any("user_has_staff_role", userHasStaffRole),
			slog.Any("user_id", userID))
		return nil, httperror.NewForForbiddenWithSingleField("message", "you role does not grant you access to this")
	}

	////
	//// Lock this task until completed (including errors as well).
	////

	impl.Kmutex.Lock(req.OrderID.Hex())
	defer impl.Kmutex.Unlock(req.OrderID.Hex())

	////
	//// Start the transaction.
	////

	session, err := impl.DbClient.StartSession()
	if err != nil {
		impl.Logger.Warn("start session error",
			slog.Any("order_id", req.OrderID),
			slog.Any("error", err))
		return nil, err
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {

		////
		//// Fetch the related.
		////

		o, err := impl.OrderStorer.GetByID(sessCtx, req.OrderID)
		if err != nil {
			impl.Logger.Error("database get by id error", slog.Any("error", err))
			return nil, err
		}
		if o == nil {
			err := fmt.Errorf("order does not exist for ID %v", o.ID)
			impl.Logger.Error("order does not exist", slog.Any("error", err))
			return nil, err
		}
		a, err := impl.AssociateStorer.GetByID(sessCtx, req.AssociateID)
		if err != nil {
			impl.Logger.Error("database get by id error",
				slog.Any("associate_id", req.AssociateID),
				slog.Any("error", err))
			return nil, err
		}
		c, err := impl.CustomerStorer.GetByID(sessCtx, req.ClientID)
		if err != nil {
			impl.Logger.Error("database get by id error",
				slog.Any("customer_id", req.ClientID),
				slog.Any("error", err))
			return nil, err
		}

		////
		//// Update the task items related.
		////

		impl.Logger.Debug("proceeding to update related tasks",
			slog.Any("order_id", req.OrderID))

		res, err := impl.TaskItemStorer.ListByOrderID(sessCtx, o.ID)
		if err != nil {
			impl.Logger.Error("database get by id error",
				slog.Any("customer_id", req.ClientID),
				slog.Any("error", err))
			return nil, err
		}
		for _, ti := range res.Results {
			if c != nil {
				ti.CustomerID = c.ID
				ti.CustomerOrganizationName = c.OrganizationName
				ti.CustomerOrganizationType = c.OrganizationType
				ti.CustomerPublicID = c.PublicID
				ti.CustomerFirstName = c.FirstName
				ti.CustomerLastName = c.LastName
				ti.CustomerName = c.Name
				ti.CustomerLexicalName = c.LexicalName
				ti.CustomerGender = c.Gender
				ti.CustomerGenderOther = c.GenderOther
				ti.CustomerBirthdate = c.BirthDate
				ti.CustomerEmail = c.Email
				ti.CustomerPhone = c.Phone
				ti.CustomerPhoneType = c.PhoneType
				ti.CustomerPhoneExtension = c.PhoneExtension
				ti.CustomerOtherPhone = c.OtherPhone
				ti.CustomerOtherPhoneExtension = c.OtherPhoneExtension
				ti.CustomerOtherPhoneType = c.OtherPhoneType
				ti.CustomerFullAddressWithoutPostalCode = c.FullAddressWithoutPostalCode
				ti.CustomerFullAddressURL = c.FullAddressURL
				ti.CustomerTags = toTaskItemTagsFromCustomerTags(c.Tags)
				ti.ModifiedAt = time.Now()
				ti.ModifiedByUserID = userID
				ti.ModifiedByUserName = userName
				ti.ModifiedFromIPAddress = ipAddress
				impl.Logger.Debug("update customer in task",
					slog.Any("customer_id", req.ClientID),
					slog.Any("order_id", o.ID),
					slog.Any("task_item", ti.ID))
			}
			if a != nil {
				ti.AssociateID = a.ID
				ti.AssociateOrganizationName = a.OrganizationName
				ti.AssociateOrganizationType = a.OrganizationType
				ti.AssociatePublicID = a.PublicID
				ti.AssociateFirstName = a.FirstName
				ti.AssociateLastName = a.LastName
				ti.AssociateName = a.Name
				ti.AssociateLexicalName = a.LexicalName
				ti.AssociateGender = a.Gender
				ti.AssociateGenderOther = a.GenderOther
				ti.AssociateBirthdate = a.BirthDate
				ti.AssociateEmail = a.Email
				ti.AssociatePhone = a.Phone
				ti.AssociatePhoneType = a.PhoneType
				ti.AssociatePhoneExtension = a.PhoneExtension
				ti.AssociateOtherPhone = a.OtherPhone
				ti.AssociateOtherPhoneExtension = a.OtherPhoneExtension
				ti.AssociateOtherPhoneType = a.OtherPhoneType
				ti.AssociateFullAddressWithoutPostalCode = a.FullAddressWithoutPostalCode
				ti.AssociateFullAddressURL = a.FullAddressURL
				ti.AssociateTags = toTaskItemTagsFromAssociateTags(a.Tags)
				ti.AssociateSkillSets = toTaskItemSkillSetsFromAssociateSkillSets(a.SkillSets)
				ti.AssociateInsuranceRequirements = toTaskItemInsuranceRequirementsFromAssociateInsuranceRequirements(a.InsuranceRequirements)
				ti.AssociateVehicleTypes = toTaskItemVehicleTypesFromAssociateVehicleTypes(a.VehicleTypes)
				ti.AssociateServiceFeeID = a.ServiceFeeID
				ti.AssociateServiceFeeName = a.ServiceFeeName
				ti.AssociateServiceFeePercentage = a.ServiceFeePercentage
				impl.Logger.Debug("update associate in task",
					slog.Any("associate_id", req.AssociateID),
					slog.Any("order_id", o.ID),
					slog.Any("task_item", ti.ID))
			}
			if err := impl.TaskItemStorer.UpdateByID(sessCtx, ti); err != nil {
				impl.Logger.Error("task item update error",
					slog.Any("order_id", req.OrderID))
				return nil, err
			}
			impl.Logger.Debug("task item updated due to transfer",
				slog.Any("order_id", req.OrderID),
				slog.Any("task_item", ti.ID))
		}

		////
		//// Create comments
		////

		var commentContent string
		if c != nil {
			commentContent = fmt.Sprintf("Transfered from client `%v` to new client `%v`.", o.CustomerName, c.Name)
		}
		if a != nil {
			if c != nil {
				commentContent = fmt.Sprintf("%v In addition, transfered from associate `%v` to new associate `%v`.", commentContent, o.AssociateName, a.Name)
			} else {
				commentContent = fmt.Sprintf("Transfered from associate `%v` to new associate `%v`.", o.AssociateName, a.Name)
			}
		}

		com := &com_s.Comment{
			ID:                    primitive.NewObjectID(),
			TenantID:              tid,
			CreatedAt:             time.Now(),
			CreatedByUserID:       userID,
			CreatedByUserName:     userName,
			CreatedFromIPAddress:  ipAddress,
			ModifiedAt:            time.Now(),
			ModifiedByUserID:      userID,
			ModifiedByUserName:    userName,
			ModifiedFromIPAddress: ipAddress,
			Content:               fmt.Sprintf("[TRANSFERING ACTION] %v", commentContent),
			Status:                com_s.CommentStatusActive,
		}
		if err := impl.CommentStorer.Create(sessCtx, com); err != nil {
			impl.Logger.Error("comment creation error",
				slog.Any("order_id", o.ID),
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("comment created for transfer operation",
			slog.Any("order_id", o.ID),
			slog.Any("comment_id", com.ID))

		oc := &o_s.OrderComment{
			ID:                    com.ID,
			OrderID:               o.ID,
			OrderWJID:             o.WJID,
			OrderTenantIDWithWJID: fmt.Sprintf("%v_%v", o.TenantID.Hex(), o.WJID),
			TenantID:              com.TenantID,
			CreatedAt:             com.CreatedAt,
			CreatedByUserID:       com.CreatedByUserID,
			CreatedByUserName:     com.CreatedByUserName,
			CreatedFromIPAddress:  com.CreatedFromIPAddress,
			ModifiedAt:            com.ModifiedAt,
			ModifiedByUserID:      com.ModifiedByUserID,
			ModifiedByUserName:    com.ModifiedByUserName,
			ModifiedFromIPAddress: com.ModifiedFromIPAddress,
			Content:               com.Content,
			Status:                com.Status,
			PublicID:              com.PublicID,
		}

		// Append comments to order details.
		o.Comments = append(o.Comments, oc)

		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("order update error",
				slog.Any("order_id", o.ID),
				slog.Any("error", err))
			return nil, err
		}

		// Update the comment.
		com.BelongsTo = com_s.BelongsToOrder
		com.OrderID = o.ID
		com.OrderWJID = o.WJID
		if err := impl.CommentStorer.UpdateByID(sessCtx, com); err != nil {
			impl.Logger.Error("comment update error",
				slog.Any("order_id", o.ID),
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("order comment created for transfer operation",
			slog.Any("order_id", o.ID),
			slog.Any("comment_id", com.ID))

		////
		//// Update the order based on whether we need to transfer to associate
		//// and or to the customer.
		////

		impl.Logger.Debug("proceeding to update order",
			slog.Any("order_id", req.OrderID))

		if c != nil {
			o.CustomerID = c.ID
			o.CustomerOrganizationName = c.OrganizationName
			o.CustomerOrganizationType = c.OrganizationType
			o.CustomerPublicID = c.PublicID
			o.CustomerFirstName = c.FirstName
			o.CustomerLastName = c.LastName
			o.CustomerName = c.Name
			o.CustomerLexicalName = c.LexicalName
			o.CustomerGender = c.Gender
			o.CustomerGenderOther = c.GenderOther
			o.CustomerBirthdate = c.BirthDate
			o.CustomerEmail = c.Email
			o.CustomerPhone = c.Phone
			o.CustomerPhoneType = c.PhoneType
			o.CustomerPhoneExtension = c.PhoneExtension
			o.CustomerOtherPhone = c.OtherPhone
			o.CustomerOtherPhoneExtension = c.OtherPhoneExtension
			o.CustomerOtherPhoneType = c.OtherPhoneType
			o.CustomerFullAddressWithoutPostalCode = c.FullAddressWithoutPostalCode
			o.CustomerFullAddressURL = c.FullAddressURL
			o.CustomerTags = toOrderTagsFromCustomerTags(c.Tags)
			o.ModifiedAt = time.Now()
			o.ModifiedByUserID = userID
			o.ModifiedByUserName = userName
			o.ModifiedFromIPAddress = ipAddress
			impl.Logger.Debug("update customer in order",
				slog.Any("customer_id", req.ClientID),
				slog.Any("order_id", o.ID))
		}
		if a != nil {
			////
			//// Update activity sheet of associate and the order.
			////

			// Iterate through all the activity sheets that belong to this
			// order to find the old associate and replace with the new
			// associate.
			asres, err := impl.ActivitySheetStorer.ListByOrderID(sessCtx, o.ID)
			if err != nil {
				impl.Logger.Error("activity sheet list error",
					slog.Any("order_id", o.ID),
					slog.Any("error", err))
				return nil, err
			}
			for _, sheet := range asres.Results {
				// Note: If the assigned associate equals the associate on the activity sheet.
				if sheet.AssociateID == o.AssociateID {
					// Replace the activity sheet with the new associate.
					sheet.AssociateID = a.ID
					sheet.AssociateOrganizationName = a.OrganizationName
					sheet.AssociateOrganizationType = a.OrganizationType
					sheet.AssociateName = a.Name
					sheet.AssociateLexicalName = a.LexicalName
					sheet.ModifiedAt = time.Now()
					sheet.ModifiedByUserID = userID
					sheet.ModifiedByUserName = userName
					sheet.ModifiedFromIPAddress = ipAddress
					if err := impl.ActivitySheetStorer.UpdateByID(sessCtx, sheet); err != nil {
						impl.Logger.Error("activity sheet list error",
							slog.Any("order_id", o.ID),
							slog.Any("error", err))
						return nil, err
					}
					impl.Logger.Debug("update activity sheet for associate in order",
						slog.Any("associate_id", req.AssociateID),
						slog.Any("activity_sheet_id", sheet.ID),
						slog.Any("order_id", o.ID))
				}
			}

			o.AssociateID = a.ID
			o.AssociateOrganizationName = a.OrganizationName
			o.AssociateOrganizationType = a.OrganizationType
			o.AssociatePublicID = a.PublicID
			o.AssociateFirstName = a.FirstName
			o.AssociateLastName = a.LastName
			o.AssociateName = a.Name
			o.AssociateLexicalName = a.LexicalName
			o.AssociateGender = a.Gender
			o.AssociateGenderOther = a.GenderOther
			o.AssociateBirthdate = a.BirthDate
			o.AssociateEmail = a.Email
			o.AssociatePhone = a.Phone
			o.AssociatePhoneType = a.PhoneType
			o.AssociatePhoneExtension = a.PhoneExtension
			o.AssociateOtherPhone = a.OtherPhone
			o.AssociateOtherPhoneExtension = a.OtherPhoneExtension
			o.AssociateOtherPhoneType = a.OtherPhoneType
			o.AssociateFullAddressWithoutPostalCode = a.FullAddressWithoutPostalCode
			o.AssociateFullAddressURL = a.FullAddressURL
			o.AssociateTags = toOrderTagsFromAssociateTags(a.Tags)
			o.AssociateSkillSets = toOrderSkillSetsFromAssociateSkillSets(a.SkillSets)
			o.AssociateInsuranceRequirements = toOrderInsuranceRequirementsFromAssociateInsuranceRequirements(a.InsuranceRequirements)
			o.AssociateVehicleTypes = toOrderVehicleTypesFromAssociateVehicleTypes(a.VehicleTypes)
			o.AssociateServiceFeeID = a.ServiceFeeID
			o.AssociateServiceFeeName = a.ServiceFeeName
			o.AssociateServiceFeePercentage = a.ServiceFeePercentage
			impl.Logger.Debug("update associate in order",
				slog.Any("associate_id", req.AssociateID),
				slog.Any("order_id", o.ID))
		}

		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("database update by id error",
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("order was successfully transfered",
			slog.Any("order_id", o.ID))

		// ////
		// //// For debugging purposes only.
		// ////
		//
		// err = errors.New("halt by programmer")
		// impl.Logger.Error("for debugging purposes only",
		// 	slog.Any("error", err))
		// return nil, err

		////
		//// Exit our transaction successfully.
		////

		return o, nil
	} // end transaction function.

	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		impl.Logger.Error("transaction error",
			slog.Any("order_id", req.OrderID),
			slog.Any("error", err))
		return nil, err
	}
	return result.(*o_s.Order), nil
}
