package taskqueue

import (
	"log/slog"

	"github.com/over55/monorepo/cloud/workery-backend/config"
)

type InputPortServer interface {
	Run()
	Shutdown()
}

type taskQueuePort struct {
	Config *config.Conf
	Logger *slog.Logger
}

func NewInputPort(
	configp *config.Conf,
	loggerp *slog.Logger,
) InputPortServer {
	// Create our HTTP server controller.
	p := &taskQueuePort{
		Config: configp,
		Logger: loggerp,
	}

	return p
}

func (port *taskQueuePort) Run() {
	port.Logger.Info("Task queue server running")

}

func (port *taskQueuePort) Shutdown() {
	port.Logger.Info("Task queue server shutdown")
}
