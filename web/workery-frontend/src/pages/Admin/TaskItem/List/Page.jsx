// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/List/Page.jsx

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import {
  useTaskManager,
  useAuthManager,
  useAccountManager,
} from "../../../../services/Services";
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  XMarkIcon,
  TrashIcon,
  PencilSquareIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CalendarIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ChevronLeftIcon,
  ClockIcon,
  LockClosedIcon,
  LockOpenIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

// Import your task constants
import {
  TASK_ITEM_TYPE_ASSIGN_ASSOCIATE,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_AND_CUSTOMER_AGREED_TO_MEET,
  TASK_ITEM_TYPE_FOLLOW_UP_CUSTOMER_SURVEY,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_ACCEPT_JOB,
  TASK_ITEM_TYPE_UPDATE_ONGOING_JOB,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_COMPLETE_JOB,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_CUSTOMER_REVIEW_ASSOCIATE_AFTER_JOB,
} from "../../../../constants/Task";
import {
  TASK_LIST_VIEW_TYPE,
  TASK_PAGINATION,
  TASK_SORT_OPTIONS,
  DEFAULT_TASK_SORT_BY,
  TASK_TYPE_FILTER_OPTIONS,
  TASK_IS_CLOSED_FILTER,
  TASK_STATUS,
} from "../../../../constants/Task";
import { CACHE_DURATIONS } from "../../../../constants/Storage";
import { AUTH_ROUTES } from "../../../../constants/Authentication";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";

const VIEW_TYPE_TABULAR = "tabular";
const VIEW_TYPE_GRID = "grid";

const PAGE_SIZE_OPTIONS = [
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
  { value: 250, label: "250 per page" },
];

function AdminTaskItemListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const taskManager = useTaskManager();
  const authManager = useAuthManager();
  const accountManager = useAccountManager();

  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [tasks, setTasks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState(0);
  const [isClosedFilter, setIsClosedFilter] = useState(
    TASK_IS_CLOSED_FILTER.OPEN,
  );
  const [sortBy, setSortBy] = useState(DEFAULT_TASK_SORT_BY);
  const [viewType, setViewType] = useState(VIEW_TYPE_TABULAR);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state using cursor-based approach
  const [currentCursor, setCurrentCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursorHistory, setCursorHistory] = useState([]);
  const [pageSize, setPageSize] = useState(50);

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Background refresh interval
  const refreshIntervalRef = useRef(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    authManager.logout();
    navigate(AUTH_ROUTES.UNAUTHORIZED);
  };

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const profile = await accountManager.getAccountDetail(onUnauthorized);
        setCurrentUser(profile);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        navigate(AUTH_ROUTES.LOGIN);
      }
    };

    if (authManager.isAuthenticated()) {
      fetchCurrentUser();
    } else {
      navigate(AUTH_ROUTES.LOGIN);
    }
  }, []);

  // Fetch tasks using the manager
  const fetchTasks = async (cursor = "", isNavigatingBack = false) => {
    setLoading(true);
    setError(null);

    try {
      // Build params for cursor-based pagination
      const [sortField, sortOrder] = sortBy.split(",");

      const params = {
        page_size: pageSize.toString(),
        sort_field: sortField,
        sort_order: sortOrder,
        cursor: cursor || undefined,
        is_closed: isClosedFilter.toString(),
      };

      // Add optional filters
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (typeFilter !== 0) {
        params.type = typeFilter.toString();
      }

      // Force refresh to bypass caching
      const response = await taskManager.getTasks(params, onUnauthorized, true);

      if (response) {
        setTasks(response.results || []);
        setTotalCount(response.count || 0);

        // Handle pagination response
        setHasNextPage(response.hasNextPage === true);
        setNextCursor(response.nextCursor || "");

        // Update current cursor if not navigating back
        if (!isNavigatingBack) {
          setCurrentCursor(cursor);
        }
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch tasks
  useEffect(() => {
    if (currentUser) {
      fetchTasks(currentCursor);
    }
  }, [
    currentCursor,
    pageSize,
    sortBy,
    typeFilter,
    isClosedFilter,
    searchQuery,
    currentUser,
  ]);

  // Effect for background refresh
  useEffect(() => {
    if (currentUser) {
      // Set up interval for background refresh
      refreshIntervalRef.current = setInterval(() => {
        fetchTasks(currentCursor);
      }, CACHE_DURATIONS.BACKGROUND_REFRESH);

      // Cleanup on unmount
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [currentUser, currentCursor]);

  // Handle success message from navigation state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  }, [location]);

  // Event handlers
  const handleSearch = () => {
    setSearchQuery(tempSearchQuery);
    // Reset pagination when searching
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    fetchTasks("");
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTempSearchQuery("");
    setTypeFilter(0);
    setIsClosedFilter(TASK_IS_CLOSED_FILTER.OPEN);
    setSortBy(DEFAULT_TASK_SORT_BY);
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    setShowFilters(false);
    fetchTasks("");
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (hasNextPage && nextCursor) {
      setCursorHistory((prev) => [...prev, currentCursor]);
      fetchTasks(nextCursor);
    }
  };

  const handlePreviousPage = () => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      const previousCursor = newHistory.pop();
      setCursorHistory(newHistory);
      fetchTasks(previousCursor || "", true);
    }
  };

  // Handle delete task
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      setLoading(true);
      await taskManager.deleteTask(taskToDelete.id, onUnauthorized);

      // Refresh the current page
      fetchTasks(currentCursor);

      // Reset delete state
      setShowDeleteModal(false);
      setTaskToDelete(null);
      setSuccessMessage("Task deleted successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to delete task:", err);
      setError("Failed to delete task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get task update URL based on type
  const getTaskUpdateURL = (taskId, taskType) => {
    switch (taskType) {
      case TASK_ITEM_TYPE_ASSIGN_ASSOCIATE:
        return `/admin/task/${taskId}/assign-associate/step-1`;
      case TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_COMPLETE_JOB:
      case TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_AND_CUSTOMER_AGREED_TO_MEET:
      case TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_ACCEPT_JOB:
      case TASK_ITEM_TYPE_UPDATE_ONGOING_JOB:
        return `/admin/task/${taskId}/order-completion/step-1`;
      case TASK_ITEM_TYPE_FOLLOW_UP_DID_CUSTOMER_REVIEW_ASSOCIATE_AFTER_JOB:
      case TASK_ITEM_TYPE_FOLLOW_UP_CUSTOMER_SURVEY:
        return `/admin/task/${taskId}/survey/step-1`;
      default:
        return "/404";
    }
  };

  // Get task type display name
  const getTaskTypeDisplay = (type) => {
    const typeOption = TASK_TYPE_FILTER_OPTIONS.find(
      (opt) => opt.value === type.toString(),
    );
    return typeOption ? typeOption.label : "Unknown";
  };

  // Get status badge color
  const getStatusBadgeColor = (isClosed) => {
    return isClosed
      ? "bg-gray-100 text-gray-800"
      : "bg-green-100 text-green-800";
  };

  // Calculate pagination info
  const hasPreviousPage = cursorHistory.length > 0;
  const currentPageNumber = cursorHistory.length + 1;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-black">Loading user information...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-sm font-medium text-black hover:text-blue-600"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-black md:ml-2 inline-flex items-center">
                  <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                  Tasks
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black flex items-center">
            <ClipboardDocumentListIcon className="w-8 h-8 mr-3 text-blue-600" />
            Tasks Management
            {totalCount > 0 && (
              <span className="ml-4 text-lg font-normal text-black">
                ({totalCount}{" "}
                {isClosedFilter === TASK_IS_CLOSED_FILTER.OPEN
                  ? "open"
                  : isClosedFilter === TASK_IS_CLOSED_FILTER.CLOSED
                    ? "closed"
                    : "total"}
                )
              </span>
            )}
          </h1>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              {successMessage}
            </span>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-green-600 hover:text-green-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {error}
            </span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white shadow-sm rounded-lg">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black flex items-center">
              <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
              Task List
            </h2>
            <div className="flex items-center gap-2">
              {/* View Type Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewType(VIEW_TYPE_TABULAR)}
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewType === VIEW_TYPE_TABULAR
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <TableCellsIcon className="w-4 h-4 mr-1.5" />
                  Table
                </button>
                <button
                  onClick={() => setViewType(VIEW_TYPE_GRID)}
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewType === VIEW_TYPE_GRID
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Squares2X2Icon className="w-4 h-4 mr-1.5" />
                  Grid
                </button>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-black flex items-center">
                <FunnelIcon className="w-4 h-4 mr-2" />
                Filter & Search
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`text-sm font-medium flex items-center px-3 py-1 rounded-md transition-colors ${
                    showFilters
                      ? "text-blue-700 bg-blue-50"
                      : "text-black hover:text-gray-800"
                  }`}
                >
                  {showFilters ? (
                    <ChevronDownIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <PlusIcon className="w-4 h-4 mr-1" />
                  )}
                  {showFilters ? "Hide" : "Show"} All Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Clear Filters
                </button>
                <button
                  onClick={() => fetchTasks(currentCursor)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-1" />
                  Refresh
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-black mb-1">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tempSearchQuery}
                    onChange={(e) => setTempSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={handleSearchKeyPress}
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Sort By
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCursorHistory([]);
                      setCurrentCursor("");
                      setNextCursor("");
                      setHasNextPage(false);
                    }}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    {TASK_SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Status
                </label>
                <div className="flex gap-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="isClosed"
                      value={TASK_IS_CLOSED_FILTER.ALL}
                      checked={isClosedFilter === TASK_IS_CLOSED_FILTER.ALL}
                      onChange={(e) => {
                        setIsClosedFilter(parseInt(e.target.value));
                        setCursorHistory([]);
                        setCurrentCursor("");
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-black">All</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="isClosed"
                      value={TASK_IS_CLOSED_FILTER.OPEN}
                      checked={isClosedFilter === TASK_IS_CLOSED_FILTER.OPEN}
                      onChange={(e) => {
                        setIsClosedFilter(parseInt(e.target.value));
                        setCursorHistory([]);
                        setCurrentCursor("");
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-black">Open</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="isClosed"
                      value={TASK_IS_CLOSED_FILTER.CLOSED}
                      checked={isClosedFilter === TASK_IS_CLOSED_FILTER.CLOSED}
                      onChange={(e) => {
                        setIsClosedFilter(parseInt(e.target.value));
                        setCursorHistory([]);
                        setCurrentCursor("");
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-black">Closed</span>
                  </label>
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Type
                </label>
                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(parseInt(e.target.value));
                      setCursorHistory([]);
                      setCurrentCursor("");
                    }}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    {TASK_TYPE_FILTER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-black mb-3">
                  Additional Options
                </h4>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Items per page
                  </label>
                  <div className="relative">
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(parseInt(e.target.value));
                        setCursorHistory([]);
                        setCurrentCursor("");
                      }}
                      className="w-full max-w-xs px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    >
                      {PAGE_SIZE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="px-6 py-4">
            {loading && !tasks.length ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-black">Loading tasks...</span>
              </div>
            ) : tasks.length > 0 ? (
              <>
                {/* Results count */}
                <div className="mb-4 text-sm text-black">
                  Showing <strong>{tasks.length}</strong> tasks
                  {totalCount > 0 && ` of ${totalCount} total`}
                  {searchQuery && ` (filtered by "${searchQuery}")`}
                </div>

                {/* List Display */}
                {viewType === VIEW_TYPE_TABULAR ? (
                  /* Table View */
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                            Task
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                            Client
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                            Associate
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-3 py-3 text-center text-xs font-medium text-black uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tasks.map((task) => (
                          <tr key={task.id} className="hover:bg-gray-50">
                            <td className="px-3 py-4 text-sm text-black whitespace-nowrap">
                              <div className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                                {formatDateForDisplay(task.dueDate)}
                              </div>
                            </td>
                            <td className="px-3 py-4 text-sm">
                              <Link
                                to={getTaskUpdateURL(task.id, task.type)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {task.title}
                              </Link>
                              <div className="text-xs text-black mt-1">
                                {getTaskTypeDisplay(task.type)}
                              </div>
                            </td>
                            <td className="px-3 py-4 text-sm text-black">
                              {task.customerName ? (
                                <Link
                                  to={`/admin/customer/${task.customerId}`}
                                  className="flex items-center hover:text-blue-600"
                                >
                                  <UserIcon className="w-4 h-4 mr-2" />
                                  {task.customerName}
                                </Link>
                              ) : (
                                <span className="text-gray-400 italic">
                                  N/A
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-4 text-sm text-black">
                              {task.associateName ? (
                                <Link
                                  to={`/admin/associate/${task.associateId}`}
                                  className="flex items-center hover:text-blue-600"
                                >
                                  <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                                  {task.associateName}
                                </Link>
                              ) : (
                                <span className="text-gray-400 italic">
                                  N/A
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-4 text-sm">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(task.isClosed)}`}
                              >
                                {task.isClosed ? (
                                  <>
                                    <LockClosedIcon className="w-3 h-3 mr-1" />
                                    Closed
                                  </>
                                ) : (
                                  <>
                                    <LockOpenIcon className="w-3 h-3 mr-1" />
                                    Open
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-3 py-4">
                              <div className="flex items-center justify-center">
                                <Link to={getTaskUpdateURL(task.id, task.type)}>
                                  <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                    <EyeIcon className="w-4 h-4 mr-1.5" />
                                    {task.isClosed ? "View" : "View & Update"}
                                  </button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Grid View */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="mb-3">
                          <h3 className="text-base font-semibold text-black">
                            <Link
                              to={getTaskUpdateURL(task.id, task.type)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {task.title}
                            </Link>
                          </h3>
                          <p className="text-xs text-black mt-1">
                            {getTaskTypeDisplay(task.type)}
                          </p>
                        </div>

                        <div className="space-y-2 text-sm text-black mb-3">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                            <span>
                              Due: {formatDateForDisplay(task.dueDate)}
                            </span>
                          </div>
                          {task.customerName && (
                            <div className="flex items-center">
                              <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                              <Link
                                to={`/admin/customer/${task.customerId}`}
                                className="hover:text-blue-600"
                              >
                                {task.customerName}
                              </Link>
                            </div>
                          )}
                          {task.associateName && (
                            <div className="flex items-center">
                              <WrenchScrewdriverIcon className="w-4 h-4 mr-2 text-gray-400" />
                              <Link
                                to={`/admin/associate/${task.associateId}`}
                                className="hover:text-blue-600"
                              >
                                {task.associateName}
                              </Link>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(task.isClosed)}`}
                          >
                            {task.isClosed ? (
                              <>
                                <LockClosedIcon className="w-3 h-3 mr-1" />
                                Closed
                              </>
                            ) : (
                              <>
                                <LockOpenIcon className="w-3 h-3 mr-1" />
                                Open
                              </>
                            )}
                          </span>

                          <Link to={getTaskUpdateURL(task.id, task.type)}>
                            <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                              {task.isClosed ? "View" : "Update"}
                              <ChevronRightIcon className="w-4 h-4 ml-1" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={handlePreviousPage}
                      disabled={!hasPreviousPage}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={!hasNextPage}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-black">
                        Page{" "}
                        <span className="font-medium">{currentPageNumber}</span>
                        {totalCount > 0 && (
                          <>
                            {" "}
                            of{" "}
                            <span className="font-medium">
                              {Math.ceil(totalCount / pageSize)}
                            </span>
                          </>
                        )}
                        {totalCount > 0 && (
                          <span className="ml-2 text-black">
                            ({totalCount} total tasks)
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={handlePreviousPage}
                          disabled={!hasPreviousPage}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeftIcon
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-black">
                          Page {currentPageNumber}
                        </span>
                        <button
                          onClick={handleNextPage}
                          disabled={!hasNextPage}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRightIcon
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* No Results */
              <div className="text-center py-12">
                <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-black">
                  No Tasks Found
                </h3>
                <p className="mt-1 text-sm text-black">
                  {searchQuery ||
                  typeFilter !== 0 ||
                  isClosedFilter !== TASK_IS_CLOSED_FILTER.OPEN
                    ? "No tasks match your current filters. Try adjusting your search criteria."
                    : "No tasks have been created yet."}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  {(searchQuery ||
                    typeFilter !== 0 ||
                    isClosedFilter !== TASK_IS_CLOSED_FILTER.OPEN) && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && taskToDelete && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-black flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-amber-600" />
                  Delete Task
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-black mb-4">
                  Are you sure you want to delete this task? This action cannot
                  be undone.
                </p>

                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                  <p className="text-sm font-medium text-black">
                    <strong>Task:</strong> {taskToDelete.title}
                  </p>
                  {taskToDelete.customerName && (
                    <p className="text-sm text-black mt-1">
                      <strong>Client:</strong> {taskToDelete.customerName}
                    </p>
                  )}
                  <p className="text-sm text-black mt-1">
                    <strong>Due Date:</strong>{" "}
                    {formatDateForDisplay(taskToDelete.dueDate)}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setTaskToDelete(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTask}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete Task
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminTaskItemListPage;
