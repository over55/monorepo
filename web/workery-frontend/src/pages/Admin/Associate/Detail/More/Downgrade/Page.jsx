// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Downgrade/Page.jsx
// UIX Upgraded - Uses EntityActionDowngradePage whole page component
// @uix-page: AdminAssociateDetailMoreDowngradePage

import React, { useMemo, useCallback } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  ArrowDownCircleIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useAssociateManager } from "../../../../../../services/Services";
import { EntityActionDowngradePage, Badge } from "../../../../../../components/UIX";

// Constants
const ASSOCIATE_TYPE_RESIDENTIAL = 2;
const ASSOCIATE_TYPE_COMMERCIAL = 3;

function AdminAssociateDetailMoreDowngradePage() {
  const { aid } = useParams();
  const associateManager = useAssociateManager();

  // Fetch entity function
  const fetchEntity = useCallback(
    async (entityId, onUnauthorized) => {
      return await associateManager.getAssociateDetail(entityId, onUnauthorized);
    },
    [associateManager],
  );

  // Execute downgrade function
  const executeDowngrade = useCallback(
    async (data, onUnauthorized) => {
      return await associateManager.downgradeAssociate(data, onUnauthorized);
    },
    [associateManager],
  );

  // Check if downgrade is disabled (already residential type)
  const isDowngradeDisabled = useCallback((entity) => {
    return entity?.type === ASSOCIATE_TYPE_RESIDENTIAL;
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

  // Format downgrade data
  const formatDowngradeData = useCallback((entityId, formData) => {
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
    { label: "Downgrade", icon: ArrowDownCircleIcon, isActive: true },
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
            <span className="text-blue-600 font-medium">Commercial</span>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">New Type:</dt>
          <dd className="text-sm">
            <span className="text-green-600 font-medium">Residential</span>
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
    executeDowngrade,
    isDowngradeDisabled,
    disabledMessage: "This associate is already at Residential level. No downgrade is needed.",
    getEntityDisplayName,
    getCurrentTypeLabel,
    getCurrentTypeBadge,
    renderEntityInfo,
    formFields: [],
    formatDowngradeData,
    breadcrumbItems,
    warningConfig: {
      title: "Downgrade Warning",
      description: "You are about to downgrade this associate from Commercial to Residential type.",
      consequences: [
        "The associate type classification will change",
        "Access to commercial-only features will be removed",
        "Billing and rate structure may change",
        "Available job types and assignments will be limited",
      ],
      notice: "Please ensure this downgrade is authorized before proceeding.",
    },
    impactConfig: {
      title: "After Downgrade",
      items: [
        "Associate will be classified as Residential",
        "Will only receive residential work orders",
        "Different rate structure may apply",
        "Limited to residential client assignments",
      ],
    },
    routes: {
      returnPath: `/admin/associate/${aid}/more`,
      successRedirectPath: `/admin/associate/${aid}/more`,
    },
    labels: {
      pageTitle: "Downgrade Associate",
      pageSubtitle: "Downgrade to Residential Type",
      confirmTitle: "Confirm Downgrade",
      successMessage: "Associate has been successfully downgraded to Residential type",
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
    formatDowngradeData,
    breadcrumbItems,
  ]);

  return <EntityActionDowngradePage config={config} />;
}

export default AdminAssociateDetailMoreDowngradePage;
