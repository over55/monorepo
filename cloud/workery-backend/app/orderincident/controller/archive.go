package controller

import (
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"log/slog"

	orderincident_s "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (impl *OrderIncidentControllerImpl) ArchiveByID(ctx context.Context, id primitive.ObjectID) (*orderincident_s.OrderIncident, error) {
	// // Extract from our session the following data.
	// userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)

	// Lookup the orderincident in our database, else return a `400 Bad Request` error.
	ou, err := impl.OrderIncidentStorer.GetByID(ctx, id)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return nil, err
	}
	if ou == nil {
		impl.Logger.Warn("orderincident does not exist validation error")
		return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
	}

	ou.Status = orderincident_s.OrderIncidentStatusArchived

	if err := impl.OrderIncidentStorer.UpdateByID(ctx, ou); err != nil {
		impl.Logger.Error("orderincident update by id error", slog.Any("error", err))
		return nil, err
	}
	return ou, nil
}
