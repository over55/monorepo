package controller

import (
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"log/slog"

	skillset_s "github.com/over55/monorepo/cloud/workery-backend/app/skillset/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (impl *SkillSetControllerImpl) ArchiveByID(ctx context.Context, id primitive.ObjectID) (*skillset_s.SkillSet, error) {
	// // Extract from our session the following data.
	// userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)

	// Lookup the skillset in our database, else return a `400 Bad Request` error.
	ou, err := impl.SkillSetStorer.GetByID(ctx, id)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return nil, err
	}
	if ou == nil {
		impl.Logger.Warn("skillset does not exist validation error")
		return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
	}

	ou.Status = skillset_s.SkillSetStatusArchived

	if err := impl.SkillSetStorer.UpdateByID(ctx, ou); err != nil {
		impl.Logger.Error("skillset update by id error", slog.Any("error", err))
		return nil, err
	}
	return ou, nil
}
