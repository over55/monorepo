package httptransport

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/relvacode/iso8601"

	usr_c "github.com/over55/monorepo/cloud/workery-backend/app/order/controller"
	usr_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) unmarshalUpdateRequest(ctx context.Context, r *http.Request) (*usr_c.OrderUpdateRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData *usr_c.OrderUpdateRequestIDO

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

	// StartDate

	if requestData.StartDate != "" {
		startDateFormatted, err := iso8601.ParseString(requestData.StartDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("StartDate", requestData.StartDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "start_date", "payload structure is wrong")
		}
		requestData.StartDateFormatted = startDateFormatted
	}

	return requestData, nil
}

func (h *Handler) UpdateByWJID(w http.ResponseWriter, r *http.Request, wjidStr string) {
	ctx := r.Context()

	data, err := h.unmarshalUpdateRequest(ctx, r)
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

	user, err := h.Controller.UpdateByWJID(ctx, data)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalUpdateResponse(user, w)
}

func MarshalUpdateResponse(res *usr_s.Order, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
