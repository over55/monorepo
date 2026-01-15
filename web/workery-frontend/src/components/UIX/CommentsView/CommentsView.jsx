// File Path: src/components/UIX/CommentsView/CommentsView.jsx
// UIX Mobile Optimizations Applied
// Reusable CommentsView component for entity comment management - Performance Optimized

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  memo,
} from "react";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
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

// Development-only logging
const DEBUG = process.env.NODE_ENV === 'development';
const log = (...args) => DEBUG && console.log(...args);
const logError = (...args) => console.error(...args); // Keep errors in production

// Constants
const ACTIVE_STATUS = 1;
const ARCHIVED_STATUS = 2;
const MAX_COMMENT_LENGTH = 5000;

/**
 * Reusable CommentsView Component - Performance Optimized
 * A complete comments management view that provides consistent layout and functionality
 * for any entity that supports comments (staff, customers, orders, etc.)
 *
 * Performance optimizations:
 * - React.memo for component memoization
 * - useCallback for all event handlers
 * - useMemo for all derived data
 * - AbortController for request cancellation
 * - Refs for lifecycle management
 * - Conditional development logging
 * - Optimized memo comparison (no JSON.stringify)
 */

// Memoized Comment Item Component
const CommentItem = memo(
  ({ comment, getThemeClasses }) => {
    const containerClasses = useMemo(
      () =>
        `${getThemeClasses("card-header-bg")} rounded-lg border ${getThemeClasses("card-border")} p-4`,
      [getThemeClasses],
    );

    const userIconClasses = useMemo(
      () => `w-5 h-5 mr-2 ${getThemeClasses("link-primary")}`,
      [getThemeClasses],
    );

    const dateClasses = useMemo(
      () => `text-sm ${getThemeClasses("text-secondary")} flex items-center`,
      [getThemeClasses],
    );

    const contentContainerClasses = useMemo(
      () =>
        `${getThemeClasses("bg-card")} rounded-md p-4 border ${getThemeClasses("border-secondary")}`,
      [getThemeClasses],
    );

    const contentClasses = useMemo(
      () =>
        `${getThemeClasses("text-primary")} whitespace-pre-wrap break-words text-sm sm:text-base lg:text-lg`,
      [getThemeClasses],
    );

    return (
      <div className={containerClasses}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <UserIcon className={userIconClasses} />
            <strong className={getThemeClasses("link-primary")}>
              {comment.createdByUserName || "System"}
            </strong>
          </div>
          <div className={dateClasses}>
            <ClockIcon className="w-4 h-4 mr-1" />
            {formatDateForDisplay(comment.createdAt)}
          </div>
        </div>
        <div className={contentContainerClasses}>
          <p className={contentClasses}>{comment.content}</p>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.comment.id === nextProps.comment.id &&
      prevProps.comment.content === nextProps.comment.content &&
      prevProps.comment.createdByUserName ===
        nextProps.comment.createdByUserName &&
      prevProps.comment.createdAt === nextProps.comment.createdAt
    );
  },
);

CommentItem.displayName = "CommentItem";

// Inner component that uses the theme hook - optimized for performance
const CommentsViewInner = memo(
  function CommentsViewInner({
    entityData,
    entityId,
    entityType,
    breadcrumbItems,
    headerConfig,
    fieldSections,
    actionButtons,
    tabs,
    alerts,
    onCreateComment,
    onRefreshEntity,
    onUnauthorized,
    isLoading,
    className,
    statusConfig,
  }) {
    const { getThemeClasses } = useUIXTheme();

    // Use refs to track mounted state and abort controllers
    const isMountedRef = useRef(true);
    const alertTimerRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Component states
    const [errors, setErrors] = useState({});
    const [isRefreshing, setRefreshing] = useState(false);
    const [isSubmitting, setSubmitting] = useState(false);
    const [content, setContent] = useState("");
    const [topAlertMessage, setTopAlertMessage] = useState("");
    const [topAlertStatus, setTopAlertStatus] = useState("");

    // Cleanup on unmount
    useEffect(() => {
      isMountedRef.current = true;

      return () => {
        isMountedRef.current = false;

        // Clear any pending timers
        if (alertTimerRef.current) {
          clearTimeout(alertTimerRef.current);
          alertTimerRef.current = null;
        }

        // Abort any pending requests
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
      };
    }, []);

    // Memoize theme classes
    const themeClasses = useMemo(
      () => ({
        borderPrimary: getThemeClasses("border-primary"),
        textSecondary: getThemeClasses("text-secondary"),
        bgGradientSecondary: getThemeClasses("bg-gradient-secondary"),
        cardBorder: getThemeClasses("card-border"),
        cardHeaderBg: getThemeClasses("card-header-bg"),
        textPrimary: getThemeClasses("text-primary"),
        inputBorder: getThemeClasses("input-border"),
        inputFocusRing: getThemeClasses("input-focus-ring"),
        inputBg: getThemeClasses("input-bg"),
        inputBorderError: getThemeClasses("input-border-error"),
        inputBgError: getThemeClasses("input-bg-error"),
        inputFocusRingError: getThemeClasses("input-focus-ring-error"),
        linkPrimary: getThemeClasses("link-primary"),
        bgCard: getThemeClasses("bg-card"),
        borderSecondary: getThemeClasses("border-secondary"),
        textMuted: getThemeClasses("text-muted"),
        textDanger: getThemeClasses("text-danger"),
        textWarning: getThemeClasses("text-warning"),
        bgDisabled: getThemeClasses("bg-disabled"),
        // Detail header theme classes
        detailHeaderBg: getThemeClasses("detail-header-bg"),
        detailHeaderText: getThemeClasses("detail-header-text"),
        detailHeaderIcon: getThemeClasses("detail-header-icon"),
        detailButtonBack: getThemeClasses("detail-button-back"),
        detailButtonEdit: getThemeClasses("detail-button-edit"),
      }),
      [getThemeClasses],
    );

    // Refresh handler with proper cleanup
    const _handleRefresh = useCallback(async () => {
      if (!isMountedRef.current || !onRefreshEntity || !entityId) return;

      // Cancel any previous refresh
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setRefreshing(true);

      try {
        await onRefreshEntity(entityId, onUnauthorized);
      } catch (err) {
        if (err.name === "AbortError") {
          log("Refresh cancelled");
          return;
        }
        logError("Refresh error:", err);
      } finally {
        if (isMountedRef.current) {
          setRefreshing(false);
          abortControllerRef.current = null;
        }
      }
    }, [onRefreshEntity, entityId, onUnauthorized]);

    // Optimized submit handler
    const onSubmitClick = useCallback(async () => {
      if (!isMountedRef.current || !content?.trim()) {
        if (!content?.trim()) {
          setErrors({ content: "Comment content is required" });
        }
        return;
      }

      if (content.length > MAX_COMMENT_LENGTH) {
        setErrors({
          content: `Comment must be less than ${MAX_COMMENT_LENGTH} characters`,
        });
        return;
      }

      setErrors({});
      setSubmitting(true);

      try {
        await onCreateComment(entityId, content, onUnauthorized);

        if (!isMountedRef.current) return;

        setContent("");
        setTopAlertMessage("Comment created successfully");
        setTopAlertStatus("success");

        // Refresh entity data
        if (onRefreshEntity) {
          await onRefreshEntity(entityId, onUnauthorized);
        }

        // Clear alert after delay
        if (alertTimerRef.current) {
          clearTimeout(alertTimerRef.current);
        }

        alertTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setTopAlertMessage("");
            setTopAlertStatus("");
            alertTimerRef.current = null;
          }
        }, 3000);

        window.scrollTo(0, 0);
      } catch (err) {
        if (!isMountedRef.current) return;

        logError("Error creating comment:", err);
        setErrors(err);
        setTopAlertMessage("Failed to create comment");
        setTopAlertStatus("error");
        window.scrollTo(0, 0);
      } finally {
        if (isMountedRef.current) {
          setSubmitting(false);
        }
      }
    }, [content, onCreateComment, entityId, onUnauthorized, onRefreshEntity]);

    // Memoize content change handler
    const handleContentChange = useCallback((e) => {
      setContent(e.target.value);
    }, []);

    // Memoize close handlers
    const handleCloseTopAlert = useCallback(() => {
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
        alertTimerRef.current = null;
      }
      setTopAlertMessage("");
      setTopAlertStatus("");
    }, []);

    const handleCloseErrors = useCallback(() => {
      setErrors({});
    }, []);

    // Create status badge component
    const _statusBadge = useMemo(() => {
      if (!entityData) return null;

      if (entityData.isBanned) {
        return (
          <Badge variant="error" size="sm">
            <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
            {statusConfig?.bannedLabel || "Banned"}
          </Badge>
        );
      }

      if (entityData.status === 1) {
        return (
          <Badge variant="primary" size="sm">
            <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
            {statusConfig?.activeLabel || "Active"}
          </Badge>
        );
      }

      return (
        <Badge variant="secondary" size="sm">
          <ArchiveBoxIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          {statusConfig?.inactiveLabel || "Archived"}
        </Badge>
      );
    }, [entityData, statusConfig]);

    // Memoize field sections
    const { primaryFieldSections, secondaryFieldSections, avatarSection } =
      useMemo(() => {
        const primary =
          fieldSections?.filter((section) => section.column === "primary") ||
          [];
        const secondary =
          fieldSections?.filter((section) => section.column === "secondary") ||
          [];
        const avatar = fieldSections?.find(
          (section) => section.type === "avatar",
        );

        return {
          primaryFieldSections: primary,
          secondaryFieldSections: secondary,
          avatarSection: avatar,
        };
      }, [fieldSections]);

    // Memoize sorted comments
    const sortedComments = useMemo(() => {
      if (!entityData?.comments) return [];
      return [...entityData.comments];
    }, [entityData?.comments]);

    // Memoize text area classes
    const textareaClasses = useMemo(() => {
      if (errors.content) {
        return `block w-full px-4 py-3 border rounded-lg resize-y text-sm sm:text-base lg:text-lg ${themeClasses.inputBorderError} ${themeClasses.inputBgError} ${themeClasses.inputFocusRingError}`;
      }
      return `block w-full px-4 py-3 border rounded-lg resize-y text-sm sm:text-base lg:text-lg ${themeClasses.inputBg} ${themeClasses.inputBorder} ${themeClasses.inputFocusRing}`;
    }, [errors.content, themeClasses.inputBorder, themeClasses.inputFocusRing, themeClasses.inputBg, themeClasses.inputBorderError, themeClasses.inputBgError, themeClasses.inputFocusRingError]);

    // Memoize character count classes
    const charCountClasses = useMemo(() => {
      if (content.length > MAX_COMMENT_LENGTH * 0.9) {
        return `text-sm ${themeClasses.textDanger}`;
      }
      return `text-sm ${themeClasses.textSecondary}`;
    }, [content.length, themeClasses.textSecondary, themeClasses.textDanger]);

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
                {headerConfig?.loadingText || "Loading details..."}
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
        {alerts?.archived && entityData && entityData.status === 2 && (
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
        {errors &&
          typeof errors === "object" &&
          Object.keys(errors).length > 0 &&
          !topAlertMessage && (
            <Alert
              type="error"
              message={`Error loading ${entityType} details`}
              onClose={handleCloseErrors}
              className="mb-4"
            />
          )}

        {/* Main Content with Header */}
        <div className="shadow-sm">
          {entityData && (
            <div className={`rounded-lg ${themeClasses.detailHeaderBg}`}>
              {/* Header with Actions */}
              <div className="px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                  <h2 className={`text-2xl sm:text-3xl font-bold ${themeClasses.detailHeaderText} flex items-center`}>
                    {headerConfig?.icon && (
                      <headerConfig.icon className={`w-5 sm:w-7 h-5 sm:h-7 mr-2 ${themeClasses.detailHeaderIcon} flex-shrink-0`} />
                    )}
                    {headerConfig?.title || `${entityType} - Comments`}
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

              {/* Tab Navigation */}
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

                    {/* Main Content Container */}
                    <div className="flex-1 w-full xl:flex xl:gap-8 space-y-4 sm:space-y-6 xl:space-y-0 order-2 xl:order-2">
                      {/* Primary Info Column */}
                      <div className="xl:flex-1 xl:min-w-0 text-center xl:text-left">
                        {primaryFieldSections.map((section, index) => (
                          <div key={index} className={section.className || ""}>
                            {section.component}
                          </div>
                        ))}
                      </div>

                      {/* Secondary Info Column */}
                      <div className="xl:flex-1 xl:min-w-0 space-y-3 sm:space-y-4 lg:space-y-6 text-center xl:text-left">
                        {secondaryFieldSections.map((section, index) => (
                          <div key={index} className={section.className || ""}>
                            {section.component}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div
                    className={`mt-8 border-t ${themeClasses.cardBorder} pt-8`}
                  >
                    {/* Top Alert Message */}
                    {topAlertMessage && (
                      <Alert
                        type={
                          topAlertStatus === "success" ? "success" : "error"
                        }
                        message={topAlertMessage}
                        onClose={handleCloseTopAlert}
                        className="mb-6"
                      />
                    )}

                    {/* Add Comment Form */}
                    {entityData &&
                      entityData.status !== ARCHIVED_STATUS &&
                      onCreateComment && (
                        <div
                          className={`${themeClasses.cardHeaderBg} rounded-lg p-6 mb-8 border ${themeClasses.cardBorder}`}
                        >
                          <label
                            htmlFor="comment-content-textarea"
                            className={`block text-sm sm:text-base lg:text-lg font-medium ${themeClasses.textPrimary} mb-3`}
                          >
                            Add New Comment{" "}
                            <span className={themeClasses.textDanger}>*</span>
                          </label>
                          <textarea
                            id="comment-content-textarea"
                            name="content"
                            placeholder="Write your comment here..."
                            value={content}
                            onChange={handleContentChange}
                            disabled={isSubmitting}
                            className={textareaClasses}
                            rows="4"
                            maxLength={MAX_COMMENT_LENGTH}
                            aria-describedby="comment-content-help comment-content-error"
                            aria-invalid={!!errors.content}
                          />
                          {errors.content && (
                            <p
                              id="comment-content-error"
                              className={`mt-2 text-sm ${themeClasses.textDanger}`}
                            >
                              {errors.content}
                            </p>
                          )}
                          <div className="flex justify-between items-center mt-2">
                            <span
                              id="comment-content-help"
                              className={charCountClasses}
                            >
                              {content.length}/{MAX_COMMENT_LENGTH} characters
                              {content.length > MAX_COMMENT_LENGTH * 0.9 &&
                                content.length < MAX_COMMENT_LENGTH && (
                                  <span className={`${themeClasses.textWarning} ml-2`}>
                                    Approaching limit
                                  </span>
                                )}
                            </span>
                          </div>
                          <Button
                            onClick={onSubmitClick}
                            disabled={isSubmitting || !content.trim()}
                            variant="primary"
                            icon={PlusCircleIcon}
                            className="mt-4"
                            aria-label="Submit new comment"
                          >
                            {isSubmitting ? "Saving..." : "Save Comment"}
                          </Button>
                        </div>
                      )}

                    {/* Comments List */}
                    {isRefreshing ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div
                            className={`animate-spin rounded-full h-10 w-10 border-b-2 ${themeClasses.borderPrimary} mx-auto`}
                          ></div>
                          <p className={`mt-4 ${themeClasses.textSecondary}`}>
                            Refreshing comments...
                          </p>
                        </div>
                      </div>
                    ) : sortedComments.length > 0 ? (
                      <div className="mb-8">
                        <h3
                          className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}
                        >
                          Comments for{" "}
                          {entityData.name ||
                            `${entityData.firstName} ${entityData.lastName}` ||
                            `${entityType} #${entityData.id}`}{" "}
                          ({sortedComments.length})
                        </h3>
                        <div className="space-y-4">
                          {sortedComments.map((comment, index) => (
                            <CommentItem
                              key={comment.id || `comment-${index}`}
                              comment={comment}
                              index={index}
                              getThemeClasses={getThemeClasses}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`text-center py-16 ${themeClasses.cardHeaderBg} rounded-lg`}
                      >
                        <ChatBubbleLeftRightIcon
                          className={`w-12 h-12 ${themeClasses.textMuted} mx-auto mb-4`}
                        />
                        <h3
                          className={`text-lg font-medium ${themeClasses.textPrimary} mb-2`}
                        >
                          No Comments Yet
                        </h3>
                        <p className={themeClasses.textSecondary}>
                          Be the first to add a comment about this {entityType}.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Data State */}
          {!entityData && !isLoading && (
            <div className="px-4 sm:px-6 py-8 sm:py-16 text-center">
              <div
                className={`inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 ${themeClasses.bgDisabled} rounded-full mb-4`}
              >
                <UserIcon
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
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Optimized comparison - avoid expensive JSON.stringify
    // Only re-render when critical props change
    if (
      prevProps.entityId !== nextProps.entityId ||
      prevProps.entityType !== nextProps.entityType ||
      prevProps.isLoading !== nextProps.isLoading ||
      prevProps.className !== nextProps.className ||
      prevProps.error !== nextProps.error
    ) {
      return false; // Props changed, re-render
    }

    // Check entityData - compare key properties instead of deep equality
    if (prevProps.entityData !== nextProps.entityData) {
      if (!prevProps.entityData || !nextProps.entityData) return false;
      if (
        prevProps.entityData.id !== nextProps.entityData.id ||
        prevProps.entityData.status !== nextProps.entityData.status ||
        prevProps.entityData.isBanned !== nextProps.entityData.isBanned ||
        prevProps.entityData.comments?.length !== nextProps.entityData.comments?.length
      ) {
        return false;
      }
    }

    // For arrays/objects passed from parent, use reference equality
    // Parent should memoize these to prevent unnecessary re-renders
    if (
      prevProps.breadcrumbItems !== nextProps.breadcrumbItems ||
      prevProps.headerConfig !== nextProps.headerConfig ||
      prevProps.fieldSections !== nextProps.fieldSections ||
      prevProps.actionButtons !== nextProps.actionButtons ||
      prevProps.tabs !== nextProps.tabs ||
      prevProps.alerts !== nextProps.alerts ||
      prevProps.statusConfig !== nextProps.statusConfig ||
      prevProps.typeMap !== nextProps.typeMap
    ) {
      return false;
    }

    // Functions should be stable via useCallback in parent
    if (
      prevProps.onCreateComment !== nextProps.onCreateComment ||
      prevProps.onRefreshEntity !== nextProps.onRefreshEntity ||
      prevProps.onUnauthorized !== nextProps.onUnauthorized ||
      prevProps.onErrorClose !== nextProps.onErrorClose
    ) {
      return false;
    }

    return true; // No changes, skip re-render
  },
);

CommentsViewInner.displayName = "CommentsViewInner";

// Main wrapper component that provides theme context - optimized
const CommentsView = memo(
  function CommentsView(props) {
    return (
      <UIXThemeProvider>
        <CommentsViewInner {...props} />
      </UIXThemeProvider>
    );
  },
  (prevProps, nextProps) => {
    // Efficient shallow comparison for wrapper - check key props only
    const keys = Object.keys(prevProps);

    // Quick length check
    if (keys.length !== Object.keys(nextProps).length) {
      return false;
    }

    // Check each prop with reference equality
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }

    return true;
  },
);

CommentsView.displayName = "CommentsView";

export default CommentsView;
export { CommentsView };
