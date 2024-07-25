package controller

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	comm_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	a_s "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type StaffCreateRequestIDO struct {
	Type                                 int8                 `json:"type"`
	FirstName                            string               `json:"first_name"`
	LastName                             string               `json:"last_name"`
	Email                                string               `json:"email"`
	IsOkToEmail                          bool                 `json:"is_ok_to_email"`
	Phone                                string               `json:"phone,omitempty"`
	PhoneType                            int8                 `json:"phone_type"`
	PhoneExtension                       string               `json:"phone_extension"`
	IsOkToText                           bool                 `json:"is_ok_to_text"`
	OtherPhone                           string               `json:"other_phone"`
	OtherPhoneExtension                  string               `json:"other_phone_extension"`
	OtherPhoneType                       int8                 `json:"other_phone_type"`
	Country                              string               `json:"country,omitempty"`
	Region                               string               `json:"region,omitempty"`
	City                                 string               `json:"city,omitempty"`
	PostalCode                           string               `json:"postal_code,omitempty"`
	AddressLine1                         string               `json:"address_line1,omitempty"`
	AddressLine2                         string               `json:"address_line2,omitempty"`
	HasShippingAddress                   bool                 `json:"has_shipping_address,omitempty"`
	ShippingName                         string               `json:"shipping_name,omitempty"`
	ShippingPhone                        string               `json:"shipping_phone,omitempty"`
	ShippingCountry                      string               `json:"shipping_country,omitempty"`
	ShippingRegion                       string               `json:"shipping_region,omitempty"`
	ShippingCity                         string               `json:"shipping_city,omitempty"`
	ShippingPostalCode                   string               `json:"shipping_postal_code,omitempty"`
	ShippingAddressLine1                 string               `json:"shipping_address_line1,omitempty"`
	ShippingAddressLine2                 string               `json:"shipping_address_line2,omitempty"`
	VehicleTypes                         []primitive.ObjectID `bson:"vehicle_types" json:"vehicle_types,omitempty"`
	Tags                                 []primitive.ObjectID `json:"tags,omitempty"`
	HowDidYouHearAboutUsID               primitive.ObjectID   `json:"how_did_you_hear_about_us_id,omitempty"`
	IsHowDidYouHearAboutUsOther          bool                 `json:"is_how_did_you_hear_about_us_other,omitempty"`
	HowDidYouHearAboutUsOther            string               `json:"how_did_you_hear_about_us_other,omitempty"`
	BirthDate                            string               `json:"birth_date"`
	BirthDateDT                          time.Time            `json:"-"`
	JoinDate                             string               `json:"join_date"`
	JoinDateDT                           time.Time            `json:"-"`
	Gender                               int8                 `bson:"gender" json:"gender"`
	GenderOther                          string               `bson:"gender_other" json:"gender_other"`
	AdditionalComment                    string               `json:"additional_comment"`
	Description                          string               `bson:"description" json:"description"`
	LimitSpecial                         string               `bson:"limit_special" json:"limit_special"`
	PoliceCheck                          string               `bson:"police_check" json:"police_check"`
	PoliceCheckDT                        time.Time            `json:"-"`
	DriversLicenseClass                  string               `bson:"drivers_license_class" json:"drivers_license_class"`
	PreferredLanguage                    string               `bson:"preferred_language" json:"preferred_language"`
	EmergencyContactName                 string               `bson:"emergency_contact_name" json:"emergency_contact_name"`
	EmergencyContactRelationship         string               `bson:"emergency_contact_relationship" json:"emergency_contact_relationship"`
	EmergencyContactTelephone            string               `bson:"emergency_contact_telephone" json:"emergency_contact_telephone"`
	EmergencyContactAlternativeTelephone string               `bson:"emergency_contact_alternative_telephone" json:"emergency_contact_alternative_telephone"`
	IdentifyAs                           []int8               `bson:"identify_as" json:"identify_as,omitempty"`
	Password                             string               `bson:"password" json:"password"`
	PasswordRepeated                     string               `bson:"password_repeated" json:"password_repeated"`
}

func (impl *StaffControllerImpl) validateCreateRequest(ctx context.Context, dirtyData *StaffCreateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.Type == 0 {
		e["type"] = "missing value"
	} else {
		// Do nothing...
	}
	if dirtyData.FirstName == "" {
		e["first_name"] = "missing value"
	}
	if dirtyData.LastName == "" {
		e["last_name"] = "missing value"
	}
	if dirtyData.Email == "" {
		e["email"] = "missing value"
	} else {
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

	if dirtyData.BirthDate == "" {
		e["birth_date"] = "missing value"
	}

	// if dirtyData.PoliceCheck == "" {
	// 	e["police_check"] = "no selected choices"
	// }

	if dirtyData.EmergencyContactName == "" {
		e["emergency_contact_name"] = "missing value"
	}
	if dirtyData.EmergencyContactRelationship == "" {
		e["emergency_contact_relationship"] = "missing value"
	}
	if dirtyData.EmergencyContactTelephone == "" {
		e["emergency_contact_telephone"] = "missing value"
	}
	if dirtyData.PreferredLanguage == "" {
		e["preferred_language"] = "missing value"
	}
	if dirtyData.Gender == 1 && dirtyData.GenderOther == "" {
		e["gender_other"] = "missing value"
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

func (impl *StaffControllerImpl) createUserForStaff(ctx context.Context, staffID primitive.ObjectID, req *StaffCreateRequestIDO) (*u_s.User, error) {
	tid, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	// role, _ := ctx.Value(constants.SessionUserRole).(int8)
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	//
	// Create user model.
	//

	// Defensive Code: For security purposes we need to remove all whitespaces from the email and lower the characters.
	req.Email = strings.ToLower(req.Email)
	req.Email = strings.ReplaceAll(req.Email, " ", "")

	u := &u_s.User{
		ID:                      primitive.NewObjectID(),
		TenantID:                tid,
		FirstName:               req.FirstName,
		LastName:                req.LastName,
		Name:                    fmt.Sprintf("%s %s", req.FirstName, req.LastName),
		LexicalName:             fmt.Sprintf("%s, %s", req.LastName, req.FirstName),
		Email:                   req.Email,
		PasswordHashAlgorithm:   "DO BELOW...",
		PasswordHash:            "DO BELOW...",
		Role:                    u_s.UserRoleStaff,
		ReferenceID:             staffID,
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

	if err := impl.UserStorer.Create(ctx, u); err != nil {
		impl.Logger.Error("database create error", slog.Any("error", err))
		return nil, err
	}

	return u, nil
}

func (impl *StaffControllerImpl) Create(ctx context.Context, req *StaffCreateRequestIDO) (*c_s.Staff, error) {
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
	// Every submission needs to have a unique `public id` (PID)
	// generated. The following needs to happen to generate the unique PID:
	// 1. Make the `Create` function be `atomic` and thus lock this function.
	// 2. Count total records in system (for particular tenant).
	// 3. Generate PID.
	// 4. Apply the PID to the record.
	// 5. Unlock this `Create` function to be usable again by other calls after
	//    the function successfully submits the record into our system.
	impl.Kmutex.Lockf("create-staff-by-tenant-%s", tid.Hex())
	defer impl.Kmutex.Unlockf("create-staff-by-tenant-%s", tid.Hex())

	// Lock the tenant model from any read/writes because we are going
	// to need to read from the tenant the `LatestStaffPublicID` field
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
		if t.LatestStaffPublicID == 0 {
			latest, err := impl.StaffStorer.GetLatestByTenantID(sessCtx, tid)
			if err != nil {
				impl.Logger.Error("database get latest staff by tenant id error",
					slog.Any("error", err),
					slog.Any("tenant_id", tid))
				impl.Logger.Error("get by id from database error", slog.Any("error", err))
				return nil, err
			}
			if latest == nil {
				impl.Logger.Debug("first client creation detected, doing nothing...",
					slog.Any("TenantID", tid))
			} else {
				t.LatestStaffPublicID = latest.PublicID
				t.LatestStaffID = latest.ID
				if err := impl.TenantStorer.UpdateByID(sessCtx, t); err != nil {
					impl.Logger.Error("tenant update in database error", slog.Any("error", err))
					return nil, err
				}
			}
		}

		// Generate the new `public id` by taking the latest `public id` which the tenant
		// has stored and then increase by `1` to account for this staff we are
		// about to create.
		publicID := uint64(t.LatestStaffPublicID) + 1

		impl.Logger.Debug("system generated new public id",
			slog.Int("latest_staff_id", int(t.LatestStaffPublicID)),
			slog.Int("new_staff_public_id", int(publicID)))

		// Defensive Code: For security purposes we need to remove all whitespaces from the email and lower the characters.
		req.Email = strings.ToLower(req.Email)
		req.Email = strings.ReplaceAll(req.Email, " ", "")

		//
		// Extract from request and map into our domain the base information.
		//

		var a *c_s.Staff = &c_s.Staff{}
		a.ID = primitive.NewObjectID()
		a.TenantID = tid
		a.Type = req.Type
		a.Name = fmt.Sprintf("%s %s", req.FirstName, req.LastName)
		a.LexicalName = fmt.Sprintf("%s, %s", req.LastName, req.FirstName)
		a.FirstName = req.FirstName
		a.LastName = req.LastName
		a.Email = req.Email
		a.IsOkToEmail = req.IsOkToEmail
		a.Phone = req.Phone
		a.PhoneType = req.PhoneType
		a.PhoneExtension = req.PhoneExtension
		a.IsOkToText = req.IsOkToText
		a.OtherPhone = req.OtherPhone
		a.OtherPhoneExtension = req.OtherPhoneExtension
		a.OtherPhoneType = req.OtherPhoneType
		a.Country = req.Country
		a.Region = req.Region
		a.City = req.City
		a.PostalCode = req.PostalCode
		a.AddressLine1 = req.AddressLine1
		a.AddressLine2 = req.AddressLine2
		a.HasShippingAddress = req.HasShippingAddress
		a.ShippingName = req.ShippingName
		a.ShippingPhone = req.ShippingPhone
		a.ShippingCountry = req.ShippingCountry
		a.ShippingRegion = req.ShippingRegion
		a.ShippingCity = req.ShippingCity
		a.ShippingPostalCode = req.ShippingPostalCode
		a.ShippingAddressLine1 = req.ShippingAddressLine1
		a.ShippingAddressLine2 = req.ShippingAddressLine2
		a.BirthDate = req.BirthDateDT
		a.JoinDate = req.JoinDateDT
		a.Gender = req.Gender
		a.GenderOther = req.GenderOther
		a.CreatedAt = time.Now()
		a.CreatedByUserID = userID
		a.CreatedByUserName = userName
		a.CreatedFromIPAddress = ipAddress
		a.ModifiedAt = time.Now()
		a.ModifiedByUserID = userID
		a.ModifiedByUserName = userName
		a.ModifiedFromIPAddress = ipAddress
		a.Status = c_s.StaffStatusActive
		a.Description = req.Description
		a.LimitSpecial = req.LimitSpecial
		a.PoliceCheck = req.PoliceCheckDT
		a.DriversLicenseClass = req.DriversLicenseClass
		a.PreferredLanguage = req.PreferredLanguage
		a.EmergencyContactName = req.EmergencyContactName
		a.EmergencyContactRelationship = req.EmergencyContactRelationship
		a.EmergencyContactTelephone = req.EmergencyContactTelephone
		a.EmergencyContactAlternativeTelephone = req.EmergencyContactAlternativeTelephone
		a.IdentifyAs = req.IdentifyAs
		a.OTPEnabled = impl.Config.AppServer.Enable2FAOnRegistration

		//
		// Assign vehicle types
		//

		for _, vtID := range req.VehicleTypes {
			vt, err := impl.VehicleTypeStorer.GetByID(sessCtx, vtID)
			if err != nil {
				log.Fatal(err)
			}
			if vt == nil {
				log.Fatal("skill set does not exist")
			}
			avt := &c_s.StaffVehicleType{
				ID:          vt.ID,
				Name:        vt.Name,
				Description: vt.Description,
				Status:      vt.Status,
			}
			a.VehicleTypes = append(a.VehicleTypes, avt)
		}

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
		a.HowDidYouHearAboutUsID = hh.ID
		a.HowDidYouHearAboutUsText = hh.Text
		a.IsHowDidYouHearAboutUsOther = req.IsHowDidYouHearAboutUsOther
		a.HowDidYouHearAboutUsOther = req.HowDidYouHearAboutUsOther

		//
		// Extract into our tags.
		//

		a.Tags = make([]*c_s.StaffTag, 0)
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
			ctag := &c_s.StaffTag{
				ID:          tagID,
				Text:        origTag.Text,
				Description: origTag.Description,
			}
			a.Tags = append(a.Tags, ctag)
		}

		//
		// Extract our first comment.
		//

		a.Comments = make([]*c_s.StaffComment, 0)
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
				BelongsTo:             comm_s.BelongsToStaff,
				StaffID:               a.ID,
				StaffName:             a.Name,
			}
			if err := impl.CommentStorer.Create(sessCtx, com); err != nil {
				impl.Logger.Error("creating comment error", slog.Any("error", err))
				return nil, err
			}

			cc := &c_s.StaffComment{
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
			// Append comments to staff details.
			//

			a.Comments = append(a.Comments, cc)
		}

		//
		// Compile the `full address` and `address url`.
		//

		address := ""
		if a.AddressLine1 != "" && a.AddressLine1 != "-" {
			address += a.AddressLine1
		}
		if a.AddressLine2 != "" && a.AddressLine2 != "-" {
			address += a.AddressLine2
		}
		if a.AddressLine1 != "" && a.AddressLine1 != "-" {
			address += ", "
		}
		address += a.City
		address += ", " + a.Region
		address += ", " + a.Country
		fullAddressWithoutPostalCode := address
		fullAddressWithPostalCode := "-"
		fullAddressURL := ""
		if a.PostalCode != "" {
			fullAddressWithPostalCode = address + ", " + a.PostalCode
			fullAddressURL = "https://www.google.com/maps/place/" + fullAddressWithPostalCode
		} else {
			fullAddressURL = "https://www.google.com/maps/place/" + fullAddressWithoutPostalCode
		}
		a.FullAddressWithoutPostalCode = fullAddressWithoutPostalCode
		a.FullAddressWithPostalCode = fullAddressWithPostalCode
		a.FullAddressURL = fullAddressURL

		//
		// Save to our database.
		//

		// // FOR DEBUGGING PURPOSES ONLY. Uncomment if you need to do experiments.
		// return nil, httperror.NewForForbiddenWithSingleField("message", "halted by the programmer")

		if err := impl.StaffStorer.Create(sessCtx, a); err != nil {
			impl.Logger.Error("database create error", slog.Any("error", err))
			return nil, err
		}

		assoUser, err := impl.createUserForStaff(sessCtx, a.ID, req)
		if err != nil {
			impl.Logger.Error("creating database error", slog.Any("error", err))
			return nil, err
		}
		if assoUser == nil {
			impl.Logger.Error("staff user failed creating error")
			return nil, httperror.NewForBadRequestWithSingleField("email", req.Email)
		}
		a.HasUserAccount = true
		a.UserID = assoUser.ID
		if err := impl.StaffStorer.UpdateByID(sessCtx, a); err != nil {
			impl.Logger.Error("database update by id error", slog.Any("error", err))
			return nil, err
		}

		//
		// Update tenant with latest customer id's for tenant.
		//

		t.LatestStaffPublicID = a.PublicID
		t.LatestStaffID = a.ID
		if err := impl.TenantStorer.UpdateByID(sessCtx, t); err != nil {
			impl.Logger.Error("tenant update in database error", slog.Any("error", err))
			return nil, err
		}

		return a, nil
	}

	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		impl.Logger.Error("session failed error",
			slog.Any("error", err))
		return nil, err
	}

	return result.(*a_s.Staff), nil
}
