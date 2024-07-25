package httptransport

import (
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) ListAssignableAssociatesByTaskID(w http.ResponseWriter, r *http.Request, id string) {
	ctx := r.Context()

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	res, err := h.Controller.ListAssignableAssociatesByTaskID(ctx, objectID)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
