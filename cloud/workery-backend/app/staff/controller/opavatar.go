package controller

import (
	"context"
	"fmt"
	"mime/multipart"
	"time"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	c_s "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type StaffOperationAvatarRequest struct {
	StaffID  primitive.ObjectID `bson:"staff_id" json:"staff_id"`
	FileName string
	FileType string
	File     multipart.File
}

func (impl *StaffControllerImpl) validateOperationAvatarRequest(ctx context.Context, dirtyData *StaffOperationAvatarRequest) error {
	e := make(map[string]string)

	if dirtyData.StaffID.IsZero() {
		e["staff_id"] = "missing value"
	}
	if dirtyData.File == nil {
		e["file"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *StaffControllerImpl) Avatar(ctx context.Context, req *StaffOperationAvatarRequest) (*c_s.Staff, error) {

	// Get variables from our user authenticated session.
	//

	tid, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	role, _ := ctx.Value(constants.SessionUserRole).(int8)
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	switch role {
	case u_s.UserRoleExecutive, u_s.UserRoleManagement, u_s.UserRoleFrontlineStaff:
		break
	default:
		impl.Logger.Error("you do not have permission to create a client comment")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission")
	}

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateOperationAvatarRequest(ctx, req); err != nil {
		impl.Logger.Warn("validation error", slog.Any("error", err))
		return nil, err
	}

	//
	// Fetch the original staff.
	//

	s, err := impl.StaffStorer.GetByID(ctx, req.StaffID)
	if err != nil {
		impl.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	if s == nil {
		return nil, nil
	}
	if s.TenantID != tid {
		return nil, httperror.NewForForbiddenWithSingleField("security", "you do not belong to this organization")
	}

	// Update the file if the user uploaded a new file.
	if req.File != nil {
		// Proceed to delete the physical files from AWS s3.
		if err := impl.S3.DeleteByKeys(ctx, []string{s.AvatarObjectKey}); err != nil {
			impl.Logger.Warn("s3 delete by keys error", slog.Any("error", err))
			// Do not return an error, simply continue this function as there might
			// be a case were the file was removed on the s3 bucket by ourselves
			// or some other reason.
		}

		// Generate the key of our upload.
		objectKey := fmt.Sprintf("tenant/%v/private/uploads/staff/%v/avatar/%v", tid.Hex(), req.StaffID.Hex(), req.FileName)

		// For debugging purposes only.
		impl.Logger.Debug("pre-upload meta",
			slog.String("AvatarFileName", req.FileName),
			slog.String("AvatarFileType", req.FileType),
			slog.String("AvatarObjectKey", objectKey),
		)

		go func(file multipart.File, objkey string) {
			impl.Logger.Debug("beginning private s3 image upload...")
			if err := impl.S3.UploadContentFromMulipart(context.Background(), objkey, file); err != nil {
				impl.Logger.Error("private s3 upload error", slog.Any("error", err))
				// Do not return an error, simply continue this function as there might
				// be a case were the file was removed on the s3 bucket by ourselves
				// or some other reason.
			}
			impl.Logger.Debug("Finished private s3 image upload")
		}(req.File, objectKey)

		// Update file.
		s.AvatarObjectKey = objectKey
		s.AvatarFileName = req.FileName
		s.AvatarFileType = req.FileType

		// Get preseigned URL.
		avatarObjectExpiry := time.Now().Add(time.Minute * 30)
		avatarFileURL, err := impl.S3.GetPresignedURL(ctx, objectKey, time.Minute*30)
		if err != nil {
			impl.Logger.Error("s3 failed get presigned url error", slog.Any("error", err))
			return nil, err
		}
		s.AvatarObjectURL = avatarFileURL
		s.AvatarObjectExpiry = avatarObjectExpiry

		// Update metainformation.
		s.ModifiedByUserID = userID
		s.ModifiedAt = time.Now()
		s.ModifiedByUserName = userName
		s.ModifiedFromIPAddress = ipAddress
	}

	// Save to the database the modified staff.
	if err := impl.StaffStorer.UpdateByID(ctx, s); err != nil {
		impl.Logger.Error("database update by id error", slog.Any("error", err))
		return nil, err
	}

	return s, nil
}
