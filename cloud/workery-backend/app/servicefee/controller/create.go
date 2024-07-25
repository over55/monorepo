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

type ServiceFeeCreateRequestIDO struct {
	Name        string  `bson:"name" json:"name"`
	Percentage  float64 `bson:"percentage" json:"percentage"`
	Description string  `bson:"description" json:"description"`
}

func (impl *ServiceFeeControllerImpl) validateCreateRequest(dirtyData *ServiceFeeCreateRequestIDO) error {
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

func (impl *ServiceFeeControllerImpl) userFromCreateRequest(requestData *ServiceFeeCreateRequestIDO) (*servicefee_s.ServiceFee, error) {

	return &servicefee_s.ServiceFee{
		Name:        requestData.Name,
		Description: requestData.Description,
		Percentage:  requestData.Percentage,
	}, nil
}

func (impl *ServiceFeeControllerImpl) Create(ctx context.Context, requestData *ServiceFeeCreateRequestIDO) (*servicefee_s.ServiceFee, error) {
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

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateCreateRequest(requestData); err != nil {
		return nil, err
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
	impl.Kmutex.Lockf("create-service-fee-by-tenant-%s", tid.Hex())
	defer impl.Kmutex.Unlockf("create-service-fee-by-tenant-%s", tid.Hex())

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

		sf, err := impl.userFromCreateRequest(requestData)
		if err != nil {
			return nil, err
		}

		////
		//// Create base record.
		////

		// Add meta.
		sf.TenantID = tid
		sf.ID = primitive.NewObjectID()
		sf.CreatedAt = time.Now()
		sf.CreatedByUserID = userID
		sf.CreatedByUserName = userName
		sf.CreatedFromIPAddress = ipAddress
		sf.ModifiedAt = time.Now()
		sf.ModifiedByUserID = userID
		sf.ModifiedByUserName = userName
		sf.ModifiedFromIPAddress = ipAddress

		// Add base.
		sf.Name = requestData.Name
		sf.Percentage = requestData.Percentage
		sf.Description = requestData.Description

		// Save to our database.
		if err := impl.ServiceFeeStorer.Create(ctx, sf); err != nil {
			impl.Logger.Error("database create error", slog.Any("error", err))
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
