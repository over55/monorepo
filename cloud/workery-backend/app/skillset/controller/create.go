package controller

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	skillset_s "github.com/over55/monorepo/cloud/workery-backend/app/skillset/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type SkillSetCreateRequestIDO struct {
	Category    string `bson:"category" json:"category"`
	SubCategory string `bson:"sub_category" json:"sub_category"`
	Description string `bson:"description" json:"description"`
}

func (impl *SkillSetControllerImpl) userFromCreateRequest(requestData *SkillSetCreateRequestIDO) (*skillset_s.SkillSet, error) {
	return &skillset_s.SkillSet{
		Category:    requestData.Category,
		SubCategory: requestData.SubCategory,
		Description: requestData.Description,
	}, nil
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
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {

		//
		// Convert request to our domain.
		//

		m, err := impl.userFromCreateRequest(requestData)
		if err != nil {
			return nil, err
		}

		// Add defaults.
		m.TenantID = orgID
		m.ID = primitive.NewObjectID()
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
