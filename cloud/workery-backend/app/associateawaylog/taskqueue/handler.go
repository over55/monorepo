package taskqueue

import (
	"context"
	"log/slog"

	associateawaylog_c "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller associateawaylog_c.AssociateAwayLogController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c associateawaylog_c.AssociateAwayLogController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}

func (h *Handler) ProcessPendingTasks(ctx context.Context) error {
	h.createAwayLogOnAnyRequiredExpiredDates(ctx)
	return nil
}
