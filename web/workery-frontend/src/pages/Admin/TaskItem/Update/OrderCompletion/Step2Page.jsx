// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/OrderCompletion/Step2Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  useTaskManager,
  useOrderCompletionStorage,
} from "../../../../../services/Services";
import { TASK_ITEM_ORDER_CANCEL_REASON_OPTIONS_WITH_EMPTY_OPTION } from "../../../../../constants/FieldOptions";
import {
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowRightIcon,
  HashtagIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

function AdminTaskItemOrderCompletionStep2Page() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const orderCompletionStorage = useOrderCompletionStorage();

  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Form state from storage
  const savedState = orderCompletionStorage.getState();
  const [wasCompleted, setWasCompleted] = useState(savedState.wasCompleted);
  const [reason, setReason] = useState(savedState.reason);
  const [reasonOther, setReasonOther] = useState(savedState.reasonOther);
  const [completionDate, setCompletionDate] = useState(
    savedState.completionDate,
  );
  const [closingReasonComment, setClosingReasonComment] = useState(
    savedState.closingReasonComment,
  );
  const [reasonComment, setReasonComment] = useState(savedState.reasonComment);
  const [visits, setVisits] = useState(savedState.visits);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    let mounted = true;

    const fetchTask = async () => {
      try {
        setIsLoading(true);
        setErrors({});

        const taskData = await taskManager.getTaskDetail(tid, onUnauthorized);

        if (mounted) {
          setTask(taskData);
        }
      } catch (error) {
        console.error("Failed to fetch task:", error);
        if (mounted) {
          setErrors(error);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTask();

    return () => {
      mounted = false;
    };
  }, [tid]);

  const handleWasCompletedChange = (value) => {
    setWasCompleted(parseInt(value));
    // Reset dependent fields
    setCompletionDate(null);
    setReasonComment("");
    setReason(0);
    setReasonOther("");
    setClosingReasonComment("");
  };

  const handleCompletionDateChange = (e) => {
    const date = new Date(e.target.value);
    setCompletionDate(date);

    // Auto-generate comment
    const dateStr = date.toISOString().slice(0, 10);
    setReasonComment(`Job completed by Associate on ${dateStr}.`);
  };

  const handleSubmit = () => {
    const newErrors = {};

    // Validation
    if (!wasCompleted) {
      newErrors.wasCompleted = "Please select whether the job was completed";
    }

    if (wasCompleted === 1) {
      if (!completionDate) {
        newErrors.completionDate = "Completion date is required";
      }
      if (!reasonComment) {
        newErrors.reasonComment = "Reason comment is required";
      }
      if (!visits || visits <= 0) {
        newErrors.visits = "Number of visits is required";
      }
    }

    if (wasCompleted === 2) {
      if (!reason) {
        newErrors.reason = "Cancellation reason is required";
      }
      if (reason === 1 && !reasonOther) {
        newErrors.reasonOther = "Please specify the other reason";
      }
      if (!closingReasonComment) {
        newErrors.closingReasonComment = "Closing reason comment is required";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save to storage
    orderCompletionStorage.updateState({
      wasCompleted,
      reason,
      reasonOther,
      completionDate,
      reasonComment,
      closingReasonComment,
      visits: parseInt(visits),
    });

    // Navigate to next step
    navigate(`/admin/task/${tid}/order-completion/step-3`);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowCancelWarning(true);
  };

  // Confirm cancel
  const handleConfirmCancel = () => {
    setShowCancelWarning(false);
    navigate(`/admin/task/${tid}`);
  };

  // Section Component with Dark Header
  const DetailSection = ({
    title,
    icon: Icon,
    children,
    variant = "default",
  }) => {
    const bgColor =
      variant === "success"
        ? "bg-green-700"
        : variant === "error"
          ? "bg-red-700"
          : "bg-gray-700";
    const iconColor =
      variant === "success"
        ? "text-green-300"
        : variant === "error"
          ? "text-red-300"
          : "text-blue-300";

    return (
      <div className={`${bgColor} rounded-lg shadow-sm`}>
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
            <Icon
              className={`w-4 sm:w-5 h-4 sm:h-5 mr-2 ${iconColor} flex-shrink-0`}
            />
            <span className="truncate">{title}</span>
          </h3>
        </div>
        <div
          className={`bg-white border-2 border-t-0 border-${bgColor === "bg-gray-700" ? "gray" : bgColor === "bg-green-700" ? "green" : "red"}-700 rounded-b-lg p-4 sm:p-6`}
        >
          {children}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">
            Loading task details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Responsive Breadcrumb */}
        <nav
          className="flex mb-4 sm:mb-6 overflow-x-auto"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-nowrap">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                <ChartBarIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Link
                  to="/admin/tasks"
                  className="ml-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentCheckIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                    Tasks
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Link
                  to={`/admin/task/${tid}`}
                  className="ml-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 whitespace-nowrap"
                >
                  Task Detail
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="ml-1 text-xs sm:text-sm font-medium text-gray-500 md:ml-2 whitespace-nowrap">
                  Order Completion
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title - Responsive */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
            <ClipboardDocumentCheckIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
            Task Order Completion
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
            <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Provide completion status and details
          </p>
        </div>

        {/* Wizard Steps - Mobile Optimized */}
        <div className="mb-4 sm:mb-6">
          {/* Mobile View */}
          <div className="md:hidden">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                    <span className="text-white font-semibold text-sm">2</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Step 2: Status
                    </p>
                    <p className="text-xs text-gray-500">Completion details</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">2 of 5</div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center">
            <div className="flex items-center">
              {/* Step 1 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Review</p>
                  <p className="text-xs text-gray-500">Task Details</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 2 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">2</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Completion
                  </p>
                  <p className="text-xs text-gray-500">Status & Details</p>
                </div>
              </div>

              {/* Remaining steps */}
              {[
                { num: 3, title: "Survey", subtitle: "Customer Feedback" },
                { num: 4, title: "Comments", subtitle: "Additional Notes" },
                { num: 5, title: "Review", subtitle: "Confirm & Submit" },
              ].map((step, index) => (
                <React.Fragment key={step.num}>
                  <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                      <span className="text-gray-600 font-semibold">
                        {step.num}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400">{step.subtitle}</p>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message - Responsive */}
        {Object.keys(errors).length > 0 && errors.message && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-sm sm:text-base">
              <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
              {errors.message}
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
            >
              <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6">
          {/* Completion Status Selection */}
          <DetailSection
            title="Completion Status"
            icon={ClipboardDocumentCheckIcon}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Did the Associate successfully complete the job?
                <span className="text-red-500 ml-1">*</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                {/* Yes Option */}
                <div
                  className={`relative cursor-pointer rounded-lg border-2 p-4 hover:shadow-md transition-all ${
                    wasCompleted === 1
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleWasCompletedChange("1")}
                >
                  <div className="flex items-center">
                    <CheckCircleIcon
                      className={`w-6 h-6 mr-3 ${
                        wasCompleted === 1 ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                    <div className="flex-1">
                      <label className="font-medium text-gray-900 cursor-pointer">
                        Yes, Completed
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Job was successfully finished
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="wasCompleted"
                      value="1"
                      checked={wasCompleted === 1}
                      onChange={(e) => handleWasCompletedChange(e.target.value)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* No Option */}
                <div
                  className={`relative cursor-pointer rounded-lg border-2 p-4 hover:shadow-md transition-all ${
                    wasCompleted === 2
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleWasCompletedChange("2")}
                >
                  <div className="flex items-center">
                    <XCircleIcon
                      className={`w-6 h-6 mr-3 ${
                        wasCompleted === 2 ? "text-red-600" : "text-gray-400"
                      }`}
                    />
                    <div className="flex-1">
                      <label className="font-medium text-gray-900 cursor-pointer">
                        No, Not Completed
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Job was cancelled or incomplete
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="wasCompleted"
                      value="2"
                      checked={wasCompleted === 2}
                      onChange={(e) => handleWasCompletedChange(e.target.value)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {errors.wasCompleted && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.wasCompleted}
                </p>
              )}
            </div>
          </DetailSection>

          {/* If job was completed */}
          {wasCompleted === 1 && (
            <DetailSection
              title="Completion Details"
              icon={CheckCircleIcon}
              variant="success"
            >
              <div className="space-y-4 sm:space-y-6">
                {/* Completion Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Date
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={
                        completionDate
                          ? completionDate.toISOString().slice(0, 10)
                          : ""
                      }
                      onChange={handleCompletionDateChange}
                      max={new Date().toISOString().slice(0, 10)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.completionDate
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    />
                    <CalendarIcon className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.completionDate && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.completionDate}
                    </p>
                  )}
                </div>

                {/* Reason Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Comment
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={reasonComment}
                      onChange={(e) => setReasonComment(e.target.value)}
                      rows={4}
                      disabled={!completionDate}
                      placeholder="Write details for the completion..."
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.reasonComment
                          ? "border-red-300"
                          : "border-gray-300"
                      } ${!completionDate ? "bg-gray-50" : ""}`}
                    />
                    <ChatBubbleBottomCenterTextIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.reasonComment && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.reasonComment}
                    </p>
                  )}
                </div>

                {/* Number of Visits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Visits
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={visits}
                      onChange={(e) => setVisits(e.target.value)}
                      min="1"
                      placeholder="Enter number of visits"
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.visits ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    <HashtagIcon className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.visits && (
                    <p className="mt-2 text-sm text-red-600">{errors.visits}</p>
                  )}
                </div>
              </div>
            </DetailSection>
          )}

          {/* If job was not completed */}
          {wasCompleted === 2 && (
            <DetailSection
              title="Cancellation Details"
              icon={XCircleIcon}
              variant="error"
            >
              <div className="space-y-4 sm:space-y-6">
                {/* Cancellation Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Cancellation
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(parseInt(e.target.value))}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.reason ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    {TASK_ITEM_ORDER_CANCEL_REASON_OPTIONS_WITH_EMPTY_OPTION.map(
                      (option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ),
                    )}
                  </select>
                  {errors.reason && (
                    <p className="mt-2 text-sm text-red-600">{errors.reason}</p>
                  )}
                </div>

                {/* Other Reason */}
                {reason === 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specify Other Reason
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={reasonOther}
                      onChange={(e) => setReasonOther(e.target.value)}
                      placeholder="Please specify..."
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.reasonOther
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.reasonOther && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.reasonOther}
                      </p>
                    )}
                  </div>
                )}

                {/* Closing Reason Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Closing Comment
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={closingReasonComment}
                      onChange={(e) => setClosingReasonComment(e.target.value)}
                      rows={4}
                      placeholder="Write any additional comments here..."
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.closingReasonComment
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    />
                    <ChatBubbleBottomCenterTextIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.closingReasonComment && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.closingReasonComment}
                    </p>
                  )}
                </div>
              </div>
            </DetailSection>
          )}

          {/* Action Buttons - Responsive */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
            <div className="flex gap-3">
              <Link
                to={`/admin/task/${tid}/order-completion/step-1`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </Link>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <XMarkIcon className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>

            <button
              onClick={handleSubmit}
              className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save & Continue
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to={`/admin/task/${tid}`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Task Detail
          </Link>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="bg-gray-700 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 mr-2 text-amber-300" />
                Are you sure?
              </h3>
            </div>

            <div className="px-4 sm:px-6 py-4">
              <p className="text-sm text-gray-600">
                Your order completion progress will be lost and you will be
                returned to the task detail page. This cannot be undone. Do you
                want to continue?
              </p>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 rounded-b-lg">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 w-full sm:w-auto"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTaskItemOrderCompletionStep2Page;
