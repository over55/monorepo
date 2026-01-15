// File Path: web/workery-frontend/src/pages/Admin/Setting/HowHearAboutUsItem/Delete/Page.jsx
// UIX Upgraded - Uses SettingsDeleteView whole page component
// @uix-page: SettingHowHearAboutUsItemDeletePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useHowHearAboutUsItemManager } from "../../../../../services/Services";
import { SettingsDeleteView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  MegaphoneIcon,
  TrashIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  UserGroupIcon,
  UsersIcon,
  BriefcaseIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";

// Impact warnings for deletion
const IMPACT_WARNINGS = [
  {
    icon: DocumentTextIcon,
    text: "Forms where this option is displayed to users will be affected",
  },
  {
    icon: ClipboardDocumentIcon,
    text: "Historical records that reference this option will still exist but may show as 'Deleted'",
  },
  {
    icon: ChartBarIcon,
    text: "Reports and analytics that include this data will be affected",
  },
  {
    icon: TrashIcon,
    text: "You will not be able to recover this item once deleted",
  },
];

// Alternative suggestions text
const ALTERNATIVE_TEXT = `Consider these alternatives:
• Set the item to "Inactive" instead of deleting it to preserve historical data
• Update the text or configuration if it's outdated
• Document the item information before deletion for records`;

function SettingHowHearAboutUsItemDeletePage() {
  const { id } = useParams();
  const howHearAboutUsItemManager = useHowHearAboutUsItemManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      {
        label: "How Hear About Us Items",
        to: "/admin/settings/how-hear-about-us-items",
        icon: MegaphoneIcon,
      },
      {
        label: "Detail",
        to: `/admin/settings/how-hear-about-us-item/${id}/detail`,
        icon: ClipboardDocumentIcon,
      },
      { label: "Delete", icon: TrashIcon, isActive: true },
    ],
    [id],
  );

  // Fetch function for loading item data
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await howHearAboutUsItemManager.getDetail(itemId, onUnauthorized, true);
    },
    [howHearAboutUsItemManager],
  );

  // Delete function
  const deleteItem = useCallback(
    async (itemId, onUnauthorized) => {
      if (import.meta.env.DEV) {
        console.log("HowHearAboutUsItemDeletePage: Deleting item:", itemId);
      }

      return await howHearAboutUsItemManager.delete(itemId, onUnauthorized);
    },
    [howHearAboutUsItemManager],
  );

  // Check if item can be deleted (system-protected check)
  const canDeleteItem = useCallback((item) => {
    return item.text !== "Other";
  }, []);

  // Function to render item details
  const renderItemDetails = useCallback((item) => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Display Text:</label>
          <div className="p-3 bg-white rounded border border-gray-300 font-semibold text-lg">
            {item.text || "N/A"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort Number:</label>
            <div className="p-3 bg-white rounded border border-gray-300 flex items-center">
              <HashtagIcon className="w-4 h-4 mr-2 text-blue-500" />
              <span className="font-medium">{item.sortNumber ?? "N/A"}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status:</label>
            <div className="p-3 bg-white rounded border border-gray-300">
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  item.status === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {item.status === 1 ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Available for Roles:</label>
          <div className="p-3 bg-white rounded border border-gray-300">
            <div className="flex flex-wrap gap-2">
              {item.isForAssociate && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <BriefcaseIcon className="w-3.5 h-3.5 mr-1" />
                  Associate
                </span>
              )}
              {item.isForCustomer && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <UsersIcon className="w-3.5 h-3.5 mr-1" />
                  Customer
                </span>
              )}
              {item.isForStaff && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <UserGroupIcon className="w-3.5 h-3.5 mr-1" />
                  Staff
                </span>
              )}
              {!item.isForAssociate && !item.isForCustomer && !item.isForStaff && (
                <span className="text-gray-400 italic">No roles configured</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-2 border-t border-gray-200">
          <div>
            <span className="font-medium text-gray-600">ID:</span>{" "}
            <span className="text-gray-900">{item.id}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Created:</span>{" "}
            <span className="text-gray-900">
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Modified:</span>{" "}
            <span className="text-gray-900">
              {item.modifiedAt ? new Date(item.modifiedAt).toLocaleDateString() : "Never"}
            </span>
          </div>
        </div>
      </div>
    );
  }, []);

  return (
    <SettingsDeleteView
      id={id}
      title="Delete How Hear About Us Item"
      icon={MegaphoneIcon}
      breadcrumbItems={breadcrumbItems}
      fetchItem={fetchItem}
      deleteItem={deleteItem}
      renderItemDetails={renderItemDetails}
      impactWarnings={IMPACT_WARNINGS}
      alternativeText={ALTERNATIVE_TEXT}
      listPath="/admin/settings/how-hear-about-us-items"
      detailPath={`/admin/settings/how-hear-about-us-item/${id}/detail`}
      editPath={`/admin/settings/how-hear-about-us-item/${id}/update`}
      entityName="how hear about us item"
      displayField="text"
      requireConfirmation={true}
      confirmationWord="delete"
      canDeleteItem={canDeleteItem}
      systemProtectedMessage="This is a system-protected item and cannot be deleted."
    />
  );
}

const SettingHowHearAboutUsItemDeletePageContent = memo(SettingHowHearAboutUsItemDeletePage);
SettingHowHearAboutUsItemDeletePageContent.displayName = "SettingHowHearAboutUsItemDeletePageContent";

function SettingHowHearAboutUsItemDeletePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingHowHearAboutUsItemDeletePageContent />
    </UIXThemeProvider>
  );
}

export default SettingHowHearAboutUsItemDeletePageWithProvider;
