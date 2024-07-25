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
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type OrderOperationPostponeRequest struct {
	OrderID            primitive.ObjectID `bson:"order_id" json:"order_id"`
	Reason             int8               `bson:"reason" json:"reason"`
	ReasonOther        string             `bson:"reason_other" json:"reason_other"`
	StartDate          string             `bson:"start_date" json:"start_date"`
	StartDateFormatted time.Time          `bson:"-" json:"-"`
	DescribeTheComment string             `bson:"describe_the_comment" json:"describe_the_comment"`
}

func (impl *OrderControllerImpl) validateOperationPostponeRequest(ctx context.Context, dirtyData *OrderOperationPostponeRequest) error {
	e := make(map[string]string)

	if dirtyData.OrderID.IsZero() {
		e["order_id"] = "missing value"
	}
	if dirtyData.Reason == 0 {
		e["reason"] = "missing value"
	} else if dirtyData.Reason == 1 && dirtyData.ReasonOther == "" {
		e["reason_other"] = "missing value"
	}
	if dirtyData.StartDate == "" {
		e["start_date"] = "missing value"
	}
	if dirtyData.DescribeTheComment == "" {
		e["describe_the_comment"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *OrderControllerImpl) Postpone(ctx context.Context, req *OrderOperationPostponeRequest) (*o_s.Order, error) {
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

	if err := impl.validateOperationPostponeRequest(ctx, req); err != nil {
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
		//// Fetch the original order.
		////

		o, err := impl.OrderStorer.GetByID(sessCtx, req.OrderID)
		if err != nil {
			impl.Logger.Error("database get by id error",
				slog.Any("order_id", req.OrderID),
				slog.Any("error", err))
			return nil, err
		}
		if o == nil {
			err := fmt.Errorf("order does not exist for ID %v", req.OrderID)
			impl.Logger.Error("order does not exis",
				slog.Any("order_id", req.OrderID),
				slog.Any("error", err))
			return nil, err
		}

		if !o.LatestPendingTaskID.IsZero() {
			//
			// Close previous task
			//

			ti, err := impl.TaskItemStorer.GetByID(sessCtx, o.LatestPendingTaskID)
			if err != nil {
				impl.Logger.Error("failed getting task item",
					slog.Any("latest_pending_task_id", o.LatestPendingTaskID),
					slog.Any("order_id", o.ID),
					slog.Any("error", err))
				return nil, err
			}
			if ti == nil {
				err := fmt.Errorf("task item does not exist for ID %v", o.LatestPendingTaskID)
				impl.Logger.Error("task item does not exist", slog.Any("error", err))
				return nil, err
			}

			////
			//// Close the current task.
			////

			// Close current task item.
			ti.IsClosed = true
			ti.WasPostponed = true
			ti.ClosingReason = int8(req.Reason)
			ti.ClosingReasonOther = req.ReasonOther
			ti.ModifiedAt = time.Now()
			ti.ModifiedByUserID = userID
			ti.ModifiedByUserName = userName
			ti.ModifiedFromIPAddress = ipAddress
			if err := impl.TaskItemStorer.UpdateByID(sessCtx, ti); err != nil {
				impl.Logger.Error("task item update error",
					slog.Any("order_id", req.OrderID))
				return nil, err
			}

			impl.Logger.Debug("task item closed due to postponement",
				slog.Any("order_id", req.OrderID))
		}

		////
		//// Create a new task based on a new start date.
		////

		var newTask *ti_s.TaskItem

		title := "Order Completion"
		if o.IsOngoing {
			title = "Order Completion / Ongoing"
		}
		description := "Please call up the associate and verify the order completion."
		dueDate := time.Now().AddDate(0, 0, 7)                           // Add 7 day. Rational: We want to ask the customer after 7 days AFTER the client meeting data.
		typeId := int8(ti_s.TaskItemTypeFollowUpDidAssociateCompleteJob) // A.K.A. "Order Completion" type.
		newTask = &ti_s.TaskItem{
			ID:                                    primitive.NewObjectID(),
			TenantID:                              tid,
			Type:                                  typeId,
			Title:                                 title,
			Description:                           description,
			DueDate:                               dueDate,
			IsClosed:                              false,
			WasPostponed:                          false,
			ClosingReason:                         0,
			ClosingReasonOther:                    "",
			OrderID:                               o.ID,
			OrderType:                             o.Type,
			OrderWJID:                             o.WJID,
			OrderTenantIDWithWJID:                 o.TenantIDWithWJID,
			OrderStartDate:                        o.StartDate,
			OrderDescription:                      o.Description,
			CreatedAt:                             time.Now(),
			CreatedByUserID:                       userID,
			CreatedByUserName:                     userName,
			CreatedFromIPAddress:                  ipAddress,
			ModifiedAt:                            time.Now(),
			ModifiedByUserID:                      userID,
			ModifiedByUserName:                    userName,
			ModifiedFromIPAddress:                 ipAddress,
			Status:                                ti_s.TaskItemStatusActive,
			CustomerID:                            o.CustomerID,
			CustomerOrganizationName:              o.CustomerOrganizationName,
			CustomerOrganizationType:              o.CustomerOrganizationType,
			CustomerPublicID:                      o.CustomerPublicID,
			CustomerFirstName:                     o.CustomerFirstName,
			CustomerLastName:                      o.CustomerLastName,
			CustomerName:                          o.CustomerName,
			CustomerLexicalName:                   o.CustomerLexicalName,
			CustomerGender:                        o.CustomerGender,
			CustomerGenderOther:                   o.CustomerGenderOther,
			CustomerBirthdate:                     o.CustomerBirthdate,
			CustomerEmail:                         o.CustomerEmail,
			CustomerPhone:                         o.CustomerPhone,
			CustomerPhoneType:                     o.CustomerPhoneType,
			CustomerPhoneExtension:                o.CustomerPhoneExtension,
			CustomerOtherPhone:                    o.CustomerOtherPhone,
			CustomerOtherPhoneExtension:           o.CustomerOtherPhoneExtension,
			CustomerOtherPhoneType:                o.CustomerOtherPhoneType,
			CustomerFullAddressWithoutPostalCode:  o.CustomerFullAddressWithoutPostalCode,
			CustomerFullAddressURL:                o.CustomerFullAddressURL,
			AssociateID:                           o.AssociateID,
			AssociateOrganizationName:             o.AssociateOrganizationName,
			AssociateOrganizationType:             o.AssociateOrganizationType,
			AssociatePublicID:                     o.AssociatePublicID,
			AssociateFirstName:                    o.AssociateFirstName,
			AssociateLastName:                     o.AssociateLastName,
			AssociateName:                         o.AssociateName,
			AssociateLexicalName:                  o.AssociateLexicalName,
			AssociateGender:                       o.AssociateGender,
			AssociateGenderOther:                  o.AssociateGenderOther,
			AssociateBirthdate:                    o.AssociateBirthdate,
			AssociateEmail:                        o.AssociateEmail,
			AssociatePhone:                        o.AssociatePhone,
			AssociatePhoneType:                    o.AssociatePhoneType,
			AssociatePhoneExtension:               o.AssociatePhoneExtension,
			AssociateOtherPhone:                   o.AssociateOtherPhone,
			AssociateOtherPhoneExtension:          o.AssociateOtherPhoneExtension,
			AssociateOtherPhoneType:               o.AssociateOtherPhoneType,
			AssociateFullAddressWithoutPostalCode: o.AssociateFullAddressWithoutPostalCode,
			AssociateFullAddressURL:               o.AssociateFullAddressURL,
			AssociateServiceFeeID:                 o.AssociateServiceFeeID,
			AssociateServiceFeeName:               o.AssociateServiceFeeName,
			AssociateServiceFeePercentage:         o.AssociateServiceFeePercentage,
			CustomerTags:                          toTaskItemTagsFromOrderTags(o.CustomerTags),
			AssociateTags:                         toTaskItemTagsFromOrderTags(o.AssociateTags),
			OrderSkillSets:                        toTaskItemSkillSetsFromOrderSkillSets(o.SkillSets),
			OrderTags:                             toTaskItemTagsFromOrderTags(o.Tags),
		}

		if err := impl.TaskItemStorer.Create(sessCtx, newTask); err != nil {
			impl.Logger.Error("task creation error",
				slog.Any("task_item_id", newTask.ID),
				slog.Any("order_id", newTask.OrderID),
				slog.Any("order_wjid", newTask.OrderWJID),
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("new task item created for postpone operation",
			slog.Any("task_item_id", newTask.ID),
			slog.Any("order_id", newTask.OrderID),
			slog.Any("order_wjid", newTask.OrderWJID))

		////
		//// Update existing order.
		////

		// # Updated the start date to the one inputed by the user.
		o.StartDate = req.StartDateFormatted

		// Generic update.
		o.LatestPendingTaskID = newTask.ID
		o.LatestPendingTaskTitle = newTask.Title
		o.LatestPendingTaskDescription = newTask.Description
		o.LatestPendingTaskDueDate = newTask.DueDate
		o.LatestPendingTaskType = newTask.Type
		o.ModifiedAt = time.Now()
		o.ModifiedByUserID = userID
		o.ModifiedByUserName = userName
		o.ModifiedFromIPAddress = ipAddress

		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("task creation error",
				slog.Any("task_item_id", newTask.ID),
				slog.Any("order_id", newTask.OrderID),
				slog.Any("order_wjid", newTask.OrderWJID),
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("updated order for postpone operation",
			slog.Any("task_item_id", newTask.ID),
			slog.Any("order_id", newTask.OrderID),
			slog.Any("order_wjid", newTask.OrderWJID))

		////
		//// Create a new comment.
		////

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
			Content:               fmt.Sprintf("[POSTPONE ACTION] %v", req.DescribeTheComment),
			Status:                com_s.CommentStatusActive,
		}
		if err := impl.CommentStorer.Create(sessCtx, com); err != nil {
			impl.Logger.Error("comment creation error",
				slog.Any("task_item_id", newTask.ID),
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("comment created for postpone operation",
			slog.Any("task_item_id", newTask.ID),
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
				slog.Any("task_item_id", newTask.ID),
				slog.Any("error", err))
			return nil, err
		}

		// Update the comment.
		com.BelongsTo = com_s.BelongsToOrder
		com.OrderID = o.ID
		com.OrderWJID = o.WJID
		if err := impl.CommentStorer.UpdateByID(sessCtx, com); err != nil {
			impl.Logger.Error("comment update error",
				slog.Any("task_item_id", newTask.ID),
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("order comment created for postpone operation",
			slog.Any("task_item_id", newTask.ID),
			slog.Any("order_id", newTask.OrderID),
			slog.Any("order_wjid", newTask.OrderWJID),
			slog.Any("comment_id", com.ID))

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
