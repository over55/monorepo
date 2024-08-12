package httptransport

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	c_c "github.com/over55/monorepo/cloud/workery-backend/app/associate/controller"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func UnmarshalOperationChangePasswordRequest(ctx context.Context, r *http.Request) (*c_c.AssociateOperationChangePasswordRequest, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData c_c.AssociateOperationChangePasswordRequest

	defer r.Body.Close()

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		log.Println("UnmarshalOperationChangePasswordRequest | NewDecoder/Decode | err:", err)
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return &requestData, nil
}

func (h *Handler) OperationChangePassword(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	reqData, err := UnmarshalOperationChangePasswordRequest(ctx, r)
	if err != nil {
		log.Println("OperationChangePassword | UnmarshalOperationChangePasswordRequest | err:", err)
		httperror.ResponseError(w, err)
		return
	}

	if err := h.Controller.ChangePassword(ctx, reqData); err != nil {
		httperror.ResponseError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
