package httptransport

import (
	"log/slog"

	comment_c "github.com/over55/monorepo/cloud/workery-backend/app/comment/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller comment_c.CommentController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c comment_c.CommentController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}
