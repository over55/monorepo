package controller

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
)

type GenerateReport12Request struct {
}

func (c *ReportControllerImpl) GenerateReport012(ctx context.Context, req *GenerateReport12Request) ([][]string, error) {
	// Extract from our session the following data.
	tid := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)

	////
	//// Generate report csv header.
	////

	todayStr := time.Now().Format("2006-01-02")

	rows := [][]string{
		{"Skill Sets Report", "", "", "", "", "", "", "", "", "", ""},
		{"Report Date", todayStr, "", "", "", "", "", "", "", "", ""},
		{"", "", "", "", "", "", "", "", "", "", ""},
		{"", "", "", "", "", "", "", "", "", "", ""},
		{
			"Category",              // 1
			"Sub-Category",          // 2
			"# of Associates",       // 3
			"# of Jobs Completed",   // 4
			"Service Fees Paid ($)", // 5
		},
	}

	// The following few lines of code will take all the `skill sets` options for
	// the particular user's tenant list and generate map of all them. The
	// purpose being to be able to generate a summary of skill sets.

	sslist, err := c.SkillSetStorer.ListByTenantID(ctx, tid)
	if err != nil {
		c.Logger.Error("failed listing by tenant ID for skill sets", slog.Any("error", err))
		return nil, err
	}

	//
	// Iterate through all the skill sets and perform our aggregation.
	//

	for _, ss := range sslist.Results {

		////
		//// Calculate total associates with this skill set.
		////

		af := &a_s.AssociatePaginationListFilter{
			TenantID:      tid,
			Status:        a_s.AssociateStatusActive,
			InSkillSetIDs: []primitive.ObjectID{ss.ID},
		}
		assoCount, err := c.AssociateStorer.CountByFilter(ctx, af)
		if err != nil {
			c.Logger.Error("failed counting associates by skill sets", slog.Any("error", err))
			return nil, err
		}

		////
		//// Calculate the total successful work orders with this skill set.
		////

		of := &o_s.OrderPaginationListFilter{
			Cursor:        "",
			PageSize:      1_000_000_000, // Unlimited
			TenantID:      tid,
			InSkillSetIDs: []primitive.ObjectID{ss.ID},
			Statuses: []int8{
				o_s.OrderStatusCompletedButUnpaid,
				o_s.OrderStatusCompletedAndPaid,
			},
		}
		olist, err := c.OrderStorer.ListByFilter(ctx, of)
		if err != nil {
			c.Logger.Error("failed getting orders by skill sets", slog.Any("error", err))
			return nil, err
		}

		var orderSuccessCount int64 = 0
		var totalEarned float64 = 0

		for _, o := range olist.Results {
			orderSuccessCount++
			totalEarned += o.InvoiceActualServiceFeeAmountPaid
		}

		// The following code will simply add our filtered data into the output
		// results and return them.

		row := []string{
			ss.Category,
			ss.SubCategory,
			fmt.Sprintf("%v", assoCount),
			fmt.Sprintf("%v", orderSuccessCount),
			fmt.Sprintf("%.2f", totalEarned),
		}
		rows = append(rows, row)
	}

	return rows, nil
}
