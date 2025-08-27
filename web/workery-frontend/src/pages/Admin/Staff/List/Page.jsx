// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/List/Page.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useStaffManager, useAuthManager } from "../../../../services/Services";
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
  ShieldCheckIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ChevronLeftIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  PAGE_SIZE_OPTIONS,
  DEFAULT_STAFF_LIST_SORT_BY_VALUE,
} from "../../../../constants/FieldOptions";
import {
  STAFF_TYPE_FILTER_OPTIONS,
  STAFF_STATUS_FILTER_OPTIONS,
  STAFF_SORT_OPTIONS,
  STAFF_TYPE_MAP,
} from "../../../../constants/Staff";

const VIEW_TYPE_TABULAR = "tabular";
const VIEW_TYPE_GRID = "grid";

function AdminStaffListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const staffManager = useStaffManager();
  const authManager = useAuthManager();

  // List state
  const [staffList, setStaffList] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Pagination state
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [currentCursor, setCurrentCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");

  // Filter state
  const [sortBy, setSortBy] = useState("lexical_name,ASC");
  const [status, setStatus] = useState(1); // Default to active
  const [type, setType] = useState(0); // All types
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [viewType, setViewType] = useState(VIEW_TYPE_TABULAR);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStaffForDeletion, setSelectedStaffForDeletion] =
    useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Force refresh counter to bypass cache
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch staff list with useCallback to prevent infinite loops
  const fetchStaffList = useCallback(
    (forceRefresh = false) => {
      console.log("fetchStaffList called with:", {
        forceRefresh,
        currentCursor,
        pageSize,
        sortBy,
        status,
        type,
        searchQuery,
      });

      setIsLoading(true);
      setErrors({});

      // Build filters map for the API
      const filtersMap = new Map();
      filtersMap.set("pageSize", pageSize);

      // Add cursor for pagination
      if (currentCursor) {
        filtersMap.set("cursor", currentCursor);
      }

      // Add sorting
      const [sortField, sortOrder] = sortBy.split(",");
      filtersMap.set("sortField", sortField);
      filtersMap.set("sortOrder", sortOrder);

      // Add filters
      if (status > 0) {
        filtersMap.set("status", status);
      }

      if (type > 0) {
        filtersMap.set("type", type);
      }

      if (searchQuery && searchQuery.trim()) {
        filtersMap.set("search", searchQuery.trim());
      }

      console.log("API call with filters:", Array.from(filtersMap.entries()));

      // Use the manager to fetch staff with force refresh flag
      staffManager.getStaffWithFiltersMapWithCallbacks(
        filtersMap,
        onFetchSuccess,
        onFetchError,
        onFetchDone,
        onUnauthorized,
        forceRefresh, // Pass the force refresh flag
      );
    },
    [currentCursor, pageSize, sortBy, status, type, searchQuery],
  );

  const onFetchSuccess = (response) => {
    console.log("Staff list fetched successfully:", {
      resultCount: response.results?.length || 0,
      totalCount: response.count,
      hasNextPage: response.hasNextPage,
    });
    setStaffList(response);

    // Update pagination state
    if (response.hasNextPage) {
      setNextCursor(response.nextCursor);
    } else {
      setNextCursor("");
    }
  };

  const onFetchError = (error) => {
    console.error("Error fetching staff list:", error);
    setErrors(error);
  };

  const onFetchDone = () => {
    setIsLoading(false);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (nextCursor) {
      console.log("Going to next page with cursor:", nextCursor);
      const newPreviousCursors = [...previousCursors];
      newPreviousCursors.push(currentCursor);
      setPreviousCursors(newPreviousCursors);
      setCurrentCursor(nextCursor);
    }
  };

  const handlePreviousPage = () => {
    if (previousCursors.length > 0) {
      console.log("Going to previous page");
      const newPreviousCursors = [...previousCursors];
      const previousCursor = newPreviousCursors.pop();
      setPreviousCursors(newPreviousCursors);
      setCurrentCursor(previousCursor);
    }
  };

  // Search handler
  const handleSearch = () => {
    console.log("Search triggered with query:", tempSearchQuery);
    setSearchQuery(tempSearchQuery);
    // Reset pagination when search changes
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
    // Force refresh
    setRefreshCounter((prev) => prev + 1);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Filter change handlers
  const handleSortByChange = (e) => {
    const newSortBy = e.target.value;
    console.log("Sort by changed from", sortBy, "to:", newSortBy);
    setSortBy(newSortBy);
    // Reset pagination when sort changes
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
    // Force refresh
    setRefreshCounter((prev) => prev + 1);
  };

  const handleStatusChange = (e) => {
    const newStatus = parseInt(e.target.value);
    console.log("Status changed from", status, "to:", newStatus);
    setStatus(newStatus);
    // Reset pagination when status changes
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
    // Force refresh
    setRefreshCounter((prev) => prev + 1);
  };

  const handleTypeChange = (e) => {
    const newType = parseInt(e.target.value);
    console.log("Type changed from", type, "to:", newType);
    setType(newType);
    // Reset pagination when type changes
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
    // Force refresh
    setRefreshCounter((prev) => prev + 1);
  };

  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    console.log("Page size changed from", pageSize, "to:", newPageSize);
    setPageSize(newPageSize);
    // Reset pagination when page size changes
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
    // Force refresh
    setRefreshCounter((prev) => prev + 1);
  };

  // Clear filters
  const handleClearFilters = () => {
    console.log("Clearing all filters");
    setSortBy("lexical_name,ASC");
    setStatus(1);
    setType(0);
    setSearchQuery("");
    setTempSearchQuery("");
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
    setShowFilters(false);
    // Force refresh
    setRefreshCounter((prev) => prev + 1);
  };

  // Delete handlers
  const handleSelectForDeletion = (staff) => {
    setSelectedStaffForDeletion(staff);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedStaffForDeletion) {
      setIsLoading(true);

      staffManager.archiveStaffWithCallbacks(
        selectedStaffForDeletion.id,
        onDeleteSuccess,
        onDeleteError,
        onDeleteDone,
        onUnauthorized,
      );
    }
  };

  const onDeleteSuccess = () => {
    console.log("Staff archived successfully");
    setShowDeleteModal(false);
    setSelectedStaffForDeletion(null);
    setSuccessMessage("Staff member archived successfully");

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000);

    // Force refresh the list
    setRefreshCounter((prev) => prev + 1);
  };

  const onDeleteError = (error) => {
    console.error("Error archiving staff:", error);
    setErrors(error);
    setShowDeleteModal(false);
  };

  const onDeleteDone = () => {
    setIsLoading(false);
  };

  // Get badge color for staff type
  const getTypeBadgeColor = (staffType) => {
    // Assuming type values from STAFF_TYPE_MAP
    const colorMap = {
      1: "bg-blue-100 text-blue-800 border border-blue-200", // Management
      2: "bg-green-100 text-green-800 border border-green-200", // Frontline
      3: "bg-purple-100 text-purple-800 border border-purple-200", // Support
      0: "bg-gray-100 text-gray-800 border border-gray-200", // All/Unknown
    };
    return (
      colorMap[staffType] || "bg-gray-100 text-gray-800 border border-gray-200"
    );
  };

  // Get status badge color
  const getStatusBadgeColor = (statusValue) => {
    return statusValue === 1
      ? "bg-green-100 text-green-800 border border-green-200"
      : "bg-gray-100 text-gray-800 border border-gray-200";
  };

  // Calculate pagination info
  const hasPreviousPage = previousCursors.length > 0;
  const currentPageNumber = previousCursors.length + 1;

  // Initial load effect
  useEffect(() => {
    console.log("Initial load effect triggered");
    fetchStaffList(true); // Force refresh on initial load
  }, []); // Empty dependency array for initial load only

  // Effect for filter changes and pagination
  useEffect(() => {
    console.log("Filter/pagination effect triggered", {
      currentCursor,
      pageSize,
      sortBy,
      status,
      type,
      searchQuery,
      refreshCounter,
    });

    // Only fetch if we have initialized (not on initial mount)
    if (refreshCounter > 0 || currentCursor) {
      fetchStaffList(true); // Always force refresh to bypass cache
    }
  }, [
    currentCursor,
    pageSize,
    sortBy,
    status,
    type,
    searchQuery,
    refreshCounter,
    fetchStaffList,
  ]);

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
                  <UserGroupIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                  Staff
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black flex items-center">
            <UserGroupIcon
              className="w-8 h-8 mr-3 text-blue-600"
              aria-hidden="true"
            />
            Staff Management
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

        {errors.message && (
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
              {errors.message}
            </span>
            <button
              onClick={() => setErrors({})}
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
              Staff List
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
                onClick={() => navigate("/admin/staff/search")}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <MagnifyingGlassIcon
                  className="w-5 h-5 mr-1"
                  aria-hidden="true"
                />
                Advanced Search
              </button>
              <button
                onClick={() => navigate("/admin/staff/add/step-1-search")}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-1" aria-hidden="true" />
                Add Staff
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
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
                >
                  <XMarkIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                  Clear Filters
                </button>
                <button
                  onClick={() => fetchStaffList(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
                  aria-label="Refresh staff list"
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
                    placeholder="Search staff..."
                    className="w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500"
                    onKeyPress={handleSearchKeyPress}
                    aria-label="Search staff"
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
                    onChange={handleSortByChange}
                    className="w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-black"
                    aria-label="Sort staff by"
                  >
                    {STAFF_SORT_OPTIONS.map((option) => (
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
                    value={status}
                    onChange={handleStatusChange}
                    className="w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-black"
                    aria-label="Filter by status"
                  >
                    {STAFF_STATUS_FILTER_OPTIONS.map((option) => (
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
                    value={type}
                    onChange={handleTypeChange}
                    className="w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-black"
                    aria-label="Filter by type"
                  >
                    {STAFF_TYPE_FILTER_OPTIONS.map((option) => (
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
                  Additional Options
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            {isLoading && !staffList ? (
              <div
                className="flex items-center justify-center py-12"
                role="status"
                aria-live="polite"
              >
                <div
                  className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
                  aria-hidden="true"
                ></div>
                <span className="ml-3 text-gray-600">Loading staff...</span>
              </div>
            ) : staffList &&
              staffList.results &&
              staffList.results.length > 0 ? (
              <>
                {/* Results count */}
                <div className="mb-4 text-sm text-black" aria-live="polite">
                  Showing <strong>{staffList.results.length}</strong> staff
                  members
                  {staffList.count > 0 && ` of ${staffList.count} total`}
                  {searchQuery && ` (filtered by "${searchQuery}")`}
                </div>

                {/* List Display */}
                {viewType === VIEW_TYPE_TABULAR ? (
                  /* Table View */
                  <div
                    className="overflow-x-auto"
                    role="region"
                    aria-label="Staff table"
                  >
                    <table className="min-w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider rounded-tl-lg"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                          >
                            Email
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                          >
                            Phone
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                          >
                            Type
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
                        {staffList.results.map((staff, index) => (
                          <tr
                            key={staff.id}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-zinc-200"} hover:bg-blue-50 cursor-pointer focus-within:bg-blue-50`}
                            onClick={() => {
                              setSelectedStaff(staff);
                              setShowDetailModal(true);
                            }}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedStaff(staff);
                                setShowDetailModal(true);
                              }
                            }}
                            role="row"
                            aria-label={`View details for ${staff.name || `${staff.firstName} ${staff.lastName}`}`}
                          >
                            <td className="px-4 py-4 text-base">
                              <Link
                                to={`/admin/staff/${staff.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                              >
                                <UserCircleIcon
                                  className="w-5 h-5 mr-2 flex-shrink-0"
                                  aria-hidden="true"
                                />
                                <span className="text-lg">
                                  {staff.name ||
                                    `${staff.firstName} ${staff.lastName}`}
                                </span>
                              </Link>
                            </td>
                            <td className="px-4 py-4 text-base text-black">
                              {staff.email ? (
                                <a
                                  href={`mailto:${staff.email}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                                  aria-label={`Send email to ${staff.email}`}
                                >
                                  <EnvelopeIcon
                                    className="w-5 h-5 mr-2 text-gray-400"
                                    aria-hidden="true"
                                  />
                                  <span className="text-lg">{staff.email}</span>
                                </a>
                              ) : (
                                <span className="text-gray-400 italic text-lg">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-base text-black">
                              {staff.phone ? (
                                <span className="flex items-center text-lg">
                                  <PhoneIcon
                                    className="w-5 h-5 mr-2 text-gray-400"
                                    aria-hidden="true"
                                  />
                                  {staff.phone}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic text-lg">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-base">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(staff.type)}`}
                              >
                                {STAFF_TYPE_MAP[staff.type] || "Unknown"}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/staff/${staff.id}`);
                                  }}
                                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                  aria-label={`View details for ${staff.name || `${staff.firstName} ${staff.lastName}`}`}
                                >
                                  <EyeIcon
                                    className="w-4 h-4 mr-1.5"
                                    aria-hidden="true"
                                  />
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
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    role="list"
                  >
                    {staffList.results.map((staff) => (
                      <div
                        key={staff.id}
                        className="bg-white border-2 border-zinc-300 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer focus-within:shadow-md"
                        onClick={() => {
                          setSelectedStaff(staff);
                          setShowDetailModal(true);
                        }}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedStaff(staff);
                            setShowDetailModal(true);
                          }
                        }}
                        role="listitem"
                        aria-label={`Staff card for ${staff.name || `${staff.firstName} ${staff.lastName}`}`}
                      >
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-black">
                            <Link
                              to={`/admin/staff/${staff.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 flex items-start focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                            >
                              <UserCircleIcon
                                className="w-6 h-6 mr-2 flex-shrink-0 mt-0.5"
                                aria-hidden="true"
                              />
                              <span className="text-xl">
                                {staff.name ||
                                  `${staff.firstName} ${staff.lastName}`}
                              </span>
                            </Link>
                          </h3>
                        </div>

                        <div className="space-y-2 text-base text-black mb-4">
                          {staff.email && (
                            <div className="flex items-center text-lg">
                              <EnvelopeIcon
                                className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0"
                                aria-hidden="true"
                              />
                              <span className="truncate">{staff.email}</span>
                            </div>
                          )}
                          {staff.phone && (
                            <div className="flex items-center text-lg">
                              <PhoneIcon
                                className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0"
                                aria-hidden="true"
                              />
                              {staff.phone}
                            </div>
                          )}
                          {staff.addressLine1 && (
                            <div className="text-sm text-gray-600 mt-2">
                              {staff.addressLine1}
                              {staff.city && `, ${staff.city}`}
                              {staff.region && `, ${staff.region}`}
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(staff.type)}`}
                          >
                            {STAFF_TYPE_MAP[staff.type] || "Unknown"}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/staff/${staff.id}`);
                            }}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            aria-label={`View details for ${staff.name || `${staff.firstName} ${staff.lastName}`}`}
                          >
                            View Details
                            <ChevronRightIcon
                              className="w-4 h-4 ml-1"
                              aria-hidden="true"
                            />
                          </button>
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
                      disabled={!staffList.hasNextPage}
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
                        {staffList.count > 0 && (
                          <>
                            {" "}
                            of{" "}
                            <span className="font-medium">
                              {Math.ceil(staffList.count / pageSize)}
                            </span>
                          </>
                        )}
                        {staffList.count > 0 && (
                          <span className="ml-2 text-gray-600">
                            ({staffList.count} total staff members)
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
                          disabled={!staffList.hasNextPage}
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
                <UserGroupIcon
                  className="mx-auto h-12 w-12 text-gray-400"
                  aria-hidden="true"
                />
                <h3 className="mt-2 text-sm font-medium text-black">
                  No Staff Members Found
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {searchQuery || status !== 1 || type !== 0
                    ? "No staff members match your current filters. Try adjusting your search criteria."
                    : "No staff members have been added yet."}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  {(searchQuery || status !== 1 || type !== 0) && (
                    <button
                      onClick={handleClearFilters}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/admin/staff/add/step-1-search")}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                    Add First Staff Member
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedStaff && (
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
                  <UserIcon
                    className="w-5 h-5 mr-2 text-blue-600"
                    aria-hidden="true"
                  />
                  Staff Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedStaff(null);
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
                      Full Name:
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-base font-semibold text-black flex items-center">
                      <UserIcon
                        className="w-5 h-5 mr-2 text-gray-600"
                        aria-hidden="true"
                      />
                      {selectedStaff.name ||
                        `${selectedStaff.firstName} ${selectedStaff.lastName}`}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Email:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                        {selectedStaff.email ? (
                          <a
                            href={`mailto:${selectedStaff.email}`}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <EnvelopeIcon
                              className="w-4 h-4 mr-2"
                              aria-hidden="true"
                            />
                            {selectedStaff.email}
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">
                            Not provided
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Phone:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                        {selectedStaff.phone ? (
                          <span className="flex items-center">
                            <PhoneIcon
                              className="w-4 h-4 mr-2"
                              aria-hidden="true"
                            />
                            {selectedStaff.phone}
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
                      <label className="block text-sm font-medium text-black mb-1">
                        Type:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeBadgeColor(selectedStaff.type)}`}
                        >
                          <BriefcaseIcon
                            className="w-4 h-4 mr-1"
                            aria-hidden="true"
                          />
                          {STAFF_TYPE_MAP[selectedStaff.type] || "Unknown"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Status:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(selectedStaff.status)}`}
                        >
                          {selectedStaff.status === 1 ? (
                            <>
                              <CheckCircleIcon
                                className="w-4 h-4 mr-1"
                                aria-hidden="true"
                              />
                              Active
                            </>
                          ) : (
                            <>
                              <ArchiveBoxIcon
                                className="w-4 h-4 mr-1"
                                aria-hidden="true"
                              />
                              Archived
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedStaff.addressLine1 && (
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Address:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                        {selectedStaff.addressLine1}
                        {selectedStaff.city && `, ${selectedStaff.city}`}
                        {selectedStaff.region && `, ${selectedStaff.region}`}
                        {selectedStaff.postalCode &&
                          ` ${selectedStaff.postalCode}`}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedStaff(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(`/admin/staff/${selectedStaff.id}/edit`);
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
                    navigate(`/admin/staff/${selectedStaff.id}`);
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
        {showDeleteModal && selectedStaffForDeletion && (
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
                  Archive Staff Member
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-black mb-4">
                  Are you sure you want to archive this staff member? They will
                  no longer appear in active lists.
                </p>

                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                  <p className="text-sm font-medium text-black mb-1">
                    <strong>Name:</strong>{" "}
                    {selectedStaffForDeletion.name ||
                      `${selectedStaffForDeletion.firstName} ${selectedStaffForDeletion.lastName}`}
                  </p>
                  {selectedStaffForDeletion.email && (
                    <p className="text-sm text-black mt-1">
                      <strong>Email:</strong> {selectedStaffForDeletion.email}
                    </p>
                  )}
                  <p className="text-sm text-black mt-1">
                    <strong>Type:</strong>{" "}
                    {STAFF_TYPE_MAP[selectedStaffForDeletion.type] || "Unknown"}
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
                      system administrator. The staff member's data will be
                      preserved.
                    </span>
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedStaffForDeletion(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {isLoading ? (
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
                      Archive Staff Member
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

export default AdminStaffListPage;
