// File: monorepo/web/frontend/src/components/business/views/EntityActionArchivePage.jsx

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  ArchiveBoxIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { EntityActionConfirmationPage, UIXThemeProvider } from "../../UIX";

/**
 * EntityActionArchivePage
 *
 * A pre-configured wrapper around EntityActionConfirmationPage for archive actions.
 * Provides sensible defaults for archiving entities while allowing customization.
 *
 * @param {Object} props
 * @param {string} props.entityType - Display name of entity (e.g., "Speaker", "Customer")
 * @param {string} props.entityTypePlural - Plural form (e.g., "Speakers", "Customers")
 * @param {string} props.basePath - Base URL path (e.g., "/admin/speaker")
 * @param {string} props.listPath - Path to entity list (defaults to basePath + "s")
 * @param {string} props.entityParamName - URL param name for entity ID (default: "aid")
 * @param {React.Component} props.entityIcon - Icon component for the entity type
 * @param {Function} props.fetchEntity - Function to fetch entity: (id, onSuccess, onError, onDone, onUnauthorized) => void
 * @param {Function} props.executeArchive - Function to execute archive: (id, onSuccess, onError, onDone, onUnauthorized) => void
 * @param {Function} props.renderEntityInfo - Optional custom entity info renderer: (entity) => ReactNode
 * @param {Array} props.consequences - Optional custom consequences array (uses defaults if not provided)
 * @param {number} props.archivedStatus - Status value indicating archived (default: 2)
 * @param {string} props.successRedirectPath - Path to redirect after success (defaults to listPath)
 */
const EntityActionArchivePage = memo(function EntityActionArchivePage({
  entityType,
  entityTypePlural,
  basePath,
  listPath,
  entityParamName = "aid",
  entityIcon,
  fetchEntity,
  executeArchive,
  renderEntityInfo,
  consequences,
  archivedStatus = 2,
  successRedirectPath,
}) {
  // Get entity ID from URL params
  const params = useParams();
  const entityId = params[entityParamName];

  // Compute list path
  const computedListPath = useMemo(() => {
    return listPath || `${basePath}s`;
  }, [listPath, basePath]);

  // Default consequences for archiving
  const defaultConsequences = useMemo(() => [
    `The ${entityType.toLowerCase()} will no longer appear in active lists`,
    `The ${entityType.toLowerCase()} will not be able to log in to their account`,
    `All current data and history will remain but no new activity can occur`,
    "This action can be undone by unarchiving the record",
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
      label: "Archive",
      icon: ArchiveBoxIcon,
      isActive: true,
    },
  ], [entityTypePlural, entityIcon, basePath, entityId, computedListPath]);

  // Page configuration
  const pageConfig = useMemo(() => ({
    title: entityType,
    subtitle: `Archive ${entityType}`,
    icon: entityIcon,
    actionIcon: ArchiveBoxIcon,
    loadingText: `Loading ${entityType.toLowerCase()} details...`,
  }), [entityType, entityIcon]);

  // Warning configuration
  const warningConfig = useMemo(() => ({
    title: `Archive ${entityType} - Are you sure?`,
    description: `You are about to archive this ${entityType.toLowerCase()}. This means:`,
    consequences: consequences || defaultConsequences,
    confirmationText: "Are you sure you would like to continue?",
    warningType: "amber",
  }), [entityType, consequences, defaultConsequences]);

  // Status alerts - show message if already archived
  const statusAlerts = useMemo(() => [
    {
      condition: (entity) => entity?.status === archivedStatus,
      type: "info",
      message: `${entityType} is already archived`,
      icon: InformationCircleIcon,
    },
  ], [entityType, archivedStatus]);

  // Check if action should be disabled
  const isActionDisabled = useCallback((entity) => {
    return entity?.status === archivedStatus;
  }, [archivedStatus]);

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
        actionType="archive"
        fetchEntity={fetchEntity}
        executeAction={executeArchive}
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

EntityActionArchivePage.displayName = "EntityActionArchivePage";

export default EntityActionArchivePage;
