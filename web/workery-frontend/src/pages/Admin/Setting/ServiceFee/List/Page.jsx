// File Path: web/workery-frontend/src/pages/Admin/Setting/ServiceFee/List/Page.jsx
// UIX Upgraded - Uses SettingsListView whole page component
// @uix-page: SettingServiceFeeListPageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useServiceFeeManager } from "../../../../../services/Services";
import { SettingsListView } from "../../../../../components/business/views";
import { ViewButton, UIXThemeProvider } from "../../../../../components/UIX";
import {
  CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PercentBadgeIcon,
} from "@heroicons/react/24/outline";

// Status options for filtering
const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "1", label: "Active" },
  { value: "2", label: "Inactive" },
];

// Sort options for the list
const SORT_OPTIONS = [
  { value: "name,ASC", label: "Name (A-Z)" },
  { value: "name,DESC", label: "Name (Z-A)" },
  { value: "percentage,ASC", label: "Rate (Low to High)" },
  { value: "percentage,DESC", label: "Rate (High to Low)" },
  { value: "created_at,DESC", label: "Created Date (Newest)" },
  { value: "created_at,ASC", label: "Created Date (Oldest)" },
];

// Table columns configuration
const COLUMNS = [
  {
    key: "name",
    label: "Name",
    linkTo: (item) => `/admin/settings/service-fee/${item.id}/detail`,
    className: "font-medium text-blue-600",
  },
  {
    key: "percentage",
    label: "Rate",
    render: (row) => (
      <div className="flex items-center">
        <PercentBadgeIcon className="w-4 h-4 mr-1 text-blue-500" />
        <span className="font-medium">{row.percentage || 0}%</span>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span
        className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${
          row.status === 1
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {row.status === 1 ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    key: "createdAt",
    label: "Created",
    type: "date",
  },
  {
    key: "actions",
    label: "",
    centered: true,
    render: (row) => (
      <ViewButton
        basePath="/admin/settings/service-fee"
        itemId={row.id}
      />
    ),
  },
];

function SettingServiceFeeListPage() {
  const serviceFeeManager = useServiceFeeManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Service Fees", icon: CreditCardIcon, isActive: true },
    ],
    [],
  );

  // Fetch function for the list view
  const fetchItems = useCallback(
    async (params, onUnauthorized, forceRefresh) => {
      return await serviceFeeManager.getServiceFees(params, onUnauthorized, forceRefresh);
    },
    [serviceFeeManager],
  );

  // Delete function (for inline delete)
  const deleteItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await serviceFeeManager.deleteServiceFee(itemId, onUnauthorized);
    },
    [serviceFeeManager],
  );

  return (
    <SettingsListView
      title="Service Fees"
      icon={CreditCardIcon}
      breadcrumbItems={breadcrumbItems}
      columns={COLUMNS}
      fetchItems={fetchItems}
      deleteItem={deleteItem}
      createPath="/admin/settings/service-fees/create"
      detailPathTemplate="/admin/settings/service-fee/{id}/detail"
      editPathTemplate="/admin/settings/service-fee/{id}/update"
      deletePathTemplate="/admin/settings/service-fee/{id}/delete"
      entityName="service fee"
      entityNamePlural="service fees"
      displayField="name"
      statusOptions={STATUS_OPTIONS}
      sortOptions={SORT_OPTIONS}
      defaultSortBy="name"
      defaultSortOrder="ASC"
      searchPlaceholder="Search by name..."
    />
  );
}

const SettingServiceFeeListPageContent = memo(SettingServiceFeeListPage);
SettingServiceFeeListPageContent.displayName = "SettingServiceFeeListPageContent";

function SettingServiceFeeListPageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingServiceFeeListPageContent />
    </UIXThemeProvider>
  );
}

export default SettingServiceFeeListPageWithProvider;
