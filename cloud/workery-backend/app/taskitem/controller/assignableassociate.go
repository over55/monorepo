package controller

import (
	"context"
	"fmt"
	"log/slog"
	"sort"
	"time"

	a_c "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AssociateLite represents the limited detail of a associate which is to be
// displayed in a list view.
type AssignableAssociate struct {
	ID                  primitive.ObjectID       `bson:"_id" json:"id"`
	PublicID            uint64                   `bson:"public_id" json:"public_id"`
	Name                string                   `bson:"name" json:"name"`
	LexicalName         string                   `bson:"lexical_name" json:"lexical_name"`
	Email               string                   `bson:"email" json:"email"`
	Phone               string                   `bson:"phone" json:"phone,omitempty"`
	PhoneType           int8                     `bson:"phone_type" json:"phone_type"`
	PhoneExtension      string                   `bson:"phone_extension" json:"phone_extension"`
	OtherPhone          string                   `bson:"other_phone" json:"other_phone"`
	OtherPhoneExtension string                   `bson:"other_phone_extension" json:"other_phone_extension"`
	OtherPhoneType      int8                     `bson:"other_phone_type" json:"other_phone_type"`
	Status              int8                     `bson:"status" json:"status"`
	Type                int8                     `bson:"type" json:"type"`
	AvatarObjectKey     string                   `bson:"avatar_object_key" json:"avatar_object_key"`
	AvatarFileType      string                   `bson:"avatar_file_type" json:"avatar_file_type"`
	AvatarFileName      string                   `bson:"avatar_file_name" json:"avatar_file_name"`
	Birthdate           time.Time                `bson:"birthdate" json:"birthdate"`
	JoinDate            time.Time                `bson:"join_date" json:"join_date"`
	Nationality         string                   `bson:"nationality" json:"nationality"`
	Gender              int8                     `bson:"gender" json:"gender"`
	GenderOther         string                   `bson:"gender_other" json:"gender_other"`
	OrganizationName    string                   `bson:"organization_name" json:"organization_name"`
	OrganizationType    int8                     `bson:"organization_type" json:"organization_type"`
	ContactsLast30Days  int64                    `bson:"contacts_last_30_days" json:"contacts_last_30_days"`
	WsibNumber          string                   `bson:"wsib_number" json:"wsib_number"`
	HourlySalaryDesired int64                    `bson:"hourly_salary_desired" json:"hourly_salary_desired"`
	SkillSets           []*a_c.AssociateSkillSet `bson:"skill_sets" json:"skill_sets,omitempty"`
}

type ListAssignableAssociatesByTaskIDResponse struct {
	Results []*AssignableAssociate
}

type ByContactsLast30Days []*AssignableAssociate

func (a ByContactsLast30Days) Len() int      { return len(a) }
func (a ByContactsLast30Days) Swap(i, j int) { a[i], a[j] = a[j], a[i] }
func (a ByContactsLast30Days) Less(i, j int) bool {
	return a[i].ContactsLast30Days < a[j].ContactsLast30Days
}

func (impl *TaskItemControllerImpl) ListAssignableAssociatesByTaskID(ctx context.Context, id primitive.ObjectID) (*ListAssignableAssociatesByTaskIDResponse, error) {
	// Retrieve from our database the record for the specific id.
	t, err := impl.TaskItemStorer.GetByID(ctx, id)
	if err != nil {
		impl.Logger.Error("database get by id error",
			slog.Any("error", err),
			slog.Any("task_id", id))
		return nil, err
	}
	if t == nil {
		impl.Logger.Error("order does not exist error",
			slog.Any("task_id", id))
		return nil, httperror.NewForBadRequestWithSingleField("task_id", fmt.Sprintf("task does not exist for value %v", id))
	}

	// STEP 1: Find all the associates which have our supported skill sets.
	skillSetIDs := t.SkillSetIDs()

	f := &a_c.AssociatePaginationListFilter{
		Cursor:        "",
		PageSize:      1_000_000, // No limit!
		SortField:     "",        // Do not have any sorting.
		SortOrder:     0,         // Do not have any sorting.
		TenantID:      t.TenantID,
		Status:        a_c.AssociateStatusActive,
		InSkillSetIDs: skillSetIDs,
	}
	ares, err := impl.AssociateStorer.ListByFilter(ctx, f)
	if err != nil {
		impl.Logger.Error("database list by id error",
			slog.Any("error", err),
			slog.Any("task_id", id))
		return nil, err
	}

	// Step 1: Process associates.
	associates := make([]*AssignableAssociate, 0)
	for _, associate := range ares.Results {

		// Count how many contacts the associate had for the past 30 days.
		contactsLast30Days, err := impl.ActivitySheetStorer.CountByLast30DaysForAssociateID(ctx, associate.ID)
		if err != nil {
			impl.Logger.Error("database count by last 30 days and associate id error",
				slog.Any("error", err),
				slog.Any("task_id", id))
			return nil, err
		}

		associates = append(associates, &AssignableAssociate{
			ID:                  associate.ID,
			PublicID:            associate.PublicID,
			Name:                associate.Name,
			Email:               associate.Email,
			Phone:               associate.Phone,
			PhoneType:           associate.PhoneType,
			PhoneExtension:      associate.PhoneExtension,
			OtherPhone:          associate.OtherPhone,
			OtherPhoneExtension: associate.OtherPhoneExtension,
			OtherPhoneType:      associate.OtherPhoneType,
			Status:              associate.Status,
			Type:                associate.Type,
			AvatarObjectKey:     associate.AvatarObjectKey,
			AvatarFileType:      associate.AvatarFileType,
			AvatarFileName:      associate.AvatarFileName,
			// Birthdate:           associate.Birthdate,
			JoinDate:            associate.JoinDate,
			Nationality:         associate.Nationality,
			Gender:              associate.Gender,
			GenderOther:         associate.GenderOther,
			OrganizationName:    associate.OrganizationName,
			OrganizationType:    associate.OrganizationType,
			ContactsLast30Days:  contactsLast30Days,
			WsibNumber:          associate.WsibNumber,
			HourlySalaryDesired: associate.HourlySalaryDesired,
			SkillSets:           associate.SkillSets,
		})
	}

	// Step 2: Create a map to track unique associates based on their ID
	uniqueAssociates := make(map[primitive.ObjectID]*AssignableAssociate)

	// Step 3: Iterate through the original slice, adding associates to the map only if their ID is not present
	for _, assoc := range associates {
		_, exists := uniqueAssociates[assoc.ID]
		if !exists {
			uniqueAssociates[assoc.ID] = assoc
		}
	}

	// Step 4: Extract values from the map to create a new slice
	uniqueAssociatesSlice := make([]*AssignableAssociate, 0, len(uniqueAssociates))
	for _, assoc := range uniqueAssociates {
		uniqueAssociatesSlice = append(uniqueAssociatesSlice, assoc)
	}

	// Step 5: Implement sorting using the custom type
	sort.Sort(ByContactsLast30Days(uniqueAssociatesSlice))

	return &ListAssignableAssociatesByTaskIDResponse{Results: uniqueAssociatesSlice}, err
}
