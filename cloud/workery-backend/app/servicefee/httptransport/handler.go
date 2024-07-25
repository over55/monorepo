package httptransport

import (
	"log/slog"

	servicefee_c "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller servicefee_c.ServiceFeeController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c servicefee_c.ServiceFeeController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}
