package controller

import (
	"context"
	"fmt"
	"mime/multipart"
	"time"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	a_d "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	orderincident_s "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type OrderIncidentOperationCreateAttachmentRequest struct {
	OrderIncidentID primitive.ObjectID `bson:"order_incident_id" json:"order_incident_id"`
	Title           string
	Description     string
	FileName        string
	FileType        string
	File            multipart.File
}

func validateOperationCreateAttachmentRequest(dirtyData *OrderIncidentOperationCreateAttachmentRequest) error {
	e := make(map[string]string)

	if dirtyData.OrderIncidentID.IsZero() {
		e["order_incident_id"] = "missing value"
	}
	if dirtyData.Title == "" {
		e["title"] = "missing value"
	}
	if dirtyData.Description == "" {
		e["description"] = "missing value"
	}
	if dirtyData.FileName == "" {
		e["file"] = "missing value"
	}
	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *OrderIncidentControllerImpl) CreateAttachment(ctx context.Context, req *OrderIncidentOperationCreateAttachmentRequest) (*orderincident_s.OrderIncident, error) {
	if err := validateOperationCreateAttachmentRequest(req); err != nil {
		return nil, err
	}

	// Extract from our session the following data.
	orgID := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName := ctx.Value(constants.SessionUserName).(string)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	// DEVELOPERS NOTE:
	// Every submission needs to have a unique `public id` (PID)
	// generated. The following needs to happen to generate the unique PID:
	// 1. Make the `Create` function be `atomic` and thus lock this function.
	// 2. Count total records in system (for particular tenant).
	// 3. Generate PID.
	// 4. Apply the PID to the record.
	// 5. Unlock this `Create` function to be usable again by other calls after
	//    the function successfully submits the record into our system.
	impl.Kmutex.Lockf("create-attachment-by-tenant-%s", orgID.Hex())
	defer impl.Kmutex.Unlockf("create-attachment-by-tenant-%s", orgID.Hex())

	////
	//// Start the transaction.
	////

	session, err := impl.DbClient.StartSession()
	if err != nil {
		impl.Logger.Error("start session error",
			slog.Any("error", err))
		return nil, err
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		//
		// Fetch the original order.
		//

		oi, err := impl.OrderIncidentStorer.GetByID(sessCtx, req.OrderIncidentID)
		if err != nil {
			impl.Logger.Error("database get by id error", slog.Any("error", err))
			return nil, err
		}
		if oi == nil {
			return nil, nil
		}

		o, err := impl.OrderStorer.GetByID(sessCtx, oi.OrderID)
		if err != nil {
			impl.Logger.Error("database get by id error", slog.Any("error", err))
			return nil, err
		}
		if o == nil {
			return nil, nil
		}

		impl.Logger.Debug("fetched records",
			slog.String("order_id", o.ID.Hex()),
			slog.String("order_incident_id", oi.ID.Hex()))

		//
		// Upload the file.
		//

		directory := "order"

		// Generate the key of our upload.
		objectKey := fmt.Sprintf("tenant/%v/private/uploads/%v/%d/%v", orgID.Hex(), directory, o.WJID, req.FileName)

		// For debugging purposes only.
		impl.Logger.Debug("pre-upload meta",
			slog.String("FileName", req.FileName),
			slog.String("FileType", req.FileType),
			slog.String("ObjectKey", objectKey),
			slog.String("Title", req.Title),
			slog.String("Desc", req.Description),
		)

		go func(file multipart.File, objkey string) {
			impl.Logger.Debug("beginning private s3 image upload...")
			if err := impl.S3.UploadContentFromMulipart(context.Background(), objkey, file); err != nil {
				impl.Logger.Error("private s3 upload error", slog.Any("error", err))
				// Do not return an error, simply continue this function as there might
				// be a case were the file was removed on the s3 bucket by ourselves
				// or some other reason.
			}
			impl.Logger.Debug("Finished private s3 image upload",
				slog.String("order_id", o.ID.Hex()),
				slog.String("order_incident_id", oi.ID.Hex()))
		}(req.File, objectKey)

		//
		// Create our meta record in the database.
		//

		a := &a_d.Attachment{
			TenantID:              orgID,
			ID:                    primitive.NewObjectID(),
			CreatedAt:             time.Now(),
			CreatedByUserName:     userName,
			CreatedByUserID:       userID,
			CreatedFromIPAddress:  ipAddress,
			ModifiedAt:            time.Now(),
			ModifiedByUserName:    userName,
			ModifiedByUserID:      userID,
			ModifiedFromIPAddress: ipAddress,
			Title:                 req.Title,
			Description:           req.Description,
			Filename:              req.FileName,
			FileType:              req.FileType,
			ObjectKey:             objectKey,
			Status:                a_d.AttachmentStatusActive,
			Type:                  a_d.AttachmentTypeOrder,
			OrderID:               o.ID,
			OrderWJID:             o.WJID,
			OrderTenantIDWithWJID: o.TenantIDWithWJID,
			OrderIncidentID:       oi.ID,
			OrderIncidentPublicID: oi.PublicID,
		}
		if err := impl.AttachmentStorer.Create(ctx, a); err != nil {
			impl.Logger.Error("database create error", slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("created attachment",
			slog.String("order_id", o.ID.Hex()),
			slog.String("order_incident_id", oi.ID.Hex()),
			slog.String("attachment_id", a.ID.Hex()))

		//
		// Create order incidence attachment.
		//

		oia := &orderincident_s.OrderIncidentAttachment{
			ID:                    a.ID,
			TenantID:              a.TenantID,
			Filename:              a.Filename,
			FileType:              a.FileType,
			ObjectKey:             a.ObjectKey,
			ObjectURL:             a.ObjectURL,
			Title:                 a.Title,
			Description:           a.Description,
			CreatedAt:             a.CreatedAt,
			CreatedByUserID:       a.CreatedByUserID,
			CreatedByUserName:     a.CreatedByUserName,
			CreatedFromIPAddress:  a.CreatedFromIPAddress,
			ModifiedAt:            a.ModifiedAt,
			ModifiedByUserID:      a.ModifiedByUserID,
			ModifiedByUserName:    a.ModifiedByUserName,
			ModifiedFromIPAddress: a.ModifiedFromIPAddress,
			AssociateID:           a.AssociateID,
			AssociateName:         a.AssociateName,
			CustomerID:            a.CustomerID,
			CustomerName:          a.CustomerName,
			StaffID:               a.StaffID,
			StaffName:             a.StaffName,
			OrderID:               a.OrderID,
			OrderWJID:             a.OrderWJID,
			OrderTenantIDWithWJID: a.OrderTenantIDWithWJID,
			Status:                a.Status,
			Type:                  a.Type,
		}
		oi.ModifiedByUserID = sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
		oi.ModifiedFromIPAddress = ipAddress
		oi.ModifiedAt = time.Now()
		oi.Attachments = append(oi.Attachments, oia)
		if err := impl.OrderIncidentStorer.UpdateByID(ctx, oi); err != nil {
			impl.Logger.Error("order incident update error", slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("updated order incident with new attachment",
			slog.String("order_id", o.ID.Hex()),
			slog.String("order_incident_id", oi.ID.Hex()),
			slog.String("attachment_id", a.ID.Hex()))

		//
		// Populate the feed.
		//

		feed := []orderincident_s.SortableByCreatedAt{}
		for _, oia := range oi.Attachments {
			feed = append(feed, oia)
		}
		for _, oic := range oi.Comments {
			feed = append(feed, oic)
		}
		// Sort all the values from greatest value to lowest value.
		orderincident_s.SortByCreatedAt(feed)
		oi.Feed = feed

		return oi, nil
	}
	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		impl.Logger.Error("session failed error",
			slog.Any("error", err))
		return nil, err
	}

	return result.(*orderincident_s.OrderIncident), nil
}
