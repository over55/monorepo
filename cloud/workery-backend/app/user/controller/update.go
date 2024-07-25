package controller

import (
	"context"
	"fmt"
	"strings"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type UserUpdateRequestIDO struct {
	ID                   primitive.ObjectID `bson:"_id" json:"id"`
	TenantID             primitive.ObjectID `bson:"tenant_id" json:"tenant_id,omitempty"`
	FirstName            string             `json:"first_name"`
	LastName             string             `json:"last_name"`
	Email                string             `json:"email"`
	Phone                string             `json:"phone,omitempty"`
	Country              string             `json:"country,omitempty"`
	Region               string             `json:"region,omitempty"`
	City                 string             `json:"city,omitempty"`
	Password             string             `json:"password"`
	PasswordRepeated     string             `json:"password_repeated"`
	AgreeTOS             bool               `json:"agree_tos,omitempty"`
	AgreePromotionsEmail bool               `json:"agree_promotions_email,omitempty"`
	Status               int8               `bson:"status" json:"status"`
	Role                 int8               `bson:"role" json:"role"`
}

func (impl *UserControllerImpl) userFromUpdateRequest(requestData *UserUpdateRequestIDO) (*user_s.User, error) {
	passwordHash, err := impl.Password.GenerateHashFromPassword(requestData.Password)
	if err != nil {
		impl.Logger.Error("hashing error", slog.Any("error", err))
		return nil, err
	}

	// Defensive Code: For security purposes we need to remove all whitespaces from the email and lower the characters.
	requestData.Email = strings.ToLower(requestData.Email)
	requestData.Email = strings.ReplaceAll(requestData.Email, " ", "")

	return &user_s.User{
		ID:                    requestData.ID,
		TenantID:              requestData.TenantID,
		FirstName:             requestData.FirstName,
		LastName:              requestData.LastName,
		Email:                 requestData.Email,
		PasswordHash:          passwordHash,
		PasswordHashAlgorithm: impl.Password.AlgorithmName(),
		Phone:                 requestData.Phone,
		Country:               requestData.Country,
		Region:                requestData.Region,
		City:                  requestData.City,
		AgreeTOS:              requestData.AgreeTOS,
		AgreePromotionsEmail:  requestData.AgreePromotionsEmail,
		Status:                requestData.Status,
		Role:                  requestData.Role,
	}, nil
}

func (impl *UserControllerImpl) UpdateByID(ctx context.Context, requestData *UserUpdateRequestIDO) (*user_s.User, error) {
	nu, err := impl.userFromUpdateRequest(requestData)
	if err != nil {
		return nil, err
	}

	// Extract from our session the following data.
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)

	// Extract from our session the following data.
	userRole := ctx.Value(constants.SessionUserRole).(int8)

	// Apply filtering based on ownership and role.
	if userRole != user_s.UserRoleExecutive {
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission")
	}

	// Lookup the user in our database, else return a `400 Bad Request` error.
	ou, err := impl.UserStorer.GetByID(ctx, nu.ID)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return nil, err
	}
	if ou == nil {
		impl.Logger.Warn("user does not exist validation error")
		return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
	}

	// Lookup the tenant in our database, else return a `400 Bad Request` error.
	o, err := impl.TenantStorer.GetByID(ctx, nu.TenantID)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return nil, err
	}
	if o == nil {
		impl.Logger.Warn("tenant does not exist exists validation error")
		return nil, httperror.NewForBadRequestWithSingleField("tenant_id", "tenant does not exist")
	}

	ou.TenantID = o.ID
	ou.FirstName = nu.FirstName
	ou.LastName = nu.LastName
	ou.Name = fmt.Sprintf("%s %s", nu.FirstName, nu.LastName)
	ou.LexicalName = fmt.Sprintf("%s, %s", nu.LastName, nu.FirstName)
	ou.Email = nu.Email
	ou.Phone = nu.Phone
	ou.Country = nu.Country
	ou.Region = nu.Region
	ou.City = nu.City
	ou.AgreePromotionsEmail = nu.AgreePromotionsEmail
	ou.ModifiedByUserID = userID
	ou.ModifiedByUserName = userName

	if err := impl.UserStorer.UpdateByID(ctx, ou); err != nil {
		impl.Logger.Error("user update by id error", slog.Any("error", err))
		return nil, err
	}
	return ou, nil
}
