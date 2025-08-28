// File Path: web/workery-frontend/src/pages/Admin/Order/List/Page.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import {
  useOrderManager,
  useAccountManager,
} from "../../../../services/Services";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
} from "../../../../constants/Roles";
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArchiveBoxIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CheckCircleIcon,
  UserIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  HomeIcon,
  InformationCircleIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ChevronLeftIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  ORDER_STATUS_NEW,
  ORDER_STATUS_DECLINED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_ONGOING,
  ORDER_STATUS_IN_PROGRESS,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_ARCHIVED,
  ORDER_TYPE_RESIDENTIAL,
  ORDER_TYPE_COMMERCIAL,
} from "../../../../constants/Order";

// Constants for filtering and sorting
const ORDER_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: String(ORDER_STATUS_NEW), label: "New" },
  { value: String(ORDER_STATUS_DECLINED), label: "Declined" },
  { value: String(ORDER_STATUS_PENDING), label: "Pending" },
  { value: String(ORDER_STATUS_CANCELLED), label: "Cancelled" },
  { value: String(ORDER_STATUS_ONGOING), label: "Ongoing" },
  { value: String(ORDER_STATUS_IN_PROGRESS), label: "In Progress" },
  {
    value: String(ORDER_STATUS_COMPLETED_BUT_UNPAID),
    label: "Completed but unpaid",
  },
  {
    value: String(ORDER_STATUS_COMPLETED_AND_PAID),
    label: "Completed and paid",
  },
  { value: String(ORDER_STATUS_ARCHIVED), label: "Archived" },
];

const ORDER_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: String(ORDER_TYPE_RESIDENTIAL), label: "Residential" },
  { value: String(ORDER_TYPE_COMMERCIAL), label: "Commercial" },
];

const ORDER_SORT_OPTIONS = [
  { value: "created_at,DESC", label: "Date Created (Newest → Oldest)" },
  { value: "created_at,ASC", label: "Date Created (Oldest → Newest)" },
  { value: "start_date,DESC", label: "Start Date (Newest → Oldest)" },
  { value: "start_date,ASC", label: "Start Date (Oldest → Newest)" },
  { value: "customer_name,ASC", label: "Customer Name (A → Z)" },
  { value: "customer_name,DESC", label: "Customer Name (Z → A)" },
];

const PAGE_SIZE_OPTIONS = [
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
  { value: 250, label: "250 per page" },
];

const VIEW_TYPE_TABULAR = "tabular";
const VIEW_TYPE_GRID = "grid";

function AdminOrderListPage() {
  const orderManager = useOrderManager();
  const accountManager = useAccountManager();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [userRole, setUserRole] = useState(null);

  // Pagination state using cursor-based approach
  const [currentCursor, setCurrentCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursorHistory, setCursorHistory] = useState([]);
  const [pageSize, setPageSize] = useState(50);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at,DESC");
  const [viewType, setViewType] = useState(VIEW_TYPE_TABULAR);
  const [showFilters, setShowFilters] = useState(false);

  // Additional order-specific filters
  const [startDateGte, setStartDateGte] = useState("");
  const [startDateLte, setStartDateLte] = useState("");
  const [completionDateGte, setCompletionDateGte] = useState("");
  const [completionDateLte, setCompletionDateLte] = useState("");

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Use refs to track the latest filter values to avoid stale closures
  const filtersRef = useRef({
    searchQuery,
    statusFilter,
    typeFilter,
    sortBy,
    startDateGte,
    startDateLte,
    completionDateGte,
    completionDateLte,
    pageSize,
  });

  // Update refs when filters change
  useEffect(() => {
    filtersRef.current = {
      searchQuery,
      statusFilter,
      typeFilter,
      sortBy,
      startDateGte,
      startDateLte,
      completionDateGte,
      completionDateLte,
      pageSize,
    };
  }, [
    searchQuery,
    statusFilter,
    typeFilter,
    sortBy,
    startDateGte,
    startDateLte,
    completionDateGte,
    completionDateLte,
    pageSize,
  ]);

  // Get user role on component mount
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        // Fetch account details to get the user's role
        const accountDetails = await accountManager.getAccountDetail(
          onUnauthorized,
          false, // don't force refresh, use cache if available
        );

        if (accountDetails && accountDetails.role) {
          // The role field is already a number in the response
          const roleId = accountDetails.role;
          setUserRole(roleId);

          // Debug log in development
          if (process.env.NODE_ENV === "development") {
            console.log("User role fetched:", {
              roleId: roleId,
              isExecutive: roleId === EXECUTIVE_ROLE_ID,
              isManagement: roleId === MANAGEMENT_ROLE_ID,
              canViewFinancials:
                roleId === EXECUTIVE_ROLE_ID || roleId === MANAGEMENT_ROLE_ID,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch user role:", err);
        // If we can't fetch the role, the user won't see the financials button
        // This is a safe fallback - better to not show than to show incorrectly
      }
    };
    fetchUserRole();
  }, [accountManager]);

  // Check if user can view financials (Executive or Management)
  const canViewFinancials =
    userRole === EXECUTIVE_ROLE_ID || userRole === MANAGEMENT_ROLE_ID;

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch orders using the manager
  const fetchOrders = useCallback(
    async (cursor = "", isNavigatingBack = false) => {
      // Get the latest filter values from refs
      const currentFilters = filtersRef.current;

      setLoading(true);
      setError(null);

      // Always clear the cache when fetching with new filters
      if (!isNavigatingBack) {
        orderManager.clearOrdersCache();
      }

      try {
        // Build params using Map for legacy filtersMap approach
        const filtersMap = new Map();

        // Add cursor if provided
        if (cursor) {
          filtersMap.set("cursor", cursor);
        }

        // Add page size
        filtersMap.set("page_size", currentFilters.pageSize.toString());

        // Add sorting
        if (currentFilters.sortBy) {
          const [sortField, sortOrder] = currentFilters.sortBy.split(",");
          filtersMap.set("sort_field", sortField);
          filtersMap.set("sort_order", sortOrder);
        }

        // Add search
        if (currentFilters.searchQuery.trim()) {
          filtersMap.set("search", currentFilters.searchQuery.trim());
        }

        // Add filters
        if (currentFilters.statusFilter) {
          filtersMap.set("status", currentFilters.statusFilter);
        }
        if (currentFilters.typeFilter) {
          filtersMap.set("type", currentFilters.typeFilter);
        }
        if (currentFilters.startDateGte) {
          const date = new Date(currentFilters.startDateGte);
          filtersMap.set("start_date_gte", date.getTime().toString());
        }
        if (currentFilters.startDateLte) {
          const date = new Date(currentFilters.startDateLte);
          filtersMap.set("start_date_lte", date.getTime().toString());
        }
        if (currentFilters.completionDateGte) {
          const date = new Date(currentFilters.completionDateGte);
          filtersMap.set("completion_date_gte", date.getTime().toString());
        }
        if (currentFilters.completionDateLte) {
          const date = new Date(currentFilters.completionDateLte);
          filtersMap.set("completion_date_lte", date.getTime().toString());
        }

        // Use the manager method - always force refresh to avoid cache issues
        const response = await orderManager.getOrdersWithFiltersMap(
          filtersMap,
          onUnauthorized,
          true, // Always force refresh
        );

        setOrders(response.results || []);
        setTotalCount(response.count || 0);

        // Handle pagination response
        if (
          response.nextCursor !== undefined &&
          response.nextCursor !== null &&
          response.nextCursor !== ""
        ) {
          setNextCursor(response.nextCursor);
          setHasNextPage(true);
        } else {
          setNextCursor("");
          setHasNextPage(false);
        }

        // Alternative: Check if hasNextPage is explicitly set
        if (response.hasNextPage !== undefined) {
          setHasNextPage(response.hasNextPage);
        }

        // Update current cursor if not navigating back
        if (!isNavigatingBack) {
          setCurrentCursor(cursor);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Failed to load work orders. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [orderManager, onUnauthorized],
  );

  // Handle search
  const handleSearch = () => {
    setSearchQuery(tempSearchQuery);
    // Reset pagination when searching
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    fetchOrders("");
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle filter changes
  const handleFilterChange = useCallback(() => {
    // Reset pagination when filters change
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    // Clear cache and fetch fresh data
    orderManager.clearOrdersCache();
    fetchOrders("");
  }, [fetchOrders, orderManager]);

  // Pagination handlers
  const handleNextPage = () => {
    if (hasNextPage && nextCursor) {
      // Push current cursor to history for "Previous" functionality
      setCursorHistory((prev) => [...prev, currentCursor]);
      // Fetch next page
      fetchOrders(nextCursor);
    }
  };

  const handlePreviousPage = () => {
    if (cursorHistory.length > 0) {
      // Pop the last cursor from history
      const newHistory = [...cursorHistory];
      const previousCursor = newHistory.pop();
      // Update history
      setCursorHistory(newHistory);
      // Fetch previous page
      fetchOrders(previousCursor || "", true);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    setPageSize(newPageSize);
    // Reset pagination when page size changes
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
  };

  // Effect to refetch when pageSize changes
  useEffect(() => {
    if (pageSize) {
      fetchOrders("");
    }
  }, [pageSize]);

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    // Reset pagination when sort changes
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    setTimeout(() => fetchOrders(""), 0);
  };

  // Handle delete order
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      setLoading(true);
      await orderManager.archiveOrder(orderToDelete.id, onUnauthorized);

      // Refresh the current page
      fetchOrders(currentCursor);

      // Reset delete state
      setShowDeleteModal(false);
      setOrderToDelete(null);
      setSuccessMessage("Work order archived successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to delete order:", err);
      setError("Failed to archive work order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setTempSearchQuery("");
    setStatusFilter("");
    setTypeFilter("");
    setSortBy("created_at,DESC");
    setStartDateGte("");
    setStartDateLte("");
    setCompletionDateGte("");
    setCompletionDateLte("");
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    setShowFilters(false);
    // Clear cache and fetch fresh data
    orderManager.clearOrdersCache();
    fetchOrders("");
  }, [fetchOrders, orderManager]);

  // Initial data load
  useEffect(() => {
    fetchOrders("");
  }, []);

  // Handle success message from navigation state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Clear the state
      window.history.replaceState({}, document.title);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  }, [location]);

  // Format order status for display
  const getOrderStatusDisplay = (status) => {
    const statusNum =
      typeof status === "string" ? parseInt(status, 10) : status;

    switch (statusNum) {
      case ORDER_STATUS_NEW:
        return "New";
      case ORDER_STATUS_DECLINED:
        return "Declined";
      case ORDER_STATUS_PENDING:
        return "Pending";
      case ORDER_STATUS_CANCELLED:
        return "Cancelled";
      case ORDER_STATUS_ONGOING:
        return "Ongoing";
      case ORDER_STATUS_IN_PROGRESS:
        return "In Progress";
      case ORDER_STATUS_COMPLETED_BUT_UNPAID:
        return "Completed (Unpaid)";
      case ORDER_STATUS_COMPLETED_AND_PAID:
        return "Completed (Paid)";
      case ORDER_STATUS_ARCHIVED:
        return "Archived";
      default:
        return "Unknown";
    }
  };

  // Get badge color for status
  const getStatusBadgeColor = (status) => {
    const statusNum =
      typeof status === "string" ? parseInt(status, 10) : status;

    switch (statusNum) {
      case ORDER_STATUS_NEW:
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case ORDER_STATUS_DECLINED:
        return "bg-red-100 text-red-800 border border-red-200";
      case ORDER_STATUS_PENDING:
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case ORDER_STATUS_CANCELLED:
        return "bg-gray-100 text-gray-800 border border-gray-200";
      case ORDER_STATUS_ONGOING:
      case ORDER_STATUS_IN_PROGRESS:
        return "bg-indigo-100 text-indigo-800 border border-indigo-200";
      case ORDER_STATUS_COMPLETED_BUT_UNPAID:
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case ORDER_STATUS_COMPLETED_AND_PAID:
        return "bg-green-100 text-green-800 border border-green-200";
      case ORDER_STATUS_ARCHIVED:
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Format order type for display
  const getOrderTypeDisplay = (type) => {
    const typeNum = typeof type === "string" ? parseInt(type, 10) : type;

    switch (typeNum) {
      case ORDER_TYPE_COMMERCIAL:
        return "Commercial";
      case ORDER_TYPE_RESIDENTIAL:
        return "Residential";
      default:
        return "Unknown";
    }
  };

  // Get badge color for order type
  const getTypeBadgeColor = (orderType) => {
    const typeNum =
      typeof orderType === "string" ? parseInt(orderType, 10) : orderType;

    switch (typeNum) {
      case ORDER_TYPE_COMMERCIAL:
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case ORDER_TYPE_RESIDENTIAL:
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Calculate pagination info
  const hasPreviousPage = cursorHistory.length > 0;
  const currentPageNumber = cursorHistory.length + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md px-1"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                Dashboard
              </Link>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon
                  className="w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
                <span className="ml-1 text-sm font-medium text-black md:ml-2 inline-flex items-center">
                  <ClipboardDocumentListIcon
                    className="w-4 h-4 mr-2"
                    aria-hidden="true"
                  />
                  Work Orders
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black flex items-center">
            <ClipboardDocumentListIcon
              className="w-8 h-8 mr-3 text-blue-600"
              aria-hidden="true"
            />
            Work Orders Management
          </h1>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div
            className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between"
            role="alert"
            aria-live="polite"
          >
            <span className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" aria-hidden="true" />
              {successMessage}
            </span>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-md p-1"
              aria-label="Dismiss success message"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {error && (
          <div
            className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between"
            role="alert"
            aria-live="assertive"
          >
            <span className="flex items-center">
              <ExclamationTriangleIcon
                className="w-5 h-5 mr-2"
                aria-hidden="true"
              />
              {error}
            </span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md p-1"
              aria-label="Dismiss error message"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black flex items-center">
              <ClipboardDocumentListIcon
                className="w-5 h-5 mr-2 text-gray-600"
                aria-hidden="true"
              />
              Order List
            </h2>
            <div className="flex items-center gap-2">
              {/* View Type Toggle */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewType(VIEW_TYPE_TABULAR)}
                  className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
                    viewType === VIEW_TYPE_TABULAR
                      ? "text-blue-600"
                      : "text-black hover:text-gray-600"
                  }`}
                  aria-pressed={viewType === VIEW_TYPE_TABULAR}
                  aria-label="Table view"
                >
                  <TableCellsIcon className="w-6 h-6" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setViewType(VIEW_TYPE_GRID)}
                  className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
                    viewType === VIEW_TYPE_GRID
                      ? "text-blue-600"
                      : "text-black hover:text-gray-600"
                  }`}
                  aria-pressed={viewType === VIEW_TYPE_GRID}
                  aria-label="Grid view"
                >
                  <Squares2X2Icon className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>
              <button
                onClick={() => navigate("/admin/orders/search")}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <MagnifyingGlassIcon
                  className="w-5 h-5 mr-1"
                  aria-hidden="true"
                />
                Advanced Search
              </button>
              <button
                onClick={() => navigate("/admin/orders/add/step-1-search")}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-1" aria-hidden="true" />
                Add Order
              </button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-black flex items-center">
                <FunnelIcon
                  className="w-4 h-4 mr-2 text-gray-600"
                  aria-hidden="true"
                />
                Filter & Search
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`text-sm font-medium flex items-center px-3 py-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    showFilters
                      ? "text-blue-700 bg-blue-50"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  aria-expanded={showFilters}
                  aria-controls="extended-filters"
                >
                  {showFilters ? (
                    <ChevronDownIcon
                      className="w-4 h-4 mr-1"
                      aria-hidden="true"
                    />
                  ) : (
                    <PlusIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                  )}
                  {showFilters ? "Hide" : "Show"} All Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
                >
                  <XMarkIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                  Clear Filters
                </button>
                <button
                  onClick={() => fetchOrders(currentCursor)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
                  aria-label="Refresh order list"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                  Refresh
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-1">
                <label
                  htmlFor="search-input"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Search
                </label>
                <div className="relative">
                  <input
                    id="search-input"
                    type="text"
                    value={tempSearchQuery}
                    onChange={(e) => setTempSearchQuery(e.target.value)}
                    placeholder="Search orders..."
                    className="w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500"
                    onKeyPress={handleSearchKeyPress}
                    aria-label="Search orders"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label="Submit search"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label
                  htmlFor="sort-select"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Sort By
                </label>
                <div className="relative">
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={handleSortChange}
                    className="w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-black"
                    aria-label="Sort orders by"
                  >
                    {ORDER_SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label
                  htmlFor="status-select"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Status
                </label>
                <div className="relative">
                  <select
                    id="status-select"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setTimeout(() => handleFilterChange(), 0);
                    }}
                    className="w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-black"
                    aria-label="Filter by status"
                  >
                    {ORDER_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label
                  htmlFor="type-select"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Type
                </label>
                <div className="relative">
                  <select
                    id="type-select"
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                      setTimeout(() => handleFilterChange(), 0);
                    }}
                    className="w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-black"
                    aria-label="Filter by type"
                  >
                    {ORDER_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <div
                id="extended-filters"
                className="mt-4 p-4 bg-white rounded-lg border border-gray-200"
              >
                <h4 className="text-sm font-medium text-black mb-3">
                  Additional Filters
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="start-date-from"
                      className="block text-sm font-medium text-black mb-1"
                    >
                      Start Date (From)
                    </label>
                    <input
                      id="start-date-from"
                      type="date"
                      value={startDateGte}
                      onChange={(e) => {
                        setStartDateGte(e.target.value);
                        setTimeout(() => handleFilterChange(), 0);
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      aria-label="Filter by start date from"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="start-date-to"
                      className="block text-sm font-medium text-black mb-1"
                    >
                      Start Date (To)
                    </label>
                    <input
                      id="start-date-to"
                      type="date"
                      value={startDateLte}
                      onChange={(e) => {
                        setStartDateLte(e.target.value);
                        setTimeout(() => handleFilterChange(), 0);
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      aria-label="Filter by start date to"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="page-size-select"
                      className="block text-sm font-medium text-black mb-1"
                    >
                      Items per page
                    </label>
                    <div className="relative">
                      <select
                        id="page-size-select"
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-black"
                        aria-label="Number of items per page"
                      >
                        {PAGE_SIZE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="completion-date-from"
                      className="block text-sm font-medium text-black mb-1"
                    >
                      Completion Date (From)
                    </label>
                    <input
                      id="completion-date-from"
                      type="date"
                      value={completionDateGte}
                      onChange={(e) => {
                        setCompletionDateGte(e.target.value);
                        setTimeout(() => handleFilterChange(), 0);
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      aria-label="Filter by completion date from"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="completion-date-to"
                      className="block text-sm font-medium text-black mb-1"
                    >
                      Completion Date (To)
                    </label>
                    <input
                      id="completion-date-to"
                      type="date"
                      value={completionDateLte}
                      onChange={(e) => {
                        setCompletionDateLte(e.target.value);
                        setTimeout(() => handleFilterChange(), 0);
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      aria-label="Filter by completion date to"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="px-6 py-4">
            {loading && !orders.length ? (
              <div
                className="flex items-center justify-center py-12"
                role="status"
                aria-live="polite"
              >
                <div
                  className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
                  aria-hidden="true"
                ></div>
                <span className="ml-3 text-gray-600">
                  Loading work orders...
                </span>
              </div>
            ) : orders.length > 0 ? (
              <>
                {/* Results count */}
                <div className="mb-4 text-sm text-black" aria-live="polite">
                  Showing <strong>{orders.length}</strong> orders
                  {totalCount > 0 && ` of ${totalCount} total`}
                  {searchQuery && ` (filtered by "${searchQuery}")`}
                </div>

                {/* List Display */}
                {viewType === VIEW_TYPE_TABULAR ? (
                  /* Table View */
                  <div
                    className="overflow-x-auto"
                    role="region"
                    aria-label="Orders table"
                  >
                    <table className="min-w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider rounded-tl-lg"
                          >
                            Order #
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                          >
                            Customer
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                          >
                            Associate
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                          >
                            Start Date
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-center text-sm font-medium text-white uppercase tracking-wider rounded-tr-lg"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {orders.map((order, index) => (
                          <tr
                            key={order.id}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-zinc-200"} hover:bg-blue-50 cursor-pointer focus-within:bg-blue-50`}
                            onClick={() => {
                              navigate(
                                `/admin/order/${order.wjid || order.id}`,
                              );
                            }}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                navigate(
                                  `/admin/order/${order.wjid || order.id}`,
                                );
                              }
                            }}
                            role="row"
                            aria-label={`View details for order ${order.wjid || order.id}`}
                          >
                            <td className="px-4 py-4 text-base">
                              <Link
                                to={`/admin/order/${order.wjid || order.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                              >
                                <ClipboardDocumentListIcon
                                  className="w-5 h-5 mr-2 flex-shrink-0"
                                  aria-hidden="true"
                                />
                                <span className="text-lg">
                                  {order.wjid || `#${order.id}`}
                                </span>
                              </Link>
                            </td>
                            <td className="px-4 py-4 text-base text-black">
                              {order.customerName ? (
                                <Link
                                  to={`/admin/customer/${order.customerId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                                >
                                  {order.type === ORDER_TYPE_COMMERCIAL ? (
                                    <BuildingOffice2Icon
                                      className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <HomeIcon
                                      className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0"
                                      aria-hidden="true"
                                    />
                                  )}
                                  <span className="text-lg">
                                    {order.customerName}
                                  </span>
                                </Link>
                              ) : (
                                <span className="text-gray-400 italic text-lg">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-base text-black">
                              {order.associateName ? (
                                <Link
                                  to={`/admin/associate/${order.associateId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                                >
                                  <WrenchScrewdriverIcon
                                    className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0"
                                    aria-hidden="true"
                                  />
                                  <span className="text-lg">
                                    {order.associateName}
                                  </span>
                                </Link>
                              ) : (
                                <span className="text-gray-400 italic text-lg">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-base">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}
                              >
                                {getOrderStatusDisplay(order.status)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-base text-black">
                              {order.startDate ? (
                                <span className="flex items-center text-lg">
                                  <CalendarDaysIcon
                                    className="w-5 h-5 mr-2 text-gray-400"
                                    aria-hidden="true"
                                  />
                                  {formatDateForDisplay(order.startDate)}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic text-lg">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                      `/admin/order/${order.wjid || order.id}`,
                                    );
                                  }}
                                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                  aria-label={`View details for order ${order.wjid || order.id}`}
                                >
                                  <EyeIcon
                                    className="w-4 h-4 mr-1"
                                    aria-hidden="true"
                                  />
                                  View
                                </button>
                                {canViewFinancials && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(
                                        `/admin/financial/${order.wjid || order.id}`,
                                      );
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                    aria-label={`View financials for order ${order.wjid || order.id}`}
                                  >
                                    <CurrencyDollarIcon
                                      className="w-4 h-4 mr-1"
                                      aria-hidden="true"
                                    />
                                    Financials
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Grid View */
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    role="list"
                  >
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white border-2 border-zinc-300 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer focus-within:shadow-md"
                        onClick={() => {
                          navigate(`/admin/order/${order.wjid || order.id}`);
                        }}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigate(`/admin/order/${order.wjid || order.id}`);
                          }
                        }}
                        role="listitem"
                        aria-label={`Order card for ${order.wjid || order.id}`}
                      >
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-black">
                            <Link
                              to={`/admin/order/${order.wjid || order.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 flex items-start focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                            >
                              <ClipboardDocumentListIcon
                                className="w-6 h-6 mr-2 flex-shrink-0 mt-0.5"
                                aria-hidden="true"
                              />
                              <span className="text-xl">
                                Order {order.wjid || `#${order.id}`}
                              </span>
                            </Link>
                          </h3>
                        </div>

                        <div className="space-y-2 text-base text-black mb-4">
                          {order.customerName && (
                            <div className="flex items-center text-lg">
                              <UserIcon
                                className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0"
                                aria-hidden="true"
                              />
                              <span className="truncate">
                                {order.customerName}
                              </span>
                            </div>
                          )}
                          {order.associateName && (
                            <div className="flex items-center text-lg">
                              <WrenchScrewdriverIcon
                                className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0"
                                aria-hidden="true"
                              />
                              <span className="truncate">
                                {order.associateName}
                              </span>
                            </div>
                          )}
                          {order.startDate && (
                            <div className="flex items-center text-lg">
                              <CalendarDaysIcon
                                className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0"
                                aria-hidden="true"
                              />
                              {formatDateForDisplay(order.startDate)}
                            </div>
                          )}
                          {order.description && (
                            <div className="text-sm text-gray-600 mt-2">
                              {order.description.substring(0, 100)}
                              {order.description.length > 100 && "..."}
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}
                          >
                            {getOrderStatusDisplay(order.status)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/admin/order/${order.wjid || order.id}`,
                              );
                            }}
                            className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            aria-label={`View details for order ${order.wjid || order.id}`}
                          >
                            View Details
                            <ChevronRightIcon
                              className="w-4 h-4 ml-1"
                              aria-hidden="true"
                            />
                          </button>
                          {canViewFinancials && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/admin/financial/${order.wjid || order.id}`,
                                );
                              }}
                              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                              aria-label={`View financials for order ${order.wjid || order.id}`}
                            >
                              <CurrencyDollarIcon
                                className="w-4 h-4 mr-1"
                                aria-hidden="true"
                              />
                              View Financials
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                <nav
                  className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4"
                  aria-label="Pagination"
                >
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={handlePreviousPage}
                      disabled={!hasPreviousPage}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Go to previous page"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={!hasNextPage}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Go to next page"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-black" aria-live="polite">
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
                          <span className="ml-2 text-gray-600">
                            ({totalCount} total orders)
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <div
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        role="group"
                      >
                        <button
                          onClick={handlePreviousPage}
                          disabled={!hasPreviousPage}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label="Go to previous page"
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeftIcon
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </button>
                        <span
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-black"
                          aria-current="page"
                        >
                          Page {currentPageNumber}
                        </span>
                        <button
                          onClick={handleNextPage}
                          disabled={!hasNextPage}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label="Go to next page"
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRightIcon
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </nav>
              </>
            ) : (
              /* No Results */
              <div className="text-center py-12">
                <ClipboardDocumentListIcon
                  className="mx-auto h-12 w-12 text-gray-400"
                  aria-hidden="true"
                />
                <h3 className="mt-2 text-sm font-medium text-black">
                  No Work Orders Found
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {searchQuery ||
                  statusFilter ||
                  typeFilter ||
                  startDateGte ||
                  startDateLte ||
                  completionDateGte ||
                  completionDateLte
                    ? "No orders match your current filters. Try adjusting your search criteria."
                    : "No work orders have been created yet."}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  {(searchQuery ||
                    statusFilter ||
                    typeFilter ||
                    startDateGte ||
                    startDateLte ||
                    completionDateGte ||
                    completionDateLte) && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/admin/orders/add/step-1-search")}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                    Add First Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && orderToDelete && (
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div
              className="bg-white rounded-lg max-w-md w-full"
              role="document"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3
                  id="delete-modal-title"
                  className="text-lg font-semibold text-black flex items-center"
                >
                  <ExclamationTriangleIcon
                    className="w-5 h-5 mr-2 text-amber-600"
                    aria-hidden="true"
                  />
                  Archive Work Order
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-black mb-4">
                  Are you sure you want to archive this work order? It will no
                  longer appear in active lists.
                </p>

                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                  <p className="text-sm font-medium text-black mb-1">
                    <strong>Order:</strong>{" "}
                    {orderToDelete.wjid || `#${orderToDelete.id}`}
                  </p>
                  {orderToDelete.customerName && (
                    <p className="text-sm text-black mt-1">
                      <strong>Customer:</strong> {orderToDelete.customerName}
                    </p>
                  )}
                  <p className="text-sm text-black mt-1">
                    <strong>Status:</strong>{" "}
                    {getOrderStatusDisplay(orderToDelete.status)}
                  </p>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 flex items-start">
                    <InformationCircleIcon
                      className="w-4 h-4 mr-1 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      <strong>Note:</strong> This action can be undone by a
                      system administrator. The order data will be preserved.
                    </span>
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setOrderToDelete(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteOrder}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
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
                      Archiving...
                    </>
                  ) : (
                    <>
                      <ArchiveBoxIcon
                        className="w-4 h-4 mr-2"
                        aria-hidden="true"
                      />
                      Archive Order
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

export default AdminOrderListPage;
