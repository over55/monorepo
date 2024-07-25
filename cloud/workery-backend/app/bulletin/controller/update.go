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

type BulletinUpdateRequestIDO struct {
	ID   primitive.ObjectID `json:"id,omitempty"`
	Text string             `json:"text"`
}

func (impl *BulletinControllerImpl) validateUpdateRequest(ctx context.Context, dirtyData *BulletinUpdateRequestIDO) error {
	e := make(map[string]string)
	if dirtyData.ID.IsZero() {
		e["id"] = "missing value"
	}
	if dirtyData.Text == "" {
		e["text"] = "missing value"
	}
	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *BulletinControllerImpl) UpdateByID(ctx context.Context, req *BulletinUpdateRequestIDO) (*bulletin_s.Bulletin, error) {
	//
	// Get variables from our user authenticated session.
	//

	// tid, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	role, _ := ctx.Value(constants.SessionUserRole).(int8)
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	switch role {
	case user_s.UserRoleExecutive, user_s.UserRoleManagement, user_s.UserRoleFrontlineStaff:
		break
	default:
		impl.Logger.Error("you do not have permission to update this bulletin")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to update this bulletin")
	}

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateUpdateRequest(ctx, req); err != nil {
		impl.Logger.Warn("validation error", slog.Any("error", err))
		return nil, err
	}

	////
	//// Lock this order until completed (including errors as well).
	////

	impl.Kmutex.Lock(req.ID.Hex())
	defer impl.Kmutex.Unlock(req.ID.Hex())

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
		// Lookup the previous record.
		//

		bul, err := impl.BulletinStorer.GetByID(sessCtx, req.ID)
		if err != nil {
			impl.Logger.Error("fetching bulletin error", slog.Any("error", err))
			return nil, err
		}
		if bul == nil {
			impl.Logger.Error("bulletin does not exist error", slog.Any("bulletin_id", req.ID))
			return nil, httperror.NewForBadRequestWithSingleField("bulletin_id", req.ID.Hex()+" bulletin does not exist")
		}

		//
		// Extract from request and map into our domain.
		//

		bul.ModifiedAt = time.Now()
		bul.ModifiedByUserID = userID
		bul.ModifiedByUserName = userName
		bul.ModifiedFromIPAddress = ipAddress
		bul.Text = req.Text
		bul.Status = bulletin_s.BulletinStatusActive

		//
		// Save to our database.
		//

		if err := impl.BulletinStorer.UpdateByID(sessCtx, bul); err != nil {
			impl.Logger.Error("database create error", slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("updated bulletin", slog.String("bulletin_id", req.ID.Hex()))

		// //
		// // Update related fields in our database.
		// //
		//
		// if err := impl.UpdateRelatedByTags(sessCtx, bul, req.Tags); err != nil {
		// 	impl.Logger.Error("update related error", slog.Any("error", err))
		// 	return nil, err
		// }
		// if err := impl.UpdateRelatedByOrders(sessCtx, bul); err != nil {
		// 	impl.Logger.Error("update related error", slog.Any("error", err))
		// 	return nil, err
		// }
		// if err := impl.UpdateRelatedByTaskItems(sessCtx, bul); err != nil {
		// 	impl.Logger.Error("update related error", slog.Any("error", err))
		// 	return nil, err
		// }

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
