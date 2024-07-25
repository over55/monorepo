package controller

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	com_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type OrderCreateRequestIDO struct {
	CustomerID           primitive.ObjectID   `bson:"customer_id" json:"customer_id"`
	StartDate            string               `bson:"start_date" json:"start_date"`
	StartDateFormatted   time.Time            `bson:"start_date" json:"-"`
	IsOngoing            int8                 `bson:"is_ongoing" json:"is_ongoing"`
	IsHomeSupportService int8                 `bson:"is_home_support_service" json:"is_home_support_service"`
	Description          string               `bson:"description" json:"description"`
	AdditionalComment    string               `bson:"additional_comment" json:"additional_comment"`
	SkillSets            []primitive.ObjectID `bson:"skill_sets" json:"skill_sets,omitempty"`
	Tags                 []primitive.ObjectID `bson:"tags" json:"tags,omitempty"`
}

func (impl *OrderControllerImpl) validateCreateRequest(ctx context.Context, dirtyData *OrderCreateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.CustomerID.IsZero() {
		e["customer_id"] = "no selected choices"
	}
	if dirtyData.IsOngoing == 0 {
		e["is_ongoing"] = "missing value"
	}
	if dirtyData.IsHomeSupportService == 0 {
		e["is_home_support_service"] = "missing value"
	}
	if dirtyData.Description == "" {
		e["description"] = "missing value"
	}
	if len(dirtyData.SkillSets) == 0 {
		e["skill_sets"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *OrderControllerImpl) Create(ctx context.Context, req *OrderCreateRequestIDO) (*o_s.Order, error) {
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
	// 1. Make the `Create` function be `atomic` and thus lock this function.
	// 2. Count total orders in system (for particular tenant).
	// 3. Generate WJID.
	// 4. Apply the WJID to the order.
	// 5. Unlock this `Create` function to be usable again by other calls after
	//    the function successfully submits the order into our system.
	impl.Kmutex.Lockf("create-order-by-tenant-%s", tid.Hex())
	defer impl.Kmutex.Unlockf("create-order-by-tenant-%s", tid.Hex())

	// Lock the tenant model from any read/writes because we are going
	// to need to read from the tenant the `OrderDeletionCount` field
	// which is important for creation of the `wjid`.
	impl.Kmutex.Lockf("tenant-%s", tid.Hex())
	defer impl.Kmutex.Unlockf("tenant-%s", tid.Hex())

	switch role {
	case u_s.UserRoleExecutive, u_s.UserRoleManagement, u_s.UserRoleFrontlineStaff:
		break
	default:
		impl.Logger.Error("you do not have permission to create an order")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to create a client")
	}

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
		// Lookup customer.
		//

		cust, err := impl.CustomerStorer.GetByID(sessCtx, req.CustomerID)
		if err != nil {
			impl.Logger.Error("database customer get by id error",
				slog.Any("error", err),
				slog.Any("CustomerID", req.CustomerID))
			return nil, err
		}
		if cust == nil {
			impl.Logger.Error("customer does not exist error",
				slog.Any("customer_id", req.CustomerID))
			return nil, httperror.NewForBadRequestWithSingleField("customer_id",
				fmt.Sprintf("customer does not exist for id %v", req.CustomerID))
		}

		//
		// Generate `workery job id` (a.k.a. `wjid`). This is important!
		//

		t, err := impl.TenantStorer.GetByID(sessCtx, tid)
		if err != nil {
			impl.Logger.Error("get by id from database error", slog.Any("error", err))
			return nil, err
		}
		if t == nil {
			err := fmt.Errorf("tenant does not exist with id: %v", tid)
			impl.Logger.Error("tenant does not exist error", slog.Any("error", err))
			return nil, err
		}

		// Special case: If nothing was previously set in tenant.
		if t.LatestOrderWJID == 0 {
			latest, err := impl.OrderStorer.GetLatestOrderByTenantID(sessCtx, tid)
			if err != nil {
				impl.Logger.Error("database get latest order by tenant id error",
					slog.Any("error", err),
					slog.Any("TenantID", tid))
				impl.Logger.Error("get by id from database error", slog.Any("error", err))
				return nil, err
			}
			if latest == nil {
				impl.Logger.Debug("first order creation detected, doing nothing...",
					slog.Any("TenantID", tid))
			} else {
				t.LatestOrderWJID = latest.WJID
				t.LatestOrderID = latest.ID
				if err := impl.TenantStorer.UpdateByID(sessCtx, t); err != nil {
					impl.Logger.Error("tenant update in database error", slog.Any("error", err))
					return nil, err
				}
			}
		}

		// Generate the new `wjid` by taking the latest `wjid` which the tenant
		// has stored and then increase by `1` to account for this order we are
		// about to create.
		wjid := uint64(t.LatestOrderWJID) + 1

		impl.Logger.Debug("system generated new wjid",
			slog.Int("latest_order_wjid", int(t.LatestOrderWJID)),
			slog.Int("new_order_wjid", int(wjid)))

		//
		// Extract from request and map into our domain the base information.
		//

		// --- Meta ---
		var o *o_s.Order = &o_s.Order{}
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
		o.Tags = make([]*o_s.OrderTag, 0)
		o.SkillSets = make([]*o_s.OrderSkillSet, 0)
		o.Comments = make([]*o_s.OrderComment, 0)
		o.PastInvoices = make([]*o_s.OrderInvoice, 0)
		o.Deposits = make([]*o_s.OrderDeposit, 0)
		o.Status = o_s.OrderStatusNew
		o.Currency = "CAD"
		o.PaymentMethods = make([]int8, 0)

		// --- Associate --- //
		o.AssociateTags = make([]*o_s.OrderTag, 0)
		o.AssociateSkillSets = make([]*o_s.OrderSkillSet, 0)
		o.AssociateInsuranceRequirements = make([]*o_s.OrderInsuranceRequirement, 0)
		o.AssociateVehicleTypes = make([]*o_s.OrderVehicleType, 0)
		o.AssociateServiceFeeID = primitive.NilObjectID
		o.AssociateServiceFeeName = ""
		o.AssociateServiceFeePercentage = 0

		// --- Customer --- //
		o.CustomerID = cust.ID
		o.CustomerPublicID = cust.PublicID
		o.CustomerOrganizationName = cust.OrganizationName
		o.CustomerOrganizationType = cust.OrganizationType
		o.CustomerFirstName = cust.FirstName
		o.CustomerLastName = cust.LastName
		o.CustomerName = cust.Name
		o.CustomerLexicalName = cust.LexicalName
		o.CustomerGender = cust.Gender
		o.CustomerGenderOther = cust.GenderOther
		o.CustomerBirthdate = cust.BirthDate
		o.CustomerEmail = cust.Email
		o.CustomerPhone = cust.Phone
		o.CustomerPhoneType = cust.PhoneType
		o.CustomerPhoneExtension = cust.PhoneExtension
		o.CustomerOtherPhone = cust.OtherPhone
		o.CustomerOtherPhoneType = cust.OtherPhoneType
		o.CustomerOtherPhoneExtension = cust.OtherPhoneExtension
		o.CustomerFullAddressWithoutPostalCode = cust.FullAddressWithoutPostalCode
		o.CustomerFullAddressURL = cust.FullAddressURL
		o.CustomerTags = toOrderTagsFromCustomerTags(cust.Tags)
		o.Type = o_s.OrderTypeAnotherUnassigned
		if cust.Type == c_s.CustomerTypeResidential {
			o.Type = o_s.OrderTypeResidential
		}
		if cust.Type == c_s.CustomerTypeCommercial {
			o.Type = o_s.OrderTypeCommercial
		}

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

		if err := impl.OrderStorer.Create(sessCtx, o); err != nil {
			impl.Logger.Error("database create by id error",
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("order created",
			slog.Any("orderID", o.ID))

		//
		// Create comment (if there is one).
		//

		if req.AdditionalComment != "" {
			//
			// Part 1 of 2.
			//

			comment := &com_s.Comment{
				ID:                    primitive.NewObjectID(),
				TenantID:              tid,
				CreatedAt:             time.Now(),
				CreatedByUserID:       userID,
				CreatedByUserName:     userName,
				CreatedFromIPAddress:  ipAddress,
				ModifiedAt:            time.Now(),
				ModifiedByUserID:      userID,
				ModifiedByUserName:    userName,
				ModifiedFromIPAddress: ipAddress,
				Content:               req.AdditionalComment,
				Status:                com_s.CommentStatusActive,
			}
			err := impl.CommentStorer.Create(sessCtx, comment)
			if err != nil {
				impl.Logger.Error("database create error",
					slog.Any("error", err))
				return nil, err
			}

			impl.Logger.Debug("new comment created",
				slog.Any("commentID", comment.ID))

			//
			// Part 2 of 2.
			//

			oc := &o_s.OrderComment{
				ID:                    comment.ID,
				OrderID:               o.ID,
				OrderWJID:             o.WJID,
				OrderTenantIDWithWJID: fmt.Sprintf("%v_%v", o.TenantID.Hex(), o.WJID),
				TenantID:              comment.TenantID,
				CreatedAt:             comment.CreatedAt,
				CreatedByUserID:       comment.CreatedByUserID,
				CreatedByUserName:     comment.CreatedByUserName,
				CreatedFromIPAddress:  comment.CreatedFromIPAddress,
				ModifiedAt:            comment.ModifiedAt,
				ModifiedByUserID:      comment.ModifiedByUserID,
				ModifiedByUserName:    comment.ModifiedByUserName,
				ModifiedFromIPAddress: comment.ModifiedFromIPAddress,
				Content:               comment.Content,
				Status:                comment.Status,
			}

			// Append comments to order details.
			o.Comments = append(o.Comments, oc)

			if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
				impl.Logger.Error("database update by id error",
					slog.Any("error", err))
				return nil, err
			}

			impl.Logger.Debug("comment added to order",
				slog.Any("commentID", comment.ID),
				slog.Any("orderID", o.ID))
		}

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

		//
		// Create a new task based on a new start date
		//

		ti := &ti_s.TaskItem{
			ID:                                   primitive.NewObjectID(),
			TenantID:                             tid,
			Type:                                 ti_s.TaskItemTypeAssignedAssociate,
			Title:                                "Assign an Associate",
			Description:                          "Please assign an associate to this job.",
			DueDate:                              o.StartDate,
			IsClosed:                             false,
			OrderID:                              o.ID,
			OrderType:                            o.Type,
			OrderWJID:                            o.WJID,
			OrderTenantIDWithWJID:                o.TenantIDWithWJID,
			OrderStartDate:                       o.StartDate,
			OrderDescription:                     o.Description,
			CreatedByUserID:                      userID,
			CreatedByUserName:                    userName,
			CreatedAt:                            time.Now(),
			CreatedFromIPAddress:                 ipAddress,
			ModifiedByUserID:                     userID,
			ModifiedByUserName:                   userName,
			ModifiedAt:                           time.Now(),
			ModifiedFromIPAddress:                ipAddress,
			Status:                               ti_s.TaskItemStatusActive,
			CustomerID:                           cust.ID,
			CustomerOrganizationName:             cust.OrganizationName,
			CustomerOrganizationType:             cust.OrganizationType,
			CustomerFirstName:                    cust.FirstName,
			CustomerLastName:                     cust.LastName,
			CustomerName:                         cust.Name,
			CustomerLexicalName:                  cust.LexicalName,
			CustomerGender:                       cust.Gender,
			CustomerGenderOther:                  cust.GenderOther,
			CustomerBirthdate:                    cust.BirthDate,
			CustomerTags:                         toTaskItemTagsFromCustomerTags(cust.Tags),
			CustomerEmail:                        cust.Email,
			CustomerPhone:                        cust.Phone,
			CustomerPhoneType:                    cust.PhoneType,
			CustomerPhoneExtension:               cust.PhoneExtension,
			CustomerOtherPhone:                   cust.OtherPhone,
			CustomerOtherPhoneType:               cust.OtherPhoneType,
			CustomerOtherPhoneExtension:          cust.OtherPhoneExtension,
			CustomerFullAddressWithoutPostalCode: cust.FullAddressWithoutPostalCode,
			CustomerFullAddressURL:               cust.FullAddressURL,
			OrderSkillSets:                       toTaskItemSkillSetsFromOrderSkillSets(o.SkillSets),
			OrderTags:                            toTaskItemTagsFromOrderTags(o.Tags),
		}
		if err := impl.TaskItemStorer.Create(sessCtx, ti); err != nil {
			impl.Logger.Error("create error",
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("new task created for assign associate operation.",
			slog.Any("orderID", o.ID),
			slog.Any("orderWJID", o.WJID),
			slog.Any("taskID", ti.ID))

		//
		// Attach latest task item to order.
		//

		o.LatestPendingTaskID = ti.ID
		o.LatestPendingTaskTitle = ti.Title
		o.LatestPendingTaskDescription = ti.Description
		o.LatestPendingTaskDueDate = ti.DueDate
		o.LatestPendingTaskType = ti.Type

		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("database update by id error",
				slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("task added to order",
			slog.Any("taskID", ti.ID),
			slog.Any("orderID", o.ID))

		//
		// Update tenant with latest order id's for tenant.
		//

		t.LatestOrderWJID = o.WJID
		t.LatestOrderID = o.ID
		if err := impl.TenantStorer.UpdateByID(sessCtx, t); err != nil {
			impl.Logger.Error("tenant update in database error", slog.Any("error", err))
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
