// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Ban/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  XMarkIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  useCustomerManager,
  useAuthManager,
} from "../../../../../../services/Services";

// Banning reason options (based on typical customer ban reasons)
const CUSTOMER_BANNING_REASON_OPTIONS = [
  { value: "", label: "Please select" },
  { value: 1, label: "Other (please specify)" },
  { value: 2, label: "Abusive behavior" },
  { value: 3, label: "Fraudulent activity" },
  { value: 4, label: "Violation of terms of service" },
  { value: 5, label: "Non-payment of services" },
  { value: 6, label: "Harassment of staff or associates" },
  { value: 7, label: "Repeated policy violations" },
];

function AdminCustomerDetailMoreBanPage() {
  // URL Parameters
  const { cid } = useParams();

  // Navigation
  const navigate = useNavigate();

  // Services
  const customerManager = useCustomerManager();
  const authManager = useAuthManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [banningReason, setBanningReason] = useState("");
  const [banningReasonOther, setBanningReasonOther] = useState("");
  const [isBanning, setIsBanning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load customer details
  useEffect(() => {
    let mounted = true;

    const fetchCustomer = async () => {
      if (!authManager.isAuthenticated()) {
        navigate("/login");
        return;
      }

      console.log("Fetching customer with ID:", cid);
      setFetching(true);
      setErrors({});

      try {
        // Using callback-based approach for consistency with existing customer manager
        await customerManager.getCustomerDetailWithCallbacks(
          cid,
          (customerData) => {
            console.log("Customer data received:", customerData);
            if (mounted) {
              setCustomer(customerData);
              setIsInitialized(true);
            }
          },
          (error) => {
            console.error("Failed to fetch customer:", error);
            if (mounted) {
              setErrors(
                error || { message: "Failed to load customer details" },
              );
              setIsInitialized(true);
            }
          },
          () => {
            if (mounted) {
              setFetching(false);
            }
          },
          onUnauthorized,
        );
      } catch (error) {
        console.error("Failed to fetch customer:", error);
        if (mounted) {
          setErrors({ message: "Failed to load customer information" });
          setFetching(false);
          setIsInitialized(true);
        }
      }
    };

    if (cid) {
      fetchCustomer();
    } else {
      console.error("No customer ID provided");
      setErrors({ message: "No customer ID provided" });
      setIsInitialized(true);
    }

    return () => {
      mounted = false;
    };
  }, [cid, customerManager, authManager, navigate]);

  // Handle ban confirmation
  const handleConfirmBan = async () => {
    // Validate reason
    if (!banningReason) {
      setErrors({ banningReason: "Please select a banning reason" });
      return;
    }

    if (parseInt(banningReason) === 1 && !banningReasonOther.trim()) {
      setErrors({ banningReasonOther: "Please specify the banning reason" });
      return;
    }

    setShowConfirmModal(false);
    setErrors({});
    setIsBanning(true);

    try {
      const banData = {
        customer_id: cid,
        banning_reason: parseInt(banningReason),
        banning_reason_other: banningReasonOther.trim(),
      };

      console.log("Ban data:", banData);

      // Using callback-based approach for consistency
      await customerManager.banCustomerWithCallbacks(
        banData,
        (response) => {
          // Success callback
          setSuccessMessage("Customer has been successfully banned");

          // Navigate to customer more page after a short delay
          setTimeout(() => {
            navigate(`/admin/customer/${cid}/more`);
          }, 2000);
        },
        (error) => {
          // Error callback
          console.error("Failed to ban customer:", error);
          setErrors(error || { message: "Failed to ban customer" });
        },
        () => {
          // Done callback
          setIsBanning(false);
        },
        onUnauthorized,
      );
    } catch (error) {
      console.error("Failed to ban customer:", error);
      setErrors({ message: "Failed to ban customer" });
      setIsBanning(false);
    }
  };

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return "N/A";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };

  // Check if already banned
  const isAlreadyBanned = customer?.status === 100 || customer?.isBanned;

  // Render loading state
  if (isFetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customer details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (isInitialized && !customer && Object.keys(errors).length > 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex">
            <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              {errors.message ||
                errors.detail ||
                "Failed to load customer details. Please try again."}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Link to={`/admin/customer/${cid}/more`}>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Back to More
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Don't render main content until we have customer data
  if (!customer) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/customer/${cid}`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <InformationCircleIcon className="w-4 h-4 mr-2" />
                  Detail
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/customer/${cid}/more`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <EllipsisHorizontalIcon className="w-4 h-4 mr-2" />
                  More
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <NoSymbolIcon className="w-4 h-4 mr-2" />
                Ban
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
          <UserIcon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" />
          Customer: {customer.firstName} {customer.lastName}
        </h1>
        <p className="mt-1 text-sm text-gray-600 flex items-center">
          <ShieldExclamationIcon className="w-4 h-4 mr-1" />
          Ban Customer
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Error Messages */}
      {errors &&
        (errors.banningReason ||
          errors.banningReasonOther ||
          errors.message) && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex">
              <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                {errors.banningReason ||
                  errors.banningReasonOther ||
                  errors.message}
              </div>
            </div>
          </div>
        )}

      {/* Main Content Card */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6">
          {/* Warning Message */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-3">
                  Ban Customer - Severe Action Warning
                </h3>
                <p className="text-red-800 mb-3">
                  You are about to <strong>permanently ban</strong> this
                  customer. This means:
                </p>
                <ul className="space-y-2 text-red-700 ml-4">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    The customer will be <strong>immediately</strong> logged out
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    They will <strong>not</strong> be able to log in again
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    All access to the system will be{" "}
                    <strong>permanently revoked</strong>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    The customer will not be able to place or manage any work
                    orders
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    The customer will still appear in search results with a{" "}
                    <strong>banned banner displayed</strong>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    This action is <strong>irreversible</strong> without system
                    administrator intervention
                  </li>
                </ul>
                <p className="mt-4 font-semibold text-red-900">
                  This action should only be taken for serious violations or
                  security concerns.
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Information:
            </h4>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name:</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {customer.firstName} {customer.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email:</dt>
                <dd className="mt-1 text-sm text-gray-900">{customer.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone:</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatPhone(customer.phone)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Current Status:
                </dt>
                <dd className="mt-1 text-sm">
                  {isAlreadyBanned ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <NoSymbolIcon className="w-4 h-4 mr-1" />
                      Banned
                    </span>
                  ) : customer.status === 1 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : customer.status === 2 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Archived
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Unknown
                    </span>
                  )}
                </dd>
              </div>
              {customer.typeOf && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type:</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {customer.typeOf === 1
                      ? "Residential"
                      : customer.typeOf === 2
                        ? "Commercial"
                        : "Unknown"}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Ban Reason Form */}
          {!isAlreadyBanned && (
            <>
              {/* Banning Reason Dropdown */}
              <div className="mb-4">
                <label
                  htmlFor="banningReason"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Banning Reason <span className="text-red-500">*</span>
                </label>
                <select
                  id="banningReason"
                  name="banningReason"
                  value={banningReason}
                  onChange={(e) => {
                    setBanningReason(e.target.value);
                    setErrors({}); // Clear errors when selecting
                  }}
                  disabled={isBanning}
                  className={`block w-full rounded-lg border ${
                    errors.banningReason ? "border-red-300" : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                >
                  {CUSTOMER_BANNING_REASON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Other Reason Text Field */}
              {parseInt(banningReason) === 1 && (
                <div className="mb-6">
                  <label
                    htmlFor="banningReasonOther"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Banning Reason (Other){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="banningReasonOther"
                    name="banningReasonOther"
                    rows={5}
                    value={banningReasonOther}
                    onChange={(e) => {
                      setBanningReasonOther(e.target.value);
                      setErrors({}); // Clear errors when typing
                    }}
                    disabled={isBanning}
                    className={`block w-full rounded-lg border ${
                      errors.banningReasonOther
                        ? "border-red-300"
                        : "border-gray-300"
                    } px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    placeholder="Please provide a detailed reason for banning this customer..."
                    maxLength={500}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    This reason will be recorded in the system logs and may be
                    reviewed by administrators.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Already Banned Message */}
          {isAlreadyBanned && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              This customer is already banned. No further action is needed.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
            <Link to={`/admin/customer/${cid}/more`}>
              <button
                disabled={isBanning}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to More
              </button>
            </Link>

            {!isAlreadyBanned && (
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isBanning || !banningReason}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <NoSymbolIcon className="w-4 h-4 mr-2" />
                {isBanning ? "Processing..." : "Proceed with Ban"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowConfirmModal(false)}
            ></div>

            {/* Modal Content */}
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon
                      className="h-6 w-6 text-red-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      Final Ban Confirmation
                    </h3>
                    <div className="mt-2">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-800 font-semibold">
                          ⚠️ THIS ACTION CANNOT BE UNDONE
                        </p>
                      </div>

                      <p className="text-sm text-gray-500 mb-3">
                        You are about to permanently ban:
                      </p>

                      <p className="text-sm font-semibold text-gray-900 mb-3">
                        {customer.firstName} {customer.lastName} (
                        {customer.email})
                      </p>

                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Ban Reason:
                        </p>
                        <p className="text-sm text-gray-600 font-semibold">
                          {
                            CUSTOMER_BANNING_REASON_OPTIONS.find(
                              (opt) => opt.value == banningReason,
                            )?.label
                          }
                        </p>
                        {parseInt(banningReason) === 1 &&
                          banningReasonOther && (
                            <p className="text-sm text-gray-600 italic mt-1">
                              Details: {banningReasonOther}
                            </p>
                          )}
                      </div>

                      <p className="text-sm text-gray-500 mb-3">
                        This will immediately revoke all access and log the
                        customer out of the system.
                      </p>

                      <p className="text-sm font-semibold text-red-600">
                        Are you absolutely certain you want to proceed?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleConfirmBan}
                  disabled={isBanning}
                  className="inline-flex w-full justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 sm:ml-3 sm:w-auto disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isBanning ? "Banning..." : "Yes, Ban Customer"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isBanning}
                  className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomerDetailMoreBanPage;
