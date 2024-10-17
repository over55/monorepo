package controller

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/sync/errgroup"

	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type JobHistoryResponseIDO struct {
	UserJobHistory []*o_s.OrderLite `json:"user_job_history"`
	TeamJobHistory []*o_s.OrderLite `json:"team_job_history"`
}

func (impl *JobHistoryControllerImpl) getUserJobHistory(ctx context.Context, tenantID, userID primitive.ObjectID) ([]*o_s.OrderLite, error) {
	startTime := time.Now() // Capture the start time
	defer func() {
		duration := time.Since(startTime).Seconds() // Calculate the duration in seconds
		impl.Logger.Debug("executed",
			slog.String("func", "getUserJobHistory"),
			slog.Float64("duration_seconds", duration),
		)
	}()

	f := &o_s.OrderPaginationListFilter{
		Cursor:           "",
		PageSize:         5,
		SortField:        "created_at",
		SortOrder:        o_s.SortOrderDescending,
		TenantID:         tenantID,
		ModifiedByUserID: userID,
	}
	res, err := impl.OrderStorer.LiteListByFilter(ctx, f)
	if err != nil {
		impl.Logger.Error("database list error", slog.Any("err", err))
		return nil, err
	}
	return res.Results, nil
}

func (impl *JobHistoryControllerImpl) getTeamJobHistory(ctx context.Context, tenantID primitive.ObjectID) ([]*o_s.OrderLite, error) {
	startTime := time.Now() // Capture the start time
	defer func() {
		duration := time.Since(startTime).Seconds() // Calculate the duration in seconds
		impl.Logger.Debug("executed",
			slog.String("func", "getTeamJobHistory"),
			slog.Float64("duration_seconds", duration),
		)
	}()

	f := &o_s.OrderPaginationListFilter{
		Cursor:    "",
		PageSize:  10,
		SortField: "created_at",
		SortOrder: o_s.SortOrderDescending,
		TenantID:  tenantID,
	}
	res, err := impl.OrderStorer.LiteListByFilter(ctx, f)
	if err != nil {
		impl.Logger.Error("database list error", slog.Any("err", err))
		return nil, err
	}
	return res.Results, nil
}

func (impl *JobHistoryControllerImpl) JobHistory(ctx context.Context, filterBy string) (*JobHistoryResponseIDO, error) {
	startTime := time.Now() // Capture the start time
	defer func() {
		duration := time.Since(startTime).Seconds() // Calculate the duration in seconds
		impl.Logger.Debug("executed",
			slog.String("func", "JobHistory"),
			slog.Float64("duration_seconds", duration),
		)
	}()

	// Extract from our session the following data.
	tenantID, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)
	proxies, _ := ctx.Value(constants.SessionProxies).(string)

	// Lookup the user in our database, else return a `400 Bad Request` error.
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

	// Initialize errgroup
	var g errgroup.Group

	var userJobHistory, teamJobHistory []*o_s.OrderLite

	////
	//// Get counts concurrently.
	////

	////
	//// Get user job history concurrently.  // DEPRECATED
	////
	if filterBy == "user_job_history" {
		g.Go(func() error {
			history, err := impl.getUserJobHistory(ctx, tenantID, userID)
			if err != nil {
				return err
			}
			userJobHistory = history
			return nil
		})
	}

	////
	//// Get team job history concurrently.  // DEPRECATED
	////
	if filterBy == "team_job_history" {
		g.Go(func() error {
			history, err := impl.getTeamJobHistory(ctx, tenantID)
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
