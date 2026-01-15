// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Upgrade/Page.jsx
// UIX Upgraded - Uses EntityActionUpgradePage whole page component
// @uix-page: AdminStaffDetailMoreUpgradePage

import React, { useMemo, useCallback } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  BriefcaseIcon,
  ArrowUpCircleIcon,
  InformationCircleIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";
import { EntityActionUpgradePage, Badge } from "../../../../../../components/UIX";

function AdminStaffDetailMoreUpgradePage() {
  const { aid } = useParams();
  const staffManager = useStaffManager();

  // Fetch entity function
  const fetchEntity = useCallback(
    async (entityId, onUnauthorized) => {
      return await staffManager.getStaffDetail(entityId, onUnauthorized);
    },
    [staffManager],
  );

  // Execute upgrade function
  const executeUpgrade = useCallback(
    async (data, onUnauthorized) => {
      return await staffManager.upgradeStaff(data, onUnauthorized);
    },
    [staffManager],
  );

  // Check if upgrade is disabled (already management level)
  const isUpgradeDisabled = useCallback((entity) => {
    return entity?.roleId === 2 || entity?.type === 2;
  }, []);

  // Get entity display name
  const getEntityDisplayName = useCallback((entity) => {
    return entity ? `${entity.firstName} ${entity.lastName}` : "Unknown";
  }, []);

  // Get current type label
  const getCurrentTypeLabel = useCallback((entity) => {
    if (entity?.type === 2 || entity?.roleId === 2) {
      return "Management Staff";
    }
    return "Frontline Staff";
  }, []);

  // Get current type badge
  const getCurrentTypeBadge = useCallback((entity) => {
    if (entity?.type === 2 || entity?.roleId === 2) {
      return (
        <Badge variant="primary" size="sm">
          Management Staff
        </Badge>
      );
    }
    return (
      <Badge variant="success" size="sm">
        Frontline Staff
      </Badge>
    );
  }, []);

  // Format upgrade data
  const formatUpgradeData = useCallback((entityId, formData) => {
    return {
      staff_id: entityId,
      ...formData,
    };
  }, []);

  // Breadcrumb items
  const breadcrumbItems = useCallback((entityId) => [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon,
    },
    {
      label: "Staff",
      to: "/admin/staff",
      icon: BriefcaseIcon,
    },
    {
      label: "Detail",
      to: `/admin/staff/${entityId}`,
      icon: InformationCircleIcon,
    },
    {
      label: "More",
      to: `/admin/staff/${entityId}/more`,
      icon: CogIcon,
    },
    {
      label: "Upgrade",
      icon: ArrowUpCircleIcon,
      isActive: true,
    },
  ], []);

  // Render custom entity info
  const renderEntityInfo = useCallback((entity, themeClasses, getCurrentTypeBadgeFn) => {
    const bgMuted = themeClasses?.bgMuted || 'bg-gray-50 dark:bg-gray-800';
    const textPrimary = themeClasses?.textPrimary || 'text-gray-900 dark:text-gray-100';
    const textMuted = themeClasses?.textMuted || 'text-gray-500 dark:text-gray-400';
    const textSuccess = themeClasses?.textSuccess || 'text-green-600 dark:text-green-400';
    const textInfo = themeClasses?.textInfo || 'text-blue-600 dark:text-blue-400';

    return (
      <div className={`${bgMuted} rounded-lg p-4 mb-6`}>
        <h4 className={`text-sm font-medium ${textPrimary} mb-3`}>
          Current Staff Information
        </h4>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
          <div>
            <dt className={`text-sm font-medium ${textMuted}`}>Name:</dt>
            <dd className={`text-sm ${textPrimary}`}>
              {entity?.firstName} {entity?.lastName}
            </dd>
          </div>
          <div>
            <dt className={`text-sm font-medium ${textMuted}`}>Email:</dt>
            <dd className={`text-sm ${textPrimary}`}>{entity?.email}</dd>
          </div>
          <div>
            <dt className={`text-sm font-medium ${textMuted}`}>Current Role:</dt>
            <dd className="text-sm">
              <span className={`${textSuccess} font-medium`}>Frontline Staff</span>
            </dd>
          </div>
          <div>
            <dt className={`text-sm font-medium ${textMuted}`}>New Role:</dt>
            <dd className="text-sm">
              <span className={`${textInfo} font-medium`}>Management Staff</span>
            </dd>
          </div>
        </dl>
      </div>
    );
  }, []);

  // Configuration
  const config = useMemo(() => ({
    entityType: "Staff Member",
    entityIdParam: "aid",
    entityIcon: BriefcaseIcon,
    fetchEntity,
    executeUpgrade,
    isUpgradeDisabled,
    disabledMessage: "This staff member is already at Management level. No upgrade is needed.",
    getEntityDisplayName,
    getCurrentTypeLabel,
    getCurrentTypeBadge,
    renderEntityInfo,
    formFields: [], // No additional form fields required for upgrade
    formatUpgradeData,
    breadcrumbItems,
    warningConfig: {
      title: "Upgrade Warning",
      description: "You are about to upgrade this staff member from Frontline Staff type to Management.",
      consequences: [
        "The permission system of this user",
        "Access to administrative functions",
        "Ability to manage other staff members",
        "Reporting and analytics access",
        "System configuration privileges",
      ],
      notice: "Please ensure this upgrade is authorized before proceeding.",
    },
    impactConfig: {
      title: "After Upgrade",
      items: [
        "Full access to administrative dashboard",
        "Ability to manage staff accounts and permissions",
        "Access to all system reports and analytics",
        "Can approve and manage work orders",
        "System configuration and settings access",
      ],
    },
    routes: {
      returnPath: `/admin/staff/${aid}/more`,
      successRedirectPath: `/admin/staff/${aid}/more`,
    },
    labels: {
      pageTitle: "Upgrade Staff Member",
      pageSubtitle: "Upgrade to Management Level",
      confirmTitle: "Confirm Upgrade",
      successMessage: "Staff member has been successfully upgraded to Management level",
      actionButtonLabel: "Confirm and Upgrade",
      processingLabel: "Processing...",
    },
  }), [
    aid,
    fetchEntity,
    executeUpgrade,
    isUpgradeDisabled,
    getEntityDisplayName,
    getCurrentTypeLabel,
    getCurrentTypeBadge,
    renderEntityInfo,
    formatUpgradeData,
    breadcrumbItems,
  ]);

  return <EntityActionUpgradePage config={config} />;
}

export default AdminStaffDetailMoreUpgradePage;
