package httptransport

import (
	"log/slog"

	activitysheet_c "github.com/over55/monorepo/cloud/workery-backend/app/activitysheet/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller activitysheet_c.ActivitySheetController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c activitysheet_c.ActivitySheetController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}
