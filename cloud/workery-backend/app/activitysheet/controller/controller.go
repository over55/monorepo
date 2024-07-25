package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	s3_storage "github.com/over55/monorepo/cloud/workery-backend/adapter/storage/s3"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/templatedemailer"
	as_s "github.com/over55/monorepo/cloud/workery-backend/app/activitysheet/datastore"
	com_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	hh_s "github.com/over55/monorepo/cloud/workery-backend/app/howhear/datastore"
	t_s "github.com/over55/monorepo/cloud/workery-backend/app/tag/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// ActivitySheetController Interface for customer business logic controller.
type ActivitySheetController interface {
	// Create(ctx context.Context, m *ActivitySheetCreateRequestIDO) (*as_s.ActivitySheet, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*as_s.ActivitySheet, error)
	// UpdateByID(ctx context.Context, req *ActivitySheetUpdateRequestIDO) (*as_s.ActivitySheet, error)
	// ListByFilter(ctx context.Context, f *as_s.ActivitySheetPaginationListFilter) (*as_s.ActivitySheetListResult, error)
	LiteListByFilter(ctx context.Context, f *as_s.ActivitySheetPaginationListFilter) (*as_s.ActivitySheetPaginationLiteListResult, error)
	// ArchiveByID(ctx context.Context, id primitive.ObjectID) (*user_s.User, error)
	// DeleteByID(ctx context.Context, id primitive.ObjectID) error
	// CreateComment(ctx context.Context, req *ActivitySheetOperationCreateCommentRequest) (*as_s.ActivitySheet, error)
}

type ActivitySheetControllerImpl struct {
	Config              *config.Conf
	Logger              *slog.Logger
	UUID                uuid.Provider
	S3                  s3_storage.S3Storager
	Password            password.Provider
	Kmutex              kmutex.Provider
	DbClient            *mongo.Client
	CommentStorer       com_s.CommentStorer
	HowHearStorer       hh_s.HowHearAboutUsItemStorer
	TagStorer           t_s.TagStorer
	UserStorer          user_s.UserStorer
	CustomerStorer      c_s.CustomerStorer
	ActivitySheetStorer as_s.ActivitySheetStorer
	TemplatedEmailer    templatedemailer.TemplatedEmailer
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
	c_storer c_s.CustomerStorer,
	as_storer as_s.ActivitySheetStorer,
) ActivitySheetController {
	loggerp.Debug("customer controller initialization started...")
	s := &ActivitySheetControllerImpl{
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
		CustomerStorer:      c_storer,
		ActivitySheetStorer: as_storer,
	}
	s.Logger.Debug("customer controller initialized")
	return s
}
