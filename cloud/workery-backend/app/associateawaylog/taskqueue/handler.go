package taskqueue

import (
	"context"
	"log/slog"

	associate_ds "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	associateawaylog_ds "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/datastore"
	tenant_ds "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
)

// Handler Creates http request handler
type Handler struct {
	Logger                    *slog.Logger
	TenantDatastore           tenant_ds.TenantStorer
	AssociateDatastore        associate_ds.AssociateStorer
	AssociateAwayLogDatastore associateawaylog_ds.AssociateAwayLogStorer
}

// NewHandler Constructor
func NewHandler(
	loggerp *slog.Logger,
	ds1 tenant_ds.TenantStorer,
	ds2 associate_ds.AssociateStorer,
	ds3 associateawaylog_ds.AssociateAwayLogStorer,
) *Handler {
	return &Handler{
		Logger:                    loggerp,
		TenantDatastore:           ds1,
		AssociateDatastore:        ds2,
		AssociateAwayLogDatastore: ds3,
	}
}

func (h *Handler) ProcessPendingTasks(ctx context.Context) error {
	// HOTFIX: Archive incorrectly created away logs from zero-date bug.
	// Only archives logs where the associate's date field is actually zero.
	if err := h.archiveIncorrectAwayLogs(ctx); err != nil {
		h.Logger.Error("failed to run away log cleanup", slog.Any("error", err))
		// Continue processing even if cleanup fails
	}

	tt, err := h.TenantDatastore.ListAllByActiveStatus(ctx)
	if err != nil {
		h.Logger.Error("failed to list associates", slog.Any("error", err))
		return err
	}
	for _, t := range tt.Results {
		h.createAwayLogOnAnyRequiredExpiredDates(ctx, t)
	}

	return nil
}

// archiveIncorrectAwayLogs finds and archives away logs that were incorrectly
// created due to the zero-date bug. Only archives logs where the associate's
// corresponding date field is zero (proving the bug created it).
func (h *Handler) archiveIncorrectAwayLogs(ctx context.Context) error {

	// Get all active away logs with expiry-related reasons
	expiryReasons := []int8{
		associateawaylog_ds.ReasonDuesDateExpired,
		associateawaylog_ds.ReasonPoliceCheckExpired,
		associateawaylog_ds.ReasonCommercialInsuranceExpired,
		associateawaylog_ds.ReasonAutoInsuranceExpired,
		associateawaylog_ds.ReasonWSIBExpired,
	}

	for _, reason := range expiryReasons {
		f := &associateawaylog_ds.AssociateAwayLogPaginationListFilter{
			PageSize: 1_000_000,
			Status:   associateawaylog_ds.StatusActive,
			Reason:   reason,
		}
		logs, err := h.AssociateAwayLogDatastore.ListByFilter(ctx, f)
		if err != nil {
			return err
		}

		for _, log := range logs.Results {
			// Get the associate
			associate, err := h.AssociateDatastore.GetByID(ctx, log.AssociateID)
			if err != nil || associate == nil {
				continue // Skip if associate not found
			}

			// Check if the corresponding date is zero (bug created this log)
			shouldArchive := false
			switch reason {
			case associateawaylog_ds.ReasonDuesDateExpired:
				shouldArchive = associate.DuesDate.IsZero()
			case associateawaylog_ds.ReasonPoliceCheckExpired:
				shouldArchive = associate.PoliceCheck.IsZero()
			case associateawaylog_ds.ReasonCommercialInsuranceExpired:
				shouldArchive = associate.CommercialInsuranceExpiryDate.IsZero()
			case associateawaylog_ds.ReasonAutoInsuranceExpired:
				shouldArchive = associate.AutoInsuranceExpiryDate.IsZero()
			case associateawaylog_ds.ReasonWSIBExpired:
				shouldArchive = associate.WsibInsuranceDate.IsZero()
			}

			if shouldArchive {
				log.Status = associateawaylog_ds.StatusArchived
				if err := h.AssociateAwayLogDatastore.UpdateByID(ctx, log); err != nil {
					h.Logger.Error("failed to archive incorrect away log",
						slog.Any("log_id", log.ID),
						slog.Any("error", err))
				} else {
					h.Logger.Info("archived incorrect away log",
						slog.Any("log_id", log.ID),
						slog.String("associate_name", log.AssociateName),
						slog.Int("reason", int(reason)))
				}
			}
		}
	}
	return nil
}
