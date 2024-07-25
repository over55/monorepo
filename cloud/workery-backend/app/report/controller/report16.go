package controller

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	s_s "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
)

type GenerateReport16Request struct {
	UserType int8
	ToDT     time.Time
	FromDT   time.Time
}

func (c *ReportControllerImpl) GenerateReport016(ctx context.Context, req *GenerateReport16Request) ([][]string, error) {
	// // Extract from our session the following data.
	tid := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)

	// Variables used to be generate the report.
	results := [][]string{}
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
	var kv = map[primitive.ObjectID]string{}
	for _, item := range list.Results {
		kv[item.ID] = item.Text
	}

	// The following code will look what user type was requested and get the
	// data for that specific user type.

	switch req.UserType {
	case 1: // `Client`
		reportTitle = "How Clients Found Us (Long) Report"

		f := &c_s.CustomerPaginationListFilter{
			Cursor:      "",
			PageSize:    1_000_000_000, // Unlimited
			SortField:   "name",
			SortOrder:   c_s.OrderAscending,
			TenantID:    tid,
			Status:      c_s.CustomerStatusActive,
			JoinDateGTE: req.FromDT,
			JoinDateLTE: req.ToDT,
		}
		list, err := c.CustomerStorer.ListByFilter(ctx, f)
		if err != nil {
			c.Logger.Error("database list by filter error", slog.Any("error", err))
			return nil, err
		}
		for _, customer := range list.Results {
			row := []string{
				customer.Name,
				kv[customer.HowDidYouHearAboutUsID],
				customer.HowDidYouHearAboutUsOther,
			}
			results = append(results, row)
		}
		break
	case 2: // `Associate`
		reportTitle = "How Associates Found Us (Long) Report"

		f := &a_s.AssociatePaginationListFilter{
			Cursor:      "",
			PageSize:    1_000_000_000, // Unlimited
			SortField:   "name",
			SortOrder:   a_s.OrderAscending,
			TenantID:    tid,
			Status:      a_s.AssociateStatusActive,
			JoinDateGTE: req.FromDT,
			JoinDateLTE: req.ToDT,
		}
		list, err := c.AssociateStorer.ListByFilter(ctx, f)
		if err != nil {
			c.Logger.Error("database list by filter error", slog.Any("error", err))
			return nil, err
		}
		for _, associate := range list.Results {
			row := []string{
				associate.Name,
				kv[associate.HowDidYouHearAboutUsID],
				associate.HowDidYouHearAboutUsOther,
			}
			results = append(results, row)
		}
		break
	case 3: // `Staff`
		reportTitle = "How Staff Found Us (Long) Report"

		f := &s_s.StaffPaginationListFilter{
			Cursor:      "",
			PageSize:    1_000_000_000, // Unlimited
			SortField:   "name",
			SortOrder:   s_s.SortOrderAscending,
			TenantID:    tid,
			Status:      s_s.StaffStatusActive,
			JoinDateGTE: req.FromDT,
			JoinDateLTE: req.ToDT,
		}
		list, err := c.StaffStorer.ListByFilter(ctx, f)
		if err != nil {
			c.Logger.Error("database list by filter error", slog.Any("error", err))
			return nil, err
		}
		for _, associate := range list.Results {
			row := []string{
				associate.Name,
				kv[associate.HowDidYouHearAboutUsID],
				associate.HowDidYouHearAboutUsOther,
			}
			results = append(results, row)
		}
		break
	default:
		return nil, nil // Return empty
	}

	//
	// Generate the header rows.
	//

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

	for _, row := range results {
		rows = append(rows, row)
	}

	return rows, nil
}
