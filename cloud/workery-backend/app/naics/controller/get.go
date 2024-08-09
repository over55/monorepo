package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	naics_s "github.com/over55/monorepo/cloud/workery-backend/app/naics/datastore"
)

func (c *NorthAmericanIndustryClassificationSystemControllerImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*naics_s.NorthAmericanIndustryClassificationSystem, error) {
	// Retrieve from our database the record for the specific id.
	m, err := c.NorthAmericanIndustryClassificationSystemStorer.GetByID(ctx, id)
	if err != nil {
		c.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	return m, err
}
