package datastore

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl CommentStorerImpl) DeleteByID(ctx context.Context, id primitive.ObjectID) error {
	_, err := impl.Collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}
	return nil
}

func (impl *CommentStorerImpl) PermanentlyDeleteAllByCustomerID(ctx context.Context, customerID primitive.ObjectID) error {
	f := &CommentPaginationListFilter{
		Cursor:     "",
		PageSize:   1_000_000,
		SortField:  "created_at",
		SortOrder:  1, // 1=ascending | -1=descending
		CustomerID: customerID,
	}
	res, err := impl.ListByFilter(ctx, f)
	if err != nil {
		impl.Logger.Error("database list by customer id error", slog.Any("error", err))
		return err
	}
	for _, a := range res.Results {
		if err := impl.DeleteByID(ctx, a.ID); err != nil {
			impl.Logger.Error("database delete by id error",
				slog.Any("error", err))
			return err
		}
	}

	return nil
}

func (impl *CommentStorerImpl) PermanentlyDeleteAllByAssociateID(ctx context.Context, associateID primitive.ObjectID) error {
	f := &CommentPaginationListFilter{
		Cursor:      "",
		PageSize:    1_000_000,
		SortField:   "created_at",
		SortOrder:   1, // 1=ascending | -1=descending
		AssociateID: associateID,
	}
	res, err := impl.ListByFilter(ctx, f)
	if err != nil {
		impl.Logger.Error("database list by associate id error", slog.Any("error", err))
		return err
	}
	for _, a := range res.Results {
		if err := impl.DeleteByID(ctx, a.ID); err != nil {
			impl.Logger.Error("database delete by id error",
				slog.Any("error", err))
			return err
		}
	}

	return nil
}

func (impl *CommentStorerImpl) PermanentlyDeleteAllByStaffID(ctx context.Context, staffID primitive.ObjectID) error {
	f := &CommentPaginationListFilter{
		Cursor:    "",
		PageSize:  1_000_000,
		SortField: "created_at",
		SortOrder: 1, // 1=ascending | -1=descending
		StaffID:   staffID,
	}
	res, err := impl.ListByFilter(ctx, f)
	if err != nil {
		impl.Logger.Error("database list by associate id error", slog.Any("error", err))
		return err
	}
	for _, a := range res.Results {
		if err := impl.DeleteByID(ctx, a.ID); err != nil {
			impl.Logger.Error("database delete by id error",
				slog.Any("error", err))
			return err
		}
	}

	return nil
}

func (impl *CommentStorerImpl) PermanentlyDeleteAllByOrderID(ctx context.Context, orderID primitive.ObjectID) error {
	f := &CommentPaginationListFilter{
		Cursor:    "",
		PageSize:  1_000_000,
		SortField: "created_at",
		SortOrder: 1, // 1=ascending | -1=descending
		OrderID:   orderID,
	}
	res, err := impl.ListByFilter(ctx, f)
	if err != nil {
		impl.Logger.Error("database list by order id error", slog.Any("error", err))
		return err
	}
	for _, a := range res.Results {
		if err := impl.DeleteByID(ctx, a.ID); err != nil {
			impl.Logger.Error("database delete by id error",
				slog.Any("error", err))
			return err
		}
	}

	return nil
}
