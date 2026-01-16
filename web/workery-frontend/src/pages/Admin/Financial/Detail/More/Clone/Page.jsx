// File Path: web/workery-frontend/src/pages/Admin/Financial/Detail/More/Clone/Page.jsx
// @uix-page: FinancialClonePage
// UIX Upgraded - Uses UIX primitives (Spinner, Breadcrumb)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useOrderManager } from "../../../../../../services/Services";
import { ORDER_STATUS_ARCHIVED } from "../../../../../../constants/Order";
import { Spinner, Breadcrumb, UIXThemeProvider, useUIXTheme } from "../../../../../../components/UIX";
import {
  ChartBarIcon,
  CreditCardIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

function AdminFinancialDetailMoreClonePage() {
  // URL Parameters
  const { oid } = useParams();
  const navigate = useNavigate();

  // Service hooks
  const orderManager = useOrderManager();

  // UIX Theme
  const { getThemeClasses } = useUIXTheme();
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Financials", to: "/admin/financials", icon: CreditCardIcon },
    { label: `Order #${oid}`, to: `/admin/financial/${oid}`, icon: InformationCircleIcon },
    { label: "More", to: `/admin/financial/${oid}/more`, icon: EllipsisHorizontalIcon },
    { label: "Clone", icon: DocumentDuplicateIcon, isActive: true },
  ], [oid]);

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);
  const [isCloning, setIsCloning] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch order details
  useEffect(() => {
    let mounted = true;

    const fetchOrderDetails = async () => {
      if (!oid) {
        setErrors({ general: "Order ID is required" });
        return;
      }

      setFetching(true);
      setErrors({});

      try {
        const orderData = await orderManager.getOrderDetail(
          oid,
          onUnauthorized,
        );

        if (mounted) {
          setOrder(orderData);
        }
      } catch (error) {
        console.error("Failed to fetch order details:", error);
        if (mounted) {
          if (typeof error === "object" && error !== null) {
            setErrors(error);
          } else {
            setErrors({
              general: "Failed to load order details. Please try again.",
            });
          }
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    fetchOrderDetails();

    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    return () => {
      mounted = false;
    };
  }, [oid]);

  // Handle clone confirmation
  const handleConfirmClone = async () => {
    setShowConfirmModal(false);
    setIsCloning(true);
    setErrors({});
    setShowSuccessMessage(false);

    try {
      const clonedOrder = await orderManager.cloneOrder(oid, onUnauthorized);

      // Show success message
      setShowSuccessMessage(true);

      // Redirect after showing success message briefly
      setTimeout(() => {
        // Navigate to the new cloned order
        if (clonedOrder && clonedOrder.wjid) {
          navigate(`/admin/financial/${clonedOrder.wjid}`);
        } else if (clonedOrder && clonedOrder.id) {
          navigate(`/admin/financial/${clonedOrder.id}`);
        } else {
          // Fallback to financials list if no ID returned
          navigate("/admin/financials");
        }
      }, 2000);
    } catch (error) {
      console.error("Failed to clone order:", error);

      // Set error state
      if (typeof error === "object" && error !== null) {
        setErrors(error);
      } else {
        setErrors({
          general: "Failed to clone order. Please try again.",
        });
      }

      // Scroll to top to show error
      window.scrollTo(0, 0);
    } finally {
      setIsCloning(false);
    }
  };

  // Check if order is archived
  const isOrderArchived = () => {
    return order && order.status === ORDER_STATUS_ARCHIVED;
  };

  // Get status display
  const getStatusDisplay = (status) => {
    if (status === ORDER_STATUS_ARCHIVED) {
      return <span className="text-amber-600 font-medium">Archived</span>;
    }
    return <span className="text-green-600 font-medium">Active</span>;
  };

  // Render loading state
  if (isFetching && !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
              <CreditCardIcon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" />
              Financial Order #{oid}
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
              Clone Work Order
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          Clone was successful! Redirecting to the new order...
        </div>
      )}

      {/* Error Messages */}
      {errors && Object.keys(errors).length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <XMarkIcon className="w-5 h-5 mr-2" />
              {errors.general ||
                errors.detail ||
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

      {/* Archived Order Alert */}
      {isOrderArchived() && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <InformationCircleIcon className="w-5 h-5 mr-2" />
          This order is archived and cannot be cloned.
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6">
          {/* Warning Message */}
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 mt-1 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">
                  Clone Work Order - Important Information
                </h3>
                <p className="text-amber-800 mb-3">
                  You are about to <strong>clone</strong> work order #{oid}.
                  This operation will:
                </p>
                <ul className="space-y-2 text-amber-700 ml-4">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    Create a single new work order in the system
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    Copy all data from work order #{oid} to the new order
                    (pending tasks will NOT be copied)
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    Set the cloned order's state to{" "}
                    <strong>completed but unpaid</strong>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    Allow you to make any necessary edits to the cloned order
                    afterwards
                  </li>
                </ul>
                <p className="mt-4 font-semibold text-amber-900">
                  Please review this information carefully before proceeding.
                </p>
              </div>
            </div>
          </div>

          {/* Order Information */}
          {order && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-600" />
                Order Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 mr-2">
                    Order ID:
                  </span>
                  <span className="text-gray-900">#{oid}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 mr-2">
                    Status:
                  </span>
                  {getStatusDisplay(order.status)}
                </div>
                {order.customerName && (
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 mr-2">
                      Customer:
                    </span>
                    <span className="text-gray-900">{order.customerName}</span>
                  </div>
                )}
                {order.totalAmount && (
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 mr-2">
                      Amount:
                    </span>
                    <span className="text-gray-900">${order.totalAmount}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Link to={`/admin/financial/${oid}/more`}>
              <button
                disabled={isCloning}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to More
              </button>
            </Link>

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isCloning || isOrderArchived()}
              className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                isOrderArchived()
                  ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "border-green-300 text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
              {isCloning
                ? "Cloning..."
                : isOrderArchived()
                  ? "Cannot Clone Archived Order"
                  : "Confirm and Clone"}
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
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <DocumentDuplicateIcon
                      className="h-6 w-6 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      Confirm Clone Operation
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        <strong>Final Confirmation</strong>
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        You are about to clone work order{" "}
                        <strong>#{oid}</strong>.
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        This will create a new work order with all data copied
                        from the original, set to "completed but unpaid" status.
                        Pending tasks will not be copied.
                      </p>
                      <p className="mt-3 text-sm font-medium text-green-600">
                        Do you want to proceed with the clone operation?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleConfirmClone}
                  disabled={isCloning}
                  className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCloning ? "Cloning..." : "Yes, Clone Order"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isCloning}
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

function AdminFinancialDetailMoreClonePageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminFinancialDetailMoreClonePage />
    </UIXThemeProvider>
  );
}

export default AdminFinancialDetailMoreClonePageWithProvider;
