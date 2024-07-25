package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	s3_storage "github.com/over55/monorepo/cloud/workery-backend/adapter/storage/s3"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/templatedemailer"
	act_s "github.com/over55/monorepo/cloud/workery-backend/app/activitysheet/datastore"
	a_c "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	com_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	hh_s "github.com/over55/monorepo/cloud/workery-backend/app/howhear/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	servicefee_s "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/datastore"
	t_s "github.com/over55/monorepo/cloud/workery-backend/app/tag/datastore"
	as_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// TaskItemController Interface for customer business logic controller.
type TaskItemController interface {
	// Create(ctx context.Context, m *TaskItemCreateRequestIDO) (*ti_s.TaskItem, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*ti_s.TaskItem, error)
	// UpdateByID(ctx context.Context, req *TaskItemUpdateRequestIDO) (*ti_s.TaskItem, error)
	// ListByFilter(ctx context.Context, f *ti_s.TaskItemListFilter) (*ti_s.TaskItemListResult, error)
	ListAndCountByFilter(ctx context.Context, f *ti_s.TaskItemPaginationListFilter) (*ti_s.TaskItemPaginationListAndCountResult, error)
	CountByFilter(ctx context.Context, f *as_s.TaskItemPaginationListFilter) (*TaskItemCountResponseIDO, error)
	// ArchiveByID(ctx context.Context, id primitive.ObjectID) (*user_s.User, error)
	// DeleteByID(ctx context.Context, id primitive.ObjectID) error
	// CreateComment(ctx context.Context, req *TaskItemOperationCreateCommentRequest) (*ti_s.TaskItem, error)
	ListAssignableAssociatesByTaskID(ctx context.Context, id primitive.ObjectID) (*ListAssignableAssociatesByTaskIDResponse, error)
	AssignAssociateOperation(ctx context.Context, requestData *TaskItemOperationAssignAssociateRequestIDO) (*ti_s.TaskItem, error)
	OrderCompletionOperation(ctx context.Context, req *TaskItemOperationOrderCompletionRequestIDO) (*ti_s.TaskItem, error)
	PostponeOperation(ctx context.Context, req *TaskItemOperationPostponeRequestIDO) (*ti_s.TaskItem, error)
	CloseOperation(ctx context.Context, req *TaskItemOperationCloseRequestIDO) (*ti_s.TaskItem, error)
	SurveyOperation(ctx context.Context, req *TaskItemOperationSurveyRequestIDO) (*ti_s.TaskItem, error)
}

type TaskItemControllerImpl struct {
	Config              *config.Conf
	Logger              *slog.Logger
	UUID                uuid.Provider
	S3                  s3_storage.S3Storager
	Password            password.Provider
	Kmutex              kmutex.Provider
	DbClient            *mongo.Client
	TemplatedEmailer    templatedemailer.TemplatedEmailer
	CommentStorer       com_s.CommentStorer
	HowHearStorer       hh_s.HowHearAboutUsItemStorer
	TagStorer           t_s.TagStorer
	UserStorer          user_s.UserStorer
	ActivitySheetStorer act_s.ActivitySheetStorer
	CustomerStorer      c_s.CustomerStorer
	TaskItemStorer      ti_s.TaskItemStorer
	AssociateStorer     a_c.AssociateStorer
	OrderStorer         o_s.OrderStorer
	ServiceFeeStorer    servicefee_s.ServiceFeeStorer
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
	com_storer com_s.CommentStorer,
	hh_storer hh_s.HowHearAboutUsItemStorer,
	t_storer t_s.TagStorer,
	usr_storer user_s.UserStorer,
	act_storer act_s.ActivitySheetStorer,
	c_storer c_s.CustomerStorer,
	ti_storer ti_s.TaskItemStorer,
	a_ctorer a_c.AssociateStorer,
	o_storer o_s.OrderStorer,
	servicefee_s servicefee_s.ServiceFeeStorer,
) TaskItemController {
	loggerp.Debug("customer controller initialization started...")
	s := &TaskItemControllerImpl{
		Config:              appCfg,
		Logger:              loggerp,
		UUID:                uuidp,
		S3:                  s3,
		Password:            passwordp,
		Kmutex:              kmux,
		TemplatedEmailer:    temailer,
		DbClient:            client,
		CommentStorer:       com_storer,
		HowHearStorer:       hh_storer,
		TagStorer:           t_storer,
		UserStorer:          usr_storer,
		ActivitySheetStorer: act_storer,
		CustomerStorer:      c_storer,
		TaskItemStorer:      ti_storer,
		AssociateStorer:     a_ctorer,
		OrderStorer:         o_storer,
		ServiceFeeStorer:    servicefee_s,
	}
	s.Logger.Debug("customer controller initialized")
	return s
}
