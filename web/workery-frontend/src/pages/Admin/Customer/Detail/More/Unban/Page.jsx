// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Unban/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UsersIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import {
  useCustomerManager,
  useAuthManager,
} from "../../../../../../services/Services";

function AdminCustomerDetailMoreUnbanPage() {
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
  const [isUnbanning, setIsUnbanning] = useState(false);
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
        // Using callback-based approach from original
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
          setIsInitialized(true);
          setFetching(false);
        }
      }
    };

    if (cid) {
      fetchCustomer();
    } else {
      console.error("No customer ID provided");
      setErrors({ message: "Customer ID is required" });
      setIsInitialized(true);
    }

    return () => {
      mounted = false;
    };
  }, [cid, customerManager, authManager, navigate]);

  // Handle unban confirmation
  const handleConfirmUnban = async () => {
    setShowConfirmModal(false);
    setErrors({});
    setIsUnbanning(true);

    try {
      const unbanData = {
        customer_id: cid,
      };

      // Using callback-based approach from original
      await customerManager.unbanCustomerWithCallbacks(
        unbanData,
        (response) => {
          // Success callback
          setSuccessMessage(
            "Customer has been successfully unbanned and can now access the system",
          );

          // Navigate back to customer detail after a short delay
          setTimeout(() => {
            navigate(`/admin/customer/${cid}/more`);
          }, 2000);
        },
        (error) => {
          // Error callback
          console.error("Failed to unban customer:", error);
          setErrors(error || { message: "Failed to unban customer" });
          setIsUnbanning(false);
        },
        () => {
          // Done callback
          setIsUnbanning(false);
        },
        onUnauthorized,
      );
    } catch (error) {
      console.error("Failed to unban customer:", error);
      setErrors(error || { message: "Failed to unban customer" });
      setIsUnbanning(false);
    }
  };

  // Check if banned
  const isBanned = customer?.isBanned === true;

  // Render loading state
  if (isFetching) {
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
                    <UsersIcon className="w-4 h-4 mr-2" />
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
                  Detail
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
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Unban
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customer details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state (only if initialized and have errors but no customer)
  if (isInitialized && !customer && Object.keys(errors).length > 0) {
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
                    <UsersIcon className="w-4 h-4 mr-2" />
                    Customers
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500">Unban</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.message ||
              errors.general ||
              errors.detail ||
              "Failed to load customer details. Please try again."}
          </div>
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
                  <UsersIcon className="w-4 h-4 mr-2" />
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
                Detail
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
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Unban
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
              <UsersIcon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" />
              Customer: {customer.firstName} {customer.lastName}
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Restore customer access to the system
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error Messages */}
      {errors && Object.keys(errors).length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            {errors.message || errors.general || "An error occurred"}
          </div>
        </div>
      )}

      {/* Status banners */}
      {customer?.status === 2 && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg flex items-center">
          <InformationCircleIcon className="w-5 h-5 mr-2" />
          Customer is archived
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6">
          {/* Info Message */}
          {isBanned ? (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 mr-3 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Restore Customer Access
                  </h3>
                  <p className="text-green-800 mb-3">
                    You are about to <strong>unban</strong> this customer. This
                    means:
                  </p>
                  <ul className="space-y-1 text-green-800 ml-4">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Ban status will be removed</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Warning banner will no longer display</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Customer will regain full access to services</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Previous ban reason will be cleared</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>The customer can be banned again if necessary</span>
                    </li>
                  </ul>
                  <p className="mt-3 text-green-800">
                    Please ensure this decision has been properly reviewed and
                    approved.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2" />
              This customer is not currently banned. No unban action is needed.
            </div>
          )}

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Information
            </h4>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {customer.firstName} {customer.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{customer.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {customer.phone || "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Current Status
                </dt>
                <dd className="mt-1 text-sm">
                  {isBanned ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <ShieldExclamationIcon className="w-3.5 h-3.5 mr-1" />
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
              {customer.banningReason && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Ban Reason
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 italic">
                    {customer.banningReason}
                  </dd>
                </div>
              )}
              {customer.banningReasonOther && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Additional Details
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 italic">
                    {customer.banningReasonOther}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link
              to={`/admin/customer/${cid}/more`}
              className="w-full sm:w-auto"
            >
              <button
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUnbanning}
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to More
              </button>
            </Link>

            {isBanned && (
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isUnbanning}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                {isUnbanning ? "Processing..." : "Proceed with Unban"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowConfirmModal(false)}
            />
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isUnbanning}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    Confirm Unban
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      You are about to restore access for:
                    </p>
                    <p className="font-semibold text-gray-900 my-2">
                      {customer.firstName} {customer.lastName} ({customer.email}
                      )
                    </p>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 my-3">
                      <p className="text-sm font-medium text-green-800 mb-2">
                        Actions that will occur:
                      </p>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Ban status will be removed</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Warning banner will no longer display</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>
                            Customer will regain full access to services
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Previous ban reason will be cleared</span>
                        </li>
                      </ul>
                    </div>

                    <p className="text-sm text-gray-500 mt-3">
                      Are you sure you want to proceed with unbanning this
                      customer?
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleConfirmUnban}
                  disabled={isUnbanning}
                >
                  {isUnbanning ? "Unbanning..." : "Yes, Unban Customer"}
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isUnbanning}
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

export default AdminCustomerDetailMoreUnbanPage;
