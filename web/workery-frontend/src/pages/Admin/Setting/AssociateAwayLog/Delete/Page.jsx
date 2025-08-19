// File Path: web/workery-frontend/src/pages/Admin/Setting/AssociateAwayLog/Delete/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAssociateAwayLogManager } from "../../../../../services/Services";
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  XMarkIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  ShieldExclamationIcon,
  PencilSquareIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const REASON_MAP = {
  1: "Other",
  2: "Going on vacation",
  3: "Personal reasons",
  4: "Commercial insurance expired",
  5: "Policy check expired",
};

function SettingAssociateAwayLogDeletePage() {
  const associateAwayLogManager = useAssociateAwayLogManager();
  const navigate = useNavigate();
  const { id } = useParams();

  // State management
  const [associateAwayLog, setAssociateAwayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmText, setConfirmText] = useState("");

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

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!associateAwayLog) return;

    // Require confirmation text
    if (confirmText.toLowerCase() !== "delete") {
      setError('Please type "delete" to confirm');
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      await associateAwayLogManager.deleteAssociateAwayLog(id, onUnauthorized);

      setSuccess("Associate away log deleted successfully!");

      // Navigate back to list after short delay
      setTimeout(() => {
        navigate("/admin/settings/associate-away-logs");
      }, 1500);
    } catch (err) {
      console.error("Failed to delete associate away log:", err);
      setError(err.message || "Failed to delete associate away log");
    } finally {
      setDeleting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/admin/settings/associate-away-log/${id}/detail`);
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

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Format datetime helper
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
          <Link
            to="/admin/settings/associate-away-logs"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
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
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/settings"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <Cog6ToothIcon className="w-4 h-4 mr-2" />
                    Settings
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/settings/associate-away-logs"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <CalendarDaysIcon className="w-4 h-4 mr-2" />
                    Associate Away Logs
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to={`/admin/settings/associate-away-log/${id}/detail`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                    Detail
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-600 hover:text-green-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {associateAwayLog && (
          <>
            {/* Warning Alert */}
            <div className="mb-6 bg-red-50 border-2 border-red-300 text-red-800 px-4 py-4 rounded-lg flex items-start">
              <ShieldExclamationIcon className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  WARNING: This action cannot be undone!
                </p>
                <p className="text-sm mt-1">
                  You are about to permanently delete this associate away log
                  from the system.
                </p>
              </div>
            </div>

            {/* Main Delete Card */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                  <TrashIcon className="w-6 h-6 mr-2 text-red-600" />
                  Delete Associate Away Log
                </h1>
              </div>

              <div className="p-6">
                {/* Error Messages */}
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Away Log Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-red-600 mb-4">
                    Away log to be deleted:
                  </h3>

                  <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Associate:
                          </label>
                          <div className="p-2 bg-white rounded border border-gray-300">
                            <Link
                              to={`/admin/associate/${associateAwayLog.associateId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <UserIcon className="w-4 h-4 mr-2" />
                              {associateAwayLog.associateName ||
                                `Associate #${associateAwayLog.associateId}`}
                            </Link>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason:
                          </label>
                          <div className="p-2 bg-white rounded border border-gray-300">
                            {associateAwayLog.reason === 1 ? (
                              <span>
                                {REASON_MAP[1]} -{" "}
                                {associateAwayLog.reasonOther ||
                                  "Not specified"}
                              </span>
                            ) : (
                              <span>
                                {REASON_MAP[associateAwayLog.reason] ||
                                  "Unknown"}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date:
                          </label>
                          <div className="p-2 bg-white rounded border border-gray-300 flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                            {formatDate(associateAwayLog.startDate)}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Until:
                          </label>
                          <div className="p-2 bg-white rounded border border-gray-300">
                            {associateAwayLog.untilFurtherNotice === 1 ? (
                              <span className="text-amber-600 font-semibold flex items-center">
                                <ClockIcon className="w-4 h-4 mr-2" />
                                Further Notice
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                                {formatDate(associateAwayLog.untilDate)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Created:
                          </label>
                          <div className="p-2 bg-white rounded border border-gray-300 text-sm text-gray-600">
                            {formatDateTime(associateAwayLog.createdAt)}
                          </div>
                        </div>

                        {associateAwayLog.createdByUserName && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Created By:
                            </label>
                            <div className="p-2 bg-white rounded border border-gray-300 text-sm text-gray-600">
                              {associateAwayLog.createdByUserName}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirmation Section */}
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                  <h4 className="text-base font-medium text-red-700 mb-3 flex items-center">
                    <LockClosedIcon className="w-5 h-5 mr-2" />
                    Confirmation Required
                  </h4>

                  <p className="text-sm text-gray-700 mb-3">
                    This action will permanently remove the associate away log
                    from the system. All associated data will be lost and cannot
                    be recovered.
                  </p>

                  <p className="text-sm font-medium text-gray-900 mb-3">
                    To confirm deletion, please type{" "}
                    <code className="px-2 py-1 bg-gray-200 rounded text-red-600 font-mono">
                      delete
                    </code>{" "}
                    in the box below:
                  </p>

                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type 'delete' to confirm"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                      confirmText.toLowerCase() === "delete"
                        ? "border-green-500 bg-green-50 focus:ring-green-500"
                        : "border-red-300 bg-red-50 focus:ring-red-500"
                    }`}
                    disabled={deleting}
                    autoFocus
                  />
                </div>

                {/* Alternative Actions */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                  <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                    Consider These Alternatives:
                  </h4>
                  <ul className="text-sm text-amber-700 space-y-1 ml-7">
                    <li>• Edit the away log to update the end date</li>
                    <li>• Set the end date to today instead of deleting</li>
                    <li>• Export or document the away log before deletion</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                  <Link
                    to={`/admin/settings/associate-away-log/${id}/detail`}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    Back to Away Log Detail
                  </Link>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleCancel}
                      disabled={deleting}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() =>
                        navigate(
                          `/admin/settings/associate-away-log/${id}/update`,
                        )
                      }
                      disabled={deleting}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PencilSquareIcon className="w-4 h-4 mr-2" />
                      Edit Instead
                    </button>

                    <button
                      onClick={handleDeleteConfirm}
                      disabled={
                        deleting || confirmText.toLowerCase() !== "delete"
                      }
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      {deleting ? "Deleting..." : "Delete Permanently"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* System Information Card */}
            {(associateAwayLog.modifiedAt ||
              associateAwayLog.modifiedByUserName ||
              associateAwayLog.createdFromIpAddress ||
              associateAwayLog.modifiedFromIpAddress) && (
              <div className="mt-8 bg-white shadow-sm rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <InformationCircleIcon className="w-5 h-5 mr-2" />
                    System Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="font-medium text-gray-500 mb-1">
                        Created At:
                      </p>
                      <p className="text-gray-900">
                        {formatDateTime(associateAwayLog.createdAt)}
                      </p>
                    </div>
                    {associateAwayLog.createdByUserName && (
                      <div>
                        <p className="font-medium text-gray-500 mb-1">
                          Created By:
                        </p>
                        <p className="text-gray-900">
                          {associateAwayLog.createdByUserName}
                        </p>
                      </div>
                    )}
                    {associateAwayLog.modifiedAt && (
                      <div>
                        <p className="font-medium text-gray-500 mb-1">
                          Last Modified:
                        </p>
                        <p className="text-gray-900">
                          {formatDateTime(associateAwayLog.modifiedAt)}
                        </p>
                      </div>
                    )}
                    {associateAwayLog.modifiedByUserName && (
                      <div>
                        <p className="font-medium text-gray-500 mb-1">
                          Modified By:
                        </p>
                        <p className="text-gray-900">
                          {associateAwayLog.modifiedByUserName}
                        </p>
                      </div>
                    )}
                    {associateAwayLog.createdFromIpAddress && (
                      <div>
                        <p className="font-medium text-gray-500 mb-1">
                          Created From IP:
                        </p>
                        <p className="text-gray-900">
                          {associateAwayLog.createdFromIpAddress}
                        </p>
                      </div>
                    )}
                    {associateAwayLog.modifiedFromIpAddress && (
                      <div>
                        <p className="font-medium text-gray-500 mb-1">
                          Modified From IP:
                        </p>
                        <p className="text-gray-900">
                          {associateAwayLog.modifiedFromIpAddress}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Note Card */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 flex items-start">
                <DocumentTextIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> If you just want to temporarily end
                  this away log, consider editing it instead and setting an end
                  date rather than deleting it permanently. This preserves the
                  historical record.
                </span>
              </p>
            </div>
          </>
        )}

        {/* Loading Overlay */}
        {deleting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="text-gray-700">
                Deleting associate away log...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingAssociateAwayLogDeletePage;
