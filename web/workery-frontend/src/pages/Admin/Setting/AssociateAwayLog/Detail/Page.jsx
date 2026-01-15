// File Path: web/workery-frontend/src/pages/Admin/Setting/AssociateAwayLog/Detail/Page.jsx
// UIX Upgraded - Uses SettingsDetailView whole page component
// @uix-page: SettingAssociateAwayLogDetailPageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { Link, useParams } from "react-router";
import { useAssociateAwayLogManager } from "../../../../../services/Services";
import { SettingsDetailView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  formatDateForDisplay,
} from "../../../../../services/Helpers/DateFormatter";

// Reason map for display
const REASON_MAP = {
  1: "Other",
  2: "Going on vacation",
  3: "Personal reasons",
  4: "Commercial insurance expired",
  5: "Police check expired",
  6: "Auto Insurance Expired",
  7: "WSIB Expired",
  8: "Dues Date Expired",
};

// Detail fields configuration
const DETAIL_FIELDS = [
  {
    name: "associateInfo",
    label: "Associate",
    type: "custom",
    render: (value, item) => (
      <Link
        to={`/admin/associate/${item.associateId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
      >
        <UserIcon className="w-4 h-4 mr-2 flex-shrink-0" />
        {item.associateName || `Associate #${item.associateId}`}
      </Link>
    ),
  },
  {
    name: "reason",
    label: "Reason for Absence",
    render: (value, item) => {
      if (value === 1) {
        return (
          <span>
            {REASON_MAP[1]}
            {item.reasonOther && (
              <span className="block mt-1 text-gray-600 italic">
                "{item.reasonOther}"
              </span>
            )}
          </span>
        );
      }
      return REASON_MAP[value] || "Unknown";
    },
  },
  {
    name: "startDate",
    label: "Start Date",
    render: (value) => (
      <span className="flex items-center">
        <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
        {formatDateForDisplay(value)}
      </span>
    ),
  },
  {
    name: "untilInfo",
    label: "Until",
    type: "custom",
    render: (value, item) => {
      if (item.untilFurtherNotice === 1) {
        return (
          <span className="text-amber-600 font-semibold flex items-center">
            <ClockIcon className="w-4 h-4 mr-2" />
            Further Notice
          </span>
        );
      }
      return (
        <span className="flex items-center">
          <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
          {formatDateForDisplay(item.untilDate)}
        </span>
      );
    },
  },
];

function SettingAssociateAwayLogDetailPage() {
  const { id } = useParams();
  const associateAwayLogManager = useAssociateAwayLogManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      {
        label: "Associate Away Logs",
        to: "/admin/settings/associate-away-logs",
        icon: CalendarDaysIcon,
      },
      { label: "Details", icon: ClipboardDocumentIcon, isActive: true },
    ],
    [],
  );

  // Fetch function for the detail view
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await associateAwayLogManager.getAssociateAwayLogDetail(
        itemId,
        onUnauthorized,
      );
    },
    [associateAwayLogManager],
  );

  return (
    <SettingsDetailView
      id={id}
      title="Associate Away Log Details"
      icon={CalendarDaysIcon}
      breadcrumbItems={breadcrumbItems}
      fields={DETAIL_FIELDS}
      fetchItem={fetchItem}
      listPath="/admin/settings/associate-away-logs"
      basePath="/admin/settings/associate-away-log"
      editPath={`/admin/settings/associate-away-log/${id}/update`}
      deletePath={`/admin/settings/associate-away-log/${id}/delete`}
      entityName="associate away log"
      entityTypePlural="Associate Away Logs"
      displayField="associateName"
    />
  );
}

const SettingAssociateAwayLogDetailPageContent = memo(SettingAssociateAwayLogDetailPage);
SettingAssociateAwayLogDetailPageContent.displayName = "SettingAssociateAwayLogDetailPageContent";

function SettingAssociateAwayLogDetailPageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingAssociateAwayLogDetailPageContent />
    </UIXThemeProvider>
  );
}

export default SettingAssociateAwayLogDetailPageWithProvider;
