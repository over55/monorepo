package controller

import (
	"context"
	"time"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	org_d "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type UpdateTaxRateOperationRequestIDO struct {
	TenantID primitive.ObjectID `bson:"tenant_id" json:"tenant_id"`
	TaxRate  float64            `bson:"tax_rate" json:"tax_rate"`
}

func (impl *TenantControllerImpl) validateUpdateTaxRateOperationRequest(ctx context.Context, dirtyData *UpdateTaxRateOperationRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.TenantID.IsZero() {
		e["tenant_id"] = "missing value"
	}
	if dirtyData.TaxRate == 0 {
		e["tax_rate"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *TenantControllerImpl) UpdateTaxRateOperation(ctx context.Context, requestData *UpdateTaxRateOperationRequestIDO) (*org_d.Tenant, error) {
	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateUpdateTaxRateOperationRequest(ctx, requestData); err != nil {
		impl.Logger.Warn("validation error", slog.Any("error", err))
		return nil, err
	}

	// Fetch the original customer.
	t, err := impl.TenantStorer.GetByID(ctx, requestData.TenantID)
	if err != nil {
		impl.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	if t == nil {
		impl.Logger.Error("Tenant does not exist error",
			slog.Any("Tenant_id", requestData.TenantID))
		return nil, httperror.NewForBadRequestWithSingleField("message", "Tenant does not exist")
	}

	// Add our comment to the comments.
	t.ModifiedByUserID = ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	t.ModifiedAt = time.Now()
	t.TaxRate = requestData.TaxRate

	// Save to the database the modified customer.
	if err := impl.TenantStorer.UpdateByID(ctx, t); err != nil {
		impl.Logger.Error("database update by id error", slog.Any("error", err))
		return nil, err
	}

	return t, nil
}
