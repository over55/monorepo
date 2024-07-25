package controller

import (
	"context"
	"encoding/json"
	"log/slog"
	"strings"
	"time"

	gateway_s "github.com/over55/monorepo/cloud/workery-backend/app/gateway/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (impl *GatewayControllerImpl) Login(ctx context.Context, email, password string) (*gateway_s.LoginResponseIDO, error) {
	// Defensive Code: For security purposes we need to perform some sanitization on the inputs.
	email = strings.ToLower(email)
	email = strings.ReplaceAll(email, " ", "")
	email = strings.ReplaceAll(email, "\t", "")
	email = strings.TrimSpace(email)
	password = strings.ReplaceAll(password, " ", "")
	password = strings.ReplaceAll(password, "\t", "")
	password = strings.TrimSpace(password)

	// Lookup the user in our database, else return a `400 Bad Request` error.
	u, err := impl.UserStorer.GetByEmail(ctx, email)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return nil, err
	}
	if u == nil {
		impl.Logger.Warn("user does not exist validation error", slog.String("email", email))
		return nil, httperror.NewForBadRequestWithSingleField("email", "does not exist")
	}

	// Verify the inputted password and hashed password match.
	passwordMatch, _ := impl.Password.ComparePasswordAndHash(password, u.PasswordHash)
	if passwordMatch == false {
		impl.Logger.Warn("password check validation error")
		return nil, httperror.NewForBadRequestWithSingleField("password", "password do not match with record")
	}

	// Enforce the verification code of the email.
	if u.WasEmailVerified == false {
		impl.Logger.Warn("email verification validation error", slog.Any("u", u))
		return nil, httperror.NewForBadRequestWithSingleField("email", "was not verified")
	}

	// Enforce 2FA if enabled.
	if u.OTPEnabled {
		// We need to reset the `otp_validated` status to be false to force
		// the user to use their `totp authenticator` application.
		u.OTPValidated = false
		u.ModifiedAt = time.Now()
		if err := impl.UserStorer.UpdateByID(ctx, u); err != nil {
			impl.Logger.Error("failed updating user during login", slog.Any("err", err))
			return nil, err
		}
	}

	return impl.loginWithUser(ctx, u)
}

func (impl *GatewayControllerImpl) loginWithUser(ctx context.Context, u *u_s.User) (*gateway_s.LoginResponseIDO, error) {
	uBin, err := json.Marshal(u)
	if err != nil {
		impl.Logger.Error("marshalling error", slog.Any("err", err))
		return nil, err
	}

	// Set expiry duration.
	atExpiry := 24 * time.Hour
	rtExpiry := 14 * 24 * time.Hour

	// Start our session using an access and refresh token.
	sessionUUID := impl.UUID.NewUUID()

	err = impl.Cache.SetWithExpiry(ctx, sessionUUID, uBin, rtExpiry)
	if err != nil {
		impl.Logger.Error("cache set with expiry error", slog.Any("err", err))
		return nil, err
	}

	// Generate our JWT token.
	accessToken, accessTokenExpiry, refreshToken, refreshTokenExpiry, err := impl.JWT.GenerateJWTTokenPair(sessionUUID, atExpiry, rtExpiry)
	if err != nil {
		impl.Logger.Error("jwt generate pairs error", slog.Any("err", err))
		return nil, err
	}

	// Defensive Code: Remove unnecessary information.
	u.PasswordHash = ""
	u.PasswordHashAlgorithm = ""
	u.PrAccessCode = ""
	u.PrExpiryTime = time.Now()
	u.EmailVerificationCode = ""
	u.EmailVerificationExpiry = time.Now()
	u.Comments = nil
	u.Salt = ""
	u.OTPSecret = ""
	u.OTPAuthURL = ""
	u.OTPBackupCodeHash = ""
	u.OTPBackupCodeHashAlgorithm = ""

	// Return our auth keys.
	return &gateway_s.LoginResponseIDO{
		User:                   u,
		AccessToken:            accessToken,
		AccessTokenExpiryTime:  accessTokenExpiry,
		RefreshToken:           refreshToken,
		RefreshTokenExpiryTime: refreshTokenExpiry,
	}, nil
}
