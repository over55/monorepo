package controller

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type OrderUpdateRequestIDO struct {
	WJID uint64 `bson:"wjid" json:"wjid"`
	// CustomerID           primitive.ObjectID   `bson:"customer_id" json:"customer_id"`
	StartDate            string    `bson:"start_date" json:"start_date"`
	StartDateFormatted   time.Time `bson:"start_date" json:"-"`
	IsOngoing            int8      `bson:"is_ongoing" json:"is_ongoing"`
	IsHomeSupportService int8      `bson:"is_home_support_service" json:"is_home_support_service"`
	Description          string    `bson:"description" json:"description"`
	// AdditionalComment    string               `bson:"additional_comment" json:"additional_comment"`
	SkillSets []primitive.ObjectID `bson:"skill_sets" json:"skill_sets,omitempty"`
	Tags      []primitive.ObjectID `bson:"tags" json:"tags,omitempty"`
}

func (impl *OrderControllerImpl) validateUpdateRequest(ctx context.Context, dirtyData *OrderUpdateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.WJID == 0 {
		e["wjid"] = "no selected choices"
	}
	// if dirtyData.CustomerID.IsZero() {
	// 	e["customer_id"] = "no selected choices"
	// }
	if dirtyData.IsOngoing == 0 {
		e["is_ongoing"] = "missing value"
	}
	// if dirtyData.IsHomeSupportService == 0 {
	// 	e["is_home_support_service"] = "missing value"
	// }
	// if dirtyData.Description == "" {
	// 	e["description"] = "missing value"
	// }
	// if len(dirtyData.SkillSets) == 0 {
	// 	e["skill_sets"] = "missing value"
	// }

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *OrderControllerImpl) UpdateByWJID(ctx context.Context, req *OrderUpdateRequestIDO) (*o_s.Order, error) {
	//
	// Get variables from our user authenticated session.
	//

	tid, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	role, _ := ctx.Value(constants.SessionUserRole).(int8)
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	// DEVELOPERS NOTE:
	// Every submission needs to have a unique `workery job id` (WJID)
	// generated. The following needs to happen to generate the unique WJID:
	// 1. Make the `Update` function be `atomic` and thus lock this function.
	// 2. Count total orders in system (for particular tenant).
	// 3. Generate WJID.
	// 4. Apply the WJID to the order.
	// 5. Unlock this `Update` function to be usable again by other calls after
	//    the function successfully submits the order into our system.
	impl.Kmutex.Lockf("update-order-by-tenant-%s", tid.Hex())
	defer impl.Kmutex.Unlockf("update-order-by-tenant-%s", tid.Hex())

	switch role {
	case u_s.UserRoleExecutive, u_s.UserRoleManagement, u_s.UserRoleFrontlineStaff:
		break
	default:
		impl.Logger.Error("you do not have permission to update an order")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to update a client")
	}

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateUpdateRequest(ctx, req); err != nil {
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
		// Get Order.
		//

		o, err := impl.OrderStorer.GetByWJID(sessCtx, req.WJID)
		if err != nil {
			impl.Logger.Error("database order get by id error",
				slog.Any("error", err),
				slog.Any("order_wjid", req.WJID))
			return nil, err
		}
		if o == nil {
			impl.Logger.Error("order does not exist error",
				slog.Any("order_wjid", req.WJID))
			return nil, httperror.NewForBadRequestWithSingleField("customer_id",
				fmt.Sprintf("order does not exist for id %v", req.WJID))
		}

		//
		// Extract from request and map into our domain the base information.
		//

		// --- Meta ---
		o.ModifiedAt = time.Now()
		o.ModifiedByUserID = userID
		o.ModifiedByUserName = userName
		o.ModifiedFromIPAddress = ipAddress
		o.Tags = make([]*o_s.OrderTag, 0)
		o.SkillSets = make([]*o_s.OrderSkillSet, 0)
		o.Comments = make([]*o_s.OrderComment, 0)
		o.PastInvoices = make([]*o_s.OrderInvoice, 0)
		o.Deposits = make([]*o_s.OrderDeposit, 0)
		o.Status = o_s.OrderStatusNew
		o.Currency = "CAD"

		// o.Type = o_s.OrderTypeAnotherUnassigned
		// if cust.Type == c_s.CustomerTypeResidential {
		// 	o.Type = o_s.OrderTypeResidential
		// }
		// if cust.Type == c_s.CustomerTypeCommercial {
		// 	o.Type = o_s.OrderTypeCommercial
		// }

		// --- Req --- //
		o.StartDate = req.StartDateFormatted
		if req.IsOngoing == 1 {
			o.IsOngoing = true
		} else if req.IsOngoing == 2 {
			o.IsOngoing = false
		}
		if req.IsHomeSupportService == 1 {
			o.IsHomeSupportService = true
		} else if req.IsHomeSupportService == 2 {
			o.IsHomeSupportService = false
		}
		o.Description = req.Description

		//
		// Save to the database.
		//

		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("database update by id error",
				slog.Any("order_id", o.ID),
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("order updated",
			slog.Any("order_id", o.ID))

		//
		// Attach related (if there are any).
		//

		if err := impl.UpdateRelatedBySkillSets(sessCtx, o, req.SkillSets); err != nil {
			impl.Logger.Error("update related error",
				slog.Any("error", err))
			return nil, err
		}

		if err := impl.UpdateRelatedByTags(sessCtx, o, req.Tags); err != nil {
			impl.Logger.Error("update related error",
				slog.Any("error", err))
			return nil, err
		}

		return o, nil
	}

	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		impl.Logger.Error("session failed error",
			slog.Any("error", err))
		return nil, err
	}

	return result.(*o_s.Order), nil
}
