// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/List/Page.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useOrderManager, useAuthManager } from "../../../../services/Services";
import {
  CurrencyDollarIcon,
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
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  BanknotesIcon,
  HomeIcon,
  BuildingOffice2Icon,
  DocumentDuplicateIcon,
  InformationCircleIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
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
  ORDER_TYPE_UNASSIGNED,
  ORDER_TYPE_RESIDENTIAL,
  ORDER_TYPE_COMMERCIAL,
} from "../../../../constants/Order";
import {
  PAGE_SIZE_OPTIONS,
  ORDER_SORT_OPTIONS,
  ORDER_STATUS_FILTER_OPTIONS,
  ORDER_TYPE_FILTER_OPTIONS,
  DEFAULT_ORDER_LIST_SORT_BY_VALUE,
} from "../../../../constants/FieldOptions";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";

const VIEW_TYPE_TABULAR = "tabular";
const VIEW_TYPE_GRID = "grid";

function AdminFinancialListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();

  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  // Pagination state using cursor-based approach
  const [currentCursor, setCurrentCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursorHistory, setCursorHistory] = useState([]);
  const [pageSize, setPageSize] = useState(50);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(0);
  const [typeFilter, setTypeFilter] = useState(0);
  const [sortBy, setSortBy] = useState(DEFAULT_ORDER_LIST_SORT_BY_VALUE);
  const [viewType, setViewType] = useState(VIEW_TYPE_TABULAR);
  const [showFilters, setShowFilters] = useState(false);

  // Additional filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch orders using the manager
  const fetchOrders = useCallback(
    async (cursor = "", isNavigatingBack = false) => {
      setLoading(true);
      setError(null);

      try {
        // Build params using Map for legacy filtersMap approach
        const filtersMap = new Map();

        // Add cursor if provided
        if (cursor) {
          filtersMap.set("cursor", cursor);
        }

        // Use the correct parameter name for page size
        filtersMap.set("page_size", pageSize.toString());

        // Add sorting
        if (sortBy) {
          const [sortField, sortOrder] = sortBy.split(",");
          filtersMap.set("sort_field", sortField);
          filtersMap.set("sort_order", sortOrder === "DESC" ? "-1" : "1");
        }

        // Add search
        if (searchQuery.trim()) {
          filtersMap.set("search", searchQuery.trim());
        }

        // Add filters only if not 0 (All)
        if (statusFilter !== 0) {
          filtersMap.set("status", statusFilter.toString());
        }
        if (typeFilter !== 0) {
          filtersMap.set("type", typeFilter.toString());
        }

        // Add date filters if provided
        if (startDate) {
          const date = new Date(startDate);
          filtersMap.set("start_date", date.getTime().toString());
        }
        if (endDate) {
          const date = new Date(endDate);
          filtersMap.set("end_date", date.getTime().toString());
        }

        // Use the manager method
        const response = await orderManager.getOrdersWithFiltersMap(
          filtersMap,
          onUnauthorized,
          true, // force refresh
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
        setError("Failed to load financial records. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [
      pageSize,
      sortBy,
      searchQuery,
      statusFilter,
      typeFilter,
      startDate,
      endDate,
      orderManager,
      onUnauthorized,
    ],
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
    fetchOrders("");
  }, [fetchOrders]);

  // Pagination handlers
  const handleNextPage = () => {
    if (hasNextPage && nextCursor) {
      setCursorHistory((prev) => [...prev, currentCursor]);
      fetchOrders(nextCursor);
    }
  };

  const handlePreviousPage = () => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      const previousCursor = newHistory.pop();
      setCursorHistory(newHistory);
      fetchOrders(previousCursor || "", true);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    setPageSize(newPageSize);
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
      setSuccessMessage("Order archived successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to archive order:", err);
      setError("Failed to archive order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setTempSearchQuery("");
    setStatusFilter(0);
    setTypeFilter(0);
    setSortBy(DEFAULT_ORDER_LIST_SORT_BY_VALUE);
    setStartDate("");
    setEndDate("");
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    setShowFilters(false);
    fetchOrders("");
  }, [fetchOrders]);

  // Initial data load
  useEffect(() => {
    fetchOrders("");
  }, []);

  // Handle success message from navigation state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  }, [location]);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatStatus = (statusValue) => {
    switch (statusValue) {
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
        return "Completed but Unpaid";
      case ORDER_STATUS_COMPLETED_AND_PAID:
        return "Completed and Paid";
      case ORDER_STATUS_ARCHIVED:
        return "Archived";
      default:
        return `Unknown (${statusValue})`;
    }
  };

  const formatType = (typeValue) => {
    switch (typeValue) {
      case ORDER_TYPE_UNASSIGNED:
        return "Unassigned";
      case ORDER_TYPE_RESIDENTIAL:
        return "Residential";
      case ORDER_TYPE_COMMERCIAL:
        return "Commercial";
      default:
        return `Unknown (${typeValue})`;
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case ORDER_TYPE_COMMERCIAL:
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case ORDER_TYPE_RESIDENTIAL:
        return "bg-green-100 text-green-800 border border-green-200";
      case ORDER_TYPE_UNASSIGNED:
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case ORDER_STATUS_NEW:
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case ORDER_STATUS_PENDING:
      case ORDER_STATUS_ONGOING:
      case ORDER_STATUS_IN_PROGRESS:
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case ORDER_STATUS_COMPLETED_AND_PAID:
        return "bg-green-100 text-green-800 border border-green-200";
      case ORDER_STATUS_COMPLETED_BUT_UNPAID:
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case ORDER_STATUS_DECLINED:
      case ORDER_STATUS_CANCELLED:
      case ORDER_STATUS_ARCHIVED:
        return "bg-red-100 text-red-800 border border-red-200";
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
                  <CurrencyDollarIcon
                    className="w-4 h-4 mr-2"
                    aria-hidden="true"
                  />
                  Financials
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black flex items-center">
            <CurrencyDollarIcon
              className="w-8 h-8 mr-3 text-blue-600"
              aria-hidden="true"
            />
            Financial Management
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
              Financial Records
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
                  aria-label="Refresh orders list"
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
                      setStatusFilter(parseInt(e.target.value));
                      setTimeout(() => handleFilterChange(), 0);
                    }}
                    className="w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-black"
                    aria-label="Filter by status"
                  >
                    {ORDER_STATUS_FILTER_OPTIONS.map((option) => (
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
                      setTypeFilter(parseInt(e.target.value));
                      setTimeout(() => handleFilterChange(), 0);
                    }}
                    className="w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-black"
                    aria-label="Filter by type"
                  >
                    {ORDER_TYPE_FILTER_OPTIONS.map((option) => (
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
                      htmlFor="start-date-input"
                      className="block text-sm font-medium text-black mb-1"
                    >
                      Start Date
                    </label>
                    <input
                      id="start-date-input"
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setTimeout(() => handleFilterChange(), 0);
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      aria-label="Filter by start date"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="end-date-input"
                      className="block text-sm font-medium text-black mb-1"
                    >
                      End Date
                    </label>
                    <input
                      id="end-date-input"
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setTimeout(() => handleFilterChange(), 0);
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      aria-label="Filter by end date"
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
                  Loading financial records...
                </span>
              </div>
            ) : orders.length > 0 ? (
              <>
                {/* Results count */}
                <div className="mb-4 text-sm text-black" aria-live="polite">
                  Showing <strong>{orders.length}</strong> records
                  {totalCount > 0 && ` of ${totalCount} total`}
                  {searchQuery && ` (filtered by "${searchQuery}")`}
                </div>

                {/* List Display */}
                {viewType === VIEW_TYPE_TABULAR ? (
                  /* Table View */
                  <div
                    className="overflow-x-auto"
                    role="region"
                    aria-label="Financial records table"
                  >
                    <table className="min-w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider rounded-tl-lg"
                          >
                            Type
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                          >
                            Job #
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                          >
                            Client
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
                            Assigned Date
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                          >
                            Start Date
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                          >
                            Status
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
                            key={order.wjid || order.id}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-zinc-200"} hover:bg-blue-50 cursor-pointer focus-within:bg-blue-50`}
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailModal(true);
                            }}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedOrder(order);
                                setShowDetailModal(true);
                              }
                            }}
                            role="row"
                            aria-label={`View details for job ${order.wjid || order.id}`}
                          >
                            <td className="px-4 py-4 text-base">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(order.type)}`}
                              >
                                {order.type === ORDER_TYPE_COMMERCIAL ? (
                                  <BuildingOffice2Icon className="w-3 h-3 mr-1" />
                                ) : order.type === ORDER_TYPE_RESIDENTIAL ? (
                                  <HomeIcon className="w-3 h-3 mr-1" />
                                ) : (
                                  <QuestionMarkCircleIcon className="w-3 h-3 mr-1" />
                                )}
                                {formatType(order.type)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-base font-medium text-black">
                              <span className="text-lg">
                                {order.wjid || order.id}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-base text-black">
                              {order.customerName ? (
                                <Link
                                  to={`/admin/customer/${order.customerId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                                >
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
                                  className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                                >
                                  <span className="text-lg">
                                    {order.associateName}
                                  </span>
                                </Link>
                              ) : (
                                <span className="text-gray-400 italic text-lg">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-base text-black">
                              <span className="text-lg">
                                {formatDateForDisplay(order.assignmentDate)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-base text-black">
                              <span className="text-lg">
                                {formatDateForDisplay(order.startDate)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-base">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}
                              >
                                {formatStatus(order.status)}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                      `/admin/financial/${order.wjid || order.id}`,
                                    );
                                  }}
                                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                  aria-label={`View details for job ${order.wjid || order.id}`}
                                >
                                  <EyeIcon
                                    className="w-4 h-4 mr-1.5"
                                    aria-hidden="true"
                                  />
                                  View
                                </button>
                                {order.status ===
                                  ORDER_STATUS_COMPLETED_BUT_UNPAID && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(
                                        `/admin/financial/${order.wjid || order.id}/invoice`,
                                      );
                                    }}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                                    aria-label={`Generate invoice for job ${order.wjid || order.id}`}
                                  >
                                    <DocumentDuplicateIcon
                                      className="w-4 h-4 mr-1.5"
                                      aria-hidden="true"
                                    />
                                    Invoice
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
                        key={order.wjid || order.id}
                        className="bg-white border-2 border-zinc-300 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer focus-within:shadow-md"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailModal(true);
                        }}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedOrder(order);
                            setShowDetailModal(true);
                          }
                        }}
                        role="listitem"
                        aria-label={`Order card for job ${order.wjid || order.id}`}
                      >
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-black">
                              <span className="text-xl">
                                Job #{order.wjid || order.id}
                              </span>
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(order.type)}`}
                            >
                              {formatType(order.type)}
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                        </div>

                        <div className="space-y-2 text-base text-black mb-4">
                          {order.customerName && (
                            <div>
                              <strong className="text-black">Client:</strong>{" "}
                              <Link
                                to={`/admin/customer/${order.customerId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <span className="text-lg">
                                  {order.customerName}
                                </span>
                              </Link>
                            </div>
                          )}
                          {order.associateName && (
                            <div>
                              <strong className="text-black">Associate:</strong>{" "}
                              <Link
                                to={`/admin/associate/${order.associateId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <span className="text-lg">
                                  {order.associateName}
                                </span>
                              </Link>
                            </div>
                          )}
                          <div className="flex items-center text-lg">
                            <CalendarIcon
                              className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0"
                              aria-hidden="true"
                            />
                            <span>
                              Start: {formatDateForDisplay(order.startDate)}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/admin/financial/${order.wjid || order.id}`,
                              );
                            }}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            aria-label={`View details for job ${order.wjid || order.id}`}
                          >
                            View Details
                            <ChevronRightIcon
                              className="w-4 h-4 ml-1"
                              aria-hidden="true"
                            />
                          </button>
                          {order.status ===
                            ORDER_STATUS_COMPLETED_BUT_UNPAID && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/admin/financial/${order.wjid || order.id}/invoice`,
                                );
                              }}
                              className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                              title="Generate Invoice"
                            >
                              <DocumentDuplicateIcon className="w-4 h-4" />
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
                            ({totalCount} total records)
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
                <CurrencyDollarIcon
                  className="mx-auto h-12 w-12 text-gray-400"
                  aria-hidden="true"
                />
                <h3 className="mt-2 text-sm font-medium text-black">
                  No Financial Records Found
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {searchQuery ||
                  statusFilter !== 0 ||
                  typeFilter !== 0 ||
                  startDate ||
                  endDate
                    ? "No records match your current filters. Try adjusting your search criteria."
                    : "No financial records have been added yet."}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  {(searchQuery ||
                    statusFilter !== 0 ||
                    typeFilter !== 0 ||
                    startDate ||
                    endDate) && (
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

        {/* Detail Modal */}
        {showDetailModal && selectedOrder && (
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden"
              role="document"
            >
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3
                  id="modal-title"
                  className="text-lg font-semibold text-black flex items-center"
                >
                  <BanknotesIcon
                    className="w-5 h-5 mr-2 text-blue-600"
                    aria-hidden="true"
                  />
                  Financial Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="px-6 py-4 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Job Number:
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-base font-semibold text-black">
                      {selectedOrder.wjid || selectedOrder.id}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Type:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeBadgeColor(selectedOrder.type)}`}
                        >
                          {selectedOrder.type === ORDER_TYPE_COMMERCIAL ? (
                            <BuildingOffice2Icon
                              className="w-4 h-4 mr-1"
                              aria-hidden="true"
                            />
                          ) : selectedOrder.type === ORDER_TYPE_RESIDENTIAL ? (
                            <HomeIcon
                              className="w-4 h-4 mr-1"
                              aria-hidden="true"
                            />
                          ) : (
                            <QuestionMarkCircleIcon
                              className="w-4 h-4 mr-1"
                              aria-hidden="true"
                            />
                          )}
                          {formatType(selectedOrder.type)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Status:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(selectedOrder.status)}`}
                        >
                          {formatStatus(selectedOrder.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Client:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                        {selectedOrder.customerName ? (
                          <Link
                            to={`/admin/customer/${selectedOrder.customerId}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
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
                      <label className="block text-sm font-medium text-black mb-1">
                        Associate:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                        {selectedOrder.associateName ? (
                          <Link
                            to={`/admin/associate/${selectedOrder.associateId}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {selectedOrder.associateName}
                          </Link>
                        ) : (
                          <span className="text-gray-400 italic">
                            Not assigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Assignment Date:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                        {formatDateForDisplay(selectedOrder.assignmentDate)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Start Date:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                        {formatDateForDisplay(selectedOrder.startDate)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(
                      `/admin/financial/${selectedOrder.wjid || selectedOrder.id}/edit`,
                    );
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <PencilSquareIcon
                    className="w-4 h-4 mr-1"
                    aria-hidden="true"
                  />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(
                      `/admin/financial/${selectedOrder.wjid || selectedOrder.id}`,
                    );
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <EyeIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        )}

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
                  Archive Order
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-black mb-4">
                  Are you sure you want to archive this order? It will no longer
                  appear in active lists.
                </p>

                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                  <p className="text-sm font-medium text-black mb-1">
                    <strong>Job #:</strong>{" "}
                    {orderToDelete.wjid || orderToDelete.id}
                  </p>
                  {orderToDelete.customerName && (
                    <p className="text-sm text-black mt-1">
                      <strong>Client:</strong> {orderToDelete.customerName}
                    </p>
                  )}
                  <p className="text-sm text-black mt-1">
                    <strong>Status:</strong>{" "}
                    {formatStatus(orderToDelete.status)}
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
                      system administrator. The order's data will be preserved.
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

export default AdminFinancialListPage;
