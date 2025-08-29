package taskqueue

import (
	"context"
	"log/slog"

	associate_ds "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	associateawaylog_ds "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/datastore"
	tenant_ds "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
)

// Handler Creates http request handler
type Handler struct {
	Logger                    *slog.Logger
	TenantDatastore           tenant_ds.TenantStorer
	AssociateDatastore        associate_ds.AssociateStorer
	AssociateAwayLogDatastore associateawaylog_ds.AssociateAwayLogStorer
}

// NewHandler Constructor
func NewHandler(
	loggerp *slog.Logger,
	ds1 tenant_ds.TenantStorer,
	ds2 associate_ds.AssociateStorer,
	ds3 associateawaylog_ds.AssociateAwayLogStorer,
) *Handler {
	return &Handler{
		Logger:                    loggerp,
		TenantDatastore:           ds1,
		AssociateDatastore:        ds2,
		AssociateAwayLogDatastore: ds3,
	}
}

func (h *Handler) ProcessPendingTasks(ctx context.Context) error {
	tt, err := h.TenantDatastore.ListAllByActiveStatus(ctx)
	if err != nil {
		h.Logger.Error("failed to list associates", slog.Any("error", err))
		return err
	}
	for _, t := range tt.Results {
		h.createAwayLogOnAnyRequiredExpiredDates(ctx, t)
	}

	return nil
}
