// File Path: web/workery-frontend/src/pages/Admin/Setting/ServiceFee/Detail/Page.jsx
// UIX Upgraded - Uses SettingsDetailView whole page component
// @uix-page: SettingServiceFeeDetailPageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useServiceFeeManager } from "../../../../../services/Services";
import { SettingsDetailView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
  PercentBadgeIcon,
} from "@heroicons/react/24/outline";

// Detail fields configuration
const DETAIL_FIELDS = [
  {
    name: "name",
    label: "Name",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
  },
  {
    name: "percentage",
    label: "Percentage Rate",
    render: (value) => (
      <div className="flex items-center">
        <PercentBadgeIcon className="w-5 h-5 mr-2 text-blue-600" />
        <span className="text-lg font-semibold text-blue-700">{value || 0}%</span>
      </div>
    ),
  },
  {
    name: "status",
    label: "Status",
    type: "status",
    render: (value) => (
      <span
        className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
          value === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}
      >
        {value === 1 ? "Active" : "Inactive"}
      </span>
    ),
  },
];

function SettingServiceFeeDetailPage() {
  const { id } = useParams();
  const serviceFeeManager = useServiceFeeManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Service Fees", to: "/admin/settings/service-fees", icon: CreditCardIcon },
      { label: "Detail", icon: ClipboardDocumentIcon, isActive: true },
    ],
    [],
  );

  // Fetch function for the detail view
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await serviceFeeManager.getServiceFeeDetail(itemId, onUnauthorized);
    },
    [serviceFeeManager],
  );

  return (
    <SettingsDetailView
      id={id}
      title="Service Fee Details"
      icon={CreditCardIcon}
      breadcrumbItems={breadcrumbItems}
      fields={DETAIL_FIELDS}
      fetchItem={fetchItem}
      listPath="/admin/settings/service-fees"
      editPath={`/admin/settings/service-fee/${id}/update`}
      deletePath={`/admin/settings/service-fee/${id}/delete`}
      entityName="service fee"
      displayField="name"
    />
  );
}

const SettingServiceFeeDetailPageContent = memo(SettingServiceFeeDetailPage);
SettingServiceFeeDetailPageContent.displayName = "SettingServiceFeeDetailPageContent";

function SettingServiceFeeDetailPageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingServiceFeeDetailPageContent />
    </UIXThemeProvider>
  );
}

export default SettingServiceFeeDetailPageWithProvider;
