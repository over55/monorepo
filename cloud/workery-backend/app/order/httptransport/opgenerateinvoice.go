package httptransport

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"

	"github.com/relvacode/iso8601"

	c_c "github.com/over55/monorepo/cloud/workery-backend/app/order/controller"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) unmarshalOperationGenerateInvoiceRequest(ctx context.Context, r *http.Request) (*c_c.OrderOperationGenerateInvoiceRequest, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData c_c.OrderOperationGenerateInvoiceRequest

	defer r.Body.Close()

	var rawJSON bytes.Buffer
	teeReader := io.TeeReader(r.Body, &rawJSON) // TeeReader allows you to read the JSON and capture it

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(teeReader).Decode(&requestData) // [1]
	if err != nil {
		h.Logger.Error("decoding error",
			slog.Any("err", err),
			slog.String("json", rawJSON.String()),
		)
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	if requestData.InvoiceDate != "" {
		invoiceDate, err := iso8601.ParseString(requestData.InvoiceDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("invoice_date", requestData.InvoiceDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "invoice_date", "payload structure is wrong")
		}
		requestData.InvoiceDateFormatted = invoiceDate
	}

	if requestData.InvoiceQuoteDate != "" {
		invoiceQuoteDate, err := iso8601.ParseString(requestData.InvoiceQuoteDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("invoice_quote_date", requestData.InvoiceQuoteDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "invoice_quote_date", "payload structure is wrong")
		}
		requestData.InvoiceQuoteDateFormatted = invoiceQuoteDate
	}

	if requestData.DateClientPaidInvoice != "" {
		dateClientPaidInvoice, err := iso8601.ParseString(requestData.DateClientPaidInvoice)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("date_client_paid_invoice", requestData.DateClientPaidInvoice),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "payment_date", "payload structure is wrong")
		}
		requestData.DateClientPaidInvoiceFormatted = dateClientPaidInvoice
	}

	if requestData.AssociateSignDate != "" {
		associateSignDate, err := iso8601.ParseString(requestData.AssociateSignDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("associate_sign_date", requestData.AssociateSignDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "associate_sign_date", "payload structure is wrong")
		}
		requestData.AssociateSignDateFormatted = associateSignDate
	}

	return &requestData, nil
}

func (h *Handler) OperationGenerateInvoice(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	reqData, err := h.unmarshalOperationGenerateInvoiceRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}
	data, err := h.Controller.GenerateInvoice(ctx, reqData)
	if err != nil {
		h.Logger.Error("generating invoice error",
			slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	if err := json.NewEncoder(w).Encode(&data); err != nil {
		h.Logger.Error("encoding error",
			slog.Any("error", err))
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
