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
		Cursor:                          "",
		PageSize:                        1_000_000_000, // Unlimited
		SortField:                       "assignment_date",
		SortOrder:                       o_s.SortOrderDescending,
		InvoiceServiceFeePaymentDateGTE: req.FromDT,
		InvoiceServiceFeePaymentDateLTE: req.ToDT,
	}
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
