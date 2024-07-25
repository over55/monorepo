package controller

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	bulletin_s "github.com/over55/monorepo/cloud/workery-backend/app/bulletin/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type BulletinCreateRequestIDO struct {
	Text string `json:"text"`
}

func (impl *BulletinControllerImpl) validateCreateRequest(ctx context.Context, dirtyData *BulletinCreateRequestIDO) error {
	e := make(map[string]string)
	if dirtyData.Text == "" {
		e["text"] = "missing value"
	}
	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *BulletinControllerImpl) Create(ctx context.Context, req *BulletinCreateRequestIDO) (*bulletin_s.Bulletin, error) {
	//
	// Get variables from our user authenticated session.
	//

	tid, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	role, _ := ctx.Value(constants.SessionUserRole).(int8)
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	switch role {
	case user_s.UserRoleExecutive, user_s.UserRoleManagement, user_s.UserRoleFrontlineStaff:
		break
	default:
		impl.Logger.Error("you do not have permission to create a bulletin")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to create a bulletin")
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
	impl.Kmutex.Lockf("create-bulletin-by-tenant-%s", tid.Hex())
	defer impl.Kmutex.Unlockf("create-bulletin-by-tenant-%s", tid.Hex())

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateCreateRequest(ctx, req); err != nil {
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
		// Extract from request and map into our domain.
		//

		bul := &bulletin_s.Bulletin{}
		bul.ID = primitive.NewObjectID()
		bul.TenantID = tid
		bul.CreatedAt = time.Now()
		bul.CreatedByUserID = userID
		bul.CreatedByUserName = userName
		bul.CreatedFromIPAddress = ipAddress
		bul.ModifiedAt = time.Now()
		bul.ModifiedByUserID = userID
		bul.ModifiedByUserName = userName
		bul.ModifiedFromIPAddress = ipAddress
		bul.Text = req.Text
		bul.Status = bulletin_s.BulletinStatusActive

		//
		// Save to our database.
		//

		if err := impl.BulletinStorer.Create(sessCtx, bul); err != nil {
			impl.Logger.Error("database create error", slog.Any("error", err))
			return nil, err
		}

		////
		//// Exit our transaction successfully.
		////

		return bul, nil
	}

	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		impl.Logger.Error("session failed error",
			slog.Any("error", err))
		return nil, err
	}

	return result.(*bulletin_s.Bulletin), nil
}
