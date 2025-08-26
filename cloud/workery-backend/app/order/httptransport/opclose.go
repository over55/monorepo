package httptransport

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log"
	"log/slog"
	"net/http"

	c_c "github.com/over55/monorepo/cloud/workery-backend/app/order/controller"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OrderOperationCloseRequest struct {
	OrderID primitive.ObjectID `bson:"order_id" json:"order_id"`
	Content string             `bson:"content" json:"content"`
}

func (h *Handler) unmarshalOperationCloseRequest(ctx context.Context, r *http.Request) (*c_c.OrderOperationCloseRequest, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData c_c.OrderOperationCloseRequest

	defer r.Body.Close()

	var rawJSON bytes.Buffer
	teeReader := io.TeeReader(r.Body, &rawJSON) // TeeReader allows you to read the JSON and capture it

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(teeReader).Decode(&requestData) // [1]
	if err != nil {
		h.Logger.Error("decoding error",
			slog.Any("err", err),
			slog.String("json", rawJSON.String()),
		)
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	return &requestData, nil
}

func (h *Handler) OperationClose(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	reqData, err := h.unmarshalOperationCloseRequest(ctx, r)
	if err != nil {
		log.Println("OperationClose | UnmarshalOperationCloseRequest | err:", err)
		httperror.ResponseError(w, err)
		return
	}
	data, err := h.Controller.Close(ctx, reqData)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalOperationCloseResponse(data, w)
}

func MarshalOperationCloseResponse(res *c_s.Order, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
