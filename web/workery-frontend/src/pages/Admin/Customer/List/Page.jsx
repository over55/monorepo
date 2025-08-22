// File Path: monorepo/web/workery-frontend/src/pages/Admin/Customer/List/Page.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import {
  useCustomerManager,
  useAuthManager,
} from "../../../../services/Services";
import {
  UserGroupIcon,
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
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  HomeIcon,
  InformationCircleIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ChevronLeftIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

// Constants for filtering and sorting
const CUSTOMER_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "1", label: "Active" },
  { value: "0", label: "Archived" },
];

const CUSTOMER_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "1", label: "Unassigned" },
  { value: "2", label: "Residential" },
  { value: "3", label: "Commercial" },
];

const CUSTOMER_SORT_OPTIONS = [
  { value: "lexical_name,ASC", label: "Name (A → Z)" },
  { value: "lexical_name,DESC", label: "Name (Z → A)" },
  { value: "join_date,DESC", label: "Join Date (Newest → Oldest)" },
  { value: "join_date,ASC", label: "Join Date (Oldest → Newest)" },
];

const PAGE_SIZE_OPTIONS = [
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
  { value: 250, label: "250 per page" },
];

const VIEW_TYPE_TABULAR = "tabular";
const VIEW_TYPE_GRID = "grid";

// Customer type constants
const UNASSIGNED_CUSTOMER_TYPE_OF_ID = 1;
const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 2;
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;

function AdminCustomerListPage() {
  const customerManager = useCustomerManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [customers, setCustomers] = useState([]);
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
  const [statusFilter, setStatusFilter] = useState("1"); // Default to active
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("lexical_name,ASC");
  const [viewType, setViewType] = useState(VIEW_TYPE_TABULAR);
  const [showFilters, setShowFilters] = useState(false);

  // Additional customer-specific filters
  const [joinDateGte, setJoinDateGte] = useState("");

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch customers using the manager
  const fetchCustomers = useCallback(
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
          // Backend expects specific format
          filtersMap.set("sort_order", sortOrder === "DESC" ? "DESC" : "ASC");
        }

        // Add search
        if (searchQuery.trim()) {
          filtersMap.set("search", searchQuery.trim());
        }

        // Add filters
        if (statusFilter) {
          filtersMap.set("status", statusFilter);
        }
        if (typeFilter) {
          filtersMap.set("type", typeFilter);
        }
        if (joinDateGte) {
          const date = new Date(joinDateGte);
          filtersMap.set("join_date_gte", date.getTime().toString());
        }

        // Use the manager method
        const response = await customerManager.getCustomersWithFiltersMap(
          filtersMap,
          onUnauthorized,
          true, // force refresh
        );

        setCustomers(response.results || []);
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
        console.error("Failed to fetch customers:", err);
        setError("Failed to load customers. Please try again.");
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
      joinDateGte,
      customerManager,
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
    fetchCustomers("");
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
    fetchCustomers("");
  }, [fetchCustomers]);

  // Pagination handlers
  const handleNextPage = () => {
    if (hasNextPage && nextCursor) {
      // Push current cursor to history for "Previous" functionality
      setCursorHistory((prev) => [...prev, currentCursor]);
      // Fetch next page
      fetchCustomers(nextCursor);
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
      fetchCustomers(previousCursor || "", true);
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
      fetchCustomers("");
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
    setTimeout(() => fetchCustomers(""), 0);
  };

  // Handle delete customer
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      setLoading(true);
      await customerManager.deleteCustomer(customerToDelete.id, onUnauthorized);

      // Refresh the current page
      fetchCustomers(currentCursor);

      // Reset delete state
      setShowDeleteModal(false);
      setCustomerToDelete(null);
      setSuccessMessage("Customer archived successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to delete customer:", err);
      setError("Failed to delete customer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setTempSearchQuery("");
    setStatusFilter("1");
    setTypeFilter("");
    setSortBy("lexical_name,ASC");
    setJoinDateGte("");
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    setShowFilters(false);
    fetchCustomers("");
  }, [fetchCustomers]);

  // Initial data load
  useEffect(() => {
    fetchCustomers("");
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

  // Format customer type for display
  const getCustomerTypeDisplay = (type) => {
    switch (type) {
      case COMMERCIAL_CUSTOMER_TYPE_OF_ID:
        return "Commercial";
      case RESIDENTIAL_CUSTOMER_TYPE_OF_ID:
        return "Residential";
      case UNASSIGNED_CUSTOMER_TYPE_OF_ID:
        return "Unassigned";
      default:
        return "Unknown";
    }
  };

  // Get badge color for customer type
  const getTypeBadgeColor = (customerType) => {
    switch (customerType) {
      case COMMERCIAL_CUSTOMER_TYPE_OF_ID:
        return "bg-blue-100 text-blue-800";
      case RESIDENTIAL_CUSTOMER_TYPE_OF_ID:
        return "bg-green-100 text-green-800";
      case UNASSIGNED_CUSTOMER_TYPE_OF_ID:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (customer) => {
    if (customer.isBanned) {
      return "bg-red-100 text-red-800";
    }
    return customer.status === 1
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
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
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  Customers
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <UserGroupIcon className="w-8 h-8 mr-3 text-blue-600" />
            Customers Management
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
              Customer List
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
                onClick={() => navigate("/admin/customers/search")}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <MagnifyingGlassIcon className="w-5 h-5 mr-1" />
                Advanced Search
              </button>
              <button
                onClick={() => navigate("/admin/customers/add/step-1-search")}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-1" />
                Add Customer
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
                  onClick={() => fetchCustomers(currentCursor)}
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
                    placeholder="Search customers..."
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
                    {CUSTOMER_SORT_OPTIONS.map((option) => (
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
                    {CUSTOMER_STATUS_OPTIONS.map((option) => (
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
                    {CUSTOMER_TYPE_OPTIONS.map((option) => (
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
                      Join Date (From)
                    </label>
                    <input
                      type="date"
                      value={joinDateGte}
                      onChange={(e) => {
                        setJoinDateGte(e.target.value);
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
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="px-6 py-4">
            {loading && !customers.length ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading customers...</span>
              </div>
            ) : customers.length > 0 ? (
              <>
                {/* Results count */}
                <div className="mb-4 text-sm text-gray-600">
                  Showing <strong>{customers.length}</strong> customers
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
                            Name
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {customers.map((customer) => (
                          <tr
                            key={customer.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowDetailModal(true);
                            }}
                          >
                            <td className="px-3 py-4 text-sm">
                              <Link
                                to={`/admin/customer/${customer.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                              >
                                {customer.type ===
                                COMMERCIAL_CUSTOMER_TYPE_OF_ID ? (
                                  <>
                                    <BuildingOffice2Icon className="w-4 h-4 mr-2" />
                                    {customer.organizationName ||
                                      `${customer.firstName} ${customer.lastName}`}
                                  </>
                                ) : (
                                  <>
                                    <HomeIcon className="w-4 h-4 mr-2" />
                                    {customer.firstName} {customer.lastName}
                                  </>
                                )}
                              </Link>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              {customer.phone ? (
                                <span className="flex items-center">
                                  <PhoneIcon className="w-4 h-4 mr-2" />
                                  {customer.phone}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">—</span>
                              )}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              {customer.email ? (
                                <a
                                  href={`mailto:${customer.email}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center hover:text-blue-600"
                                >
                                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                                  {customer.email}
                                </a>
                              ) : (
                                <span className="text-gray-400 italic">—</span>
                              )}
                            </td>
                            <td className="px-3 py-4 text-sm">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(customer.type)}`}
                              >
                                {getCustomerTypeDisplay(customer.type)}
                              </span>
                            </td>
                            <td className="px-3 py-4 text-sm">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(customer)}`}
                              >
                                {customer.isBanned ? (
                                  <>
                                    <ShieldExclamationIcon className="w-3 h-3 mr-1" />
                                    Banned
                                  </>
                                ) : customer.status === 1 ? (
                                  "Active"
                                ) : (
                                  "Inactive"
                                )}
                              </span>
                            </td>
                            <td className="px-3 py-4">
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/customer/${customer.id}`);
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
                    {customers.map((customer) => (
                      <div
                        key={customer.id}
                        className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                          customer.isBanned
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200"
                        }`}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowDetailModal(true);
                        }}
                      >
                        <div className="mb-3">
                          <h3 className="text-base font-semibold text-gray-900">
                            <Link
                              to={`/admin/customer/${customer.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 flex items-start"
                            >
                              {customer.type ===
                              COMMERCIAL_CUSTOMER_TYPE_OF_ID ? (
                                <>
                                  <BuildingOffice2Icon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                  <span>
                                    {customer.organizationName ||
                                      `${customer.firstName} ${customer.lastName}`}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <HomeIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                  <span>
                                    {customer.firstName} {customer.lastName}
                                  </span>
                                </>
                              )}
                            </Link>
                          </h3>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-3">
                          {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID &&
                            customer.organizationName && (
                              <div>
                                <strong>Contact:</strong> {customer.firstName}{" "}
                                {customer.lastName}
                              </div>
                            )}
                          {customer.email && (
                            <div className="flex items-center">
                              <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="truncate">{customer.email}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center">
                              <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                              {customer.phone}
                            </div>
                          )}
                          {customer.addressLine1 && (
                            <div className="text-xs text-gray-500">
                              {customer.addressLine1}
                              {customer.city && `, ${customer.city}`}
                              {customer.region && `, ${customer.region}`}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(customer.type)}`}
                          >
                            {getCustomerTypeDisplay(customer.type)}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(customer)}`}
                          >
                            {customer.isBanned ? (
                              <>
                                <ShieldExclamationIcon className="w-3 h-3 mr-1" />
                                Banned
                              </>
                            ) : customer.status === 1 ? (
                              "Active"
                            ) : (
                              "Inactive"
                            )}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/customer/${customer.id}`);
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
                            ({totalCount} total customers)
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
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No Customers Found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ||
                  statusFilter !== "1" ||
                  typeFilter ||
                  joinDateGte
                    ? "No customers match your current filters. Try adjusting your search criteria."
                    : "No customers have been added yet."}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  {(searchQuery ||
                    statusFilter !== "1" ||
                    typeFilter ||
                    joinDateGte) && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() =>
                      navigate("/admin/customers/add/step-1-search")
                    }
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add First Customer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedCustomer && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Customer Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedCustomer(null);
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
                      {selectedCustomer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID
                        ? "Organization Name:"
                        : "Full Name:"}
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-base font-semibold text-gray-900 flex items-center">
                      {selectedCustomer.type ===
                      COMMERCIAL_CUSTOMER_TYPE_OF_ID ? (
                        <>
                          <BuildingOffice2Icon className="w-5 h-5 mr-2 text-gray-600" />
                          {selectedCustomer.organizationName ||
                            `${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
                        </>
                      ) : (
                        <>
                          <UserIcon className="w-5 h-5 mr-2 text-gray-600" />
                          {selectedCustomer.firstName}{" "}
                          {selectedCustomer.lastName}
                        </>
                      )}
                    </div>
                  </div>

                  {selectedCustomer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID &&
                    selectedCustomer.organizationName && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Person:
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                          {selectedCustomer.firstName}{" "}
                          {selectedCustomer.lastName}
                        </div>
                      </div>
                    )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        {selectedCustomer.email ? (
                          <a
                            href={`mailto:${selectedCustomer.email}`}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <EnvelopeIcon className="w-4 h-4 mr-2" />
                            {selectedCustomer.email}
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">
                            Not provided
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        {selectedCustomer.phone ? (
                          <span className="flex items-center">
                            <PhoneIcon className="w-4 h-4 mr-2" />
                            {selectedCustomer.phone}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">
                            Not provided
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeBadgeColor(selectedCustomer.type)}`}
                        >
                          {selectedCustomer.type ===
                          COMMERCIAL_CUSTOMER_TYPE_OF_ID ? (
                            <BuildingOffice2Icon className="w-4 h-4 mr-1" />
                          ) : selectedCustomer.type ===
                            RESIDENTIAL_CUSTOMER_TYPE_OF_ID ? (
                            <HomeIcon className="w-4 h-4 mr-1" />
                          ) : null}
                          {getCustomerTypeDisplay(selectedCustomer.type)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(selectedCustomer)}`}
                        >
                          {selectedCustomer.isBanned ? (
                            <>
                              <ShieldExclamationIcon className="w-4 h-4 mr-1" />
                              Banned
                            </>
                          ) : selectedCustomer.status === 1 ? (
                            "Active"
                          ) : (
                            "Inactive"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedCustomer.addressLine1 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        {selectedCustomer.addressLine1}
                        {selectedCustomer.city && `, ${selectedCustomer.city}`}
                        {selectedCustomer.region &&
                          `, ${selectedCustomer.region}`}
                        {selectedCustomer.postalCode &&
                          ` ${selectedCustomer.postalCode}`}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(`/admin/customer/${selectedCustomer.id}/edit`);
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600"
                >
                  <PencilSquareIcon className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(`/admin/customer/${selectedCustomer.id}`);
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
        {showDeleteModal && customerToDelete && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-amber-600" />
                  Archive Customer
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to archive this customer? They will no
                  longer appear in active lists.
                </p>

                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    <strong>Name:</strong>{" "}
                    {customerToDelete.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID
                      ? customerToDelete.organizationName ||
                        `${customerToDelete.firstName} ${customerToDelete.lastName}`
                      : `${customerToDelete.firstName} ${customerToDelete.lastName}`}
                  </p>
                  {customerToDelete.email && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Email:</strong> {customerToDelete.email}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Type:</strong>{" "}
                    {getCustomerTypeDisplay(customerToDelete.type)}
                  </p>
                  {customerToDelete.isBanned && (
                    <p className="text-sm text-red-600 mt-1 font-medium">
                      <strong>Status:</strong> BANNED
                    </p>
                  )}
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 flex items-start">
                    <InformationCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>
                      <strong>Note:</strong> This action can be undone by a
                      system administrator. The customer's data will be
                      preserved.
                    </span>
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCustomerToDelete(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCustomer}
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
                      Archive Customer
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

export default AdminCustomerListPage;
