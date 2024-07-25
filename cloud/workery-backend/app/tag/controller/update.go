package controller

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	tag_s "github.com/over55/monorepo/cloud/workery-backend/app/tag/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type TagUpdateRequestIDO struct {
	ID          primitive.ObjectID `bson:"id" json:"id"`
	Text        string             `bson:"text" json:"text"`
	Description string             `bson:"description" json:"description"`
}

func ValidateUpdateRequest(dirtyData *TagUpdateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.ID.IsZero() {
		e["id"] = "missing value"
	}
	if dirtyData.Text == "" {
		e["text"] = "missing value"
	}
	if dirtyData.Description == "" {
		e["description"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *TagControllerImpl) UpdateByID(ctx context.Context, requestData *TagUpdateRequestIDO) (*tag_s.Tag, error) {
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

		// Lookup the tag in our database, else return a `400 Bad Request` error.
		ou, err := impl.TagStorer.GetByID(sessCtx, requestData.ID)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			return nil, err
		}
		if ou == nil {
			impl.Logger.Warn("tag does not exist validation error")
			return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
		}

		//
		// Update base.
		//

		ou.TenantID = tid
		ou.Text = requestData.Text
		ou.Description = requestData.Description
		ou.ModifiedAt = time.Now()
		ou.ModifiedByUserID = userID
		ou.ModifiedByUserName = userName
		ou.ModifiedFromIPAddress = ipAddress

		if err := impl.TagStorer.UpdateByID(sessCtx, ou); err != nil {
			impl.Logger.Error("tag update by id error", slog.Any("error", err))
			return nil, err
		}

		////
		//// Update related.
		////

		// --- Customers --- //

		if err := impl.updateRelatedCustomers(sessCtx, ou); err != nil {
			impl.Logger.Error("update related by customers error", slog.Any("error", err))
			return nil, err
		}
		impl.Logger.Debug("updated tag related customers", slog.String("tag_id", ou.ID.Hex()))

		// --- Associates --- //

		if err := impl.updateRelatedAssociates(sessCtx, ou); err != nil {
			impl.Logger.Error("update related by associates error", slog.Any("error", err))
			return nil, err
		}
		impl.Logger.Debug("updated tag related associates", slog.String("tag_id", ou.ID.Hex()))

		// --- Orders --- //

		if err := impl.updateRelatedOrders(sessCtx, ou); err != nil {
			impl.Logger.Error("update related by order error", slog.Any("error", err))
			return nil, err
		}
		impl.Logger.Debug("updated tag related orders", slog.String("tag_id", ou.ID.Hex()))

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

	return result.(*tag_s.Tag), nil
}
