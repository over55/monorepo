package httptransport

import (
	"log/slog"

	jobhistory_c "github.com/over55/monorepo/cloud/workery-backend/app/jobhistory/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller jobhistory_c.JobHistoryController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c jobhistory_c.JobHistoryController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}
