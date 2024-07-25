package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

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

	// Lookup the user in our database, else return a `400 Bad Request` error.
	u, err := impl.UserStorer.GetByID(ctx, userID)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return nil, err
	}
	if u == nil {
		impl.Logger.Warn("user does not exist validation error")
		return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
	}

	////
	//// Get counts.
	////

	ccCh := make(chan int64)
	go func(tid primitive.ObjectID) {
		clientsCount, err := impl.getActiveClientsCount(ctx, tid)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			ccCh <- 0
		} else {
			ccCh <- clientsCount
		}
	}(tenantID)

	jcCh := make(chan int64)
	go func(tid primitive.ObjectID) {
		jobsCount, err := impl.getActiveJobsCount(ctx, tid)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			jcCh <- 0
		} else {
			jcCh <- jobsCount
		}
	}(tenantID)

	mcCh := make(chan int64)
	go func(tid primitive.ObjectID) {
		associatesCount, err := impl.getActiveAssociatesCount(ctx, tenantID)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			mcCh <- 0
		} else {
			mcCh <- associatesCount
		}
	}(tenantID)

	tcCh := make(chan int64)
	go func(tid primitive.ObjectID) {
		tasksCount, err := impl.getActiveTasksCount(ctx, tid)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			tcCh <- 0
		} else {
			tcCh <- tasksCount
		}
	}(tenantID)

	////
	//// Get bulletins.
	////

	bbiCh := make(chan []*b_s.Bulletin)
	go func(tid primitive.ObjectID) {
		arr, err := impl.getBulletins(ctx, tenantID)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			bbiCh <- []*b_s.Bulletin{}
		} else {
			bbiCh <- arr[:]
		}
	}(tenantID)

	////
	//// Job History ("last_modified_jobs_by_user".)
	////

	lmbuCh := make(chan []*o_s.OrderLite)
	go func(tid primitive.ObjectID) {
		arr, err := impl.getUserJobHistory(ctx, tenantID, userID)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			lmbuCh <- []*o_s.OrderLite{}
		} else {
			lmbuCh <- arr[:]
		}
	}(tenantID)

	////
	//// Get away logs.
	////

	alCh := make(chan []*away_s.AssociateAwayLog)
	go func(tid primitive.ObjectID) {
		arr, err := impl.getAwayLogs(ctx, tenantID)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			alCh <- []*away_s.AssociateAwayLog{}
		} else {
			alCh <- arr[:]
		}
	}(tenantID)

	////
	//// Get team job history
	////

	lmbtCh := make(chan []*o_s.OrderLite)
	go func(tid primitive.ObjectID) {
		arr, err := impl.getTeamJobHistory(ctx, tenantID)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			lmbtCh <- []*o_s.OrderLite{}
		} else {
			lmbtCh <- arr[:]
		}
	}(tenantID)

	////
	//// Get comments
	////

	ocCh := make(chan []*com_s.Comment)
	go func(tid primitive.ObjectID) {
		arr, err := impl.getOrderComments(ctx, tenantID)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			ocCh <- []*com_s.Comment{}
		} else {
			ocCh <- arr[:]
		}
	}(tenantID)

	////
	//// Wait until all goroutines are finished executing.
	////

	cc, jc, mc, tc, bbi, al, lmbu, lmbt, oc := <-ccCh, <-jcCh, <-mcCh, <-tcCh, <-bbiCh, <-alCh, <-lmbuCh, <-lmbtCh, <-ocCh

	////
	//// Return the response.
	////

	res := &DashboardResponseIDO{
		ClientsCount:       cc,
		AssociatesCount:    mc,
		JobsCount:          jc,
		TasksCount:         tc,
		Bulletins:          bbi,
		UserJobHistory:     lmbu,
		AssociateAwayLogs:  al,
		TeamJobHistory:     lmbt,
		PastFewDayComments: oc,
	}
	return res, nil
}
