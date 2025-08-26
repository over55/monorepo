package httptransport

import (
	"encoding/json"
	"net/http"
	"strconv"

	orderincident_s "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Initialize filter with defaults
	f := &orderincident_s.OrderIncidentPaginationListFilter{
		Cursor:    "",
		PageSize:  25,
		SortField: "created_at",                    // Default sort field
		SortOrder: orderincident_s.OrderDescending, // Default to descending (-1)
	}

	// Extract URL parameters
	query := r.URL.Query()

	// Cursor for pagination
	cursor := query.Get("cursor")
	if cursor != "" {
		f.Cursor = cursor
	}

	// Page size
	pageSize := query.Get("page_size")
	if pageSize != "" {
		pageSizeInt, err := strconv.ParseInt(pageSize, 10, 64)
		if err != nil {
			pageSizeInt = 25 // Default on parse error
		}
		if pageSizeInt <= 0 || pageSizeInt > 250 {
			pageSizeInt = 250 // Cap at 250
		}
		f.PageSize = pageSizeInt
	}

	// Sort field
	sortField := query.Get("sort_field")
	if sortField != "" {
		// Validate sort field
		validSortFields := []string{"title", "created_at", "updated_at", "incident_date", "order_wjid"}
		isValid := false
		for _, validField := range validSortFields {
			if sortField == validField {
				isValid = true
				break
			}
		}
		if isValid {
			f.SortField = sortField
		}
		// If invalid, keep default
	}

	// Sort order
	sortOrderStr := query.Get("sort_order")
	if sortOrderStr != "" {
		sortOrder, err := strconv.ParseInt(sortOrderStr, 10, 64)
		if err != nil {
			sortOrder = -1 // Default to descending on parse error
		}
		if sortOrder != 1 && sortOrder != -1 {
			sortOrder = -1 // Default to descending if invalid
		}
		f.SortOrder = int8(sortOrder)
	}

	// Order Work Job ID filter
	orderWJIDStr := query.Get("order_wjid")
	if orderWJIDStr != "" {
		orderWJID, err := strconv.ParseUint(orderWJIDStr, 10, 64)
		if err == nil {
			f.OrderWJID = orderWJID
		}
		// Ignore on parse error
	}

	// Order Type filter
	orderTypeStr := query.Get("order_type")
	if orderTypeStr != "" {
		orderType, err := strconv.ParseInt(orderTypeStr, 10, 64)
		if err == nil && orderType > 0 {
			f.OrderType = int8(orderType)
		}
		// Ignore on parse error or invalid value
	}

	// Search keyword
	searchKeyword := query.Get("search")
	if searchKeyword != "" {
		f.SearchTitle = searchKeyword
	}

	// FIXED: Status filter - handle "open" and "closed" string values
	// The frontend sends "open" or "closed", but we need to interpret this
	// as whether the incident has a closing reason or not
	statusStr := query.Get("status")
	if statusStr != "" {
		if statusStr == "open" {
			// Open incidents have no closing reason
			f.IsOpen = true
		} else if statusStr == "closed" {
			// Closed incidents have a closing reason
			f.IsClosed = true
		} else {
			// Try to parse as numeric for backward compatibility
			status, err := strconv.ParseInt(statusStr, 10, 64)
			if err == nil && status > 0 {
				f.Status = int8(status)
			}
		}
	}

	// FIXED: Initiator filter - was completely missing
	initiatorStr := query.Get("initiator")
	if initiatorStr != "" {
		initiator, err := strconv.ParseInt(initiatorStr, 10, 64)
		if err == nil && initiator > 0 {
			f.Initiator = int8(initiator)
		}
		// Ignore on parse error or invalid value
	}

	// Call controller method to get list and count
	m, err := h.Controller.ListAndCountByFilter(ctx, f)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	// Marshal and send response
	MarshalListResponse(m, w)
}

func MarshalListResponse(res *orderincident_s.OrderIncidentPaginationListAndCountResult, w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
