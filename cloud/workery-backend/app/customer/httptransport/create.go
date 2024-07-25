package httptransport

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"

	usr_c "github.com/over55/monorepo/cloud/workery-backend/app/customer/controller"
	usr_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"github.com/relvacode/iso8601"
)

func (h *Handler) unmarshalCreateRequest(ctx context.Context, r *http.Request) (*usr_c.CustomerCreateRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData *usr_c.CustomerCreateRequestIDO

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

	// BirthDate

	if requestData.BirthDate != "" {
		birthDateDT, err := iso8601.ParseString(requestData.BirthDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("BirthDate", requestData.BirthDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "birth_date", "payload structure is wrong")
		}
		requestData.BirthDateDT = birthDateDT
	}

	// JoinDate

	if requestData.JoinDate != "" {
		joinDateDT, err := iso8601.ParseString(requestData.JoinDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("JoinDate", requestData.JoinDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "join_date", "payload structure is wrong")
		}
		requestData.JoinDateDT = joinDateDT
	}

	return requestData, nil
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	data, err := h.unmarshalCreateRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	user, err := h.Controller.Create(ctx, data)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalCreateResponse(user, w)
}

func MarshalCreateResponse(res *usr_s.Customer, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
