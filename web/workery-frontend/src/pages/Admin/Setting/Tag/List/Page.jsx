// File Path: web/workery-frontend/src/pages/Admin/Setting/Tag/List/Page.jsx
// UIX Upgraded - Uses SettingsListView whole page component
// @uix-page: SettingTagListPageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useTagManager } from "../../../../../services/Services";
import { SettingsListView } from "../../../../../components/business/views";
import { ViewButton, UIXThemeProvider } from "../../../../../components/UIX";
import { TagIcon, ChartBarIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

// Table columns configuration
const COLUMNS = [
  {
    key: "text",
    label: "Text",
    linkTo: (item) => `/admin/settings/tag/${item.id}/detail`,
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
    render: (row) => (
      <ViewButton
        basePath="/admin/settings/tag"
        itemId={row.id}
      />
    ),
  },
];

// Sort options
const SORT_OPTIONS = [
  { value: "text,ASC", label: "Text (A-Z)" },
  { value: "text,DESC", label: "Text (Z-A)" },
  { value: "created_at,DESC", label: "Created Date (Newest)" },
  { value: "created_at,ASC", label: "Created Date (Oldest)" },
];

function SettingTagListPage() {
  const tagManager = useTagManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Tags", icon: TagIcon, isActive: true },
    ],
    [],
  );

  // Fetch function for the list view
  const fetchItems = useCallback(
    async (params, onUnauthorized, forceRefresh) => {
      return await tagManager.getTags(params, onUnauthorized, forceRefresh);
    },
    [tagManager],
  );

  // Delete function (for inline delete)
  const deleteItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await tagManager.deleteTag(itemId, onUnauthorized);
    },
    [tagManager],
  );

  return (
    <SettingsListView
      title="Tags"
      icon={TagIcon}
      breadcrumbItems={breadcrumbItems}
      columns={COLUMNS}
      fetchItems={fetchItems}
      deleteItem={deleteItem}
      createPath="/admin/settings/tag/create"
      detailPathTemplate="/admin/settings/tag/{id}/detail"
      editPathTemplate="/admin/settings/tag/{id}/update"
      deletePathTemplate="/admin/settings/tag/{id}/delete"
      entityName="tag"
      entityNamePlural="tags"
      displayField="text"
      searchPlaceholder="Search by text..."
      sortOptions={SORT_OPTIONS}
      defaultSortBy="text"
      defaultSortOrder="ASC"
    />
  );
}

const SettingTagListPageContent = memo(SettingTagListPage);
SettingTagListPageContent.displayName = "SettingTagListPageContent";

function SettingTagListPageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingTagListPageContent />
    </UIXThemeProvider>
  );
}

export default SettingTagListPageWithProvider;
