package controller

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	servicefee_s "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type ServiceFeeUpdateRequestIDO struct {
	ID          primitive.ObjectID `bson:"_id" json:"id"`
	Name        string             `bson:"name" json:"name"`
	Percentage  float64            `bson:"percentage" json:"percentage"`
	Description string             `bson:"description" json:"description"`
}

func validateUpdateRequest(dirtyData *ServiceFeeUpdateRequestIDO) error {
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

func (impl *ServiceFeeControllerImpl) UpdateByID(ctx context.Context, requestData *ServiceFeeUpdateRequestIDO) (*servicefee_s.ServiceFee, error) {
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

		// Lookup the servicefee in our database, else return a `400 Bad Request` error.
		sf, err := impl.ServiceFeeStorer.GetByID(sessCtx, requestData.ID)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			return nil, err
		}
		if sf == nil {
			impl.Logger.Warn("servicefee does not exist validation error")
			return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
		}

		// Meta update.
		sf.TenantID = tid
		sf.ModifiedAt = time.Now()
		sf.ModifiedByUserID = userID
		sf.ModifiedByUserName = userName
		sf.ModifiedFromIPAddress = ipAddress

		// Base update.
		sf.Name = requestData.Name
		sf.Description = requestData.Description
		sf.Percentage = requestData.Percentage

		// Submit update to the database.
		if err := impl.ServiceFeeStorer.UpdateByID(sessCtx, sf); err != nil {
			impl.Logger.Error("servicefee update by id error", slog.Any("error", err))
			return nil, err
		}

		// Update related.
		if err := impl.updateRelatedOrders(sessCtx, sf); err != nil {
			impl.Logger.Error("servicefee update related error", slog.Any("error", err))
			return nil, err
		}

		////
		//// Exit our transaction successfully.
		////

		return sf, nil
	}

	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		impl.Logger.Error("session failed error",
			slog.Any("error", err))
		return nil, err
	}

	return result.(*servicefee_s.ServiceFee), nil
}
