// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Postpone/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChartBarIcon,
  WrenchIcon,
  ChevronLeftIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import {
  useOrderManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { ORDER_POSTPONE_REASON_OPTIONS_WITH_EMPTY_OPTION } from "../../../../../../constants/FieldOptions";

function AdminOrderDetailMorePostponePage() {
  const { oid } = useParams();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);
  const [reason, setReason] = useState(0);
  const [reasonOther, setReasonOther] = useState("");
  const [startDate, setStartDate] = useState("");
  const [describeTheComment, setDescribeTheComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch order details
  const fetchOrderDetail = async () => {
    setFetching(true);
    setErrors({});

    try {
      const orderData = await orderManager.getOrderDetail(oid, onUnauthorized);
      setOrder(orderData);
      console.log(
        "AdminOrderDetailMorePostponePage: Order data loaded successfully",
      );
    } catch (error) {
      console.error(
        "AdminOrderDetailMorePostponePage: Failed to fetch order:",
        error,
      );
      setErrors(error);
    } finally {
      setFetching(false);
    }
  };

  // Validate form
  const validateForm = () => {
    let newErrors = {};
    let hasErrors = false;

    // Validate reason
    if (
      reason === undefined ||
      reason === null ||
      reason === "" ||
      reason === 0
    ) {
      newErrors["reason"] = "Reason is required";
      hasErrors = true;
    } else {
      if (reason === 1) {
        if (
          reasonOther === undefined ||
          reasonOther === null ||
          reasonOther === ""
        ) {
          newErrors["reasonOther"] = "Please specify the reason";
          hasErrors = true;
        }
      }
    }

    // Validate start date
    if (startDate === undefined || startDate === null || startDate === "") {
      newErrors["startDate"] = "Start date is required";
      hasErrors = true;
    }

    // Validate comment
    if (
      describeTheComment === undefined ||
      describeTheComment === null ||
      describeTheComment === ""
    ) {
      newErrors["describeTheComment"] = "Comment is required";
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  // Handle confirm button click
  const handleConfirmClick = () => {
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  // Handle postpone confirmation
  const handleConfirmPostpone = async () => {
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

    console.log("onSubmitClick | payload:", postponeData);

    setIsSubmitting(true);
    setErrors({});

    try {
      await orderManager.postponeOrder(oid, postponeData, onUnauthorized);

      console.log(
        "AdminOrderDetailMorePostponePage: Order postponed successfully",
      );

      // Show success message
      setShowSuccessMessage(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/order/${oid}/more`);
      }, 2000);
    } catch (error) {
      console.error(
        "AdminOrderDetailMorePostponePage: Failed to postpone order:",
        error,
      );
      setErrors(error);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      fetchOrderDetail();
    }

    return () => {
      mounted = false;
    };
  }, [oid]);

  // Render loading state
  if (isFetching && !order) {
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
                    <WrenchIcon className="w-4 h-4 mr-2" />
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
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Postpone
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

  // Get reason label for confirmation modal
  const getReasonLabel = () => {
    const selectedOption = ORDER_POSTPONE_REASON_OPTIONS_WITH_EMPTY_OPTION.find(
      (opt) => opt.value === reason,
    );
    return selectedOption ? selectedOption.label : "";
  };

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
                  <WrenchIcon className="w-4 h-4 mr-2" />
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
                <ClockIcon className="w-4 h-4 mr-2" />
                Postpone
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
          <WrenchIcon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" />
          Order #{oid}
        </h1>
        <p className="mt-1 text-sm text-gray-600 flex items-center">
          <ClockIcon className="w-4 h-4 mr-1" />
          Postpone Order
        </p>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          Order postponed successfully! Redirecting...
        </div>
      )}

      {/* Error Messages */}
      {errors &&
        Object.keys(errors).length > 0 &&
        !errors.reason &&
        !errors.reasonOther &&
        !errors.startDate &&
        !errors.describeTheComment && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span>
                {errors.message ||
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

      {/* Main Card */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-5">
          {/* Archived Banner */}
          {order && order.status === 2 && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    This order is archived
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warning Message */}
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Postpone Order
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>
                    You are about to <strong>postpone</strong> this order. This
                    action will:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Change the scheduled start date of the order</li>
                    <li>Notify relevant parties about the postponement</li>
                    <li>Update the order status to postponed</li>
                    <li>Add a postponement record to the order history</li>
                  </ul>
                  <p className="mt-2">
                    Please ensure you have a valid reason and new start date
                    before proceeding.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          {order && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Current Order Information
              </h4>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Order ID:
                  </dt>
                  <dd className="text-sm text-gray-900">#{oid}</dd>
                </div>
                {order.customerName && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Customer:
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {order.customerName}
                    </dd>
                  </div>
                )}
                {order.associateName && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Associate:
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {order.associateName}
                    </dd>
                  </div>
                )}
                {order.startDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Current Start Date:
                    </dt>
                    <dd className="text-sm text-gray-900">{order.startDate}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status:</dt>
                  <dd className="text-sm">
                    {order.status === 1 ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : order.status === 2 ? (
                      <span className="text-gray-600">Archived</span>
                    ) : (
                      <span className="text-gray-600">Unknown</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Postpone Form */}
          <div className="space-y-4">
            {/* Reason Select */}
            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reason <span className="text-red-500">*</span>
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
                disabled={isSubmitting}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.reason
                    ? "border-red-300 text-red-900"
                    : "border-gray-300"
                } ${isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""}`}
              >
                {ORDER_POSTPONE_REASON_OPTIONS_WITH_EMPTY_OPTION.map(
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

            {/* Reason Other Field */}
            {reason === 1 && (
              <div>
                <label
                  htmlFor="reasonOther"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reason (Other) <span className="text-red-500">*</span>
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
                  placeholder="Please specify the reason"
                  disabled={isSubmitting}
                  rows={3}
                  maxLength={500}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.reasonOther
                      ? "border-red-300 text-red-900 placeholder-red-300"
                      : "border-gray-300"
                  } ${isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""}`}
                />
                {errors.reasonOther && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.reasonOther}
                  </p>
                )}
              </div>
            )}

            {/* Start Date Input */}
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (errors.startDate) {
                    setErrors({ ...errors, startDate: undefined });
                  }
                }}
                disabled={isSubmitting}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.startDate
                    ? "border-red-300 text-red-900"
                    : "border-gray-300"
                } ${isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            {/* Comment Field */}
            <div>
              <label
                htmlFor="describeTheComment"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Comment <span className="text-red-500">*</span>
              </label>
              <textarea
                id="describeTheComment"
                value={describeTheComment}
                onChange={(e) => {
                  setDescribeTheComment(e.target.value);
                  if (errors.describeTheComment) {
                    setErrors({ ...errors, describeTheComment: undefined });
                  }
                }}
                placeholder="Describe the reason for postponement here"
                disabled={isSubmitting}
                rows={5}
                maxLength={1000}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.describeTheComment
                    ? "border-red-300 text-red-900 placeholder-red-300"
                    : "border-gray-300"
                } ${isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              {errors.describeTheComment && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.describeTheComment}
                </p>
              )}
            </div>
          </div>

          {/* After Postpone Info */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              After Postponement
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>The order will be rescheduled to the new start date</li>
              <li>Customer and associate will be notified of the change</li>
              <li>A postponement record will be added to the order history</li>
              <li>The order status will be updated accordingly</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
            <Link to={`/admin/order/${oid}/more`}>
              <button
                disabled={isSubmitting}
                className={`inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to More
              </button>
            </Link>

            <button
              onClick={handleConfirmClick}
              disabled={isSubmitting}
              className={`inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white transition-colors ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              <CalendarDaysIcon className="w-4 h-4 mr-2" />
              {isSubmitting ? "Processing..." : "Confirm and Postpone"}
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
            />

            {/* Modal panel */}
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ClockIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      Confirm Postponement
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You are about to postpone the following order:
                      </p>

                      <div className="mt-3 bg-gray-50 rounded-md p-3">
                        <dl className="text-sm">
                          <div className="py-1">
                            <dt className="font-medium text-gray-500 inline">
                              Order ID:
                            </dt>
                            <dd className="inline ml-2 text-gray-900">
                              #{oid}
                            </dd>
                          </div>
                          <div className="py-1">
                            <dt className="font-medium text-gray-500 inline">
                              Reason:
                            </dt>
                            <dd className="inline ml-2 text-gray-900">
                              {reason === 1 ? reasonOther : getReasonLabel()}
                            </dd>
                          </div>
                          <div className="py-1">
                            <dt className="font-medium text-gray-500 inline">
                              New Start Date:
                            </dt>
                            <dd className="inline ml-2 text-gray-900">
                              {startDate}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <p className="mt-3 text-sm text-gray-500">
                        This will reschedule the order and notify all relevant
                        parties.
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
                  onClick={handleConfirmPostpone}
                  disabled={isSubmitting}
                  className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {isSubmitting ? "Postponing..." : "Yes, Postpone Order"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSubmitting}
                  className={`mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
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

export default AdminOrderDetailMorePostponePage;
