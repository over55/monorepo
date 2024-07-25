package controller

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	aal_s "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type AssociateAwayLogCreateRequestIDO struct {
	AssociateID        primitive.ObjectID `bson:"associate_id" json:"associate_id"`
	Reason             int8               `bson:"reason" json:"reason"`
	ReasonOther        string             `bson:"reason_other" json:"reason_other"`
	UntilFurtherNotice int8               `bson:"until_further_notice" json:"until_further_notice"`
	UntilDate          string             `bson:"until_date" json:"until_date"`
	UntilDateFormatted time.Time          `bson:"-" json:"-"`
	StartDate          string             `bson:"start_date" json:"start_date"`
	StartDateFormatted time.Time          `bson:"-" json:"-"`
}

func ValidateCreateRequest(dirtyData *AssociateAwayLogCreateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.AssociateID.IsZero() {
		e["associate_id"] = "missing value"
	}
	if dirtyData.Reason == 0 {
		e["reason"] = "missing value"
	}
	if dirtyData.Reason == aal_s.ReasonOther && dirtyData.ReasonOther == "" {
		e["reason_other"] = "missing value"
	}
	if dirtyData.UntilFurtherNotice == aal_s.UntilFurtherNoticeUnspecified {
		e["until_further_notice"] = "missing value"
	}
	if dirtyData.UntilDate == "" && dirtyData.UntilFurtherNotice == aal_s.UntilFurtherNoticeNo {
		e["until_date"] = "missing value"
	}
	if dirtyData.StartDate == "" {
		e["start_date"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *AssociateAwayLogControllerImpl) Create(ctx context.Context, requestData *AssociateAwayLogCreateRequestIDO) (*aal_s.AssociateAwayLog, error) {

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := ValidateCreateRequest(requestData); err != nil {
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
		impl.Logger.Error("you do not have permission to create an associate away log")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to create a associate away log")
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
	impl.Kmutex.Lockf("create-associate-away-log-by-tenant-%s", tid.Hex())
	defer impl.Kmutex.Unlockf("create-associate-away-log-by-tenant-%s", tid.Hex())

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
		//// Get related records.
		////

		a, err := impl.AssociateStorer.GetByID(sessCtx, requestData.AssociateID)
		if err != nil {
			impl.Logger.Error("failed getting associate",
				slog.Any("error", err))
			return nil, err
		}
		if a == nil {
			err := fmt.Errorf("associate does not exist for ID: %v", requestData.AssociateID)
			impl.Logger.Error("associate does not exist",
				slog.Any("associate_id", requestData.AssociateID),
				slog.Any("error", err))
			return nil, err
		}

		////
		//// Create base record.
		////

		// Create the database record.
		aal := &aal_s.AssociateAwayLog{
			ID:                    primitive.NewObjectID(),
			TenantID:              tid,
			AssociateID:           a.ID,
			AssociateName:         a.Name,
			AssociateLexicalName:  a.LexicalName,
			Reason:                requestData.Reason,
			ReasonOther:           requestData.ReasonOther,
			UntilFurtherNotice:    requestData.UntilFurtherNotice,
			UntilDate:             requestData.UntilDateFormatted,
			StartDate:             requestData.StartDateFormatted,
			Status:                aal_s.AssociateAwayLogStatusActive,
			CreatedAt:             time.Now(),
			CreatedByUserID:       userID,
			CreatedByUserName:     userName,
			CreatedFromIPAddress:  ipAddress,
			ModifiedAt:            time.Now(),
			ModifiedByUserID:      userID,
			ModifiedByUserName:    userName,
			ModifiedFromIPAddress: ipAddress,
		}

		// Save to our database.
		if err := impl.AssociateAwayLogStorer.Create(sessCtx, aal); err != nil {
			impl.Logger.Error("database create error", slog.Any("error", err))
			return nil, err
		}

		////
		//// Update related records.
		////

		m2 := &a_s.AssociateAwayLog{
			ID:                    aal.ID,
			TenantID:              aal.TenantID,
			AssociateID:           a.ID,
			AssociateName:         a.Name,
			AssociateLexicalName:  a.LexicalName,
			Reason:                aal.Reason,
			Status:                aal_s.AssociateAwayLogStatusActive,
			ReasonOther:           aal.ReasonOther,
			UntilFurtherNotice:    aal.UntilFurtherNotice,
			UntilDate:             aal.UntilDate,
			StartDate:             aal.StartDate,
			CreatedAt:             aal.CreatedAt,
			CreatedByUserID:       userID,
			CreatedByUserName:     userName,
			CreatedFromIPAddress:  ipAddress,
			ModifiedAt:            aal.ModifiedAt,
			ModifiedByUserID:      userID,
			ModifiedByUserName:    userName,
			ModifiedFromIPAddress: ipAddress,
		}
		a.AwayLogs = append(a.AwayLogs, m2)
		if err := impl.AssociateStorer.UpdateByID(sessCtx, a); err != nil {
			impl.Logger.Error("failed updating associate", slog.Any("error", err))
			return nil, err
		}

		////
		//// Exit our transaction successfully.
		////

		return aal, nil
	}

	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		impl.Logger.Error("session failed error",
			slog.Any("error", err))
		return nil, err
	}

	return result.(*aal_s.AssociateAwayLog), nil
}
