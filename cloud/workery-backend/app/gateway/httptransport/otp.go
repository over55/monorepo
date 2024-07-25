package httptransport

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"time"

	otp_c "github.com/over55/monorepo/cloud/workery-backend/app/gateway/controller"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) GenerateOTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	res, err := h.Controller.GenerateOTP(ctx)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (h *Handler) GenerateOTPAndQRCodePNGImage(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	pngImage, err := h.Controller.GenerateOTPAndQRCodePNGImage(ctx)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}
	// Set the Content-Type header
	w.Header().Set("Content-Type", "image/png")

	// Serve the content
	http.ServeContent(w, r, "opt-qr-code.png", time.Now(), bytes.NewReader(pngImage))
}

func unmarshalVerifyOTPRequest(ctx context.Context, r *http.Request) (*otp_c.VerificationTokenRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData otp_c.VerificationTokenRequestIDO

	defer r.Body.Close()

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return &requestData, nil
}

func (h *Handler) VerifyOTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	req, err := unmarshalVerifyOTPRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	res, err := h.Controller.VerifyOTP(ctx, req)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func unmarshalValidateOTPRequest(ctx context.Context, r *http.Request) (*otp_c.ValidateTokenRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData otp_c.ValidateTokenRequestIDO

	defer r.Body.Close()

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return &requestData, nil
}

func (h *Handler) ValidateOTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	req, err := unmarshalValidateOTPRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	res, err := h.Controller.ValidateOTP(ctx, req)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (h *Handler) DisableOTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	res, err := h.Controller.DisableOTP(ctx)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (h *Handler) unmarshalRecoveryOTPRequest(ctx context.Context, r *http.Request) (*otp_c.RecoveryRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData otp_c.RecoveryRequestIDO

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

	return &requestData, nil
}

func (h *Handler) RecoveryOTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	req, err := h.unmarshalRecoveryOTPRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	res, err := h.Controller.RecoveryOTP(ctx, req)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
