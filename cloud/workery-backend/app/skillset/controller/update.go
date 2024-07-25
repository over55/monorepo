package controller

import (
	"context"
	"time"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	skillset_s "github.com/over55/monorepo/cloud/workery-backend/app/skillset/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type SkillSetUpdateRequestIDO struct {
	ID          primitive.ObjectID `json:"id"`
	Category    string             `json:"category"`
	SubCategory string             `json:"sub_category"`
	Description string             `json:"description"`
	Status      int8               `json:"status"`
}

func (impl *SkillSetControllerImpl) validateUpdateRequest(ctx context.Context, dirtyData *SkillSetUpdateRequestIDO) error {
	e := make(map[string]string)
	if dirtyData.ID.IsZero() {
		e["id"] = "missing value"
	}
	if dirtyData.Category == "" {
		e["category"] = "missing value"
	}
	if dirtyData.SubCategory == "" {
		e["sub_category"] = "missing value"
	}
	if dirtyData.Description == "" {
		e["description"] = "missing value"
	}
	if dirtyData.Status == 0 {
		e["status"] = "missing value"
	}
	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *SkillSetControllerImpl) UpdateByID(ctx context.Context, nu *SkillSetUpdateRequestIDO) (*skillset_s.SkillSet, error) {
	// Extract from our session the following data.
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	orgID, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	role, _ := ctx.Value(constants.SessionUserRole).(int8)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	switch role {
	case user_s.UserRoleExecutive, user_s.UserRoleManagement, user_s.UserRoleFrontlineStaff:
		break
	default:
		impl.Logger.Error("you do not have permission to create a client")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to create a client")
	}

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateUpdateRequest(ctx, nu); err != nil {
		impl.Logger.Warn("validation error", slog.Any("error", err))
		return nil, err
	}

	////
	//// Lock this order until completed (including errors as well).
	////

	impl.Kmutex.Lock(nu.ID.Hex())
	defer impl.Kmutex.Unlock(nu.ID.Hex())

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
		//// Lookup the skillset in our database, else return a `400 Bad Request` error.
		////

		ou, err := impl.SkillSetStorer.GetByID(sessCtx, nu.ID)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			return nil, err
		}
		if ou == nil {
			impl.Logger.Warn("skillset does not exist validation error")
			return nil, httperror.NewForBadRequestWithSingleField("skill_set_id", "does not exist")
		}

		////
		//// Update base.
		////

		ou.ModifiedAt = time.Now()
		ou.ModifiedByUserID = userID
		ou.ModifiedByUserName = userName
		ou.ModifiedFromIPAddress = ipAddress
		ou.TenantID = orgID
		ou.Category = nu.Category
		ou.SubCategory = nu.SubCategory
		ou.Description = nu.Description
		ou.Status = nu.Status

		if err := impl.SkillSetStorer.UpdateByID(sessCtx, ou); err != nil {
			impl.Logger.Error("skillset update by id error", slog.Any("error", err))
			return nil, err
		}
		impl.Logger.Debug("updated skill set", slog.String("skill_set_id", nu.ID.Hex()))

		////
		//// Update related.
		////

		// --- Associates --- //

		if err := impl.updateRelatedAssociates(sessCtx, ou); err != nil {
			impl.Logger.Error("update related by associates error", slog.Any("error", err))
			return nil, err
		}
		impl.Logger.Debug("updated skill set related associates", slog.String("skill_set_id", nu.ID.Hex()))

		// --- Orders --- //

		if err := impl.updateRelatedOrders(sessCtx, ou); err != nil {
			impl.Logger.Error("update related by order error", slog.Any("error", err))
			return nil, err
		}
		impl.Logger.Debug("updated skill set related orders", slog.String("skill_set_id", nu.ID.Hex()))

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

	return result.(*skillset_s.SkillSet), nil
}
