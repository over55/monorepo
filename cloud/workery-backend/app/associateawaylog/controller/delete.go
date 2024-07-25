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

func (impl *AssociateAwayLogControllerImpl) DeleteByID(ctx context.Context, id primitive.ObjectID) error {
	// Extract from our session the following data.
	userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userRole := ctx.Value(constants.SessionUserRole).(int8)

	// Apply protection based on ownership and role.
	switch userRole {
	case u_s.UserRoleExecutive, u_s.UserRoleManagement, u_s.UserRoleFrontlineStaff:
		break
	default:
		impl.Logger.Error("you do not have permission to delete this associate away log",
			slog.String("user_id", userID.Hex()),
			slog.Any("role", userRole))
		return httperror.NewForForbiddenWithSingleField("message", "you do not have permission to delete this associate away log")
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

		////
		//// Get related records.
		////

		associateawaylog, err := impl.GetByID(sessCtx, id)
		if err != nil {
			impl.Logger.Error("database get by id error", slog.Any("error", err))
			return nil, err
		}
		if associateawaylog == nil {
			impl.Logger.Error("database returns nothing from get by id")
			return nil, err
		}

		a, err := impl.AssociateStorer.GetByID(sessCtx, associateawaylog.AssociateID)
		if err != nil {
			impl.Logger.Error("failed getting associate",
				slog.Any("error", err))
			return nil, err
		}
		if a == nil {
			err := fmt.Errorf("associate does not exist for ID: %v", associateawaylog.AssociateID)
			impl.Logger.Error("associate does not exist",
				slog.Any("associate_id", associateawaylog.AssociateID),
				slog.Any("error", err))
			return nil, err
		}

		////
		//// Delete base record.
		////

		if err := impl.AssociateAwayLogStorer.DeleteByID(sessCtx, id); err != nil {
			impl.Logger.Error("database delete by id error", slog.Any("error", err))
			return nil, err
		}

		////
		//// Delete related records.
		////

		// Find the index of the log in AwayLogs array
		indexToDelete := -1
		for i, log := range a.AwayLogs {
			if log.ID == id {
				indexToDelete = i
				break
			}
		}

		// If the log is found, remove it from the slice
		if indexToDelete != -1 {
			a.AwayLogs = append(a.AwayLogs[:indexToDelete], a.AwayLogs[indexToDelete+1:]...)
		}

		if err := impl.AssociateStorer.UpdateByID(sessCtx, a); err != nil {
			impl.Logger.Error("failed updating associate", slog.Any("error", err))
			return nil, err
		}

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
