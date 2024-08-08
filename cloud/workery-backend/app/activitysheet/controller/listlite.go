package controller

import (
	"context"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	as_s "github.com/over55/monorepo/cloud/workery-backend/app/activitysheet/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
)

func (c *ActivitySheetControllerImpl) LiteListByFilter(ctx context.Context, f *as_s.ActivitySheetPaginationListFilter) (*as_s.ActivitySheetPaginationLiteListResult, error) {
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
	// 	slog.Int("OrderWJID", int(f.OrderWJID)),
	// 	// slog.Any("TenantID", f.TenantID),
	// 	// // slog.Any("Type", f.Type),
	// 	// slog.Any("Status", f.Status),
	// 	// slog.String("SearchText", f.SearchText),
	// 	// slog.Any("FirstName", f.FirstName),
	// 	// slog.Any("LastName", f.LastName),
	// 	// slog.Any("Email", f.Email),
	// 	// slog.Any("Phone", f.Phone),
	// 	// slog.Time("CreatedAtGTE", f.CreatedAtGTE)
	// )

	m, err := c.ActivitySheetStorer.LiteListByFilter(ctx, f)
	if err != nil {
		c.Logger.Error("database list by filter error", slog.Any("error", err))
		return nil, err
	}
	return m, err
}
