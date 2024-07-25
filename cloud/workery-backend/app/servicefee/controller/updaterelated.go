package controller

import (
	"log/slog"

	servicefee_s "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/datastore"
	"go.mongodb.org/mongo-driver/mongo"
)

func (impl *ServiceFeeControllerImpl) updateRelatedOrders(sessCtx mongo.SessionContext, sf *servicefee_s.ServiceFee) error {
	list, err := impl.OrderStorer.ListByServiceFeeID(sessCtx, sf.ID)
	if err != nil {
		impl.Logger.Error("database list by orders id error",
			slog.Any("sf_id", sf.ID),
			slog.Any("error", err))
		return err
	}
	for _, o := range list.Results {
		////
		//// Lock this task until completed (including errors as well).
		////

		impl.Kmutex.Lock(o.ID.Hex())
		defer impl.Kmutex.Unlock(o.ID.Hex())

		////
		//// Update associate record.
		////

		o.InvoiceServiceFeeName = sf.Name
		o.InvoiceServiceFeeDescription = sf.Description
		o.InvoiceServiceFeePercentage = sf.Percentage

		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("database update error",
				slog.Any("order_id", o.ID),
				slog.Any("sf_id", sf.ID),
				slog.Any("error", err))
			return err
		}
	}
	return nil
}
