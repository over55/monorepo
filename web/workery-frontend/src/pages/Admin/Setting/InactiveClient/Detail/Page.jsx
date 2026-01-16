// File Path: web/workery-frontend/src/pages/Admin/Setting/InactiveClient/Detail/Page.jsx
// UIX Upgraded - Uses SettingsDetailView whole page component
// @uix-page: SettingInactiveClientDetailPageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useCustomerManager } from "../../../../../services/Services";
import { SettingsDetailView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  ArchiveBoxIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
  BuildingOffice2Icon,
  HomeIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  UserIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  CUSTOMER_DEACTIVATION_REASON_MAP,
} from "../../../../../constants/Customer";

// Helper to get customer type display
const getCustomerTypeDisplay = (type) => {
  switch (type) {
    case COMMERCIAL_CUSTOMER_TYPE_OF_ID:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <BuildingOffice2Icon className="w-4 h-4 mr-1" />
          Commercial
        </span>
      );
    case RESIDENTIAL_CUSTOMER_TYPE_OF_ID:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <HomeIcon className="w-4 h-4 mr-1" />
          Residential
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          Unassigned
        </span>
      );
  }
};

// Helper to get deactivation reason
const getDeactivationReasonText = (reason, reasonOther) => {
  if (reason === 1 && reasonOther) {
    return reasonOther;
  }
  return CUSTOMER_DEACTIVATION_REASON_MAP[reason] || "Not specified";
};

// Helper to format gender
const getGenderText = (gender, genderOther) => {
  const genderMap = {
    1: genderOther || "Other",
    2: "Male",
    3: "Female",
    4: "Prefer not to say",
  };
  return genderMap[gender] || "Not specified";
};

// Detail fields configuration
const DETAIL_FIELDS = [
  {
    name: "_statusAlert",
    type: "custom",
    fullWidth: true,
    render: () => (
      <div className="flex items-center p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 mb-4">
        <ExclamationTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
        <span>
          <strong>Inactive Client:</strong> This client has been archived and is
          no longer active in the system.
        </span>
      </div>
    ),
  },
  {
    name: "_personalDetails",
    type: "section",
    label: "Personal Details",
  },
  {
    name: "firstName",
    label: "First Name",
    icon: UserIcon,
  },
  {
    name: "lastName",
    label: "Last Name",
    icon: UserIcon,
  },
  {
    name: "type",
    label: "Customer Type",
    render: (item) => getCustomerTypeDisplay(item.type),
  },
  {
    name: "organizationName",
    label: "Organization Name",
    icon: BuildingOffice2Icon,
    showIf: (item) => item.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  },
  {
    name: "birthDate",
    label: "Date of Birth",
    type: "date",
    icon: CalendarIcon,
  },
  {
    name: "gender",
    label: "Gender",
    render: (item) => getGenderText(item.gender, item.genderOther),
  },
  {
    name: "_contactInfo",
    type: "section",
    label: "Contact Information",
  },
  {
    name: "email",
    label: "Email",
    icon: EnvelopeIcon,
    render: (item) =>
      item.email ? (
        <a href={`mailto:${item.email}`} className="text-blue-600 hover:text-blue-800">
          {item.email}
        </a>
      ) : (
        <span className="text-gray-400 italic">Not provided</span>
      ),
  },
  {
    name: "phone",
    label: "Phone",
    icon: PhoneIcon,
    render: (item) =>
      item.phone || <span className="text-gray-400 italic">Not provided</span>,
  },
  {
    name: "_deactivationInfo",
    type: "section",
    label: "Deactivation Information",
    className: "border-l-4 border-l-amber-500",
  },
  {
    name: "status",
    label: "Status",
    render: () => (
      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-amber-100 text-amber-800">
        Inactive (Archived)
      </span>
    ),
  },
  {
    name: "deactivationReason",
    label: "Deactivation Reason",
    render: (item) =>
      getDeactivationReasonText(item.deactivationReason, item.deactivationReasonOther),
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    showIf: (item) => !!item.description,
  },
];

function SettingInactiveClientDetailPage() {
  const { id } = useParams();
  const customerManager = useCustomerManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      {
        label: "Inactive Clients",
        to: "/admin/settings/inactive-clients",
        icon: ArchiveBoxIcon,
      },
      { label: "Detail", icon: ClipboardDocumentIcon, isActive: true },
    ],
    [],
  );

  // Fetch function for the detail view
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      const response = await customerManager.getCustomerDetail(
        itemId,
        onUnauthorized,
      );

      // Verify this is actually an inactive client
      if (response && response.status !== 2) {
        throw new Error("This client is not inactive");
      }

      return response;
    },
    [customerManager],
  );

  // Custom actions for inactive clients
  const customActions = useMemo(
    () => [
      {
        label: "View Full Profile",
        variant: "primary",
        to: `/admin/customer/${id}`,
      },
      {
        label: "Restore Client",
        variant: "success",
        to: `/admin/settings/inactive-client/${id}/update`,
      },
    ],
    [id],
  );

  return (
    <SettingsDetailView
      id={id}
      title="Inactive Client Details"
      icon={ArchiveBoxIcon}
      breadcrumbItems={breadcrumbItems}
      fields={DETAIL_FIELDS}
      fetchItem={fetchItem}
      listPath="/admin/settings/inactive-clients"
      editPath={`/admin/settings/inactive-client/${id}/update`}
      entityName="inactive client"
      displayField="firstName"
      displayFieldSecondary="lastName"
      customActions={customActions}
      showDeleteButton={false}
      editButtonLabel="Restore"
    />
  );
}

const SettingInactiveClientDetailPageContent = memo(SettingInactiveClientDetailPage);
SettingInactiveClientDetailPageContent.displayName = "SettingInactiveClientDetailPageContent";

function SettingInactiveClientDetailPageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingInactiveClientDetailPageContent />
    </UIXThemeProvider>
  );
}

export default SettingInactiveClientDetailPageWithProvider;
