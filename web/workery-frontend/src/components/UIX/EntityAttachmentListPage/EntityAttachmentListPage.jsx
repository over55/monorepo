// File: src/components/UIX/EntityAttachmentListPage/EntityAttachmentListPage.jsx
// UIX Mobile Optimizations Applied

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  memo,
} from "react";
import { useNavigate, useParams } from "react-router";
import { PaperClipIcon } from "@heroicons/react/24/outline";
import { AttachmentsView } from "../";

// Development-only logging
const DEBUG = process.env.NODE_ENV === 'development';
const log = (...args) => DEBUG && console.log(...args);
const error = (...args) => console.error(...args); // Keep errors in production

/**
 * EntityAttachmentListPage - A reusable page component for entity attachment management
 *
 * This component provides a complete attachment list page with consistent layout,
 * data fetching, pagination, and error handling.
 *
 * Performance optimizations:
 * - React.memo for component memoization
 * - useCallback for all event handlers
 * - useMemo for all derived data
 * - AbortController for request cancellation
 * - Refs for lifecycle management
 * - Conditional development logging
 * - Stable dependency arrays
 */
const EntityAttachmentListPage = memo(({ config, className = "" }) => {
  const navigate = useNavigate();
  const params = useParams();

  // Memoize entity ID extraction
  const entityId = useMemo(
    () => params[config.entityIdParam || "id"],
    [params, config.entityIdParam],
  );

  // Use refs to track component lifecycle
  const isMounted = useRef(true);
  const isFetchingRef = useRef(false); // Track fetch state synchronously
  const abortControllerRef = useRef(null);

  // Reset isMounted on every render (handles React Strict Mode remounts)
  isMounted.current = true;

  // Component states
  const [isFetching, setFetching] = useState(false);
  const [entity, setEntity] = useState({});
  const [attachments, setAttachments] = useState(null);
  const [errors, setErrors] = useState({});

  // Pagination state
  const [pageSize, setPageSize] = useState(config.defaultPageSize || 50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [currentCursor, setCurrentCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");

  // Track if we need to refetch
  const [shouldRefetch, setShouldRefetch] = useState(false);

  // Memoize callbacks
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  const onErrorClear = useCallback(() => {
    setErrors({});
  }, []);

  // Fetch entity data - stable reference without state dependencies
  const fetchEntityData = useCallback(async () => {
    if (!config.fetchEntity || !entityId) return {};

    try {
      log("[EntityAttachmentListPage] Fetching entity data for ID:", entityId);
      const entityData = await config.fetchEntity(entityId, onUnauthorized);
      log("[EntityAttachmentListPage] Entity data received:", entityData);
      if (isMounted.current) {
        setEntity(entityData);
      }
      return entityData;
    } catch (err) {
      error("[EntityAttachmentListPage] Error fetching entity:", err);
      if (isMounted.current) {
        setErrors((prev) => ({
          ...prev,
          general: err.message || "Failed to load entity",
        }));
      }
      throw err;
    }
  }, [entityId, config, onUnauthorized]);

  // Fetch attachments data - stable reference without state dependencies
  const fetchAttachmentsData = useCallback(
    async (cursor, size) => {
      if (!config.fetchAttachments || !entityId) return;

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        // FIX: Use camelCase for API parameters
        const params = {
          ...config.attachmentParams,
          ownershipId: entityId, // ✅ Changed from ownership_id
          page_size: size,
          cursor: cursor,
        };

        log("[EntityAttachmentListPage] Fetching attachments with params:", params);

        const attachmentsData = await config.fetchAttachments(
          params,
          onUnauthorized,
          true, // Force refresh
        );

        log("[EntityAttachmentListPage] Attachments data received:", attachmentsData);

        if (isMounted.current) {
          setAttachments(attachmentsData);
          setNextCursor(
            attachmentsData?.hasNextPage ? attachmentsData.nextCursor : "",
          );
        }
      } catch (err) {
        // Don't treat abort as an error
        if (err.name === "AbortError") {
          log("[EntityAttachmentListPage] Request aborted");
          return;
        }

        error("[EntityAttachmentListPage] Error fetching attachments:", err);
        if (isMounted.current) {
          setErrors((prev) => ({
            ...prev,
            attachments: err.message || "Failed to load attachments",
          }));
        }
      }
    },
    [entityId, config, onUnauthorized],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Initial load effect - only runs once per entityId
  useEffect(() => {
    // Skip if no entityId
    if (!entityId) {
      log("[EntityAttachmentListPage] No entityId, skipping load");
      return;
    }

    // Skip if currently fetching (prevents double-fetch in React Strict Mode)
    if (isFetchingRef.current) {
      log("[EntityAttachmentListPage] Already fetching (ref check), skipping");
      return;
    }

    const loadInitialData = async () => {
      try {
        // Set ref immediately to prevent double-fetch
        isFetchingRef.current = true;

        window.scrollTo(0, 0);
        setFetching(true);
        setErrors({});

        // Fetch entity data first
        await fetchEntityData();

        // Then fetch attachments with initial settings
        await fetchAttachmentsData("", config.defaultPageSize || 50);
      } catch (err) {
        error("[EntityAttachmentListPage] Error loading initial data:", err);
      } finally {
        if (isMounted.current) {
          isFetchingRef.current = false;
          setFetching(false);
        }
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId]); // Only re-run when entityId changes

  // Separate effect for pagination changes
  useEffect(() => {
    // Skip if not triggered
    if (!shouldRefetch) {
      return;
    }

    const loadPageData = async () => {
      try {
        setFetching(true);
        await fetchAttachmentsData(currentCursor, pageSize);
      } catch (err) {
        error("[EntityAttachmentListPage] Error loading page data:", err);
      } finally {
        if (isMounted.current) {
          setFetching(false);
          setShouldRefetch(false);
        }
      }
    };

    loadPageData();
  }, [currentCursor, pageSize, shouldRefetch, fetchAttachmentsData]);

  // Pagination handlers - memoized
  const handleNextPage = useCallback(() => {
    if (nextCursor) {
      setPreviousCursors((prev) => [...prev, currentCursor]);
      setCurrentCursor(nextCursor);
      setShouldRefetch(true);
    }
  }, [currentCursor, nextCursor]);

  const handlePreviousPage = useCallback(() => {
    if (previousCursors.length > 0) {
      setPreviousCursors((prev) => {
        const arr = [...prev];
        const previousCursor = arr.pop();
        setCurrentCursor(previousCursor || "");
        setShouldRefetch(true);
        return arr;
      });
    }
  }, [previousCursors]);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setCurrentCursor("");
    setPreviousCursors([]);
    setNextCursor("");
    setShouldRefetch(true);
  }, []);

  // Handle refresh - properly reset and refetch
  const handleRefresh = useCallback(async () => {
    try {
      setFetching(true);
      setErrors({});

      // Fetch entity data
      await fetchEntityData();

      // Reset pagination and refetch attachments
      setCurrentCursor("");
      setPreviousCursors([]);
      await fetchAttachmentsData("", pageSize);
    } catch (err) {
      error("[EntityAttachmentListPage] Error refreshing:", err);
    } finally {
      if (isMounted.current) {
        setFetching(false);
      }
    }
  }, [fetchEntityData, fetchAttachmentsData, pageSize]);

  // Handle attachment click - memoized
  const onAttachmentClick = useCallback(
    (attachment) => {
      if (config.onAttachmentClick) {
        config.onAttachmentClick(attachment, entityId, navigate);
      }
    },
    [config, entityId, navigate],
  );

  // Handle attachment selection for deletion - memoized
  const onSelectForDeletion = useCallback(
    (attachment) => {
      if (config.onDeleteAttachment) {
        config.onDeleteAttachment(attachment, entityId, navigate);
      }
    },
    [config, entityId, navigate],
  );

  // Handle entity refresh - memoized
  const handleRefreshEntity = useCallback(
    async (entityIdParam, onUnauthorizedParam) => {
      setFetching(true);
      setErrors({});

      try {
        const entityData = await config.fetchEntity(
          entityIdParam || entityId,
          onUnauthorizedParam || onUnauthorized,
        );
        if (isMounted.current) {
          setEntity(entityData);
        }

        // Also refresh attachments
        await fetchAttachmentsData(currentCursor, pageSize);

        return entityData;
      } catch (err) {
        if (isMounted.current) {
          setErrors({
            general: err.message || "Failed to load entity details. Please try again.",
          });
        }
        throw err;
      } finally {
        if (isMounted.current) {
          setFetching(false);
        }
      }
    },
    [config, entityId, onUnauthorized, fetchAttachmentsData, currentCursor, pageSize],
  );

  // Memoize configuration objects - use stable config dependency
  const breadcrumbs = useMemo(
    () =>
      config.routes?.buildBreadcrumbs
        ? config.routes.buildBreadcrumbs(entity, entityId)
        : [],
    [config, entity, entityId],
  );

  const tabItems = useMemo(
    () =>
      config.routes?.buildTabs ? config.routes.buildTabs(entity, entityId) : [],
    [config, entity, entityId],
  );

  const fieldSections = useMemo(
    () => (config.buildFieldSections ? config.buildFieldSections(entity) : []),
    [config, entity],
  );

  const alerts = useMemo(
    () => (config.buildAlerts ? config.buildAlerts(entity) : {}),
    [config, entity],
  );

  const canAdd = useMemo(
    () => (config.canAddAttachments ? config.canAddAttachments(entity) : true),
    [config, entity],
  );

  // Separate actionButtons to avoid isFetching dependency causing full recreation
  const baseActionButtons = useMemo(() => {
    return config.routes?.buildActionButtons
      ? config.routes.buildActionButtons(entity, entityId, navigate)
      : [];
  }, [config, entity, entityId, navigate]);

  const actionButtons = useMemo(() => {
    const buttons = [...baseActionButtons];

    // Add refresh button if not already present
    const hasRefresh = buttons.some((btn) => btn.label === "Refresh");
    if (!hasRefresh) {
      buttons.push({
        variant: "outline",
        onClick: handleRefresh,
        icon: null,
        label: "Refresh",
        disabled: isFetching,
      });
    }

    return buttons;
  }, [baseActionButtons, handleRefresh, isFetching]);

  // Memoize route paths
  const paths = useMemo(() => {
    const addPath = config.routes?.addPath
      ? config.routes.addPath.replace("{entityId}", entityId)
      : "";
    const viewPath = config.routes?.viewPath
      ? config.routes.viewPath.replace("{entityId}", entityId)
      : "";
    const editPath = config.routes?.editPath
      ? config.routes.editPath.replace("{entityId}", entityId)
      : "";
    const deletePath = config.routes?.deletePath
      ? config.routes.deletePath.replace("{entityId}", entityId)
      : "";

    return { addPath, viewPath, editPath, deletePath };
  }, [config.routes, entityId]);

  // Memoize loading state - only show loading on initial load
  const isLoading = useMemo(
    () => isFetching && !entity.id && !attachments,
    [isFetching, entity.id, attachments],
  );

  const errorMessage = useMemo(() => errors.general, [errors.general]);

  return (
    <AttachmentsView
      entityData={entity}
      entityId={entityId}
      entityType={config.entityType}
      breadcrumbItems={breadcrumbs}
      headerConfig={config.header}
      fieldSections={fieldSections}
      actionButtons={actionButtons}
      tabs={tabItems}
      alerts={alerts}
      attachments={attachments}
      onAttachmentClick={onAttachmentClick}
      onDeleteAttachment={onSelectForDeletion}
      onRefreshEntity={handleRefreshEntity}
      onUnauthorized={onUnauthorized}
      isLoading={isLoading}
      error={errorMessage}
      onErrorClose={onErrorClear}
      canAdd={canAdd}
      addPath={paths.addPath}
      viewPath={paths.viewPath}
      editPath={paths.editPath}
      deletePath={paths.deletePath}
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      previousCursors={previousCursors}
      nextCursor={nextCursor}
      onNextClick={handleNextPage}
      onPreviousClick={handlePreviousPage}
      className={className}
    />
  );
});

// Add display name for better debugging
EntityAttachmentListPage.displayName = "EntityAttachmentListPage";

export default EntityAttachmentListPage;
