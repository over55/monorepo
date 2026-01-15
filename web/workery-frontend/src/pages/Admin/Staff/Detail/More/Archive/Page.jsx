// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Archive/Page.jsx
// UIX Upgraded - Uses EntityActionConfirmationPage whole page component
// @uix-page: AdminStaffDetailMoreArchivePage

import React, { useCallback, useMemo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UsersIcon,
  InformationCircleIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";
import { EntityActionConfirmationPage, UIXThemeProvider, useUIXTheme } from "../../../../../../components/UIX";

function AdminStaffDetailMoreArchivePageContent() {
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
    textSuccess: getThemeClasses('text-success') || 'text-green-600 dark:text-green-400',
    textWarning: getThemeClasses('text-warning') || 'text-amber-600 dark:text-amber-400',
  }), [getThemeClasses]);

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return "N/A";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };

  // Get status display
  const getStatusDisplay = useCallback((status) => {
    if (status === 1) {
      return <span className={`${themeClasses.textSuccess} font-medium`}>Active</span>;
    } else if (status === 2) {
      return <span className={`${themeClasses.textWarning} font-medium`}>Archived</span>;
    }
    return <span className={themeClasses.textMuted}>Unknown</span>;
  }, [themeClasses]);

  // Get role display
  const getRoleDisplay = (role) => {
    switch (role) {
      case 1:
        return "Administrator";
      case 2:
        return "Manager";
      case 3:
        return "Staff";
      default:
        return "Staff Member";
    }
  };

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

  // Execute action function
  const executeAction = useCallback(
    async (entityId, onSuccess, onError, onDone, onUnauthorized) => {
      try {
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
      icon: UsersIcon,
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
      label: "Archive",
      icon: ArchiveBoxIcon,
      isActive: true,
    },
  ];

  // Page configuration
  const pageConfig = {
    title: "Staff Member",
    subtitle: "Archive Staff Member",
    icon: BriefcaseIcon,
    actionIcon: ArchiveBoxIcon,
    loadingText: "Loading staff details...",
  };

  // Warning configuration
  const warningConfig = {
    title: "Archive Staff Member - Are you sure?",
    description: "You are about to archive this staff member. This means:",
    consequences: [
      "The staff member will no longer appear in the active staff list",
      "The staff member will not be able to log in to their account",
      "All current assignments and permissions will be suspended",
      "This action can be undone by contacting a system administrator",
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
              {staff.firstName} {staff.lastName}
            </span>
          </div>
          <div className="flex items-center">
            <span className={`font-medium ${themeClasses.textSecondary} mr-2`}>Status:</span>
            {getStatusDisplay(staff.status)}
          </div>
          <div className="flex items-center">
            <EnvelopeIcon className={`w-4 h-4 mr-2 ${themeClasses.iconMuted}`} />
            <span className={`font-medium ${themeClasses.textSecondary} mr-2`}>Email:</span>
            <span className={themeClasses.textPrimary}>{staff.email}</span>
          </div>
          <div className="flex items-center">
            <PhoneIcon className={`w-4 h-4 mr-2 ${themeClasses.iconMuted}`} />
            <span className={`font-medium ${themeClasses.textSecondary} mr-2`}>Phone:</span>
            <span className={themeClasses.textPrimary}>{formatPhone(staff.phone)}</span>
          </div>
          {staff.role && (
            <div className="flex items-center">
              <BriefcaseIcon className={`w-4 h-4 mr-2 ${themeClasses.iconMuted}`} />
              <span className={`font-medium ${themeClasses.textSecondary} mr-2`}>Role:</span>
              <span className={themeClasses.textPrimary}>{getRoleDisplay(staff.role)}</span>
            </div>
          )}
        </div>
      </div>
    ),
    [themeClasses, getStatusDisplay],
  );

  // Status alerts
  const statusAlerts = [
    {
      condition: (entity) => entity?.status === 2,
      type: "warning",
      message: "This staff member is already archived",
      icon: ArchiveBoxIcon,
    },
  ];

  // Check if action is disabled
  const isActionDisabled = useCallback((entity) => entity?.status === 2, []);

  return (
    <EntityActionConfirmationPage
      entityType="staff member"
      entityId={aid}
      actionType="archive"
      fetchEntity={fetchEntity}
      executeAction={executeAction}
      breadcrumbItems={breadcrumbItems}
      pageConfig={pageConfig}
      renderEntityInfo={renderEntityInfo}
      warningConfig={warningConfig}
      statusAlerts={statusAlerts}
      isActionDisabled={isActionDisabled}
      returnPath={`/admin/staff/${aid}/more`}
      successRedirectPath="/admin/staff"
      successRedirectDelay={2000}
    />
  );
}

function AdminStaffDetailMoreArchivePage() {
  return (
    <UIXThemeProvider>
      <AdminStaffDetailMoreArchivePageContent />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailMoreArchivePage;
