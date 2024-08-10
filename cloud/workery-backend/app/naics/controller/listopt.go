package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	naics_s "github.com/over55/monorepo/cloud/workery-backend/app/naics/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
)

func (c *NorthAmericanIndustryClassificationSystemControllerImpl) ListAsSelectOptionByFilter(ctx context.Context, f *naics_s.NorthAmericanIndustryClassificationSystemPaginationListFilter) ([]*naics_s.NorthAmericanIndustryClassificationSystemAsSelectOption, error) {
	// // Extract from our session the following data.
	tenantID := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)

	// Apply filtering based on ownership and role.
	f.TenantID = tenantID // Manditory

	// For debugging purposes only.
	// c.Logger.Debug("listing using filter options:",
	// 	slog.Any("Cursor", f.Cursor),
	// 	slog.Int64("PageSize", f.PageSize),
	// 	slog.String("SortField", f.SortField),
	// 	slog.Int("SortOrder", int(f.SortOrder)),
	// 	slog.Any("TenantID", f.TenantID),
	// )

	// Filtering the database.
	m, err := c.NorthAmericanIndustryClassificationSystemStorer.ListAsSelectOptionByFilter(ctx, f)
	if err != nil {
		c.Logger.Error("database list by filter error", slog.Any("error", err))
		return nil, err
	}
	return m, err
}