package httptransport

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	c "github.com/over55/monorepo/cloud/workery-backend/app/tenant/controller"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func UnmarshalUpdateTaxRateOperationRequest(ctx context.Context, r *http.Request) (*c.UpdateTaxRateOperationRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData c.UpdateTaxRateOperationRequestIDO

	defer r.Body.Close()

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		log.Println("UnmarshalOperationCreateCommentRequest | NewDecoder/Decode | err:", err)
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return &requestData, nil
}

func (h *Handler) UpdateTaxRateOperation(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	reqData, err := UnmarshalUpdateTaxRateOperationRequest(ctx, r)
	if err != nil {
		log.Println("OperationCreateComment | UnmarshalOperationCreateCommentRequest | err:", err)
		httperror.ResponseError(w, err)
		return
	}

	data, err := h.Controller.UpdateTaxRateOperation(ctx, reqData)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalOperationCreateCommentResponse(data, w)
}
