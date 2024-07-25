package httptransport

import (
	"encoding/json"
	"net/http"

	ti_c "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/controller"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) Count(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	f := &ti_s.TaskItemPaginationListFilter{
		Status:   ti_s.TaskItemStatusActive,
		IsClosed: 2, //0=all,1=true,2=false
	}
	res, err := h.Controller.CountByFilter(ctx, f)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalCountResponse(res, w)
}

func MarshalCountResponse(res *ti_c.TaskItemCountResponseIDO, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
