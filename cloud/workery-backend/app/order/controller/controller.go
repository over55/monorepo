package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
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
	t_s "github.com/over55/monorepo/cloud/workery-backend/app/tag/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	ten_s "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// OrderController Interface for customer business logic controller.
type OrderController interface {
	Create(ctx context.Context, req *OrderCreateRequestIDO) (*o_s.Order, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*o_s.Order, error)
	GetByWJID(ctx context.Context, wjid uint64) (*o_s.Order, error)
	UpdateByWJID(ctx context.Context, req *OrderUpdateRequestIDO) (*o_s.Order, error)
	UpdateFinancialByWJID(ctx context.Context, req *OrderFinancialUpdateRequestIDO) (*o_s.Order, error)
	// UpdateByID(ctx context.Context, req *OrderUpdateRequestIDO) (*o_s.Order, error)
	// ListByFilter(ctx context.Context, f *o_s.OrderListFilter) (*o_s.OrderListResult, error)
	LiteListAndCountByFilter(ctx context.Context, f *o_s.OrderPaginationListFilter) (*o_s.OrderPaginationLiteListAndCountResult, error)
	// ArchiveByID(ctx context.Context, id primitive.ObjectID) (*user_s.User, error)
	DeleteByWJID(ctx context.Context, orderWJID uint64) error
	CreateComment(ctx context.Context, req *OrderOperationCreateCommentRequest) (*o_s.Order, error)
	Close(ctx context.Context, req *OrderOperationCloseRequest) (*o_s.Order, error)
	Postpone(ctx context.Context, req *OrderOperationPostponeRequest) (*o_s.Order, error)
	Unassign(ctx context.Context, req *OrderOperationUnassignRequest) (*o_s.Order, error)
	Transfer(ctx context.Context, req *OrderOperationTransferRequest) (*o_s.Order, error)
	GenerateInvoice(ctx context.Context, req *OrderOperationGenerateInvoiceRequest) (*o_s.Order, error)
	Clone(ctx context.Context, req *OrderOperationCloneRequest) (*o_s.Order, error)
}

type OrderControllerImpl struct {
	Config                  *config.Conf
	Logger                  *slog.Logger
	UUID                    uuid.Provider
	S3                      s3_storage.S3Storager
	Password                password.Provider
	Kmutex                  kmutex.Provider
	TemplatedEmailer        templatedemailer.TemplatedEmailer
	DbClient                *mongo.Client
	TenantStorer            ten_s.TenantStorer
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
	org_storer ten_s.TenantStorer,
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
) OrderController {
	loggerp.Debug("customer controller initialization started...")
	s := &OrderControllerImpl{
		Config:                  appCfg,
		Logger:                  loggerp,
		UUID:                    uuidp,
		S3:                      s3,
		Password:                passwordp,
		Kmutex:                  kmux,
		TemplatedEmailer:        temailer,
		AssociateInvoiceBuilder: ai_builder,
		DbClient:                client,
		TenantStorer:            org_storer,
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
	}
	s.Logger.Debug("customer controller initialized")

	// // The following code is only used for development purposes or testing
	// // purposes and will remain commented out unless being used.
	// fakeID, _ := primitive.ObjectIDFromHex("656abe580c6e6093e129b92f")
	// var fakeWJID uint64 = 1234567890
	// dto := &pdfbuilder.AssociateInvoiceBuilderRequestDTO{
	// 	ID:                       fakeID,
	// 	TenantID:                 primitive.NewObjectID(),
	// 	OrderID:                  primitive.NewObjectID(),
	// 	OrderWJID:                fakeWJID,
	// 	InvoiceID:                "1001",
	// 	InvoiceDate:              time.Now(),
	// 	AssociateName:            "Frank Herbert",
	// 	AssociatePhone:           "(123) 456-7890",
	// 	ClientName:               "John Smith",
	// 	ClientPhone:              "(123) 456-7890",
	// 	ClientEmail:              "fherbert@fake-email.com",
	// 	Line01Qty:                1,
	// 	Line01Desc:               "This is a test comment for the unit of work.",
	// 	Line01Price:              float64(50),
	// 	Line01Amount:             float64(100),
	// 	Line02Qty:                12,
	// 	Line02Desc:               "xxxx xxx xxx",
	// 	Line02Price:              float64(100),
	// 	Line02Amount:             float64(100),
	// 	Line03Qty:                123,
	// 	Line03Desc:               "xxxx xxx xxx xxxxxx xxxxx",
	// 	Line03Price:              float64(1),
	// 	Line03Amount:             float64(123),
	// 	Line04Qty:                1234,
	// 	Line04Desc:               "xxxx xxx xxx xxxxxx xxxxx xxx xxx",
	// 	Line04Price:              float64(1),
	// 	Line04Amount:             float64(1234),
	// 	Line05Qty:                12345,
	// 	Line05Desc:               "xxxx xxx xxx xxxxxx xxxxx xxx xxx xxx",
	// 	Line05Price:              float64(1),
	// 	Line05Amount:             float64(12345),
	// 	Line06Qty:                123456,
	// 	Line06Desc:               "xxxx xxx xxx xxxxxx xxxxx xxx xxx xxx xxxx",
	// 	Line06Price:              float64(1),
	// 	Line06Amount:             float64(123456),
	// 	Line07Qty:                123456,
	// 	Line07Desc:               "xxxx xxx xxx xxxxxx xxxxx xxx xxx xxx xxxx",
	// 	Line07Price:              float64(1),
	// 	Line07Amount:             float64(123456),
	// 	Line08Qty:                123456,
	// 	Line08Desc:               "xxxx xxx xxx xxxxxx xxxxx xxx xxx xxx xxxx",
	// 	Line08Price:              float64(1),
	// 	Line08Amount:             float64(123456),
	// 	Line09Qty:                123456,
	// 	Line09Desc:               "xxxx xxx xxx xxxxxx xxxxx xxx xxx xxx xxxx",
	// 	Line09Price:              float64(1),
	// 	Line09Amount:             float64(123456),
	// 	Line10Qty:                12345,
	// 	Line10Desc:               "xxxx xxx xxx xxxxxx xxxxx xxx xxx xxx xxxx",
	// 	Line10Price:              float64(1),
	// 	Line10Amount:             float64(12345),
	// 	Line11Qty:                1234,
	// 	Line11Desc:               "xxxx xxx xxx xxxxxx xxxxx xxx xxx xxx xxxx",
	// 	Line11Price:              float64(1),
	// 	Line11Amount:             float64(1234),
	// 	Line12Qty:                123,
	// 	Line12Desc:               "xxxx xxx xxx xxxxxx xxxxx xxx xxx xxx xxxx",
	// 	Line12Price:              float64(1),
	// 	Line12Amount:             float64(123),
	// 	Line13Qty:                12,
	// 	Line13Desc:               "xxxx xxx xxx xxxxxx xxxxx xxx xxx xxx xxxx",
	// 	Line13Price:              float64(1),
	// 	Line13Amount:             float64(12),
	// 	Line14Qty:                1,
	// 	Line14Desc:               "xxxx xxx xxx xxxxxx xxxxx xxx xxx xxx xxxx",
	// 	Line14Price:              float64(1),
	// 	Line14Amount:             float64(1),
	// 	Line15Qty:                1,
	// 	Line15Desc:               "xxxx xxx xxx xxxxxx xxxxx xxx xxx xxx xxxx",
	// 	Line15Price:              float64(1),
	// 	Line15Amount:             float64(1),
	// 	InvoiceQuoteDays:         10,
	// 	InvoiceAssociateTax:      "HST 1000001",
	// 	InvoiceQuoteDate:         time.Now(),
	// 	InvoiceCustomersApproval: "Signature",
	// 	TotalLabour:              float64(200),
	// 	TotalMaterials:           float64(0),
	// 	OtherCosts:               float64(0),
	// 	SubTotal:                 float64(333333),
	// 	Tax:                      float64(30),
	// 	Total:                    float64(230),
	// 	Line01Notes:              "Excellent job!",
	// 	Line02Notes:              "Nothing extra to add.",
	// 	Deposit:                  float64(11111),
	// 	PaymentAmount:            float64(230),
	// 	DateClientPaidInvoice:    time.Now(),
	// 	PaymentMethods:           []int8{2, 3, 4},
	// 	ClientSignature:          "J.S.",
	// 	AssociateSignDate:        time.Now(),
	// 	AssociateSignature:       "F.H.",
	// 	ClientAddress:            "1000-101 Some Fake Street Address, Arakis, Dune",
	// 	Version:                  1,
	// 	AmountDue:                float64(22222),
	// }
	// if _, err := ai_builder.GeneratePDF(dto); err != nil {
	// 	loggerp.Error("associate invoice generation error", slog.Any("error", err))
	// 	log.Fatal(err)
	// }

	return s
}
