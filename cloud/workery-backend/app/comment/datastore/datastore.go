package datastore

import (
	"context"
	"log"
	"time"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	c "github.com/over55/monorepo/cloud/workery-backend/config"
)

const (
	CommentStatusActive   = 1
	CommentStatusArchived = 2
	BelongsToCustomer     = 1
	BelongsToAssociate    = 2
	BelongsToOrder        = 3
	BelongsToStaff        = 4
)

type Comment struct {
	ID                    primitive.ObjectID `bson:"_id" json:"id"`
	BelongsTo             int8               `bson:"belongs_to" json:"belongs_to"`
	CustomerID            primitive.ObjectID `bson:"customer_id" json:"customer_id,omitempty"`
	CustomerName          string             `bson:"customer_name" json:"customer_name"`
	AssociateID           primitive.ObjectID `bson:"associate_id" json:"associate_id,omitempty"`
	AssociateName         string             `bson:"associate_name" json:"associate_name"`
	OrderID               primitive.ObjectID `bson:"order_id" json:"order_id,omitempty"`
	OrderWJID             uint64             `bson:"order_wjid" json:"order_wjid"`
	OrderTenantIDWithWJID string             `bson:"order_tenant_id_with_wjid" json:"order_tenant_id_with_wjid"` // OrderTenantIDWithWJID is a combination of `tenancy_id` and `wjid` values written in the following structure `%v_%v`.
	OrderIncidentID       primitive.ObjectID `bson:"order_incident_id" json:"order_incident_id,omitempty"`
	OrderIncidentPublicID uint64             `bson:"order_incident_public_id" json:"order_incident_public_id"`
	StaffID               primitive.ObjectID `bson:"staff_id" json:"staff_id,omitempty"`
	StaffName             string             `bson:"staff_name" json:"staff_name"`
	TenantID              primitive.ObjectID `bson:"tenant_id" json:"tenant_id,omitempty"`
	CreatedAt             time.Time          `bson:"created_at" json:"created_at"`
	CreatedByUserID       primitive.ObjectID `bson:"created_by_user_id" json:"created_by_user_id,omitempty"`
	CreatedByUserName     string             `bson:"created_by_user_name" json:"created_by_user_name"`
	CreatedFromIPAddress  string             `bson:"created_from_ip_address" json:"created_from_ip_address"`
	ModifiedAt            time.Time          `bson:"modified_at" json:"modified_at"`
	ModifiedByUserID      primitive.ObjectID `bson:"modified_by_user_id" json:"modified_by_user_id,omitempty"`
	ModifiedByUserName    string             `bson:"modified_by_user_name" json:"modified_by_user_name"`
	ModifiedFromIPAddress string             `bson:"modified_from_ip_address" json:"modified_from_ip_address"`
	Content               string             `bson:"content" json:"content"`
	Status                int8               `bson:"status" json:"status"`
	PublicID              uint64             `bson:"public_id" json:"public_id"`
}

type CommentAsSelectOption struct {
	Value primitive.ObjectID `bson:"_id" json:"value"` // Extract from the database `_id` field and output through API as `value`.
	Label string             `bson:"name" json:"label"`
}

// CommentStorer Interface for user.
type CommentStorer interface {
	Create(ctx context.Context, m *Comment) error
	GetByID(ctx context.Context, id primitive.ObjectID) (*Comment, error)
	GetByPublicID(ctx context.Context, oldID uint64) (*Comment, error)
	GetByEmail(ctx context.Context, email string) (*Comment, error)
	GetByVerificationCode(ctx context.Context, verificationCode string) (*Comment, error)
	GetLatestByTenantID(ctx context.Context, tenantID primitive.ObjectID) (*Comment, error)
	CheckIfExistsByEmail(ctx context.Context, email string) (bool, error)
	UpdateByID(ctx context.Context, m *Comment) error
	ListByFilter(ctx context.Context, f *CommentPaginationListFilter) (*CommentPaginationListResult, error)
	ListByOrderID(ctx context.Context, orderID primitive.ObjectID) (*CommentPaginationListResult, error)
	ListByOrderWJID(ctx context.Context, orderWJID uint64) (*CommentPaginationListResult, error)
	ListAsSelectOptionByFilter(ctx context.Context, f *CommentPaginationListFilter) ([]*CommentAsSelectOption, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
	PermanentlyDeleteAllByCustomerID(ctx context.Context, customerID primitive.ObjectID) error
	PermanentlyDeleteAllByAssociateID(ctx context.Context, associateID primitive.ObjectID) error
	PermanentlyDeleteAllByStaffID(ctx context.Context, staffID primitive.ObjectID) error
	PermanentlyDeleteAllByOrderID(ctx context.Context, orderID primitive.ObjectID) error
}

type CommentStorerImpl struct {
	Logger     *slog.Logger
	DbClient   *mongo.Client
	Collection *mongo.Collection
}

func NewDatastore(appCfg *c.Conf, loggerp *slog.Logger, client *mongo.Client) CommentStorer {
	// ctx := context.Background()
	uc := client.Database(appCfg.DB.Name).Collection("comments")

	_, err := uc.Indexes().CreateMany(context.TODO(), []mongo.IndexModel{
		{Keys: bson.D{{Key: "tenant_id", Value: 1}}},
		{Keys: bson.D{{Key: "public_id", Value: -1}}},
		{Keys: bson.D{{Key: "status", Value: 1}}},
		{Keys: bson.D{
			{"text", "text"},
		}},
	})
	if err != nil {
		// It is important that we crash the app on startup to meet the
		// requirements of `google/wire` framework.
		log.Fatal(err)
	}

	s := &CommentStorerImpl{
		Logger:     loggerp,
		DbClient:   client,
		Collection: uc,
	}
	return s
}
