// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/ActivitySheet/List/Page.jsx
// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb, Tabs, Badge)
// @uix-page: OrderActivitySheetListPage

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Card,
  Button,
  Alert,
  Spinner,
  Breadcrumb,
  Tabs,
  Badge,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../components/UIX";
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
import { formatDateTime } from "../../../../../../services/Helpers/DateFormatter";

// Static constants - frozen for performance
const OrderStatusArchived = 9;

const ORDER_STATUS_MAP = Object.freeze({
  1: "New",
  2: "Declined",
  3: "Pending",
  4: "Cancelled",
  5: "Ongoing",
  6: "In Progress",
  7: "Completed but Unpaid",
  8: "Completed and Paid",
  9: "Archived",
});

const ACTIVITY_SHEET_STATUS_MAP = Object.freeze({
  1: "Archived",
  2: "Error",
  3: "Accepted",
  4: "Declined",
  5: "Pending",
});

const ACTIVITY_SHEET_STATUS_BADGE = Object.freeze({
  1: { variant: "default", label: "Archived" },
  2: { variant: "danger", label: "Error" },
  3: { variant: "success", label: "Accepted" },
  4: { variant: "danger", label: "Declined" },
  5: { variant: "warning", label: "Pending" },
});

const PAGE_SIZE_OPTIONS = Object.freeze([
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
]);

function AdminOrderDetailActivitySheetListPage() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const activitySheetManager = useActivitySheetManager();
  const authManager = useAuthManager();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Breadcrumb items - memoized
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Orders", to: "/admin/orders", icon: WrenchScrewdriverIcon },
    { label: `Order #${oid}`, to: `/admin/order/${oid}`, icon: InformationCircleIcon },
    { label: "Activity Sheets", icon: DocumentTextIcon, isActive: true },
  ], [oid]);

  // Tab items - memoized
  const tabItems = useMemo(() => [
    { label: "Summary", to: `/admin/order/${oid}` },
    { label: "Detail", to: `/admin/order/${oid}/full` },
    { label: "Activity Sheets", to: `/admin/order/${oid}/activity-sheets`, isActive: true },
    { label: "Tasks", to: `/admin/order/${oid}/tasks` },
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

  const formatLastFetchTime = useCallback(() => {
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
  }, [lastFetchTime]);

  // Get status badge config
  const getStatusBadgeConfig = useCallback((status) => {
    return ACTIVITY_SHEET_STATUS_BADGE[status] || { variant: "default", label: "Unknown" };
  }, []);

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

  if (isFetching && !activitySheets) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Card padding="p-0" className="flex items-center justify-center min-h-[400px] border-0 shadow-none">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading activity sheets...</p>
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
          <Alert type="info" className="mb-4" icon={ArchiveBoxIcon}>
            This order is archived
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
                <DocumentTextIcon className={`w-7 h-7 mr-2 ${themeClasses.linkPrimary}`} />
                Activity Sheets
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
            </select>
          </div>

          {/* Activity Sheets List */}
          {isFetching || isRefreshing ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Spinner size="lg" />
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
                            <Badge
                              variant={getStatusBadgeConfig(sheet.status).variant}
                              size="sm"
                            >
                              {getStatusBadgeConfig(sheet.status).label}
                            </Badge>
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
                            <Badge
                              variant={getStatusBadgeConfig(sheet.status).variant}
                              size="sm"
                            >
                              {getStatusBadgeConfig(sheet.status).label}
                            </Badge>
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
                      {PAGE_SIZE_OPTIONS.map((option) => (
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
function AdminOrderDetailActivitySheetListPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminOrderDetailActivitySheetListPage />
    </UIXThemeProvider>
  );
}

export default AdminOrderDetailActivitySheetListPageWithProvider;
