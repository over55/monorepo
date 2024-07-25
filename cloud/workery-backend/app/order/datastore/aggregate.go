package datastore

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (impl OrderStorerImpl) GetAllByCustomerIDsByAssociateID(ctx context.Context, associateID primitive.ObjectID) ([]primitive.ObjectID, error) {
	filter := bson.M{"associate_id": associateID}
	projection := bson.M{"customer_id": 1, "_id": 0} // Include only customer_id, exclude _id

	cursor, err := impl.Collection.Find(context.TODO(), filter, options.Find().SetProjection(projection))
	if err != nil {
		impl.Logger.Error("database find error", slog.Any("error", err))
		return nil, err
	}
	defer cursor.Close(context.TODO())

	var customerIDs []primitive.ObjectID
	for cursor.Next(context.TODO()) {
		var result struct {
			CustomerID primitive.ObjectID `bson:"customer_id"`
		}
		if err := cursor.Decode(&result); err != nil {
			impl.Logger.Error("decode error", slog.Any("error", err))
			return nil, err
		}
		customerIDs = append(customerIDs, result.CustomerID)
	}

	if err := cursor.Err(); err != nil {
		impl.Logger.Error("database cursor error", slog.Any("error", err))
		return nil, err
	}

	return customerIDs, nil
}
