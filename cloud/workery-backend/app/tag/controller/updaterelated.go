package controller

import (
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	t_s "github.com/over55/monorepo/cloud/workery-backend/app/tag/datastore"
	tag_s "github.com/over55/monorepo/cloud/workery-backend/app/tag/datastore"
)

func (impl *TagControllerImpl) updateRelatedCustomers(sessCtx mongo.SessionContext, tag *t_s.Tag) error {
	cf := &c_s.CustomerPaginationListFilter{
		Cursor:    "",
		PageSize:  1_000_000,
		SortField: "",
		SortOrder: c_s.OrderAscending,
		InTagIDs:  []primitive.ObjectID{tag.ID},
	}
	list, err := impl.CustomerStorer.ListByFilter(sessCtx, cf)
	if err != nil {
		impl.Logger.Error("customer list by tags error",
			slog.Any("error", err))
		return err
	}

	// Iterate over all the associates which contain our tag.
	for _, cust := range list.Results {
		// Iterate over all the tags that are attached to this associate
		// and match it with our tag and update.
		for _, t := range cust.Tags {
			if t.ID == tag.ID {
				t.Text = tag.Text
				t.Description = tag.Description
				t.Status = tag.Status
				if err := impl.CustomerStorer.UpdateByID(sessCtx, cust); err != nil {
					impl.Logger.Error("customer update error",
						slog.Any("error", err))
					return err
				}
				impl.Logger.Debug("updated related customer for tag",
					slog.String("tag_id", tag.ID.Hex()),
					slog.String("customer_id", cust.ID.Hex()))

				if err := impl.updateRelatedTaskItemCustomers(sessCtx, tag, cust); err != nil {
					impl.Logger.Error("customer update error",
						slog.Any("error", err))
					return err
				}

				impl.Logger.Debug("updated related customer for tag inside task items",
					slog.String("tag_id", tag.ID.Hex()),
					slog.String("customer_id", cust.ID.Hex()))
			}
		}
	}
	return nil
}

func (impl *TagControllerImpl) updateRelatedTaskItemCustomers(sessCtx mongo.SessionContext, tag *tag_s.Tag, a *c_s.Customer) error {
	tires, err := impl.TaskItemStorer.ListByCustomerID(sessCtx, a.ID)
	if err != nil {
		impl.Logger.Error("task item list by customer error",
			slog.Any("error", err))
		return err
	}

	// Iterate over all the task items which contain our tag.
	for _, ti := range tires.Results {
		// Iterate over all the task items that are attached to this order
		// and match it with our tag and update.
		for _, at := range ti.CustomerTags {
			if at.ID == tag.ID {
				at.Text = tag.Text
				at.Description = tag.Description
				at.Status = tag.Status
				if err := impl.TaskItemStorer.UpdateByID(sessCtx, ti); err != nil {
					impl.Logger.Error("task item update error",
						slog.Any("error", err))
					return err
				}
				impl.Logger.Debug("updated related task item for customer tag",
					slog.String("tag_id", tag.ID.Hex()),
					slog.Any("task_item_id", ti.ID))
			}
		}
	}
	return nil
}

func (impl *TagControllerImpl) updateRelatedAssociates(sessCtx mongo.SessionContext, tag *t_s.Tag) error {
	af := &a_s.AssociatePaginationListFilter{
		Cursor:    "",
		PageSize:  1_000_000,
		SortField: "",
		SortOrder: c_s.OrderAscending,
		InTagIDs:  []primitive.ObjectID{tag.ID},
	}
	list, err := impl.AssociateStorer.ListByFilter(sessCtx, af)
	if err != nil {
		impl.Logger.Error("associate list by tags error",
			slog.Any("error", err))
		return err
	}

	// Iterate over all the associates which contain our tag.
	for _, asso := range list.Results {
		// Iterate over all the tags that are attached to this associate
		// and match it with our tag and update.
		for _, t := range asso.Tags {
			if t.ID == tag.ID {
				t.Text = tag.Text
				t.Description = tag.Description
				t.Status = tag.Status
				if err := impl.AssociateStorer.UpdateByID(sessCtx, asso); err != nil {
					impl.Logger.Error("associate update error",
						slog.Any("error", err))
					return err
				}
				impl.Logger.Debug("updated related associate for tag",
					slog.String("tag_id", tag.ID.Hex()),
					slog.String("associatee_id", asso.ID.Hex()))

				if err := impl.updateRelatedTaskItemAssociates(sessCtx, tag, asso); err != nil {
					impl.Logger.Error("associate update error",
						slog.Any("error", err))
					return err
				}

				impl.Logger.Debug("updated related associate for tag inside task items",
					slog.String("tag_id", tag.ID.Hex()),
					slog.String("associate_id", asso.ID.Hex()))
			}
		}
	}
	return nil
}

func (impl *TagControllerImpl) updateRelatedTaskItemAssociates(sessCtx mongo.SessionContext, tag *tag_s.Tag, a *a_s.Associate) error {
	tires, err := impl.TaskItemStorer.ListByAssociateID(sessCtx, a.ID)
	if err != nil {
		impl.Logger.Error("task item list by associates error",
			slog.Any("error", err))
		return err
	}

	// Iterate over all the task items which contain our tag.
	for _, ti := range tires.Results {
		// Iterate over all the task items that are attached to this order
		// and match it with our tag and update.
		for _, at := range ti.AssociateTags {
			if at.ID == tag.ID {
				at.Text = tag.Text
				at.Description = tag.Description
				at.Status = tag.Status
				if err := impl.TaskItemStorer.UpdateByID(sessCtx, ti); err != nil {
					impl.Logger.Error("task item update error",
						slog.Any("error", err))
					return err
				}
				impl.Logger.Debug("updated related task item for associate tag",
					slog.String("tag_id", tag.ID.Hex()),
					slog.Any("task_item_id", ti.ID))
			}
		}
	}
	return nil
}

func (impl *TagControllerImpl) updateRelatedOrders(sessCtx mongo.SessionContext, tag *t_s.Tag) error {
	of := &o_s.OrderPaginationListFilter{
		Cursor:    "",
		PageSize:  1_000_000,
		SortField: "",
		SortOrder: c_s.OrderAscending,
		InTagIDs:  []primitive.ObjectID{tag.ID},
	}
	list, err := impl.OrderStorer.ListByFilter(sessCtx, of)
	if err != nil {
		impl.Logger.Error("order list by tags error",
			slog.Any("error", err))
		return err
	}

	// Iterate over all the orders which contain our tag.
	for _, order := range list.Results {
		// Iterate over all the tags that are attached to this order
		// and match it with our tag and update.
		for _, t := range order.Tags {
			if t.ID == tag.ID {
				t.Text = tag.Text
				t.Description = tag.Description
				t.Status = tag.Status
				if err := impl.OrderStorer.UpdateByID(sessCtx, order); err != nil {
					impl.Logger.Error("order update error",
						slog.Any("error", err))
					return err
				}
				impl.Logger.Debug("updated related order for tag",
					slog.String("tag_id", tag.ID.Hex()),
					slog.String("ordere_id", order.ID.Hex()))

				if err := impl.updateRelatedTaskItemOrders(sessCtx, tag, order); err != nil {
					impl.Logger.Error("order update error",
						slog.Any("error", err))
					return err
				}

				impl.Logger.Debug("updated related order for tag inside task items",
					slog.String("tag_id", tag.ID.Hex()),
					slog.String("order_id", order.ID.Hex()))
			}
		}
	}
	return nil
}

func (impl *TagControllerImpl) updateRelatedTaskItemOrders(sessCtx mongo.SessionContext, tag *tag_s.Tag, o *o_s.Order) error {
	tires, err := impl.TaskItemStorer.ListByOrderWJID(sessCtx, o.WJID)
	if err != nil {
		impl.Logger.Error("task item list by order error",
			slog.Any("error", err))
		return err
	}

	// Iterate over all the task items which contain our tag.
	for _, ti := range tires.Results {
		// Iterate over all the task items that are attached to this order
		// and match it with our tag and update.
		for _, ot := range ti.OrderTags {
			if ot.ID == tag.ID {
				ot.Text = tag.Text
				ot.Description = tag.Description
				ot.Status = tag.Status
				if err := impl.TaskItemStorer.UpdateByID(sessCtx, ti); err != nil {
					impl.Logger.Error("task item update error",
						slog.Any("error", err))
					return err
				}
				impl.Logger.Debug("updated related task item for order tag",
					slog.String("tag_id", tag.ID.Hex()),
					slog.Any("task_item_id", ti.ID))
			}
		}
	}

	return nil
}
