package main

import (
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	_ "time/tzdata" // Important b/c some servers don't allow access to timezone file so we need to embed it with our binary.

	_ "go.uber.org/automaxprocs" // Automatically set GOMAXPROCS to match Linux container CPU quota.

	"github.com/over55/monorepo/cloud/workery-backend/inputport/http"
	tq "github.com/over55/monorepo/cloud/workery-backend/inputport/taskqueue"
)

type Application struct {
	Logger          *slog.Logger
	HttpServer      http.InputPortServer
	TaskQueueServer tq.InputPortServer
}

// NewApplication is application construction function which is automatically called by `Google Wire` dependency injection library.
func NewApplication(
	loggerp *slog.Logger,
	httpServer http.InputPortServer,
	tqServer tq.InputPortServer,
) Application {
	return Application{
		Logger:          loggerp,
		HttpServer:      httpServer,
		TaskQueueServer: tqServer,
	}
}

func (a Application) Execute() {
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM, syscall.SIGKILL, syscall.SIGUSR1)

	// Run in background the HTTP server.
	go a.HttpServer.Run()

	// Run in background the TaskQueue server.
	go a.TaskQueueServer.Run()

	a.Logger.Info("Application started")

	// Run the main loop blocking code while other input ports run in background.
	<-done

	a.Shutdown()
}

func (a Application) Shutdown() {
	a.HttpServer.Shutdown()
	a.TaskQueueServer.Shutdown()
	a.Logger.Info("Application shutdown")
}

// main function is the main entry point into the code.
func main() {
	// Call the `InitializeEvent` function which will call `Google Wire` dependency injection package to load up all this projects dependencies together.
	Application := InitializeEvent()

	// Start the application!
	Application.Execute()
}
