package controller

import (
	"context"

	"log/slog"

	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
)

func (impl *GatewayControllerImpl) Logout(ctx context.Context) error {
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)
	proxies, _ := ctx.Value(constants.SessionProxies).(string)

	// Extract from our session the following data.
	sessionID := ctx.Value(constants.SessionID).(string)

	if err := impl.Cache.Delete(ctx, sessionID); err != nil {
		impl.Logger.Error("cache delete error",
			slog.String("ip_address", ipAddress),
			slog.Any("err", err))
		return err
	}

	// For debugging purposes only.
	impl.Logger.Debug("logged out successfully",
		slog.String("ip_address", ipAddress),
		slog.String("proxies", proxies),
		slog.Any("session_id", sessionID))

	return nil
}
