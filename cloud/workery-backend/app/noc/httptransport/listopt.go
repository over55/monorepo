package httptransport

import (
	"encoding/json"
	"net/http"
	"strconv"

	noc_s "github.com/over55/monorepo/cloud/workery-backend/app/noc/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) ListAsSelectOptions(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	f := &noc_s.NationalOccupationalClassificationPaginationListFilter{
		PageSize: 1_000_000,
		// LastID:    "",
		SortField: "text",
		SortOrder: 1, // 1=ascending | -1=descending
		Status:    noc_s.StatusActive,
	}

	// Here is where you extract url parameters.
	query := r.URL.Query()

	statusStr := query.Get("status")
	if statusStr != "" {
		status, _ := strconv.ParseInt(statusStr, 10, 64)
		f.Status = int8(status)
	}

	// Perform our database operation.
	m, err := h.Controller.ListAsSelectOptionByFilter(ctx, f)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalListAsSelectOptionResponse(m, w)
}

func MarshalListAsSelectOptionResponse(res []*noc_s.NationalOccupationalClassificationAsSelectOption, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
