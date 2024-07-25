package httptransport

import (
	"log/slog"

	insurancerequirement_c "github.com/over55/monorepo/cloud/workery-backend/app/insurancerequirement/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller insurancerequirement_c.InsuranceRequirementController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c insurancerequirement_c.InsuranceRequirementController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}
