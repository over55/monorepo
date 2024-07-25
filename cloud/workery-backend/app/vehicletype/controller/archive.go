package controller

import (
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"log/slog"

	vehicletype_s "github.com/over55/monorepo/cloud/workery-backend/app/vehicletype/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (impl *VehicleTypeControllerImpl) ArchiveByID(ctx context.Context, id primitive.ObjectID) (*vehicletype_s.VehicleType, error) {
	// // Extract from our session the following data.
	// userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)

	// Lookup the vehicletype in our database, else return a `400 Bad Request` error.
	ou, err := impl.VehicleTypeStorer.GetByID(ctx, id)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return nil, err
	}
	if ou == nil {
		impl.Logger.Warn("vehicletype does not exist validation error")
		return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
	}

	ou.Status = vehicletype_s.StatusArchived

	if err := impl.VehicleTypeStorer.UpdateByID(ctx, ou); err != nil {
		impl.Logger.Error("vehicletype update by id error", slog.Any("error", err))
		return nil, err
	}
	return ou, nil
}
