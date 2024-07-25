package controller

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	aal_s "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type AssociateAwayLogUpdateRequestIDO struct {
	ID                 primitive.ObjectID `bson:"id" json:"id"`
	AssociateID        primitive.ObjectID `bson:"associate_id" json:"associate_id"`
	Reason             int8               `bson:"reason" json:"reason"`
	ReasonOther        string             `bson:"reason_other" json:"reason_other"`
	UntilFurtherNotice int8               `bson:"until_further_notice" json:"until_further_notice"`
	UntilDate          string             `bson:"until_date" json:"until_date"`
	UntilDateFormatted time.Time          `bson:"-" json:"-"`
	StartDate          string             `bson:"start_date" json:"start_date"`
	StartDateFormatted time.Time          `bson:"-" json:"-"`
}

func ValidateUpdateRequest(dirtyData *AssociateAwayLogUpdateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.ID.IsZero() {
		e["id"] = "missing value"
	}
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

func (impl *AssociateAwayLogControllerImpl) UpdateByID(ctx context.Context, requestData *AssociateAwayLogUpdateRequestIDO) (*aal_s.AssociateAwayLog, error) {
	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := ValidateUpdateRequest(requestData); err != nil {
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
		impl.Logger.Error("you do not have permission to update this associate away log")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to update this associate away log")
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
		//// Get related records.
		////

		aal, err := impl.AssociateAwayLogStorer.GetByID(sessCtx, requestData.ID)
		if err != nil {
			impl.Logger.Error("failed getting associate away log",
				slog.Any("error", err))
			return nil, err
		}
		if aal == nil {
			err := fmt.Errorf("associate away log does not exist for ID: %v", requestData.AssociateID)
			impl.Logger.Error("associate away log  does not exist",
				slog.Any("id", aal.ID),
				slog.Any("error", err))
			return nil, err
		}

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
		//// Update the base record.
		////

		aal.TenantID = tid
		aal.AssociateID = a.ID
		aal.AssociateName = a.Name
		aal.AssociateLexicalName = a.LexicalName
		aal.Reason = requestData.Reason
		aal.ReasonOther = requestData.ReasonOther
		aal.UntilFurtherNotice = requestData.UntilFurtherNotice
		aal.UntilDate = requestData.UntilDateFormatted
		aal.StartDate = requestData.StartDateFormatted
		aal.Status = aal_s.AssociateAwayLogStatusActive
		aal.CreatedAt = time.Now()
		aal.ModifiedAt = time.Now()
		aal.ModifiedByUserID = userID
		aal.ModifiedByUserName = userName
		aal.ModifiedFromIPAddress = ipAddress

		if err := impl.AssociateAwayLogStorer.UpdateByID(sessCtx, aal); err != nil {
			impl.Logger.Error("associateawaylog update by id error", slog.Any("error", err))
			return nil, err
		}

		////
		//// Update related records.
		////

		for _, awayLog := range a.AwayLogs {
			if awayLog.ID == aal.ID {
				awayLog.AssociateID = a.ID
				awayLog.AssociateName = a.Name
				awayLog.AssociateLexicalName = a.LexicalName
				awayLog.Reason = requestData.Reason
				awayLog.ReasonOther = requestData.ReasonOther
				awayLog.UntilFurtherNotice = requestData.UntilFurtherNotice
				awayLog.UntilDate = requestData.UntilDateFormatted
				awayLog.StartDate = requestData.StartDateFormatted
				awayLog.Status = aal_s.AssociateAwayLogStatusActive
				awayLog.ModifiedAt = time.Now()
				awayLog.ModifiedByUserID = userID
				awayLog.ModifiedByUserName = userName
				awayLog.ModifiedFromIPAddress = ipAddress
				break
			}
		}
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
