package httptransport

import (
	"log/slog"

	noc_c "github.com/over55/monorepo/cloud/workery-backend/app/noc/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller noc_c.NationalOccupationalClassificationController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c noc_c.NationalOccupationalClassificationController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}
