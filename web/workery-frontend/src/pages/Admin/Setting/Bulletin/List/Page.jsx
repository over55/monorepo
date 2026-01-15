// File Path: web/workery-frontend/src/pages/Admin/Setting/Bulletin/List/Page.jsx
// UIX Upgraded - Uses SettingsListView whole page component
// @uix-page: SettingBulletinListPageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useBulletinManager } from "../../../../../services/Services";
import { SettingsListView } from "../../../../../components/business/views";
import { ViewButton, UIXThemeProvider } from "../../../../../components/UIX";
import {
  NewspaperIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

// Status options for filtering
const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "1", label: "Active" },
  { value: "0", label: "Archived" },
];

// Sort options
const SORT_OPTIONS = [
  { value: "text,ASC", label: "Text (A-Z)" },
  { value: "text,DESC", label: "Text (Z-A)" },
  { value: "created_at,DESC", label: "Created Date (Newest)" },
  { value: "created_at,ASC", label: "Created Date (Oldest)" },
];

// Table columns configuration
const COLUMNS = [
  {
    key: "text",
    label: "Text",
    linkTo: (item) => `/admin/settings/bulletin/${item.id}/detail`,
    className: "font-medium text-blue-600 max-w-md truncate",
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
        basePath="/admin/settings/bulletin"
        itemId={row.id}
      />
    ),
  },
];

function SettingBulletinListPage() {
  const bulletinManager = useBulletinManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Bulletins", icon: NewspaperIcon, isActive: true },
    ],
    [],
  );

  // Fetch function for the list view
  const fetchItems = useCallback(
    async (params, onUnauthorized, forceRefresh) => {
      return await bulletinManager.getBulletins(params, onUnauthorized, forceRefresh);
    },
    [bulletinManager],
  );

  // Delete function (for inline delete)
  const deleteItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await bulletinManager.deleteBulletin(itemId, onUnauthorized);
    },
    [bulletinManager],
  );

  return (
    <SettingsListView
      title="Bulletins"
      icon={NewspaperIcon}
      breadcrumbItems={breadcrumbItems}
      columns={COLUMNS}
      fetchItems={fetchItems}
      deleteItem={deleteItem}
      createPath="/admin/settings/bulletin/create"
      detailPathTemplate="/admin/settings/bulletin/{id}/detail"
      editPathTemplate="/admin/settings/bulletin/{id}/update"
      deletePathTemplate="/admin/settings/bulletin/{id}/delete"
      entityName="bulletin"
      entityNamePlural="bulletins"
      displayField="text"
      searchPlaceholder="Search by text..."
      statusOptions={STATUS_OPTIONS}
      sortOptions={SORT_OPTIONS}
      defaultSortBy="created_at"
      defaultSortOrder="DESC"
    />
  );
}

const SettingBulletinListPageContent = memo(SettingBulletinListPage);
SettingBulletinListPageContent.displayName = "SettingBulletinListPageContent";

function SettingBulletinListPageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingBulletinListPageContent />
    </UIXThemeProvider>
  );
}

export default SettingBulletinListPageWithProvider;
