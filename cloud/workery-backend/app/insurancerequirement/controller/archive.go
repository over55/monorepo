package controller

import (
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"log/slog"

	insurancerequirement_s "github.com/over55/monorepo/cloud/workery-backend/app/insurancerequirement/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (impl *InsuranceRequirementControllerImpl) ArchiveByID(ctx context.Context, id primitive.ObjectID) (*insurancerequirement_s.InsuranceRequirement, error) {
	// // Extract from our session the following data.
	// userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)

	// Lookup the insurancerequirement in our database, else return a `400 Bad Request` error.
	ou, err := impl.InsuranceRequirementStorer.GetByID(ctx, id)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return nil, err
	}
	if ou == nil {
		impl.Logger.Warn("insurancerequirement does not exist validation error")
		return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
	}

	ou.Status = insurancerequirement_s.StatusArchived

	if err := impl.InsuranceRequirementStorer.UpdateByID(ctx, ou); err != nil {
		impl.Logger.Error("insurancerequirement update by id error", slog.Any("error", err))
		return nil, err
	}
	return ou, nil
}
