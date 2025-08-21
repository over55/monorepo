// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Detail/Comment/List/Page.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
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
import { useStaffManager } from "../../../../../../services/Services";
import { DateTime } from "luxon";

// Import constants
const STAFF_STATUS_ACTIVE = 1;
const STAFF_STATUS_ARCHIVED = 2;

// Maximum comment length constant
const MAX_COMMENT_LENGTH = 5000;

function AdminStaffDetailCommentListPage() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const staffManager = useStaffManager();

  // Use refs to track if initial load has happened
  const hasInitialLoad = useRef(false);

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [staff, setStaff] = useState({});
  const [content, setContent] = useState("");
  const [topAlertMessage, setTopAlertMessage] = useState("");
  const [topAlertStatus, setTopAlertStatus] = useState("");
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch staff details with comments
  const fetchStaffData = useCallback(
    async (forceRefresh = false) => {
      try {
        if (forceRefresh) {
          setRefreshing(true);
        } else {
          setFetching(true);
        }
        setErrors({});

        const data = await staffManager.getStaffDetail(aid, onUnauthorized);
        console.log("Staff detail fetched:", data);
        setStaff(data);
        setLastFetchTime(new Date());
      } catch (error) {
        console.error("Failed to fetch staff detail:", error);
        setErrors(error);
      } finally {
        setFetching(false);
        setRefreshing(false);
      }
    },
    [aid, staffManager, onUnauthorized],
  );

  // Submit new comment
  const onSubmitClick = async () => {
    console.log("onSubmitClick: Beginning...");

    if (!content || !content.trim()) {
      setErrors({ content: "Comment content is required" });
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
      await staffManager.createStaffComment(aid, content, onUnauthorized);

      setContent("");
      setTopAlertMessage("Comment created successfully");
      setTopAlertStatus("success");

      // Refresh staff data to get updated comments
      await fetchStaffData(true);

      setTimeout(() => {
        setTopAlertMessage("");
        setTopAlertStatus("");
      }, 3000);

      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error creating comment:", error);
      setErrors(error);
      setTopAlertMessage("Failed to create comment");
      setTopAlertStatus("error");
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    fetchStaffData(true);
  };

  // Format helpers
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return DateTime.fromISO(dateString).toLocaleString(DateTime.DATETIME_MED);
    } catch {
      return dateString;
    }
  };

  const formatLastFetchTime = () => {
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
  };

  // Initial load
  useEffect(() => {
    if (!hasInitialLoad.current) {
      window.scrollTo(0, 0);
      fetchStaffData();
      hasInitialLoad.current = true;
    }
  }, [fetchStaffData]);

  if (isFetching && !staff.id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading staff comments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to="/admin/staff"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <BriefcaseIcon className="w-4 h-4 mr-2" />
                  Staff
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <InformationCircleIcon className="w-4 h-4 mr-2" />
                Detail
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BriefcaseIcon className="w-8 h-8 mr-3 text-blue-600" />
              Staff Member
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              View and manage comments
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {staff && staff.status === STAFF_STATUS_ARCHIVED && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This staff member is archived
        </div>
      )}

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
            <button
              onClick={() => {
                setTopAlertMessage("");
                setTopAlertStatus("");
              }}
              className="text-current hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {errors &&
        typeof errors === "object" &&
        Object.keys(errors).length > 0 &&
        !topAlertMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2 mt-0.5" />
              <div className="flex-1">
                <strong>Error:</strong>
                <ul className="mt-2 list-disc list-inside">
                  {Object.entries(errors).map(([key, value]) => (
                    <li key={key}>
                      {key}: {value}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setErrors({})}
                className="text-red-700 hover:text-red-900 ml-3"
              >
                ×
              </button>
            </div>
          </div>
        )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {staff && (
          <>
            {/* Header with Title and Refresh Button */}
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                    <ChatBubbleLeftRightIcon className="w-7 h-7 mr-2 text-blue-600" />
                    Comments
                  </h2>
                  {lastFetchTime && (
                    <span className="text-sm text-gray-500 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {formatLastFetchTime()}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <ArrowPathIcon
                    className={`w-5 h-5 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <Link
                  to={`/admin/staff/${aid}`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Summary
                </Link>
                <Link
                  to={`/admin/staff/${aid}/detail`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Detail
                </Link>
                <div className="border-b-2 border-blue-600 py-4 px-1 text-base font-medium text-blue-600">
                  Comments
                </div>
                <Link
                  to={`/admin/staff/${aid}/attachments`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Attachments
                </Link>
                <Link
                  to={`/admin/staff/${aid}/more`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center"
                >
                  More
                  <EllipsisHorizontalIcon className="w-5 h-5 ml-1" />
                </Link>
              </nav>
            </div>

            <div className="p-6">
              {/* Add Comment Form */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Add New Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  placeholder="Write your comment here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={
                    staff.status === STAFF_STATUS_ARCHIVED || isSubmitting
                  }
                  className={`block w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y ${
                    errors && errors.content
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  } ${
                    staff.status === STAFF_STATUS_ARCHIVED
                      ? "bg-gray-100 cursor-not-allowed"
                      : "bg-white"
                  }`}
                  rows="4"
                  maxLength={MAX_COMMENT_LENGTH}
                />
                {errors && errors.content && (
                  <p className="mt-2 text-sm text-red-600">{errors.content}</p>
                )}
                <div className="flex justify-between items-center mt-2">
                  <span
                    className={`text-sm ${
                      content.length > MAX_COMMENT_LENGTH * 0.9
                        ? "text-red-600"
                        : "text-gray-500"
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
                  onClick={onSubmitClick}
                  disabled={
                    staff.status === STAFF_STATUS_ARCHIVED ||
                    isSubmitting ||
                    !content.trim()
                  }
                  className={`mt-4 inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-base font-medium text-white transition-colors ${
                    staff.status === STAFF_STATUS_ARCHIVED ||
                    isSubmitting ||
                    !content.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <PlusCircleIcon className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Comment"}
                </button>
              </div>

              {/* Comments List */}
              {isFetching || isRefreshing ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                      {isRefreshing
                        ? "Refreshing comments..."
                        : "Loading comments..."}
                    </p>
                  </div>
                </div>
              ) : staff.comments && staff.comments.length > 0 ? (
                <>
                  {/* Comments Display */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Comments for {staff.name || "Staff Member"} (
                      {staff.comments.length})
                    </h3>
                    <div className="space-y-4">
                      {staff.comments.map((comment, index) => (
                        <div
                          key={comment.id || `comment-${index}`}
                          className="bg-gray-50 rounded-lg border border-gray-200 p-4"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                              <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                              <strong className="text-blue-600">
                                {comment.createdByUserName || "System"}
                              </strong>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              {formatDateTime(comment.createdAt)}
                            </div>
                          </div>
                          <div className="bg-white rounded-md p-4 border border-gray-100">
                            <p className="text-gray-900 whitespace-pre-wrap break-words">
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
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Comments Yet
                  </h3>
                  <p className="text-gray-500">
                    Be the first to add a comment about this staff member.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-start mt-8 pt-6 border-t border-gray-200">
                <Link to="/admin/staff">
                  <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <ChevronLeftIcon className="w-5 h-5 mr-2" />
                    Back to Staff
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}

        {!staff && !isFetching && (
          <div className="px-6 py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <BriefcaseIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Staff Member Not Found
            </h3>
            <p className="text-gray-500 mb-6">
              The staff member you're looking for doesn't exist or you don't
              have permission to view it.
            </p>
            <Link to="/admin/staff">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to Staff
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminStaffDetailCommentListPage;
