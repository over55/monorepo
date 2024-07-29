package controller

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type ProfileResponse struct {
	// --- USER --- //
	ID                      primitive.ObjectID `bson:"_id" json:"id"`
	Email                   string             `bson:"email" json:"email"`
	FirstName               string             `bson:"first_name" json:"first_name"`
	LastName                string             `bson:"last_name" json:"last_name"`
	Name                    string             `bson:"name" json:"name"`
	LexicalName             string             `bson:"lexical_name" json:"lexical_name"`
	OrganizationName        string             `bson:"organization_name" json:"organization_name"`
	OrganizationType        int8               `bson:"organization_type" json:"organization_type"`
	TenantID                primitive.ObjectID `bson:"tenant_id" json:"tenant_id,omitempty"`
	TenantName              string             `bson:"tenant_name" json:"tenant_name"`
	Role                    int8               `bson:"role" json:"role"`
	ReferenceID             primitive.ObjectID `bson:"reference_id" json:"reference_id,omitempty"` // Reference the record this user belongs to by the role they are assigned, the choices are either: Customer, Associate, or Staff.
	HasStaffRole            bool               `bson:"has_staff_role" json:"has_staff_role"`
	WasEmailVerified        bool               `bson:"was_email_verified" json:"was_email_verified"`
	EmailVerificationCode   string             `bson:"email_verification_code,omitempty" json:"email_verification_code,omitempty"`
	EmailVerificationExpiry time.Time          `bson:"email_verification_expiry,omitempty" json:"email_verification_expiry,omitempty"`
	Phone                   string             `bson:"phone" json:"phone,omitempty"`
	Country                 string             `bson:"country" json:"country,omitempty"`
	Region                  string             `bson:"region" json:"region,omitempty"`
	City                    string             `bson:"city" json:"city,omitempty"`
	AgreeTOS                bool               `bson:"agree_tos" json:"agree_tos,omitempty"`
	AgreePromotionsEmail    bool               `bson:"agree_promotions_email" json:"agree_promotions_email,omitempty"`
	CreatedAt               time.Time          `bson:"created_at" json:"created_at"`
	ModifiedAt              time.Time          `bson:"modified_at" json:"modified_at"`
	Status                  int8               `bson:"status" json:"status"`
	JoinedTime              time.Time          `bson:"joined_time" json:"joined_time,omitempty"`
	PublicID                uint64             `bson:"public_id" json:"public_id,omitempty"`
	Timezone                string             `bson:"timezone" json:"timezone,omitempty"`
	OTPEnabled              bool               `bson:"otp_enabled" json:"otp_enabled"`
	OTPVerified             bool               `bson:"otp_verified" json:"otp_verified"`
	OTPValidated            bool               `bson:"otp_validated" json:"otp_validated"`
	OTPSecret               string             `bson:"otp_secret" json:"-"`
	OTPAuthURL              string             `bson:"otp_auth_url" json:"-"`

	// --- STAFF --- //
	PersonalEmail                        string             `bson:"personal_email" json:"personal_email"`
	IsOkToEmail                          bool               `bson:"is_ok_to_email" json:"is_ok_to_email"`
	PhoneType                            int8               `bson:"phone_type" json:"phone_type"`
	PhoneExtension                       string             `bson:"phone_extension" json:"phone_extension"`
	IsOkToText                           bool               `bson:"is_ok_to_text" json:"is_ok_to_text"`
	FaxNumber                            string             `bson:"fax_number" json:"fax_number"`
	OtherPhone                           string             `bson:"other_phone" json:"other_phone"`
	OtherPhoneExtension                  string             `bson:"other_phone_extension" json:"other_phone_extension"`
	OtherPhoneType                       int8               `bson:"other_phone_type" json:"other_phone_type"`
	PostalCode                           string             `bson:"postal_code" json:"postal_code,omitempty"`
	AddressLine1                         string             `bson:"address_line1" json:"address_line1,omitempty"`
	AddressLine2                         string             `bson:"address_line2" json:"address_line2,omitempty"`
	PostOfficeBoxNumber                  string             `bson:"post_office_box_number" json:"post_office_box_number"`
	FullAddressWithoutPostalCode         string             `bson:"full_address_without_postal_code" json:"full_address_without_postal_code,omitempty"` // Compiled value
	FullAddressWithPostalCode            string             `bson:"full_address_with_postal_code" json:"full_address_with_postal_code,omitempty"`       // Compiled value
	FullAddressURL                       string             `bson:"full_address_url" json:"full_address_url,omitempty"`                                 // Compiled value
	HasShippingAddress                   bool               `bson:"has_shipping_address" json:"has_shipping_address,omitempty"`
	ShippingName                         string             `bson:"shipping_name" json:"shipping_name,omitempty"`
	ShippingPhone                        string             `bson:"shipping_phone" json:"shipping_phone,omitempty"`
	ShippingCountry                      string             `bson:"shipping_country" json:"shipping_country,omitempty"`
	ShippingRegion                       string             `bson:"shipping_region" json:"shipping_region,omitempty"`
	ShippingCity                         string             `bson:"shipping_city" json:"shipping_city,omitempty"`
	ShippingPostalCode                   string             `bson:"shipping_postal_code" json:"shipping_postal_code,omitempty"`
	ShippingAddressLine1                 string             `bson:"shipping_address_line1" json:"shipping_address_line1,omitempty"`
	ShippingAddressLine2                 string             `bson:"shipping_address_line2" json:"shipping_address_line2,omitempty"`
	ShippingPostOfficeBoxNumber          string             `bson:"shipping_post_office_box_number" json:"shipping_post_office_box_number"`
	ShippingFullAddressWithoutPostalCode string             `bson:"shipping_full_address_without_postal_code" json:"shipping_full_address_without_postal_code,omitempty"` // Compiled value
	ShippingFullAddressWithPostalCode    string             `bson:"shipping_full_address_with_postal_code" json:"shipping_full_address_with_postal_code,omitempty"`       // Compiled value
	ShippingFullAddressURL               string             `bson:"shipping_full_address_url" json:"shipping_full_address_url,omitempty"`                                 // Compiled value
	HowDidYouHearAboutUsID               primitive.ObjectID `bson:"how_did_you_hear_about_us_id" json:"how_did_you_hear_about_us_id,omitempty"`
	HowDidYouHearAboutUsText             string             `bson:"how_did_you_hear_about_us_text" json:"how_did_you_hear_about_us_text,omitempty"`
	IsHowDidYouHearAboutUsOther          bool               `bson:"is_how_did_you_hear_about_us_other" json:"is_how_did_you_hear_about_us_other,omitempty"`
	HowDidYouHearAboutUsOther            string             `bson:"how_did_you_hear_about_us_other" json:"how_did_you_hear_about_us_other,omitempty"`
	Type                                 int8               `bson:"type" json:"type"`
	IsBusiness                           bool               `bson:"is_business" json:"is_business"`
	IsSenior                             bool               `bson:"is_senior" json:"is_senior"`
	IsSupport                            bool               `bson:"is_support" json:"is_support"`
	JobInfoRead                          string             `bson:"job_info_read" json:"job_info_read"`
	DeactivationReason                   int8               `bson:"deactivation_reason" json:"deactivation_reason"`
	DeactivationReasonOther              string             `bson:"deactivation_reason_other" json:"deactivation_reason_other"`
	Description                          string             `bson:"description" json:"description"`
	AvatarObjectExpiry                   time.Time          `bson:"avatar_object_expiry" json:"avatar_object_expiry"`
	AvatarObjectURL                      string             `bson:"avatar_object_url" json:"avatar_object_url"`
	AvatarObjectKey                      string             `bson:"avatar_object_key" json:"avatar_object_key"`
	AvatarFileType                       string             `bson:"avatar_file_type" json:"avatar_file_type"`
	AvatarFileName                       string             `bson:"avatar_file_name" json:"avatar_file_name"`
	BirthDate                            time.Time          `bson:"birth_date" json:"birth_date"`
	JoinDate                             time.Time          `bson:"join_date" json:"join_date"`
	Nationality                          string             `bson:"nationality" json:"nationality"`
	Gender                               int8               `bson:"gender" json:"gender"`
	GenderOther                          string             `bson:"gender_other" json:"gender_other"`
	TaxID                                string             `bson:"tax_id" json:"tax_id"`
	Elevation                            float64            `bson:"elevation" json:"elevation"`
	Latitude                             float64            `bson:"latitude" json:"latitude"`
	Longitude                            float64            `bson:"longitude" json:"longitude"`
	AreaServed                           string             `bson:"area_served" json:"area_served"`
	PreferredLanguage                    string             `bson:"preferred_language" json:"preferred_language"`
	ContactType                          string             `bson:"contact_type" json:"contact_type"`
	HourlySalaryDesired                  int64              `bson:"hourly_salary_desired" json:"hourly_salary_desired"`
	LimitSpecial                         string             `bson:"limit_special" json:"limit_special"`
	DuesDate                             time.Time          `bson:"dues_date" json:"dues_date"`
	CommercialInsuranceExpiryDate        time.Time          `bson:"commercial_insurance_expiry_date" json:"commercial_insurance_expiry_date"`
	AutoInsuranceExpiryDate              time.Time          `bson:"auto_insurance_expiry_date" json:"auto_insurance_expiry_date"`
	WsibNumber                           string             `bson:"wsib_number" json:"wsib_number"`
	WsibInsuranceDate                    time.Time          `bson:"wsib_insurance_date" json:"wsib_insurance_date"`
	PoliceCheck                          time.Time          `bson:"police_check" json:"police_check"`
	DriversLicenseClass                  string             `bson:"drivers_license_class" json:"drivers_license_class"`
	Score                                float64            `bson:"score" json:"score"`
	BalanceOwingAmount                   float64            `bson:"balance_owing_amount" json:"balance_owing_amount"`
	EmergencyContactName                 string             `bson:"emergency_contact_name" json:"emergency_contact_name"`
	EmergencyContactRelationship         string             `bson:"emergency_contact_relationship" json:"emergency_contact_relationship"`
	EmergencyContactTelephone            string             `bson:"emergency_contact_telephone" json:"emergency_contact_telephone"`
	EmergencyContactAlternativeTelephone string             `bson:"emergency_contact_alternative_telephone" json:"emergency_contact_alternative_telephone"`
	// SkillSets                            []*StaffSkillSet             `bson:"skill_sets" json:"skill_sets,omitempty"`
	// InsuranceRequirements                []*StaffInsuranceRequirement `bson:"insurance_requirements" json:"insurance_requirements,omitempty"`
	// VehicleTypes                         []*StaffVehicleType          `bson:"vehicle_types" json:"vehicle_types,omitempty"`
	// AwayLogs                             []*StaffAwayLog              `bson:"away_logs" json:"away_logs,omitempty"`
	// Tags                                 []*StaffTag                  `bson:"tags" json:"tags,omitempty"`
	// IdentifyAs                           []int8                       `bson:"identify_as" json:"identify_as,omitempty"`
}

func (impl *GatewayControllerImpl) Profile(ctx context.Context) (*ProfileResponse, error) {
	// Extract from our session the following data.
	userID := ctx.Value(constants.SessionUserID).(primitive.ObjectID)

	// DEVELOPERS NOTE:
	// We are going to take the app user account and the reference record (
	// customer, associate, or staff) and merge them into our result.

	// Lookup the user in our database, else return a `400 Bad Request` error.
	u, err := impl.UserStorer.GetByID(ctx, userID)
	if err != nil {
		impl.Logger.Error("database error", slog.Any("err", err))
		return nil, err
	}
	if u == nil {
		impl.Logger.Error("user does not exist validation error")
		return nil, httperror.NewForBadRequestWithSingleField("id", "does not exist")
	}

	// STEP 1: Convert `user` to `profile`.
	res := &ProfileResponse{
		ID:                      u.ID,
		Email:                   u.Email,
		FirstName:               u.FirstName,
		LastName:                u.LastName,
		Name:                    u.Name,
		LexicalName:             u.LexicalName,
		OrganizationName:        u.OrganizationName,
		OrganizationType:        u.OrganizationType,
		TenantID:                u.TenantID,
		TenantName:              u.TenantName,
		Role:                    u.Role,
		ReferenceID:             u.ReferenceID,
		HasStaffRole:            u.HasStaffRole,
		WasEmailVerified:        u.WasEmailVerified,
		EmailVerificationCode:   u.EmailVerificationCode,
		EmailVerificationExpiry: u.EmailVerificationExpiry,
		Phone:                   u.Phone,
		Country:                 u.Country,
		Region:                  u.Region,
		City:                    u.City,
		AgreeTOS:                u.AgreeTOS,
		AgreePromotionsEmail:    u.AgreePromotionsEmail,
		CreatedAt:               u.CreatedAt,
		ModifiedAt:              u.ModifiedAt,
		Status:                  u.Status,
		JoinedTime:              u.JoinedTime,
		PublicID:                u.PublicID,
		Timezone:                u.Timezone,
		OTPEnabled:              u.OTPEnabled,
		OTPVerified:             u.OTPVerified,
		OTPValidated:            u.OTPValidated,
		OTPSecret:               u.OTPSecret,
		OTPAuthURL:              u.OTPSecret,
	}

	// STEP 2: Convert reference record to `profile`.
	switch u.Role {
	case user_s.UserRoleExecutive:
		impl.Logger.Debug("skipping fetching executive staff record")
		break
	case user_s.UserRoleFrontlineStaff, user_s.UserRoleManagement:
		impl.Logger.Debug("fetching frontline or management staff record")
		staff, err := impl.StaffStorer.GetByID(ctx, u.ReferenceID)
		if err != nil {
			impl.Logger.Error("failed getting staff record", slog.Any("err", err))
			return nil, err
		}
		if staff == nil {
			impl.Logger.Error("staff does not exist error",
				slog.Any("user_role", u.Role),
				slog.String("user_id", u.ID.Hex()),
				slog.Any("reference_id", u.ReferenceID))
			return nil, httperror.NewForBadRequestWithSingleField("staff_id", "does not exist")
		}
		res.PersonalEmail = staff.PersonalEmail
		res.IsOkToEmail = staff.IsOkToEmail
		res.PhoneType = staff.PhoneType
		res.PhoneExtension = staff.PhoneExtension
		res.IsOkToText = staff.IsOkToText
		res.FaxNumber = staff.FaxNumber
		res.OtherPhone = staff.OtherPhone
		res.OtherPhoneExtension = staff.OtherPhoneExtension
		res.OtherPhoneType = staff.OtherPhoneType
		res.PostalCode = staff.PostalCode
		res.AddressLine1 = staff.AddressLine1
		res.AddressLine2 = staff.AddressLine2
		res.PostOfficeBoxNumber = staff.PostOfficeBoxNumber
		res.FullAddressWithoutPostalCode = staff.FullAddressWithoutPostalCode
		res.FullAddressWithPostalCode = staff.FullAddressWithPostalCode
		res.FullAddressURL = staff.FullAddressURL
		res.HasShippingAddress = staff.HasShippingAddress
		res.ShippingName = staff.ShippingName
		res.ShippingPhone = staff.ShippingPhone
		res.ShippingCountry = staff.ShippingCountry
		res.ShippingRegion = staff.ShippingRegion
		res.ShippingCity = staff.ShippingCity
		res.ShippingPostalCode = staff.ShippingPostalCode
		res.ShippingAddressLine1 = staff.ShippingAddressLine1
		res.ShippingAddressLine2 = staff.ShippingAddressLine2
		res.ShippingPostOfficeBoxNumber = staff.ShippingPostOfficeBoxNumber
		res.ShippingFullAddressWithoutPostalCode = staff.ShippingFullAddressWithoutPostalCode
		res.ShippingFullAddressWithPostalCode = staff.ShippingFullAddressWithPostalCode
		res.ShippingFullAddressURL = staff.ShippingFullAddressURL
		res.HowDidYouHearAboutUsID = staff.HowDidYouHearAboutUsID
		res.HowDidYouHearAboutUsText = staff.HowDidYouHearAboutUsText
		res.IsHowDidYouHearAboutUsOther = staff.IsHowDidYouHearAboutUsOther
		res.HowDidYouHearAboutUsOther = staff.HowDidYouHearAboutUsOther
		res.Type = staff.Type
		res.IsBusiness = staff.IsBusiness
		res.IsSenior = staff.IsSenior
		res.IsSupport = staff.IsSupport
		res.JobInfoRead = staff.JobInfoRead
		res.DeactivationReason = staff.DeactivationReason
		res.DeactivationReasonOther = staff.DeactivationReasonOther
		res.Description = staff.Description
		res.AvatarObjectExpiry = staff.AvatarObjectExpiry
		res.AvatarObjectURL = staff.AvatarObjectURL
		res.AvatarObjectKey = staff.AvatarObjectKey
		res.AvatarFileType = staff.AvatarFileType
		res.AvatarFileName = staff.AvatarFileName
		res.BirthDate = staff.BirthDate
		res.JoinDate = staff.JoinDate
		res.Nationality = staff.PersonalEmail
		res.Gender = staff.Gender
		res.GenderOther = staff.GenderOther
		res.TaxID = staff.TaxID
		res.Elevation = staff.Elevation
		res.Latitude = staff.Latitude
		res.Longitude = staff.Longitude
		res.AreaServed = staff.AreaServed
		res.PreferredLanguage = staff.PreferredLanguage
		res.ContactType = staff.ContactType
		res.HourlySalaryDesired = staff.HourlySalaryDesired
		res.LimitSpecial = staff.LimitSpecial
		res.DuesDate = staff.DuesDate
		res.CommercialInsuranceExpiryDate = staff.CommercialInsuranceExpiryDate
		res.AutoInsuranceExpiryDate = staff.AutoInsuranceExpiryDate
		res.WsibNumber = staff.WsibNumber
		res.WsibInsuranceDate = staff.WsibInsuranceDate
		res.PoliceCheck = staff.PoliceCheck
		res.DriversLicenseClass = staff.DriversLicenseClass
		res.Score = staff.Score
		res.BalanceOwingAmount = staff.BalanceOwingAmount
		res.EmergencyContactName = staff.EmergencyContactName
		res.EmergencyContactRelationship = staff.EmergencyContactRelationship
		res.EmergencyContactTelephone = staff.EmergencyContactTelephone
		res.EmergencyContactAlternativeTelephone = staff.EmergencyContactAlternativeTelephone
		break
	case user_s.UserRoleAssociate, user_s.UserRoleAssociateJobSeeker:
		impl.Logger.Debug("fetching associate record")
		asso, err := impl.AssociateStorer.GetByID(ctx, u.ReferenceID)
		if err != nil {
			impl.Logger.Error("failed getting associate record", slog.Any("err", err))
			return nil, err
		}
		if asso == nil {
			impl.Logger.Error("associate does not exist error",
				slog.Any("user_role", u.Role),
				slog.String("user_id", u.ID.Hex()),
				slog.Any("reference_id", u.ReferenceID))
			return nil, httperror.NewForBadRequestWithSingleField("associate_id", "does not exist")
		}
		res.PersonalEmail = asso.PersonalEmail
		res.IsOkToEmail = asso.IsOkToEmail
		res.PhoneType = asso.PhoneType
		res.PhoneExtension = asso.PhoneExtension
		res.IsOkToText = asso.IsOkToText
		res.FaxNumber = asso.FaxNumber
		res.OtherPhone = asso.OtherPhone
		res.OtherPhoneExtension = asso.OtherPhoneExtension
		res.OtherPhoneType = asso.OtherPhoneType
		res.PostalCode = asso.PostalCode
		res.AddressLine1 = asso.AddressLine1
		res.AddressLine2 = asso.AddressLine2
		res.PostOfficeBoxNumber = asso.PostOfficeBoxNumber
		res.FullAddressWithoutPostalCode = asso.FullAddressWithoutPostalCode
		res.FullAddressWithPostalCode = asso.FullAddressWithPostalCode
		res.FullAddressURL = asso.FullAddressURL
		res.HasShippingAddress = asso.HasShippingAddress
		res.ShippingName = asso.ShippingName
		res.ShippingPhone = asso.ShippingPhone
		res.ShippingCountry = asso.ShippingCountry
		res.ShippingRegion = asso.ShippingRegion
		res.ShippingCity = asso.ShippingCity
		res.ShippingPostalCode = asso.ShippingPostalCode
		res.ShippingAddressLine1 = asso.ShippingAddressLine1
		res.ShippingAddressLine2 = asso.ShippingAddressLine2
		res.ShippingPostOfficeBoxNumber = asso.ShippingPostOfficeBoxNumber
		res.ShippingFullAddressWithoutPostalCode = asso.ShippingFullAddressWithoutPostalCode
		res.ShippingFullAddressWithPostalCode = asso.ShippingFullAddressWithPostalCode
		res.ShippingFullAddressURL = asso.ShippingFullAddressURL
		res.HowDidYouHearAboutUsID = asso.HowDidYouHearAboutUsID
		res.HowDidYouHearAboutUsText = asso.HowDidYouHearAboutUsText
		res.IsHowDidYouHearAboutUsOther = asso.IsHowDidYouHearAboutUsOther
		res.HowDidYouHearAboutUsOther = asso.HowDidYouHearAboutUsOther
		res.Type = asso.Type
		res.IsBusiness = asso.IsBusiness
		res.IsSenior = asso.IsSenior
		res.IsSupport = asso.IsSupport
		res.JobInfoRead = asso.JobInfoRead
		res.DeactivationReason = asso.DeactivationReason
		res.DeactivationReasonOther = asso.DeactivationReasonOther
		res.Description = asso.Description
		res.AvatarObjectExpiry = asso.AvatarObjectExpiry
		res.AvatarObjectURL = asso.AvatarObjectURL
		res.AvatarObjectKey = asso.AvatarObjectKey
		res.AvatarFileType = asso.AvatarFileType
		res.AvatarFileName = asso.AvatarFileName
		res.BirthDate = asso.BirthDate
		res.JoinDate = asso.JoinDate
		res.Nationality = asso.PersonalEmail
		res.Gender = asso.Gender
		res.GenderOther = asso.GenderOther
		res.TaxID = asso.TaxID
		res.Elevation = asso.Elevation
		res.Latitude = asso.Latitude
		res.Longitude = asso.Longitude
		res.AreaServed = asso.AreaServed
		res.PreferredLanguage = asso.PreferredLanguage
		res.ContactType = asso.ContactType
		res.HourlySalaryDesired = asso.HourlySalaryDesired
		res.LimitSpecial = asso.LimitSpecial
		res.DuesDate = asso.DuesDate
		res.CommercialInsuranceExpiryDate = asso.CommercialInsuranceExpiryDate
		res.AutoInsuranceExpiryDate = asso.AutoInsuranceExpiryDate
		res.WsibNumber = asso.WsibNumber
		res.WsibInsuranceDate = asso.WsibInsuranceDate
		res.PoliceCheck = asso.PoliceCheck
		res.DriversLicenseClass = asso.DriversLicenseClass
		res.Score = asso.Score
		res.BalanceOwingAmount = asso.BalanceOwingAmount
		res.EmergencyContactName = asso.EmergencyContactName
		res.EmergencyContactRelationship = asso.EmergencyContactRelationship
		res.EmergencyContactTelephone = asso.EmergencyContactTelephone
		res.EmergencyContactAlternativeTelephone = asso.EmergencyContactAlternativeTelephone
		break
	case user_s.UserRoleCustomer:
		impl.Logger.Debug("fetching customer record")
		cust, err := impl.CustomerStorer.GetByID(ctx, u.ReferenceID)
		if err != nil {
			impl.Logger.Error("failed getting customer record", slog.Any("err", err))
			return nil, err
		}
		if cust == nil {
			impl.Logger.Error("customer does not exist error",
				slog.Any("user_role", u.Role),
				slog.String("user_id", u.ID.Hex()),
				slog.Any("reference_id", u.ReferenceID))
			return nil, httperror.NewForBadRequestWithSingleField("customer_id", "does not exist")
		}
		// res.PersonalEmail = cust.PersonalEmail
		res.IsOkToEmail = cust.IsOkToEmail
		res.PhoneType = cust.PhoneType
		res.PhoneExtension = cust.PhoneExtension
		res.IsOkToText = cust.IsOkToText
		res.FaxNumber = cust.FaxNumber
		res.OtherPhone = cust.OtherPhone
		res.OtherPhoneExtension = cust.OtherPhoneExtension
		res.OtherPhoneType = cust.OtherPhoneType
		res.PostalCode = cust.PostalCode
		res.AddressLine1 = cust.AddressLine1
		res.AddressLine2 = cust.AddressLine2
		res.PostOfficeBoxNumber = cust.PostOfficeBoxNumber
		res.FullAddressWithoutPostalCode = cust.FullAddressWithoutPostalCode
		res.FullAddressWithPostalCode = cust.FullAddressWithPostalCode
		res.FullAddressURL = cust.FullAddressURL
		res.HasShippingAddress = cust.HasShippingAddress
		res.ShippingName = cust.ShippingName
		res.ShippingPhone = cust.ShippingPhone
		res.ShippingCountry = cust.ShippingCountry
		res.ShippingRegion = cust.ShippingRegion
		res.ShippingCity = cust.ShippingCity
		res.ShippingPostalCode = cust.ShippingPostalCode
		res.ShippingAddressLine1 = cust.ShippingAddressLine1
		res.ShippingAddressLine2 = cust.ShippingAddressLine2
		res.ShippingPostOfficeBoxNumber = cust.ShippingPostOfficeBoxNumber
		res.ShippingFullAddressWithoutPostalCode = cust.ShippingFullAddressWithoutPostalCode
		res.ShippingFullAddressWithPostalCode = cust.ShippingFullAddressWithPostalCode
		res.ShippingFullAddressURL = cust.ShippingFullAddressURL
		res.HowDidYouHearAboutUsID = cust.HowDidYouHearAboutUsID
		res.HowDidYouHearAboutUsText = cust.HowDidYouHearAboutUsText
		res.IsHowDidYouHearAboutUsOther = cust.IsHowDidYouHearAboutUsOther
		res.HowDidYouHearAboutUsOther = cust.HowDidYouHearAboutUsOther
		res.Type = cust.Type
		res.IsBusiness = cust.IsBusiness
		res.IsSenior = cust.IsSenior
		res.IsSupport = cust.IsSupport
		res.JobInfoRead = cust.JobInfoRead
		res.DeactivationReason = cust.DeactivationReason
		res.DeactivationReasonOther = cust.DeactivationReasonOther
		res.Description = cust.Description
		res.AvatarObjectExpiry = cust.AvatarObjectExpiry
		res.AvatarObjectURL = cust.AvatarObjectURL
		res.AvatarObjectKey = cust.AvatarObjectKey
		res.AvatarFileType = cust.AvatarFileType
		res.AvatarFileName = cust.AvatarFileName
		res.BirthDate = cust.BirthDate
		res.JoinDate = cust.JoinDate
		// res.Nationality = cust.PersonalEmail
		res.Gender = cust.Gender
		res.GenderOther = cust.GenderOther
		// res.TaxID = cust.TaxID
		res.Elevation = cust.Elevation
		res.Latitude = cust.Latitude
		res.Longitude = cust.Longitude
		res.AreaServed = cust.AreaServed
		res.PreferredLanguage = cust.PreferredLanguage
		res.ContactType = cust.ContactType
		// res.HourlySalaryDesired = cust.HourlySalaryDesired
		// res.LimitSpecial = cust.LimitSpecial
		// res.DuesDate = cust.DuesDate
		// res.CommercialInsuranceExpiryDate = cust.CommercialInsuranceExpiryDate
		// res.AutoInsuranceExpiryDate = cust.AutoInsuranceExpiryDate
		// res.WsibNumber = cust.WsibNumber
		// res.WsibInsuranceDate = cust.WsibInsuranceDate
		// res.PoliceCheck = cust.PoliceCheck
		// res.DriversLicenseClass = cust.DriversLicenseClass
		// res.Score = cust.Score
		// res.BalanceOwingAmount = cust.BalanceOwingAmount
		// res.EmergencyContactName = cust.EmergencyContactName
		// res.EmergencyContactRelationship = cust.EmergencyContactRelationship
		// res.EmergencyContactTelephone = cust.EmergencyContactTelephone
		// res.EmergencyContactAlternativeTelephone = cust.EmergencyContactAlternativeTelephone
		break
	default:
		err := fmt.Errorf("not implemented for user role: %v", u.Role)
		return nil, err

	}
	return res, nil
}
