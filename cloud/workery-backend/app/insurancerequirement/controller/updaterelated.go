package controller

import (
	"log/slog"

	"go.mongodb.org/mongo-driver/mongo"

	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	ir_s "github.com/over55/monorepo/cloud/workery-backend/app/insurancerequirement/datastore"
)

// UpdateRelatedByAssociates function will take the inputted `order` with the associate.
func (impl *InsuranceRequirementControllerImpl) updateRelatedByAssociates(sessCtx mongo.SessionContext, ir *ir_s.InsuranceRequirement) error {
	list, err := impl.AssociateStorer.ListByInsuranceRequirementID(sessCtx, ir.ID)
	if err != nil {
		impl.Logger.Error("database list by associate id error",
			slog.Any("ir_id", ir.ID),
			slog.Any("error", err))
		return err
	}
	for _, a := range list.Results {
		////
		//// Lock this task until completed (including errors as well).
		////

		impl.Kmutex.Lock(a.ID.Hex())
		defer impl.Kmutex.Unlock(a.ID.Hex())

		////
		//// Update associate record.
		////

		a.Name = ir.Name
		a.Description = ir.Description
		a.Status = ir.Status
		if err := impl.AssociateStorer.UpdateByID(sessCtx, a); err != nil {
			impl.Logger.Error("database update error",
				slog.Any("associate_id", a.ID),
				slog.Any("ir_id", ir.ID),
				slog.Any("error", err))
			return err
		}

		////
		//// Update order record.
		////

		if err := impl.updateOrderInsuranceRequirementsRelatedByAssociate(sessCtx, a, ir); err != nil {
			impl.Logger.Error("failed updating related",
				slog.Any("associate_id", a.ID),
				slog.Any("ir_id", ir.ID),
				slog.Any("error", err))
			return err
		}
		if err := impl.updateTaskItemInsuranceRequirementsRelatedByAssociate(sessCtx, a, ir); err != nil {
			impl.Logger.Error("failed updating related",
				slog.Any("associate_id", a.ID),
				slog.Any("ir_id", ir.ID),
				slog.Any("error", err))
			return err
		}
	}
	return nil
}

func (impl *InsuranceRequirementControllerImpl) updateOrderInsuranceRequirementsRelatedByAssociate(sessCtx mongo.SessionContext, a *a_s.Associate, ir *ir_s.InsuranceRequirement) error {
	list, err := impl.OrderStorer.ListByAssociateID(sessCtx, a.ID)
	if err != nil {
		impl.Logger.Error("database list by associate id error",
			slog.Any("ir_id", ir.ID),
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

		for _, oir := range o.AssociateInsuranceRequirements {
			if oir.ID == ir.ID {
				oir.Name = ir.Name
				oir.Description = ir.Description
				oir.Status = ir.Status
			}
		}
		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("failed updating",
				slog.Any("associate_id", a.ID),
				slog.Any("ir_id", ir.ID),
				slog.Any("error", err))
			return err
		}
	}
	return nil
}

func (impl *InsuranceRequirementControllerImpl) updateTaskItemInsuranceRequirementsRelatedByAssociate(sessCtx mongo.SessionContext, a *a_s.Associate, ir *ir_s.InsuranceRequirement) error {
	list, err := impl.TaskItemStorer.ListByAssociateID(sessCtx, a.ID)
	if err != nil {
		impl.Logger.Error("database list by associate id error",
			slog.Any("ir_id", ir.ID),
			slog.Any("error", err))
		return err
	}
	for _, ti := range list.Results {
		////
		//// Lock this task until completed (including errors as well).
		////

		impl.Kmutex.Lock(ti.ID.Hex())
		defer impl.Kmutex.Unlock(ti.ID.Hex())

		////
		//// Update associate record.
		////

		for _, tiir := range ti.AssociateInsuranceRequirements {
			if tiir.ID == ir.ID {
				tiir.Name = ir.Name
				tiir.Description = ir.Description
				tiir.Status = ir.Status
			}
		}
		if err := impl.TaskItemStorer.UpdateByID(sessCtx, ti); err != nil {
			impl.Logger.Error("failed updating",
				slog.Any("associate_id", a.ID),
				slog.Any("ir_id", ir.ID),
				slog.Any("error", err))
			return err
		}
	}
	return nil
}
