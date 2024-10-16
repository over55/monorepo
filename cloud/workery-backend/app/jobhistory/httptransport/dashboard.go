package httptransport

import (
	"encoding/json"
	"net/http"

	way_c "github.com/over55/monorepo/cloud/workery-backend/app/jobhistory/controller"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) JobHistory(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	profile, err := h.Controller.JobHistory(ctx)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}
	MarshalJobHistoryResponse(profile, w)
}

func MarshalJobHistoryResponse(responseData *way_c.JobHistoryResponseIDO, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&responseData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
