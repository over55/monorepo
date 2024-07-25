package httptransport

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"

	c_c "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/controller"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OrderIncidentOperationCreateCommentRequest struct {
	OrderID primitive.ObjectID `bson:"order_id" json:"order_id"`
	Content string             `bson:"content" json:"content"`
}

func (h *Handler) unmarshalOperationCreateCommentRequest(ctx context.Context, r *http.Request) (*c_c.OrderIncidentOperationCreateCommentRequest, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData c_c.OrderIncidentOperationCreateCommentRequest

	defer r.Body.Close()

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		h.Logger.Error("failed unmarshalling", slog.Any("err", err))
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return &requestData, nil
}

func (h *Handler) OperationCreateComment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	reqData, err := h.unmarshalOperationCreateCommentRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}
	data, err := h.Controller.CreateComment(ctx, reqData)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalOperationCreateCommentResponse(data, w)
}

func MarshalOperationCreateCommentResponse(res *c_s.OrderIncident, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
