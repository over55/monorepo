package controller

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	howhear_s "github.com/over55/monorepo/cloud/workery-backend/app/howhear/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type HowHearAboutUsItemCreateRequestIDO struct {
	Text           string `bson:"text" json:"text"`
	SortNumber     int8   `bson:"sort_number" json:"sort_number"`
	IsForAssociate bool   `bson:"is_for_associate" json:"is_for_associate"`
	IsForCustomer  bool   `bson:"is_for_customer" json:"is_for_customer"`
	IsForStaff     bool   `bson:"is_for_staff" json:"is_for_staff"`
}

func (impl *HowHearAboutUsItemControllerImpl) validateCreateRequest(ctx context.Context, dirtyData *HowHearAboutUsItemCreateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.Text == "" {
		e["text"] = "missing value"
	}
	if dirtyData.SortNumber == 0 {
		e["sort_number"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *HowHearAboutUsItemControllerImpl) Create(ctx context.Context, requestData *HowHearAboutUsItemCreateRequestIDO) (*howhear_s.HowHearAboutUsItem, error) {
	//
	// Get variables from our user authenticated session.
	//

	tid, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	role, _ := ctx.Value(constants.SessionUserRole).(int8)
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
	impl.Kmutex.Lockf("create-how-hear-about-us-item-by-tenant-%s", tid.Hex())
	defer impl.Kmutex.Unlockf("create-how-hear-about-us-item-by-tenant-%s", tid.Hex())

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateCreateRequest(ctx, requestData); err != nil {
		impl.Logger.Warn("validation error", slog.Any("error", err))
		return nil, err
	}

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

		hh := &howhear_s.HowHearAboutUsItem{}

		// Add defaults.
		hh.TenantID = tid
		hh.ID = primitive.NewObjectID()
		hh.CreatedAt = time.Now()
		hh.CreatedByUserID = userID
		hh.CreatedByUserName = userName
		hh.CreatedFromIPAddress = ipAddress
		hh.ModifiedAt = time.Now()
		hh.ModifiedByUserID = userID
		hh.ModifiedByUserName = userName
		hh.ModifiedFromIPAddress = ipAddress

		// Add base.
		hh.Text = requestData.Text
		hh.SortNumber = requestData.SortNumber
		hh.IsForAssociate = requestData.IsForAssociate
		hh.IsForCustomer = requestData.IsForCustomer
		hh.IsForStaff = requestData.IsForStaff
		hh.Status = howhear_s.HowHearAboutUsItemStatusActive

		// Save to our database.
		if err := impl.HowHearAboutUsItemStorer.Create(sessCtx, hh); err != nil {
			impl.Logger.Error("database create error", slog.Any("error", err))
			return nil, err
		}

		////
		//// Exit our transaction successfully.
		////

		return hh, nil
	}

	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		impl.Logger.Error("session failed error",
			slog.Any("error", err))
		return nil, err
	}

	return result.(*howhear_s.HowHearAboutUsItem), nil
}
