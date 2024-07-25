package httptransport

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"

	"github.com/relvacode/iso8601"

	ti_c "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/controller"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) unmarshalOrderCompletionOperationRequest(ctx context.Context, r *http.Request) (*ti_c.TaskItemOperationOrderCompletionRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData *ti_c.TaskItemOperationOrderCompletionRequestIDO

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

	// CompletionDate

	if requestData.CompletionDate != "" {
		dt, err := iso8601.ParseString(requestData.CompletionDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("CompletionDate", requestData.CompletionDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "completion_date", "payload structure is wrong")
		}
		requestData.CompletionDateFormatted = dt
	}

	// InvoiceDate

	if requestData.InvoiceDate != "" {
		dt, err := iso8601.ParseString(requestData.InvoiceDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("InvoiceDate", requestData.InvoiceDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "invoice_date", "payload structure is wrong")
		}
		requestData.InvoiceDateFormatted = dt
	}

	// InvoiceServiceFeePaymentDate

	if requestData.InvoiceServiceFeePaymentDate != "" {
		dt, err := iso8601.ParseString(requestData.InvoiceServiceFeePaymentDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("InvoiceServiceFeePaymentDate", requestData.InvoiceServiceFeePaymentDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "invoice_service_fee_payment_date", "payload structure is wrong")
		}
		requestData.InvoiceServiceFeePaymentDateFormatted = dt
	}

	return requestData, nil
}

func (h *Handler) OrderCompletionOperation(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	data, err := h.unmarshalOrderCompletionOperationRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	user, err := h.Controller.OrderCompletionOperation(ctx, data)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalDetailResponse(user, w)
}
