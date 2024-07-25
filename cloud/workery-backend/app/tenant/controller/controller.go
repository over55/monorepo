package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	mg "github.com/over55/monorepo/cloud/workery-backend/adapter/emailer/mailgun"
	s3_storage "github.com/over55/monorepo/cloud/workery-backend/adapter/storage/s3"
	domain "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	org_d "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	tenant_s "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// TenantController Interface for Tenant business logic controller.
type TenantController interface {
	Create(ctx context.Context, m *domain.Tenant) (*domain.Tenant, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Tenant, error)
	UpdateByID(ctx context.Context, m *domain.Tenant) (*domain.Tenant, error)
	ListByFilter(ctx context.Context, f *domain.TenantListFilter) (*domain.TenantListResult, error)
	ListAsSelectOptionByFilter(ctx context.Context, f *domain.TenantListFilter) ([]*domain.TenantAsSelectOption, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
	CreateComment(ctx context.Context, customerID primitive.ObjectID, content string) (*org_d.Tenant, error)
	UpdateTaxRateOperation(ctx context.Context, requestData *UpdateTaxRateOperationRequestIDO) (*org_d.Tenant, error)
}

type TenantControllerImpl struct {
	Config       *config.Conf
	Logger       *slog.Logger
	UUID         uuid.Provider
	Kmutex       kmutex.Provider
	S3           s3_storage.S3Storager
	Emailer      mg.Emailer
	DbClient     *mongo.Client
	TenantStorer tenant_s.TenantStorer
	UserStorer   user_s.UserStorer
}

func NewController(
	appCfg *config.Conf,
	loggerp *slog.Logger,
	uuidp uuid.Provider,
	kmux kmutex.Provider,
	s3 s3_storage.S3Storager,
	emailer mg.Emailer,
	client *mongo.Client,
	org_storer tenant_s.TenantStorer,
	usr_storer user_s.UserStorer,
) TenantController {
	s := &TenantControllerImpl{
		Config:       appCfg,
		Logger:       loggerp,
		UUID:         uuidp,
		Kmutex:       kmux,
		S3:           s3,
		Emailer:      emailer,
		DbClient:     client,
		TenantStorer: org_storer,
		UserStorer:   usr_storer,
	}
	s.Logger.Debug("Tenant controller initialization started...")
	s.Logger.Debug("Tenant controller initialized")
	return s
}
