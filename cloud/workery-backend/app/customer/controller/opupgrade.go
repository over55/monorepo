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

type CustomerOperationDowngradeRequest struct {
	CustomerID primitive.ObjectID `bson:"customer_id" json:"customer_id"`
}

func (impl *CustomerControllerImpl) validateOperationDowngradeRequest(ctx context.Context, dirtyData *CustomerOperationDowngradeRequest) error {
	e := make(map[string]string)

	if dirtyData.CustomerID.IsZero() {
		e["customer_id"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *CustomerControllerImpl) Downgrade(ctx context.Context, req *CustomerOperationDowngradeRequest) (*c_s.Customer, error) {
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
		impl.Logger.Error("you do not have permission to downgrade")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to downgrade")
	}

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateOperationDowngradeRequest(ctx, req); err != nil {
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

	// Add our comment to the comments.
	s.Type = c_s.CustomerTypeResidential
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

type CustomerOperationUpgradeRequest struct {
	CustomerID       primitive.ObjectID `bson:"customer_id" json:"customer_id"`
	OrganizationName string             `bson:"organization_name" json:"organization_name"`
	OrganizationType int8               `bson:"organization_type" json:"organization_type"`
}

func (impl *CustomerControllerImpl) validateOperationUpgradeRequest(ctx context.Context, dirtyData *CustomerOperationUpgradeRequest) error {
	e := make(map[string]string)

	if dirtyData.CustomerID.IsZero() {
		e["customer_id"] = "missing value"
	}
	if dirtyData.OrganizationName == "" {
		e["organization_name"] = "missing value"
	}
	if dirtyData.OrganizationType == 0 {
		e["organization_type"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *CustomerControllerImpl) Upgrade(ctx context.Context, req *CustomerOperationUpgradeRequest) (*c_s.Customer, error) {
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
		impl.Logger.Error("you do not have permission to downgrade")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to downgrade")
	}

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateOperationUpgradeRequest(ctx, req); err != nil {
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

	// Add our comment to the comments.
	s.Type = c_s.CustomerTypeCommercial
	s.OrganizationName = req.OrganizationName
	s.OrganizationType = req.OrganizationType
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