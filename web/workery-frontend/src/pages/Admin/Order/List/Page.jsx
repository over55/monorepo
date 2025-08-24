// File Path: web/workery-frontend/src/pages/Admin/Order/List/Page.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useOrderManager, useAuthManager } from "../../../../services/Services";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArchiveBoxIcon,
  PencilSquareIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CheckCircleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  HomeIcon,
  InformationCircleIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ChevronLeftIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
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
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
        return "bg-blue-100 text-blue-800";
      case ORDER_STATUS_DECLINED:
        return "bg-red-100 text-red-800";
      case ORDER_STATUS_PENDING:
        return "bg-yellow-100 text-yellow-800";
      case ORDER_STATUS_CANCELLED:
        return "bg-gray-100 text-gray-800";
      case ORDER_STATUS_ONGOING:
      case ORDER_STATUS_IN_PROGRESS:
        return "bg-indigo-100 text-indigo-800";
      case ORDER_STATUS_COMPLETED_BUT_UNPAID:
        return "bg-orange-100 text-orange-800";
      case ORDER_STATUS_COMPLETED_AND_PAID:
        return "bg-green-100 text-green-800";
      case ORDER_STATUS_ARCHIVED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        return "bg-blue-100 text-blue-800";
      case ORDER_TYPE_RESIDENTIAL:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                  Work Orders
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ClipboardDocumentListIcon className="w-8 h-8 mr-3 text-blue-600" />
            Work Orders Management
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
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
              Order List
            </h2>
            <div className="flex items-center gap-2">
              {/* View Type Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewType(VIEW_TYPE_TABULAR)}
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewType === VIEW_TYPE_TABULAR
                      ? "bg-white text-gray-900 shadow-sm"
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
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Squares2X2Icon className="w-4 h-4 mr-1.5" />
                  Grid
                </button>
              </div>
              <button
                onClick={() => navigate("/admin/orders/search")}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <MagnifyingGlassIcon className="w-5 h-5 mr-1" />
                Advanced Search
              </button>
              <button
                onClick={() => navigate("/admin/orders/add/step-1-search")}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-1" />
                Add Order
              </button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <FunnelIcon className="w-4 h-4 mr-2" />
                Filter & Search
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`text-sm font-medium flex items-center px-3 py-1 rounded-md transition-colors ${
                    showFilters
                      ? "text-blue-700 bg-blue-50"
                      : "text-gray-600 hover:text-gray-800"
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
                  onClick={() => fetchOrders(currentCursor)}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tempSearchQuery}
                    onChange={(e) => setTempSearchQuery(e.target.value)}
                    placeholder="Search orders..."
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    {ORDER_SORT_OPTIONS.map((option) => (
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setTimeout(() => handleFilterChange(), 0);
                    }}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    {ORDER_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                      setTimeout(() => handleFilterChange(), 0);
                    }}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    {ORDER_TYPE_OPTIONS.map((option) => (
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
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Additional Filters
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date (From)
                    </label>
                    <input
                      type="date"
                      value={startDateGte}
                      onChange={(e) => {
                        setStartDateGte(e.target.value);
                        setTimeout(() => handleFilterChange(), 0);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date (To)
                    </label>
                    <input
                      type="date"
                      value={startDateLte}
                      onChange={(e) => {
                        setStartDateLte(e.target.value);
                        setTimeout(() => handleFilterChange(), 0);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Items per page
                    </label>
                    <div className="relative">
                      <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Completion Date (From)
                    </label>
                    <input
                      type="date"
                      value={completionDateGte}
                      onChange={(e) => {
                        setCompletionDateGte(e.target.value);
                        setTimeout(() => handleFilterChange(), 0);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Completion Date (To)
                    </label>
                    <input
                      type="date"
                      value={completionDateLte}
                      onChange={(e) => {
                        setCompletionDateLte(e.target.value);
                        setTimeout(() => handleFilterChange(), 0);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="px-6 py-4">
            {loading && !orders.length ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Loading work orders...
                </span>
              </div>
            ) : orders.length > 0 ? (
              <>
                {/* Results count */}
                <div className="mb-4 text-sm text-gray-600">
                  Showing <strong>{orders.length}</strong> orders
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
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order #
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Associate
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Start Date
                          </th>
                          <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr
                            key={order.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailModal(true);
                            }}
                          >
                            <td className="px-3 py-4 text-sm">
                              <Link
                                to={`/admin/order/${order.wjid || order.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                              >
                                <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                                {order.wjid || `#${order.id}`}
                              </Link>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              {order.customerName ? (
                                <Link
                                  to={`/admin/customer/${order.customerId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center hover:text-blue-600"
                                >
                                  {order.type === ORDER_TYPE_COMMERCIAL ? (
                                    <BuildingOffice2Icon className="w-4 h-4 mr-2" />
                                  ) : (
                                    <HomeIcon className="w-4 h-4 mr-2" />
                                  )}
                                  {order.customerName}
                                </Link>
                              ) : (
                                <span className="text-gray-400 italic">—</span>
                              )}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              {order.associateName ? (
                                <Link
                                  to={`/admin/associate/${order.associateId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center hover:text-blue-600"
                                >
                                  <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                                  {order.associateName}
                                </Link>
                              ) : (
                                <span className="text-gray-400 italic">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-4 text-sm">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(order.type)}`}
                              >
                                {getOrderTypeDisplay(order.type)}
                              </span>
                            </td>
                            <td className="px-3 py-4 text-sm">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}
                              >
                                {getOrderStatusDisplay(order.status)}
                              </span>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              {order.startDate ? (
                                <span className="flex items-center">
                                  <CalendarDaysIcon className="w-4 h-4 mr-2" />
                                  {formatDateForDisplay(order.startDate)}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">—</span>
                              )}
                            </td>
                            <td className="px-3 py-4">
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                      `/admin/order/${order.wjid || order.id}`,
                                    );
                                  }}
                                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                  <EyeIcon className="w-4 h-4 mr-1.5" />
                                  View
                                </button>
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
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailModal(true);
                        }}
                      >
                        <div className="mb-3">
                          <h3 className="text-base font-semibold text-gray-900">
                            <Link
                              to={`/admin/order/${order.wjid || order.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 flex items-start"
                            >
                              <ClipboardDocumentListIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                              <span>Order {order.wjid || `#${order.id}`}</span>
                            </Link>
                          </h3>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-3">
                          {order.customerName && (
                            <div className="flex items-center">
                              <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="truncate">
                                {order.customerName}
                              </span>
                            </div>
                          )}
                          {order.associateName && (
                            <div className="flex items-center">
                              <WrenchScrewdriverIcon className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="truncate">
                                {order.associateName}
                              </span>
                            </div>
                          )}
                          {order.startDate && (
                            <div className="flex items-center">
                              <CalendarDaysIcon className="w-4 h-4 mr-2 text-gray-400" />
                              {formatDateForDisplay(order.startDate)}
                            </div>
                          )}
                          {order.description && (
                            <div className="text-xs text-gray-500">
                              {order.description.substring(0, 100)}
                              {order.description.length > 100 && "..."}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(order.type)}`}
                          >
                            {order.type === ORDER_TYPE_COMMERCIAL ? (
                              <BuildingOffice2Icon className="w-3 h-3 mr-1" />
                            ) : (
                              <HomeIcon className="w-3 h-3 mr-1" />
                            )}
                            {getOrderTypeDisplay(order.type)}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}
                          >
                            {getOrderStatusDisplay(order.status)}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/order/${order.wjid || order.id}`);
                          }}
                          className="w-full inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          View Details
                          <ChevronRightIcon className="w-4 h-4 ml-1" />
                        </button>
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
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={!hasNextPage}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
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
                          <span className="ml-2 text-gray-500">
                            ({totalCount} total orders)
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
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No Work Orders Found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
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
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/admin/orders/add/step-1-search")}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add First Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Order Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="px-6 py-4 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Number:
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-base font-semibold text-gray-900 flex items-center">
                      <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-gray-600" />
                      {selectedOrder.wjid || `#${selectedOrder.id}`}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        {selectedOrder.customerName ? (
                          <Link
                            to={`/admin/customer/${selectedOrder.customerId}`}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <UserIcon className="w-4 h-4 mr-2" />
                            {selectedOrder.customerName}
                          </Link>
                        ) : (
                          <span className="text-gray-400 italic">
                            Not assigned
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Associate:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        {selectedOrder.associateName ? (
                          <Link
                            to={`/admin/associate/${selectedOrder.associateId}`}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                            {selectedOrder.associateName}
                          </Link>
                        ) : (
                          <span className="text-gray-400 italic">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(selectedOrder.status)}`}
                        >
                          {getOrderStatusDisplay(selectedOrder.status)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeBadgeColor(selectedOrder.type)}`}
                        >
                          {selectedOrder.type === ORDER_TYPE_COMMERCIAL ? (
                            <BuildingOffice2Icon className="w-4 h-4 mr-1" />
                          ) : (
                            <HomeIcon className="w-4 h-4 mr-1" />
                          )}
                          {getOrderTypeDisplay(selectedOrder.type)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        {selectedOrder.startDate ? (
                          <span className="flex items-center">
                            <CalendarDaysIcon className="w-4 h-4 mr-2" />
                            {formatDateForDisplay(selectedOrder.startDate)}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Not set</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Completion Date:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        {selectedOrder.completionDate ? (
                          <span className="flex items-center">
                            <CalendarDaysIcon className="w-4 h-4 mr-2" />
                            {formatDateForDisplay(selectedOrder.completionDate)}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">
                            Not completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedOrder.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        {selectedOrder.description}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(
                      `/admin/order/${selectedOrder.wjid || selectedOrder.id}/edit`,
                    );
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600"
                >
                  <PencilSquareIcon className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(
                      `/admin/order/${selectedOrder.wjid || selectedOrder.id}`,
                    );
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && orderToDelete && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-amber-600" />
                  Archive Work Order
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to archive this work order? It will no
                  longer appear in active lists.
                </p>

                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    <strong>Order:</strong>{" "}
                    {orderToDelete.wjid || `#${orderToDelete.id}`}
                  </p>
                  {orderToDelete.customerName && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Customer:</strong> {orderToDelete.customerName}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Status:</strong>{" "}
                    {getOrderStatusDisplay(orderToDelete.status)}
                  </p>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 flex items-start">
                    <InformationCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteOrder}
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
                      Archiving...
                    </>
                  ) : (
                    <>
                      <ArchiveBoxIcon className="w-4 h-4 mr-2" />
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
