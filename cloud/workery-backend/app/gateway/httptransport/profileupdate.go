package httptransport

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"strings"

	gateway_c "github.com/over55/monorepo/cloud/workery-backend/app/gateway/controller"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"github.com/relvacode/iso8601"
)

func (h *Handler) unmarshalProfileUpdateRequest(ctx context.Context, r *http.Request) (*gateway_c.ProfileUpdateRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData gateway_c.ProfileUpdateRequestIDO

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

	// Defensive Code: For security purposes we need to remove all whitespaces from the email and lower the characters.
	requestData.Email = strings.ToLower(requestData.Email)
	requestData.Email = strings.ReplaceAll(requestData.Email, " ", "")

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

	// PoliceCheck

	if requestData.PoliceCheck != "" {
		policeCheckDT, err := iso8601.ParseString(requestData.PoliceCheck)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("PoliceCheck", requestData.PoliceCheck),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "police_check", "payload structure is wrong")
		}
		requestData.PoliceCheckDT = policeCheckDT
	}

	// Convert to the user collection.
	return &requestData, nil
}

func (h *Handler) ProfileUpdate(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	data, err := h.unmarshalProfileUpdateRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	if err := h.Controller.ProfileUpdate(ctx, data); err != nil {
		httperror.ResponseError(w, err)
		return
	}

	// Get the request
	h.Profile(w, r)
}

func UnmarshalProfileChangePasswordRequest(ctx context.Context, r *http.Request) (*gateway_c.ProfileChangePasswordRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData gateway_c.ProfileChangePasswordRequestIDO

	defer r.Body.Close()

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	// Return our result
	return &requestData, nil
}

func (h *Handler) ProfileChangePassword(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	data, err := UnmarshalProfileChangePasswordRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	if err := h.Controller.ProfileChangePassword(ctx, data); err != nil {
		httperror.ResponseError(w, err)
		return
	}

	// Get the request
	h.Profile(w, r)
}
