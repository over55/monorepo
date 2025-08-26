// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Close/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ShieldExclamationIcon,
  LightBulbIcon,
  Cog6ToothIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  HomeIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import {
  useOrderManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { TASK_ITEM_CLOSE_REASON_OPTIONS_WITH_EMPTY_OPTION } from "../../../../../../constants/FieldOptions";

function AdminOrderDetailMoreClosePage() {
  const { oid } = useParams();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState({});
  const [wasCompleted, setWasCompleted] = useState(0);
  const [reason, setReason] = useState(0);
  const [reasonOther, setReasonOther] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [describeTheComment, setDescribeTheComment] = useState("");
  const [visits, setVisits] = useState(1);
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
        "AdminOrderDetailMoreClosePage: Order data loaded successfully",
      );
    } catch (error) {
      console.error(
        "AdminOrderDetailMoreClosePage: Failed to fetch order:",
        error,
      );
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  // Validate form before showing modal
  const handleShowConfirmModal = () => {
    console.log("handleShowConfirmModal: Beginning validation...");
    let newErrors = {};
    let hasErrors = false;

    // Validate was completed selection
    if (
      wasCompleted === undefined ||
      wasCompleted === null ||
      wasCompleted === "" ||
      wasCompleted === 0
    ) {
      newErrors["wasCompleted"] = "Please select whether the job was completed";
      hasErrors = true;
    } else {
      if (wasCompleted === 1) {
        // Validate fields for successful completion
        if (
          completionDate === undefined ||
          completionDate === null ||
          completionDate === ""
        ) {
          newErrors["completionDate"] = "Completion date is required";
          hasErrors = true;
        }
        if (
          describeTheComment === undefined ||
          describeTheComment === null ||
          describeTheComment === ""
        ) {
          newErrors["describeTheComment"] = "Comment is required";
          hasErrors = true;
        }
        if (
          visits === undefined ||
          visits === null ||
          visits === "" ||
          visits === 0
        ) {
          newErrors["visits"] = "Number of visits is required";
          hasErrors = true;
        } else if (visits < 1) {
          newErrors["visits"] = "Number of visits must be at least 1";
          hasErrors = true;
        }
      } else if (wasCompleted === 2) {
        // Validate fields for unsuccessful completion
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
        if (
          describeTheComment === undefined ||
          describeTheComment === null ||
          describeTheComment === ""
        ) {
          newErrors["describeTheComment"] = "Comment is required";
          hasErrors = true;
        }
      }
    }

    if (hasErrors) {
      console.log("handleShowConfirmModal: Validation failed");
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Show confirmation modal if validation passes
    setShowConfirmModal(true);
  };

  // Handle form submission after confirmation
  const handleConfirmClose = async () => {
    setShowConfirmModal(false);
    console.log("handleConfirmClose: Beginning submission...");

    // Prepare payload for API - MUST include order_id!
    const closureData = {
      order_id: order.id || order.ID || order._id, // Include the MongoDB ObjectID
      wasCompleted: wasCompleted,
      completionDate: completionDate,
      reason: reason,
      reasonOther: reasonOther,
      describeTheComment: describeTheComment,
      visits: parseInt(visits),
    };

    console.log("handleConfirmClose | payload:", closureData);

    setIsSubmitting(true);
    setErrors({});

    try {
      await orderManager.closeOrder(oid, closureData, onUnauthorized);

      console.log("AdminOrderDetailMoreClosePage: Order closed successfully");

      // Show success message
      setShowSuccessMessage(true);

      // Redirect to tasks list after 2 seconds
      setTimeout(() => {
        navigate(`/admin/tasks`); // Changed to redirect to tasks list
      }, 2000);
    } catch (error) {
      console.error(
        "AdminOrderDetailMoreClosePage: Failed to close order:",
        error,
      );
      setErrors(error);
      window.scrollTo(0, 0);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

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
                <XCircleIcon className="w-4 h-4 mr-2" />
                Close
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
              Order #{oid}
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <XCircleIcon className="w-4 h-4 mr-1" />
              Close Order
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          Order closed successfully! Redirecting to tasks list...
        </div>
      )}

      {/* Archived Banner */}
      {order && order.status === 2 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This order is archived
        </div>
      )}

      {/* Error Messages */}
      {errors && Object.keys(errors).length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <span className="flex items-center font-semibold mb-2">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                There were errors with your submission:
              </span>
              <ul className="list-disc list-inside ml-7 space-y-1">
                {Object.entries(errors).map(([key, value]) => (
                  <li key={key}>{value}</li>
                ))}
              </ul>
            </div>
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
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-blue-800">
                  Please fill out all the required fields before submitting this
                  form. This action will close the order and mark it as either
                  completed or incomplete.
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Was Completed Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Was this job successfully completed by the Associate?
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="wasCompleted"
                    value={1}
                    checked={wasCompleted === 1}
                    onChange={(e) => setWasCompleted(parseInt(e.target.value))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Yes - Job was completed successfully
                  </span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="wasCompleted"
                    value={2}
                    checked={wasCompleted === 2}
                    onChange={(e) => setWasCompleted(parseInt(e.target.value))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    No - Job was not completed
                  </span>
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Selecting 'Yes' will close this job as successful
              </p>
            </div>

            {/* Fields for successful completion */}
            {wasCompleted === 1 && (
              <div className="space-y-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Successful Completion Details
                </h3>

                {/* Completion Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="inline w-4 h-4 mr-1" />
                    Completion Date
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ChatBubbleBottomCenterTextIcon className="inline w-4 h-4 mr-1" />
                    Describe the comment
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={describeTheComment}
                    onChange={(e) => setDescribeTheComment(e.target.value)}
                    rows={5}
                    maxLength={1000}
                    placeholder="Describe the work completed and any relevant details"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {describeTheComment.length}/1000 characters
                  </p>
                </div>

                {/* Visits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HomeIcon className="inline w-4 h-4 mr-1" />
                    Number of Visits
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    value={visits}
                    onChange={(e) => setVisits(parseInt(e.target.value) || 0)}
                    min="1"
                    placeholder="Number of visits"
                    className="mt-1 block w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Please enter the number of visits the associate made with
                    the client
                  </p>
                </div>
              </div>
            )}

            {/* Fields for unsuccessful completion */}
            {wasCompleted === 2 && (
              <div className="space-y-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                  <XCircleIcon className="w-5 h-5 mr-2" />
                  Unsuccessful Completion Details
                </h3>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DocumentTextIcon className="inline w-4 h-4 mr-1" />
                    Reason
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(parseInt(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {TASK_ITEM_CLOSE_REASON_OPTIONS_WITH_EMPTY_OPTION.map(
                      (option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                {/* Reason Other */}
                {reason === 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason (Other)
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={reasonOther}
                      onChange={(e) => setReasonOther(e.target.value)}
                      placeholder="Please specify the reason"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                )}

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ChatBubbleBottomCenterTextIcon className="inline w-4 h-4 mr-1" />
                    Describe the comment
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={describeTheComment}
                    onChange={(e) => setDescribeTheComment(e.target.value)}
                    rows={5}
                    maxLength={1000}
                    placeholder="Describe why the job was not completed"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {describeTheComment.length}/1000 characters
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Order Information Preview */}
          {order && wasCompleted !== 0 && (
            <div className="mt-6 bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Order Information Summary:
              </h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Order ID:
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">#{oid}</dd>
                </div>
                {order.customer && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Customer:
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {order.customer.firstName} {order.customer.lastName}
                    </dd>
                  </div>
                )}
                {order.associate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Associate:
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {order.associate.firstName} {order.associate.lastName}
                    </dd>
                  </div>
                )}
                {order.status !== undefined && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Current Status:
                    </dt>
                    <dd className="mt-1 text-sm">
                      {order.status === 1 ? (
                        <span className="text-green-600 font-medium">
                          Active
                        </span>
                      ) : order.status === 2 ? (
                        <span className="text-amber-600 font-medium">
                          Archived
                        </span>
                      ) : (
                        <span className="text-gray-600">
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
              to={`/admin/order/${oid}/more`}
              className="order-2 sm:order-1"
            >
              <button
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to More
              </button>
            </Link>

            <button
              onClick={handleShowConfirmModal}
              disabled={isSubmitting}
              className="order-1 sm:order-2 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Review & Close Order
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
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-2">
                      Confirm Order Closure
                    </h3>

                    {/* Closure Type Banner */}
                    <div
                      className={`${wasCompleted === 1 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border rounded-md p-3 mb-4`}
                    >
                      <p
                        className={`text-sm ${wasCompleted === 1 ? "text-green-800" : "text-red-800"} font-bold text-center`}
                      >
                        {wasCompleted === 1
                          ? "✓ MARKING AS SUCCESSFULLY COMPLETED"
                          : "✗ MARKING AS UNSUCCESSFUL"}
                      </p>
                    </div>

                    <p className="text-sm text-gray-700 font-semibold mb-3">
                      You are about to close this order with the following
                      details:
                    </p>

                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-md p-3 mb-4">
                      <dl className="space-y-2 text-sm">
                        <div>
                          <dt className="inline font-medium text-gray-500">
                            Order ID:
                          </dt>
                          <dd className="inline ml-1 text-gray-900">#{oid}</dd>
                        </div>
                        {order?.customer && (
                          <div>
                            <dt className="inline font-medium text-gray-500">
                              Customer:
                            </dt>
                            <dd className="inline ml-1 text-gray-900">
                              {order.customer.firstName}{" "}
                              {order.customer.lastName}
                            </dd>
                          </div>
                        )}
                        <div>
                          <dt className="inline font-medium text-gray-500">
                            Status:
                          </dt>
                          <dd className="inline ml-1 text-gray-900 font-semibold">
                            {wasCompleted === 1
                              ? "Will be marked as Completed"
                              : "Will be marked as Incomplete"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {/* Closure Details */}
                    <div className="bg-blue-50 rounded-md p-3 mb-4">
                      <p className="text-sm font-semibold text-blue-900 mb-2">
                        Closure Details:
                      </p>
                      <dl className="space-y-1 text-sm">
                        {wasCompleted === 1 && (
                          <>
                            <div>
                              <dt className="inline font-medium text-gray-600">
                                Completion Date:
                              </dt>
                              <dd className="inline ml-1 text-gray-900">
                                {completionDate}
                              </dd>
                            </div>
                            <div>
                              <dt className="inline font-medium text-gray-600">
                                Visits:
                              </dt>
                              <dd className="inline ml-1 text-gray-900">
                                {visits}
                              </dd>
                            </div>
                          </>
                        )}
                        {wasCompleted === 2 && (
                          <div>
                            <dt className="inline font-medium text-gray-600">
                              Reason:
                            </dt>
                            <dd className="inline ml-1 text-gray-900">
                              {reason === 1
                                ? reasonOther
                                : TASK_ITEM_CLOSE_REASON_OPTIONS_WITH_EMPTY_OPTION.find(
                                    (opt) => opt.value === reason,
                                  )?.label}
                            </dd>
                          </div>
                        )}
                        <div>
                          <dt className="block font-medium text-gray-600 mb-1">
                            Comment:
                          </dt>
                          <dd className="text-gray-900 bg-white p-2 rounded border border-gray-200">
                            {describeTheComment.substring(0, 100)}
                            {describeTheComment.length > 100 && "..."}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <p className="text-sm text-gray-700 font-semibold">
                      Are you sure you want to close this order?
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                <button
                  type="button"
                  onClick={handleConfirmClose}
                  disabled={isSubmitting}
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Closing..." : "Confirm & Close Order"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSubmitting}
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

export default AdminOrderDetailMoreClosePage;
