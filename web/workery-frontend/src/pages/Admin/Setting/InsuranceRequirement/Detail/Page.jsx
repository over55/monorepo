// File Path: web/workery-frontend/src/pages/Admin/Setting/InsuranceRequirement/Detail/Page.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router";
import { useInsuranceRequirementManager } from "../../../../../services/Services";
import {
  ShieldCheckIcon,
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
} from "@heroicons/react/24/outline";

function SettingInsuranceRequirementDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const insuranceRequirementManager = useInsuranceRequirementManager();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [insuranceRequirement, setInsuranceRequirement] = useState(null);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch insurance requirement details
  const fetchInsuranceRequirementDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response =
        await insuranceRequirementManager.getInsuranceRequirementDetail(
          id,
          onUnauthorized,
        );

      setInsuranceRequirement(response);
    } catch (err) {
      console.error("Failed to fetch insurance requirement detail:", err);
      setError(err.message || "Failed to load insurance requirement details");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await insuranceRequirementManager.deleteInsuranceRequirement(
        id,
        onUnauthorized,
      );

      // Navigate back to list with success message
      navigate("/admin/settings/insurance-requirements", {
        state: { successMessage: "Insurance requirement deleted successfully" },
      });
    } catch (err) {
      console.error("Failed to delete insurance requirement:", err);
      setError(err.message || "Failed to delete insurance requirement");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (id) {
      fetchInsuranceRequirementDetail();
    } else {
      setError("Invalid insurance requirement ID");
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

  // Handle URL state (success message from other pages)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get("success");
    if (message) {
      setSuccessMessage(message);
      // Clear the URL parameter
      window.history.replaceState({}, "", window.location.pathname);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading insurance requirement details...
          </p>
        </div>
      </div>
    );
  }

  // Error state (no data)
  if (error && !insuranceRequirement) {
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
            to="/admin/settings/insurance-requirements"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Insurance Requirements
          </Link>
        </div>
      </div>
    );
  }

  // Not found state
  if (!insuranceRequirement) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              Insurance requirement not found
            </div>
          </div>
          <Link
            to="/admin/settings/insurance-requirements"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Insurance Requirements
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
                  to="/admin/settings/insurance-requirements"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <ShieldCheckIcon className="w-4 h-4 mr-2" />
                    Insurance Requirements
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                  {insuranceRequirement?.name || "Details"}
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
              <ShieldCheckIcon className="w-6 h-6 mr-2 text-blue-600" />
              {insuranceRequirement.name}
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  navigate(`/admin/settings/insurance-requirement/${id}/update`)
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
                      Name
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-base font-semibold text-gray-900">
                        {insuranceRequirement.name}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Description
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[80px]">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {insuranceRequirement.description || (
                          <span className="text-gray-400 italic">
                            No description provided
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Requirement ID
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-mono text-gray-600">
                        {insuranceRequirement.id}
                      </p>
                    </div>
                  </div>
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
                            {insuranceRequirement.createdAt || "Not available"}
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
                            {insuranceRequirement.createdByUserName ||
                              "Not available"}
                          </p>
                        </div>
                      </div>
                      {insuranceRequirement.createdFromIpAddress && (
                        <div className="flex items-start">
                          <GlobeAltIcon className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-gray-600">
                              Created From IP:
                            </span>
                            <p className="text-gray-900">
                              {insuranceRequirement.createdFromIpAddress}
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
                            {insuranceRequirement.modifiedAt ||
                              "Never modified"}
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
                            {insuranceRequirement.modifiedByUserName ||
                              "Not available"}
                          </p>
                        </div>
                      </div>
                      {insuranceRequirement.modifiedFromIpAddress && (
                        <div className="flex items-start">
                          <GlobeAltIcon className="w-4 h-4 mr-2 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-gray-600">
                              Modified From IP:
                            </span>
                            <p className="text-gray-900">
                              {insuranceRequirement.modifiedFromIpAddress}
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
            to="/admin/settings/insurance-requirements"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Insurance Requirements
          </Link>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrashIcon className="w-5 h-5 mr-2 text-red-600" />
                  Delete Insurance Requirement
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete this insurance requirement?
                  This action cannot be undone.
                </p>

                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Insurance requirement to be deleted:
                  </p>
                  <p className="text-base font-semibold text-gray-900 mb-1">
                    {insuranceRequirement.name}
                  </p>
                  {insuranceRequirement.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {insuranceRequirement.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800 flex items-start">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>
                      <strong>Warning:</strong> This will affect any associates
                      or jobs that reference this insurance requirement.
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

export default SettingInsuranceRequirementDetailPage;
