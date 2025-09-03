package controller

import (
	"context"
	"fmt"
	"time"

	"log/slog"

	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type GenerateReport03Request struct {
	Status int8
	ToDT   time.Time
	FromDT time.Time
}

func (c *ReportControllerImpl) GenerateReport003(ctx context.Context, req *GenerateReport03Request) ([][]string, error) {
	// IMPORTANT: Date Range Adjustment for Inclusive End Date
	//
	// Problem: When users select a date range (e.g., Jan 1 to Jan 31), they expect
	// to see ALL orders from Jan 31, not just those assigned at midnight (00:00:00).
	//
	// The frontend sends dates as beginning-of-day timestamps (00:00:00).
	// Without adjustment, using LTE (less than or equal) with "Jan 31 00:00:00"
	// would EXCLUDE all orders assigned during Jan 31 (any time after midnight).
	//
	// Solution: Adjust the ToDT to end-of-day (23:59:59.999999999) to include
	// all orders assigned on the final day of the selected range.
	//
	// Example:
	// - User selects: Jan 1, 2024 to Jan 31, 2024
	// - Frontend sends: from_dt = "2024-01-01T00:00:00Z", to_dt = "2024-01-31T00:00:00Z"
	// - We adjust to: from_dt = "2024-01-01T00:00:00Z", to_dt = "2024-01-31T23:59:59Z"
	// - Result: Includes ALL orders from the entire month of January
	adjustedToDT := req.ToDT
	if !req.ToDT.IsZero() {
		adjustedToDT = time.Date(
			req.ToDT.Year(),
			req.ToDT.Month(),
			req.ToDT.Day(),
			23, 59, 59, 999999999, // Set to last nanosecond of the day
			req.ToDT.Location(),
		)
	}

	// Define the row structure we will use to aggregate the data.
	type ServiceFeeGroup struct {
		ID         primitive.ObjectID
		Title      string
		TotalPaid  float64
		TotalCount int64
	}

	// Variable holds a map for the particular `public_id` skill set.
	feeGroups := map[primitive.ObjectID]*ServiceFeeGroup{}

	// Filter through all the orders that meet our criteria.
	f := &o_s.OrderPaginationListFilter{
		Cursor:            "",
		PageSize:          1_000_000_000, // Unlimited
		SortField:         "assignment_date",
		SortOrder:         o_s.SortOrderDescending,
		AssignmentDateGTE: req.FromDT,   // Start of the first day (inclusive)
		AssignmentDateLTE: adjustedToDT, // End of the last day (inclusive)
		Statuses: []int8{
			o_s.OrderStatusNew,
			o_s.OrderStatusDeclined,
			o_s.OrderStatusPending,
			o_s.OrderStatusCancelled,
			o_s.OrderStatusOngoing,
			o_s.OrderStatusInProgress,
			o_s.OrderStatusCompletedButUnpaid,
			o_s.OrderStatusCompletedAndPaid,
			o_s.OrderStatusArchived,
		},
	}

	c.Logger.Debug("report 03 - list orders by filter",
		slog.Any("Statuses", f.Statuses),
		slog.Any("Status", f.Status),
		slog.Any("InvoiceServiceFeePaymentDateGTE", f.InvoiceServiceFeePaymentDateGTE),
		slog.Any("InvoiceServiceFeePaymentDateLTE", f.InvoiceServiceFeePaymentDateLTE),
	)

	list, err := c.OrderStorer.ListByFilter(ctx, f)
	if err != nil {
		c.Logger.Error("database list by filter error", slog.Any("error", err))
		return nil, err
	}

	for _, o := range list.Results {
		feeID := o.InvoiceServiceFeeID
		feePaid := o.InvoiceActualServiceFeeAmountPaid
		if !feeID.IsZero() && feePaid != 0 {
			feeGroup, ok := feeGroups[feeID]

			if !ok { // CASE 1 OF 2: The group does not exist so we need to create it now.
				feeGroup = &ServiceFeeGroup{
					ID:         feeID,
					Title:      o.InvoiceServiceFeeName,
					TotalPaid:  feePaid,
					TotalCount: 1,
				}
				feeGroups[feeID] = feeGroup

			} else { // CASE 2 OF 2: The group already exists so we simply update the record.
				feeGroup.TotalCount++
				feeGroup.TotalPaid += feePaid
			}
		}
	}

	//
	// Generate the CSV contents.
	//

	todayStr := time.Now().Format("2006-01-02")
	fromDTStr := req.FromDT.Format("2006-01-02")
	toDTStr := req.ToDT.Format("2006-01-02")
	rows := [][]string{
		{"Service Fees by Type Report", "", ""},
		{"Report Date:", todayStr, ""},
		{"From Invoice Service Fee Payment Date:", fromDTStr},
		{"To Invoice Service Fee Payment Date:", toDTStr, ""},
		{"", "", ""},
		{"", "", ""},
		{"Service Fee Type", "Service Fees Paid", "# of Jobs Completed"},
	}

	// Iterate through all our Golang structured data (that was returned from
	// the database) and we will convert it to a CSV format structure.
	for _, feeGroup := range feeGroups {
		//
		// --- Generate row ---
		//

		row := []string{
			feeGroup.Title,
			fmt.Sprintf("%.2f", feeGroup.TotalPaid),
			fmt.Sprintf("%v", feeGroup.TotalCount),
		}
		rows = append(rows, row)

	}
	return rows, err
}
