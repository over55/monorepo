import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router";
import { useServiceFeeManager } from "../../../../../services/Services";
import {
  CreditCardIcon,
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
  CurrencyDollarIcon,
  PercentBadgeIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

function SettingServiceFeeDetailPage() {
  const { id } = useParams();
  const serviceFeeManager = useServiceFeeManager();
  const navigate = useNavigate();
  const location = useLocation();

  // Component state
  const [serviceFee, setServiceFee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchServiceFeeDetail = async () => {
    if (!id) {
      setError("Service fee ID is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await serviceFeeManager.getServiceFeeDetail(
        id,
        onUnauthorized,
      );
      setServiceFee(response);
    } catch (err) {
      console.error("Failed to fetch service fee detail:", err);
      setError(err.message || "Failed to load service fee details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceFeeDetail();
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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await serviceFeeManager.deleteServiceFee(id, onUnauthorized);

      // Navigate back to list with success message
      navigate("/admin/settings/service-fees", {
        state: { successMessage: "Service fee deleted successfully" },
      });
    } catch (err) {
      console.error("Failed to delete service fee:", err);
      setError(err.message || "Failed to delete service fee");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const isActive = status === 1;
    return (
      <span
        className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
          isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const getTypeDisplay = (type) => {
    switch (type) {
      case 1:
        return "Standard Service Fee";
      case 2:
        return "Premium Service Fee";
      case 3:
        return "Special Service Fee";
      default:
        return "Unknown Type";
    }
  };

  const getRateDisplay = () => {
    if (serviceFee?.percentage && serviceFee.percentage > 0) {
      return (
        <div className="flex items-center">
          <PercentBadgeIcon className="w-5 h-5 mr-2 text-blue-600" />
          <span className="text-lg font-semibold text-blue-700">
            {serviceFee.percentage}% (Percentage-based)
          </span>
        </div>
      );
    }
    if (serviceFee?.amount && serviceFee.amount > 0) {
      return (
        <div className="flex items-center">
          <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-600" />
          <span className="text-lg font-semibold text-green-700">
            {formatCurrency(serviceFee.amount)} (Fixed amount)
          </span>
        </div>
      );
    }
    return <span className="text-gray-500">No rate set</span>;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading service fee details...</p>
        </div>
      </div>
    );
  }

  // Error state (no data)
  if (error && !serviceFee) {
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
            to="/admin/settings/service-fees"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Service Fees
          </Link>
        </div>
      </div>
    );
  }

  // Not found state
  if (!serviceFee) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              Service fee not found
            </div>
          </div>
          <Link
            to="/admin/settings/service-fees"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Service Fees
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
                  to="/admin/settings/service-fees"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <CreditCardIcon className="w-4 h-4 mr-2" />
                    Service Fees
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                  {serviceFee?.name || "Details"}
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
              <CreditCardIcon className="w-6 h-6 mr-2 text-blue-600" />
              {serviceFee.name}
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  navigate(`/admin/settings/service-fee/${id}/update`)
                }
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <PencilSquareIcon className="w-4 h-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() =>
                  navigate(`/admin/settings/service-fee/${id}/delete`)
                }
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
                        {serviceFee.name}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Description
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[80px]">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {serviceFee.description || (
                          <span className="text-gray-400 italic">
                            No description provided
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Status
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {getStatusBadge(serviceFee.status)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Type
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <TagIcon className="w-4 h-4 mr-2 text-purple-600" />
                          <span className="text-sm font-medium">
                            {getTypeDisplay(serviceFee.type)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Service Fee ID
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-mono text-gray-600">
                        {serviceFee.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Rate & System Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <InformationCircleIcon className="w-5 h-5 mr-2" />
                  Rate & System Information
                </h3>

                <div className="space-y-4">
                  {/* Rate Information */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-900 mb-3 flex items-center">
                      <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                      Rate Configuration
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Current Rate:
                        </span>
                        <div className="mt-1">{getRateDisplay()}</div>
                      </div>

                      {serviceFee.percentage && serviceFee.percentage > 0 && (
                        <div className="pt-2 border-t border-green-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Example:</span> On a
                            $100 transaction, this fee would charge $
                            {((100 * serviceFee.percentage) / 100).toFixed(2)}
                          </p>
                        </div>
                      )}

                      {serviceFee.amount && serviceFee.amount > 0 && (
                        <div className="pt-2 border-t border-green-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Note:</span> Fixed
                            amount charged per transaction
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

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
                            {formatDate(serviceFee.createdAt)}
                          </p>
                        </div>
                      </div>
                      {serviceFee.createdByUserName && (
                        <div className="flex items-start">
                          <UserIcon className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-gray-600">
                              Created By:
                            </span>
                            <p className="text-gray-900">
                              {serviceFee.createdByUserName}
                            </p>
                          </div>
                        </div>
                      )}
                      {serviceFee.createdFromIpAddress && (
                        <div className="flex items-start">
                          <GlobeAltIcon className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-gray-600">
                              Created From IP:
                            </span>
                            <p className="text-gray-900">
                              {serviceFee.createdFromIpAddress}
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
                            {serviceFee.modifiedAt
                              ? formatDate(serviceFee.modifiedAt)
                              : "Never modified"}
                          </p>
                        </div>
                      </div>
                      {serviceFee.modifiedByUserName && (
                        <div className="flex items-start">
                          <UserIcon className="w-4 h-4 mr-2 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-gray-600">
                              Modified By:
                            </span>
                            <p className="text-gray-900">
                              {serviceFee.modifiedByUserName}
                            </p>
                          </div>
                        </div>
                      )}
                      {serviceFee.modifiedFromIpAddress && (
                        <div className="flex items-start">
                          <GlobeAltIcon className="w-4 h-4 mr-2 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-gray-600">
                              Modified From IP:
                            </span>
                            <p className="text-gray-900">
                              {serviceFee.modifiedFromIpAddress}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rate Impact Examples */}
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="text-sm font-medium text-purple-900 mb-3 flex items-center">
                <BanknotesIcon className="w-5 h-5 mr-2" />
                Rate Impact Examples
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {serviceFee.percentage && serviceFee.percentage > 0 ? (
                  <>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-medium text-gray-600">
                        $100 transaction:
                      </p>
                      <p className="text-lg font-semibold text-purple-700">
                        ${((100 * serviceFee.percentage) / 100).toFixed(2)} fee
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-medium text-gray-600">
                        $500 transaction:
                      </p>
                      <p className="text-lg font-semibold text-purple-700">
                        ${((500 * serviceFee.percentage) / 100).toFixed(2)} fee
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-medium text-gray-600">
                        $1,000 transaction:
                      </p>
                      <p className="text-lg font-semibold text-purple-700">
                        ${((1000 * serviceFee.percentage) / 100).toFixed(2)} fee
                      </p>
                    </div>
                  </>
                ) : serviceFee.amount && serviceFee.amount > 0 ? (
                  <div className="bg-white p-3 rounded-lg col-span-3">
                    <p className="font-medium text-gray-600">
                      Fixed fee per transaction:
                    </p>
                    <p className="text-lg font-semibold text-purple-700">
                      {formatCurrency(serviceFee.amount)} regardless of
                      transaction amount
                    </p>
                  </div>
                ) : (
                  <div className="col-span-3 text-gray-500 italic">
                    No rate configured
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back to List Link */}
        <div className="mt-6">
          <Link
            to="/admin/settings/service-fees"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Service Fees
          </Link>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrashIcon className="w-5 h-5 mr-2 text-red-600" />
                  Delete Service Fee
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete this service fee? This action
                  cannot be undone.
                </p>

                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Service fee to be deleted:
                  </p>
                  <p className="text-base font-semibold text-gray-900 mb-1">
                    {serviceFee.name}
                  </p>
                  {serviceFee.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {serviceFee.description}
                    </p>
                  )}
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-sm font-medium text-gray-700">
                      Current Rate:{" "}
                      {serviceFee.percentage && serviceFee.percentage > 0
                        ? `${serviceFee.percentage}%`
                        : serviceFee.amount && serviceFee.amount > 0
                          ? formatCurrency(serviceFee.amount)
                          : "Not set"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800 flex items-start">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>
                      <strong>Warning:</strong> This will affect any
                      transactions that have used this service fee and may
                      impact financial reports.
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

export default SettingServiceFeeDetailPage;
