// File Path: monorepo/web/workery-frontend/src/pages/Admin/OrderIncident/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  LockClosedIcon,
  LockOpenIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import {
  useOrderIncidentManager,
  useAuthManager,
} from "../../../../services/Services";

function AdminOrderIncidentDetailPage() {
  const { oiid } = useParams();
  const orderIncidentManager = useOrderIncidentManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [incident, setIncident] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertStatus, setAlertStatus] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch incident details
  const fetchData = async () => {
    setFetching(true);
    setErrors({});

    try {
      // Fetch incident details
      const incidentData = await orderIncidentManager.getOrderIncidentDetail(
        oiid,
        onUnauthorized,
      );
      setIncident(incidentData);

      console.log("AdminOrderIncidentDetailPage: Data loaded successfully");
    } catch (error) {
      console.error(
        "AdminOrderIncidentDetailPage: Failed to fetch data:",
        error,
      );
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    setErrors({});
    try {
      await orderIncidentManager.createOrderIncidentComment(
        oiid,
        newComment,
        onUnauthorized,
      );
      setNewComment("");
      setShowCommentModal(false);
      setAlertMessage("Comment added successfully");
      setAlertStatus("success");
      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Failed to add comment:", error);
      setErrors({ comment: "Failed to add comment. Please try again." });
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      fetchData();
    }

    return () => {
      mounted = false;
    };
  }, [oiid]);

  // Format initiator label
  const getInitiatorLabel = (initiator) => {
    switch (initiator) {
      case 1:
        return "Client";
      case 2:
        return "Associate";
      case 3:
        return "Staff";
      default:
        return "Unknown";
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // Format datetime for display
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  if (isFetching && !incident) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading incident details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Responsive Breadcrumb */}
      <nav
        className="flex mb-4 sm:mb-6 overflow-x-auto"
        aria-label="Breadcrumb"
      >
        <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-nowrap">
          <li className="inline-flex items-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
            >
              <ChartBarIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Dash</span>
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-1 sm:mx-2 text-gray-400">/</span>
              <Link
                to="/admin/incidents"
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                <span className="inline-flex items-center">
                  <ExclamationTriangleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Incidents
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-1 sm:mx-2 text-gray-400">/</span>
              <span className="text-xs sm:text-sm font-medium text-gray-500 inline-flex items-center whitespace-nowrap">
                <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                Detail
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title - Responsive */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <ExclamationTriangleIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-red-600 flex-shrink-0" />
              Incident
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
              View incident details and manage comments
            </p>
          </div>
        </div>
      </div>

      {/* Alert Messages - Responsive */}
      {alertMessage && (
        <div
          className={`mb-4 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between text-sm sm:text-base ${
            alertStatus === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center">
            {alertStatus === "success" ? (
              <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
            ) : (
              <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
            )}
            <span className="break-words">{alertMessage}</span>
          </div>
          <button
            onClick={() => {
              setAlertMessage("");
              setAlertStatus("");
            }}
            className="ml-4 hover:bg-white hover:bg-opacity-20 rounded p-1 flex-shrink-0"
          >
            <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        </div>
      )}

      {/* Error Display - Responsive */}
      {errors && Object.keys(errors).length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <strong>Error:</strong>
              <ul className="mt-2 list-disc list-inside">
                {Object.entries(errors).map(([key, value]) => (
                  <li key={key}>{value}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setErrors({})}
              className="text-red-700 hover:text-red-900 ml-3 flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {incident && (
          <>
            {/* Header with Actions - Responsive */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentListIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-blue-600 flex-shrink-0" />
                  Incident Detail
                </h2>
                <button
                  onClick={() => setShowCommentModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  <PlusCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                  New Comment
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {/* Summary Section */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="w-5 sm:w-6 h-5 sm:h-6 mr-2 text-gray-600" />
                  Summary
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <dt className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                        Title
                      </dt>
                      <dd className="text-sm sm:text-base text-gray-900 break-words">
                        {incident.title || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                        Related Order
                      </dt>
                      <dd className="text-sm sm:text-base">
                        {incident.orderId ? (
                          <Link
                            to={`/admin/order/${incident.orderId}`}
                            className="text-blue-600 hover:text-blue-700 inline-flex items-center"
                          >
                            <WrenchScrewdriverIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                            Order #{incident.orderId}
                          </Link>
                        ) : (
                          <span className="text-gray-500">
                            Not linked to order
                          </span>
                        )}
                      </dd>
                    </div>
                    <div className="lg:col-span-2">
                      <dt className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                        Description
                      </dt>
                      <dd className="text-sm sm:text-base text-gray-900 break-words">
                        {incident.description || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                        Initiated By
                      </dt>
                      <dd className="text-sm sm:text-base text-gray-900">
                        <span className="inline-flex items-center">
                          <UserIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 text-gray-400" />
                          {getInitiatorLabel(incident.initiator)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                        Start Date
                      </dt>
                      <dd className="text-sm sm:text-base text-gray-900">
                        <span className="inline-flex items-center">
                          <CalendarIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 text-gray-400" />
                          {formatDate(incident.startDate)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                        Status
                      </dt>
                      <dd className="text-sm sm:text-base">
                        {incident.closingReason ? (
                          <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-800">
                            <LockClosedIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                            Closed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-yellow-100 text-yellow-800">
                            <LockOpenIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                            Open
                          </span>
                        )}
                      </dd>
                    </div>
                    {incident.closingReason && (
                      <div>
                        <dt className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                          Closing Reason
                        </dt>
                        <dd className="text-sm sm:text-base text-gray-900 break-words">
                          {incident.closingReasonLabel ||
                            incident.closingReasonOther ||
                            "-"}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                        Created At
                      </dt>
                      <dd className="text-sm sm:text-base text-gray-900">
                        <span className="inline-flex items-center">
                          <ClockIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 text-gray-400" />
                          {formatDateTime(incident.createdAt)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                        Created By
                      </dt>
                      <dd className="text-sm sm:text-base text-gray-900">
                        <span className="inline-flex items-center">
                          <UserIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 text-gray-400" />
                          {incident.createdByUserName || "-"}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Feed Section */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <ChatBubbleLeftRightIcon className="w-5 sm:w-6 h-5 sm:h-6 mr-2 text-gray-600" />
                  Feed
                </h3>
                {incident.feed && incident.feed.length > 0 ? (
                  <div className="space-y-4">
                    {incident.feed.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 sm:mb-3">
                          <div className="flex items-center text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
                            <UserIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                            <span className="font-medium">
                              {item.createdByUserName}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 flex items-center mb-2 sm:mb-0 order-1 sm:order-2">
                            <ClockIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                            {formatDateTime(item.createdAt)}
                          </div>
                        </div>
                        {item.filetype ? (
                          <div className="bg-blue-50 border border-blue-200 rounded-md p-2 sm:p-3">
                            <a
                              href={item.objectUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-700 inline-flex items-center text-sm sm:text-base"
                            >
                              <PaperClipIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                              {item.filename || "Download Attachment"}
                              <ArrowDownTrayIcon className="w-3 sm:w-4 h-3 sm:h-4 ml-2" />
                            </a>
                          </div>
                        ) : (
                          <div className="bg-white rounded-md p-3 sm:p-4 border border-gray-100">
                            <p className="text-sm sm:text-base text-gray-900 whitespace-pre-wrap break-words">
                              {item.content}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
                    <ChatBubbleLeftRightIcon className="w-10 sm:w-12 h-10 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-gray-500">
                      No comments or attachments yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons - Responsive */}
              <div className="flex mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <Link to="/admin/incidents">
                  <button className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                    Back to Incidents
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}

        {!incident && !isFetching && (
          <div className="px-4 sm:px-6 py-8 sm:py-16 text-center">
            <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-gray-100 rounded-full mb-4">
              <ExclamationTriangleIcon className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              Incident Not Found
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
              The incident you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/admin/incidents">
              <button className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-lg text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <ChevronLeftIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                Back to Incidents
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => {
                setShowCommentModal(false);
                setNewComment("");
              }}
            ></div>

            {/* Modal panel */}
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all w-full max-w-lg sm:my-8 sm:p-6">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCommentModal(false);
                    setNewComment("");
                  }}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <XMarkIcon className="h-5 sm:h-6 w-5 sm:w-6" />
                </button>
              </div>
              <div>
                <div className="mt-3 sm:mt-0">
                  <h3 className="text-base sm:text-lg font-semibold leading-6 text-gray-900 mb-4">
                    New Comment
                  </h3>
                  <div className="mt-2">
                    <label
                      htmlFor="comment"
                      className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                    >
                      Content
                    </label>
                    <textarea
                      id="comment"
                      rows={7}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your comment here"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCommentModal(false);
                    setNewComment("");
                  }}
                  className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm sm:text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className={`w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent px-4 py-2 text-sm sm:text-base font-medium text-white shadow-sm focus:outline-none ${
                    newComment.trim()
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrderIncidentDetailPage;
