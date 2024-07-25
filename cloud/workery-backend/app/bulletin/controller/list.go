package controller

import (
	"context"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	bul_s "github.com/over55/monorepo/cloud/workery-backend/app/bulletin/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
)

func (c *BulletinControllerImpl) ListAndCountByFilter(ctx context.Context, f *bul_s.BulletinPaginationListFilter) (*bul_s.BulletinPaginationListAndCountResult, error) {
	// // Extract from our session the following data.
	tenantID := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)

	// Apply filtering based on ownership and role.
	f.TenantID = tenantID // Manditory

	c.Logger.Debug("listing using filter options:",
		slog.Any("Cursor", f.Cursor),
		slog.Int64("PageSize", f.PageSize),
		slog.String("SortField", f.SortField),
		slog.Int("SortOrder", int(f.SortOrder)),
		slog.Any("TenantID", f.TenantID),
		slog.Any("Status", f.Status),
		slog.String("SearchText", f.SearchText))

	res, err := c.BulletinStorer.ListAndCountByFilter(ctx, f)
	if err != nil {
		c.Logger.Error("database list by filter error", slog.Any("error", err))
		return nil, err
	}
	return res, err
}
