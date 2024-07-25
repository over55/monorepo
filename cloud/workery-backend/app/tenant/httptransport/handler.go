package httptransport

import (
	"log/slog"

	tenant_c "github.com/over55/monorepo/cloud/workery-backend/app/tenant/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller tenant_c.TenantController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c tenant_c.TenantController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}
