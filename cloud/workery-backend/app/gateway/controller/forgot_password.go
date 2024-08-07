package controller

import (
	"context"
	"strings"

	"log/slog"

	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (impl *GatewayControllerImpl) ForgotPassword(ctx context.Context, email string) error {
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	// Defensive Code: For security purposes we need to remove all whitespaces from the email and lower the characters.
	email = strings.ToLower(email)

	// Lookup the user in our database, else return a `400 Bad Request` error.
	u, err := impl.UserStorer.GetByEmail(ctx, email)
	if err != nil {
		impl.Logger.Error("database error",
			slog.String("ip_address", ipAddress),
			slog.Any("err", err))
		return err
	}
	if u == nil {
		impl.Logger.Warn("user does not exist validation error",
			slog.String("ip_address", ipAddress),
			slog.String("email", email))
		return httperror.NewForBadRequestWithSingleField("email", "does not exist")
	}

	// Generate unique token and save it to the user record.
	u.EmailVerificationCode = impl.UUID.NewUUID()
	if err := impl.UserStorer.UpdateByID(ctx, u); err != nil {
		impl.Logger.Warn("user update by id failed",
			slog.String("ip_address", ipAddress),
			slog.Any("error", err))
		return err
	}

	// Send password reset email.
	return impl.TemplatedEmailer.SendForgotPasswordEmail(email, u.EmailVerificationCode, u.FirstName)
}
