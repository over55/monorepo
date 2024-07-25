package controller

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type CustomerOperationArchiveRequestIDO struct {
	CustomerID primitive.ObjectID `json:"customer_id"`
}

func (impl *CustomerControllerImpl) Archive(ctx context.Context, req *CustomerOperationArchiveRequestIDO) (*c_s.Customer, error) {
	if req.CustomerID.IsZero() {
		return nil, errors.New("missing value")
	}

	// // Extract from our session the following data.
	// userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)

	// Lookup the user in our database, else return a `400 Bad Request` error.
	ou, err := impl.CustomerStorer.GetByID(ctx, req.CustomerID)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return nil, err
	}
	if ou == nil {
		impl.Logger.Warn("user does not exist validation error")
		return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
	}

	previousStatus := ou.Status // Keep track for logging purposes only.

	ou.ModifiedAt = time.Now()

	switch ou.Status {
	case user_s.UserStatusActive:
		ou.Status = user_s.UserStatusArchived
		break
	case user_s.UserStatusArchived:
		ou.Status = user_s.UserStatusActive
		break
	}

	if err := impl.CustomerStorer.UpdateByID(ctx, ou); err != nil {
		impl.Logger.Error("user update by id error", slog.Any("error", err))
		return nil, err
	}

	impl.Logger.Debug("Archived",
		slog.Any("CustomerID", ou.ID),
		slog.Any("New Status", ou.Status),
		slog.Any("Previous Status", previousStatus))

	return ou, nil
}
