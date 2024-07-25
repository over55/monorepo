package controller

import (
	"context"
	"fmt"
	"time"

	"log/slog"

	domain "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (c *AttachmentControllerImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Attachment, error) {
	// // Extract from our session the following data.
	// userAttachmentID := ctx.Value(constants.SessionUserAttachmentID).(primitive.ObjectID)
	// userRole := ctx.Value(constants.SessionUserRole).(int8)
	//
	// If user is not administrator nor belongs to the attachment then error.
	// if userRole != user_d.UserRoleRoot && id != userAttachmentID {
	// 	c.Logger.Error("authenticated user is not staff role nor belongs to the attachment error",
	// 		slog.Any("userRole", userRole),
	// 		slog.Any("userAttachmentID", userAttachmentID))
	// 	return nil, httperror.NewForForbiddenWithSingleField("message", "you do not belong to this attachment")
	// }

	// Retrieve from our database the record for the specific id.
	m, err := c.AttachmentStorer.GetByID(ctx, id)
	if err != nil {
		c.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	if m == nil {
		c.Logger.Error("attachment does not exist error",
			slog.Any("attachment_id", id))
		return nil, httperror.NewForBadRequestWithSingleField("message", fmt.Sprintf("attachment does not exist for %v", id))
	}

	// Generate the URL.
	fileURL, err := c.S3.GetPresignedURL(ctx, m.ObjectKey, 5*time.Minute)
	if err != nil {
		c.Logger.Error("s3 failed get presigned url error", slog.Any("error", err))
		return nil, err
	}

	m.ObjectURL = fileURL
	return m, err
}
