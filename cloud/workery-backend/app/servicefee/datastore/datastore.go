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
	StatusActive   = 1
	StatusArchived = 2
)

type ServiceFee struct {
	ID                    primitive.ObjectID `bson:"_id" json:"id"`
	TenantID              primitive.ObjectID `bson:"tenant_id" json:"tenant_id,omitempty"`
	Name                  string             `bson:"name" json:"name"`
	Description           string             `bson:"description" json:"description"`
	Percentage            float64            `bson:"percentage" json:"percentage"`
	Status                int8               `bson:"status" json:"status"`
	PublicID              uint64             `bson:"public_id" json:"public_id"`
	CreatedAt             time.Time          `bson:"created_at" json:"created_at"`
	CreatedByUserID       primitive.ObjectID `bson:"created_by_user_id" json:"created_by_user_id,omitempty"`
	CreatedByUserName     string             `bson:"created_by_user_name" json:"created_by_user_name"`
	CreatedFromIPAddress  string             `bson:"created_from_ip_address" json:"created_from_ip_address"`
	ModifiedAt            time.Time          `bson:"modified_at" json:"modified_at"`
	ModifiedByUserID      primitive.ObjectID `bson:"modified_by_user_id" json:"modified_by_user_id,omitempty"`
	ModifiedByUserName    string             `bson:"modified_by_user_name" json:"modified_by_user_name"`
	ModifiedFromIPAddress string             `bson:"modified_from_ip_address" json:"modified_from_ip_address"`
}

type ServiceFeeListFilter struct {
	// Pagination related.
	Cursor    primitive.ObjectID
	PageSize  int64
	SortField string
	SortOrder int8 // 1=ascending | -1=descending

	// Filter related.
	TenantID   primitive.ObjectID
	Status     int8
	SearchName string
}

type ServiceFeeListResult struct {
	Results     []*ServiceFee      `json:"results"`
	NextCursor  primitive.ObjectID `json:"next_cursor"`
	HasNextPage bool               `json:"has_next_page"`
}

type ServiceFeeAsSelectOption struct {
	Value primitive.ObjectID `bson:"_id" json:"value"` // Extract from the database `_id` field and output through API as `value`.
	Label string             `bson:"name" json:"label"`
}

// ServiceFeeStorer Interface for user.
type ServiceFeeStorer interface {
	Create(ctx context.Context, m *ServiceFee) error
	GetByID(ctx context.Context, id primitive.ObjectID) (*ServiceFee, error)
	GetByPublicID(ctx context.Context, oldID uint64) (*ServiceFee, error)
	GetByEmail(ctx context.Context, email string) (*ServiceFee, error)
	GetByVerificationCode(ctx context.Context, verificationCode string) (*ServiceFee, error)
	GetLatestByTenantID(ctx context.Context, tenantID primitive.ObjectID) (*ServiceFee, error)
	CheckIfExistsByEmail(ctx context.Context, email string) (bool, error)
	UpdateByID(ctx context.Context, m *ServiceFee) error
	ListByFilter(ctx context.Context, f *ServiceFeePaginationListFilter) (*ServiceFeePaginationListResult, error)
	ListAsSelectOptionByFilter(ctx context.Context, f *ServiceFeePaginationListFilter) ([]*ServiceFeeAsSelectOption, error)
	CountByFilter(ctx context.Context, f *ServiceFeePaginationListFilter) (int64, error)
	ListAndCountByFilter(ctx context.Context, f *ServiceFeePaginationListFilter) (*ServiceFeePaginationListAndCountResult, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
}

type ServiceFeeStorerImpl struct {
	Logger     *slog.Logger
	DbClient   *mongo.Client
	Collection *mongo.Collection
}

func NewDatastore(appCfg *c.Conf, loggerp *slog.Logger, client *mongo.Client) ServiceFeeStorer {
	// ctx := context.Background()
	uc := client.Database(appCfg.DB.Name).Collection("service_fees")

	_, err := uc.Indexes().CreateMany(context.TODO(), []mongo.IndexModel{
		{Keys: bson.D{{Key: "tenant_id", Value: 1}}},
		{Keys: bson.D{{Key: "public_id", Value: -1}}},
		{Keys: bson.D{{Key: "status", Value: 1}}},
		{Keys: bson.D{
			{"name", "text"},
			{"description", "text"},
		}},
	})
	if err != nil {
		// It is important that we crash the app on startup to meet the
		// requirements of `google/wire` framework.
		log.Fatal(err)
	}

	s := &ServiceFeeStorerImpl{
		Logger:     loggerp,
		DbClient:   client,
		Collection: uc,
	}
	return s
}
