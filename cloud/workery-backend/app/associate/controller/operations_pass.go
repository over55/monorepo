package controller

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type AssociateOperationChangePasswordRequest struct {
	AssociateID      primitive.ObjectID `bson:"associate_id" json:"associate_id"`
	Password         string             `bson:"password" json:"password"`
	PasswordRepeated string             `bson:"password_repeated" json:"password_repeated"`
}

func (impl *AssociateControllerImpl) validateOperationChangePasswordRequest(ctx context.Context, dirtyData *AssociateOperationChangePasswordRequest) error {
	e := make(map[string]string)

	if dirtyData.AssociateID.IsZero() {
		e["associate_id"] = "missing value"
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

func (impl *AssociateControllerImpl) ChangePassword(ctx context.Context, req *AssociateOperationChangePasswordRequest) error {
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

		a, err := impl.AssociateStorer.GetByID(sessCtx, req.AssociateID)
		if err != nil {
			impl.Logger.Error("database get by id error", slog.Any("error", err))
			return nil, err
		}
		if a == nil {
			return nil, httperror.NewForBadRequestWithSingleField("associate_id", "associate does not exist")
		}

		// Defensive Code: Tenancy protection
		if a.TenantID != tid {
			return nil, httperror.NewForForbiddenWithSingleField("security", "you do not belong to this organization")
		}

		u, err := impl.UserStorer.GetByID(sessCtx, a.UserID)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			return nil, err
		}
		if u == nil {
			impl.Logger.Warn("user does not exist for associate, proceeding to create now...")
			u, err = impl.createUserFromAssociate(sessCtx, a)
			if err != nil {
				impl.Logger.Error("database error", slog.Any("err", err))
				return nil, err
			}
			a.HasUserAccount = true
			a.UserID = u.ID
			if err := impl.AssociateStorer.UpdateByID(sessCtx, a); err != nil {
				impl.Logger.Error("database update by id error", slog.Any("error", err))
				return nil, err
			}
			impl.Logger.Warn("user attached to associate")
		}

		passwordHash, err := impl.Password.GenerateHashFromPassword(req.Password)
		if err != nil {
			impl.Logger.Error("hashing error", slog.Any("error", err))
			return nil, err
		}

		u.Email = strings.ToLower(a.Email) // Defensive Code: Make sure the associate email and user email are the same!
		u.PasswordHash = passwordHash
		u.PasswordHashAlgorithm = impl.Password.AlgorithmName()
		u.ModifiedAt = time.Now()
		u.ModifiedByUserID = userID
		u.ModifiedByUserName = userName
		u.ModifiedFromIPAddress = ipAddress

		if err := impl.UserStorer.UpdateByID(sessCtx, u); err != nil {
			impl.Logger.Error("update error", slog.Any("err", err))
			return nil, err
		}

		impl.Logger.Error("changed password for associate",
			slog.String("associate_id", a.ID.Hex()),
			slog.Int64("associate_public_id", int64(a.PublicID)),
			slog.String("associate_email", a.Email),
			slog.String("user_id", u.ID.Hex()),
			slog.Int64("user_public_id", int64(u.PublicID)),
			slog.String("user_email", u.Email))

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

func (impl *AssociateControllerImpl) createUserFromAssociate(sessCtx mongo.SessionContext, a *a_s.Associate) (*u_s.User, error) {
	//
	// Get variables from our user authenticated session.
	//

	tid, _ := sessCtx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	// role, _ := sessCtx.Value(constants.SessionUserRole).(int8)
	userID, _ := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := sessCtx.Value(constants.SessionUserName).(string)
	ipAddress, _ := sessCtx.Value(constants.SessionIPAddress).(string)

	impl.Logger.Warn("user account does not exist for associate update, creating user account now",
		slog.Any("AssociateID", a.ID))

	//
	// Create user.
	//

	u := &u_s.User{
		ID:                      primitive.NewObjectID(),
		TenantID:                tid,
		FirstName:               a.FirstName,
		LastName:                a.LastName,
		Name:                    fmt.Sprintf("%s %s", a.FirstName, a.LastName),
		LexicalName:             fmt.Sprintf("%s, %s", a.LastName, a.FirstName),
		OrganizationName:        a.OrganizationName,
		OrganizationType:        a.OrganizationType,
		Email:                   a.Email,
		PasswordHashAlgorithm:   "DO BELOW...",
		PasswordHash:            "DO BELOW...",
		Role:                    u_s.UserRoleAssociate,
		WasEmailVerified:        true,
		EmailVerificationCode:   "",
		EmailVerificationExpiry: time.Now(),
		Phone:                   a.Phone,
		Country:                 a.Country,
		Region:                  a.Region,
		City:                    a.City,
		AgreeTOS:                true,
		AgreePromotionsEmail:    true,
		CreatedAt:               time.Now(),
		CreatedByUserID:         userID,
		CreatedByUserName:       userName,
		CreatedFromIPAddress:    ipAddress,
		ModifiedAt:              time.Now(),
		ModifiedByUserID:        userID,
		ModifiedByUserName:      userName,
		ModifiedFromIPAddress:   ipAddress,
		Status:                  u_s.UserStatusActive,
		Comments:                make([]*u_s.UserComment, 0),
		Salt:                    "",
		JoinedTime:              a.JoinDate,
		PrAccessCode:            "",
		PrExpiryTime:            time.Now(),
		PublicID:                0,
		Timezone:                "American/Toronto",
	}

	//
	// Temporary password.
	//

	// Generate a temporary password.
	temporaryPassword := primitive.NewObjectID().Hex()

	// Hash our password with the temporary password and attach to account.
	temporaryPasswordHash, err := impl.Password.GenerateHashFromPassword(temporaryPassword)
	if err != nil {
		impl.Logger.Error("hashing error", slog.Any("error", err))
		return nil, err
	}
	u.PasswordHashAlgorithm = impl.Password.AlgorithmName()
	u.PasswordHash = temporaryPasswordHash

	//
	// Insert the user into the database.
	//

	if err := impl.UserStorer.Create(sessCtx, u); err != nil {
		impl.Logger.Error("database create error", slog.Any("error", err))
		return nil, err
	}
	impl.Logger.Warn("user account created for associate during update", slog.Any("AssociateID", a.ID))

	return u, nil
}
