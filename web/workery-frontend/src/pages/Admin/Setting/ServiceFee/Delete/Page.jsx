import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useServiceFeeManager } from "../../../../../services/Services";
import {
  CreditCardIcon,
  ChevronRightIcon,
  XMarkIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  BanknotesIcon,
  ClockIcon,
  UserIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  PercentBadgeIcon,
  CurrencyDollarIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import {
  formatDateForDisplay,
  formatDateTime,
} from "../../../../../services/Helpers/DateFormatter";

function SettingServiceFeeDeletePage() {
  const { id } = useParams();
  const serviceFeeManager = useServiceFeeManager();
  const navigate = useNavigate();

  // Component state
  const [serviceFee, setServiceFee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmationText, setConfirmationText] = useState("");

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

  const handleDelete = async () => {
    if (!serviceFee) return;

    // Validate confirmation text
    if (confirmationText !== serviceFee.name) {
      setError(`Please type "${serviceFee.name}" exactly to confirm`);
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await serviceFeeManager.deleteServiceFee(id, onUnauthorized);

      // Success - redirect to list page
      navigate("/admin/settings/service-fees", {
        state: {
          successMessage: "Service fee deleted successfully",
        },
      });
    } catch (err) {
      console.error("Failed to delete service fee:", err);
      setError(err.message || "Failed to delete service fee");
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/settings/service-fee/${id}/detail`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getRateDisplay = () => {
    if (!serviceFee) return "Unknown";

    if (serviceFee.percentage && serviceFee.percentage > 0) {
      return `${serviceFee.percentage}% (Percentage-based)`;
    }
    if (serviceFee.amount && serviceFee.amount > 0) {
      return `${formatCurrency(serviceFee.amount)} (Fixed amount)`;
    }
    return "No rate set";
  };

  const getStatusDisplay = (status) => {
    return status === 1 ? "Active" : "Inactive";
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

  // Error state (no data loaded)
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
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to={`/admin/settings/service-fee/${id}/detail`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                    {serviceFee?.name || "Detail"}
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

        {/* Warning Alert */}
        <div className="mb-6 bg-red-50 border-2 border-red-300 text-red-800 px-4 py-4 rounded-lg flex items-start">
          <BanknotesIcon className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-lg">Permanent Deletion Warning</p>
            <p className="text-sm mt-1">
              You are about to permanently delete this service fee. This action
              cannot be undone and may affect historical transaction data.
            </p>
          </div>
        </div>

        {/* Main Delete Card */}
        <div className="bg-white shadow-sm rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
              <TrashIcon className="w-6 h-6 mr-2 text-red-600" />
              Delete Service Fee
            </h1>
          </div>

          <div className="p-6">
            {/* Error Messages */}
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

            {/* Item Details Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-red-600 mb-4">
                Service fee to be deleted:
              </h3>

              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name:
                    </label>
                    <div className="p-3 bg-white rounded border border-gray-300 font-semibold text-lg">
                      {serviceFee.name}
                    </div>
                  </div>

                  {serviceFee.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description:
                      </label>
                      <div className="p-3 bg-white rounded border border-gray-300 text-gray-700">
                        {serviceFee.description}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rate:
                      </label>
                      <div className="p-3 bg-white rounded border border-gray-300">
                        <div className="flex items-center">
                          {serviceFee.percentage &&
                          serviceFee.percentage > 0 ? (
                            <>
                              <PercentBadgeIcon className="w-5 h-5 mr-2 text-blue-500" />
                              <span className="font-medium text-blue-700">
                                {serviceFee.percentage}%
                              </span>
                            </>
                          ) : serviceFee.amount && serviceFee.amount > 0 ? (
                            <>
                              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-500" />
                              <span className="font-medium text-green-700">
                                {formatCurrency(serviceFee.amount)}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-500">No rate set</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type:
                      </label>
                      <div className="p-3 bg-white rounded border border-gray-300">
                        <div className="flex items-center">
                          <TagIcon className="w-5 h-5 mr-2 text-purple-500" />
                          <span>{getTypeDisplay(serviceFee.type)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-2 border-t border-red-200">
                    <div>
                      <span className="font-medium text-gray-600">ID:</span>{" "}
                      <span className="text-gray-900">{serviceFee.id}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>{" "}
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          serviceFee.status === 1
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getStatusDisplay(serviceFee.status)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Created:
                      </span>{" "}
                      <span className="text-gray-900">
                        {serviceFee.createdAt
                          ? new Date(serviceFee.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Warning */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
              <h4 className="text-base font-medium text-amber-800 mb-3 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                This deletion will affect:
              </h4>
              <ul className="text-sm text-amber-700 space-y-1 ml-7">
                <li className="flex items-start">
                  <BuildingOfficeIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Any transactions that have used this service fee</span>
                </li>
                <li className="flex items-start">
                  <DocumentTextIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    Historical records and financial reports that include this
                    fee
                  </span>
                </li>
                <li className="flex items-start">
                  <ClipboardDocumentIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    Any invoices or receipts that reference this fee structure
                  </span>
                </li>
                <li className="flex items-start">
                  <CreditCardIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    Future transactions will not be able to use this fee
                  </span>
                </li>
              </ul>
              <div className="mt-3 pt-3 border-t border-amber-200">
                <p className="text-sm font-medium text-amber-900">
                  <strong>Alternative:</strong> Consider setting the status to
                  "Inactive" instead of deleting to preserve historical data.
                </p>
              </div>
            </div>

            {/* Confirmation Section */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <h4 className="text-base font-medium text-red-700 mb-3 flex items-center">
                <LockClosedIcon className="w-5 h-5 mr-2" />
                Confirmation Required
              </h4>

              <p className="text-sm text-gray-700 mb-3">
                This action will permanently remove the service fee from the
                system. All associated data will be lost and cannot be
                recovered.
              </p>

              <p className="text-sm font-medium text-gray-900 mb-3">
                To confirm deletion, please type{" "}
                <code className="px-2 py-1 bg-gray-200 rounded text-red-600 font-mono">
                  {serviceFee.name}
                </code>{" "}
                in the box below:
              </p>

              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={`Type "${serviceFee.name}" to confirm`}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  confirmationText === serviceFee.name
                    ? "border-green-500 bg-green-50 focus:ring-green-500"
                    : "border-red-300 bg-red-50 focus:ring-red-500"
                }`}
                disabled={isDeleting}
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
              <Link
                to={`/admin/settings/service-fee/${id}/detail`}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to Detail
              </Link>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCancel}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <Link
                  to={`/admin/settings/service-fee/${id}/update`}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                    isDeleting ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <PencilSquareIcon className="w-4 h-4 mr-2" />
                  Edit Instead
                </Link>

                <button
                  onClick={handleDelete}
                  disabled={isDeleting || confirmationText !== serviceFee.name}
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
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Information Card */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2" />
              System Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="font-medium text-gray-500 mb-1 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Created At:
                </p>
                <p className="text-gray-900 ml-5">
                  {formatDateForDisplay(serviceFee.createdAt)}
                </p>
              </div>
              {serviceFee.createdByUserName && (
                <div>
                  <p className="font-medium text-gray-500 mb-1 flex items-center">
                    <UserIcon className="w-4 h-4 mr-1" />
                    Created By:
                  </p>
                  <p className="text-gray-900 ml-5">
                    {serviceFee.createdByUserName}
                  </p>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-500 mb-1 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Last Modified:
                </p>
                <p className="text-gray-900 ml-5">
                  {serviceFee.modifiedAt
                    ? formatDateForDisplay(serviceFee.modifiedAt)
                    : "Never modified"}
                </p>
              </div>
              {serviceFee.modifiedByUserName && (
                <div>
                  <p className="font-medium text-gray-500 mb-1 flex items-center">
                    <UserIcon className="w-4 h-4 mr-1" />
                    Modified By:
                  </p>
                  <p className="text-gray-900 ml-5">
                    {serviceFee.modifiedByUserName}
                  </p>
                </div>
              )}
              {serviceFee.createdFromIpAddress && (
                <div>
                  <p className="font-medium text-gray-500 mb-1 flex items-center">
                    <GlobeAltIcon className="w-4 h-4 mr-1" />
                    Created From IP:
                  </p>
                  <p className="text-gray-900 ml-5">
                    {serviceFee.createdFromIpAddress}
                  </p>
                </div>
              )}
              {serviceFee.modifiedFromIpAddress && (
                <div>
                  <p className="font-medium text-gray-500 mb-1 flex items-center">
                    <GlobeAltIcon className="w-4 h-4 mr-1" />
                    Modified From IP:
                  </p>
                  <p className="text-gray-900 ml-5">
                    {serviceFee.modifiedFromIpAddress}
                  </p>
                </div>
              )}
            </div>

            {/* Additional Service Fee Specific Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Fee Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-500 mb-1">Fee Type:</p>
                  <p className="text-gray-900 flex items-center">
                    <TagIcon className="w-4 h-4 mr-1 text-purple-500" />
                    {getTypeDisplay(serviceFee.type)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-500 mb-1">
                    Rate Structure:
                  </p>
                  <p className="text-gray-900 flex items-center">
                    {serviceFee.percentage && serviceFee.percentage > 0 ? (
                      <>
                        <PercentBadgeIcon className="w-4 h-4 mr-1 text-blue-500" />
                        Percentage-based
                      </>
                    ) : (
                      <>
                        <CurrencyDollarIcon className="w-4 h-4 mr-1 text-green-500" />
                        Fixed amount
                      </>
                    )}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-500 mb-1">
                    Current Value:
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {serviceFee.percentage && serviceFee.percentage > 0
                      ? `${serviceFee.percentage}%`
                      : serviceFee.amount && serviceFee.amount > 0
                        ? formatCurrency(serviceFee.amount)
                        : "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isDeleting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl border-2 border-red-500">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Deleting Service Fee...
                  </p>
                  <p className="text-sm text-gray-500">
                    Please wait while we remove this fee from the system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingServiceFeeDeletePage;
