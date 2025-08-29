package taskqueue

import (
	"context"
	"log/slog"
	"sync"
	"time"

	"github.com/over55/monorepo/cloud/workery-backend/adapter/distributedlock/mongolock"
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
	DistributedLock              mongolock.DistributedLock

	// Internal state management
	isRunning        bool
	lockOwner        string
	shutdownChan     chan struct{}
	shutdownComplete chan struct{}
	mu               sync.Mutex
	cancelKeepAlive  context.CancelFunc
}

func NewInputPort(
	configp *config.Conf,
	loggerp *slog.Logger,
	associateAwayLogQueueHandler *associateawaylog.Handler,
	distributedLock mongolock.DistributedLock,
) InputPortServer {
	// Create our task queue server controller.
	p := &taskQueuePort{
		Config:                       configp,
		Logger:                       loggerp,
		AssociateAwayLogQueueHandler: associateAwayLogQueueHandler,
		DistributedLock:              distributedLock,
		shutdownChan:                 make(chan struct{}),
		shutdownComplete:             make(chan struct{}),
	}

	return p
}

func (port *taskQueuePort) Run() {
	port.mu.Lock()
	if port.isRunning {
		port.mu.Unlock()
		port.Logger.Warn("Task queue server is already running")
		return
	}
	port.mu.Unlock()

	// Define the lock key for the task queue server
	lockKey := "taskqueue-server-singleton"
	lockTTL := 30 * time.Second // Initial TTL for the lock

	// Try to acquire the distributed lock
	ctx := context.Background()
	owner, acquired, err := port.DistributedLock.TryAcquire(ctx, lockKey, lockTTL)
	if err != nil {
		port.Logger.Error("Failed to check task queue lock",
			slog.Any("error", err))
		return
	}

	if !acquired { // Fixed: checking the boolean 'acquired' instead of empty owner
		// Another instance holds the lock
		// port.Logger.Info("Another instance is running the task queue server, this instance will remain in standby mode") // Commented out to reduce log noise

		// Start a monitor routine that will try to take over if the primary fails
		go port.monitorAndTakeover(lockKey, lockTTL)
		return
	}

	// We acquired the lock, so we're the primary instance
	port.mu.Lock()
	port.isRunning = true
	port.lockOwner = owner
	port.mu.Unlock()

	port.Logger.Info("Task queue server running as PRIMARY instance",
		slog.String("instance_id", owner))

	// Start a goroutine to keep the lock alive
	keepAliveCtx, cancel := context.WithCancel(context.Background())
	port.cancelKeepAlive = cancel
	go port.keepLockAlive(keepAliveCtx, lockKey, owner, lockTTL)

	// Start the actual task processing
	go port.runTaskProcessing()

	// Wait for shutdown signal
	<-port.shutdownChan

	// Cancel the keep-alive routine
	if port.cancelKeepAlive != nil {
		port.cancelKeepAlive()
	}

	// Release the lock
	if port.lockOwner != "" {
		releaseCtx, releaseCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer releaseCancel()

		if err := port.DistributedLock.Release(releaseCtx, lockKey, port.lockOwner); err != nil {
			port.Logger.Error("Failed to release task queue lock",
				slog.Any("error", err))
		} else {
			port.Logger.Info("Task queue lock released successfully")
		}
	}

	close(port.shutdownComplete)
}

func (port *taskQueuePort) monitorAndTakeover(lockKey string, lockTTL time.Duration) {
	// Check every 10 seconds if we can take over
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-port.shutdownChan:
			return
		case <-ticker.C:
			// Try to acquire the lock
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			owner, acquired, err := port.DistributedLock.TryAcquire(ctx, lockKey, lockTTL)
			cancel()

			if err != nil {
				port.Logger.Error("Error checking task queue lock during monitoring",
					slog.Any("error", err))
				continue
			}

			if acquired {
				// We got the lock! Become the primary
				port.mu.Lock()
				if port.isRunning {
					port.mu.Unlock()
					// Already running, shouldn't happen but be safe
					port.DistributedLock.Release(context.Background(), lockKey, owner)
					continue
				}
				port.isRunning = true
				port.lockOwner = owner
				port.mu.Unlock()

				// port.Logger.Info("Taking over as PRIMARY task queue instance",
				// 	slog.String("instance_id", owner)) // Commented out to reduce log noise

				// Start keep-alive
				keepAliveCtx, cancel := context.WithCancel(context.Background())
				port.cancelKeepAlive = cancel
				go port.keepLockAlive(keepAliveCtx, lockKey, owner, lockTTL)

				// Start task processing
				go port.runTaskProcessing()

				// Stop monitoring since we're now primary
				return
			}
		}
	}
}

func (port *taskQueuePort) keepLockAlive(ctx context.Context, lockKey string, owner string, ttl time.Duration) {
	// Extend the lock at half the TTL interval to be safe
	ticker := time.NewTicker(ttl / 2)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			extendCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			err := port.DistributedLock.Extend(extendCtx, lockKey, owner, ttl)
			cancel()

			if err != nil {
				port.Logger.Error("Failed to extend task queue lock",
					slog.Any("error", err))

				// If we can't extend the lock, we should stop processing
				port.mu.Lock()
				wasRunning := port.isRunning
				port.isRunning = false
				port.mu.Unlock()

				if wasRunning {
					port.Logger.Error("Lost task queue lock, stopping task processing")
					// The monitor routine will try to reacquire
					go port.monitorAndTakeover(lockKey, ttl)
				}
				return
			}

			// port.Logger.Debug("Task queue lock extended successfully",
			// 	slog.String("instance_id", owner)) // Commented out to reduce log noise
		}
	}
}

func (port *taskQueuePort) runTaskProcessing() {
	port.Logger.Info("Starting task processing routines")

	// Create a ticker for periodic task execution
	// Adjust the interval based on your needs
	taskTicker := time.NewTicker(1 * time.Minute)
	defer taskTicker.Stop()

	// Run initial tasks
	port.executeScheduledTasks()

	for {
		select {
		case <-port.shutdownChan:
			port.Logger.Info("Stopping task processing routines")
			return
		case <-taskTicker.C:
			port.mu.Lock()
			isRunning := port.isRunning
			port.mu.Unlock()

			if !isRunning {
				port.Logger.Debug("Skipping task execution, not primary instance")
				return
			}

			// Execute scheduled tasks
			port.executeScheduledTasks()
		}
	}
}

func (port *taskQueuePort) executeScheduledTasks() {
	// port.Logger.Debug("Executing scheduled tasks") // Commented out to reduce log noise

	// Check if we're still the primary before executing
	port.mu.Lock()
	if !port.isRunning {
		port.mu.Unlock()
		return
	}
	port.mu.Unlock()

	// Execute AssociateAwayLog tasks
	if port.AssociateAwayLogQueueHandler != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
		defer cancel()

		// Call your handler's processing method
		// You'll need to implement a Process method in your handler
		// For example:
		// if err := port.AssociateAwayLogQueueHandler.ProcessPendingTasks(ctx); err != nil {
		//     port.Logger.Error("Failed to process associate away log tasks",
		//         slog.Any("error", err))
		// }

		_ = ctx // Remove this once you implement the actual task processing
		port.Logger.Debug("Processing associate away log tasks")
	}

	// Add other scheduled tasks here as needed
}

func (port *taskQueuePort) Shutdown() {
	port.Logger.Info("Task queue server shutdown initiated")

	port.mu.Lock()
	wasRunning := port.isRunning
	port.isRunning = false
	port.mu.Unlock()

	// Signal shutdown
	close(port.shutdownChan)

	if wasRunning {
		// Wait for graceful shutdown to complete
		select {
		case <-port.shutdownComplete:
			port.Logger.Info("Task queue server shutdown completed")
		case <-time.After(10 * time.Second):
			port.Logger.Warn("Task queue server shutdown timed out")
		}
	} else {
		port.Logger.Info("Task queue server shutdown completed (was in standby mode)")
	}
}
