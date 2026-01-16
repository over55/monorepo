// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Operation/Postpone/Page.jsx
// @uix-page: TaskItemPostponePage
// UIX Upgraded - Uses UIX primitives (Spinner, Breadcrumb, UIXThemeProvider)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  CalendarIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import {
  useTaskManager,
  useAuthManager,
} from "../../../../../services/Services";
import { ORDER_POSTPONE_REASON_OPTIONS_WITH_EMPTY_OPTION } from "../../../../../constants/FieldOptions";
import { Spinner, Breadcrumb, UIXThemeProvider, useUIXTheme } from "../../../../../components/UIX";

function AdminTaskItemPostponeOperationPage() {
  const navigate = useNavigate();
  const { tid } = useParams();
  const [searchParams] = useSearchParams();
  const back = searchParams.get("back");

  const taskManager = useTaskManager();
  const authManager = useAuthManager();

  // UIX Theme
  const { theme } = useUIXTheme();
  const themeClasses = useMemo(() => ({
    container: theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900',
    card: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    text: theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
  }), [theme]);

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [task, setTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Form fields
  const [reason, setReason] = useState(0);
  const [reasonOther, setReasonOther] = useState("");
  const [startDate, setStartDate] = useState("");
  const [describeTheComment, setDescribeTheComment] = useState("");

  // Authorization callback
  const onUnauthorized = useCallback(() => {
    authManager.logout();
    navigate("/login?unauthorized=true");
  }, [authManager, navigate]);

  // Memoized breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", path: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Tasks", path: "/admin/tasks", icon: ClipboardDocumentCheckIcon },
    { label: "Task Detail", path: task ? `/admin/task/${task.id}` : "#", icon: InformationCircleIcon },
    { label: "Postpone Operation", icon: ClockIcon },
  ], [task]);

  // Fetch task details
  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!tid) return;

      setIsLoading(true);
      try {
        const taskData = await taskManager.getTaskDetail(tid, onUnauthorized);
        setTask(taskData);

        // If task is already closed, don't allow postponement
        if (taskData.isClosed) {
          console.log("Task is already closed, cannot postpone");
        }
      } catch (error) {
        console.error("Failed to fetch task details:", error);
        setErrors(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskDetails();
  }, [tid]);

  // Validation
  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;

    if (!reason) {
      newErrors.reason = "Please select a reason for postponement";
      hasErrors = true;
    } else if (reason === 1 && !reasonOther.trim()) {
      newErrors.reasonOther = "Please specify the reason";
      hasErrors = true;
    }

    if (!startDate) {
      newErrors.startDate = "Please select a new start date";
      hasErrors = true;
    }

    if (!describeTheComment.trim()) {
      newErrors.describeTheComment = "Please provide additional details";
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  // Handle form confirmation
  const handleConfirmPostpone = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare payload
      const payload = {
        task_id: tid,
        task_item_id: tid,
        reason: reason,
        reason_other: reason === 1 ? reasonOther : null,
        start_date: startDate,
        describe_the_comment: describeTheComment,
      };

      // Submit postpone operation
      const response = await taskManager.postponeTask(payload, onUnauthorized);

      console.log("Task postponed successfully:", response);

      // Set success message
      setSuccessMessage(
        "Task has been successfully postponed. A new follow-up task has been created.",
      );

      // Clear the task cache to ensure fresh data
      taskManager.clearTasksCache();

      // Navigate after a short delay to let user see the success message
      setTimeout(() => {
        // Navigate to the tasks list or the order detail page
        if (task && task.orderWjid) {
          // Navigate to the order detail page which will show the new task
          navigate(`/admin/order/${task.orderWjid}`);
        } else {
          // Fallback to tasks list
          navigate("/admin/tasks", {
            state: {
              message: `Task #${task?.publicId || tid} has been successfully postponed. A new follow-up task has been created with the new start date.`,
              messageType: "success",
            },
          });
        }
      }, 2000);
    } catch (error) {
      console.error("Failed to postpone task:", error);

      // Check if it's a "task already closed" error
      if (
        error?.taskItemId?.includes("closed") ||
        error?.task_item_id?.includes("closed")
      ) {
        setErrors({
          message:
            "This task has already been closed. Please refresh the page to see the updated status.",
        });

        // Refresh the task data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setErrors(error);
      }

      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }
    setShowConfirmModal(true);
  };

  // Helper function to get task update URL
  const getTaskUpdateURL = (taskId, taskType) => {
    switch (taskType) {
      case 1:
        return `/admin/task/${taskId}/assign-associate/step-1`;
      case 2:
      case 3:
        return `/admin/task/${taskId}/postpone`;
      case 4:
        return `/admin/task/${taskId}/survey/step-1`;
      case 5:
        return `/admin/task/${taskId}/order-completion/step-1`;
      default:
        return `/admin/task/${taskId}/close`;
    }
  };

  // Get task type display name
  const getTaskTypeDisplay = (type) => {
    switch (type) {
      case 1:
        return "Assign Associate";
      case 2:
      case 3:
        return "Follow Up";
      case 4:
        return "Survey";
      case 5:
        return "Order Completion";
      default:
        return "Task";
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" label="Loading task details..." />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
              <ClipboardDocumentCheckIcon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" />
              Task: Postpone Work Order
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              Postpone Operation
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error Messages */}
      {errors && errors.message && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <XMarkIcon className="w-5 h-5 mr-2" />
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

      {/* Archived Task Notice */}
      {task && task.status === 2 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <InformationCircleIcon className="w-5 h-5 mr-2" />
          This task is archived
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6">
          {task && task.isClosed ? (
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Task Closed
              </h3>
              <p className="text-gray-600 mb-2">
                This task has been closed and cannot be postponed.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                A new follow-up task may have been created. Please check the
                order details or tasks list.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {task.orderWjid && (
                  <Link to={`/admin/order/${task.orderWjid}`}>
                    <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                      View Order
                      <ChevronLeftIcon className="ml-2 -mr-1 h-4 w-4 rotate-180" />
                    </button>
                  </Link>
                )}
                <Link to="/admin/tasks">
                  <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Go to Tasks List
                    <ChevronLeftIcon className="ml-2 -mr-1 h-4 w-4 rotate-180" />
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Please fill out all the required fields before submitting this
                form. This will close the current task and create a new
                follow-up task with the specified start date.
              </p>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Reason Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <QuestionMarkCircleIcon className="inline w-4 h-4 mr-1" />
                    Reason for Postponement *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(parseInt(e.target.value))}
                    disabled={isSubmitting}
                    className={`block w-full rounded-md shadow-md border-2 px-4 py-3 text-sm md:text-base bg-white hover:bg-gray-50 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2714%27%20height%3D%278%27%20viewBox%3D%270%200%2014%208%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%201l6%206%206-6%27%20stroke%3D%27%23374151%27%20stroke-width%3D%272%27%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] pr-10 ${
                      errors.reason
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    }`}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason (Other) *
                    </label>
                    <input
                      type="text"
                      value={reasonOther}
                      onChange={(e) => setReasonOther(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Please specify..."
                      className={`block w-full rounded-md shadow-md border-2 px-4 py-3 text-sm md:text-base bg-white hover:bg-gray-50 transition-colors ${
                        errors.reasonOther
                          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      }`}
                    />
                    {errors.reasonOther && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.reasonOther}
                      </p>
                    )}
                  </div>
                )}

                {/* Start Date Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="inline w-4 h-4 mr-1" />
                    New Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isSubmitting}
                    className={`block w-full rounded-md shadow-md border-2 px-4 py-3 text-sm md:text-base bg-white hover:bg-gray-50 transition-colors ${
                      errors.startDate
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    }`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                {/* Comments Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DocumentTextIcon className="inline w-4 h-4 mr-1" />
                    Additional Comments *
                  </label>
                  <textarea
                    value={describeTheComment}
                    onChange={(e) => setDescribeTheComment(e.target.value)}
                    disabled={isSubmitting}
                    rows={5}
                    placeholder="Include any additional information about the postponement..."
                    className={`block w-full rounded-md shadow-md border-2 px-4 py-3 text-sm md:text-base bg-white hover:bg-gray-50 transition-colors ${
                      errors.describeTheComment
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    }`}
                  />
                  {errors.describeTheComment && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.describeTheComment}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
                <Link
                  to={
                    task ? getTaskUpdateURL(task.id, task.type) : "/admin/tasks"
                  }
                >
                  <button
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-4 h-4 mr-2" />
                    Back to Detail
                  </button>
                </Link>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || (task && task.status === 2)}
                  className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    task && task.status === 2
                      ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                      : "border-orange-300 text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  <ClockIcon className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Processing..." : "Submit Postponement"}
                </button>
              </div>
            </>
          )}
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
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon
                      className="h-6 w-6 text-yellow-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      Confirm Task Postponement
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        <strong>Final Confirmation</strong>
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        You are about to postpone this task to{" "}
                        <strong>{startDate}</strong>.
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        This will close the current task and create a new
                        follow-up task with the specified start date.
                      </p>
                      <p className="mt-3 text-sm font-medium text-yellow-600">
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
                  className="inline-flex w-full justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Postponing..." : "Yes, Postpone Task"}
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

function AdminTaskItemPostponeOperationPageWithTheme() {
  return (
    <UIXThemeProvider>
      <AdminTaskItemPostponeOperationPage />
    </UIXThemeProvider>
  );
}

export default AdminTaskItemPostponeOperationPageWithTheme;
