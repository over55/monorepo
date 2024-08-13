package controller

import (
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	attch_d "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	comment_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	s_s "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (impl *AttachmentControllerImpl) attachCommentComment(sessCtx mongo.SessionContext, attachment *attch_d.Attachment, commentContent string) error {
	// Extract from our session the following data.
	tid, _ := sessCtx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	// userRole, _ := sessCtx.Value(constants.SessionUserRole).(int8)
	userID, _ := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := sessCtx.Value(constants.SessionUserName).(string)
	ipAddress, _ := sessCtx.Value(constants.SessionIPAddress).(string)

	//
	// Create the generic comment.
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
		Content:               commentContent,
		Status:                comment_s.CommentStatusActive,
		BelongsTo:             comment_s.BelongsToAssociate,
		AssociateID:           attachment.AssociateID,
		AssociateName:         attachment.AssociateName,
		CustomerID:            attachment.CustomerID,
		CustomerName:          attachment.CustomerName,
		StaffID:               attachment.StaffID,
		StaffName:             attachment.StaffName,
		OrderID:               attachment.OrderID,
		OrderWJID:             attachment.OrderWJID,
		OrderTenantIDWithWJID: attachment.OrderTenantIDWithWJID,
		OrderIncidentID:       attachment.OrderIncidentID,
		OrderIncidentPublicID: attachment.OrderIncidentPublicID,
	}
	if err := impl.CommentStorer.Create(sessCtx, comment); err != nil {
		impl.Logger.Error("database create error", slog.Any("error", err))
		return err
	}

	//
	// Create the comment to the specific user account.
	//

	switch attachment.Type {
	case attch_d.AttachmentTypeCustomer:
		// Lookup the customer and assign to the attachment.
		cust, err := impl.CustomerStorer.GetByID(sessCtx, attachment.CustomerID)
		if err != nil {
			impl.Logger.Error("customer get error", slog.Any("error", err))
			return err
		}
		if cust == nil {
			return httperror.NewForBadRequestWithSingleField("customer_id", "does not exist for customer")
		}
		ccomment := &c_s.CustomerComment{
			ID:                    comment.ID,
			Content:               comment.Content,
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
		cust.ModifiedByUserID = sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
		cust.ModifiedAt = time.Now()
		cust.Comments = append(cust.Comments, ccomment)

		// Save to the database the modified associate.
		if err := impl.CustomerStorer.UpdateByID(sessCtx, cust); err != nil {
			impl.Logger.Error("database update customer by id error", slog.Any("error", err))
			return err
		}

	case attch_d.AttachmentTypeAssociate:
		// Lookup the associate and assign to the attachment.
		asso, err := impl.AssociateStorer.GetByID(sessCtx, attachment.AssociateID)
		if err != nil {
			impl.Logger.Error("associate get error", slog.Any("error", err))
			return err
		}
		if asso == nil {
			return httperror.NewForBadRequestWithSingleField("associate_id", "does not exist for associate")
		}
		acomment := &a_s.AssociateComment{
			ID:                    comment.ID,
			Content:               comment.Content,
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
		asso.ModifiedByUserID = sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
		asso.ModifiedAt = time.Now()
		asso.Comments = append(asso.Comments, acomment)

		// Save to the database the modified associate.
		if err := impl.AssociateStorer.UpdateByID(sessCtx, asso); err != nil {
			impl.Logger.Error("database update associate by id error", slog.Any("error", err))
			return err
		}
	case attch_d.AttachmentTypeOrder:
		// Lookup the associate and assign to the attachment.
		ord, err := impl.OrderStorer.GetByWJID(sessCtx, attachment.OrderWJID)
		if err != nil {
			impl.Logger.Error("order get error",
				slog.Any("error", err),
				slog.Any("order_wjid", attachment.OrderWJID))
			return err
		}
		if ord == nil {
			return httperror.NewForBadRequestWithSingleField("order_wjid", fmt.Sprintf("does not exist for: %v", attachment.OrderWJID))
		}
		ocomment := &o_s.OrderComment{
			ID:                    comment.ID,
			Content:               comment.Content,
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
		ord.ModifiedByUserID = sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
		ord.ModifiedAt = time.Now()
		ord.Comments = append(ord.Comments, ocomment)

		// Save to the database
		if err := impl.OrderStorer.UpdateByID(sessCtx, ord); err != nil {
			impl.Logger.Error("database update order by id error", slog.Any("error", err))
			return err
		}
	case attch_d.AttachmentTypeStaff:
		// Lookup the associate and assign to the attachment.
		sta, err := impl.StaffStorer.GetByID(sessCtx, attachment.StaffID)
		if err != nil {
			impl.Logger.Error("staff get error", slog.Any("error", err))
			return err
		}
		if sta == nil {
			return httperror.NewForBadRequestWithSingleField("staff_id", "does not exist for staff")
		}
		scomment := &s_s.StaffComment{
			ID:                    comment.ID,
			Content:               comment.Content,
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
		sta.ModifiedByUserID = sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
		sta.ModifiedAt = time.Now()
		sta.Comments = append(sta.Comments, scomment)

		// Save to the database the modified staff.
		if err := impl.StaffStorer.UpdateByID(sessCtx, sta); err != nil {
			impl.Logger.Error("database update staff by id error", slog.Any("error", err))
			return err
		}
	}
	return nil
}
