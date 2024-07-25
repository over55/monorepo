package datastore

import (
	"context"
	"log"
	"log/slog"
	"sort"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	c "github.com/over55/monorepo/cloud/workery-backend/config"
)

const (
	OrderIncidentStatusActive   = 1
	OrderIncidentStatusArchived = 2
	InitiatorClient             = 1
	InitiatorAssociate          = 2
	InitiatorStaff              = 3
)

type OrderIncident struct {
	ID                                   primitive.ObjectID `bson:"_id" json:"id"`
	TenantID                             primitive.ObjectID `bson:"tenant_id" json:"tenant_id,omitempty"`
	Title                                string             `bson:"title" json:"title"`
	Description                          string             `bson:"description" json:"description"`
	Status                               int8               `bson:"status" json:"status"`
	PublicID                             uint64             `bson:"public_id" json:"public_id"`
	CreatedAt                            time.Time          `bson:"created_at" json:"created_at"`
	CreatedByUserID                      primitive.ObjectID `bson:"created_by_user_id" json:"created_by_user_id,omitempty"`
	CreatedByUserName                    string             `bson:"created_by_user_name" json:"created_by_user_name"`
	CreatedFromIPAddress                 string             `bson:"created_from_ip_address" json:"created_from_ip_address"`
	ModifiedAt                           time.Time          `bson:"modified_at" json:"modified_at"`
	ModifiedByUserID                     primitive.ObjectID `bson:"modified_by_user_id" json:"modified_by_user_id,omitempty"`
	ModifiedByUserName                   string             `bson:"modified_by_user_name" json:"modified_by_user_name"`
	ModifiedFromIPAddress                string             `bson:"modified_from_ip_address" json:"modified_from_ip_address"`
	Initiator                            int8               `bson:"initiator" json:"initiator"`
	ClosingReason                        int8               `bson:"closing_reason" json:"closing_reason"`
	ClosingReasonOther                   string             `bson:"closing_reason_other" json:"closing_reason_other"`
	StartDate                            time.Time          `bson:"start_date" json:"start_date"`
	CustomerID                           primitive.ObjectID `bson:"customer_id" json:"customer_id"`
	CustomerPublicID                     uint64             `bson:"customer_public_id" json:"customer_public_id"` // 21
	CustomerOrganizationName             string             `bson:"customer_organization_name" json:"customer_organization_name"`
	CustomerOrganizationType             int8               `bson:"customer_organization_type" json:"customer_organization_type"`
	CustomerFirstName                    string             `bson:"customer_first_name" json:"customer_first_name,omitempty"`
	CustomerLastName                     string             `bson:"customer_last_name" json:"customer_last_name,omitempty"`
	CustomerName                         string             `bson:"customer_name" json:"customer_name,omitempty"`
	CustomerLexicalName                  string             `bson:"customer_lexical_name" json:"customer_lexical_name,omitempty"`
	CustomerGender                       int8               `bson:"customer_gender" json:"customer_gender"`
	CustomerGenderOther                  string             `bson:"customer_gender_other" json:"customer_gender_other"`
	CustomerBirthdate                    time.Time          `bson:"customer_birthdate" json:"customer_birthdate"`
	CustomerEmail                        string             `bson:"customer_email" json:"customer_email,omitempty"`
	CustomerPhone                        string             `bson:"customer_phone" json:"customer_phone,omitempty"`
	CustomerPhoneType                    int8               `bson:"customer_phone_type" json:"customer_phone_type"`
	CustomerPhoneExtension               string             `bson:"customer_phone_extension" json:"customer_phone_extension"`
	CustomerOtherPhone                   string             `bson:"customer_other_phone" json:"customer_other_phone"`
	CustomerOtherPhoneExtension          string             `bson:"customer_other_phone_extension" json:"customer_other_phone_extension"`
	CustomerOtherPhoneType               int8               `bson:"customer_other_phone_type" json:"customer_other_phone_type"`
	CustomerFullAddressWithoutPostalCode string             `bson:"customer_full_address_without_postal_code" json:"customer_full_address_without_postal_code"`
	CustomerFullAddressURL               string             `bson:"customer_full_address_url" json:"customer_full_address_url"`
	// CustomerTags                          []*TaskItemTag                  `bson:"customer_tags" json:"customer_tags,omitempty"` // Related
	AssociateID                           primitive.ObjectID `bson:"associate_id" json:"associate_id"`
	AssociatePublicID                     uint64             `bson:"associate_public_id" json:"associate_public_id"` // 21
	AssociateOrganizationName             string             `bson:"associate_organization_name" json:"associate_organization_name"`
	AssociateOrganizationType             int8               `bson:"associate_organization_type" json:"associate_organization_type"`
	AssociateFirstName                    string             `bson:"associate_first_name" json:"associate_first_name,omitempty"`
	AssociateLastName                     string             `bson:"associate_last_name" json:"associate_last_name,omitempty"`
	AssociateName                         string             `bson:"associate_name" json:"associate_name,omitempty"`
	AssociateLexicalName                  string             `bson:"associate_lexical_name" json:"associate_lexical_name,omitempty"`
	AssociateGender                       int8               `bson:"associate_gender" json:"associate_gender"`
	AssociateGenderOther                  string             `bson:"associate_gender_other" json:"associate_gender_other"`
	AssociateBirthdate                    time.Time          `bson:"associate_birthdate" json:"associate_birthdate"`
	AssociateEmail                        string             `bson:"associate_email" json:"associate_email,omitempty"`
	AssociatePhone                        string             `bson:"associate_phone" json:"associate_phone,omitempty"`
	AssociatePhoneType                    int8               `bson:"associate_phone_type" json:"associate_phone_type"`
	AssociatePhoneExtension               string             `bson:"associate_phone_extension" json:"associate_phone_extension"`
	AssociateOtherPhone                   string             `bson:"associate_other_phone" json:"associate_other_phone"`
	AssociateOtherPhoneExtension          string             `bson:"associate_other_phone_extension" json:"associate_other_phone_extension"`
	AssociateOtherPhoneType               int8               `bson:"associate_other_phone_type" json:"associate_other_phone_type"`
	AssociateFullAddressWithoutPostalCode string             `bson:"associate_full_address_without_postal_code" json:"associate_full_address_without_postal_code"`
	AssociateFullAddressURL               string             `bson:"associate_full_address_url" json:"associate_full_address_url"`
	// AssociateTags                         []*TaskItemTag                  `bson:"associate_tags" json:"associate_tags,omitempty"` // Related
	// AssociateSkillSets                    []*TaskItemSkillSet             `bson:"associate_skill_sets" json:"associate_skill_sets,omitempty"`
	// AssociateInsuranceRequirements        []*TaskItemInsuranceRequirement `bson:"associate_insurance_requirements" json:"associate_insurance_requirements,omitempty"`
	// AssociateVehicleTypes                 []*TaskItemVehicleType          `bson:"associate_vehicle_types" json:"associate_vehicle_types,omitempty"`
	AssociateTaxID        string             `bson:"associate_tax_id" json:"associate_tax_id"`
	OrderID               primitive.ObjectID `bson:"order_id" json:"order_id"`     // 12
	OrderType             int8               `bson:"order_type" json:"order_type"` // 28
	OrderWJID             uint64             `bson:"order_wjid" json:"order_wjid"`
	OrderTenantIDWithWJID string             `bson:"order_tenant_id_with_wjid" json:"order_tenant_id_with_wjid"` // OrderTenantIDWithWJID is a combination of `tenancy_id` and `wjid` values written in the following structure `%v_%v`.
	// OrderStartDate                        time.Time                       `bson:"order_start_date" json:"order_start_date"`
	// OrderDescription                      string                          `bson:"order_description" json:"order_description"`
	// OrderSkillSets                        []*TaskItemSkillSet             `bson:"order_skill_sets" json:"order_skill_sets,omitempty"` // Related
	// OrderTags                             []*TaskItemTag                  `bson:"order_tags" json:"order_tags,omitempty"`             // Related
	Comments    []*OrderIncidentComment    `bson:"comments" json:"-"`
	Attachments []*OrderIncidentAttachment `bson:"attachments" json:"-"`
	Feed        []SortableByCreatedAt      `bson:"-" json:"feed,omitempty"`
}

type OrderIncidentComment struct {
	ID                    primitive.ObjectID `bson:"_id" json:"id"`
	OrderID               primitive.ObjectID `bson:"order_id" json:"order_id"`
	OrderWJID             uint64             `bson:"order_wjid" json:"order_wjid"`                               // Workery Job ID
	OrderTenantIDWithWJID string             `bson:"order_tenant_id_with_wjid" json:"order_tenant_id_with_wjid"` // OrderTenantIDWithWJID is a combination of `tenancy_id` and `wjid` values written in the following structure `%v_%v`.
	OrderIncidentID       primitive.ObjectID `bson:"order_incident_id" json:"order_incident_id,omitempty"`
	OrderIncidentPublicID uint64             `bson:"order_incident_public_id" json:"order_incident_public_id"`
	TenantID              primitive.ObjectID `bson:"tenant_id" json:"tenant_id"`
	CreatedAt             time.Time          `bson:"created_at,omitempty" json:"created_at,omitempty"`
	CreatedByUserID       primitive.ObjectID `bson:"created_by_user_id" json:"created_by_user_id"`
	CreatedByUserName     string             `bson:"created_by_user_name" json:"created_by_user_name"`
	CreatedFromIPAddress  string             `bson:"created_from_ip_address" json:"created_from_ip_address"`
	ModifiedAt            time.Time          `bson:"modified_at,omitempty" json:"modified_at,omitempty"`
	ModifiedByUserID      primitive.ObjectID `bson:"modified_by_user_id" json:"modified_by_user_id"`
	ModifiedByUserName    string             `bson:"modified_by_user_name" json:"modified_by_user_name"`
	ModifiedFromIPAddress string             `bson:"modified_from_ip_address" json:"modified_from_ip_address"`
	Content               string             `bson:"content" json:"content"`
	Status                int8               `bson:"status" json:"status"`
	// PublicID              uint64             `bson:"public_id" json:"public_id"` // Workery Job ID
}

type OrderIncidentAttachment struct {
	ID                    primitive.ObjectID `bson:"_id" json:"id"`
	TenantID              primitive.ObjectID `bson:"tenant_id" json:"tenant_id,omitempty"`
	Filename              string             `bson:"filename" json:"filename"` // 4
	FileType              string             `bson:"filetype" json:"filetype"`
	ObjectKey             string             `bson:"object_key" json:"object_key"`   // 4
	ObjectURL             string             `bson:"object_url" json:"object_url"`   // 4
	Title                 string             `bson:"title" json:"title"`             // 5
	Description           string             `bson:"description" json:"description"` // 6
	CreatedAt             time.Time          `bson:"created_at" json:"created_at"`
	CreatedByUserID       primitive.ObjectID `bson:"created_by_user_id" json:"created_by_user_id,omitempty"`
	CreatedByUserName     string             `bson:"created_by_user_name" json:"created_by_user_name"`
	CreatedFromIPAddress  string             `bson:"created_from_ip_address" json:"created_from_ip_address"`
	ModifiedAt            time.Time          `bson:"modified_at" json:"modified_at"`
	ModifiedByUserID      primitive.ObjectID `bson:"modified_by_user_id" json:"modified_by_user_id,omitempty"`
	ModifiedByUserName    string             `bson:"modified_by_user_name" json:"modified_by_user_name"`
	ModifiedFromIPAddress string             `bson:"modified_from_ip_address" json:"modified_from_ip_address"`
	AssociateID           primitive.ObjectID `bson:"associate_id" json:"associate_id"` // 14
	AssociateName         string             `bson:"associate_name" json:"associate_name"`
	CustomerID            primitive.ObjectID `bson:"customer_id" json:"customer_id"` //15
	CustomerName          string             `bson:"customer_name" json:"customer_name"`
	StaffID               primitive.ObjectID `bson:"staff_id" json:"staff_id"` // 17
	StaffName             string             `bson:"staff_name" json:"staff_name"`
	OrderID               primitive.ObjectID `bson:"order_id" json:"order_id"`                                   // 18
	OrderWJID             uint64             `bson:"order_wjid" json:"order_wjid"`                               // 18
	OrderTenantIDWithWJID string             `bson:"order_tenant_id_with_wjid" json:"order_tenant_id_with_wjid"` // TenantIDWithWJID is a combination of `tenancy_id` and `wjid` values written in the following structure `%v_%v`.
	Status                int8               `bson:"status" json:"status"`                                       // 19
	Type                  int8               `bson:"type" json:"type"`                                           // 19
}

// Define a common interface for both types
type SortableByCreatedAt interface {
	GetCreatedAt() time.Time
}

// Implement GetCreatedAt method for TypeA
func (a *OrderIncidentAttachment) GetCreatedAt() time.Time {
	return a.CreatedAt
}

// Implement GetCreatedAt method for TypeA
func (a *OrderIncidentComment) GetCreatedAt() time.Time {
	return a.CreatedAt
}

// Function to sort an array of items that implement SortableByCreatedAt
func SortByCreatedAt(items []SortableByCreatedAt) {
	sort.Slice(items, func(i, j int) bool {
		return items[i].GetCreatedAt().Before(items[j].GetCreatedAt())
	})
}

type OrderIncidentListFilter struct {
	// Pagination related.
	Cursor    primitive.ObjectID
	PageSize  int64
	SortField string
	SortOrder int8 // 1=ascending | -1=descending

	// Filter related.
	TenantID        primitive.ObjectID
	Status          int8
	ExcludeArchived bool
	SearchTitle     string
}

type OrderIncidentListResult struct {
	Results     []*OrderIncident   `json:"results"`
	NextCursor  primitive.ObjectID `json:"next_cursor"`
	HasNextPage bool               `json:"has_next_page"`
}

type OrderIncidentAsSelectOption struct {
	Value primitive.ObjectID `bson:"_id" json:"value"` // Extract from the database `_id` field and output through API as `value`.
	Label string             `bson:"title" json:"label"`
}

// OrderIncidentStorer Interface for user.
type OrderIncidentStorer interface {
	Create(ctx context.Context, m *OrderIncident) error
	GetByID(ctx context.Context, id primitive.ObjectID) (*OrderIncident, error)
	GetByPublicID(ctx context.Context, oldID uint64) (*OrderIncident, error)
	GetByEmail(ctx context.Context, email string) (*OrderIncident, error)
	GetByVerificationCode(ctx context.Context, verificationCode string) (*OrderIncident, error)
	GetLatestByTenantID(ctx context.Context, tenantID primitive.ObjectID) (*OrderIncident, error)
	CheckIfExistsByEmail(ctx context.Context, email string) (bool, error)
	UpdateByID(ctx context.Context, m *OrderIncident) error
	ListByFilter(ctx context.Context, f *OrderIncidentPaginationListFilter) (*OrderIncidentPaginationListResult, error)
	ListAsSelectOptionByFilter(ctx context.Context, f *OrderIncidentListFilter) ([]*OrderIncidentAsSelectOption, error)
	CountByFilter(ctx context.Context, f *OrderIncidentPaginationListFilter) (int64, error)
	ListAndCountByFilter(ctx context.Context, f *OrderIncidentPaginationListFilter) (*OrderIncidentPaginationListAndCountResult, error)
	CountByTenantID(ctx context.Context, tenantID primitive.ObjectID) (int64, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
}

type OrderIncidentStorerImpl struct {
	Logger     *slog.Logger
	DbClient   *mongo.Client
	Collection *mongo.Collection
}

func NewDatastore(appCfg *c.Conf, loggerp *slog.Logger, client *mongo.Client) OrderIncidentStorer {
	// ctx := context.Background()
	uc := client.Database(appCfg.DB.Name).Collection("order_incidents")

	// // For debugging purposes only.
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
		{Keys: bson.D{{Key: "title", Value: 1}}},
		{Keys: bson.D{{Key: "created_at", Value: 1}}},
		{Keys: bson.D{
			{"title", "text"},
			{"description", "text"},
		}},
	})
	if err != nil {
		// It is important that we crash the app on startup to meet the
		// requirements of `google/wire` framework.
		log.Fatal(err)
	}

	s := &OrderIncidentStorerImpl{
		Logger:     loggerp,
		DbClient:   client,
		Collection: uc,
	}
	return s
}
