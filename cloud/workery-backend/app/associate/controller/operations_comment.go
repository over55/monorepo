package controller

import (
	"context"
	"time"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	c_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	comment_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type AssociateOperationCreateCommentRequest struct {
	AssociateID primitive.ObjectID `bson:"associate_id" json:"associate_id"`
	Content     string             `bson:"content" json:"content"`
}

func (impl *AssociateControllerImpl) validateOperationCreateCommentRequest(ctx context.Context, dirtyData *AssociateOperationCreateCommentRequest) error {
	e := make(map[string]string)

	if dirtyData.AssociateID.IsZero() {
		e["associate_id"] = "missing value"
	}

	if dirtyData.Content == "" {
		e["content"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *AssociateControllerImpl) CreateComment(ctx context.Context, req *AssociateOperationCreateCommentRequest) (*c_s.Associate, error) {
	//
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
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to create a client comment")
	}

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateOperationCreateCommentRequest(ctx, req); err != nil {
		impl.Logger.Warn("validation error", slog.Any("error", err))
		return nil, err
	}

	//
	// Fetch the original associate.
	//

	s, err := impl.AssociateStorer.GetByID(ctx, req.AssociateID)
	if err != nil {
		impl.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	if s == nil {
		return nil, nil
	}

	//
	// Create the comment.
	//

	comment := &comment_s.Comment{
		ID:                    primitive.NewObjectID(),
		TenantID:              tid,
		CreatedAt:             time.Now(),
		CreatedByUserID:       userID,
		CreatedByUserName:     userName,
		CreatedFromIPAddress:  ipAddress,
		ModifiedAt:            time.Now(),
		ModifiedByUserID:      userID,
		ModifiedByUserName:    userName,
		ModifiedFromIPAddress: ipAddress,
		Content:               req.Content,
		Status:                comment_s.CommentStatusActive,
		BelongsTo:             comment_s.BelongsToAssociate,
		AssociateID:           s.ID,
		AssociateName:         s.Name,
	}
	if err := impl.CommentStorer.Create(ctx, comment); err != nil {
		impl.Logger.Error("database create error", slog.Any("error", err))
		return nil, err
	}

	//
	// Create the associate comment.
	//

	ccomment := &c_s.AssociateComment{
		ID:                    comment.ID,
		Content:               req.Content,
		TenantID:              tid,
		CreatedByUserID:       userID,
		CreatedByUserName:     userName,
		CreatedAt:             time.Now(),
		CreatedFromIPAddress:  ipAddress,
		ModifiedByUserID:      userID,
		ModifiedByUserName:    userName,
		ModifiedAt:            time.Now(),
		ModifiedFromIPAddress: ipAddress,
	}

	// Add our comment to the comments.
	s.ModifiedByUserID = ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	s.ModifiedAt = time.Now()
	s.Comments = append(s.Comments, ccomment)

	// Save to the database the modified associate.
	if err := impl.AssociateStorer.UpdateByID(ctx, s); err != nil {
		impl.Logger.Error("database update by id error", slog.Any("error", err))
		return nil, err
	}

	return s, nil
}
