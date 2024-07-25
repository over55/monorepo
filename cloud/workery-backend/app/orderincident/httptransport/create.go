package httptransport

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"strconv"

	orderincident_c "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/controller"
	orderincident_s "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (h *Handler) unmarshalCreateRequest(ctx context.Context, r *http.Request) (*orderincident_c.OrderIncidentCreateRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData orderincident_c.OrderIncidentCreateRequestIDO

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

	// FormattedOrderID

	id, _ := primitive.ObjectIDFromHex(requestData.OrderID)
	requestData.FormattedOrderID = id

	// FormattedOrderWJID

	wjid, _ := strconv.ParseInt(requestData.OrderID, 10, 64)
	requestData.FormattedOrderWJID = uint64(wjid)

	return &requestData, nil
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	data, err := h.unmarshalCreateRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	res, err := h.Controller.Create(ctx, data)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalCreateResponse(res, w)
}

func MarshalCreateResponse(res *orderincident_s.OrderIncident, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
