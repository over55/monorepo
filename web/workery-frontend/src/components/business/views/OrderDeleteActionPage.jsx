// File: monorepo/web/frontend/src/components/business/views/OrderDeleteActionPage.jsx
// Whole page component for Order Delete action with alternatives and confirmation

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  ShieldExclamationIcon,
  LightBulbIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { formatDateForDisplay } from "../../../services/Helpers/DateFormatter";
import {
  Card,
  Alert,
  Modal,
  Breadcrumb,
  Spinner,
  Button,
  useUIXTheme,
} from "../../UIX";

/**
 * OrderDeleteActionPage - Whole page component for permanently deleting an order
 *
 * @param {object} config - Configuration object with the following properties:
 * @param {function} config.fetchOrder - Function to fetch order details (entityId, onUnauthorized) => Promise<Order>
 * @param {function} config.deleteOrder - Function to delete order (entityId, onUnauthorized) => Promise<void>
 * @param {function} config.isAuthenticated - Function to check if user is authenticated () => boolean
 * @param {string} config.entityParamName - URL parameter name for entity ID (default: "oid")
 * @param {string} config.basePath - Base path for navigation (default: "/admin/orders")
 * @param {string} config.successRedirectPath - Path to redirect after successful delete
 * @param {Array} config.alternativeActions - Array of alternative action configurations
 */
function OrderDeleteActionPage({ config }) {
  const {
    fetchOrder,
    deleteOrder,
    isAuthenticated,
    entityParamName = "oid",
    basePath = "/admin/orders",
    successRedirectPath = "/admin/orders",
    alternativeActions = [],
  } = config;

  // URL Parameters
  const params = useParams();
  const entityId = params[entityParamName];

  // Navigation
  const navigate = useNavigate();

  // Theme
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Refs for cleanup
  const redirectTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      textMuted: getThemeClasses("text-muted"),
      linkPrimary: getThemeClasses("link-primary"),
      link: getThemeClasses("link"),
      bgSecondary: getThemeClasses("bg-secondary"),
      // Warning variants for delete action
      warningRedBg: getThemeClasses("warning-red-bg") || "bg-red-50",
      warningRedBorder: getThemeClasses("warning-red-border") || "border-red-300",
      warningRedIcon: getThemeClasses("warning-red-icon") || "text-red-600",
      warningRedTitle: getThemeClasses("warning-red-title") || "text-red-900",
      warningRedDesc: getThemeClasses("warning-red-desc") || "text-red-700",
      warningRedList: getThemeClasses("warning-red-list") || "text-red-700",
      warningRedConfirm: getThemeClasses("warning-red-confirm") || "text-red-800",
      // Amber warning for alternatives
      warningAmberBg: getThemeClasses("warning-amber-bg") || "bg-amber-50",
      warningAmberBorder: getThemeClasses("warning-amber-border") || "border-amber-200",
      warningAmberIcon: getThemeClasses("warning-amber-icon") || "text-amber-600",
      warningAmberTitle: getThemeClasses("warning-amber-title") || "text-amber-900",
      warningAmberDesc: getThemeClasses("warning-amber-desc") || "text-amber-800",
      // Badge colors for status
      badgeSuccess: getThemeClasses("badge-success") || "bg-green-100 text-green-800",
      badgeWarning: getThemeClasses("badge-warning") || "bg-amber-100 text-amber-800",
      badgeError: getThemeClasses("badge-error") || "bg-red-100 text-red-800",
      badgePrimary: getThemeClasses("badge-primary") || "bg-blue-100 text-blue-800",
      badgeDefault: getThemeClasses("badge-default") || "bg-gray-100 text-gray-800",
      // Icon colors for modal
      iconBgDanger: getThemeClasses("icon-bg-danger") || "bg-red-100",
      iconTextDanger: getThemeClasses("icon-text-danger") || "text-red-600",
    }),
    [getThemeClasses]
  );

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Load order details
  useEffect(() => {
    // Reset mounted ref on mount
    isMountedRef.current = true;

    const loadOrder = async () => {
      setFetching(true);
      setErrors({});

      try {
        const data = await fetchOrder(entityId, onUnauthorized);
        if (isMountedRef.current) {
          setOrder(data);
        }
      } catch (error) {
        if (isMountedRef.current) {
          console.error("OrderDeleteActionPage: Failed to fetch order:", error);
          setErrors(error);
        }
      } finally {
        if (isMountedRef.current) {
          setFetching(false);
        }
      }
    };

    if (entityId && isAuthenticated()) {
      loadOrder();
    } else if (!isAuthenticated()) {
      navigate("/login?unauthorized=true");
    }

    return () => {
      isMountedRef.current = false;
      // Clear any pending redirect timeout
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [entityId, fetchOrder, isAuthenticated, navigate, onUnauthorized]);

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    setErrors({});
    setIsDeleting(true);

    try {
      await deleteOrder(entityId, onUnauthorized);

      if (!isMountedRef.current) return;

      setSuccessMessage("Order has been permanently deleted");

      redirectTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          navigate(successRedirectPath);
        }
      }, 2000);
    } catch (error) {
      if (!isMountedRef.current) return;

      console.error("OrderDeleteActionPage: Failed to delete order:", error);
      setErrors(error);
      setIsDeleting(false);
    }
  };

  // Get status label
  const getStatusLabel = useCallback(
    (status) => {
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
    },
    [order]
  );

  // Get status badge class
  const getStatusBadgeClass = useCallback(
    (status) => {
      switch (status) {
        case 1:
        case 6:
          return themeClasses.badgeSuccess;
        case 2:
          return themeClasses.badgeWarning;
        case 3:
        case 5:
          return themeClasses.badgeError;
        case 4:
        case 7:
        case 8:
          return themeClasses.badgePrimary;
        default:
          return themeClasses.badgeDefault;
      }
    },
    [themeClasses]
  );

  // Breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Orders", to: basePath, icon: WrenchScrewdriverIcon },
      {
        label: "Detail",
        to: `/admin/order/${entityId}`,
        icon: InformationCircleIcon,
      },
      {
        label: "More",
        to: `/admin/order/${entityId}/more`,
        icon: Cog6ToothIcon,
      },
      { label: "Delete", icon: TrashIcon, isActive: true },
    ],
    [entityId, basePath]
  );

  // Default alternative actions if not provided
  const defaultAlternativeActions = useMemo(
    () => [
      {
        icon: ArchiveBoxIcon,
        title: "Archive",
        description: "Marks the order as archived but preserves all data",
        path: `/admin/order/${entityId}/archive`,
        linkText: "Archive instead →",
      },
      {
        icon: NoSymbolIcon,
        title: "Cancel",
        description: "Marks the order as cancelled but keeps it for records",
        path: `/admin/order/${entityId}/cancel`,
        linkText: "Cancel instead →",
      },
    ],
    [entityId]
  );

  const actions =
    alternativeActions.length > 0 ? alternativeActions : defaultAlternativeActions;

  // Render loading state
  if (isFetching && !order) {
    return (
      <Card
        padding="p-4 sm:p-6 lg:p-8"
        className="max-w-7xl mx-auto border-0 shadow-none"
      >
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Card className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="lg" />
            <p className={`mt-4 ${themeClasses.textSecondary}`}>
              Loading order details...
            </p>
          </div>
        </Card>
      </Card>
    );
  }

  return (
    <Card
      padding="p-4 sm:p-6 lg:p-8"
      className="max-w-7xl mx-auto border-0 shadow-none"
    >
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1
              className={`text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}
            >
              <WrenchScrewdriverIcon
                className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.linkPrimary}`}
              />
              Order #{order?.wjid || order?.id || entityId}
            </h1>
            <p
              className={`mt-1 text-sm ${themeClasses.textSecondary} flex items-center`}
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              Delete Order Permanently
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert type="success" className="mb-4">
          {successMessage}
        </Alert>
      )}

      {/* Error Messages */}
      {errors && Object.keys(errors).length > 0 && (
        <Alert
          type="error"
          className="mb-4"
          dismissible
          onDismiss={() => setErrors({})}
        >
          {errors.message ||
            errors.detail ||
            Object.entries(errors)
              .map(([key, value]) => value)
              .join(", ") ||
            "An error occurred. Please try again."}
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <div className="p-6">
          {/* Critical Warning Message */}
          <div
            className={`${themeClasses.warningRedBg} border-2 ${themeClasses.warningRedBorder} rounded-lg p-6 mb-6`}
          >
            <div className="flex items-start">
              <ShieldExclamationIcon
                className={`w-6 h-6 ${themeClasses.warningRedIcon} mt-1 mr-3 flex-shrink-0`}
              />
              <div className="flex-1">
                <h3
                  className={`text-lg font-bold ${themeClasses.warningRedTitle} mb-2`}
                >
                  Delete Order - Critical Action Warning
                </h3>
                <p className={`${themeClasses.warningRedDesc} font-semibold mb-3`}>
                  THIS IS A PERMANENT ACTION
                </p>
                <p className={`${themeClasses.warningRedDesc} mb-3`}>
                  You are about to <strong>permanently delete</strong> this
                  order. This means:
                </p>
                <ul
                  className={`list-disc list-inside space-y-2 ${themeClasses.warningRedList}`}
                >
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
                <p
                  className={`mt-4 ${themeClasses.warningRedConfirm} font-bold`}
                >
                  Consider archiving instead if you want to preserve the data
                  but mark the order as inactive.
                </p>
              </div>
            </div>
          </div>

          {/* Alternative Actions */}
          <div
            className={`${themeClasses.warningAmberBg} border ${themeClasses.warningAmberBorder} rounded-lg p-6 mb-6`}
          >
            <div className="flex items-start">
              <LightBulbIcon
                className={`w-6 h-6 ${themeClasses.warningAmberIcon} mt-1 mr-3 flex-shrink-0`}
              />
              <div className="flex-1">
                <h4
                  className={`text-lg font-semibold ${themeClasses.warningAmberTitle} mb-3`}
                >
                  Consider Alternative Actions
                </h4>
                <p className={`${themeClasses.warningAmberDesc} mb-3`}>
                  Before permanently deleting, consider these alternatives:
                </p>
                <div className="space-y-3">
                  {actions.map((action, index) => (
                    <div key={index} className="flex items-center">
                      <action.icon
                        className={`w-5 h-5 ${themeClasses.warningAmberIcon} mr-2`}
                      />
                      <div>
                        <strong className={themeClasses.warningAmberTitle}>
                          {action.title}:
                        </strong>
                        <span className={`${themeClasses.warningAmberDesc} ml-1`}>
                          {action.description}
                        </span>
                        <Link
                          to={action.path}
                          className={`ml-2 ${themeClasses.link} font-medium`}
                        >
                          {action.linkText}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          {order && (
            <div className={`${themeClasses.bgSecondary} rounded-lg p-6 mb-6`}>
              <h4 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>
                Order Information to be Deleted:
              </h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>
                    Order ID:
                  </dt>
                  <dd className={`mt-1 text-sm ${themeClasses.textPrimary}`}>
                    #{order.wjid || order.id || entityId}
                  </dd>
                </div>
                <div>
                  <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>
                    Customer:
                  </dt>
                  <dd className={`mt-1 text-sm ${themeClasses.textPrimary}`}>
                    {order.customerName ||
                      (order.customerFirstName && order.customerLastName
                        ? `${order.customerFirstName} ${order.customerLastName}`
                        : "N/A")}
                  </dd>
                </div>
                <div>
                  <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>
                    Description:
                  </dt>
                  <dd className={`mt-1 text-sm ${themeClasses.textPrimary}`}>
                    {order.description || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>
                    Current Status:
                  </dt>
                  <dd className="mt-1 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </dd>
                </div>
                {order.assignmentDate && (
                  <div>
                    <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>
                      Assignment Date:
                    </dt>
                    <dd className={`mt-1 text-sm ${themeClasses.textPrimary}`}>
                      {formatDateForDisplay(order.assignmentDate)}
                    </dd>
                  </div>
                )}
                {order.startDate && (
                  <div>
                    <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>
                      Start Date:
                    </dt>
                    <dd className={`mt-1 text-sm ${themeClasses.textPrimary}`}>
                      {formatDateForDisplay(order.startDate)}
                    </dd>
                  </div>
                )}
                {order.completionDate && (
                  <div>
                    <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>
                      Completion Date:
                    </dt>
                    <dd className={`mt-1 text-sm ${themeClasses.textPrimary}`}>
                      {formatDateForDisplay(order.completionDate)}
                    </dd>
                  </div>
                )}
                {order.invoiceIds && order.invoiceIds.length > 0 && (
                  <div>
                    <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>
                      Related Invoices:
                    </dt>
                    <dd className={`mt-1 text-sm ${themeClasses.textPrimary}`}>
                      {order.invoiceIds.length} invoice(s)
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Final Confirmation Text */}
          <div
            className={`${themeClasses.warningRedBg} border ${themeClasses.warningRedBorder} rounded-lg p-6 mb-6`}
          >
            <p className={`${themeClasses.warningRedConfirm} font-bold mb-3`}>
              Are you absolutely certain you want to permanently delete this
              order?
            </p>
            <p className={`text-sm ${themeClasses.warningRedDesc}`}>
              Order ID:{" "}
              <strong className="font-mono">
                #{order?.wjid || order?.id || entityId}
              </strong>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Link
              to={`/admin/order/${entityId}/more`}
              className="order-2 sm:order-1"
            >
              <Button
                variant="secondary"
                disabled={isDeleting}
                icon={ChevronLeftIcon}
              >
                Back to More
              </Button>
            </Link>

            <Button
              variant="danger"
              onClick={() => setShowConfirmModal(true)}
              disabled={isDeleting}
              icon={TrashIcon}
              className="order-1 sm:order-2"
            >
              {isDeleting ? "Processing..." : "I Understand, Delete Permanently"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="FINAL DELETE CONFIRMATION"
        icon={ExclamationTriangleIcon}
        iconBgColor={themeClasses.iconBgDanger}
        iconColor={themeClasses.iconTextDanger}
        footer={
          <div className="flex flex-row-reverse gap-3">
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "DELETE PERMANENTLY"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isDeleting}
            >
              Cancel - Keep Order
            </Button>
          </div>
        }
      >
        {/* Warning Banner */}
        <div
          className={`${themeClasses.warningRedBg} border ${themeClasses.warningRedBorder} rounded-md p-3 mb-4`}
        >
          <p
            className={`text-sm ${themeClasses.warningRedConfirm} font-bold text-center`}
          >
            THIS ACTION CANNOT BE UNDONE
          </p>
        </div>

        <p className={`text-sm ${themeClasses.textSecondary} font-semibold mb-3`}>
          You are about to permanently delete:
        </p>

        {/* Order Details */}
        <div className={`${themeClasses.bgSecondary} rounded-md p-3 mb-4`}>
          <dl className="space-y-1 text-sm">
            <div>
              <dt className={`inline font-medium ${themeClasses.textMuted}`}>
                Order ID:
              </dt>
              <dd className={`inline ml-1 ${themeClasses.textPrimary}`}>
                #{order?.wjid || order?.id || entityId}
              </dd>
            </div>
            <div>
              <dt className={`inline font-medium ${themeClasses.textMuted}`}>
                Customer:
              </dt>
              <dd className={`inline ml-1 ${themeClasses.textPrimary}`}>
                {order?.customerName ||
                  (order?.customerFirstName && order?.customerLastName
                    ? `${order.customerFirstName} ${order.customerLastName}`
                    : "N/A")}
              </dd>
            </div>
            <div>
              <dt className={`inline font-medium ${themeClasses.textMuted}`}>
                Status:
              </dt>
              <dd className={`inline ml-1 ${themeClasses.textPrimary}`}>
                {getStatusLabel(order?.status)}
              </dd>
            </div>
          </dl>
        </div>

        <p className={`text-sm ${themeClasses.warningRedDesc} font-semibold mb-2`}>
          All data related to this order will be permanently erased.
        </p>

        <p className={`text-sm ${themeClasses.textSecondary} mb-4`}>
          This includes all tasks, invoices, comments, attachments, and any
          other associated records.
        </p>

        <p className={`text-sm ${themeClasses.warningRedConfirm} font-bold`}>
          Are you ABSOLUTELY CERTAIN you want to proceed?
        </p>
      </Modal>
    </Card>
  );
}

export default OrderDeleteActionPage;
