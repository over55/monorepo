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

type GenerateReport05Request struct{}

func (c *ReportControllerImpl) GenerateReport005(ctx context.Context, req *GenerateReport05Request) ([][]string, error) {
	// Modify the customer based on role.
	orgID, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)

	f := &a_s.AssociatePaginationListFilter{
		Cursor:    "",
		PageSize:  1_000_000_000, // Unlimited
		SortField: "name",
		SortOrder: 1,
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
		{"Associate Insurance Due Dates Report", "", ""},
		{"Report Date:", todayStr, ""},
		{"", "", ""},
		{"", "", ""},
		{
			"Associate No.",                  // 1
			"Name",                           // 2
			"Commerical Insurance Due Dates", // 3
			"Auto Insurance Expiry Date",     // 4
			"WSIB Insurance #",               // 5
			"WSIB Insurance Date",            // 6
			"Insurance Requirement(s)",       // 7
		},
	}

	for _, a := range list.Results {

		var commercialDateStr string = "-"
		if !a.CommercialInsuranceExpiryDate.IsZero() {
			commercialDateStr = a.CommercialInsuranceExpiryDate.Format("2006-01-02")
		}

		var autoDateStr string = "-"
		if !a.AutoInsuranceExpiryDate.IsZero() {
			autoDateStr = a.AutoInsuranceExpiryDate.Format("2006-01-02")
		}

		var iDateStr string = "-"
		if !a.WsibInsuranceDate.IsZero() {
			iDateStr = a.WsibInsuranceDate.Format("2006-01-02")
		}

		var irsStr string
		for iri, irv := range a.InsuranceRequirements {
			irsStr += irv.Name
			if iri < len(a.InsuranceRequirements)-1 {
				irsStr += " | "
			}
		}

		row := []string{
			fmt.Sprintf("%v", a.PublicID), // 1
			a.Name,                        // 2
			commercialDateStr,             // 3
			autoDateStr,                   // 4
			a.WsibNumber,                  // 5
			iDateStr,                      // 6
			irsStr,                        // 7
		}
		rows = append(rows, row)
	}

	return rows, err
}
