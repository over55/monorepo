// File Path: web/workery-frontend/src/pages/Admin/Setting/VehicleType/List/Page.jsx
// UIX Upgraded - Uses SettingsListView whole page component
// @uix-page: SettingVehicleTypeListPageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useVehicleTypeManager } from "../../../../../services/Services";
import { SettingsListView } from "../../../../../components/business/views";
import { ViewButton, UIXThemeProvider } from "../../../../../components/UIX";
import { TruckIcon, ChartBarIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

// Table columns configuration
const COLUMNS = [
  {
    key: "name",
    label: "Name",
    linkTo: (item) => `/admin/settings/vehicle-type/${item.id}/detail`,
    className: "font-medium text-blue-600",
  },
  {
    key: "description",
    label: "Description",
    className: "text-gray-600",
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
    render: (_value, row) => (
      <ViewButton
        basePath="/admin/settings/vehicle-type"
        itemId={row.id}
      />
    ),
  },
];

// Sort options
const SORT_OPTIONS = [
  { value: "name,ASC", label: "Name (A-Z)" },
  { value: "name,DESC", label: "Name (Z-A)" },
  { value: "created_at,DESC", label: "Created Date (Newest)" },
  { value: "created_at,ASC", label: "Created Date (Oldest)" },
];

function SettingVehicleTypeListPage() {
  const vehicleTypeManager = useVehicleTypeManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Vehicle Types", icon: TruckIcon, isActive: true },
    ],
    [],
  );

  // Fetch function for the list view
  const fetchItems = useCallback(
    async (params, onUnauthorized, forceRefresh) => {
      return await vehicleTypeManager.getVehicleTypes(params, onUnauthorized, forceRefresh);
    },
    [vehicleTypeManager],
  );

  // Delete function (for inline delete)
  const deleteItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await vehicleTypeManager.deleteVehicleType(itemId, onUnauthorized);
    },
    [vehicleTypeManager],
  );

  return (
    <SettingsListView
      title="Vehicle Types"
      icon={TruckIcon}
      breadcrumbItems={breadcrumbItems}
      columns={COLUMNS}
      fetchItems={fetchItems}
      deleteItem={deleteItem}
      createPath="/admin/settings/vehicle-type/create"
      detailPathTemplate="/admin/settings/vehicle-type/{id}/detail"
      editPathTemplate="/admin/settings/vehicle-type/{id}/update"
      deletePathTemplate="/admin/settings/vehicle-type/{id}/delete"
      entityName="vehicle type"
      entityNamePlural="vehicle types"
      displayField="name"
      searchPlaceholder="Search by name..."
      sortOptions={SORT_OPTIONS}
      defaultSortBy="name"
      defaultSortOrder="ASC"
    />
  );
}

const SettingVehicleTypeListPageContent = memo(SettingVehicleTypeListPage);
SettingVehicleTypeListPageContent.displayName = "SettingVehicleTypeListPageContent";

function SettingVehicleTypeListPageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingVehicleTypeListPageContent />
    </UIXThemeProvider>
  );
}

export default SettingVehicleTypeListPageWithProvider;
