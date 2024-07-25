package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	user_d "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (impl *AssociateControllerImpl) DeleteByID(ctx context.Context, id primitive.ObjectID) error {
	// Extract from our session the following data.
	userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userRole := ctx.Value(constants.SessionUserRole).(int8)

	// Apply protection based on ownership and role.
	if userRole != user_d.UserRoleExecutive {
		impl.Logger.Error("authenticated user is not staff role error",
			slog.Any("role", userRole),
			slog.Any("userID", userID))
		return httperror.NewForForbiddenWithSingleField("message", "you role does not grant you access to this")
	}

	ordersCount, err := impl.OrderStorer.CountByAssociateID(ctx, id)
	if err != nil {
		impl.Logger.Error("database count by associate id error", slog.Any("error", err))
		return err
	}
	if ordersCount > 0 {
		impl.Logger.Error("jobs assigned to associate error",
			slog.Any("jobsCount", ordersCount),
			slog.Any("associateID", id))
		return httperror.NewForBadRequestWithSingleField("message", "this associate still has jobs assigned to them")
	}

	// STEP 1: Lookup the record or error.
	associate, err := impl.GetByID(ctx, id)
	if err != nil {
		impl.Logger.Error("database get by id error", slog.Any("error", err))
		return err
	}
	if associate == nil {
		impl.Logger.Error("database returns nothing from get by id")
		return err
	}

	// STEP 2: Delete from database.
	if err := impl.AssociateStorer.DeleteByID(ctx, id); err != nil {
		impl.Logger.Error("database delete by id error", slog.Any("error", err))
		return err
	}

	// STEP 3: Delete avatar.
	if associate.AvatarObjectKey != "" {
		// Proceed to delete the physical files from AWS s3.
		if err := impl.S3.DeleteByKeys(ctx, []string{associate.AvatarObjectKey}); err != nil {
			impl.Logger.Warn("s3 delete associate avatar by keys error", slog.Any("error", err))
			// Do not return an error, simply continue this function as there might
			// be a case were the file was removed on the s3 bucket by ourselves
			// or some other reason.
		}
	}

	// STEP 4: Delete related attachments.
	if err := impl.AttachmentStorer.PermanentlyDeleteAllByAssociateID(ctx, id); err != nil {
		impl.Logger.Warn("database delete all attachments by associate id error", slog.Any("error", err))
		// Do not return an error, simply continue this function as there might
		// be a case were the file was removed on the s3 bucket by ourselves
		// or some other reason.
	}

	// STEP 5: Delete related comments.
	if err := impl.CommentStorer.PermanentlyDeleteAllByAssociateID(ctx, id); err != nil {
		impl.Logger.Warn("database delete all comments by associate id error", slog.Any("error", err))
		// Do not return an error, simply continue this function.
	}

	// STEP 6: Delete related activity sheets.
	if err := impl.ActivitySheetStorer.PermanentlyDeleteAllByAssociateID(ctx, id); err != nil {
		impl.Logger.Warn("database delete all comments by associate id error", slog.Any("error", err))
		// Do not return an error, simply continue this function.
	}

	// STEP 7: Delete related activity task items.
	if err := impl.TaskItemStorer.PermanentlyDeleteAllByAssociateID(ctx, id); err != nil {
		impl.Logger.Warn("database delete all comments by associate id error", slog.Any("error", err))
		// Do not return an error, simply continue this function.
	}

	return nil
}
