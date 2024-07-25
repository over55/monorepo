package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	s3_storage "github.com/over55/monorepo/cloud/workery-backend/adapter/storage/s3"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/templatedemailer"
	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	howhear_s "github.com/over55/monorepo/cloud/workery-backend/app/howhear/datastore"
	s_s "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// HowHearAboutUsItemController Interface for howhear business logic controller.
type HowHearAboutUsItemController interface {
	Create(ctx context.Context, requestData *HowHearAboutUsItemCreateRequestIDO) (*howhear_s.HowHearAboutUsItem, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*howhear_s.HowHearAboutUsItem, error)
	UpdateByID(ctx context.Context, requestData *HowHearAboutUsItemUpdateRequestIDO) (*howhear_s.HowHearAboutUsItem, error)
	ListAndCountByFilter(ctx context.Context, f *howhear_s.HowHearAboutUsItemPaginationListFilter) (*howhear_s.HowHearAboutUsItemPaginationListAndCountResult, error)
	ListAsSelectOptionByFilter(ctx context.Context, f *howhear_s.HowHearAboutUsItemPaginationListFilter) ([]*howhear_s.HowHearAboutUsItemAsSelectOption, error)
	ArchiveByID(ctx context.Context, id primitive.ObjectID) (*howhear_s.HowHearAboutUsItem, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
}

type HowHearAboutUsItemControllerImpl struct {
	Config                   *config.Conf
	Logger                   *slog.Logger
	UUID                     uuid.Provider
	S3                       s3_storage.S3Storager
	Password                 password.Provider
	Kmutex                   kmutex.Provider
	DbClient                 *mongo.Client
	UserStorer               user_s.UserStorer
	CustomerStorer           c_s.CustomerStorer
	AssociateStorer          a_s.AssociateStorer
	StaffStorer              s_s.StaffStorer
	HowHearAboutUsItemStorer howhear_s.HowHearAboutUsItemStorer
	TemplatedEmailer         templatedemailer.TemplatedEmailer
}

func NewController(
	appCfg *config.Conf,
	loggerp *slog.Logger,
	uuidp uuid.Provider,
	s3 s3_storage.S3Storager,
	passwordp password.Provider,
	kmux kmutex.Provider,
	temailer templatedemailer.TemplatedEmailer,
	client *mongo.Client,
	usr_storer user_s.UserStorer,
	c_storer c_s.CustomerStorer,
	a_storer a_s.AssociateStorer,
	s_storer s_s.StaffStorer,
	howhear_s howhear_s.HowHearAboutUsItemStorer,
) HowHearAboutUsItemController {
	s := &HowHearAboutUsItemControllerImpl{
		Config:                   appCfg,
		Logger:                   loggerp,
		UUID:                     uuidp,
		S3:                       s3,
		Password:                 passwordp,
		Kmutex:                   kmux,
		TemplatedEmailer:         temailer,
		DbClient:                 client,
		UserStorer:               usr_storer,
		CustomerStorer:           c_storer,
		AssociateStorer:          a_storer,
		StaffStorer:              s_storer,
		HowHearAboutUsItemStorer: howhear_s,
	}
	s.Logger.Debug("howhear controller initialization started...")
	s.Logger.Debug("howhear controller initialized")
	return s
}
