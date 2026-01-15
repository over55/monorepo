// File Path: web/workery-frontend/src/pages/Admin/Setting/AssociateAwayLog/Delete/Page.jsx
// UIX Upgraded - Uses SettingsDeleteView whole page component
// @uix-page: SettingAssociateAwayLogDeletePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useAssociateAwayLogManager } from "../../../../../services/Services";
import { SettingsDeleteView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { formatDateForDisplay } from "../../../../../services/Helpers/DateFormatter";

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

// Impact warnings for deletion
const IMPACT_WARNINGS = [
  {
    icon: UserIcon,
    text: "The associate will be available for new work order assignments again",
  },
  {
    icon: CalendarIcon,
    text: "Any scheduling considerations based on this away log will be removed",
  },
];

function SettingAssociateAwayLogDeletePage() {
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
      {
        label: "Detail",
        to: `/admin/settings/associate-away-log/${id}/detail`,
        icon: ClipboardDocumentIcon,
      },
      { label: "Delete", icon: TrashIcon, isActive: true },
    ],
    [id],
  );

  // Fetch function for the delete view
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await associateAwayLogManager.getAssociateAwayLogDetail(
        itemId,
        onUnauthorized,
      );
    },
    [associateAwayLogManager],
  );

  // Delete function
  const deleteItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await associateAwayLogManager.deleteAssociateAwayLog(
        itemId,
        onUnauthorized,
      );
    },
    [associateAwayLogManager],
  );

  // Custom render for item details
  const renderItemDetails = useCallback((item) => {
    if (!item) return null;

    return (
      <div className="space-y-3 text-sm">
        <div className="flex">
          <span className="font-medium text-gray-600 w-32">Associate:</span>
          <span className="text-gray-900 flex items-center">
            <UserIcon className="w-4 h-4 mr-1 text-gray-400" />
            {item.associateName || `Associate #${item.associateId}`}
          </span>
        </div>
        <div className="flex">
          <span className="font-medium text-gray-600 w-32">Reason:</span>
          <span className="text-gray-900">
            {item.reason === 1
              ? item.reasonOther || "Other"
              : REASON_MAP[item.reason] || "Unknown"}
          </span>
        </div>
        <div className="flex">
          <span className="font-medium text-gray-600 w-32">Start Date:</span>
          <span className="text-gray-900 flex items-center">
            <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
            {formatDateForDisplay(item.startDate)}
          </span>
        </div>
        <div className="flex">
          <span className="font-medium text-gray-600 w-32">Until:</span>
          <span className="text-gray-900">
            {item.untilFurtherNotice === 1 ? (
              <span className="flex items-center text-amber-600 font-semibold">
                <ClockIcon className="w-4 h-4 mr-1" />
                Further Notice
              </span>
            ) : (
              <span className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                {formatDateForDisplay(item.untilDate)}
              </span>
            )}
          </span>
        </div>
      </div>
    );
  }, []);

  return (
    <SettingsDeleteView
      id={id}
      title="Delete Associate Away Log"
      icon={CalendarDaysIcon}
      breadcrumbItems={breadcrumbItems}
      fetchItem={fetchItem}
      deleteItem={deleteItem}
      listPath="/admin/settings/associate-away-logs"
      basePath="/admin/settings/associate-away-log"
      detailPath={`/admin/settings/associate-away-log/${id}/detail`}
      editPath={`/admin/settings/associate-away-log/${id}/update`}
      entityName="associate away log"
      entityTypePlural="Associate Away Logs"
      displayField="associateName"
      impactWarnings={IMPACT_WARNINGS}
      alternativeText="Consider editing the away log to set an end date instead of deleting it to preserve historical records."
      requireConfirmation={true}
      confirmationWord="delete"
      renderItemDetails={renderItemDetails}
    />
  );
}

const SettingAssociateAwayLogDeletePageContent = memo(SettingAssociateAwayLogDeletePage);
SettingAssociateAwayLogDeletePageContent.displayName = "SettingAssociateAwayLogDeletePageContent";

function SettingAssociateAwayLogDeletePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingAssociateAwayLogDeletePageContent />
    </UIXThemeProvider>
  );
}

export default SettingAssociateAwayLogDeletePageWithProvider;
