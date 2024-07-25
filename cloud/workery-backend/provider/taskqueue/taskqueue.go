package taskqueue

import (
	"log"
	"log/slog"

	"github.com/matroskin13/stepper"
	"github.com/matroskin13/stepper/engines/mongo"

	"github.com/over55/monorepo/cloud/workery-backend/config"
)

func NewProvider(appCfg *config.Conf, logger *slog.Logger) stepper.Stepper {
	logger.Debug("taskqueue initializing...")
	mongoEngine, err := mongo.NewMongo(appCfg.DB.URI, appCfg.DB.Name)
	if err != nil {
		log.Fatal(err)
	}

	s := stepper.NewService(mongoEngine)
	logger.Debug("taskqueue initialized with mongodb as backend")
	return s
}
