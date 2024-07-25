package taskqueue

import (
	"context"
	"log"
	"log/slog"

	"github.com/over55/monorepo/cloud/workery-backend/config"

	"github.com/matroskin13/stepper"
)

type InputPortServer interface {
	Run()
	Shutdown()
}

type taskQueuePort struct {
	Config           *config.Conf
	Logger           *slog.Logger
	TaskQueueService stepper.Stepper
}

func NewInputPort(
	configp *config.Conf,
	loggerp *slog.Logger,
	tq stepper.Stepper,
) InputPortServer {
	// Create our HTTP server controller.
	p := &taskQueuePort{
		Config:           configp,
		Logger:           loggerp,
		TaskQueueService: tq,
	}

	return p
}

func (port *taskQueuePort) Run() {
	port.Logger.Info("Task queue server running")
	ctx := context.Background()
	if err := port.TaskQueueService.Listen(ctx); err != nil {
		log.Fatal(err)
	}
}

func (port *taskQueuePort) Shutdown() {
	port.Logger.Info("Task queue server shutdown")
}
