package datastore

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (impl AttachmentStorerImpl) CheckIfAnyExistsByCustomerID(ctx context.Context, customerID primitive.ObjectID) (bool, error) {
	filter := bson.M{"customer_id": customerID}
	options := options.FindOne().SetProjection(bson.M{})
	result := impl.Collection.FindOne(ctx, filter, options)
	if err := result.Err(); err != nil {
		if err == mongo.ErrNoDocuments {
			return false, nil
		}
		impl.Logger.Error("database check if exists by customer id error", slog.Any("error", err))
		return false, err
	}
	return true, nil
}
