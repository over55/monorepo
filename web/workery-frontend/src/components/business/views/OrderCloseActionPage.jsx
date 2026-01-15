// File: monorepo/web/frontend/src/components/business/views/OrderCloseActionPage.jsx
// Whole page component for Order Close action with completion status selection

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  HomeIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
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
  Input,
  RadioGroup,
  useUIXTheme,
} from "../../UIX";

// Order Status Constants
const ORDER_STATUS_ARCHIVED = 2;

/**
 * OrderCloseActionPage - Whole page component for closing an order
 *
 * @param {object} config - Configuration object with the following properties:
 * @param {function} config.fetchOrder - Function to fetch order details (entityId, onUnauthorized) => Promise<Order>
 * @param {function} config.closeOrder - Function to close order (orderId, closureData, onUnauthorized) => Promise<void>
 * @param {function} config.isAuthenticated - Function to check if user is authenticated () => boolean
 * @param {Array} config.reasonOptions - Array of reason options { value: number, label: string }
 * @param {number} config.otherReasonValue - Value that triggers the "other" input (default: 1)
 * @param {string} config.entityParamName - URL parameter name for entity ID (default: "oid")
 * @param {string} config.successRedirectPath - Path to redirect after success (default: "/admin/tasks")
 */
function OrderCloseActionPage({ config }) {
  const {
    fetchOrder,
    closeOrder,
    isAuthenticated,
    reasonOptions = [],
    otherReasonValue = 1,
    entityParamName = "oid",
    successRedirectPath = "/admin/tasks",
  } = config;

  // URL Parameters
  const params = useParams();
  const entityId = params[entityParamName];

  // Navigation
  const navigate = useNavigate();

  // Theme
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [order, setOrder] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Refs for cleanup
  const redirectTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Form fields
  const [wasCompleted, setWasCompleted] = useState(0);
  const [reason, setReason] = useState(0);
  const [reasonOther, setReasonOther] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [describeTheComment, setDescribeTheComment] = useState("");
  const [visits, setVisits] = useState(1);

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
      borderLight: getThemeClasses("border-light"),
      // Success section theme classes
      successSectionBg: getThemeClasses("success-section-bg") || "bg-green-50",
      successSectionBorder: getThemeClasses("success-section-border") || "border-green-200",
      successSectionTitle: getThemeClasses("success-section-title") || "text-green-900",
      // Error/Danger section theme classes
      dangerSectionBg: getThemeClasses("danger-section-bg") || "bg-red-50",
      dangerSectionBorder: getThemeClasses("danger-section-border") || "border-red-200",
      dangerSectionTitle: getThemeClasses("danger-section-title") || "text-red-900",
      // Status theme classes
      statusActive: getThemeClasses("status-active") || "text-green-600",
      statusArchived: getThemeClasses("status-archived") || "text-amber-600",
      statusDefault: getThemeClasses("status-default") || "text-gray-600",
      // Icon theme classes
      iconBgWarning: getThemeClasses("icon-bg-warning") || "bg-yellow-100",
      iconTextWarning: getThemeClasses("icon-text-warning") || "text-yellow-600",
      // Form theme classes
      formInput: getThemeClasses("form-input") || "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
      formRadio: getThemeClasses("form-radio") || "text-blue-600 focus:ring-blue-500",
      // Info section theme classes
      infoSectionBg: getThemeClasses("info-section-bg") || "bg-blue-50",
      infoSectionTitle: getThemeClasses("info-section-title") || "text-blue-900",
      infoSectionText: getThemeClasses("info-section-text") || "text-gray-600",
      // Modal banner theme classes
      modalBannerSuccessBg: getThemeClasses("modal-banner-success-bg") || "bg-green-50",
      modalBannerSuccessBorder: getThemeClasses("modal-banner-success-border") || "border-green-200",
      modalBannerSuccessText: getThemeClasses("modal-banner-success-text") || "text-green-800",
      modalBannerDangerBg: getThemeClasses("modal-banner-danger-bg") || "bg-red-50",
      modalBannerDangerBorder: getThemeClasses("modal-banner-danger-border") || "border-red-200",
      modalBannerDangerText: getThemeClasses("modal-banner-danger-text") || "text-red-800",
      // Hover theme classes
      hoverBg: getThemeClasses("hover-bg") || "hover:bg-gray-50",
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
        setErrors(err);
        window.scrollTo(0, 0);
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

    // Validate was completed selection
    if (!wasCompleted || wasCompleted === 0) {
      newErrors.wasCompleted = "Please select whether the job was completed";
    } else if (wasCompleted === 1) {
      // Validate fields for successful completion
      if (!completionDate) {
        newErrors.completionDate = "Completion date is required";
      }
      if (!describeTheComment || !describeTheComment.trim()) {
        newErrors.describeTheComment = "Comment is required";
      }
      if (!visits || visits < 1) {
        newErrors.visits = visits < 1
          ? "Number of visits must be at least 1"
          : "Number of visits is required";
      }
    } else if (wasCompleted === 2) {
      // Validate fields for unsuccessful completion
      if (!reason || reason === 0) {
        newErrors.reason = "Reason is required";
      } else if (reason === otherReasonValue) {
        if (!reasonOther || !reasonOther.trim()) {
          newErrors.reasonOther = "Please specify the reason";
        }
      }
      if (!describeTheComment || !describeTheComment.trim()) {
        newErrors.describeTheComment = "Comment is required";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      window.scrollTo(0, 0);
    }

    return Object.keys(newErrors).length === 0;
  }, [wasCompleted, completionDate, describeTheComment, visits, reason, reasonOther, otherReasonValue]);

  // Handle confirm button click
  const handleShowConfirmModal = useCallback(() => {
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  }, [validateForm]);

  // Handle close confirmation
  const handleConfirmClose = useCallback(async () => {
    setShowConfirmModal(false);

    // Prepare payload for API
    const closureData = {
      order_id: order.id || order.ID || order._id,
      wasCompleted: wasCompleted,
      completionDate: completionDate,
      reason: reason,
      reasonOther: reasonOther,
      describeTheComment: describeTheComment,
      visits: parseInt(visits),
    };

    setSubmitting(true);
    setErrors({});

    try {
      await closeOrder(entityId, closureData, onUnauthorized);

      if (!isMountedRef.current) return;

      setSuccessMessage("Order closed successfully! Redirecting to tasks list...");

      redirectTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          navigate(successRedirectPath);
        }
      }, 2000);
    } catch (err) {
      if (!isMountedRef.current) return;

      console.error("Failed to close order:", err);
      setErrors(err);
      window.scrollTo(0, 0);
      setSubmitting(false);
    }
  }, [
    order,
    wasCompleted,
    completionDate,
    reason,
    reasonOther,
    describeTheComment,
    visits,
    closeOrder,
    entityId,
    onUnauthorized,
    successRedirectPath,
    navigate,
  ]);

  // Initial data load
  useEffect(() => {
    // Reset mounted ref on mount
    isMountedRef.current = true;

    window.scrollTo(0, 0);

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
    if (reason === otherReasonValue) {
      return reasonOther;
    }
    const option = reasonOptions.find((opt) => opt.value === reason);
    return option?.label || "";
  }, [reason, reasonOther, reasonOptions, otherReasonValue]);

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
      { label: "More", to: `/admin/order/${entityId}/more`, icon: Cog6ToothIcon },
      { label: "Close", icon: XCircleIcon, isActive: true },
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
        <div className="flex justify-between items-center">
          <div>
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
              <XCircleIcon className="w-4 h-4 mr-1" />
              Close Order
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

      {/* Archived Banner */}
      {order && order.status === ORDER_STATUS_ARCHIVED && (
        <Alert type="info" className="mb-4" icon={ArchiveBoxIcon}>
          This order is archived
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
          <span className="font-semibold mb-2 block">
            There were errors with your submission:
          </span>
          <ul className="list-disc list-inside ml-2 space-y-1">
            {Object.entries(errors).map(([key, value]) => (
              <li key={key}>{value}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <div className="p-6">
          {/* Instructions */}
          <Alert type="info" className="mb-6">
            Please fill out all the required fields before submitting this form.
            This action will close the order and mark it as either completed or
            incomplete.
          </Alert>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Was Completed Field */}
            <RadioGroup
              id="wasCompleted"
              label="Was this job successfully completed by the Associate?"
              name="wasCompleted"
              value={String(wasCompleted)}
              onChange={(value) => setWasCompleted(parseInt(value))}
              options={[
                {
                  value: "1",
                  label: "Yes - Job was completed successfully",
                },
                {
                  value: "2",
                  label: "No - Job was not completed",
                },
              ]}
              required
              error={errors.wasCompleted}
              helperText="Selecting 'Yes' will close this job as successful"
            />

            {/* Fields for successful completion */}
            {wasCompleted === 1 && (
              <div className={`space-y-6 p-4 ${themeClasses.successSectionBg} border ${themeClasses.successSectionBorder} rounded-lg`}>
                <h3 className={`text-lg font-semibold ${themeClasses.successSectionTitle} mb-4 flex items-center`}>
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Successful Completion Details
                </h3>

                {/* Completion Date */}
                <DatePicker
                  label="Completion Date"
                  value={completionDate}
                  onChange={(value) => setCompletionDate(value)}
                  required
                  error={errors.completionDate}
                  icon={CalendarIcon}
                  placeholder="Select completion date"
                />

                {/* Comment */}
                <Textarea
                  id="describeTheComment"
                  label="Describe the comment"
                  value={describeTheComment}
                  onChange={(value) => setDescribeTheComment(value)}
                  rows={5}
                  maxLength={1000}
                  required
                  placeholder="Describe the work completed and any relevant details"
                  error={errors.describeTheComment}
                />

                {/* Visits */}
                <Input
                  type="number"
                  label="Number of Visits"
                  value={String(visits)}
                  onChange={(value) => setVisits(parseInt(value) || 0)}
                  required
                  error={errors.visits}
                  icon={HomeIcon}
                  helperText="Please enter the number of visits the associate made with the client"
                  placeholder="Number of visits"
                />
              </div>
            )}

            {/* Fields for unsuccessful completion */}
            {wasCompleted === 2 && (
              <div className={`space-y-6 p-4 ${themeClasses.dangerSectionBg} border ${themeClasses.dangerSectionBorder} rounded-lg`}>
                <h3 className={`text-lg font-semibold ${themeClasses.dangerSectionTitle} mb-4 flex items-center`}>
                  <XCircleIcon className="w-5 h-5 mr-2" />
                  Unsuccessful Completion Details
                </h3>

                {/* Reason */}
                <Select
                  id="reason"
                  label="Reason"
                  value={String(reason)}
                  onChange={(value) => setReason(parseInt(value))}
                  options={reasonOptions.map((opt) => ({
                    value: String(opt.value),
                    label: opt.label,
                  }))}
                  required
                  error={errors.reason}
                  icon={DocumentTextIcon}
                  placeholder="Select a reason"
                />

                {/* Reason Other */}
                {reason === otherReasonValue && (
                  <Input
                    type="text"
                    label="Reason (Other)"
                    value={reasonOther}
                    onChange={(value) => setReasonOther(value)}
                    required
                    error={errors.reasonOther}
                    placeholder="Please specify the reason"
                  />
                )}

                {/* Comment */}
                <Textarea
                  id="describeTheCommentUnsuccessful"
                  label="Describe the comment"
                  value={describeTheComment}
                  onChange={(value) => setDescribeTheComment(value)}
                  rows={5}
                  maxLength={1000}
                  required
                  placeholder="Describe why the job was not completed"
                  error={errors.describeTheComment}
                />
              </div>
            )}
          </div>

          {/* Order Information Preview */}
          {order && wasCompleted !== 0 && (
            <div className={`mt-6 ${themeClasses.bgSecondary} rounded-lg p-6`}>
              <h4 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>
                Order Information Summary:
              </h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>
                    Order ID:
                  </dt>
                  <dd className={`mt-1 text-sm ${themeClasses.textPrimary}`}>
                    #{order.wjid || entityId}
                  </dd>
                </div>
                {order.customer && (
                  <div>
                    <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>
                      Customer:
                    </dt>
                    <dd className={`mt-1 text-sm ${themeClasses.textPrimary}`}>
                      {order.customer.firstName} {order.customer.lastName}
                    </dd>
                  </div>
                )}
                {order.associate && (
                  <div>
                    <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>
                      Associate:
                    </dt>
                    <dd className={`mt-1 text-sm ${themeClasses.textPrimary}`}>
                      {order.associate.firstName} {order.associate.lastName}
                    </dd>
                  </div>
                )}
                {order.status !== undefined && (
                  <div>
                    <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>
                      Current Status:
                    </dt>
                    <dd className="mt-1 text-sm">
                      {order.status === 1 ? (
                        <span className={`${themeClasses.statusActive} font-medium`}>
                          Active
                        </span>
                      ) : order.status === ORDER_STATUS_ARCHIVED ? (
                        <span className={`${themeClasses.statusArchived} font-medium`}>
                          Archived
                        </span>
                      ) : (
                        <span className={themeClasses.statusDefault}>
                          Status: {order.status}
                        </span>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
            <Link
              to={`/admin/order/${entityId}/more`}
              className="order-2 sm:order-1"
            >
              <Button
                variant="secondary"
                disabled={submitting}
                icon={ChevronLeftIcon}
              >
                Back to More
              </Button>
            </Link>

            <Button
              variant="primary"
              onClick={handleShowConfirmModal}
              disabled={submitting}
              icon={CheckCircleIcon}
              className="order-1 sm:order-2"
            >
              {submitting ? "Processing..." : "Review & Close Order"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Order Closure"
        icon={ExclamationTriangleIcon}
        iconBgColor={themeClasses.iconBgWarning}
        iconColor={themeClasses.iconTextWarning}
        footer={
          <div className="flex flex-row-reverse gap-3">
            <Button
              variant="primary"
              onClick={handleConfirmClose}
              disabled={submitting}
            >
              {submitting ? "Closing..." : "Confirm & Close Order"}
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
        {/* Closure Type Banner */}
        <div
          className={`${wasCompleted === 1 ? `${themeClasses.modalBannerSuccessBg} ${themeClasses.modalBannerSuccessBorder}` : `${themeClasses.modalBannerDangerBg} ${themeClasses.modalBannerDangerBorder}`} border rounded-md p-3 mb-4`}
        >
          <p
            className={`text-sm ${wasCompleted === 1 ? themeClasses.modalBannerSuccessText : themeClasses.modalBannerDangerText} font-bold text-center`}
          >
            {wasCompleted === 1
              ? "MARKING AS SUCCESSFULLY COMPLETED"
              : "MARKING AS UNSUCCESSFUL"}
          </p>
        </div>

        <p className={`text-sm ${themeClasses.textSecondary} font-semibold mb-3`}>
          You are about to close this order with the following details:
        </p>

        {/* Order Summary */}
        <div className={`${themeClasses.bgSecondary} rounded-md p-3 mb-4`}>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className={`inline font-medium ${themeClasses.textMuted}`}>Order ID:</dt>
              <dd className={`inline ml-1 ${themeClasses.textPrimary}`}>
                #{order?.wjid || entityId}
              </dd>
            </div>
            {order?.customer && (
              <div>
                <dt className={`inline font-medium ${themeClasses.textMuted}`}>Customer:</dt>
                <dd className={`inline ml-1 ${themeClasses.textPrimary}`}>
                  {order.customer.firstName} {order.customer.lastName}
                </dd>
              </div>
            )}
            <div>
              <dt className={`inline font-medium ${themeClasses.textMuted}`}>Status:</dt>
              <dd className={`inline ml-1 ${themeClasses.textPrimary} font-semibold`}>
                {wasCompleted === 1
                  ? "Will be marked as Completed"
                  : "Will be marked as Incomplete"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Closure Details */}
        <div className={`${themeClasses.infoSectionBg} rounded-md p-3 mb-4`}>
          <p className={`text-sm font-semibold ${themeClasses.infoSectionTitle} mb-2`}>
            Closure Details:
          </p>
          <dl className="space-y-1 text-sm">
            {wasCompleted === 1 && (
              <>
                <div>
                  <dt className={`inline font-medium ${themeClasses.infoSectionText}`}>
                    Completion Date:
                  </dt>
                  <dd className={`inline ml-1 ${themeClasses.textPrimary}`}>{completionDate}</dd>
                </div>
                <div>
                  <dt className={`inline font-medium ${themeClasses.infoSectionText}`}>Visits:</dt>
                  <dd className={`inline ml-1 ${themeClasses.textPrimary}`}>{visits}</dd>
                </div>
              </>
            )}
            {wasCompleted === 2 && (
              <div>
                <dt className={`inline font-medium ${themeClasses.infoSectionText}`}>Reason:</dt>
                <dd className={`inline ml-1 ${themeClasses.textPrimary}`}>{getReasonLabel()}</dd>
              </div>
            )}
            <div>
              <dt className={`block font-medium ${themeClasses.infoSectionText} mb-1`}>Comment:</dt>
              <dd className={`${themeClasses.textPrimary} bg-white p-2 rounded border ${themeClasses.borderLight}`}>
                {describeTheComment.substring(0, 100)}
                {describeTheComment.length > 100 && "..."}
              </dd>
            </div>
          </dl>
        </div>

        <p className={`text-sm ${themeClasses.textSecondary} font-semibold`}>
          Are you sure you want to close this order?
        </p>
      </Modal>
    </Card>
  );
}

export default OrderCloseActionPage;
