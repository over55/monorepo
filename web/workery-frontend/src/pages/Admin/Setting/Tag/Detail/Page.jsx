// File Path: web/workery-frontend/src/pages/Admin/Setting/Tag/Detail/Page.jsx
// UIX Upgraded - Uses SettingsDetailView whole page component
// @uix-page: SettingTagDetailPageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useTagManager } from "../../../../../services/Services";
import { SettingsDetailView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  TagIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

// Detail fields configuration
const DETAIL_FIELDS = [
  {
    name: "text",
    label: "Text",
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

function SettingTagDetailPage() {
  const { id } = useParams();
  const tagManager = useTagManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Tags", to: "/admin/settings/tags", icon: TagIcon },
      { label: "Detail", icon: ClipboardDocumentIcon, isActive: true },
    ],
    [],
  );

  // Fetch function for the detail view
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await tagManager.getTagDetail(itemId, onUnauthorized);
    },
    [tagManager],
  );

  return (
    <SettingsDetailView
      id={id}
      title="Tag Details"
      icon={TagIcon}
      breadcrumbItems={breadcrumbItems}
      fields={DETAIL_FIELDS}
      fetchItem={fetchItem}
      listPath="/admin/settings/tags"
      editPath={`/admin/settings/tag/${id}/update`}
      deletePath={`/admin/settings/tag/${id}/delete`}
      entityName="tag"
      displayField="text"
    />
  );
}

const SettingTagDetailPageContent = memo(SettingTagDetailPage);
SettingTagDetailPageContent.displayName = "SettingTagDetailPageContent";

function SettingTagDetailPageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingTagDetailPageContent />
    </UIXThemeProvider>
  );
}

export default SettingTagDetailPageWithProvider;
