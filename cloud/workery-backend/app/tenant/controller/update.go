package controller

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"log/slog"

	domain "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	user_d "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (c *TenantControllerImpl) UpdateByID(ctx context.Context, ns *domain.Tenant) (*domain.Tenant, error) {
	// Fetch the original Tenant.
	os, err := c.TenantStorer.GetByID(ctx, ns.ID)
	if err != nil {
		c.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	if os == nil {
		c.Logger.Error("Tenant does not exist error",
			slog.Any("Tenant_id", ns.ID))
		return nil, httperror.NewForBadRequestWithSingleField("message", "Tenant does not exist")
	}

	// Extract from our session the following data.
	userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userTenantID := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userRole := ctx.Value(constants.SessionUserRole).(int8)
	userName := ctx.Value(constants.SessionUserName).(string)

	// If user is not administrator nor belongs to the Tenant then error.
	if userRole != user_d.UserRoleExecutive && os.ID != userTenantID {
		c.Logger.Error("authenticated user is not staff role nor belongs to the Tenant error",
			slog.Any("userRole", userRole),
			slog.Any("userTenantID", userTenantID))
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not belong to this Tenant")
	}

	// Modify our original Tenant.
	os.ModifiedAt = time.Now()
	os.ModifiedByUserID = userID
	os.ModifiedByUserName = userName
	os.Status = ns.Status
	os.Name = ns.Name

	// Save to the database the modified Tenant.
	if err := c.TenantStorer.UpdateByID(ctx, os); err != nil {
		c.Logger.Error("database update by id error", slog.Any("error", err))
		return nil, err
	}

	return os, nil
}
