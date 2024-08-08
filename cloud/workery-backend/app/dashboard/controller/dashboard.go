package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/sync/errgroup"

	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	away_s "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/datastore"
	b_s "github.com/over55/monorepo/cloud/workery-backend/app/bulletin/datastore"
	com_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	cust_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	ti_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type DashboardResponseIDO struct {
	ClientsCount       int64                      `json:"clients_count"`
	AssociatesCount    int64                      `json:"associates_count"`
	JobsCount          int64                      `json:"jobs_count"`
	TasksCount         int64                      `json:"tasks_count"`
	Bulletins          []*b_s.Bulletin            `json:"bulletins"`
	AssociateAwayLogs  []*away_s.AssociateAwayLog `json:"associate_away_logs"`
	UserJobHistory     []*o_s.OrderLite           `json:"user_job_history"`
	TeamJobHistory     []*o_s.OrderLite           `json:"team_job_history"`
	PastFewDayComments []*com_s.Comment           `json:"past_few_day_comments"`
}

func (impl *DashboardControllerImpl) getActiveClientsCount(ctx context.Context, tenantID primitive.ObjectID) (int64, error) {
	f := &cust_s.CustomerPaginationListFilter{
		TenantID: tenantID,
		Status:   u_s.UserStatusActive,
	}
	count, err := impl.CustomerStorer.CountByFilter(ctx, f)
	if err != nil {
		impl.Logger.Error("database count error", slog.Any("err", err))
		return count, err
	}
	return count, nil
}

func (impl *DashboardControllerImpl) getActiveAssociatesCount(ctx context.Context, tenantID primitive.ObjectID) (int64, error) {
	f := &a_s.AssociatePaginationListFilter{
		TenantID: tenantID,
		Status:   a_s.AssociateStatusActive,
	}
	count, err := impl.AssociateStorer.CountByFilter(ctx, f)
	if err != nil {
		impl.Logger.Error("database count error", slog.Any("err", err))
		return count, err
	}
	return count, nil
}

func (impl *DashboardControllerImpl) getActiveJobsCount(ctx context.Context, tenantID primitive.ObjectID) (int64, error) {
	f := &o_s.OrderPaginationListFilter{
		TenantID: tenantID,
		Statuses: []int8{
			o_s.OrderStatusNew,
			o_s.OrderStatusPending,
			o_s.OrderStatusInProgress,
		},
	}
	count, err := impl.OrderStorer.CountByFilter(ctx, f)
	if err != nil {
		impl.Logger.Error("database count error", slog.Any("err", err))
		return count, err
	}
	return count, nil
}

func (impl *DashboardControllerImpl) getActiveTasksCount(ctx context.Context, tenantID primitive.ObjectID) (int64, error) {
	f := &ti_s.TaskItemPaginationListFilter{
		TenantID: tenantID,
		Status:   ti_s.TaskItemStatusActive,
		IsClosed: 2, //0=all,1=true,2=false
	}
	count, err := impl.TaskItemStorer.CountByFilter(ctx, f)
	if err != nil {
		impl.Logger.Error("database count error", slog.Any("err", err))
		return count, err
	}
	return count, nil
}

func (impl *DashboardControllerImpl) getAwayLogs(ctx context.Context, tenantID primitive.ObjectID) ([]*away_s.AssociateAwayLog, error) {
	f := &away_s.AssociateAwayLogPaginationListFilter{
		Cursor:    "",
		PageSize:  1_000_000,
		SortField: "created_at",
		SortOrder: -1,
		TenantID:  tenantID,
		Status:    away_s.AssociateAwayLogStatusActive,
	}
	res, err := impl.AssociateAwayLogStorer.ListByFilter(ctx, f)
	if err != nil {
		impl.Logger.Error("database list error", slog.Any("err", err))
		return nil, err
	}
	return res.Results, nil
}

func (impl *DashboardControllerImpl) getUserJobHistory(ctx context.Context, tenantID, userID primitive.ObjectID) ([]*o_s.OrderLite, error) {
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

func (impl *DashboardControllerImpl) getTeamJobHistory(ctx context.Context, tenantID primitive.ObjectID) ([]*o_s.OrderLite, error) {
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

func (impl *DashboardControllerImpl) getBulletins(ctx context.Context, tenantID primitive.ObjectID) ([]*b_s.Bulletin, error) {
	f := &b_s.BulletinPaginationListFilter{
		Cursor:    "",
		PageSize:  1_000_000,
		SortField: "created_at",
		SortOrder: b_s.OrderDescending,
		TenantID:  tenantID,
		Status:    b_s.BulletinStatusActive,
	}
	res, err := impl.BulletinStorer.ListByFilter(ctx, f)
	if err != nil {
		impl.Logger.Error("database list error", slog.Any("err", err))
		return nil, err
	}
	return res.Results, nil
}

func (impl *DashboardControllerImpl) getOrderComments(ctx context.Context, tenantID primitive.ObjectID) ([]*com_s.Comment, error) {
	f := &com_s.CommentPaginationListFilter{
		Cursor:    "",
		PageSize:  10,
		SortField: "created_at",
		SortOrder: -1,
		TenantID:  tenantID,
		BelongsTo: com_s.BelongsToOrder,
	}
	res, err := impl.CommentStorer.ListByFilter(ctx, f)
	if err != nil {
		impl.Logger.Error("database list error", slog.Any("err", err))
		return nil, err
	}
	return res.Results, nil
}

func (impl *DashboardControllerImpl) Dashboard(ctx context.Context) (*DashboardResponseIDO, error) {
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

	var clientsCount, jobsCount, associatesCount, tasksCount int64
	var bulletins []*b_s.Bulletin
	var userJobHistory, teamJobHistory []*o_s.OrderLite
	var associateAwayLogs []*away_s.AssociateAwayLog
	var pastFewDayComments []*com_s.Comment

	////
	//// Get counts concurrently.
	////
	g.Go(func() error {
		count, err := impl.getActiveClientsCount(ctx, tenantID)
		if err != nil {
			return err
		}
		clientsCount = count
		return nil
	})
	g.Go(func() error {
		count, err := impl.getActiveJobsCount(ctx, tenantID)
		if err != nil {
			return err
		}
		jobsCount = count
		return nil
	})
	g.Go(func() error {
		count, err := impl.getActiveAssociatesCount(ctx, tenantID)
		if err != nil {
			return err
		}
		associatesCount = count
		return nil
	})
	g.Go(func() error {
		count, err := impl.getActiveTasksCount(ctx, tenantID)
		if err != nil {
			return err
		}
		tasksCount = count
		return nil
	})

	////
	//// Get bulletins concurrently.
	////
	g.Go(func() error {
		bbs, err := impl.getBulletins(ctx, tenantID)
		if err != nil {
			return err
		}
		bulletins = bbs
		return nil
	})

	////
	//// Get user job history concurrently.
	////
	g.Go(func() error {
		history, err := impl.getUserJobHistory(ctx, tenantID, userID)
		if err != nil {
			return err
		}
		userJobHistory = history
		return nil
	})

	////
	//// Get associate away logs concurrently.
	////
	g.Go(func() error {
		logs, err := impl.getAwayLogs(ctx, tenantID)
		if err != nil {
			return err
		}
		associateAwayLogs = logs
		return nil
	})

	////
	//// Get team job history concurrently.
	////
	g.Go(func() error {
		history, err := impl.getTeamJobHistory(ctx, tenantID)
		if err != nil {
			return err
		}
		teamJobHistory = history
		return nil
	})

	////
	//// Get past few days' comments concurrently.
	////
	g.Go(func() error {
		comments, err := impl.getOrderComments(ctx, tenantID)
		if err != nil {
			return err
		}
		pastFewDayComments = comments
		return nil
	})

	// Wait for all goroutines to finish
	if err := g.Wait(); err != nil {
		impl.Logger.Error("error in concurrent execution", slog.Any("error", err))
		return nil, err
	}

	// Return the response
	return &DashboardResponseIDO{
		ClientsCount:       clientsCount,
		AssociatesCount:    associatesCount,
		JobsCount:          jobsCount,
		TasksCount:         tasksCount,
		Bulletins:          bulletins,
		UserJobHistory:     userJobHistory,
		AssociateAwayLogs:  associateAwayLogs,
		TeamJobHistory:     teamJobHistory,
		PastFewDayComments: pastFewDayComments,
	}, nil
}
