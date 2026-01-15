// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Upgrade/Page.jsx
// UIX Upgraded - Uses EntityActionUpgradePage whole page component
// @uix-page: AdminAssociateDetailMoreUpgradePage

import React, { useMemo, useCallback } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  ArrowUpCircleIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useAssociateManager } from "../../../../../../services/Services";
import { EntityActionUpgradePage, Badge } from "../../../../../../components/UIX";

// Constants
const ASSOCIATE_TYPE_RESIDENTIAL = 2;
const ASSOCIATE_TYPE_COMMERCIAL = 3;

function AdminAssociateDetailMoreUpgradePage() {
  const { aid } = useParams();
  const associateManager = useAssociateManager();

  // Fetch entity function
  const fetchEntity = useCallback(
    async (entityId, onUnauthorized) => {
      return await associateManager.getAssociateDetail(entityId, onUnauthorized);
    },
    [associateManager],
  );

  // Execute upgrade function
  const executeUpgrade = useCallback(
    async (data, onUnauthorized) => {
      return await associateManager.upgradeAssociate(data, onUnauthorized);
    },
    [associateManager],
  );

  // Check if upgrade is disabled (already commercial type)
  const isUpgradeDisabled = useCallback((entity) => {
    return entity?.type === ASSOCIATE_TYPE_COMMERCIAL;
  }, []);

  // Get entity display name
  const getEntityDisplayName = useCallback((entity) => {
    return entity ? `${entity.firstName} ${entity.lastName}` : "Unknown";
  }, []);

  // Get current type label
  const getCurrentTypeLabel = useCallback((entity) => {
    if (entity?.type === ASSOCIATE_TYPE_COMMERCIAL) {
      return "Commercial Associate";
    }
    return "Residential Associate";
  }, []);

  // Get current type badge
  const getCurrentTypeBadge = useCallback((entity) => {
    if (entity?.type === ASSOCIATE_TYPE_COMMERCIAL) {
      return (
        <Badge variant="primary" size="sm">
          Commercial Associate
        </Badge>
      );
    }
    return (
      <Badge variant="success" size="sm">
        Residential Associate
      </Badge>
    );
  }, []);

  // Format upgrade data
  const formatUpgradeData = useCallback((entityId, formData) => {
    return {
      associate_id: entityId,
      ...formData,
    };
  }, []);

  // Breadcrumb items
  const breadcrumbItems = useCallback((entityId) => [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Associates", to: "/admin/associates", icon: UserGroupIcon },
    { label: "Detail", to: `/admin/associate/${entityId}`, icon: InformationCircleIcon },
    { label: "More", to: `/admin/associate/${entityId}/more`, icon: EllipsisHorizontalIcon },
    { label: "Upgrade", icon: ArrowUpCircleIcon, isActive: true },
  ], []);

  // Render custom entity info
  const renderEntityInfo = useCallback((entity, themeClasses, getCurrentTypeBadgeFn) => (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h4 className="text-sm font-medium text-gray-900 mb-3">
        Current Associate Information
      </h4>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-gray-500">Name:</dt>
          <dd className="text-sm text-gray-900">
            {entity?.firstName} {entity?.lastName}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Email:</dt>
          <dd className="text-sm text-gray-900">{entity?.email}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Current Type:</dt>
          <dd className="text-sm">
            <span className="text-green-600 font-medium">Residential</span>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">New Type:</dt>
          <dd className="text-sm">
            <span className="text-blue-600 font-medium">Commercial</span>
          </dd>
        </div>
      </dl>
    </div>
  ), []);

  // Configuration
  const config = useMemo(() => ({
    entityType: "Associate",
    entityIdParam: "aid",
    entityIcon: UserGroupIcon,
    fetchEntity,
    executeUpgrade,
    isUpgradeDisabled,
    disabledMessage: "This associate is already at Commercial level. No upgrade is needed.",
    getEntityDisplayName,
    getCurrentTypeLabel,
    getCurrentTypeBadge,
    renderEntityInfo,
    formFields: [],
    formatUpgradeData,
    breadcrumbItems,
    warningConfig: {
      title: "Upgrade Warning",
      description: "You are about to upgrade this associate from Residential to Commercial type.",
      consequences: [
        "The associate type classification",
        "Access to commercial-only features",
        "Billing and rate structure",
        "Available job types and assignments",
      ],
      notice: "Please ensure this upgrade is authorized before proceeding.",
    },
    impactConfig: {
      title: "After Upgrade",
      items: [
        "Associate will be classified as Commercial",
        "Can receive commercial work orders",
        "Different rate structure may apply",
        "Access to commercial client assignments",
      ],
    },
    routes: {
      returnPath: `/admin/associate/${aid}/more`,
      successRedirectPath: `/admin/associate/${aid}/more`,
    },
    labels: {
      pageTitle: "Upgrade Associate",
      pageSubtitle: "Upgrade to Commercial Type",
      confirmTitle: "Confirm Upgrade",
      successMessage: "Associate has been successfully upgraded to Commercial type",
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

export default AdminAssociateDetailMoreUpgradePage;
