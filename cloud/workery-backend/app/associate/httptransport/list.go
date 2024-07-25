package httptransport

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/bartmika/timekit"
	"go.mongodb.org/mongo-driver/bson/primitive"

	c_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) LiteList(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	f := &c_s.AssociatePaginationListFilter{
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
		f.SortOrder = c_s.OrderAscending
	}
	if sortOrder == "DESC" {
		f.SortOrder = c_s.OrderDescending
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

	allSkillSetIDsStr := query.Get("all_skill_set_ids")
	if allSkillSetIDsStr != "" {
		skilSetIDsStrArr := strings.Split(allSkillSetIDsStr, ",")
		if len(skilSetIDsStrArr) > 0 {
			// Variable used to track
			ssIDsArr := make([]primitive.ObjectID, 0)

			// Iterate through all the strings and convert int `primitive.ObjectID`.
			for _, ssIDStr := range skilSetIDsStrArr {
				ssID, err := primitive.ObjectIDFromHex(ssIDStr)
				if err != nil {
					httperror.ResponseError(w, err)
					return
				}
				ssIDsArr = append(ssIDsArr, ssID)

			}

			f.AllSkillSetIDs = ssIDsArr
		}
	}

	inSkillSetIDsStr := query.Get("in_skill_set_ids")
	if inSkillSetIDsStr != "" {
		skilSetIDsStrArr := strings.Split(inSkillSetIDsStr, ",")
		if len(skilSetIDsStrArr) > 0 {
			// Variable used to track
			ssIDsArr := make([]primitive.ObjectID, 0)

			// Iterate through all the strings and convert int `primitive.ObjectID`.
			for _, ssIDStr := range skilSetIDsStrArr {
				ssID, err := primitive.ObjectIDFromHex(ssIDStr)
				if err != nil {
					httperror.ResponseError(w, err)
					return
				}
				ssIDsArr = append(ssIDsArr, ssID)

			}

			f.InSkillSetIDs = ssIDsArr
		}
	}

	isJobSeekerStr := query.Get("is_job_seeker")
	if statusStr != "" {
		isJobSeeker, _ := strconv.ParseInt(isJobSeekerStr, 10, 64)
		if isJobSeeker > 0 {
			f.IsJobSeeker = int8(isJobSeeker)
		}
	}

	hasTaxIDStr := query.Get("has_tax_id")
	if hasTaxIDStr != "" {
		hasTaxID, _ := strconv.ParseInt(hasTaxIDStr, 10, 64)
		if hasTaxID > 0 {
			f.HasTaxID = int8(hasTaxID)
		}
	}

	// Perform our database operation.
	res, err := h.Controller.LiteListAndCountByFilter(ctx, f)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalListResponse(res, w)
}

func MarshalListResponse(res *c_s.AssociatePaginationLiteListAndCountResult, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
