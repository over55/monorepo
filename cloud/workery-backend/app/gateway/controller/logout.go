package controller

import (
	"context"

	"log/slog"

	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
)

func (impl *GatewayControllerImpl) Logout(ctx context.Context) error {
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	// Extract from our session the following data.
	sessionID := ctx.Value(constants.SessionID).(string)

	if err := impl.Cache.Delete(ctx, sessionID); err != nil {
		impl.Logger.Error("cache delete error",
			slog.String("ip_address", ipAddress),
			slog.Any("err", err))
		return err
	}

	return nil
}
