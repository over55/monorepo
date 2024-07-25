package controller

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	comment_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type OrderOperationCreateCommentRequest struct {
	OrderWJID uint64 `bson:"order_wjid" json:"order_wjid"`
	Content   string `bson:"content" json:"content"`
}

func (impl *OrderControllerImpl) validateOperationCreateCommentRequest(ctx context.Context, dirtyData *OrderOperationCreateCommentRequest) error {
	e := make(map[string]string)

	if dirtyData.OrderWJID == 0 {
		e["order_wjid"] = "missing value"
	}

	if dirtyData.Content == "" {
		e["content"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *OrderControllerImpl) CreateComment(ctx context.Context, req *OrderOperationCreateCommentRequest) (*o_s.Order, error) {
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
	// Fetch the original order.
	//

	s, err := impl.OrderStorer.GetByWJID(ctx, req.OrderWJID)
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
		BelongsTo:             comment_s.BelongsToOrder,
		OrderID:               s.ID,
		OrderWJID:             s.WJID,
		OrderTenantIDWithWJID: fmt.Sprintf("%v_%v", s.TenantID.Hex(), s.WJID),
	}
	if err := impl.CommentStorer.Create(ctx, comment); err != nil {
		impl.Logger.Error("database create error", slog.Any("error", err))
		return nil, err
	}

	//
	// Create the order comment.
	//

	ccomment := &o_s.OrderComment{
		ID:                    comment.ID,
		OrderID:               s.ID,
		OrderWJID:             s.WJID,
		OrderTenantIDWithWJID: fmt.Sprintf("%v_%v", s.TenantID.Hex(), s.WJID),
		TenantID:              tid,
		CreatedByUserID:       userID,
		CreatedByUserName:     userName,
		CreatedAt:             time.Now(),
		CreatedFromIPAddress:  ipAddress,
		ModifiedByUserID:      userID,
		ModifiedByUserName:    userName,
		ModifiedAt:            time.Now(),
		ModifiedFromIPAddress: ipAddress,
		Content:               req.Content,
		Status:                comment_s.CommentStatusActive,
	}

	// Add our comment to the comments.
	s.ModifiedByUserID = ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	s.ModifiedAt = time.Now()
	s.Comments = append(s.Comments, ccomment)

	// Save to the database the modified order.
	if err := impl.OrderStorer.UpdateByID(ctx, s); err != nil {
		impl.Logger.Error("database update by id error", slog.Any("error", err))
		return nil, err
	}

	return s, nil
}
