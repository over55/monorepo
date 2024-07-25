package httptransport

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	c_c "github.com/over55/monorepo/cloud/workery-backend/app/customer/controller"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func UnmarshalOperationAvatarRequest(ctx context.Context, r *http.Request) (*c_c.CustomerOperationAvatarRequest, error) {
	defer r.Body.Close()

	// Parse the multipart form data
	err := r.ParseMultipartForm(32 << 20) // Limit the maximum memory used for parsing to 32MB
	if err != nil {
		log.Println("UnmarshalCreateRequest:ParseMultipartForm:err:", err)
		return nil, err
	}

	// Get the values of form fields
	customerIDStr := r.FormValue("customer_id")

	// Get the uploaded file from the request
	file, header, err := r.FormFile("file")
	if err != nil {
		log.Println("UnmarshalCmsImageCreateRequest:FormFile:err:", err)
		// return nil, err, http.StatusInternalServerError
	}

	customerID, err := primitive.ObjectIDFromHex(customerIDStr)
	if err != nil {
		log.Println("UnmarshalCmsImageCreateRequest: primitive.ObjectIDFromHex:err:", err)
	}

	// Initialize our array which will store all the results from the remote server.
	requestData := &c_c.CustomerOperationAvatarRequest{
		CustomerID: customerID,
	}
	if header != nil {
		// Extract filename and filetype from the file header
		requestData.FileName = header.Filename
		requestData.FileType = header.Header.Get("Content-Type")
		requestData.File = file
	}
	return requestData, nil
}

func (h *Handler) OperationAvatar(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	reqData, err := UnmarshalOperationAvatarRequest(ctx, r)
	if err != nil {
		log.Println("OperationAvatar | UnmarshalOperationAvatarRequest | err:", err)
		httperror.ResponseError(w, err)
		return
	}
	data, err := h.Controller.Avatar(ctx, reqData)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalOperationAvatarResponse(data, w)
}

func MarshalOperationAvatarResponse(res *c_s.Customer, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
