// File Path: web/workery-frontend/src/pages/Admin/Setting/InsuranceRequirement/List/Page.jsx
// UIX Upgraded - Uses SettingsListView whole page component
// @uix-page: SettingInsuranceRequirementListPageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useInsuranceRequirementManager } from "../../../../../services/Services";
import { SettingsListView } from "../../../../../components/business/views";
import { UIXThemeProvider, ViewButton } from "../../../../../components/UIX";
import {
  ShieldCheckIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

// Table columns configuration
const COLUMNS = [
  {
    key: "name",
    label: "Name",
    linkTo: (item) => `/admin/settings/insurance-requirement/${item.id}/detail`,
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
        basePath="/admin/settings/insurance-requirement"
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

function SettingInsuranceRequirementListPage() {
  const insuranceRequirementManager = useInsuranceRequirementManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Insurance Requirements", icon: ShieldCheckIcon, isActive: true },
    ],
    [],
  );

  // Fetch function for the list view
  const fetchItems = useCallback(
    async (params, onUnauthorized, forceRefresh) => {
      return await insuranceRequirementManager.getInsuranceRequirements(
        params,
        onUnauthorized,
        forceRefresh,
      );
    },
    [insuranceRequirementManager],
  );

  // Delete function (for inline delete)
  const deleteItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await insuranceRequirementManager.deleteInsuranceRequirement(itemId, onUnauthorized);
    },
    [insuranceRequirementManager],
  );

  return (
    <SettingsListView
      title="Insurance Requirements"
      icon={ShieldCheckIcon}
      breadcrumbItems={breadcrumbItems}
      columns={COLUMNS}
      fetchItems={fetchItems}
      deleteItem={deleteItem}
      createPath="/admin/settings/insurance-requirement/create"
      detailPathTemplate="/admin/settings/insurance-requirement/{id}/detail"
      editPathTemplate="/admin/settings/insurance-requirement/{id}/update"
      deletePathTemplate="/admin/settings/insurance-requirement/{id}/delete"
      entityName="insurance requirement"
      entityNamePlural="insurance requirements"
      displayField="name"
      searchPlaceholder="Search by name..."
      sortOptions={SORT_OPTIONS}
      defaultSortBy="name"
      defaultSortOrder="ASC"
    />
  );
}

const SettingInsuranceRequirementListPageContent = memo(SettingInsuranceRequirementListPage);
SettingInsuranceRequirementListPageContent.displayName = "SettingInsuranceRequirementListPageContent";

function SettingInsuranceRequirementListPageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingInsuranceRequirementListPageContent />
    </UIXThemeProvider>
  );
}

export default SettingInsuranceRequirementListPageWithProvider;
