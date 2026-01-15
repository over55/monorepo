// File: src/components/UIX/EntityCommentsPage/EntityCommentsPage.jsx
// UIX Mobile Optimizations Applied
// Reusable entity comments list page component
//
// This component provides a complete page layout for displaying and managing
// entity comments across different entity types (staff, customer, organization, etc.)
//
// Usage Example:
// <EntityCommentsPage
//   config={{
//     entityId: "123",
//     entityType: "staff member",
//     fetchEntity: async (id, onUnauthorized) => {...},
//     createComment: async (id, content, onUnauthorized) => {...},
//     breadcrumbs: { ... },
//     header: { ... },
//     tabs: { ... },
//     entityDisplay: { ... },
//   }}
// />

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  memo,
} from "react";
import { useNavigate } from "react-router";
import { CommentsView } from "../";

const DEBUG = process.env.NODE_ENV === "development";
const log = (...args) => DEBUG && console.log(...args);
const error = (...args) => console.error(...args);

/**
 * EntityCommentsPage Component
 *
 * A reusable whole-page component for entity comments management.
 * Wraps CommentsView with data fetching, state management, and error handling.
 *
 * @param {Object} props
 * @param {Object} props.config - Configuration object containing all settings
 *
 * Config Structure:
 * {
 *   // Core settings
 *   entityId: string,           // Entity ID
 *   entityType: string,         // Entity type for display (e.g., "staff member")
 *
 *   // Data fetching functions
 *   fetchEntity: async (entityId, onUnauthorized) => entity,
 *   createComment: async (entityId, content, onUnauthorized) => updatedEntity,
 *
 *   // Navigation configuration
 *   breadcrumbs: {
 *     items: [{ label, to, icon, isActive }],  // Or function: (entity, entityId) => items
 *   },
 *
 *   // Header configuration
 *   header: {
 *     title: string,
 *     icon: Component,
 *     loadingText: string,
 *     notFoundTitle: string,
 *     notFoundMessage: string,
 *     notFoundAction: { label, icon, onClick },
 *   },
 *
 *   // Action buttons configuration
 *   actionButtons: [
 *     { variant, onClick, icon, label, disabled }
 *   ],  // Or function: (entity, entityId, navigate, isFetching) => buttons
 *
 *   // Tabs configuration
 *   tabs: {
 *     items: [{ label, to, icon, isActive }],  // Or function: (entity, entityId) => items
 *   },
 *
 *   // Entity display configuration
 *   entityDisplay: {
 *     buildFieldSections: (entity, themeClasses) => sections,
 *     alerts: { archived: { message, icon }, banned: { message, icon } },
 *     statusConfig: { activeLabel, inactiveLabel, bannedLabel },
 *     typeMap: { 1: "Type 1", 2: "Type 2" },
 *   },
 * }
 */
const EntityCommentsPageContent = memo(
  function EntityCommentsPageContent({ config }) {
    const navigate = useNavigate();

    // Extract config values with defaults - all hooks MUST be before any conditional returns
    const {
      entityId,
      entityType = "entity",
      fetchEntity,
      createComment,
      breadcrumbs,
      header,
      actionButtons: actionButtonsConfig,
      tabs,
      entityDisplay,
    } = config || {};

    // Component states
    const [entity, setEntity] = useState({});
    const [isFetching, setFetching] = useState(false);
    const [errors, setErrors] = useState({});

    // Use refs to track mount status and prevent memory leaks
    const isMounted = useRef(true);
    const abortControllerRef = useRef(null);

    // Handle unauthorized access
    const onUnauthorized = useCallback(() => {
      navigate("/login?unauthorized=true");
    }, [navigate]);

    // Fetch entity data with proper cleanup
    const fetchEntityData = useCallback(() => {
      if (!entityId) {
        log("EntityCommentsPage: No entityId provided, returning");
        return;
      }

      if (!fetchEntity) {
        error("EntityCommentsPage: fetchEntity function is required");
        return;
      }

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      log("EntityCommentsPage: Starting fetch for entityId:", entityId);
      setFetching(true);
      setErrors({});

      // Create a promise wrapper to handle the fetch
      const fetchPromise = new Promise((resolve, reject) => {
        // Check if component is still mounted before making request
        if (!isMounted.current) {
          reject(new Error("Component unmounted"));
          return;
        }

        // Call the fetchEntity function
        const result = fetchEntity(entityId, onUnauthorized);

        // Handle both callback-based and promise-based fetchers
        if (result && typeof result.then === "function") {
          // Promise-based
          result
            .then((response) => {
              if (isMounted.current) {
                log("EntityCommentsPage: Entity fetched successfully:", response);
                setEntity(response);
                setFetching(false);
                resolve(response);
              }
            })
            .catch((errorResponse) => {
              if (isMounted.current) {
                error("EntityCommentsPage: Error fetching entity:", errorResponse);
                setErrors(errorResponse);
                setFetching(false);
                reject(errorResponse);
              }
            });
        } else {
          // Callback-based (legacy pattern)
          // Assume it was already handled in the function
          setFetching(false);
          resolve(result);
        }
      });

      // Handle abort signal
      if (abortControllerRef.current.signal.aborted) {
        setFetching(false);
        return;
      }

      abortControllerRef.current.signal.addEventListener("abort", () => {
        log("EntityCommentsPage: Fetch aborted");
        setFetching(false);
      });

      return fetchPromise;
    }, [entityId, fetchEntity, onUnauthorized]);

    // Create comment handler
    const handleCreateComment = useCallback(
      async (id, content, onUnauthorizedCallback) => {
        if (!isMounted.current) return;

        if (!createComment) {
          error("EntityCommentsPage: createComment function is required");
          throw new Error("Comment creation not configured");
        }

        try {
          const result = await createComment(
            id,
            content,
            onUnauthorizedCallback || onUnauthorized,
          );

          // Update local entity state with the result
          if (result && isMounted.current) {
            setEntity(result);
          }

          return result;
        } catch (err) {
          error("EntityCommentsPage: Error creating comment:", err);
          throw err;
        }
      },
      [createComment, onUnauthorized],
    );

    // Initial load and cleanup
    useEffect(() => {
      isMounted.current = true;
      window.scrollTo(0, 0);

      fetchEntityData();

      // Cleanup function
      return () => {
        isMounted.current = false;

        // Cancel any ongoing requests
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }

        // Clear any pending states
        setEntity({});
        setFetching(false);
        setErrors({});
      };
    }, [fetchEntityData]);

    // Build breadcrumb items
    const breadcrumbItems = useMemo(() => {
      if (!breadcrumbs) return [];

      if (typeof breadcrumbs.items === "function") {
        return breadcrumbs.items(entity, entityId);
      }

      return breadcrumbs.items || [];
    }, [breadcrumbs, entity, entityId]);

    // Build action buttons
    const actionButtons = useMemo(() => {
      if (!actionButtonsConfig) return [];

      if (typeof actionButtonsConfig === "function") {
        return actionButtonsConfig(entity, entityId, navigate, isFetching);
      }

      // If it's an array, map through and add refresh functionality
      const buttons = Array.isArray(actionButtonsConfig) ? [...actionButtonsConfig] : [];

      // Add refresh button if not present and fetchEntityData exists
      const hasRefresh = buttons.some((btn) => btn.label === "Refresh" || btn.label === "Refreshing...");
      if (!hasRefresh && fetchEntityData) {
        buttons.push({
          variant: "outline",
          onClick: () => fetchEntityData(),
          label: isFetching ? "Refreshing..." : "Refresh",
          disabled: isFetching,
        });
      }

      return buttons;
    }, [actionButtonsConfig, entity, entityId, navigate, isFetching, fetchEntityData]);

    // Build tabs
    const tabItems = useMemo(() => {
      if (!tabs) return [];

      if (typeof tabs.items === "function") {
        return tabs.items(entity, entityId);
      }

      return tabs.items || [];
    }, [tabs, entity, entityId]);

    // Build field sections
    const fieldSections = useMemo(() => {
      if (!entityDisplay?.buildFieldSections) return [];
      if (!entity || !entity.id) return [];

      return entityDisplay.buildFieldSections(entity);
    }, [entityDisplay, entity]);

    // Pass through entity display configuration
    const alerts = entityDisplay?.alerts || {};
    const statusConfig = entityDisplay?.statusConfig || {};
    const typeMap = entityDisplay?.typeMap || {};

    // Validate required config - AFTER all hooks
    if (!config) {
      error("EntityCommentsPage: config is required");
      return null;
    }

    return (
      <CommentsView
        entityData={entity}
        entityId={entityId}
        entityType={entityType}
        breadcrumbItems={breadcrumbItems}
        headerConfig={header}
        fieldSections={fieldSections}
        actionButtons={actionButtons}
        tabs={tabItems}
        alerts={alerts}
        onCreateComment={handleCreateComment}
        onRefreshEntity={fetchEntityData}
        onUnauthorized={onUnauthorized}
        isLoading={isFetching && !entity.id}
        error={errors}
        onErrorClose={() => setErrors({})}
        statusConfig={statusConfig}
        typeMap={typeMap}
      />
    );
  },
  // Custom comparison for performance optimization
  (prevProps, nextProps) => {
    // Use reference equality for config object
    // Parent should memoize the config to prevent unnecessary re-renders
    return prevProps.config === nextProps.config;
  }
);

EntityCommentsPageContent.displayName = "EntityCommentsPageContent";

function EntityCommentsPage(props) {
  return <EntityCommentsPageContent {...props} />;
}

EntityCommentsPage.displayName = "EntityCommentsPage";

export default EntityCommentsPage;
