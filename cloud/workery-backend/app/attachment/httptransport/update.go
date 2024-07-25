package httptransport

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	a_c "github.com/over55/monorepo/cloud/workery-backend/app/attachment/controller"
	sub_c "github.com/over55/monorepo/cloud/workery-backend/app/attachment/controller"
	sub_s "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func UnmarshalUpdateRequest(ctx context.Context, r *http.Request) (*sub_c.AttachmentUpdateRequestIDO, error) {
	defer r.Body.Close()

	// Parse the multipart form data
	err := r.ParseMultipartForm(32 << 20) // Limit the maximum memory used for parsing to 32MB
	if err != nil {
		log.Println("UnmarshalUpdateRequest:ParseMultipartForm:err:", err)
		return nil, err
	}

	// Get the values of form fields
	title := r.FormValue("title")
	description := r.FormValue("description")

	// Get the uploaded file from the request
	file, header, err := r.FormFile("file")
	if err != nil {
		log.Println("UnmarshalUpdateRequest:FormFile:err:", err)
		// return nil, err, http.StatusInternalServerError
	}

	// Initialize our array which will store all the results from the remote server.
	requestData := &a_c.AttachmentUpdateRequestIDO{
		Title:       title,
		Description: description,
	}

	if header != nil {
		// Extract filename and filetype from the file header
		requestData.FileName = header.Filename
		requestData.FileType = header.Header.Get("Content-Type")
		requestData.File = file
	}
	return requestData, nil
}

func (h *Handler) UpdateByID(w http.ResponseWriter, r *http.Request, id string) {
	ctx := r.Context()

	data, err := UnmarshalUpdateRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	aid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Println("UnmarshalUpdateRequest: primitive.ObjectIDFromHex:err:", err)
		return
	}
	data.ID = aid

	attachment, err := h.Controller.UpdateByID(ctx, data)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalUpdateResponse(attachment, w)
}

func MarshalUpdateResponse(res *sub_s.Attachment, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
