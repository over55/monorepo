// File Path: web/workery-frontend/src/pages/Admin/Setting/Tag/Delete/Page.jsx
// UIX Upgraded - Uses SettingsDeleteView whole page component
// @uix-page: SettingTagDeletePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useTagManager } from "../../../../../services/Services";
import { SettingsDeleteView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  TagIcon,
  TrashIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// Impact warnings for deletion
const IMPACT_WARNINGS = [
  {
    icon: TagIcon,
    text: "This tag will be completely removed from the system",
  },
  {
    icon: DocumentTextIcon,
    text: "Any content currently tagged with this tag may be affected",
  },
  {
    icon: InformationCircleIcon,
    text: "Historical records referencing this tag will still exist but may show as 'Deleted'",
  },
  {
    icon: TrashIcon,
    text: "You will not be able to recover this tag once deleted",
  },
];

// Alternative suggestions text
const ALTERNATIVE_TEXT = `Consider these alternatives:
• Set the tag to "Inactive" instead of deleting it
• Edit the tag to update its text or description
• Export or document the tag information before deletion`;

function SettingTagDeletePage() {
  const { id } = useParams();
  const tagManager = useTagManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Tags", to: "/admin/settings/tags", icon: TagIcon },
      { label: "Detail", to: `/admin/settings/tag/${id}/detail`, icon: ClipboardDocumentIcon },
      { label: "Delete", icon: TrashIcon, isActive: true },
    ],
    [id],
  );

  // Fetch function for loading item data
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await tagManager.getTagDetail(itemId, onUnauthorized);
    },
    [tagManager],
  );

  // Delete function
  const deleteItem = useCallback(
    async (itemId, onUnauthorized) => {
      if (import.meta.env.DEV) {
        console.log("TagDeletePage: Deleting tag:", itemId);
      }

      return await tagManager.deleteTag(itemId, onUnauthorized);
    },
    [tagManager],
  );

  // Function to render item details
  const renderItemDetails = useCallback((item) => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Text:</label>
          <div className="p-3 bg-white rounded border border-gray-300">{item.text || "N/A"}</div>
        </div>
        {item.description && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description:</label>
            <div className="p-3 bg-white rounded border border-gray-300">{item.description}</div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">ID:</span>{" "}
            <span className="text-gray-900">{item.id}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Status:</span>{" "}
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-1 ${
                item.status === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}
            >
              {item.status === 1 ? "Active" : "Inactive"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Created:</span>{" "}
            <span className="text-gray-900">
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
            </span>
          </div>
        </div>
      </div>
    );
  }, []);

  return (
    <SettingsDeleteView
      id={id}
      title="Delete Tag"
      icon={TagIcon}
      breadcrumbItems={breadcrumbItems}
      fetchItem={fetchItem}
      deleteItem={deleteItem}
      renderItemDetails={renderItemDetails}
      impactWarnings={IMPACT_WARNINGS}
      alternativeText={ALTERNATIVE_TEXT}
      listPath="/admin/settings/tags"
      detailPath={`/admin/settings/tag/${id}/detail`}
      editPath={`/admin/settings/tag/${id}/update`}
      entityName="tag"
      displayField="text"
      requireConfirmation={true}
      confirmationWord="delete"
    />
  );
}

const SettingTagDeletePageContent = memo(SettingTagDeletePage);
SettingTagDeletePageContent.displayName = "SettingTagDeletePageContent";

function SettingTagDeletePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingTagDeletePageContent />
    </UIXThemeProvider>
  );
}

export default SettingTagDeletePageWithProvider;
