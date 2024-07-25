package controller

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"log/slog"

	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type GenerateReport22Request struct {
	TagIDs []primitive.ObjectID
	Status int8
	ToDT   time.Time
	FromDT time.Time
}

func (c *ReportControllerImpl) GenerateReport022(ctx context.Context, req *GenerateReport22Request) ([][]string, error) {

	f := &o_s.OrderPaginationListFilter{
		Cursor:            "",
		PageSize:          1_000_000_000, // Unlimited
		SortField:         "completion_date",
		SortOrder:         o_s.SortOrderDescending,
		CompletionDateGTE: req.FromDT,
		CompletionDateLTE: req.ToDT,
		InTagIDs:          req.TagIDs,
	}

	switch req.Status {
	case o_s.OrderStatusNew:
		f.Status = req.Status
	case o_s.OrderStatusDeclined:
		f.Status = req.Status
	case o_s.OrderStatusPending:
		f.Status = req.Status
	case o_s.OrderStatusCancelled:
		f.Status = req.Status
	case o_s.OrderStatusOngoing:
		f.Status = req.Status
	case o_s.OrderStatusInProgress:
		f.Status = req.Status
	case o_s.OrderStatusCompletedButUnpaid:
		f.Status = req.Status
	case o_s.OrderStatusCompletedAndPaid:
		f.Status = req.Status
	case o_s.OrderStatusArchived:
		f.Status = req.Status
	default: // A.K.A. "all"
		f.Statuses = []int8{
			// o_s.OrderStatusNew,
			// o_s.OrderStatusDeclined,
			// o_s.OrderStatusPending,
			// o_s.OrderStatusCancelled,
			// o_s.OrderStatusOngoing,
			o_s.OrderStatusInProgress,
			o_s.OrderStatusCompletedButUnpaid,
			o_s.OrderStatusCompletedAndPaid,
			// o_s.OrderStatusArchived,
		}
	}

	res, err := c.OrderStorer.ListByFilter(ctx, f)
	if err != nil {
		c.Logger.Error("database list by filter error", slog.Any("error", err))
		return nil, err
	}

	// Variable will be the CSV formatted data. Start with filling out the
	// header of the file.
	rows := [][]string{
		{"Job Tags Report by Completion Date Report", "", "", "", "", "", "", "", "", "", ""},
		{"Report Date", time.Now().Format("2006-01-02"), "", "", "", "", "", "", "", "", ""},
		{"From Completion Date", req.FromDT.Format("2006-01-02"), "", "", "", "", "", "", "", "", ""},
		{"To Completion Date", req.ToDT.Format("2006-01-02"), "", "", "", "", "", "", "", "", ""},
		{"", "", "", "", "", "", "", "", "", "", ""},
		{"", "", "", "", "", "", "", "", "", "", ""},
		{
			"Associate No.",           // 1
			"Assignment Date",         // 2
			"Associate Name",          // 3
			"Associate Gender",        // 4
			"Associate DOB",           // 5
			"Associate Age",           // 6
			"Job Completion Date",     // 7
			"Job No.",                 // 8
			"Service Fee",             // 9
			"Actual Service Fee Paid", // 10
			"Job Labour",              // 11
			"Job Type",                // 12
			"Job Status",              // 13
			"Service Fee Date Paid",   // 14
			"Client No.",              // 15
			"Client Name",             // 16
			"Client Gender",           // 17
			"Client DOB",              // 18
			"Client Age",              // 19
			"Latest Comment Text",     // 20
			"Latest Comment Date",     // 21
			"Skill Set(s)",            // 22
			"Tags(s)",                 // 23
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

		var completionDateStr string = "-"
		if !o.CompletionDate.IsZero() {
			completionDateStr = o.CompletionDate.Format("2006-01-02")
		}

		var idStr string = strconv.FormatUint(o.WJID, 10)

		var invoiceServiceFeeAmountStr = fmt.Sprintf("%f", o.InvoiceServiceFeeAmount)
		invoiceServiceFeeAmountStr = "$" + strings.Replace(invoiceServiceFeeAmountStr, "0000", "", -1)

		var invoiceActualServiceFeeAmountPaidStr = fmt.Sprintf("%f", o.InvoiceActualServiceFeeAmountPaid)
		invoiceActualServiceFeeAmountPaidStr = "$" + strings.Replace(invoiceActualServiceFeeAmountPaidStr, "0000", "", -1)

		var invoiceLabourAmountStr = fmt.Sprintf("%f", o.InvoiceLabourAmount)
		invoiceLabourAmountStr = "$" + strings.Replace(invoiceLabourAmountStr, "0000", "", -1)

		var invoiceServiceFeePaymentDateStr string = "-"
		if !o.InvoiceServiceFeePaymentDate.IsZero() {
			invoiceServiceFeePaymentDateStr = o.InvoiceServiceFeePaymentDate.Format("2006-01-02")
		}

		var customerPublicIDStr string = "-"
		if o.CustomerPublicID > 0 {
			customerPublicIDStr = strconv.FormatUint(o.CustomerPublicID, 10)
		}

		// Calculate age of customer.
		customerBirthdateStr := o.CustomerBirthdate.Format("2006-01-02")
		customerAgeDiff := time.Now().Sub(o.CustomerBirthdate)
		customerAgeInHours := customerAgeDiff.Hours()
		customerAgeInYears := customerAgeInHours * 0.000114
		customerAgeStr := fmt.Sprintf("%.0f", customerAgeInYears)

		if customerBirthdateStr == "0001-01-01 00:00:00" { // Do not show birthdate if empty.
			customerBirthdateStr = "-"
			customerAgeStr = "-"
		}

		var latestCommentText string = "-"
		var latestCommentDateStr string = "-"
		latestComment := o_s.GetLatestComment(o)
		if latestComment != nil {
			latestCommentText = latestComment.Content
			latestCommentDateStr = latestComment.CreatedAt.Format("2006-01-02")
		}

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

		//
		// --- Get all the tags ---
		//

		var tagsStr string
		for ti, tv := range o.Tags {
			tagsStr += tv.Text
			if ti < len(o.Tags)-1 {
				tagsStr += " | "
			}
		}

		//
		// --- Generate the row ---
		//

		row := []string{
			associatePublicIDStr, // 1
			assignmentDateStr,    // 2
			o.AssociateName,      // 3
			a_s.AssociateGenderLabels[o.AssociateGender], // 4
			associateDOBStr,                            // 5
			associateAgeStr,                            // 6
			completionDateStr,                          // 7
			idStr,                                      // 8
			invoiceServiceFeeAmountStr,                 // 9
			invoiceActualServiceFeeAmountPaidStr,       // 10
			invoiceLabourAmountStr,                     // 11
			o_s.OrderTypeLabels[o.Type],                // 12
			o_s.OrderStatusLabels[o.Status],            // 13
			invoiceServiceFeePaymentDateStr,            // 14
			customerPublicIDStr,                        // 15
			o.CustomerName,                             // 16
			c_s.CustomerGenderLabels[o.CustomerGender], // 17
			customerBirthdateStr,                       // 18
			customerAgeStr,                             // 19
			latestCommentText,                          // 20
			latestCommentDateStr,                       // 21
			skillSetsStr,                               // 22
			tagsStr,                                    // 23
		}
		rows = append(rows, row)
	}
	return rows, err
}
