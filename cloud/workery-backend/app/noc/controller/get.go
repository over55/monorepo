package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	noc_s "github.com/over55/monorepo/cloud/workery-backend/app/noc/datastore"
)

func (c *NationalOccupationalClassificationControllerImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*noc_s.NationalOccupationalClassification, error) {
	// Retrieve from our database the record for the specific id.
	m, err := c.NationalOccupationalClassificationStorer.GetByID(ctx, id)
	if err != nil {
		c.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	return m, err
}
