package httptransport

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"

	"go.mongodb.org/mongo-driver/bson/primitive"

	a_c "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/controller"
	a_s "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) unmarshalOperationCreateAttachmentRequest(ctx context.Context, r *http.Request) (*a_c.OrderIncidentOperationCreateAttachmentRequest, error) {
	defer r.Body.Close()

	// Parse the multipart form data
	err := r.ParseMultipartForm(32 << 20) // Limit the maximum memory used for parsing to 32MB
	if err != nil {
		h.Logger.Error("failed parse multipart form", slog.Any("err", err))
		return nil, err
	}

	// Get the values of form fields
	title := r.FormValue("title")
	description := r.FormValue("description")
	orderIncidentID := r.FormValue("order_incident_id")

	// Get the uploaded file from the request
	file, header, err := r.FormFile("file")
	if err != nil {
		h.Logger.Error("failed reading file", slog.Any("err", err))
		// return nil, err, http.StatusInternalServerError
	}

	oiid, err := primitive.ObjectIDFromHex(orderIncidentID)
	if err != nil {
		h.Logger.Error("failed converting to object id", slog.Any("err", err))
	}
	// Initialize our array which will store all the results from the remote server.
	requestData := &a_c.OrderIncidentOperationCreateAttachmentRequest{
		OrderIncidentID: oiid,
		Title:           title,
		Description:     description,
	}

	if header != nil {
		// Extract filename and filetype from the file header
		requestData.FileName = header.Filename
		requestData.FileType = header.Header.Get("Content-Type")
		requestData.File = file
	}
	return requestData, nil
}

func (h *Handler) OperationCreateAttachment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	data, err := h.unmarshalOperationCreateAttachmentRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	attachment, err := h.Controller.CreateAttachment(ctx, data)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalOperationCreateAttachmentResponse(attachment, w)
}

func MarshalOperationCreateAttachmentResponse(res *a_s.OrderIncident, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
