package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	s3_storage "github.com/over55/monorepo/cloud/workery-backend/adapter/storage/s3"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/templatedemailer"
	attachment_s "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	com_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	hh_s "github.com/over55/monorepo/cloud/workery-backend/app/howhear/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	t_s "github.com/over55/monorepo/cloud/workery-backend/app/tag/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	ten_s "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// CustomerController Interface for customer business logic controller.
type CustomerController interface {
	Create(ctx context.Context, m *CustomerCreateRequestIDO) (*c_s.Customer, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*c_s.Customer, error)
	UpdateByID(ctx context.Context, req *CustomerUpdateRequestIDO) (*c_s.Customer, error)
	LiteListAndCountByFilter(ctx context.Context, f *c_s.CustomerPaginationListFilter) (*c_s.CustomerPaginationLiteListAndCountResult, error)
	ListAsSelectOptionByFilter(ctx context.Context, f *c_s.CustomerListFilter) ([]*c_s.CustomerAsSelectOption, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
	CreateComment(ctx context.Context, req *CustomerOperationCreateCommentRequest) (*c_s.Customer, error)
	Archive(ctx context.Context, req *CustomerOperationArchiveRequestIDO) (*c_s.Customer, error)
	Downgrade(ctx context.Context, req *CustomerOperationDowngradeRequest) (*c_s.Customer, error)
	Upgrade(ctx context.Context, req *CustomerOperationUpgradeRequest) (*c_s.Customer, error)
	Avatar(ctx context.Context, req *CustomerOperationAvatarRequest) (*c_s.Customer, error)
	ChangePassword(ctx context.Context, req *CustomerOperationChangePasswordRequest) error
	ChangeTwoFactorAuthentication(ctx context.Context, req *CustomerOperationChangeTwoFactorAuthenticationRequest) error
}

type CustomerControllerImpl struct {
	Config           *config.Conf
	Logger           *slog.Logger
	UUID             uuid.Provider
	S3               s3_storage.S3Storager
	Password         password.Provider
	Kmutex           kmutex.Provider
	TemplatedEmailer templatedemailer.TemplatedEmailer
	DbClient         *mongo.Client
	TenantStorer     ten_s.TenantStorer
	CommentStorer    com_s.CommentStorer
	HowHearStorer    hh_s.HowHearAboutUsItemStorer
	TagStorer        t_s.TagStorer
	UserStorer       user_s.UserStorer
	AttachmentStorer attachment_s.AttachmentStorer
	CustomerStorer   c_s.CustomerStorer
	OrderStorer      o_s.OrderStorer
	TaskItemStorer   ti_s.TaskItemStorer
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
	org_storer ten_s.TenantStorer,
	com_storer com_s.CommentStorer,
	hh_storer hh_s.HowHearAboutUsItemStorer,
	t_storer t_s.TagStorer,
	usr_storer user_s.UserStorer,
	attch_storer attachment_s.AttachmentStorer,
	c_storer c_s.CustomerStorer,
	o_storer o_s.OrderStorer,
	ti_storer ti_s.TaskItemStorer,
) CustomerController {
	loggerp.Debug("customer controller initialization started...")
	s := &CustomerControllerImpl{
		Config:           appCfg,
		Logger:           loggerp,
		UUID:             uuidp,
		S3:               s3,
		Password:         passwordp,
		Kmutex:           kmux,
		TemplatedEmailer: temailer,
		DbClient:         client,
		TenantStorer:     org_storer,
		CommentStorer:    com_storer,
		HowHearStorer:    hh_storer,
		TagStorer:        t_storer,
		UserStorer:       usr_storer,
		AttachmentStorer: attch_storer,
		CustomerStorer:   c_storer,
		OrderStorer:      o_storer,
		TaskItemStorer:   ti_storer,
	}
	s.Logger.Debug("customer controller initialized")
	return s
}
