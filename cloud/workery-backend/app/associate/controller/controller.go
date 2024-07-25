package controller

import (
	"context"
	"log"
	"log/slog"
	"math"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	s3_storage "github.com/over55/monorepo/cloud/workery-backend/adapter/storage/s3"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/templatedemailer"
	act_s "github.com/over55/monorepo/cloud/workery-backend/app/activitysheet/datastore"
	a_c "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	attachment_s "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	com_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	hh_s "github.com/over55/monorepo/cloud/workery-backend/app/howhear/datastore"
	ir_s "github.com/over55/monorepo/cloud/workery-backend/app/insurancerequirement/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	servicefee_s "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/datastore"
	ss_s "github.com/over55/monorepo/cloud/workery-backend/app/skillset/datastore"
	t_s "github.com/over55/monorepo/cloud/workery-backend/app/tag/datastore"
	task_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	ten_s "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	vt_s "github.com/over55/monorepo/cloud/workery-backend/app/vehicletype/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/jobseekerid"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// AssociateController Interface for associate business logic controller.
type AssociateController interface {
	Create(ctx context.Context, m *AssociateCreateRequestIDO) (*a_c.Associate, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*a_c.Associate, error)
	UpdateByID(ctx context.Context, req *AssociateUpdateRequestIDO) (*a_c.Associate, error)
	LiteListAndCountByFilter(ctx context.Context, f *a_c.AssociatePaginationListFilter) (*a_c.AssociatePaginationLiteListAndCountResult, error)
	ListAsSelectOptionByFilter(ctx context.Context, f *a_c.AssociateListFilter) ([]*a_c.AssociateAsSelectOption, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
	CreateComment(ctx context.Context, req *AssociateOperationCreateCommentRequest) (*a_c.Associate, error)
	Archive(ctx context.Context, req *AssociateOperationArchiveRequestIDO) (*a_c.Associate, error)
	Downgrade(ctx context.Context, req *AssociateOperationDowngradeRequest) (*a_c.Associate, error)
	Upgrade(ctx context.Context, req *AssociateOperationUpgradeRequest) (*a_c.Associate, error)
	Avatar(ctx context.Context, req *AssociateOperationAvatarRequest) (*a_c.Associate, error)
	ChangePassword(ctx context.Context, req *AssociateOperationChangePasswordRequest) error
	ChangeTwoFactorAuthentication(ctx context.Context, req *AssociateOperationChangeTwoFactorAuthenticationRequest) error
}

type AssociateControllerImpl struct {
	Config                     *config.Conf
	Logger                     *slog.Logger
	UUID                       uuid.Provider
	S3                         s3_storage.S3Storager
	Password                   password.Provider
	Kmutex                     kmutex.Provider
	JobSeekerID                jobseekerid.Provider
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
	AssociateStorer            a_c.AssociateStorer
}

func NewController(
	appCfg *config.Conf,
	loggerp *slog.Logger,
	uuidp uuid.Provider,
	jsidp jobseekerid.Provider,
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
	a_ctorer a_c.AssociateStorer,
) AssociateController {
	loggerp.Debug("associate controller initialization started...")
	s := &AssociateControllerImpl{
		Config:                     appCfg,
		Logger:                     loggerp,
		UUID:                       uuidp,
		JobSeekerID:                jsidp,
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
		AssociateStorer:            a_ctorer,
	}
	// s.repairAllAssociatesBalances() // DEPRECATED
	s.Logger.Debug("associate controller initialized")
	return s
}

// DEPRECATED - will delete in future.
func (impl *AssociateControllerImpl) repairAllAssociatesBalances() {
	ctx := context.Background()
	f := &a_c.AssociatePaginationListFilter{
		PageSize:  1_000_000,
		SortField: "created_at",
		SortOrder: -1,
	}
	res, err := impl.AssociateStorer.ListByFilter(ctx, f)
	if err != nil {
		log.Fatal(err)
	}
	if res == nil {
		log.Fatal("empty list for associates")
	}
	for _, a := range res.Results {
		var balanceOwingAmount float64 = 0

		// Iterate through all the work orders and compute a total of balance
		// owing to Over55 by the associate.
		res, err := impl.OrderStorer.ListByAssociateID(ctx, a.ID)
		if err != nil {
			impl.Logger.Error("database list by associate id error",
				slog.Any("associate_id", a.ID),
				slog.Any("error", err))
			log.Fatal(err)
		}
		for _, o := range res.Results {
			// Tally up the total paid in service fees. If negative then Over55
			// owes the associate, if positive value then assocaite owes Over55.
			balanceOwingAmount += o.InvoiceBalanceOwingAmount
		}

		// Round the balance owing to 2 decimal places.
		balanceOwingAmount = math.Floor(balanceOwingAmount*100) / 100

		// For debugging purposes only.
		impl.Logger.Debug("associate balance owing amount updated",
			slog.Any("new_balanceOwingAmount", balanceOwingAmount),
			slog.Any("old_balanceOwingAmount", a.BalanceOwingAmount))

		// Update the associate with the new total owing amount.
		a.BalanceOwingAmount = balanceOwingAmount
		if err := impl.AssociateStorer.UpdateByID(ctx, a); err != nil {
			impl.Logger.Error("associate update by id error",
				slog.Any("associate_id", a.ID),
				slog.Any("error", err))
			log.Fatal(err)
		}
	}
}
