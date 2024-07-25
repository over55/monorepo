package controller

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	orderincident_s "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type OrderIncidentCreateRequestIDO struct {
	OrderID            string             `bson:"order_id" json:"order_id"`
	FormattedOrderID   primitive.ObjectID `bson:"order_id"`
	FormattedOrderWJID uint64             `bson:"order_id"`
	StartDate          time.Time          `bson:"start_date" json:"start_date"`
	Initiator          int8               `bson:"initiator" json:"initiator"`
	Title              string             `bson:"title" json:"title"`
	Description        string             `bson:"description" json:"description"`
	ClosingReason      int8               `bson:"closing_reason" json:"closing_reason"`
	ClosingReasonOther string             `bson:"closing_reason_other" json:"closing_reason_other"`
}

func ValidateCreateRequest(dirtyData *OrderIncidentCreateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.OrderID == "" || dirtyData.OrderID == "0" {
		e["order_id"] = "missing value"
	} else {
		// if dirtyData.OrderID.IsZero() {
		// 	e["order_id"] = "missing value"
		// }
	}
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

func (impl *OrderIncidentControllerImpl) Create(ctx context.Context, requestData *OrderIncidentCreateRequestIDO) (*orderincident_s.OrderIncident, error) {

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

	// DEVELOPERS NOTE:
	// Every submission needs to have a unique `public id` (PID)
	// generated. The following needs to happen to generate the unique PID:
	// 1. Make the `Create` function be `atomic` and thus lock this function.
	// 2. Count total records in system (for particular tenant).
	// 3. Generate PID.
	// 4. Apply the PID to the record.
	// 5. Unlock this `Create` function to be usable again by other calls after
	//    the function successfully submits the record into our system.
	impl.Kmutex.Lockf("create-orderincident-by-tenant-%s", tid.Hex())
	defer impl.Kmutex.Unlockf("create-orderincident-by-tenant-%s", tid.Hex())

	//
	// Perform our validation and return validation error on any orderincidents detected.
	//

	if err := ValidateCreateRequest(requestData); err != nil {
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
		var o *o_s.Order
		if !requestData.FormattedOrderID.IsZero() {
			o, err = impl.OrderStorer.GetByID(sessCtx, requestData.FormattedOrderID)
			if err != nil {
				impl.Logger.Error("failed getting order",
					slog.Any("error", err))
				return nil, err
			}
		} else {
			o, err = impl.OrderStorer.GetByWJID(sessCtx, requestData.FormattedOrderWJID)
			if err != nil {
				impl.Logger.Error("failed getting order",
					slog.Any("error", err))
				return nil, err
			}
		}
		if o == nil {
			impl.Logger.Error("order does not exist",
				slog.Any("order_id", requestData.OrderID),
				slog.Any("formatted_order_id", requestData.FormattedOrderID),
				slog.Any("formatted_order_wjid", requestData.FormattedOrderWJID))
			return nil, httperror.NewForBadRequestWithSingleField("order_id", "order does not exist")
		}

		count, err := impl.OrderIncidentStorer.CountByTenantID(sessCtx, tid)
		if err != nil {
			impl.Logger.Error("database count error", slog.Any("error", err))
			return nil, err
		}

		// For debugging purposes only.
		impl.Logger.Debug("fetching related",
			slog.String("order_id", o.ID.Hex()),
			slog.Int("order_incident_count", int(count)))

		// Populate the metadata and base data.
		i := &orderincident_s.OrderIncident{}
		i.TenantID = tid
		i.ID = primitive.NewObjectID()
		i.PublicID = uint64(count) + 1
		i.CreatedAt = time.Now()
		i.CreatedByUserID = userID
		i.CreatedByUserName = userName
		i.CreatedFromIPAddress = ipAddress
		i.ModifiedAt = time.Now()
		i.ModifiedByUserID = userID
		i.ModifiedByUserName = userName
		i.ModifiedFromIPAddress = ipAddress
		i.Initiator = requestData.Initiator
		i.Title = requestData.Title
		i.Description = requestData.Description
		i.ClosingReason = requestData.ClosingReason
		i.ClosingReasonOther = requestData.ClosingReasonOther
		i.StartDate = requestData.StartDate
		i.Status = orderincident_s.OrderIncidentStatusActive

		// Populate the related data.
		// --- Order
		i.OrderID = o.ID
		i.OrderType = o.Type
		i.OrderWJID = o.WJID
		i.OrderTenantIDWithWJID = o.TenantIDWithWJID
		// --- Customer
		i.CustomerID = o.CustomerID
		i.CustomerPublicID = o.CustomerPublicID
		i.CustomerOrganizationName = o.CustomerOrganizationName
		i.CustomerOrganizationType = o.CustomerOrganizationType
		i.CustomerFirstName = o.CustomerFirstName
		i.CustomerLastName = o.CustomerLastName
		i.CustomerName = o.CustomerName
		i.CustomerLexicalName = o.CustomerLexicalName
		i.CustomerGender = o.CustomerGender
		i.CustomerGenderOther = o.CustomerGenderOther
		i.CustomerBirthdate = o.CustomerBirthdate
		i.CustomerEmail = o.CustomerEmail
		i.CustomerPhone = o.CustomerPhone
		i.CustomerPhoneType = o.CustomerPhoneType
		i.CustomerPhoneExtension = o.CustomerPhoneExtension
		i.CustomerOtherPhone = o.CustomerOtherPhone
		i.CustomerOtherPhoneExtension = o.CustomerOtherPhoneExtension
		i.CustomerOtherPhoneType = o.CustomerOtherPhoneType
		i.CustomerFullAddressWithoutPostalCode = o.CustomerFullAddressWithoutPostalCode
		i.CustomerFullAddressURL = o.CustomerFullAddressURL
		// --- Associate
		i.AssociateID = o.AssociateID
		i.AssociatePublicID = o.AssociatePublicID
		i.AssociateOrganizationName = o.AssociateOrganizationName
		i.AssociateOrganizationType = o.AssociateOrganizationType
		i.AssociateFirstName = o.AssociateFirstName
		i.AssociateLastName = o.AssociateLastName
		i.AssociateName = o.AssociateName
		i.AssociateLexicalName = o.AssociateLexicalName
		i.AssociateGender = o.AssociateGender
		i.AssociateGenderOther = o.AssociateGenderOther
		i.AssociateBirthdate = o.AssociateBirthdate
		i.AssociateEmail = o.AssociateEmail
		i.AssociatePhone = o.AssociatePhone
		i.AssociatePhoneType = o.AssociatePhoneType
		i.AssociatePhoneExtension = o.AssociatePhoneExtension
		i.AssociateOtherPhone = o.AssociateOtherPhone
		i.AssociateOtherPhoneExtension = o.AssociateOtherPhoneExtension
		i.AssociateOtherPhoneType = o.AssociateOtherPhoneType
		i.AssociateFullAddressWithoutPostalCode = o.AssociateFullAddressWithoutPostalCode
		i.AssociateFullAddressURL = o.AssociateFullAddressURL
		i.AssociateTaxID = o.AssociateTaxID
		i.Comments = make([]*orderincident_s.OrderIncidentComment, 0)

		// Save to our database.
		if err := impl.OrderIncidentStorer.Create(sessCtx, i); err != nil {
			impl.Logger.Error("database create error", slog.Any("error", err))
			return nil, err
		}

		// For debugging purposes only.
		impl.Logger.Debug("created new incident",
			slog.String("order_id", o.ID.Hex()),
			slog.String("incident_id", i.ID.Hex()),
			slog.Int64("incident_public_id", int64(i.PublicID)),
		)

		o.OrderIncidentCount += 1
		o.ModifiedByUserID = sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
		o.ModifiedFromIPAddress = ipAddress
		o.ModifiedAt = time.Now()

		// Save to the database the modified order.
		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("database update by id error", slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("updated order",
			slog.String("order_id", o.ID.Hex()),
			slog.String("order_incident_id", i.ID.Hex()))

		////
		//// Exit our transaction successfully.
		////

		return i, nil
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
