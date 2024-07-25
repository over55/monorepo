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
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	s_s "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	vehicletype_s "github.com/over55/monorepo/cloud/workery-backend/app/vehicletype/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// VehicleTypeController Interface for vehicletype business logic controller.
type VehicleTypeController interface {
	Create(ctx context.Context, requestData *VehicleTypeCreateRequestIDO) (*vehicletype_s.VehicleType, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*vehicletype_s.VehicleType, error)
	UpdateByID(ctx context.Context, requestData *VehicleTypeUpdateRequestIDO) (*vehicletype_s.VehicleType, error)
	ListAndCountByFilter(ctx context.Context, f *vehicletype_s.VehicleTypePaginationListFilter) (*vehicletype_s.VehicleTypePaginationListAndCountResult, error)
	ListAsSelectOptionByFilter(ctx context.Context, f *vehicletype_s.VehicleTypePaginationListFilter) ([]*vehicletype_s.VehicleTypeAsSelectOption, error)
	ArchiveByID(ctx context.Context, id primitive.ObjectID) (*vehicletype_s.VehicleType, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
}

type VehicleTypeControllerImpl struct {
	Config            *config.Conf
	Logger            *slog.Logger
	UUID              uuid.Provider
	S3                s3_storage.S3Storager
	Password          password.Provider
	Kmutex            kmutex.Provider
	DbClient          *mongo.Client
	UserStorer        user_s.UserStorer
	CustomerStorer    c_s.CustomerStorer
	AssociateStorer   a_s.AssociateStorer
	StaffStorer       s_s.StaffStorer
	OrderStorer       o_s.OrderStorer
	TaskItemStorer    ti_s.TaskItemStorer
	VehicleTypeStorer vehicletype_s.VehicleTypeStorer
	TemplatedEmailer  templatedemailer.TemplatedEmailer
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
	vehicletype_s vehicletype_s.VehicleTypeStorer,
) VehicleTypeController {
	loggerp.Debug("vehicletype controller initialization started...")
	s := &VehicleTypeControllerImpl{
		Config:            appCfg,
		Logger:            loggerp,
		UUID:              uuidp,
		Kmutex:            kmux,
		S3:                s3,
		Password:          passwordp,
		TemplatedEmailer:  temailer,
		DbClient:          client,
		UserStorer:        usr_storer,
		CustomerStorer:    c_storer,
		AssociateStorer:   a_storer,
		StaffStorer:       s_storer,
		OrderStorer:       o_storer,
		TaskItemStorer:    ti_storer,
		VehicleTypeStorer: vehicletype_s,
	}
	s.Logger.Debug("vehicletype controller initialized")
	return s
}
