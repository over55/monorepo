package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	s3_storage "github.com/over55/monorepo/cloud/workery-backend/adapter/storage/s3"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/templatedemailer"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	servicefee_s "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/datastore"
	t_s "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// ServiceFeeController Interface for servicefee business logic controller.
type ServiceFeeController interface {
	Create(ctx context.Context, requestData *ServiceFeeCreateRequestIDO) (*servicefee_s.ServiceFee, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*servicefee_s.ServiceFee, error)
	UpdateByID(ctx context.Context, nu *ServiceFeeUpdateRequestIDO) (*servicefee_s.ServiceFee, error)
	ListAndCountByFilter(ctx context.Context, f *t_s.ServiceFeePaginationListFilter) (*t_s.ServiceFeePaginationListAndCountResult, error)
	ListAsSelectOptionByFilter(ctx context.Context, f *servicefee_s.ServiceFeePaginationListFilter) ([]*servicefee_s.ServiceFeeAsSelectOption, error)
	ArchiveByID(ctx context.Context, id primitive.ObjectID) (*servicefee_s.ServiceFee, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
}

type ServiceFeeControllerImpl struct {
	Config           *config.Conf
	Logger           *slog.Logger
	UUID             uuid.Provider
	S3               s3_storage.S3Storager
	Password         password.Provider
	Kmutex           kmutex.Provider
	DbClient         *mongo.Client
	UserStorer       user_s.UserStorer
	ServiceFeeStorer servicefee_s.ServiceFeeStorer
	OrderStorer      o_s.OrderStorer
	TaskItemStorer   ti_s.TaskItemStorer
	TemplatedEmailer templatedemailer.TemplatedEmailer
}

func NewController(
	appCfg *config.Conf,
	loggerp *slog.Logger,
	uuidp uuid.Provider,
	s3 s3_storage.S3Storager,
	kmux kmutex.Provider,
	passwordp password.Provider,
	temailer templatedemailer.TemplatedEmailer,
	client *mongo.Client,
	usr_storer user_s.UserStorer,
	o_storer o_s.OrderStorer,
	ti_storer ti_s.TaskItemStorer,
	servicefee_s servicefee_s.ServiceFeeStorer,
) ServiceFeeController {
	loggerp.Debug("servicefee controller initialization started...")
	s := &ServiceFeeControllerImpl{
		Config:           appCfg,
		Logger:           loggerp,
		UUID:             uuidp,
		S3:               s3,
		Password:         passwordp,
		Kmutex:           kmux,
		TemplatedEmailer: temailer,
		DbClient:         client,
		UserStorer:       usr_storer,
		OrderStorer:      o_storer,
		TaskItemStorer:   ti_storer,
		ServiceFeeStorer: servicefee_s,
	}
	s.Logger.Debug("servicefee controller initialized")
	return s
}
