package datastore

import (
	"context"
	"log"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	c "github.com/over55/monorepo/cloud/workery-cli/config"
)

const (
	StatusActive   = 1
	StatusArchived = 2
)

type NationalOccupationalClassification struct {
	ID                       primitive.ObjectID                           `bson:"_id" json:"id"`
	TenantID                 primitive.ObjectID                           `bson:"tenant_id" json:"tenant_id,omitempty"`
	Status                   int8                                         `bson:"status" json:"status"`
	PublicID                 uint64                                       `bson:"public_id" json:"public_id"`
	LanguageCode             string                                       `bson:"language_code" json:"language_code"` // Please use `ISO 639-1` (https://en.wikipedia.org/wiki/ISO_639-1).
	Version                  string                                       `bson:"version" json:"version"`             // Ex: "NOC 2021 V1.0"
	Level                    uint8                                        `bson:"level" json:"level"`                 // Ex: 1
	Code                     uint                                         `bson:"code" json:"code"`                   // Ex: 1
	CodeStr                  string                                       `bson:"code_str" json:"code_str"`           // Ex: 00001
	BroadCategoryCode        uint                                         `bson:"broad_category_code" json:"broad_category_code"`
	BroadCategoryCodeStr     string                                       `bson:"broad_category_code_str" json:"broad_category_code_str"`
	BroadCategoryTitle       string                                       `bson:"broad_category_title" json:"broad_category_title"`
	BroadCategoryDescription string                                       `bson:"broad_category_description" json:"broad_category_description"`
	MajorGroupCode           uint                                         `bson:"major_group_code" json:"major_group_code"`
	MajorGroupCodeStr        string                                       `bson:"major_group_code_str" json:"major_group_code_str"`
	MajorGroupTitle          string                                       `bson:"major_group_title" json:"major_group_title"`
	MajorGroupDescription    string                                       `bson:"major_group_description" json:"major_group_description"`
	SubMinorGroupCode        uint                                         `bson:"sub_minor_group_code" json:"sub_minor_group_code"`
	SubMinorGroupCodeStr     string                                       `bson:"sub_minor_group_code_str" json:"sub_minor_group_code_str"`
	SubMinorGroupTitle       string                                       `bson:"sub_minor_group_title" json:"sub_minor_group_title"`
	SubMinorGroupDescription string                                       `bson:"sub_minor_group_description" json:"sub_minor_group_description"`
	MinorGroupCode           uint                                         `bson:"minor_group_code" json:"minor_group_code"`
	MinorGroupCodeStr        string                                       `bson:"minor_group_code_str" json:"minor_group_code_str"`
	MinorGroupTitle          string                                       `bson:"minor_group_title" json:"minor_group_title"`
	MinorGroupDescription    string                                       `bson:"minor_group_description" json:"minor_group_description"`
	UnitGroupCode            uint                                         `bson:"unit_group_code" json:"unit_group_code"`
	UnitGroupCodeStr         string                                       `bson:"unit_group_code_str" json:"unit_group_code_str"`
	UnitGroupTitle           string                                       `bson:"unit_group_title" json:"unit_group_title"`
	UnitGroupDescription     string                                       `bson:"unit_group_description" json:"unit_group_description"`
	Elements                 []*NationalOccupationalClassificationElement `bson:"elements" json:"elements"`
}

type NationalOccupationalClassificationElement struct {
	Type        string `bson:"type" json:"type"`
	Description string `bson:"description" json:"description"`
}

// type NationalOccupationalClassificationListFilter struct {
// 	// Pagination related.
// 	Cursor    primitive.ObjectID
// 	PageSize  int64
// 	SortField string
// 	SortOrder int8 // 1=ascending | -1=descending
//
// 	// Filter related.
// 	TenantID   primitive.ObjectID
// 	Status     int8
// 	SearchText string
// }
//
// type NationalOccupationalClassificationListResult struct {
// 	Results     []*NationalOccupationalClassification `json:"results"`
// 	NextCursor  primitive.ObjectID                    `json:"next_cursor"`
// 	HasNextPage bool                                  `json:"has_next_page"`
// }
//
// type NationalOccupationalClassificationAsSelectOption struct {
// 	Value primitive.ObjectID `bson:"_id" json:"value"` // Extract from the database `_id` field and output through API as `value`.
// 	Label string             `bson:"name" json:"label"`
// }

// NationalOccupationalClassificationStorer Interface for user.
type NationalOccupationalClassificationStorer interface {
	Create(ctx context.Context, m *NationalOccupationalClassification) error
	GetByID(ctx context.Context, id primitive.ObjectID) (*NationalOccupationalClassification, error)
	GetByPublicID(ctx context.Context, oldID uint64) (*NationalOccupationalClassification, error)
	GetLatestByTenantID(ctx context.Context, tenantID primitive.ObjectID) (*NationalOccupationalClassification, error)
	GetByCode(ctx context.Context, code uint) (*NationalOccupationalClassification, error)
	// CheckIfExistsByEmail(ctx context.Context, email string) (bool, error)
	UpdateByID(ctx context.Context, m *NationalOccupationalClassification) error
	// ListByFilter(ctx context.Context, f *NationalOccupationalClassificationPaginationListFilter) (*NationalOccupationalClassificationPaginationListResult, error)
	// ListAsSelectOptionByFilter(ctx context.Context, f *NationalOccupationalClassificationPaginationListFilter) ([]*NationalOccupationalClassificationAsSelectOption, error)
	// DeleteByID(ctx context.Context, id primitive.ObjectID) error
}

type NationalOccupationalClassificationStorerImpl struct {
	Logger     *slog.Logger
	DbClient   *mongo.Client
	Collection *mongo.Collection
}

func NewDatastore(appCfg *c.Conf, loggerp *slog.Logger, client *mongo.Client) NationalOccupationalClassificationStorer {
	// ctx := context.Background()
	uc := client.Database(appCfg.DB.Name).Collection("nocs")

	_, err := uc.Indexes().CreateMany(context.TODO(), []mongo.IndexModel{
		{Keys: bson.D{{Key: "tenant_id", Value: 1}}},
		{Keys: bson.D{{Key: "public_id", Value: -1}}},
		{Keys: bson.D{{Key: "status", Value: 1}}},
		{Keys: bson.D{
			{"broad_category_title", "text"},
			{"major_group_title", "text"},
			{"sub_minor_group_title", "text"},
			{"minor_group_title", "text"},
			{"unit_group_title", "text"},
		}},
	})
	if err != nil {
		// It is important that we crash the app on startup to meet the
		// requirements of `google/wire` framework.
		log.Fatal(err)
	}

	s := &NationalOccupationalClassificationStorerImpl{
		Logger:     loggerp,
		DbClient:   client,
		Collection: uc,
	}
	return s
}
