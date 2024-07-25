package controller

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	comment_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type OrderOperationUnassignRequest struct {
	OrderID     primitive.ObjectID `bson:"order_id" json:"order_id"`
	Reason      int8               `bson:"reason" json:"reason"`
	ReasonOther string             `bson:"reason_other" json:"reason_other"`
}

func (impl *OrderControllerImpl) validateOperationUnassignRequest(ctx context.Context, dirtyData *OrderOperationUnassignRequest) error {
	e := make(map[string]string)

	if dirtyData.OrderID.IsZero() {
		e["order_id"] = "missing value"
	}

	if dirtyData.Reason == 0 {
		e["reason"] = "missing value"
	}

	if dirtyData.Reason == 1 && dirtyData.ReasonOther == "" {
		e["reason_other"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *OrderControllerImpl) Unassign(ctx context.Context, req *OrderOperationUnassignRequest) (*o_s.Order, error) {
	//
	// Get variables from our user authenticated session.
	//

	tid, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userRole, _ := ctx.Value(constants.SessionUserRole).(int8)
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	userHasStaffRole, _ := ctx.Value(constants.SessionUserHasStaffRole).(bool)
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

	if err := impl.validateOperationUnassignRequest(ctx, req); err != nil {
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
	//// Lock this order until completed (including errors as well).
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
		//// Get related data.
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
			impl.Logger.Error("order does not exist", slog.Any("error", err))
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

			// Close current task item.
			// ti.Status = ti_s.WorkOrderCancelledState
			ti.IsClosed = true
			ti.ClosingReason = req.Reason
			ti.ClosingReasonOther = req.ReasonOther
			ti.ModifiedAt = time.Now()
			ti.ModifiedByUserID = userID
			ti.ModifiedByUserName = userName
			ti.ModifiedFromIPAddress = ipAddress
			if err := impl.TaskItemStorer.UpdateByID(sessCtx, ti); err != nil {
				impl.Logger.Error("task item update error",
					slog.Any("task_item_id", o.ID))
				return nil, err
			}

			impl.Logger.Debug("latest pending task item closed for order unassign operation",
				slog.Any("task_item_id", ti.ID))
		}

		//
		// Create a new task.
		//

		newti := &ti_s.TaskItem{
			ID:                                   primitive.NewObjectID(),
			TenantID:                             tid,
			Type:                                 ti_s.TaskItemTypeAssignedAssociate,
			Title:                                "Assign an Associate",
			Description:                          "Please assign an associate to this job.",
			DueDate:                              o.StartDate,
			IsClosed:                             false,
			OrderID:                              o.ID,
			OrderType:                            o.Type,
			OrderWJID:                            o.WJID,
			OrderTenantIDWithWJID:                o.TenantIDWithWJID,
			OrderStartDate:                       o.StartDate,
			OrderDescription:                     o.Description,
			CreatedByUserID:                      userID,
			CreatedByUserName:                    userName,
			CreatedAt:                            time.Now(),
			CreatedFromIPAddress:                 ipAddress,
			ModifiedByUserID:                     userID,
			ModifiedByUserName:                   userName,
			ModifiedAt:                           time.Now(),
			ModifiedFromIPAddress:                ipAddress,
			Status:                               ti_s.TaskItemStatusActive,
			CustomerID:                           o.CustomerID,
			CustomerOrganizationName:             o.CustomerOrganizationName,
			CustomerOrganizationType:             o.CustomerOrganizationType,
			CustomerFirstName:                    o.CustomerFirstName,
			CustomerLastName:                     o.CustomerLastName,
			CustomerName:                         o.CustomerName,
			CustomerLexicalName:                  o.CustomerLexicalName,
			CustomerGender:                       o.CustomerGender,
			CustomerGenderOther:                  o.CustomerGenderOther,
			CustomerBirthdate:                    o.CustomerBirthdate,
			CustomerTags:                         toTaskItemTagsFromOrderTags(o.CustomerTags),
			CustomerEmail:                        o.CustomerEmail,
			CustomerPhone:                        o.CustomerPhone,
			CustomerPhoneType:                    o.CustomerPhoneType,
			CustomerPhoneExtension:               o.CustomerPhoneExtension,
			CustomerOtherPhone:                   o.CustomerOtherPhone,
			CustomerOtherPhoneType:               o.CustomerOtherPhoneType,
			CustomerOtherPhoneExtension:          o.CustomerOtherPhoneExtension,
			CustomerFullAddressWithoutPostalCode: o.CustomerFullAddressWithoutPostalCode,
			CustomerFullAddressURL:               o.CustomerFullAddressURL,
			OrderSkillSets:                       toTaskItemSkillSetsFromOrderSkillSets(o.SkillSets),
			OrderTags:                            toTaskItemTagsFromOrderTags(o.Tags),
		}
		if err := impl.TaskItemStorer.Create(sessCtx, newti); err != nil {
			impl.Logger.Error("create error",
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("new task created for unassign associate operation",
			slog.Any("order_id", o.ID),
			slog.Any("orderWJID", o.WJID),
			slog.Any("task_id", newti.ID))

		//
		// Attach latest task item to order.
		//

		// Remove the associate from the work order.
		o.AssociateID = primitive.NilObjectID
		o.AssociatePublicID = 0
		o.AssociateOrganizationName = ""
		o.AssociateOrganizationType = 0
		o.AssociateFirstName = ""
		o.AssociateLastName = ""
		o.AssociateName = ""
		o.AssociateLexicalName = ""
		o.AssociateGender = 0
		o.AssociateGenderOther = ""
		o.AssociateBirthdate = time.Time{}
		o.AssociateEmail = ""
		o.AssociatePhone = ""
		o.AssociatePhoneType = 0
		o.AssociatePhoneExtension = ""
		o.AssociateOtherPhone = ""
		o.AssociateOtherPhoneExtension = ""
		o.AssociateOtherPhoneType = 0
		o.AssociateFullAddressWithoutPostalCode = ""
		o.AssociateFullAddressURL = ""
		o.AssociateTags = make([]*o_s.OrderTag, 0)
		o.AssociateSkillSets = make([]*o_s.OrderSkillSet, 0)
		o.AssociateInsuranceRequirements = make([]*o_s.OrderInsuranceRequirement, 0)
		o.AssociateVehicleTypes = make([]*o_s.OrderVehicleType, 0)
		o.AssociateTaxID = ""
		o.AssociateServiceFeeID = primitive.NilObjectID
		o.AssociateServiceFeeName = ""
		o.AssociateServiceFeePercentage = 0
		o.LatestPendingTaskID = newti.ID
		o.LatestPendingTaskTitle = newti.Title
		o.LatestPendingTaskDescription = newti.Description
		o.LatestPendingTaskDueDate = newti.DueDate
		o.LatestPendingTaskType = newti.Type
		o.AssignmentDate = time.Time{} // Set empty

		// Meta
		o.Status = o_s.OrderStatusNew
		o.ModifiedAt = time.Now()
		o.ModifiedByUserID = userID
		o.ModifiedByUserName = userName
		o.ModifiedFromIPAddress = ipAddress

		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("database update by id error",
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("task added to order for unassign associate operation",
			slog.Any("task_id", newti.ID),
			slog.Any("order_id", o.ID))

		//
		// Create the comment.
		//

		commentContent := "[UNASSIGNING ACTION] " + o_s.OrderUnassignedReasonToLabels[req.Reason]

		comment := &comment_s.Comment{
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
			Content:               commentContent,
			Status:                comment_s.CommentStatusActive,
			BelongsTo:             comment_s.BelongsToOrder,
			OrderID:               o.ID,
			OrderWJID:             o.WJID,
			OrderTenantIDWithWJID: fmt.Sprintf("%v_%v", o.TenantID.Hex(), o.WJID),
		}
		if err := impl.CommentStorer.Create(sessCtx, comment); err != nil {
			impl.Logger.Error("database create error", slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("created comment because of unassign associate operation",
			slog.Any("comment_id", comment.ID),
			slog.String("content", commentContent),
			slog.Any("order_id", o.ID))

		//
		// Create the order comment.
		//

		ccomment := &o_s.OrderComment{
			ID:                    comment.ID,
			OrderID:               o.ID,
			OrderWJID:             o.WJID,
			OrderTenantIDWithWJID: fmt.Sprintf("%v_%v", o.TenantID.Hex(), o.WJID),
			TenantID:              tid,
			CreatedByUserID:       userID,
			CreatedByUserName:     userName,
			CreatedAt:             time.Now(),
			CreatedFromIPAddress:  ipAddress,
			ModifiedByUserID:      userID,
			ModifiedByUserName:    userName,
			ModifiedAt:            time.Now(),
			ModifiedFromIPAddress: ipAddress,
			Content:               commentContent,
			Status:                comment_s.CommentStatusActive,
		}

		// Add our comment to the comments.
		o.ModifiedByUserID = userID
		o.ModifiedAt = time.Now()
		o.Comments = append(o.Comments, ccomment)

		impl.Logger.Debug("comment",
			slog.Any("comment_json", ccomment))

		// Save to the database the modified order.
		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("database update by id error", slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("attached comment to order for unassign associate operation",
			slog.Any("task_id", newti.ID),
			slog.Any("order_id", o.ID))

		impl.Logger.Debug("finished transaction in unassign associate operation",
			slog.Any("order_id", req.OrderID))

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

	impl.Logger.Debug("completed unassign associate operation",
		slog.Any("order_id", req.OrderID))

	return result.(*o_s.Order), nil
}
