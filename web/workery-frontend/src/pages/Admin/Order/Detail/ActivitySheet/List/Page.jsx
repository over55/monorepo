// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/ActivitySheet/List/Page.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ArrowPathIcon,
  ClockIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  CheckBadgeIcon,
  ListBulletIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  useActivitySheetManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { DateTime } from "luxon";

// Constants
const OrderStatusNew = 1;
const OrderStatusDeclined = 2;
const OrderStatusPending = 3;
const OrderStatusCancelled = 4;
const OrderStatusOngoing = 5;
const OrderStatusInProgress = 6;
const OrderStatusCompletedButUnpaid = 7;
const OrderStatusCompletedAndPaid = 8;
const OrderStatusArchived = 9;

const ORDER_STATUS_MAP = {
  [OrderStatusNew]: "New",
  [OrderStatusDeclined]: "Declined",
  [OrderStatusPending]: "Pending",
  [OrderStatusCancelled]: "Cancelled",
  [OrderStatusOngoing]: "Ongoing",
  [OrderStatusInProgress]: "In Progress",
  [OrderStatusCompletedButUnpaid]: "Completed but Unpaid",
  [OrderStatusCompletedAndPaid]: "Completed and Paid",
  [OrderStatusArchived]: "Archived",
};

const ACTIVITY_SHEET_STATUS_MAP = {
  1: "Archived",
  2: "Error",
  3: "Accepted",
  4: "Declined",
  5: "Pending",
};

function AdminOrderDetailActivitySheetListPage() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const activitySheetManager = useActivitySheetManager();
  const authManager = useAuthManager();

  // Use refs to track if initial load has happened
  const hasInitialLoad = useRef(false);
  const lastFetchParams = useRef(null);

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const [activitySheets, setActivitySheets] = useState(null);
  const [pageSize, setPageSize] = useState(25);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");
  const [sortByValue, setSortByValue] = useState("created_at,DESC");
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [topAlertMessage, setTopAlertMessage] = useState("");
  const [topAlertStatus, setTopAlertStatus] = useState("");

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Core fetch function
  const doFetchActivitySheets = useCallback(
    async (cursor = "", forceRefresh = false) => {
      // Create a unique key for this fetch to prevent duplicates
      const fetchKey = `${cursor}-${pageSize}-${sortByValue}-${oid}`;

      // Check if we're already fetching with these exact params
      if (lastFetchParams.current === fetchKey && !forceRefresh) {
        console.log("Skipping duplicate fetch with same params:", fetchKey);
        return;
      }

      try {
        if (forceRefresh) {
          setRefreshing(true);
        } else {
          setFetching(true);
        }
        setErrors({});

        // Handle sorting
        const sortArray = sortByValue.split(",");
        const sortField = sortArray[0];
        const sortOrder = sortArray[1];

        // Build parameters object for the API
        const params = {
          page_size: pageSize,
          sort_field: sortField,
          sort_order: sortOrder === "DESC" ? "-1" : "1",
          order_wjid: String(oid),
        };

        // Add cursor if provided
        if (cursor && cursor !== "") {
          params.cursor = cursor;
        }

        console.log("Fetching activity sheets with params:", params);

        // Update last fetch params
        lastFetchParams.current = fetchKey;

        // Fetch activity sheets
        const data = await activitySheetManager.getActivitySheets(
          params,
          onUnauthorized,
          forceRefresh,
        );

        console.log("Received activity sheets data:", {
          resultsCount: data?.results?.length || 0,
          hasNextPage: data?.hasNextPage,
          nextCursor: data?.nextCursor,
        });

        if (data) {
          setActivitySheets(data);

          // Update next cursor for pagination
          if (data.hasNextPage && data.nextCursor) {
            setNextCursor(data.nextCursor);
          } else {
            setNextCursor("");
          }
        }

        setLastFetchTime(new Date());
      } catch (error) {
        console.error("Failed to fetch activity sheets:", error);
        setErrors(error);
        setActivitySheets(null);
      } finally {
        setFetching(false);
        setRefreshing(false);
      }
    },
    [oid, pageSize, sortByValue, activitySheetManager, onUnauthorized],
  );

  // Refresh handler
  const handleRefresh = () => {
    lastFetchParams.current = null;
    doFetchActivitySheets(currentCursor, true);
  };

  // Pagination handlers
  const onNextClicked = () => {
    console.log("Next Clicked, nextCursor:", nextCursor);
    if (nextCursor) {
      setPreviousCursors((prev) => [...prev, currentCursor]);
      setCurrentCursor(nextCursor);
    }
  };

  const onPreviousClicked = () => {
    console.log("Previous Clicked");
    setPreviousCursors((prev) => {
      const arr = [...prev];
      if (arr.length > 0) {
        const previousCursor = arr.pop();
        setCurrentCursor(previousCursor);
        return arr;
      }
      return prev;
    });
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    console.log("Page size changed to:", newSize);
    setPageSize(newSize);
    // Reset pagination when page size changes
    setCurrentCursor("");
    setPreviousCursors([]);
    setNextCursor("");
    lastFetchParams.current = null;
  };

  // Handle sort change
  const handleSortChange = (newSort) => {
    console.log("Sort changed to:", newSort);
    setSortByValue(newSort);
    // Reset pagination when sort changes
    setCurrentCursor("");
    setPreviousCursors([]);
    setNextCursor("");
    lastFetchParams.current = null;
  };

  // Format helpers
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return DateTime.fromISO(dateString).toLocaleString(DateTime.DATETIME_MED);
    } catch {
      return dateString;
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

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 3: // Accepted
        return "bg-green-100 text-green-800 border-green-200";
      case 4: // Declined
        return "bg-red-100 text-red-800 border-red-200";
      case 5: // Pending
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 2: // Error
        return "bg-red-100 text-red-800 border-red-200";
      case 1: // Archived
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Initial load - only check auth once on mount
  useEffect(() => {
    if (!hasInitialLoad.current) {
      window.scrollTo(0, 0);
      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }
      hasInitialLoad.current = true;
    }
  }, [authManager, navigate]);

  // Fetch activity sheets when parameters change
  useEffect(() => {
    if (oid && hasInitialLoad.current) {
      console.log("Parameters changed, fetching with cursor:", currentCursor);
      doFetchActivitySheets(currentCursor, false);
    }
  }, [oid, currentCursor, pageSize, sortByValue, doFetchActivitySheets]);

  // Page size options
  const pageSizeOptions = [
    { value: 10, label: "10" },
    { value: 25, label: "25" },
    { value: 50, label: "50" },
    { value: 100, label: "100" },
  ];

  if (isFetching && !activitySheets) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading activity sheets...</p>
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
              Order
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              View and manage activity sheets
              {activitySheets && activitySheets.order && (
                <span className="ml-2">
                  (Status:{" "}
                  {ORDER_STATUS_MAP[activitySheets.order.status] || "Unknown"})
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {activitySheets &&
        activitySheets.order &&
        activitySheets.order.status === OrderStatusArchived && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
            <ArchiveBoxIcon className="w-5 h-5 mr-2" />
            This order is archived
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
                <CheckBadgeIcon className="w-5 h-5 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
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
                <ul className="mt-2 list-disc list-inside">
                  {typeof errors === "string" ? (
                    <li>{errors}</li>
                  ) : (
                    Object.entries(errors).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))
                  )}
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
        {/* Header with Title and Refresh Button */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <DocumentTextIcon className="w-7 h-7 mr-2 text-blue-600" />
                Activity Sheets
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
            <div className="border-b-2 border-blue-600 py-4 px-1 text-base font-medium text-blue-600">
              Activity Sheets
            </div>
            <Link
              to={`/admin/order/${oid}/tasks`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Tasks
            </Link>
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
            </select>
          </div>

          {/* Activity Sheets List */}
          {isFetching || isRefreshing ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  {isRefreshing
                    ? "Refreshing activity sheets..."
                    : "Loading activity sheets..."}
                </p>
              </div>
            </div>
          ) : activitySheets &&
            activitySheets.results &&
            (activitySheets.results.length > 0 ||
              previousCursors.length > 0) ? (
            <>
              {/* Activity Sheets Table */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Activity Sheets for Order #{oid} (
                  {activitySheets.results.length}
                  {activitySheets.hasNextPage ? "+" : ""})
                </h3>

                {/* Desktop Table View */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Associate
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Created At
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activitySheets.results.map((sheet, index) => (
                        <tr
                          key={sheet.id || `sheet-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            {sheet.associateName ? (
                              <Link
                                to={`/admin/associate/${sheet.associateId}`}
                                className="text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <UserIcon className="w-4 h-4 mr-2" />
                                {sheet.associateName}
                              </Link>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                              {formatDateTime(sheet.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(sheet.status)}`}
                            >
                              {ACTIVITY_SHEET_STATUS_MAP[sheet.status] ||
                                "Unknown"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="sm:hidden space-y-4 mt-4">
                  {activitySheets.results.map((sheet, index) => (
                    <div
                      key={sheet.id || `sheet-mobile-${index}`}
                      className="bg-gray-50 rounded-lg border border-gray-200 p-4"
                    >
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-gray-500">
                            Associate
                          </span>
                          <div className="mt-1">
                            {sheet.associateName ? (
                              <Link
                                to={`/admin/associate/${sheet.associateId}`}
                                className="text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <UserIcon className="w-4 h-4 mr-2" />
                                {sheet.associateName}
                              </Link>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">
                            Created At
                          </span>
                          <div className="mt-1 flex items-center text-sm">
                            <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDateTime(sheet.createdAt)}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Status</span>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(sheet.status)}`}
                            >
                              {ACTIVITY_SHEET_STATUS_MAP[sheet.status] ||
                                "Unknown"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination Controls */}
              {(previousCursors.length > 0 || activitySheets.hasNextPage) && (
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
                  <div className="flex gap-3">
                    {previousCursors.length > 0 && (
                      <button
                        onClick={onPreviousClicked}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <ChevronLeftIcon className="w-4 h-4 mr-2" />
                        Previous
                      </button>
                    )}
                    {activitySheets.hasNextPage && nextCursor && (
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
              )}
            </>
          ) : (
            // No activity sheets message
            previousCursors.length === 0 && (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Activity Sheets
                </h3>
                <p className="text-gray-500">
                  No activity sheets found for Order #{oid}.
                </p>
              </div>
            )
          )}

          {/* Action Buttons */}
          <div className="flex justify-start mt-8 pt-6 border-t border-gray-200">
            <Link to="/admin/orders">
              <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                Back to Orders
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetailActivitySheetListPage;
