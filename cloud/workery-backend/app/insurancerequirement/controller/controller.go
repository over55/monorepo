package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	s3_storage "github.com/over55/monorepo/cloud/workery-backend/adapter/storage/s3"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/templatedemailer"
	a_c "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	insurancerequirement_s "github.com/over55/monorepo/cloud/workery-backend/app/insurancerequirement/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// InsuranceRequirementController Interface for insurancerequirement business logic controller.
type InsuranceRequirementController interface {
	Create(ctx context.Context, requestData *InsuranceRequirementCreateRequestIDO) (*insurancerequirement_s.InsuranceRequirement, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*insurancerequirement_s.InsuranceRequirement, error)
	UpdateByID(ctx context.Context, requestData *InsuranceRequirementUpdateRequestIDO) (*insurancerequirement_s.InsuranceRequirement, error)
	ListAndCountByFilter(ctx context.Context, f *insurancerequirement_s.InsuranceRequirementPaginationListFilter) (*insurancerequirement_s.InsuranceRequirementPaginationListAndCountResult, error)
	ListAsSelectOptionByFilter(ctx context.Context, f *insurancerequirement_s.InsuranceRequirementPaginationListFilter) ([]*insurancerequirement_s.InsuranceRequirementAsSelectOption, error)
	ArchiveByID(ctx context.Context, id primitive.ObjectID) (*insurancerequirement_s.InsuranceRequirement, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
}

type InsuranceRequirementControllerImpl struct {
	Config                     *config.Conf
	Logger                     *slog.Logger
	UUID                       uuid.Provider
	S3                         s3_storage.S3Storager
	Password                   password.Provider
	Kmutex                     kmutex.Provider
	DbClient                   *mongo.Client
	UserStorer                 user_s.UserStorer
	AssociateStorer            a_c.AssociateStorer
	OrderStorer                o_s.OrderStorer
	TaskItemStorer             ti_s.TaskItemStorer
	InsuranceRequirementStorer insurancerequirement_s.InsuranceRequirementStorer
	TemplatedEmailer           templatedemailer.TemplatedEmailer
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
	a_ctorer a_c.AssociateStorer,
	o_storer o_s.OrderStorer,
	ti_storer ti_s.TaskItemStorer,
	insurancerequirement_s insurancerequirement_s.InsuranceRequirementStorer,
) InsuranceRequirementController {
	loggerp.Debug("insurancerequirement controller initialization started...")
	s := &InsuranceRequirementControllerImpl{
		Config:                     appCfg,
		Logger:                     loggerp,
		UUID:                       uuidp,
		S3:                         s3,
		Password:                   passwordp,
		Kmutex:                     kmux,
		TemplatedEmailer:           temailer,
		DbClient:                   client,
		UserStorer:                 usr_storer,
		AssociateStorer:            a_ctorer,
		OrderStorer:                o_storer,
		TaskItemStorer:             ti_storer,
		InsuranceRequirementStorer: insurancerequirement_s,
	}

	s.Logger.Debug("insurancerequirement controller initialized")
	return s
}
