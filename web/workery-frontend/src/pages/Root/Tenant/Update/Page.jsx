// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)
// File Path: web/workery-frontend/src/pages/Root/Tenant/Update/Page.jsx
// Refactored to use RootTenantUpdatePage UIX component

import React, { useMemo } from "react";
import {
  useTenantManager,
  useAuthManager,
} from "../../../../services/Services";
import { RootTenantUpdatePage } from "../../../../components/UIX";
import {
  BuildingOfficeIcon,
  IdentificationIcon,
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  GlobeAltIcon,
  MapIcon,
  HomeModernIcon,
  HashtagIcon,
  PencilSquareIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// Country options
const COUNTRY_OPTIONS = [
  { value: "", label: "Select Country" },
  { value: "CA", label: "Canada" },
  { value: "US", label: "United States" },
  { value: "MX", label: "Mexico" },
];

function RootTenantUpdatePageWrapper() {
  const tenantManager = useTenantManager();
  const authManager = useAuthManager();

  const config = useMemo(() => ({
    // Services
    authManager,
    tenantManager,

    // Page configuration
    icon: BuildingOffice2Icon,
    headerIcon: BuildingOffice2Icon,
    idParam: "tid",
    title: "Update Tenant",
    subtitle: "Update organization information",
    loginPath: "/login",

    // Routes
    routes: {
      dashboard: "/root/dashboard",
      list: "/root/tenants",
      detail: "/root/tenant/:id",
    },

    // Breadcrumb navigation
    breadcrumbItems: (tenant, tenantId) => [
      {
        label: "Root Dashboard",
        href: "/root/dashboard",
        icon: ChartBarIcon,
      },
      {
        label: "Tenants",
        href: "/root/tenants",
        icon: BuildingOffice2Icon,
      },
      {
        label: "Detail",
        href: `/root/tenant/${tenantId}`,
        icon: InformationCircleIcon,
      },
      {
        label: "Update",
        icon: PencilSquareIcon,
      },
    ],

    // Form sections configuration
    formSections: [
      {
        title: "Identification",
        icon: IdentificationIcon,
        gridCols: "grid-cols-1 lg:grid-cols-2",
        fields: [
          {
            name: "name",
            label: "Name",
            type: "text",
            placeholder: "Enter tenant name",
            icon: BuildingOfficeIcon,
            required: true,
            colSpan: "col-span-1 lg:col-span-2",
          },
          {
            name: "alternateName",
            label: "Alternate Name",
            type: "text",
            placeholder: "Enter alternate name",
            icon: BuildingOfficeIcon,
            colSpan: "col-span-1",
          },
          {
            name: "schemaName",
            label: "Schema Name",
            type: "text",
            placeholder: "Enter schema name",
            icon: HashtagIcon,
            disabled: true,
            helperText: "Schema name cannot be changed after creation",
            colSpan: "col-span-1",
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Enter description (max 500 characters)",
            rows: 4,
            maxLength: 500,
            colSpan: "col-span-1 lg:col-span-2",
          },
        ],
      },
      {
        title: "Contact Information",
        icon: PhoneIcon,
        gridCols: "grid-cols-1 lg:grid-cols-2",
        fields: [
          {
            name: "email",
            label: "Email",
            type: "email",
            placeholder: "Enter email address",
            icon: EnvelopeIcon,
            colSpan: "col-span-1",
          },
          {
            name: "telephone",
            label: "Telephone",
            type: "tel",
            placeholder: "Enter telephone number",
            icon: PhoneIcon,
            colSpan: "col-span-1",
          },
        ],
      },
      {
        title: "Address",
        icon: MapPinIcon,
        gridCols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2",
        fields: [
          {
            name: "addressCountry",
            label: "Country",
            type: "select",
            options: COUNTRY_OPTIONS,
            colSpan: "col-span-1",
          },
          {
            name: "addressRegion",
            label: "Province/Territory",
            type: "text",
            placeholder: "Enter province/state/region",
            icon: MapIcon,
            colSpan: "col-span-1",
          },
          {
            name: "addressLocality",
            label: "City",
            type: "text",
            placeholder: "Enter city",
            icon: BuildingOfficeIcon,
            colSpan: "col-span-1",
          },
          {
            name: "postalCode",
            label: "Postal Code",
            type: "text",
            placeholder: "Enter postal/zip code",
            icon: HashtagIcon,
            colSpan: "col-span-1",
          },
          {
            name: "streetAddress",
            label: "Street Address",
            type: "text",
            placeholder: "Enter street address",
            icon: HomeModernIcon,
            colSpan: "col-span-1 sm:col-span-2",
          },
          {
            name: "streetAddressExtra",
            label: "Address (Extra line)",
            type: "text",
            placeholder: "Enter additional address info (optional)",
            icon: HomeModernIcon,
            colSpan: "col-span-1 sm:col-span-2",
          },
        ],
      },
    ],

    // Format data from API response
    formatDataFromResponse: (tenantData) => ({
      name: tenantData.name || "",
      alternateName: tenantData.alternateName || "",
      description: tenantData.description || "",
      schemaName: tenantData.schemaName || "",
      addressCountry: tenantData.addressCountry || "",
      addressRegion: tenantData.addressRegion || "",
      addressLocality: tenantData.addressLocality || "",
      postalCode: tenantData.postalCode || "",
      email: tenantData.email || "",
      telephone: tenantData.telephone || "",
      streetAddress: tenantData.streetAddress || "",
      streetAddressExtra: tenantData.streetAddressExtra || "",
    }),

    // Format data for submission
    formatDataForSubmit: (formData) => ({
      name: formData.name?.trim() || "",
      alternateName: formData.alternateName?.trim() || "",
      description: formData.description?.trim() || "",
      schemaName: formData.schemaName?.trim() || "",
      addressLocality: formData.addressLocality?.trim() || "",
      addressRegion: formData.addressRegion?.trim() || "",
      addressCountry: formData.addressCountry?.trim() || "",
      email: formData.email?.trim() || "",
      telephone: formData.telephone?.trim() || "",
      streetAddress: formData.streetAddress?.trim() || "",
      streetAddressExtra: formData.streetAddressExtra?.trim() || "",
      postalCode: formData.postalCode?.trim() || "",
      state: 1, // Active state
    }),

    // Validation
    validateForm: (formData) => {
      const errors = {};

      if (!formData.name?.trim()) {
        errors.name = "Name is required";
      }

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }

      return errors;
    },

    // Submit button label
    submitLabel: "Save Changes",
  }), [authManager, tenantManager]);

  return <RootTenantUpdatePage config={config} />;
}

export default RootTenantUpdatePageWrapper;
