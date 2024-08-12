package httptransport

import (
	"context"
	"encoding/json"
	"net/http"

	"log/slog"

	usr_c "github.com/over55/monorepo/cloud/workery-backend/app/customer/controller"
	usr_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) unmarshalBanRequest(ctx context.Context, r *http.Request) (*usr_c.CustomerOperationBanRequest, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData *usr_c.CustomerOperationBanRequest

	defer r.Body.Close()

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		h.Logger.Error("decoding error", slog.Any("err", err))
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return requestData, nil
}

func (h *Handler) OperationBan(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	data, err := h.unmarshalBanRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	cust, err := h.Controller.Ban(ctx, data)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}
	MarshalBanResponse(cust, w)
}

func MarshalBanResponse(res *usr_s.Customer, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
