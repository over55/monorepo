// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)
// File Path: web/workery-frontend/src/pages/Root/Tenant/Detail/Page.jsx
// Refactored to use RootTenantDetailPage UIX component

import React, { useMemo } from "react";
import {
  useTenantManager,
  useAuthManager,
} from "../../../../services/Services";
import { RootTenantDetailPage } from "../../../../components/UIX";
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
  PlayIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

function RootTenantDetailPageWrapper() {
  const tenantManager = useTenantManager();
  const authManager = useAuthManager();

  const config = useMemo(() => ({
    // Services
    authManager,
    tenantManager,

    // Page configuration
    icon: BuildingOffice2Icon,
    headerIcon: ChartBarIcon,
    idParam: "tid",
    subtitle: "View tenant information and settings",
    loginPath: "/login",

    // Routes
    routes: {
      dashboard: "/root/dashboard",
      list: "/root/tenants",
      edit: "/root/tenant/:id/edit",
      start: "/root/tenant/:id/start",
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
        label: "Detail",
        icon: InformationCircleIcon,
      },
    ],

    // Sections configuration
    sections: [
      {
        title: "Identification",
        icon: IdentificationIcon,
        gridCols: "grid-cols-1 md:grid-cols-2",
        fields: [
          {
            label: "Schema Name",
            accessor: "schemaName",
            icon: HashtagIcon,
          },
          {
            label: "Name",
            accessor: "name",
            icon: BuildingOfficeIcon,
          },
          {
            label: "Alternate Name",
            accessor: "alternateName",
            icon: BuildingOfficeIcon,
          },
          {
            label: "Description",
            accessor: "description",
            icon: InformationCircleIcon,
            className: "md:col-span-2",
          },
        ],
      },
      {
        title: "Contact Information",
        icon: PhoneIcon,
        gridCols: "grid-cols-1 md:grid-cols-2",
        fields: [
          {
            label: "Email",
            accessor: "email",
            icon: EnvelopeIcon,
          },
          {
            label: "Telephone",
            accessor: "telephone",
            icon: PhoneIcon,
          },
        ],
      },
      {
        title: "Address",
        icon: MapPinIcon,
        gridCols: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        fields: [
          {
            label: "Country",
            accessor: "addressCountry",
            icon: GlobeAltIcon,
          },
          {
            label: "State/Province",
            accessor: "addressRegion",
            icon: MapIcon,
          },
          {
            label: "City",
            accessor: "addressLocality",
            icon: BuildingOfficeIcon,
          },
          {
            label: "Postal Code",
            accessor: "postalCode",
            icon: HashtagIcon,
          },
          {
            label: "Street Address",
            accessor: "streetAddress",
            icon: HomeModernIcon,
          },
          {
            label: "Address (Extra line)",
            accessor: "streetAddressExtra",
            icon: HomeModernIcon,
          },
        ],
      },
    ],

    // Action buttons
    actionButtons: [
      {
        label: "Start Tenant",
        variant: "success",
        icon: PlayIcon,
        getTo: (id) => `/root/tenant/${id}/start`,
      },
    ],

    // Empty state
    emptyState: {
      icon: BuildingOfficeIcon,
      title: "Tenant Not Found",
      description: "The requested tenant could not be found.",
    },
  }), [authManager, tenantManager]);

  return <RootTenantDetailPage config={config} />;
}

export default RootTenantDetailPageWrapper;
