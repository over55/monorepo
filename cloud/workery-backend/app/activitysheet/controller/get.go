package controller

import (
	"context"
	"log/slog"

	c_s "github.com/over55/monorepo/cloud/workery-backend/app/activitysheet/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl *ActivitySheetControllerImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*c_s.ActivitySheet, error) {
	// Retrieve from our database the record for the specific id.
	m, err := impl.ActivitySheetStorer.GetByID(ctx, id)
	if err != nil {
		impl.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	if m == nil {
		impl.Logger.Error("order does not exist error", slog.Any("orderID", id))
		return nil, httperror.NewForBadRequestWithSingleField("order_id", "order does not exist")
	}

	// // Generate most recent avatar URL if it exists and it has expired.
	// if m.AvatarObjectKey != "" {
	// 	if time.Now().After(m.AvatarObjectExpiry) {
	// 		// Get preseigned URL.
	// 		avatarObjectExpiry := time.Now().Add(time.Minute * 30)
	// 		avatarFileURL, err := impl.S3.GetPresignedURL(ctx, m.AvatarObjectKey, time.Minute*30)
	// 		if err != nil {
	// 			impl.Logger.Error("s3 failed get presigned url error", slog.Any("error", err))
	// 			return nil, err
	// 		}
	// 		m.AvatarObjectURL = avatarFileURL
	// 		m.AvatarObjectExpiry = avatarObjectExpiry
	//
	// 		// Save to the database the modified order.
	// 		if err := impl.ActivitySheetStorer.UpdateByID(ctx, m); err != nil {
	// 			impl.Logger.Error("database update by id error", slog.Any("error", err))
	// 			return nil, err
	// 		}
	//
	// 		// For debugging purposes only.
	// 		impl.Logger.Debug("refreshed avatar object url", slog.String("avatarFileURL", avatarFileURL))
	// 	}
	// }

	return m, err
}
