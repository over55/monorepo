package controller

import (
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	s_s "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	vehicletype_s "github.com/over55/monorepo/cloud/workery-backend/app/vehicletype/datastore"
)

func (impl *VehicleTypeControllerImpl) UpdateRelatedAssociates(sessCtx mongo.SessionContext, tvt *vehicletype_s.VehicleType) error {
	af := &a_s.AssociatePaginationListFilter{
		Cursor:           "",
		PageSize:         1_000_000,
		SortField:        "",
		SortOrder:        c_s.OrderAscending,
		InVehicleTypeIDs: []primitive.ObjectID{tvt.ID},
	}
	list, err := impl.AssociateStorer.ListByFilter(sessCtx, af)
	if err != nil {
		impl.Logger.Error("associate list by vehicle types error",
			slog.Any("error", err))
		return err
	}

	// Iterate over all the associates which contain our vt.
	for _, asso := range list.Results {
		// Iterate over all the vehicles that are attached to this associate
		// and match it with our vehicle and update.
		for _, svt := range asso.VehicleTypes {
			if svt.ID == tvt.ID {
				svt.Name = tvt.Name
				svt.Description = tvt.Description
				svt.Status = tvt.Status
				if err := impl.AssociateStorer.UpdateByID(sessCtx, asso); err != nil {
					impl.Logger.Error("associate update error",
						slog.Any("error", err))
					return err
				}
				impl.Logger.Debug("updated related associate for vehicle type",
					slog.String("vt_id", svt.ID.Hex()),
					slog.String("associate_id", asso.ID.Hex()))

				if err := impl.updateRelatedTaskItemAssociates(sessCtx, tvt, asso); err != nil {
					impl.Logger.Error("associate update error",
						slog.Any("error", err))
					return err
				}

				impl.Logger.Debug("updated related associate for vt inside task items",
					slog.String("vt_id", svt.ID.Hex()),
					slog.String("associate_id", asso.ID.Hex()))

				// Iterate over all the orders that this associate belongs to and update
				// the vehicle type.
				if err := impl.updateRelatedOrderAssociates(sessCtx, tvt, asso); err != nil {
					impl.Logger.Error("associate update error",
						slog.Any("error", err))
					return err
				}

				impl.Logger.Debug("updated related associate for vt inside orders",
					slog.String("vt_id", svt.ID.Hex()),
					slog.String("associate_id", asso.ID.Hex()))
			}
		}
	}
	return nil
}

func (impl *VehicleTypeControllerImpl) updateRelatedTaskItemAssociates(sessCtx mongo.SessionContext, vt *vehicletype_s.VehicleType, a *a_s.Associate) error {
	tires, err := impl.TaskItemStorer.ListByAssociateID(sessCtx, a.ID)
	if err != nil {
		impl.Logger.Error("task item list by associates error",
			slog.Any("error", err))
		return err
	}

	// Iterate over all the task items which contain our vt.
	for _, ti := range tires.Results {
		// Iterate over all the task items that are attached to this order
		// and match it with our vt and update.
		for _, avt := range ti.AssociateVehicleTypes {
			if avt.ID == vt.ID {
				avt.Name = vt.Name
				avt.Description = vt.Description
				avt.Status = vt.Status
				if err := impl.TaskItemStorer.UpdateByID(sessCtx, ti); err != nil {
					impl.Logger.Error("task item update error",
						slog.Any("error", err))
					return err
				}
				impl.Logger.Debug("updated related task item for associate vt",
					slog.String("vt_id", avt.ID.Hex()),
					slog.Any("task_item_id", ti.ID))
			}
		}
	}
	return nil
}

func (impl *VehicleTypeControllerImpl) updateRelatedOrderAssociates(sessCtx mongo.SessionContext, vt *vehicletype_s.VehicleType, a *a_s.Associate) error {
	ores, err := impl.OrderStorer.ListByAssociateID(sessCtx, a.ID)
	if err != nil {
		impl.Logger.Error("order list by associates error",
			slog.Any("error", err))
		return err
	}

	// Iterate over all the orders which contain our vt.
	for _, o := range ores.Results {
		// Iterate over all the task items that are attached to this order
		// and match it with our vt and update.
		for _, avt := range o.AssociateVehicleTypes {
			if avt.ID == vt.ID {
				avt.Name = vt.Name
				avt.Description = vt.Description
				avt.Status = vt.Status
				if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
					impl.Logger.Error("order update error",
						slog.Any("error", err))
					return err
				}
				impl.Logger.Debug("updated related order for associate vt",
					slog.String("vt_id", avt.ID.Hex()),
					slog.Any("task_item_id", o.ID))
			}
		}
	}
	return nil
}

func (impl *VehicleTypeControllerImpl) UpdateRelatedStaff(sessCtx mongo.SessionContext, tvt *vehicletype_s.VehicleType) error {
	sf := &s_s.StaffPaginationListFilter{
		Cursor:           "",
		PageSize:         1_000_000,
		SortField:        "",
		SortOrder:        s_s.SortOrderAscending,
		InVehicleTypeIDs: []primitive.ObjectID{tvt.ID},
	}
	list, err := impl.StaffStorer.ListByFilter(sessCtx, sf)
	if err != nil {
		impl.Logger.Error("staff list by vehicle types error",
			slog.Any("error", err))
		return err
	}

	// Iterate over all the staff which contain our vt.
	for _, staff := range list.Results {
		// Iterate over all the vehicles that are attached to this staff
		// and match it with our vehicle and update.
		for _, svt := range staff.VehicleTypes {
			if svt.ID == tvt.ID {
				svt.Name = tvt.Name
				svt.Description = tvt.Description
				svt.Status = tvt.Status
				if err := impl.StaffStorer.UpdateByID(sessCtx, staff); err != nil {
					impl.Logger.Error("staff update error",
						slog.Any("error", err))
					return err
				}
				impl.Logger.Debug("updated related staff for vehicle type",
					slog.String("vt_id", svt.ID.Hex()),
					slog.String("staff_id", staff.ID.Hex()))

				// if err := impl.StaffStorer.UpdateRelatedStaff(sessCtx, vt, staff); err != nil {
				// 	impl.Logger.Error("staff update error",
				// 		slog.Any("error", err))
				// 	return err
				// }
			}
		}
	}
	return nil
}
