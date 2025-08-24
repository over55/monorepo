// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/Comment/List/Page.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  ClockIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  ClipboardDocumentListIcon,
  PaperClipIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  FireIcon,
  DocumentTextIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import {
  useOrderManager,
  useCommentManager,
} from "../../../../../../services/Services";
import { formatDateForDisplay } from "../../../../../../services/Helpers/DateFormatter";
import { ORDER_STATUS_ARCHIVED } from "../../../../../../constants/Order";
import { DateTime } from "luxon";

// Constants for comment belonging types (from backend)
const BELONGS_TO_CUSTOMER = 1;
const BELONGS_TO_ASSOCIATE = 2;
const BELONGS_TO_ORDER = 3;
const BELONGS_TO_STAFF = 4;

function AdminOrderDetailCommentListPage() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const orderManager = useOrderManager();
  const commentManager = useCommentManager();

  // Use refs to track if initial load has happened
  const hasInitialLoad = useRef(false);
  const lastFetchParams = useRef(null);

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState({});
  const [commentList, setCommentList] = useState({
    results: [],
    nextCursor: "",
    hasNextPage: false,
  });
  const [pageSize, setPageSize] = useState(25);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");
  const [sortByValue, setSortByValue] = useState("created_at,DESC");
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [content, setContent] = useState("");
  const [topAlertMessage, setTopAlertMessage] = useState("");
  const [topAlertStatus, setTopAlertStatus] = useState("");

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch order details
  const fetchOrderDetail = useCallback(async () => {
    try {
      const data = await orderManager.getOrderDetail(oid, onUnauthorized);
      setOrder(data);
      // Set comments from order data if available
      if (data.comments) {
        setCommentList({
          results: data.comments,
          nextCursor: "",
          hasNextPage: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch order detail:", error);
      setErrors(error);
    }
  }, [oid, orderManager, onUnauthorized]);

  // Core fetch function for comments (if using separate comment API)
  const doFetchComments = useCallback(
    async (cursor = "", forceRefresh = false) => {
      // If your backend supports fetching comments separately with pagination
      // Otherwise, comments come from order detail
      try {
        if (forceRefresh) {
          setRefreshing(true);
        } else {
          setFetching(true);
        }
        setErrors({});

        // Fetch order with comments
        const data = await orderManager.getOrderDetail(oid, onUnauthorized);
        setOrder(data);

        // Set comments from order data
        if (data.comments) {
          setCommentList({
            results: data.comments,
            nextCursor: "",
            hasNextPage: false,
          });
        }

        setLastFetchTime(new Date());
      } catch (error) {
        console.error("Failed to fetch order/comments:", error);
        setErrors(error);
        setCommentList({
          results: [],
          nextCursor: "",
          hasNextPage: false,
        });
      } finally {
        setFetching(false);
        setRefreshing(false);
      }
    },
    [oid, orderManager, onUnauthorized],
  );

  // Submit new comment
  const onSubmitClick = async () => {
    console.log("onSubmitClick: Beginning...");

    if (!content || !content.trim()) {
      setErrors({ content: "Comment content is required" });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const response = await orderManager.createOrderComment(
        oid,
        content,
        onUnauthorized,
      );

      setOrder(response);
      setContent("");
      setTopAlertMessage("Comment created successfully");
      setTopAlertStatus("success");

      // Update comments list from response
      if (response.comments) {
        setCommentList({
          results: response.comments,
          nextCursor: "",
          hasNextPage: false,
        });
      }

      // Force refresh
      await doFetchComments("", true);

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
    doFetchComments(currentCursor, true);
  };

  // Format helpers
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return formatDateForDisplay(dateString);
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
      fetchOrderDetail();
      hasInitialLoad.current = true;
    }
  }, [fetchOrderDetail]);

  // Fetch comments when parameters change
  useEffect(() => {
    if (oid && hasInitialLoad.current) {
      doFetchComments(currentCursor, false);
    }
  }, [oid, currentCursor, doFetchComments]);

  if (isFetching && !order.id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order comments...</p>
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
                to="/admin/orders"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                  Orders
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <InformationCircleIcon className="w-4 h-4 mr-2" />
                Order #{oid} (Comments)
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
              <WrenchScrewdriverIcon className="w-8 h-8 mr-3 text-blue-600" />
              Order
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              View and manage comments
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {order && order.status === ORDER_STATUS_ARCHIVED && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This order is archived
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
        {order && (
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
                  to={`/admin/order/${oid}`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Summary
                </Link>
                <Link
                  to={`/admin/order/${oid}/full`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Detail
                </Link>
                <Link
                  to={`/admin/order/${oid}/activity-sheets`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Activity Sheets
                </Link>
                <Link
                  to={`/admin/order/${oid}/tasks`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Tasks
                </Link>
                <div className="border-b-2 border-blue-600 py-4 px-1 text-base font-medium text-blue-600">
                  Comments
                </div>
                <Link
                  to={`/admin/order/${oid}/attachments`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Attachments
                </Link>
                <Link
                  to={`/admin/order/${oid}/more`}
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
                    order.status === ORDER_STATUS_ARCHIVED || isSubmitting
                  }
                  className={`block w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y ${
                    errors && errors.content
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  } ${
                    order.status === ORDER_STATUS_ARCHIVED
                      ? "bg-gray-100 cursor-not-allowed"
                      : "bg-white"
                  }`}
                  rows="4"
                />
                {errors && errors.content && (
                  <p className="mt-2 text-sm text-red-600">{errors.content}</p>
                )}
                <button
                  onClick={onSubmitClick}
                  disabled={
                    order.status === ORDER_STATUS_ARCHIVED ||
                    isSubmitting ||
                    !content.trim()
                  }
                  className={`mt-4 inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-base font-medium text-white transition-colors ${
                    order.status === ORDER_STATUS_ARCHIVED ||
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
              ) : order.comments && order.comments.length > 0 ? (
                <>
                  {/* Comments Display */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Comments for Order #{oid} ({order.comments.length})
                    </h3>
                    <div className="space-y-4">
                      {order.comments.map((comment, index) => (
                        <div
                          key={comment.id || `comment-${index}`}
                          className={`rounded-lg border p-4 ${
                            comment.orderIncidentId &&
                            comment.orderIncidentId !== "" &&
                            comment.orderIncidentId !==
                              "000000000000000000000000"
                              ? "bg-red-50 border-red-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                              <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                              <strong className="text-blue-600">
                                {comment.createdByUserName || "Hidden User"}
                              </strong>
                              {comment.orderIncidentId &&
                                comment.orderIncidentId !== "" &&
                                comment.orderIncidentId !==
                                  "000000000000000000000000" && (
                                  <span className="ml-3 flex items-center text-red-600 text-sm">
                                    <FireIcon className="w-4 h-4 mr-1" />
                                    Incident
                                  </span>
                                )}
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
                            {comment.orderIncidentId &&
                              comment.orderIncidentId !== "" &&
                              comment.orderIncidentId !==
                                "000000000000000000000000" && (
                                <Link
                                  to={`/admin/order/${oid}/more/incident/${comment.orderIncidentId}`}
                                  className="inline-flex items-center mt-3 text-sm text-blue-600 hover:text-blue-800"
                                >
                                  View incident
                                  <ChevronRightIcon className="w-4 h-4 ml-1" />
                                </Link>
                              )}
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
                    Be the first to add a comment about this order.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-start mt-8 pt-6 border-t border-gray-200">
                <Link to="/admin/orders">
                  <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <ChevronLeftIcon className="w-5 h-5 mr-2" />
                    Back to Orders
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}

        {!order && !isFetching && (
          <div className="px-6 py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <WrenchScrewdriverIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Order Not Found
            </h3>
            <p className="text-gray-500 mb-6">
              The order you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/admin/orders">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to Orders
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrderDetailCommentListPage;
