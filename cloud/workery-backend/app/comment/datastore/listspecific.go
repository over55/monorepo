package datastore

import (
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl CommentStorerImpl) ListByOrderID(ctx context.Context, orderID primitive.ObjectID) (*CommentPaginationListResult, error) {
	f := &CommentPaginationListFilter{
		Cursor:    "",
		PageSize:  1_000_000,
		SortField: "id",
		SortOrder: OrderAscending,
		OrderID:   orderID,
	}
	return impl.ListByFilter(ctx, f)
}

func (impl CommentStorerImpl) ListByOrderWJID(ctx context.Context, orderWJID uint64) (*CommentPaginationListResult, error) {
	f := &CommentPaginationListFilter{
		Cursor:    "",
		PageSize:  1_000_000,
		SortField: "id",
		SortOrder: OrderAscending,
		OrderWJID: orderWJID,
	}
	return impl.ListByFilter(ctx, f)
}
