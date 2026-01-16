// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/Order/List/Page.jsx
// UIX Upgraded - Uses DetailLiteView whole page component
// @uix-page: DetailLiteView

import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  DetailLiteView,
  Button,
  Card,
  Badge,
  Spinner,
  UIXThemeProvider,
  useUIXTheme,
  ViewButton,
  CreateButton,
} from "../../../../../../components/UIX";
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
  ChevronRightIcon,
  HomeIcon,
  BuildingOfficeIcon,
  QuestionMarkCircleIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  UserIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import {
  useOrderManager,
  useCustomerManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { formatDateForDisplay } from "../../../../../../services/Helpers/DateFormatter";
import { CUSTOMER_STATUS_ARCHIVED } from "../../../../../../constants/Customer";

// Order status mappings
const ORDER_STATUS_OPTIONS = Object.freeze({
  1: { label: "New", variant: "info" },
  2: { label: "Declined", variant: "danger" },
  3: { label: "Pending", variant: "warning" },
  4: { label: "Cancelled", variant: "secondary" },
  5: { label: "Ongoing", variant: "info" },
  6: { label: "In Progress", variant: "info" },
  7: { label: "Completed (Unpaid)", variant: "warning" },
  8: { label: "Completed (Paid)", variant: "success" },
  9: { label: "Archived", variant: "secondary" },
});

// Order type mappings
const ORDER_TYPE_OPTIONS = Object.freeze({
  0: { label: "-", icon: null },
  1: { label: "Residential", icon: HomeIcon },
  2: { label: "Commercial", icon: BuildingOfficeIcon },
  3: { label: "Unassigned", icon: QuestionMarkCircleIcon },
});

// Static sort options
const SORT_OPTIONS = Object.freeze([
  { value: "created_at,DESC", label: "Created Date (Newest)" },
  { value: "created_at,ASC", label: "Created Date (Oldest)" },
  { value: "assignment_date,DESC", label: "Assignment Date (Newest)" },
  { value: "assignment_date,ASC", label: "Assignment Date (Oldest)" },
  { value: "start_date,DESC", label: "Start Date (Newest)" },
  { value: "start_date,ASC", label: "Start Date (Oldest)" },
]);

// Static page size options
const PAGE_SIZE_OPTIONS = Object.freeze([
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
]);

// Order Row Component
const OrderRow = memo(function OrderRow({ order, formatType, formatStatus }) {
  const { getThemeClasses } = useUIXTheme();

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatType(order.type)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
        {order.wjid}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {order.associateId &&
        order.associateId !== "" &&
        order.associateId !== "000000000000000000000000" ? (
          <Link
            to={`/admin/associate/${order.associateId}`}
            target="_blank"
            rel="noreferrer"
            className={`${getThemeClasses("link-primary")} inline-flex items-center`}
          >
            {order.associateName}
            <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
          </Link>
        ) : (
          "-"
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {order.associateId &&
        order.associateId !== "" &&
        order.associateId !== "000000000000000000000000"
          ? formatDateForDisplay(order.assignmentDate) || "-"
          : "-"}
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
          className={`${getThemeClasses("link-primary")} inline-flex items-center`}
        >
          View
          <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
        </Link>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <ViewButton to={`/admin/order/${order.wjid}`} text="View" size="sm" />
      </td>
    </tr>
  );
});

// Order Card Component (Mobile)
const OrderCard = memo(function OrderCard({ order, formatType, formatStatus }) {
  const { getThemeClasses } = useUIXTheme();

  return (
    <Card padding="p-4" className="mb-4">
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-gray-500">Type:</span>{" "}
            {formatType(order.type)}
          </div>
          {formatStatus(order.status)}
        </div>
        <div>
          <span className="text-gray-500">Job #:</span>{" "}
          <span className="font-mono font-semibold">{order.wjid}</span>
        </div>
        <div>
          <span className="text-gray-500">Associate:</span>{" "}
          {order.associateId &&
          order.associateId !== "" &&
          order.associateId !== "000000000000000000000000" ? (
            <Link
              to={`/admin/associate/${order.associateId}`}
              target="_blank"
              rel="noreferrer"
              className={`${getThemeClasses("link-primary")} inline-flex items-center`}
            >
              {order.associateName}
              <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
            </Link>
          ) : (
            "-"
          )}
        </div>
        <div>
          <span className="text-gray-500">Start:</span>{" "}
          {formatDateForDisplay(order.startDate) || "-"}
        </div>
        <div>
          <span className="text-gray-500">Completion:</span>{" "}
          {formatDateForDisplay(order.completionDate) || "-"}
        </div>
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <ViewButton to={`/admin/order/${order.wjid}`} text="View Order" className="flex-1" />
          <Link
            to={`/admin/financial/${order.wjid}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1"
          >
            <Button variant="outline" size="sm" className="w-full">
              Financial
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
});

// Main Component
const AdminCustomerDetailOrderListPage = memo(function AdminCustomerDetailOrderListPage() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const orderManager = useOrderManager();
  const customerManager = useCustomerManager();
  const authManager = useAuthManager();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [orderList, setOrderList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Pagination state
  const [currentCursor, setCurrentCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursorHistory, setCursorHistory] = useState([]);
  const [pageSize, setPageSize] = useState(50);

  // Filter state
  const [sortByValue, setSortByValue] = useState("created_at,DESC");
  const [status, setStatus] = useState(0);

  // Refs for stale closure prevention
  const filtersRef = useRef({ sortByValue, status, pageSize });
  const isMountedRef = useRef(true);

  // Update refs when filters change
  useEffect(() => {
    filtersRef.current = { sortByValue, status, pageSize };
  }, [sortByValue, status, pageSize]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memoized unauthorized handler
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Format type helper
  const formatType = useCallback((typeValue) => {
    const type = ORDER_TYPE_OPTIONS[typeValue];
    if (!type) return <span>Unknown</span>;
    const IconComponent = type.icon;
    return (
      <span className="flex items-center">
        {IconComponent && <IconComponent className="w-4 h-4 mr-1" />}
        {type.label}
      </span>
    );
  }, []);

  // Format status helper
  const formatStatus = useCallback((statusValue) => {
    const statusOption = ORDER_STATUS_OPTIONS[statusValue];
    if (!statusOption) return <Badge variant="secondary" size="sm">Unknown</Badge>;
    return (
      <Badge variant={statusOption.variant} size="sm">
        {statusOption.label}
      </Badge>
    );
  }, []);

  // Format time ago
  const formatTimeAgo = useCallback((date) => {
    if (!date) return "";
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }, []);

  // Fetch customer details
  const fetchCustomerDetail = useCallback(async () => {
    try {
      const data = await customerManager.getCustomerDetail(cid, onUnauthorized);
      if (isMountedRef.current) {
        setCustomer(data);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setErrors(error);
      }
    }
  }, [cid, customerManager, onUnauthorized]);

  // Fetch order list
  const fetchOrderList = useCallback(
    async (cursor = "", isNavigatingBack = false) => {
      const currentFilters = filtersRef.current;

      setFetching(true);
      setErrors({});

      if (!isNavigatingBack) {
        orderManager.clearOrdersCache();
      }

      try {
        const filtersMap = new Map();
        if (cursor) filtersMap.set("cursor", cursor);
        filtersMap.set("page_size", currentFilters.pageSize.toString());
        filtersMap.set("customerId", cid);

        const sortArray = currentFilters.sortByValue.split(",");
        filtersMap.set("sortField", sortArray[0]);
        filtersMap.set("sortOrder", sortArray[1]);

        if (currentFilters.status !== 0) {
          filtersMap.set("status", currentFilters.status.toString());
        }

        const data = await orderManager.getOrdersWithFiltersMap(
          filtersMap,
          onUnauthorized,
          true,
        );

        if (!isMountedRef.current) return;

        setOrderList(data.results || []);
        setTotalCount(data.count || 0);

        if (data.nextCursor) {
          setNextCursor(data.nextCursor);
          setHasNextPage(true);
        } else {
          setNextCursor("");
          setHasNextPage(false);
        }

        if (data.hasNextPage !== undefined) {
          setHasNextPage(data.hasNextPage);
        }

        if (!isNavigatingBack) {
          setCurrentCursor(cursor);
        }

        setLastFetchTime(new Date());
      } catch (error) {
        if (isMountedRef.current) {
          setErrors(error);
        }
      } finally {
        if (isMountedRef.current) {
          setFetching(false);
          setRefreshing(false);
        }
      }
    },
    [cid, orderManager, onUnauthorized],
  );

  // Apply filters and reset pagination
  const applyFilters = useCallback(() => {
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    orderManager.clearOrdersCache();
    fetchOrderList("");
  }, [fetchOrderList, orderManager]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    applyFilters();
  }, [applyFilters]);

  // Pagination handlers
  const handleNextPage = useCallback(() => {
    if (hasNextPage && nextCursor) {
      setCursorHistory((prev) => [...prev, currentCursor]);
      fetchOrderList(nextCursor);
    }
  }, [hasNextPage, nextCursor, currentCursor, fetchOrderList]);

  const handlePreviousPage = useCallback(() => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      const previousCursor = newHistory.pop();
      setCursorHistory(newHistory);
      fetchOrderList(previousCursor || "", true);
    }
  }, [cursorHistory, fetchOrderList]);

  // Filter change handlers
  const handleStatusFilterChange = useCallback((e) => {
    setStatus(parseInt(e.target.value));
    setTimeout(() => applyFilters(), 0);
  }, [applyFilters]);

  const handleSortChange = useCallback((e) => {
    setSortByValue(e.target.value);
    setTimeout(() => applyFilters(), 0);
  }, [applyFilters]);

  const handlePageSizeChange = useCallback((e) => {
    setPageSize(parseInt(e.target.value));
    setTimeout(() => applyFilters(), 0);
  }, [applyFilters]);

  // Check authentication
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
    }
  }, [authManager, navigate]);

  // Initial load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCustomerDetail();
    orderManager.clearOrdersCache();
  }, [cid, fetchCustomerDetail, orderManager]);

  // Fetch orders after customer loads
  useEffect(() => {
    if (cid && authManager.isAuthenticated()) {
      fetchOrderList("");
    }
  }, [cid, authManager, fetchOrderList]);

  // Build breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Customers", to: "/admin/customers", icon: UserGroupIcon },
      { label: "Detail", icon: InformationCircleIcon, isActive: true },
    ],
    [],
  );

  // Build header config
  const headerConfig = useMemo(
    () => ({
      title: customer
        ? `${customer.firstName} ${customer.lastName}`
        : "Customer",
      subtitle: "View and manage customer orders",
      icon: UserIcon,
    }),
    [customer],
  );

  // Build tab items
  const tabItems = useMemo(
    () => [
      { label: "Summary", to: `/admin/customer/${cid}` },
      { label: "Detail", to: `/admin/customer/${cid}/detail` },
      { label: "Orders", to: `/admin/customer/${cid}/orders`, isActive: true },
      { label: "Comments", to: `/admin/customer/${cid}/comments` },
      { label: "Attachments", to: `/admin/customer/${cid}/attachments` },
      { label: "More", to: `/admin/customer/${cid}/more`, icon: EllipsisHorizontalIcon },
    ],
    [cid],
  );

  // Build alerts
  const alerts = useMemo(() => {
    const alertsList = {};
    if (customer?.status === CUSTOMER_STATUS_ARCHIVED) {
      alertsList.archived = {
        type: "info",
        message: "This customer is archived",
        icon: ArchiveBoxIcon,
      };
    }
    if (customer?.isBanned) {
      alertsList.banned = {
        type: "error",
        message: "This customer is banned",
        icon: BellAlertIcon,
      };
    }
    return alertsList;
  }, [customer]);

  // Build action buttons
  const actionButtons = useMemo(() => {
    if (!customer) return [];
    return [
      {
        label: "New Order",
        variant: "success",
        icon: PlusIcon,
        href: `/admin/orders/add/step-2-from-launchpad?id=${cid}&fn=${customer.firstName}&ln=${customer.lastName}`,
        target: "_blank",
      },
    ];
  }, [customer, cid]);

  // Calculate pagination info
  const hasPreviousPage = cursorHistory.length > 0;
  const currentPageNumber = cursorHistory.length + 1;

  // Build field sections with orders content
  const fieldSections = useMemo(() => {
    return [
      {
        column: "primary",
        className: "mb-0",
        component: (
          <div>
            {/* Header with title and refresh */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-4">
                <h2 className={`text-xl font-semibold ${getThemeClasses("text-primary")} flex items-center`}>
                  <WrenchScrewdriverIcon className={`w-6 h-6 mr-2 ${getThemeClasses("text-accent")}`} />
                  Orders
                </h2>
                {lastFetchTime && (
                  <span className={`text-sm ${getThemeClasses("text-muted")} flex items-center`}>
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {formatTimeAgo(lastFetchTime)}
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing || isFetching}
                loading={isRefreshing}
                icon={ArrowPathIcon}
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className={`block text-sm font-medium ${getThemeClasses("text-secondary")} mb-2`}>
                  Status Filter:
                </label>
                <select
                  value={status}
                  onChange={handleStatusFilterChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>All Statuses</option>
                  {Object.entries(ORDER_STATUS_OPTIONS).map(([value, option]) => (
                    <option key={value} value={value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${getThemeClasses("text-secondary")} mb-2`}>
                  Sort By:
                </label>
                <select
                  value={sortByValue}
                  onChange={handleSortChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${getThemeClasses("text-secondary")} mb-2`}>
                  Items per page:
                </label>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className={`mb-6 ${getThemeClasses("text-secondary")}`}>
              Showing{" "}
              <strong className={getThemeClasses("text-primary")}>
                {orderList.length}
              </strong>{" "}
              orders
              {totalCount > 0 && ` (Total: ${totalCount})`}
              {status !== 0 && " (filtered by status)"}
            </div>

            {/* Orders Content */}
            {isFetching || isRefreshing ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className="mt-4 text-gray-600">
                    {isRefreshing ? "Refreshing orders..." : "Loading orders..."}
                  </p>
                </div>
              </div>
            ) : orderList.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Associate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Financial</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orderList.map((order, index) => (
                        <OrderRow
                          key={order.wjid || index}
                          order={order}
                          formatType={formatType}
                          formatStatus={formatStatus}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden">
                  {orderList.map((order, index) => (
                    <OrderCard
                      key={order.wjid || index}
                      order={order}
                      formatType={formatType}
                      formatStatus={formatStatus}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {(hasPreviousPage || hasNextPage) && (
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
                    <div className="flex items-center text-sm text-gray-700">
                      Page {currentPageNumber}
                      {totalCount > 0 && (
                        <span className="ml-2 text-gray-500">(Total: {totalCount} orders)</span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={!hasPreviousPage}
                        icon={ChevronLeftIcon}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={!hasNextPage}
                      >
                        Next
                        <ChevronRightIcon className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <WrenchScrewdriverIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className={`text-lg font-medium ${getThemeClasses("text-primary")} mb-2`}>
                  No Orders Found
                </h3>
                <p className="text-gray-500 mb-6">
                  {status !== 0
                    ? "No orders match the selected status filter."
                    : "No orders found for this customer."}
                </p>
                {customer && (
                  <CreateButton
                    href={`/admin/orders/add/step-2-from-launchpad?id=${cid}&fn=${customer.firstName}&ln=${customer.lastName}`}
                    target="_blank"
                    icon={PlusIcon}
                  >
                    Create First Order
                  </CreateButton>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/customers")}
                icon={ChevronLeftIcon}
              >
                Back to Customers
              </Button>
              {customer && (
                <CreateButton
                  href={`/admin/orders/add/step-2-from-launchpad?id=${cid}&fn=${customer.firstName}&ln=${customer.lastName}`}
                  target="_blank"
                  icon={PlusIcon}
                >
                  New Order
                </CreateButton>
              )}
            </div>
          </div>
        ),
      },
    ];
  }, [
    orderList,
    totalCount,
    isFetching,
    isRefreshing,
    lastFetchTime,
    status,
    sortByValue,
    pageSize,
    hasPreviousPage,
    hasNextPage,
    currentPageNumber,
    customer,
    cid,
    getThemeClasses,
    formatTimeAgo,
    formatType,
    formatStatus,
    handleRefresh,
    handleStatusFilterChange,
    handleSortChange,
    handlePageSizeChange,
    handlePreviousPage,
    handleNextPage,
    navigate,
  ]);

  // Error close handler
  const handleErrorClose = useCallback(() => {
    setErrors({});
  }, []);

  // Loading state
  if (isFetching && !customer) {
    return (
      <UIXThemeProvider>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" />
          </div>
        </div>
      </UIXThemeProvider>
    );
  }

  return (
    <UIXThemeProvider>
      <DetailLiteView
        entityData={customer}
        breadcrumbItems={breadcrumbItems}
        headerConfig={headerConfig}
        fieldSections={fieldSections}
        actionButtons={actionButtons}
        tabs={tabItems}
        alerts={alerts}
        onUnauthorized={onUnauthorized}
        isLoading={isFetching && !customer}
        error={errors?.message}
        onErrorClose={handleErrorClose}
      />
    </UIXThemeProvider>
  );
});

export default AdminCustomerDetailOrderListPage;
