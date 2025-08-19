// File Path: cloud/workery-backend/app/comment/httptransport/list.go

package httptransport

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"

	com_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	f := &com_s.CommentPaginationListFilter{
		Cursor:    "",
		PageSize:  25,
		SortField: "created_at", // FIXED: Must be "created_at" or "modified_at"
		SortOrder: com_s.OrderDescending,
	}

	// Here is where you extract url parameters.
	query := r.URL.Query()

	cursor := query.Get("cursor")
	if cursor != "" {
		f.Cursor = cursor
	}

	pageSize := query.Get("page_size")
	if pageSize != "" {
		pageSizeInt, _ := strconv.ParseInt(pageSize, 10, 64)
		if pageSizeInt == 0 || pageSizeInt > 1000 {
			pageSizeInt = 1000 // Default to 1000 if invalid or too large
		}
		f.PageSize = pageSizeInt
	}

	sortField := query.Get("sort_field")
	if sortField != "" {
		// Validate sort field - only created_at and modified_at are supported
		if sortField == "created_at" || sortField == "modified_at" {
			f.SortField = sortField
		}
	}

	sortOrder := query.Get("sort_order")
	if sortOrder == "ASC" {
		f.SortOrder = com_s.OrderAscending
	}
	if sortOrder == "DESC" {
		f.SortOrder = com_s.OrderDescending
	}

	statusStr := query.Get("status")
	if statusStr != "" {
		status, _ := strconv.ParseInt(statusStr, 10, 64)
		if status > 0 {
			f.Status = int8(status)
		}
	}

	// Apply search text if it exists in url parameter.
	searchKeyword := query.Get("search")
	if searchKeyword != "" {
		f.SearchText = searchKeyword
	}

	// CRITICAL: Extract associate_id filter
	associateID := query.Get("associate_id")
	if associateID != "" {
		associateIDObj, err := primitive.ObjectIDFromHex(associateID)
		if err != nil {
			h.Logger.Error("invalid associate_id", slog.String("associate_id", associateID), slog.Any("error", err))
			httperror.ResponseError(w, err)
			return
		}
		f.AssociateID = associateIDObj
		h.Logger.Debug("filtering by associate_id", slog.Any("associate_id", associateIDObj))
	}

	// Extract customer_id filter
	customerID := query.Get("customer_id")
	if customerID != "" {
		customerIDObj, err := primitive.ObjectIDFromHex(customerID)
		if err != nil {
			h.Logger.Error("invalid customer_id", slog.String("customer_id", customerID), slog.Any("error", err))
			httperror.ResponseError(w, err)
			return
		}
		f.CustomerID = customerIDObj
	}

	// Extract order_id filter
	orderID := query.Get("order_id")
	if orderID != "" {
		orderIDObj, err := primitive.ObjectIDFromHex(orderID)
		if err != nil {
			h.Logger.Error("invalid order_id", slog.String("order_id", orderID), slog.Any("error", err))
			httperror.ResponseError(w, err)
			return
		}
		f.OrderID = orderIDObj
	}

	// Extract order_wjid filter
	orderWJID := query.Get("order_wjid")
	if orderWJID != "" {
		wjid, err := strconv.ParseUint(orderWJID, 10, 64)
		if err != nil {
			h.Logger.Error("invalid order_wjid", slog.String("order_wjid", orderWJID), slog.Any("error", err))
			httperror.ResponseError(w, err)
			return
		}
		f.OrderWJID = wjid
	}

	// Extract staff_id filter
	staffID := query.Get("staff_id")
	if staffID != "" {
		staffIDObj, err := primitive.ObjectIDFromHex(staffID)
		if err != nil {
			h.Logger.Error("invalid staff_id", slog.String("staff_id", staffID), slog.Any("error", err))
			httperror.ResponseError(w, err)
			return
		}
		f.StaffID = staffIDObj
	}

	// Extract belongs_to filter
	belongsToStr := query.Get("belongs_to")
	if belongsToStr != "" {
		belongsTo, _ := strconv.ParseInt(belongsToStr, 10, 64)
		if belongsTo > 0 {
			f.BelongsTo = int8(belongsTo)
			h.Logger.Debug("filtering by belongs_to", slog.Int("belongs_to", int(belongsTo)))
		}
	}

	// Log the complete filter for debugging
	h.Logger.Debug("comment list filter",
		slog.Any("associate_id", f.AssociateID),
		slog.Any("customer_id", f.CustomerID),
		slog.Any("order_id", f.OrderID),
		slog.Any("order_wjid", f.OrderWJID),
		slog.Any("belongs_to", f.BelongsTo),
		slog.String("sort_field", f.SortField),
		slog.Int("sort_order", int(f.SortOrder)),
		slog.String("cursor", f.Cursor),
		slog.Int64("page_size", f.PageSize),
	)

	// Perform our database operation.
	res, err := h.Controller.ListByFilter(ctx, f)
	if err != nil {
		h.Logger.Error("failed to list comments", slog.Any("error", err))
		httperror.ResponseError(w, err)
		return
	}

	h.Logger.Debug("comment list results", slog.Int("count", len(res.Results)))

	MarshalListResponse(res, w)
}

func MarshalListResponse(res *com_s.CommentPaginationListResult, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
