package controller

import (
	"context"
	"fmt"
	"strings"
	"time"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	u_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type AssociateUpdateRequestIDO struct {
	ID                                   primitive.ObjectID   `json:"id,omitempty"`
	Type                                 int8                 `json:"type"`
	OrganizationName                     string               `json:"organization_name"`
	OrganizationType                     int8                 `json:"organization_type"`
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
	SkillSets                            []primitive.ObjectID `bson:"skill_sets" json:"skill_sets,omitempty"`
	InsuranceRequirements                []primitive.ObjectID `bson:"insurance_requirements" json:"insurance_requirements,omitempty"`
	VehicleTypes                         []primitive.ObjectID `bson:"vehicle_types" json:"vehicle_types,omitempty"`
	AwayLogs                             []primitive.ObjectID `bson:"away_logs" json:"away_logs,omitempty"`
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
	IsJobSeeker                          int8                 `bson:"is_job_seeker" json:"is_job_seeker"`
	StatusInCountry                      int8                 `bson:"status_in_country" json:"status_in_country"`
	StatusInCountryOther                 string               `bson:"status_in_country_other" json:"status_in_country_other"`
	CountryOfOrigin                      string               `bson:"country_of_origin" json:"country_of_origin"`
	DateOfEntryIntoCountry               string               `bson:"date_of_entry_into_country" json:"date_of_entry_into_country"`
	DateOfEntryIntoCountryDT             time.Time            `json:"-"`
	MaritalStatus                        int8                 `bson:"marital_status" json:"marital_status"`
	MaritalStatusOther                   string               `bson:"marital_status_other" json:"marital_status_other"`
	AccomplishedEducation                int8                 `bson:"accomplished_education" json:"accomplished_education"`
	AccomplishedEducationOther           string               `bson:"accomplished_education_other" json:"accomplished_education_other"`
	TaxID                                string               `bson:"tax_id" json:"tax_id"`
	HourlySalaryDesired                  int64                `bson:"hourly_salary_desired" json:"hourly_salary_desired"`
	LimitSpecial                         string               `bson:"limit_special" json:"limit_special"`
	DuesDate                             string               `bson:"dues_date" json:"dues_date"`
	DuesDateDT                           time.Time            `json:"-"`
	CommercialInsuranceExpiryDate        string               `bson:"commercial_insurance_expiry_date" json:"commercial_insurance_expiry_date"`
	CommercialInsuranceExpiryDateDT      time.Time            `json:"-"`
	AutoInsuranceExpiryDate              string               `bson:"auto_insurance_expiry_date" json:"auto_insurance_expiry_date"`
	AutoInsuranceExpiryDateDT            time.Time            `json:"-"`
	WsibNumber                           string               `bson:"wsib_number" json:"wsib_number"`
	WsibInsuranceDate                    string               `bson:"wsib_insurance_date" json:"wsib_insurance_date"`
	WsibInsuranceDateDT                  time.Time            `json:"-"`
	PoliceCheck                          string               `bson:"police_check" json:"police_check"`
	PoliceCheckDT                        time.Time            `json:"-"`
	DriversLicenseClass                  string               `bson:"drivers_license_class" json:"drivers_license_class"`
	ServiceFeeID                         primitive.ObjectID   `bson:"service_fee_id" json:"service_fee_id"`
	PreferredLanguage                    string               `bson:"preferred_language" json:"preferred_language"`
	EmergencyContactName                 string               `bson:"emergency_contact_name" json:"emergency_contact_name"`
	EmergencyContactRelationship         string               `bson:"emergency_contact_relationship" json:"emergency_contact_relationship"`
	EmergencyContactTelephone            string               `bson:"emergency_contact_telephone" json:"emergency_contact_telephone"`
	EmergencyContactAlternativeTelephone string               `bson:"emergency_contact_alternative_telephone" json:"emergency_contact_alternative_telephone"`
	IdentifyAs                           []int8               `bson:"identify_as" json:"identify_as,omitempty"`
}

func (impl *AssociateControllerImpl) validateUpdateRequest(ctx context.Context, dirtyData *AssociateUpdateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.Type == 0 {
		e["type"] = "missing value"
	} else {
		if dirtyData.Type == c_s.AssociateTypeCommercial {
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
	if dirtyData.Email == "" {
		e["email"] = "missing value"
	} else {
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

	if dirtyData.BirthDate == "" {
		e["birth_date"] = "missing value"
	}

	if len(dirtyData.SkillSets) <= 0 {
		e["skill_sets"] = "no selected choices"
	}

	if len(dirtyData.InsuranceRequirements) <= 0 {
		e["insurance_requirements"] = "no selected choices"
	}
	if dirtyData.DuesDate == "" {
		e["dues_date"] = "no selected choices"
	}
	if dirtyData.PoliceCheck == "" {
		e["police_check"] = "no selected choices"
	}
	if dirtyData.ServiceFeeID.IsZero() {
		e["service_fee_id"] = "no selected choices"
	}
	if dirtyData.CommercialInsuranceExpiryDate == "" {
		e["commercial_insurance_expiry_date"] = "missing value"
	}
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
	if dirtyData.IsJobSeeker == 0 {
		e["is_job_seeker"] = "missing value"
	} else if dirtyData.IsJobSeeker == a_s.AssociateIsJobSeekerYes {
		if dirtyData.StatusInCountry == 0 {
			e["status_in_country"] = "missing value"
		} else if dirtyData.StatusInCountry == a_s.StatusInCountryOther && dirtyData.StatusInCountryOther == "" {
			e["status_in_country_other"] = "missing value"
		} else if dirtyData.StatusInCountry == a_s.StatusInCountryPermanentResident || dirtyData.StatusInCountry == a_s.StatusInCountryNaturalizedCanadianCitizen || dirtyData.StatusInCountry == a_s.StatusInCountryProtectedPersons {
			if dirtyData.CountryOfOrigin == "" {
				e["country_of_origin"] = "missing value"
			}
			if dirtyData.DateOfEntryIntoCountryDT.IsZero() {
				e["date_of_entry_into_country"] = "missing value"
			}
		}

		if dirtyData.MaritalStatus == 0 {
			e["marital_status"] = "missing value"
		} else if dirtyData.MaritalStatus == a_s.MaritalStatusOther && dirtyData.MaritalStatusOther == "" {
			e["marital_status_other"] = "missing value"
		}
		if dirtyData.AccomplishedEducation == 0 {
			e["accomplished_education"] = "missing value"
		} else if dirtyData.AccomplishedEducation == a_s.AccomplishedEducationOther && dirtyData.AccomplishedEducationOther == "" {
			e["accomplished_education_other"] = "missing value"
		}
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *AssociateControllerImpl) UpdateByID(ctx context.Context, req *AssociateUpdateRequestIDO) (*c_s.Associate, error) {
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
		impl.Logger.Error("you do not have permission to update a client")
		return nil, httperror.NewForForbiddenWithSingleField("message", "you do not have permission to update a client")
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

		// Defensive Code: For security purposes we need to remove all whitespaces from the email and lower the characters.
		req.Email = strings.ToLower(req.Email)
		req.Email = strings.ReplaceAll(req.Email, " ", "")

		//
		// Lookup the previous record.
		//

		a, err := impl.AssociateStorer.GetByID(sessCtx, req.ID)
		if err != nil {
			impl.Logger.Error("fetching associate error", slog.Any("error", err))
			return nil, err
		}
		if a == nil {
			impl.Logger.Error("associate does not exist error", slog.Any("tagID", req.ID))
			return nil, httperror.NewForBadRequestWithSingleField("id", req.ID.Hex()+" associate does not exist")
		}

		//
		// Validate email.
		//

		if a.Email != req.Email {
			doesExist, err := impl.AssociateStorer.CheckIfExistsByEmail(sessCtx, req.Email)
			if err != nil {
				impl.Logger.Error("database check error", slog.Any("error", err))
				return nil, err
			}
			if doesExist {
				impl.Logger.Warn("associate email already exists validation error", slog.String("email", req.Email))
				return nil, httperror.NewForBadRequestWithSingleField("email", "email is not unique")
			}
		}

		//
		// Extract from request and map into our domain.
		//

		a.Type = req.Type
		a.OrganizationName = req.OrganizationName
		a.OrganizationType = req.OrganizationType
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
		a.Status = c_s.AssociateStatusActive
		a.Description = req.Description
		a.IsJobSeeker = req.IsJobSeeker
		a.StatusInCountry = req.StatusInCountry
		a.StatusInCountryOther = req.StatusInCountryOther
		a.CountryOfOrigin = req.CountryOfOrigin
		a.DateOfEntryIntoCountry = req.DateOfEntryIntoCountryDT
		a.MaritalStatus = req.MaritalStatus
		a.MaritalStatusOther = req.MaritalStatusOther
		a.AccomplishedEducation = req.AccomplishedEducation
		a.AccomplishedEducationOther = req.AccomplishedEducationOther
		a.TaxID = req.TaxID
		a.HourlySalaryDesired = req.HourlySalaryDesired
		a.LimitSpecial = req.LimitSpecial
		a.DuesDate = req.DuesDateDT
		a.CommercialInsuranceExpiryDate = req.CommercialInsuranceExpiryDateDT
		a.AutoInsuranceExpiryDate = req.AutoInsuranceExpiryDateDT
		a.WsibNumber = req.WsibNumber
		a.WsibInsuranceDate = req.WsibInsuranceDateDT
		a.PoliceCheck = req.PoliceCheckDT
		a.DriversLicenseClass = req.DriversLicenseClass
		a.ServiceFeeID = req.ServiceFeeID
		a.PreferredLanguage = req.PreferredLanguage
		a.EmergencyContactName = req.EmergencyContactName
		a.EmergencyContactRelationship = req.EmergencyContactRelationship
		a.EmergencyContactTelephone = req.EmergencyContactTelephone
		a.EmergencyContactAlternativeTelephone = req.EmergencyContactAlternativeTelephone
		a.IdentifyAs = req.IdentifyAs

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
		// Job Seeker - attach a job seeker id.
		//

		if a.IsJobSeeker == a_s.AssociateIsJobSeekerYes && a.JobSeekerID == "" {
			jsCount, err := impl.AssociateStorer.CountAllJobSeekersByTenantID(sessCtx, a.TenantID)
			if err != nil {
				impl.Logger.Error("failed counting job seekers", slog.Any("error", err))
				return nil, err
			}
			jsid, err := impl.JobSeekerID.Generate(a.FirstName, a.LastName, uint64(jsCount))
			if err != nil {
				impl.Logger.Error("failed generating job seeker ID", slog.Any("error", err))
				return nil, err
			}
			a.JobSeekerID = jsid
		}

		//
		// Save to our database.
		//

		if err := impl.AssociateStorer.UpdateByID(sessCtx, a); err != nil {
			impl.Logger.Error("database update error", slog.Any("error", err))
			return nil, err
		}

		//
		// Update related.
		//

		if err := impl.UpdateRelatedByUser(sessCtx, a); err != nil {
			impl.Logger.Error("update related error", slog.Any("error", err))
			return nil, err
		}

		if err := impl.UpdateRelatedBySkillSets(sessCtx, a, req.SkillSets); err != nil {
			impl.Logger.Error("updating skill sets error", slog.Any("error", err))
			return nil, err
		}

		if err := impl.UpdateRelatedByInsuranceRequirements(sessCtx, a, req.InsuranceRequirements); err != nil {
			impl.Logger.Error("updating insurance requirements error", slog.Any("error", err))
			return nil, err
		}

		if err := impl.UpdateRelatedByVehicleTypes(sessCtx, a, req.VehicleTypes); err != nil {
			impl.Logger.Error("updating vehicle types error", slog.Any("error", err))
			return nil, err
		}

		if err := impl.UpdateRelatedByTags(sessCtx, a, req.Tags); err != nil {
			impl.Logger.Error("updating tags error", slog.Any("error", err))
			return nil, err
		}

		ordersErrCh := make(chan error)
		go func(asso *a_s.Associate) {
			if err := impl.UpdateRelatedByOrders(sessCtx, asso); err != nil {
				impl.Logger.Error("updating orders error", slog.Any("error", err))
				ordersErrCh <- err
			}
			ordersErrCh <- nil
		}(a)

		taskItemsErrCh := make(chan error)
		go func(asso *a_s.Associate) {
			if err := impl.UpdateRelatedByTaskItems(sessCtx, asso); err != nil {
				impl.Logger.Error("updating task items error", slog.Any("error", err))
				taskItemsErrCh <- err
			}
			taskItemsErrCh <- nil
		}(a)

		// Wait until all goroutines are finished executing.
		ordersErr, taskItemsErr := <-ordersErrCh, <-taskItemsErrCh
		if ordersErr != nil {
			return nil, ordersErr
		}
		if taskItemsErr != nil {
			return nil, taskItemsErr
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

	return result.(*a_s.Associate), nil
}

func (impl *AssociateControllerImpl) createUserFromAssociateUpdateRequest(sessCtx mongo.SessionContext, req *AssociateUpdateRequestIDO) (*u_s.User, error) {
	//
	// Get variables from our user authenticated session.
	//

	tid, _ := sessCtx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	// role, _ := sessCtx.Value(constants.SessionUserRole).(int8)
	userID, _ := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := sessCtx.Value(constants.SessionUserName).(string)
	ipAddress, _ := sessCtx.Value(constants.SessionIPAddress).(string)

	impl.Logger.Warn("user account does not exist for associate update, creating user account now",
		slog.Any("AssociateID", req.ID))

	//
	// Create user.
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
		OrganizationName:        req.OrganizationName,
		OrganizationType:        req.OrganizationType,
		Email:                   req.Email,
		PasswordHashAlgorithm:   "DO BELOW...",
		PasswordHash:            "DO BELOW...",
		Role:                    u_s.UserRoleAssociate,
		ReferenceID:             req.ID, // A.K.A. `AssociateID`.
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
	}

	//
	// Temporary password.
	//

	// Generate a temporary password.
	temporaryPassword := primitive.NewObjectID().Hex()

	// Hash our password with the temporary password and attach to account.
	temporaryPasswordHash, err := impl.Password.GenerateHashFromPassword(temporaryPassword)
	if err != nil {
		impl.Logger.Error("hashing error", slog.Any("error", err))
		return nil, err
	}
	u.PasswordHashAlgorithm = impl.Password.AlgorithmName()
	u.PasswordHash = temporaryPasswordHash

	//
	// Insert the user into the database.
	//

	if err := impl.UserStorer.Create(sessCtx, u); err != nil {
		impl.Logger.Error("database create error", slog.Any("error", err))
		return nil, err
	}
	impl.Logger.Warn("user account created for associate during update", slog.Any("AssociateID", req.ID))

	return u, nil
}
