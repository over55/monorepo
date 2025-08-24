// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Delete/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  ArchiveBoxIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  XMarkIcon,
  ShieldExclamationIcon,
  LightBulbIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import {
  useCustomerManager,
  useAuthManager,
} from "../../../../../../services/Services";

function AdminCustomerDetailMoreDeletePage() {
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
  const [isDeleting, setIsDeleting] = useState(false);

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
        // Using callback-based approach from original code
        await customerManager.getCustomerDetailWithCallbacks(
          cid,
          (customerData) => {
            if (mounted) {
              setCustomer(customerData);
            }
          },
          (error) => {
            if (mounted) {
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
        if (mounted) {
          console.error("Failed to fetch customer:", error);
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

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    setErrors({});
    setIsDeleting(true);

    try {
      // Using callback-based approach for consistency with original code
      await customerManager.deleteCustomerWithCallbacks(
        cid,
        (response) => {
          // Success callback
          setSuccessMessage("Customer has been permanently deleted");

          // Navigate to customers list after a short delay
          setTimeout(() => {
            navigate("/admin/customers");
          }, 2000);
        },
        (error) => {
          // Error callback
          console.error("Failed to delete customer:", error);
          setErrors(error);
          setIsDeleting(false);
        },
        () => {
          // Done callback
          if (!successMessage) {
            setIsDeleting(false);
          }
        },
        onUnauthorized,
      );
    } catch (error) {
      console.error("Failed to delete customer:", error);
      setErrors({ general: "Failed to delete customer" });
      setIsDeleting(false);
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
                  <Cog6ToothIcon className="w-4 h-4 mr-2" />
                  More
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
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
              <TrashIcon className="w-4 h-4 mr-1" />
              Delete Customer Permanently
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
          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
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

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6">
          {/* Critical Warning Message */}
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <ShieldExclamationIcon className="w-6 h-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  Delete Customer - Critical Action Warning
                </h3>
                <p className="text-red-700 font-semibold mb-3">
                  ⚠️ THIS IS A PERMANENT ACTION ⚠️
                </p>
                <p className="text-red-700 mb-3">
                  You are about to <strong>permanently delete</strong> this
                  customer. This means:
                </p>
                <ul className="list-disc list-inside space-y-2 text-red-700">
                  <li>
                    All customer data will be{" "}
                    <strong>permanently removed</strong> from the database
                  </li>
                  <li>
                    All related records, work orders, and history will be
                    affected
                  </li>
                  <li>
                    The customer's account will be{" "}
                    <strong>completely erased</strong>
                  </li>
                  <li>
                    This action <strong>CANNOT be undone</strong> without
                    database restoration
                  </li>
                  <li>
                    Recovery will require system administrator intervention and
                    may not be possible
                  </li>
                </ul>
                <p className="mt-4 text-red-800 font-bold">
                  ⚠️ Consider archiving instead if you want to preserve the data
                  but deactivate the account.
                </p>
              </div>
            </div>
          </div>

          {/* Alternative Actions */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <LightBulbIcon className="w-6 h-6 text-amber-600 mt-1 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-amber-900 mb-3">
                  Consider Alternative Actions
                </h4>
                <p className="text-amber-800 mb-3">
                  Before permanently deleting, consider these alternatives:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <ArchiveBoxIcon className="w-5 h-5 text-amber-600 mr-2" />
                    <div>
                      <strong className="text-amber-900">Archive:</strong>
                      <span className="text-amber-800 ml-1">
                        Deactivates the account but preserves all data
                      </span>
                      <Link
                        to={`/admin/customer/${cid}/archive`}
                        className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Archive instead →
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <NoSymbolIcon className="w-5 h-5 text-amber-600 mr-2" />
                    <div>
                      <strong className="text-amber-900">Ban:</strong>
                      <span className="text-amber-800 ml-1">
                        Blocks access but keeps the account for records
                      </span>
                      <Link
                        to={`/admin/customer/${cid}/ban`}
                        className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ban instead →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          {customer && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Information to be Deleted:
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
                  <dd className="mt-1 text-sm text-gray-900">
                    {customer.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone:</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {customer.phone || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Current Status:
                  </dt>
                  <dd className="mt-1 text-sm">
                    {customer.status === 1 ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : customer.status === 2 ? (
                      <span className="text-amber-600 font-medium">
                        Archived
                      </span>
                    ) : (
                      <span className="text-gray-600">Unknown</span>
                    )}
                  </dd>
                </div>
                {customer.typeOf && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type:</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer.typeOf === 1
                        ? "Unassigned"
                        : customer.typeOf === 2
                          ? "Residential"
                          : customer.typeOf === 3
                            ? "Commercial"
                            : "Unknown"}
                    </dd>
                  </div>
                )}
                {customer.joinDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Join Date:
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer.joinDate}
                    </dd>
                  </div>
                )}
                {customer.isBanned && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Ban Status:
                    </dt>
                    <dd className="mt-1 text-sm">
                      <span className="text-red-600 font-medium">Banned</span>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Final Confirmation Text */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-800 font-bold mb-3">
              Are you absolutely certain you want to permanently delete this
              customer?
            </p>
            <p className="text-sm text-red-700">
              Type the customer's email address to confirm deletion:{" "}
              <strong className="font-mono">{customer?.email}</strong>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Link
              to={`/admin/customer/${cid}/more`}
              className="order-2 sm:order-1"
            >
              <button
                disabled={isDeleting}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to More
              </button>
            </Link>

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isDeleting || customer?.status === 100}
              className="order-1 sm:order-2 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>Processing...</>
              ) : (
                <>
                  <TrashIcon className="w-4 h-4 mr-2" />I Understand, Delete
                  Permanently
                </>
              )}
            </button>
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
            ></div>

            {/* Modal panel */}
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                {/* Modal Header */}
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-2">
                      FINAL DELETE CONFIRMATION
                    </h3>

                    {/* Warning Banner */}
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                      <p className="text-sm text-red-800 font-bold text-center">
                        ⚠️ THIS ACTION CANNOT BE UNDONE ⚠️
                      </p>
                    </div>

                    <p className="text-sm text-gray-700 font-semibold mb-3">
                      You are about to permanently delete:
                    </p>

                    {/* Customer Details */}
                    <div className="bg-gray-50 rounded-md p-3 mb-4">
                      <dl className="space-y-1 text-sm">
                        <div>
                          <dt className="inline font-medium text-gray-500">
                            Name:
                          </dt>
                          <dd className="inline ml-1 text-gray-900">
                            {customer?.firstName} {customer?.lastName}
                          </dd>
                        </div>
                        <div>
                          <dt className="inline font-medium text-gray-500">
                            Email:
                          </dt>
                          <dd className="inline ml-1 text-gray-900">
                            {customer?.email}
                          </dd>
                        </div>
                        <div>
                          <dt className="inline font-medium text-gray-500">
                            ID:
                          </dt>
                          <dd className="inline ml-1 text-gray-900">{cid}</dd>
                        </div>
                      </dl>
                    </div>

                    <p className="text-sm text-red-700 font-semibold mb-2">
                      All data related to this customer will be permanently
                      erased.
                    </p>

                    <p className="text-sm text-gray-600 mb-4">
                      This includes all work orders, comments, attachments, and
                      any other associated records.
                    </p>

                    <p className="text-sm text-red-800 font-bold">
                      Are you ABSOLUTELY CERTAIN you want to proceed?
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "DELETE PERMANENTLY"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isDeleting}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel - Keep Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomerDetailMoreDeletePage;
