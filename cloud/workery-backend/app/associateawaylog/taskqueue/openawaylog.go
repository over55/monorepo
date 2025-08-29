package taskqueue

import (
	"context"
	"log/slog"
	"time"

	ass_ds "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	tenant_ds "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
)

// createAwayLogOnAnyRequiredExpiredDates is a task that will create away log entries for any associate whom has any required expired dates in their profile.
func (h *Handler) createAwayLogOnAnyRequiredExpiredDates(ctx context.Context, t *tenant_ds.Tenant) error {

	// Iterate through all the active associates and check to see if they have any required expired dates in their profile.
	// If they do, create an away log entry for them.
	// Check if there is already an open away log entry for the same reason, if so, do not create a new one.

	f := &ass_ds.AssociatePaginationListFilter{
		TenantID:  t.ID,
		PageSize:  1_000_000_000,
		SortField: "created_at",
		SortOrder: ass_ds.OrderAscending,
		Status:    ass_ds.AssociateStatusActive,
	}
	aa, err := h.AssociateDatastore.ListByFilter(ctx, f)
	if err != nil {
		h.Logger.Error("failed to list associates", slog.Any("error", err))
		return err
	}

	today := time.Now()
	_ = today

	for _, a := range aa.Results {
		if err := h.createAwayLogOnExpiredDuesDate(ctx, today, a); err != nil {
			h.Logger.Error("failed to create away log on expired dues date", slog.Any("error", err))
			return err
		}

		// CommercialInsuranceExpiryDate        time.Time                        `bson:"commercial_insurance_expiry_date" json:"commercial_insurance_expiry_date"`
		// AutoInsuranceExpiryDate              time.Time                        `bson:"auto_insurance_expiry_date" json:"auto_insurance_expiry_date"`
		// WsibInsuranceDate                    time.Time                        `bson:"wsib_insurance_date" json:"wsib_insurance_date"`
		// PoliceCheck                          time.Time                        `bson:"police_check" json:"police_check"`

		_ = a
	}
	return nil
}

func (h *Handler) createAwayLogOnExpiredDuesDate(ctx context.Context, today time.Time, a *ass_ds.Associate) error {
	if a.DuesDate.Before(today) {
		h.Logger.Debug("Associate dues date is past due",
			slog.String("associate_id", a.ID.Hex()),
			slog.Time("dues_date", a.DuesDate),
			slog.Time("today", today))

		// Check to see if already have a due date expired away log.
		// If already exists then exit.
		// Else create associate away log.
	}
	return nil
}
