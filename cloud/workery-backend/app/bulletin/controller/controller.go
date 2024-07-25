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
	attachment_s "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	bulletin_s "github.com/over55/monorepo/cloud/workery-backend/app/bulletin/datastore"
	com_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	hh_s "github.com/over55/monorepo/cloud/workery-backend/app/howhear/datastore"
	ir_s "github.com/over55/monorepo/cloud/workery-backend/app/insurancerequirement/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	servicefee_s "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/datastore"
	ss_s "github.com/over55/monorepo/cloud/workery-backend/app/skillset/datastore"
	t_s "github.com/over55/monorepo/cloud/workery-backend/app/tag/datastore"
	task_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	vt_s "github.com/over55/monorepo/cloud/workery-backend/app/vehicletype/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// BulletinController Interface for associate business logic controller.
type BulletinController interface {
	Create(ctx context.Context, req *BulletinCreateRequestIDO) (*bulletin_s.Bulletin, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*bulletin_s.Bulletin, error)
	UpdateByID(ctx context.Context, req *BulletinUpdateRequestIDO) (*bulletin_s.Bulletin, error)
	ListAndCountByFilter(ctx context.Context, f *bulletin_s.BulletinPaginationListFilter) (*bulletin_s.BulletinPaginationListAndCountResult, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
}

type BulletinControllerImpl struct {
	Config                     *config.Conf
	Logger                     *slog.Logger
	UUID                       uuid.Provider
	S3                         s3_storage.S3Storager
	Password                   password.Provider
	TemplatedEmailer           templatedemailer.TemplatedEmailer
	Kmutex                     kmutex.Provider
	DbClient                   *mongo.Client
	CommentStorer              com_s.CommentStorer
	ActivitySheetStorer        act_s.ActivitySheetStorer
	TaskItemStorer             task_s.TaskItemStorer
	HowHearStorer              hh_s.HowHearAboutUsItemStorer
	SkillSetStorer             ss_s.SkillSetStorer
	VehicleTypeStorer          vt_s.VehicleTypeStorer
	TagStorer                  t_s.TagStorer
	ServiceFeeStorer           servicefee_s.ServiceFeeStorer
	InsuranceRequirementStorer ir_s.InsuranceRequirementStorer
	OrderStorer                o_s.OrderStorer
	AttachmentStorer           attachment_s.AttachmentStorer
	UserStorer                 user_s.UserStorer
	AssociateStorer            a_c.AssociateStorer
	BulletinStorer             bulletin_s.BulletinStorer
}

func NewController(
	appCfg *config.Conf,
	loggerp *slog.Logger,
	uuidp uuid.Provider,
	s3 s3_storage.S3Storager,
	passwordp password.Provider,
	temailer templatedemailer.TemplatedEmailer,
	kmux kmutex.Provider,
	client *mongo.Client,
	com_storer com_s.CommentStorer,
	act_storer act_s.ActivitySheetStorer,
	task_storer task_s.TaskItemStorer,
	hh_storer hh_s.HowHearAboutUsItemStorer,
	skillset_s ss_s.SkillSetStorer,
	vehicletype_s vt_s.VehicleTypeStorer,
	servicefee_s servicefee_s.ServiceFeeStorer,
	insurancerequirement_s ir_s.InsuranceRequirementStorer,
	usr_storer user_s.UserStorer,
	t_storer t_s.TagStorer,
	ord_s o_s.OrderStorer,
	attch_storer attachment_s.AttachmentStorer,
	a_ctorer a_c.AssociateStorer,
	b_storer bulletin_s.BulletinStorer,
) BulletinController {
	loggerp.Debug("bulletin controller initialization started...")
	s := &BulletinControllerImpl{
		Config:                     appCfg,
		Logger:                     loggerp,
		UUID:                       uuidp,
		S3:                         s3,
		Password:                   passwordp,
		Kmutex:                     kmux,
		DbClient:                   client,
		TemplatedEmailer:           temailer,
		CommentStorer:              com_storer,
		ActivitySheetStorer:        act_storer,
		TaskItemStorer:             task_storer,
		HowHearStorer:              hh_storer,
		SkillSetStorer:             skillset_s,
		TagStorer:                  t_storer,
		VehicleTypeStorer:          vehicletype_s,
		ServiceFeeStorer:           servicefee_s,
		InsuranceRequirementStorer: insurancerequirement_s,
		OrderStorer:                ord_s,
		UserStorer:                 usr_storer,
		AttachmentStorer:           attch_storer,
		AssociateStorer:            a_ctorer,
		BulletinStorer:             b_storer,
	}
	s.Logger.Debug("bulletin controller initialized")
	return s
}
