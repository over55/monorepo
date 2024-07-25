package httptransport

import (
	"net/http"
	"strconv"

	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) DeleteByWJID(w http.ResponseWriter, r *http.Request, idStr string) {
	ctx := r.Context()

	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	if err := h.Controller.DeleteByWJID(ctx, uint64(id)); err != nil {
		httperror.ResponseError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
