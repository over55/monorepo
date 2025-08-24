// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Downgrade/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  HomeIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  ArrowDownIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  useCustomerManager,
  useAuthManager,
} from "../../../../../../services/Services";

function AdminCustomerDetailMoreDowngradePage() {
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
  const [isDowngrading, setIsDowngrading] = useState(false);

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

      setFetching(true);
      setErrors({});

      try {
        // Using callback-based approach similar to old code structure
        await customerManager.getCustomerDetailWithCallbacks(
          cid,
          (customerData) => {
            if (mounted) {
              setCustomer(customerData);
            }
          },
          (error) => {
            if (mounted) {
              console.error("Failed to fetch customer:", error);
              setErrors(error);
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
          setErrors({ general: "Failed to load customer information" });
          setFetching(false);
        }
      }
    };

    if (cid) {
      fetchCustomer();
    } else {
      setErrors({ general: "Customer ID is required" });
      setFetching(false);
    }

    return () => {
      mounted = false;
    };
  }, [cid, customerManager, authManager, navigate]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showConfirmModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showConfirmModal]);

  // Handle showing the modal
  const handleShowModal = () => {
    console.log("Opening confirm modal...");
    setShowConfirmModal(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    console.log("Closing confirm modal...");
    setShowConfirmModal(false);
  };

  // Handle downgrade confirmation
  const handleConfirmDowngrade = async () => {
    console.log("Starting downgrade process for customer:", cid);

    // Close modal first
    setShowConfirmModal(false);

    // Update UI state
    setErrors({});
    setIsDowngrading(true);
    setSuccessMessage("");

    try {
      console.log("Calling customerManager.downgradeCustomer...");

      // Using callback-based approach for consistency
      await customerManager.downgradeCustomerWithCallbacks(
        cid,
        (response) => {
          console.log("Downgrade response:", response);

          // Set success message
          setSuccessMessage(
            "Customer has been successfully downgraded to Residential type",
          );

          // Clear any errors
          setErrors({});
          setIsDowngrading(false);

          // Navigate back after a short delay
          setTimeout(() => {
            navigate(`/admin/customer/${cid}/more`);
          }, 2000);
        },
        (error) => {
          console.error("Failed to downgrade customer:", error);

          // Handle error properly
          if (error && typeof error === "object") {
            if (error.message) {
              setErrors({ general: error.message });
            } else if (error.detail) {
              setErrors({ general: error.detail });
            } else if (error.error) {
              setErrors({ general: error.error });
            } else {
              setErrors({
                general: "Failed to downgrade customer. Please try again.",
              });
            }
          } else {
            setErrors({
              general: "An unexpected error occurred. Please try again.",
            });
          }

          setIsDowngrading(false);
          setSuccessMessage("");
        },
        () => {
          // Done callback
          setIsDowngrading(false);
        },
        onUnauthorized,
      );
    } catch (error) {
      console.error("Failed to downgrade customer:", error);
      setErrors({ general: "Failed to downgrade customer" });
      setIsDowngrading(false);
    }
  };

  // Check if already residential or not business type
  const isNotBusiness = !customer?.organizationName || customer?.typeOf !== 3;

  // Render loading state
  if (isFetching && !customer) {
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

  return (
    <>
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
                  <ArrowDownIcon className="w-4 h-4 mr-2" />
                  Downgrade
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            <UserIcon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" />
            Customer: {customer?.firstName} {customer?.lastName}
          </h1>
          <p className="mt-1 text-sm text-gray-600 flex items-center">
            <HomeIcon className="w-4 h-4 mr-1" />
            Downgrade to Residential
          </p>
        </div>

        {/* Page banners */}
        {customer?.status === 2 && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
            <InformationCircleIcon className="w-5 h-5 mr-2" />
            Customer is archived
          </div>
        )}
        {customer?.isBanned && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            Customer is banned
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <InformationCircleIcon className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}

        {/* Error Messages */}
        {errors && Object.keys(errors).length > 0 && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span>
                {errors.general ||
                  errors.message ||
                  errors.detail ||
                  "An error occurred. Please try again."}
              </span>
              <button
                onClick={() => setErrors({})}
                className="text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <ArrowDownIcon className="w-6 h-6 mr-2 text-amber-600" />
              Downgrade Customer
            </h2>
          </div>

          <div className="px-4 sm:px-6 py-6">
            {/* Warning Message */}
            {!isNotBusiness ? (
              <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Downgrade Warning</h4>
                    <p className="text-sm mb-3">
                      You are about to <strong>downgrade</strong> this customer
                      from <strong>Business</strong> type to{" "}
                      <strong>Residential</strong> type. This will affect:
                    </p>
                    <ul className="text-sm space-y-1 ml-4 list-disc">
                      <li>
                        The rates applied to their work orders (will use
                        residential rates)
                      </li>
                      <li>The types of services they can receive</li>
                      <li>Tax and billing calculations</li>
                      <li>Terms and conditions that apply</li>
                      <li>Organization information will be removed</li>
                      <li>Associate assignment criteria may change</li>
                    </ul>
                    <p className="text-sm mt-3 font-semibold">
                      Are you sure you want to continue?
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
                <InformationCircleIcon className="w-5 h-5 mr-2" />
                This customer is not currently a Business type account. No
                downgrade is needed.
              </div>
            )}

            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Current Customer Information
              </h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {customer?.firstName} {customer?.lastName}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {customer?.email || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Current Type
                  </dt>
                  <dd className="mt-1 text-sm">
                    {customer?.typeOf === 1 ? (
                      <span className="text-gray-600">Unassigned</span>
                    ) : customer?.typeOf === 2 ? (
                      <span className="text-blue-600 font-medium">
                        Residential
                      </span>
                    ) : customer?.typeOf === 3 ? (
                      <span className="text-green-600 font-medium">
                        Commercial/Business
                      </span>
                    ) : (
                      <span className="text-gray-600">Unknown</span>
                    )}
                  </dd>
                </div>
                {customer?.organizationName && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Current Organization
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer.organizationName}{" "}
                      <span className="text-red-600 text-xs font-medium">
                        (will be removed)
                      </span>
                    </dd>
                  </div>
                )}
                {customer?.organizationType && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Organization Type
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer.organizationType === 1
                        ? "Private"
                        : customer.organizationType === 2
                          ? "Non-Profit"
                          : customer.organizationType === 3
                            ? "Government"
                            : "Unknown"}{" "}
                      <span className="text-red-600 text-xs font-medium">
                        (will be removed)
                      </span>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Impact Information */}
            {!isNotBusiness && (
              <div className="bg-amber-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-amber-900 mb-3 flex items-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                  After Downgrade
                </h4>
                <ul className="text-sm text-amber-800 space-y-2">
                  <li className="flex items-start">
                    <span className="block w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 mr-2 flex-shrink-0"></span>
                    Residential rates will apply to all future work orders
                  </li>
                  <li className="flex items-start">
                    <span className="block w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 mr-2 flex-shrink-0"></span>
                    The customer will be classified as a residential client
                  </li>
                  <li className="flex items-start">
                    <span className="block w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 mr-2 flex-shrink-0"></span>
                    Business-specific features will be disabled
                  </li>
                  <li className="flex items-start">
                    <span className="block w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 mr-2 flex-shrink-0"></span>
                    Organization information will be permanently removed
                  </li>
                  <li className="flex items-start">
                    <span className="block w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 mr-2 flex-shrink-0"></span>
                    Service terms and conditions will be updated
                  </li>
                  <li className="flex items-start">
                    <span className="block w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 mr-2 flex-shrink-0"></span>
                    Associate assignment criteria may change
                  </li>
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <Link to={`/admin/customer/${cid}/more`}>
                <button
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isDowngrading}
                >
                  <ChevronLeftIcon className="w-4 h-4 mr-2" />
                  Back to More
                </button>
              </Link>

              {!isNotBusiness && (
                <button
                  onClick={handleShowModal}
                  disabled={isDowngrading}
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDowngrading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <HomeIcon className="w-4 h-4 mr-2" />
                      Downgrade to Residential
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal - Rendered at root level */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={handleCloseModal}
            ></div>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            {/* Modal panel */}
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon
                      className="h-6 w-6 text-red-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Confirm Downgrade
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You are about to downgrade the following customer to
                        Residential type:
                      </p>

                      <div className="mt-3 bg-gray-50 rounded-lg p-3">
                        <p className="text-sm">
                          <span className="font-medium">Customer:</span>{" "}
                          {customer?.firstName} {customer?.lastName}
                        </p>
                        {customer?.organizationName && (
                          <p className="text-sm mt-1">
                            <span className="font-medium">
                              Current Organization:
                            </span>{" "}
                            {customer.organizationName}{" "}
                            <span className="text-red-600 text-xs">
                              (will be removed)
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-amber-800">
                          This will remove all business information and change
                          their account type to Residential, affecting rates and
                          terms for all future work orders.
                        </p>
                      </div>

                      <p className="text-sm text-gray-900 font-medium mt-3">
                        Are you sure you want to proceed?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleConfirmDowngrade}
                  disabled={isDowngrading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDowngrading
                    ? "Downgrading..."
                    : "Yes, Downgrade to Residential"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isDowngrading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminCustomerDetailMoreDowngradePage;
