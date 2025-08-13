package httptransport

import (
	"encoding/json"
	"net/http"
	"strconv"

	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (h *Handler) LiteList(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	f := &o_s.OrderPaginationListFilter{
		Cursor:    "",
		PageSize:  25,
		SortField: "assignment_date",
		SortOrder: o_s.SortOrderDescending,
		Page:      1, // Default to page 1
	}

	// Here is where you extract url parameters.
	query := r.URL.Query()

	cursor := query.Get("cursor")
	if cursor != "" {
		f.Cursor = cursor
	}

	// Handle page-based pagination
	pageStr := query.Get("page")
	if pageStr != "" {
		pageInt, err := strconv.ParseInt(pageStr, 10, 64)
		if err == nil && pageInt > 0 {
			f.Page = pageInt
		}
	}

	pageSizeStr := query.Get("page_size")
	if pageSizeStr != "" {
		pageSizeInt, err := strconv.ParseInt(pageSizeStr, 10, 64)
		if err == nil {
			if pageSizeInt == 0 || pageSizeInt > 250 {
				pageSizeInt = 250
			}
			f.PageSize = pageSizeInt
		}
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
		typeOfInt, err := strconv.ParseInt(typeOfStr, 10, 64)
		if err == nil && typeOfInt > 0 {
			f.Type = int8(typeOfInt)
		}
	}

	statusStr := query.Get("status")
	if statusStr != "" {
		statusInt, err := strconv.ParseInt(statusStr, 10, 64)
		if err == nil && statusInt > 0 {
			f.Status = int8(statusInt)
		}
	}

	// Apply search text if it exists in url parameter.
	searchKeyword := query.Get("search")
	if searchKeyword != "" {
		f.SearchText = searchKeyword
	}

	// Apply filters it exists in url parameter.
	customerOrganizationName := query.Get("customer_organization_name")
	if customerOrganizationName != "" {
		f.CustomerOrganizationName = customerOrganizationName
	}
	customerFirstName := query.Get("customer_first_name")
	if customerFirstName != "" {
		f.CustomerFirstName = customerFirstName
	}
	customerLastName := query.Get("customer_last_name")
	if customerLastName != "" {
		f.CustomerLastName = customerLastName
	}
	customerEmail := query.Get("customer_email")
	if customerEmail != "" {
		f.CustomerEmail = customerEmail
	}
	customerPhone := query.Get("customer_phone")
	if customerPhone != "" {
		f.CustomerPhone = customerPhone
	}
	customerID := query.Get("customer_id")
	if customerID != "" {
		customerIDObj, err := primitive.ObjectIDFromHex(customerID)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.CustomerID = customerIDObj
	}

	associateOrganizationName := query.Get("associate_organization_name")
	if associateOrganizationName != "" {
		f.AssociateOrganizationName = associateOrganizationName
	}
	associateFirstName := query.Get("associate_first_name")
	if associateFirstName != "" {
		f.AssociateFirstName = associateFirstName
	}
	associateLastName := query.Get("associate_last_name")
	if associateLastName != "" {
		f.AssociateLastName = associateLastName
	}
	associateEmail := query.Get("associate_email")
	if associateEmail != "" {
		f.AssociateEmail = associateEmail
	}
	associatePhone := query.Get("associate_phone")
	if associatePhone != "" {
		f.AssociatePhone = associatePhone
	}
	associateID := query.Get("associate_id")
	if associateID != "" {
		associateIDObj, err := primitive.ObjectIDFromHex(associateID)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.AssociateID = associateIDObj
	}
	orderWJID := query.Get("order_wjid")
	if orderWJID != "" {
		f.OrderWJID = orderWJID
	}

	tenantID := query.Get("tenant_id")
	if tenantID != "" {
		tenantIDObj, err := primitive.ObjectIDFromHex(tenantID)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.TenantID = tenantIDObj
	}

	// Perform our database operation.
	res, err := h.Controller.LiteListAndCountByFilter(ctx, f)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalPaginatedLiteListResponse(res, w)
}

func MarshalPaginatedLiteListResponse(res *o_s.OrderPaginationLiteListAndCountResult, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
