package controller

import (
	"context"
	"fmt"
	"log/slog"

	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func (impl *OrderControllerImpl) DeleteByWJID(ctx context.Context, orderWJID uint64) error {
	//
	// Get variables from our user authenticated session.
	//

	tid, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	role, _ := ctx.Value(constants.SessionUserRole).(int8)
	// userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	// userName, _ := ctx.Value(constants.SessionUserName).(string)
	// ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	switch role {
	case u_s.UserRoleExecutive, u_s.UserRoleManagement, u_s.UserRoleFrontlineStaff:
		break
	default:
		impl.Logger.Error("you do not have permission to delete this order")
		return httperror.NewForForbiddenWithSingleField("message", "you do not have permission to delete this order")
	}

	impl.Kmutex.Lockf("tenant-%s", tid.Hex())
	defer impl.Kmutex.Unlockf("tenant-%s", tid.Hex())

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
		// Fetch the related records.
		//

		o, err := impl.OrderStorer.GetByWJID(sessCtx, orderWJID)
		if err != nil {
			impl.Logger.Error("database get by id error", slog.Any("error", err))
			return nil, err
		}
		if o == nil {
			err := fmt.Errorf("order does not exist with wjid: %v", orderWJID)
			impl.Logger.Error("database get by id error", slog.Any("error", err))
			return nil, err
		}
		t, err := impl.TenantStorer.GetByID(sessCtx, tid)
		if err != nil {
			impl.Logger.Error("get by id from database error", slog.Any("error", err))
			return nil, err
		}
		if t == nil {
			err := fmt.Errorf("tenant does not exist with id: %v", tid)
			impl.Logger.Error("tenant does not exist error", slog.Any("error", err))
			return nil, err
		}

		//
		// Perform the deletion.
		//

		if err := impl.OrderStorer.DeleteByID(sessCtx, o.ID); err != nil {
			impl.Logger.Error("order delete in database error", slog.Any("error", err))
			return nil, err
		}

		//
		// Delete all related task items.
		//

		if err := impl.TaskItemStorer.PermanentlyDeleteAllByOrderID(sessCtx, o.ID); err != nil {
			impl.Logger.Error("delete all related task items by order id error", slog.Any("error", err))
			return nil, err
		}

		//
		// Delete all related activity sheets.
		//

		if err := impl.ActivitySheetStorer.PermanentlyDeleteAllByOrderID(sessCtx, o.ID); err != nil {
			impl.Logger.Error("delete all related activity sheets by order id error", slog.Any("error", err))
			return nil, err
		}

		//
		// Delete all related comments.
		//

		if err := impl.CommentStorer.PermanentlyDeleteAllByOrderID(sessCtx, o.ID); err != nil {
			impl.Logger.Error("delete all related comments by order id error", slog.Any("error", err))
			return nil, err
		}

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
