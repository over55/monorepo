package httptransport

import (
	"log/slog"

	taskitem_c "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller taskitem_c.TaskItemController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c taskitem_c.TaskItemController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}
