package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	aal_s "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/datastore"
)

func (c *AssociateAwayLogControllerImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*aal_s.AssociateAwayLog, error) {
	// Retrieve from our database the record for the specific id.
	m, err := c.AssociateAwayLogStorer.GetByID(ctx, id)
	if err != nil {
		c.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	return m, err
}
