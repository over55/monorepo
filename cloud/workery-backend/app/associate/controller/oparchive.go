package controller

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type AssociateOperationArchiveRequestIDO struct {
	AssociateID primitive.ObjectID `json:"associate_id"`
}

func (impl *AssociateControllerImpl) Archive(ctx context.Context, req *AssociateOperationArchiveRequestIDO) (*a_s.Associate, error) {
	if req.AssociateID.IsZero() {
		return nil, errors.New("missing value")
	}

	// // Extract from our session the following data.
	// userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)

	// Lookup the user in our database, else return a `400 Bad Request` error.
	ou, err := impl.AssociateStorer.GetByID(ctx, req.AssociateID)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return nil, err
	}
	if ou == nil {
		impl.Logger.Warn("user does not exist validation error")
		return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
	}

	ou.ModifiedAt = time.Now()
	if ou.Status == a_s.AssociateStatusActive {
		ou.Status = a_s.AssociateStatusArchived
	} else if ou.Status == a_s.AssociateStatusArchived {
		ou.Status = a_s.AssociateStatusActive
	}

	impl.Logger.Info("archived associate",
		slog.Any("associateID", req.AssociateID),
		slog.Any("status", ou.Status))

	if err := impl.AssociateStorer.UpdateByID(ctx, ou); err != nil {
		impl.Logger.Error("user update by id error", slog.Any("error", err))
		return nil, err
	}
	return ou, nil
}
