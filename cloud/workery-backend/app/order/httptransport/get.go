package httptransport

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"

	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) GetByWJID(w http.ResponseWriter, r *http.Request, idStr string) {
	ctx := r.Context()

	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.Logger.Debug("failed parsing",
			slog.Any("id", idStr),
			slog.Any("err", err))
		httperror.ResponseError(w, err)
		return
	}

	m, err := h.Controller.GetByWJID(ctx, uint64(id))
	if err != nil {
		h.Logger.Debug("failed getting order by wjid",
			slog.Any("id", idStr),
			slog.Any("err", err))
		httperror.ResponseError(w, err)
		return
	}

	h.marshalDetailResponse(m, w)
}

func (h *Handler) marshalDetailResponse(res *o_s.Order, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		h.Logger.Error("failed encoding order",
			slog.Any("err", err))
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
