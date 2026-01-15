// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Delete/Page.jsx
// UIX Upgraded - Uses EntityActionConfirmationPage whole page component
// @uix-page: AdminStaffDetailMoreDeletePage

import React, { useCallback, useMemo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UsersIcon,
  InformationCircleIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";
import { EntityActionConfirmationPage, UIXThemeProvider, useUIXTheme } from "../../../../../../components/UIX";

function AdminStaffDetailMoreDeletePageContent() {
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
        await staffManager.permanentlyDeleteStaff(entityId, onUnauthorized);
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
      label: "Delete",
      icon: TrashIcon,
      isActive: true,
    },
  ];

  // Page configuration
  const pageConfig = {
    title: "Staff Member",
    subtitle: "Permanently Delete Staff Member",
    icon: BriefcaseIcon,
    actionIcon: TrashIcon,
    loadingText: "Loading staff details...",
  };

  // Warning configuration - more severe for permanent delete
  const warningConfig = {
    title: "Delete Staff Member - Critical Action Warning",
    description: "You are about to permanently delete this staff member. THIS IS A PERMANENT ACTION:",
    consequences: [
      "All staff data will be permanently removed from the database",
      "All related records, work assignments, and history will be affected",
      "The staff member's account will be completely erased",
      "This action CANNOT be undone without database restoration",
      "Recovery will require system administrator intervention and may not be possible",
    ],
    confirmationText: "Are you absolutely certain you want to permanently delete this staff member?",
    warningType: "red",
  };

  // Render entity information
  const renderEntityInfo = useCallback(
    (staff) => (
      <div className={`${themeClasses.bgMuted} rounded-lg p-6 mb-6`}>
        <h4 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4 flex items-center`}>
          <UserIcon className={`w-5 h-5 mr-2 ${themeClasses.iconSecondary}`} />
          Staff Information to be Deleted
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
          {staff.joinDate && (
            <div className="flex items-center">
              <span className={`font-medium ${themeClasses.textSecondary} mr-2`}>Join Date:</span>
              <span className={themeClasses.textPrimary}>{staff.joinDate}</span>
            </div>
          )}
        </div>
      </div>
    ),
    [themeClasses, getStatusDisplay],
  );

  // No status alerts for delete - always allowed
  const statusAlerts = [];

  // Delete is always enabled (no isActionDisabled check)
  const isActionDisabled = useCallback(() => false, []);

  return (
    <EntityActionConfirmationPage
      entityType="staff member"
      entityId={aid}
      actionType="delete"
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

function AdminStaffDetailMoreDeletePage() {
  return (
    <UIXThemeProvider>
      <AdminStaffDetailMoreDeletePageContent />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailMoreDeletePage;
