package controller

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/sync/errgroup"

	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type JobHistoryResponseIDO struct {
	UserJobHistory []*o_s.OrderLite `json:"user_job_history"`
	TeamJobHistory []*o_s.OrderLite `json:"team_job_history"`
}

func (impl *JobHistoryControllerImpl) getUserJobHistory(ctx context.Context, tenantID, userID primitive.ObjectID, userRoleID int8) ([]*o_s.OrderLite, error) {
	startTime := time.Now()
	defer func() {
		duration := time.Since(startTime).Seconds()
		impl.Logger.Debug("executed",
			slog.String("func", "getUserJobHistory"),
			slog.Float64("duration_seconds", duration),
		)
	}()

	f := &o_s.OrderPaginationListFilter{
		Cursor:           "",
		PageSize:         5,
		SortField:        "modified_at",
		SortOrder:        o_s.SortOrderDescending,
		TenantID:         tenantID,
		ModifiedByUserID: userID,
	}

	// Apply role-based filtering
	switch userRoleID {
	case user_s.UserRoleExecutive, user_s.UserRoleManagement, user_s.UserRoleStaff:
		// Staff can see orders they modified
		impl.Logger.Debug("staff viewing their modified orders",
			slog.Any("user_id", userID),
			slog.Any("role", userRoleID))
	case user_s.UserRoleAssociate:
		// Associates can see orders they modified OR are assigned to
		associateID, _ := ctx.Value(constants.SessionUserReferenceID).(primitive.ObjectID)
		// We'll get orders where they are modified by user OR assigned to them
		// Since we can't do OR in this filter easily, we'll just get modified ones
		impl.Logger.Debug("associate viewing their modified orders",
			slog.Any("associate_id", associateID),
			slog.Any("user_id", userID))
	case user_s.UserRoleCustomer:
		// Customers can see orders they are associated with
		customerID, _ := ctx.Value(constants.SessionUserReferenceID).(primitive.ObjectID)
		f.CustomerID = customerID
		f.ModifiedByUserID = primitive.ObjectID{} // Clear this filter for customers
		impl.Logger.Debug("customer viewing their orders",
			slog.Any("customer_id", customerID))
	}

	res, err := impl.OrderStorer.LiteListByFilter(ctx, f)
	if err != nil {
		impl.Logger.Error("database list error", slog.Any("err", err))
		return nil, err
	}
	return res.Results, nil
}

func (impl *JobHistoryControllerImpl) getTeamJobHistory(ctx context.Context, tenantID primitive.ObjectID, userRoleID int8) ([]*o_s.OrderLite, error) {
	startTime := time.Now()
	defer func() {
		duration := time.Since(startTime).Seconds()
		impl.Logger.Debug("executed",
			slog.String("func", "getTeamJobHistory"),
			slog.Float64("duration_seconds", duration),
		)
	}()

	f := &o_s.OrderPaginationListFilter{
		Cursor:    "",
		PageSize:  10,
		SortField: "modified_at",
		SortOrder: o_s.SortOrderDescending,
		TenantID:  tenantID,
	}

	// Apply role-based filtering for team view
	switch userRoleID {
	case user_s.UserRoleExecutive, user_s.UserRoleManagement, user_s.UserRoleStaff:
		// Staff can see all orders in their tenant
		impl.Logger.Debug("staff viewing team orders",
			slog.Any("role", userRoleID))
	case user_s.UserRoleAssociate:
		// Associates can only see orders they're assigned to for team view
		associateID, _ := ctx.Value(constants.SessionUserReferenceID).(primitive.ObjectID)
		f.AssociateID = associateID
		impl.Logger.Debug("associate viewing their assigned orders",
			slog.Any("associate_id", associateID))
	case user_s.UserRoleCustomer:
		// Customers can only see their own orders for team view
		customerID, _ := ctx.Value(constants.SessionUserReferenceID).(primitive.ObjectID)
		f.CustomerID = customerID
		impl.Logger.Debug("customer viewing their orders",
			slog.Any("customer_id", customerID))
	}

	res, err := impl.OrderStorer.LiteListByFilter(ctx, f)
	if err != nil {
		impl.Logger.Error("database list error", slog.Any("err", err))
		return nil, err
	}
	return res.Results, nil
}

func (impl *JobHistoryControllerImpl) JobHistory(ctx context.Context, filterBy string) (*JobHistoryResponseIDO, error) {
	startTime := time.Now()
	defer func() {
		duration := time.Since(startTime).Seconds()
		impl.Logger.Debug("executed",
			slog.String("func", "JobHistory"),
			slog.Float64("duration_seconds", duration),
		)
	}()

	// Extract from our session the following data.
	tenantID, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userRoleID, _ := ctx.Value(constants.SessionUserRole).(int8)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)
	proxies, _ := ctx.Value(constants.SessionProxies).(string)

	// Log the request
	impl.Logger.Debug("job history request",
		slog.String("filter_by", filterBy),
		slog.Any("user_id", userID),
		slog.Any("role", userRoleID),
		slog.String("ip_address", ipAddress),
		slog.String("proxies", proxies))

	// Validate user exists
	u, err := impl.UserStorer.GetByID(ctx, userID)
	if err != nil {
		impl.Logger.Error("database error",
			slog.String("ip_address", ipAddress),
			slog.String("proxies", proxies),
			slog.Any("err", err))
		return nil, err
	}
	if u == nil {
		impl.Logger.Warn("user does not exist validation error")
		return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
	}

	// Check permissions based on role
	switch userRoleID {
	case user_s.UserRoleExecutive, user_s.UserRoleManagement, user_s.UserRoleStaff, user_s.UserRoleAssociate, user_s.UserRoleCustomer:
		// All these roles are allowed to view job history
		impl.Logger.Debug("user has permission to view job history",
			slog.Any("role", userRoleID))
	default:
		impl.Logger.Warn("user does not have permission", slog.Any("role", userRoleID))
		return nil, httperror.NewForForbiddenWithSingleField("role", "you do not have permission to view job history")
	}

	// Initialize errgroup
	var g errgroup.Group

	var userJobHistory, teamJobHistory []*o_s.OrderLite

	// Get user job history concurrently
	if filterBy == "user_job_history" {
		g.Go(func() error {
			history, err := impl.getUserJobHistory(ctx, tenantID, userID, userRoleID)
			if err != nil {
				return err
			}
			userJobHistory = history
			return nil
		})
	}

	// Get team job history concurrently
	if filterBy == "team_job_history" {
		g.Go(func() error {
			history, err := impl.getTeamJobHistory(ctx, tenantID, userRoleID)
			if err != nil {
				return err
			}
			teamJobHistory = history
			return nil
		})
	}

	// Wait for all goroutines to finish
	if err := g.Wait(); err != nil {
		impl.Logger.Error("error in concurrent execution", slog.Any("error", err))
		return nil, err
	}

	// Return the response
	return &JobHistoryResponseIDO{
		UserJobHistory: userJobHistory,
		TeamJobHistory: teamJobHistory,
	}, nil
}
