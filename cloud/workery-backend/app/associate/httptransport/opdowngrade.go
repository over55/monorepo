package httptransport

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	c_c "github.com/over55/monorepo/cloud/workery-backend/app/associate/controller"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func UnmarshalOperationDowngradeRequest(ctx context.Context, r *http.Request) (*c_c.AssociateOperationDowngradeRequest, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData c_c.AssociateOperationDowngradeRequest

	defer r.Body.Close()

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		log.Println("UnmarshalOperationDowngradeRequest | NewDecoder/Decode | err:", err)
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return &requestData, nil
}

func (h *Handler) OperationDowngrade(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	reqData, err := UnmarshalOperationDowngradeRequest(ctx, r)
	if err != nil {
		log.Println("OperationDowngrade | UnmarshalOperationDowngradeRequest | err:", err)
		httperror.ResponseError(w, err)
		return
	}
	data, err := h.Controller.Downgrade(ctx, reqData)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalOperationDowngradeResponse(data, w)
}

func MarshalOperationDowngradeResponse(res *c_s.Associate, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
