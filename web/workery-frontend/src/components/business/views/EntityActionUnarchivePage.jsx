// File: monorepo/web/frontend/src/components/business/views/EntityActionUnarchivePage.jsx

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  ArchiveBoxXMarkIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { EntityActionConfirmationPage, UIXThemeProvider } from "../../UIX";

/**
 * EntityActionUnarchivePage
 *
 * A pre-configured wrapper around EntityActionConfirmationPage for unarchive actions.
 * Provides sensible defaults for unarchiving entities while allowing customization.
 *
 * @param {Object} props
 * @param {string} props.entityType - Display name of entity (e.g., "Speaker", "Customer")
 * @param {string} props.entityTypePlural - Plural form (e.g., "Speakers", "Customers")
 * @param {string} props.basePath - Base URL path (e.g., "/admin/speaker")
 * @param {string} props.listPath - Path to entity list (defaults to basePath + "s")
 * @param {string} props.entityParamName - URL param name for entity ID (default: "aid")
 * @param {React.Component} props.entityIcon - Icon component for the entity type
 * @param {Function} props.fetchEntity - Function to fetch entity: (id, onSuccess, onError, onDone, onUnauthorized) => void
 * @param {Function} props.executeUnarchive - Function to execute unarchive: (id, onSuccess, onError, onDone, onUnauthorized) => void
 * @param {Function} props.renderEntityInfo - Optional custom entity info renderer: (entity) => ReactNode
 * @param {Array} props.consequences - Optional custom consequences array (uses defaults if not provided)
 * @param {number} props.activeStatus - Status value indicating active (default: 1)
 * @param {string} props.successRedirectPath - Path to redirect after success (defaults to listPath)
 */
const EntityActionUnarchivePage = memo(function EntityActionUnarchivePage({
  entityType,
  entityTypePlural,
  basePath,
  listPath,
  entityParamName = "aid",
  entityIcon,
  fetchEntity,
  executeUnarchive,
  renderEntityInfo,
  consequences,
  activeStatus = 1,
  successRedirectPath,
}) {
  // Get entity ID from URL params
  const params = useParams();
  const entityId = params[entityParamName];

  // Compute list path
  const computedListPath = useMemo(() => {
    return listPath || `${basePath}s`;
  }, [listPath, basePath]);

  // Default consequences for unarchiving
  const defaultConsequences = useMemo(() => [
    `The ${entityType.toLowerCase()} will become active again`,
    `They will be able to log in to their account`,
    `The ${entityType.toLowerCase()} will appear in active lists`,
    "All previous settings and data will be restored",
  ], [entityType]);

  // Build breadcrumb items
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon,
    },
    {
      label: entityTypePlural,
      to: computedListPath,
      icon: entityIcon,
    },
    {
      label: "Detail",
      to: `${basePath}/${entityId}`,
      icon: InformationCircleIcon,
    },
    {
      label: "More",
      to: `${basePath}/${entityId}/more`,
      icon: EllipsisHorizontalIcon,
    },
    {
      label: "Unarchive",
      icon: ArchiveBoxXMarkIcon,
      isActive: true,
    },
  ], [entityTypePlural, entityIcon, basePath, entityId, computedListPath]);

  // Page configuration
  const pageConfig = useMemo(() => ({
    title: entityType,
    subtitle: `Unarchive ${entityType}`,
    icon: entityIcon,
    actionIcon: ArchiveBoxXMarkIcon,
    loadingText: `Loading ${entityType.toLowerCase()} details...`,
  }), [entityType, entityIcon]);

  // Warning configuration
  const warningConfig = useMemo(() => ({
    title: `Unarchive ${entityType} - Are you sure?`,
    description: `You are about to unarchive this ${entityType.toLowerCase()}. This means:`,
    consequences: consequences || defaultConsequences,
    confirmationText: "Are you sure you would like to continue?",
    warningType: "amber",
  }), [entityType, consequences, defaultConsequences]);

  // Status alerts - show message if already active
  const statusAlerts = useMemo(() => [
    {
      condition: (entity) => entity?.status === activeStatus,
      type: "info",
      message: `${entityType} is already active`,
      icon: InformationCircleIcon,
    },
  ], [entityType, activeStatus]);

  // Check if action should be disabled
  const isActionDisabled = useCallback((entity) => {
    return entity?.status === activeStatus;
  }, [activeStatus]);

  // Compute paths
  const returnPath = useMemo(() => `${basePath}/${entityId}/more`, [basePath, entityId]);
  const computedSuccessRedirectPath = useMemo(() => {
    return successRedirectPath || computedListPath;
  }, [successRedirectPath, computedListPath]);

  return (
    <UIXThemeProvider>
      <EntityActionConfirmationPage
        entityType={entityType.toLowerCase()}
        entityId={entityId}
        actionType="unarchive"
        fetchEntity={fetchEntity}
        executeAction={executeUnarchive}
        breadcrumbItems={breadcrumbItems}
        pageConfig={pageConfig}
        renderEntityInfo={renderEntityInfo}
        warningConfig={warningConfig}
        statusAlerts={statusAlerts}
        isActionDisabled={isActionDisabled}
        returnPath={returnPath}
        successRedirectPath={computedSuccessRedirectPath}
        successRedirectDelay={2000}
      />
    </UIXThemeProvider>
  );
});

EntityActionUnarchivePage.displayName = "EntityActionUnarchivePage";

export default EntityActionUnarchivePage;
