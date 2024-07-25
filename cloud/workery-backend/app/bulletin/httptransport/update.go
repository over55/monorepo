package httptransport

import (
	"context"
	"encoding/json"
	"net/http"

	bulletin_c "github.com/over55/monorepo/cloud/workery-backend/app/bulletin/controller"
	bulletin_s "github.com/over55/monorepo/cloud/workery-backend/app/bulletin/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func UnmarshalUpdateRequest(ctx context.Context, r *http.Request) (*bulletin_c.BulletinUpdateRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData bulletin_c.BulletinUpdateRequestIDO

	defer r.Body.Close()

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return &requestData, nil
}

func (h *Handler) UpdateByID(w http.ResponseWriter, r *http.Request, id string) {
	ctx := r.Context()

	data, err := UnmarshalUpdateRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	org, err := h.Controller.UpdateByID(ctx, data)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalUpdateResponse(org, w)
}

func MarshalUpdateResponse(res *bulletin_s.Bulletin, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
