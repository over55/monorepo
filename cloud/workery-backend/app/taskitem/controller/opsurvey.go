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
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type TaskItemOperationSurveyRequestIDO struct {
	TaskItemID                        primitive.ObjectID `bson:"task_item_id" json:"task_item_id"`
	WasSurveyConducted                int8               `bson:"was_survey_conducted" json:"was_survey_conducted"`
	NoSurveyConductedReason           int8               `bson:"no_survey_conducted_reason" json:"no_survey_conducted_reason"`
	NoSurveyConductedReasonOther      string             `bson:"no_survey_conducted_reason_other" json:"no_survey_conducted_reason_other"`
	Comment                           string             `bson:"comment" json:"comment"`
	WasJobSatisfactory                int8               `bson:"was_job_satisfactory" json:"was_job_satisfactory"`
	WasJobFinishedOnTimeAndOnBudget   int8               `bson:"was_job_finished_on_time_and_on_budget" json:"was_job_finished_on_time_and_on_budget"`
	WasAssociatePunctual              int8               `bson:"was_associate_punctual" json:"was_associate_punctual"`
	WasAssociateProfessional          int8               `bson:"was_associate_professional" json:"was_associate_professional"`
	WouldCustomerReferOurOrganization int8               `bson:"would_customer_refer_our_organization" json:"would_customer_refer_our_organization"`
}

func (impl *TaskItemControllerImpl) validateSurveyOperationRequest(ctx context.Context, dirtyData *TaskItemOperationSurveyRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.TaskItemID.IsZero() {
		e["task_item_id"] = "missing value"
	}
	if dirtyData.WasSurveyConducted == 0 {
		e["was_survey_conducted"] = "missing value"
	} else if dirtyData.WasSurveyConducted == 1 {
		if dirtyData.WasJobSatisfactory == 0 {
			e["was_job_satisfactory"] = "missing value"
		}
		if dirtyData.WasJobFinishedOnTimeAndOnBudget == 0 {
			e["was_job_finished_on_time_and_on_budget"] = "missing value"
		}
		if dirtyData.WasAssociatePunctual == 0 {
			e["was_associate_punctual"] = "missing value"
		}
		if dirtyData.WouldCustomerReferOurOrganization == 0 {
			e["would_customer_refer_our_organization"] = "missing value"
		}
		if dirtyData.WasSurveyConducted == 0 {
			e["was_survey_conducted"] = "missing value"
		}
	} else if dirtyData.WasSurveyConducted == 2 {
		if dirtyData.NoSurveyConductedReason == 0 {
			e["no_survey_conducted_reason"] = "missing value"
		}
		if dirtyData.NoSurveyConductedReasonOther == "" {
			e["no_survey_conducted_reason_other"] = "missing value"
		}
		if dirtyData.Comment == "" {
			e["comment"] = "missing value"
		}
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *TaskItemControllerImpl) SurveyOperation(ctx context.Context, req *TaskItemOperationSurveyRequestIDO) (*ti_s.TaskItem, error) {
	////
	//// Perform validation and security checks.
	////

	if err := impl.validateSurveyOperationRequest(ctx, req); err != nil {
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

		////
		//// Close the current task.
		////

		// Close current task item.
		ti.IsClosed = true
		ti.Status = ti_s.TaskItemStatusArchived
		ti.ClosingReason = int8(req.NoSurveyConductedReason)
		ti.ClosingReasonOther = req.NoSurveyConductedReasonOther
		ti.ModifiedAt = time.Now()
		ti.ModifiedByUserID = userID
		ti.ModifiedByUserName = userName
		ti.ModifiedFromIPAddress = ipAddress
		if err := impl.TaskItemStorer.UpdateByID(sessCtx, ti); err != nil {
			impl.Logger.Error("task item update error",
				slog.Any("task_item_id", req.TaskItemID))
			return nil, err
		}

		impl.Logger.Debug("task item closed per survey operation",
			slog.Any("task_item_id", req.TaskItemID))

		////
		//// Update existing order.
		////

		// # Updated the survey.
		o.Score = 0
		if req.WasJobSatisfactory == 1 {
			o.Score += 1
		}
		if req.WasJobFinishedOnTimeAndOnBudget == 1 {
			o.Score += 1
		}
		if req.WasAssociatePunctual == 1 {
			o.Score += 1
		}
		if req.WasAssociateProfessional == 1 {
			o.Score += 1
		}
		if req.WouldCustomerReferOurOrganization == 1 {
			o.Score += 1
		}

		// Generic update (clear any latest pending tasks).
		o.LatestPendingTaskID = primitive.NilObjectID
		o.LatestPendingTaskTitle = ""
		o.LatestPendingTaskDescription = ""
		o.LatestPendingTaskDueDate = time.Time{}
		o.LatestPendingTaskType = 0
		o.ModifiedAt = time.Now()
		o.ModifiedByUserID = userID
		o.ModifiedByUserName = userName
		o.ModifiedFromIPAddress = ipAddress

		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("order update error",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("order_id", ti.OrderID),
				slog.Any("order_wjid", ti.OrderWJID),
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("updated order per survey operation",
			slog.Any("task_item_id", req.TaskItemID),
			slog.Any("order_id", ti.OrderID),
			slog.Any("order_wjid", ti.OrderWJID))

		////
		//// Create a new comment.
		////

		var comment string = "Survey was completed"
		if req.WasSurveyConducted == 2 {
			comment = req.Comment
		}
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
			Content:               fmt.Sprintf("[SURVEY ACTION] %v", comment),
			Status:                com_s.CommentStatusActive,
		}
		if err := impl.CommentStorer.Create(sessCtx, com); err != nil {
			impl.Logger.Error("comment creation error",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("comment created per survey operation",
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

		impl.Logger.Debug("order comment created per survey operation",
			slog.Any("task_item_id", req.TaskItemID),
			slog.Any("order_id", ti.OrderID),
			slog.Any("order_wjid", ti.OrderWJID),
			slog.Any("comment_id", com.ID))

		////
		//// Exit our transaction successfully.
		////

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
