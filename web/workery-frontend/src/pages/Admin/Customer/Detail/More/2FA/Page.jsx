// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/2FA/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
  LockOpenIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  CogIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import { useCustomerManager } from "../../../../../../services/Services";

function AdminCustomerDetailMore2FAPage() {
  // URL Parameters
  const { cid } = useParams();

  // Navigation
  const navigate = useNavigate();

  // Services
  const customerManager = useCustomerManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load customer details
  useEffect(() => {
    let mounted = true;

    const fetchCustomer = async () => {
      setFetching(true);
      setErrors({});

      try {
        const data = await customerManager.getCustomerDetail(
          cid,
          onUnauthorized,
        );
        if (mounted) {
          setCustomer(data);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch customer:", error);
          setErrors(error);
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    if (cid) {
      fetchCustomer();
    }

    return () => {
      mounted = false;
    };
  }, [cid]);

  // Handle 2FA toggle confirmation
  const handleConfirmToggle = async () => {
    setShowConfirmModal(false);
    setErrors({});
    setFetching(true);

    try {
      // Prepare the data for the API call
      const twoFactorData = {
        customer_id: cid,
        otp_enabled: !customer.otpEnabled,
      };

      // Call the manager to change 2FA settings
      await customerManager.changeCustomerTwoFactorAuth(
        twoFactorData,
        onUnauthorized,
      );

      // Set success message
      const message = customer.otpEnabled
        ? "2FA has been disabled for this customer"
        : "2FA has been enabled for this customer";
      setSuccessMessage(message);

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(`/admin/customer/${cid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to change 2FA settings:", error);
      setErrors(error);
      setFetching(false);
    }
  };

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

  // Render error state
  if (!customer && !isFetching) {
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
                    <UserGroupIcon className="w-4 h-4 mr-2" />
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
                    <CogIcon className="w-4 h-4 mr-2" />
                    More
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                  <DevicePhoneMobileIcon className="w-4 h-4 mr-2" />
                  Two-Factor Authentication
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to Load Customer
            </h3>
            <p className="text-gray-500 mb-6">
              Unable to load customer details. Please try again.
            </p>
            <Link to={`/admin/customer/${cid}/more`}>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to More
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
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
                  <UserGroupIcon className="w-4 h-4 mr-2" />
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
                  <CogIcon className="w-4 h-4 mr-2" />
                  More
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <DevicePhoneMobileIcon className="w-4 h-4 mr-2" />
                Two-Factor Authentication
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
              <UserGroupIcon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" />
              Customer: {customer?.firstName} {customer?.lastName}
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <ShieldCheckIcon className="w-4 h-4 mr-1" />
              Two-Factor Authentication Settings
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
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <XCircleIcon className="w-5 h-5 mr-2" />
          {errors.message ||
            errors.detail ||
            "An error occurred. Please try again."}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Status Banner */}
        {customer?.status === 2 && (
          <div className="bg-blue-50 border-b border-blue-200 text-blue-700 px-6 py-3 flex items-center">
            <ArchiveBoxIcon className="w-5 h-5 mr-2" />
            This customer is archived.
          </div>
        )}

        <div className="p-6">
          {/* 2FA Status Information */}
          {customer && (
            <>
              {!customer.otpEnabled ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start">
                    <LockClosedIcon className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">
                        Enable Two-Factor Authentication
                      </h3>
                      <p className="text-green-800 mb-3">
                        You are about to <strong>enable 2FA</strong> for this
                        customer. This operation will force the customer on
                        their next successful login to be taken through a{" "}
                        <strong>3-step wizard</strong> to setup 2FA. Afterwards,
                        every time the customer logs in, they will be asked to
                        carry out a 2FA process.
                      </p>
                      <p className="text-green-700">
                        Are you sure you want to continue?
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start">
                    <LockOpenIcon className="w-6 h-6 text-amber-600 mt-1 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-amber-900 mb-2">
                        Remove Two-Factor Authentication
                      </h3>
                      <p className="text-amber-800 mb-3">
                        You are about to <strong>remove 2FA</strong> for this
                        customer. This operation will remove previous 2FA setup
                        codes and disable 2FA on login for this customer. This
                        is recommended if the user lost their 2FA codes from
                        their device.
                      </p>
                      <p className="text-amber-700">
                        Are you sure you want to continue?
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Status */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Current 2FA Status:
                  </span>
                  {customer.otpEnabled ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      Disabled
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Link
                  to={`/admin/customer/${cid}/more`}
                  className="w-full sm:w-auto"
                >
                  <button
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isFetching}
                  >
                    <ChevronLeftIcon className="w-4 h-4 mr-2" />
                    Back to More
                  </button>
                </Link>

                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isFetching}
                  className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    !customer.otpEnabled
                      ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                      : "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                  }`}
                >
                  {isFetching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {!customer.otpEnabled ? (
                        <>
                          <LockClosedIcon className="w-4 h-4 mr-2" />
                          Enable 2FA
                        </>
                      ) : (
                        <>
                          <LockOpenIcon className="w-4 h-4 mr-2" />
                          Disable 2FA
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowConfirmModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="sm:flex sm:items-start">
                <div
                  className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                    !customer?.otpEnabled ? "bg-green-100" : "bg-amber-100"
                  }`}
                >
                  {!customer?.otpEnabled ? (
                    <LockClosedIcon className="h-6 w-6 text-green-600" />
                  ) : (
                    <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
                  )}
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    Confirm 2FA Change
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to{" "}
                      {!customer?.otpEnabled ? "enable" : "disable"} Two-Factor
                      Authentication for this customer?
                    </p>
                    {!customer?.otpEnabled && (
                      <p className="mt-2 text-sm text-gray-500">
                        The customer will be required to set up 2FA on their
                        next login.
                      </p>
                    )}
                    {customer?.otpEnabled && (
                      <p className="mt-2 text-sm text-gray-500">
                        This will remove all 2FA settings for this customer.
                        They will be able to login without 2FA verification.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleConfirmToggle}
                  disabled={isFetching}
                  className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed ${
                    !customer?.otpEnabled
                      ? "bg-green-600 hover:bg-green-500"
                      : "bg-amber-600 hover:bg-amber-500"
                  }`}
                >
                  {isFetching ? "Processing..." : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isFetching}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
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

export default AdminCustomerDetailMore2FAPage;
