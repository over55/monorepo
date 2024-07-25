package httptransport

import (
	"context"
	"encoding/json"
	"net/http"

	usr_c "github.com/over55/monorepo/cloud/workery-backend/app/associate/controller"
	usr_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"log/slog"
)

func (h *Handler) unmarshalArchiveRequest(ctx context.Context, r *http.Request) (*usr_c.AssociateOperationArchiveRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData *usr_c.AssociateOperationArchiveRequestIDO

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

func (h *Handler) OperationArchive(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	data, err := h.unmarshalArchiveRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	cust, err := h.Controller.Archive(ctx, data)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}
	MarshalArchiveResponse(cust, w)
}

func MarshalArchiveResponse(res *usr_s.Associate, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
