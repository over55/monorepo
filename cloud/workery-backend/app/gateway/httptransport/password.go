package httptransport

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	gate_c "github.com/over55/monorepo/cloud/workery-backend/app/gateway/controller"
)

func UnmarshalPasswordResetRequest(ctx context.Context, r *http.Request) (*gate_c.PasswordResetRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData gate_c.PasswordResetRequestIDO

	defer r.Body.Close()

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return &requestData, nil
}

func (h *Handler) PasswordReset(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	req, err := UnmarshalPasswordResetRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	if err := h.Controller.PasswordReset(ctx, req); err != nil {
		httperror.ResponseError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func UnmarshalChangePasswordRequest(ctx context.Context, r *http.Request) (*gate_c.ChangePasswordRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData gate_c.ChangePasswordRequestIDO

	defer r.Body.Close()

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return &requestData, nil
}

func (h *Handler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	req, err := UnmarshalChangePasswordRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	if err := h.Controller.ChangePassword(ctx, req); err != nil {
		httperror.ResponseError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
