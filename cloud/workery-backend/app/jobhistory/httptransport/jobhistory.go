package httptransport

import (
	"encoding/json"
	"net/http"

	way_c "github.com/over55/monorepo/cloud/workery-backend/app/jobhistory/controller"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) JobHistory(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Here is where you extract url parameters.
	query := r.URL.Query()

	filterBy := query.Get("filter_by")
	if filterBy == "" {
		err := httperror.NewForBadRequestWithSingleField("filter_by", "missing value")
		httperror.ResponseError(w, err)
		return
	}

	profile, err := h.Controller.JobHistory(ctx, filterBy)
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
