package httptransport

import (
	"encoding/json"
	"net/http"

	gateway_c "github.com/over55/monorepo/cloud/workery-backend/app/gateway/controller"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) Profile(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	profile, err := h.Controller.Profile(ctx)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}
	MarshalProfileResponse(profile, w)
}

func MarshalProfileResponse(responseData *gateway_c.ProfileResponse, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&responseData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
