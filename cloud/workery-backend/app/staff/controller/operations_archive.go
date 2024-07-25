package controller

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	a_s "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type StaffOperationArchiveRequestIDO struct {
	StaffID primitive.ObjectID `json:"staff_id"`
}

func (impl *StaffControllerImpl) Archive(ctx context.Context, req *StaffOperationArchiveRequestIDO) (*a_s.Staff, error) {
	if req.StaffID.IsZero() {
		return nil, errors.New("missing value")
	}

	// // Extract from our session the following data.
	// userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)

	// Lookup the user in our database, else return a `400 Bad Request` error.
	ou, err := impl.StaffStorer.GetByID(ctx, req.StaffID)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return nil, err
	}
	if ou == nil {
		impl.Logger.Warn("user does not exist validation error")
		return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
	}

	ou.ModifiedAt = time.Now()
	if ou.Status == a_s.StaffStatusActive {
		ou.Status = a_s.StaffStatusArchived
	} else if ou.Status == a_s.StaffStatusArchived {
		ou.Status = a_s.StaffStatusActive
	}

	impl.Logger.Info("archived staff",
		slog.Any("staffID", req.StaffID),
		slog.Any("status", ou.Status))

	if err := impl.StaffStorer.UpdateByID(ctx, ou); err != nil {
		impl.Logger.Error("user update by id error", slog.Any("error", err))
		return nil, err
	}
	return ou, nil
}
