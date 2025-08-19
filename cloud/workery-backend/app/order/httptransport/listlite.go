// File Path: cloud/workery-backend/app/order/httptransport/listlite.go

package httptransport

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/bartmika/timekit"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (h *Handler) LiteList(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	f := &o_s.OrderPaginationListFilter{
		Cursor:    "",
		PageSize:  25,
		SortField: "created_at",
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

	// Handle sort_by parameter which comes as "field,order" (e.g., "created_at,DESC")
	sortBy := query.Get("sort_by")
	if sortBy != "" {
		parts := strings.Split(sortBy, ",")
		if len(parts) == 2 {
			f.SortField = strings.TrimSpace(parts[0])
			orderStr := strings.ToUpper(strings.TrimSpace(parts[1]))
			if orderStr == "ASC" {
				f.SortOrder = o_s.SortOrderAscending
			} else if orderStr == "DESC" {
				f.SortOrder = o_s.SortOrderDescending
			}
		}
	}

	// Legacy sort parameters (for backward compatibility)
	sortField := query.Get("sort_field")
	if sortField != "" && sortBy == "" { // Only use if sort_by wasn't provided
		f.SortField = sortField
	}
	sortOrder := query.Get("sort_order")
	if sortOrder != "" && sortBy == "" { // Only use if sort_by wasn't provided
		if sortOrder == "ASC" {
			f.SortOrder = o_s.SortOrderAscending
		} else if sortOrder == "DESC" {
			f.SortOrder = o_s.SortOrderDescending
		}
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

	// ===== DATE FILTERS HANDLING USING timekit =====

	// Start Date Filters
	startDateGTEStr := query.Get("start_date_gte")
	if startDateGTEStr != "" {
		startDateGTE, err := timekit.ParseJavaScriptTimeString(startDateGTEStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.StartDateGTE = startDateGTE
	}

	startDateGTStr := query.Get("start_date_gt")
	if startDateGTStr != "" {
		startDateGT, err := timekit.ParseJavaScriptTimeString(startDateGTStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.StartDateGT = startDateGT
	}

	startDateLTEStr := query.Get("start_date_lte")
	if startDateLTEStr != "" {
		startDateLTE, err := timekit.ParseJavaScriptTimeString(startDateLTEStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.StartDateLTE = startDateLTE
	}

	startDateLTStr := query.Get("start_date_lt")
	if startDateLTStr != "" {
		startDateLT, err := timekit.ParseJavaScriptTimeString(startDateLTStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.StartDateLT = startDateLT
	}

	// Completion Date Filters
	completionDateGTEStr := query.Get("completion_date_gte")
	if completionDateGTEStr != "" {
		completionDateGTE, err := timekit.ParseJavaScriptTimeString(completionDateGTEStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.CompletionDateGTE = completionDateGTE
	}

	completionDateGTStr := query.Get("completion_date_gt")
	if completionDateGTStr != "" {
		completionDateGT, err := timekit.ParseJavaScriptTimeString(completionDateGTStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.CompletionDateGT = completionDateGT
	}

	completionDateLTEStr := query.Get("completion_date_lte")
	if completionDateLTEStr != "" {
		completionDateLTE, err := timekit.ParseJavaScriptTimeString(completionDateLTEStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.CompletionDateLTE = completionDateLTE
	}

	completionDateLTStr := query.Get("completion_date_lt")
	if completionDateLTStr != "" {
		completionDateLT, err := timekit.ParseJavaScriptTimeString(completionDateLTStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.CompletionDateLT = completionDateLT
	}

	// Assignment Date Filters (if needed separately)
	assignmentDateGTEStr := query.Get("assignment_date_gte")
	if assignmentDateGTEStr != "" {
		assignmentDateGTE, err := timekit.ParseJavaScriptTimeString(assignmentDateGTEStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.AssignmentDateGTE = assignmentDateGTE
	}

	assignmentDateGTStr := query.Get("assignment_date_gt")
	if assignmentDateGTStr != "" {
		assignmentDateGT, err := timekit.ParseJavaScriptTimeString(assignmentDateGTStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.AssignmentDateGT = assignmentDateGT
	}

	assignmentDateLTEStr := query.Get("assignment_date_lte")
	if assignmentDateLTEStr != "" {
		assignmentDateLTE, err := timekit.ParseJavaScriptTimeString(assignmentDateLTEStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.AssignmentDateLTE = assignmentDateLTE
	}

	assignmentDateLTStr := query.Get("assignment_date_lt")
	if assignmentDateLTStr != "" {
		assignmentDateLT, err := timekit.ParseJavaScriptTimeString(assignmentDateLTStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.AssignmentDateLT = assignmentDateLT
	}

	// Invoice Service Fee Payment Date Filters (if needed)
	invoiceServiceFeePaymentDateGTEStr := query.Get("invoice_service_fee_payment_date_gte")
	if invoiceServiceFeePaymentDateGTEStr != "" {
		invoiceServiceFeePaymentDateGTE, err := timekit.ParseJavaScriptTimeString(invoiceServiceFeePaymentDateGTEStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.InvoiceServiceFeePaymentDateGTE = invoiceServiceFeePaymentDateGTE
	}

	invoiceServiceFeePaymentDateGTStr := query.Get("invoice_service_fee_payment_date_gt")
	if invoiceServiceFeePaymentDateGTStr != "" {
		invoiceServiceFeePaymentDateGT, err := timekit.ParseJavaScriptTimeString(invoiceServiceFeePaymentDateGTStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.InvoiceServiceFeePaymentDateGT = invoiceServiceFeePaymentDateGT
	}

	invoiceServiceFeePaymentDateLTEStr := query.Get("invoice_service_fee_payment_date_lte")
	if invoiceServiceFeePaymentDateLTEStr != "" {
		invoiceServiceFeePaymentDateLTE, err := timekit.ParseJavaScriptTimeString(invoiceServiceFeePaymentDateLTEStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.InvoiceServiceFeePaymentDateLTE = invoiceServiceFeePaymentDateLTE
	}

	invoiceServiceFeePaymentDateLTStr := query.Get("invoice_service_fee_payment_date_lt")
	if invoiceServiceFeePaymentDateLTStr != "" {
		invoiceServiceFeePaymentDateLT, err := timekit.ParseJavaScriptTimeString(invoiceServiceFeePaymentDateLTStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		f.InvoiceServiceFeePaymentDateLT = invoiceServiceFeePaymentDateLT
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
