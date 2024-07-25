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

type OrderOperationCloseRequest struct {
	OrderID            primitive.ObjectID `bson:"order_id" json:"order_id"`
	WasCompleted       uint64             `bson:"was_completed" json:"was_completed"`
	Reason             int8               `bson:"reason" json:"reason"`
	ReasonOther        string             `bson:"reason_other" json:"reason_other"`
	CompletionDate     time.Time          `bson:"completion_date" json:"completion_date"`
	DescribeTheComment string             `bson:"describe_the_comment" json:"describe_the_comment"`
	Visits             int8               `bson:"visits" json:"visits"`
}

func (impl *OrderControllerImpl) validateOperationCloseRequest(ctx context.Context, dirtyData *OrderOperationCloseRequest) error {
	e := make(map[string]string)

	if dirtyData.OrderID.IsZero() {
		e["order_id"] = "missing value"
	}

	if dirtyData.WasCompleted == 0 {
		e["was_completed"] = "missing value"
	}
	if dirtyData.WasCompleted == 1 {
		if dirtyData.CompletionDate.IsZero() {
			e["completion_date"] = "missing value"
		}
		if dirtyData.Visits <= 0 {
			e["visits"] = "missing value"
		}
	}
	if dirtyData.WasCompleted == 2 {
		if dirtyData.Reason == 0 {
			e["reason"] = "missing value"
		} else if dirtyData.Reason == 1 {
			if dirtyData.ReasonOther == "" {
				e["reason_other"] = "missing value"
			}
		}
	}
	if dirtyData.DescribeTheComment == "" {
		e["describe_the_comment"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *OrderControllerImpl) Close(ctx context.Context, req *OrderOperationCloseRequest) (*o_s.Order, error) {
	//
	// Get variables from our user authenticated session.
	//

	tid, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	role, _ := ctx.Value(constants.SessionUserRole).(int8)
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	userRole, _ := ctx.Value(constants.SessionUserRole).(int8)
	userHasStaffRole, _ := ctx.Value(constants.SessionUserHasStaffRole).(bool)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	switch role {
	case u_s.UserRoleExecutive, u_s.UserRoleManagement, u_s.UserRoleFrontlineStaff:
		break
	default:
		impl.Logger.Error("you do not have permission to create a client comment")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to create a client comment")
	}

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateOperationCloseRequest(ctx, req); err != nil {
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

			impl.Logger.Debug("latest pending task item closed for order close operation",
				slog.Any("task_item_id", ti.ID))
		}

		////
		//// Begin making modifications to order.
		////

		if req.WasCompleted == 1 { // 1=YES
			o.CompletionDate = req.CompletionDate
			o.Visits = req.Visits
			o.Status = o_s.OrderStatusCompletedButUnpaid
		} else if req.WasCompleted == 2 { // 2=NO
			o.Status = o_s.OrderStatusCancelled
			o.ClosingReasonComment = req.DescribeTheComment
			o.ClosingReason = req.Reason
			o.ClosingReasonOther = req.ReasonOther
		}
		o.LatestPendingTaskID = primitive.NilObjectID
		o.LatestPendingTaskTitle = ""
		o.LatestPendingTaskDescription = ""
		o.LatestPendingTaskDueDate = time.Time{}
		o.ModifiedAt = time.Now()
		o.ModifiedByUserID = userID
		o.ModifiedByUserName = userName
		o.ModifiedFromIPAddress = ipAddress

		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("database update by id error",
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("order updated for order close operation",
			slog.Any("status", o.Status),
			slog.Any("order_id", o.ID))

		if req.WasCompleted == 1 { // Hard-coded value from frontend. (1=YES)
			impl.Logger.Debug("order was completed",
				slog.Any("order_id", o.ID))

			////
			//// Create a new task.
			////

			title := "Survey"
			if o.IsOngoing {
				title = "Survey / Ongoing"
			}
			description := "Please call up the customer and perform the evaluation survey."
			dueDate := time.Now().AddDate(0, 0, 7) // Add 7 day. Rational: We want to ask the customer after 7 days AFTER the client meeting data.
			typeId := int8(ti_s.TaskItemTypeFollowUpDidCustomerReviewAssociateAfterJob)

			newTask := &ti_s.TaskItem{
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
				OrderSkillSets:                        toTaskItemSkillSetsFromOrderSkillSets(o.SkillSets),
				OrderTags:                             toTaskItemTagsFromOrderTags(o.Tags),
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
				CustomerTags:                          toTaskItemTagsFromOrderTags(o.CustomerTags),
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
				AssociateTags:                         toTaskItemTagsFromOrderTags(o.AssociateTags),
				AssociateSkillSets:                    toTaskItemSkillSetsFromOrderSkillSets(o.AssociateSkillSets),
				AssociateInsuranceRequirements:        toTaskItemInsuranceRequirementsFromOrderInsuranceRequirements(o.AssociateInsuranceRequirements),
				AssociateVehicleTypes:                 toTaskItemVehicleTypesFromOrderVehicleTypes(o.AssociateVehicleTypes),
				AssociateServiceFeeID:                 o.AssociateServiceFeeID,
				AssociateServiceFeeName:               o.AssociateServiceFeeName,
				AssociateServiceFeePercentage:         o.AssociateServiceFeePercentage,
			}

			if err := impl.TaskItemStorer.Create(sessCtx, newTask); err != nil {
				impl.Logger.Error("task creation error",
					slog.Any("task_item_id", newTask.ID),
					slog.Any("order_id", newTask.OrderID),
					slog.Any("order_id", newTask.OrderID),
					slog.Any("order_wjid", newTask.OrderWJID),
					slog.Any("error", err))
				return nil, err
			}

			impl.Logger.Debug("new task item created for order completion operation",
				slog.Any("task_item_id", newTask.ID),
				slog.Any("order_id", newTask.OrderID),
				slog.Any("order_wjid", newTask.OrderWJID),
				slog.Any("error", err))

			////
			//// Update existing order.
			////

			o.CompletionDate = req.CompletionDate
			o.Status = o_s.OrderStatusCompletedButUnpaid
			o.Visits = req.Visits
			o.LatestPendingTaskID = newTask.ID
			o.LatestPendingTaskTitle = newTask.Title
			o.LatestPendingTaskDescription = newTask.Description
			o.LatestPendingTaskDueDate = newTask.DueDate
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

			impl.Logger.Debug("updated order because of order close operation",
				slog.Any("task_item_id", newTask.ID),
				slog.Any("order_id", newTask.OrderID),
				slog.Any("order_wjid", newTask.OrderWJID))

			if req.WasCompleted == 2 { // Hard-coded value from frontend. (2=NO)
				impl.Logger.Debug("order was not complete of order close operation",
					slog.Any("order_id", newTask.OrderID))
			}

			////
			//// Create comment.
			////

			// If the user has submitted a comment for the job
			// then we will include it.
			if req.DescribeTheComment != "" {
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
					Content:               fmt.Sprintf("[CLOSE ACTION] %v", req.DescribeTheComment),
					Status:                com_s.CommentStatusActive,
				}
				if err := impl.CommentStorer.Create(sessCtx, com); err != nil {
					impl.Logger.Error("comment creation error",
						slog.Any("order_id", req.OrderID),
						slog.Any("error", err))
					return nil, err
				}

				impl.Logger.Debug("comment created for order close operation",
					slog.Any("order_id", req.OrderID),
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
						slog.Any("order_id", req.OrderID),
						slog.Any("error", err))
					return nil, err
				}

				// Update the comment.
				com.BelongsTo = com_s.BelongsToOrder
				com.OrderID = o.ID
				com.OrderWJID = o.WJID
				if err := impl.CommentStorer.UpdateByID(sessCtx, com); err != nil {
					impl.Logger.Error("comment update error",
						slog.Any("order_id", req.OrderID),
						slog.Any("error", err))
					return nil, err
				}

				impl.Logger.Debug("order comment created for order close operation",
					slog.Any("order_id", req.OrderID),
					slog.Any("comment_id", com.ID))
			}
		}

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
