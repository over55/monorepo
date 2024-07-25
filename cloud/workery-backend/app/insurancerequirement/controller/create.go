package controller

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	insurancerequirement_s "github.com/over55/monorepo/cloud/workery-backend/app/insurancerequirement/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type InsuranceRequirementCreateRequestIDO struct {
	Name        string `bson:"name" json:"name"`
	Description string `bson:"description" json:"description"`
}

func validateCreateRequest(dirtyData *InsuranceRequirementCreateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.Name == "" {
		e["name"] = "missing value"
	}
	if dirtyData.Description == "" {
		e["description"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *InsuranceRequirementControllerImpl) userFromCreateRequest(requestData *InsuranceRequirementCreateRequestIDO) (*insurancerequirement_s.InsuranceRequirement, error) {

	return &insurancerequirement_s.InsuranceRequirement{
		Name:        requestData.Name,
		Description: requestData.Description,
	}, nil
}

func (impl *InsuranceRequirementControllerImpl) Create(ctx context.Context, requestData *InsuranceRequirementCreateRequestIDO) (*insurancerequirement_s.InsuranceRequirement, error) {
	//
	// Get variables from our user authenticated session.
	//

	tid, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	role, _ := ctx.Value(constants.SessionUserRole).(int8)
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	switch role {
	case u_s.UserRoleExecutive, u_s.UserRoleManagement, u_s.UserRoleFrontlineStaff:
		break
	default:
		impl.Logger.Error("you do not have permission to create a client")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to create a client")
	}

	// DEVELOPERS NOTE:
	// Every submission needs to have a unique `public id` (PID)
	// generated. The following needs to happen to generate the unique PID:
	// 1. Make the `Create` function be `atomic` and thus lock this function.
	// 2. Count total records in system (for particular tenant).
	// 3. Generate PID.
	// 4. Apply the PID to the record.
	// 5. Unlock this `Create` function to be usable again by other calls after
	//    the function successfully submits the record into our system.
	impl.Kmutex.Lockf("create-insurance-requirement-by-tenant-%s", tid.Hex())
	defer impl.Kmutex.Unlockf("create-insurance-requirement-by-tenant-%s", tid.Hex())

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := validateCreateRequest(requestData); err != nil {
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

		////
		//// Unmarshal.
		////

		ir, err := impl.userFromCreateRequest(requestData)
		if err != nil {
			return nil, err
		}

		////
		//// Create base record.
		////

		// Add meta.
		ir.TenantID = tid
		ir.ID = primitive.NewObjectID()
		ir.CreatedAt = time.Now()
		ir.CreatedByUserID = userID
		ir.CreatedByUserName = userName
		ir.CreatedFromIPAddress = ipAddress
		ir.ModifiedAt = time.Now()
		ir.ModifiedByUserID = userID
		ir.ModifiedByUserName = userName
		ir.ModifiedFromIPAddress = ipAddress
		ir.Status = insurancerequirement_s.StatusActive

		// Add base.
		ir.Name = requestData.Name
		ir.Description = requestData.Description

		// Save to our database.
		if err := impl.InsuranceRequirementStorer.Create(sessCtx, ir); err != nil {
			impl.Logger.Error("database create error", slog.Any("error", err))
			return nil, err
		}

		////
		//// Exit our transaction successfully.
		////

		return ir, nil
	}

	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		impl.Logger.Error("session failed error",
			slog.Any("error", err))
		return nil, err
	}

	return result.(*insurancerequirement_s.InsuranceRequirement), nil
}
