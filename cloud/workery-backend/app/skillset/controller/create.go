package controller

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	skillset_s "github.com/over55/monorepo/cloud/workery-backend/app/skillset/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type SkillSetCreateRequestIDO struct {
	Category              string               `bson:"category" json:"category"`
	SubCategory           string               `bson:"sub_category" json:"sub_category"`
	Description           string               `bson:"description" json:"description"`
	InsuranceRequirements []primitive.ObjectID `bson:"insurance_requirements" json:"insurance_requirements,omitempty"`
}

func (impl *SkillSetControllerImpl) skillSetFromCreateRequest(sessCtx mongo.SessionContext, requestData *SkillSetCreateRequestIDO) (*skillset_s.SkillSet, error) {
	ss := &skillset_s.SkillSet{
		ID:          primitive.NewObjectID(),
		Category:    requestData.Category,
		SubCategory: requestData.SubCategory,
		Description: requestData.Description,
	}

	// Note: `InsuranceRequirements` is optional.
	for _, insuranceRequirementID := range requestData.InsuranceRequirements {
		ir, err := impl.InsuranceRequirementStorer.GetByID(sessCtx, insuranceRequirementID)
		if err != nil {
			impl.Logger.Error("failed getting insurance requirement",
				slog.Any("insurance_requirement", ir.ID.Hex()),
				slog.Any("error", err))
			return nil, err
		}
		if ir == nil {
			return nil, errors.New("insurance requirement does not exist")
		}
		air := &skillset_s.SkillSetInsuranceRequirement{
			SkillSetID:  ss.ID,
			TenantID:    ir.TenantID,
			ID:          ir.ID,
			PublicID:    ir.PublicID,
			Name:        ir.Name,
			Description: ir.Description,
			Status:      ir.Status,
		}
		ss.InsuranceRequirements = append(ss.InsuranceRequirements, air) // Append comments to skill set details.
	}
	return ss, nil
}

func (impl *SkillSetControllerImpl) validateCreateRequest(ctx context.Context, dirtyData *SkillSetCreateRequestIDO) error {
	e := make(map[string]string)
	if dirtyData.Category == "" {
		e["category"] = "missing value"
	}
	if dirtyData.SubCategory == "" {
		e["sub_category"] = "missing value"
	}
	if dirtyData.Description == "" {
		e["description"] = "missing value"
	}
	// Note: we do not validate `InsuranceRequirements` as it is optional.
	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *SkillSetControllerImpl) Create(ctx context.Context, requestData *SkillSetCreateRequestIDO) (*skillset_s.SkillSet, error) {
	// Modify the customer based on role.
	orgID, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	// DEVELOPERS NOTE:
	// Every submission needs to have a unique `public id` (PID)
	// generated. The following needs to happen to generate the unique PID:
	// 1. Make the `Create` function be `atomic` and thus lock this function.
	// 2. Count total records in system (for particular tenant).
	// 3. Generate PID.
	// 4. Apply the PID to the record.
	// 5. Unlock this `Create` function to be usable again by other calls after
	//    the function successfully submits the record into our system.
	impl.Kmutex.Lockf("create-skill-set-by-tenant-%s", orgID.Hex())
	defer impl.Kmutex.Unlockf("create-skill-set-by-tenant-%s", orgID.Hex())

	////
	//// Perform our validation and return validation error on any issues detected.
	////

	if err := impl.validateCreateRequest(ctx, requestData); err != nil {
		impl.Logger.Warn("validation error", slog.Any("error", err))
		return nil, err
	}

	////
	//// Start the transaction.
	////

	session, err := impl.DbClient.StartSession()
	if err != nil {
		impl.Logger.Error("start session error",
			slog.Any("error", err))
		return nil, err
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (any, error) {

		//
		// Convert request to our domain.
		//

		m, err := impl.skillSetFromCreateRequest(sessCtx, requestData)
		if err != nil {
			return nil, err
		}

		// Add meta an defaults.
		m.TenantID = orgID
		m.CreatedAt = time.Now()
		m.CreatedByUserID = userID
		m.CreatedByUserName = userName
		m.CreatedFromIPAddress = ipAddress
		m.ModifiedAt = time.Now()
		m.ModifiedByUserID = userID
		m.ModifiedByUserName = userName
		m.ModifiedFromIPAddress = ipAddress
		m.Category = requestData.Category
		m.SubCategory = requestData.SubCategory
		m.Description = requestData.Description
		m.Status = skillset_s.SkillSetStatusActive

		// Save to our database.
		if err := impl.SkillSetStorer.Create(sessCtx, m); err != nil {
			impl.Logger.Error("database create error", slog.Any("error", err))
			return nil, err
		}

		////
		//// Exit our transaction successfully.
		////

		return m, nil
	}

	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		impl.Logger.Error("session failed error",
			slog.Any("error", err))
		return nil, err
	}

	return result.(*skillset_s.SkillSet), nil
}
