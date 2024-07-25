package controller

import (
	"context"
	"fmt"
	"time"

	"log/slog"

	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type GenerateReport21Request struct{}

func (c *ReportControllerImpl) GenerateReport021(ctx context.Context, req *GenerateReport21Request) ([][]string, error) {
	// Modify the customer based on role.
	orgID, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)

	f := &c_s.CustomerPaginationListFilter{
		Cursor:      "",
		PageSize:    1_000_000_000, // Unlimited
		SortField:   "name",
		SortOrder:   c_s.OrderAscending,
		TenantID:    orgID,
		Status:      c_s.CustomerStatusActive,
		IsOkToEmail: 1,
	}
	list, err := c.CustomerStorer.ListByFilter(ctx, f)
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
		{"Marketing Emails"},
		{"Report Date:", todayStr, ""},
		{"", "", ""},
		{"", "", ""},
		{
			"Customer No.",              // 1
			"Name",                      // 2
			"Type",                      // 3
			"Status",                    // 4
			"Address",                   // 7
			"Address (Extra)",           // 8
			"City",                      // 9
			"Province",                  // 10
			"Country",                   // 11
			"Postal",                    // 12
			"Email",                     // 13
			"Telephone",                 // 14
			"Telephone Type",            // 15
			"Telephone Extension",       // 16
			"Other Telephone",           // 17
			"Other Telephone Type",      // 18
			"Other Telephone Extension", // 19
			"Birth Date",                // 20
			"Age",                       // 21
			"How heard",                 // 22
		},
	}

	for _, cust := range list.Results {

		var birthdateStr string = "-"
		if !cust.BirthDate.IsZero() {
			birthdateStr = cust.BirthDate.Format("2006-01-02 15:04:06")
		}

		// Calculate age of customer.
		customerBirthdateStr := cust.BirthDate.Format("2006-01-02")
		customerAgeDiff := time.Now().Sub(cust.BirthDate)
		customerAgeInHours := customerAgeDiff.Hours()
		customerAgeInYears := customerAgeInHours * 0.000114
		customerAgeStr := fmt.Sprintf("%.0f", customerAgeInYears)

		if customerBirthdateStr == "0001-01-01 00:00:00" { // Do not show birthdate if empty.
			customerBirthdateStr = "-"
			customerAgeStr = "-"
		}

		var howHear string = cust.HowDidYouHearAboutUsText
		if cust.IsHowDidYouHearAboutUsOther {
			howHear = cust.HowDidYouHearAboutUsOther
		}

		row := []string{
			fmt.Sprintf("%v", cust.PublicID),     // 1
			cust.Name,                            // 2
			c_s.CustomerTypeLabels[cust.Type],    // 3
			c_s.CustomerStateLabels[cust.Status], // 4
			cust.AddressLine1,                    // 7
			cust.AddressLine2,                    // 8
			cust.City,                            // 9
			cust.Region,                          // 10
			cust.Country,                         // 11
			cust.PostalCode,                      // 12
			cust.Email,                           // 13
			cust.Phone,                           // 14
			c_s.CustomerTelephoneTypeLabels[cust.PhoneType],      // 15
			cust.PhoneExtension,                                  // 16
			cust.OtherPhone,                                      // 17
			c_s.CustomerTelephoneTypeLabels[cust.OtherPhoneType], // 18
			cust.OtherPhoneExtension,                             // 19
			birthdateStr,                                         // 20
			customerAgeStr,                                       // 21
			howHear,                                              // 22
		}

		// Only return record if it has an email address attached.
		if cust.Email != "" {
			rows = append(rows, row)
		}

	}

	return rows, err
}
