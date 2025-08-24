// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Delete/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
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
  useOrderManager,
  useAuthManager,
} from "../../../../../../services/Services";

function AdminOrderDetailMoreDeletePage() {
  // URL Parameters
  const { oid } = useParams();

  // Navigation
  const navigate = useNavigate();

  // Services
  const orderManager = useOrderManager();
  const authManager = useAuthManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load order details
  useEffect(() => {
    let mounted = true;

    const fetchOrder = async () => {
      setFetching(true);
      setErrors({});

      try {
        const data = await orderManager.getOrderDetail(oid, onUnauthorized);
        if (mounted) {
          setOrder(data);
          console.log(
            "AdminOrderDetailMoreDeletePage: Order data loaded successfully",
          );
        }
      } catch (error) {
        if (mounted) {
          console.error(
            "AdminOrderDetailMoreDeletePage: Failed to fetch order:",
            error,
          );
          setErrors(error);
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    if (oid && authManager.isAuthenticated()) {
      fetchOrder();
    } else if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
    }

    return () => {
      mounted = false;
    };
  }, [oid]);

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    setErrors({});
    setIsDeleting(true);

    try {
      // Call the manager to delete order
      await orderManager.deleteOrder(oid, onUnauthorized);

      console.log("AdminOrderDetailMoreDeletePage: Order deleted successfully");

      // Set success message
      setSuccessMessage("Order has been permanently deleted");

      // Navigate to orders list after a short delay
      setTimeout(() => {
        navigate("/admin/orders");
      }, 2000);
    } catch (error) {
      console.error(
        "AdminOrderDetailMoreDeletePage: Failed to delete order:",
        error,
      );
      setErrors(error);
      setIsDeleting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    const statusMap = {
      1: "Active",
      2: "Archived",
      3: "Declined",
      4: "Pending",
      5: "Cancelled",
      6: "Completed",
      7: "In Progress",
      8: "New",
    };
    return statusMap[status] || order?.statusLabel || "Unknown";
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 1:
      case 6:
        return "text-green-600";
      case 2:
        return "text-amber-600";
      case 3:
      case 5:
        return "text-red-600";
      case 4:
      case 7:
      case 8:
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  // Render loading state
  if (isFetching && !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
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
                to="/admin/orders"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                  Orders
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/order/${oid}`}
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
                to={`/admin/order/${oid}/more`}
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
              <WrenchScrewdriverIcon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" />
              Order #{order?.id || oid}
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <TrashIcon className="w-4 h-4 mr-1" />
              Delete Order Permanently
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
                Object.entries(errors)
                  .map(([key, value]) => value)
                  .join(", ") ||
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
                  Delete Order - Critical Action Warning
                </h3>
                <p className="text-red-700 font-semibold mb-3">
                  ⚠️ THIS IS A PERMANENT ACTION ⚠️
                </p>
                <p className="text-red-700 mb-3">
                  You are about to <strong>permanently delete</strong> this
                  order. This means:
                </p>
                <ul className="list-disc list-inside space-y-2 text-red-700">
                  <li>
                    All order data will be <strong>permanently removed</strong>{" "}
                    from the database
                  </li>
                  <li>
                    All related records, invoices, tasks, and history will be
                    affected
                  </li>
                  <li>
                    The order will be <strong>completely erased</strong> from
                    the system
                  </li>
                  <li>This will impact reports and future auditing</li>
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
                  but mark the order as inactive.
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
                        Marks the order as archived but preserves all data
                      </span>
                      <Link
                        to={`/admin/order/${oid}/archive`}
                        className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Archive instead →
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <NoSymbolIcon className="w-5 h-5 text-amber-600 mr-2" />
                    <div>
                      <strong className="text-amber-900">Cancel:</strong>
                      <span className="text-amber-800 ml-1">
                        Marks the order as cancelled but keeps it for records
                      </span>
                      <Link
                        to={`/admin/order/${oid}/cancel`}
                        className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Cancel instead →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          {order && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Order Information to be Deleted:
              </h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Order ID:
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    #{order.id || oid}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Customer:
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.customerName ||
                      (order.customerFirstName && order.customerLastName
                        ? `${order.customerFirstName} ${order.customerLastName}`
                        : "N/A")}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Description:
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.description || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Current Status:
                  </dt>
                  <dd className="mt-1 text-sm">
                    <span
                      className={`font-medium ${getStatusColor(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </dd>
                </div>
                {order.assignmentDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Assignment Date:
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(order.assignmentDate)}
                    </dd>
                  </div>
                )}
                {order.startDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Start Date:
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(order.startDate)}
                    </dd>
                  </div>
                )}
                {order.completionDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Completion Date:
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(order.completionDate)}
                    </dd>
                  </div>
                )}
                {order.invoiceIds && order.invoiceIds.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Related Invoices:
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {order.invoiceIds.length} invoice(s)
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
              order?
            </p>
            <p className="text-sm text-red-700">
              Type the order ID to confirm deletion:{" "}
              <strong className="font-mono">#{order?.id || oid}</strong>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Link
              to={`/admin/order/${oid}/more`}
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
              disabled={isDeleting}
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

                    {/* Order Details */}
                    <div className="bg-gray-50 rounded-md p-3 mb-4">
                      <dl className="space-y-1 text-sm">
                        <div>
                          <dt className="inline font-medium text-gray-500">
                            Order ID:
                          </dt>
                          <dd className="inline ml-1 text-gray-900">
                            #{order?.id || oid}
                          </dd>
                        </div>
                        <div>
                          <dt className="inline font-medium text-gray-500">
                            Customer:
                          </dt>
                          <dd className="inline ml-1 text-gray-900">
                            {order?.customerName ||
                              (order?.customerFirstName &&
                              order?.customerLastName
                                ? `${order.customerFirstName} ${order.customerLastName}`
                                : "N/A")}
                          </dd>
                        </div>
                        <div>
                          <dt className="inline font-medium text-gray-500">
                            Status:
                          </dt>
                          <dd className="inline ml-1 text-gray-900">
                            {getStatusLabel(order?.status)}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <p className="text-sm text-red-700 font-semibold mb-2">
                      All data related to this order will be permanently erased.
                    </p>

                    <p className="text-sm text-gray-600 mb-4">
                      This includes all tasks, invoices, comments, attachments,
                      and any other associated records.
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
                  Cancel - Keep Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrderDetailMoreDeletePage;
