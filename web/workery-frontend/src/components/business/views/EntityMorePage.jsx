// File: monorepo/web/frontend/src/components/business/views/EntityMorePage.jsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { MoreView } from "./index";

/**
 * Reusable EntityMorePage component for displaying more actions for any entity
 * Used for staff, customer, and other entity more action pages
 *
 * @param {React.Component} entityIcon - Icon component for the entity type
 * @param {string} entityType - Type of entity (e.g., "Staff Member", "Customer")
 * @param {string} entityTypePlural - Plural form (e.g., "Staff", "Customers")
 * @param {string} basePath - Base path for navigation (e.g., "/admin/staff")
 * @param {string} entityParamName - URL parameter name for entity ID (e.g., "aid", "cid")
 * @param {object} entityManager - Manager service for the entity
 * @param {function} getEntityDetail - Function to get entity details
 * @param {Array} createTabItems - Function to create tab items for the entity
 * @param {function} createActionCards - Function to create action cards for the entity
 * @param {object} constants - Entity-specific constants
 * @param {string} infoMessage - Information message about action availability
 * @param {Array} additionalIcons - Additional icons to import
 * @param {function} onUnauthorizedRedirect - Custom unauthorized redirect path
 * @param {function} buildFieldSections - Optional function to build custom field sections
 */
function EntityMorePage({
  entityIcon,
  entityType = "Item",
  entityTypePlural = "Items",
  basePath = "/admin",
  entityParamName = "id",
  // eslint-disable-next-line no-unused-vars
  entityManager,
  getEntityDetail,
  createTabItems,
  createActionCards,
  constants = {},
  infoMessage = null,
  // eslint-disable-next-line no-unused-vars
  additionalIcons = [],
  onUnauthorizedRedirect = "/login?unauthorized=true",
  buildFieldSections = null,
}) {
  const params = useParams();
  const entityId = params[entityParamName];
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [entity, setEntity] = useState(null);

  // Ref to track if component is mounted (prevents state updates after unmount)
  const isMountedRef = useRef(true);

  // Refresh handler to replace the removed fetchEntityDetails
  const handleRefresh = useCallback(async () => {
    if (!entityId) return;

    if (isMountedRef.current) {
      setFetching(true);
      setErrors({});
    }

    try {
      // Create local unauthorized handler to avoid dependency issues
      const handleUnauthorized = () => {
        navigate(onUnauthorizedRedirect);
      };

      const entityData = await getEntityDetail(entityId, handleUnauthorized);

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setEntity(entityData);
      }
    } catch (error) {
      console.error(`Failed to fetch ${entityType.toLowerCase()}:`, error);
      if (isMountedRef.current) {
        setErrors({ general: `Failed to load ${entityType.toLowerCase()} details` });
      }
    } finally {
      if (isMountedRef.current) {
        setFetching(false);
      }
    }
  }, [entityId, getEntityDetail, entityType, navigate, onUnauthorizedRedirect]);

  // Cleanup on unmount - prevents memory leaks from async operations
  useEffect(() => {
    // Reset mounted ref on mount
    isMountedRef.current = true;

    return () => {
      // Mark component as unmounted
      isMountedRef.current = false;
    };
  }, []);

  // Initial load - depend on handleRefresh to ensure we use the latest fetch function
  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]); // handleRefresh is memoized, so this is safe

  // Tab items for navigation
  const tabItems = useMemo(() => {
    return entity ? createTabItems(entity, entityId) : [];
  }, [entity, entityId, createTabItems]);

  // Breadcrumb configuration
  const breadcrumbs = useMemo(() => [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon,
    },
    {
      label: entityTypePlural,
      to: basePath,
      icon: entityIcon,
    },
    {
      label: "More Actions",
      icon: EllipsisHorizontalIcon,
      isActive: true,
    },
  ], [entityTypePlural, basePath, entityIcon]);

  // Action cards configuration
  const actionCards = useMemo(() => {
    return entity ? createActionCards(entity, entityId, constants) : [];
  }, [entity, entityId, createActionCards, constants]);

  // Default info message
  const defaultInfoMessage = `Some actions may have different availability based on the ${entityType.toLowerCase()}'s status. Archived ${entityType.toLowerCase()}s have limited available actions.`;

  return (
    <MoreView
      item={entity}
      itemType={entityType}
      itemIcon={entityIcon}
      basePath={basePath}
      itemId={entityId}
      tabItems={tabItems}
      breadcrumbs={breadcrumbs}
      loading={isFetching && !entity}
      error={errors.general}
      onErrorClear={() => setErrors({})}
      actionCards={actionCards}
      infoMessage={infoMessage || defaultInfoMessage}
      onRefresh={handleRefresh}
      isFetching={isFetching}
      buildFieldSections={buildFieldSections}
    />
  );
}

export default EntityMorePage;