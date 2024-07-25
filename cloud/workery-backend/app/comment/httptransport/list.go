package httptransport

import (
	"encoding/json"
	"net/http"
	"strconv"

	com_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	f := &com_s.CommentPaginationListFilter{
		Cursor:    "",
		PageSize:  25,
		SortField: "last_name",
		SortOrder: com_s.OrderAscending,
	}

	// Here is where you extract url parameters.
	query := r.URL.Query()

	cursor := query.Get("cursor")
	if cursor != "" {
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

	sortField := query.Get("sort_field")
	if sortField != "" {
		f.SortField = sortField
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

	// Apply filters it exists in url parameter.

	// Perform our database operation.
	res, err := h.Controller.ListByFilter(ctx, f)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalListResponse(res, w)
}

func MarshalListResponse(res *com_s.CommentPaginationListResult, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
