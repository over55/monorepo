// File Path: web/workery-frontend/src/pages/Admin/Setting/HowHearAboutUsItem/Detail/Page.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router";
import { useHowHearAboutUsItemManager } from "../../../../../services/Services";
import {
  MegaphoneIcon,
  ChevronRightIcon,
  XMarkIcon,
  TrashIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  TagIcon,
  CalendarIcon,
  UserGroupIcon,
  UsersIcon,
  BriefcaseIcon,
  LockClosedIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";
import {
  formatDateForDisplay,
  formatDateTime,
} from "../../../../../services/Helpers/DateFormatter";

function SettingHowHearAboutUsItemDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const howHearAboutUsItemManager = useHowHearAboutUsItemManager();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [data, setData] = useState(null);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch how hear about us item details
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await howHearAboutUsItemManager.getDetail(
        id,
        onUnauthorized,
        true, // Force refresh
      );

      setData(result);
    } catch (err) {
      console.error("Failed to fetch How Hear About Us Item:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (data?.text === "Other") {
      setError("Cannot delete the 'Other' item as it is locked.");
      setShowDeleteModal(false);
      return;
    }

    try {
      setIsDeleting(true);
      await howHearAboutUsItemManager.delete(id, onUnauthorized);

      // Navigate back to list with success message
      navigate("/admin/settings/how-hear-about-us-items", {
        state: {
          successMessage: "How Hear About Us Item deleted successfully",
        },
      });
    } catch (err) {
      console.error("Failed to delete item:", err);
      setError(err.message || "Failed to delete item");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const isActive = status === 1;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  // Load data on component mount
  useEffect(() => {
    if (id) {
      fetchData();
    } else {
      setError("Invalid item ID");
      setIsLoading(false);
    }
  }, [id]);

  // Handle success message from navigation state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Clear the state
      window.history.replaceState({}, document.title);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  }, [location]);

  // Auto-clear error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading item details...</p>
        </div>
      </div>
    );
  }

  // Error state (no data)
  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
          <Link
            to="/admin/settings/how-hear-about-us-items"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to How Hear About Us Items
          </Link>
        </div>
      </div>
    );
  }

  // Not found state
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              How Hear About Us Item not found
            </div>
          </div>
          <Link
            to="/admin/settings/how-hear-about-us-items"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to How Hear About Us Items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  to="/admin/settings/how-hear-about-us-items"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <MegaphoneIcon className="w-4 h-4 mr-2" />
                    How Hear About Us Items
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                  {data?.text || "Details"}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              {successMessage}
            </span>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-green-600 hover:text-green-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {error}
            </span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Details Card */}
        <div className="bg-white shadow-sm rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
              <MegaphoneIcon className="w-6 h-6 mr-2 text-blue-600" />
              {data.text}
            </h1>
            <div className="flex items-center space-x-2">
              {data.text !== "Other" ? (
                <>
                  <button
                    onClick={() =>
                      navigate(
                        `/admin/settings/how-hear-about-us-item/${id}/update`,
                      )
                    }
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    <PencilSquareIcon className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </>
              ) : (
                <div className="inline-flex items-center px-3 py-2 text-sm font-medium text-amber-800 bg-amber-100 rounded-lg">
                  <LockClosedIcon className="w-4 h-4 mr-1" />
                  System Protected
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Basic Information Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Basic Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Text
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-base font-semibold text-gray-900">
                        {data.text}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Sort Number
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-base font-medium text-gray-900 flex items-center">
                          <HashtagIcon className="w-4 h-4 mr-1 text-gray-500" />
                          {data.sortNumber ?? "N/A"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Status
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {getStatusBadge(data.status)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Item ID
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-mono text-gray-600">
                        {data.id}
                      </p>
                    </div>
                  </div>

                  {/* Role Configuration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Available for Roles
                    </label>
                    <div className="space-y-2">
                      <div
                        className={`p-3 rounded-lg border ${
                          data.isForAssociate
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-sm font-medium">
                            <BriefcaseIcon className="w-4 h-4 mr-2 text-blue-500" />
                            For Associates
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              data.isForAssociate
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          >
                            {data.isForAssociate ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`p-3 rounded-lg border ${
                          data.isForCustomer
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-sm font-medium">
                            <UsersIcon className="w-4 h-4 mr-2 text-purple-500" />
                            For Customers
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              data.isForCustomer
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          >
                            {data.isForCustomer ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`p-3 rounded-lg border ${
                          data.isForStaff
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-sm font-medium">
                            <UserGroupIcon className="w-4 h-4 mr-2 text-green-500" />
                            For Staff
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              data.isForStaff
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          >
                            {data.isForStaff ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Protected Warning */}
                  {data.text === "Other" && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800 flex items-start">
                        <LockClosedIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>System Protected:</strong> This is a
                          system-protected item and cannot be edited or deleted.
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - System Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <InformationCircleIcon className="w-5 h-5 mr-2" />
                  System Information
                </h3>

                <div className="space-y-4">
                  {/* Creation Info */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      Creation Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <CalendarIcon className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-600">
                            Created:
                          </span>
                          <p className="text-gray-900">
                            {formatDateForDisplay(data.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <UserIcon className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-600">
                            Created By:
                          </span>
                          <p className="text-gray-900">
                            {data.createdByUserName || "Not available"}
                          </p>
                        </div>
                      </div>
                      {data.createdFromIpAddress && (
                        <div className="flex items-start">
                          <GlobeAltIcon className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-gray-600">
                              Created From IP:
                            </span>
                            <p className="text-gray-900">
                              {data.createdFromIpAddress}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modification Info */}
                  <div className="bg-amber-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-amber-900 mb-3 flex items-center">
                      <PencilSquareIcon className="w-4 h-4 mr-2" />
                      Modification Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <CalendarIcon className="w-4 h-4 mr-2 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-600">
                            Modified:
                          </span>
                          <p className="text-gray-900">
                            {data.modifiedAt
                              ? formatDateForDisplay(data.modifiedAt)
                              : "Never modified"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <UserIcon className="w-4 h-4 mr-2 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-600">
                            Modified By:
                          </span>
                          <p className="text-gray-900">
                            {data.modifiedByUserName || "Not available"}
                          </p>
                        </div>
                      </div>
                      {data.modifiedFromIpAddress && (
                        <div className="flex items-start">
                          <GlobeAltIcon className="w-4 h-4 mr-2 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-gray-600">
                              Modified From IP:
                            </span>
                            <p className="text-gray-900">
                              {data.modifiedFromIpAddress}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to List Link */}
        <div className="mt-6">
          <Link
            to="/admin/settings/how-hear-about-us-items"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to How Hear About Us Items
          </Link>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrashIcon className="w-5 h-5 mr-2 text-red-600" />
                  Delete How Hear About Us Item
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete this item? This action cannot
                  be undone and will permanently remove this item from the
                  system.
                </p>

                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Item to be deleted:
                  </p>
                  <p className="text-base font-semibold text-gray-900 mb-1">
                    {data.text}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Sort Number: {data.sortNumber ?? "N/A"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.isForAssociate && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        <BriefcaseIcon className="w-3 h-3 mr-1" />
                        Associate
                      </span>
                    )}
                    {data.isForCustomer && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        <UsersIcon className="w-3 h-3 mr-1" />
                        Customer
                      </span>
                    )}
                    {data.isForStaff && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <UserGroupIcon className="w-3 h-3 mr-1" />
                        Staff
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800 flex items-start">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>
                      <strong>Warning:</strong> This will affect forms where
                      this option is displayed to users, historical records that
                      reference this option, and reports and analytics that
                      include this data.
                    </span>
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    if (!isDeleting) {
                      setShowDeleteModal(false);
                    }
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingHowHearAboutUsItemDetailPage;
