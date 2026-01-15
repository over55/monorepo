// File Path: web/workery-frontend/src/pages/Admin/Setting/InactiveClient/List/Page.jsx
// UIX Upgraded - Uses SettingsListView whole page component
// @uix-page: SettingInactiveClientListPageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useCustomerManager } from "../../../../../services/Services";
import { SettingsListView } from "../../../../../components/business/views";
import { ViewButton, UIXThemeProvider } from "../../../../../components/UIX";
import {
  ArchiveBoxIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BuildingOffice2Icon,
  HomeIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import {
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  CUSTOMER_STATUS_INACTIVE,
  CUSTOMER_DEACTIVATION_REASON_MAP,
} from "../../../../../constants/Customer";
import { formatDateForDisplay } from "../../../../../services/Helpers/DateFormatter";

// Helper to get customer type badge
const getTypeBadge = (type) => {
  switch (type) {
    case COMMERCIAL_CUSTOMER_TYPE_OF_ID:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <BuildingOffice2Icon className="w-3 h-3 mr-1" />
          Commercial
        </span>
      );
    case RESIDENTIAL_CUSTOMER_TYPE_OF_ID:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <HomeIcon className="w-3 h-3 mr-1" />
          Residential
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Unassigned
        </span>
      );
  }
};

// Helper to get client name
const getClientName = (item) => {
  if (item.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && item.organizationName) {
    return item.organizationName;
  }
  return `${item.firstName || ""} ${item.lastName || ""}`.trim() || "Unknown";
};

// Helper to get deactivation reason
const getDeactivationReasonText = (reason, reasonOther) => {
  if (reason === 1 && reasonOther) {
    return reasonOther;
  }
  return CUSTOMER_DEACTIVATION_REASON_MAP[reason] || "Not specified";
};

// Table columns configuration
const COLUMNS = [
  {
    key: "name",
    label: "Name",
    linkTo: (item) => `/admin/settings/inactive-client/${item.id}/detail`,
    className: "font-medium text-blue-600",
    render: (_value, row) => (
      <span className="flex items-center">
        {row.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID ? (
          <BuildingOffice2Icon className="w-4 h-4 mr-2 text-gray-400" />
        ) : (
          <HomeIcon className="w-4 h-4 mr-2 text-gray-400" />
        )}
        {getClientName(row)}
      </span>
    ),
  },
  {
    key: "phone",
    label: "Phone",
    render: (value) =>
      value ? (
        <span className="flex items-center text-gray-600">
          <PhoneIcon className="w-4 h-4 mr-1" />
          {value}
        </span>
      ) : (
        <span className="text-gray-400 italic">—</span>
      ),
  },
  {
    key: "email",
    label: "Email",
    render: (value) =>
      value ? (
        <span className="flex items-center text-gray-600">
          <EnvelopeIcon className="w-4 h-4 mr-1" />
          <span className="truncate max-w-[180px]">{value}</span>
        </span>
      ) : (
        <span className="text-gray-400 italic">—</span>
      ),
  },
  {
    key: "type",
    label: "Type",
    render: (value) => getTypeBadge(value),
  },
  {
    key: "deactivationReason",
    label: "Deactivation Reason",
    render: (value, row) => (
      <span className="text-gray-600">
        {getDeactivationReasonText(value, row.deactivationReasonOther)}
      </span>
    ),
  },
  {
    key: "modifiedAt",
    label: "Modified",
    type: "date",
    render: (value) => (
      <span className="text-gray-600">{formatDateForDisplay(value)}</span>
    ),
  },
  {
    key: "actions",
    label: "",
    centered: true,
    render: (_value, row) => (
      <ViewButton basePath="/admin/settings/inactive-client" itemId={row.id} />
    ),
  },
];

// Sort options
const SORT_OPTIONS = [
  { value: "lexical_name,ASC", label: "Name (A-Z)" },
  { value: "lexical_name,DESC", label: "Name (Z-A)" },
  { value: "modified_at,DESC", label: "Modified Date (Newest)" },
  { value: "modified_at,ASC", label: "Modified Date (Oldest)" },
];

function SettingInactiveClientListPage() {
  const customerManager = useCustomerManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Inactive Clients", icon: ArchiveBoxIcon, isActive: true },
    ],
    [],
  );

  // Fetch function for the list view - filters by inactive status
  const fetchItems = useCallback(
    async (params, onUnauthorized, forceRefresh) => {
      // Add the inactive status filter to the params
      const filtersMap = new Map();

      // Copy existing params
      if (params.cursor) filtersMap.set("cursor", params.cursor);
      if (params.page_size) filtersMap.set("page_size", params.page_size);
      if (params.sort_field) filtersMap.set("sort_field", params.sort_field);
      if (params.sort_order) filtersMap.set("sort_order", params.sort_order);
      if (params.search) filtersMap.set("search", params.search);

      // IMPORTANT: Always filter for inactive clients only
      filtersMap.set("status", CUSTOMER_STATUS_INACTIVE);

      return await customerManager.getCustomersWithFiltersMap(
        filtersMap,
        onUnauthorized,
        forceRefresh,
      );
    },
    [customerManager],
  );

  return (
    <SettingsListView
      title="Inactive Clients"
      subtitle="View and manage archived or inactive client records"
      icon={ArchiveBoxIcon}
      breadcrumbItems={breadcrumbItems}
      columns={COLUMNS}
      fetchItems={fetchItems}
      detailPathTemplate="/admin/settings/inactive-client/{id}/detail"
      editPathTemplate="/admin/settings/inactive-client/{id}/update"
      entityName="inactive client"
      entityNamePlural="inactive clients"
      displayField="name"
      searchPlaceholder="Search by name, email, or phone..."
      sortOptions={SORT_OPTIONS}
      defaultSortBy="lexical_name"
      defaultSortOrder="DESC"
      showCreateButton={false}
      emptyStateIcon={ArchiveBoxIcon}
      emptyStateTitle="No Inactive Clients Found"
      emptyStateMessage="No clients have been archived or deactivated yet."
    />
  );
}

const SettingInactiveClientListPageContent = memo(SettingInactiveClientListPage);
SettingInactiveClientListPageContent.displayName = "SettingInactiveClientListPageContent";

function SettingInactiveClientListPageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingInactiveClientListPageContent />
    </UIXThemeProvider>
  );
}

export default SettingInactiveClientListPageWithProvider;
