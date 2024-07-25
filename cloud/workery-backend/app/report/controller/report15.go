package controller

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
)

type GenerateReport15Request struct {
	ExpiryDateType   int8
	DaysBeforeExpiry int
}

func (c *ReportControllerImpl) GenerateReport015(ctx context.Context, req *GenerateReport15Request) ([][]string, error) {
	// Modify the customer based on role.
	orgID, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)

	expiryDate := time.Now().AddDate(0, 0, (-1)*int(req.DaysBeforeExpiry))

	var f *a_s.AssociatePaginationListFilter
	switch req.ExpiryDateType {
	case 1:
		f = &a_s.AssociatePaginationListFilter{
			Cursor:                           "",
			PageSize:                         1_000_000_000, // Unlimited
			SortField:                        "commercial_insurance_expiry_date",
			SortOrder:                        a_s.OrderDescending,
			TenantID:                         orgID,
			Status:                           a_s.AssociateStatusActive,
			CommercialInsuranceExpiryDateGTE: expiryDate,
			CommercialInsuranceExpiryDateLTE: time.Now(),
		}
		break
	case 2:
		f = &a_s.AssociatePaginationListFilter{
			Cursor:         "",
			PageSize:       1_000_000_000, // Unlimited
			SortField:      "police_check",
			SortOrder:      a_s.OrderDescending,
			TenantID:       orgID,
			Status:         a_s.AssociateStatusActive,
			PoliceCheckGTE: expiryDate,
			PoliceCheckLTE: time.Now(),
		}
		break
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
	expiryDateStr := expiryDate.Format("2006-01-02")

	rows := [][]string{
		{"Associate Upcoming Expiry Dates Report"},
		{"From Date:", todayStr},
		{"To Date:", expiryDateStr, ""},
		{"", "", ""},
		{"", "", ""},
		{
			"Associate No.",                    // 1
			"Name",                             // 2
			"Commercial Insurance Expiry Date", // 3
			"Police Check Date",                // 4
			"Birthday",                         // 5
			"Join Date",                        // 6
			"Skill Set(s)",                     // 7
		},
	}

	for _, a := range list.Results {

		var commercialInsuranceExpiryDateStr string = "-"
		if !a.CommercialInsuranceExpiryDate.IsZero() {
			commercialInsuranceExpiryDateStr = a.CommercialInsuranceExpiryDate.Format("2006-01-02 15:04:06")
		}

		var birthdayCheckStr string = "-"
		if !a.PoliceCheck.IsZero() {
			birthdayCheckStr = a.BirthDate.Format("2006-01-02 15:04:06")
		}

		var policeCheckStr string = "-"
		if !a.PoliceCheck.IsZero() {
			policeCheckStr = a.PoliceCheck.Format("2006-01-02 15:04:06")
		}

		var joinDateStr string = "-"
		if !a.JoinDate.IsZero() {
			joinDateStr = a.JoinDate.Format("2006-01-02 15:04:06")
		}

		var skillSetsStr string
		for ssi, ssv := range a.SkillSets {
			skillSetsStr += ssv.SubCategory
			if ssi < len(a.SkillSets)-1 {
				skillSetsStr += " | "
			}
		}

		row := []string{
			fmt.Sprintf("%v", a.PublicID),    // 1
			a.Name,                           // 2
			commercialInsuranceExpiryDateStr, // 3
			policeCheckStr,                   // 4
			birthdayCheckStr,                 // 5
			joinDateStr,                      // 6
			skillSetsStr,                     // 7
		}
		rows = append(rows, row)
	}

	return rows, err
}
