package httptransport

import (
	"log/slog"

	naics_c "github.com/over55/monorepo/cloud/workery-backend/app/naics/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller naics_c.NorthAmericanIndustryClassificationSystemController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c naics_c.NorthAmericanIndustryClassificationSystemController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}
