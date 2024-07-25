package controller

import (
	"context"
	"fmt"
	"mime/multipart"
	"time"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	a_d "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	domain "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	user_d "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type AttachmentUpdateRequestIDO struct {
	ID          primitive.ObjectID
	Title       string
	Description string
	FileName    string
	FileType    string
	File        multipart.File
}

func ValidateUpdateRequest(dirtyData *AttachmentUpdateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.ID.IsZero() {
		e["id"] = "missing value"
	}
	if dirtyData.Title == "" {
		e["title"] = "missing value"
	}
	if dirtyData.Description == "" {
		e["description"] = "missing value"
	}
	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (c *AttachmentControllerImpl) UpdateByID(ctx context.Context, req *AttachmentUpdateRequestIDO) (*domain.Attachment, error) {
	if err := ValidateUpdateRequest(req); err != nil {
		return nil, err
	}

	// Fetch the original attachment.
	os, err := c.AttachmentStorer.GetByID(ctx, req.ID)
	if err != nil {
		c.Logger.Error("database get by id error",
			slog.Any("error", err),
			slog.Any("attachment_id", req.ID))
		return nil, err
	}
	if os == nil {
		c.Logger.Error("attachment does not exist error",
			slog.Any("attachment_id", req.ID))
		return nil, httperror.NewForBadRequestWithSingleField("message", fmt.Sprintf("attachment does not exist for %v", req.ID.Hex()))
	}

	// Extract from our session the following data.
	orgID := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userTenantID := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userRole := ctx.Value(constants.SessionUserRole).(int8)
	userName := ctx.Value(constants.SessionUserName).(string)

	// If user is not administrator nor belongs to the attachment then error.
	if userRole != user_d.UserRoleExecutive && os.TenantID != userTenantID {
		c.Logger.Error("authenticated user is not staff role nor belongs to the attachment error",
			slog.Any("userRole", userRole),
			slog.Any("userTenantID", userTenantID))
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not belong to this attachment")
	}

	// Update the file if the user uploaded a new file.
	if req.File != nil {
		// Proceed to delete the physical files from AWS s3.
		if err := c.S3.DeleteByKeys(ctx, []string{os.ObjectKey}); err != nil {
			c.Logger.Warn("s3 delete by keys error", slog.Any("error", err))
			// Do not return an error, simply continue this function as there might
			// be a case were the file was removed on the s3 bucket by ourselves
			// or some other reason.
		}

		directory := ""
		switch os.Type {
		case a_d.AttachmentTypeCustomer:
			directory = fmt.Sprintf("client/%v", os.CustomerID.Hex())
		case a_d.AttachmentTypeAssociate:
			directory = fmt.Sprintf("associate/%v", os.AssociateID.Hex())
		case a_d.AttachmentTypeOrder:
			directory = fmt.Sprintf("order/%d", os.OrderWJID)
		case a_d.AttachmentTypeStaff:
			directory = fmt.Sprintf("staff/%v", os.StaffID.Hex())
		default:
			return nil, httperror.NewForForbiddenWithSingleField("ownership_type", "not supported type")
		}

		// Generate the key of our upload.
		objectKey := fmt.Sprintf("tenant/%v/private/uploads/%v/%v", orgID.Hex(), directory, req.FileName)

		// For debugging purposes only.
		c.Logger.Debug("pre-upload meta",
			slog.String("FileName", req.FileName),
			slog.String("FileType", req.FileType),
			slog.String("ObjectKey", objectKey),
			slog.String("Title", req.Title),
			slog.String("Desc", req.Description),
		)

		go func(file multipart.File, objkey string) {
			c.Logger.Debug("beginning private s3 image upload...")
			if err := c.S3.UploadContentFromMulipart(context.Background(), objkey, file); err != nil {
				c.Logger.Error("private s3 upload error", slog.Any("error", err))
				// Do not return an error, simply continue this function as there might
				// be a case were the file was removed on the s3 bucket by ourselves
				// or some other reason.
			}
			c.Logger.Debug("Finished private s3 image upload")
		}(req.File, objectKey)

		// Update file.
		os.ObjectKey = objectKey
		// os.Filename = req.FileName
	}

	// Modify our original attachment.
	os.ModifiedAt = time.Now()
	os.ModifiedByUserID = userID
	os.ModifiedByUserName = userName
	os.Title = req.Title
	os.Description = req.Description
	// os.OwnershipID = req.OwnershipID
	// os.OwnershipType = req.OwnershipType

	// Save to the database the modified attachment.
	if err := c.AttachmentStorer.UpdateByID(ctx, os); err != nil {
		c.Logger.Error("database update by id error", slog.Any("error", err))
		return nil, err
	}

	// go func(org *domain.Attachment) {
	// 	c.updateAttachmentNameForAllUsers(ctx, org)
	// }(os)
	// go func(org *domain.Attachment) {
	// 	c.updateAttachmentNameForAllComicSubmissions(ctx, org)
	// }(os)

	return os, nil
}

// func (c *AttachmentControllerImpl) updateAttachmentNameForAllUsers(ctx context.Context, ns *domain.Attachment) error {
// 	c.Logger.Debug("Beginning to update attachment name for all uses")
// 	f := &user_d.UserListFilter{AttachmentID: ns.ID}
// 	uu, err := c.UserStorer.ListByFilter(ctx, f)
// 	if err != nil {
// 		c.Logger.Error("database update by id error", slog.Any("error", err))
// 		return err
// 	}
// 	for _, u := range uu.Results {
// 		u.AttachmentName = ns.Name
// 		log.Println("--->", u)
// 		// if err := c.UserStorer.UpdateByID(ctx, u); err != nil {
// 		// 	c.Logger.Error("database update by id error", slog.Any("error", err))
// 		// 	return err
// 		// }
// 	}
// 	return nil
// }
//
// func (c *AttachmentControllerImpl) updateAttachmentNameForAllComicSubmissions(ctx context.Context, ns *domain.Attachment) error {
// 	c.Logger.Debug("Beginning to update attachment name for all submissions")
// 	f := &domain.ComicSubmissionListFilter{AttachmentID: ns.ID}
// 	uu, err := c.ComicSubmissionStorer.ListByFilter(ctx, f)
// 	if err != nil {
// 		c.Logger.Error("database update by id error", slog.Any("error", err))
// 		return err
// 	}
// 	for _, u := range uu.Results {
// 		u.AttachmentName = ns.Name
// 		log.Println("--->", u)
// 		// if err := c.ComicSubmissionStorer.UpdateByID(ctx, u); err != nil {
// 		// 	c.Logger.Error("database update by id error", slog.Any("error", err))
// 		// 	return err
// 		// }
// 	}
// 	return nil
// }
