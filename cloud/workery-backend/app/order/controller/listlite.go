package controller

import (
	"context"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (c *OrderControllerImpl) LiteListAndCountByFilter(ctx context.Context, f *o_s.OrderPaginationListFilter) (*o_s.OrderPaginationLiteListAndCountResult, error) {
	// Extract from our session the following data.
	tenantID := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userRoleID, _ := ctx.Value(constants.SessionUserRole).(int8)

	// Apply filtering based on ownership and role.
	f.TenantID = tenantID // Manditory

	// Handle permissions based on roles.
	// (1) O55 staff gets full access
	// (2) Associates are only allowed to view the orders that the
	//     associate has done business with.
	// (3) Deny all other user role types.
	switch userRoleID {
	case user_s.UserRoleExecutive, user_s.UserRoleManagement, user_s.UserRoleStaff:
		break
	case user_s.UserRoleAssociate:
		associateID, _ := ctx.Value(constants.SessionUserReferenceID).(primitive.ObjectID)
		f.AssociateID = associateID
		c.Logger.Debug("applying filter based on associate role",
			slog.Any("associate_id", associateID))
	case user_s.UserRoleCustomer:
		customerID, _ := ctx.Value(constants.SessionUserReferenceID).(primitive.ObjectID)
		f.CustomerID = customerID
		c.Logger.Debug("applying filter based on customer role",
			slog.Any("customer_id", customerID))
	default:
		c.Logger.Warn("user does not permission error", slog.Any("role", userRoleID))
		return nil, httperror.NewForForbiddenWithSingleField("forbidden", "you do not have the correct role")
	}

	// For debugging purposes only.
	// c.Logger.Debug("listing using filter options:",
	// 	slog.Any("Cursor", f.Cursor),
	// 	slog.Int64("PageSize", f.PageSize),
	// 	slog.String("SortField", f.SortField),
	// 	slog.Int("SortOrder", int(f.SortOrder)),
	// 	// slog.Any("TenantID", f.TenantID),
	// 	// // slog.Any("Type", f.Type),
	// 	// slog.Any("Status", f.Status),
	// 	slog.String("SearchText", f.SearchText),
	// 	slog.Any("CustomerFirstName", f.CustomerFirstName),
	// 	slog.Any("CustomerLastName", f.CustomerLastName),
	// 	slog.Any("CustomerEmail", f.CustomerEmail),
	// 	slog.Any("CustomerPhone", f.CustomerPhone),
	// 	// slog.Time("CreatedAtGTE", f.CreatedAtGTE)
	// )

	m, err := c.OrderStorer.LiteListAndCountByFilter(ctx, f)
	if err != nil {
		c.Logger.Error("database list by filter error", slog.Any("error", err))
		return nil, err
	}
	return m, err
}
