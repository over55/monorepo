package httptransport

import (
	"log/slog"

	vehicletype_c "github.com/over55/monorepo/cloud/workery-backend/app/vehicletype/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller vehicletype_c.VehicleTypeController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c vehicletype_c.VehicleTypeController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}
