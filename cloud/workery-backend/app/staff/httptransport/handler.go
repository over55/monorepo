package httptransport

import (
	"log/slog"

	staff_c "github.com/over55/monorepo/cloud/workery-backend/app/staff/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller staff_c.StaffController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c staff_c.StaffController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}
