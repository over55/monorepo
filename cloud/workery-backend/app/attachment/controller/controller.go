package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	mg "github.com/over55/monorepo/cloud/workery-backend/adapter/emailer/mailgun"
	s3_storage "github.com/over55/monorepo/cloud/workery-backend/adapter/storage/s3"
	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	attachment_s "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	domain "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	s_s "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// AttachmentController Interface for attachment business logic controller.
type AttachmentController interface {
	Create(ctx context.Context, req *AttachmentCreateRequestIDO) (*domain.Attachment, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Attachment, error)
	UpdateByID(ctx context.Context, ns *AttachmentUpdateRequestIDO) (*domain.Attachment, error)
	ListByFilter(ctx context.Context, f *domain.AttachmentListFilter) (*domain.AttachmentListResult, error)
	ListAsSelectOptionByFilter(ctx context.Context, f *domain.AttachmentListFilter) ([]*domain.AttachmentAsSelectOption, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
	PermanentlyDeleteByID(ctx context.Context, id primitive.ObjectID) error
	PermanentlyDeleteAllByCustomerID(ctx context.Context, customerID primitive.ObjectID) error
	PermanentlyDeleteAllByAssociateID(ctx context.Context, associateID primitive.ObjectID) error
}

type AttachmentControllerImpl struct {
	Config           *config.Conf
	Logger           *slog.Logger
	UUID             uuid.Provider
	Kmutex           kmutex.Provider
	S3               s3_storage.S3Storager
	Emailer          mg.Emailer
	DbClient         *mongo.Client
	AttachmentStorer attachment_s.AttachmentStorer
	UserStorer       user_s.UserStorer
	CustomerStorer   c_s.CustomerStorer
	AssociateStorer  a_s.AssociateStorer
	OrderStorer      o_s.OrderStorer
	StaffStorer      s_s.StaffStorer
}

func NewController(
	appCfg *config.Conf,
	loggerp *slog.Logger,
	uuidp uuid.Provider,
	kmux kmutex.Provider,
	s3 s3_storage.S3Storager,
	emailer mg.Emailer,
	client *mongo.Client,
	org_storer attachment_s.AttachmentStorer,
	usr_storer user_s.UserStorer,
	c_storer c_s.CustomerStorer,
	a_storer a_s.AssociateStorer,
	o_storer o_s.OrderStorer,
	s_storer s_s.StaffStorer,
) AttachmentController {
	loggerp.Debug("attachment controller initialization started...")
	s := &AttachmentControllerImpl{
		Config:           appCfg,
		Logger:           loggerp,
		UUID:             uuidp,
		Kmutex:           kmux,
		S3:               s3,
		Emailer:          emailer,
		DbClient:         client,
		AttachmentStorer: org_storer,
		UserStorer:       usr_storer,
		CustomerStorer:   c_storer,
		AssociateStorer:  a_storer,
		OrderStorer:      o_storer,
		StaffStorer:      s_storer,
	}
	s.Logger.Debug("attachment controller initialized")
	return s
}
