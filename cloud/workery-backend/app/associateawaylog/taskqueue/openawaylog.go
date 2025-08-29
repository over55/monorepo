package taskqueue

import (
	"context"
	"log/slog"
	"time"

	ass_ds "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	away_ds "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/datastore"
	tenant_ds "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// createAwayLogOnAnyRequiredExpiredDates is a task that will create away log entries for any associate whom has any required expired dates in their profile.
func (h *Handler) createAwayLogOnAnyRequiredExpiredDates(ctx context.Context, t *tenant_ds.Tenant) error {

	// Iterate through all the active associates and check to see if they have any required expired dates in their profile.
	// If they do, create an away log entry for them.
	// Check if there is already an open away log entry for the same reason, if so, do not create a new one.

	f := &ass_ds.AssociatePaginationListFilter{
		TenantID:  t.ID,
		PageSize:  1_000_000_000, // Essentially unlimited for now.
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

	for _, a := range aa.Results {
		if err := h.createAwayLogOnExpiredDuesDate(ctx, today, a); err != nil {
			h.Logger.Error("failed to create away log on expired dues date",
				slog.Any("error", err))
			return err
		}
		if err := h.createAwayLogOnExpiredPoliceCheck(ctx, today, a); err != nil {
			h.Logger.Error("failed to create away log on expired police check",
				slog.Any("error", err))
			return err
		}
		if err := h.createAwayLogOnExpiredCommercialInsuranceExpiryDate(ctx, today, a); err != nil {
			h.Logger.Error("failed to create away log on expired commercial insurance expiry date",
				slog.Any("error", err))
			return err
		}
		// AutoInsuranceExpiryDate              time.Time                        `bson:"auto_insurance_expiry_date" json:"auto_insurance_expiry_date"`
		// WsibInsuranceDate                    time.Time                        `bson:"wsib_insurance_date" json:"wsib_insurance_date"`

	}
	return nil
}

func (h *Handler) createAwayLogOnExpiredDuesDate(ctx context.Context, today time.Time, a *ass_ds.Associate) error {
	if a.DuesDate.Before(today) {
		f := &away_ds.AssociateAwayLogPaginationListFilter{
			TenantID:    a.TenantID,
			PageSize:    1_000_000,
			SortField:   "created_at",
			SortOrder:   1, // 1=ascending | -1=descending
			Status:      1,
			Reason:      away_ds.ReasonDuesDateExpired,
			AssociateID: a.ID,
		}
		bb, err := h.AssociateAwayLogDatastore.ListByFilter(ctx, f)
		if err != nil {
			h.Logger.Error("failed to list away log for dues date", slog.Any("error", err))
			return err
		}

		if len(bb.Results) > 0 {
			return nil
		}

		h.Logger.Debug("Associate dues date is past due",
			slog.String("associate_id", a.ID.Hex()),
			slog.String("associate_email", a.Email),
			slog.Any("status", a.Status),
			slog.Time("dues_date", a.DuesDate),
			slog.Time("today", today))

		// Else create associate away log.
		c := &away_ds.AssociateAwayLog{
			ID:                   primitive.NewObjectID(),
			TenantID:             a.TenantID,
			AssociateID:          a.ID,
			AssociateName:        a.Name,
			AssociateLexicalName: a.LexicalName,
			Reason:               away_ds.ReasonDuesDateExpired,
			ReasonOther:          "",
			UntilFurtherNotice:   away_ds.UntilFurtherNoticeYes,
			StartDate:            time.Now(),
			Status:               away_ds.StatusActive,
			CreatedAt:            time.Now(),
			ModifiedAt:           time.Now(),
		}
		if err := h.AssociateAwayLogDatastore.Create(ctx, c); err != nil {
			h.Logger.Error("failed to create away log", slog.Any("error", err))
			return err
		}
		h.Logger.Debug("Created away log for associate",
			slog.String("associate_id", a.ID.Hex()),
			slog.Any("Reason", away_ds.ReasonDuesDateExpired))
	}
	return nil
}

func (h *Handler) createAwayLogOnExpiredPoliceCheck(ctx context.Context, today time.Time, a *ass_ds.Associate) error {
	if a.PoliceCheck.Before(today) {
		f := &away_ds.AssociateAwayLogPaginationListFilter{
			TenantID:    a.TenantID,
			PageSize:    1_000_000,
			SortField:   "created_at",
			SortOrder:   1, // 1=ascending | -1=descending
			Status:      1,
			Reason:      away_ds.ReasonPoliceCheckExpired,
			AssociateID: a.ID,
		}
		bb, err := h.AssociateAwayLogDatastore.ListByFilter(ctx, f)
		if err != nil {
			h.Logger.Error("failed to list away log for police checks", slog.Any("error", err))
			return err
		}

		if len(bb.Results) > 0 {
			return nil
		}

		h.Logger.Debug("Associate police check is past due",
			slog.String("associate_id", a.ID.Hex()),
			slog.Any("status", a.Status),
			slog.Time("police_check", a.PoliceCheck),
			slog.Time("today", today))

		// Else create associate away log.
		c := &away_ds.AssociateAwayLog{
			ID:                   primitive.NewObjectID(),
			TenantID:             a.TenantID,
			AssociateID:          a.ID,
			AssociateName:        a.Name,
			AssociateLexicalName: a.LexicalName,
			Reason:               away_ds.ReasonPoliceCheckExpired,
			ReasonOther:          "",
			UntilFurtherNotice:   away_ds.UntilFurtherNoticeYes,
			StartDate:            time.Now(),
			Status:               away_ds.StatusActive,
			CreatedAt:            time.Now(),
			ModifiedAt:           time.Now(),
		}
		if err := h.AssociateAwayLogDatastore.Create(ctx, c); err != nil {
			h.Logger.Error("failed to create police check away log", slog.Any("error", err))
			return err
		}
		h.Logger.Debug("Created police check away log for associate",
			slog.String("associate_id", a.ID.Hex()),
			slog.Any("Reason", away_ds.ReasonDuesDateExpired))
	}
	return nil
}

func (h *Handler) createAwayLogOnExpiredCommercialInsuranceExpiryDate(ctx context.Context, today time.Time, a *ass_ds.Associate) error {
	if a.PoliceCheck.Before(today) {
		f := &away_ds.AssociateAwayLogPaginationListFilter{
			TenantID:    a.TenantID,
			PageSize:    1_000_000,
			SortField:   "created_at",
			SortOrder:   1, // 1=ascending | -1=descending
			Status:      1,
			Reason:      away_ds.ReasonCommercialInsuranceExpired,
			AssociateID: a.ID,
		}
		bb, err := h.AssociateAwayLogDatastore.ListByFilter(ctx, f)
		if err != nil {
			h.Logger.Error("failed to list away log for commercial insurance expiry date", slog.Any("error", err))
			return err
		}

		if len(bb.Results) > 0 {
			return nil
		}

		h.Logger.Debug("Associate is commercial insurance expiry date",
			slog.String("associate_id", a.ID.Hex()),
			slog.Any("status", a.Status),
			slog.Time("commercial_insurance_expiry_date", a.CommercialInsuranceExpiryDate),
			slog.Time("today", today))

		// Else create associate away log.
		c := &away_ds.AssociateAwayLog{
			ID:                   primitive.NewObjectID(),
			TenantID:             a.TenantID,
			AssociateID:          a.ID,
			AssociateName:        a.Name,
			AssociateLexicalName: a.LexicalName,
			Reason:               away_ds.ReasonCommercialInsuranceExpired,
			ReasonOther:          "",
			UntilFurtherNotice:   away_ds.UntilFurtherNoticeYes,
			StartDate:            time.Now(),
			Status:               away_ds.StatusActive,
			CreatedAt:            time.Now(),
			ModifiedAt:           time.Now(),
		}
		if err := h.AssociateAwayLogDatastore.Create(ctx, c); err != nil {
			h.Logger.Error("failed to create commercial insurance expiry date away log", slog.Any("error", err))
			return err
		}
		h.Logger.Debug("Created commercial insurance expiry date away log for associate",
			slog.String("associate_id", a.ID.Hex()),
			slog.Any("Reason", away_ds.ReasonCommercialInsuranceExpired))
	}
	return nil
}
