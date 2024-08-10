package datastore

import (
	"context"
	"log"
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

type NorthAmericanIndustryClassificationSystem struct {
	ID                          primitive.ObjectID                                  `bson:"_id" json:"id"`
	TenantID                    primitive.ObjectID                                  `bson:"tenant_id" json:"tenant_id,omitempty"`
	Status                      int8                                                `bson:"status" json:"status"`
	PublicID                    uint64                                              `bson:"public_id" json:"public_id"`
	LanguageCode                string                                              `bson:"language_code" json:"language_code"` // Please use `ISO 639-1` (https://en.wikipedia.org/wiki/ISO_639-1).
	Version                     string                                              `bson:"version" json:"version"`             // Ex: "NOC 2021 V1.0"
	Level                       uint8                                               `bson:"level" json:"level"`                 // Ex: 1
	Code                        uint                                                `bson:"code" json:"code"`                   // Ex: 1
	CodeStr                     string                                              `bson:"code_str" json:"code_str"`           // Ex: 00001
	SectorCode                  uint                                                `bson:"sector_code" json:"sector_code"`
	SectorCodeStr               string                                              `bson:"sector_code_str" json:"sector_code_str"`
	SectorTitle                 string                                              `bson:"sector_title" json:"sector_title"`
	SectorDescription           string                                              `bson:"sector_description" json:"sector_description"`
	SubsectorCode               uint                                                `bson:"subsector_code" json:"subsector_code"`
	SubsectorCodeStr            string                                              `bson:"subsector_code_str" json:"subsector_code_str"`
	SubsectorTitle              string                                              `bson:"subsector_title" json:"subsector_title"`
	SubsectorDescription        string                                              `bson:"subsector_description" json:"subsector_description"`
	IndustryGroupCode           uint                                                `bson:"industry_group_code" json:"industry_group_code"`
	IndustryGroupCodeStr        string                                              `bson:"industry_group_code_str" json:"industry_group_code_str"`
	IndustryGroupTitle          string                                              `bson:"industry_group_title" json:"industry_group_title"`
	IndustryGroupDescription    string                                              `bson:"industry_group_description" json:"industry_group_description"`
	IndustryCode                uint                                                `bson:"industry_code" json:"industry_code"`
	IndustryCodeStr             string                                              `bson:"industry_code_str" json:"industry_code_str"`
	IndustryTitle               string                                              `bson:"industry_title" json:"industry_title"`
	IndustryDescription         string                                              `bson:"industry_description" json:"industry_description"`
	CanadianIndustryCode        uint                                                `bson:"canadian_industry_code" json:"canadian_industry_code"`
	CanadianIndustryCodeStr     string                                              `bson:"canadian_industry_code_str" json:"canadian_industry_code_str"`
	CanadianIndustryTitle       string                                              `bson:"canadian_industry_title" json:"canadian_industry_title"`
	CanadianIndustryDescription string                                              `bson:"canadian_industry_description" json:"canadian_industry_description"`
	Superscript                 string                                              `bson:"superscript" json:"superscript"`
	Elements                    []*NorthAmericanIndustryClassificationSystemElement `bson:"elements" json:"elements"`
}

type NorthAmericanIndustryClassificationSystemElement struct {
	Type        string `bson:"type" json:"type"`
	Description string `bson:"description" json:"description"`
}

type NorthAmericanIndustryClassificationSystemListFilter struct {
	// Pagination related.
	Cursor    primitive.ObjectID
	PageSize  int64
	SortField string
	SortOrder int8 // 1=ascending | -1=descending

	// Filter related.
	TenantID   primitive.ObjectID
	Status     int8
	SearchText string
}

type NorthAmericanIndustryClassificationSystemListResult struct {
	Results     []*NorthAmericanIndustryClassificationSystem `json:"results"`
	NextCursor  primitive.ObjectID                           `json:"next_cursor"`
	HasNextPage bool                                         `json:"has_next_page"`
}

type NorthAmericanIndustryClassificationSystemAsSelectOption struct {
	Value primitive.ObjectID `bson:"_id" json:"value"` // Extract from the database `_id` field and output through API as `value`.
	Label string             `bson:"industry_title" json:"label"`
}

// NorthAmericanIndustryClassificationSystemStorer Interface for user.
type NorthAmericanIndustryClassificationSystemStorer interface {
	Create(ctx context.Context, m *NorthAmericanIndustryClassificationSystem) error
	GetByID(ctx context.Context, id primitive.ObjectID) (*NorthAmericanIndustryClassificationSystem, error)
	GetByPublicID(ctx context.Context, oldID uint64) (*NorthAmericanIndustryClassificationSystem, error)
	GetLatestByTenantID(ctx context.Context, tenantID primitive.ObjectID) (*NorthAmericanIndustryClassificationSystem, error)
	GetByCode(ctx context.Context, code uint) (*NorthAmericanIndustryClassificationSystem, error)
	// GetByEmail(ctx context.Context, email string) (*NorthAmericanIndustryClassificationSystem, error)
	// GetByVerificationCode(ctx context.Context, verificationCode string) (*NorthAmericanIndustryClassificationSystem, error)
	// GetLatestByTenantID(ctx context.Context, tenantID primitive.ObjectID) (*NorthAmericanIndustryClassificationSystem, error)
	// CheckIfExistsByEmail(ctx context.Context, email string) (bool, error)
	UpdateByID(ctx context.Context, m *NorthAmericanIndustryClassificationSystem) error
	ListByFilter(ctx context.Context, f *NorthAmericanIndustryClassificationSystemPaginationListFilter) (*NorthAmericanIndustryClassificationSystemPaginationListResult, error)
	ListAndCountByFilter(ctx context.Context, f *NorthAmericanIndustryClassificationSystemPaginationListFilter) (*NorthAmericanIndustryClassificationSystemPaginationListAndCountResult, error)
	ListAsSelectOptionByFilter(ctx context.Context, f *NorthAmericanIndustryClassificationSystemPaginationListFilter) ([]*NorthAmericanIndustryClassificationSystemAsSelectOption, error)
	// DeleteByID(ctx context.Context, id primitive.ObjectID) error
}

type NorthAmericanIndustryClassificationSystemStorerImpl struct {
	Logger     *slog.Logger
	DbClient   *mongo.Client
	Collection *mongo.Collection
}

func NewDatastore(appCfg *c.Conf, loggerp *slog.Logger, client *mongo.Client) NorthAmericanIndustryClassificationSystemStorer {
	// ctx := context.Background()
	uc := client.Database(appCfg.DB.Name).Collection("naics")

	// // For debugging purposes only or if you are going to recreate new indexes.
	// if _, err := uc.Indexes().DropAll(context.TODO()); err != nil {
	// 	loggerp.Error("failed deleting all indexes",
	// 		slog.Any("err", err))
	//
	// 	// It is important that we crash the app on startup to meet the
	// 	// requirements of `google/wire` framework.
	// 	log.Fatal(err)
	// }

	_, err := uc.Indexes().CreateMany(context.TODO(), []mongo.IndexModel{
		{Keys: bson.D{{Key: "tenant_id", Value: 1}}},
		{Keys: bson.D{{Key: "public_id", Value: -1}}},
		{Keys: bson.D{{Key: "status", Value: 1}}},
		{Keys: bson.D{
			{Key: "sector_code_str", Value: "text"},
			{Key: "sector_title", Value: "text"},
			{Key: "sector_description", Value: "text"},
			{Key: "subsector_code_str", Value: "text"},
			{Key: "subsector_title", Value: "text"},
			{Key: "subsector_description", Value: "text"},
			{Key: "industry_group_code_str", Value: "text"},
			{Key: "industry_group_title", Value: "text"},
			{Key: "industry_group_description", Value: "text"},
			{Key: "industry_code_str", Value: "text"},
			{Key: "industry_title", Value: "text"},
			{Key: "industry_description", Value: "text"},
			{Key: "canadian_industry_code_str", Value: "text"},
			{Key: "canadian_industry_title", Value: "text"},
			{Key: "canadian_industry_description", Value: "text"},
			{Key: "elements", Value: "text"},
		}},
	})
	if err != nil {
		// It is important that we crash the app on startup to meet the
		// requirements of `google/wire` framework.
		log.Fatal(err)
	}

	s := &NorthAmericanIndustryClassificationSystemStorerImpl{
		Logger:     loggerp,
		DbClient:   client,
		Collection: uc,
	}
	return s
}
