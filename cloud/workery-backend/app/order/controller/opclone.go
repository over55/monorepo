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

type OrderOperationCloneRequest struct {
	OrderWJID uint64 `bson:"order_wjid" json:"order_wjid"`
}

func (impl *OrderControllerImpl) validateOperationCloneRequest(ctx context.Context, dirtyData *OrderOperationCloneRequest) error {
	e := make(map[string]string)

	if dirtyData.OrderWJID == 0 {
		e["order_wjid"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *OrderControllerImpl) Clone(ctx context.Context, req *OrderOperationCloneRequest) (*o_s.Order, error) {
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
		impl.Logger.Error("you do not have permission to create a client comment")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to create a client comment")
	}

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateOperationCloneRequest(ctx, req); err != nil {
		impl.Logger.Warn("validation error", slog.Any("error", err))
		return nil, err
	}

	// DEVELOPERS NOTE:
	// Every submission needs to have a unique `workery job id` (WJID)
	// generated. The following needs to happen to generate the unique WJID:
	// 1. Make this function be `atomic` and thus lock this function.
	// 2. Count total orders in system (for particular tenant).
	// 3. Generate WJID.
	// 4. Apply the WJID to the new duplicated order.
	// 5. Unlock this function to be usable again by other calls after
	//    the function successfully submits the order into our system.
	impl.Kmutex.Lockf("create-order-by-tenant-%s", tid.Hex())
	defer impl.Kmutex.Unlockf("create-order-by-tenant-%s", tid.Hex())

	////
	//// Lock this order until completed (including errors as well).
	////

	impl.Kmutex.Lockf("%v", req.OrderWJID)
	defer impl.Kmutex.Unlockf("%v", req.OrderWJID)

	////
	//// Start the transaction.
	////

	session, err := impl.DbClient.StartSession()
	if err != nil {
		impl.Logger.Warn("start session error",
			slog.Any("order_wjid", req.OrderWJID),
			slog.Any("error", err))
		return nil, err
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {

		////
		//// Fetch all related data that we will be duplicating.
		////

		o, err := impl.OrderStorer.GetByWJID(sessCtx, req.OrderWJID)
		if err != nil {
			impl.Logger.Error("database get by id error", slog.Any("error", err))
			return nil, err
		}
		if o == nil {
			err := fmt.Errorf("order does not exist for wjid %v", req.OrderWJID)
			impl.Logger.Error("order does not exist",
				slog.Any("order_wjid", req.OrderWJID),
				slog.Any("error", err))
			return nil, err
		}

		////
		//// Generate `workery job id` (a.k.a. `wjid`). This is important!
		////

		var wjid uint64
		latest, err := impl.OrderStorer.GetLatestOrderByTenantID(sessCtx, tid)
		if err != nil {
			impl.Logger.Error("database get latest order by tenant id error",
				slog.Any("error", err),
				slog.Any("TenantID", tid))
			return nil, err
		}
		if latest == nil {
			impl.Logger.Debug("first order creation detected, setting wjid to value of 1",
				slog.Any("TenantID", tid))
			wjid = 1
		} else {
			wjid = latest.WJID + 1
			impl.Logger.Debug(fmt.Sprintf("system generated new_order_wjid: %d", wjid),
				slog.Int("old_wjid", int(req.OrderWJID)))
		}

		////
		//// Create duplicates.
		////

		//
		// Step 1: Base order.
		//

		o.Status = o_s.OrderStatusCompletedButUnpaid
		o.ID = primitive.NewObjectID()
		o.WJID = wjid
		o.TenantIDWithWJID = fmt.Sprintf("%v_%v", tid.Hex(), o.ID)
		o.TenantID = tid
		o.CreatedAt = time.Now()
		o.CreatedByUserID = userID
		o.CreatedByUserName = userName
		o.CreatedFromIPAddress = ipAddress
		o.ModifiedAt = time.Now()
		o.ModifiedByUserID = userID
		o.ModifiedByUserName = userName
		o.ModifiedFromIPAddress = ipAddress

		if err := impl.OrderStorer.Create(sessCtx, o); err != nil {
			impl.Logger.Error("database create by id error",
				slog.Any("order_wjid", req.OrderWJID),
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("order duplicated for clone operation",
			slog.Any("old_order_wjid", req.OrderWJID),
			slog.Any("new_order_wjid", o.WJID))

		//
		// Step 2: Updated invoice.
		//

		if o.Invoice != nil {
			o.Invoice.ID = primitive.NewObjectID()
			o.Invoice.OrderID = o.ID
			o.Invoice.OrderWJID = o.WJID
			o.Invoice.OrderTenantIDWithWJID = o.TenantIDWithWJID
			o.Invoice.TenantID = tid
			o.Invoice.TenantID = tid
			o.Invoice.CreatedAt = time.Now()
			o.Invoice.CreatedByUserID = userID
			o.Invoice.CreatedByUserName = userName
			o.Invoice.CreatedFromIPAddress = ipAddress
			o.Invoice.ModifiedAt = time.Now()
			o.Invoice.ModifiedByUserID = userID
			o.Invoice.ModifiedByUserName = userName
			o.Invoice.ModifiedFromIPAddress = ipAddress
		}
		for _, pastInvoice := range o.PastInvoices {
			pastInvoice.ID = primitive.NewObjectID()
			pastInvoice.OrderID = o.ID
			pastInvoice.OrderWJID = o.WJID
			pastInvoice.OrderTenantIDWithWJID = o.TenantIDWithWJID
			pastInvoice.TenantID = tid
			pastInvoice.TenantID = tid
			pastInvoice.CreatedAt = time.Now()
			pastInvoice.CreatedByUserID = userID
			pastInvoice.CreatedByUserName = userName
			pastInvoice.CreatedFromIPAddress = ipAddress
			pastInvoice.ModifiedAt = time.Now()
			pastInvoice.ModifiedByUserID = userID
			pastInvoice.ModifiedByUserName = userName
			pastInvoice.ModifiedFromIPAddress = ipAddress
		}

		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("database update by id error",
				slog.Any("order_wjid", req.OrderWJID),
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("order invoice(s) duplicated for clone operation",
			slog.Any("new_order_wjid", o.WJID))

		//
		// Step 3: Order Comments
		//

		for _, oc := range o.Comments {
			oc.ID = primitive.NewObjectID()
			oc.OrderID = o.ID
			oc.OrderWJID = o.WJID
			oc.OrderTenantIDWithWJID = fmt.Sprintf("%v_%v", o.TenantID.Hex(), o.WJID)
			oc.TenantID = o.TenantID
			oc.CreatedAt = o.CreatedAt
			oc.CreatedByUserID = o.CreatedByUserID
			oc.CreatedByUserName = o.CreatedByUserName
			oc.CreatedFromIPAddress = o.CreatedFromIPAddress
			oc.ModifiedAt = o.ModifiedAt
			oc.ModifiedByUserID = o.ModifiedByUserID
			oc.ModifiedByUserName = o.ModifiedByUserName
			oc.ModifiedFromIPAddress = o.ModifiedFromIPAddress
		}

		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("database update by id error",
				slog.Any("order_wjid", req.OrderWJID),
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("order comments(s) duplicated for clone operation",
			slog.Any("new_order_wjid", o.WJID))

		comments, err := impl.CommentStorer.ListByOrderWJID(sessCtx, req.OrderWJID)
		if err != nil {
			impl.Logger.Error("list by order wjid error",
				slog.Any("order_wjid", req.OrderWJID),
				slog.Any("error", err))
			return nil, err
		}

		for _, c := range comments.Results {
			c.ID = primitive.NewObjectID()
			c.OrderID = o.ID
			c.OrderWJID = o.WJID
			c.OrderTenantIDWithWJID = fmt.Sprintf("%v_%v", o.TenantID.Hex(), o.WJID)
			c.TenantID = o.TenantID
			c.CreatedAt = o.CreatedAt
			c.CreatedByUserID = o.CreatedByUserID
			c.CreatedByUserName = o.CreatedByUserName
			c.CreatedFromIPAddress = o.CreatedFromIPAddress
			c.ModifiedAt = o.ModifiedAt
			c.ModifiedByUserID = o.ModifiedByUserID
			c.ModifiedByUserName = o.ModifiedByUserName
			c.ModifiedFromIPAddress = o.ModifiedFromIPAddress

			if err := impl.CommentStorer.UpdateByID(sessCtx, c); err != nil {
				impl.Logger.Error("database update by id error",
					slog.Any("order_wjid", req.OrderWJID),
					slog.Any("error", err))
				return nil, err
			}

			impl.Logger.Debug("comment duplicated for clone operation",
				slog.Any("new_order_wjid", o.WJID))
		}

		// //
		// // Step 4: Task Items
		// //
		//
		// taskItemResponse, err := impl.TaskItemStorer.ListByOrderWJID(sessCtx, req.OrderWJID)
		// if err != nil {
		// 	impl.Logger.Error("list by order wjid error",
		// 		slog.Any("order_wjid", req.OrderWJID),
		// 		slog.Any("error", err))
		// 	return nil, err
		// }
		//
		// for _, ti := range taskItemResponse.Results {
		// 	ti.ID = primitive.NewObjectID()
		// 	ti.OrderID = o.ID
		// 	ti.OrderWJID = o.WJID
		// 	ti.OrderTenantIDWithWJID = fmt.Sprintf("%v_%v", o.TenantID.Hex(), o.WJID)
		// 	ti.TenantID = o.TenantID
		// 	ti.CreatedAt = o.CreatedAt
		// 	ti.CreatedByUserID = o.CreatedByUserID
		// 	ti.CreatedByUserName = o.CreatedByUserName
		// 	ti.CreatedFromIPAddress = o.CreatedFromIPAddress
		// 	ti.ModifiedAt = o.ModifiedAt
		// 	ti.ModifiedByUserID = o.ModifiedByUserID
		// 	ti.ModifiedByUserName = o.ModifiedByUserName
		// 	ti.ModifiedFromIPAddress = o.ModifiedFromIPAddress
		//
		// 	if err := impl.TaskItemStorer.UpdateByID(sessCtx, ti); err != nil {
		// 		impl.Logger.Error("database update by id error",
		// 			slog.Any("order_wjid", req.OrderWJID),
		// 			slog.Any("error", err))
		// 		return nil, err
		// 	}
		//
		// 	impl.Logger.Debug("task item duplicated for clone operation",
		// 		slog.Any("new_order_wjid", o.WJID))
		// }

		//
		// Step 5: Activity Sheets
		//

		activityResponse, err := impl.ActivitySheetStorer.ListByOrderWJID(sessCtx, req.OrderWJID)
		if err != nil {
			impl.Logger.Error("list by order wjid error",
				slog.Any("order_wjid", req.OrderWJID),
				slog.Any("error", err))
			return nil, err
		}
		for _, act := range activityResponse.Results {
			act.ID = primitive.NewObjectID()
			act.OrderID = o.ID
			act.OrderWJID = o.WJID
			act.OrderTenantIDWithWJID = fmt.Sprintf("%v_%v", o.TenantID.Hex(), o.WJID)
			act.TenantID = o.TenantID
			act.CreatedAt = o.CreatedAt
			act.CreatedByUserID = o.CreatedByUserID
			act.CreatedByUserName = o.CreatedByUserName
			act.CreatedFromIPAddress = o.CreatedFromIPAddress
			act.ModifiedAt = o.ModifiedAt
			act.ModifiedByUserID = o.ModifiedByUserID
			act.ModifiedByUserName = o.ModifiedByUserName
			act.ModifiedFromIPAddress = o.ModifiedFromIPAddress

			if err := impl.ActivitySheetStorer.UpdateByID(sessCtx, act); err != nil {
				impl.Logger.Error("database update by id error",
					slog.Any("order_wjid", req.OrderWJID),
					slog.Any("error", err))
				return nil, err
			}

			impl.Logger.Debug("activity sheet duplicated for clone operation",
				slog.Any("new_order_wjid", o.WJID))
		}

		//
		// Step 6: Attachments
		//

		attachsResponse, err := impl.AttachmentStorer.ListByOrderWJID(sessCtx, req.OrderWJID)
		if err != nil {
			impl.Logger.Error("list by order wjid error",
				slog.Any("order_wjid", req.OrderWJID),
				slog.Any("error", err))
			return nil, err
		}
		for _, attach := range attachsResponse.Results {
			attach.ID = primitive.NewObjectID()
			attach.OrderID = o.ID
			attach.OrderWJID = o.WJID
			attach.OrderTenantIDWithWJID = fmt.Sprintf("%v_%v", o.TenantID.Hex(), o.WJID)
			attach.TenantID = o.TenantID
			attach.CreatedAt = o.CreatedAt
			attach.CreatedByUserID = o.CreatedByUserID
			attach.CreatedByUserName = o.CreatedByUserName
			attach.CreatedFromIPAddress = o.CreatedFromIPAddress
			attach.ModifiedAt = o.ModifiedAt
			attach.ModifiedByUserID = o.ModifiedByUserID
			attach.ModifiedByUserName = o.ModifiedByUserName
			attach.ModifiedFromIPAddress = o.ModifiedFromIPAddress

			if err := impl.AttachmentStorer.UpdateByID(sessCtx, attach); err != nil {
				impl.Logger.Error("database update by id error",
					slog.Any("order_wjid", req.OrderWJID),
					slog.Any("error", err))
				return nil, err
			}

			impl.Logger.Debug("attachment duplicated for clone operation",
				slog.Any("new_order_wjid", o.WJID))
		}

		////
		//// Exit our transaction successfully.
		////

		// // For development purposes only.
		// return nil, errors.New("halt by programmer")

		return o, nil
	} // end transaction function.

	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		impl.Logger.Error("transaction error",
			slog.Any("order_wjid", req.OrderWJID),
			slog.Any("error", err))
		return nil, err
	}
	return result.(*o_s.Order), nil
}
