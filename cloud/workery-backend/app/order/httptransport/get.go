package httptransport

import (
	"encoding/json"
	"log/slog"
	"math"
	"net/http"
	"strconv"

	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) GetByWJID(w http.ResponseWriter, r *http.Request, idStr string) {
	ctx := r.Context()

	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.Logger.Debug("failed parsing",
			slog.Any("id", idStr),
			slog.Any("err", err))
		httperror.ResponseError(w, err)
		return
	}

	m, err := h.Controller.GetByWJID(ctx, uint64(id))
	if err != nil {
		h.Logger.Debug("failed getting order by wjid",
			slog.Any("id", idStr),
			slog.Any("err", err))
		httperror.ResponseError(w, err)
		return
	}

	h.marshalDetailResponse(m, w)
}

func (h *Handler) sanitizeOrder(o *o_s.Order) {
	// Loop through fields in the struct and set NaN values to 0.

	o.Hours = sanitizeField(h.Logger, "o.Hours", o.Hours)
	o.Score = sanitizeField(h.Logger, "o.Score", o.Score)
	o.InvoiceQuoteAmount = sanitizeField(h.Logger, "o.InvoiceQuoteAmount", o.InvoiceQuoteAmount)
	o.InvoiceLabourAmount = sanitizeField(h.Logger, "o.InvoiceLabourAmount", o.InvoiceLabourAmount)
	o.InvoiceMaterialAmount = sanitizeField(h.Logger, "o.InvoiceMaterialAmount", o.InvoiceMaterialAmount)
	o.InvoiceTaxAmount = sanitizeField(h.Logger, "o.InvoiceTaxAmount", o.InvoiceTaxAmount)
	o.InvoiceTotalAmount = sanitizeField(h.Logger, "o.InvoiceTotalAmount", o.InvoiceTotalAmount)
	o.InvoiceServiceFeeAmount = sanitizeField(h.Logger, "o.InvoiceServiceFeeAmount", o.InvoiceServiceFeeAmount)
	o.InvoiceServiceFeePercentage = sanitizeField(h.Logger, "o.InvoiceServiceFeePercentage", o.InvoiceServiceFeePercentage)
	o.InvoiceActualServiceFeeAmountPaid = sanitizeField(h.Logger, "o.InvoiceActualServiceFeeAmountPaid", o.InvoiceActualServiceFeeAmountPaid)
	o.InvoiceBalanceOwingAmount = sanitizeField(h.Logger, "o.InvoiceBalanceOwingAmount", o.InvoiceBalanceOwingAmount)
	o.InvoiceQuotedLabourAmount = sanitizeField(h.Logger, "o.InvoiceQuotedLabourAmount", o.InvoiceQuotedLabourAmount)
	o.InvoiceQuotedMaterialAmount = sanitizeField(h.Logger, "o.InvoiceQuotedMaterialAmount", o.InvoiceQuotedMaterialAmount)
	o.InvoiceTotalQuoteAmount = sanitizeField(h.Logger, "o.InvoiceTotalQuoteAmount", o.InvoiceTotalQuoteAmount)
	o.InvoiceDepositAmount = sanitizeField(h.Logger, "o.InvoiceDepositAmount", o.InvoiceDepositAmount)
	o.InvoiceOtherCostsAmount = sanitizeField(h.Logger, "o.InvoiceOtherCostsAmount", o.InvoiceOtherCostsAmount)
	o.InvoiceQuotedOtherCostsAmount = sanitizeField(h.Logger, "o.InvoiceQuotedOtherCostsAmount", o.InvoiceQuotedOtherCostsAmount)
	o.InvoiceAmountDue = sanitizeField(h.Logger, "o.InvoiceAmountDue", o.InvoiceAmountDue)
	o.InvoiceSubTotalAmount = sanitizeField(h.Logger, "o.InvoiceSubTotalAmount", o.InvoiceSubTotalAmount)

	// Process the `PastInvoices`.
	for _, pastInvoice := range o.PastInvoices {
		pastInvoice.Line01Price = sanitizeField(h.Logger, "pastInvoice.Line01Price", pastInvoice.Line01Price)
		pastInvoice.Line01Amount = sanitizeField(h.Logger, "pastInvoice.Line01Amount", pastInvoice.Line01Amount)
		pastInvoice.Line02Price = sanitizeField(h.Logger, "pastInvoice.Line02Price", pastInvoice.Line02Price)
		pastInvoice.Line02Amount = sanitizeField(h.Logger, "pastInvoice.Line02Amount", pastInvoice.Line02Amount)
		pastInvoice.Line03Price = sanitizeField(h.Logger, "pastInvoice.Line03Price", pastInvoice.Line03Price)
		pastInvoice.Line03Amount = sanitizeField(h.Logger, "pastInvoice.Line03Amount", pastInvoice.Line03Amount)
		pastInvoice.Line04Price = sanitizeField(h.Logger, "pastInvoice.Line04Price", pastInvoice.Line04Price)
		pastInvoice.Line04Amount = sanitizeField(h.Logger, "pastInvoice.Line04Amount", pastInvoice.Line04Amount)
		pastInvoice.Line05Price = sanitizeField(h.Logger, "pastInvoice.Line05Price", pastInvoice.Line05Price)
		pastInvoice.Line05Amount = sanitizeField(h.Logger, "pastInvoice.Line05Amount", pastInvoice.Line05Amount)
		pastInvoice.Line06Price = sanitizeField(h.Logger, "pastInvoice.Line06Price", pastInvoice.Line06Price)
		pastInvoice.Line06Amount = sanitizeField(h.Logger, "pastInvoice.Line06Amount", pastInvoice.Line06Amount)
		pastInvoice.Line07Price = sanitizeField(h.Logger, "pastInvoice.Line07Price", pastInvoice.Line07Price)
		pastInvoice.Line07Amount = sanitizeField(h.Logger, "pastInvoice.Line07Amount", pastInvoice.Line07Amount)
		pastInvoice.Line08Price = sanitizeField(h.Logger, "pastInvoice.Line08Price", pastInvoice.Line08Price)
		pastInvoice.Line08Amount = sanitizeField(h.Logger, "pastInvoice.Line08Amount", pastInvoice.Line08Amount)
		pastInvoice.Line09Price = sanitizeField(h.Logger, "pastInvoice.Line09Price", pastInvoice.Line09Price)
		pastInvoice.Line09Amount = sanitizeField(h.Logger, "pastInvoice.Line09Amount", pastInvoice.Line09Amount)
		pastInvoice.Line10Price = sanitizeField(h.Logger, "pastInvoice.Line10Price", pastInvoice.Line10Price)
		pastInvoice.Line10Amount = sanitizeField(h.Logger, "pastInvoice.Line10Amount", pastInvoice.Line10Amount)
		pastInvoice.Line11Price = sanitizeField(h.Logger, "pastInvoice.Line11Price", pastInvoice.Line11Price)
		pastInvoice.Line11Amount = sanitizeField(h.Logger, "pastInvoice.Line11Amount", pastInvoice.Line11Amount)
		pastInvoice.Line12Price = sanitizeField(h.Logger, "pastInvoice.Line12Price", pastInvoice.Line12Price)
		pastInvoice.Line12Amount = sanitizeField(h.Logger, "pastInvoice.Line12Amount", pastInvoice.Line12Amount)
		pastInvoice.Line13Price = sanitizeField(h.Logger, "pastInvoice.Line13Price", pastInvoice.Line13Price)
		pastInvoice.Line13Amount = sanitizeField(h.Logger, "pastInvoice.Line13Amount", pastInvoice.Line13Amount)
		pastInvoice.Line14Price = sanitizeField(h.Logger, "pastInvoice.Line14Price", pastInvoice.Line14Price)
		pastInvoice.Line14Amount = sanitizeField(h.Logger, "pastInvoice.Line14Amount", pastInvoice.Line14Amount)
		pastInvoice.Line15Price = sanitizeField(h.Logger, "pastInvoice.Line15Price", pastInvoice.Line15Price)
		pastInvoice.Line15Amount = sanitizeField(h.Logger, "pastInvoice.Line15Amount", pastInvoice.Line15Amount)
		pastInvoice.TotalLabour = sanitizeField(h.Logger, "pastInvoice.TotalLabour", pastInvoice.TotalLabour)
		pastInvoice.TotalMaterials = sanitizeField(h.Logger, "pastInvoice.TotalMaterials", pastInvoice.TotalMaterials)
		pastInvoice.OtherCosts = sanitizeField(h.Logger, "pastInvoice.OtherCosts", pastInvoice.OtherCosts)
		pastInvoice.Tax = sanitizeField(h.Logger, "pastInvoice.Tax", pastInvoice.Tax)
		pastInvoice.Total = sanitizeField(h.Logger, "pastInvoice.Total", pastInvoice.Total)
		pastInvoice.PaymentAmount = sanitizeField(h.Logger, "pastInvoice.PaymentAmount", pastInvoice.PaymentAmount)
		pastInvoice.Deposit = sanitizeField(h.Logger, "pastInvoice.Deposit", pastInvoice.Deposit)
		pastInvoice.AmountDue = sanitizeField(h.Logger, "pastInvoice.AmountDue", pastInvoice.AmountDue)
		pastInvoice.SubTotal = sanitizeField(h.Logger, "pastInvoice.SubTotal", pastInvoice.SubTotal)
	}

	// Process the `Invoice`.
	if o.Invoice != nil {
		o.Invoice.Line01Price = sanitizeField(h.Logger, "o.Invoice.Line01Price", o.Invoice.Line01Price)
		o.Invoice.Line01Amount = sanitizeField(h.Logger, "o.Invoice.Line01Amount", o.Invoice.Line01Amount)
		o.Invoice.Line02Price = sanitizeField(h.Logger, "o.Invoice.Line02Price", o.Invoice.Line02Price)
		o.Invoice.Line02Amount = sanitizeField(h.Logger, "o.Invoice.Line02Amount", o.Invoice.Line02Amount)
		o.Invoice.Line03Price = sanitizeField(h.Logger, "o.Invoice.Line03Price", o.Invoice.Line03Price)
		o.Invoice.Line03Amount = sanitizeField(h.Logger, "o.Invoice.Line03Amount", o.Invoice.Line03Amount)
		o.Invoice.Line04Price = sanitizeField(h.Logger, "o.Invoice.Line04Price", o.Invoice.Line04Price)
		o.Invoice.Line04Amount = sanitizeField(h.Logger, "o.Invoice.Line04Amount", o.Invoice.Line04Amount)
		o.Invoice.Line05Price = sanitizeField(h.Logger, "o.Invoice.Line05Price", o.Invoice.Line05Price)
		o.Invoice.Line05Amount = sanitizeField(h.Logger, "o.Invoice.Line05Amount", o.Invoice.Line05Amount)
		o.Invoice.Line06Price = sanitizeField(h.Logger, "o.Invoice.Line06Price", o.Invoice.Line06Price)
		o.Invoice.Line06Amount = sanitizeField(h.Logger, "o.Invoice.Line06Amount", o.Invoice.Line06Amount)
		o.Invoice.Line07Price = sanitizeField(h.Logger, "o.Invoice.Line07Price", o.Invoice.Line07Price)
		o.Invoice.Line07Amount = sanitizeField(h.Logger, "o.Invoice.Line07Amount", o.Invoice.Line07Amount)
		o.Invoice.Line08Price = sanitizeField(h.Logger, "o.Invoice.Line08Price", o.Invoice.Line08Price)
		o.Invoice.Line08Amount = sanitizeField(h.Logger, "o.Invoice.Line08Amount", o.Invoice.Line08Amount)
		o.Invoice.Line09Price = sanitizeField(h.Logger, "o.Invoice.Line09Price", o.Invoice.Line09Price)
		o.Invoice.Line09Amount = sanitizeField(h.Logger, "o.Invoice.Line09Amount", o.Invoice.Line09Amount)
		o.Invoice.Line10Price = sanitizeField(h.Logger, "o.Invoice.Line10Price", o.Invoice.Line10Price)
		o.Invoice.Line10Amount = sanitizeField(h.Logger, "o.Invoice.Line10Amount", o.Invoice.Line10Amount)
		o.Invoice.Line11Price = sanitizeField(h.Logger, "o.Invoice.Line11Price", o.Invoice.Line11Price)
		o.Invoice.Line11Amount = sanitizeField(h.Logger, "o.Invoice.Line11Amount", o.Invoice.Line11Amount)
		o.Invoice.Line12Price = sanitizeField(h.Logger, "o.Invoice.Line12Price", o.Invoice.Line12Price)
		o.Invoice.Line12Amount = sanitizeField(h.Logger, "o.Invoice.Line12Amount", o.Invoice.Line12Amount)
		o.Invoice.Line13Price = sanitizeField(h.Logger, "o.Invoice.Line13Price", o.Invoice.Line13Price)
		o.Invoice.Line13Amount = sanitizeField(h.Logger, "o.Invoice.Line13Amount", o.Invoice.Line13Amount)
		o.Invoice.Line14Price = sanitizeField(h.Logger, "o.Invoice.Line14Price", o.Invoice.Line14Price)
		o.Invoice.Line14Amount = sanitizeField(h.Logger, "o.Invoice.Line14Amount", o.Invoice.Line14Amount)
		o.Invoice.Line15Price = sanitizeField(h.Logger, "o.Invoice.Line15Price", o.Invoice.Line15Price)
		o.Invoice.Line15Amount = sanitizeField(h.Logger, "o.Invoice.Line15Amount", o.Invoice.Line15Amount)
		o.Invoice.TotalLabour = sanitizeField(h.Logger, "o.Invoice.TotalLabour", o.Invoice.TotalLabour)
		o.Invoice.TotalMaterials = sanitizeField(h.Logger, "o.Invoice.TotalMaterials", o.Invoice.TotalMaterials)
		o.Invoice.OtherCosts = sanitizeField(h.Logger, "o.Invoice.OtherCosts", o.Invoice.OtherCosts)
		o.Invoice.Tax = sanitizeField(h.Logger, "o.Invoice.Tax", o.Invoice.Tax)
		o.Invoice.Total = sanitizeField(h.Logger, "o.Invoice.Total", o.Invoice.Total)
		o.Invoice.PaymentAmount = sanitizeField(h.Logger, "o.Invoice.PaymentAmount", o.Invoice.PaymentAmount)
		o.Invoice.Deposit = sanitizeField(h.Logger, "o.Invoice.Deposit", o.Invoice.Deposit)
		o.Invoice.AmountDue = sanitizeField(h.Logger, "o.Invoice.AmountDue", o.Invoice.AmountDue)
		o.Invoice.SubTotal = sanitizeField(h.Logger, "o.Invoice.SubTotal", o.Invoice.SubTotal)
	}

	// Process the `PastInvoices`.
	for _, deposit := range o.Deposits {
		deposit.Amount = sanitizeField(h.Logger, "deposit.Amount", deposit.Amount)
	}
}

func sanitizeField(logger *slog.Logger, fieldName string, fieldValue float64) float64 {
	if math.IsNaN(fieldValue) {
		fieldValue = 0
		logger.Warn("Sanitization applied",
			slog.Any("field", fieldName))
	}
	return fieldValue
}

func (h *Handler) marshalDetailResponse(res *o_s.Order, w http.ResponseWriter) {
	h.sanitizeOrder(res) // Sanitize the order to remove NaN values

	if err := json.NewEncoder(w).Encode(&res); err != nil {
		h.Logger.Error("failed encoding order",
			slog.Any("err", err))
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
