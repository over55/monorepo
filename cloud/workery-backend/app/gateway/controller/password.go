package controller

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	u_ds "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type PasswordResetRequestIDO struct {
	VerificationCode string `json:"verification_code"`
	Password         string `json:"password"`
	PasswordRepeated string `json:"password_repeated"`
}

func validatePasswordResetRequest(dirtyData *PasswordResetRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.VerificationCode == "" {
		e["verification_code"] = "missing value"
	}
	if dirtyData.Password == "" {
		e["password"] = "missing value"
	}
	if len(dirtyData.Password) > 255 {
		e["password"] = "too long"
	}
	if dirtyData.PasswordRepeated == "" {
		e["password_repeated"] = "missing value"
	}
	if len(dirtyData.PasswordRepeated) > 255 {
		e["password_repeated"] = "too long"
	}
	if dirtyData.Password != dirtyData.PasswordRepeated {
		e["password"] = "value does not match"
		e["password_repeated"] = "value does not match"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *GatewayControllerImpl) PasswordReset(ctx context.Context, req *PasswordResetRequestIDO) error {
	// Perform our validation and return validation error on any issues detected.
	if err := validatePasswordResetRequest(req); err != nil {
		return err
	}

	// Lookup the user in our database, else return a `400 Bad Request` error.
	u, err := impl.UserStorer.GetByVerificationCode(ctx, req.VerificationCode)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return err
	}
	if u == nil {
		impl.Logger.Warn("user does not exist validation error")
		return httperror.NewForBadRequestWithSingleField("code", "does not exist")
	}

	//TODO: Handle expiry dates.

	passwordHash, err := impl.Password.GenerateHashFromPassword(req.Password)
	if err != nil {
		impl.Logger.Error("hashing error", slog.Any("error", err))
		return err
	}

	u.PasswordHash = passwordHash
	u.PasswordHashAlgorithm = impl.Password.AlgorithmName()
	u.EmailVerificationCode = "" // Remove email active code so it cannot be used agian.
	u.EmailVerificationExpiry = time.Now()
	u.ModifiedAt = time.Now()

	if err := impl.UserStorer.UpdateByID(ctx, u); err != nil {
		impl.Logger.Error("update error", slog.Any("err", err))
		return err
	}

	return nil
}

type ChangePasswordRequestIDO struct {
	NewPassword         string `json:"new_password"`
	NewPasswordRepeated string `json:"new_password_repeated"`
	OldPassword         string `json:"old_password"`
}

func (impl *GatewayControllerImpl) validateChangePasswordRequest(u *u_ds.User, dirtyData *ChangePasswordRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.NewPassword == "" {
		e["new_password"] = "missing value"
	}
	if dirtyData.NewPasswordRepeated == "" {
		e["new_password_repeated"] = "missing value"
	}
	if dirtyData.NewPassword != dirtyData.NewPasswordRepeated {
		e["new_password"] = "does not match"
		e["new_password_repeated"] = "does not match"
	}
	if dirtyData.OldPassword == "" {
		e["old_password"] = "missing value"
	} else {
		// Verify the inputted password and hashed password match.
		passwordMatch, _ := impl.Password.ComparePasswordAndHash(dirtyData.OldPassword, u.PasswordHash)
		if passwordMatch == false {
			e["old_password"] = "does not match your current password on record"
		}
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

// ChangePassword function will change the password of the current user in the session.
func (impl *GatewayControllerImpl) ChangePassword(ctx context.Context, req *ChangePasswordRequestIDO) error {
	// Extract from our session the following data.
	userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)

	// Lookup the user in our database, else return a `400 Bad Request` error.
	u, err := impl.UserStorer.GetByID(ctx, userID)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return err
	}
	if u == nil {
		impl.Logger.Warn("user does not exist validation error")
		return httperror.NewForBadRequestWithSingleField("id", "does not exist")
	}

	// Perform our validation and return validation error on any issues detected.
	if err := impl.validateChangePasswordRequest(u, req); err != nil {
		return err
	}

	passwordHash, err := impl.Password.GenerateHashFromPassword(req.NewPassword)
	if err != nil {
		impl.Logger.Error("hashing error", slog.Any("error", err))
		return err
	}

	u.PasswordHash = passwordHash
	u.PasswordHashAlgorithm = impl.Password.AlgorithmName()
	u.EmailVerificationCode = "" // Remove email active code so it cannot be used agian.
	u.EmailVerificationExpiry = time.Now()
	u.ModifiedAt = time.Now()

	if err := impl.UserStorer.UpdateByID(ctx, u); err != nil {
		impl.Logger.Error("update error", slog.Any("err", err))
		return err
	}

	impl.Logger.Error("changed password for my account",
		slog.String("user_id", u.ID.Hex()),
		slog.String("user_email", u.Email))

	return nil
}
