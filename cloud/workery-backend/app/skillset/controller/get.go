package controller

import (
	"context"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	skillset_s "github.com/over55/monorepo/cloud/workery-backend/app/skillset/datastore"
)

func (impl *SkillSetControllerImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*skillset_s.SkillSet, error) {
	////
	//// Lock this order until completed (including errors as well).
	////

	impl.Kmutex.Lock(id.Hex())
	defer impl.Kmutex.Unlock(id.Hex())

	////
	//// Retrieve from our database the record for the specific id.
	////

	m, err := impl.SkillSetStorer.GetByID(ctx, id)
	if err != nil {
		impl.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	return m, err
}
