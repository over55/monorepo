package httptransport

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	c_c "github.com/over55/monorepo/cloud/workery-backend/app/order/controller"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OrderOperationPostponeRequest struct {
	OrderID primitive.ObjectID `bson:"order_id" json:"order_id"`
	Content string             `bson:"content" json:"content"`
}

func UnmarshalOperationPostponeRequest(ctx context.Context, r *http.Request) (*c_c.OrderOperationPostponeRequest, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData c_c.OrderOperationPostponeRequest

	defer r.Body.Close()

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		log.Println("UnmarshalOperationPostponeRequest | NewDecoder/Decode | err:", err)
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return &requestData, nil
}

func (h *Handler) OperationPostpone(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	reqData, err := UnmarshalOperationPostponeRequest(ctx, r)
	if err != nil {
		log.Println("OperationPostpone | UnmarshalOperationPostponeRequest | err:", err)
		httperror.ResponseError(w, err)
		return
	}
	data, err := h.Controller.Postpone(ctx, reqData)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalOperationPostponeResponse(data, w)
}

func MarshalOperationPostponeResponse(res *c_s.Order, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
