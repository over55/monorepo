package controller

import (
	"context"
	"fmt"
	"log/slog"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
)

type GenerateReport13Request struct {
	SkillSetIDs []primitive.ObjectID
	Status      int8
	ToDT        time.Time
	FromDT      time.Time
}

func (c *ReportControllerImpl) GenerateReport013(ctx context.Context, req *GenerateReport13Request) ([][]string, error) {

	f := &o_s.OrderPaginationListFilter{
		Cursor:            "",
		PageSize:          1_000_000_000, // Unlimited
		SortField:         "assignment_date",
		SortOrder:         o_s.SortOrderDescending,
		AssignmentDateGTE: req.FromDT,
		AssignmentDateLTE: req.ToDT,
		InSkillSetIDs:     req.SkillSetIDs,
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
			o_s.OrderStatusNew,
			o_s.OrderStatusDeclined,
			o_s.OrderStatusPending,
			o_s.OrderStatusCancelled,
			o_s.OrderStatusOngoing,
			o_s.OrderStatusInProgress,
			o_s.OrderStatusCompletedButUnpaid,
			o_s.OrderStatusCompletedAndPaid,
			o_s.OrderStatusArchived,
		}
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
		{"Leads by Skill Report", "", ""},
		{"Report Date:", todayStr, ""},
		{"From Assignment Date:", fromDTStr},
		{"To Assignment Date:", toDTStr, ""},
		{"", "", "", "", "", "", "", "", "", "", ""},
		{"", "", "", "", "", "", "", "", "", "", ""},
		{
			"Associate No.",           // 1
			"Assignment Date",         // 2
			"Associate Name",          // 3
			"Associate Email",         // 4
			"Associate Phone",         // 5
			"Associate Gender",        // 6
			"Associate DOB",           // 7
			"Associate Age",           // 8
			"Job Completion Date",     // 9
			"Job No.",                 // 10
			"Service Fee",             // 11
			"Actual Service Fee Paid", // 12
			"Job Labour",              // 13
			"Job Type",                // 14
			"Job Status",              // 15
			"Service Fee Date Paid",   // 16
			"Client No.",              // 17
			"Client Name",             // 18
			"Client Email",            // 19
			"Client Phone",            // 20
			"Client Gender",           // 21
			"Client DOB",              // 22
			"Client Age",              // 23
			"Latest Comment Text",     // 24
			"Latest Comment Date",     // 25
			"Skill Set(s)",            // 26
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
		// --- Generate the row ---
		//

		row := []string{
			associatePublicIDStr, // 1
			assignmentDateStr,    // 2
			o.AssociateName,      // 3
			o.AssociateEmail,     // 4
			o.AssociatePhone,     // 5
			a_s.AssociateGenderLabels[o.AssociateGender], // 6
			associateDOBStr,                            // 7
			associateAgeStr,                            // 8
			completionDateStr,                          // 9
			idStr,                                      // 10
			invoiceServiceFeeAmountStr,                 // 11
			invoiceActualServiceFeeAmountPaidStr,       // 12
			invoiceLabourAmountStr,                     // 13
			o_s.OrderTypeLabels[o.Type],                // 14
			o_s.OrderStatusLabels[o.Status],            // 15
			invoiceServiceFeePaymentDateStr,            // 16
			customerPublicIDStr,                        // 17
			o.CustomerName,                             // 18
			o.CustomerEmail,                            // 19
			o.CustomerPhone,                            // 20
			c_s.CustomerGenderLabels[o.CustomerGender], // 21
			customerBirthdateStr,                       // 22
			customerAgeStr,                             // 23
			latestCommentText,                          // 24
			latestCommentDateStr,                       // 25
			skillSetsStr,                               // 26
		}
		rows = append(rows, row)
	}
	return rows, err
}
