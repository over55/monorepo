// File Path: web/workery-frontend/src/pages/Admin/Associate/Update/Page.jsx
// UIX Upgraded - Uses EntityUpdatePage whole page component
// @uix-page: AdminAssociateUpdatePage

import React, { useMemo } from "react";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useAssociateManager } from "../../../../services/Services";
import { EntityUpdatePage, UIXThemeProvider } from "../../../../components/UIX";
import { convertLocalDateToISO } from "../../../../constants/Date";
import {
  AssociateSettingsSection,
  AssociateContactInfoSection,
  AssociateAddressSection,
  AssociateProfessionalInfoSection,
  AssociateEmergencyContactSection,
  AssociateMetricsSection,
  AssociateSystemInfoSection,
} from "../../../../components/UIX/EntityUpdatePage/examples/AssociateFormSections";

// Static configuration constants
const ENTITY_NAME = "Associate";
const ENTITY_TYPE = "associate";
const ID_PARAM = "aid";

// Constants
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;

// Static initial form data template
const INITIAL_FORM_DATA = Object.freeze({
  // Basic info
  type: RESIDENTIAL_ASSOCIATE_TYPE_OF_ID,
  organizationName: "",
  organizationType: 0,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  phoneType: 0,
  phoneExtension: "",
  otherPhone: "",
  otherPhoneType: 0,
  otherPhoneExtension: "",
  isOkToText: false,
  isOkToEmail: false,

  // Address
  country: "Canada",
  region: "",
  city: "",
  addressLine1: "",
  addressLine2: "",
  postalCode: "",
  hasShippingAddress: false,
  shippingName: "",
  shippingPhone: "",
  shippingCountry: "Canada",
  shippingRegion: "",
  shippingCity: "",
  shippingAddressLine1: "",
  shippingAddressLine2: "",
  shippingPostalCode: "",

  // Professional info
  skillSets: [],
  insuranceRequirements: [],
  vehicleTypes: [],
  serviceFeeId: "",
  hourlySalaryDesired: 0,
  limitSpecial: "",
  duesDate: "",
  commercialInsuranceExpiryDate: "",
  autoInsuranceExpiryDate: "",
  wsibNumber: "",
  wsibInsuranceDate: "",
  policeCheck: "",
  taxId: "",
  driversLicenseClass: "",

  // Emergency contact
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactTelephone: "",
  emergencyContactAlternativeTelephone: "",

  // Metrics
  tags: [],
  howDidYouHearAboutUsID: "",
  isHowDidYouHearAboutUsOther: false,
  howDidYouHearAboutUsOther: "",
  gender: 0,
  genderOther: "",
  birthDate: "",
  joinDate: "",
  additionalComment: "",
  identifyAs: [],

  // Job seeker info
  isJobSeeker: 2,
  statusInCountry: 0,
  statusInCountryOther: "",
  countryOfOrigin: "",
  dateOfEntryIntoCountry: "",
  maritalStatus: 0,
  maritalStatusOther: "",
  accomplishedEducation: 0,
  accomplishedEducationOther: "",

  // System
  description: "",
  preferredLanguage: "English",
});

// Static form sections array
const FORM_SECTIONS = Object.freeze([
  AssociateSettingsSection,
  AssociateContactInfoSection,
  AssociateAddressSection,
  AssociateProfessionalInfoSection,
  AssociateEmergencyContactSection,
  AssociateMetricsSection,
  AssociateSystemInfoSection,
]);

// Static breadcrumb items
const BREADCRUMB_ITEMS = Object.freeze([
  {
    label: "Dashboard",
    to: "/admin/dashboard",
    icon: ChartBarIcon,
    hideOnMobile: false,
    mobileLabel: "Dash",
  },
  {
    label: "Associates",
    to: "/admin/associates",
    icon: UserGroupIcon,
  },
  {
    label: "Detail",
    to: "/admin/associate/{aid}",
    icon: InformationCircleIcon,
  },
  {
    label: "Update",
    icon: PencilSquareIcon,
    isActive: true,
  },
]);

// Static tab items
const TAB_ITEMS = Object.freeze([
  {
    label: "Summary",
    to: `/admin/associate/{aid}`,
  },
  {
    label: "Detail",
    to: `/admin/associate/{aid}/detail`,
  },
  {
    label: "Orders",
    to: `/admin/associate/{aid}/orders`,
  },
  {
    label: "Comments",
    to: `/admin/associate/{aid}/comments`,
  },
  {
    label: "Attachments",
    to: `/admin/associate/{aid}/attachments`,
  },
  {
    label: "More",
    to: `/admin/associate/{aid}/more`,
    icon: EllipsisHorizontalIcon,
  },
]);

// Helper function for date formatting
const formatDateForInput = (dateValue) => {
  if (!dateValue) return "";
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

// Helper function to format date for API submission
const formatDateForAPI = (dateValue) => {
  if (!dateValue) return "";
  return convertLocalDateToISO(dateValue);
};

// Validation function
const validateForm = (formData) => {
  const newErrors = {};

  // Required fields validation
  if (!formData.firstName?.trim()) {
    newErrors.firstName = "First name is required";
  }
  if (!formData.lastName?.trim()) {
    newErrors.lastName = "Last name is required";
  }
  if (!formData.email?.trim()) {
    newErrors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = "Please enter a valid email address";
  }
  if (!formData.phone?.trim()) {
    newErrors.phone = "Phone number is required";
  }
  if (!formData.type) {
    newErrors.type = "Associate type is required";
  }

  // Commercial associate validation
  if (formData.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID) {
    if (!formData.organizationName?.trim()) {
      newErrors.organizationName =
        "Organization name is required for business associates";
    }
    if (!formData.organizationType) {
      newErrors.organizationType =
        "Organization type is required for business associates";
    }
  }

  // Address validation
  if (!formData.country) {
    newErrors.country = "Country is required";
  }
  if (!formData.region?.trim()) {
    newErrors.region = "Province/Territory is required";
  }
  if (!formData.city?.trim()) {
    newErrors.city = "City is required";
  }
  if (!formData.addressLine1?.trim()) {
    newErrors.addressLine1 = "Address line 1 is required";
  }
  if (!formData.postalCode?.trim()) {
    newErrors.postalCode = "Postal code is required";
  }

  // Shipping address validation
  if (formData.hasShippingAddress) {
    if (!formData.shippingName?.trim()) {
      newErrors.shippingName = "Shipping name is required";
    }
    if (!formData.shippingPhone?.trim()) {
      newErrors.shippingPhone = "Shipping phone is required";
    }
    if (!formData.shippingCountry) {
      newErrors.shippingCountry = "Shipping country is required";
    }
    if (!formData.shippingRegion?.trim()) {
      newErrors.shippingRegion = "Shipping province/territory is required";
    }
    if (!formData.shippingCity?.trim()) {
      newErrors.shippingCity = "Shipping city is required";
    }
    if (!formData.shippingAddressLine1?.trim()) {
      newErrors.shippingAddressLine1 = "Shipping address line 1 is required";
    }
    if (!formData.shippingPostalCode?.trim()) {
      newErrors.shippingPostalCode = "Shipping postal code is required";
    }
  }

  // Professional fields validation
  if (!formData.skillSets || formData.skillSets.length === 0) {
    newErrors.skillSets = "At least one skill set is required";
  }
  if (!formData.insuranceRequirements || formData.insuranceRequirements.length === 0) {
    newErrors.insuranceRequirements = "At least one insurance requirement is required";
  }
  if (!formData.serviceFeeId) {
    newErrors.serviceFeeId = "Service fee is required";
  }
  if (!formData.duesDate) {
    newErrors.duesDate = "Member dues date is required";
  }
  if (!formData.policeCheck) {
    newErrors.policeCheck = "Police check date is required";
  }
  if (!formData.commercialInsuranceExpiryDate) {
    newErrors.commercialInsuranceExpiryDate = "Commercial insurance expiry date is required";
  }

  // Emergency contact validation
  if (!formData.emergencyContactName?.trim()) {
    newErrors.emergencyContactName = "Emergency contact name is required";
  }
  if (!formData.emergencyContactRelationship?.trim()) {
    newErrors.emergencyContactRelationship = "Emergency contact relationship is required";
  }
  if (!formData.emergencyContactTelephone?.trim()) {
    newErrors.emergencyContactTelephone = "Emergency contact telephone is required";
  }

  // Metrics validation
  if (!formData.howDidYouHearAboutUsID) {
    newErrors.howDidYouHearAboutUsID = "How did you hear about us is required";
  }
  if (formData.isHowDidYouHearAboutUsOther && !formData.howDidYouHearAboutUsOther?.trim()) {
    newErrors.howDidYouHearAboutUsOther = "Please specify other option";
  }
  if (!formData.gender) {
    newErrors.gender = "Gender is required";
  }
  if (formData.gender === 1 && !formData.genderOther?.trim()) {
    newErrors.genderOther = "Please specify other gender";
  }
  if (!formData.birthDate) {
    newErrors.birthDate = "Birth date is required";
  }
  if (!formData.preferredLanguage) {
    newErrors.preferredLanguage = "Preferred language is required";
  }

  return newErrors;
};

// Format response data function
const formatDataFromResponse = (response) => {
  // Helper function to safely map array fields
  const mapArrayField = (field, mapFn = (item) => item.id || item) => {
    return field && Array.isArray(field) ? field.map(mapFn) : [];
  };

  return {
    type: response.type || RESIDENTIAL_ASSOCIATE_TYPE_OF_ID,
    organizationName: response.organizationName || "",
    organizationType: response.organizationType || 0,
    firstName: response.firstName || "",
    lastName: response.lastName || "",
    email: response.email || "",
    phone: response.phone || "",
    phoneType: response.phoneType || 0,
    phoneExtension: response.phoneExtension || "",
    otherPhone: response.otherPhone || "",
    otherPhoneType: response.otherPhoneType || 0,
    otherPhoneExtension: response.otherPhoneExtension || "",
    isOkToText: response.isOkToText || false,
    isOkToEmail: response.isOkToEmail || false,
    country: response.country || "Canada",
    region: response.region || "",
    city: response.city || "",
    addressLine1: response.addressLine1 || "",
    addressLine2: response.addressLine2 || "",
    postalCode: response.postalCode || "",
    hasShippingAddress: response.hasShippingAddress || false,
    shippingName: response.shippingName || "",
    shippingPhone: response.shippingPhone || "",
    shippingCountry: response.shippingCountry || "Canada",
    shippingRegion: response.shippingRegion || "",
    shippingCity: response.shippingCity || "",
    shippingAddressLine1: response.shippingAddressLine1 || "",
    shippingAddressLine2: response.shippingAddressLine2 || "",
    shippingPostalCode: response.shippingPostalCode || "",
    skillSets: mapArrayField(response.skillSets),
    insuranceRequirements: mapArrayField(response.insuranceRequirements),
    vehicleTypes: mapArrayField(response.vehicleTypes),
    tags: mapArrayField(response.tags),
    serviceFeeId: response.serviceFeeId || "",
    hourlySalaryDesired: response.hourlySalaryDesired || 0,
    limitSpecial: response.limitSpecial || "",
    duesDate: formatDateForInput(response.duesDate),
    commercialInsuranceExpiryDate: formatDateForInput(response.commercialInsuranceExpiryDate),
    autoInsuranceExpiryDate: formatDateForInput(response.autoInsuranceExpiryDate),
    wsibNumber: response.wsibNumber || "",
    wsibInsuranceDate: formatDateForInput(response.wsibInsuranceDate),
    policeCheck: formatDateForInput(response.policeCheck),
    taxId: response.taxId || "",
    driversLicenseClass: response.driversLicenseClass || "",
    emergencyContactName: response.emergencyContactName || "",
    emergencyContactRelationship: response.emergencyContactRelationship || "",
    emergencyContactTelephone: response.emergencyContactTelephone || "",
    emergencyContactAlternativeTelephone: response.emergencyContactAlternativeTelephone || "",
    howDidYouHearAboutUsID: response.howDidYouHearAboutUsID || "",
    isHowDidYouHearAboutUsOther: response.isHowDidYouHearAboutUsOther || false,
    howDidYouHearAboutUsOther: response.howDidYouHearAboutUsOther || "",
    gender: response.gender || 0,
    genderOther: response.genderOther || "",
    birthDate: formatDateForInput(response.birthDate),
    joinDate: formatDateForInput(response.joinDate),
    additionalComment: response.additionalComment || "",
    identifyAs: response.identifyAs || [],
    isJobSeeker: response.isJobSeeker || 2,
    statusInCountry: response.statusInCountry || 0,
    statusInCountryOther: response.statusInCountryOther || "",
    countryOfOrigin: response.countryOfOrigin || "",
    dateOfEntryIntoCountry: formatDateForInput(response.dateOfEntryIntoCountry),
    maritalStatus: response.maritalStatus || 0,
    maritalStatusOther: response.maritalStatusOther || "",
    accomplishedEducation: response.accomplishedEducation || 0,
    accomplishedEducationOther: response.accomplishedEducationOther || "",
    description: response.description || "",
    preferredLanguage: response.preferredLanguage || "English",
  };
};

// Format submit data function
const formatDataForSubmit = (formData, entityId) => {
  // Helper to safely parse integer values
  const safeParseInt = (value, defaultValue = 0) => {
    if (value === null || value === undefined || value === "") return defaultValue;
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  const submitData = {
    id: entityId,
    type: safeParseInt(formData.type),
    organizationName: formData.organizationName,
    organizationType: safeParseInt(formData.organizationType),
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    phoneType: safeParseInt(formData.phoneType),
    phoneExtension: formData.phoneExtension,
    otherPhone: formData.otherPhone,
    otherPhoneType: safeParseInt(formData.otherPhoneType),
    otherPhoneExtension: formData.otherPhoneExtension,
    isOkToText: formData.isOkToText,
    isOkToEmail: formData.isOkToEmail,
    country: formData.country,
    region: formData.region,
    city: formData.city,
    addressLine1: formData.addressLine1,
    addressLine2: formData.addressLine2,
    postalCode: formData.postalCode,
    hasShippingAddress: formData.hasShippingAddress,
    shippingName: formData.shippingName,
    shippingPhone: formData.shippingPhone,
    shippingCountry: formData.shippingCountry,
    shippingRegion: formData.shippingRegion,
    shippingCity: formData.shippingCity,
    shippingAddressLine1: formData.shippingAddressLine1,
    shippingAddressLine2: formData.shippingAddressLine2,
    shippingPostalCode: formData.shippingPostalCode,
    skillSets: formData.skillSets || [],
    insuranceRequirements: formData.insuranceRequirements || [],
    vehicleTypes: formData.vehicleTypes || [],
    tags: formData.tags || [],
    serviceFeeId: formData.serviceFeeId,
    hourlySalaryDesired: safeParseInt(formData.hourlySalaryDesired),
    limitSpecial: formData.limitSpecial,
    duesDate: formatDateForAPI(formData.duesDate),
    commercialInsuranceExpiryDate: formatDateForAPI(formData.commercialInsuranceExpiryDate),
    autoInsuranceExpiryDate: formatDateForAPI(formData.autoInsuranceExpiryDate),
    wsibNumber: formData.wsibNumber,
    wsibInsuranceDate: formatDateForAPI(formData.wsibInsuranceDate),
    policeCheck: formatDateForAPI(formData.policeCheck),
    taxId: formData.taxId,
    driversLicenseClass: formData.driversLicenseClass,
    emergencyContactName: formData.emergencyContactName,
    emergencyContactRelationship: formData.emergencyContactRelationship,
    emergencyContactTelephone: formData.emergencyContactTelephone,
    emergencyContactAlternativeTelephone: formData.emergencyContactAlternativeTelephone,
    howDidYouHearAboutUsID: formData.howDidYouHearAboutUsID,
    isHowDidYouHearAboutUsOther: formData.isHowDidYouHearAboutUsOther,
    howDidYouHearAboutUsOther: formData.howDidYouHearAboutUsOther,
    gender: safeParseInt(formData.gender),
    genderOther: formData.genderOther,
    birthDate: formatDateForAPI(formData.birthDate),
    joinDate: formatDateForAPI(formData.joinDate),
    additionalComment: formData.additionalComment,
    identifyAs: formData.identifyAs || [],
    isJobSeeker: safeParseInt(formData.isJobSeeker, 2),
    description: formData.description,
    preferredLanguage: formData.preferredLanguage,
  };

  // Handle optional numeric fields
  if (formData.statusInCountry) {
    submitData.statusInCountry = safeParseInt(formData.statusInCountry);
  }
  if (formData.maritalStatus) {
    submitData.maritalStatus = safeParseInt(formData.maritalStatus);
  }
  if (formData.accomplishedEducation) {
    submitData.accomplishedEducation = safeParseInt(formData.accomplishedEducation);
  }
  if (formData.dateOfEntryIntoCountry) {
    submitData.dateOfEntryIntoCountry = formatDateForAPI(formData.dateOfEntryIntoCountry);
  }
  if (formData.statusInCountryOther) {
    submitData.statusInCountryOther = formData.statusInCountryOther;
  }
  if (formData.countryOfOrigin) {
    submitData.countryOfOrigin = formData.countryOfOrigin;
  }
  if (formData.maritalStatusOther) {
    submitData.maritalStatusOther = formData.maritalStatusOther;
  }
  if (formData.accomplishedEducationOther) {
    submitData.accomplishedEducationOther = formData.accomplishedEducationOther;
  }

  return submitData;
};

function AdminAssociateUpdatePage() {
  const associateManager = useAssociateManager();

  // Memoize the manager object with its methods
  const manager = useMemo(
    () => ({
      getDetail: (id, onUnauthorized, options) =>
        associateManager.getAssociateDetail(id, onUnauthorized, options),
      update: (id, data, onUnauthorized) =>
        associateManager.updateAssociate(id, data, onUnauthorized),
    }),
    [associateManager],
  );

  // Memoize the entire configuration object
  const config = useMemo(
    () => ({
      // Basic entity information
      entityName: ENTITY_NAME,
      entityType: ENTITY_TYPE,
      idParam: ID_PARAM,

      // Icons
      icon: UserGroupIcon,
      dashboardIcon: ChartBarIcon,
      detailIcon: InformationCircleIcon,
      updateIcon: PencilSquareIcon,

      // Manager with CRUD operations
      manager,

      // Initial form data structure - create new object from frozen template
      initialFormData: { ...INITIAL_FORM_DATA },

      // Form sections to render
      formSections: FORM_SECTIONS,

      // Validation, formatting functions
      validateForm,
      formatDataFromResponse,
      formatDataForSubmit,

      // Custom breadcrumb items
      breadcrumbItems: BREADCRUMB_ITEMS,

      // Custom tab items
      tabItems: TAB_ITEMS,
    }),
    [manager],
  );

  return (
    <UIXThemeProvider>
      <EntityUpdatePage config={config} />
    </UIXThemeProvider>
  );
}

export default AdminAssociateUpdatePage;
