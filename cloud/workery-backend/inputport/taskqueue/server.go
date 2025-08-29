package taskqueue

import (
	"log/slog"

	associateawaylog "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/taskqueue"
	"github.com/over55/monorepo/cloud/workery-backend/config"
)

type InputPortServer interface {
	Run()
	Shutdown()
}

type taskQueuePort struct {
	Config                       *config.Conf
	Logger                       *slog.Logger
	AssociateAwayLogQueueHandler *associateawaylog.Handler
}

func NewInputPort(
	configp *config.Conf,
	loggerp *slog.Logger,
	associateAwayLogQueueHandler *associateawaylog.Handler,
) InputPortServer {
	// Create our HTTP server controller.
	p := &taskQueuePort{
		Config:                       configp,
		Logger:                       loggerp,
		AssociateAwayLogQueueHandler: associateAwayLogQueueHandler,
	}

	return p
}

func (port *taskQueuePort) Run() {
	port.Logger.Info("Task queue server running")

	// TODO: Execute `AssociateAwayLogQueueHandler` task here based on some schedule.
}

func (port *taskQueuePort) Shutdown() {
	port.Logger.Info("Task queue server shutdown")
}
