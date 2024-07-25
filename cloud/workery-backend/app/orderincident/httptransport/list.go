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

	f := &orderincident_s.OrderIncidentPaginationListFilter{
		Cursor:    "",
		PageSize:  25,
		SortField: "title",
		SortOrder: orderincident_s.OrderAscending,
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

	sortOrderStr := query.Get("sort_order")
	if sortOrderStr != "" {
		sortOrder, _ := strconv.ParseInt(sortOrderStr, 10, 64)
		if sortOrder != 1 && sortOrder != -1 {
			sortOrder = 1
		}
		f.SortOrder = int8(sortOrder)
	}

	orderWJIDStr := query.Get("order_wjid")
	if sortOrderStr != "" {
		orderWJID, _ := strconv.ParseInt(orderWJIDStr, 10, 64)
		f.OrderWJID = uint64(orderWJID)
	}

	orderType := query.Get("order_type")
	if pageSize != "" {
		orderType, _ := strconv.ParseInt(orderType, 10, 64)
		f.OrderType = int8(orderType)
	}

	searchKeyword := query.Get("search")
	if searchKeyword != "" {
		f.SearchTitle = searchKeyword
	}

	statusStr := query.Get("status")
	if statusStr != "" {
		status, _ := strconv.ParseInt(statusStr, 10, 64)
		if status > 0 {
			f.Status = int8(status)
		}
	}

	m, err := h.Controller.ListAndCountByFilter(ctx, f)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalListResponse(m, w)
}

func MarshalListResponse(res *orderincident_s.OrderIncidentPaginationListAndCountResult, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
