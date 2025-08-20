// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Detail/Order/List/Page.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  WrenchScrewdriverIcon,
  ChevronLeftIcon,
  ArrowPathIcon,
  ClockIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  HomeIcon,
  BuildingOfficeIcon,
  QuestionMarkCircleIcon,
  ArrowTopRightOnSquareIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import {
  useAssociateManager,
  useOrderManager,
} from "../../../../../../services/Services";
import { DateTime } from "luxon";
import { formatDateForDisplay } from "../../../../../../services/Helpers/DateFormatter";

// Constants
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;

// Order status mappings (fixed to match backend)
const ORDER_STATUS_OPTIONS = {
  1: { label: "New", colorClass: "text-blue-600" },
  2: { label: "Declined", colorClass: "text-red-600" },
  3: { label: "Pending", colorClass: "text-yellow-600" },
  4: { label: "Cancelled", colorClass: "text-gray-600" },
  5: { label: "Ongoing", colorClass: "text-blue-600" },
  6: { label: "In Progress", colorClass: "text-blue-600" },
  7: { label: "Completed (Unpaid)", colorClass: "text-yellow-600" },
  8: { label: "Completed (Paid)", colorClass: "text-green-600" },
  9: { label: "Archived", colorClass: "text-gray-600" },
};

// Order type mappings (fixed to match backend)
const ORDER_TYPE_OPTIONS = {
  0: { label: "-", icon: null },
  1: { label: "Residential", icon: HomeIcon },
  2: { label: "Commercial", icon: BuildingOfficeIcon },
  3: { label: "Unassigned", icon: QuestionMarkCircleIcon },
};

function AdminAssociateDetailOrderListPage() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const associateManager = useAssociateManager();
  const orderManager = useOrderManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const [associate, setAssociate] = useState({});
  const [orderList, setOrderList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination state using cursor-based approach
  const [currentCursor, setCurrentCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursorHistory, setCursorHistory] = useState([]);
  const [pageSize, setPageSize] = useState(50);

  // Filter and sort state
  const [sortByValue, setSortByValue] = useState("assignment_date,DESC");
  const [status, setStatus] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Use refs to track the latest filter values to avoid stale closures
  const filtersRef = useRef({
    sortByValue,
    status,
    pageSize,
  });

  // Update refs when filters change
  useEffect(() => {
    filtersRef.current = {
      sortByValue,
      status,
      pageSize,
    };
  }, [sortByValue, status, pageSize]);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch associate details
  const fetchAssociateDetail = async () => {
    try {
      const data = await associateManager.getAssociateDetail(
        aid,
        onUnauthorized,
      );
      setAssociate(data);
    } catch (error) {
      console.error("Failed to fetch associate detail:", error);
      setErrors(error);
    }
  };

  // Fetch order list with force refresh option - now uses refs for filter values
  const fetchOrderList = useCallback(
    async (cursor = "", isNavigatingBack = false) => {
      // Get the latest filter values from refs
      const currentFilters = filtersRef.current;

      console.log(
        "🔄 fetchOrderList called with cursor:",
        cursor,
        "filters:",
        currentFilters,
      );

      setFetching(true);
      setErrors({});

      // Always clear the cache when fetching with new filters
      if (!isNavigatingBack) {
        orderManager.clearOrdersCache();
      }

      try {
        // Build filters map (matching old implementation)
        const filtersMap = new Map();

        // Add cursor if provided
        if (cursor) {
          filtersMap.set("cursor", cursor);
        }

        // Add page size
        filtersMap.set("page_size", currentFilters.pageSize.toString());

        // IMPORTANT: Always include associate_id filter
        filtersMap.set("associate_id", aid);

        // Handle sorting
        const sortArray = currentFilters.sortByValue.split(",");
        filtersMap.set("sort_field", sortArray[0]);
        filtersMap.set("sort_order", sortArray[1]);

        // Add status filter if not "All"
        if (currentFilters.status !== 0) {
          filtersMap.set("status", currentFilters.status.toString());
        }

        console.log(
          "🌐 Making API call with filters:",
          Array.from(filtersMap.entries()),
        );

        // Use the legacy method for compatibility with forceRefresh
        const data = await orderManager.getOrdersWithFiltersMap(
          filtersMap,
          onUnauthorized,
          true, // Always force refresh
        );

        console.log("✅ API response received:", {
          resultsCount: data.results?.length,
          nextCursor: data.nextCursor,
          hasNextPage: data.hasNextPage,
          totalCount: data.count,
        });

        setOrderList(data);
        setTotalCount(data.count || 0);

        // Handle pagination response
        if (
          data.nextCursor !== undefined &&
          data.nextCursor !== null &&
          data.nextCursor !== ""
        ) {
          setNextCursor(data.nextCursor);
          setHasNextPage(true);
        } else {
          setNextCursor("");
          setHasNextPage(false);
        }

        // Alternative: Check if hasNextPage is explicitly set
        if (data.hasNextPage !== undefined) {
          setHasNextPage(data.hasNextPage);
        }

        // Update current cursor if not navigating back
        if (!isNavigatingBack) {
          setCurrentCursor(cursor);
        }

        setLastFetchTime(new Date());
      } catch (error) {
        console.error("❌ Failed to fetch order list:", error);
        setErrors(error);
      } finally {
        setFetching(false);
        setRefreshing(false);
      }
    },
    [aid, orderManager, onUnauthorized],
  );

  // Immediate filter application function
  const applyFilters = useCallback(() => {
    console.log("🔄 Applying filters - resetting pagination");
    // Reset pagination when filters change
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    // Clear cache and fetch fresh data
    orderManager.clearOrdersCache();
    fetchOrderList("");
  }, [fetchOrderList, orderManager]);

  // Refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    applyFilters();
  };

  // Pagination handlers
  const handleNextPage = () => {
    console.log(
      "📜 handleNextPage clicked, nextCursor:",
      nextCursor,
      "hasNextPage:",
      hasNextPage,
    );

    if (hasNextPage && nextCursor) {
      console.log("✅ Going to next page with cursor:", nextCursor);

      // Push current cursor to history for "Previous" functionality
      setCursorHistory((prev) => [...prev, currentCursor]);

      // Fetch next page
      fetchOrderList(nextCursor);
    } else {
      console.log("❌ No next page available");
    }
  };

  const handlePreviousPage = () => {
    console.log("🔙 handlePreviousPage clicked");

    if (cursorHistory.length > 0) {
      // Pop the last cursor from history
      const newHistory = [...cursorHistory];
      const previousCursor = newHistory.pop();

      console.log(
        "✅ Going to previous page with cursor:",
        previousCursor || "start",
      );

      // Update history
      setCursorHistory(newHistory);

      // Fetch previous page
      fetchOrderList(previousCursor || "", true);
    } else {
      console.log("❌ Already on first page");
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    console.log("📏 Page size changing from", pageSize, "to", newPageSize);
    setPageSize(newPageSize);
    // Apply filters immediately after state update
    setTimeout(() => applyFilters(), 0);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortByValue(e.target.value);
    // Apply filters immediately after state update
    setTimeout(() => applyFilters(), 0);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    console.log("🎯 Status filter change:", e.target.value);
    setStatus(parseInt(e.target.value));
    // Apply filters immediately after state update
    setTimeout(() => applyFilters(), 0);
  };

  // Format status helper with color
  const formatStatus = (statusValue) => {
    const statusOption = ORDER_STATUS_OPTIONS[statusValue];
    if (!statusOption) return <span>Unknown ({statusValue})</span>;

    return (
      <span className={`font-semibold ${statusOption.colorClass}`}>
        {statusOption.label}
      </span>
    );
  };

  // Format type helper with icon
  const formatType = (typeValue) => {
    const type = ORDER_TYPE_OPTIONS[typeValue];
    if (!type) return <span>Unknown ({typeValue})</span>;

    const IconComponent = type.icon;
    return (
      <span className="flex items-center">
        {IconComponent && <IconComponent className="w-4 h-4 mr-1" />}
        {type.label}
      </span>
    );
  };

  // Format time since last fetch
  const formatLastFetchTime = () => {
    if (!lastFetchTime) return null;
    const now = DateTime.now();
    const fetchTime = DateTime.fromJSDate(lastFetchTime);
    const diff = now.diff(fetchTime, ["minutes", "seconds"]);

    if (diff.minutes >= 1) {
      return `Last updated ${Math.floor(diff.minutes)} minute${Math.floor(diff.minutes) !== 1 ? "s" : ""} ago`;
    } else {
      return `Last updated ${Math.floor(diff.seconds)} seconds ago`;
    }
  };

  // Initial load - fetch associate detail
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAssociateDetail();
    // Clear cache on mount to ensure fresh data
    orderManager.clearOrdersCache();
  }, [aid]);

  // Initial data load - only on mount
  useEffect(() => {
    if (aid) {
      console.log("🚀 Initial mount - loading first page");
      fetchOrderList("");
    }
  }, [aid]); // Only depend on aid, not fetchOrderList

  // Page size options
  const pageSizeOptions = [
    { value: 10, label: "10" },
    { value: 25, label: "25" },
    { value: 50, label: "50" },
    { value: 100, label: "100" },
  ];

  // Calculate pagination info
  const hasPreviousPage = cursorHistory.length > 0;
  const currentPageNumber = cursorHistory.length + 1;

  if (isFetching && !associate.id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading associate orders...</p>
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
                to="/admin/associates"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  Associates
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
              <UserGroupIcon className="w-8 h-8 mr-3 text-blue-600" />
              Associate
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              View and manage orders
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {associate && associate.status === 2 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This associate is archived
        </div>
      )}

      {/* Error Display */}
      {errors &&
        typeof errors === "object" &&
        Object.keys(errors).length > 0 && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2 mt-0.5" />
              <div className="flex-1">
                <strong>Error:</strong>
                <ul className="mt-2 list-disc list-inside">
                  {Object.entries(errors).map(([key, value]) => (
                    <li key={key}>
                      {key}: {value}
                    </li>
                  ))}
                </ul>
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
        {associate && (
          <>
            {/* Header with Title and Refresh Button */}
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                    <WrenchScrewdriverIcon className="w-7 h-7 mr-2 text-blue-600" />
                    Orders
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
                  to={`/admin/associate/${aid}`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Summary
                </Link>
                <Link
                  to={`/admin/associate/${aid}/detail`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Detail
                </Link>
                <div className="border-b-2 border-blue-600 py-4 px-1 text-base font-medium text-blue-600">
                  Orders
                </div>
                <Link
                  to={`/admin/associate/${aid}/comments`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Comments
                </Link>
                <Link
                  to={`/admin/associate/${aid}/attachments`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Attachments
                </Link>
                <Link
                  to={`/admin/associate/${aid}/more`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center"
                >
                  More
                  <EllipsisHorizontalIcon className="w-5 h-5 ml-1" />
                </Link>
              </nav>
            </div>

            <div className="p-6">
              {/* Filters Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Filter:
                  </label>
                  <select
                    value={status}
                    onChange={handleStatusFilterChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>All Statuses</option>
                    {Object.entries(ORDER_STATUS_OPTIONS).map(
                      ([value, option]) => (
                        <option key={value} value={value}>
                          {option.label}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By:
                  </label>
                  <select
                    value={sortByValue}
                    onChange={handleSortChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="assignment_date,DESC">
                      Assignment Date (Newest)
                    </option>
                    <option value="assignment_date,ASC">
                      Assignment Date (Oldest)
                    </option>
                    <option value="start_date,DESC">Start Date (Newest)</option>
                    <option value="start_date,ASC">Start Date (Oldest)</option>
                    <option value="created_at,DESC">
                      Created Date (Newest)
                    </option>
                    <option value="created_at,ASC">
                      Created Date (Oldest)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Items per page:
                  </label>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    {pageSizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-6 text-gray-600">
                Showing{" "}
                <strong className="text-gray-900">
                  {orderList.results ? orderList.results.length : 0}
                </strong>{" "}
                orders
                {totalCount > 0 && ` (Total: ${totalCount})`}
                {status !== 0 && ` (filtered by status)`}
              </div>

              {/* Orders List */}
              {isFetching || isRefreshing ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                      {isRefreshing
                        ? "Refreshing orders..."
                        : "Loading orders..."}
                    </p>
                  </div>
                </div>
              ) : orderList &&
                orderList.results &&
                (orderList.results.length > 0 || cursorHistory.length > 0) ? (
                <>
                  {/* Orders Table - Desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Job #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Assigned
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Start
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Completion
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Financial
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orderList.results.map((order, index) => (
                          <tr
                            key={order.wjid || index}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatType(order.type)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                              {order.wjid}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <Link
                                to={`/admin/customer/${order.customerId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                              >
                                {order.customerName}
                                <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDateForDisplay(order.assignmentDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDateForDisplay(order.startDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDateForDisplay(order.completionDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {formatStatus(order.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <Link
                                to={`/admin/financial/${order.wjid}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                              >
                                View
                                <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <Link
                                to={`/admin/order/${order.wjid}`}
                                className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                              >
                                View
                                <ArrowRightIcon className="w-3 h-3 ml-1" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Orders List - Mobile */}
                  <div className="md:hidden space-y-4">
                    {orderList.results.map((order, index) => (
                      <div
                        key={order.wjid || index}
                        className="bg-gray-50 rounded-lg border border-gray-200 p-4"
                      >
                        <div className="mb-3">
                          <strong className="text-gray-700">Type:</strong>{" "}
                          {formatType(order.type)}
                        </div>
                        <div className="mb-3">
                          <strong className="text-gray-700">Job #:</strong>{" "}
                          <span className="font-mono">{order.wjid}</span>
                        </div>
                        <div className="mb-3">
                          <strong className="text-gray-700">Customer:</strong>{" "}
                          <Link
                            to={`/admin/customer/${order.customerId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                          >
                            {order.customerName}
                            <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                          </Link>
                        </div>
                        <div className="mb-3">
                          <strong className="text-gray-700">Assigned:</strong>{" "}
                          {formatDateForDisplay(order.assignmentDate)}
                        </div>
                        <div className="mb-3">
                          <strong className="text-gray-700">Start:</strong>{" "}
                          {formatDateForDisplay(order.startDate)}
                        </div>
                        <div className="mb-3">
                          <strong className="text-gray-700">Completion:</strong>{" "}
                          {formatDateForDisplay(order.completionDate)}
                        </div>
                        <div className="mb-3">
                          <strong className="text-gray-700">Status:</strong>{" "}
                          {formatStatus(order.status)}
                        </div>
                        <div className="mb-4">
                          <strong className="text-gray-700">Financial:</strong>{" "}
                          <Link
                            to={`/admin/financial/${order.wjid}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                          >
                            View
                            <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                          </Link>
                        </div>
                        <Link to={`/admin/order/${order.wjid}`}>
                          <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                            View Order
                            <ArrowRightIcon className="w-4 h-4 ml-2" />
                          </button>
                        </Link>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {(hasPreviousPage || hasNextPage) && (
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
                      <div className="flex items-center text-sm text-gray-700">
                        Page {currentPageNumber}
                        {totalCount > 0 && (
                          <span className="ml-2 text-gray-500">
                            (Total: {totalCount} orders)
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3">
                        {hasPreviousPage && (
                          <button
                            onClick={handlePreviousPage}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <ChevronLeftIcon className="w-4 h-4 mr-2" />
                            Previous
                          </button>
                        )}
                        {hasNextPage && (
                          <button
                            onClick={handleNextPage}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                          >
                            Next
                            <ChevronRightIcon className="w-4 h-4 ml-2" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // No orders message
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <WrenchScrewdriverIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Orders Found
                  </h3>
                  <p className="text-gray-500">
                    {status !== 0
                      ? "No orders match the selected status filter."
                      : "This associate does not have any orders yet."}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-start mt-8 pt-6 border-t border-gray-200">
                <Link to="/admin/associates">
                  <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <ChevronLeftIcon className="w-5 h-5 mr-2" />
                    Back to Associates
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}

        {!associate && !isFetching && (
          <div className="px-6 py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <UserGroupIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Associate Not Found
            </h3>
            <p className="text-gray-500 mb-6">
              The associate you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/admin/associates">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to Associates
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAssociateDetailOrderListPage;
