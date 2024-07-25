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

type OrderOperationTransferRequest struct {
	OrderID primitive.ObjectID `bson:"order_id" json:"order_id"`
	Content string             `bson:"content" json:"content"`
}

func UnmarshalOperationTransferRequest(ctx context.Context, r *http.Request) (*c_c.OrderOperationTransferRequest, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData c_c.OrderOperationTransferRequest

	defer r.Body.Close()

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		log.Println("UnmarshalOperationTransferRequest | NewDecoder/Decode | err:", err)
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return &requestData, nil
}

func (h *Handler) OperationTransfer(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	reqData, err := UnmarshalOperationTransferRequest(ctx, r)
	if err != nil {
		log.Println("OperationTransfer | UnmarshalOperationTransferRequest | err:", err)
		httperror.ResponseError(w, err)
		return
	}
	data, err := h.Controller.Transfer(ctx, reqData)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalOperationTransferResponse(data, w)
}

func MarshalOperationTransferResponse(res *c_s.Order, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
