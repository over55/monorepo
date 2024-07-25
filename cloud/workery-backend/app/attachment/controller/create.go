package controller

import (
	"context"
	"fmt"
	"mime/multipart"
	"time"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	a_d "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type AttachmentCreateRequestIDO struct {
	Title         string
	Description   string
	OwnershipID   primitive.ObjectID
	OwnershipWJID uint64
	OwnershipType int8
	FileName      string
	FileType      string
	File          multipart.File
}

func ValidateCreateRequest(dirtyData *AttachmentCreateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.Title == "" {
		e["title"] = "missing value"
	}
	if dirtyData.Description == "" {
		e["description"] = "missing value"
	}
	if dirtyData.OwnershipID.IsZero() && dirtyData.OwnershipType != a_d.AttachmentTypeOrder {
		e["ownership_id"] = "missing value"
	}
	if dirtyData.OwnershipWJID == 0 && dirtyData.OwnershipType == a_d.AttachmentTypeOrder {
		e["ownership_wjid"] = "missing value"
	}
	if dirtyData.OwnershipType == 0 {
		e["ownership_type"] = "missing value"
	}
	if dirtyData.FileName == "" {
		e["file"] = "missing value"
	}
	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (c *AttachmentControllerImpl) Create(ctx context.Context, req *AttachmentCreateRequestIDO) (*a_d.Attachment, error) {
	if err := ValidateCreateRequest(req); err != nil {
		return nil, err
	}

	// Extract from our session the following data.
	orgID := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName := ctx.Value(constants.SessionUserName).(string)

	// DEVELOPERS NOTE:
	// Every submission needs to have a unique `public id` (PID)
	// generated. The following needs to happen to generate the unique PID:
	// 1. Make the `Create` function be `atomic` and thus lock this function.
	// 2. Count total records in system (for particular tenant).
	// 3. Generate PID.
	// 4. Apply the PID to the record.
	// 5. Unlock this `Create` function to be usable again by other calls after
	//    the function successfully submits the record into our system.
	c.Kmutex.Lockf("create-attachment-by-tenant-%s", orgID.Hex())
	defer c.Kmutex.Unlockf("create-attachment-by-tenant-%s", orgID.Hex())

	directory := ""
	switch req.OwnershipType {
	case a_d.AttachmentTypeCustomer:
		directory = fmt.Sprintf("client/%v", req.OwnershipID.Hex())
	case a_d.AttachmentTypeAssociate:
		directory = fmt.Sprintf("associate/%v", req.OwnershipID.Hex())
	case a_d.AttachmentTypeOrder:
		directory = fmt.Sprintf("order/%d", req.OwnershipWJID)
	case a_d.AttachmentTypeStaff:
		directory = fmt.Sprintf("staff/%v", req.OwnershipID.Hex())
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

	// Create our meta record in the database.
	res := &a_d.Attachment{
		TenantID:           orgID,
		ID:                 primitive.NewObjectID(),
		CreatedAt:          time.Now(),
		CreatedByUserName:  userName,
		CreatedByUserID:    userID,
		ModifiedAt:         time.Now(),
		ModifiedByUserName: userName,
		ModifiedByUserID:   userID,
		Title:              req.Title,
		Description:        req.Description,
		Filename:           req.FileName,
		FileType:           req.FileType,
		ObjectKey:          objectKey,
		Status:             a_d.AttachmentStatusActive,
		Type:               req.OwnershipType,
	}

	switch req.OwnershipType {
	case a_d.AttachmentTypeCustomer:
		// Lookup the customer and assign to the attachment.
		cust, err := c.CustomerStorer.GetByID(ctx, req.OwnershipID)
		if err != nil {
			c.Logger.Error("customer get error", slog.Any("error", err))
			return nil, err
		}
		if cust == nil {
			return nil, httperror.NewForBadRequestWithSingleField("ownership_id", "does not exist for customer")
		}
		res.CustomerID = cust.ID
		res.CustomerName = cust.Name

	case a_d.AttachmentTypeAssociate:
		// Lookup the associate and assign to the attachment.
		asso, err := c.AssociateStorer.GetByID(ctx, req.OwnershipID)
		if err != nil {
			c.Logger.Error("associate get error", slog.Any("error", err))
			return nil, err
		}
		if asso == nil {
			return nil, httperror.NewForBadRequestWithSingleField("ownership_id", "does not exist for associate")
		}
		res.AssociateID = asso.ID
		res.AssociateName = asso.Name
	case a_d.AttachmentTypeOrder:
		// Lookup the associate and assign to the attachment.
		ord, err := c.OrderStorer.GetByWJID(ctx, req.OwnershipWJID)
		if err != nil {
			c.Logger.Error("order get error",
				slog.Any("error", err),
				slog.Any("wjid", req.OwnershipWJID))
			return nil, err
		}
		if ord == nil {
			return nil, httperror.NewForBadRequestWithSingleField("ownership_id", fmt.Sprintf("does not exist for order id %v", req.OwnershipWJID))
		}
		res.OrderID = ord.ID
		res.OrderWJID = ord.WJID
	case a_d.AttachmentTypeStaff:
		// Lookup the associate and assign to the attachment.
		sta, err := c.StaffStorer.GetByID(ctx, req.OwnershipID)
		if err != nil {
			c.Logger.Error("staff get error", slog.Any("error", err))
			return nil, err
		}
		if sta == nil {
			return nil, httperror.NewForBadRequestWithSingleField("ownership_id", "does not exist for staff")
		}
		res.StaffID = sta.ID
		res.StaffName = sta.Name
	}

	err := c.AttachmentStorer.Create(ctx, res)
	if err != nil {
		c.Logger.Error("database create error", slog.Any("error", err))
		return nil, err
	}
	return res, nil
}
