package controller

import (
	"context"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	attch_d "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	user_d "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (impl *AttachmentControllerImpl) DeleteByID(ctx context.Context, id primitive.ObjectID) error {
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

	// Update the database.
	attachment, err := impl.GetByID(ctx, id)
	if err != nil {
		impl.Logger.Error("database get by id error", slog.Any("error", err))
		return err
	}
	if attachment == nil {
		impl.Logger.Error("database returns nothing from get by id")
		return err
	}

	attachment.Status = attch_d.AttachmentStatusActive

	// // Security: Prevent deletion of root user(s).
	// if attachment.Type == attch_d.RootType {
	// 	impl.Logger.Warn("root attachment cannot be deleted error")
	// 	return httperror.NewForForbiddenWithSingleField("role", "root attachment cannot be deleted")
	// }

	//TODO: CREATE A COMMENT.

	// Save to the database the modified attachment.
	if err := impl.AttachmentStorer.UpdateByID(ctx, attachment); err != nil {
		impl.Logger.Error("database update by id error", slog.Any("error", err))
		return err
	}
	return nil
}

func (impl *AttachmentControllerImpl) PermanentlyDeleteByID(ctx context.Context, id primitive.ObjectID) error {
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

	// Update the database.
	attachment, err := impl.GetByID(ctx, id)
	if err != nil {
		impl.Logger.Error("database get by id error", slog.Any("error", err))
		return err
	}
	if attachment == nil {
		impl.Logger.Error("database returns nothing from get by id")
		return err
	}

	// Proceed to delete the physical files from AWS s3.
	if err := impl.S3.DeleteByKeys(ctx, []string{attachment.ObjectKey}); err != nil {
		impl.Logger.Warn("s3 delete by keys error", slog.Any("error", err))
		// Do not return an error, simply continue this function as there might
		// be a case were the file was removed on the s3 bucket by ourselves
		// or some other reason.
	}
	if err := impl.AttachmentStorer.DeleteByID(ctx, attachment.ID); err != nil {
		impl.Logger.Error("database delete by id error", slog.Any("error", err))
		return err
	}
	return nil
}

func (impl *AttachmentControllerImpl) PermanentlyDeleteAllByCustomerID(ctx context.Context, customerID primitive.ObjectID) error {
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

	f := &attch_d.AttachmentListFilter{
		Cursor:     primitive.NilObjectID,
		PageSize:   1_000_000,
		SortField:  "_id",
		SortOrder:  1, // 1=ascending | -1=descending
		CustomerID: customerID,
	}
	res, err := impl.ListByFilter(ctx, f)
	if err != nil {
		impl.Logger.Error("database list by customer id error", slog.Any("error", err))
		return err
	}
	for _, a := range res.Results {
		if err := impl.AttachmentStorer.DeleteByID(ctx, a.ID); err != nil {
			impl.Logger.Error("database delete by id error",
				slog.Any("error", err))
			return err
		}
	}

	return nil
}

func (impl *AttachmentControllerImpl) PermanentlyDeleteAllByAssociateID(ctx context.Context, associateID primitive.ObjectID) error {
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

	f := &attch_d.AttachmentListFilter{
		Cursor:      primitive.NilObjectID,
		PageSize:    1_000_000,
		SortField:   "_id",
		SortOrder:   1, // 1=ascending | -1=descending
		AssociateID: associateID,
	}
	res, err := impl.ListByFilter(ctx, f)
	if err != nil {
		impl.Logger.Error("database list by associate id error", slog.Any("error", err))
		return err
	}
	for _, a := range res.Results {
		if err := impl.AttachmentStorer.DeleteByID(ctx, a.ID); err != nil {
			impl.Logger.Error("database delete by id error",
				slog.Any("error", err))
			return err
		}
	}

	return nil
}
