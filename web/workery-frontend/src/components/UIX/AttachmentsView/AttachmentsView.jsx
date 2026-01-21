// File Path: src/components/UIX/AttachmentsView/AttachmentsView.jsx
// UIX Mobile Optimizations Applied
// Reusable AttachmentsView component for entity attachment management - Performance Optimized

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
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  PaperClipIcon,
  ChevronLeftIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  ClockIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  BriefcaseIcon,
  DocumentIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  UIXThemeProvider,
  useUIXTheme,
  Breadcrumb,
  Avatar,
  Badge,
  Button,
  Alert,
  ContactLink,
  AddressDisplay,
  Tabs,
} from "../";
import { formatDateForDisplay } from "../../../services/Helpers/DateFormatter";

// Constants
const ACTIVE_STATUS = 1;
const ARCHIVED_STATUS = 2;

// Helper function to format file size - pure function at module level
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Memoized Attachment Row Component - Prevents re-rendering of all rows when one changes
 */
const AttachmentRow = memo(
  ({
    attachment,
    getThemeClasses,
    onRowClick,
    onViewClick,
    onDeleteClick,
    viewPath,
    showDeleteButton,
  }) => {
    // Memoize computed values
    const fileExtension = useMemo(
      () =>
        attachment.filename
          ? attachment.filename.split(".").pop().toUpperCase()
          : "UNKNOWN",
      [attachment.filename],
    );

    const fileSize = useMemo(
      () =>
        attachment.fileSizeBytes
          ? formatFileSize(attachment.fileSizeBytes)
          : "Unknown",
      [attachment.fileSizeBytes],
    );

    const createdDate = useMemo(
      () =>
        attachment.createdAt
          ? formatDateForDisplay(attachment.createdAt)
          : "Unknown",
      [attachment.createdAt],
    );

    // Memoize row click handler
    const handleRowClick = useCallback(() => {
      if (onRowClick) {
        onRowClick(attachment);
      }
    }, [onRowClick, attachment]);

    // Memoize view click handler
    const handleViewClick = useCallback(
      (e) => {
        e.stopPropagation();
        if (onViewClick) {
          onViewClick(e, attachment.id);
        }
      },
      [onViewClick, attachment.id],
    );

    // Memoize delete click handler
    const handleDeleteClick = useCallback(
      (e) => {
        e.stopPropagation();
        if (onDeleteClick) {
          onDeleteClick(e, attachment);
        }
      },
      [onDeleteClick, attachment],
    );

    // Memoize class strings
    const rowClasses = useMemo(
      () =>
        `border-b ${getThemeClasses("card-border")} hover:${getThemeClasses("bg-hover")} cursor-pointer transition-colors`,
      [getThemeClasses],
    );

    const iconClasses = useMemo(
      () => `w-5 h-5 mr-2 ${getThemeClasses("text-muted")}`,
      [getThemeClasses],
    );

    const descriptionClasses = useMemo(
      () => `text-sm ${getThemeClasses("text-secondary")}`,
      [getThemeClasses],
    );

    const deleteButtonClasses = useMemo(
      () =>
        `${getThemeClasses("text-danger")} ${getThemeClasses("hover:text-danger-dark")} ${getThemeClasses("border-danger")} ${getThemeClasses("hover:border-danger-dark")}`,
      [getThemeClasses],
    );

    return (
      <tr className={rowClasses} onClick={handleRowClick}>
        <td className={`py-3 px-4 ${getThemeClasses("text-primary")}`}>
          <div className="flex items-center">
            <DocumentIcon className={iconClasses} />
            <div>
              <div className="font-medium">{attachment.title}</div>
              <div className={descriptionClasses}>{attachment.filename}</div>
            </div>
          </div>
        </td>
        <td className={`py-3 px-4 ${getThemeClasses("text-secondary")}`}>
          <div className="max-w-xs truncate">
            {attachment.description || "No description"}
          </div>
        </td>
        <td className={`py-3 px-4 ${getThemeClasses("text-secondary")}`}>
          <Badge variant="secondary" size="sm">
            {fileExtension}
          </Badge>
        </td>
        <td className={`py-3 px-4 ${getThemeClasses("text-secondary")}`}>
          {fileSize}
        </td>
        <td className={`py-3 px-4 ${getThemeClasses("text-secondary")}`}>
          {createdDate}
        </td>
        <td className="py-3 px-4 text-center">
          <div className="flex justify-center gap-2">
            {viewPath && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewClick}
                icon={EyeIcon}
              >
                View
              </Button>
            )}
            {showDeleteButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteClick}
                icon={TrashIcon}
                className={deleteButtonClasses}
              >
                Delete
              </Button>
            )}
          </div>
        </td>
      </tr>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.attachment.id === nextProps.attachment.id &&
      prevProps.attachment.title === nextProps.attachment.title &&
      prevProps.attachment.filename === nextProps.attachment.filename &&
      prevProps.attachment.description === nextProps.attachment.description &&
      prevProps.attachment.fileSizeBytes ===
        nextProps.attachment.fileSizeBytes &&
      prevProps.attachment.createdAt === nextProps.attachment.createdAt &&
      prevProps.viewPath === nextProps.viewPath &&
      prevProps.showDeleteButton === nextProps.showDeleteButton
    );
  },
);

AttachmentRow.displayName = "AttachmentRow";

/**
 * Reusable AttachmentsView Component - Performance Optimized
 * A complete attachments management view that provides consistent layout and functionality
 * for any entity that supports attachments (staff, customers, events, etc.)
 */

// Inner component that uses the theme hook - optimized for performance
const AttachmentsViewInner = memo(
  function AttachmentsViewInner({
    entityData,
    entityId,
    entityType,
    breadcrumbItems,
    headerConfig,
    fieldSections,
    actionButtons,
    tabs,
    alerts,
    attachments,
    onAttachmentClick,
    onDeleteAttachment,
    onRefreshEntity,
    onUnauthorized,
    isLoading,
    error,
    onErrorClose,
    canAdd,
    addPath,
    viewPath,
    previousCursors,
    onNextClick,
    onPreviousClick,
    className,
  }) {
    const navigate = useNavigate();
    const { getThemeClasses } = useUIXTheme();

    // Use refs to track mounted state and abort controllers
    const isMountedRef = useRef(true);
    const abortControllerRef = useRef(null);

    // Local state for refresh functionality
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Cleanup on unmount
    useEffect(() => {
      isMountedRef.current = true;

      return () => {
        isMountedRef.current = false;

        // Abort any pending requests
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
      };
    }, []);

    // Memoize theme classes for performance
    const themeClasses = useMemo(
      () => ({
        borderPrimary: getThemeClasses("border-primary"),
        textSecondary: getThemeClasses("text-secondary"),
        bgGradientSecondary: getThemeClasses("bg-gradient-secondary"),
        cardBorder: getThemeClasses("card-border"),
        bgCard: getThemeClasses("bg-card"),
        textPrimary: getThemeClasses("text-primary"),
        bgHover: getThemeClasses("bg-hover"),
        textMuted: getThemeClasses("text-muted"),
        bgDisabled: getThemeClasses("bg-disabled"),
        textDanger: getThemeClasses("text-danger"),
        hoverTextDangerDark: getThemeClasses("hover:text-danger-dark"),
        borderDanger: getThemeClasses("border-danger"),
        hoverBorderDangerDark: getThemeClasses("hover:border-danger-dark"),
        // Detail header theme classes
        detailHeaderBg: getThemeClasses("detail-header-bg"),
        detailHeaderText: getThemeClasses("detail-header-text"),
        detailHeaderIcon: getThemeClasses("detail-header-icon"),
        detailButtonBack: getThemeClasses("detail-button-back"),
        detailButtonEdit: getThemeClasses("detail-button-edit"),
      }),
      [getThemeClasses],
    );

    // Handle refresh with proper cleanup
    const handleRefresh = useCallback(async () => {
      if (!onRefreshEntity || isRefreshing || !isMountedRef.current) return;

      // Cancel any previous refresh
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setIsRefreshing(true);
      try {
        await onRefreshEntity(entityId, onUnauthorized);
      } catch (error) {
        if (error.name === "AbortError") {
          if (process.env.NODE_ENV === "development") {
            console.log("Refresh cancelled");
          }
          return;
        }
        if (process.env.NODE_ENV === "development") {
          console.error("Refresh failed:", error);
        }
      } finally {
        if (isMountedRef.current) {
          setIsRefreshing(false);
          abortControllerRef.current = null;
        }
      }
    }, [onRefreshEntity, entityId, onUnauthorized, isRefreshing]);

    // Create status badge component with memoization (reserved for future use)
    const _statusBadge = useMemo(() => {
      if (!entityData) return null;

      if (entityData.isBanned) {
        return (
          <Badge variant="error" size="sm">
            <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
            Banned
          </Badge>
        );
      }

      if (entityData.status === ACTIVE_STATUS) {
        return (
          <Badge variant="primary" size="sm">
            <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
            Active
          </Badge>
        );
      }

      return (
        <Badge variant="secondary" size="sm">
          <ArchiveBoxIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Archived
        </Badge>
      );
    }, [entityData]);

    // Memoize filtered field sections
    const { avatarSection, primaryFieldSections, secondaryFieldSections } =
      useMemo(
        () => ({
          avatarSection: fieldSections?.find(
            (section) => section.type === "avatar",
          ),
          primaryFieldSections:
            fieldSections?.filter((section) => section.column === "primary") ||
            [],
          secondaryFieldSections:
            fieldSections?.filter(
              (section) => section.column === "secondary",
            ) || [],
        }),
        [fieldSections],
      );

    // Memoize attachment data
    const { attachmentResults, attachmentCount, hasNextPage } = useMemo(
      () => ({
        attachmentResults: attachments?.results || [],
        attachmentCount:
          attachments?.count || attachments?.results?.length || 0,
        hasNextPage: attachments?.hasNextPage || false,
      }),
      [attachments],
    );

    // Handler callbacks
    const handleAddAttachment = useCallback(() => {
      if (addPath) {
        navigate(addPath);
      }
    }, [addPath, navigate]);

    const handleViewAttachment = useCallback(
      (e, attachmentId) => {
        if (viewPath) {
          navigate(viewPath.replace("{id}", attachmentId));
        }
      },
      [viewPath, navigate],
    );

    const handleDeleteAttachment = useCallback(
      (e, attachment) => {
        if (onDeleteAttachment) {
          onDeleteAttachment(attachment);
        }
      },
      [onDeleteAttachment],
    );

    const handleRowClick = useCallback(
      (attachment) => {
        if (onAttachmentClick) {
          onAttachmentClick(attachment);
        }
      },
      [onAttachmentClick],
    );

    // Loading state
    if (isLoading && !entityData?.id) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div
                className={`animate-spin rounded-full h-12 w-12 border-b-2 ${themeClasses.borderPrimary} mx-auto`}
              ></div>
              <p
                className={`mt-4 text-sm sm:text-base ${themeClasses.textSecondary}`}
              >
                {headerConfig?.loadingText || `Loading ${entityType}...`}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 ${className}`}
      >
        {/* Breadcrumb */}
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <Breadcrumb items={breadcrumbItems} />
        )}

        {/* Status Alerts */}
        {alerts?.archived &&
          entityData &&
          entityData.status === ARCHIVED_STATUS && (
            <Alert
              type="info"
              message={alerts.archived.message || "This item is archived"}
              icon={alerts.archived.icon}
              className="mb-4"
            />
          )}

        {alerts?.banned && entityData && entityData.isBanned && (
          <Alert
            type="error"
            message={alerts.banned.message || "This item is banned"}
            icon={alerts.banned.icon}
            className="mb-4"
          />
        )}

        {/* Error Display */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={onErrorClose}
            className="mb-4"
          />
        )}

        {/* Main Content with Header */}
        <div className="shadow-sm">
          {entityData ? (
            <div className={`rounded-lg ${themeClasses.detailHeaderBg}`}>
              {/* Header with Actions */}
              <div className="px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                  <h2 className={`text-2xl sm:text-3xl font-bold ${themeClasses.detailHeaderText} flex items-center`}>
                    {headerConfig?.icon && (
                      <headerConfig.icon className={`w-5 sm:w-7 h-5 sm:h-7 mr-2 ${themeClasses.detailHeaderIcon} flex-shrink-0`} />
                    )}
                    {headerConfig?.title || `${entityType} - Attachments`}
                  </h2>
                  {actionButtons && actionButtons.length > 0 && (
                    <div className="flex gap-2 sm:gap-3">
                      {actionButtons.map((button, index) => {
                        const getButtonThemeClass = (variant) => {
                          if (variant === "outline") return themeClasses.detailButtonBack;
                          if (variant === "secondary") return themeClasses.detailButtonEdit;
                          return "";
                        };
                        return button.component ? (
                          <div key={index}>{button.component}</div>
                        ) : (
                          <Button
                            key={index}
                            variant={button.variant}
                            onClick={button.onClick}
                            disabled={button.disabled}
                            icon={button.icon}
                            className={`flex-1 sm:flex-initial ${getButtonThemeClass(button.variant)}`}
                          >
                            {button.label}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Tab Navigation and Content */}
              <div
                className={`${themeClasses.bgCard} border-2 border-t-0 rounded-b-lg ${themeClasses.cardBorder}`}
              >
                {tabs && tabs.length > 0 && <Tabs tabs={tabs} mode="routing" />}

                {/* Entity Summary Layout */}
                <div className="py-4 sm:py-6 md:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-12 items-center xl:items-start justify-center max-w-6xl mx-auto">
                    {/* Avatar Section */}
                    {avatarSection && (
                      <div className="flex-shrink-0 order-1 xl:order-1">
                        {avatarSection.component}
                      </div>
                    )}

                    {/* Primary Content Section */}
                    <div className="flex-grow order-2 xl:order-2 text-center xl:text-left space-y-3 sm:space-y-4 lg:space-y-5">
                      {primaryFieldSections.map((section, index) => (
                        <div key={index} className={section.className || ""}>
                          {section.component}
                        </div>
                      ))}
                    </div>

                    {/* Secondary Information Section */}
                    <div className="flex-shrink-0 order-3 xl:order-3 xl:text-right">
                      {secondaryFieldSections.map((section, index) => (
                        <div key={index} className={section.className || ""}>
                          {section.component}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Attachments Content */}
                <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
                  <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                      <div>
                        <h2
                          className={`text-lg sm:text-xl font-semibold ${themeClasses.textPrimary} mb-1`}
                        >
                          Attachments
                        </h2>
                        <p className={`text-sm ${themeClasses.textSecondary}`}>
                          Manage attachments for this {entityType}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          onClick={handleRefresh}
                          icon={ArrowPathIcon}
                          disabled={isRefreshing}
                          size="sm"
                        >
                          {isRefreshing ? "Refreshing..." : "Refresh"}
                        </Button>
                        {canAdd && addPath && (
                          <Button
                            variant="primary"
                            onClick={handleAddAttachment}
                            icon={PlusCircleIcon}
                            size="sm"
                          >
                            Add Attachment
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Attachments List */}
                    {isLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <div
                          className={`animate-spin rounded-full h-8 w-8 border-b-2 ${themeClasses.borderPrimary}`}
                        ></div>
                      </div>
                    ) : attachmentResults.length > 0 ? (
                      <div className="space-y-4">
                        {/* Attachments Table */}
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr
                                className={`border-b ${themeClasses.cardBorder}`}
                              >
                                <th
                                  className={`text-left py-3 px-4 font-medium ${themeClasses.textPrimary}`}
                                >
                                  Title
                                </th>
                                <th
                                  className={`text-left py-3 px-4 font-medium ${themeClasses.textPrimary}`}
                                >
                                  Description
                                </th>
                                <th
                                  className={`text-left py-3 px-4 font-medium ${themeClasses.textPrimary}`}
                                >
                                  File Type
                                </th>
                                <th
                                  className={`text-left py-3 px-4 font-medium ${themeClasses.textPrimary}`}
                                >
                                  Size
                                </th>
                                <th
                                  className={`text-left py-3 px-4 font-medium ${themeClasses.textPrimary}`}
                                >
                                  Created
                                </th>
                                <th
                                  className={`text-center py-3 px-4 font-medium ${themeClasses.textPrimary}`}
                                >
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {attachmentResults.map((attachment) => (
                                <AttachmentRow
                                  key={attachment.id}
                                  attachment={attachment}
                                  getThemeClasses={getThemeClasses}
                                  onRowClick={handleRowClick}
                                  onViewClick={handleViewAttachment}
                                  onDeleteClick={handleDeleteAttachment}
                                  viewPath={viewPath}
                                  showDeleteButton={!!onDeleteAttachment}
                                />
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        <div
                          className={`flex flex-col sm:flex-row justify-between items-center pt-4 border-t ${themeClasses.cardBorder} gap-4`}
                        >
                          <div
                            className={`text-sm ${themeClasses.textSecondary}`}
                          >
                            Showing {attachmentResults.length} of{" "}
                            {attachmentCount} attachments
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={onPreviousClick}
                              disabled={
                                !previousCursors || previousCursors.length === 0
                              }
                              size="sm"
                              icon={ChevronLeftIcon}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              onClick={onNextClick}
                              disabled={!hasNextPage}
                              size="sm"
                              icon={ChevronRightIcon}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Empty State */
                      <div className="text-center py-12">
                        <div
                          className={`inline-flex items-center justify-center w-16 h-16 ${themeClasses.bgDisabled} rounded-full mb-4`}
                        >
                          <PaperClipIcon
                            className={`w-8 h-8 ${themeClasses.textMuted}`}
                          />
                        </div>
                        <h3
                          className={`text-lg font-medium ${themeClasses.textPrimary} mb-2`}
                        >
                          No attachments found
                        </h3>
                        <p
                          className={`text-sm ${themeClasses.textSecondary} mb-4`}
                        >
                          This {entityType} doesn't have any attachments yet.
                        </p>
                        {canAdd && addPath && (
                          <Button
                            variant="primary"
                            onClick={handleAddAttachment}
                            icon={PlusCircleIcon}
                          >
                            Add First Attachment
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* No Data State */
            <div className={`rounded-lg ${themeClasses.bgGradientSecondary}`}>
              {/* Header */}
              <div className="px-4 sm:px-6 py-4 sm:py-5">
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center">
                  {headerConfig?.icon && (
                    <headerConfig.icon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-white/80 flex-shrink-0" />
                  )}
                  {headerConfig?.notFoundTitle || `${entityType} Not Found`}
                </h2>
              </div>

              {/* Content */}
              <div
                className={`${themeClasses.bgCard} border-2 border-t-0 rounded-b-lg ${themeClasses.cardBorder}`}
              >
                <div className="px-4 sm:px-6 py-8 sm:py-16 text-center">
                  <div
                    className={`inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 ${themeClasses.bgDisabled} rounded-full mb-4`}
                  >
                    <PaperClipIcon
                      className={`w-6 sm:w-8 h-6 sm:h-8 ${themeClasses.textMuted}`}
                    />
                  </div>
                  <h3
                    className={`text-base sm:text-lg font-medium ${themeClasses.textPrimary} mb-2`}
                  >
                    {headerConfig?.notFoundTitle || `${entityType} Not Found`}
                  </h3>
                  <p
                    className={`text-sm sm:text-base ${themeClasses.textSecondary} mb-4 sm:mb-6`}
                  >
                    {headerConfig?.notFoundMessage ||
                      `The ${entityType} you're looking for doesn't exist or you don't have permission to view it.`}
                  </p>
                  {headerConfig?.notFoundAction && (
                    <Button
                      variant="primary"
                      onClick={headerConfig.notFoundAction.onClick}
                      icon={headerConfig.notFoundAction.icon}
                      size="sm"
                    >
                      {headerConfig.notFoundAction.label}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Optimized comparison - only check props that would actually cause visual changes
    return (
      prevProps.entityId === nextProps.entityId &&
      prevProps.entityType === nextProps.entityType &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.isRefreshing === nextProps.isRefreshing &&
      prevProps.className === nextProps.className &&
      prevProps.canAdd === nextProps.canAdd &&
      prevProps.addPath === nextProps.addPath &&
      prevProps.viewPath === nextProps.viewPath &&
      prevProps.editPath === nextProps.editPath &&
      prevProps.deletePath === nextProps.deletePath &&
      prevProps.pageSize === nextProps.pageSize &&
      prevProps.nextCursor === nextProps.nextCursor &&
      // Reference equality for memoized objects (parent should memoize these)
      prevProps.breadcrumbItems === nextProps.breadcrumbItems &&
      prevProps.headerConfig === nextProps.headerConfig &&
      prevProps.fieldSections === nextProps.fieldSections &&
      prevProps.actionButtons === nextProps.actionButtons &&
      prevProps.tabs === nextProps.tabs &&
      prevProps.alerts === nextProps.alerts &&
      prevProps.previousCursors === nextProps.previousCursors &&
      // Check entityData key properties instead of deep equality
      (() => {
        if (prevProps.entityData === nextProps.entityData) return true;
        if (!prevProps.entityData || !nextProps.entityData) return false;
        return (
          prevProps.entityData.id === nextProps.entityData.id &&
          prevProps.entityData.status === nextProps.entityData.status
        );
      })() &&
      // Check attachments key properties
      (() => {
        if (prevProps.attachments === nextProps.attachments) return true;
        if (!prevProps.attachments || !nextProps.attachments) return false;
        return (
          prevProps.attachments.count === nextProps.attachments.count &&
          prevProps.attachments.results?.length === nextProps.attachments.results?.length
        );
      })() &&
      // Simple comparison for error
      prevProps.error === nextProps.error
    );
  },
);

AttachmentsViewInner.displayName = "AttachmentsViewInner";

// Main wrapper component that provides theme context - optimized
const AttachmentsView = memo(
  function AttachmentsView(props) {
    return (
      <UIXThemeProvider>
        <AttachmentsViewInner {...props} />
      </UIXThemeProvider>
    );
  },
  (prevProps, nextProps) => {
    // Simple shallow comparison for wrapper
    return Object.keys(prevProps).every(
      (key) => prevProps[key] === nextProps[key],
    );
  },
);

AttachmentsView.displayName = "AttachmentsView";

export default AttachmentsView;
