package controller

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"log/slog"

	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type GenerateReport02Request struct {
	AssociateID primitive.ObjectID
	Status      int8
	ToDT        time.Time
	FromDT      time.Time
}

func (c *ReportControllerImpl) GenerateReport002(ctx context.Context, req *GenerateReport02Request) ([][]string, error) {
	a, err := c.AssociateStorer.GetByID(ctx, req.AssociateID)
	if err != nil {
		c.Logger.Error("failed looking up associate",
			slog.Any("associate_id", req.AssociateID),
			slog.Any("error", err))
		return [][]string{}, err
	}
	if a == nil {
		err := fmt.Errorf("associate does not exist for: %v", req.AssociateID.Hex())
		c.Logger.Warn("associate does not exist",
			slog.Any("associate_id", req.AssociateID))
		return [][]string{}, err
	}

	f := &o_s.OrderPaginationListFilter{
		Cursor:            "",
		PageSize:          1_000_000_000, // Unlimited
		SortField:         "assignment_date",
		SortOrder:         o_s.SortOrderDescending,
		AssociateID:       req.AssociateID,
		AssignmentDateGTE: req.FromDT,
		AssignmentDateLTE: req.ToDT,
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
	todayStr := time.Now().Format("2006-01-02")
	fromDTStr := req.FromDT.Format("2006-01-02")
	toDTStr := req.ToDT.Format("2006-01-02")
	aID := strconv.FormatUint(a.PublicID, 10)
	rows := [][]string{
		{"Associate Jobs Report", "", "", "", "", "", "", "", "", "", ""},
		{"Report Date:", todayStr, "", "", "", "", "", "", "", "", ""},
		{"From Assignment Date:", fromDTStr, "", "", "", "", "", "", "", "", ""},
		{"To Assignment Date:", toDTStr, "", "", "", "", "", "", "", "", ""},
		{"Associate Name:", a.Name, "", "", "", "", "", "", "", "", ""},
		{"Associate No.:", aID, "", "", "", "", "", "", "", "", ""},
		{"", "", "", "", "", "", "", "", "", "", ""},
		{"", "", "", "", "", "", "", "", "", "", ""},
		{
			"Job No.",                                // 1
			"Assignment Date",                        // 2
			"Job Completion Date",                    // 3
			"Payment Date",                           // 4
			"Service Fee",                            // 5
			"Service Fee Paid",                       // 6
			"Service Fee Owing",                      // 7
			"Job Labour",                             // 8
			"Job Type",                               // 9
			"Job Status",                             // 10
			"Client No.",                             // 11
			"Client Name",                            // 12
			"Client Gender",                          // 13
			"Client DOB",                             // 14
			"Client Age",                             // 15
			"Skill Set(s)",                           // 16
			"Was survey conducted",                   // 17
			"Was job satisfactory",                   // 18
			"Was job finished on time and on budget", // 19
			"Was associate punctual",                 // 20
			"Was associate professional",             // 21
			"Would customer refer our organization",  // 22
			"Score",                                  // 23
			"Latest Comment Text",                    // 24
			"Latest Comment Date",                    // 25
		},
	}

	//
	// Generate the CSV contents.
	//

	// Iterate through all our Golang structured data (that was returned from
	// the database) and we will convert it to a CSV format structure.
	for _, o := range res.Results {
		var idStr string = strconv.FormatUint(o.WJID, 10)

		var assignmentDateStr string = "-"
		if !o.AssignmentDate.IsZero() {
			assignmentDateStr = o.AssignmentDate.Format("2006-01-02")
		}

		var completionDateStr string = "-"
		if !o.CompletionDate.IsZero() {
			completionDateStr = o.CompletionDate.Format("2006-01-02")
		}

		var invoiceServiceFeePaymentDateStr string = "-"
		if !o.InvoiceServiceFeePaymentDate.IsZero() {
			invoiceServiceFeePaymentDateStr = o.InvoiceServiceFeePaymentDate.Format("2006-01-02")
		}

		var invoiceActualServiceFeeAmountPaidStr = fmt.Sprintf("%f", o.InvoiceActualServiceFeeAmountPaid)
		invoiceActualServiceFeeAmountPaidStr = "$" + strings.Replace(invoiceActualServiceFeeAmountPaidStr, "0000", "", -1)

		var invoiceServiceFeeAmountStr = fmt.Sprintf("%f", o.InvoiceServiceFeeAmount)
		invoiceServiceFeeAmountStr = "$" + strings.Replace(invoiceServiceFeeAmountStr, "0000", "", -1)

		var invoiceLabourAmountStr = fmt.Sprintf("%f", o.InvoiceLabourAmount)
		invoiceLabourAmountStr = "$" + strings.Replace(invoiceLabourAmountStr, "0000", "", -1)

		var customerPublicIDStr string = "-"
		if o.CustomerPublicID > 0 {
			customerPublicIDStr = strconv.FormatUint(o.CustomerPublicID, 10)
		}

		var skillSetsStr string
		for ssi, ssv := range o.SkillSets {
			skillSetsStr += ssv.SubCategory
			if ssi < len(o.SkillSets)-1 {
				skillSetsStr += " | "
			}
		}

		wasSurveyConducted := strconv.FormatBool(o.WasSurveyConducted)
		wasJobSatisfactory := strconv.FormatBool(o.WasJobSatisfactory)
		wasJobFinishedOnTimeAndOnBudget := strconv.FormatBool(o.WasJobFinishedOnTimeAndOnBudget)
		wasAssociatePunctual := strconv.FormatBool(o.WasAssociatePunctual)
		wasAssociateProfessional := strconv.FormatBool(o.WasAssociateProfessional)
		wouldCustomerReferOurOrganization := strconv.FormatBool(o.WouldCustomerReferOurOrganization)
		score := strconv.FormatFloat(o.Score, 'E', -1, 64)

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
		// --- Generate the row ---
		//

		row := []string{
			idStr,                                      // 1
			assignmentDateStr,                          // 2
			completionDateStr,                          // 3
			invoiceServiceFeePaymentDateStr,            // 4
			o.InvoiceServiceFeeName,                    // 5
			invoiceActualServiceFeeAmountPaidStr,       // 6
			invoiceServiceFeeAmountStr,                 // 7
			invoiceLabourAmountStr,                     // 8
			o_s.OrderTypeLabels[o.Type],                // 9
			o_s.OrderStatusLabels[o.Status],            // 10
			customerPublicIDStr,                        // 11
			o.CustomerName,                             // 12
			c_s.CustomerGenderLabels[o.CustomerGender], // 13
			customerBirthdateStr,                       // 14
			customerAgeStr,                             // 15
			skillSetsStr,                               // 16
			wasSurveyConducted,                         // 17
			wasJobSatisfactory,                         // 18
			wasJobFinishedOnTimeAndOnBudget,            // 19
			wasAssociatePunctual,                       // 20
			wasAssociateProfessional,                   // 21
			wouldCustomerReferOurOrganization,          // 22
			score,                                      // 23
			latestCommentText,                          // 24
			latestCommentDateStr,                       // 25
		}
		rows = append(rows, row)
	}
	return rows, err
}
