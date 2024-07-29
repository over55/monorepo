package controller

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	u_d "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type ProfileUpdateRequestIDO struct {
	FirstName                            string               `bson:"first_name" json:"first_name"`
	LastName                             string               `bson:"last_name" json:"last_name"`
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
	AgreePromotionsEmail                 bool                 `bson:"agree_promotions_email,omitempty" json:"agree_promotions_email,omitempty"`
}

func ValidateExecutiveStaffProfileUpdateRequest(dirtyData *ProfileUpdateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.FirstName == "" {
		e["first_name"] = "missing value"
	}
	if dirtyData.LastName == "" {
		e["last_name"] = "missing value"
	}
	if dirtyData.Email == "" {
		e["email"] = "missing value"
	}
	if len(dirtyData.Email) > 255 {
		e["email"] = "too long"
	}
	if dirtyData.Phone == "" {
		e["phone"] = "missing value"
	}
	if dirtyData.Country == "" {
		e["country"] = "missing value"
	}
	if dirtyData.Region == "" {
		e["region"] = "missing value"
	}
	if dirtyData.City == "" {
		e["city"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func ValidateStaffProfileUpdateRequest(dirtyData *ProfileUpdateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.FirstName == "" {
		e["first_name"] = "missing value"
	}
	if dirtyData.LastName == "" {
		e["last_name"] = "missing value"
	}
	if dirtyData.Email == "" {
		e["email"] = "missing value"
	}
	if len(dirtyData.Email) > 255 {
		e["email"] = "too long"
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

	if dirtyData.BirthDateDT.IsZero() {
		e["birth_date"] = "missing value"
	}

	if dirtyData.PoliceCheckDT.IsZero() {
		e["police_check"] = "no selected choices"
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

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func ValidateAssociateProfileUpdateRequest(dirtyData *ProfileUpdateRequestIDO) error {
	e := make(map[string]string)

	if dirtyData.FirstName == "" {
		e["first_name"] = "missing value"
	}
	if dirtyData.LastName == "" {
		e["last_name"] = "missing value"
	}
	if dirtyData.Email == "" {
		e["email"] = "missing value"
	}
	if len(dirtyData.Email) > 255 {
		e["email"] = "too long"
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

	if dirtyData.BirthDateDT.IsZero() {
		e["birth_date"] = "missing value"
	}

	if dirtyData.PoliceCheckDT.IsZero() {
		e["police_check"] = "no selected choices"
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

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *GatewayControllerImpl) ProfileUpdate(ctx context.Context, req *ProfileUpdateRequestIDO) error {
	////
	//// Start the transaction.
	////

	session, err := impl.DbClient.StartSession()
	if err != nil {
		impl.Logger.Error("start session error",
			slog.Any("error", err))
		return err
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {

		// Defensive Code: For security purposes we need to remove all whitespaces from the email and lower the characters.
		req.Email = strings.ToLower(req.Email)
		req.Email = strings.ReplaceAll(req.Email, " ", "")

		// Extract from our session the following data.
		userID := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)

		// Lookup the user in our database, else return a `400 Bad Request` error.
		ou, err := impl.UserStorer.GetByID(sessCtx, userID)
		if err != nil {
			impl.Logger.Error("database error", slog.Any("err", err))
			return nil, err
		}
		if ou == nil {
			impl.Logger.Error("user does not exist validation error")
			return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
		}

		// Perform our validation and return validation error on any issues detected.
		switch ou.Role {
		case u_d.UserRoleExecutive:
			if err := impl.ProfileUpdateExecutiveStaff(sessCtx, req, ou); err != nil {
				return nil, err
			}
			break
		case u_d.UserRoleManagement:
			fallthrough
		case u_d.UserRoleFrontlineStaff:
			if err := impl.ProfileUpdateStaff(sessCtx, req, ou); err != nil {
				return nil, err
			}
			break
		case u_d.UserRoleAssociate:
			if err := impl.ProfileUpdateAssociate(sessCtx, req, ou); err != nil {
				return nil, err
			}
			break
		default:
			impl.Logger.Error("unsupported profile role")
			return nil, httperror.NewForBadRequestWithSingleField("message", "currently do not support your profile role")
		}

		return nil, nil
	}

	// Start a transaction
	if _, err := session.WithTransaction(ctx, transactionFunc); err != nil {
		impl.Logger.Error("session failed error",
			slog.Any("error", err))
		return err
	}

	return nil
}

func (impl *GatewayControllerImpl) ProfileUpdateExecutiveStaff(sessCtx mongo.SessionContext, req *ProfileUpdateRequestIDO, ou *u_d.User) error {
	impl.Logger.Debug("validating executive staff user profile")
	if err := ValidateExecutiveStaffProfileUpdateRequest(req); err != nil {
		return err
	}
	ou.FirstName = req.FirstName
	ou.LastName = req.LastName
	ou.Name = fmt.Sprintf("%s %s", req.FirstName, req.LastName)
	ou.LexicalName = fmt.Sprintf("%s, %s", req.LastName, req.FirstName)
	ou.Email = req.Email
	ou.Phone = req.Phone
	ou.Country = req.Country
	ou.Region = req.Region
	ou.City = req.City
	ou.AgreePromotionsEmail = req.AgreePromotionsEmail

	if err := impl.UserStorer.UpdateByID(sessCtx, ou); err != nil {
		impl.Logger.Error("user update by id error", slog.Any("error", err))
		return err
	}
	impl.Logger.Debug("updated executive staff user profile")
	return nil
}

func (impl *GatewayControllerImpl) ProfileUpdateStaff(sessCtx mongo.SessionContext, req *ProfileUpdateRequestIDO, ou *u_d.User) error {
	userID, _ := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := sessCtx.Value(constants.SessionUserName).(string)
	ipAddress, _ := sessCtx.Value(constants.SessionIPAddress).(string)

	// STEP 1
	impl.Logger.Debug("validating management or frontline staff user profile")
	if err := ValidateStaffProfileUpdateRequest(req); err != nil {
		return err
	}

	// STEP 2
	ou.FirstName = req.FirstName
	ou.LastName = req.LastName
	ou.Name = fmt.Sprintf("%s %s", req.FirstName, req.LastName)
	ou.LexicalName = fmt.Sprintf("%s, %s", req.LastName, req.FirstName)
	ou.Email = req.Email
	ou.Phone = req.Phone
	ou.Country = req.Country
	ou.Region = req.Region
	ou.City = req.City
	ou.AgreePromotionsEmail = req.AgreePromotionsEmail
	if err := impl.UserStorer.UpdateByID(sessCtx, ou); err != nil {
		impl.Logger.Error("user update by id error", slog.Any("error", err))
		return err
	}

	// STEP 3:
	staff, err := impl.StaffStorer.GetByUserID(sessCtx, ou.ID)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return err
	}
	if staff == nil {
		impl.Logger.Error("staff does not exist validation error")
		return httperror.NewForBadRequestWithSingleField("user_id", "staff does not exist")
	}

	// STEP 4:
	staff.Name = fmt.Sprintf("%s %s", req.FirstName, req.LastName)
	staff.LexicalName = fmt.Sprintf("%s, %s", req.LastName, req.FirstName)
	staff.FirstName = req.FirstName
	staff.LastName = req.LastName
	staff.Email = strings.ToLower(req.Email)
	staff.Phone = req.Phone
	staff.PhoneType = req.PhoneType
	staff.PhoneExtension = req.PhoneExtension
	staff.Country = req.Country
	staff.Region = req.Region
	staff.City = req.City
	staff.PostalCode = req.PostalCode
	staff.AddressLine1 = req.AddressLine1
	staff.AddressLine2 = req.AddressLine2
	staff.HasShippingAddress = req.HasShippingAddress
	staff.ShippingName = req.ShippingName
	staff.ShippingPhone = req.ShippingPhone
	staff.ShippingCountry = req.ShippingCountry
	staff.ShippingRegion = req.ShippingRegion
	staff.ShippingCity = req.ShippingCity
	staff.ShippingPostalCode = req.ShippingPostalCode
	staff.ShippingAddressLine1 = req.ShippingAddressLine1
	staff.ShippingAddressLine2 = req.ShippingAddressLine2
	staff.BirthDate = req.BirthDateDT
	staff.JoinDate = req.JoinDateDT
	staff.Gender = req.Gender
	staff.GenderOther = req.GenderOther
	staff.ModifiedAt = time.Now()
	staff.ModifiedByUserID = userID
	staff.ModifiedByUserName = userName
	staff.ModifiedFromIPAddress = ipAddress
	staff.Description = req.Description
	staff.LimitSpecial = req.LimitSpecial
	staff.PoliceCheck = req.PoliceCheckDT
	staff.DriversLicenseClass = req.DriversLicenseClass
	staff.PreferredLanguage = req.PreferredLanguage
	staff.EmergencyContactName = req.EmergencyContactName
	staff.EmergencyContactRelationship = req.EmergencyContactRelationship
	staff.EmergencyContactTelephone = req.EmergencyContactTelephone
	staff.EmergencyContactAlternativeTelephone = req.EmergencyContactAlternativeTelephone
	staff.IdentifyAs = req.IdentifyAs

	//
	// Extract the how did you hear about us.
	//

	hh, err := impl.HowHearStorer.GetByID(sessCtx, req.HowDidYouHearAboutUsID)
	if err != nil {
		impl.Logger.Error("fetching how hear error", slog.Any("error", err))
		return err
	}
	if hh == nil {
		impl.Logger.Error("how hear does not exist error", slog.Any("tagID", req.HowDidYouHearAboutUsID))
		return httperror.NewForBadRequestWithSingleField("tags", req.HowDidYouHearAboutUsID.Hex()+" how hear does not exist")
	}
	staff.HowDidYouHearAboutUsID = hh.ID
	staff.HowDidYouHearAboutUsText = hh.Text
	staff.IsHowDidYouHearAboutUsOther = req.IsHowDidYouHearAboutUsOther
	staff.HowDidYouHearAboutUsOther = req.HowDidYouHearAboutUsOther

	//
	// Compile the `full address` and `address url`.
	//

	address := ""
	if staff.AddressLine1 != "" && staff.AddressLine1 != "-" {
		address += staff.AddressLine1
	}
	if staff.AddressLine2 != "" && staff.AddressLine2 != "-" {
		address += staff.AddressLine2
	}
	if staff.AddressLine1 != "" && staff.AddressLine1 != "-" {
		address += ", "
	}
	address += staff.City
	address += ", " + staff.Region
	address += ", " + staff.Country
	fullAddressWithoutPostalCode := address
	fullAddressWithPostalCode := "-"
	fullAddressURL := ""
	if staff.PostalCode != "" {
		fullAddressWithPostalCode = address + ", " + staff.PostalCode
		fullAddressURL = "https://www.google.com/maps/place/" + fullAddressWithPostalCode
	} else {
		fullAddressURL = "https://www.google.com/maps/place/" + fullAddressWithoutPostalCode
	}
	staff.FullAddressWithoutPostalCode = fullAddressWithoutPostalCode
	staff.FullAddressWithPostalCode = fullAddressWithPostalCode
	staff.FullAddressURL = fullAddressURL

	//
	// Save to our database.
	//

	if err := impl.StaffStorer.UpdateByID(sessCtx, staff); err != nil {
		impl.Logger.Error("database update error", slog.Any("error", err))
		return err
	}

	// STEP 5
	impl.Logger.Debug("updated management or frontline staff user profile")
	return nil
}

func (impl *GatewayControllerImpl) ProfileUpdateAssociate(sessCtx mongo.SessionContext, req *ProfileUpdateRequestIDO, ou *u_d.User) error {
	userID, _ := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := sessCtx.Value(constants.SessionUserName).(string)
	ipAddress, _ := sessCtx.Value(constants.SessionIPAddress).(string)

	// STEP 1
	impl.Logger.Debug("validating associate user profile")
	if err := ValidateAssociateProfileUpdateRequest(req); err != nil {
		return err
	}

	// STEP 2
	ou.FirstName = req.FirstName
	ou.LastName = req.LastName
	ou.Name = fmt.Sprintf("%s %s", req.FirstName, req.LastName)
	ou.LexicalName = fmt.Sprintf("%s, %s", req.LastName, req.FirstName)
	ou.Email = req.Email
	ou.Phone = req.Phone
	ou.Country = req.Country
	ou.Region = req.Region
	ou.City = req.City
	ou.AgreePromotionsEmail = req.AgreePromotionsEmail
	if err := impl.UserStorer.UpdateByID(sessCtx, ou); err != nil {
		impl.Logger.Error("user update by id error", slog.Any("error", err))
		return err
	}

	// STEP 3:
	asso, err := impl.AssociateStorer.GetByUserID(sessCtx, ou.ID)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return err
	}
	if asso == nil {
		impl.Logger.Error("asso does not exist validation error")
		return httperror.NewForBadRequestWithSingleField("user_id", "asso does not exist")
	}

	// STEP 4:
	asso.Name = fmt.Sprintf("%s %s", req.FirstName, req.LastName)
	asso.LexicalName = fmt.Sprintf("%s, %s", req.LastName, req.FirstName)
	asso.FirstName = req.FirstName
	asso.LastName = req.LastName
	asso.Email = strings.ToLower(req.Email)
	asso.Phone = req.Phone
	asso.PhoneType = req.PhoneType
	asso.PhoneExtension = req.PhoneExtension
	asso.Country = req.Country
	asso.Region = req.Region
	asso.City = req.City
	asso.PostalCode = req.PostalCode
	asso.AddressLine1 = req.AddressLine1
	asso.AddressLine2 = req.AddressLine2
	asso.HasShippingAddress = req.HasShippingAddress
	asso.ShippingName = req.ShippingName
	asso.ShippingPhone = req.ShippingPhone
	asso.ShippingCountry = req.ShippingCountry
	asso.ShippingRegion = req.ShippingRegion
	asso.ShippingCity = req.ShippingCity
	asso.ShippingPostalCode = req.ShippingPostalCode
	asso.ShippingAddressLine1 = req.ShippingAddressLine1
	asso.ShippingAddressLine2 = req.ShippingAddressLine2
	asso.BirthDate = req.BirthDateDT
	asso.JoinDate = req.JoinDateDT
	asso.Gender = req.Gender
	asso.GenderOther = req.GenderOther
	asso.ModifiedAt = time.Now()
	asso.ModifiedByUserID = userID
	asso.ModifiedByUserName = userName
	asso.ModifiedFromIPAddress = ipAddress
	asso.Description = req.Description
	asso.LimitSpecial = req.LimitSpecial
	asso.PoliceCheck = req.PoliceCheckDT
	asso.DriversLicenseClass = req.DriversLicenseClass
	asso.PreferredLanguage = req.PreferredLanguage
	asso.EmergencyContactName = req.EmergencyContactName
	asso.EmergencyContactRelationship = req.EmergencyContactRelationship
	asso.EmergencyContactTelephone = req.EmergencyContactTelephone
	asso.EmergencyContactAlternativeTelephone = req.EmergencyContactAlternativeTelephone
	asso.IdentifyAs = req.IdentifyAs

	//
	// Extract the how did you hear about us.
	//

	hh, err := impl.HowHearStorer.GetByID(sessCtx, req.HowDidYouHearAboutUsID)
	if err != nil {
		impl.Logger.Error("fetching how hear error", slog.Any("error", err))
		return err
	}
	if hh == nil {
		impl.Logger.Error("how hear does not exist error", slog.Any("tagID", req.HowDidYouHearAboutUsID))
		return httperror.NewForBadRequestWithSingleField("tags", req.HowDidYouHearAboutUsID.Hex()+" how hear does not exist")
	}
	asso.HowDidYouHearAboutUsID = hh.ID
	asso.HowDidYouHearAboutUsText = hh.Text
	asso.IsHowDidYouHearAboutUsOther = req.IsHowDidYouHearAboutUsOther
	asso.HowDidYouHearAboutUsOther = req.HowDidYouHearAboutUsOther

	//
	// Compile the `full address` and `address url`.
	//

	address := ""
	if asso.AddressLine1 != "" && asso.AddressLine1 != "-" {
		address += asso.AddressLine1
	}
	if asso.AddressLine2 != "" && asso.AddressLine2 != "-" {
		address += asso.AddressLine2
	}
	if asso.AddressLine1 != "" && asso.AddressLine1 != "-" {
		address += ", "
	}
	address += asso.City
	address += ", " + asso.Region
	address += ", " + asso.Country
	fullAddressWithoutPostalCode := address
	fullAddressWithPostalCode := "-"
	fullAddressURL := ""
	if asso.PostalCode != "" {
		fullAddressWithPostalCode = address + ", " + asso.PostalCode
		fullAddressURL = "https://www.google.com/maps/place/" + fullAddressWithPostalCode
	} else {
		fullAddressURL = "https://www.google.com/maps/place/" + fullAddressWithoutPostalCode
	}
	asso.FullAddressWithoutPostalCode = fullAddressWithoutPostalCode
	asso.FullAddressWithPostalCode = fullAddressWithPostalCode
	asso.FullAddressURL = fullAddressURL

	//
	// Save to our database.
	//

	if err := impl.AssociateStorer.UpdateByID(sessCtx, asso); err != nil {
		impl.Logger.Error("database update error", slog.Any("error", err))
		return err
	}

	// STEP 5
	impl.Logger.Debug("updated associate user profile")
	return nil
}
