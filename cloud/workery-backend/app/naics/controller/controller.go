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
	naics_s "github.com/over55/monorepo/cloud/workery-backend/app/naics/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	s_s "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// NorthAmericanIndustryClassificationSystemController Interface for naics business logic controller.
type NorthAmericanIndustryClassificationSystemController interface {
	GetByID(ctx context.Context, id primitive.ObjectID) (*naics_s.NorthAmericanIndustryClassificationSystem, error)
	ListAndCountByFilter(ctx context.Context, f *naics_s.NorthAmericanIndustryClassificationSystemPaginationListFilter) (*naics_s.NorthAmericanIndustryClassificationSystemPaginationListAndCountResult, error)
	ListAsSelectOptionByFilter(ctx context.Context, f *naics_s.NorthAmericanIndustryClassificationSystemPaginationListFilter) ([]*naics_s.NorthAmericanIndustryClassificationSystemAsSelectOption, error)
}

type NorthAmericanIndustryClassificationSystemControllerImpl struct {
	Config                                          *config.Conf
	Logger                                          *slog.Logger
	UUID                                            uuid.Provider
	S3                                              s3_storage.S3Storager
	Password                                        password.Provider
	Kmutex                                          kmutex.Provider
	DbClient                                        *mongo.Client
	UserStorer                                      user_s.UserStorer
	CustomerStorer                                  c_s.CustomerStorer
	AssociateStorer                                 a_s.AssociateStorer
	StaffStorer                                     s_s.StaffStorer
	OrderStorer                                     o_s.OrderStorer
	TaskItemStorer                                  ti_s.TaskItemStorer
	NorthAmericanIndustryClassificationSystemStorer naics_s.NorthAmericanIndustryClassificationSystemStorer
	TemplatedEmailer                                templatedemailer.TemplatedEmailer
}

func NewController(
	appCfg *config.Conf,
	loggerp *slog.Logger,
	uuidp uuid.Provider,
	kmux kmutex.Provider,
	s3 s3_storage.S3Storager,
	passwordp password.Provider,
	client *mongo.Client,
	temailer templatedemailer.TemplatedEmailer,
	usr_storer user_s.UserStorer,
	c_storer c_s.CustomerStorer,
	a_storer a_s.AssociateStorer,
	s_storer s_s.StaffStorer,
	o_storer o_s.OrderStorer,
	ti_storer ti_s.TaskItemStorer,
	naics_s naics_s.NorthAmericanIndustryClassificationSystemStorer,
) NorthAmericanIndustryClassificationSystemController {
	loggerp.Debug("naics controller initialization started...")
	s := &NorthAmericanIndustryClassificationSystemControllerImpl{
		Config:           appCfg,
		Logger:           loggerp,
		UUID:             uuidp,
		Kmutex:           kmux,
		S3:               s3,
		Password:         passwordp,
		TemplatedEmailer: temailer,
		DbClient:         client,
		UserStorer:       usr_storer,
		CustomerStorer:   c_storer,
		AssociateStorer:  a_storer,
		StaffStorer:      s_storer,
		OrderStorer:      o_storer,
		TaskItemStorer:   ti_storer,
		NorthAmericanIndustryClassificationSystemStorer: naics_s,
	}
	s.Logger.Debug("naics controller initialized")
	return s
}
