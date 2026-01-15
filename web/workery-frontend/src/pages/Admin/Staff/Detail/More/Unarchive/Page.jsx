// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Unarchive/Page.jsx
// UIX Upgraded - Uses EntityActionConfirmationPage whole page component
// @uix-page: AdminStaffDetailMoreUnarchivePage

import React, { useCallback, useMemo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  ArchiveBoxXMarkIcon,
  ExclamationTriangleIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";
import { EntityActionConfirmationPage, UIXThemeProvider, useUIXTheme } from "../../../../../../components/UIX";

function AdminStaffDetailMoreUnarchivePageContent() {
  const { aid } = useParams();
  const staffManager = useStaffManager();
  const { getThemeClasses } = useUIXTheme();

  // Memoized theme classes
  const themeClasses = useMemo(() => ({
    bgMuted: getThemeClasses('bg-muted') || 'bg-gray-50 dark:bg-gray-800',
    textPrimary: getThemeClasses('text-primary') || 'text-gray-900 dark:text-gray-100',
    textSecondary: getThemeClasses('text-secondary') || 'text-gray-700 dark:text-gray-300',
    textMuted: getThemeClasses('text-muted') || 'text-gray-500 dark:text-gray-400',
    iconMuted: getThemeClasses('icon-muted') || 'text-gray-400 dark:text-gray-500',
    iconSecondary: getThemeClasses('icon-secondary') || 'text-gray-600 dark:text-gray-400',
    badgeBg: getThemeClasses('badge-bg') || 'bg-gray-100 dark:bg-gray-700',
    badgeText: getThemeClasses('badge-text') || 'text-gray-800 dark:text-gray-200',
  }), [getThemeClasses]);

  // Fetch entity function
  const fetchEntity = useCallback(
    async (entityId, onSuccess, onError, onDone, onUnauthorized) => {
      try {
        const data = await staffManager.getStaffDetail(entityId, onUnauthorized);
        onSuccess(data);
      } catch (error) {
        onError(error);
      } finally {
        onDone();
      }
    },
    [staffManager],
  );

  // Execute action function (unarchive)
  const executeAction = useCallback(
    async (entityId, onSuccess, onError, onDone, onUnauthorized) => {
      try {
        // Note: The archive/unarchive endpoint toggles the status
        await staffManager.archiveStaff(entityId, onUnauthorized);
        onSuccess();
      } catch (error) {
        onError(error);
      } finally {
        onDone();
      }
    },
    [staffManager],
  );

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon,
    },
    {
      label: "Staff",
      to: "/admin/staff",
      icon: UserIcon,
    },
    {
      label: "Detail",
      to: `/admin/staff/${aid}`,
      icon: InformationCircleIcon,
    },
    {
      label: "More",
      to: `/admin/staff/${aid}/more`,
      icon: EllipsisHorizontalIcon,
    },
    {
      label: "Unarchive",
      icon: ArchiveBoxXMarkIcon,
      isActive: true,
    },
  ];

  // Page configuration
  const pageConfig = {
    title: "Unarchive Staff Member",
    subtitle: "Restore this staff member from archive",
    icon: ArchiveBoxXMarkIcon,
    actionIcon: ArchiveBoxXMarkIcon,
    loadingText: "Loading staff details...",
  };

  // Warning configuration
  const warningConfig = {
    title: "Unarchive Staff Member - Are you sure?",
    description: "You are about to unarchive this staff member. This means:",
    consequences: [
      "This staff member will become active again",
      "They will be able to access the system",
      "They will appear in active staff searches",
      "All previous settings and permissions will be restored",
    ],
    confirmationText: "Are you sure you would like to continue?",
    warningType: "amber",
  };

  // Render entity information
  const renderEntityInfo = useCallback(
    (staff) => (
      <div className={`${themeClasses.bgMuted} rounded-lg p-6 mb-6`}>
        <h4 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4 flex items-center`}>
          <UserIcon className={`w-5 h-5 mr-2 ${themeClasses.iconSecondary}`} />
          Staff Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <span className={`font-medium ${themeClasses.textSecondary} mr-2`}>Name:</span>
            <span className={themeClasses.textPrimary}>
              {staff.name || `${staff.firstName} ${staff.lastName}`}
            </span>
          </div>
          <div className="flex items-center">
            <span className={`font-medium ${themeClasses.textSecondary} mr-2`}>Current Status:</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${themeClasses.badgeBg} ${themeClasses.badgeText}`}>
              <ArchiveBoxXMarkIcon className="w-3 h-3 mr-1" />
              Archived
            </span>
          </div>
          <div className="flex items-center">
            <EnvelopeIcon className={`w-4 h-4 mr-2 ${themeClasses.iconMuted}`} />
            <span className={`font-medium ${themeClasses.textSecondary} mr-2`}>Email:</span>
            <span className={themeClasses.textPrimary}>{staff.email || "-"}</span>
          </div>
          <div className="flex items-center">
            <PhoneIcon className={`w-4 h-4 mr-2 ${themeClasses.iconMuted}`} />
            <span className={`font-medium ${themeClasses.textSecondary} mr-2`}>Phone:</span>
            <span className={themeClasses.textPrimary}>{staff.phone || "-"}</span>
          </div>
        </div>
      </div>
    ),
    [themeClasses],
  );

  // Status alerts
  const statusAlerts = [
    {
      condition: (entity) => entity?.status !== 2,
      type: "warning",
      message: "This staff member is not archived and cannot be unarchived.",
      icon: ExclamationTriangleIcon,
    },
  ];

  // Check if action is disabled (only allow if staff is archived - status 2)
  const isActionDisabled = useCallback((entity) => entity?.status !== 2, []);

  return (
    <EntityActionConfirmationPage
      entityType="staff member"
      entityId={aid}
      actionType="unarchive"
      fetchEntity={fetchEntity}
      executeAction={executeAction}
      breadcrumbItems={breadcrumbItems}
      pageConfig={pageConfig}
      renderEntityInfo={renderEntityInfo}
      warningConfig={warningConfig}
      statusAlerts={statusAlerts}
      isActionDisabled={isActionDisabled}
      returnPath={`/admin/staff/${aid}/more`}
      successRedirectPath={`/admin/staff/${aid}/detail`}
      successRedirectDelay={2000}
    />
  );
}

function AdminStaffDetailMoreUnarchivePage() {
  return (
    <UIXThemeProvider>
      <AdminStaffDetailMoreUnarchivePageContent />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailMoreUnarchivePage;
