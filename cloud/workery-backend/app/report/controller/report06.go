package controller

import (
	"context"
	"fmt"
	"time"

	"log/slog"

	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type GenerateReport06Request struct{}

func (c *ReportControllerImpl) GenerateReport006(ctx context.Context, req *GenerateReport06Request) ([][]string, error) {
	// Modify the customer based on role.
	orgID, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)

	f := &a_s.AssociatePaginationListFilter{
		Cursor:    "",
		PageSize:  1_000_000_000, // Unlimited
		SortField: "police_check",
		SortOrder: a_s.OrderAscending,
		TenantID:  orgID,
		Status:    a_s.AssociateStatusActive,
	}
	list, err := c.AssociateStorer.ListByFilter(ctx, f)
	if err != nil {
		c.Logger.Error("database list by filter error", slog.Any("error", err))
		return nil, err
	}

	//
	// Generate the CSV contents.
	//

	// Start by generating the header row.

	todayStr := time.Now().Format("2006-01-02")

	rows := [][]string{
		{"Associate Police Check Due Dates Report"},
		{"Report Date:", todayStr, ""},
		{"", "", ""},
		{"", "", ""},
		{
			"Associate No.",          // 1
			"Name",                   // 2
			"Police Check Due Dates", // 3
		},
	}

	for _, a := range list.Results {

		var policeCheckStr string = "-"
		if !a.PoliceCheck.IsZero() {
			policeCheckStr = a.PoliceCheck.Format("2006-01-02 15:04:06")
		}

		row := []string{
			fmt.Sprintf("%v", a.PublicID), // 1
			a.Name,                        // 2
			policeCheckStr,                // 3
		}
		rows = append(rows, row)
	}

	return rows, err
}
