package httptransport

import (
	"log/slog"

	order_c "github.com/over55/monorepo/cloud/workery-backend/app/order/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller order_c.OrderController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c order_c.OrderController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}
