// File Path: web/workery-frontend/src/pages/Admin/Setting/HowHearAboutUsItem/Detail/Page.jsx
// UIX Upgraded - Uses SettingsDetailView whole page component
// @uix-page: SettingHowHearAboutUsItemDetailPageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useHowHearAboutUsItemManager } from "../../../../../services/Services";
import { SettingsDetailView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  MegaphoneIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
  BriefcaseIcon,
  UsersIcon,
  UserGroupIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";

// Detail fields configuration
const DETAIL_FIELDS = [
  {
    name: "text",
    label: "Display Text",
    required: true,
  },
  {
    name: "sortNumber",
    label: "Sort Number",
    render: (value) => (
      <div className="flex items-center">
        <HashtagIcon className="w-5 h-5 mr-2 text-blue-600" />
        <span className="text-lg font-semibold text-blue-700">{value ?? 0}</span>
      </div>
    ),
  },
  {
    name: "roles",
    label: "Available for Roles",
    render: (_, item) => {
      const badges = [];
      if (item.isForAssociate) {
        badges.push(
          <span
            key="associate"
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2"
          >
            <BriefcaseIcon className="w-3.5 h-3.5 mr-1" />
            Associate
          </span>,
        );
      }
      if (item.isForCustomer) {
        badges.push(
          <span
            key="customer"
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2"
          >
            <UsersIcon className="w-3.5 h-3.5 mr-1" />
            Customer
          </span>,
        );
      }
      if (item.isForStaff) {
        badges.push(
          <span
            key="staff"
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2"
          >
            <UserGroupIcon className="w-3.5 h-3.5 mr-1" />
            Staff
          </span>,
        );
      }
      return badges.length > 0 ? (
        <div className="flex flex-wrap gap-1">{badges}</div>
      ) : (
        <span className="text-gray-400 italic">No roles configured</span>
      );
    },
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

function SettingHowHearAboutUsItemDetailPage() {
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
      { label: "Detail", icon: ClipboardDocumentIcon, isActive: true },
    ],
    [],
  );

  // Fetch function for the detail view
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await howHearAboutUsItemManager.getDetail(itemId, onUnauthorized, true);
    },
    [howHearAboutUsItemManager],
  );

  // Check if item can be modified (system-protected check)
  const canModifyItem = useCallback((item) => {
    return item.text !== "Other";
  }, []);

  return (
    <SettingsDetailView
      id={id}
      title="How Hear About Us Item Details"
      icon={MegaphoneIcon}
      breadcrumbItems={breadcrumbItems}
      fields={DETAIL_FIELDS}
      fetchItem={fetchItem}
      listPath="/admin/settings/how-hear-about-us-items"
      editPath={`/admin/settings/how-hear-about-us-item/${id}/update`}
      deletePath={`/admin/settings/how-hear-about-us-item/${id}/delete`}
      entityName="how hear about us item"
      displayField="text"
      canModifyItem={canModifyItem}
      systemProtectedMessage="This is a system-protected item and cannot be edited or deleted."
    />
  );
}

const SettingHowHearAboutUsItemDetailPageContent = memo(SettingHowHearAboutUsItemDetailPage);
SettingHowHearAboutUsItemDetailPageContent.displayName = "SettingHowHearAboutUsItemDetailPageContent";

function SettingHowHearAboutUsItemDetailPageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingHowHearAboutUsItemDetailPageContent />
    </UIXThemeProvider>
  );
}

export default SettingHowHearAboutUsItemDetailPageWithProvider;
