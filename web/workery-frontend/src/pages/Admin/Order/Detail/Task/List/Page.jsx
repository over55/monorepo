// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/Task/List/Page.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ArrowPathIcon,
  ClockIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  DocumentTextIcon,
  PaperClipIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UserIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { useTaskManager } from "../../../../../../services/Services";
import { formatDateForDisplay } from "../../../../../../services/Helpers/DateFormatter";
import { DateTime } from "luxon";
import {
  ORDER_STATUS_DECLINED,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_ARCHIVED,
} from "../../../../../../constants/Order";

function AdminOrderDetailMoreTaskListPage() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();

  // Use refs to track if initial load has happened
  const hasInitialLoad = useRef(false);
  const lastFetchParams = useRef(null);

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const [order, setOrder] = useState(null);
  const [taskList, setTaskList] = useState({
    results: [],
    count: 0,
  });
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortByValue, setSortByValue] = useState("created_at,DESC");
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [topAlertMessage, setTopAlertMessage] = useState("");
  const [topAlertStatus, setTopAlertStatus] = useState("");

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Core fetch function
  const doFetchTasks = useCallback(
    async (page = 1, forceRefresh = false) => {
      // Create a unique key for this fetch to prevent duplicates
      const fetchKey = `${page}-${pageSize}-${sortByValue}-${oid}`;

      // Check if we're already fetching with these exact params
      if (lastFetchParams.current === fetchKey && !forceRefresh) {
        console.log("Skipping duplicate fetch with same params:", fetchKey);
        return;
      }

      try {
        if (forceRefresh) {
          setRefreshing(true);
          // Clear cache
          taskManager.clearTasksCache();
        } else {
          setFetching(true);
        }
        setErrors({});

        // Handle sorting
        const sortArray = sortByValue.split(",");

        // Build parameters object for the API
        const params = {
          page: page,
          limit: pageSize,
          order_wjid: oid,
          sortBy: sortArray[0],
          sortOrder: sortArray[1],
        };

        console.log("Fetching tasks with params:", params);

        // Update last fetch params
        lastFetchParams.current = fetchKey;

        // Fetch tasks
        const response = await taskManager.getTasks(
          params,
          onUnauthorized,
          forceRefresh,
        );

        console.log("Received task data:", {
          resultsCount: response?.results?.length || 0,
          totalCount: response?.count || 0,
        });

        if (response) {
          setTaskList({
            results: response.results || [],
            count: response.count || 0,
          });

          if (response.order) {
            setOrder(response.order);
          }

          // Calculate total pages
          const pages = Math.ceil((response.count || 0) / pageSize);
          setTotalPages(pages);
        }

        setLastFetchTime(new Date());
      } catch (error) {
        console.error("Failed to fetch task list:", error);
        setErrors(
          error?.general || {
            general: "Failed to load tasks. Please try again.",
          },
        );
        setTaskList({
          results: [],
          count: 0,
        });
      } finally {
        setFetching(false);
        setRefreshing(false);
      }
    },
    [oid, pageSize, sortByValue, taskManager, onUnauthorized],
  );

  // Refresh handler
  const handleRefresh = () => {
    lastFetchParams.current = null;
    doFetchTasks(currentPage, true);
  };

  // Pagination handlers
  const onNextClicked = () => {
    console.log("Next Clicked");
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const onPreviousClicked = () => {
    console.log("Previous Clicked");
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    console.log("Page size changed to:", newSize);
    setPageSize(newSize);
    // Reset pagination when page size changes
    setCurrentPage(1);
    lastFetchParams.current = null;
  };

  // Handle sort change
  const handleSortChange = (newSort) => {
    console.log("Sort changed to:", newSort);
    setSortByValue(newSort);
    // Reset pagination when sort changes
    setCurrentPage(1);
    lastFetchParams.current = null;
  };

  // Format helpers
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return DateTime.fromISO(dateString).toLocaleString(DateTime.DATETIME_MED);
    } catch {
      return formatDateForDisplay(dateString);
    }
  };

  const formatLastFetchTime = () => {
    if (!lastFetchTime) return null;
    const now = DateTime.now();
    const fetchTime = DateTime.fromJSDate(lastFetchTime);
    const diff = now.diff(fetchTime, ["minutes", "seconds"]);

    if (diff.minutes >= 1) {
      return `Last updated ${Math.floor(diff.minutes)} minute${
        Math.floor(diff.minutes) !== 1 ? "s" : ""
      } ago`;
    } else {
      return `Last updated ${Math.floor(diff.seconds)} seconds ago`;
    }
  };

  const getTaskTypeLabel = (type) => {
    const types = {
      1: "Assign Associate",
      2: "Follow Up",
      3: "Complete Job",
      4: "Survey",
      5: "Review",
    };
    return types[type] || `Type ${type}`;
  };

  const getTaskStatusLabel = (status) => {
    const statuses = {
      1: "Pending",
      2: "In Progress",
      3: "Completed",
      4: "Cancelled",
    };
    return statuses[status] || `Status ${status}`;
  };

  const getTaskStatusStyle = (status) => {
    switch (status) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 2:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 3:
        return "bg-green-100 text-green-800 border-green-200";
      case 4:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isOrderActionable =
    order &&
    ![
      ORDER_STATUS_DECLINED,
      ORDER_STATUS_CANCELLED,
      ORDER_STATUS_COMPLETED_BUT_UNPAID,
      ORDER_STATUS_COMPLETED_AND_PAID,
      ORDER_STATUS_ARCHIVED,
    ].includes(order.status);

  // Initial load - only clear cache once on mount
  useEffect(() => {
    if (!hasInitialLoad.current) {
      window.scrollTo(0, 0);
      // Clear all task cache on initial mount
      taskManager.clearTasksCache();
      hasInitialLoad.current = true;
    }
  }, [taskManager]);

  // Fetch tasks when parameters change
  useEffect(() => {
    if (oid && hasInitialLoad.current) {
      console.log("Parameters changed, fetching page:", currentPage);
      doFetchTasks(currentPage, false);
    }
  }, [oid, currentPage, pageSize, sortByValue, doFetchTasks]);

  // Page size options
  const pageSizeOptions = [
    { value: 10, label: "10" },
    { value: 25, label: "25" },
    { value: 50, label: "50" },
    { value: 100, label: "100" },
  ];

  if (isFetching && taskList.results.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order tasks...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <InformationCircleIcon className="w-4 h-4 mr-2" />
                Detail
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <WrenchScrewdriverIcon className="w-8 h-8 mr-3 text-blue-600" />
              Order #{oid}
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              View and manage tasks
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {order &&
        [
          ORDER_STATUS_DECLINED,
          ORDER_STATUS_CANCELLED,
          ORDER_STATUS_COMPLETED_BUT_UNPAID,
          ORDER_STATUS_COMPLETED_AND_PAID,
          ORDER_STATUS_ARCHIVED,
        ].includes(order.status) && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
            <ArchiveBoxIcon className="w-5 h-5 mr-2" />
            This order is not actionable
          </div>
        )}

      {/* Top Alert Message */}
      {topAlertMessage && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg ${
            topAlertStatus === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {topAlertStatus === "success" ? (
                <CheckCircleIcon className="w-5 h-5 mr-2" />
              ) : (
                <XCircleIcon className="w-5 h-5 mr-2" />
              )}
              <span>{topAlertMessage}</span>
            </div>
            <button
              onClick={() => {
                setTopAlertMessage("");
                setTopAlertStatus("");
              }}
              className="text-current hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {errors &&
        typeof errors === "object" &&
        Object.keys(errors).length > 0 &&
        !topAlertMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2 mt-0.5" />
              <div className="flex-1">
                <strong>Error:</strong>
                {typeof errors === "string" ? (
                  <p className="mt-1">{errors}</p>
                ) : (
                  <ul className="mt-2 list-disc list-inside">
                    {Object.entries(errors).map(([key, value]) => (
                      <li key={key}>
                        {key === "general" ? value : `${key}: ${value}`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                onClick={() => setErrors({})}
                className="text-red-700 hover:text-red-900 ml-3"
              >
                ×
              </button>
            </div>
          </div>
        )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {/* Header with Title and Refresh Button */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <CheckCircleIcon className="w-7 h-7 mr-2 text-blue-600" />
                Tasks
              </h2>
              {lastFetchTime && (
                <span className="text-sm text-gray-500 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {formatLastFetchTime()}
                </span>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`w-5 h-5 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <Link
              to={`/admin/order/${oid}`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Summary
            </Link>
            <Link
              to={`/admin/order/${oid}/full`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Detail
            </Link>
            <Link
              to={`/admin/order/${oid}/activity-sheets`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Activity Sheets
            </Link>
            <div className="border-b-2 border-blue-600 py-4 px-1 text-base font-medium text-blue-600">
              Tasks
            </div>
            <Link
              to={`/admin/order/${oid}/comments`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Comments
            </Link>
            <Link
              to={`/admin/order/${oid}/attachments`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Attachments
            </Link>
            <Link
              to={`/admin/order/${oid}/more`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center"
            >
              More
              <EllipsisHorizontalIcon className="w-5 h-5 ml-1" />
            </Link>
          </nav>
        </div>

        <div className="p-6">
          {/* Sort Controls */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By:
            </label>
            <select
              value={sortByValue}
              onChange={(e) => handleSortChange(e.target.value)}
              className="block w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created_at,DESC">Created Date (Newest)</option>
              <option value="created_at,ASC">Created Date (Oldest)</option>
              <option value="dueDate,ASC">Due Date (Earliest)</option>
              <option value="dueDate,DESC">Due Date (Latest)</option>
            </select>
          </div>

          {/* Tasks List */}
          {isFetching || isRefreshing ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  {isRefreshing ? "Refreshing tasks..." : "Loading tasks..."}
                </p>
              </div>
            </div>
          ) : taskList.results && taskList.results.length > 0 ? (
            <>
              {/* Tasks Display */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tasks for Order #{oid} ({taskList.count} total)
                </h3>

                {/* Responsive Table Container */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Task ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {taskList.results.map((task, index) => (
                        <tr
                          key={task.id || `task-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              #{task.wjid || task.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {getTaskTypeLabel(task.type)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {task.title || task.description || "No title"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getTaskStatusStyle(task.status)}`}
                            >
                              {getTaskStatusLabel(task.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              {formatDateTime(task.dueDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              {formatDateTime(task.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              {isOrderActionable &&
                                task.status === 1 &&
                                task.type === 1 && (
                                  <Link
                                    to={`/admin/task/${task.id}/assign-associate/step-1`}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    Assign
                                  </Link>
                                )}
                              {isOrderActionable &&
                                task.status === 1 &&
                                task.type === 3 && (
                                  <Link
                                    to={`/admin/task/${task.id}/order-completion/step-1`}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    Complete
                                  </Link>
                                )}
                              {isOrderActionable &&
                                task.status === 1 &&
                                task.type === 4 && (
                                  <Link
                                    to={`/admin/task/${task.id}/survey/step-1`}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    Survey
                                  </Link>
                                )}
                              {isOrderActionable && task.status === 1 && (
                                <>
                                  <span className="text-gray-300">|</span>
                                  <Link
                                    to={`/admin/task/${task.id}/postpone`}
                                    className="text-yellow-600 hover:text-yellow-900"
                                  >
                                    Postpone
                                  </Link>
                                  <span className="text-gray-300">|</span>
                                  <Link
                                    to={`/admin/task/${task.id}/close`}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Close
                                  </Link>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <div className="flex items-center">
                    <label className="mr-3 text-sm font-medium text-gray-700">
                      Items per page:
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) =>
                        handlePageSizeChange(parseInt(e.target.value))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      {pageSizeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-3">
                      {currentPage > 1 && (
                        <button
                          onClick={onPreviousClicked}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <ChevronLeftIcon className="w-4 h-4 mr-2" />
                          Previous
                        </button>
                      )}
                      {currentPage < totalPages && (
                        <button
                          onClick={onNextClicked}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          Next
                          <ChevronRightIcon className="w-4 h-4 ml-2" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // No tasks message
            currentPage === 1 && (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <CheckCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Tasks Found
                </h3>
                <p className="text-gray-500">
                  There are no tasks for this order yet.
                </p>
              </div>
            )
          )}

          {/* Action Buttons */}
          <div className="flex justify-start mt-8 pt-6 border-t border-gray-200">
            <Link to={`/admin/order/${oid}`}>
              <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                Back to Order
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetailMoreTaskListPage;
