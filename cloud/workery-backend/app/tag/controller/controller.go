package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	s3_storage "github.com/over55/monorepo/cloud/workery-backend/adapter/storage/s3"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/templatedemailer"
	a_c "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	t_s "github.com/over55/monorepo/cloud/workery-backend/app/tag/datastore"
	tag_s "github.com/over55/monorepo/cloud/workery-backend/app/tag/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// TagController Interface for tag business logic controller.
type TagController interface {
	Create(ctx context.Context, requestData *TagCreateRequestIDO) (*tag_s.Tag, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*tag_s.Tag, error)
	UpdateByID(ctx context.Context, nu *TagUpdateRequestIDO) (*tag_s.Tag, error)
	ListAndCountByFilter(ctx context.Context, f *t_s.TagPaginationListFilter) (*t_s.TagPaginationListAndCountResult, error)
	ListAsSelectOptionByFilter(ctx context.Context, f *tag_s.TagListFilter) ([]*tag_s.TagAsSelectOption, error)
	ArchiveByID(ctx context.Context, id primitive.ObjectID) (*tag_s.Tag, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
}

type TagControllerImpl struct {
	Config           *config.Conf
	Logger           *slog.Logger
	UUID             uuid.Provider
	S3               s3_storage.S3Storager
	Password         password.Provider
	Kmutex           kmutex.Provider
	DbClient         *mongo.Client
	UserStorer       user_s.UserStorer
	TagStorer        t_s.TagStorer
	CustomerStorer   c_s.CustomerStorer
	AssociateStorer  a_c.AssociateStorer
	OrderStorer      o_s.OrderStorer
	TaskItemStorer   ti_s.TaskItemStorer
	TemplatedEmailer templatedemailer.TemplatedEmailer
}

func NewController(
	appCfg *config.Conf,
	loggerp *slog.Logger,
	uuidp uuid.Provider,
	s3 s3_storage.S3Storager,
	passwordp password.Provider,
	kmux kmutex.Provider,
	client *mongo.Client,
	temailer templatedemailer.TemplatedEmailer,
	usr_storer user_s.UserStorer,
	t_storer t_s.TagStorer,
	c_storer c_s.CustomerStorer,
	a_ctorer a_c.AssociateStorer,
	o_storer o_s.OrderStorer,
	ti_storer ti_s.TaskItemStorer,
) TagController {
	s := &TagControllerImpl{
		Config:           appCfg,
		Logger:           loggerp,
		UUID:             uuidp,
		S3:               s3,
		Password:         passwordp,
		Kmutex:           kmux,
		TemplatedEmailer: temailer,
		DbClient:         client,
		UserStorer:       usr_storer,
		TagStorer:        t_storer,
		CustomerStorer:   c_storer,
		AssociateStorer:  a_ctorer,
		OrderStorer:      o_storer,
		TaskItemStorer:   ti_storer,
	}
	s.Logger.Debug("tag controller initialization started...")
	s.Logger.Debug("tag controller initialized")
	return s
}
