package controller

import (
	"context"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	as_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
)

type TaskItemCountResponseIDO struct {
	Count int64 `bson:"count" json:"count"`
}

func (c *TaskItemControllerImpl) CountByFilter(ctx context.Context, f *as_s.TaskItemPaginationListFilter) (*TaskItemCountResponseIDO, error) {
	// // Extract from our session the following data.
	tenantID := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)

	// Apply filtering based on ownership and role.
	f.TenantID = tenantID // Manditory

	// For debugging purposes only.
	// c.Logger.Debug("count using filter options:",
	// 	slog.Any("IsClosed", f.IsClosed),
	// 	slog.Int("Type", int(f.Type)),
	// 	slog.Any("Status", f.Status),
	// )

	m, err := c.TaskItemStorer.CountByFilter(ctx, f)
	if err != nil {
		c.Logger.Error("database list by filter error", slog.Any("error", err))
		return nil, err
	}
	return &TaskItemCountResponseIDO{Count: m}, err
}
