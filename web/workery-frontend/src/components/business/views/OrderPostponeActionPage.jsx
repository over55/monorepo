// File: monorepo/web/frontend/src/components/business/views/OrderPostponeActionPage.jsx
// Whole page component for Order Postpone action with reason selection and date

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  ChevronLeftIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  Alert,
  Modal,
  Breadcrumb,
  Spinner,
  Textarea,
  Button,
  Select,
  DatePicker,
  useUIXTheme,
} from "../../UIX";

// Order Status Constants
const ORDER_STATUS_ARCHIVED = 2;

/**
 * OrderPostponeActionPage - Whole page component for postponing an order
 *
 * @param {object} config - Configuration object with the following properties:
 * @param {function} config.fetchOrder - Function to fetch order details (entityId, onUnauthorized) => Promise<Order>
 * @param {function} config.postponeOrder - Function to postpone (orderId, postponeData, onUnauthorized) => Promise<void>
 * @param {function} config.isAuthenticated - Function to check if user is authenticated () => boolean
 * @param {Array} config.reasonOptions - Array of reason options { value: number, label: string }
 * @param {number} config.otherReasonValue - Value that triggers the "other" textarea (default: 1)
 * @param {string} config.entityParamName - URL parameter name for entity ID (default: "oid")
 * @param {string} config.successRedirectPath - Path to redirect after success (uses entity ID placeholder: {entityId})
 */
function OrderPostponeActionPage({ config }) {
  const {
    fetchOrder,
    postponeOrder,
    isAuthenticated,
    reasonOptions = [],
    otherReasonValue = 1,
    entityParamName = "oid",
    successRedirectPath = "/admin/order/{entityId}/more",
  } = config;

  // URL Parameters
  const params = useParams();
  const entityId = params[entityParamName];

  // Navigation
  const navigate = useNavigate();

  // Theme
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Refs for cleanup
  const redirectTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Form fields
  const [reason, setReason] = useState(0);
  const [reasonOther, setReasonOther] = useState("");
  const [startDate, setStartDate] = useState("");
  const [describeTheComment, setDescribeTheComment] = useState("");

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      textMuted: getThemeClasses("text-muted"),
      textDanger: getThemeClasses("text-danger"),
      linkPrimary: getThemeClasses("link-primary"),
      bgSecondary: getThemeClasses("bg-secondary"),
      bgDisabled: getThemeClasses("bg-disabled"),
      border: getThemeClasses("border"),
      // Warning amber theme classes
      warningAmberTitle: getThemeClasses("warning-amber-title") || "text-amber-800",
      warningAmberDesc: getThemeClasses("warning-amber-desc") || "text-amber-700",
      // Info theme classes
      infoTitle: getThemeClasses("info-title") || "text-blue-900",
      infoDesc: getThemeClasses("info-desc") || "text-blue-700",
      // Status theme classes
      statusActive: getThemeClasses("status-active") || "text-green-600",
      statusArchived: getThemeClasses("status-archived") || "text-gray-600",
      // Icon theme classes
      iconBgWarning: getThemeClasses("icon-bg-warning") || "bg-amber-100",
      iconTextWarning: getThemeClasses("icon-text-warning") || "text-amber-600",
      // Form theme classes
      formInput: getThemeClasses("form-input") || "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
      formInputError: getThemeClasses("form-input-error") || "border-red-300 text-red-900",
    }),
    [getThemeClasses]
  );

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch order data
  const loadOrder = useCallback(async () => {
    if (!entityId) return;

    setLoading(true);
    setErrors({});

    try {
      const orderData = await fetchOrder(entityId, onUnauthorized);
      if (isMountedRef.current) {
        setOrder(orderData);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error("Failed to fetch order:", err);
        setErrors({ fetch: "Failed to load order details. Please try again." });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [entityId, fetchOrder, onUnauthorized]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validate reason
    if (!reason || reason === 0) {
      newErrors.reason = "Reason is required";
    } else if (reason === otherReasonValue) {
      if (!reasonOther || !reasonOther.trim()) {
        newErrors.reasonOther = "Please specify the reason";
      }
    }

    // Validate start date
    if (!startDate) {
      newErrors.startDate = "Start date is required";
    }

    // Validate comment
    if (!describeTheComment || !describeTheComment.trim()) {
      newErrors.describeTheComment = "Comment is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [reason, reasonOther, startDate, describeTheComment, otherReasonValue]);

  // Handle postpone confirmation
  const handleConfirmPostpone = useCallback(async () => {
    setShowConfirmModal(false);

    if (!validateForm()) {
      return;
    }

    // Prepare payload for API
    const postponeData = {
      reason: reason,
      reasonOther: reasonOther,
      startDate: startDate,
      describeTheComment: describeTheComment,
    };

    setSubmitting(true);
    setErrors({});

    try {
      await postponeOrder(entityId, postponeData, onUnauthorized);

      if (!isMountedRef.current) return;

      setSuccessMessage("Order postponed successfully! Redirecting...");

      const redirectPath = successRedirectPath.replace("{entityId}", entityId);
      redirectTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          navigate(redirectPath);
        }
      }, 2000);
    } catch (err) {
      if (!isMountedRef.current) return;

      console.error("Failed to postpone order:", err);

      if (err && typeof err === "object") {
        setErrors(err);
      } else {
        setErrors({
          general: "Failed to postpone order. Please try again.",
        });
      }
      setSubmitting(false);
    }
  }, [
    validateForm,
    reason,
    reasonOther,
    startDate,
    describeTheComment,
    postponeOrder,
    entityId,
    onUnauthorized,
    successRedirectPath,
    navigate,
  ]);

  // Handle confirm button click
  const handleConfirmClick = useCallback(() => {
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  }, [validateForm]);

  // Initial data load
  useEffect(() => {
    // Reset mounted ref on mount
    isMountedRef.current = true;

    if (!isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    loadOrder();

    return () => {
      isMountedRef.current = false;
      // Clear any pending redirect timeout
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [entityId, isAuthenticated, navigate, loadOrder]);

  // Get reason label for display
  const getReasonLabel = useCallback(() => {
    const option = reasonOptions.find((opt) => opt.value === reason);
    return option?.label || "";
  }, [reason, reasonOptions]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Orders", to: "/admin/orders", icon: WrenchScrewdriverIcon },
      {
        label: `Order #${order?.wjid || entityId}`,
        to: `/admin/order/${entityId}`,
        icon: InformationCircleIcon,
      },
      { label: "More", to: `/admin/order/${entityId}/more`, icon: CogIcon },
      { label: "Postpone", icon: ClockIcon, isActive: true },
    ],
    [entityId, order]
  );

  // Render loading state
  if (loading && !order) {
    return (
      <Card
        padding="p-4 sm:p-6 lg:p-8"
        className="max-w-7xl mx-auto border-0 shadow-none"
      >
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Card className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="lg" />
            <p className={`mt-4 ${themeClasses.textMuted}`}>Loading order details...</p>
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
        <h1
          className={`text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}
        >
          <WrenchScrewdriverIcon
            className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.linkPrimary}`}
          />
          Order #{order?.wjid || entityId}
        </h1>
        <p
          className={`mt-1 text-sm ${themeClasses.textSecondary} flex items-center`}
        >
          <ClockIcon className="w-4 h-4 mr-1" />
          Postpone Order
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert type="success" className="mb-4">
          {successMessage}
        </Alert>
      )}

      {/* Error Messages */}
      {errors && (errors.fetch || errors.general || errors.message || errors.detail) && (
        <Alert
          type="error"
          className="mb-4"
          dismissible
          onDismiss={() => setErrors({})}
        >
          {errors.fetch || errors.general || errors.message || errors.detail || "An error occurred. Please try again."}
        </Alert>
      )}

      {/* Main Card */}
      <Card>
        <div className="px-4 sm:px-6 py-5">
          {/* Archived Banner */}
          {order && order.status === ORDER_STATUS_ARCHIVED && (
            <Alert type="info" className="mb-6">
              This order is archived
            </Alert>
          )}

          {/* Warning Message */}
          <Alert
            type="warning"
            className="mb-6"
            icon={ExclamationTriangleIcon}
          >
            <h3 className={`text-sm font-medium ${themeClasses.warningAmberTitle}`}>
              Postpone Order
            </h3>
            <div className={`mt-2 text-sm ${themeClasses.warningAmberDesc}`}>
              <p>
                You are about to <strong>postpone</strong> this order. This action will:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Change the scheduled start date of the order</li>
                <li>Notify relevant parties about the postponement</li>
                <li>Update the order status to postponed</li>
                <li>Add a postponement record to the order history</li>
              </ul>
              <p className="mt-2">
                Please ensure you have a valid reason and new start date before proceeding.
              </p>
            </div>
          </Alert>

          {/* Order Information */}
          {order && (
            <div className={`${themeClasses.bgSecondary} rounded-lg p-4 mb-6`}>
              <h4 className={`text-sm font-medium ${themeClasses.textPrimary} mb-3`}>
                Current Order Information
              </h4>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>Order ID:</dt>
                  <dd className={`text-sm ${themeClasses.textPrimary}`}>#{order.wjid || entityId}</dd>
                </div>
                {order.customerName && (
                  <div>
                    <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>Customer:</dt>
                    <dd className={`text-sm ${themeClasses.textPrimary}`}>{order.customerName}</dd>
                  </div>
                )}
                {order.associateName && (
                  <div>
                    <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>Associate:</dt>
                    <dd className={`text-sm ${themeClasses.textPrimary}`}>{order.associateName}</dd>
                  </div>
                )}
                {order.startDate && (
                  <div>
                    <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>Current Start Date:</dt>
                    <dd className={`text-sm ${themeClasses.textPrimary}`}>{order.startDate}</dd>
                  </div>
                )}
                <div>
                  <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>Status:</dt>
                  <dd className="text-sm">
                    {order.status === 1 ? (
                      <span className={`${themeClasses.statusActive} font-medium`}>Active</span>
                    ) : order.status === ORDER_STATUS_ARCHIVED ? (
                      <span className={themeClasses.statusArchived}>Archived</span>
                    ) : (
                      <span className={themeClasses.statusArchived}>Unknown</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Postpone Form */}
          <div className="space-y-4">
            {/* Reason Select */}
            <Select
              id="reason"
              label="Reason"
              value={String(reason)}
              onChange={(value) => {
                setReason(parseInt(value));
                if (errors.reason) {
                  setErrors({ ...errors, reason: undefined });
                }
              }}
              options={reasonOptions.map((opt) => ({
                value: String(opt.value),
                label: opt.label,
              }))}
              disabled={submitting}
              required
              error={errors.reason}
              placeholder="Select a reason"
            />

            {/* Reason Other Field */}
            {reason === otherReasonValue && (
              <Textarea
                id="reasonOther"
                label="Reason (Other)"
                value={reasonOther}
                onChange={(value) => {
                  setReasonOther(value);
                  if (errors.reasonOther) {
                    setErrors({ ...errors, reasonOther: undefined });
                  }
                }}
                placeholder="Please specify the reason"
                disabled={submitting}
                required
                rows={3}
                maxLength={500}
                error={errors.reasonOther}
              />
            )}

            {/* Start Date Input */}
            <DatePicker
              label="New Start Date"
              value={startDate}
              onChange={(value) => {
                setStartDate(value);
                if (errors.startDate) {
                  setErrors({ ...errors, startDate: undefined });
                }
              }}
              disabled={submitting}
              required
              error={errors.startDate}
              placeholder="Select a date"
            />

            {/* Comment Field */}
            <Textarea
              id="describeTheComment"
              label="Comment"
              value={describeTheComment}
              onChange={(value) => {
                setDescribeTheComment(value);
                if (errors.describeTheComment) {
                  setErrors({ ...errors, describeTheComment: undefined });
                }
              }}
              placeholder="Describe the reason for postponement here"
              disabled={submitting}
              required
              rows={5}
              maxLength={1000}
              error={errors.describeTheComment}
            />
          </div>

          {/* After Postpone Info */}
          <Alert type="info" className="mt-6" icon={DocumentTextIcon}>
            <h4 className={`text-sm font-medium ${themeClasses.infoTitle} mb-2`}>
              After Postponement
            </h4>
            <ul className={`text-sm ${themeClasses.infoDesc} space-y-1 list-disc list-inside`}>
              <li>The order will be rescheduled to the new start date</li>
              <li>Customer and associate will be notified of the change</li>
              <li>A postponement record will be added to the order history</li>
              <li>The order status will be updated accordingly</li>
            </ul>
          </Alert>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
            <Link to={`/admin/order/${entityId}/more`}>
              <Button
                variant="secondary"
                disabled={submitting}
                icon={ChevronLeftIcon}
              >
                Back to More
              </Button>
            </Link>

            <Button
              variant="warning"
              onClick={handleConfirmClick}
              disabled={submitting}
              icon={CalendarDaysIcon}
            >
              {submitting ? "Processing..." : "Confirm and Postpone"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Postponement"
        icon={ClockIcon}
        iconBgColor={themeClasses.iconBgWarning}
        iconColor={themeClasses.iconTextWarning}
        footer={
          <div className="flex flex-row-reverse gap-3">
            <Button
              variant="warning"
              onClick={handleConfirmPostpone}
              disabled={submitting}
            >
              {submitting ? "Postponing..." : "Yes, Postpone Order"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        }
      >
        <p className={`text-sm ${themeClasses.textMuted}`}>
          You are about to postpone the following order:
        </p>

        <div className={`mt-3 ${themeClasses.bgSecondary} rounded-md p-3`}>
          <dl className="text-sm">
            <div className="py-1">
              <dt className={`font-medium ${themeClasses.textMuted} inline`}>Order ID:</dt>
              <dd className={`inline ml-2 ${themeClasses.textPrimary}`}>
                #{order?.wjid || entityId}
              </dd>
            </div>
            <div className="py-1">
              <dt className={`font-medium ${themeClasses.textMuted} inline`}>Reason:</dt>
              <dd className={`inline ml-2 ${themeClasses.textPrimary}`}>
                {reason === otherReasonValue ? reasonOther : getReasonLabel()}
              </dd>
            </div>
            <div className="py-1">
              <dt className={`font-medium ${themeClasses.textMuted} inline`}>New Start Date:</dt>
              <dd className={`inline ml-2 ${themeClasses.textPrimary}`}>{startDate}</dd>
            </div>
          </dl>
        </div>

        <p className={`mt-3 text-sm ${themeClasses.textMuted}`}>
          This will reschedule the order and notify all relevant parties.
        </p>

        <p className={`mt-3 text-sm font-medium ${themeClasses.textPrimary}`}>
          Are you sure you want to proceed?
        </p>
      </Modal>
    </Card>
  );
}

export default OrderPostponeActionPage;
