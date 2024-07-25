package controller

import (
	"context"
	"time"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	insurancerequirement_s "github.com/over55/monorepo/cloud/workery-backend/app/insurancerequirement/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type InsuranceRequirementUpdateRequestIDO struct {
	ID          primitive.ObjectID `bson:"_id" json:"id"`
	Name        string             `bson:"name" json:"name"`
	Description string             `bson:"description" json:"description"`
}

func validateUpdateRequest(dirtyData *InsuranceRequirementUpdateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.ID.IsZero() {
		e["id"] = "missing value"
	}
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

func (impl *InsuranceRequirementControllerImpl) UpdateByID(ctx context.Context, requestData *InsuranceRequirementUpdateRequestIDO) (*insurancerequirement_s.InsuranceRequirement, error) {
	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := validateUpdateRequest(requestData); err != nil {
		return nil, err
	}

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
		//// Get related data.
		////

		// Lookup the insurancerequirement in our database, else return a `400 Bad Request` error.
		ir, err := impl.InsuranceRequirementStorer.GetByID(sessCtx, requestData.ID)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			return nil, err
		}
		if ir == nil {
			impl.Logger.Warn("insurancerequirement does not exist validation error")
			return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
		}

		////
		//// Update base record.
		////

		// Meta update.
		ir.TenantID = tid
		ir.ModifiedAt = time.Now()
		ir.ModifiedByUserID = userID
		ir.ModifiedByUserName = userName
		ir.ModifiedFromIPAddress = ipAddress

		// Base update.
		ir.Name = requestData.Name
		ir.Description = requestData.Description

		// Submit update to the database.
		if err := impl.InsuranceRequirementStorer.UpdateByID(sessCtx, ir); err != nil {
			impl.Logger.Error("insurancerequirement update by id error", slog.Any("error", err))
			return nil, err
		}

		////
		//// Update related record.
		////

		// --- Associates --- //

		if err := impl.updateRelatedByAssociates(sessCtx, ir); err != nil {
			impl.Logger.Error("insurance requirement related update by id error", slog.Any("error", err))
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
