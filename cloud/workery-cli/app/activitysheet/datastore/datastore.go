package datastore

import (
	"context"
	"log"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	c "github.com/over55/monorepo/cloud/workery-cli/config"
)

const (
	ActivitySheetStatusPending  = 5 // Deprecated.
	ActivitySheetStatusDeclined = 4
	ActivitySheetStatusAccepted = 3
	ActivitySheetStatusError    = 2
	ActivitySheetStatusArchived = 1

	ActivitySheetTypeUnassigned = 1
	ActivitySheetTypeResidentia = 2
	ActivitySheetTypeCommercial = 3
)

type ActivitySheet struct {
	ID                        primitive.ObjectID `bson:"_id" json:"id"`
	OrderID                   primitive.ObjectID `bson:"order_id" json:"order_id"`
	OrderWJID                 uint64             `bson:"order_wjid" json:"order_wjid"` // A.K.A. `Workery Job ID`
	AssociateOrganizationName string             `bson:"associate_organization_name" json:"associate_organization_name"`
	AssociateOrganizationType int8               `bson:"associate_organization_type" json:"associate_organization_type"`
	AssociateID               primitive.ObjectID `bson:"associate_id" json:"associate_id"`
	AssociateName             string             `bson:"associate_name" json:"associate_name"`
	AssociateLexicalName      string             `bson:"associate_lexical_name" json:"associate_lexical_name"`
	Comment                   string             `bson:"comment" json:"comment"`
	CreatedAt                 time.Time          `bson:"created_at" json:"created_at"`
	CreatedByUserID           primitive.ObjectID `bson:"created_by_user_id" json:"created_by_user_id,omitempty"`
	CreatedByUserName         string             `bson:"created_by_user_name" json:"created_by_user_name"`
	CreatedFromIPAddress      string             `bson:"created_from_ip_address" json:"created_from_ip_address"`
	ModifiedAt                time.Time          `bson:"modified_at" json:"modified_at"`
	ModifiedByUserID          primitive.ObjectID `bson:"modified_by_user_id" json:"modified_by_user_id,omitempty"`
	ModifiedByUserName        string             `bson:"modified_by_user_name" json:"modified_by_user_name"`
	ModifiedFromIPAddress     string             `bson:"modified_from_ip_address" json:"modified_from_ip_address"`
	Status                    int8               `bson:"status" json:"status"`
	Type                      int8               `bson:"type_of" json:"type_of"`
	TenantID                  primitive.ObjectID `bson:"tenant_id" json:"tenant_id,omitempty"`
	OrderTenantIDWithWJID     string             `bson:"order_tenant_id_with_wjid" json:"order_tenant_id_with_wjid"` // TenantIDWithWJID is a combination of `tenancy_id` and `wjid` values written in the following structure `%v_%v`.
	PublicID                  uint64             `bson:"public_id" json:"public_id"`
	// OngoingOrderID        primitive.ObjectID `bson:"ongoing_order_id" json:"ongoing_order_id"`
}

type ActivitySheetListFilter struct {
	// Pagination related.
	Cursor    primitive.ObjectID
	PageSize  int64
	SortField string
	SortOrder int8 // 1=ascending | -1=descending

	// Filter related.
	TenantID        primitive.ObjectID
	AssociateID     primitive.ObjectID
	OrderID         primitive.ObjectID
	OrderWJID       uint64 // A.K.A. `Workery Job ID`
	Status          int8
	ExcludeArchived bool
	SearchText      string
}

type ActivitySheetListResult struct {
	Results     []*ActivitySheet   `json:"results"`
	NextCursor  primitive.ObjectID `json:"next_cursor"`
	HasNextPage bool               `json:"has_next_page"`
}

type ActivitySheetAsSelectOption struct {
	Value primitive.ObjectID `bson:"_id" json:"value"` // Extract from the database `_id` field and output through API as `value`.
	Label string             `bson:"name" json:"label"`
}

// ActivitySheetStorer Interface for user.
type ActivitySheetStorer interface {
	Create(ctx context.Context, m *ActivitySheet) error
	GetByID(ctx context.Context, id primitive.ObjectID) (*ActivitySheet, error)
	GetByPublicID(ctx context.Context, oldID uint64) (*ActivitySheet, error)
	GetByEmail(ctx context.Context, email string) (*ActivitySheet, error)
	GetByVerificationCode(ctx context.Context, verificationCode string) (*ActivitySheet, error)
	GetLatestByTenantID(ctx context.Context, tenantID primitive.ObjectID) (*ActivitySheet, error)
	CheckIfExistsByEmail(ctx context.Context, email string) (bool, error)
	UpdateByID(ctx context.Context, m *ActivitySheet) error
	ListByFilter(ctx context.Context, f *ActivitySheetPaginationListFilter) (*ActivitySheetPaginationListResult, error)
	LiteListByFilter(ctx context.Context, f *ActivitySheetPaginationListFilter) (*ActivitySheetPaginationLiteListResult, error)
	ListAsSelectOptionByFilter(ctx context.Context, f *ActivitySheetPaginationListFilter) ([]*ActivitySheetAsSelectOption, error)
	ListByOrderID(ctx context.Context, orderID primitive.ObjectID) (*ActivitySheetPaginationListResult, error)
	ListByOrderWJID(ctx context.Context, orderWJID uint64) (*ActivitySheetPaginationListResult, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
	PermanentlyDeleteAllByAssociateID(ctx context.Context, associateID primitive.ObjectID) error
	CountByFilter(ctx context.Context, f *ActivitySheetPaginationListFilter) (int64, error)
	CountByLast30DaysForAssociateID(ctx context.Context, associateID primitive.ObjectID) (int64, error)
}

type ActivitySheetStorerImpl struct {
	Logger     *slog.Logger
	DbClient   *mongo.Client
	Collection *mongo.Collection
}

func NewDatastore(appCfg *c.Conf, loggerp *slog.Logger, client *mongo.Client) ActivitySheetStorer {
	// ctx := context.Background()
	uc := client.Database(appCfg.DB.Name).Collection("activity_sheets")

	_, err := uc.Indexes().CreateMany(context.TODO(), []mongo.IndexModel{
		{Keys: bson.D{{Key: "tenant_id", Value: 1}}},
		{Keys: bson.D{{Key: "public_id", Value: -1}}},
		{Keys: bson.D{{Key: "status", Value: 1}}},
		{Keys: bson.D{{Key: "type", Value: 1}}},
		{Keys: bson.D{
			{"comment", "text"},
			{"associate_name", "text"},
		}},
	})
	if err != nil {
		// It is important that we crash the app on startup to meet the
		// requirements of `google/wire` framework.
		log.Fatal(err)
	}

	s := &ActivitySheetStorerImpl{
		Logger:     loggerp,
		DbClient:   client,
		Collection: uc,
	}
	return s
}
