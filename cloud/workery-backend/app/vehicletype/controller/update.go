package controller

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	vehicletype_s "github.com/over55/monorepo/cloud/workery-backend/app/vehicletype/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type VehicleTypeUpdateRequestIDO struct {
	ID          primitive.ObjectID `bson:"id" json:"id"`
	Name        string             `bson:"name" json:"name"`
	Description string             `bson:"description" json:"description"`
}

func (impl *VehicleTypeControllerImpl) validateUpdateRequest(ctx context.Context, dirtyData *VehicleTypeUpdateRequestIDO) error {
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
func (impl *VehicleTypeControllerImpl) UpdateByID(ctx context.Context, requestData *VehicleTypeUpdateRequestIDO) (*vehicletype_s.VehicleType, error) {
	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateUpdateRequest(ctx, requestData); err != nil {
		impl.Logger.Warn("validation error", slog.Any("error", err))
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
		//// Get related.
		////

		// Lookup the vehicletype in our database, else return a `400 Bad Request` error.
		vt, err := impl.VehicleTypeStorer.GetByID(sessCtx, requestData.ID)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			return nil, err
		}
		if vt == nil {
			impl.Logger.Warn("vehicle type does not exist validation error")
			return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
		}

		////
		//// Update the record.
		////

		vt.TenantID = tid
		vt.ModifiedAt = time.Now()
		vt.ModifiedByUserID = userID
		vt.ModifiedByUserName = userName
		vt.ModifiedFromIPAddress = ipAddress
		vt.Name = requestData.Name
		vt.Description = requestData.Description
		vt.Status = vehicletype_s.StatusActive

		if err := impl.VehicleTypeStorer.UpdateByID(sessCtx, vt); err != nil {
			impl.Logger.Error("vehicletype update by id error", slog.Any("error", err))
			return nil, err
		}

		////
		//// Update the related records.
		////

		if err := impl.UpdateRelatedAssociates(sessCtx, vt); err != nil {
			impl.Logger.Error("failed updating related associates", slog.Any("error", err))
			return nil, err
		}

		if err := impl.UpdateRelatedStaff(sessCtx, vt); err != nil {
			impl.Logger.Error("failed updating related staff", slog.Any("error", err))
			return nil, err
		}

		////
		//// Exit our transaction successfully.
		////

		return vt, nil
	}

	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		impl.Logger.Error("session failed error",
			slog.Any("error", err))
		return nil, err
	}

	return result.(*vehicletype_s.VehicleType), nil
}
