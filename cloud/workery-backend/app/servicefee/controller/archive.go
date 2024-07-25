package controller

import (
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"log/slog"

	servicefee_s "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (impl *ServiceFeeControllerImpl) ArchiveByID(ctx context.Context, id primitive.ObjectID) (*servicefee_s.ServiceFee, error) {
	// // Extract from our session the following data.
	// userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)

	// Lookup the servicefee in our database, else return a `400 Bad Request` error.
	ou, err := impl.ServiceFeeStorer.GetByID(ctx, id)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return nil, err
	}
	if ou == nil {
		impl.Logger.Warn("servicefee does not exist validation error")
		return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
	}

	ou.Status = servicefee_s.StatusArchived

	if err := impl.ServiceFeeStorer.UpdateByID(ctx, ou); err != nil {
		impl.Logger.Error("servicefee update by id error", slog.Any("error", err))
		return nil, err
	}
	return ou, nil
}
