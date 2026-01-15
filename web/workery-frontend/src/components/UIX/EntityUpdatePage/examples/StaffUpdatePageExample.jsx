// File: src/components/UIX/EntityUpdatePage/examples/StaffUpdatePageExample.jsx

import React, { useMemo } from "react";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../services/Services";
import { EntityUpdatePage } from "../../index";
import {
  StaffBasicInfoSection,
  StaffAddressSection,
  StaffAdditionalInfoSection,
  StaffEmergencyContactSection,
  StaffMetricsSection,
  StaffSystemInfoSection,
} from "./StaffFormSections";
import {
  STAFF_TYPE_FRONTLINE,
  STAFF_GENDER_OTHER,
} from "../../../../constants/Staff";

// Static configuration constants moved outside component
const ENTITY_NAME = "Staff Member";
const ENTITY_TYPE = "staff";
const ID_PARAM = "aid";

// Static initial form data template
const INITIAL_FORM_DATA = Object.freeze({
  type: STAFF_TYPE_FRONTLINE,
  email: "",
  phone: "",
  phoneType: 0,
  phoneExtension: "",
  firstName: "",
  lastName: "",
  otherPhone: "",
  otherPhoneType: 0,
  otherPhoneExtension: "",
  isOkToText: false,
  isOkToEmail: false,
  postalCode: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  country: "Canada",
  hasShippingAddress: false,
  shippingName: "",
  shippingPhone: "",
  shippingCountry: "Canada",
  shippingRegion: "",
  shippingCity: "",
  shippingAddressLine1: "",
  shippingAddressLine2: "",
  shippingPostalCode: "",
  limitSpecial: "",
  policeCheck: "",
  driversLicenseClass: "",
  vehicleTypes: [],
  skillSets: [],
  insuranceRequirements: [],
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactTelephone: "",
  emergencyContactAlternativeTelephone: "",
  description: "",
  preferredLanguage: "English",
  tags: [],
  howDidYouHearAboutUsID: "",
  isHowDidYouHearAboutUsOther: false,
  howDidYouHearAboutUsOther: "",
  birthDate: "",
  joinDate: "",
  gender: 0,
  genderOther: "",
  identifyAs: [],
});

// Static form sections array
const FORM_SECTIONS = Object.freeze([
  StaffBasicInfoSection,
  StaffAddressSection,
  StaffAdditionalInfoSection,
  StaffEmergencyContactSection,
  StaffMetricsSection,
  StaffSystemInfoSection,
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
    label: "Staff",
    to: "/admin/staff",
    icon: UserGroupIcon,
  },
  {
    label: "Detail",
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
    to: `/admin/staff/{aid}`,
  },
  {
    label: "Full Details",
    to: `/admin/staff/{aid}/detail`,
  },
  {
    label: "Update",
    isActive: true,
  },
  {
    label: "Comments",
    to: `/admin/staff/{aid}/comments`,
  },
  {
    label: "Attachments",
    to: `/admin/staff/{aid}/attachments`,
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

// Validation function moved outside component
const validateForm = (formData) => {
  const newErrors = {};

  // Required text fields validation
  const requiredFields = [
    { field: "firstName", message: "First name is required" },
    { field: "lastName", message: "Last name is required" },
    { field: "email", message: "Email is required" },
    { field: "phone", message: "Phone number is required" },
    {
      field: "emergencyContactName",
      message: "Emergency contact name is required",
    },
    {
      field: "emergencyContactRelationship",
      message: "Emergency contact relationship is required",
    },
    {
      field: "emergencyContactTelephone",
      message: "Emergency contact telephone is required",
    },
  ];

  requiredFields.forEach(({ field, message }) => {
    if (!formData[field]?.trim()) {
      newErrors[field] = message;
    }
  });

  // Conditional validations
  if (formData.hasShippingAddress) {
    if (!formData.shippingName?.trim()) {
      newErrors.shippingName = "Shipping name is required";
    }
    if (!formData.shippingPhone?.trim()) {
      newErrors.shippingPhone = "Shipping phone is required";
    }
  }

  if (formData.gender === STAFF_GENDER_OTHER && !formData.genderOther?.trim()) {
    newErrors.genderOther = "Please specify other gender";
  }

  if (
    formData.isHowDidYouHearAboutUsOther &&
    !formData.howDidYouHearAboutUsOther?.trim()
  ) {
    newErrors.howDidYouHearAboutUsOther = "Please specify other option";
  }

  return newErrors;
};

// Format response data function moved outside component
const formatDataFromResponse = (response) => {
  // Helper function to safely map array fields
  const mapArrayField = (field, mapFn = (item) => item.id || item) => {
    return field && Array.isArray(field) ? field.map(mapFn) : [];
  };

  return {
    type: response.type || STAFF_TYPE_FRONTLINE,
    email: response.email || "",
    phone: response.phone || "",
    phoneType: response.phoneType || 0,
    phoneExtension: response.phoneExtension || "",
    firstName: response.firstName || "",
    lastName: response.lastName || "",
    otherPhone: response.otherPhone || "",
    otherPhoneType: response.otherPhoneType || 0,
    otherPhoneExtension: response.otherPhoneExtension || "",
    isOkToText: response.isOkToText || false,
    isOkToEmail: response.isOkToEmail || false,
    postalCode: response.postalCode || "",
    addressLine1: response.addressLine1 || "",
    addressLine2: response.addressLine2 || "",
    city: response.city || "",
    region: response.region || "",
    country: response.country || "Canada",
    hasShippingAddress: response.hasShippingAddress || false,
    shippingName: response.shippingName || "",
    shippingPhone: response.shippingPhone || "",
    shippingCountry: response.shippingCountry || "Canada",
    shippingRegion: response.shippingRegion || "",
    shippingCity: response.shippingCity || "",
    shippingAddressLine1: response.shippingAddressLine1 || "",
    shippingAddressLine2: response.shippingAddressLine2 || "",
    shippingPostalCode: response.shippingPostalCode || "",
    limitSpecial: response.limitSpecial || "",
    policeCheck: formatDateForInput(response.policeCheck),
    driversLicenseClass: response.driversLicenseClass || "",
    vehicleTypes: mapArrayField(response.vehicleTypes),
    skillSets: mapArrayField(response.skillSets),
    insuranceRequirements: mapArrayField(response.insuranceRequirements),
    emergencyContactName: response.emergencyContactName || "",
    emergencyContactRelationship: response.emergencyContactRelationship || "",
    emergencyContactTelephone: response.emergencyContactTelephone || "",
    emergencyContactAlternativeTelephone:
      response.emergencyContactAlternativeTelephone || "",
    description: response.description || "",
    preferredLanguage: response.preferredLanguage || "English",
    tags: mapArrayField(response.tags),
    howDidYouHearAboutUsID: response.howDidYouHearAboutUsID || "",
    isHowDidYouHearAboutUsOther: response.isHowDidYouHearAboutUsOther || false,
    howDidYouHearAboutUsOther: response.howDidYouHearAboutUsOther || "",
    birthDate: formatDateForInput(response.birthDate),
    joinDate: formatDateForInput(response.joinDate),
    gender: response.gender || 0,
    genderOther: response.genderOther || "",
    identifyAs: response.identifyAs || [],
  };
};

// Format submit data function moved outside component
const formatDataForSubmit = (formData, entityId) => {
  // Helper to safely parse integer values
  const safeParseInt = (value, defaultValue = 0) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  return {
    id: entityId,
    type: safeParseInt(formData.type),
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
    postalCode: formData.postalCode,
    addressLine1: formData.addressLine1,
    addressLine2: formData.addressLine2,
    city: formData.city,
    region: formData.region,
    country: formData.country,
    hasShippingAddress: formData.hasShippingAddress,
    shippingName: formData.shippingName,
    shippingPhone: formData.shippingPhone,
    shippingCountry: formData.shippingCountry,
    shippingRegion: formData.shippingRegion,
    shippingCity: formData.shippingCity,
    shippingAddressLine1: formData.shippingAddressLine1,
    shippingAddressLine2: formData.shippingAddressLine2,
    shippingPostalCode: formData.shippingPostalCode,
    limitSpecial: formData.limitSpecial,
    policeCheck: formData.policeCheck || null,
    driversLicenseClass: formData.driversLicenseClass,
    vehicleTypes: formData.vehicleTypes || [],
    skillSets: formData.skillSets || [],
    insuranceRequirements: formData.insuranceRequirements || [],
    emergencyContactName: formData.emergencyContactName,
    emergencyContactRelationship: formData.emergencyContactRelationship,
    emergencyContactTelephone: formData.emergencyContactTelephone,
    emergencyContactAlternativeTelephone:
      formData.emergencyContactAlternativeTelephone,
    description: formData.description,
    tags: formData.tags || [],
    gender: safeParseInt(formData.gender),
    genderOther: formData.genderOther,
    joinDate: formData.joinDate || null,
    birthDate: formData.birthDate || null,
    howDidYouHearAboutUsID: formData.howDidYouHearAboutUsID,
    isHowDidYouHearAboutUsOther: formData.isHowDidYouHearAboutUsOther,
    howDidYouHearAboutUsOther: formData.howDidYouHearAboutUsOther,
    preferredLanguage: formData.preferredLanguage,
    identifyAs: Array.isArray(formData.identifyAs)
      ? formData.identifyAs.map((id) => safeParseInt(id))
      : [],
  };
};

/**
 * Example usage of EntityUpdatePage for Staff
 * This shows how the reusable component can be configured for Staff entities
 */
const StaffUpdatePageExample = React.memo(function StaffUpdatePageExample() {
  const staffManager = useStaffManager();

  // Memoize the manager object with its methods
  const manager = useMemo(
    () => ({
      getDetail: (id, onUnauthorized, options) =>
        staffManager.getStaffDetail(id, onUnauthorized, options),
      update: (id, data, onUnauthorized) =>
        staffManager.updateStaff(id, data, onUnauthorized),
    }),
    [staffManager],
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

  return <EntityUpdatePage config={config} />;
});

export default StaffUpdatePageExample;
