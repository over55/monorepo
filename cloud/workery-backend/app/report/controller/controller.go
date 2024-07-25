package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/over55/monorepo/cloud/workery-backend/adapter/pdfbuilder"
	s3_storage "github.com/over55/monorepo/cloud/workery-backend/adapter/storage/s3"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/templatedemailer"
	act_s "github.com/over55/monorepo/cloud/workery-backend/app/activitysheet/datastore"
	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	attachment_s "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	com_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	hh_s "github.com/over55/monorepo/cloud/workery-backend/app/howhear/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	servicefee_s "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/datastore"
	ss_s "github.com/over55/monorepo/cloud/workery-backend/app/skillset/datastore"
	s_s "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	t_s "github.com/over55/monorepo/cloud/workery-backend/app/tag/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// ReportController Interface for customer business logic controller.
type ReportController interface {
	GenerateReport001(ctx context.Context, req *GenerateReport01Request) ([][]string, error)
	GenerateReport002(ctx context.Context, req *GenerateReport02Request) ([][]string, error)
	GenerateReport003(ctx context.Context, req *GenerateReport03Request) ([][]string, error)
	GenerateReport004(ctx context.Context, req *GenerateReport04Request) ([][]string, error)
	GenerateReport005(ctx context.Context, req *GenerateReport05Request) ([][]string, error)
	GenerateReport006(ctx context.Context, req *GenerateReport06Request) ([][]string, error)
	GenerateReport007(ctx context.Context, req *GenerateReport07Request) ([][]string, error)
	GenerateReport008(ctx context.Context, req *GenerateReport08Request) ([][]string, error)
	GenerateReport009(ctx context.Context, req *GenerateReport09Request) ([][]string, error)
	GenerateReport010(ctx context.Context, req *GenerateReport10Request) ([][]string, error)
	GenerateReport011(ctx context.Context, req *GenerateReport11Request) ([][]string, error)
	GenerateReport012(ctx context.Context, req *GenerateReport12Request) ([][]string, error)
	GenerateReport013(ctx context.Context, req *GenerateReport13Request) ([][]string, error)
	GenerateReport015(ctx context.Context, req *GenerateReport15Request) ([][]string, error)
	GenerateReport016(ctx context.Context, req *GenerateReport16Request) ([][]string, error)
	GenerateReport017(ctx context.Context, req *GenerateReport17Request) ([][]string, error)
	GenerateReport019(ctx context.Context, req *GenerateReport19Request) ([][]string, error)
	GenerateReport020(ctx context.Context, req *GenerateReport20Request) ([][]string, error)
	GenerateReport021(ctx context.Context, req *GenerateReport21Request) ([][]string, error)
	GenerateReport022(ctx context.Context, req *GenerateReport22Request) ([][]string, error)
}

type ReportControllerImpl struct {
	Config                  *config.Conf
	Logger                  *slog.Logger
	UUID                    uuid.Provider
	S3                      s3_storage.S3Storager
	Password                password.Provider
	Kmutex                  kmutex.Provider
	TemplatedEmailer        templatedemailer.TemplatedEmailer
	DbClient                *mongo.Client
	AssociateInvoiceBuilder pdfbuilder.AssociateInvoiceBuilder
	CommentStorer           com_s.CommentStorer
	HowHearStorer           hh_s.HowHearAboutUsItemStorer
	TagStorer               t_s.TagStorer
	UserStorer              user_s.UserStorer
	CustomerStorer          c_s.CustomerStorer
	AssociateStorer         a_s.AssociateStorer
	OrderStorer             o_s.OrderStorer
	SkillSetStorer          ss_s.SkillSetStorer
	TaskItemStorer          ti_s.TaskItemStorer
	ServiceFeeStorer        servicefee_s.ServiceFeeStorer
	ActivitySheetStorer     act_s.ActivitySheetStorer
	AttachmentStorer        attachment_s.AttachmentStorer
	StaffStorer             s_s.StaffStorer
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
	ai_builder pdfbuilder.AssociateInvoiceBuilder,
	com_storer com_s.CommentStorer,
	hh_storer hh_s.HowHearAboutUsItemStorer,
	skillset_s ss_s.SkillSetStorer,
	t_storer t_s.TagStorer,
	ti_storer ti_s.TaskItemStorer,
	usr_storer user_s.UserStorer,
	c_storer c_s.CustomerStorer,
	a_storer a_s.AssociateStorer,
	o_storer o_s.OrderStorer,
	servicefee_s servicefee_s.ServiceFeeStorer,
	act_storer act_s.ActivitySheetStorer,
	attch_storer attachment_s.AttachmentStorer,
	staff_storer s_s.StaffStorer,
) ReportController {
	loggerp.Debug("report controller initialization started...")
	s := &ReportControllerImpl{
		Config:                  appCfg,
		Logger:                  loggerp,
		UUID:                    uuidp,
		S3:                      s3,
		Password:                passwordp,
		Kmutex:                  kmux,
		TemplatedEmailer:        temailer,
		AssociateInvoiceBuilder: ai_builder,
		DbClient:                client,
		CommentStorer:           com_storer,
		HowHearStorer:           hh_storer,
		SkillSetStorer:          skillset_s,
		TagStorer:               t_storer,
		TaskItemStorer:          ti_storer,
		UserStorer:              usr_storer,
		CustomerStorer:          c_storer,
		AssociateStorer:         a_storer,
		OrderStorer:             o_storer,
		ServiceFeeStorer:        servicefee_s,
		ActivitySheetStorer:     act_storer,
		AttachmentStorer:        attch_storer,
		StaffStorer:             staff_storer,
	}
	s.Logger.Debug("report controller initialized")
	return s
}
