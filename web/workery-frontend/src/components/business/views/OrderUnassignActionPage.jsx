// File: monorepo/web/frontend/src/components/business/views/OrderUnassignActionPage.jsx
// Whole page component for Order Unassign action with reason selection

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  ChevronLeftIcon,
  UserMinusIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  DocumentTextIcon,
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
  useUIXTheme,
} from "../../UIX";

// Order Status Constants
const ORDER_STATUS_ARCHIVED = 2;

/**
 * OrderUnassignActionPage - Whole page component for unassigning an associate from an order
 *
 * @param {object} config - Configuration object with the following properties:
 * @param {function} config.fetchOrder - Function to fetch order details (entityId, onUnauthorized) => Promise<Order>
 * @param {function} config.unassignAssociate - Function to unassign (orderId, reason, reasonOther, onUnauthorized) => Promise<void>
 * @param {function} config.isAuthenticated - Function to check if user is authenticated () => boolean
 * @param {Array} config.reasonOptions - Array of reason options { value: number, label: string }
 * @param {number} config.otherReasonValue - Value that triggers the "other" textarea (default: 1)
 * @param {string} config.entityParamName - URL parameter name for entity ID (default: "oid")
 * @param {string} config.successRedirectPath - Path to redirect after success (uses entity ID placeholder: {entityId})
 */
function OrderUnassignActionPage({ config }) {
  const {
    fetchOrder,
    unassignAssociate,
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
      borderError: getThemeClasses("border-error") || "border-red-300",
      // Warning amber theme classes
      warningAmberTitle: getThemeClasses("warning-amber-title") || "text-amber-800",
      warningAmberDesc: getThemeClasses("warning-amber-desc") || "text-amber-700",
      // Info theme classes
      infoTitle: getThemeClasses("info-title") || "text-blue-900",
      infoDesc: getThemeClasses("info-desc") || "text-blue-700",
      // Icon theme classes
      iconBgDanger: getThemeClasses("icon-bg-danger") || "bg-red-100",
      iconTextDanger: getThemeClasses("icon-text-danger") || "text-red-600",
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

    if (!reason || reason === 0) {
      newErrors.reason = "Please select a reason";
    } else if (reason === otherReasonValue) {
      if (!reasonOther || !reasonOther.trim()) {
        newErrors.reasonOther = "Please specify the reason";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [reason, reasonOther, otherReasonValue]);

  // Handle unassign confirmation
  const handleConfirmUnassign = useCallback(async () => {
    setShowConfirmModal(false);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await unassignAssociate(order.id, reason, reasonOther, onUnauthorized);

      if (!isMountedRef.current) return;

      setSuccessMessage(
        "Associate has been successfully unassigned from this order"
      );

      const redirectPath = successRedirectPath.replace("{entityId}", entityId);
      redirectTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          navigate(redirectPath);
        }
      }, 2000);
    } catch (err) {
      if (!isMountedRef.current) return;

      console.error("Failed to unassign associate:", err);

      if (err && typeof err === "object") {
        setErrors(err);
      } else {
        setErrors({
          general: "Failed to unassign associate. Please try again.",
        });
      }
      setSubmitting(false);
    }
  }, [
    validateForm,
    order,
    reason,
    reasonOther,
    unassignAssociate,
    onUnauthorized,
    entityId,
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

  // Check if associate is assigned
  const hasAssociate = useMemo(() => {
    return (
      order?.associateId &&
      order.associateId !== "" &&
      order.associateId !== "000000000000000000000000"
    );
  }, [order]);

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
        icon: DocumentTextIcon,
      },
      { label: "More", to: `/admin/order/${entityId}/more`, icon: CogIcon },
      { label: "Unassign", icon: UserMinusIcon, isActive: true },
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
          <UserMinusIcon className="w-4 h-4 mr-1" />
          Unassign Associate from Order
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert type="success" className="mb-4">
          {successMessage}
        </Alert>
      )}

      {/* Error Messages */}
      {errors && (errors.fetch || errors.general) && (
        <Alert
          type="error"
          className="mb-4"
          dismissible
          onDismiss={() => setErrors({})}
        >
          {errors.fetch || errors.general || "An error occurred. Please try again."}
        </Alert>
      )}

      {/* Main Card */}
      <Card>
        <div className="px-4 sm:px-6 py-5">
          {/* Status Alert for Archived Orders */}
          {order && order.status === ORDER_STATUS_ARCHIVED && (
            <Alert type="info" className="mb-6">
              This order is archived. Changes may be limited.
            </Alert>
          )}

          {/* Warning/Info Message */}
          {hasAssociate ? (
            <Alert
              type="warning"
              className="mb-6"
              icon={ExclamationTriangleIcon}
            >
              <h3 className={`text-sm font-medium ${themeClasses.warningAmberTitle}`}>
                Unassign Warning
              </h3>
              <div className={`mt-2 text-sm ${themeClasses.warningAmberDesc}`}>
                <p>
                  You are about to <strong>unassign</strong> the associate from
                  this order. This will:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Remove the associate from this work order</li>
                  <li>Allow another associate to be assigned</li>
                  <li>Update the order status accordingly</li>
                  <li>Notify relevant parties of the change</li>
                </ul>
                <p className="mt-2">
                  Please ensure you have a valid reason before proceeding.
                </p>
              </div>
            </Alert>
          ) : (
            <Alert type="info" className="mb-6">
              This order does not have an associate assigned. No unassignment is
              needed.
            </Alert>
          )}

          {/* Current Associate Information */}
          {hasAssociate && (
            <div className={`${themeClasses.bgSecondary} rounded-lg p-4 mb-6`}>
              <h4 className={`text-sm font-medium ${themeClasses.textPrimary} mb-3`}>
                Current Associate Information
              </h4>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>Name:</dt>
                  <dd className={`text-sm ${themeClasses.textPrimary}`}>
                    {order.associateName || order.associateFullName || "N/A"}
                  </dd>
                </div>
                {order.associateEmail && (
                  <div>
                    <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>Email:</dt>
                    <dd className={`text-sm ${themeClasses.textPrimary}`}>
                      {order.associateEmail}
                    </dd>
                  </div>
                )}
                {order.associatePhone && (
                  <div>
                    <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>Phone:</dt>
                    <dd className={`text-sm ${themeClasses.textPrimary}`}>
                      {order.associatePhone}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>
                    Associate ID:
                  </dt>
                  <dd className={`text-sm ${themeClasses.textPrimary} font-mono`}>
                    {order.associatePublicId || order.associateId}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Unassign Form */}
          {hasAssociate && (
            <>
              <div className="space-y-4">
                {/* Reason Select */}
                <Select
                  id="reason"
                  label="Reason for Unassignment"
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

                {/* Reason Other Textarea */}
                {reason === otherReasonValue && (
                  <Textarea
                    id="reasonOther"
                    label="Specify Reason"
                    value={reasonOther}
                    onChange={(value) => {
                      setReasonOther(value);
                      if (errors.reasonOther) {
                        setErrors({ ...errors, reasonOther: undefined });
                      }
                    }}
                    placeholder="Please describe the reason for unassigning this associate..."
                    disabled={submitting}
                    required
                    rows={5}
                    maxLength={1000}
                    error={errors.reasonOther}
                  />
                )}
              </div>

              {/* After Unassignment Info */}
              <Alert
                type="info"
                className="mt-6"
                icon={ClipboardDocumentListIcon}
              >
                <h4 className={`text-sm font-medium ${themeClasses.infoTitle} mb-2`}>
                  After Unassignment
                </h4>
                <ul className={`text-sm ${themeClasses.infoDesc} space-y-1 list-disc list-inside`}>
                  <li>The order will be available for reassignment</li>
                  <li>The associate will be notified of the change</li>
                  <li>Order history will be updated with this action</li>
                  <li>Any scheduled appointments may need to be rescheduled</li>
                </ul>
              </Alert>
            </>
          )}

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

            {hasAssociate && (
              <Button
                variant="danger"
                onClick={handleConfirmClick}
                disabled={submitting || !reason}
                icon={UserMinusIcon}
              >
                {submitting ? "Processing..." : "Confirm Unassignment"}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Unassignment"
        icon={UserMinusIcon}
        iconBgColor={themeClasses.iconBgDanger}
        iconColor={themeClasses.iconTextDanger}
        footer={
          <div className="flex flex-row-reverse gap-3">
            <Button
              variant="danger"
              onClick={handleConfirmUnassign}
              disabled={submitting}
            >
              {submitting ? "Unassigning..." : "Yes, Unassign Associate"}
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
          You are about to unassign the following associate from this order:
        </p>

        <div className={`mt-3 ${themeClasses.bgSecondary} rounded-md p-3`}>
          <dl className="text-sm">
            <div className="py-1">
              <dt className={`font-medium ${themeClasses.textMuted} inline`}>Order:</dt>
              <dd className={`inline ml-2 ${themeClasses.textPrimary}`}>
                #{order?.wjid || entityId}
              </dd>
            </div>
            <div className="py-1">
              <dt className={`font-medium ${themeClasses.textMuted} inline`}>Associate:</dt>
              <dd className={`inline ml-2 ${themeClasses.textPrimary}`}>
                {order?.associateName || order?.associateFullName || "N/A"}
              </dd>
            </div>
            <div className="py-1">
              <dt className={`font-medium ${themeClasses.textMuted} inline`}>Reason:</dt>
              <dd className={`inline ml-2 ${themeClasses.textPrimary}`}>{getReasonLabel()}</dd>
            </div>
            {reason === otherReasonValue && reasonOther && (
              <div className="py-1">
                <dt className={`font-medium ${themeClasses.textMuted}`}>Details:</dt>
                <dd className={`mt-1 ${themeClasses.textPrimary} text-xs`}>{reasonOther}</dd>
              </div>
            )}
          </dl>
        </div>

        <p className={`mt-3 text-sm ${themeClasses.textMuted}`}>
          This action will remove the associate from this order and allow for
          reassignment.
        </p>

        <p className={`mt-3 text-sm font-medium ${themeClasses.textPrimary}`}>
          Are you sure you want to proceed?
        </p>
      </Modal>
    </Card>
  );
}

export default OrderUnassignActionPage;
