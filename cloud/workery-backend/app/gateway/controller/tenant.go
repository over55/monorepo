package controller

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
)

type ExecutiveVisitsTenantRequest struct {
	TenantID primitive.ObjectID `json:"tenant_id,omitempty"`
}

func (impl *GatewayControllerImpl) ExecutiveVisitsTenant(ctx context.Context, req *ExecutiveVisitsTenantRequest) error {
	////
	//// Extract the `sessionID` so we can process it.
	////

	sessionID := ctx.Value(constants.SessionID).(string)
	userRole := ctx.Value(constants.SessionUserRole).(int8)
	// userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	tenantID, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)
	proxies, _ := ctx.Value(constants.SessionProxies).(string)

	if userRole != user_s.UserRoleExecutive {
		impl.Logger.Error("not executive error",
			slog.Int("role", int(userRole)),
			slog.String("ip_address", ipAddress),
			slog.String("proxies", proxies))
		return errors.New("user is not executive")
	}

	// We want to display this information in the console log to keep track of
	// administration accessing various tenants for auditing reasons in the
	// future.
	impl.Logger.Debug("executive visits tenant",
		slog.Any("current_tenant_id", tenantID),
		slog.Any("visiting_tenant_id", req.TenantID),
		slog.String("ip_address", ipAddress),
		slog.String("proxies", proxies))

	////
	//// Lookup in our in-memory the user record for the `sessionID` or error.
	////

	oldUserBin, err := impl.Cache.Get(ctx, sessionID)
	if err != nil {
		impl.Logger.Error("in-memory set error",
			slog.String("ip_address", ipAddress),
			slog.String("proxies", proxies),
			slog.Any("err", err))
		return err
	}

	var u *user_s.User
	err = json.Unmarshal(oldUserBin, &u)
	if err != nil {
		impl.Logger.Error("unmarshal error",
			slog.String("ip_address", ipAddress),
			slog.String("proxies", proxies),
			slog.Any("err", err))
		return err
	}

	////
	//// Set the user's logged in session to point to specific tenant.
	////

	// Set the tenant id of the user's authenticated session.
	u.TenantID = req.TenantID

	// Set expiry duration.
	expiry := 14 * 24 * time.Hour

	newUserBin, err := json.Marshal(u)
	if err != nil {
		impl.Logger.Error("marshalling error",
			slog.String("ip_address", ipAddress),
			slog.String("proxies", proxies),
			slog.Any("err", err))
		return err
	}

	// Save the session.
	if err := impl.Cache.SetWithExpiry(ctx, sessionID, newUserBin, expiry); err != nil {
		impl.Logger.Error("cache set with expiry error",
			slog.String("ip_address", ipAddress),
			slog.String("proxies", proxies),
			slog.Any("err", err))
		return err
	}

	return nil
}
