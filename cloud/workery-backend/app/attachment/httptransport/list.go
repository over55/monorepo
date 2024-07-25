package httptransport

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"

	"go.mongodb.org/mongo-driver/bson/primitive"

	sub_s "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	f := &sub_s.AttachmentListFilter{
		Cursor: primitive.NilObjectID,
		// OwnershipID:     primitive.NilObjectID,
		PageSize:        25,
		SortField:       "public_id",
		SortOrder:       -1, // 1=ascending | -1=descending
		ExcludeArchived: true,
	}

	// Here is where you extract url parameters.
	query := r.URL.Query()

	cursor := query.Get("cursor")
	if cursor != "" {
		cursor, err := primitive.ObjectIDFromHex(cursor)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.Cursor = cursor
	}

	pageSize := query.Get("page_size")
	if pageSize != "" {
		pageSize, _ := strconv.ParseInt(pageSize, 10, 64)
		if pageSize == 0 || pageSize > 250 {
			pageSize = 250
		}
		f.PageSize = pageSize
	}

	// DEVELOPERS NOTE:
	// The next two steps are used to filter attachments based on role and id.

	// STEP 1 OF 2
	var ownershipID primitive.ObjectID
	ownershipIDStr := query.Get("ownership_id")
	if ownershipIDStr != "" {
		oID, err := primitive.ObjectIDFromHex(ownershipIDStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		ownershipID = oID
	}

	// STEP 2 OF 2.
	ownershipRoleStr := query.Get("ownership_role")
	if ownershipRoleStr != "" {
		ownershipRole, _ := strconv.ParseInt(ownershipRoleStr, 10, 64)
		switch ownershipRole {
		case sub_s.AttachmentTypeCustomer:
			f.CustomerID = ownershipID
			break
		case sub_s.AttachmentTypeAssociate:
			f.AssociateID = ownershipID
			break
		case sub_s.AttachmentTypeOrder:
			f.OrderID = ownershipID
			break
		case sub_s.AttachmentTypeStaff:
			f.StaffID = ownershipID
			break
		default:
			h.Logger.Warn("ownership role does not exist",
				slog.Any("ownership_id", ownershipID),
				slog.Int("ownership_role", int(ownershipRole)))
			break
		}
	}

	m, err := h.Controller.ListByFilter(ctx, f)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalListResponse(m, w)
}

func MarshalListResponse(res *sub_s.AttachmentListResult, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (h *Handler) ListAsSelectOptionByFilter(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	f := &sub_s.AttachmentListFilter{
		Cursor:          primitive.NilObjectID,
		PageSize:        6,
		SortField:       "_id",
		SortOrder:       1, // 1=ascending | -1=descending
		ExcludeArchived: true,
	}

	m, err := h.Controller.ListAsSelectOptionByFilter(ctx, f)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalListAsSelectOptionResponse(m, w)
}

func MarshalListAsSelectOptionResponse(res []*sub_s.AttachmentAsSelectOption, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
