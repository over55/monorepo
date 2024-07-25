package controller

import (
	"context"
	"errors"
	"log/slog"

	a_c "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	user_d "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func (impl *SkillSetControllerImpl) DeleteByID(ctx context.Context, id primitive.ObjectID) error {
	impl.Logger.Debug("deleting skill set", slog.Any("skill_set_id", id))

	// Extract from our session the following data.
	userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userRole := ctx.Value(constants.SessionUserRole).(int8)

	// Apply protection based on ownership and role.
	if userRole != user_d.UserRoleExecutive {
		impl.Logger.Error("authenticated user is not staff role error",
			slog.Any("role", userRole),
			slog.Any("userID", userID))
		return httperror.NewForForbiddenWithSingleField("message", "you role does not grant you access to this")
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
		//// STEP 1: Lookup the record or error.
		////

		skillset, err := impl.SkillSetStorer.GetByID(sessCtx, id)
		if err != nil {
			impl.Logger.Error("database get by id error", slog.Any("error", err))
			return nil, err
		}
		if skillset == nil {
			impl.Logger.Error("database returns nothing from get by id")
			return nil, err
		}

		////
		//// See if this skill set is used anywere in our app, if so then we need
		//// to abort deletion.

		// --- Associate --- //

		af := &a_c.AssociatePaginationListFilter{
			Cursor:        "",
			PageSize:      1_000_000,
			SortField:     "",
			SortOrder:     a_c.OrderAscending,
			InSkillSetIDs: []primitive.ObjectID{id},
		}
		ares, err := impl.AssociateStorer.ListByFilter(sessCtx, af)
		if err != nil {
			impl.Logger.Error("associate list by skill set error",
				slog.Any("error", err))
			return nil, err
		}
		if len(ares.Results) > 0 {
			err := errors.New("cannot delete because associates set with this skill set")
			impl.Logger.Error("contains associates", slog.Any("error", err))
			return nil, err
		}

		// --- Order --- //

		of := &o_s.OrderPaginationListFilter{
			Cursor:        "",
			PageSize:      1_000_000,
			SortField:     "",
			SortOrder:     o_s.SortOrderAscending,
			InSkillSetIDs: []primitive.ObjectID{id},
		}
		ores, err := impl.OrderStorer.ListByFilter(sessCtx, of)
		if err != nil {
			impl.Logger.Error("order list by skill set error",
				slog.Any("error", err))
			return nil, err
		}
		if len(ores.Results) > 0 {
			err := errors.New("cannot delete because order set with this skill set")
			impl.Logger.Error("contains order", slog.Any("error", err))
			return nil, err
		}

		// --- Task Item --- //

		tif := &ti_s.TaskItemPaginationListFilter{
			Cursor:        "",
			PageSize:      1_000_000,
			SortField:     "",
			SortOrder:     o_s.SortOrderAscending,
			InSkillSetIDs: []primitive.ObjectID{id},
		}
		tires, err := impl.TaskItemStorer.ListByFilter(sessCtx, tif)
		if err != nil {
			impl.Logger.Error("task item list by skill set error",
				slog.Any("error", err))
			return nil, err
		}
		if len(tires.Results) > 0 {
			err := errors.New("cannot delete because task item set with this skill set")
			impl.Logger.Error("contains task item", slog.Any("error", err))
			return nil, err
		}

		////
		//// STEP 2: Delete from database.
		////

		if err := impl.SkillSetStorer.DeleteByID(sessCtx, id); err != nil {
			impl.Logger.Error("database delete by id error", slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("deleted skill set", slog.Any("skill_set_id", id))

		////
		//// Exit our transaction successfully.
		////

		// return nil, errors.New("programmer halt") // For debugging purposes only.

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
