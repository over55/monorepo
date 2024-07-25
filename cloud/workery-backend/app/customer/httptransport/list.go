package httptransport

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/bartmika/timekit"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	f := &c_s.CustomerPaginationListFilter{
		Cursor:    "",
		PageSize:  25,
		SortField: "last_name",
		SortOrder: c_s.OrderAscending,
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
			pageSize = 25
		}
		f.PageSize = pageSize
	}

	sortField := query.Get("sort_field")
	if sortField != "" {
		f.SortField = sortField
	}
	sortOrder := query.Get("sort_order")
	if sortOrder == "ASC" {
		f.SortOrder = 1
	}
	if sortOrder == "DESC" {
		f.SortOrder = -1
	}

	typeOfStr := query.Get("type")
	if typeOfStr != "" {
		typeOf, _ := strconv.ParseInt(typeOfStr, 10, 64)
		if typeOf > 0 {
			f.Type = int8(typeOf)

		}
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
	firstName := query.Get("first_name")
	if firstName != "" {
		f.FirstName = firstName
	}
	lastName := query.Get("last_name")
	if lastName != "" {
		f.LastName = lastName
	}
	email := query.Get("email")
	if email != "" {
		f.Email = email
	}
	phone := query.Get("phone")
	if phone != "" {
		f.Phone = phone
	}
	organizationName := query.Get("organization_name")
	if organizationName != "" {
		f.OrganizationName = organizationName
	}
	tenantID := query.Get("tenant_id")
	if tenantID != "" {
		tenantID, err := primitive.ObjectIDFromHex(tenantID)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.TenantID = tenantID
	}
	createdAtGTEStr := query.Get("created_at_gte")
	if createdAtGTEStr != "" {
		createdAtGTE, err := timekit.ParseJavaScriptTimeString(createdAtGTEStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.CreatedAtGTE = createdAtGTE
	}

	// Perform our database operation.
	res, err := h.Controller.LiteListAndCountByFilter(ctx, f)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalLiteListResponse(res, w)
}

func MarshalLiteListResponse(res *c_s.CustomerPaginationLiteListAndCountResult, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
