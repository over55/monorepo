package controller

import (
	"context"
	"log/slog"
	"time"

	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl *OrderControllerImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*o_s.Order, error) {
	// Extract from our session the following data.
	tenantID := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userRoleID, _ := ctx.Value(constants.SessionUserRole).(int8)

	// Lock this order until completed (including errors as well).
	impl.Kmutex.Lock(id.Hex())
	defer impl.Kmutex.Unlock(id.Hex())

	// Retrieve from our database the record for the specific id.
	m, err := impl.OrderStorer.GetByID(ctx, id)
	if err != nil {
		impl.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	if m == nil {
		impl.Logger.Error("order does not exist error", slog.Any("orderID", id))
		return nil, httperror.NewForBadRequestWithSingleField("order_id", "order does not exist")
	}

	// Handle permissions based on roles.
	// (1) O55 staff gets full access
	// (2) Associates are only allowed to view the customers that the
	//     associate has done business with.
	// (3) Deny all other user role types.
	switch userRoleID {
	case user_s.UserRoleExecutive, user_s.UserRoleManagement, user_s.UserRoleStaff:
		if m.TenantID != tenantID {
			impl.Logger.Error("incorrect tenant membership error", slog.Any("tenant_id", tenantID))
			return nil, httperror.NewForForbiddenWithSingleField("forbidden", "you do not have organization membership to view")
		}
	case user_s.UserRoleAssociate:
		associateID, _ := ctx.Value(constants.SessionUserReferenceID).(primitive.ObjectID)
		if m.AssociateID != associateID {
			impl.Logger.Warn("user does not permission to view customer detail error")
			return nil, httperror.NewForForbiddenWithSingleField("forbidden", "you do not have permission to view this customer")
		}
		impl.Logger.Debug("applying filter based on associate role",
			slog.Any("associate_id", associateID))
	default:
		impl.Logger.Warn("user does not permission error", slog.Any("role", userRoleID))
		return nil, httperror.NewForForbiddenWithSingleField("forbidden", "you do not have the correct role")
	}

	if err := impl.refreshInvoiceObjectURL(ctx, m); err != nil {
		impl.Logger.Error("failed refreshing invoice object url",
			slog.Any("orderID", id),
			slog.Any("error", err))
		return nil, err
	}

	return m, err
}

func (impl *OrderControllerImpl) GetByWJID(ctx context.Context, wjid uint64) (*o_s.Order, error) {
	// Extract from our session the following data.
	tenantID := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userRoleID, _ := ctx.Value(constants.SessionUserRole).(int8)

	impl.Kmutex.Lockf("%v", wjid)
	defer impl.Kmutex.Unlockf("%v", wjid)

	// Retrieve from our database the record for the specific id.
	m, err := impl.OrderStorer.GetByWJID(ctx, wjid)
	if err != nil {
		impl.Logger.Error("database get by wjid error",
			slog.Any("error", err),
			slog.Any("wjid", wjid))
		return nil, err
	}
	if m == nil {
		impl.Logger.Error("order does not exist error", slog.Any("wjid", wjid))
		return nil, httperror.NewForBadRequestWithSingleField("order_id", "order does not exist")
	}

	// Handle permissions based on roles.
	// (1) O55 staff gets full access
	// (2) Associates are only allowed to view the customers that the
	//     associate has done business with.
	// (3) Deny all other user role types.
	switch userRoleID {
	case user_s.UserRoleExecutive, user_s.UserRoleManagement, user_s.UserRoleStaff:
		if m.TenantID != tenantID {
			impl.Logger.Error("incorrect tenant membership error", slog.Any("tenant_id", tenantID))
			return nil, httperror.NewForForbiddenWithSingleField("forbidden", "you do not have organization membership to view")
		}
	case user_s.UserRoleAssociate:
		associateID, _ := ctx.Value(constants.SessionUserReferenceID).(primitive.ObjectID)
		if m.AssociateID != associateID {
			impl.Logger.Warn("user does not permission to view customer detail error")
			return nil, httperror.NewForForbiddenWithSingleField("forbidden", "you do not have permission to view this customer")
		}
		impl.Logger.Debug("applying filter based on associate role",
			slog.Any("associate_id", associateID))
	default:
		impl.Logger.Warn("user does not permission error", slog.Any("role", userRoleID))
		return nil, httperror.NewForForbiddenWithSingleField("forbidden", "you do not have the correct role")
	}

	if err := impl.refreshInvoiceObjectURL(ctx, m); err != nil {
		impl.Logger.Error("failed refreshing invoice object url",
			slog.Any("order_wjid", wjid),
			slog.Any("error", err))
		return nil, err
	}

	return m, err
}

// refreshInvoiceObjectURL function checks whether the URL has expired and theus
// need to be refreshed.
func (impl *OrderControllerImpl) refreshInvoiceObjectURL(ctx context.Context, o *o_s.Order) error {
	if o.Invoice != nil {
		// Generate most recent avatar URL if it exists and it has expired.
		if o.Invoice.FileObjectKey != "" {
			if time.Now().After(o.Invoice.FileObjectExpiry) {
				// Get preseigned URL.
				avatarObjectExpiry := time.Now().Add(time.Minute * 30)
				fileObjectURL, err := impl.S3.GetPresignedURL(ctx, o.Invoice.FileObjectKey, time.Minute*30)
				if err != nil {
					impl.Logger.Error("s3 failed get presigned url error", slog.Any("error", err))
					return err
				}
				o.Invoice.FileObjectURL = fileObjectURL
				o.Invoice.FileObjectExpiry = avatarObjectExpiry

				// Save to the database the modified order.
				if err := impl.OrderStorer.UpdateByID(ctx, o); err != nil {
					impl.Logger.Error("database update by id error", slog.Any("error", err))
					return err
				}

				// For debugging purposes only.
				impl.Logger.Debug("refreshed file object url", slog.String("fileObjectURL", fileObjectURL))
			}
		}
	}
	return nil
}
