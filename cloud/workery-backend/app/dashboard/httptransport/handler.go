package httptransport

import (
	"log/slog"

	dashboard_c "github.com/over55/monorepo/cloud/workery-backend/app/dashboard/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller dashboard_c.DashboardController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c dashboard_c.DashboardController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}
