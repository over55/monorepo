// File: src/components/UIX/LegacyAttachmentListPage/LegacyAttachmentListPage.jsx
// UIX Mobile Optimizations Applied
// LEGACY VERSION - Preserved from original Staff attachment list implementation
// This version was used before EntityAttachmentListPage performance optimizations
// Kept as a fallback in case of performance issues with the new implementation

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  memo,
} from "react";
import { useNavigate } from "react-router";
import {
  PaperClipIcon,
  EllipsisHorizontalIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  XCircleIcon,
  HomeIcon,
  ArrowPathIcon,
  DocumentIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  UIXThemeProvider,
  Badge,
  ContactLink,
  useUIXTheme,
  Breadcrumb,
  Button,
  BackButton,
  Tabs,
  Alert,
  EmptyState,
  Card,
  LoadingSpinner,
  ViewButton,
} from "../";
import { formatDateForDisplay } from "../../../services/Helpers/DateFormatter";

/**
 * LegacyAttachmentListPage Component
 *
 * This is the legacy standalone attachment list implementation that was used
 * before EntityAttachmentListPage performance optimizations were completed.
 *
 * Preserved as a failsafe/fallback option in case of performance issues.
 *
 * Key differences from EntityAttachmentListPage:
 * - Simpler, more direct implementation
 * - Less abstraction layers
 * - Inline component logic
 * - No complex configuration objects
 *
 * @param {Object} props
 * @param {string} props.entityId - The ID of the entity (staff, customer, etc.)
 * @param {string} props.entityIdParam - URL parameter name for entity ID
 * @param {string} props.entityType - Type of entity (for display)
 * @param {Object} props.entityIcon - Icon component for the entity
 * @param {Function} props.fetchEntity - Function to fetch entity details
 * @param {Function} props.fetchAttachments - Function to fetch attachments
 * @param {Object} props.attachmentParams - Parameters for attachment fetch
 * @param {Function} props.canAddAttachments - Function to check if attachments can be added
 * @param {Function} props.buildBreadcrumbs - Function to build breadcrumb items
 * @param {Function} props.buildTabs - Function to build tab items
 * @param {Function} props.buildStatusBadge - Function to build status badge
 * @param {Function} props.buildContactInfo - Function to build contact info section
 * @param {Function} props.buildMetadata - Function to build metadata section
 * @param {Function} props.buildAlerts - Function to build alert sections
 * @param {string} props.addPath - Path to add attachment page
 * @param {string} props.viewPath - Path to view attachment page
 * @param {string} props.backPath - Path for back button
 */
const LegacyAttachmentListPageContent = memo(function LegacyAttachmentListPageContent({
  entityId,
  entityType = "entity",
  fetchEntity,
  fetchAttachments,
  attachmentParams = {},
  canAddAttachments,
  buildBreadcrumbs,
  buildTabs,
  buildStatusBadge,
  buildContactInfo,
  buildMetadata,
  buildAlerts,
  addPath,
  viewPath,
  backPath,
  pageTitle = "Attachments",
}) {
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // States
  const [entity, setEntity] = useState(null);
  const [attachments, setAttachments] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  // Format file size helper
  const formatFileSize = useCallback((bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }, []);

  // Fetch data
  const fetchData = useCallback(
    async (showRefreshing = false) => {
      if (!entityId) {
        setError(`No ${entityType} ID provided`);
        setIsLoading(false);
        return;
      }

      try {
        if (showRefreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        // Fetch entity
        const entityData = await fetchEntity(entityId, () =>
          navigate("/login?unauthorized=true"),
        );

        if (!isMounted.current) return;
        setEntity(entityData);

        // Fetch attachments
        const params = {
          ...attachmentParams,
          ownershipId: entityId,
          page_size: 50,
          cursor: "",
        };

        const attachmentsData = await fetchAttachments(
          params,
          () => navigate("/login?unauthorized=true"),
          true, // Force refresh
        );

        if (!isMounted.current) return;
        setAttachments(attachmentsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        if (isMounted.current) {
          setError(err.message || "Failed to load data");
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [entityId, entityType, fetchEntity, fetchAttachments, attachmentParams, navigate],
  );

  // Initial load
  useEffect(() => {
    isMounted.current = true;
    fetchData(false);

    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  // Build breadcrumb items
  const breadcrumbItems = useMemo(
    () => (buildBreadcrumbs ? buildBreadcrumbs(entity, entityId) : []),
    [buildBreadcrumbs, entity, entityId],
  );

  // Build tabs
  const tabItems = useMemo(
    () => (buildTabs ? buildTabs(entity, entityId, attachments) : []),
    [buildTabs, entity, entityId, attachments],
  );

  // Check if user can add attachments
  const canAdd = useMemo(() => {
    return canAddAttachments ? canAddAttachments(entity) : true;
  }, [canAddAttachments, entity]);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textMuted: getThemeClasses('text-muted') || 'text-gray-600',
    textError: getThemeClasses('text-error') || 'text-red-500',
    borderMedium: getThemeClasses('border-medium') || 'border-gray-200',
  }), [getThemeClasses]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className={`mt-4 ${themeClasses.textMuted}`}>Loading attachments...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !entity) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <Card className="max-w-md">
          <div className="text-center p-6">
            <ExclamationTriangleIcon className={`w-16 h-16 ${themeClasses.textError} mx-auto mb-4`} />
            <h2 className="text-xl font-semibold mb-2">Error Loading Page</h2>
            <p className={`${themeClasses.textMuted} mb-4`}>{error}</p>
            <Button onClick={() => navigate(backPath)} variant="primary">
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Error Alert */}
      {error && (
        <Alert
          variant="error"
          onClose={() => setError(null)}
          className="mb-6"
        >
          {error}
        </Alert>
      )}

      {/* Main Content Card */}
      <div className={`${getThemeClasses("bg-card")} shadow-sm rounded-lg`}>
        {/* Header with Gradient */}
        <div
          className={`px-6 py-5 ${getThemeClasses("bg-gradient-secondary")} rounded-t-lg flex items-center justify-between`}
        >
          <div className="flex items-center">
            <PaperClipIcon className="w-8 h-8 mr-3 text-white/80" />
            <div>
              <h2 className="text-3xl font-bold text-white">
                {pageTitle}
              </h2>
              {entity && buildStatusBadge && (
                <p className="text-sm mt-1 text-white/70">
                  {entity.name || `${entity.firstName} ${entity.lastName}` || entityType}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => fetchData(true)}
              variant="outline-light"
              size="sm"
              icon={ArrowPathIcon}
              disabled={isRefreshing}
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            {canAdd && addPath && (
              <Button
                onClick={() => navigate(addPath)}
                variant="primary"
                size="sm"
                icon={PlusIcon}
              >
                Add Attachment
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        {tabItems && tabItems.length > 0 && (
          <div className={`border-b ${themeClasses.borderMedium}`}>
            <div className="px-6">
              <Tabs tabs={tabItems} mode="routing" />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Entity Info Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                {/* Name and Status */}
                <div className="text-center mb-6">
                  <h3
                    className={`text-lg font-semibold ${getThemeClasses("text.primary")} mb-2`}
                  >
                    {entity?.name || `${entity?.firstName} ${entity?.lastName}` || entityType}
                  </h3>
                  {buildStatusBadge && (
                    <div>
                      {buildStatusBadge(entity)}
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                {buildContactInfo && (
                  <div className="space-y-3 mb-6">
                    {buildContactInfo(entity)}
                  </div>
                )}

                {/* Metadata */}
                {buildMetadata && (
                  <div
                    className={`space-y-2 text-sm ${getThemeClasses("text.secondary")}`}
                  >
                    {buildMetadata(entity)}
                  </div>
                )}
              </Card>

              {/* Alerts */}
              {buildAlerts && buildAlerts(entity)}
            </div>

            {/* Attachments List */}
            <div className="lg:col-span-2">
              {attachments?.results && attachments.results.length > 0 ? (
                <div className={`${getThemeClasses("bg-card")} rounded-lg border ${getThemeClasses("border-secondary")} divide-y ${getThemeClasses("divide-secondary")}`}>
                  {attachments.results.map((attachment) => (
                    <div
                      key={attachment.id}
                      className={`p-4 hover:${getThemeClasses("bg.hover")} transition-colors`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <DocumentIcon className={`h-6 w-6 ${getThemeClasses("text.muted")} mt-0.5 flex-shrink-0`} />
                          <div className="min-w-0 flex-1">
                            <h4
                              className={`text-sm font-medium ${getThemeClasses("text.primary")} truncate`}
                            >
                              {attachment.fileName ||
                                attachment.name ||
                                "Untitled"}
                            </h4>
                            {attachment.description && (
                              <p
                                className={`text-sm ${getThemeClasses("text.secondary")} mt-1`}
                              >
                                {attachment.description}
                              </p>
                            )}
                            <div
                              className={`mt-2 flex flex-wrap items-center gap-4 text-xs ${getThemeClasses("text.muted")}`}
                            >
                              {attachment.fileSize && (
                                <span>
                                  Size: {formatFileSize(attachment.fileSize)}
                                </span>
                              )}
                              {attachment.fileType && (
                                <span>Type: {attachment.fileType}</span>
                              )}
                              {attachment.createdAt && (
                                <span>
                                  Created:{" "}
                                  {formatDateForDisplay(attachment.createdAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <ViewButton
                            to={viewPath.replace('{id}', attachment.id)}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={PaperClipIcon}
                  title="No attachments"
                  message={`No attachments have been uploaded for this ${entityType}.`}
                  action={
                    canAdd && addPath ? (
                      <Button
                        onClick={() => navigate(addPath)}
                        variant="primary"
                        icon={PlusIcon}
                      >
                        Add First Attachment
                      </Button>
                    ) : null
                  }
                />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className={`flex justify-between items-center pt-6 mt-6 border-t ${getThemeClasses("border-secondary")}`}
          >
            <BackButton to={backPath} label="Go Back" />
          </div>
        </div>
      </div>
    </div>
  );
});

LegacyAttachmentListPageContent.displayName = "LegacyAttachmentListPageContent";

function LegacyAttachmentListPage(props) {
  return (
    <UIXThemeProvider>
      <LegacyAttachmentListPageContent {...props} />
    </UIXThemeProvider>
  );
}

LegacyAttachmentListPage.displayName = "LegacyAttachmentListPage";

export default LegacyAttachmentListPage;
