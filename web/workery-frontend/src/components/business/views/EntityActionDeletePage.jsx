// File: monorepo/web/frontend/src/components/business/views/EntityActionDeletePage.jsx

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  TrashIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { EntityActionConfirmationPage, UIXThemeProvider } from "../../UIX";

/**
 * EntityActionDeletePage
 *
 * A pre-configured wrapper around EntityActionConfirmationPage for delete actions.
 * Provides sensible defaults for permanently deleting entities with strong warnings.
 *
 * @param {Object} props
 * @param {string} props.entityType - Display name of entity (e.g., "Speaker", "Customer")
 * @param {string} props.entityTypePlural - Plural form (e.g., "Speakers", "Customers")
 * @param {string} props.basePath - Base URL path (e.g., "/admin/speaker")
 * @param {string} props.listPath - Path to entity list (defaults to basePath + "s")
 * @param {string} props.entityParamName - URL param name for entity ID (default: "aid")
 * @param {React.Component} props.entityIcon - Icon component for the entity type
 * @param {Function} props.fetchEntity - Function to fetch entity: (id, onSuccess, onError, onDone, onUnauthorized) => void
 * @param {Function} props.executeDelete - Function to execute delete: (id, onSuccess, onError, onDone, onUnauthorized) => void
 * @param {Function} props.renderEntityInfo - Optional custom entity info renderer: (entity) => ReactNode
 * @param {Array} props.consequences - Optional custom consequences array (uses defaults if not provided)
 * @param {string} props.successRedirectPath - Path to redirect after success (defaults to listPath)
 */
const EntityActionDeletePage = memo(function EntityActionDeletePage({
  entityType,
  entityTypePlural,
  basePath,
  listPath,
  entityParamName = "aid",
  entityIcon,
  fetchEntity,
  executeDelete,
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

  // Default consequences for deleting - more severe warnings
  const defaultConsequences = useMemo(() => [
    `All ${entityType.toLowerCase()} data will be permanently removed from the database`,
    "All related records, history, and associations will be affected",
    `The ${entityType.toLowerCase()}'s account will be completely erased`,
    "This action CANNOT be undone without database restoration",
    "Recovery will require system administrator intervention and may not be possible",
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
      label: "Delete",
      icon: TrashIcon,
      isActive: true,
    },
  ], [entityTypePlural, entityIcon, basePath, entityId, computedListPath]);

  // Page configuration
  const pageConfig = useMemo(() => ({
    title: entityType,
    subtitle: `Delete ${entityType}`,
    icon: entityIcon,
    actionIcon: TrashIcon,
    loadingText: `Loading ${entityType.toLowerCase()} details...`,
  }), [entityType, entityIcon]);

  // Warning configuration - using red for delete
  const warningConfig = useMemo(() => ({
    title: `Delete ${entityType} - Are you sure?`,
    description: `You are about to permanently delete this ${entityType.toLowerCase()}. This means:`,
    consequences: consequences || defaultConsequences,
    confirmationText: "Are you sure you would like to continue?",
    warningType: "red",
  }), [entityType, consequences, defaultConsequences]);

  // No status alerts for delete - always allowed
  const statusAlerts = useMemo(() => [], []);

  // Delete is never disabled based on status
  const isActionDisabled = useCallback(() => false, []);

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
        actionType="delete"
        fetchEntity={fetchEntity}
        executeAction={executeDelete}
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

EntityActionDeletePage.displayName = "EntityActionDeletePage";

export default EntityActionDeletePage;
