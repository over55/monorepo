// File: monorepo/web/frontend/src/components/business/views/EntityActionUnbanPage.jsx

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { EntityActionConfirmationPage, UIXThemeProvider } from "../../UIX";

/**
 * EntityActionUnbanPage
 *
 * A pre-configured wrapper around EntityActionConfirmationPage for unban actions.
 * Provides sensible defaults for unbanning entities while allowing customization.
 *
 * @param {Object} props
 * @param {string} props.entityType - Display name of entity (e.g., "Speaker", "Customer")
 * @param {string} props.entityTypePlural - Plural form (e.g., "Speakers", "Customers")
 * @param {string} props.basePath - Base URL path (e.g., "/admin/speaker")
 * @param {string} props.listPath - Path to entity list (defaults to basePath + "s")
 * @param {string} props.entityParamName - URL param name for entity ID (default: "aid")
 * @param {React.Component} props.entityIcon - Icon component for the entity type
 * @param {Function} props.fetchEntity - Function to fetch entity: (id, onSuccess, onError, onDone, onUnauthorized) => void
 * @param {Function} props.executeUnban - Function to execute unban: (id, onSuccess, onError, onDone, onUnauthorized) => void
 * @param {Function} props.renderEntityInfo - Optional custom entity info renderer: (entity) => ReactNode
 * @param {Array} props.consequences - Optional custom consequences array (uses defaults if not provided)
 * @param {string} props.successRedirectPath - Path to redirect after success (defaults to more page)
 */
const EntityActionUnbanPage = memo(function EntityActionUnbanPage({
  entityType,
  entityTypePlural,
  basePath,
  listPath,
  entityParamName = "aid",
  entityIcon,
  fetchEntity,
  executeUnban,
  renderEntityInfo,
  consequences,
  successRedirectPath,
}) {
  // Get entity ID from URL params
  const params = useParams();
  const entityId = params[entityParamName];

  // Compute list path
  const computedListPath = useMemo(() => {
    return listPath || `${basePath}s`;
  }, [listPath, basePath]);

  // Default consequences for unbanning
  const defaultConsequences = useMemo(() => [
    `The ${entityType.toLowerCase()} will have their ban removed`,
    `They will be able to log in and access their account again`,
    `The ${entityType.toLowerCase()} will appear as active in the system`,
    "All previous ban restrictions will be lifted",
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
      label: "Unban",
      icon: CheckCircleIcon,
      isActive: true,
    },
  ], [entityTypePlural, entityIcon, basePath, entityId, computedListPath]);

  // Page configuration
  const pageConfig = useMemo(() => ({
    title: entityType,
    subtitle: `Unban ${entityType}`,
    icon: entityIcon,
    actionIcon: CheckCircleIcon,
    loadingText: `Loading ${entityType.toLowerCase()} details...`,
  }), [entityType, entityIcon]);

  // Warning configuration - using amber for unban (less severe)
  const warningConfig = useMemo(() => ({
    title: `Unban ${entityType} - Are you sure?`,
    description: `You are about to unban this ${entityType.toLowerCase()}. This means:`,
    consequences: consequences || defaultConsequences,
    confirmationText: "Are you sure you would like to continue?",
    warningType: "amber",
  }), [entityType, consequences, defaultConsequences]);

  // Status alerts - show message if not banned
  const statusAlerts = useMemo(() => [
    {
      condition: (entity) => !entity?.isBanned,
      type: "info",
      message: `${entityType} is not currently banned`,
      icon: InformationCircleIcon,
    },
  ], [entityType]);

  // Check if action should be disabled
  const isActionDisabled = useCallback((entity) => {
    return !entity?.isBanned;
  }, []);

  // Compute paths
  const returnPath = useMemo(() => `${basePath}/${entityId}/more`, [basePath, entityId]);
  const computedSuccessRedirectPath = useMemo(() => {
    return successRedirectPath || returnPath;
  }, [successRedirectPath, returnPath]);

  return (
    <UIXThemeProvider>
      <EntityActionConfirmationPage
        entityType={entityType.toLowerCase()}
        entityId={entityId}
        actionType="unban"
        fetchEntity={fetchEntity}
        executeAction={executeUnban}
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

EntityActionUnbanPage.displayName = "EntityActionUnbanPage";

export default EntityActionUnbanPage;
