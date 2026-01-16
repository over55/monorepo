// File Path: web/workery-frontend/src/pages/Admin/Setting/SkillSet/List/Page.jsx
// UIX Upgraded - Uses SettingsListView whole page component
// @uix-page: SettingSkillSetListPageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useSkillSetManager } from "../../../../../services/Services";
import { SettingsListView } from "../../../../../components/business/views";
import { UIXThemeProvider, ViewButton } from "../../../../../components/UIX";
import {
  AcademicCapIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

// Table columns configuration
const COLUMNS = [
  {
    key: "category",
    label: "Category",
    linkTo: (item) => `/admin/settings/skill-set/${item.id}/detail`,
    className: "font-medium text-blue-600",
  },
  {
    key: "subCategory",
    label: "Sub-Category",
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
    render: (row) => (
      <ViewButton
        basePath="/admin/settings/skill-set"
        itemId={row.id}
      />
    ),
  },
];

// Sort options
const SORT_OPTIONS = [
  { value: "category,ASC", label: "Category (A-Z)" },
  { value: "category,DESC", label: "Category (Z-A)" },
  { value: "sub_category,ASC", label: "Sub-Category (A-Z)" },
  { value: "sub_category,DESC", label: "Sub-Category (Z-A)" },
  { value: "created_at,DESC", label: "Created Date (Newest)" },
  { value: "created_at,ASC", label: "Created Date (Oldest)" },
];

function SettingSkillSetListPage() {
  const skillSetManager = useSkillSetManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Skill Sets", icon: AcademicCapIcon, isActive: true },
    ],
    [],
  );

  // Fetch function for the list view
  const fetchItems = useCallback(
    async (params, onUnauthorized, forceRefresh) => {
      return await skillSetManager.getSkillSets(params, onUnauthorized, forceRefresh);
    },
    [skillSetManager],
  );

  // Delete function (for inline delete)
  const deleteItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await skillSetManager.deleteSkillSet(itemId, onUnauthorized);
    },
    [skillSetManager],
  );

  return (
    <SettingsListView
      title="Skill Sets"
      icon={AcademicCapIcon}
      breadcrumbItems={breadcrumbItems}
      columns={COLUMNS}
      fetchItems={fetchItems}
      deleteItem={deleteItem}
      createPath="/admin/settings/skill-set/create"
      detailPathTemplate="/admin/settings/skill-set/{id}/detail"
      editPathTemplate="/admin/settings/skill-set/{id}/update"
      deletePathTemplate="/admin/settings/skill-set/{id}/delete"
      entityName="skill set"
      entityNamePlural="skill sets"
      displayField="category"
      searchPlaceholder="Search by category or sub-category..."
      sortOptions={SORT_OPTIONS}
      defaultSortBy="category"
      defaultSortOrder="ASC"
    />
  );
}

const SettingSkillSetListPageContent = memo(SettingSkillSetListPage);
SettingSkillSetListPageContent.displayName = "SettingSkillSetListPageContent";

function SettingSkillSetListPageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingSkillSetListPageContent />
    </UIXThemeProvider>
  );
}

export default SettingSkillSetListPageWithProvider;
