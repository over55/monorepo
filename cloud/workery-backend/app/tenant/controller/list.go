package controller

import (
	"context"

	"log/slog"

	domain "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	user_d "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (c *TenantControllerImpl) ListByFilter(ctx context.Context, f *domain.TenantListFilter) (*domain.TenantListResult, error) {
	// Extract from our session the following data.
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userRole, _ := ctx.Value(constants.SessionUserRole).(int8)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)
	proxies, _ := ctx.Value(constants.SessionProxies).(string)

	// Apply protection based on ownership and role.
	if userRole != user_d.UserRoleExecutive {
		c.Logger.Error("authenticated user is not staff role error",
			slog.String("ip_address", ipAddress),
			slog.String("proxies", proxies),
			slog.Any("role", userRole),
			slog.Any("userID", userID))
		return nil, httperror.NewForForbiddenWithSingleField("message", "you role does not grant you access to this")
	}

	// c.Logger.Debug("fetching Tenants now...", slog.Any("userID", userID))
	// c.Logger.Debug("listing using filter options:",
	// 	slog.Any("TenantID", f.TenantID),
	// 	slog.Any("Cursor", f.Cursor),
	// 	slog.Int64("PageSize", f.PageSize),
	// 	slog.String("SortField", f.SortField),
	// 	slog.Int("SortOrder", int(f.SortOrder)),
	// 	slog.Any("Status", f.Status),
	// 	slog.Time("CreatedAtGTE", f.CreatedAtGTE),
	// 	slog.String("SearchText", f.SearchText),
	// 	slog.Bool("ExcludeArchived", f.ExcludeArchived))

	m, err := c.TenantStorer.ListByFilter(ctx, f)
	if err != nil {
		c.Logger.Error("database list by filter error",
			slog.String("ip_address", ipAddress),
			slog.String("proxies", proxies),
			slog.Any("error", err))
		return nil, err
	}
	// c.Logger.Debug("fetched Tenants", slog.Any("m", m))
	return m, err
}

func (c *TenantControllerImpl) ListAsSelectOptionByFilter(ctx context.Context, f *domain.TenantListFilter) ([]*domain.TenantAsSelectOption, error) {
	// Extract from our session the following data.
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userRole, _ := ctx.Value(constants.SessionUserRole).(int8)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)
	proxies, _ := ctx.Value(constants.SessionProxies).(string)

	// Apply protection based on ownership and role.
	if userRole != user_d.UserRoleExecutive {
		c.Logger.Error("authenticated user is not staff role error",
			slog.String("ip_address", ipAddress),
			slog.String("proxies", proxies),
			slog.Any("role", userRole),
			slog.Any("userID", userID))
		return nil, httperror.NewForForbiddenWithSingleField("message", "you role does not grant you access to this")
	}

	// c.Logger.Debug("fetching Tenants now...", slog.Any("userID", userID))

	m, err := c.TenantStorer.ListAsSelectOptionByFilter(ctx, f)
	if err != nil {
		c.Logger.Error("database list by filter error",
			slog.String("ip_address", ipAddress),
			slog.String("proxies", proxies),
			slog.Any("error", err))
		return nil, err
	}
	// c.Logger.Debug("fetched Tenants", slog.Any("m", m))
	return m, err
}
