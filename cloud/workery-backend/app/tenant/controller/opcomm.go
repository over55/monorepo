package controller

import (
	"context"
	"time"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	org_d "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (c *TenantControllerImpl) CreateComment(ctx context.Context, TenantID primitive.ObjectID, content string) (*org_d.Tenant, error) {
	// Fetch the original customer.
	s, err := c.TenantStorer.GetByID(ctx, TenantID)
	if err != nil {
		c.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	if s == nil {
		c.Logger.Error("Tenant does not exist error",
			slog.Any("Tenant_id", TenantID))
		return nil, httperror.NewForBadRequestWithSingleField("message", "Tenant does not exist")
	}

	// Create our comment.
	comment := &org_d.TenantComment{
		ID:               primitive.NewObjectID(),
		Content:          content,
		TenantID:         ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID),
		CreatedByUserID:  ctx.Value(constants.SessionUserID).(primitive.ObjectID),
		CreatedByName:    ctx.Value(constants.SessionUserName).(string),
		CreatedAt:        time.Now(),
		ModifiedByUserID: ctx.Value(constants.SessionUserID).(primitive.ObjectID),
		ModifiedByName:   ctx.Value(constants.SessionUserName).(string),
		ModifiedAt:       time.Now(),
	}

	// Add our comment to the comments.
	s.ModifiedByUserID = ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	s.ModifiedAt = time.Now()
	s.Comments = append(s.Comments, comment)

	// Save to the database the modified customer.
	if err := c.TenantStorer.UpdateByID(ctx, s); err != nil {
		c.Logger.Error("database update by id error", slog.Any("error", err))
		return nil, err
	}

	return s, nil
}
