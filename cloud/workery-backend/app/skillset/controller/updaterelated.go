package controller

import (
	"log/slog"

	a_c "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	skillset_s "github.com/over55/monorepo/cloud/workery-backend/app/skillset/datastore"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func (impl *SkillSetControllerImpl) updateRelatedAssociates(sessCtx mongo.SessionContext, skillset *skillset_s.SkillSet) error {
	af := &a_c.AssociatePaginationListFilter{
		Cursor:        "",
		PageSize:      1_000_000,
		SortField:     "",
		SortOrder:     a_c.OrderAscending,
		InSkillSetIDs: []primitive.ObjectID{skillset.ID},
	}
	ares, err := impl.AssociateStorer.ListByFilter(sessCtx, af)
	if err != nil {
		impl.Logger.Error("associate list by skill set error",
			slog.Any("error", err))
		return err
	}

	// Iterate over all the associates which contain our skill set.
	for _, a := range ares.Results {
		// Iterate over all the skill sets that are attached to this associate
		// and match it with our skill set and update.
		for _, ss := range a.SkillSets {
			if ss.ID == skillset.ID {
				ss.Category = skillset.Category
				ss.SubCategory = skillset.SubCategory
				ss.Description = skillset.Description
				ss.Status = skillset.Status
				if err := impl.AssociateStorer.UpdateByID(sessCtx, a); err != nil {
					impl.Logger.Error("associate update error",
						slog.Any("error", err))
					return err
				}
				impl.Logger.Debug("updated related associate for skill set",
					slog.String("skill_set_id", skillset.ID.Hex()),
					slog.String("associate_id", a.ID.Hex()))

				// Run the function which will iterate through all the task
				// items with this associate and update the skill set.
				if err := impl.updateRelatedTaskItemAssociates(sessCtx, skillset, a); err != nil {
					impl.Logger.Error("update related by task item associate skill sets error", slog.Any("error", err))
					return err
				}
			}
		}
	}

	return nil
}

func (impl *SkillSetControllerImpl) updateRelatedOrders(sessCtx mongo.SessionContext, skillset *skillset_s.SkillSet) error {
	of := &o_s.OrderPaginationListFilter{
		Cursor:        "",
		PageSize:      1_000_000,
		SortField:     "",
		SortOrder:     o_s.SortOrderAscending,
		InSkillSetIDs: []primitive.ObjectID{skillset.ID},
	}
	ores, err := impl.OrderStorer.ListByFilter(sessCtx, of)
	if err != nil {
		impl.Logger.Error("order list by skill set error",
			slog.Any("error", err))
		return err
	}

	// Iterate over all the orders which contain our skill set.
	for _, o := range ores.Results {
		// Iterate over all the skill sets that are attached to this order
		// and match it with our skill set and update.
		for _, ss := range o.SkillSets {
			if ss.ID == skillset.ID {
				ss.Category = skillset.Category
				ss.SubCategory = skillset.SubCategory
				ss.Description = skillset.Description
				ss.Status = skillset.Status
				if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
					impl.Logger.Error("order update error",
						slog.Any("error", err))
					return err
				}
				impl.Logger.Debug("updated related order for skill set",
					slog.String("skill_set_id", skillset.ID.Hex()),
					slog.Uint64("order_wjid", o.WJID))

				// Run the function which will iterate through all the task
				// items with this order and update the skill set.
				if err := impl.updateRelatedTaskItemOrders(sessCtx, skillset, o); err != nil {
					impl.Logger.Error("update related by task item order skill sets error", slog.Any("error", err))
					return err
				}
			}
		}
	}

	return nil
}

func (impl *SkillSetControllerImpl) updateRelatedTaskItemAssociates(sessCtx mongo.SessionContext, skillset *skillset_s.SkillSet, a *a_c.Associate) error {
	tires, err := impl.TaskItemStorer.ListByAssociateID(sessCtx, a.ID)
	if err != nil {
		impl.Logger.Error("task item list by associates error",
			slog.Any("error", err))
		return err
	}

	// Iterate over all the task items which contain our skill set.
	for _, ti := range tires.Results {
		// Iterate over all the task items that are attached to this order
		// and match it with our skill set and update.
		for _, ss := range ti.AssociateSkillSets {
			if ss.ID == skillset.ID {
				ss.Category = skillset.Category
				ss.SubCategory = skillset.SubCategory
				ss.Description = skillset.Description
				ss.Status = skillset.Status
				if err := impl.TaskItemStorer.UpdateByID(sessCtx, ti); err != nil {
					impl.Logger.Error("task item update error",
						slog.Any("error", err))
					return err
				}
				impl.Logger.Debug("updated related task item for associate skill set",
					slog.String("skill_set_id", skillset.ID.Hex()),
					slog.Any("task_item_id", ti.ID))
			}
		}
	}

	return nil
}

func (impl *SkillSetControllerImpl) updateRelatedTaskItemOrders(sessCtx mongo.SessionContext, skillset *skillset_s.SkillSet, o *o_s.Order) error {
	tires, err := impl.TaskItemStorer.ListByOrderWJID(sessCtx, o.WJID)
	if err != nil {
		impl.Logger.Error("task item list by order error",
			slog.Any("error", err))
		return err
	}

	// Iterate over all the task items which contain our skill set.
	for _, ti := range tires.Results {
		// Iterate over all the task items that are attached to this order
		// and match it with our skill set and update.
		for _, ss := range ti.OrderSkillSets {
			if ss.ID == skillset.ID {
				ss.Category = skillset.Category
				ss.SubCategory = skillset.SubCategory
				ss.Description = skillset.Description
				ss.Status = skillset.Status
				if err := impl.TaskItemStorer.UpdateByID(sessCtx, ti); err != nil {
					impl.Logger.Error("task item update error",
						slog.Any("error", err))
					return err
				}
				impl.Logger.Debug("updated related task item for order skill set",
					slog.String("skill_set_id", skillset.ID.Hex()),
					slog.Any("task_item_id", ti.ID))
			}
		}
	}

	return nil
}
