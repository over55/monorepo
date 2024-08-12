package controller

import (
	"context"
	"time"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	s_s "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type StaffOperationDowngradeRequest struct {
	StaffID primitive.ObjectID `bson:"staff_id" json:"staff_id"`
}

func (impl *StaffControllerImpl) validateOperationDowngradeRequest(ctx context.Context, dirtyData *StaffOperationDowngradeRequest) error {
	e := make(map[string]string)

	if dirtyData.StaffID.IsZero() {
		e["staff_id"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *StaffControllerImpl) Downgrade(ctx context.Context, req *StaffOperationDowngradeRequest) (*s_s.Staff, error) {
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
	// Fetch the original staff.
	//

	s, err := impl.StaffStorer.GetByID(ctx, req.StaffID)
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
	s.Type = s_s.StaffTypeFrontlineStaff
	s.ModifiedFromIPAddress = ipAddress
	s.ModifiedByUserID = userID
	s.ModifiedByUserName = userName
	s.ModifiedAt = time.Now()

	// Save to the database the modified staff.
	if err := impl.StaffStorer.UpdateByID(ctx, s); err != nil {
		impl.Logger.Error("database update by id error", slog.Any("error", err))
		return nil, err
	}

	return s, nil
}

type StaffOperationUpgradeRequest struct {
	StaffID primitive.ObjectID `bson:"staff_id" json:"staff_id"`
}

func (impl *StaffControllerImpl) validateOperationUpgradeRequest(ctx context.Context, dirtyData *StaffOperationUpgradeRequest) error {
	e := make(map[string]string)

	if dirtyData.StaffID.IsZero() {
		e["staff_id"] = "missing value"
	}
	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *StaffControllerImpl) Upgrade(ctx context.Context, req *StaffOperationUpgradeRequest) (*s_s.Staff, error) {
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
	// Fetch the original staff.
	//

	s, err := impl.StaffStorer.GetByID(ctx, req.StaffID)
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
	s.Type = s_s.StaffTypeManagement
	s.ModifiedFromIPAddress = ipAddress
	s.ModifiedByUserID = userID
	s.ModifiedByUserName = userName
	s.ModifiedAt = time.Now()

	// Save to the database the modified staff.
	if err := impl.StaffStorer.UpdateByID(ctx, s); err != nil {
		impl.Logger.Error("database update by id error", slog.Any("error", err))
		return nil, err
	}

	return s, nil
}
