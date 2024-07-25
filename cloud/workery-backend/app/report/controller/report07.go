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

type GenerateReport07Request struct {
	Status int8
}

func (c *ReportControllerImpl) GenerateReport007(ctx context.Context, req *GenerateReport07Request) ([][]string, error) {
	// Modify the customer based on role.
	orgID, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)

	f := &a_s.AssociatePaginationListFilter{
		Cursor:    "",
		PageSize:  1_000_000_000, // Unlimited
		SortField: "birth_date",
		SortOrder: a_s.OrderAscending,
		TenantID:  orgID,
		Status:    req.Status,
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
		{"Associate Birthdays Report"},
		{"Report Date:", todayStr, ""},
		{"", "", ""},
		{"", "", ""},
		{
			"Associate No.", // 1
			"Name",          // 2
			"Birthday",      // 3
			"Join Date",     // 4
			"Skill Set(s)",  // 5
		},
	}

	for _, a := range list.Results {

		var birthdayCheckStr string = "-"
		if !a.BirthDate.IsZero() {
			birthdayCheckStr = a.BirthDate.Format("2006-01-02 15:04:06")
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
			fmt.Sprintf("%v", a.PublicID), // 1
			a.Name,                        // 2
			birthdayCheckStr,              // 3
			joinDateStr,                   // 4
			skillSetsStr,                  // 5
		}
		rows = append(rows, row)
	}

	return rows, err
}
