package httptransport

import (
	"log/slog"

	skillset_c "github.com/over55/monorepo/cloud/workery-backend/app/skillset/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller skillset_c.SkillSetController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c skillset_c.SkillSetController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}
