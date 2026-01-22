// File Path: web/workery-frontend/src/pages/Admin/Customer/Update/Page.jsx
// UIX Upgraded - Uses EntityUpdatePage whole page component
// @uix-page: AdminCustomerUpdatePage

import React, { useMemo } from "react";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { useCustomerManager } from "../../../../services/Services";
import { EntityUpdatePage, UIXThemeProvider } from "../../../../components/UIX";
import {
  CustomerSettingsSection,
  CustomerContactInfoSection,
  CustomerAddressSection,
  CustomerMetricsSection,
  CustomerSystemInfoSection,
} from "../../../../components/UIX/EntityUpdatePage/examples/CustomerFormSections";
import {
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
} from "../../../../constants/Customer";

// Static configuration constants
const ENTITY_NAME = "Customer";
const ENTITY_TYPE = "customer";
const ID_PARAM = "cid";

// Static initial form data template
const INITIAL_FORM_DATA = Object.freeze({
  type: RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
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
  tags: [],
  howDidYouHearAboutUsID: "",
  isHowDidYouHearAboutUsOther: false,
  howDidYouHearAboutUsOther: "",
  gender: 0,
  genderOther: "",
  birthDate: "",
  joinDate: "",
  preferredLanguage: "English",
});

// Static form sections array
const FORM_SECTIONS = Object.freeze([
  CustomerSettingsSection,
  CustomerContactInfoSection,
  CustomerAddressSection,
  CustomerMetricsSection,
  CustomerSystemInfoSection,
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
    label: "Customers",
    to: "/admin/customers",
    icon: UserGroupIcon,
  },
  {
    label: "Detail",
    to: "/admin/customer/{cid}",
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
    to: `/admin/customer/{cid}`,
  },
  {
    label: "Detail",
    to: `/admin/customer/{cid}/detail`,
  },
  {
    label: "Orders",
    to: `/admin/customer/{cid}/orders`,
  },
  {
    label: "Comments",
    to: `/admin/customer/{cid}/comments`,
  },
  {
    label: "Attachments",
    to: `/admin/customer/{cid}/attachments`,
  },
  {
    label: "Update",
    isActive: true,
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

// Validation function
const validateForm = (formData) => {
  const newErrors = {};

  // Required text fields validation
  if (!formData.firstName?.trim()) {
    newErrors.firstName = "First name is required";
  }
  if (!formData.lastName?.trim()) {
    newErrors.lastName = "Last name is required";
  }
  if (!formData.phone?.trim()) {
    newErrors.phone = "Phone number is required";
  }
  if (!formData.type) {
    newErrors.type = "Customer type is required";
  }

  // Commercial customer validation
  if (formData.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID) {
    if (!formData.organizationName?.trim()) {
      newErrors.organizationName =
        "Organization name is required for commercial customers";
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

  // Metrics validation
  if (!formData.howDidYouHearAboutUsID) {
    newErrors.howDidYouHearAboutUsID = "How did you hear about us is required";
  }
  if (
    formData.isHowDidYouHearAboutUsOther &&
    !formData.howDidYouHearAboutUsOther?.trim()
  ) {
    newErrors.howDidYouHearAboutUsOther = "Please specify other option";
  }
  if (formData.gender === 1 && !formData.genderOther?.trim()) {
    newErrors.genderOther = "Please specify other gender";
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
    type: response.type || RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
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
    tags: mapArrayField(response.tags, (tag) => {
      if (typeof tag === "object" && tag !== null) {
        return tag.id || tag.value || tag;
      }
      return tag;
    }),
    howDidYouHearAboutUsID:
      response.howDidYouHearAboutUsID ||
      response.howDidYouHearAboutUsId ||
      "",
    isHowDidYouHearAboutUsOther:
      response.howDidYouHearAboutUsText === "Other" ||
      response.isHowDidYouHearAboutUsOther ||
      false,
    howDidYouHearAboutUsOther: response.howDidYouHearAboutUsOther || "",
    gender: response.gender || 0,
    genderOther: response.genderOther || "",
    birthDate: formatDateForInput(response.birthDate),
    joinDate: formatDateForInput(response.joinDate),
    preferredLanguage: response.preferredLanguage || "English",
  };
};

// Format submit data function
const formatDataForSubmit = (formData, entityId) => {
  // Helper to safely parse integer values
  const safeParseInt = (value, defaultValue = null) => {
    if (value === null || value === undefined || value === "") return defaultValue;
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  return {
    id: entityId,
    type: formData.type,
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
    tags: (formData.tags || []).filter(
      (tag) =>
        tag !== null &&
        tag !== undefined &&
        tag !== "" &&
        tag !== "0" &&
        tag !== 0,
    ),
    gender: safeParseInt(formData.gender),
    genderOther: formData.genderOther,
    joinDate: formData.joinDate || null,
    birthDate: formData.birthDate || null,
    howDidYouHearAboutUsID: formData.howDidYouHearAboutUsID,
    isHowDidYouHearAboutUsOther: formData.isHowDidYouHearAboutUsOther,
    howDidYouHearAboutUsOther: formData.howDidYouHearAboutUsOther,
    preferredLanguage: formData.preferredLanguage,
  };
};

function AdminCustomerUpdatePage() {
  const customerManager = useCustomerManager();

  // Memoize the manager object with its methods
  const manager = useMemo(
    () => ({
      getDetail: (id, onUnauthorized, options) =>
        customerManager.getCustomerDetail(id, onUnauthorized, options),
      update: (id, data, onUnauthorized) =>
        customerManager.updateCustomer(id, data, onUnauthorized),
    }),
    [customerManager],
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

export default AdminCustomerUpdatePage;
