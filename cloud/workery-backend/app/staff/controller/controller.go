package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	s3_storage "github.com/over55/monorepo/cloud/workery-backend/adapter/storage/s3"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/templatedemailer"
	act_s "github.com/over55/monorepo/cloud/workery-backend/app/activitysheet/datastore"
	attachment_s "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	com_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	hh_s "github.com/over55/monorepo/cloud/workery-backend/app/howhear/datastore"
	ir_s "github.com/over55/monorepo/cloud/workery-backend/app/insurancerequirement/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	servicefee_s "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/datastore"
	ss_s "github.com/over55/monorepo/cloud/workery-backend/app/skillset/datastore"
	s_s "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	t_s "github.com/over55/monorepo/cloud/workery-backend/app/tag/datastore"
	task_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	ten_s "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	vt_s "github.com/over55/monorepo/cloud/workery-backend/app/vehicletype/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// StaffController Interface for staff business logic controller.
type StaffController interface {
	Create(ctx context.Context, m *StaffCreateRequestIDO) (*s_s.Staff, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*s_s.Staff, error)
	UpdateByID(ctx context.Context, req *StaffUpdateRequestIDO) (*s_s.Staff, error)
	LiteListAndCountByFilter(ctx context.Context, f *s_s.StaffPaginationListFilter) (*s_s.StaffPaginationLiteListAndCountResult, error)
	// ListAsSelectOptionByFilter(ctx context.Context, f *s_s.StaffListFilter) ([]*s_s.StaffAsSelectOption, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
	CreateComment(ctx context.Context, req *StaffOperationCreateCommentRequest) (*s_s.Staff, error)
	Archive(ctx context.Context, req *StaffOperationArchiveRequestIDO) (*s_s.Staff, error)
	Downgrade(ctx context.Context, req *StaffOperationDowngradeRequest) (*s_s.Staff, error)
	Upgrade(ctx context.Context, req *StaffOperationUpgradeRequest) (*s_s.Staff, error)
	Avatar(ctx context.Context, req *StaffOperationAvatarRequest) (*s_s.Staff, error)
	ChangePassword(ctx context.Context, req *StaffOperationChangePasswordRequest) error
	ChangeTwoFactorAuthentication(ctx context.Context, req *StaffOperationChangeTwoFactorAuthenticationRequest) error
}

type StaffControllerImpl struct {
	Config                     *config.Conf
	Logger                     *slog.Logger
	UUID                       uuid.Provider
	S3                         s3_storage.S3Storager
	Password                   password.Provider
	Kmutex                     kmutex.Provider
	TemplatedEmailer           templatedemailer.TemplatedEmailer
	DbClient                   *mongo.Client
	TenantStorer               ten_s.TenantStorer
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
	StaffStorer                s_s.StaffStorer
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
	s_storer s_s.StaffStorer,
) StaffController {
	loggerp.Debug("staff controller initialization started...")
	s := &StaffControllerImpl{
		Config:                     appCfg,
		Logger:                     loggerp,
		UUID:                       uuidp,
		S3:                         s3,
		Password:                   passwordp,
		Kmutex:                     kmux,
		DbClient:                   client,
		TemplatedEmailer:           temailer,
		TenantStorer:               org_storer,
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
		StaffStorer:                s_storer,
	}
	s.Logger.Debug("staff controller initialized")
	return s
}
