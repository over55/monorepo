package httptransport

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	c_c "github.com/over55/monorepo/cloud/workery-backend/app/staff/controller"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func UnmarshalOperationUpgradeRequest(ctx context.Context, r *http.Request) (*c_c.StaffOperationUpgradeRequest, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData c_c.StaffOperationUpgradeRequest

	defer r.Body.Close()

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		log.Println("UnmarshalOperationUpgradeRequest | NewDecoder/Decode | err:", err)
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return &requestData, nil
}

func (h *Handler) OperationUpgrade(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	reqData, err := UnmarshalOperationUpgradeRequest(ctx, r)
	if err != nil {
		log.Println("OperationUpgrade | UnmarshalOperationUpgradeRequest | err:", err)
		httperror.ResponseError(w, err)
		return
	}
	data, err := h.Controller.Upgrade(ctx, reqData)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalOperationUpgradeResponse(data, w)
}

func MarshalOperationUpgradeResponse(res *c_s.Staff, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}