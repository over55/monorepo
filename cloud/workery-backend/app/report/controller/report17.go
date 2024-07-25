package controller

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	s_s "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
)

type GenerateReport17Request struct {
	UserType int8
	ToDT     time.Time
	FromDT   time.Time
}

func (c *ReportControllerImpl) GenerateReport017(ctx context.Context, req *GenerateReport17Request) ([][]string, error) {
	// // Extract from our session the following data.
	tid := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)

	// Variables used to be generate the report.
	var reportTitle string

	// The following few lines of code will take all the `how hear` options for
	// the particular user's tenant list and generate map of all them. The
	// purpose being to be able to generate a summary of how user's heard
	// about our system.

	list, err := c.HowHearStorer.ListByTenantID(ctx, tid)
	if err != nil {
		c.Logger.Error("failed listing by tenant ID for how hear", slog.Any("error", err))
		return nil, err
	}
	var countMap = map[primitive.ObjectID]uint64{}
	var otherArr = []string{}

	// The following code will look what user type was requested and get the
	// data for that specific user type.

	switch req.UserType {
	case 1: // `Client`
		reportTitle = "How Clients Found Us (Short) Report"

		f := &c_s.CustomerPaginationListFilter{
			Cursor:    "",
			PageSize:  1_000_000_000, // Unlimited
			SortField: "name",
			SortOrder: c_s.OrderAscending,
			TenantID:  tid,
			Status:    c_s.CustomerStatusActive,
		}
		list, err := c.CustomerStorer.ListByFilter(ctx, f)
		if err != nil {
			c.Logger.Error("database list by filter error", slog.Any("error", err))
			return nil, err
		}
		for _, customer := range list.Results {
			countMap[customer.HowDidYouHearAboutUsID] = countMap[customer.HowDidYouHearAboutUsID] + 1

			if customer.IsHowDidYouHearAboutUsOther {
				otherArr = append(otherArr, customer.HowDidYouHearAboutUsOther)
			}
		}
		break
	case 2: // `Associate`
		reportTitle = "How Associates Found Us (Short) Report"

		f := &a_s.AssociatePaginationListFilter{
			Cursor:    "",
			PageSize:  1_000_000_000, // Unlimited
			SortField: "name",
			SortOrder: a_s.OrderAscending,
			TenantID:  tid,
			Status:    a_s.AssociateStatusActive,
		}
		list, err := c.AssociateStorer.ListByFilter(ctx, f)
		if err != nil {
			c.Logger.Error("database list by filter error", slog.Any("error", err))
			return nil, err
		}
		for _, customer := range list.Results {
			countMap[customer.HowDidYouHearAboutUsID] = countMap[customer.HowDidYouHearAboutUsID] + 1

			if customer.IsHowDidYouHearAboutUsOther {
				otherArr = append(otherArr, customer.HowDidYouHearAboutUsOther)
			}
		}
		break
	case 3: // `Staff`
		reportTitle = "How Staff Found Us (Short) Report"

		f := &s_s.StaffPaginationListFilter{
			Cursor:    "",
			PageSize:  1_000_000_000, // Unlimited
			SortField: "name",
			SortOrder: s_s.SortOrderAscending,
			TenantID:  tid,
			Status:    s_s.StaffStatusActive,
		}
		list, err := c.StaffStorer.ListByFilter(ctx, f)
		if err != nil {
			c.Logger.Error("database list by filter error", slog.Any("error", err))
			return nil, err
		}
		for _, customer := range list.Results {
			countMap[customer.HowDidYouHearAboutUsID] = countMap[customer.HowDidYouHearAboutUsID] + 1

			if customer.IsHowDidYouHearAboutUsOther {
				otherArr = append(otherArr, customer.HowDidYouHearAboutUsOther)
			}
		}
		break
	default:
		return nil, nil // Return empty
	}

	////
	//// Generate report csv header.
	////

	todayStr := time.Now().Format("2006-01-02")
	fromDTStr := req.FromDT.Format("2006-01-02")
	toDTStr := req.ToDT.Format("2006-01-02")

	rows := [][]string{
		{reportTitle, "", "", "", "", "", "", "", "", "", ""},
		{"Report Date", todayStr, "", "", "", "", "", "", "", "", ""},
		{"From Assignment Date", fromDTStr, "", "", "", "", "", "", "", "", ""},
		{"To Assignment Date", toDTStr, "", "", "", "", "", "", "", "", ""},
		{"", "", "", "", "", "", "", "", "", "", ""},
		{"", "", "", "", "", "", "", "", "", "", ""},
		{
			"Name",        // 1
			"Description", // 2
			"Other",       // 3
		},
	}

	// The following code will simply add our filtered data into the output
	// results and return them.

	// Step 1: Iterate through all the `how hear` items and add counts.

	for _, v := range list.Results {
		row := []string{
			v.Text,
			fmt.Sprintf("%v", countMap[v.ID]),
		}
		rows = append(rows, row)
	}

	// Step 2: Iterate through all the other data. Begin by getting all unique values.

	var keys = map[string]bool{}
	for _, v := range otherArr {
		if keys[v] {
			continue
		}
		keys[v] = true
	}

	// Step 3: Convert unique values into CSV format and include them in our output.

	var uniqueKeys = []string{}
	for k := range keys {
		uniqueKeys = append(uniqueKeys, k)
	}

	for _, v := range uniqueKeys {
		row := []string{
			"",
			"",
			v,
		}
		rows = append(rows, row)
	}

	return rows, nil
}
