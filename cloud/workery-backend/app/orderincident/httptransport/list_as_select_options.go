package httptransport

import (
	"encoding/json"
	"net/http"

	sub_s "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) ListAsSelectOptions(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	f := &sub_s.OrderIncidentListFilter{
		PageSize: 1_000_000,
		// LastID:    "",
		SortField:       "title",
		ExcludeArchived: true,
	}

	// Perform our database operation.
	m, err := h.Controller.ListAsSelectOptionByFilter(ctx, f)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalListAsSelectOptionResponse(m, w)
}

func MarshalListAsSelectOptionResponse(res []*sub_s.OrderIncidentAsSelectOption, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
