package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	s3_storage "github.com/over55/monorepo/cloud/workery-backend/adapter/storage/s3"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/templatedemailer"
	a_c "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	attachment_s "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	com_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	orderincident_s "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/datastore"
	t_s "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// OrderIncidentController Interface for orderincident business logic controller.
type OrderIncidentController interface {
	Create(ctx context.Context, requestData *OrderIncidentCreateRequestIDO) (*orderincident_s.OrderIncident, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*orderincident_s.OrderIncident, error)
	UpdateByID(ctx context.Context, nu *OrderIncidentUpdateRequestIDO) (*orderincident_s.OrderIncident, error)
	ListAndCountByFilter(ctx context.Context, f *t_s.OrderIncidentPaginationListFilter) (*t_s.OrderIncidentPaginationListAndCountResult, error)
	ListAsSelectOptionByFilter(ctx context.Context, f *orderincident_s.OrderIncidentListFilter) ([]*orderincident_s.OrderIncidentAsSelectOption, error)
	ArchiveByID(ctx context.Context, id primitive.ObjectID) (*orderincident_s.OrderIncident, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
	CreateComment(ctx context.Context, req *OrderIncidentOperationCreateCommentRequest) (*orderincident_s.OrderIncident, error)
	CreateAttachment(ctx context.Context, req *OrderIncidentOperationCreateAttachmentRequest) (*orderincident_s.OrderIncident, error)
}

type OrderIncidentControllerImpl struct {
	Config              *config.Conf
	Logger              *slog.Logger
	UUID                uuid.Provider
	S3                  s3_storage.S3Storager
	Password            password.Provider
	Kmutex              kmutex.Provider
	DbClient            *mongo.Client
	UserStorer          user_s.UserStorer
	OrderIncidentStorer t_s.OrderIncidentStorer
	CustomerStorer      c_s.CustomerStorer
	AssociateStorer     a_c.AssociateStorer
	OrderStorer         o_s.OrderStorer
	TaskItemStorer      ti_s.TaskItemStorer
	CommentStorer       com_s.CommentStorer
	AttachmentStorer    attachment_s.AttachmentStorer
	TemplatedEmailer    templatedemailer.TemplatedEmailer
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
	t_storer t_s.OrderIncidentStorer,
	c_storer c_s.CustomerStorer,
	a_ctorer a_c.AssociateStorer,
	o_storer o_s.OrderStorer,
	ti_storer ti_s.TaskItemStorer,
	com_storer com_s.CommentStorer,
	attch_storer attachment_s.AttachmentStorer,
) OrderIncidentController {
	s := &OrderIncidentControllerImpl{
		Config:              appCfg,
		Logger:              loggerp,
		UUID:                uuidp,
		S3:                  s3,
		Password:            passwordp,
		Kmutex:              kmux,
		TemplatedEmailer:    temailer,
		DbClient:            client,
		UserStorer:          usr_storer,
		OrderIncidentStorer: t_storer,
		CustomerStorer:      c_storer,
		AssociateStorer:     a_ctorer,
		OrderStorer:         o_storer,
		TaskItemStorer:      ti_storer,
		CommentStorer:       com_storer,
		AttachmentStorer:    attch_storer,
	}
	s.Logger.Debug("orderincident controller initialization started...")
	s.Logger.Debug("orderincident controller initialized")
	return s
}
