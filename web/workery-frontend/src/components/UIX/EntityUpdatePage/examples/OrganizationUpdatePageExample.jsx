// File: src/components/UIX/EntityUpdatePage/examples/OrganizationUpdatePageExample.jsx

import React, { useMemo } from "react";
import {
  ChartBarIcon,
  BuildingOffice2Icon,
  InformationCircleIcon,
  PencilSquareIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useOrganizationManager } from "../../../../services/Services";
import { EntityUpdatePage } from "../../index";
import {
  OrganizationBasicInfoSection,
  OrganizationContactInfoSection,
  OrganizationAddressSection,
  OrganizationBusinessInfoSection,
} from "./OrganizationFormSections";

// Static configuration constants moved outside component
const ENTITY_NAME = "Organization";
const ENTITY_TYPE = "organization";
const ID_PARAM = "organizationId";

// Static initial form data template
const INITIAL_FORM_DATA = Object.freeze({
  organizationName: "",
  organizationShortName: "",
  organizationType: "",
  name: "",
  description: "",
  taxId: "",
  website: "",
  country: "",
  region: "",
  city: "",
  addressLine1: "",
  addressLine2: "",
  postalCode: "",
  hasShippingAddress: false,
  shippingName: "",
  shippingPhone: "",
  shippingCountry: "",
  shippingRegion: "",
  shippingCity: "",
  shippingAddressLine1: "",
  shippingAddressLine2: "",
  shippingPostalCode: "",
  foundedDate: "",
  annualRevenue: "",
  numberOfEmployees: "",
  fiscalYearEnd: "",
  creditRating: "",
  paymentTerms: "",
  additionalComment: "",
  tags: [],
  contacts: [
    {
      firstName: "",
      lastName: "",
      title: "",
      email: "",
      isOkToEmail: true,
      phone: "",
      phoneType: 0,
      phoneExtension: "",
      otherPhone: "",
      otherPhoneType: 0,
      otherPhoneExtension: "",
    },
  ],
});

// Default contact template
const DEFAULT_CONTACT = Object.freeze({
  firstName: "",
  lastName: "",
  title: "",
  email: "",
  isOkToEmail: true,
  phone: "",
  phoneType: 0,
  phoneExtension: "",
  otherPhone: "",
  otherPhoneType: 0,
  otherPhoneExtension: "",
});

// Static form sections array
const FORM_SECTIONS = Object.freeze([
  OrganizationBasicInfoSection,
  OrganizationContactInfoSection,
  OrganizationAddressSection,
  OrganizationBusinessInfoSection,
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
    label: "Organizations",
    to: "/admin/organizations",
    icon: BuildingOffice2Icon,
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
  },
  {
    label: "Full Details",
  },
  {
    label: "Events",
  },
  {
    label: "Update",
    isActive: true,
  },
  {
    label: "Comments",
  },
  {
    label: "Attachments",
  },
  {
    label: "More",
    icon: EllipsisHorizontalIcon,
  },
]);

// Validation function moved outside component
const validateForm = (formData) => {
  const newErrors = {};

  if (!formData.organizationName?.trim()) {
    newErrors.organizationName = "Organization name is required";
  }
  if (!formData.organizationType?.trim()) {
    newErrors.organizationType = "Organization type is required";
  }

  // Validate contacts
  const contacts = formData.contacts || [];
  contacts.forEach((contact, index) => {
    if (!contact.firstName?.trim()) {
      newErrors[`contact_${index}_firstName`] = "First name is required";
    }
    if (!contact.lastName?.trim()) {
      newErrors[`contact_${index}_lastName`] = "Last name is required";
    }
    if (!contact.email?.trim()) {
      newErrors[`contact_${index}_email`] = "Email is required";
    }
    if (!contact.phone?.trim()) {
      newErrors[`contact_${index}_phone`] = "Phone is required";
    }
  });

  return newErrors;
};

// Format response data function moved outside component
const formatDataFromResponse = (response) => {
  return {
    organizationName: response.organizationName || "",
    organizationShortName: response.organizationShortName || "",
    organizationType: response.organizationType || "",
    name: response.name || "",
    description: response.description || "",
    taxId: response.taxId || "",
    website: response.website || "",
    country: response.country || "",
    region: response.region || "",
    city: response.city || "",
    addressLine1: response.addressLine1 || "",
    addressLine2: response.addressLine2 || "",
    postalCode: response.postalCode || "",
    hasShippingAddress: response.hasShippingAddress || false,
    shippingName: response.shippingName || "",
    shippingPhone: response.shippingPhone || "",
    shippingCountry: response.shippingCountry || "",
    shippingRegion: response.shippingRegion || "",
    shippingCity: response.shippingCity || "",
    shippingAddressLine1: response.shippingAddressLine1 || "",
    shippingAddressLine2: response.shippingAddressLine2 || "",
    shippingPostalCode: response.shippingPostalCode || "",
    foundedDate: response.foundedDate || "",
    annualRevenue: response.annualRevenue || "",
    numberOfEmployees: response.numberOfEmployees || "",
    fiscalYearEnd: response.fiscalYearEnd || "",
    creditRating: response.creditRating || "",
    paymentTerms: response.paymentTerms || "",
    additionalComment: response.additionalComment || "",
    tags: response.tags || [],
    contacts:
      response.contacts &&
      Array.isArray(response.contacts) &&
      response.contacts.length > 0
        ? response.contacts.map((contact) => ({
            ...DEFAULT_CONTACT,
            ...contact,
          }))
        : [{ ...DEFAULT_CONTACT }],
  };
};

// Format submit data function moved outside component
const formatDataForSubmit = (formData, entityId) => {
  return {
    ...formData,
    id: entityId,
    contacts: formData.contacts || [],
  };
};

/**
 * Example usage of EntityUpdatePage for Organization
 * This shows how the reusable component can be configured for Organization entities
 */
const OrganizationUpdatePageExample = React.memo(
  function OrganizationUpdatePageExample() {
    const organizationManager = useOrganizationManager();

    // Memoize the manager object with its methods
    const manager = useMemo(
      () => ({
        getDetail: (id, onUnauthorized, options) =>
          organizationManager.getOrganizationDetail(
            id,
            onUnauthorized,
            options,
          ),
        update: (id, data, onUnauthorized) =>
          organizationManager.updateOrganization(id, data, onUnauthorized),
      }),
      [organizationManager],
    );

    // Memoize the entire configuration object
    const config = useMemo(
      () => ({
        // Basic entity information
        entityName: ENTITY_NAME,
        entityType: ENTITY_TYPE,
        idParam: ID_PARAM,

        // Icons
        icon: BuildingOffice2Icon,
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
  },
);

export default OrganizationUpdatePageExample;
