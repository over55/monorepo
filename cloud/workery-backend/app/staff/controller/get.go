package controller

import (
	"context"
	"time"

	"log/slog"

	a_c "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (impl *StaffControllerImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*a_c.Staff, error) {
	// Retrieve from our database the record for the specific id.
	m, err := impl.StaffStorer.GetByID(ctx, id)
	if err != nil {
		impl.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	if m == nil {
		impl.Logger.Error("staff does not exist error", slog.Any("staffID", id))
		return nil, httperror.NewForBadRequestWithSingleField("staff_id", "staff does not exist")
	}

	// Generate most recent avatar URL if it exists and it has expired.
	if m.AvatarObjectKey != "" {
		if time.Now().After(m.AvatarObjectExpiry) {
			// Get preseigned URL.
			avatarObjectExpiry := time.Now().Add(time.Minute * 30)
			avatarFileURL, err := impl.S3.GetPresignedURL(ctx, m.AvatarObjectKey, time.Minute*30)
			if err != nil {
				impl.Logger.Error("s3 failed get presigned url error", slog.Any("error", err))
				return nil, err
			}
			m.AvatarObjectURL = avatarFileURL
			m.AvatarObjectExpiry = avatarObjectExpiry

			// Save to the database the modified staff.
			if err := impl.StaffStorer.UpdateByID(ctx, m); err != nil {
				impl.Logger.Error("database update by id error", slog.Any("error", err))
				return nil, err
			}

			// For debugging purposes only.
			impl.Logger.Debug("refreshed avatar object url", slog.String("avatarFileURL", avatarFileURL))
		}
	}

	return m, err
}
