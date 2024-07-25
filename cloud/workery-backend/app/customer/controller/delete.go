package controller

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	user_d "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (impl *CustomerControllerImpl) DeleteByID(ctx context.Context, id primitive.ObjectID) error {
	// Extract from our session the following data.
	userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userRole := ctx.Value(constants.SessionUserRole).(int8)

	// Apply protection based on ownership and role.
	if userRole != user_d.UserRoleExecutive && userRole != user_d.UserRoleManagement {
		impl.Logger.Error("authenticated user is not staff role error",
			slog.Any("role", userRole),
			slog.Any("userID", userID))
		return httperror.NewForForbiddenWithSingleField("message", "you role does not grant you access to this")
	}

	////
	//// Start the transaction.
	////

	session, err := impl.DbClient.StartSession()
	if err != nil {
		impl.Logger.Error("start session error",
			slog.Any("error", err))
		return err
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {

		// STEP 1: Lookup the record or error.
		customer, err := impl.GetByID(sessCtx, id)
		if err != nil {
			impl.Logger.Error("database get by id error", slog.Any("error", err))
			return nil, err
		}
		if customer == nil {
			impl.Logger.Error("database returns nothing from get by id")
			return nil, err
		}

		// STEP 2:
		// If the client has any jobs attached to them please show a
		// popup saying "This client cannot be deleted until all jobs have been
		// transferred to another client file." so that if there are jobs
		// attached to them, we don't lose that connection or history
		anyOrdersExists, err := impl.OrderStorer.CheckIfAnyExistsByCustomerID(sessCtx, id)
		if err != nil {
			impl.Logger.Error("failed checking if any orders exist by customer id", slog.Any("err", err))
			return nil, err
		}
		if anyOrdersExists {
			impl.Logger.Debug("cannot delete customer because customer contains orders")
			return nil, httperror.NewForBadRequestWithSingleField("message", "this client cannot be deleted until all jobs have been transferred to another client file")
		}

		// STEP 3:
		// Check if any files exist and then ask user to download those files
		// then delete them before proceeding with deletion of this customer.
		anyAttachmentsExists, err := impl.AttachmentStorer.CheckIfAnyExistsByCustomerID(sessCtx, id)
		if err != nil {
			impl.Logger.Error("failed checking if any attachments exist by customer id", slog.Any("err", err))
			return nil, err
		}
		if anyAttachmentsExists {
			impl.Logger.Debug("cannot delete customer because customer contains attachment")
			return nil, httperror.NewForBadRequestWithSingleField("message", "this client cannot be deleted until all attachments have been downloaded to your computer and then the attachments deleted from this client")
		}

		// STEP 4: Delete from database.
		if err := impl.CustomerStorer.DeleteByID(sessCtx, id); err != nil {
			impl.Logger.Error("database delete by id error", slog.Any("error", err))
			return nil, err
		}

		// STEP 5: Delete avatar.
		if customer.AvatarObjectKey != "" {
			// Proceed to delete the physical files from AWS s3.
			if err := impl.S3.DeleteByKeys(sessCtx, []string{customer.AvatarObjectKey}); err != nil {
				impl.Logger.Warn("s3 delete customer avatar by keys error", slog.Any("error", err))
				// Do not return an error, simply continue this function as there might
				// be a case were the file was removed on the s3 bucket by ourselves
				// or some other reason.
			}
		}

		// // STEP 4: Delete related attachments.
		// if err := impl.AttachmentStorer.PermanentlyDeleteAllByCustomerID(sessCtx, id); err != nil {
		// 	impl.Logger.Error("database delete all attachments by customer id error", slog.Any("error", err))
		// 	return nil, err
		// }

		// STEP 6: Delete related comments.
		if err := impl.CommentStorer.PermanentlyDeleteAllByCustomerID(sessCtx, id); err != nil {
			impl.Logger.Warn("database delete all comments by customer id error", slog.Any("error", err))
			// Do not return an error, simply continue this function.
		}

		return nil, nil
	}

	// Start a transaction
	if _, err := session.WithTransaction(ctx, transactionFunc); err != nil {
		impl.Logger.Error("session failed error",
			slog.Any("error", err))
		return err
	}

	return nil
}
