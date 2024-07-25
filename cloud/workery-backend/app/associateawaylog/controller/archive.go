package controller

import (
	"context"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	aal_s "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (impl *AssociateAwayLogControllerImpl) ArchiveByID(ctx context.Context, id primitive.ObjectID) (*aal_s.AssociateAwayLog, error) {
	// // Extract from our session the following data.
	// userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)

	// Lookup the associateawaylog in our database, else return a `400 Bad Request` error.
	ou, err := impl.AssociateAwayLogStorer.GetByID(ctx, id)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return nil, err
	}
	if ou == nil {
		impl.Logger.Warn("associateawaylog does not exist validation error")
		return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
	}

	ou.Status = aal_s.AssociateAwayLogStatusArchived

	if err := impl.AssociateAwayLogStorer.UpdateByID(ctx, ou); err != nil {
		impl.Logger.Error("associateawaylog update by id error", slog.Any("error", err))
		return nil, err
	}
	return ou, nil
}
