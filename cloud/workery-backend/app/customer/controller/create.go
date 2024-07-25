package controller

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	comm_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type CustomerCreateRequestIDO struct {
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
	OtherPhoneType              int8                 `json:"other_phone_type"`
	OtherPhoneExtension         string               `json:"other_phone_extension"`
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
	AdditionalComment           string               `json:"additional_comment"`
	PreferredLanguage           string               `bson:"preferred_language" json:"preferred_language"`
	Password                    string               `bson:"password" json:"password"`
	PasswordRepeated            string               `bson:"password_repeated" json:"password_repeated"`
}

func (impl *CustomerControllerImpl) validateCreateRequest(ctx context.Context, dirtyData *CustomerCreateRequestIDO) error {
	e := make(map[string]string)

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

		// Lookup the user in our database, else return a `400 Bad Request` error.
		u, err := impl.UserStorer.GetByEmail(ctx, dirtyData.Email)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			return err
		}
		if u != nil {
			impl.Logger.Warn("user already exists validation error", slog.String("email", u.Email))
			return httperror.NewForBadRequestWithSingleField("email", "email is not unique")
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
	if dirtyData.Password != dirtyData.PasswordRepeated {
		e["password"] = "does not match"
		e["password_repeated"] = "does not match"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *CustomerControllerImpl) Create(ctx context.Context, req *CustomerCreateRequestIDO) (*c_s.Customer, error) {
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
		impl.Logger.Error("you do not have permission to create a client")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to create a client")
	}

	// DEVELOPERS NOTE:
	// Every customer needs to have a unique `public_id` (PID)
	// generated. The following needs to happen to generate the unique PID:
	// 1. Make the `Create` function be `atomic` and thus lock this function.
	// 2. Count total customers in system (for particular tenant).
	// 3. Generate PID.
	// 4. Apply the PID to the customer.
	// 5. Unlock this `Create` function to be usable again by other calls after
	//    the function successfully submits the customer into our system.
	impl.Kmutex.Lockf("create-customer-by-tenant-%s", tid.Hex())
	defer impl.Kmutex.Unlockf("create-customer-by-tenant-%s", tid.Hex())

	// Lock the tenant model from any read/writes because we are going
	// to need to read from the tenant the `LatestCustomerPublicID` field
	// which is important for creation of the `public_id`.
	impl.Kmutex.Lockf("tenant-%s", tid.Hex())
	defer impl.Kmutex.Unlockf("tenant-%s", tid.Hex())

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateCreateRequest(ctx, req); err != nil {
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
		// Generate `public id`. This is important!
		//

		t, err := impl.TenantStorer.GetByID(sessCtx, tid)
		if err != nil {
			impl.Logger.Error("get tenant by id from database error", slog.Any("error", err))
			return nil, err
		}
		if t == nil {
			err := fmt.Errorf("tenant does not exist with id: %v", tid)
			impl.Logger.Error("tenant does not exist error", slog.Any("error", err))
			return nil, err
		}

		// Special case: If nothing was previously set in tenant.
		if t.LatestCustomerPublicID == 0 {
			latest, err := impl.CustomerStorer.GetLatestByTenantID(sessCtx, tid)
			if err != nil {
				impl.Logger.Error("database get latest customer by tenant id error",
					slog.Any("error", err),
					slog.Any("tenant_id", tid))
				impl.Logger.Error("get by id from database error", slog.Any("error", err))
				return nil, err
			}
			if latest == nil {
				impl.Logger.Debug("first client creation detected, doing nothing...",
					slog.Any("TenantID", tid))
			} else {
				t.LatestCustomerPublicID = latest.PublicID
				t.LatestCustomerID = latest.ID
				if err := impl.TenantStorer.UpdateByID(sessCtx, t); err != nil {
					impl.Logger.Error("tenant update in database error", slog.Any("error", err))
					return nil, err
				}
			}
		}

		// Generate the new `public id` by taking the latest `public id` which the tenant
		// has stored and then increase by `1` to account for this customer we are
		// about to create.
		publicID := uint64(t.LatestCustomerPublicID) + 1

		impl.Logger.Debug("system generated new public id",
			slog.Int("latest_customer_id", int(t.LatestCustomerPublicID)),
			slog.Int("new_customer_public_id", int(publicID)))

		//
		// Extract from request and map into our domain.
		//

		customerID := primitive.NewObjectID()

		// Defensive Code: For security purposes we need to remove all whitespaces from the email and lower the characters.
		req.Email = strings.ToLower(req.Email)
		req.Email = strings.ReplaceAll(req.Email, " ", "")

		// Since workery makes emails optional for `Customer` accounts,
		// therefore if no email entered then create random email.
		if req.Email == "" {
			req.Email = fmt.Sprintf("customer_%s@workery.ca", customerID.Hex())
		}

		var cust *c_s.Customer = &c_s.Customer{}
		cust.ID = customerID
		cust.TenantID = tid
		cust.Status = c_s.CustomerStatusActive
		cust.Type = req.Type
		cust.OrganizationName = req.OrganizationName
		cust.OrganizationType = req.OrganizationType
		cust.Name = fmt.Sprintf("%s %s", req.FirstName, req.LastName)
		cust.LexicalName = fmt.Sprintf("%s, %s", req.LastName, req.FirstName)
		cust.FirstName = req.FirstName
		cust.LastName = req.LastName
		cust.Email = req.Email
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
		cust.CreatedAt = time.Now()
		cust.CreatedByUserID = userID
		cust.CreatedByUserName = userName
		cust.CreatedFromIPAddress = ipAddress
		cust.ModifiedAt = time.Now()
		cust.ModifiedByUserID = userID
		cust.ModifiedByUserName = userName
		cust.ModifiedFromIPAddress = ipAddress
		cust.PreferredLanguage = req.PreferredLanguage
		cust.OTPEnabled = impl.Config.AppServer.Enable2FAOnRegistration
		cust.PublicID = publicID

		// // FOR DEBUGGING PURPOSES ONLY. COMMENTING OUT FOR NOW.
		// impl.Logger.Debug("join date",
		// 	slog.Time("jd", req.JoinDate),
		// 	slog.Time("jd", cust.JoinDate),
		// 	slog.Time("bd", req.BirthDate),
		// 	slog.Time("bd", cust.BirthDate),
		// )
		// return nil, httperror.NewForForbiddenWithSingleField("message", "halt")

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
		// Extract our first comment.
		//

		cust.Comments = make([]*c_s.CustomerComment, 0)
		if req.AdditionalComment != "" {
			com := &comm_s.Comment{
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
				Content:               req.AdditionalComment,
				Status:                comm_s.CommentStatusActive,
				BelongsTo:             comm_s.BelongsToCustomer,
				CustomerID:            cust.ID,
				CustomerName:          cust.Name,
			}
			if err := impl.CommentStorer.Create(sessCtx, com); err != nil {
				impl.Logger.Error("creating comment error", slog.Any("error", err))
				return nil, err
			}

			cc := &c_s.CustomerComment{
				ID:                    com.ID,
				TenantID:              com.TenantID,
				CreatedAt:             com.CreatedAt,
				CreatedByUserID:       com.CreatedByUserID,
				CreatedByUserName:     com.CreatedByUserName,
				CreatedFromIPAddress:  com.CreatedFromIPAddress,
				ModifiedAt:            com.ModifiedAt,
				ModifiedByUserID:      com.ModifiedByUserID,
				ModifiedByUserName:    com.ModifiedByUserName,
				ModifiedFromIPAddress: com.ModifiedFromIPAddress,
				Content:               com.Content,
				Status:                com.Status,
				PublicID:              com.PublicID,
			}

			//
			// Append comments to customer details.
			//

			cust.Comments = append(cust.Comments, cc)
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

		if err := impl.CustomerStorer.Create(sessCtx, cust); err != nil {
			impl.Logger.Error("database create customer error", slog.Any("error", err))
			return nil, err
		}

		//
		// Create user if email was included in API request and attach to cust.
		//

		u, err := impl.createUserFromCreateCustomerRequest(sessCtx, customerID, req)
		if err != nil {
			impl.Logger.Error("database create user error", slog.Any("error", err))
			return nil, err
		}
		cust.UserID = u.ID
		if err := impl.CustomerStorer.UpdateByID(sessCtx, cust); err != nil {
			impl.Logger.Error("database update customer error", slog.Any("error", err))
			return nil, err
		}

		//
		// Update tenant with latest customer id's for tenant.
		//

		t.LatestCustomerPublicID = cust.PublicID
		t.LatestCustomerID = cust.ID
		if err := impl.TenantStorer.UpdateByID(sessCtx, t); err != nil {
			impl.Logger.Error("tenant update in database error", slog.Any("error", err))
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

func (impl *CustomerControllerImpl) createUserFromCreateCustomerRequest(sessCtx mongo.SessionContext, customerID primitive.ObjectID, req *CustomerCreateRequestIDO) (*u_s.User, error) {
	userExists, err := impl.UserStorer.CheckIfExistsByEmail(sessCtx, req.Email)
	if err != nil {
		impl.Logger.Error("failed checking by email", slog.Any("error", err))
		return nil, err
	}
	if userExists {
		impl.Logger.Error("email is not unique validation error")
		return nil, httperror.NewForForbiddenWithSingleField("email", "already exists")
	}

	tid, _ := sessCtx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	// role, _ := sessCtx.Value(constants.SessionUserRole).(int8)
	userID, _ := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := sessCtx.Value(constants.SessionUserName).(string)
	ipAddress, _ := sessCtx.Value(constants.SessionIPAddress).(string)

	//
	// Create user model.
	//

	// Either use a random one, or use the one inputted.
	var email string = fmt.Sprintf("customer_%s@workery.ca", customerID.Hex())
	if req.Email != "" {
		email = req.Email
	}

	u := &u_s.User{
		ID:                      primitive.NewObjectID(),
		TenantID:                tid,
		FirstName:               req.FirstName,
		LastName:                req.LastName,
		Name:                    fmt.Sprintf("%s %s", req.FirstName, req.LastName),
		LexicalName:             fmt.Sprintf("%s, %s", req.LastName, req.FirstName),
		OrganizationName:        req.OrganizationName,
		OrganizationType:        req.OrganizationType,
		Email:                   email,
		PasswordHashAlgorithm:   "DO BELOW...",
		PasswordHash:            "DO BELOW...",
		Role:                    u_s.UserRoleCustomer,
		ReferenceID:             customerID,
		WasEmailVerified:        true,
		EmailVerificationCode:   "",
		EmailVerificationExpiry: time.Now(),
		Phone:                   req.Phone,
		Country:                 req.Country,
		Region:                  req.Region,
		City:                    req.City,
		AgreeTOS:                true,
		AgreePromotionsEmail:    true,
		CreatedAt:               time.Now(),
		CreatedByUserID:         userID,
		CreatedByUserName:       userName,
		CreatedFromIPAddress:    ipAddress,
		ModifiedAt:              time.Now(),
		ModifiedByUserID:        userID,
		ModifiedByUserName:      userName,
		ModifiedFromIPAddress:   ipAddress,
		Status:                  u_s.UserStatusActive,
		Comments:                make([]*u_s.UserComment, 0),
		Salt:                    "",
		JoinedTime:              req.JoinDateDT,
		PrAccessCode:            "",
		PrExpiryTime:            time.Now(),
		PublicID:                0,
		Timezone:                "American/Toronto",
		OTPEnabled:              impl.Config.AppServer.Enable2FAOnRegistration,
		OTPVerified:             false,
		OTPValidated:            false,
		OTPSecret:               "",
		OTPAuthURL:              "",
	}

	//
	// Temporary or actual password.
	//

	if req.Password == "" {
		// Generate a temporary password.
		temporaryPassword := primitive.NewObjectID().Hex()

		// Hash our password with the temporary password and attach to account.
		temporaryPasswordHash, err := impl.Password.GenerateHashFromPassword(temporaryPassword)
		if err != nil {
			impl.Logger.Error("hashing error", slog.Any("error", err))
			return nil, err
		}
		u.PasswordHash = temporaryPasswordHash
	} else {
		// Hash our password with the temporary password and attach to account.
		passwordHash, err := impl.Password.GenerateHashFromPassword(req.Password)
		if err != nil {
			impl.Logger.Error("hashing error", slog.Any("error", err))
			return nil, err
		}
		u.PasswordHash = passwordHash
	}
	u.PasswordHashAlgorithm = impl.Password.AlgorithmName()

	//
	// Insert the user into the database.
	//

	if err := impl.UserStorer.Create(sessCtx, u); err != nil {
		impl.Logger.Error("database create customer error", slog.Any("error", err))
		return nil, err
	}

	return u, nil
}
