package controller

import (
	"context"
	"log/slog"
	"time"

	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl *CustomerControllerImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*c_s.Customer, error) {
	// Extract from our session the following data.
	tenantID, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userRoleID, _ := ctx.Value(constants.SessionUserRole).(int8)

	// Retrieve from our database the record for the specific id.
	m, err := impl.CustomerStorer.GetByID(ctx, id)
	if err != nil {
		impl.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	if m == nil {
		impl.Logger.Error("customer does not exist error", slog.Any("customerID", id))
		return nil, httperror.NewForBadRequestWithSingleField("customer_id", "customer does not exist")
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
		ids, err := impl.OrderStorer.GetAllByCustomerIDsByAssociateID(ctx, associateID)
		if err != nil {
			impl.Logger.Error("database get all customer ids by associate ids error", slog.Any("error", err))
			return nil, err
		}

		// Check to see if associate has permission to see the details of this
		// customer.
		var found bool = false
		for _, id := range ids {
			if id == m.ID {
				found = true
			}
		}
		if found == false {
			impl.Logger.Warn("user does not permission to view customer detail error")
			return nil, httperror.NewForForbiddenWithSingleField("forbidden", "you do not have permission to view this customer")
		}
		impl.Logger.Debug("permission granted based on associate",
			slog.Any("associate_id", associateID),
			slog.Any("customer_id", m.ID),
			slog.Any("customer_ids", ids))
	default:
		impl.Logger.Warn("user does not permission error", slog.Any("role", userRoleID))
		return nil, httperror.NewForForbiddenWithSingleField("forbidden", "you do not have the correct role")
	}

	// Generate most recent avatar URL if it exists and it has expired.
	if m.AvatarObjectKey != "" {
		if time.Now().After(m.AvatarObjectExpiry) {
			// Get preseigned URL.
			avatarObjectExpiry := time.Now().Add(time.Minute * 30)
			avatarFileURL, err := impl.S3.GetPresignedURL(ctx, m.AvatarObjectKey, time.Minute*30)
			if err != nil {
				impl.Logger.Error("s3 failed get presigned url error", slog.Any("error", err))
				return nil, err
			}
			m.AvatarObjectURL = avatarFileURL
			m.AvatarObjectExpiry = avatarObjectExpiry

			// Save to the database the modified customer.
			if err := impl.CustomerStorer.UpdateByID(ctx, m); err != nil {
				impl.Logger.Error("database update by id error", slog.Any("error", err))
				return nil, err
			}

			// For debugging purposes only.
			impl.Logger.Debug("refreshed avatar object url", slog.String("avatarFileURL", avatarFileURL))
		}
	}

	return m, err
}
