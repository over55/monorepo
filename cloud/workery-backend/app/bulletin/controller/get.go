package controller

import (
	"context"

	"log/slog"

	bul_s "github.com/over55/monorepo/cloud/workery-backend/app/bulletin/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl *BulletinControllerImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*bul_s.Bulletin, error) {

	////
	//// Lock this order until completed (including errors as well).
	////

	impl.Kmutex.Lock(id.Hex())
	defer impl.Kmutex.Unlock(id.Hex())

	////
	//// Retrieve from our database the record for the specific id.
	////

	m, err := impl.BulletinStorer.GetByID(ctx, id)
	if err != nil {
		impl.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	if m == nil {
		impl.Logger.Error("bulletin does not exist error", slog.Any("bulletinID", id))
		return nil, httperror.NewForBadRequestWithSingleField("bulletin_id", "bulletin does not exist")
	}
	return m, err
}
