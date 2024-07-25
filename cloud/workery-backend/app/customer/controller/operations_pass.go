package controller

import (
	"context"
	"log/slog"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type CustomerOperationChangePasswordRequest struct {
	CustomerID       primitive.ObjectID `bson:"customer_id" json:"customer_id"`
	Password         string             `bson:"password" json:"password"`
	PasswordRepeated string             `bson:"password_repeated" json:"password_repeated"`
}

func (impl *CustomerControllerImpl) validateOperationChangePasswordRequest(ctx context.Context, dirtyData *CustomerOperationChangePasswordRequest) error {
	e := make(map[string]string)

	if dirtyData.CustomerID.IsZero() {
		e["customer_id"] = "missing value"
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

func (impl *CustomerControllerImpl) ChangePassword(ctx context.Context, req *CustomerOperationChangePasswordRequest) error {
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

	if err := impl.validateOperationChangePasswordRequest(ctx, req); err != nil {
		impl.Logger.Warn("validation error", slog.Any("error", err))
		return err
	}

	//
	// Fetch the original customer.
	//

	c, err := impl.CustomerStorer.GetByID(ctx, req.CustomerID)
	if err != nil {
		impl.Logger.Error("database get by id error", slog.Any("error", err))
		return err
	}
	if c == nil {
		return httperror.NewForBadRequestWithSingleField("customer_id", "customer does not exist")
	}

	// Defensive Code: Tenancy protection
	if c.TenantID != tid {
		return httperror.NewForForbiddenWithSingleField("security", "you do not belong to this organization")
	}

	u, err := impl.UserStorer.GetByID(ctx, c.UserID)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return err
	}
	if u == nil {
		impl.Logger.Warn("user does not exist validation error")
		return httperror.NewForBadRequestWithSingleField("message", "user does not have an account, you will need to set an email for this user to create an account")
	}

	// Defensive code - Repair the email.
	email := strings.ToLower(c.Email)
	email = strings.ReplaceAll(email, " ", "")
	email = strings.ReplaceAll(email, "\t", "")
	email = strings.TrimSpace(email)

	// Defensive code - Repair the password.
	req.Password = strings.ReplaceAll(req.Password, " ", "")
	req.Password = strings.ReplaceAll(req.Password, "\t", "")
	req.Password = strings.TrimSpace(req.Password)

	// Secure the password.
	passwordHash, err := impl.Password.GenerateHashFromPassword(req.Password)
	if err != nil {
		impl.Logger.Error("hashing error", slog.Any("error", err))
		return err
	}

	// Update the account.
	u.Email = email
	u.PasswordHash = passwordHash
	u.PasswordHashAlgorithm = impl.Password.AlgorithmName()
	u.ModifiedAt = time.Now()
	u.ModifiedByUserID = userID
	u.ModifiedByUserName = userName
	u.ModifiedFromIPAddress = ipAddress
	if err := impl.UserStorer.UpdateByID(ctx, u); err != nil {
		impl.Logger.Error("update error", slog.Any("err", err))
		return err
	}

	// For debugging purposes only.
	impl.Logger.Error("changed password for customer",
		slog.String("customer_id", c.ID.Hex()),
		slog.Int64("customer_public_id", int64(c.PublicID)),
		slog.String("customer_email", c.Email),
		slog.String("user_id", u.ID.Hex()),
		slog.Int64("user_public_id", int64(u.PublicID)),
		slog.String("user_email", u.Email))

	return nil
}
