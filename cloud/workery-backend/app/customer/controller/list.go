package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (c *CustomerControllerImpl) LiteListAndCountByFilter(ctx context.Context, f *c_s.CustomerPaginationListFilter) (*c_s.CustomerPaginationLiteListAndCountResult, error) {
	// Extract from our session the following data.
	tenantID, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userRoleID, _ := ctx.Value(constants.SessionUserRole).(int8)

	// Handle permissions based on roles.
	// (1) O55 staff gets full access
	// (2) Associates are only allowed to view the customers that the
	//     associate has done business with.
	// (3) Deny all other user role types.
	switch userRoleID {
	case user_s.UserRoleExecutive, user_s.UserRoleManagement, user_s.UserRoleStaff:
		break
	case user_s.UserRoleAssociate:
		associateID, _ := ctx.Value(constants.SessionUserReferenceID).(primitive.ObjectID)
		ids, err := c.OrderStorer.GetAllByCustomerIDsByAssociateID(ctx, associateID)

		c.Logger.Debug("applying filter based on associate",
			slog.Any("associate_id", associateID),
			slog.Any("customer_ids", ids))
		if err != nil {
			c.Logger.Error("database get all customer ids by associate ids error", slog.Any("error", err))
			return nil, err
		}
		f.IDs = ids
	default:
		c.Logger.Warn("user does not permission error", slog.Any("role", userRoleID))
		return nil, httperror.NewForForbiddenWithSingleField("forbidden", "you do not have the correct role")
	}

	// Apply filtering based on ownership and role.
	f.TenantID = tenantID // Manditory

	c.Logger.Debug("listing using filter options:",
		slog.String("Cursor", f.Cursor),
		slog.Int64("PageSize", f.PageSize),
		slog.String("SortField", f.SortField),
		slog.Int("SortOrder", int(f.SortOrder)),
		slog.Any("TenantID", f.TenantID),
		slog.Any("Type", f.Type),
		slog.Any("Status", f.Status),
		slog.String("SearchText", f.SearchText),
		slog.Any("FirstName", f.FirstName),
		slog.Any("LastName", f.LastName),
		slog.Any("Email", f.Email),
		slog.Any("Phone", f.Phone),
		slog.Time("CreatedAtGTE", f.CreatedAtGTE))

	m, err := c.CustomerStorer.LiteListAndCountByFilter(ctx, f)
	if err != nil {
		c.Logger.Error("database list by filter error", slog.Any("error", err))
		return nil, err
	}
	return m, err
}
