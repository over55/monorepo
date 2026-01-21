// File Path: web/workery-frontend/src/pages/Admin/Financial/Detail/More/Clone/Page.jsx
// @uix-page: FinancialClonePage
// UIX Upgraded - Uses UIX primitives (Spinner, Breadcrumb)

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useOrderManager } from "../../../../../../services/Services";
import { ORDER_STATUS_ARCHIVED } from "../../../../../../constants/Order";
import { Spinner, Breadcrumb, UIXThemeProvider, useUIXTheme, Alert, Button, Card, Modal } from "../../../../../../components/UIX";
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
    textMuted: getThemeClasses("text-muted"),
    linkPrimary: getThemeClasses("link-primary"),
    textSuccess: getThemeClasses("text-success") || "text-green-600 dark:text-green-400",
    textWarning: getThemeClasses("text-warning") || "text-amber-600 dark:text-amber-400",
    textDanger: getThemeClasses("text-danger") || "text-red-600 dark:text-red-400",
    textInfo: getThemeClasses("text-info") || "text-blue-600 dark:text-blue-400",
    bgPage: getThemeClasses("bg-page"),
    bgCard: getThemeClasses("bg-card") || "bg-white dark:bg-gray-800",
    bgMuted: getThemeClasses("bg-muted") || "bg-gray-50 dark:bg-gray-800",
    borderLight: getThemeClasses("border-light") || "border-gray-200 dark:border-gray-700",
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

  // Ref to track redirect timeout for cleanup
  const redirectTimeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

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
      redirectTimeoutRef.current = setTimeout(() => {
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
      return <span className={`${themeClasses.textWarning} font-medium`}>Archived</span>;
    }
    return <span className={`${themeClasses.textSuccess} font-medium`}>Active</span>;
  };

  // Render loading state
  if (isFetching && !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="lg" />
            <p className={`mt-4 ${themeClasses.textMuted}`}>Loading order details...</p>
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
            <h1 className={`text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
              <CreditCardIcon className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.textInfo}`} />
              Financial Order #{oid}
            </h1>
            <p className={`mt-1 text-sm ${themeClasses.textMuted} flex items-center`}>
              <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
              Clone Work Order
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <Alert type="success" className="mb-4">
          Clone was successful! Redirecting to the new order...
        </Alert>
      )}

      {/* Error Messages */}
      {errors && Object.keys(errors).length > 0 && (
        <Alert type="error" className="mb-4" dismissible onDismiss={() => setErrors({})}>
          {errors.general || errors.detail || "An error occurred. Please try again."}
        </Alert>
      )}

      {/* Archived Order Alert */}
      {isOrderArchived() && (
        <Alert type="info" className="mb-4">
          This order is archived and cannot be cloned.
        </Alert>
      )}

      {/* Main Content */}
      <Card className="overflow-hidden">
        <div className="p-6">
          {/* Warning Message */}
          <Alert type="warning" className="mb-6">
            <div className="flex items-start">
              <ExclamationTriangleIcon className={`w-6 h-6 ${themeClasses.textWarning} mt-1 mr-3 flex-shrink-0`} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  Clone Work Order - Important Information
                </h3>
                <p className="mb-3">
                  You are about to <strong>clone</strong> work order #{oid}.
                  This operation will:
                </p>
                <ul className="space-y-2 ml-4 list-disc">
                  <li>Create a single new work order in the system</li>
                  <li>
                    Copy all data from work order #{oid} to the new order
                    (pending tasks will NOT be copied)
                  </li>
                  <li>
                    Set the cloned order's state to{" "}
                    <strong>completed but unpaid</strong>
                  </li>
                  <li>
                    Allow you to make any necessary edits to the cloned order
                    afterwards
                  </li>
                </ul>
                <p className="mt-4 font-semibold">
                  Please review this information carefully before proceeding.
                </p>
              </div>
            </div>
          </Alert>

          {/* Order Information */}
          {order && (
            <div className={`${themeClasses.bgMuted} rounded-lg p-6 mb-6`}>
              <h4 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4 flex items-center`}>
                <DocumentTextIcon className={`w-5 h-5 mr-2 ${themeClasses.textMuted}`} />
                Order Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <span className={`font-medium ${themeClasses.textSecondary} mr-2`}>
                    Order ID:
                  </span>
                  <span className={themeClasses.textPrimary}>#{oid}</span>
                </div>
                <div className="flex items-center">
                  <span className={`font-medium ${themeClasses.textSecondary} mr-2`}>
                    Status:
                  </span>
                  {getStatusDisplay(order.status)}
                </div>
                {order.customerName && (
                  <div className="flex items-center">
                    <span className={`font-medium ${themeClasses.textSecondary} mr-2`}>
                      Customer:
                    </span>
                    <span className={themeClasses.textPrimary}>{order.customerName}</span>
                  </div>
                )}
                {order.totalAmount && (
                  <div className="flex items-center">
                    <span className={`font-medium ${themeClasses.textSecondary} mr-2`}>
                      Amount:
                    </span>
                    <span className={themeClasses.textPrimary}>${order.totalAmount}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Button
              variant="secondary"
              onClick={() => navigate(`/admin/financial/${oid}/more`)}
              disabled={isCloning}
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Back to More
            </Button>

            <Button
              variant="primary"
              onClick={() => setShowConfirmModal(true)}
              disabled={isCloning || isOrderArchived()}
            >
              <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
              {isCloning
                ? "Cloning..."
                : isOrderArchived()
                  ? "Cannot Clone Archived Order"
                  : "Confirm and Clone"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Clone Operation"
        icon={DocumentDuplicateIcon}
        size="md"
        footer={
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isCloning}
              className="order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmClone}
              disabled={isCloning}
              className="order-1 sm:order-2"
            >
              {isCloning ? "Cloning..." : "Yes, Clone Order"}
            </Button>
          </div>
        }
      >
        <div className={`text-sm ${themeClasses.textMuted}`}>
          <p className="font-medium">Final Confirmation</p>
          <p className="mt-2">
            You are about to clone work order <strong>#{oid}</strong>.
          </p>
          <p className="mt-2">
            This will create a new work order with all data copied
            from the original, set to "completed but unpaid" status.
            Pending tasks will not be copied.
          </p>
          <p className={`mt-3 font-medium ${themeClasses.textSuccess}`}>
            Do you want to proceed with the clone operation?
          </p>
        </div>
      </Modal>
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
