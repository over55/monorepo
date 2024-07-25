package httptransport

import (
	"log/slog"

	orderincident_c "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller orderincident_c.OrderIncidentController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c orderincident_c.OrderIncidentController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}
