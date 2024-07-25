package controller

import (
	"context"
	"fmt"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (impl *BulletinControllerImpl) DeleteByID(ctx context.Context, id primitive.ObjectID) error {
	impl.Logger.Debug("deleting bulletin", slog.Any("bulletin_id", id))

	// Extract from our session the following data.
	userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userRole := ctx.Value(constants.SessionUserRole).(int8)

	// Apply protection based on ownership and role.
	switch userRole {
	case u_s.UserRoleExecutive, u_s.UserRoleManagement, u_s.UserRoleFrontlineStaff:
		break
	default:
		impl.Logger.Error("you do not have permission to delete this bulletin",
			slog.String("user_id", userID.Hex()),
			slog.Any("role", userRole))
		return httperror.NewForForbiddenWithSingleField("message", "you do not have permission to delete this bulletin")
	}

	////
	//// Lock this order until completed (including errors as well).
	////

	impl.Kmutex.Lock(id.Hex())
	defer impl.Kmutex.Unlock(id.Hex())

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

		////
		//// Get and delete
		////

		// STEP 1: Lookup the record or error.
		bulletin, err := impl.BulletinStorer.GetByID(ctx, id)
		if err != nil {
			impl.Logger.Error("database get by id error",
				slog.Any("bulletin_id", id),
				slog.Any("error", err))
			return nil, err
		}
		if bulletin == nil {
			err := fmt.Errorf("does not exist by id: %v", id)
			impl.Logger.Error("",
				slog.Any("bulletin_id", id),
				slog.Any("error", err))
			return nil, err
		}

		// STEP 2: Delete from database.
		if err := impl.BulletinStorer.DeleteByID(ctx, id); err != nil {
			impl.Logger.Error("database delete by id error", slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("deleted bulletin", slog.Any("bulletin_id", id))

		////
		//// Exit our transaction successfully.
		////

		return nil, nil
	}

	// Start a transaction

	if _, err := session.WithTransaction(ctx, transactionFunc); err != nil {
		impl.Logger.Error("session failed error",
			slog.Any("error", err))
		return err
	}
	return nil
}
