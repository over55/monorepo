// File Path: web/workery-frontend/src/pages/Admin/Setting/HowHearAboutUsItem/List/Page.jsx
// UIX Upgraded - Uses SettingsListView whole page component
// @uix-page: SettingHowHearAboutUsItemListPageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useHowHearAboutUsItemManager } from "../../../../../services/Services";
import { SettingsListView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  MegaphoneIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  HashtagIcon,
  LockClosedIcon,
  BriefcaseIcon,
  UsersIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

// Get role badges for display
const getRoleBadges = (item) => {
  const badges = [];
  if (item.isForAssociate) {
    badges.push(
      <span
        key="associate"
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
      >
        <BriefcaseIcon className="w-3 h-3 mr-1" />
        Associate
      </span>,
    );
  }
  if (item.isForCustomer) {
    badges.push(
      <span
        key="customer"
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
      >
        <UsersIcon className="w-3 h-3 mr-1" />
        Customer
      </span>,
    );
  }
  if (item.isForStaff) {
    badges.push(
      <span
        key="staff"
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
      >
        <UserGroupIcon className="w-3 h-3 mr-1" />
        Staff
      </span>,
    );
  }
  return badges.length > 0 ? badges : <span className="text-gray-400 italic text-xs">No roles</span>;
};

// Table columns configuration
const COLUMNS = [
  {
    key: "sortNumber",
    label: "Sort #",
    render: (item) => (
      <span className="inline-flex items-center text-gray-900">
        <HashtagIcon className="w-4 h-4 mr-1 text-gray-400" />
        {item.sortNumber ?? "—"}
      </span>
    ),
  },
  {
    key: "text",
    label: "Text",
    linkTo: (item) => `/admin/settings/how-hear-about-us-item/${item.id}/detail`,
    render: (item) => (
      <span className="flex items-center">
        {item.text}
        {item.text === "Other" && <LockClosedIcon className="w-3 h-3 ml-2 text-amber-500" />}
      </span>
    ),
    className: "font-medium text-blue-600",
  },
  {
    key: "roles",
    label: "Available For",
    render: (item) => <div className="flex flex-wrap gap-1">{getRoleBadges(item)}</div>,
  },
  {
    key: "status",
    label: "Status",
    type: "status",
    centered: true,
  },
  {
    key: "createdAt",
    label: "Created",
    type: "date",
  },
];

// Sort options
const SORT_OPTIONS = [
  { value: "sort_number,1", label: "Sort Number (Low to High)" },
  { value: "sort_number,-1", label: "Sort Number (High to Low)" },
  { value: "text,1", label: "Text (A-Z)" },
  { value: "text,-1", label: "Text (Z-A)" },
  { value: "created_at,-1", label: "Created Date (Newest)" },
  { value: "created_at,1", label: "Created Date (Oldest)" },
];

function SettingHowHearAboutUsItemListPage() {
  const howHearAboutUsItemManager = useHowHearAboutUsItemManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "How Hear About Us Items", icon: MegaphoneIcon, isActive: true },
    ],
    [],
  );

  // Fetch function for the list view
  const fetchItems = useCallback(
    async (params, onUnauthorized, forceRefresh) => {
      return await howHearAboutUsItemManager.getList(params, onUnauthorized, forceRefresh);
    },
    [howHearAboutUsItemManager],
  );

  // Delete function (for inline delete) - check if item is protected
  const deleteItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await howHearAboutUsItemManager.delete(itemId, onUnauthorized);
    },
    [howHearAboutUsItemManager],
  );

  // Check if item can be edited/deleted (system-protected check)
  const canModifyItem = useCallback((item) => {
    return item.text !== "Other";
  }, []);

  return (
    <SettingsListView
      title="How Hear About Us Items"
      icon={MegaphoneIcon}
      breadcrumbItems={breadcrumbItems}
      columns={COLUMNS}
      fetchItems={fetchItems}
      deleteItem={deleteItem}
      createPath="/admin/settings/how-hear-about-us-item/create"
      detailPathTemplate="/admin/settings/how-hear-about-us-item/{id}/detail"
      editPathTemplate="/admin/settings/how-hear-about-us-item/{id}/update"
      deletePathTemplate="/admin/settings/how-hear-about-us-item/{id}/delete"
      entityName="how hear about us item"
      entityNamePlural="how hear about us items"
      displayField="text"
      searchPlaceholder="Search by text..."
      sortOptions={SORT_OPTIONS}
      defaultSortBy="sort_number"
      defaultSortOrder="1"
      canModifyItem={canModifyItem}
      protectedItemLabel="Protected"
    />
  );
}

const SettingHowHearAboutUsItemListPageContent = memo(SettingHowHearAboutUsItemListPage);
SettingHowHearAboutUsItemListPageContent.displayName = "SettingHowHearAboutUsItemListPageContent";

function SettingHowHearAboutUsItemListPageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingHowHearAboutUsItemListPageContent />
    </UIXThemeProvider>
  );
}

export default SettingHowHearAboutUsItemListPageWithProvider;
