// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/OrderCompletion/Step4Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  useTaskManager,
  useOrderCompletionStorage,
} from "../../../../../services/Services";
import {
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
  CheckIcon,
  ArrowRightIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

function AdminTaskItemOrderCompletionStep4Page() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const orderCompletionStorage = useOrderCompletionStorage();

  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Form state from storage
  const savedState = orderCompletionStorage.getState();
  const [comment, setComment] = useState(savedState.comment || "");

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

          // Auto-generate comment if not already set
          if (!comment && savedState.hasInputtedFinancials === 1) {
            let autoComment = "";
            if (savedState.paymentStatus === 1) {
              // Completed and paid
              autoComment = `Service fees for Workery Order ID ${taskData.orderWjid} paid on ${
                savedState.invoiceServiceFeePaymentDate
                  ? new Date(savedState.invoiceServiceFeePaymentDate)
                      .toISOString()
                      .slice(0, 10)
                  : new Date().toISOString().slice(0, 10)
              }.`;
            } else if (savedState.paymentStatus === 2) {
              // Completed but unpaid
              autoComment = `Service fees due for Workery Order ID ${taskData.orderWjid} completed on ${
                savedState.completionDate
                  ? new Date(savedState.completionDate)
                      .toISOString()
                      .slice(0, 10)
                  : new Date().toISOString().slice(0, 10)
              }.`;
            }
            setComment(autoComment);
          }
        }
      } catch (error) {
        console.error("Failed to fetch task:", error);
        if (mounted) {
          // Handle different error types
          let errorMessage = "Failed to load task details";

          if (error.code === "ERR_NETWORK") {
            errorMessage =
              "Network error. Please check your connection and try again.";
          } else if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 404) {
              errorMessage = "Task not found";
            } else if (error.response.status === 401) {
              // Unauthorized - redirect to login
              navigate("/login?unauthorized=true");
              return;
            } else if (error.response.status === 500) {
              errorMessage = "Server error. Please try again later.";
            } else if (error.response.data && error.response.data.message) {
              errorMessage = error.response.data.message;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }

          setErrors({ general: errorMessage });
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
  }, [tid]); // Only depend on tid, not on functions that could change

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation
    if (!comment || comment.trim() === "") {
      newErrors.comment = "Comment is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save to storage
    orderCompletionStorage.updateState({
      comment: comment.trim(),
    });

    // Navigate to next step
    navigate(`/admin/task/${tid}/order-completion/step-5`);
  };

  // If there's a critical error and we're not loading, show error state
  if (!isLoading && errors.general && !task) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Breadcrumb */}
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Dash</span>
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  <Link
                    to="/admin/tasks"
                    className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                  >
                    <span className="inline-flex items-center">
                      <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                      Tasks
                    </span>
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    Order Completion
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Error State */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="text-center">
              <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to Load Task
              </h2>
              <p className="text-gray-600 mb-4">{errors.general}</p>
              <div className="flex gap-3 justify-center">
                <Link
                  to="/admin/tasks"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Tasks
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumb */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/tasks"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                    Tasks
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  Order Completion
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <ClipboardDocumentListIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Task Detail - Order Completion
          </h1>
        </div>

        {/* Wizard Steps - Responsive */}
        <div className="mb-6 relative">
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center min-w-max lg:justify-center">
              {/* Step 1 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                  <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Step 1
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Complete
                  </p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-1 sm:mx-2 w-8 sm:w-10 lg:w-16 h-0.5 bg-green-600"></div>

              {/* Step 2 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                  <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Step 2
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Complete
                  </p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-1 sm:mx-2 w-8 sm:w-10 lg:w-16 h-0.5 bg-green-600"></div>

              {/* Step 3 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                  <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Step 3
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Complete
                  </p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-1 sm:mx-2 w-8 sm:w-10 lg:w-16 h-0.5 bg-gray-300"></div>

              {/* Step 4 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex-shrink-0">
                  <span className="text-white font-semibold text-sm sm:text-base">
                    4
                  </span>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Comments
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Current
                  </p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-1 sm:mx-2 w-8 sm:w-10 lg:w-16 h-0.5 bg-gray-300"></div>

              {/* Step 5 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                  <span className="text-gray-600 font-semibold text-sm sm:text-base">
                    5
                  </span>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                    Review
                  </p>
                  <p className="text-xs text-gray-400 hidden sm:block">Final</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator for mobile/tablet */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none lg:hidden"></div>
        </div>

        {/* Error Message */}
        {errors.general && task && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-sm sm:text-base">
              <ExclamationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {errors.general}
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <ChatBubbleBottomCenterTextIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Add Comments
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Loading task details...
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <div className="space-y-4">
                  {/* Comment Field */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      Comment <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write any additional comments here..."
                        rows={6}
                        className={`w-full pl-10 pr-3 py-2 sm:py-3 text-sm sm:text-base border ${
                          errors.comment ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none`}
                      />
                    </div>
                    {errors.comment && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.comment}
                      </p>
                    )}
                    <p className="mt-2 text-xs sm:text-sm text-gray-500">
                      This comment will be attached to the order for future
                      reference.
                    </p>
                  </div>

                  {/* Auto-generated Comment Info */}
                  {savedState.hasInputtedFinancials === 1 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-blue-800">
                        <strong>Note:</strong> A comment has been auto-generated
                        based on your financial inputs. You can modify it as
                        needed before proceeding.
                      </p>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="mt-6 sm:mt-8 flex gap-2 sm:gap-3">
                  <Link
                    to={`/admin/task/${tid}/order-completion/step-3`}
                    className="flex-1 inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeftIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Back to Step 3
                  </Link>
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save & Continue
                    <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTaskItemOrderCompletionStep4Page;
