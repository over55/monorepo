package controller

import (
	"context"
	"fmt"
	"log/slog"
	"math"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	com_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

const (
	TaskItemPaymentStatusPaid   = 1
	TaskItemPaymentStatusUnpaid = 2
)

type TaskItemOperationOrderCompletionRequestIDO struct {
	// Step 1 of 5.
	TaskItemID primitive.ObjectID `bson:"task_item_id" json:"task_item_id"`

	// Step 2 of 5.
	WasCompleted            int8      `bson:"was_completed" json:"was_completed"`
	Reason                  int8      `bson:"reason" json:"reason"`
	ReasonOther             string    `bson:"reason_other" json:"reason_other"`
	ReasonComment           string    `bson:"reason_comment" json:"reason_comment"`
	Visits                  int8      `bson:"visits" json:"visits"`
	CompletionDate          string    `bson:"completion_date" json:"completion_date"`
	CompletionDateFormatted time.Time `bson:"-" json:"-"`
	ClosingReasonComment    string    `bson:"closing_reason_comment" json:"closing_reason_comment"`

	// Step 3 of 5.
	HasInputtedFinancials         int8               `bson:"has_inputted_financials" json:"has_inputted_financials"`
	InvoicePaidTo                 int8               `bson:"invoice_paid_to" json:"invoice_paid_to"`
	PaymentStatus                 int8               `bson:"payment_status" json:"payment_status"`
	InvoiceDate                   string             `bson:"invoice_date" json:"invoice_date"`
	InvoiceDateFormatted          time.Time          `bson:"-" json:"-"`
	InvoiceIDs                    string             `bson:"invoice_ids" json:"invoice_ids"`
	InvoiceQuotedLabourAmount     float64            `bson:"invoice_quoted_labour_amount" json:"invoice_quoted_labour_amount"`
	InvoiceQuotedMaterialAmount   float64            `bson:"invoice_quoted_material_amount" json:"invoice_quoted_material_amount"`
	InvoiceQuotedOtherCostsAmount float64            `bson:"invoice_quoted_other_costs_amount" json:"invoice_quoted_other_costs_amount"`
	InvoiceTotalQuoteAmount       float64            `bson:"invoice_total_quote_amount" json:"invoice_total_quote_amount"`
	InvoiceLabourAmount           float64            `bson:"invoice_labour_amount" json:"invoice_labour_amount"`
	InvoiceMaterialAmount         float64            `bson:"invoice_material_amount" json:"invoice_material_amount"`
	InvoiceOtherCostsAmount       float64            `bson:"invoice_other_costs_amount" json:"invoice_other_costs_amount"`
	InvoiceTaxAmount              float64            `bson:"invoice_tax_amount" json:"invoice_tax_amount"`
	InvoiceIsCustomTaxAmount      bool               `bson:"invoice_is_custom_tax_amount" json:"invoice_is_custom_tax_amount"`
	InvoiceTotalAmount            float64            `bson:"invoice_total_amount" json:"invoice_total_amount"`
	InvoiceDepositAmount          float64            `bson:"invoice_deposit_amount" json:"invoice_deposit_amount"`
	InvoiceAmountDue              float64            `bson:"invoice_amount_due" json:"invoice_amount_due"`
	InvoiceServiceFeeID           primitive.ObjectID `bson:"invoice_service_fee_id" json:"invoice_service_fee_id"`
	// InvoiceServiceFeePercentage   float64            `bson:"invoice_service_fee_percentage" json:"invoice_service_fee_percentage"`
	// InvoiceServiceFeeOther        string             `bson:"invoice_service_fee_other" json:"invoice_service_fee_other"`
	// IsInvoiceServiceFeeOther              bool               `bson:"is_invoice_service_fee_other" json:"is_invoice_service_fee_other"`
	InvoiceServiceFeeAmount               float64   `bson:"invoice_service_fee_amount" json:"invoice_service_fee_amount"`
	InvoiceServiceFeePaymentDate          string    `bson:"invoice_service_fee_payment_date" json:"invoice_service_fee_payment_date"`
	InvoiceServiceFeePaymentDateFormatted time.Time `bson:"-" json:"-"`
	PaymentMethods                        []int8    `bson:"payment_methods" json:"payment_methods,omitempty"`
	InvoiceActualServiceFeeAmountPaid     float64   `bson:"invoice_actual_service_fee_amount_paid" json:"invoice_actual_service_fee_amount_paid"`
	InvoiceBalanceOwingAmount             float64   `bson:"invoice_balance_owing_amount" json:"invoice_balance_owing_amount"`

	// Step 4 of 5.
	Comment string `bson:"comment" json:"comment"`
}

func (impl *TaskItemControllerImpl) validateOrderCompletionOperationRequest(ctx context.Context, dirtyData *TaskItemOperationOrderCompletionRequestIDO) error {
	e := make(map[string]string)

	// Step 1 of 5.
	if dirtyData.TaskItemID.IsZero() {
		e["task_item_id"] = "missing value"
	}

	// Step 2 of 5.
	if dirtyData.WasCompleted == 0 {
		e["was_completed"] = "missing value"
	}
	if dirtyData.WasCompleted == 1 {
		if dirtyData.CompletionDate == "" {
			e["completion_date"] = "missing value"
		} else {
			if dirtyData.CompletionDateFormatted.After(time.Now()) {
				e["completion_date"] = "cannot be in the future"
			}
		}
		if dirtyData.ReasonComment == "" {
			e["reason_comment"] = "missing value"
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
		if dirtyData.ClosingReasonComment == "" {
			e["closing_reason_comment"] = "missing value"
		}
	}

	// Step 3 of 5.
	if dirtyData.HasInputtedFinancials == 0 {
		e["has_inputted_financials"] = "missing value"
	} else {
		if dirtyData.HasInputtedFinancials == 1 {
			if dirtyData.InvoicePaidTo == 0 {
				e["invoice_paid_to"] = "missing value"
			}
			if dirtyData.PaymentStatus == 0 {
				e["payment_status"] = "missing value"
			}
			if dirtyData.InvoiceDate == "" {
				e["invoice_date"] = "missing value"
			}
			if dirtyData.InvoiceIDs == "" {
				e["invoice_ids"] = "missing value"
			}
			// if dirtyData.InvoiceQuotedLabourAmount == 0 {
			// 	e["invoice_quoted_labour_amount"] = "missing value"
			// }
			// if dirtyData.InvoiceQuotedMaterialAmount == 0 {
			// 	e["invoice_quoted_material_amount"] = "missing value"
			// }
			// if dirtyData.InvoiceQuotedOtherCostsAmount == 0 {
			// 	e["invoice_quoted_other_costs_amount"] = "missing value"
			// }
			// if dirtyData.InvoiceTotalQuoteAmount == 0 {
			// 	e["invoice_total_quote_amount"] = "missing value"
			// }
			// if dirtyData.InvoiceLabourAmount == 0 {
			// 	e["invoice_labour_amount"] = "missing value"
			// }
			// if dirtyData.InvoiceMaterialAmount == 0 {
			// 	e["invoice_material_amount"] = "missing value"
			// }
			// if dirtyData.InvoiceOtherCostsAmount == 0 {
			// 	e["invoice_other_costs_amount"] = "missing value"
			// }
			// if dirtyData.InvoiceTaxAmount == 0 {
			// 	e["invoice_tax_amount"] = "missing value"
			// }
			// if dirtyData.InvoiceTotalAmount == 0 {
			// 	e["invoice_total_amount"] = "missing value"
			// }
			// if dirtyData.InvoiceDepositAmount == 0 {
			// 	e["invoice_deposit_amount"] = "missing value"
			// }
			// if dirtyData.InvoiceAmountDue == 0 {
			// 	e["invoice_amount_due"] = "missing value"
			// }
			if dirtyData.PaymentStatus == o_s.OrderStatusCompletedAndPaid {
				if dirtyData.InvoiceServiceFeeID.IsZero() {
					e["invoice_service_fee_id"] = "missing value"
				}
				if dirtyData.InvoiceServiceFeeAmount == 0 {
					e["invoice_service_fee_amount"] = "missing value"
				}
				if dirtyData.InvoiceServiceFeePaymentDate == "" {
					e["invoice_service_fee_payment_date"] = "missing value"
				}
				if dirtyData.InvoiceServiceFeePaymentDateFormatted.IsZero() {
					e["invoice_service_fee_payment_date"] = "missing value"
				}
				if dirtyData.InvoiceActualServiceFeeAmountPaid == 0 {
					e["invoice_actual_service_fee_amount_paid"] = "missing value"
				}
			}
			if len(dirtyData.PaymentMethods) == 0 {
				e["payment_methods"] = "missing value"
			}
			// InvoiceBalanceOwingAmount             float64   `bson:"invoice_balance_owing_amount" json:"invoice_balance_owing_amount"`
		}
	}

	// If any error(s) detected then return with an error.
	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *TaskItemControllerImpl) OrderCompletionOperation(ctx context.Context, req *TaskItemOperationOrderCompletionRequestIDO) (*ti_s.TaskItem, error) {
	////
	//// Perform validation and security checks.
	////

	if err := impl.validateOrderCompletionOperationRequest(ctx, req); err != nil {
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

		// Get orders.

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

		a, err := impl.AssociateStorer.GetByID(sessCtx, o.AssociateID)
		if err != nil {
			impl.Logger.Error("database order get by id error",
				slog.Any("error", err),
				slog.Any("associate_id", o.AssociateID),
				slog.Any("task_item_id", req.TaskItemID))
			return nil, err
		}
		if a == nil {
			impl.Logger.Error("associate does not exist for ordererror",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("associate_id", o.AssociateID))
			return nil, httperror.NewForBadRequestWithSingleField("associate_id",
				fmt.Sprintf("associate does not exist %v", o.AssociateID))
		}

		////
		//// Begin making modifications to order.
		////

		if req.WasCompleted == 1 {
			o.CompletionDate = req.CompletionDateFormatted
			o.Visits = req.Visits
			o.Status = o_s.OrderStatusCompletedButUnpaid
		} else if req.WasCompleted == 2 {
			o.Status = o_s.OrderStatusCancelled
			o.ClosingReasonComment = req.ClosingReasonComment
		} else {
			impl.Logger.Error("was completed is invalid",
				slog.Any("was_completed", req.WasCompleted))
			return nil, httperror.NewForBadRequestWithSingleField("was_completed", fmt.Sprintf("invalid was completed for value %v", req.WasCompleted))
		}

		if req.HasInputtedFinancials == 1 { // (1=YES)
			// BUGFIX: Round values (see: https://yourbasic.org/golang/round-float-2-decimal-places/).
			req.InvoiceServiceFeeAmount = math.Round(req.InvoiceServiceFeeAmount*100) / 100
			req.InvoiceTotalAmount = math.Round(req.InvoiceTotalAmount*100) / 100
			req.InvoiceTaxAmount = math.Round(req.InvoiceTaxAmount*100) / 100
			req.InvoiceMaterialAmount = math.Round(req.InvoiceMaterialAmount*100) / 100
			req.InvoiceLabourAmount = math.Round(req.InvoiceLabourAmount*100) / 100
			req.InvoiceTotalQuoteAmount = math.Round(req.InvoiceTotalQuoteAmount*100) / 100

			// Lookup the service fee.
			sf, err := impl.ServiceFeeStorer.GetByID(sessCtx, req.InvoiceServiceFeeID)
			if err != nil {
				impl.Logger.Error("get service fee by id error",
					slog.Any("task_item_id", req.TaskItemID),
					slog.Any("service_fee_id", req.InvoiceServiceFeeID),
					slog.Any("order_id", ti.OrderID),
					slog.Any("error", err))
				return nil, err
			}
			if sf == nil {
				impl.Logger.Error("service fee does not exist error",
					slog.Any("task_item_id", req.TaskItemID),
					slog.Any("service_fee_id", req.InvoiceServiceFeeID),
					slog.Any("order_id", ti.OrderID))
				return nil, httperror.NewForBadRequestWithSingleField("invoice_service_fee_id", fmt.Sprintf("service fee does not exist for %v", req.InvoiceServiceFeeID))
			}

			// Update model with the requests.
			o.InvoicePaidTo = req.InvoicePaidTo
			o.InvoiceDate = req.InvoiceDateFormatted
			o.InvoiceQuotedLabourAmount = req.InvoiceQuotedLabourAmount
			o.InvoiceQuotedMaterialAmount = req.InvoiceQuotedMaterialAmount
			o.InvoiceQuotedOtherCostsAmount = req.InvoiceQuotedOtherCostsAmount
			o.InvoiceTotalQuoteAmount = req.InvoiceTotalQuoteAmount
			o.InvoiceLabourAmount = req.InvoiceLabourAmount
			o.InvoiceMaterialAmount = req.InvoiceMaterialAmount
			o.InvoiceOtherCostsAmount = req.InvoiceOtherCostsAmount
			o.InvoiceTaxAmount = req.InvoiceTaxAmount
			o.InvoiceIsCustomTaxAmount = req.InvoiceIsCustomTaxAmount
			o.InvoiceTotalAmount = req.InvoiceTotalAmount
			o.InvoiceDepositAmount = req.InvoiceDepositAmount
			o.InvoiceAmountDue = req.InvoiceAmountDue
			o.InvoiceServiceFeeID = sf.ID
			o.InvoiceServiceFeeName = sf.Name
			o.InvoiceServiceFeeDescription = sf.Description
			o.InvoiceServiceFeePercentage = sf.Percentage
			o.InvoiceServiceFeeAmount = req.InvoiceServiceFeeAmount
			o.InvoiceServiceFeePaymentDate = req.InvoiceServiceFeePaymentDateFormatted
			o.PaymentMethods = req.PaymentMethods
			o.InvoiceActualServiceFeeAmountPaid = req.InvoiceActualServiceFeeAmountPaid
			o.InvoiceBalanceOwingAmount = req.InvoiceBalanceOwingAmount
			// o.PaymentStatus = req.PaymentStatus
			o.Visits = req.Visits
			o.ModifiedAt = time.Now()
			o.ModifiedByUserID = userID
			o.ModifiedByUserName = userName
			o.ModifiedFromIPAddress = ipAddress
		}

		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("order does not exist error",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("order_id", ti.OrderID))
			return nil, httperror.NewForBadRequestWithSingleField("task_item_id", fmt.Sprintf("task item does not exist for %v", ti.ID))
		}

		impl.Logger.Debug("order updated for order completion operation",
			slog.Any("task_item_id", req.TaskItemID),
			slog.Any("order_id", ti.OrderID))

		// If the user has submitted a comment for the job
		// then we will include it.

		if req.Comment != "" {
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
				Content:               req.Comment,
				Status:                com_s.CommentStatusActive,
			}
			if err := impl.CommentStorer.Create(sessCtx, com); err != nil {
				impl.Logger.Error("comment creation error",
					slog.Any("task_item_id", req.TaskItemID),
					slog.Any("new_task_item_id", ti.ID),
					slog.Any("error", err))
				return nil, err
			}

			impl.Logger.Debug("comment created for order completion operation",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("new_task_item_id", ti.ID),
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
					slog.Any("new_task_item_id", ti.ID),
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
					slog.Any("new_task_item_id", ti.ID),
					slog.Any("error", err))
				return nil, err
			}

			impl.Logger.Debug("order comment created for order completed operation",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("new_task_item_id", ti.ID),
				slog.Any("order_id", ti.OrderID),
				slog.Any("order_wjid", ti.OrderWJID),
				slog.Any("comment_id", com.ID))
		}

		////
		//// Process successful completion.
		////

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
				slog.Any("task_item_id", req.TaskItemID))
			return nil, err
		}

		impl.Logger.Debug("task item closed for order completed operation",
			slog.Any("task_item_id", req.TaskItemID))

		o.LatestPendingTaskID = primitive.NilObjectID
		o.LatestPendingTaskTitle = ""
		o.LatestPendingTaskDescription = ""
		o.LatestPendingTaskDueDate = time.Time{}
		o.ModifiedAt = time.Now()
		o.ModifiedByUserID = userID
		o.ModifiedByUserName = userName
		o.ModifiedFromIPAddress = ipAddress

		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("task creation error",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("order_id", ti.OrderID),
				slog.Any("order_wjid", ti.OrderWJID),
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("order updated for order completion operation",
			slog.Any("task_item_id", req.TaskItemID))

		if req.WasCompleted == 2 { // Hard-coded value from frontend. (2=NO)
			impl.Logger.Debug("order was not completed",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("order_id", ti.OrderID))

		} else if req.WasCompleted == 1 { // Hard-coded value from frontend. (1=YES)
			impl.Logger.Debug("order was completed",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("order_id", ti.OrderID))

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
				CustomerFullAddressWithoutPostalCode:  o.CustomerFullAddressWithoutPostalCode,
				CustomerFullAddressURL:                o.CustomerFullAddressURL,
				CustomerTags:                          toTaskItemTagsFromOrderTags(o.CustomerTags),
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
				slog.Any("ti_associate_tax_id", ti.AssociateTaxID),
				slog.Any("o_associate_tax_id", o.AssociateTaxID),
				slog.Any("error", err))

			////
			//// Update existing order.
			////

			o.Status = o_s.OrderStatusCompletedButUnpaid
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
					slog.Any("task_item_id", req.TaskItemID),
					slog.Any("new_task_item_id", newTask.ID),
					slog.Any("order_id", ti.OrderID),
					slog.Any("order_wjid", ti.OrderWJID),
					slog.Any("error", err))
				return nil, err
			}

			impl.Logger.Debug("updated order because of order completion operation",
				slog.Any("task_item_id", req.TaskItemID),
				slog.Any("new_task_item_id", newTask.ID),
				slog.Any("order_id", ti.OrderID),
				slog.Any("order_wjid", ti.OrderWJID))
		}

		//
		// Update related (if there are any).
		//

		var balanceOwingAmount float64 = 0

		// Iterate through all the work orders and compute a total of balance
		// owing to Over55 by the associate.
		res, err := impl.OrderStorer.ListByAssociateID(sessCtx, a.ID)
		if err != nil {
			impl.Logger.Error("database list by associate id error",
				slog.Any("associate_id", a.ID),
				slog.Any("error", err))
			return nil, err
		}
		for _, o := range res.Results {
			// Tally up the total paid in service fees. If negative then Over55
			// owes the associate, if positive value then assocaite owes Over55.
			balanceOwingAmount += o.InvoiceBalanceOwingAmount
		}

		// Round the balance owing to 2 decimal places.
		balanceOwingAmount = math.Floor(balanceOwingAmount*100) / 100

		// For debugging purposes only.
		impl.Logger.Debug("associate balance owing amount updated",
			slog.Any("new_balanceOwingAmount", balanceOwingAmount),
			slog.Any("old_balanceOwingAmount", a.BalanceOwingAmount))

		// Update the associate with the new total owing amount.
		a.BalanceOwingAmount = balanceOwingAmount
		if err := impl.AssociateStorer.UpdateByID(sessCtx, a); err != nil {
			impl.Logger.Error("associate update by id error",
				slog.Any("associate_id", a.ID),
				slog.Any("error", err))
			return nil, err
		}

		// return nil, errors.New("halt by programmer") // For debugging purposes only.

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
