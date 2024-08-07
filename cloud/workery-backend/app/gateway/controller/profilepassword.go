package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type ProfileChangePasswordRequestIDO struct {
	OldPassword      string `json:"old_password"`
	Password         string `json:"password"`
	PasswordRepeated string `json:"password_repeated"`
}

func ValidateProfileChangePassworRequest(dirtyData *ProfileChangePasswordRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.OldPassword == "" {
		e["old_password"] = "missing value"
	}
	if dirtyData.Password == "" {
		e["password"] = "missing value"
	}
	if dirtyData.PasswordRepeated == "" {
		e["password_repeated"] = "missing value"
	}
	if dirtyData.PasswordRepeated != dirtyData.Password {
		e["password"] = "does not match"
		e["password_repeated"] = "does not match"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *GatewayControllerImpl) ProfileChangePassword(ctx context.Context, req *ProfileChangePasswordRequestIDO) error {
	// Extract from our session the following data.
	userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	// Lookup the user in our database, else return a `400 Bad Request` error.
	u, err := impl.UserStorer.GetByID(ctx, userID)
	if err != nil {
		impl.Logger.Error("database error",
			slog.String("ip_address", ipAddress),
			slog.Any("err", err))
		return err
	}
	if u == nil {
		impl.Logger.Error("user does not exist validation error",
			slog.String("ip_address", ipAddress))
		return httperror.NewForBadRequestWithSingleField("id", "does not exist")
	}

	if err := ValidateProfileChangePassworRequest(req); err != nil {
		impl.Logger.Warn("user validation failed",
			slog.String("ip_address", ipAddress),
			slog.Any("err", err))
		return err
	}

	// Verify the inputted password and hashed password match.
	if passwordMatch, _ := impl.Password.ComparePasswordAndHash(req.OldPassword, u.PasswordHash); passwordMatch == false {
		impl.Logger.Warn("password check validation error",
			slog.String("ip_address", ipAddress))
		return httperror.NewForBadRequestWithSingleField("old_password", "old password do not match with record of existing password")
	}

	passwordHash, err := impl.Password.GenerateHashFromPassword(req.Password)
	if err != nil {
		impl.Logger.Error("hashing error",
			slog.String("ip_address", ipAddress),
			slog.Any("error", err))
		return err
	}
	u.PasswordHash = passwordHash
	u.PasswordHashAlgorithm = impl.Password.AlgorithmName()
	if err := impl.UserStorer.UpdateByID(ctx, u); err != nil {
		impl.Logger.Error("user update by id error",
			slog.String("ip_address", ipAddress),
			slog.Any("error", err))
		return err
	}
	return nil
}
