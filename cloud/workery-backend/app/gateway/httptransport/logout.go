package httptransport

import (
	"net/http"

	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if err := h.Controller.Logout(ctx); err != nil {
		httperror.ResponseError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
