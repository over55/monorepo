// File: monorepo/web/frontend/src/components/business/views/CommentsView.jsx

import React, { useCallback } from "react";
import { Link } from "react-router";
import {
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { formatDateTime } from "../../../services/Helpers/DateFormatter";
import { DateTime } from "luxon";
import DetailView from "./DetailView.jsx";
import { useUIXTheme } from "../../UIX";

// Maximum comment length constant
const MAX_COMMENT_LENGTH = 5000;

/**
 * Reusable CommentsView component for displaying and managing comments
 * Used for staff, customer, and other entity comment pages
 *
 * @param {object} item - The main entity (staff, customer, etc.)
 * @param {string} itemType - Type of item (e.g., "Staff Member", "Customer")
 * @param {React.Component} itemIcon - Icon component for the item type
 * @param {string} basePath - Base path for navigation (e.g., "/admin/staff")
 * @param {string} itemId - ID of the item for routing
 * @param {Array} tabItems - Array of tab navigation items
 * @param {Array} breadcrumbs - Breadcrumb navigation items
 * @param {boolean} loading - Loading state
 * @param {boolean} refreshing - Refreshing state
 * @param {boolean} submitting - Submitting state
 * @param {string} error - Error message if any
 * @param {function} onErrorClear - Function to clear error
 * @param {string} content - Comment content input value
 * @param {function} onContentChange - Function to handle content change
 * @param {function} onSubmitComment - Function to submit new comment
 * @param {function} onRefresh - Function to refresh comments
 * @param {Date} lastFetchTime - Last fetch timestamp
 * @param {string} topAlertMessage - Top alert message
 * @param {string} topAlertStatus - Top alert status (success/error)
 * @param {function} onTopAlertClear - Function to clear top alert
 * @param {boolean} canComment - Whether user can add comments
 * @param {React.Node} additionalActions - Additional action buttons
 */
function CommentsView({
  item = null,
  itemType = "Item",
  itemIcon: ItemIcon = UserIcon,
  basePath = "/admin",
  itemId,
  tabItems = [],
  breadcrumbs = [],
  loading = false,
  refreshing = false,
  submitting = false,
  error = null,
  onErrorClear = null,
  content = "",
  onContentChange,
  onSubmitComment,
  onRefresh,
  lastFetchTime = null,
  topAlertMessage = "",
  topAlertStatus = "",
  onTopAlertClear = null,
  canComment = true,
  additionalActions = null,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Format last fetch time
  const formatLastFetchTime = useCallback(() => {
    if (!lastFetchTime) return null;
    const now = DateTime.now();
    const fetchTime = DateTime.fromJSDate(lastFetchTime);
    const diff = now.diff(fetchTime, ["minutes", "seconds"]);

    if (diff.minutes >= 1) {
      return `Last updated ${Math.floor(diff.minutes)} minute${
        Math.floor(diff.minutes) !== 1 ? "s" : ""
      } ago`;
    } else {
      return `Last updated ${Math.floor(diff.seconds)} seconds ago`;
    }
  }, [lastFetchTime]);

  // Parse errors object for form validation
  const hasContentError = error && typeof error === "object" && error.content;
  const hasGeneralErrors = error && typeof error === "object" && Object.keys(error).length > 0 && !topAlertMessage;

  // Header actions for the DetailView
  const headerActions = (
    <div className="flex items-center gap-4">
      {lastFetchTime && (
        <span className={`text-sm ${getThemeClasses("text-muted")} flex items-center`}>
          <ClockIcon className="w-4 h-4 mr-1" />
          {formatLastFetchTime()}
        </span>
      )}
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className={`inline-flex items-center px-5 py-2.5 border ${getThemeClasses("border-secondary")} rounded-lg text-base font-medium ${getThemeClasses("text-secondary")} ${getThemeClasses("bg-card")} hover:${getThemeClasses("bg-disabled")} transition-colors disabled:opacity-50`}
      >
        <ArrowPathIcon
          className={`w-5 h-5 mr-2 ${refreshing ? "animate-spin" : ""}`}
        />
        {refreshing ? "Refreshing..." : "Refresh"}
      </button>
    </div>
  );

  return (
    <DetailView
      item={item}
      itemType={itemType}
      itemIcon={ItemIcon}
      detailType="Comments"
      detailIcon={ChatBubbleLeftRightIcon}
      basePath={basePath}
      itemId={itemId}
      tabItems={tabItems}
      activeTab="Comments"
      breadcrumbs={breadcrumbs}
      loading={loading}
      error={hasGeneralErrors ? error : null}
      onErrorClear={onErrorClear}
      showEditButton={false}
      backPath={basePath}
      backLabel={`Back to ${itemType}`}
      headerActions={headerActions}
    >
      {/* Top Alert Message */}
      {topAlertMessage && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg ${
            topAlertStatus === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {topAlertStatus === "success" ? (
                <CheckCircleIcon className="w-5 h-5 mr-2" />
              ) : (
                <XCircleIcon className="w-5 h-5 mr-2" />
              )}
              <span>{topAlertMessage}</span>
            </div>
            {onTopAlertClear && (
              <button
                onClick={onTopAlertClear}
                className="text-current hover:opacity-70"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Comment Form */}
      {canComment && (
        <div className={`${getThemeClasses("bg-disabled")} rounded-lg p-6 mb-8 border ${getThemeClasses("border-secondary")}`}>
          <label className={`block text-sm font-medium ${getThemeClasses("text-secondary")} mb-3`}>
            Add New Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            placeholder="Write your comment here..."
            value={content}
            onChange={(e) => onContentChange && onContentChange(e.target.value)}
            disabled={submitting || !canComment}
            className={`block w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y ${
              hasContentError
                ? "border-red-300 bg-red-50"
                : getThemeClasses("border-secondary")
            } ${
              !canComment
                ? `${getThemeClasses("bg-disabled")} cursor-not-allowed`
                : getThemeClasses("bg-card")
            }`}
            rows="4"
            maxLength={MAX_COMMENT_LENGTH}
          />
          {hasContentError && (
            <p className="mt-2 text-sm text-red-600">{error.content}</p>
          )}
          <div className="flex justify-between items-center mt-2">
            <span
              className={`text-sm ${
                content.length > MAX_COMMENT_LENGTH * 0.9
                  ? "text-red-600"
                  : getThemeClasses("text-muted")
              }`}
            >
              {content.length}/{MAX_COMMENT_LENGTH} characters
              {content.length > MAX_COMMENT_LENGTH * 0.9 &&
                content.length < MAX_COMMENT_LENGTH && (
                  <span className="text-yellow-600 ml-2">
                    Approaching limit
                  </span>
                )}
            </span>
          </div>
          <button
            onClick={onSubmitComment}
            disabled={submitting || !content.trim() || !canComment}
            className={`mt-4 inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-base font-medium text-white transition-colors ${
              submitting || !content.trim() || !canComment
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            {submitting ? "Saving..." : "Save Comment"}
          </button>
        </div>
      )}

      {/* Comments List */}
      {loading || refreshing ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className={`mt-4 ${getThemeClasses("text-secondary")}`}>
              {refreshing
                ? "Refreshing comments..."
                : "Loading comments..."}
            </p>
          </div>
        </div>
      ) : item && item.comments && item.comments.length > 0 ? (
        <>
          {/* Comments Display */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold ${getThemeClasses("text-primary")} mb-4`}>
              Comments for {item.name || itemType} ({item.comments.length})
            </h3>
            <div className="space-y-4">
              {item.comments.map((comment, index) => (
                <div
                  key={comment.id || `comment-${index}`}
                  className={`${getThemeClasses("bg-disabled")} rounded-lg border ${getThemeClasses("border-secondary")} p-4`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                      <strong className="text-blue-600">
                        {comment.createdByUserName || "System"}
                      </strong>
                    </div>
                    <div className={`text-sm ${getThemeClasses("text-muted")} flex items-center`}>
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {formatDateTime(comment.createdAt)}
                    </div>
                  </div>
                  <div className={`${getThemeClasses("bg-card")} rounded-md p-4 border ${getThemeClasses("border-secondary")}`}>
                    <p className={`${getThemeClasses("text-primary")} whitespace-pre-wrap break-words`}>
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        // No comments message
        <div className={`text-center py-16 ${getThemeClasses("bg-disabled")} rounded-lg`}>
          <ChatBubbleLeftRightIcon className={`w-12 h-12 ${getThemeClasses("text-muted")} mx-auto mb-4`} />
          <h3 className={`text-lg font-medium ${getThemeClasses("text-primary")} mb-2`}>
            No Comments Yet
          </h3>
          <p className={getThemeClasses("text-muted")}>
            Be the first to add a comment about this {itemType.toLowerCase()}.
          </p>
        </div>
      )}

      {/* Additional Actions */}
      {additionalActions}
    </DetailView>
  );
}

export default CommentsView;