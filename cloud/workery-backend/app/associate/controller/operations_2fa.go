package controller

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type AssociateOperationChangeTwoFactorAuthenticationRequest struct {
	AssociateID primitive.ObjectID `bson:"associate_id" json:"associate_id"`
	OTPEnabled  bool               `bson:"otp_enabled" json:"otp_enabled"`
}

func (impl *AssociateControllerImpl) validateOperationChangeTwoFactorAuthenticationRequest(ctx context.Context, dirtyData *AssociateOperationChangeTwoFactorAuthenticationRequest) error {
	e := make(map[string]string)

	if dirtyData.AssociateID.IsZero() {
		e["associate_id"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *AssociateControllerImpl) ChangeTwoFactorAuthentication(ctx context.Context, req *AssociateOperationChangeTwoFactorAuthenticationRequest) error {
	//
	// Get variables from our user authenticated session.
	//

	tid, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	role, _ := ctx.Value(constants.SessionUserRole).(int8)
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	switch role {
	case u_s.UserRoleExecutive, u_s.UserRoleManagement:
		break
	default:
		impl.Logger.Error("you do not have permission to change password")
		return httperror.NewForForbiddenWithSingleField("message", "you do not have permission to change password")
	}

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateOperationChangeTwoFactorAuthenticationRequest(ctx, req); err != nil {
		impl.Logger.Warn("validation error", slog.Any("error", err))
		return err
	}

	////
	//// Start the transaction.
	////

	session, err := impl.DbClient.StartSession()
	if err != nil {
		impl.Logger.Error("start session error",
			slog.Any("error", err))
		return err
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {

		//
		// Fetch the original associate.
		//

		s, err := impl.AssociateStorer.GetByID(sessCtx, req.AssociateID)
		if err != nil {
			impl.Logger.Error("database get by id error", slog.Any("error", err))
			return nil, err
		}
		if s == nil {
			return nil, httperror.NewForBadRequestWithSingleField("associate_id", "associate does not exist")
		}

		// Defensive Code: Tenancy protection
		if s.TenantID != tid {
			return nil, httperror.NewForForbiddenWithSingleField("security", "you do not belong to this organization")
		}

		u, err := impl.UserStorer.GetByID(sessCtx, s.UserID)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			return nil, err
		}
		if u == nil {
			err := fmt.Errorf("user does not exist for id: %s", u.ID.Hex())
			return nil, err
		}

		if req.OTPEnabled {
			// CASE 1 OF 2: Added 2FA
			// The following case will force the user to set 2FA on their
			// next first login to load up the wizard and help them through
			// the 2FA setup process.

			// Update user record.
			u.OTPEnabled = true
			u.OTPVerified = false
			u.OTPValidated = false
			u.OTPSecret = ""
			u.OTPAuthURL = ""

			// Update associate record.
			s.OTPEnabled = true

		} else {
			// CASE 2 OF 2: Remove 2FA
			// The following code will disable all 2FA details.

			// Update user record.
			u.OTPEnabled = false
			u.OTPVerified = false
			u.OTPValidated = false
			u.OTPSecret = ""
			u.OTPAuthURL = ""

			// Update associate record.
			s.OTPEnabled = false
		}

		// Update user record.
		u.ModifiedAt = time.Now()
		u.ModifiedByUserID = userID
		u.ModifiedByUserName = userName
		u.ModifiedFromIPAddress = ipAddress

		// Update associate record.
		s.ModifiedAt = time.Now()
		s.ModifiedByUserID = userID
		s.ModifiedByUserName = userName
		s.ModifiedFromIPAddress = ipAddress

		impl.Logger.Error("record",

			slog.Any("req", req.OTPEnabled),
			slog.Any("u", u.OTPEnabled),
			slog.Any("s", s.OTPEnabled))

		if err := impl.UserStorer.UpdateByID(sessCtx, u); err != nil {
			impl.Logger.Error("update user error", slog.Any("err", err))
			return nil, err
		}
		if err := impl.AssociateStorer.UpdateByID(sessCtx, s); err != nil {
			impl.Logger.Error("update associate error", slog.Any("err", err))
			return nil, err
		}

		return u, nil
	}

	// Start a transaction
	if _, err := session.WithTransaction(ctx, transactionFunc); err != nil {
		impl.Logger.Error("session failed error",
			slog.Any("error", err))
		return err
	}

	return nil
}
