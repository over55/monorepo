package controller

import (
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"log/slog"

	insurancerequirement_s "github.com/over55/monorepo/cloud/workery-backend/app/insurancerequirement/datastore"
)

func (c *InsuranceRequirementControllerImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*insurancerequirement_s.InsuranceRequirement, error) {
	// Retrieve from our database the record for the specific id.
	m, err := c.InsuranceRequirementStorer.GetByID(ctx, id)
	if err != nil {
		c.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	return m, err
}
