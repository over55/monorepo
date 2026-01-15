// File: src/components/UIX/EntityEventContractListPage/EntityEventContractListPage.jsx
// UIX Mobile Optimizations Applied
//
// Reusable entity event contract list page component
//
// This component provides a complete page layout for displaying event contracts
// associated with any event type (field trip, onsite, virtual, etc.)
//
// Usage Example:
// <EntityEventContractListPage
//   config={{
//     entityIdParam: "eventId",
//     entityType: "field trip",
//     fetchEntity: async (id, onUnauthorized) => {...},
//     fetchEventContracts: async (filtersMap, onUnauthorized) => {...},
//     clearCache: () => {...},
//     validateEntityType: (entity) => entity.type === EVENT_TYPE_OFFSITE,
//     breadcrumbs: { items: (entity, entityId) => [...] },
//     header: { title: "...", icon: ..., ... },
//     tabs: { items: (entity, entityId) => [...] },
//     routes: { viewContract: "/admin/event-contract/{contractId}" },
//     statusOptions: { 1: { label: "Active", variant: "success" }, ... },
//   }}
// />

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  memo,
  Component,
} from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowPathIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  DetailLiteView,
  Button,
  EmptyState,
  Card,
  Badge,
  ViewButton,
  useUIXTheme,
} from "../";

// Development-only logging - prevents information leakage in production
const DEBUG = import.meta.env.DEV;
const log = (...args) => DEBUG && console.log("[EntityEventContractListPage]", ...args);
const logError = (...args) => {
  // Only log errors to console in development to prevent information disclosure
  if (DEBUG) {
    console.error("[EntityEventContractListPage]", ...args);
  }
  // In production, errors are sanitized before display to users
  // A production logging service could be integrated here if needed
};

// Default configuration constants
const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_SORT_FIELD = "created_at";
const DEFAULT_SORT_ORDER = "DESC";
const REFRESH_RATE_LIMIT_MS = 2000;
const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const TIMESTAMP_REFRESH_INTERVAL_MS = 10000;
const SKELETON_CARD_COUNT = 3;

/**
 * Validates that a string is a valid MongoDB ObjectId format
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId format
 */
const isValidObjectId = (id) => {
  if (!id || typeof id !== "string") return false;
  return /^[a-fA-F0-9]{24}$/.test(id);
};

/**
 * Sanitizes error messages to prevent sensitive information leakage
 * @param {Error|Object|string} error - The error to sanitize
 * @returns {Object} - Sanitized error object with safe message
 */
const sanitizeError = (error) => {
  const SAFE_MESSAGES = {
    network: "Unable to connect to the server. Please check your connection and try again.",
    unauthorized: "Your session has expired. Please log in again.",
    forbidden: "You don't have permission to view this resource.",
    notFound: "The requested resource was not found.",
    server: "An unexpected error occurred. Please try again later.",
    default: "Failed to load data. Please try again.",
  };

  if (!error) return {};

  const errorMessage = typeof error === "string"
    ? error
    : error?.message || error?.error || "";

  if (errorMessage.toLowerCase().includes("network") ||
      errorMessage.toLowerCase().includes("fetch") ||
      errorMessage.toLowerCase().includes("connection")) {
    return { message: SAFE_MESSAGES.network };
  }

  if (errorMessage.toLowerCase().includes("unauthorized") ||
      errorMessage.toLowerCase().includes("401")) {
    return { message: SAFE_MESSAGES.unauthorized };
  }

  if (errorMessage.toLowerCase().includes("forbidden") ||
      errorMessage.toLowerCase().includes("403")) {
    return { message: SAFE_MESSAGES.forbidden };
  }

  if (errorMessage.toLowerCase().includes("not found") ||
      errorMessage.toLowerCase().includes("404")) {
    return { message: SAFE_MESSAGES.notFound };
  }

  const sensitivePatterns = [
    /stack/i, /trace/i, /mongo/i, /database/i, /sql/i,
    /query/i, /internal/i, /exception/i, /\.js:/i, /\.go:/i,
    /at\s+\w+\s+\(/i,
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(errorMessage)) {
      return { message: SAFE_MESSAGES.server };
    }
  }

  if (errorMessage.length > 0 && errorMessage.length < 200 &&
      !errorMessage.includes("/") && !errorMessage.includes("\\")) {
    return { message: errorMessage };
  }

  return { message: SAFE_MESSAGES.default };
};

/**
 * Executes an async function with exponential backoff retry logic
 */
const withRetry = async (fn, maxAttempts = MAX_RETRY_ATTEMPTS, initialDelay = INITIAL_RETRY_DELAY_MS) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const errorMessage = error?.message?.toLowerCase() || "";
      if (errorMessage.includes("unauthorized") || errorMessage.includes("401") ||
          errorMessage.includes("forbidden") || errorMessage.includes("403")) {
        throw error;
      }

      if (attempt === maxAttempts) {
        log(`All ${maxAttempts} retry attempts failed`);
        throw error;
      }

      const delay = initialDelay * Math.pow(2, attempt - 1);
      log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Formats elapsed time since a given date in a human-readable format
 */
const formatTimeAgo = (date) => {
  if (!date) return "";

  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
};

/**
 * Error Boundary component to catch rendering errors
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (DEBUG) {
      logError("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card padding="p-8">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="opacity-70 mb-4">
              An unexpected error occurred while displaying this content.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Reload Page
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Skeleton loading card component for better UX during data fetching
 */
const ContractCardSkeleton = memo(() => (
  <Card padding="p-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center animate-pulse">
      <div>
        <div className="h-4 w-20 rounded bg-current opacity-10 mb-2" />
        <div className="h-5 w-24 rounded bg-current opacity-20" />
      </div>
      <div>
        <div className="h-4 w-20 rounded bg-current opacity-10 mb-2" />
        <div className="h-5 w-32 rounded bg-current opacity-20" />
      </div>
      <div>
        <div className="h-4 w-16 rounded bg-current opacity-10 mb-2" />
        <div className="h-6 w-20 rounded bg-current opacity-20" />
      </div>
      <div className="flex justify-start lg:justify-end">
        <div className="h-9 w-28 rounded bg-current opacity-10" />
      </div>
    </div>
  </Card>
));

ContractCardSkeleton.displayName = "ContractCardSkeleton";

/**
 * Renders multiple skeleton cards during loading state
 */
const ContractListSkeleton = memo(({ count = SKELETON_CARD_COUNT }) => (
  <div className="space-y-3" role="status" aria-label="Loading event contracts">
    {Array.from({ length: count }).map((_, index) => (
      <ContractCardSkeleton key={index} />
    ))}
    <span className="sr-only">Loading event contracts...</span>
  </div>
));

ContractListSkeleton.displayName = "ContractListSkeleton";

/**
 * EntityEventContractListPage Component
 *
 * A reusable whole-page component for entity event contract list management.
 * Provides data fetching, state management, retry logic, and error handling.
 *
 * @param {Object} props
 * @param {Object} props.config - Configuration object containing all settings
 * @param {string} props.className - Optional additional CSS classes
 */
const EntityEventContractListPage = memo(({ config, className = "" }) => {
  const navigate = useNavigate();
  const params = useParams();
  const { getThemeClasses } = useUIXTheme();

  // Extract config with defaults
  const {
    entityIdParam = "eventId",
    entityType = "event",
    fetchEntity,
    fetchEventContracts,
    clearCache,
    validateEntityType,
    breadcrumbs,
    header,
    actionButtons: actionButtonsConfig,
    tabs,
    routes,
    statusOptions = {},
    alerts: alertsConfig,
    defaultPageSize = DEFAULT_PAGE_SIZE,
    defaultSortField = DEFAULT_SORT_FIELD,
    defaultSortOrder = DEFAULT_SORT_ORDER,
    emptyState,
    contractFields,
  } = config || {};

  // Extract and validate entity ID
  const rawEntityId = params[entityIdParam];
  const entityId = useMemo(() => {
    if (isValidObjectId(rawEntityId)) {
      return rawEntityId;
    }
    return null;
  }, [rawEntityId]);

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const [entity, setEntity] = useState(null);
  const [eventContractList, setEventContractList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [timeAgoDisplay, setTimeAgoDisplay] = useState("");
  const [srAnnouncement, setSrAnnouncement] = useState("");

  // Pagination state
  const [pageSize] = useState(defaultPageSize);
  const [sortByValue] = useState(`${defaultSortField},${defaultSortOrder}`);
  const [status] = useState(0);

  // Refs
  const lastRefreshTimeRef = useRef(0);
  const isMountedRef = useRef(true);
  const filtersRef = useRef({ sortByValue, status, pageSize });

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Auto-refresh timestamp display
  useEffect(() => {
    if (!lastFetchTime) return;

    setTimeAgoDisplay(formatTimeAgo(lastFetchTime));

    const intervalId = setInterval(() => {
      if (isMountedRef.current) {
        setTimeAgoDisplay(formatTimeAgo(lastFetchTime));
      }
    }, TIMESTAMP_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [lastFetchTime]);

  // Update refs when filters change
  useEffect(() => {
    filtersRef.current = { sortByValue, status, pageSize };
  }, [sortByValue, status, pageSize]);

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch event contracts with retry logic
  const fetchEventContractListData = useCallback(async () => {
    if (!fetchEventContracts || !entityId) return;

    const currentFilters = filtersRef.current;
    log("Fetching event contracts with filters:", currentFilters);

    setFetching(true);
    setErrors({});
    setSrAnnouncement("Loading event contracts...");

    if (clearCache) {
      clearCache();
    }

    try {
      const filtersMap = new Map();
      filtersMap.set("page_size", currentFilters.pageSize.toString());
      filtersMap.set("event_id", entityId);

      const sortArray = currentFilters.sortByValue.split(",");
      filtersMap.set("sort_field", sortArray[0]);
      filtersMap.set("sort_order", sortArray[1]);

      if (currentFilters.status !== 0) {
        filtersMap.set("status", currentFilters.status.toString());
      }

      const data = await withRetry(async () => {
        return await fetchEventContracts(filtersMap, onUnauthorized, true);
      });

      if (!isMountedRef.current) return;

      log("Event contracts received:", { count: data.results?.length, total: data.count });

      const results = data.results || [];
      setEventContractList(results);
      setTotalCount(data.count || 0);
      setLastFetchTime(new Date());

      const contractCount = results.length;
      setSrAnnouncement(
        contractCount === 0
          ? "No event contracts found."
          : `Loaded ${contractCount} event contract${contractCount !== 1 ? "s" : ""}.`
      );
    } catch (error) {
      if (!isMountedRef.current) return;

      logError("Failed to fetch event contracts:", error);
      const sanitizedError = sanitizeError(error);
      setErrors(sanitizedError);
      setSrAnnouncement(`Error: ${sanitizedError.message}`);
    } finally {
      if (isMountedRef.current) {
        setFetching(false);
        setRefreshing(false);
      }
    }
  }, [entityId, fetchEventContracts, clearCache, onUnauthorized]);

  // Fetch entity details with retry logic
  const fetchEntityData = useCallback(async () => {
    if (!fetchEntity || !entityId) return;

    setFetching(true);
    setErrors({});

    try {
      const entityData = await withRetry(async () => {
        return await fetchEntity(entityId, onUnauthorized);
      });

      if (!isMountedRef.current) return;

      // Validate entity type if provided
      if (validateEntityType && !validateEntityType(entityData)) {
        setErrors({ message: `This ${entityType} is not the correct type` });
        return;
      }

      setEntity(entityData);
    } catch {
      if (!isMountedRef.current) return;

      setErrors({ message: `Failed to load ${entityType} details. Please try again.` });
    } finally {
      if (isMountedRef.current) {
        setFetching(false);
      }
    }
  }, [entityId, fetchEntity, validateEntityType, entityType, onUnauthorized]);

  // Initial load
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!entityId) {
      setErrors({ message: "Invalid ID. Please check the URL and try again." });
      return;
    }

    fetchEntityData();
  }, [fetchEntityData, entityId]);

  // Fetch contracts after entity is loaded
  useEffect(() => {
    if (entity?.id) {
      fetchEventContractListData();
    }
  }, [entity?.id, fetchEventContractListData]);

  // Refresh handler with rate limiting
  const handleRefresh = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;

    if (timeSinceLastRefresh < REFRESH_RATE_LIMIT_MS) {
      log(`Refresh rate limited. Wait ${REFRESH_RATE_LIMIT_MS - timeSinceLastRefresh}ms`);
      return;
    }

    lastRefreshTimeRef.current = now;
    setRefreshing(true);
    fetchEventContractListData();
  }, [fetchEventContractListData]);

  // Build breadcrumb items
  const breadcrumbItems = useMemo(() => {
    if (!breadcrumbs) return [];

    if (typeof breadcrumbs.items === "function") {
      return breadcrumbs.items(entity, entityId);
    }

    return breadcrumbs.items || [];
  }, [breadcrumbs, entity, entityId]);

  // Build header config
  const headerConfig = useMemo(() => {
    if (!header) return {};

    if (typeof header === "function") {
      return header(entity, entityId, navigate);
    }

    return header;
  }, [header, entity, entityId, navigate]);

  // Build action buttons
  const actionButtons = useMemo(() => {
    if (!actionButtonsConfig) return [];

    if (typeof actionButtonsConfig === "function") {
      return actionButtonsConfig(entity, entityId, navigate, isFetching);
    }

    return actionButtonsConfig || [];
  }, [actionButtonsConfig, entity, entityId, navigate, isFetching]);

  // Build tabs
  const tabItems = useMemo(() => {
    if (!tabs) return [];

    if (typeof tabs.items === "function") {
      return tabs.items(entity, entityId);
    }

    return tabs.items || [];
  }, [tabs, entity, entityId]);

  // Build alerts
  const alerts = useMemo(() => {
    if (!alertsConfig) return {};

    if (typeof alertsConfig === "function") {
      return alertsConfig(entity);
    }

    return alertsConfig || {};
  }, [alertsConfig, entity]);

  // Get contract view path
  const getContractViewPath = useCallback((contractId) => {
    if (routes?.viewContract) {
      return routes.viewContract.replace("{contractId}", contractId);
    }
    return `/admin/event-contract/${contractId}`;
  }, [routes]);

  // Render individual contract card
  const renderContractCard = useCallback((contract, index) => {
    const fields = contractFields || {
      publicId: { label: "Contract #", format: (v) => `#${v}` },
      facilitatorName: { label: "Facilitator", fallback: "N/A" },
      status: { label: "Status" },
    };

    return (
      <Card key={contract.id || index} padding="p-4" role="listitem">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {fields.publicId && (
            <div>
              <div className="text-sm font-medium opacity-70 mb-1">{fields.publicId.label}</div>
              <div className="font-mono text-sm font-semibold">
                {fields.publicId.format
                  ? fields.publicId.format(contract.publicId)
                  : contract.publicId}
              </div>
            </div>
          )}
          {fields.facilitatorName && (
            <div>
              <div className="text-sm font-medium opacity-70 mb-1">{fields.facilitatorName.label}</div>
              <div className="font-medium">
                {contract.facilitatorName || fields.facilitatorName.fallback || "N/A"}
              </div>
            </div>
          )}
          {fields.status && (
            <div>
              <div className="text-sm font-medium opacity-70 mb-1">{fields.status.label}</div>
              <Badge
                variant={statusOptions[contract.status]?.variant || "default"}
                size="sm"
              >
                {statusOptions[contract.status]?.label || "Unknown"}
              </Badge>
            </div>
          )}
          <div className="flex justify-start lg:justify-end items-center">
            <ViewButton
              to={getContractViewPath(contract.id)}
              text="View Contract"
              title="View Event Contract Details"
            />
          </div>
        </div>
      </Card>
    );
  }, [contractFields, statusOptions, getContractViewPath]);

  // Render event contract list content
  const renderContractList = useCallback(() => {
    if (isFetching) {
      return <ContractListSkeleton />;
    }

    if (!eventContractList || eventContractList.length === 0) {
      return (
        <Card padding="p-0">
          <EmptyState
            icon={emptyState?.icon || DocumentTextIcon}
            title={emptyState?.title || "No Event Contracts Found"}
            description={emptyState?.description || `This ${entityType} does not have any contracts yet.`}
            className="py-16"
          />
        </Card>
      );
    }

    return (
      <div className="space-y-3" role="list" aria-label="Event contracts">
        {eventContractList.map(renderContractCard)}
      </div>
    );
  }, [isFetching, eventContractList, emptyState, entityType, renderContractCard]);

  // Build field sections for the event contracts list
  const fieldSections = useMemo(() => {
    const eventName = entity?.eventName || entity?.name || "Loading...";

    return [
      {
        column: "primary",
        className: "mb-6",
        component: (
          <div>
            {/* Screen reader announcements */}
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            >
              {srAnnouncement}
            </div>

            {/* Header with title and refresh button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className={`text-xl sm:text-2xl font-bold ${getThemeClasses('info-card-content-text')}`}>
                Event Contracts for {eventName}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing || isFetching}
                loading={isRefreshing}
                icon={ArrowPathIcon}
                aria-label={isRefreshing ? "Refreshing event contracts" : "Refresh event contracts list"}
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            {/* Last fetch time - auto-refreshing display */}
            {lastFetchTime && timeAgoDisplay && (
              <div className={`text-sm mb-4 flex items-center ${getThemeClasses('info-card-content-text-secondary')}`}>
                <ClockIcon className={`w-4 h-4 mr-1 ${getThemeClasses('info-card-content-icon')}`} aria-hidden="true" />
                <span>Last updated {timeAgoDisplay}</span>
              </div>
            )}

            {/* Results count */}
            <div className={`mb-4 ${getThemeClasses('info-card-content-text-secondary')}`} aria-live="polite">
              Showing{" "}
              <strong className={getThemeClasses('info-card-content-text')}>
                {eventContractList.length}
              </strong>{" "}
              event contracts
              {totalCount > 0 && ` (Total: ${totalCount})`}
            </div>

            {/* Event Contracts List */}
            {renderContractList()}
          </div>
        ),
      },
    ];
  }, [
    entity,
    eventContractList,
    totalCount,
    lastFetchTime,
    timeAgoDisplay,
    srAnnouncement,
    isFetching,
    isRefreshing,
    handleRefresh,
    renderContractList,
  ]);

  // Error close handler
  const handleErrorClose = useCallback(() => {
    setErrors({});
  }, []);

  // Validate config
  if (!config) {
    logError("config is required");
    return null;
  }

  return (
    <ErrorBoundary>
      <DetailLiteView
        entityData={entity}
        breadcrumbItems={breadcrumbItems}
        headerConfig={headerConfig}
        fieldSections={fieldSections}
        actionButtons={actionButtons}
        tabs={tabItems}
        alerts={alerts}
        onUnauthorized={onUnauthorized}
        isLoading={isFetching && !entity}
        error={errors?.message}
        onErrorClose={handleErrorClose}
        className={className}
      />
    </ErrorBoundary>
  );
});

EntityEventContractListPage.displayName = "EntityEventContractListPage";

export default EntityEventContractListPage;
