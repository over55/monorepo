package controller

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	orderincident_s "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type OrderIncidentUpdateRequestIDO struct {
	ID                 primitive.ObjectID `bson:"id" json:"id"`
	StartDate          time.Time          `bson:"start_date" json:"start_date"`
	Initiator          int8               `bson:"initiator" json:"initiator"`
	Title              string             `bson:"title" json:"title"`
	Description        string             `bson:"description" json:"description"`
	ClosingReason      int8               `bson:"closing_reason" json:"closing_reason"`
	ClosingReasonOther string             `bson:"closing_reason_other" json:"closing_reason_other"`
}

func ValidateUpdateRequest(dirtyData *OrderIncidentUpdateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.Initiator == 0 {
		e["initiator"] = "missing value"
	}
	if dirtyData.Title == "" {
		e["title"] = "missing value"
	}
	if dirtyData.Description == "" {
		e["description"] = "missing value"
	}
	// if dirtyData.ClosingReason == 0 {
	// 	e["closing_reason"] = "missing value"
	// }
	if dirtyData.ClosingReason == 1 && dirtyData.ClosingReasonOther == "" {
		e["closing_reason_other"] = "missing value"
	}
	if dirtyData.StartDate.IsZero() {
		e["start_date"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *OrderIncidentControllerImpl) UpdateByID(ctx context.Context, requestData *OrderIncidentUpdateRequestIDO) (*orderincident_s.OrderIncident, error) {
	//
	// Perform our validation and return validation error on any orderincidents detected.
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

		// Lookup the orderincident in our database, else return a `400 Bad Request` error.
		ou, err := impl.OrderIncidentStorer.GetByID(sessCtx, requestData.ID)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			return nil, err
		}
		if ou == nil {
			impl.Logger.Warn("orderincident does not exist validation error")
			return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
		}

		//
		// Update base.
		//

		ou.TenantID = tid
		ou.Initiator = requestData.Initiator
		ou.StartDate = requestData.StartDate
		ou.Title = requestData.Title
		ou.Description = requestData.Description
		ou.ClosingReason = requestData.ClosingReason
		ou.ClosingReasonOther = requestData.ClosingReasonOther
		ou.ModifiedAt = time.Now()
		ou.ModifiedByUserID = userID
		ou.ModifiedByUserName = userName
		ou.ModifiedFromIPAddress = ipAddress

		if err := impl.OrderIncidentStorer.UpdateByID(sessCtx, ou); err != nil {
			impl.Logger.Error("orderincident update by id error", slog.Any("error", err))
			return nil, err
		}

		////
		//// Update related.
		////

		// // --- Customers --- //
		//
		// if err := impl.updateRelatedCustomers(sessCtx, ou); err != nil {
		// 	impl.Logger.Error("update related by customers error", slog.Any("error", err))
		// 	return nil, err
		// }
		// impl.Logger.Debug("updated orderincident related customers", slog.String("orderincident_id", ou.ID.Hex()))
		//
		// // --- Associates --- //
		//
		// if err := impl.updateRelatedAssociates(sessCtx, ou); err != nil {
		// 	impl.Logger.Error("update related by associates error", slog.Any("error", err))
		// 	return nil, err
		// }
		// impl.Logger.Debug("updated orderincident related associates", slog.String("orderincident_id", ou.ID.Hex()))
		//
		// // --- Orders --- //
		//
		// if err := impl.updateRelatedOrders(sessCtx, ou); err != nil {
		// 	impl.Logger.Error("update related by order error", slog.Any("error", err))
		// 	return nil, err
		// }
		// impl.Logger.Debug("updated orderincident related orders", slog.String("orderincident_id", ou.ID.Hex()))

		////
		//// Exit our transaction successfully.
		////

		return ou, nil
	}

	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		impl.Logger.Error("session failed error",
			slog.Any("error", err))
		return nil, err
	}

	return result.(*orderincident_s.OrderIncident), nil
}
