package controller

import (
	"context"
	"fmt"
	"log/slog"
	"math"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type OrderFinancialUpdateRequestIDO struct {
	WJID                          uint64             `bson:"wjid" json:"wjid"`
	CompletionDate                string             `bson:"completion_date" json:"completion_date"`
	CompletionDateFormatted       time.Time          `bson:"-" json:"-"`
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
}

func (impl *OrderControllerImpl) validateUpdateFinancialRequest(ctx context.Context, dirtyData *OrderFinancialUpdateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.WJID == 0 {
		e["wjid"] = "no selected choices"
	}
	if dirtyData.InvoicePaidTo == 0 {
		e["invoice_paid_to"] = "missing value"
	}
	if dirtyData.PaymentStatus == 0 {
		e["payment_status"] = "missing value"
	} else {
		if dirtyData.PaymentStatus == o_s.OrderStatusCompletedAndPaid {
			if dirtyData.CompletionDateFormatted.IsZero() {
				e["completion_date"] = "missing value"
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
			if dirtyData.InvoiceServiceFeeID.IsZero() {
				e["invoice_service_fee_id"] = "missing value"
			}
			// if dirtyData.InvoiceServiceFeeAmount == 0 {
			// 	e["invoice_service_fee_amount"] = "missing value"
			// }x
			if dirtyData.InvoiceServiceFeePaymentDate == "" {
				e["invoice_service_fee_payment_date"] = "missing value"
			}
			// InvoiceBalanceOwingAmount             float64   `bson:"invoice_balance_owing_amount" json:"invoice_balance_owing_amount"`
		}
	}
	if dirtyData.InvoiceDateFormatted.IsZero() {
		e["invoice_date"] = "missing value"
	}
	if dirtyData.InvoiceIDs == "" {
		e["invoice_ids"] = "missing value"
	}
	if len(dirtyData.PaymentMethods) == 0 {
		e["payment_methods"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *OrderControllerImpl) UpdateFinancialByWJID(ctx context.Context, req *OrderFinancialUpdateRequestIDO) (*o_s.Order, error) {
	//
	// Get variables from our user authenticated session.
	//

	tid, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	role, _ := ctx.Value(constants.SessionUserRole).(int8)
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	// DEVELOPERS NOTE:
	// Every submission needs to have a unique `workery job id` (WJID)
	// generated. The following needs to happen to generate the unique WJID:
	// 1. Make the `Update` function be `atomic` and thus lock this function.
	// 2. Count total orders in system (for particular tenant).
	// 3. Generate WJID.
	// 4. Apply the WJID to the order.
	// 5. Unlock this `Update` function to be usable again by other calls after
	//    the function successfully submits the order into our system.
	impl.Kmutex.Lockf("update-order-by-tenant-%s", tid.Hex())
	defer impl.Kmutex.Unlockf("update-order-by-tenant-%s", tid.Hex())

	switch role {
	case u_s.UserRoleExecutive, u_s.UserRoleManagement, u_s.UserRoleFrontlineStaff:
		break
	default:
		impl.Logger.Error("you do not have permission to update an order")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to update a client")
	}

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateUpdateFinancialRequest(ctx, req); err != nil {
		impl.Logger.Warn("validation error", slog.Any("error", err))
		return nil, err
	}

	////
	//// Start the transaction.
	////

	session, err := impl.DbClient.StartSession()
	if err != nil {
		impl.Logger.Error("start session error",
			slog.Any("error", err))
		return nil, err
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {

		//
		// Get Order.
		//

		o, err := impl.OrderStorer.GetByWJID(sessCtx, req.WJID)
		if err != nil {
			impl.Logger.Error("database order get by id error",
				slog.Any("error", err),
				slog.Any("order_wjid", req.WJID))
			return nil, err
		}
		if o == nil {
			impl.Logger.Error("order does not exist error",
				slog.Any("order_wjid", req.WJID))
			return nil, httperror.NewForBadRequestWithSingleField("customer_id",
				fmt.Sprintf("order does not exist for id %v", req.WJID))
		}

		//
		// Get Associate.
		//

		a, err := impl.AssociateStorer.GetByID(sessCtx, o.AssociateID)
		if err != nil {
			impl.Logger.Error("database order get by id error",
				slog.Any("error", err),
				slog.Any("associate_id", o.AssociateID),
				slog.Any("order_wjid", req.WJID))
			return nil, err
		}
		if a == nil {
			impl.Logger.Error("associate does not exist for ordererror",
				slog.Any("order_wjid", req.WJID),
				slog.Any("associate_id", o.AssociateID))
			return nil, httperror.NewForBadRequestWithSingleField("associate_id",
				fmt.Sprintf("associate does not exist %v", o.AssociateID))
		}

		//
		// Extract from request and map into our domain the base information.
		//

		// --- Data ---

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
				slog.Any("service_fee_id", req.InvoiceServiceFeeID),
				slog.Any("error", err))
			return nil, err
		}
		if sf == nil {
			impl.Logger.Error("service fee does not exist error",
				slog.Any("service_fee_id", req.InvoiceServiceFeeID))
			return nil, httperror.NewForBadRequestWithSingleField("invoice_service_fee_id", fmt.Sprintf("service fee does not exist for %v", req.InvoiceServiceFeeID))
		}

		// Update model with the requests.
		o.InvoicePaidTo = req.InvoicePaidTo
		if !req.CompletionDateFormatted.IsZero() {
			o.CompletionDate = req.CompletionDateFormatted
		}
		o.InvoiceIDs = req.InvoiceIDs
		if !req.InvoiceDateFormatted.IsZero() {
			o.InvoiceDate = req.InvoiceDateFormatted
		}
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
		if !req.InvoiceServiceFeePaymentDateFormatted.IsZero() {
			o.InvoiceServiceFeePaymentDate = req.InvoiceServiceFeePaymentDateFormatted
		}
		o.PaymentMethods = req.PaymentMethods
		o.InvoiceActualServiceFeeAmountPaid = req.InvoiceActualServiceFeeAmountPaid
		o.InvoiceBalanceOwingAmount = req.InvoiceBalanceOwingAmount

		if req.PaymentStatus == o_s.OrderStatusCompletedAndPaid {
			o.Status = o_s.OrderStatusCompletedAndPaid
		} else if req.PaymentStatus == o_s.OrderStatusCompletedButUnpaid {
			o.Status = o_s.OrderStatusCompletedButUnpaid
		} else {
			impl.Logger.Error("was completed is invalid",
				slog.Any("payment_status", req.PaymentStatus))
			return nil, httperror.NewForBadRequestWithSingleField("payment_status", fmt.Sprintf("invalid was completed for value %v", req.PaymentStatus))
		}

		// --- Meta ---
		o.ModifiedAt = time.Now()
		o.ModifiedByUserID = userID
		o.ModifiedByUserName = userName
		o.ModifiedFromIPAddress = ipAddress

		//
		// Save to the database the work order update.
		//

		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("database update by id error",
				slog.Any("order_id", o.ID),
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("order updated",
			slog.Any("order_id", o.ID))

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

		//
		// END TRANSACTION.
		//

		// return nil, errors.New("halt by programmer") // For debugging purposes only.

		return o, nil
	}

	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		impl.Logger.Error("session failed error",
			slog.Any("error", err))
		return nil, err
	}

	return result.(*o_s.Order), nil
}
