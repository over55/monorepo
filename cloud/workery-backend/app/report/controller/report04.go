package controller

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"log/slog"

	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
)

type GenerateReport04Request struct {
	Status int8
	ToDT   time.Time
	FromDT time.Time
}

func (c *ReportControllerImpl) GenerateReport004(ctx context.Context, req *GenerateReport04Request) ([][]string, error) {

	f := &o_s.OrderPaginationListFilter{
		Cursor:            "",
		PageSize:          1_000_000_000, // Unlimited
		SortField:         "assignment_date",
		SortOrder:         o_s.SortOrderDescending,
		AssignmentDateGTE: req.FromDT,
		AssignmentDateLTE: req.ToDT,
		Statuses: []int8{
			o_s.OrderStatusCancelled,
		},
	}

	res, err := c.OrderStorer.ListByFilter(ctx, f)
	if err != nil {
		c.Logger.Error("database list by filter error", slog.Any("error", err))
		return nil, err
	}

	// Variable will be the CSV formatted data. Start with filling out the
	// header of the file.
	todayStr := time.Now().Format("2006-01-02")
	fromDTStr := req.FromDT.Format("2006-01-02")
	toDTStr := req.ToDT.Format("2006-01-02")
	rows := [][]string{
		{"Cancelled Jobs Report", "", ""},
		{"Report Date:", todayStr, ""},
		{"From Assignment Date:", fromDTStr},
		{"To Assignment Date:", toDTStr, ""},
		{"", "", ""},
		{"", "", ""},
		{
			"Job No.",          // 1
			"Assignment Date",  // 2
			"Reason",           // 3
			"Associate No.",    // 4
			"Associate Name",   // 5
			"Associate Gender", // 6
			"Associate DOB",    // 7
			"Associate Age",    // 8
			"Skill Set(s)",     // 9
		},
	}

	//
	// Generate the CSV contents.
	//

	// Iterate through all our Golang structured data (that was returned from
	// the database) and we will convert it to a CSV format structure.
	for _, o := range res.Results {
		var associatePublicIDStr string = "-"
		if o.AssociatePublicID > 0 {
			associatePublicIDStr = strconv.FormatUint(o.AssociatePublicID, 10)
		}

		var assignmentDateStr string = "-"
		if !o.AssignmentDate.IsZero() {
			assignmentDateStr = o.AssignmentDate.Format("2006-01-02")
		}

		var associateDOBStr string = "-"
		var associateAgeStr string = "-"
		if !o.AssociateBirthdate.IsZero() {
			associateDOBStr = o.AssociateBirthdate.Format("2006-01-02")
			associateAgeDiff := time.Now().Sub(o.AssociateBirthdate)
			associateAgeInHours := associateAgeDiff.Hours()
			associateAgeInYears := associateAgeInHours * 0.000114155 // "0.000114155" got from google
			associateAgeStr = fmt.Sprintf("%.0f", associateAgeInYears)
		}

		var idStr string = strconv.FormatUint(o.WJID, 10)

		//
		// --- Get all the skill sets ---
		//

		var skillSetsStr string
		for ssi, ssv := range o.SkillSets {
			skillSetsStr += ssv.SubCategory
			if ssi < len(o.SkillSets)-1 {
				skillSetsStr += " | "
			}
		}

		var reason string
		if o.ClosingReason == 1 {
			reason = o.ClosingReasonOther
		} else {
			reason = o_s.OrderClosingReasonLabels[o.ClosingReason]
		}

		//
		// --- Generate the row ---
		//

		row := []string{
			idStr,                // 1
			assignmentDateStr,    // 2
			reason,               // 3
			associatePublicIDStr, // 4
			o.AssociateName,      // 5
			a_s.AssociateGenderLabels[o.AssociateGender], // 6
			associateDOBStr, // 7
			associateAgeStr, // 8
			skillSetsStr,    // 9
		}
		rows = append(rows, row)
	}
	return rows, err
}
