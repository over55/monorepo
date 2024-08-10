package httptransport

import (
	"encoding/json"
	"net/http"
	"strconv"

	noc_s "github.com/over55/monorepo/cloud/workery-backend/app/noc/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	f := &noc_s.NationalOccupationalClassificationPaginationListFilter{
		Cursor:    "",
		PageSize:  25,
		SortField: "_id",
		SortOrder: 1, // 1=ascending | -1=descending
		Status:    noc_s.StatusActive,
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
		f.SortOrder = noc_s.OrderAscending
	}
	if sortOrder == "DESC" {
		f.SortOrder = noc_s.OrderDescending
	}

	searchKeyword := query.Get("search")
	if searchKeyword != "" {
		f.SearchText = searchKeyword
	}

	statusStr := query.Get("status")
	if statusStr != "" {
		status, _ := strconv.ParseInt(statusStr, 10, 64)
		if status > 0 {
			f.Status = int8(status)
		}
	}

	code := query.Get("code")
	if code != "" {
		f.CodeStr = code
	}

	unitGroupTitle := query.Get("ugt")
	if unitGroupTitle != "" {
		f.UnitGroupTitle = unitGroupTitle
	}

	list, err := h.Controller.ListAndCountByFilter(ctx, f)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalListResponse(list, w)
}

func MarshalListResponse(res *noc_s.NationalOccupationalClassificationPaginationListAndCountResult, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}