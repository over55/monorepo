// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/Comment/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  ClockIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import {
  useCustomerManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { DateTime } from "luxon";

function AdminCustomerDetailCommentListPage() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const customerManager = useCustomerManager();
  const authManager = useAuthManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [customer, setCustomer] = useState({});
  const [content, setContent] = useState("");
  const [topAlertMessage, setTopAlertMessage] = useState("");
  const [topAlertStatus, setTopAlertStatus] = useState("");
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch customer detail
  const fetchCustomerDetail = async (customerId, forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setFetching(true);
      }
      setErrors({});

      const response = await customerManager.getCustomerDetail(
        customerId,
        onUnauthorized,
      );
      setCustomer(response);
      setLastFetchTime(new Date());
    } catch (error) {
      console.error("Failed to fetch customer detail:", error);
      setErrors(error);
    } finally {
      setFetching(false);
      setRefreshing(false);
    }
  };

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
      // Create the comment using customer manager
      const response = await customerManager.createCustomerComment(
        cid,
        content.trim(),
        onUnauthorized,
      );

      // Update customer data with new comment
      setCustomer(response);
      setContent("");
      setTopAlertMessage("Comment created successfully");
      setTopAlertStatus("success");

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
    fetchCustomerDetail(cid, true);
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

  // Lifecycle
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (cid) {
      fetchCustomerDetail(cid);
    }
  }, [cid]);

  if (!authManager.isAuthenticated()) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isFetching && !customer.id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customer comments...</p>
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
                to="/admin/customers"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Customers
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
              <UserIcon className="w-8 h-8 mr-3 text-blue-600" />
              Customer
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              View and manage comments
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {customer && customer.status === 2 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This customer is archived
        </div>
      )}

      {customer && customer.isBanned && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <ShieldExclamationIcon className="w-5 h-5 mr-2" />
          This customer is banned
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
                      {key}: {Array.isArray(value) ? value.join(", ") : value}
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
        {customer && (
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
                  to={`/admin/customer/${cid}`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Summary
                </Link>
                <Link
                  to={`/admin/customer/${cid}/detail`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Detail
                </Link>
                <Link
                  to={`/admin/customer/${cid}/orders`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Orders
                </Link>
                <div className="border-b-2 border-blue-600 py-4 px-1 text-base font-medium text-blue-600">
                  Comments
                </div>
                <Link
                  to={`/admin/customer/${cid}/attachments`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Attachments
                </Link>
                <Link
                  to={`/admin/customer/${cid}/more`}
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
                    customer.status === 2 || customer.isBanned || isSubmitting
                  }
                  className={`block w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y ${
                    errors && errors.content
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  } ${
                    customer.status === 2 || customer.isBanned
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
                    customer.status === 2 ||
                    customer.isBanned ||
                    isSubmitting ||
                    !content.trim()
                  }
                  className={`mt-4 inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-base font-medium text-white transition-colors ${
                    customer.status === 2 ||
                    customer.isBanned ||
                    isSubmitting ||
                    !content.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <PlusCircleIcon className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Comment"}
                </button>
                {(customer.status === 2 || customer.isBanned) && (
                  <p className="mt-2 text-sm text-red-600">
                    {customer.isBanned
                      ? "Cannot add comments to banned customers."
                      : "Cannot add comments to archived customers."}
                  </p>
                )}
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
              ) : customer.comments && customer.comments.length > 0 ? (
                <>
                  {/* Comments Display */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Comments for {customer.name || "Customer"} (
                      {customer.comments.length})
                    </h3>
                    <div className="space-y-4">
                      {customer.comments.map((comment, index) => (
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
                              {comment.customerName &&
                                comment.customerName !== customer.name && (
                                  <span className="ml-3 text-xs text-gray-500">
                                    (Re: {comment.customerName})
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
                    Be the first to add a comment about this customer.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-start mt-8 pt-6 border-t border-gray-200">
                <Link to="/admin/customers">
                  <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <ChevronLeftIcon className="w-5 h-5 mr-2" />
                    Back to Customers
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}

        {!customer && !isFetching && (
          <div className="px-6 py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <UserIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Customer Not Found
            </h3>
            <p className="text-gray-500 mb-6">
              The customer you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/admin/customers">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to Customers
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCustomerDetailCommentListPage;
