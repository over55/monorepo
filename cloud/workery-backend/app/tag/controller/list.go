package controller

import (
	"context"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	t_s "github.com/over55/monorepo/cloud/workery-backend/app/tag/datastore"
	tag_s "github.com/over55/monorepo/cloud/workery-backend/app/tag/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
)

func (c *TagControllerImpl) ListAndCountByFilter(ctx context.Context, f *t_s.TagPaginationListFilter) (*t_s.TagPaginationListAndCountResult, error) {
	// // Extract from our session the following data.
	tenantID := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)

	// Apply filtering based on ownership and role.
	f.TenantID = tenantID // Manditory

	c.Logger.Debug("listing using filter options:",
		slog.Any("Cursor", f.Cursor),
		slog.Int64("PageSize", f.PageSize),
		slog.String("SortField", f.SortField),
		// slog.Int("SortOrder", int(f.SortOrder)),
		// slog.Any("TenantID", f.TenantID),
		// slog.Any("Type", f.Type),
		// slog.Any("Status", f.Status),
		// slog.Bool("ExcludeArchived", f.ExcludeArchived),
		// slog.String("SearchText", f.SearchText),
		// slog.Any("FirstName", f.FirstName),
		// slog.Any("LastName", f.LastName),
		// slog.Any("Email", f.Email),
		// slog.Any("Phone", f.Phone),
		// slog.Time("CreatedAtGTE", f.CreatedAtGTE)
	)

	m, err := c.TagStorer.ListAndCountByFilter(ctx, f)
	if err != nil {
		c.Logger.Error("database list by filter error", slog.Any("error", err))
		return nil, err
	}
	return m, err
}

// func (c *TagControllerImpl) LiteListByFilter(ctx context.Context, f *t_s.TagListFilter) (*t_s.TagLiteListResult, error) {
// 	// // Extract from our session the following data.
// 	tenantID := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
//
// 	// Apply filtering based on ownership and role.
// 	f.TenantID = tenantID // Manditory
//
// 	c.Logger.Debug("listing using filter options:",
// 		slog.Any("Cursor", f.Cursor),
// 		slog.Int64("PageSize", f.PageSize),
// 		slog.String("SortField", f.SortField),
// 		slog.Int("SortOrder", int(f.SortOrder)),
// 		slog.Any("TenantID", f.TenantID),
// 	)
//
// 	m, err := c.TagStorer.LiteListByFilter(ctx, f)
// 	if err != nil {
// 		c.Logger.Error("database list by filter error", slog.Any("error", err))
// 		return nil, err
// 	}
// 	return m, err
// }

func (c *TagControllerImpl) ListAsSelectOptionByFilter(ctx context.Context, f *tag_s.TagListFilter) ([]*tag_s.TagAsSelectOption, error) {
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
	)

	// Filtering the database.
	m, err := c.TagStorer.ListAsSelectOptionByFilter(ctx, f)
	if err != nil {
		c.Logger.Error("database list by filter error", slog.Any("error", err))
		return nil, err
	}
	return m, err
}
