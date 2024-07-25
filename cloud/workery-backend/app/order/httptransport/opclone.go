package httptransport

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	o_c "github.com/over55/monorepo/cloud/workery-backend/app/order/controller"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func UnmarshalOperationCloneRequest(ctx context.Context, r *http.Request) (*o_c.OrderOperationCloneRequest, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData o_c.OrderOperationCloneRequest

	defer r.Body.Close()

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		log.Println("UnmarshalOperationCloneRequest | NewDecoder/Decode | err:", err)
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return &requestData, nil
}

func (h *Handler) OperationClone(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	reqData, err := UnmarshalOperationCloneRequest(ctx, r)
	if err != nil {
		log.Println("OperationClone | UnmarshalOperationCloneRequest | err:", err)
		httperror.ResponseError(w, err)
		return
	}
	data, err := h.Controller.Clone(ctx, reqData)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalOperationCloneResponse(data, w)
}

func MarshalOperationCloneResponse(res *o_s.Order, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
