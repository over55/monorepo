package controller

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	act_s "github.com/over55/monorepo/cloud/workery-backend/app/activitysheet/datastore"
	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	com_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type TaskItemOperationAssignAssociateRequestIDO struct {
	TaskItemID        primitive.ObjectID `bson:"task_item_id" json:"task_item_id"`
	AssociateID       primitive.ObjectID `bson:"associate_id" json:"associate_id"`
	Status            int8               `bson:"status" json:"status"`
	HowWasJobAccepted int8               `bson:"how_was_job_accepted" json:"how_was_job_accepted"`
	WhyJobDeclined    int8               `bson:"why_job_declined" json:"why_job_declined"`
	PredefinedComment string             `bson:"predefined_comment" json:"predefined_comment"`
	Comment           string             `bson:"comment" json:"comment"` // Note: This is optional.
}

func (impl *TaskItemControllerImpl) validateAssignAssociateOperationRequest(ctx context.Context, dirtyData *TaskItemOperationAssignAssociateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.TaskItemID.IsZero() {
		e["task_item_id"] = "missing value"
	}
	if dirtyData.AssociateID.IsZero() {
		e["associate_id"] = "missing value"
	}
	if dirtyData.Status == 0 {
		e["status"] = "missing value"
	} else {
		if dirtyData.Status != act_s.ActivitySheetStatusAccepted && dirtyData.Status != act_s.ActivitySheetStatusDeclined {
			e["status"] = "invalid value"
		} else {
			if dirtyData.Status == act_s.ActivitySheetStatusAccepted && dirtyData.HowWasJobAccepted == 0 {
				e["how_was_job_accepted"] = "missing value"
			}
			if dirtyData.Status == act_s.ActivitySheetStatusDeclined && dirtyData.WhyJobDeclined == 0 {
				e["why_job_declined"] = "missing value"
			}
		}
	}
	if dirtyData.PredefinedComment == "" {
		e["predefined_comment"] = "missing value"
	}
	// Note: `Comment` is optional and hence commented out.
	// if dirtyData.Comment == "" {
	// 	e["comment"] = "missing value"
	// }

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *TaskItemControllerImpl) AssignAssociateOperation(ctx context.Context, req *TaskItemOperationAssignAssociateRequestIDO) (*ti_s.TaskItem, error) {
	////
	//// Perform validation and security checks.
	////

	if err := impl.validateAssignAssociateOperationRequest(ctx, req); err != nil {
		impl.Logger.Warn("validation error",
			slog.Any("task_item_id", req.TaskItemID),
			slog.Any("error", err))
		return nil, err
	}

	// Extract from our session the following data.
	orgID, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userRole, _ := ctx.Value(constants.SessionUserRole).(int8)
	userHasStaffRole, _ := ctx.Value(constants.SessionUserHasStaffRole).(bool)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	// Apply protection based on ownership and role.
	if !userHasStaffRole {
		impl.Logger.Error("authenticated user is not staff role error",
			slog.Any("task_item_id", req.TaskItemID),
			slog.Any("user_role", userRole),
			slog.Any("user_has_staff_role", userHasStaffRole),
			slog.Any("user_id", userID))
		return nil, httperror.NewForForbiddenWithSingleField("message", "you role does not grant you access to this")
	}

	////
	//// Lock this task until completed (including errors as well).
	////

	impl.Kmutex.Lock(req.TaskItemID.Hex())
	defer impl.Kmutex.Unlock(req.TaskItemID.Hex())

	////
	//// Start the transaction.
	////

	session, err := impl.DbClient.StartSession()
	if err != nil {
		impl.Logger.Warn("start session error",
			slog.Any("task_item_id", req.TaskItemID),
			slog.Any("error", err))
		return nil, err
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {

		////
		//// Get related data.
		////

		// Get task items.

		ti, err := impl.TaskItemStorer.GetByID(sessCtx, req.TaskItemID)
		if err != nil {
			impl.Logger.Error("get task item by id error",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("error", err))
			return nil, err
		}
		if ti == nil {
			impl.Logger.Error("task does not exist error",
				slog.Any("task_item_id", req.TaskItemID))
			return nil, httperror.NewForBadRequestWithSingleField("task_item_id", fmt.Sprintf("task does not exist for %v", req.TaskItemID))
		}
		if ti.IsClosed {
			impl.Logger.Error("task is closed error",
				slog.Any("task_item_id", req.TaskItemID))
			return nil, httperror.NewForBadRequestWithSingleField("task_item_id", "task is closed")
		}

		// Get associates.

		a, err := impl.AssociateStorer.GetByID(sessCtx, req.AssociateID)
		if err != nil {
			impl.Logger.Error("get associate by id error",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("associate_id", req.AssociateID),
				slog.Any("error", err))
			return nil, err
		}
		if a == nil {
			impl.Logger.Error("associate does not exist error",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("associate_id", req.AssociateID))
			return nil, httperror.NewForBadRequestWithSingleField("associate_id", fmt.Sprintf("associate does not exist for %v", req.AssociateID))
		}
		if a.Status != a_s.AssociateStatusActive {
			impl.Logger.Error("associate is not active error",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("associate_id", req.AssociateID))
			return nil, httperror.NewForBadRequestWithSingleField("associate_id", "associate is not active")
		}

		// Get work order.

		o, err := impl.OrderStorer.GetByID(sessCtx, ti.OrderID)
		if err != nil {
			impl.Logger.Error("get order by id error",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("order_id", ti.OrderID),
				slog.Any("error", err))
			return nil, err
		}
		if o == nil {
			impl.Logger.Error("order does not exist error",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("order_id", ti.OrderID))
			return nil, httperror.NewForBadRequestWithSingleField("order_id", fmt.Sprintf("order does not exist for %v", ti.OrderID))
		}

		// Get customer.

		c, err := impl.CustomerStorer.GetByID(sessCtx, o.CustomerID)
		if err != nil {
			impl.Logger.Error("get customer by id error",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("customer_id", o.CustomerID),
				slog.Any("error", err))
			return nil, err
		}
		if c == nil {
			impl.Logger.Error("customer does not exist error",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("customer_id", o.CustomerID))
			return nil, httperror.NewForBadRequestWithSingleField("customer_id", fmt.Sprintf("customer does not exist for %v", o.CustomerID))
		}
		if c.Status != c_s.CustomerStatusActive {
			impl.Logger.Error("customer is not active error",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("customer_id", o.CustomerID))
			return nil, httperror.NewForBadRequestWithSingleField("customer_id", "customer is not active")
		}

		////
		//// Create activity sheet.
		////

		as := &act_s.ActivitySheet{
			ID:                    primitive.NewObjectID(),
			OrderID:               o.ID,
			OrderWJID:             o.WJID,
			AssociateID:           a.ID,
			AssociateName:         a.Name,
			AssociateLexicalName:  a.LexicalName,
			PredefinedComment:     req.PredefinedComment,
			Comment:               req.Comment,
			CreatedAt:             time.Now(),
			CreatedByUserID:       userID,
			CreatedByUserName:     userName,
			CreatedFromIPAddress:  ipAddress,
			ModifiedAt:            time.Now(),
			ModifiedByUserID:      userID,
			ModifiedByUserName:    userName,
			ModifiedFromIPAddress: ipAddress,
			Status:                req.Status, // Either accepted or rejected...
			Type:                  a.Type,     // Associate `type` and activity sheet `type` values are exact.
			TenantID:              orgID,
			OrderTenantIDWithWJID: o.TenantIDWithWJID,
		}

		if err := impl.ActivitySheetStorer.Create(sessCtx, as); err != nil {
			impl.Logger.Error("activity sheet creation error",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("activity_sheet_id", as.ID),
				slog.Any("order_id", ti.OrderID),
				slog.Any("order_id", ti.OrderID),
				slog.Any("order_wjid", ti.OrderWJID),
				slog.Any("error", err))
			return nil, err
		}
		impl.Logger.Debug("activity sheet created because of assign associate operation",
			slog.Any("task_item_id", req.TaskItemID),
			slog.Any("activity_sheet_id", as.ID),
			slog.Any("order_id", ti.OrderID),
			slog.Any("order_wjid", ti.OrderWJID),
			slog.Any("associate_id", req.AssociateID))

		////
		//// Process activity sheet for `accepted` state.
		////

		// Close current task item.
		ti.IsClosed = true
		ti.ModifiedAt = time.Now()
		ti.ModifiedByUserID = userID
		ti.ModifiedByUserName = userName
		ti.ModifiedFromIPAddress = ipAddress
		if err := impl.TaskItemStorer.UpdateByID(sessCtx, ti); err != nil {
			impl.Logger.Error("task item update error",
				slog.Any("task_item_id", req.TaskItemID))
			return nil, err
		}

		impl.Logger.Debug("task item closed for assign associate operation",
			slog.Any("task_item_id", req.TaskItemID))

		var newTask *ti_s.TaskItem
		if req.Status == act_s.ActivitySheetStatusAccepted {
			////
			//// Create a new task.
			////

			title := "Order Completion"
			if o.IsOngoing {
				title = "Order Completion / Ongoing"
			}
			description := "Please call up the associate and verify the order completion."
			dueDate := time.Now().AddDate(0, 0, 7)                           // Add 7 day. Rational: We want to ask the customer after 7 days AFTER the client meeting data.
			typeId := int8(ti_s.TaskItemTypeFollowUpDidAssociateCompleteJob) // A.K.A. "Order Completion" type.
			newTask = &ti_s.TaskItem{
				ID:                                    primitive.NewObjectID(),
				TenantID:                              orgID,
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
				CustomerFullAddressWithoutPostalCode:  c.FullAddressWithoutPostalCode,
				CustomerFullAddressURL:                c.FullAddressURL,
				CustomerTags:                          toTaskItemTagsFromCustomerTags(c.Tags),
				AssociateID:                           a.ID,
				AssociatePublicID:                     a.PublicID,
				AssociateFirstName:                    a.FirstName,
				AssociateLastName:                     a.LastName,
				AssociateName:                         a.Name,
				AssociateLexicalName:                  a.LexicalName,
				AssociateGender:                       a.Gender,
				AssociateGenderOther:                  a.GenderOther,
				AssociateBirthdate:                    a.BirthDate,
				AssociateEmail:                        a.Email,
				AssociatePhone:                        a.Phone,
				AssociatePhoneType:                    a.PhoneType,
				AssociatePhoneExtension:               a.PhoneExtension,
				AssociateOtherPhone:                   a.OtherPhone,
				AssociateOtherPhoneExtension:          a.OtherPhoneExtension,
				AssociateOtherPhoneType:               a.OtherPhoneType,
				AssociateFullAddressWithoutPostalCode: a.FullAddressWithoutPostalCode,
				AssociateFullAddressURL:               a.FullAddressURL,
				AssociateTags:                         toTaskItemTagsFromAssociateTags(a.Tags),
				AssociateSkillSets:                    toTaskItemSkillSetsFromAssociateSkillSets(a.SkillSets),
				AssociateInsuranceRequirements:        toTaskItemInsuranceRequirementsFromAssociateInsuranceRequirements(a.InsuranceRequirements),
				AssociateVehicleTypes:                 toTaskItemVehicleTypesFromAssociateVehicleTypes(a.VehicleTypes),
				AssociateTaxID:                        a.TaxID,
				AssociateServiceFeeID:                 a.ServiceFeeID,
				AssociateServiceFeeName:               a.ServiceFeeName,
				AssociateServiceFeePercentage:         a.ServiceFeePercentage,
			}

			if err := impl.TaskItemStorer.Create(sessCtx, newTask); err != nil {
				impl.Logger.Error("task creation error",
					slog.Any("task_item_id", req.TaskItemID),
					slog.Any("new_task_item_id", newTask.ID),
					slog.Any("order_id", ti.OrderID),
					slog.Any("order_id", ti.OrderID),
					slog.Any("order_wjid", ti.OrderWJID),
					slog.Any("error", err))
				return nil, err
			}

			impl.Logger.Debug("new task item created for order completion operation",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("new_task_item_id", newTask.ID),
				slog.Any("order_id", ti.OrderID),
				slog.Any("order_wjid", ti.OrderWJID),
				slog.Any("associate_id", req.AssociateID),
				slog.Any("error", err))

			////
			//// Update existing order.
			////

			// # Updated the start date to either right now or the agreed upon
			// # date between associate and client.
			o.StartDate = time.Now()

			// Generic update.
			o.Status = o_s.OrderStatusInProgress
			o.AssociateID = a.ID
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
			o.AssociateTaxID = a.TaxID
			o.AssociateServiceFeeID = a.ServiceFeeID
			o.AssociateServiceFeeName = a.ServiceFeeName
			o.AssociateServiceFeePercentage = a.ServiceFeePercentage
			o.LatestPendingTaskID = newTask.ID
			o.LatestPendingTaskTitle = newTask.Title
			o.LatestPendingTaskDescription = newTask.Description
			o.LatestPendingTaskDueDate = newTask.DueDate
			o.LatestPendingTaskType = newTask.Type
			o.AssignmentDate = time.Now()
			o.ModifiedAt = time.Now()
			o.ModifiedByUserID = userID
			o.ModifiedByUserName = userName
			o.ModifiedFromIPAddress = ipAddress

			if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
				impl.Logger.Error("task creation error",
					slog.Any("task_item_id", req.TaskItemID),
					slog.Any("new_task_item_id", newTask.ID),
					slog.Any("order_id", ti.OrderID),
					slog.Any("order_wjid", ti.OrderWJID),
					slog.Any("error", err))
				return nil, err
			}

		} else if req.Status == act_s.ActivitySheetStatusDeclined {
		} else {
			err := fmt.Errorf("unacceptable status value: %v", req.Status)
			impl.Logger.Error("task creation error",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("error", err))
			return nil, err
		}

		////
		//// Create a new comment.
		////

		com := &com_s.Comment{
			ID:                    primitive.NewObjectID(),
			TenantID:              orgID,
			CreatedAt:             time.Now(),
			CreatedByUserID:       userID,
			CreatedByUserName:     userName,
			CreatedFromIPAddress:  ipAddress,
			ModifiedAt:            time.Now(),
			ModifiedByUserID:      userID,
			ModifiedByUserName:    userName,
			ModifiedFromIPAddress: ipAddress,
			Content:               req.PredefinedComment + " " + req.Comment,
			Status:                com_s.CommentStatusActive,
		}
		if err := impl.CommentStorer.Create(sessCtx, com); err != nil {
			impl.Logger.Error("comment creation error",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("comment created for assign associate operation",
			slog.Any("task_item_id", req.TaskItemID),
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
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("error", err))
			return nil, err
		}

		// Update the comment.
		com.BelongsTo = com_s.BelongsToOrder
		com.OrderID = o.ID
		com.OrderWJID = o.WJID
		if err := impl.CommentStorer.UpdateByID(sessCtx, com); err != nil {
			impl.Logger.Error("comment update error",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("order comment created for assign associate operation",
			slog.Any("task_item_id", req.TaskItemID),
			slog.Any("order_id", ti.OrderID),
			slog.Any("order_wjid", ti.OrderWJID),
			slog.Any("comment_id", com.ID))

		return ti, nil
	} // end transaction function.

	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		impl.Logger.Error("transaction error",
			slog.Any("task_item_id", req.TaskItemID),
			slog.Any("error", err))
		return nil, err
	}
	return result.(*ti_s.TaskItem), nil
}
