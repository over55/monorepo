package controller

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	comment_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	orderincident_s "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type OrderIncidentOperationCreateCommentRequest struct {
	OrderIncidentID primitive.ObjectID `bson:"order_incident_id" json:"order_incident_id"`
	Content         string             `bson:"content" json:"content"`
}

func (impl *OrderIncidentControllerImpl) validateOperationCreateCommentRequest(ctx context.Context, dirtyData *OrderIncidentOperationCreateCommentRequest) error {
	e := make(map[string]string)

	if dirtyData.OrderIncidentID.IsZero() {
		e["order_incident_id"] = "missing value"
	}

	if dirtyData.Content == "" {
		e["content"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *OrderIncidentControllerImpl) CreateComment(ctx context.Context, req *OrderIncidentOperationCreateCommentRequest) (*orderincident_s.OrderIncident, error) {
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
			OrderID:               o.ID,
			OrderWJID:             o.WJID,
			OrderTenantIDWithWJID: o.TenantIDWithWJID,
			OrderIncidentID:       oi.ID,
			OrderIncidentPublicID: oi.PublicID,
		}
		if err := impl.CommentStorer.Create(sessCtx, comment); err != nil {
			impl.Logger.Error("database create error", slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("created comment",
			slog.String("comment_id", comment.ID.Hex()),
			slog.String("order_id", o.ID.Hex()),
			slog.String("order_incident_id", oi.ID.Hex()))

		//
		// Create the order comment.
		//

		ocomment := &o_s.OrderComment{
			ID:                    comment.ID,
			OrderID:               oi.OrderID,
			OrderWJID:             oi.OrderWJID,
			OrderTenantIDWithWJID: oi.OrderTenantIDWithWJID,
			OrderIncidentID:       oi.ID,
			OrderIncidentPublicID: oi.PublicID,
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
		o.ModifiedByUserID = sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
		o.ModifiedFromIPAddress = ipAddress
		o.ModifiedAt = time.Now()
		o.Comments = append(o.Comments, ocomment)

		// Save to the database the modified order.
		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("database update by id error", slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("created order comment",
			slog.String("order_comment_id", ocomment.ID.Hex()),
			slog.String("order_id", o.ID.Hex()),
			slog.String("order_incident_id", oi.ID.Hex()))

		//
		// Create the order incident comment.
		//

		oicomment := &orderincident_s.OrderIncidentComment{
			ID:                    comment.ID,
			OrderID:               oi.OrderID,
			OrderWJID:             oi.OrderWJID,
			OrderTenantIDWithWJID: oi.OrderTenantIDWithWJID,
			OrderIncidentID:       oi.ID,
			OrderIncidentPublicID: oi.PublicID,
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
		oi.ModifiedByUserID = sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
		oi.ModifiedFromIPAddress = ipAddress
		oi.ModifiedAt = time.Now()
		oi.Comments = append(oi.Comments, oicomment)

		// Save to the database the modified order.
		if err := impl.OrderIncidentStorer.UpdateByID(sessCtx, oi); err != nil {
			impl.Logger.Error("database update by id error", slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("created order incidentcomment",
			slog.String("order_incident_comment_id", oicomment.ID.Hex()),
			slog.String("order_id", o.ID.Hex()),
			slog.String("order_incident_id", oi.ID.Hex()))

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
