package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	s3_storage "github.com/over55/monorepo/cloud/workery-backend/adapter/storage/s3"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/templatedemailer"
	a_c "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	skillset_s "github.com/over55/monorepo/cloud/workery-backend/app/skillset/datastore"
	t_s "github.com/over55/monorepo/cloud/workery-backend/app/skillset/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// SkillSetController Interface for skillset business logic controller.
type SkillSetController interface {
	Create(ctx context.Context, requestData *SkillSetCreateRequestIDO) (*skillset_s.SkillSet, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*skillset_s.SkillSet, error)
	UpdateByID(ctx context.Context, nu *SkillSetUpdateRequestIDO) (*skillset_s.SkillSet, error)
	ListAndCountByFilter(ctx context.Context, f *t_s.SkillSetPaginationListFilter) (*t_s.SkillSetPaginationListAndCountResult, error)
	ListAsSelectOptionByFilter(ctx context.Context, f *skillset_s.SkillSetListFilter) ([]*skillset_s.SkillSetAsSelectOption, error)
	ArchiveByID(ctx context.Context, id primitive.ObjectID) (*skillset_s.SkillSet, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
}

type SkillSetControllerImpl struct {
	Config           *config.Conf
	Logger           *slog.Logger
	UUID             uuid.Provider
	S3               s3_storage.S3Storager
	Password         password.Provider
	DbClient         *mongo.Client
	TemplatedEmailer templatedemailer.TemplatedEmailer
	Kmutex           kmutex.Provider
	AssociateStorer  a_c.AssociateStorer
	UserStorer       user_s.UserStorer
	SkillSetStorer   skillset_s.SkillSetStorer
	OrderStorer      o_s.OrderStorer
	TaskItemStorer   ti_s.TaskItemStorer
}

func NewController(
	appCfg *config.Conf,
	loggerp *slog.Logger,
	uuidp uuid.Provider,
	s3 s3_storage.S3Storager,
	passwordp password.Provider,
	temailer templatedemailer.TemplatedEmailer,
	kmux kmutex.Provider,
	client *mongo.Client,
	usr_storer user_s.UserStorer,
	skillset_s skillset_s.SkillSetStorer,
	a_ctorer a_c.AssociateStorer,
	o_storer o_s.OrderStorer,
	ti_storer ti_s.TaskItemStorer,
) SkillSetController {
	loggerp.Debug("skillset controller initialization started...")
	s := &SkillSetControllerImpl{
		Config:           appCfg,
		Logger:           loggerp,
		UUID:             uuidp,
		S3:               s3,
		Password:         passwordp,
		TemplatedEmailer: temailer,
		Kmutex:           kmux,
		DbClient:         client,
		UserStorer:       usr_storer,
		SkillSetStorer:   skillset_s,
		AssociateStorer:  a_ctorer,
		OrderStorer:      o_storer,
		TaskItemStorer:   ti_storer,
	}
	s.Logger.Debug("skillset controller initialized")
	return s
}
