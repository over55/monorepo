package httptransport

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"go.mongodb.org/mongo-driver/bson/primitive"

	usr_c "github.com/over55/monorepo/cloud/workery-backend/app/user/controller"
	usr_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func UnmarshalUpdateRequest(ctx context.Context, r *http.Request) (*usr_c.UserUpdateRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData usr_c.UserUpdateRequestIDO

	defer r.Body.Close()

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(r.Body).Decode(&requestData) // [1]
	if err != nil {
		log.Println("user | UnmarshalUpdateRequest | err:", err)
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	// Perform our validation and return validation error on any issues detected.
	if err := ValidateUpdateRequest(&requestData); err != nil {
		return nil, err
	}

	return &requestData, nil
}

func ValidateUpdateRequest(dirtyData *usr_c.UserUpdateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.TenantID.IsZero() {
		e["tenant_id"] = "missing value"
	}
	if dirtyData.Role == 0 {
		e["role"] = "missing value"
	}
	if dirtyData.FirstName == "" {
		e["first_name"] = "missing value"
	}
	if dirtyData.LastName == "" {
		e["last_name"] = "missing value"
	}
	if dirtyData.Email == "" {
		e["email"] = "missing value"
	}
	if len(dirtyData.Email) > 255 {
		e["email"] = "too long"
	}
	if dirtyData.Phone == "" {
		e["phone"] = "missing value"
	}
	if dirtyData.Country == "" {
		e["country"] = "missing value"
	}
	if dirtyData.Region == "" {
		e["region"] = "missing value"
	}
	if dirtyData.City == "" {
		e["city"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (h *Handler) UpdateByID(w http.ResponseWriter, r *http.Request, id string) {
	ctx := r.Context()

	data, err := UnmarshalUpdateRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	data.ID, err = primitive.ObjectIDFromHex(id)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	customer, err := h.Controller.UpdateByID(ctx, data)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalUpdateResponse(customer, w)
}

func MarshalUpdateResponse(res *usr_s.User, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
