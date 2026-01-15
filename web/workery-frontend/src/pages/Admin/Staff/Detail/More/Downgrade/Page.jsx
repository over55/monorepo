// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Downgrade/Page.jsx
// UIX Upgraded - Uses EntityActionDowngradePage whole page component
// @uix-page: AdminStaffDetailMoreDowngradePage

import React, { useMemo, useCallback } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  BriefcaseIcon,
  ArrowDownCircleIcon,
  InformationCircleIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";
import { EntityActionDowngradePage, Badge } from "../../../../../../components/UIX";

function AdminStaffDetailMoreDowngradePage() {
  const { aid } = useParams();
  const staffManager = useStaffManager();

  // Fetch entity function
  const fetchEntity = useCallback(
    async (entityId, onUnauthorized) => {
      return await staffManager.getStaffDetail(entityId, onUnauthorized);
    },
    [staffManager],
  );

  // Execute downgrade function
  const executeDowngrade = useCallback(
    async (entityId, onUnauthorized) => {
      return await staffManager.downgradeStaff(entityId, onUnauthorized);
    },
    [staffManager],
  );

  // Check if downgrade is disabled (already frontline level)
  const isDowngradeDisabled = useCallback((entity) => {
    // roleId 2 = Management, roleId 3 = Frontline
    // Only allow downgrade if currently Management
    return entity?.roleId !== 2 && entity?.type !== 2;
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

  // Render custom entity info
  const renderEntityInfo = useCallback((entity, themeClasses, getCurrentTypeBadgeFn) => {
    const bgMuted = themeClasses?.bgMuted || 'bg-gray-50 dark:bg-gray-800';
    const textPrimary = themeClasses?.textPrimary || 'text-gray-900 dark:text-gray-100';
    const textMuted = themeClasses?.textMuted || 'text-gray-500 dark:text-gray-400';
    const textInfo = themeClasses?.textInfo || 'text-blue-600 dark:text-blue-400';
    const textSuccess = themeClasses?.textSuccess || 'text-green-600 dark:text-green-400';

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
              <span className={`${textInfo} font-medium`}>Management Staff</span>
            </dd>
          </div>
          <div>
            <dt className={`text-sm font-medium ${textMuted}`}>New Role:</dt>
            <dd className="text-sm">
              <span className={`${textSuccess} font-medium`}>Frontline Staff</span>
            </dd>
          </div>
        </dl>
      </div>
    );
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
      label: "Downgrade",
      icon: ArrowDownCircleIcon,
      isActive: true,
    },
  ], []);

  // Configuration
  const config = useMemo(() => ({
    entityType: "Staff Member",
    entityIdParam: "aid",
    entityIcon: BriefcaseIcon,
    fetchEntity,
    executeDowngrade,
    isDowngradeDisabled,
    disabledMessage: "This staff member is not currently a Management type account. No downgrade is needed.",
    getEntityDisplayName,
    getCurrentTypeLabel,
    getCurrentTypeBadge,
    renderEntityInfo,
    breadcrumbItems,
    warningConfig: {
      title: "Downgrade Warning",
      description: "You are about to downgrade this staff member from Management type to Frontline Staff.",
      consequences: [
        "Access to administrative functions and reports",
        "Permission to manage other staff members",
        "Authority to approve work orders and invoices",
        "Access to sensitive customer and financial data",
        "System administration privileges",
      ],
      confirmationText: "Are you sure you want to continue?",
    },
    impactConfig: {
      title: "After Downgrade",
      items: [
        "Will only have access to basic operational functions",
        "Cannot access administrative reports or analytics",
        "Will lose ability to manage other staff accounts",
        "Cannot approve financial transactions or work orders",
        "Limited to frontline operational tasks only",
      ],
    },
    routes: {
      returnPath: `/admin/staff/${aid}/more`,
      successRedirectPath: `/admin/staff/${aid}/more`,
    },
    labels: {
      pageTitle: "Downgrade Staff Member",
      pageSubtitle: "Downgrade to Frontline Staff",
      confirmTitle: "Confirm Downgrade",
      successMessage: "Staff member has been successfully downgraded to Frontline Staff",
      actionButtonLabel: "Confirm and Downgrade",
      processingLabel: "Processing...",
    },
  }), [
    aid,
    fetchEntity,
    executeDowngrade,
    isDowngradeDisabled,
    getEntityDisplayName,
    getCurrentTypeLabel,
    getCurrentTypeBadge,
    renderEntityInfo,
    breadcrumbItems,
  ]);

  return <EntityActionDowngradePage config={config} />;
}

export default AdminStaffDetailMoreDowngradePage;
