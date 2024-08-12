package controller

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type CustomerOperationUnbanRequest struct {
	CustomerID primitive.ObjectID `bson:"customer_id" json:"customer_id"`
}

func (impl *CustomerControllerImpl) validateOperationUnbanRequest(ctx context.Context, dirtyData *CustomerOperationUnbanRequest) error {
	e := make(map[string]string)

	if dirtyData.CustomerID.IsZero() {
		e["customer_id"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *CustomerControllerImpl) Unban(ctx context.Context, req *CustomerOperationUnbanRequest) (*c_s.Customer, error) {
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
		impl.Logger.Error("you do not have permission to unban")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to unban")
	}

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateOperationUnbanRequest(ctx, req); err != nil {
		impl.Logger.Warn("validation error", slog.Any("error", err))
		return nil, err
	}

	//
	// Fetch the original customer.
	//

	s, err := impl.CustomerStorer.GetByID(ctx, req.CustomerID)
	if err != nil {
		impl.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	if s == nil {
		return nil, nil
	}

	// Tenancy
	if s.TenantID != tid {
		return nil, httperror.NewForForbiddenWithSingleField("security", "you do not belong to this organization")
	}

	// Apply lifting the ban.
	s.IsBanned = false
	s.BannedAt = time.Time{}
	s.BanningReason = 0
	s.BanningReasonOther = ""
	s.ModifiedFromIPAddress = ipAddress
	s.ModifiedByUserID = userID
	s.ModifiedByUserName = userName
	s.ModifiedAt = time.Now()

	// Save to the database the modified customer.
	if err := impl.CustomerStorer.UpdateByID(ctx, s); err != nil {
		impl.Logger.Error("database update by id error", slog.Any("error", err))
		return nil, err
	}

	return s, nil
}

type CustomerOperationBanRequest struct {
	CustomerID         primitive.ObjectID `bson:"customer_id" json:"customer_id"`
	BanningReason      int8               `bson:"banning_reason" json:"banning_reason"`
	BanningReasonOther string             `bson:"banning_reason_other" json:"banning_reason_other"`
}

func (impl *CustomerControllerImpl) validateOperationBanRequest(ctx context.Context, dirtyData *CustomerOperationBanRequest) error {
	e := make(map[string]string)

	if dirtyData.CustomerID.IsZero() {
		e["customer_id"] = "missing value"
	}
	if dirtyData.BanningReason == 0 {
		e["banning_reason"] = "missing value"
	} else if dirtyData.BanningReason == 1 {
		if dirtyData.BanningReasonOther == "" {
			e["banning_reason_other"] = "missing value"
		}
	} else {

	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *CustomerControllerImpl) Ban(ctx context.Context, req *CustomerOperationBanRequest) (*c_s.Customer, error) {
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
		impl.Logger.Error("you do not have permission to unban")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to unban")
	}

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateOperationBanRequest(ctx, req); err != nil {
		impl.Logger.Warn("validation error", slog.Any("error", err))
		return nil, err
	}

	//
	// Fetch the original customer.
	//

	s, err := impl.CustomerStorer.GetByID(ctx, req.CustomerID)
	if err != nil {
		impl.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	if s == nil {
		return nil, nil
	}

	// Tenancy
	if s.TenantID != tid {
		return nil, httperror.NewForForbiddenWithSingleField("security", "you do not belong to this organization")
	}

	// Apply the ban.
	s.IsBanned = true
	s.BannedAt = time.Now()
	s.BanningReason = req.BanningReason
	s.BanningReasonOther = req.BanningReasonOther
	s.ModifiedFromIPAddress = ipAddress
	s.ModifiedByUserID = userID
	s.ModifiedByUserName = userName
	s.ModifiedAt = time.Now()

	// Save to the database the modified customer.
	if err := impl.CustomerStorer.UpdateByID(ctx, s); err != nil {
		impl.Logger.Error("database update by id error", slog.Any("error", err))
		return nil, err
	}

	return s, nil
}
