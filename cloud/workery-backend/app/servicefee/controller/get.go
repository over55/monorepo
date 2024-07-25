package controller

import (
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"log/slog"

	servicefee_s "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/datastore"
)

func (c *ServiceFeeControllerImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*servicefee_s.ServiceFee, error) {
	// Retrieve from our database the record for the specific id.
	m, err := c.ServiceFeeStorer.GetByID(ctx, id)
	if err != nil {
		c.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	return m, err
}
