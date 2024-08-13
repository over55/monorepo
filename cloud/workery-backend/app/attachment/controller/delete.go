package controller

import (
	"context"
	"fmt"
	"time"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/bartmika/timekit"
	attch_d "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	user_d "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

// DeleteByID function archives the attachment and creates a comment of the log.
func (impl *AttachmentControllerImpl) DeleteByID(ctx context.Context, id primitive.ObjectID) error {
	// Extract from our session the following data.
	// tid, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userRole, _ := ctx.Value(constants.SessionUserRole).(int8)
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	// Apply protection based on ownership and role.
	if userRole != user_d.UserRoleExecutive {
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

		// Update the database.
		attachment, err := impl.GetByID(sessCtx, id)
		if err != nil {
			impl.Logger.Error("database get by id error", slog.Any("error", err))
			return nil, err
		}
		if attachment == nil {
			impl.Logger.Error("database returns nothing from get by id")
			return nil, err
		}
		attachment.Status = attch_d.AttachmentStatusActive
		attachment.ModifiedByUserID = userID
		attachment.ModifiedByUserName = userName
		attachment.ModifiedFromIPAddress = ipAddress
		attachment.ModifiedAt = time.Now()

		// Save to the database the modified attachment.
		if err := impl.AttachmentStorer.UpdateByID(sessCtx, attachment); err != nil {
			impl.Logger.Error("database update by id error", slog.Any("error", err))
			return nil, err
		}

		// Attach a comment.
		commentContent := fmt.Sprintf("%s deleted the file called `%s` on `%v`.", userName, attachment.Filename, timekit.ToAmericanDateString(time.Now()))
		if err := impl.attachCommentComment(sessCtx, attachment, commentContent); err != nil {
			impl.Logger.Error("failed to attach comment error", slog.Any("error", err))
			return nil, err
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

func (impl *AttachmentControllerImpl) PermanentlyDeleteByID(ctx context.Context, id primitive.ObjectID) error {
	// Extract from our session the following data.
	userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	userRole := ctx.Value(constants.SessionUserRole).(int8)

	// Apply protection based on ownership and role.
	if userRole != user_d.UserRoleExecutive {
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
		// Update the database.
		attachment, err := impl.GetByID(sessCtx, id)
		if err != nil {
			impl.Logger.Error("database get by id error",
				slog.Any("error", err))
			return nil, err
		}
		if attachment == nil {
			impl.Logger.Error("database returns nothing from get by id")
			return nil, err
		}

		// Proceed to delete the physical files from AWS s3.
		if err := impl.S3.DeleteByKeys(sessCtx, []string{attachment.ObjectKey}); err != nil {
			impl.Logger.Warn("s3 delete by keys error", slog.Any("error", err))
			// Do not return an error, simply continue this function as there might
			// be a case were the file was removed on the s3 bucket by ourselves
			// or some other reason.
		}

		// Attach a comment.
		commentContent := fmt.Sprintf("%s deleted the file called `%s` on `%v`.", userName, attachment.Filename, timekit.ToAmericanDateString(time.Now()))
		if err := impl.attachCommentComment(sessCtx, attachment, commentContent); err != nil {
			impl.Logger.Error("failed to attach comment error", slog.Any("error", err))
			return nil, err
		}

		// Physically delete the record.
		if err := impl.AttachmentStorer.DeleteByID(sessCtx, attachment.ID); err != nil {
			impl.Logger.Error("database delete by id error", slog.Any("error", err))
			return nil, err
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

func (impl *AttachmentControllerImpl) PermanentlyDeleteAllByCustomerID(ctx context.Context, customerID primitive.ObjectID) error {
	// Extract from our session the following data.
	userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	userRole := ctx.Value(constants.SessionUserRole).(int8)

	// Apply protection based on ownership and role.
	if userRole != user_d.UserRoleExecutive {
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

		f := &attch_d.AttachmentListFilter{
			Cursor:     primitive.NilObjectID,
			PageSize:   1_000_000,
			SortField:  "_id",
			SortOrder:  1, // 1=ascending | -1=descending
			CustomerID: customerID,
		}
		res, err := impl.ListByFilter(sessCtx, f)
		if err != nil {
			impl.Logger.Error("database list by customer id error", slog.Any("error", err))
			return nil, err
		}
		for _, a := range res.Results {

			// Proceed to delete the physical files from AWS s3.
			if err := impl.S3.DeleteByKeys(sessCtx, []string{a.ObjectKey}); err != nil {
				impl.Logger.Warn("s3 delete by keys error", slog.Any("error", err))
				// Do not return an error, simply continue this function as there might
				// be a case were the file was removed on the s3 bucket by ourselves
				// or some other reason.
			}

			// Attach a comment.
			commentContent := fmt.Sprintf("%s deleted the file called `%s` on `%v`.", userName, a.Filename, timekit.ToAmericanDateString(time.Now()))
			if err := impl.attachCommentComment(sessCtx, a, commentContent); err != nil {
				impl.Logger.Error("failed to attach comment error", slog.Any("error", err))
				return nil, err
			}

			if err := impl.AttachmentStorer.DeleteByID(sessCtx, a.ID); err != nil {
				impl.Logger.Error("database delete by id error",
					slog.Any("error", err))
				return nil, err
			}
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

func (impl *AttachmentControllerImpl) PermanentlyDeleteAllByAssociateID(ctx context.Context, associateID primitive.ObjectID) error {
	// Extract from our session the following data.
	userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	userRole := ctx.Value(constants.SessionUserRole).(int8)

	// Apply protection based on ownership and role.
	if userRole != user_d.UserRoleExecutive {
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

		f := &attch_d.AttachmentListFilter{
			Cursor:      primitive.NilObjectID,
			PageSize:    1_000_000,
			SortField:   "_id",
			SortOrder:   1, // 1=ascending | -1=descending
			AssociateID: associateID,
		}
		res, err := impl.ListByFilter(sessCtx, f)
		if err != nil {
			impl.Logger.Error("database list by associate id error", slog.Any("error", err))
			return nil, err
		}
		for _, a := range res.Results {
			// Proceed to delete the physical files from AWS s3.
			if err := impl.S3.DeleteByKeys(sessCtx, []string{a.ObjectKey}); err != nil {
				impl.Logger.Warn("s3 delete by keys error", slog.Any("error", err))
				// Do not return an error, simply continue this function as there might
				// be a case were the file was removed on the s3 bucket by ourselves
				// or some other reason.
			}

			// Attach a comment.
			commentContent := fmt.Sprintf("%s deleted the file called `%s` on `%v`.", userName, a.Filename, timekit.ToAmericanDateString(time.Now()))
			if err := impl.attachCommentComment(sessCtx, a, commentContent); err != nil {
				impl.Logger.Error("failed to attach comment error", slog.Any("error", err))
				return nil, err
			}

			// Physically delete from teh database.
			if err := impl.AttachmentStorer.DeleteByID(sessCtx, a.ID); err != nil {
				impl.Logger.Error("database delete by id error",
					slog.Any("error", err))
				return nil, err
			}
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
