// File Path: web/workery-frontend/src/pages/Admin/Setting/InactiveClient/List/Page.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useCustomerManager } from "../../../../../services/Services";
import {
  UserGroupIcon,
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
  BuildingOffice2Icon,
  HomeIcon,
  InformationCircleIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ChevronLeftIcon,
  ShieldExclamationIcon,
  Cog6ToothIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  UNASSIGNED_CUSTOMER_TYPE_OF_ID,
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  CUSTOMER_STATUS_INACTIVE,
  CUSTOMER_DEACTIVATION_REASON_MAP,
  CUSTOMER_TYPE_OPTIONS,
  PAGE_SIZE_OPTIONS,
  CUSTOMER_SORT_OPTIONS,
} from "../../../../../constants/Customer";

// Constants for filtering and sorting

const VIEW_TYPE_TABULAR = "tabular";
const VIEW_TYPE_GRID = "grid";

function SettingInactiveClientListPage() {
  const customerManager = useCustomerManager();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [inactiveClients, setInactiveClients] = useState([]);
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
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("lexical_name,DESC");
  const [viewType, setViewType] = useState(VIEW_TYPE_TABULAR);
  const [showFilters, setShowFilters] = useState(false);

  // Additional filters for inactive clients
  const [joinDateGte, setJoinDateGte] = useState("");
  const [joinDateLte, setJoinDateLte] = useState("");
  const [modifiedDateGte, setModifiedDateGte] = useState("");
  const [modifiedDateLte, setModifiedDateLte] = useState("");

  // Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [clientToRestore, setClientToRestore] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch inactive clients using the manager
  const fetchInactiveClients = useCallback(
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
          filtersMap.set("sort_order", sortOrder === "DESC" ? "DESC" : "ASC");
        }

        // Add search
        if (searchQuery.trim()) {
          filtersMap.set("search", searchQuery.trim());
        }

        // IMPORTANT: Filter for inactive/archived clients only
        filtersMap.set("status", CUSTOMER_STATUS_INACTIVE);

        // Add type filter
        if (typeFilter) {
          filtersMap.set("type", typeFilter);
        }

        // Add date filters
        if (joinDateGte) {
          const date = new Date(joinDateGte);
          filtersMap.set("join_date_gte", date.getTime().toString());
        }
        if (joinDateLte) {
          const date = new Date(joinDateLte);
          filtersMap.set("join_date_lte", date.getTime().toString());
        }
        if (modifiedDateLte) {
          const date = new Date(modifiedDateLte);
          filtersMap.set("lexical_name", date.getTime().toString());
        }

        // Use the manager method
        const response = await customerManager.getCustomersWithFiltersMap(
          filtersMap,
          onUnauthorized,
          true, // force refresh
        );

        setInactiveClients(response.results || []);
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
        console.error("Failed to fetch inactive clients:", err);
        setError("Failed to load inactive clients. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [
      pageSize,
      sortBy,
      searchQuery,
      typeFilter,
      joinDateGte,
      joinDateLte,
      modifiedDateGte,
      modifiedDateLte,
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
    fetchInactiveClients("");
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
    fetchInactiveClients("");
  }, [fetchInactiveClients]);

  // Pagination handlers
  const handleNextPage = () => {
    if (hasNextPage && nextCursor) {
      // Push current cursor to history for "Previous" functionality
      setCursorHistory((prev) => [...prev, currentCursor]);
      // Fetch next page
      fetchInactiveClients(nextCursor);
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
      fetchInactiveClients(previousCursor || "", true);
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
      fetchInactiveClients("");
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
    setTimeout(() => fetchInactiveClients(""), 0);
  };

  // Handle restore client (change status back to active)
  const handleRestoreClient = async () => {
    if (!clientToRestore) return;

    try {
      setLoading(true);

      // Update the client to set status back to active (1)
      await customerManager.updateCustomer(
        clientToRestore.id,
        { ...clientToRestore, status: 1 },
        onUnauthorized,
      );

      // Refresh the current page
      fetchInactiveClients(currentCursor);

      // Reset restore state
      setShowRestoreModal(false);
      setClientToRestore(null);
      setSuccessMessage("Client restored to active status successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to restore client:", err);
      setError("Failed to restore client. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setTempSearchQuery("");
    setTypeFilter("");
    setSortBy("lexical_name,DESC");
    setJoinDateGte("");
    setJoinDateLte("");
    setModifiedDateGte("");
    setModifiedDateLte("");
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    setShowFilters(false);
    fetchInactiveClients("");
  }, [fetchInactiveClients]);

  // Initial data load
  useEffect(() => {
    fetchInactiveClients("");
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

  // Get deactivation reason text
  const getDeactivationReasonText = (reason, reasonOther) => {
    if (reason === 1 && reasonOther) {
      return reasonOther;
    }
    return CUSTOMER_DEACTIVATION_REASON_MAP[reason] || "Not specified";
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
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
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/settings"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <Cog6ToothIcon className="w-4 h-4 mr-2 inline" />
                  Settings
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                  Inactive Clients
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ArchiveBoxIcon className="w-8 h-8 mr-3 text-gray-600" />
            Inactive Clients Management
          </h1>
          <p className="mt-2 text-gray-600">
            View and manage archived or inactive client records
          </p>
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
              Inactive Client List
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
                onClick={() => navigate("/admin/customers")}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <UserGroupIcon className="w-5 h-5 mr-1" />
                View Active Clients
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
                    <FunnelIcon className="w-4 h-4 mr-1" />
                  )}
                  {showFilters ? "Hide" : "Show"} Advanced Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Clear Filters
                </button>
                <button
                  onClick={() => fetchInactiveClients(currentCursor)}
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
                    placeholder="Search inactive clients..."
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

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Type
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

              {/* Page Size */}
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

            {/* Extended Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Date Range Filters
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      Join Date (To)
                    </label>
                    <input
                      type="date"
                      value={joinDateLte}
                      onChange={(e) => {
                        setJoinDateLte(e.target.value);
                        setTimeout(() => handleFilterChange(), 0);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modified Date (From)
                    </label>
                    <input
                      type="date"
                      value={modifiedDateGte}
                      onChange={(e) => {
                        setModifiedDateGte(e.target.value);
                        setTimeout(() => handleFilterChange(), 0);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modified Date (To)
                    </label>
                    <input
                      type="date"
                      value={modifiedDateLte}
                      onChange={(e) => {
                        setModifiedDateLte(e.target.value);
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
            {loading && !inactiveClients.length ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Loading inactive clients...
                </span>
              </div>
            ) : inactiveClients.length > 0 ? (
              <>
                {/* Results count */}
                <div className="mb-4 text-sm text-gray-600">
                  Showing <strong>{inactiveClients.length}</strong> inactive
                  clients
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
                            Deactivation Reason
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Modified Date
                          </th>
                          <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inactiveClients.map((client) => (
                          <tr
                            key={client.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setSelectedClient(client);
                              setShowDetailModal(true);
                            }}
                          >
                            <td className="px-3 py-4 text-sm">
                              <Link
                                to={`/admin/customer/${client.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                              >
                                {client.type ===
                                COMMERCIAL_CUSTOMER_TYPE_OF_ID ? (
                                  <>
                                    <BuildingOffice2Icon className="w-4 h-4 mr-2" />
                                    {client.organizationName ||
                                      `${client.firstName} ${client.lastName}`}
                                  </>
                                ) : (
                                  <>
                                    <HomeIcon className="w-4 h-4 mr-2" />
                                    {client.firstName} {client.lastName}
                                  </>
                                )}
                              </Link>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              {client.phone ? (
                                <span className="flex items-center">
                                  <PhoneIcon className="w-4 h-4 mr-2" />
                                  {client.phone}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">—</span>
                              )}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              {client.email ? (
                                <a
                                  href={`mailto:${client.email}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center hover:text-blue-600"
                                >
                                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                                  {client.email}
                                </a>
                              ) : (
                                <span className="text-gray-400 italic">—</span>
                              )}
                            </td>
                            <td className="px-3 py-4 text-sm">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(client.type)}`}
                              >
                                {getCustomerTypeDisplay(client.type)}
                              </span>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              {getDeactivationReasonText(
                                client.deactivationReason,
                                client.deactivationReasonOther,
                              )}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              {formatDate(client.modifiedAt)}
                            </td>
                            <td className="px-3 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/customer/${client.id}`);
                                  }}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                >
                                  <EyeIcon className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                      `/admin/settings/inactive-client/${client.id}/update`,
                                    );
                                  }}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded hover:bg-amber-200 transition-colors"
                                >
                                  <PencilSquareIcon className="w-3.5 h-3.5" />
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
                    {inactiveClients.map((client) => (
                      <div
                        key={client.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setSelectedClient(client);
                          setShowDetailModal(true);
                        }}
                      >
                        <div className="mb-3">
                          <h3 className="text-base font-semibold text-gray-900">
                            <Link
                              to={`/admin/customer/${client.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 flex items-start"
                            >
                              {client.type ===
                              COMMERCIAL_CUSTOMER_TYPE_OF_ID ? (
                                <>
                                  <BuildingOffice2Icon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                  <span>
                                    {client.organizationName ||
                                      `${client.firstName} ${client.lastName}`}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <HomeIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                  <span>
                                    {client.firstName} {client.lastName}
                                  </span>
                                </>
                              )}
                            </Link>
                          </h3>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-3">
                          {client.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID &&
                            client.organizationName && (
                              <div>
                                <strong>Contact:</strong> {client.firstName}{" "}
                                {client.lastName}
                              </div>
                            )}
                          {client.email && (
                            <div className="flex items-center">
                              <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="truncate">{client.email}</span>
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center">
                              <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                              {client.phone}
                            </div>
                          )}
                          <div className="flex items-center text-xs text-gray-500">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            Modified: {formatDate(client.modifiedAt)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(client.type)}`}
                          >
                            {getCustomerTypeDisplay(client.type)}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {getDeactivationReasonText(
                              client.deactivationReason,
                              client.deactivationReasonOther,
                            )}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/customer/${client.id}`);
                            }}
                            className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/admin/settings/inactive-client/${client.id}/update`,
                              );
                            }}
                            className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
                          >
                            <PencilSquareIcon className="w-4 h-4 mr-1" />
                            Edit
                          </button>
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
                            ({totalCount} total inactive clients)
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
                <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No Inactive Clients Found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ||
                  typeFilter ||
                  joinDateGte ||
                  joinDateLte ||
                  modifiedDateGte ||
                  modifiedDateLte
                    ? "No inactive clients match your current filters. Try adjusting your search criteria."
                    : "No clients have been archived or deactivated yet."}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  {(searchQuery ||
                    typeFilter ||
                    joinDateGte ||
                    joinDateLte ||
                    modifiedDateGte ||
                    modifiedDateLte) && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/admin/customers")}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    <UserGroupIcon className="w-5 h-5 mr-2" />
                    View Active Clients
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedClient && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ArchiveBoxIcon className="w-5 h-5 mr-2 text-gray-600" />
                  Inactive Client Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedClient(null);
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
                      {selectedClient.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID
                        ? "Organization Name:"
                        : "Full Name:"}
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-base font-semibold text-gray-900 flex items-center">
                      {selectedClient.type ===
                      COMMERCIAL_CUSTOMER_TYPE_OF_ID ? (
                        <>
                          <BuildingOffice2Icon className="w-5 h-5 mr-2 text-gray-600" />
                          {selectedClient.organizationName ||
                            `${selectedClient.firstName} ${selectedClient.lastName}`}
                        </>
                      ) : (
                        <>
                          <UserIcon className="w-5 h-5 mr-2 text-gray-600" />
                          {selectedClient.firstName} {selectedClient.lastName}
                        </>
                      )}
                    </div>
                  </div>

                  {selectedClient.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID &&
                    selectedClient.organizationName && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Person:
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                          {selectedClient.firstName} {selectedClient.lastName}
                        </div>
                      </div>
                    )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        {selectedClient.email ? (
                          <a
                            href={`mailto:${selectedClient.email}`}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <EnvelopeIcon className="w-4 h-4 mr-2" />
                            {selectedClient.email}
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
                        {selectedClient.phone ? (
                          <span className="flex items-center">
                            <PhoneIcon className="w-4 h-4 mr-2" />
                            {selectedClient.phone}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">
                            Not provided
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deactivation Reason:
                    </label>
                    <div className="p-3 bg-amber-50 rounded-lg text-sm text-gray-700 border border-amber-200">
                      <span className="font-medium">
                        {getDeactivationReasonText(
                          selectedClient.deactivationReason,
                          selectedClient.deactivationReasonOther,
                        )}
                      </span>
                      {selectedClient.deactivationReasonOther &&
                        selectedClient.deactivationReason === 1 && (
                          <p className="mt-1 text-xs text-gray-600">
                            Details: {selectedClient.deactivationReasonOther}
                          </p>
                        )}
                    </div>
                  </div>

                  {selectedClient.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        {selectedClient.description}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Type:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeBadgeColor(selectedClient.type)}`}
                        >
                          {getCustomerTypeDisplay(selectedClient.type)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          <ArchiveBoxIcon className="w-4 h-4 mr-1" />
                          Inactive/Archived
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Join Date:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        {formatDate(selectedClient.joinDate)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Modified:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        {formatDate(selectedClient.modifiedAt)}
                      </div>
                    </div>
                  </div>

                  {selectedClient.addressLine1 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        {selectedClient.addressLine1}
                        {selectedClient.city && `, ${selectedClient.city}`}
                        {selectedClient.region && `, ${selectedClient.region}`}
                        {selectedClient.postalCode &&
                          ` ${selectedClient.postalCode}`}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedClient(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setClientToRestore(selectedClient);
                    setShowRestoreModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-1" />
                  Restore Client
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(
                      `/admin/settings/inactive-client/${selectedClient.id}/update`,
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
                    navigate(`/admin/customer/${selectedClient.id}`);
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

        {/* Restore Confirmation Modal */}
        {showRestoreModal && clientToRestore && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ArrowPathIcon className="w-5 h-5 mr-2 text-green-600" />
                  Restore Client
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to restore this client to active status?
                  They will be removed from the inactive list and appear in the
                  active clients list.
                </p>

                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    <strong>Name:</strong>{" "}
                    {clientToRestore.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID
                      ? clientToRestore.organizationName ||
                        `${clientToRestore.firstName} ${clientToRestore.lastName}`
                      : `${clientToRestore.firstName} ${clientToRestore.lastName}`}
                  </p>
                  {clientToRestore.email && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Email:</strong> {clientToRestore.email}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Type:</strong>{" "}
                    {getCustomerTypeDisplay(clientToRestore.type)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Current Reason:</strong>{" "}
                    {getDeactivationReasonText(
                      clientToRestore.deactivationReason,
                      clientToRestore.deactivationReasonOther,
                    )}
                  </p>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 flex items-start">
                    <InformationCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>
                      <strong>Note:</strong> This will restore the client to
                      active status. They will be able to place orders and
                      interact with the system normally.
                    </span>
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRestoreModal(false);
                    setClientToRestore(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestoreClient}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Restoring...
                    </>
                  ) : (
                    <>
                      <ArrowPathIcon className="w-4 h-4 mr-2" />
                      Restore to Active
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

export default SettingInactiveClientListPage;
