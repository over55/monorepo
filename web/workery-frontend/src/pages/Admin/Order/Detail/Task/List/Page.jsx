// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/Task/List/Page.jsx
// UIX Upgraded - Uses UIX primitives (Card, Alert, Spinner, Breadcrumb, Tabs, Button)

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  Card,
  Alert,
  Spinner,
  Breadcrumb,
  Tabs,
  Button,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../components/UIX";
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
import { formatDateTime } from "../../../../../../services/Helpers/DateFormatter";
import { DateTime } from "luxon";
import {
  ORDER_STATUS_DECLINED,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_ARCHIVED,
} from "../../../../../../constants/Order";
import {
  TASK_ITEM_TYPE_ASSIGN_ASSOCIATE,
  TASK_ITEM_TYPE_FOLLOW_UP_CUSTOMER_SURVEY,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_ACCEPT_JOB,
} from "../../../../../../constants/Task";

function AdminOrderDetailMoreTaskListPage() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Orders", to: "/admin/orders", icon: WrenchScrewdriverIcon },
    { label: `Order #${oid}`, to: `/admin/order/${oid}`, icon: InformationCircleIcon },
    { label: "Tasks", icon: CheckCircleIcon, isActive: true },
  ], [oid]);

  // Tab items
  const tabItems = useMemo(() => [
    { label: "Summary", to: `/admin/order/${oid}` },
    { label: "Detail", to: `/admin/order/${oid}/full` },
    { label: "Activity Sheets", to: `/admin/order/${oid}/activity-sheets` },
    { label: "Tasks", to: `/admin/order/${oid}/tasks`, isActive: true },
    { label: "Comments", to: `/admin/order/${oid}/comments` },
    { label: "Attachments", to: `/admin/order/${oid}/attachments` },
    { label: "More", to: `/admin/order/${oid}/more`, icon: EllipsisHorizontalIcon },
  ], [oid]);

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
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Card padding="p-0" className="flex items-center justify-center min-h-[400px] border-0 shadow-none">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading order tasks...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
              <WrenchScrewdriverIcon className={`w-8 h-8 mr-3 ${themeClasses.linkPrimary}`} />
              Order #{oid}
            </h1>
            <p className={`mt-1 text-sm ${themeClasses.textSecondary} flex items-center`}>
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
          <Alert type="info" className="mb-4" icon={ArchiveBoxIcon}>
            This order is not actionable
          </Alert>
        )}

      {/* Top Alert Message */}
      {topAlertMessage && (
        <Alert
          type={topAlertStatus === "success" ? "success" : "error"}
          className="mb-4"
          dismissible
          onDismiss={() => {
            setTopAlertMessage("");
            setTopAlertStatus("");
          }}
        >
          {topAlertMessage}
        </Alert>
      )}

      {/* Error Display */}
      {errors &&
        typeof errors === "object" &&
        Object.keys(errors).length > 0 &&
        !topAlertMessage && (
          <Alert type="error" className="mb-4" dismissible onDismiss={() => setErrors({})}>
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
          </Alert>
        )}

      {/* Main Content */}
      <Card>
        {/* Header with Title and Refresh Button */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <h2 className={`text-2xl font-semibold ${themeClasses.textPrimary} flex items-center`}>
                <CheckCircleIcon className={`w-7 h-7 mr-2 ${themeClasses.linkPrimary}`} />
                Tasks
              </h2>
              {lastFetchTime && (
                <span className="text-sm text-gray-500 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {formatLastFetchTime()}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              loading={isRefreshing}
            >
              <ArrowPathIcon className={`w-5 h-5 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs items={tabItems} className="px-6" />

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
                <Spinner size="lg" />
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
                              {task.status === 1 &&
                                task.type ===
                                  TASK_ITEM_TYPE_ASSIGN_ASSOCIATE && (
                                  <Link
                                    to={`/admin/task/${task.id}/assign-associate/step-1`}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    Assign
                                  </Link>
                                )}
                              {task.status === 1 &&
                                (task.type ===
                                  TASK_ITEM_TYPE_FOLLOW_UP_CUSTOMER_SURVEY ||
                                  task.type === 3) && (
                                  <Link
                                    to={`/admin/task/${task.id}/order-completion/step-1`}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    Complete
                                  </Link>
                                )}
                              {task.status === 1 &&
                                task.type ===
                                  TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_ACCEPT_JOB && (
                                  <Link
                                    to={`/admin/task/${task.id}/survey/step-1`}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    Survey
                                  </Link>
                                )}
                              {task.status === 1 && (
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
              <Button variant="outline">
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                Back to Order
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Wrapper with UIXThemeProvider
function AdminOrderDetailMoreTaskListPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminOrderDetailMoreTaskListPage />
    </UIXThemeProvider>
  );
}

export default AdminOrderDetailMoreTaskListPageWithProvider;
