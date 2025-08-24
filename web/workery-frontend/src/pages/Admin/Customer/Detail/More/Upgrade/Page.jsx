// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Upgrade/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChartBarIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ArrowUpCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  useCustomerManager,
  useAuthManager,
} from "../../../../../../services/Services";

// Organization type options for customers
const CUSTOMER_ORGANIZATION_TYPE_OPTIONS = [
  { value: "", label: "Please select" },
  { value: "1", label: "Private Corporation" },
  { value: "2", label: "Non-Profit Corporation" },
  { value: "3", label: "Partnership" },
  { value: "4", label: "Sole Proprietorship" },
  { value: "5", label: "Government" },
  { value: "6", label: "Other" },
];

function AdminCustomerDetailMoreUpgradePage() {
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
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);

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

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!organizationName || organizationName.trim().length === 0) {
      newErrors.organizationName = "Organization name is required";
    } else if (organizationName.trim().length < 2) {
      newErrors.organizationName =
        "Organization name must be at least 2 characters";
    }

    if (!organizationType || organizationType === "") {
      newErrors.organizationType = "Organization type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle upgrade confirmation
  const handleConfirmUpgrade = async () => {
    setShowConfirmModal(false);

    if (!validateForm()) {
      return;
    }

    setErrors({});
    setIsUpgrading(true);

    try {
      // Prepare upgrade data
      const upgradeData = {
        customer_id: cid,
        organization_name: organizationName.trim(),
        organization_type: parseInt(organizationType),
      };

      // Call the manager to upgrade customer
      await customerManager.upgradeCustomer(upgradeData, onUnauthorized);

      // Set success message
      setSuccessMessage(
        "Customer has been successfully upgraded to Business type",
      );

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(`/admin/customer/${cid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to upgrade customer:", error);
      setErrors(error);
      setIsUpgrading(false);
    }
  };

  // Handle confirm button click
  const handleConfirmClick = () => {
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  // Check if already business type
  const isAlreadyBusiness =
    customer?.typeOf === 3 || customer?.organizationName;

  // Render loading state
  if (isFetching && !customer) {
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
                  <ArrowUpCircleIcon className="w-4 h-4 mr-2" />
                  Upgrade
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customer details...</p>
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
                <ArrowUpCircleIcon className="w-4 h-4 mr-2" />
                Upgrade
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
          <ArrowUpCircleIcon className="w-4 h-4 mr-1" />
          Upgrade to Business Account
        </p>
      </div>

      {/* Status Alerts */}
      {customer?.status === 2 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <InformationCircleIcon className="w-5 h-5 mr-2" />
          This customer is archived
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
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error Messages */}
      {errors &&
        Object.keys(errors).length > 0 &&
        !errors.organizationName &&
        !errors.organizationType && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span>
                {errors.message ||
                  errors.detail ||
                  errors.general ||
                  "An error occurred. Please try again."}
              </span>
              <button
                onClick={() => setErrors({})}
                className="text-red-700 hover:text-red-900"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      {/* Main Card */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-5">
          {/* Warning/Info Message */}
          {!isAlreadyBusiness ? (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Upgrade Warning
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      You are about to <strong>upgrade</strong> this customer
                      from <strong>Residential</strong> type to{" "}
                      <strong>Business</strong> type. This will affect:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>The rates applied to their work orders</li>
                      <li>The types of services they can request</li>
                      <li>Tax and billing requirements</li>
                      <li>Terms and conditions that apply</li>
                    </ul>
                    <p className="mt-2">
                      Please ensure you have the correct business information
                      before proceeding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    This customer is already a Business type account. No upgrade
                    is needed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Current Customer Information
            </h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name:</dt>
                <dd className="text-sm text-gray-900">
                  {customer?.firstName} {customer?.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email:</dt>
                <dd className="text-sm text-gray-900">{customer?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Current Type:
                </dt>
                <dd className="text-sm">
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
              <div>
                <dt className="text-sm font-medium text-gray-500">Status:</dt>
                <dd className="text-sm">
                  {customer?.status === 1 ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-gray-600">Archived</span>
                  )}
                </dd>
              </div>
              {customer?.organizationName && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Current Organization:
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {customer.organizationName}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Upgrade Form */}
          {!isAlreadyBusiness && (
            <>
              <div className="space-y-4">
                {/* Organization Name Input */}
                <div>
                  <label
                    htmlFor="organizationName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="organizationName"
                    value={organizationName}
                    onChange={(e) => {
                      setOrganizationName(e.target.value);
                      if (errors.organizationName) {
                        setErrors({ ...errors, organizationName: undefined });
                      }
                    }}
                    placeholder="Enter the business/organization name"
                    disabled={isUpgrading}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.organizationName
                        ? "border-red-300 text-red-900 placeholder-red-300"
                        : "border-gray-300"
                    } ${isUpgrading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                  {errors.organizationName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.organizationName}
                    </p>
                  )}
                </div>

                {/* Organization Type Select */}
                <div>
                  <label
                    htmlFor="organizationType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Organization Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="organizationType"
                    value={organizationType}
                    onChange={(e) => {
                      setOrganizationType(e.target.value);
                      if (errors.organizationType) {
                        setErrors({ ...errors, organizationType: undefined });
                      }
                    }}
                    disabled={isUpgrading}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.organizationType
                        ? "border-red-300 text-red-900"
                        : "border-gray-300"
                    } ${isUpgrading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  >
                    {CUSTOMER_ORGANIZATION_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.organizationType && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.organizationType}
                    </p>
                  )}
                </div>
              </div>

              {/* After Upgrade Info */}
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                  After Upgrade
                </h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Business rates will apply to all future work orders</li>
                  <li>
                    The customer will be classified as a commercial client
                  </li>
                  <li>Business documentation may be required</li>
                  <li>Different terms and conditions will apply</li>
                </ul>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
            <Link to={`/admin/customer/${cid}/more`}>
              <button
                disabled={isUpgrading}
                className={`inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors ${
                  isUpgrading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to More
              </button>
            </Link>

            {!isAlreadyBusiness && (
              <button
                onClick={handleConfirmClick}
                disabled={isUpgrading || !organizationName || !organizationType}
                className={`inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white transition-colors ${
                  isUpgrading || !organizationName || !organizationType
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                {isUpgrading ? "Processing..." : "Confirm and Upgrade"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowConfirmModal(false)}
            />

            {/* Modal panel */}
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ArrowUpCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      Confirm Upgrade
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You are about to upgrade the following customer to
                        Business type:
                      </p>

                      <div className="mt-3 bg-gray-50 rounded-md p-3">
                        <dl className="text-sm">
                          <div className="py-1">
                            <dt className="font-medium text-gray-500 inline">
                              Customer:
                            </dt>
                            <dd className="inline ml-2 text-gray-900">
                              {customer?.firstName} {customer?.lastName}
                            </dd>
                          </div>
                          <div className="py-1">
                            <dt className="font-medium text-gray-500 inline">
                              Organization Name:
                            </dt>
                            <dd className="inline ml-2 text-gray-900">
                              {organizationName}
                            </dd>
                          </div>
                          <div className="py-1">
                            <dt className="font-medium text-gray-500 inline">
                              Organization Type:
                            </dt>
                            <dd className="inline ml-2 text-gray-900">
                              {
                                CUSTOMER_ORGANIZATION_TYPE_OPTIONS.find(
                                  (opt) => opt.value === organizationType,
                                )?.label
                              }
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <p className="mt-3 text-sm text-gray-500">
                        This will change their account type from Residential to
                        Business, affecting rates and terms.
                      </p>

                      <p className="mt-3 text-sm font-medium text-gray-900">
                        Are you sure you want to proceed?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleConfirmUpgrade}
                  disabled={isUpgrading}
                  className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                    isUpgrading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isUpgrading ? "Upgrading..." : "Yes, Upgrade to Business"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isUpgrading}
                  className={`mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto ${
                    isUpgrading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
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

export default AdminCustomerDetailMoreUpgradePage;
