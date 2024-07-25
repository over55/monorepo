package httptransport

import (
	"log/slog"

	associate_c "github.com/over55/monorepo/cloud/workery-backend/app/associate/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller associate_c.AssociateController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c associate_c.AssociateController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}
