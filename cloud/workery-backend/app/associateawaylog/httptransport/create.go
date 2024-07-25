package httptransport

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"

	associateawaylog_c "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/controller"
	associateawaylog_s "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"github.com/relvacode/iso8601"
)

func (h *Handler) UnmarshalCreateRequest(ctx context.Context, r *http.Request) (*associateawaylog_c.AssociateAwayLogCreateRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData *associateawaylog_c.AssociateAwayLogCreateRequestIDO

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

	// UntilDate

	if requestData.UntilDate != "" {
		untilDateFormatted, err := iso8601.ParseString(requestData.UntilDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("UntilDate", requestData.UntilDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "until_date", "payload structure is wrong")
		}
		requestData.UntilDateFormatted = untilDateFormatted
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

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	data, err := h.UnmarshalCreateRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	res, err := h.Controller.Create(ctx, data)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalCreateResponse(res, w)
}

func MarshalCreateResponse(res *associateawaylog_s.AssociateAwayLog, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
