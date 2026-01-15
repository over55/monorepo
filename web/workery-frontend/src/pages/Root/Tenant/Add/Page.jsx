// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)
// File Path: web/workery-frontend/src/pages/Root/Tenant/Add/Page.jsx
// Refactored to use RootTenantAddPage UIX component

import React, { useMemo } from "react";
import {
  useTenantManager,
  useAuthManager,
} from "../../../../services/Services";
import { RootTenantAddPage } from "../../../../components/UIX";
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
  PlusIcon,
} from "@heroicons/react/24/outline";

// Country options
const COUNTRY_OPTIONS = [
  { value: "", label: "Select Country" },
  { value: "CA", label: "Canada" },
  { value: "US", label: "United States" },
  { value: "MX", label: "Mexico" },
];

function RootTenantAddPageWrapper() {
  const tenantManager = useTenantManager();
  const authManager = useAuthManager();

  const config = useMemo(() => ({
    // Services
    authManager,
    tenantManager,

    // Page configuration
    icon: BuildingOffice2Icon,
    headerIcon: BuildingOffice2Icon,
    title: "Create New Tenant",
    subtitle: "Add a new organization to the system",
    loginPath: "/login",

    // Routes
    routes: {
      dashboard: "/root/dashboard",
      list: "/root/tenants",
      detail: "/root/tenant/:id",
    },

    // Breadcrumb navigation
    breadcrumbItems: [
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
        label: "Create New",
        icon: PlusIcon,
      },
    ],

    // Initial form data
    initialFormData: {
      name: "",
      alternateName: "",
      description: "",
      schemaName: "",
      addressCountry: "",
      addressRegion: "",
      addressLocality: "",
      postalCode: "",
      email: "",
      telephone: "",
      streetAddress: "",
      streetAddressExtra: "",
    },

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
            placeholder: "Enter alternate name (optional)",
            icon: BuildingOfficeIcon,
            colSpan: "col-span-1",
          },
          {
            name: "schemaName",
            label: "Schema Name",
            type: "text",
            placeholder: "Enter schema name (unique identifier)",
            icon: HashtagIcon,
            required: true,
            helperText: "A unique identifier for the database schema (lowercase, no spaces)",
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

    // Format data for submission
    formatDataForSubmit: (formData) => ({
      name: formData.name?.trim() || "",
      alternateName: formData.alternateName?.trim() || "",
      description: formData.description?.trim() || "",
      schemaName: formData.schemaName?.trim().toLowerCase().replace(/\s+/g, "_") || "",
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

      if (!formData.schemaName?.trim()) {
        errors.schemaName = "Schema name is required";
      } else if (!/^[a-z0-9_]+$/i.test(formData.schemaName.trim())) {
        errors.schemaName = "Schema name can only contain letters, numbers, and underscores";
      }

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }

      return errors;
    },

    // Submit button label
    submitLabel: "Create Tenant",
  }), [authManager, tenantManager]);

  return <RootTenantAddPage config={config} />;
}

export default RootTenantAddPageWrapper;
