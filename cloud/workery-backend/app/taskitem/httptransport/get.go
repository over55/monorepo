package httptransport

import (
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/bson/primitive"

	a_c "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request, id string) {
	ctx := r.Context()

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	m, err := h.Controller.GetByID(ctx, objectID)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalDetailResponse(m, w)
}

func MarshalDetailResponse(res *a_c.TaskItem, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
