// Account-related constants
export const ACCOUNT_STATUS = {
  ACTIVE: 1,
  INACTIVE: 2,
};

export const ACCOUNT_STATUS_LABELS = {
  0: "Unknown", // Handle zero/undefined status
  [ACCOUNT_STATUS.ACTIVE]: "Active",
  [ACCOUNT_STATUS.INACTIVE]: "Archived",
};

// Gender options
export const GENDER_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Other" },
  { value: 2, label: "Male" },
  { value: 3, label: "Female" },
  { value: 4, label: "Prefer not to say" },
];

// Identify As options
export const IDENTIFY_AS_OPTIONS = [
  { value: 1, label: "Other" },
  { value: 2, label: "Prefer not to say" },
  { value: 3, label: "Women" },
  { value: 4, label: "Newcomer to Canada" },
  { value: 5, label: "Visible minority" },
  { value: 6, label: "Veteran" },
  { value: 7, label: "Francophone" },
  { value: 8, label: "Person with disability" },
  { value: 9, label: "Inuit" },
  { value: 10, label: "First Nations" },
  { value: 11, label: "Métis" },
];

// Country options (prioritized)
export const COUNTRY_OPTIONS = [
  { value: "CA", label: "Canada" },
  { value: "US", label: "United States" },
  { value: "MX", label: "Mexico" },
];

// Province/State options based on country
export const REGION_OPTIONS = {
  CA: [
    { value: "AB", label: "Alberta" },
    { value: "BC", label: "British Columbia" },
    { value: "MB", label: "Manitoba" },
    { value: "NB", label: "New Brunswick" },
    { value: "NL", label: "Newfoundland and Labrador" },
    { value: "NS", label: "Nova Scotia" },
    { value: "NT", label: "Northwest Territories" },
    { value: "NU", label: "Nunavut" },
    { value: "ON", label: "Ontario" },
    { value: "PE", label: "Prince Edward Island" },
    { value: "QC", label: "Quebec" },
    { value: "SK", label: "Saskatchewan" },
    { value: "YT", label: "Yukon" },
  ],
  US: [
    { value: "AL", label: "Alabama" },
    { value: "AK", label: "Alaska" },
    { value: "AZ", label: "Arizona" },
    { value: "AR", label: "Arkansas" },
    { value: "CA", label: "California" },
    { value: "CO", label: "Colorado" },
    { value: "CT", label: "Connecticut" },
    { value: "DE", label: "Delaware" },
    { value: "FL", label: "Florida" },
    { value: "GA", label: "Georgia" },
  ],
  MX: [
    { value: "AGU", label: "Aguascalientes" },
    { value: "BCN", label: "Baja California" },
    { value: "BCS", label: "Baja California Sur" },
    { value: "CAM", label: "Campeche" },
    { value: "CHP", label: "Chiapas" },
    { value: "CHH", label: "Chihuahua" },
  ],
};

// Language options
export const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "French", label: "French" },
];

// Account field configurations for different user roles
export const ACCOUNT_FIELD_CONFIGS = {
  // Executive role - minimal fields
  EXECUTIVE: {
    personalFields: ["firstName", "lastName"],
    contactFields: ["email", "phone", "isOkToText", "otherPhone", "otherPhoneType"],
    addressFields: ["country", "region", "city"],
    showProfessionalInfo: false,
    showEmergencyContact: false,
    showMetrics: false,
    showAdvancedContact: false,
  },

  // Management/Frontline roles - full fields
  STAFF: {
    personalFields: ["firstName", "lastName", "birthDate", "gender", "genderOther", "description", "tags", "skillSets"],
    contactFields: ["email", "phone", "phoneType", "phoneExtension", "isOkToEmail", "isOkToText", "otherPhone", "otherPhoneType", "otherPhoneExtension", "faxNumber", "agreePromotionsEmail"],
    addressFields: ["country", "region", "city", "addressLine1", "addressLine2", "postalCode", "hasShippingAddress"],
    shippingFields: ["shippingName", "shippingPhone", "shippingCountry", "shippingRegion", "shippingCity", "shippingAddressLine1", "shippingAddressLine2", "shippingPostalCode"],
    professionalFields: ["limitSpecial", "policeCheck", "driversLicenseClass", "vehicleTypes", "preferredLanguage", "insuranceRequirements", "hourlySalaryDesired", "duesDate", "commercialInsuranceExpiryDate", "autoInsuranceExpiryDate", "wsibInsuranceDate", "wsibNumber", "taxId"],
    emergencyContactFields: ["emergencyContactName", "emergencyContactRelationship", "emergencyContactTelephone", "emergencyContactAlternativeTelephone"],
    metricsFields: ["tags", "howDidYouHearAboutUsId", "isHowDidYouHearAboutUsOther", "howDidYouHearAboutUsOther", "identifyAs", "joinDate", "howDidYouHearAboutUsText"],
    showProfessionalInfo: true,
    showEmergencyContact: true,
    showMetrics: true,
    showAdvancedContact: true,
  },

  // Customer role - customer-specific fields
  CUSTOMER: {
    personalFields: ["firstName", "lastName", "birthDate", "gender", "genderOther", "description"],
    contactFields: ["email", "phone", "phoneType", "phoneExtension", "isOkToEmail", "isOkToText", "otherPhone", "otherPhoneType", "otherPhoneExtension", "faxNumber"],
    addressFields: ["country", "region", "city", "addressLine1", "addressLine2", "postalCode", "hasShippingAddress"],
    shippingFields: ["shippingName", "shippingPhone", "shippingCountry", "shippingRegion", "shippingCity", "shippingAddressLine1", "shippingAddressLine2", "shippingPostalCode"],
    organizationFields: ["organizationName", "organizationType", "organizationTypeOther"],
    showProfessionalInfo: false,
    showOrganizationInfo: true,
    showEmergencyContact: false,
    showMetrics: true,
    showAdvancedContact: true,
  },

  // Facilitator role - facilitator-specific fields
  FACILITATOR: {
    personalFields: ["firstName", "lastName", "birthDate", "gender", "genderOther", "description", "tags", "skillSets"],
    contactFields: ["email", "phone", "phoneType", "phoneExtension", "isOkToEmail", "isOkToText", "otherPhone", "otherPhoneType", "otherPhoneExtension", "faxNumber"],
    addressFields: ["country", "region", "city", "addressLine1", "addressLine2", "postalCode", "hasShippingAddress"],
    shippingFields: ["shippingName", "shippingPhone", "shippingCountry", "shippingRegion", "shippingCity", "shippingAddressLine1", "shippingAddressLine2", "shippingPostalCode"],
    professionalFields: ["limitSpecial", "policeCheck", "driversLicenseClass", "vehicleTypes", "preferredLanguage", "wsibNumber", "taxId"],
    emergencyContactFields: ["emergencyContactName", "emergencyContactRelationship", "emergencyContactTelephone", "emergencyContactAlternativeTelephone"],
    metricsFields: ["tags", "howDidYouHearAboutUsId", "isHowDidYouHearAboutUsOther", "howDidYouHearAboutUsOther", "identifyAs"],
    showProfessionalInfo: true,
    showEmergencyContact: true,
    showMetrics: true,
    showAdvancedContact: true,
  },

  // JobSeeker role - job seeker-specific fields
  JOBSEEKER: {
    personalFields: ["firstName", "lastName", "birthDate", "gender", "genderOther", "description", "tags", "skillSets"],
    contactFields: ["email", "phone", "phoneType", "phoneExtension", "isOkToEmail", "isOkToText", "otherPhone", "otherPhoneType", "otherPhoneExtension"],
    addressFields: ["country", "region", "city", "addressLine1", "addressLine2", "postalCode"],
    professionalFields: ["limitSpecial", "policeCheck", "driversLicenseClass", "vehicleTypes", "preferredLanguage", "hourlySalaryDesired"],
    emergencyContactFields: ["emergencyContactName", "emergencyContactRelationship", "emergencyContactTelephone", "emergencyContactAlternativeTelephone"],
    metricsFields: ["tags", "howDidYouHearAboutUsId", "isHowDidYouHearAboutUsOther", "howDidYouHearAboutUsOther", "identifyAs"],
    showProfessionalInfo: true,
    showEmergencyContact: true,
    showMetrics: true,
    showAdvancedContact: false,
  },
};

// Helper function to get field configuration based on user role
export const getAccountFieldConfig = (userRole, userType) => {
  // Determine configuration key based on role and type
  if (userRole === 1) { // Executive
    return ACCOUNT_FIELD_CONFIGS.EXECUTIVE;
  } else if ([2, 3].includes(userRole)) { // Management, Frontline
    return ACCOUNT_FIELD_CONFIGS.STAFF;
  } else {
    // Use userType for other roles
    switch (userType) {
      case 'customer':
        return ACCOUNT_FIELD_CONFIGS.CUSTOMER;
      case 'facilitator':
        return ACCOUNT_FIELD_CONFIGS.FACILITATOR;
      case 'jobseeker':
        return ACCOUNT_FIELD_CONFIGS.JOBSEEKER;
      default:
        return ACCOUNT_FIELD_CONFIGS.STAFF; // Default fallback
    }
  }
};

// Account navigation paths by user type
export const ACCOUNT_PATHS = {
  admin: {
    base: "/admin/account",
    detail: "/admin/account",
    update: "/admin/account/edit",
    more: "/admin/account/more",
    changePassword: "/admin/account/more/change-password",
    dashboard: "/admin/dashboard",
  },
  customer: {
    base: "/customer/account",
    detail: "/customer/account",
    update: "/customer/account/edit",
    more: "/customer/account/more",
    changePassword: "/customer/account/more/change-password",
    dashboard: "/customer/dashboard",
  },
  facilitator: {
    base: "/facilitator/account",
    detail: "/facilitator/account",
    update: "/facilitator/account/edit",
    more: "/facilitator/account/more",
    changePassword: "/facilitator/account/more/change-password",
    dashboard: "/facilitator/dashboard",
  },
  jobseeker: {
    base: "/jobseeker/account",
    detail: "/jobseeker/account",
    update: "/jobseeker/account/edit",
    more: "/jobseeker/account/more",
    changePassword: "/jobseeker/account/more/change-password",
    dashboard: "/jobseeker/dashboard",
  },
  root: {
    base: "/root/account",
    detail: "/root/account",
    update: "/root/account/edit",
    more: "/root/account/more",
    changePassword: "/root/account/more/change-password",
    dashboard: "/root/dashboard",
  },
};