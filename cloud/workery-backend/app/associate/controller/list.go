package controller

import (
	"context"
	"fmt"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	a_c "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (c *AssociateControllerImpl) LiteListAndCountByFilter(ctx context.Context, f *a_c.AssociatePaginationListFilter) (*a_c.AssociatePaginationLiteListAndCountResult, error) {
	// // Extract from our session the following data.
	tenantID := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userRoleID, _ := ctx.Value(constants.SessionUserRole).(int8)

	// Handle permissions based on roles.
	// (1) O55 staff gets full access
	// (2) Customers are only allowed to view the associates that the
	//     customer has done business with.
	// (3) Deny all other user role types.
	switch userRoleID {
	case user_s.UserRoleExecutive, user_s.UserRoleManagement, user_s.UserRoleStaff:
		break
	case user_s.UserRoleCustomer:
		customerID, _ := ctx.Value(constants.SessionUserReferenceID).(primitive.ObjectID)
		ids, err := c.OrderStorer.GetAllByCustomerIDsByAssociateID(ctx, customerID)

		c.Logger.Debug("applying filter based on customer",
			slog.Any("customer_id", customerID),
			slog.Any("associate_ids", ids))
		if err != nil {
			c.Logger.Error("database get all assocaites ids by customer id error", slog.Any("error", err))
			return nil, err
		}
		f.IDs = ids
		break
	default:
		c.Logger.Warn("user does not permission error", slog.Any("role", userRoleID))
		return nil, httperror.NewForForbiddenWithSingleField("forbidden", fmt.Sprintf("you do not have the correct role: %v", userRoleID))
	}

	// Apply filtering based on ownership and role.
	f.TenantID = tenantID // Manditory

	c.Logger.Debug("listing using filter options:",
		slog.Any("Cursor", f.Cursor),
		slog.Int64("PageSize", f.PageSize),
		slog.String("SortField", f.SortField),
		slog.Int("SortOrder", int(f.SortOrder)),
		slog.Any("TenantID", f.TenantID),
		// slog.Any("Type", f.Type),
		// slog.Any("Status", f.Status),
		slog.String("SearchText", f.SearchText),
		slog.Any("FirstName", f.FirstName),
		slog.Any("LastName", f.LastName),
		slog.Any("Email", f.Email),
		slog.Any("Phone", f.Phone),
		slog.Any("is_job_seeker", f.IsJobSeeker),
		slog.Any("has_tax_id", f.HasTaxID),
		slog.Time("CreatedAtGTE", f.CreatedAtGTE))

	m, err := c.AssociateStorer.LiteListAndCountByFilter(ctx, f)
	if err != nil {
		c.Logger.Error("database list by filter error", slog.Any("error", err))
		return nil, err
	}
	return m, err
}
