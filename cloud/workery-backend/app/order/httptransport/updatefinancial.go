package httptransport

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"strconv"

	usr_c "github.com/over55/monorepo/cloud/workery-backend/app/order/controller"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"github.com/relvacode/iso8601"
)

func (h *Handler) unmarshalUpdateFinancialRequest(ctx context.Context, r *http.Request) (*usr_c.OrderFinancialUpdateRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData *usr_c.OrderFinancialUpdateRequestIDO

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
		formatted, err := iso8601.ParseString(requestData.InvoiceDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("StartDate", requestData.InvoiceDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "invoice_date", "payload structure is wrong")
		}
		requestData.InvoiceDateFormatted = formatted
	}

	if requestData.CompletionDate != "" {
		formatted, err := iso8601.ParseString(requestData.CompletionDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("StartDate", requestData.CompletionDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "completion_date", "payload structure is wrong")
		}
		requestData.CompletionDateFormatted = formatted
	}

	if requestData.InvoiceServiceFeePaymentDate != "" {
		formatted, err := iso8601.ParseString(requestData.InvoiceServiceFeePaymentDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("StartDate", requestData.InvoiceServiceFeePaymentDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "invoice_service_fee_payment_date", "payload structure is wrong")
		}
		requestData.InvoiceServiceFeePaymentDateFormatted = formatted
	}

	return requestData, nil
}

func (h *Handler) UpdateFinancialByWJID(w http.ResponseWriter, r *http.Request, wjidStr string) {
	ctx := r.Context()

	data, err := h.unmarshalUpdateFinancialRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	wjid, err := strconv.ParseInt(wjidStr, 10, 64)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	data.WJID = uint64(wjid)

	user, err := h.Controller.UpdateFinancialByWJID(ctx, data)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalUpdateResponse(user, w)
}
