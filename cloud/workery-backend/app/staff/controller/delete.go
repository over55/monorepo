package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	user_d "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (impl *StaffControllerImpl) DeleteByID(ctx context.Context, id primitive.ObjectID) error {
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

	// STEP 1: Lookup the record or error.
	staff, err := impl.GetByID(ctx, id)
	if err != nil {
		impl.Logger.Error("database get by id error", slog.Any("error", err))
		return err
	}
	if staff == nil {
		impl.Logger.Error("database returns nothing from get by id")
		return err
	}

	// STEP 2: Delete from database.
	if err := impl.StaffStorer.DeleteByID(ctx, id); err != nil {
		impl.Logger.Error("database delete by id error", slog.Any("error", err))
		return err
	}

	// STEP 3: Delete avatar.
	if staff.AvatarObjectKey != "" {
		// Proceed to delete the physical files from AWS s3.
		if err := impl.S3.DeleteByKeys(ctx, []string{staff.AvatarObjectKey}); err != nil {
			impl.Logger.Warn("s3 delete staff avatar by keys error", slog.Any("error", err))
			// Do not return an error, simply continue this function as there might
			// be a case were the file was removed on the s3 bucket by ourselves
			// or some other reason.
		}

		impl.Logger.Debug("deleted staff avatar",
			slog.String("staff_id", id.Hex()))
	}

	// STEP 4: Delete related attachments.
	if err := impl.AttachmentStorer.PermanentlyDeleteAllByStaffID(ctx, id); err != nil {
		impl.Logger.Warn("database delete all attachments by staff id error", slog.Any("error", err))
		// Do not return an error, simply continue this function as there might
		// be a case were the file was removed on the s3 bucket by ourselves
		// or some other reason.
	}

	impl.Logger.Debug("deleted staff attachments",
		slog.String("staff_id", id.Hex()))

	// STEP 5: Delete related comments.
	if err := impl.CommentStorer.PermanentlyDeleteAllByStaffID(ctx, id); err != nil {
		impl.Logger.Warn("database delete all comments by staff id error", slog.Any("error", err))
		// Do not return an error, simply continue this function.
	}

	impl.Logger.Debug("deleted staff comments",
		slog.String("staff_id", id.Hex()))

	// STEP 6: Delete user account.
	if err := impl.UserStorer.DeleteByID(ctx, staff.UserID); err != nil {
		impl.Logger.Error("database delete by id error", slog.Any("error", err))
		return err
	}

	impl.Logger.Debug("deleted user account",
		slog.String("staff_id", id.Hex()))

	return nil
}
