package controller

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type CustomerUpdateRequestIDO struct {
	ID                          primitive.ObjectID   `json:"id,omitempty"`
	Type                        int8                 `json:"type"`
	OrganizationName            string               `json:"organization_name"`
	OrganizationType            int8                 `json:"organization_type"`
	FirstName                   string               `json:"first_name"`
	LastName                    string               `json:"last_name"`
	Email                       string               `json:"email"`
	IsOkToEmail                 bool                 `json:"is_ok_to_email"`
	Phone                       string               `json:"phone,omitempty"`
	PhoneType                   int8                 `json:"phone_type"`
	PhoneExtension              string               `json:"phone_extension"`
	IsOkToText                  bool                 `json:"is_ok_to_text"`
	OtherPhone                  string               `json:"other_phone"`
	OtherPhoneExtension         string               `json:"other_phone_extension"`
	OtherPhoneType              int8                 `json:"other_phone_type"`
	Country                     string               `json:"country,omitempty"`
	Region                      string               `json:"region,omitempty"`
	City                        string               `json:"city,omitempty"`
	PostalCode                  string               `json:"postal_code,omitempty"`
	AddressLine1                string               `json:"address_line1,omitempty"`
	AddressLine2                string               `json:"address_line2,omitempty"`
	HasShippingAddress          bool                 `json:"has_shipping_address,omitempty"`
	ShippingName                string               `json:"shipping_name,omitempty"`
	ShippingPhone               string               `json:"shipping_phone,omitempty"`
	ShippingCountry             string               `json:"shipping_country,omitempty"`
	ShippingRegion              string               `json:"shipping_region,omitempty"`
	ShippingCity                string               `json:"shipping_city,omitempty"`
	ShippingPostalCode          string               `json:"shipping_postal_code,omitempty"`
	ShippingAddressLine1        string               `json:"shipping_address_line1,omitempty"`
	ShippingAddressLine2        string               `json:"shipping_address_line2,omitempty"`
	Tags                        []primitive.ObjectID `json:"tags,omitempty"`
	HowDidYouHearAboutUsID      primitive.ObjectID   `json:"how_did_you_hear_about_us_id,omitempty"`
	IsHowDidYouHearAboutUsOther bool                 `json:"is_how_did_you_hear_about_us_other,omitempty"`
	HowDidYouHearAboutUsOther   string               `json:"how_did_you_hear_about_us_other,omitempty"`
	BirthDate                   string               `json:"birth_date"`
	BirthDateDT                 time.Time            `json:"-"`
	JoinDate                    string               `json:"join_date"`
	JoinDateDT                  time.Time            `json:"-"`
	Gender                      int8                 `bson:"gender" json:"gender"`
	GenderOther                 string               `bson:"gender_other" json:"gender_other"`
	PreferredLanguage           string               `bson:"preferred_language" json:"preferred_language"`
}

func (impl *CustomerControllerImpl) validateUpdateRequest(ctx context.Context, dirtyData *CustomerUpdateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.ID.IsZero() {
		e["id"] = "missing value"
	}

	if dirtyData.Type == 0 {
		e["type"] = "missing value"
	} else {
		if dirtyData.Type == c_s.CustomerTypeCommercial {
			if dirtyData.OrganizationName == "" {
				e["organization_name"] = "missing value"
			}
			if dirtyData.OrganizationType == 0 {
				e["organization_type"] = "missing value"
			}
		}
	}
	if dirtyData.FirstName == "" {
		e["first_name"] = "missing value"
	}
	if dirtyData.LastName == "" {
		e["last_name"] = "missing value"
	}
	// Note: Email is optional, but if used then apply the following.
	if dirtyData.Email != "" {
		if len(dirtyData.Email) > 255 {
			e["email"] = "too long"
		}
	}

	if dirtyData.Phone == "" {
		e["phone"] = "missing value"
	}
	if dirtyData.PhoneType == 0 {
		e["phone_type"] = "missing value"
	}
	// if dirtyData.OtherPhone == "" {
	// 	e["other_phone"] = "missing value"
	// }
	// if dirtyData.OtherPhoneType == 0 {
	// 	e["other_phone_type"] = "missing value"
	// }
	if dirtyData.Country == "" {
		e["country"] = "missing value"
	}
	if dirtyData.Region == "" {
		e["region"] = "missing value"
	}
	if dirtyData.City == "" {
		e["city"] = "missing value"
	}
	if dirtyData.PostalCode == "" {
		e["postal_code"] = "missing value"
	}
	if dirtyData.AddressLine1 == "" {
		e["address_line1"] = "missing value"
	}

	// The following logic will enforce shipping address input validation.
	if dirtyData.HasShippingAddress == true {
		if dirtyData.ShippingName == "" {
			e["shipping_name"] = "missing value"
		}
		if dirtyData.ShippingPhone == "" {
			e["shipping_phone"] = "missing value"
		}
		if dirtyData.ShippingCountry == "" {
			e["shipping_country"] = "missing value"
		}
		if dirtyData.ShippingRegion == "" {
			e["shipping_region"] = "missing value"
		}
		if dirtyData.ShippingCity == "" {
			e["shipping_city"] = "missing value"
		}
		if dirtyData.ShippingPostalCode == "" {
			e["shipping_postal_code"] = "missing value"
		}
		if dirtyData.ShippingAddressLine1 == "" {
			e["shipping_address_line1"] = "missing value"
		}
	}

	if dirtyData.HowDidYouHearAboutUsID.IsZero() {
		e["how_did_you_hear_about_us_id"] = "missing value"
	} else {
		if dirtyData.IsHowDidYouHearAboutUsOther {
			if dirtyData.HowDidYouHearAboutUsOther == "" {
				e["how_did_you_hear_about_us_other"] = "missing value"
			}
		}
	}

	if dirtyData.Gender == 1 && dirtyData.GenderOther == "" {
		e["gender_other"] = "missing value"
	}
	if dirtyData.PreferredLanguage == "" {
		e["preferred_language"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *CustomerControllerImpl) UpdateByID(ctx context.Context, req *CustomerUpdateRequestIDO) (*c_s.Customer, error) {
	//
	// Get variables from our user authenticated session.
	//

	// tid, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	role, _ := ctx.Value(constants.SessionUserRole).(int8)
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	switch role {
	case u_s.UserRoleExecutive, u_s.UserRoleManagement, u_s.UserRoleFrontlineStaff:
		break
	default:
		impl.Logger.Error("you do not have permission to create a client")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to create a client")
	}

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateUpdateRequest(ctx, req); err != nil {
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
		// Lookup the previous record.
		//

		cust, err := impl.CustomerStorer.GetByID(sessCtx, req.ID)
		if err != nil {
			impl.Logger.Error("fetching customer error", slog.Any("error", err))
			return nil, err
		}
		if cust == nil {
			impl.Logger.Error("customer does not exist error", slog.Any("tagID", req.ID))
			return nil, httperror.NewForBadRequestWithSingleField("id", req.ID.Hex()+" customer does not exist")
		}

		// Since workery makes emails optional for `Customer` accounts,
		// therefore if no email entered then create random email.
		if req.Email == "" {
			req.Email = fmt.Sprintf("customer_%s@workery.ca", cust.ID.Hex())
		}

		// Defensive Code: Check uniqueness of email.
		if cust.Email != "" {
			// Defensive Code: For security purposes we need to remove all whitespaces from the email and lower the characters.
			req.Email = strings.ToLower(req.Email)
			req.Email = strings.ReplaceAll(req.Email, " ", "")

			if cust.Email != req.Email {
				// Lookup the user in our database, else return a `400 Bad Request` error.
				custExists, err := impl.CustomerStorer.CheckIfExistsByEmail(ctx, req.Email)
				if err != nil {
					impl.Logger.Error("database error", slog.Any("err", err))
					return nil, err
				}
				if custExists {
					impl.Logger.Warn("user already exists validation error", slog.String("email", req.Email))
					return nil, httperror.NewForBadRequestWithSingleField("email", "email is not unique")
				}
			}
		}

		//
		// Extract from request and map into our domain.
		//

		cust.Type = req.Type
		cust.OrganizationName = req.OrganizationName
		cust.OrganizationType = req.OrganizationType
		cust.Name = fmt.Sprintf("%s %s", req.FirstName, req.LastName)
		cust.LexicalName = fmt.Sprintf("%s, %s", req.LastName, req.FirstName)
		cust.FirstName = req.FirstName
		cust.LastName = req.LastName
		cust.Email = strings.ToLower(req.Email)
		cust.IsOkToEmail = req.IsOkToEmail
		cust.Phone = req.Phone
		cust.PhoneType = req.PhoneType
		cust.PhoneExtension = req.PhoneExtension
		cust.IsOkToText = req.IsOkToText
		cust.OtherPhone = req.OtherPhone
		cust.OtherPhoneExtension = req.OtherPhoneExtension
		cust.OtherPhoneType = req.OtherPhoneType
		cust.Country = req.Country
		cust.Region = req.Region
		cust.City = req.City
		cust.PostalCode = req.PostalCode
		cust.AddressLine1 = req.AddressLine1
		cust.AddressLine2 = req.AddressLine2
		cust.HasShippingAddress = req.HasShippingAddress
		cust.ShippingName = req.ShippingName
		cust.ShippingPhone = req.ShippingPhone
		cust.ShippingCountry = req.ShippingCountry
		cust.ShippingRegion = req.ShippingRegion
		cust.ShippingCity = req.ShippingCity
		cust.ShippingPostalCode = req.ShippingPostalCode
		cust.ShippingAddressLine1 = req.ShippingAddressLine1
		cust.ShippingAddressLine2 = req.ShippingAddressLine2
		cust.BirthDate = req.BirthDateDT
		cust.JoinDate = req.JoinDateDT
		cust.Gender = req.Gender
		cust.GenderOther = req.GenderOther
		cust.ModifiedAt = time.Now()
		cust.ModifiedByUserID = userID
		cust.ModifiedByUserName = userName
		cust.ModifiedFromIPAddress = ipAddress
		cust.PreferredLanguage = req.PreferredLanguage

		//
		// Extract the how did you hear about us.
		//

		hh, err := impl.HowHearStorer.GetByID(sessCtx, req.HowDidYouHearAboutUsID)
		if err != nil {
			impl.Logger.Error("fetching how hear error", slog.Any("error", err))
			return nil, err
		}
		if hh == nil {
			impl.Logger.Error("how hear does not exist error", slog.Any("tagID", req.HowDidYouHearAboutUsID))
			return nil, httperror.NewForBadRequestWithSingleField("tags", req.HowDidYouHearAboutUsID.Hex()+" how hear does not exist")
		}
		cust.HowDidYouHearAboutUsID = hh.ID
		cust.HowDidYouHearAboutUsText = hh.Text
		cust.IsHowDidYouHearAboutUsOther = req.IsHowDidYouHearAboutUsOther
		cust.HowDidYouHearAboutUsOther = req.HowDidYouHearAboutUsOther

		// impl.Logger.Debug("picked how did you hear about us",
		// 	slog.Any("HowDidYouHearAboutUsID", hh.ID),
		// 	slog.Any("HowDidYouHearAboutUsText", hh.Text),
		// 	slog.Any("IsHowDidYouHearAboutUsOther", req.IsHowDidYouHearAboutUsOther),
		// 	slog.Any("HowDidYouHearAboutUsOther", req.HowDidYouHearAboutUsOther))
		// return cust, errors.New("halt")

		//
		// Extract into our tags.
		//

		cust.Tags = make([]*c_s.CustomerTag, 0)
		for _, tagID := range req.Tags {
			// Step 1: Lookup original tag.
			origTag, err := impl.TagStorer.GetByID(sessCtx, tagID)
			if err != nil {
				impl.Logger.Error("fetching tag error", slog.Any("error", err))
				return nil, err
			}
			if origTag == nil {
				impl.Logger.Error("tag does not exist error", slog.Any("tagID", tagID))
				return nil, httperror.NewForBadRequestWithSingleField("tags", tagID.Hex()+" tag does not exist")
			}
			ctag := &c_s.CustomerTag{
				ID:          tagID,
				Text:        origTag.Text,
				Description: origTag.Description,
				Status:      c_s.CustomerStatusActive,
			}
			cust.Tags = append(cust.Tags, ctag)
		}

		//
		// Compile the `full address` and `address url`.
		//

		address := ""
		if cust.AddressLine1 != "" && cust.AddressLine1 != "-" {
			address += cust.AddressLine1
		}
		if cust.AddressLine2 != "" && cust.AddressLine2 != "-" {
			address += cust.AddressLine2
		}
		if cust.AddressLine1 != "" && cust.AddressLine1 != "-" {
			address += ", "
		}
		address += cust.City
		address += ", " + cust.Region
		address += ", " + cust.Country
		fullAddressWithoutPostalCode := address
		fullAddressWithPostalCode := "-"
		fullAddressURL := ""
		if cust.PostalCode != "" {
			fullAddressWithPostalCode = address + ", " + cust.PostalCode
			fullAddressURL = "https://www.google.com/maps/place/" + fullAddressWithPostalCode
		} else {
			fullAddressURL = "https://www.google.com/maps/place/" + fullAddressWithoutPostalCode
		}
		cust.FullAddressWithoutPostalCode = fullAddressWithoutPostalCode
		cust.FullAddressWithPostalCode = fullAddressWithPostalCode
		cust.FullAddressURL = fullAddressURL

		//
		// Save to our database.
		//

		if err := impl.CustomerStorer.UpdateByID(sessCtx, cust); err != nil {
			impl.Logger.Error("database create error", slog.Any("error", err))
			return nil, err
		}

		//
		// Update related fields in our database.
		//

		if err := impl.UpdateRelatedByUser(sessCtx, cust); err != nil {
			impl.Logger.Error("update related error", slog.Any("error", err))
			return nil, err
		}
		if err := impl.UpdateRelatedByTags(sessCtx, cust, req.Tags); err != nil {
			impl.Logger.Error("update related error", slog.Any("error", err))
			return nil, err
		}
		if err := impl.UpdateRelatedByOrders(sessCtx, cust); err != nil {
			impl.Logger.Error("update related error", slog.Any("error", err))
			return nil, err
		}
		if err := impl.UpdateRelatedByTaskItems(sessCtx, cust); err != nil {
			impl.Logger.Error("update related error", slog.Any("error", err))
			return nil, err
		}

		return cust, nil
	}

	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		impl.Logger.Error("session failed error",
			slog.Any("error", err))
		return nil, err
	}

	return result.(*c_s.Customer), nil
}
