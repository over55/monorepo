package httptransport

import (
	"log/slog"

	bulletin_c "github.com/over55/monorepo/cloud/workery-backend/app/bulletin/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller bulletin_c.BulletinController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c bulletin_c.BulletinController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}
