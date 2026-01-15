// File Path: web/workery-frontend/src/pages/Admin/Setting/VehicleType/Detail/Page.jsx
// UIX Upgraded - Uses SettingsDetailView whole page component
// @uix-page: SettingVehicleTypeDetailPageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useVehicleTypeManager } from "../../../../../services/Services";
import { SettingsDetailView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  TruckIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
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

function SettingVehicleTypeDetailPage() {
  const { id } = useParams();
  const vehicleTypeManager = useVehicleTypeManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Vehicle Types", to: "/admin/settings/vehicle-types", icon: TruckIcon },
      { label: "Detail", icon: ClipboardDocumentIcon, isActive: true },
    ],
    [],
  );

  // Fetch function for the detail view
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await vehicleTypeManager.getVehicleTypeDetail(itemId, onUnauthorized);
    },
    [vehicleTypeManager],
  );

  return (
    <SettingsDetailView
      id={id}
      title="Vehicle Type Details"
      icon={TruckIcon}
      breadcrumbItems={breadcrumbItems}
      fields={DETAIL_FIELDS}
      fetchItem={fetchItem}
      listPath="/admin/settings/vehicle-types"
      editPath={`/admin/settings/vehicle-type/${id}/update`}
      deletePath={`/admin/settings/vehicle-type/${id}/delete`}
      entityName="vehicle type"
      displayField="name"
    />
  );
}

const SettingVehicleTypeDetailPageContent = memo(SettingVehicleTypeDetailPage);
SettingVehicleTypeDetailPageContent.displayName = "SettingVehicleTypeDetailPageContent";

function SettingVehicleTypeDetailPageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingVehicleTypeDetailPageContent />
    </UIXThemeProvider>
  );
}

export default SettingVehicleTypeDetailPageWithProvider;
