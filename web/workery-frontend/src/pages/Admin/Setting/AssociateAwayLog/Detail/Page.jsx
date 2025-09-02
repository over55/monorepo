// File Path: web/workery-frontend/src/pages/Admin/Setting/AssociateAwayLog/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAssociateAwayLogManager } from "../../../../../services/Services";
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  XMarkIcon,
  TrashIcon,
  PencilSquareIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  ExclamationCircleIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import {
  formatDateForDisplay,
  formatDateTime,
} from "../../../../../services/Helpers/DateFormatter";

const REASON_MAP = {
  1: "Other",
  2: "Going on vacation",
  3: "Personal reasons",
  4: "Commercial insurance expired",
  5: "Policy check expired",
};

function SettingAssociateAwayLogDetailPage() {
  const associateAwayLogManager = useAssociateAwayLogManager();
  const navigate = useNavigate();
  const { id } = useParams();

  // State management
  const [associateAwayLog, setAssociateAwayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch associate away log details
  const fetchAssociateAwayLogDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await associateAwayLogManager.getAssociateAwayLogDetail(
        id,
        onUnauthorized,
      );

      setAssociateAwayLog(response);
    } catch (err) {
      console.error("Failed to fetch associate away log detail:", err);
      setError(err.message || "Failed to load associate away log details");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);

      await associateAwayLogManager.deleteAssociateAwayLog(id, onUnauthorized);

      setSuccess("Associate away log deleted successfully");
      setShowDeleteModal(false);

      // Navigate back to list after short delay
      setTimeout(() => {
        navigate("/admin/settings/associate-away-logs");
      }, 1500);
    } catch (err) {
      console.error("Failed to delete associate away log:", err);
      setError(err.message || "Failed to delete associate away log");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (id) {
      fetchAssociateAwayLogDetail();
    } else {
      setError("No associate away log ID provided");
      setLoading(false);
    }
  }, [id]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Loading state
  if (loading && !associateAwayLog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading associate away log details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !associateAwayLog) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm sm:text-base">{error}</p>
          </div>
          <Link
            to="/admin/settings/associate-away-logs"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm sm:text-base"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Associate Away Logs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumb - Mobile Optimized */}
        <nav
          className="flex mb-4 sm:mb-6 lg:mb-8 overflow-x-auto"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-3 whitespace-nowrap">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <ChartBarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <Link
                  to="/admin/settings"
                  className="ml-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <Cog6ToothIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    Settings
                  </span>
                </Link>
              </div>
            </li>
            <li className="hidden sm:block">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <Link
                  to="/admin/settings/associate-away-logs"
                  className="ml-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <CalendarDaysIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="hidden lg:inline">
                      Associate Away Logs
                    </span>
                    <span className="lg:hidden">Away Logs</span>
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <span className="ml-1 text-xs sm:text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <ClipboardDocumentIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Details
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 text-green-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-sm sm:text-base">
              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              <span className="break-words">{success}</span>
            </span>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-600 hover:text-green-800 ml-2 flex-shrink-0"
            >
              <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-sm sm:text-base">
              <ExclamationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              <span className="break-words">{error}</span>
            </span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
            >
              <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {associateAwayLog && (
          <>
            {/* Main Details Card */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                    <CalendarDaysIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                    <span className="break-words">
                      Associate Away Log Details
                    </span>
                  </h1>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/admin/settings/associate-away-log/${id}/update`,
                        )
                      }
                      disabled={loading}
                      className="inline-flex items-center px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PencilSquareIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      disabled={loading}
                      className="inline-flex items-center px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {/* Away Log Information */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                    Away Log Information
                  </h3>

                  {/* Associate Info */}
                  <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Associate
                    </label>
                    <Link
                      to={`/admin/associate/${associateAwayLog.associateId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center text-sm sm:text-base"
                    >
                      <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="break-words">
                        {associateAwayLog.associateName ||
                          `Associate #${associateAwayLog.associateId}`}
                      </span>
                    </Link>
                  </div>

                  {/* Reason */}
                  <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Reason for Absence
                    </label>
                    <p className="text-gray-900 text-sm sm:text-base">
                      {associateAwayLog.reason === 1 ? (
                        <>
                          {REASON_MAP[1]}
                          {associateAwayLog.reasonOther && (
                            <span className="block mt-1 text-gray-600 italic break-words">
                              "{associateAwayLog.reasonOther}"
                            </span>
                          )}
                        </>
                      ) : (
                        REASON_MAP[associateAwayLog.reason] || "Unknown"
                      )}
                    </p>
                  </div>

                  {/* Date Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center">
                        <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Start Date
                      </label>
                      <p className="text-gray-900 font-medium text-sm sm:text-base">
                        {formatDateForDisplay(associateAwayLog.startDate)}
                      </p>
                    </div>

                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center">
                        <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Until
                      </label>
                      <p className="text-gray-900 font-medium text-sm sm:text-base">
                        {associateAwayLog.untilFurtherNotice === 1 ? (
                          <span className="text-amber-600 font-semibold">
                            Further Notice
                          </span>
                        ) : (
                          formatDateForDisplay(associateAwayLog.untilDate)
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                  {/* Creation Information */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3 flex items-center">
                      <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Creation Information
                    </h4>
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      <div>
                        <span className="font-medium text-gray-500">
                          Created At:
                        </span>
                        <p className="text-gray-900 mt-0.5 break-words">
                          {formatDateTime(associateAwayLog.createdAt)}
                        </p>
                      </div>
                      {associateAwayLog.createdByUserName && (
                        <div>
                          <span className="font-medium text-gray-500">
                            Created By:
                          </span>
                          <p className="text-gray-900 mt-0.5 break-words">
                            {associateAwayLog.createdByUserName}
                          </p>
                        </div>
                      )}
                      {associateAwayLog.createdFromIpAddress && (
                        <div>
                          <span className="font-medium text-gray-500 flex items-center">
                            <MapPinIcon className="w-3 h-3 mr-1" />
                            Created From IP:
                          </span>
                          <p className="text-gray-900 mt-0.5 break-all">
                            {associateAwayLog.createdFromIpAddress}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modification Information */}
                  {(associateAwayLog.modifiedAt ||
                    associateAwayLog.modifiedByUserName ||
                    associateAwayLog.modifiedFromIpAddress) && (
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3 flex items-center">
                        <PencilSquareIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Modification Information
                      </h4>
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                        {associateAwayLog.modifiedAt && (
                          <div>
                            <span className="font-medium text-gray-500">
                              Modified At:
                            </span>
                            <p className="text-gray-900 mt-0.5 break-words">
                              {formatDateTime(associateAwayLog.modifiedAt)}
                            </p>
                          </div>
                        )}
                        {associateAwayLog.modifiedByUserName && (
                          <div>
                            <span className="font-medium text-gray-500">
                              Modified By:
                            </span>
                            <p className="text-gray-900 mt-0.5 break-words">
                              {associateAwayLog.modifiedByUserName}
                            </p>
                          </div>
                        )}
                        {associateAwayLog.modifiedFromIpAddress && (
                          <div>
                            <span className="font-medium text-gray-500 flex items-center">
                              <MapPinIcon className="w-3 h-3 mr-1" />
                              Modified From IP:
                            </span>
                            <p className="text-gray-900 mt-0.5 break-all">
                              {associateAwayLog.modifiedFromIpAddress}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons - Mobile Optimized */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Link
                to="/admin/settings/associate-away-logs"
                className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800 order-2 sm:order-1"
              >
                <ArrowLeftIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Back to Associate Away Logs
              </Link>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
                <button
                  onClick={() =>
                    navigate(`/admin/settings/associate-away-log/${id}/update`)
                  }
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 w-full sm:w-auto"
                >
                  <PencilSquareIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Edit Away Log
                </button>
                <button
                  onClick={() =>
                    navigate(`/admin/settings/associate-away-log/${id}/delete`)
                  }
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 w-full sm:w-auto"
                >
                  <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Delete Away Log
                </button>
              </div>
            </div>
          </>
        )}

        {/* Delete Confirmation Modal - Mobile Optimized */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-auto">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600" />
                  Delete Associate Away Log
                </h3>
              </div>

              <div className="px-4 sm:px-6 py-3 sm:py-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  Are you sure you want to delete this associate away log? This
                  action cannot be undone.
                </p>
                {associateAwayLog && (
                  <div className="p-2.5 sm:p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Away log to be deleted:
                    </p>
                    <div className="text-xs sm:text-sm text-gray-900 space-y-1">
                      <p className="break-words">
                        <strong>Associate:</strong>{" "}
                        {associateAwayLog.associateName ||
                          `Associate #${associateAwayLog.associateId}`}
                      </p>
                      <p className="break-words">
                        <strong>Reason:</strong>{" "}
                        {associateAwayLog.reason === 1
                          ? associateAwayLog.reasonOther
                          : REASON_MAP[associateAwayLog.reason]}
                      </p>
                      <p>
                        <strong>Start Date:</strong>{" "}
                        {formatDateForDisplay(associateAwayLog.startDate)}
                      </p>
                      <p>
                        <strong>Until:</strong>{" "}
                        {associateAwayLog.untilFurtherNotice === 1
                          ? "Further Notice"
                          : formatDateForDisplay(associateAwayLog.untilDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                >
                  {deleting ? "Deleting..." : "Delete Away Log"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingAssociateAwayLogDetailPage;
