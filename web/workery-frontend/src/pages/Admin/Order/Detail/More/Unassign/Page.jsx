// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Unassign/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  ChevronLeftIcon,
  UserMinusIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  useOrderManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { ORDER_UNASSIGN_REASON_OPTIONS_WITH_EMPTY_OPTIONS } from "../../../../../../constants/FieldOptions";

// Order Status Constants
const ORDER_STATUS_ARCHIVED = 2;

function AdminOrderDetailMoreUnassignPage() {
  const { oid } = useParams();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Form fields
  const [reason, setReason] = useState(0);
  const [reasonOther, setReasonOther] = useState("");

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch order data
  const fetchOrder = async () => {
    if (!oid) return;

    setLoading(true);
    setErrors({});

    try {
      const orderData = await orderManager.getOrderDetail(oid, onUnauthorized);
      setOrder(orderData);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setErrors({ fetch: "Failed to load order details. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!reason || reason === 0) {
      newErrors.reason = "Please select a reason";
    } else if (reason === 1) {
      if (!reasonOther || !reasonOther.trim()) {
        newErrors.reasonOther = "Please specify the reason";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle unassign confirmation
  const handleConfirmUnassign = async () => {
    setShowConfirmModal(false);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await orderManager.unassignAssociateFromOrder(
        order.id,
        reason,
        reasonOther,
        onUnauthorized,
      );

      setSuccessMessage(
        "Associate has been successfully unassigned from this order",
      );

      setTimeout(() => {
        navigate(`/admin/order/${oid}/more`);
      }, 2000);
    } catch (err) {
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
  };

  // Handle confirm button click
  const handleConfirmClick = () => {
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  // Initial data load
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    fetchOrder();
  }, [oid]);

  // Check if associate is assigned
  const hasAssociate =
    order?.associateId &&
    order.associateId !== "" &&
    order.associateId !== "000000000000000000000000";

  // Get reason label for display
  const getReasonLabel = () => {
    const option = ORDER_UNASSIGN_REASON_OPTIONS_WITH_EMPTY_OPTIONS.find(
      (opt) => opt.value === reason,
    );
    return option?.label || "";
  };

  // Render loading state
  if (loading && !order) {
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
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Order #{oid}
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
                  <UserMinusIcon className="w-4 h-4 mr-2" />
                  Unassign
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-16 text-center">
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
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Order #{oid}
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
                <UserMinusIcon className="w-4 h-4 mr-2" />
                Unassign
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
          <WrenchScrewdriverIcon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" />
          Order #{oid}
        </h1>
        <p className="mt-1 text-sm text-gray-600 flex items-center">
          <UserMinusIcon className="w-4 h-4 mr-1" />
          Unassign Associate from Order
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error Messages */}
      {errors && (errors.fetch || errors.general) && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span>
              {errors.fetch ||
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
          {/* Status Alert for Archived Orders */}
          {order && order.status === ORDER_STATUS_ARCHIVED && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    This order is archived. Changes may be limited.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warning/Info Message */}
          {hasAssociate ? (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Unassign Warning
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      You are about to <strong>unassign</strong> the associate
                      from this order. This will:
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
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    This order does not have an associate assigned. No
                    unassignment is needed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current Associate Information */}
          {hasAssociate && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Current Associate Information
              </h4>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name:</dt>
                  <dd className="text-sm text-gray-900">
                    {order.associateName || order.associateFullName || "N/A"}
                  </dd>
                </div>
                {order.associateEmail && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Email:
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {order.associateEmail}
                    </dd>
                  </div>
                )}
                {order.associatePhone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Phone:
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {order.associatePhone}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Associate ID:
                  </dt>
                  <dd className="text-sm text-gray-900 font-mono">
                    {order.associateId}
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
                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Reason for Unassignment{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="reason"
                    value={reason}
                    onChange={(e) => {
                      setReason(parseInt(e.target.value));
                      if (errors.reason) {
                        setErrors({ ...errors, reason: undefined });
                      }
                    }}
                    disabled={submitting}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.reason
                        ? "border-red-300 text-red-900"
                        : "border-gray-300"
                    } ${submitting ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  >
                    {ORDER_UNASSIGN_REASON_OPTIONS_WITH_EMPTY_OPTIONS.map(
                      (option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ),
                    )}
                  </select>
                  {errors.reason && (
                    <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                  )}
                </div>

                {/* Reason Other Textarea */}
                {reason === 1 && (
                  <div>
                    <label
                      htmlFor="reasonOther"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Specify Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="reasonOther"
                      value={reasonOther}
                      onChange={(e) => {
                        setReasonOther(e.target.value);
                        if (errors.reasonOther) {
                          setErrors({ ...errors, reasonOther: undefined });
                        }
                      }}
                      placeholder="Please describe the reason for unassigning this associate..."
                      disabled={submitting}
                      rows={5}
                      maxLength={1000}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.reasonOther
                          ? "border-red-300 text-red-900 placeholder-red-300"
                          : "border-gray-300"
                      } ${submitting ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    />
                    {errors.reasonOther && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.reasonOther}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {reasonOther.length}/1000 characters
                    </p>
                  </div>
                )}
              </div>

              {/* After Unassignment Info */}
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                  After Unassignment
                </h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>The order will be available for reassignment</li>
                  <li>The associate will be notified of the change</li>
                  <li>Order history will be updated with this action</li>
                  <li>Any scheduled appointments may need to be rescheduled</li>
                </ul>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
            <Link to={`/admin/order/${oid}/more`}>
              <button
                disabled={submitting}
                className={`inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors ${
                  submitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to More
              </button>
            </Link>

            {hasAssociate && (
              <button
                onClick={handleConfirmClick}
                disabled={submitting || !reason}
                className={`inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white transition-colors ${
                  submitting || !reason
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                <UserMinusIcon className="w-4 h-4 mr-2" />
                {submitting ? "Processing..." : "Confirm Unassignment"}
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
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <UserMinusIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      Confirm Unassignment
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You are about to unassign the following associate from
                        this order:
                      </p>

                      <div className="mt-3 bg-gray-50 rounded-md p-3">
                        <dl className="text-sm">
                          <div className="py-1">
                            <dt className="font-medium text-gray-500 inline">
                              Order:
                            </dt>
                            <dd className="inline ml-2 text-gray-900">
                              #{oid}
                            </dd>
                          </div>
                          <div className="py-1">
                            <dt className="font-medium text-gray-500 inline">
                              Associate:
                            </dt>
                            <dd className="inline ml-2 text-gray-900">
                              {order?.associateName ||
                                order?.associateFullName ||
                                "N/A"}
                            </dd>
                          </div>
                          <div className="py-1">
                            <dt className="font-medium text-gray-500 inline">
                              Reason:
                            </dt>
                            <dd className="inline ml-2 text-gray-900">
                              {getReasonLabel()}
                            </dd>
                          </div>
                          {reason === 1 && reasonOther && (
                            <div className="py-1">
                              <dt className="font-medium text-gray-500">
                                Details:
                              </dt>
                              <dd className="mt-1 text-gray-900 text-xs">
                                {reasonOther}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>

                      <p className="mt-3 text-sm text-gray-500">
                        This action will remove the associate from this order
                        and allow for reassignment.
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
                  onClick={handleConfirmUnassign}
                  disabled={submitting}
                  className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                    submitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {submitting ? "Unassigning..." : "Yes, Unassign Associate"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={submitting}
                  className={`mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto ${
                    submitting ? "opacity-50 cursor-not-allowed" : ""
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

export default AdminOrderDetailMoreUnassignPage;
