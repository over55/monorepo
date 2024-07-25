package httptransport

import (
	"log/slog"

	attachment_c "github.com/over55/monorepo/cloud/workery-backend/app/attachment/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller attachment_c.AttachmentController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c attachment_c.AttachmentController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}
