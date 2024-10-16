package controller

import (
	"context"

	"log/slog"

	"github.com/over55/monorepo/cloud/workery-backend/adapter/cache/mongodbcache"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/templatedemailer"
	associate_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	away_s "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/datastore"
	b_s "github.com/over55/monorepo/cloud/workery-backend/app/bulletin/datastore"
	comm_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	customer_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	taskitem_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	tenant_s "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/jwt"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

type JobHistoryController interface {
	JobHistory(ctx context.Context) (*JobHistoryResponseIDO, error)
}

type JobHistoryControllerImpl struct {
	Config                 *config.Conf
	Logger                 *slog.Logger
	UUID                   uuid.Provider
	JWT                    jwt.Provider
	Password               password.Provider
	Cache                  mongodbcache.Cacher
	TemplatedEmailer       templatedemailer.TemplatedEmailer
	UserStorer             user_s.UserStorer
	TenantStorer           tenant_s.TenantStorer
	CustomerStorer         customer_s.CustomerStorer
	AssociateStorer        associate_s.AssociateStorer
	AssociateAwayLogStorer away_s.AssociateAwayLogStorer
	OrderStorer            o_s.OrderStorer
	TaskItemStorer         taskitem_s.TaskItemStorer
	BulletinStorer         b_s.BulletinStorer
	CommentStorer          comm_s.CommentStorer
}

func NewController(
	appCfg *config.Conf,
	loggerp *slog.Logger,
	uuidp uuid.Provider,
	jwtp jwt.Provider,
	passwordp password.Provider,
	cache mongodbcache.Cacher,
	te templatedemailer.TemplatedEmailer,
	usr_storer user_s.UserStorer,
	org_storer tenant_s.TenantStorer,
	cus_storer customer_s.CustomerStorer,
	as_storer associate_s.AssociateStorer,
	asl_storer away_s.AssociateAwayLogStorer,
	o_storer o_s.OrderStorer,
	ti_storer taskitem_s.TaskItemStorer,
	b_storer b_s.BulletinStorer,
	com_storer comm_s.CommentStorer,
) JobHistoryController {
	loggerp.Debug("jobhistory controller initialization started...")
	s := &JobHistoryControllerImpl{
		Config:                 appCfg,
		Logger:                 loggerp,
		UUID:                   uuidp,
		JWT:                    jwtp,
		Password:               passwordp,
		Cache:                  cache,
		TemplatedEmailer:       te,
		UserStorer:             usr_storer,
		TenantStorer:           org_storer,
		CustomerStorer:         cus_storer,
		AssociateStorer:        as_storer,
		AssociateAwayLogStorer: asl_storer,
		OrderStorer:            o_storer,
		TaskItemStorer:         ti_storer,
		BulletinStorer:         b_storer,
		CommentStorer:          com_storer,
	}
	s.Logger.Debug("jobhistory controller initialized")
	return s
}
