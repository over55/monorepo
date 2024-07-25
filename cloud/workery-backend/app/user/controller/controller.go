package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/over55/monorepo/cloud/workery-backend/adapter/templatedemailer"
	tenant_s "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	domain "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// UserController Interface for user business logic controller.
type UserController interface {
	Create(ctx context.Context, requestData *UserCreateRequestIDO) (*user_s.User, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*user_s.User, error)
	GetUserBySessionUUID(ctx context.Context, sessionUUID string) (*domain.User, error)
	ArchiveByID(ctx context.Context, id primitive.ObjectID) (*user_s.User, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
	ListByFilter(ctx context.Context, f *user_s.UserListFilter) (*user_s.UserListResult, error)
	ListAsSelectOptionByFilter(ctx context.Context, f *user_s.UserListFilter) ([]*user_s.UserAsSelectOption, error)
	UpdateByID(ctx context.Context, request *UserUpdateRequestIDO) (*user_s.User, error)
	CreateComment(ctx context.Context, customerID primitive.ObjectID, content string) (*user_s.User, error)
}

type UserControllerImpl struct {
	Config           *config.Conf
	Logger           *slog.Logger
	UUID             uuid.Provider
	Password         password.Provider
	Kmutex           kmutex.Provider
	DbClient         *mongo.Client
	TenantStorer     tenant_s.TenantStorer
	UserStorer       user_s.UserStorer
	TemplatedEmailer templatedemailer.TemplatedEmailer
}

func NewController(
	appCfg *config.Conf,
	loggerp *slog.Logger,
	uuidp uuid.Provider,
	passwordp password.Provider,
	kmux kmutex.Provider,
	client *mongo.Client,
	org_storer tenant_s.TenantStorer,
	usr_storer user_s.UserStorer,
	temailer templatedemailer.TemplatedEmailer,
) UserController {
	s := &UserControllerImpl{
		Config:           appCfg,
		Logger:           loggerp,
		UUID:             uuidp,
		Password:         passwordp,
		Kmutex:           kmux,
		DbClient:         client,
		TenantStorer:     org_storer,
		UserStorer:       usr_storer,
		TemplatedEmailer: temailer,
	}
	s.Logger.Debug("user controller initialization started...")

	s.Logger.Debug("user controller initialized")
	return s
}
