// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/List/Page.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import {
  useAssociateManager,
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
  BriefcaseIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  HomeIcon,
  CurrencyDollarIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

// Constants for filtering and sorting
const ASSOCIATE_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "1", label: "Active" },
  { value: "2", label: "Archived" },
];

// Associate type constants
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;

const ASSOCIATE_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "0", label: "All" },
  { value: String(RESIDENTIAL_ASSOCIATE_TYPE_OF_ID), label: "Residential" },
  { value: String(COMMERCIAL_ASSOCIATE_TYPE_OF_ID), label: "Commercial" },
];

const ASSOCIATE_SORT_OPTIONS = [
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

function AdminAssociateListPage() {
  const associateManager = useAssociateManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [associates, setAssociates] = useState([]);
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

  // Additional associate-specific filters
  const [isJobSeeker, setIsJobSeeker] = useState(false);
  const [hasTaxId, setHasTaxId] = useState(false);
  const [joinDateGte, setJoinDateGte] = useState("");

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [associateToDelete, setAssociateToDelete] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAssociate, setSelectedAssociate] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch associates using the manager
  const fetchAssociates = useCallback(
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
          // Backend expects 1 for ASC, -1 for DESC
          filtersMap.set("sort_order", sortOrder === "DESC" ? "-1" : "1");
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
        if (isJobSeeker) {
          filtersMap.set("is_job_seeker", "1");
        }
        if (hasTaxId) {
          filtersMap.set("has_tax_id", "1");
        }

        // Use the manager method
        const response = await associateManager.getAssociatesWithFiltersMap(
          filtersMap,
          onUnauthorized,
          true, // force refresh
        );

        setAssociates(response.results || []);
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
        console.error("Failed to fetch associates:", err);
        setError("Failed to load associates. Please try again.");
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
      isJobSeeker,
      hasTaxId,
      associateManager,
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
    fetchAssociates("");
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
    fetchAssociates("");
  }, [fetchAssociates]);

  // Pagination handlers
  const handleNextPage = () => {
    if (hasNextPage && nextCursor) {
      // Push current cursor to history for "Previous" functionality
      setCursorHistory((prev) => [...prev, currentCursor]);
      // Fetch next page
      fetchAssociates(nextCursor);
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
      fetchAssociates(previousCursor || "", true);
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
      fetchAssociates("");
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
    setTimeout(() => fetchAssociates(""), 0);
  };

  // Handle delete associate
  const handleDeleteAssociate = async () => {
    if (!associateToDelete) return;

    try {
      setLoading(true);
      await associateManager.deleteAssociate(
        associateToDelete.id,
        onUnauthorized,
      );

      // Refresh the current page
      fetchAssociates(currentCursor);

      // Reset delete state
      setShowDeleteModal(false);
      setAssociateToDelete(null);
      setSuccessMessage("Associate archived successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to delete associate:", err);
      setError("Failed to delete associate. Please try again.");
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
    setIsJobSeeker(false);
    setHasTaxId(false);
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    setShowFilters(false);
    fetchAssociates("");
  }, [fetchAssociates]);

  // Initial data load
  useEffect(() => {
    fetchAssociates("");
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

  // Format associate type for display
  const getAssociateTypeDisplay = (type) => {
    switch (type) {
      case COMMERCIAL_ASSOCIATE_TYPE_OF_ID:
        return "Commercial";
      case RESIDENTIAL_ASSOCIATE_TYPE_OF_ID:
        return "Residential";
      default:
        return "Unknown";
    }
  };

  // Get badge color for associate type
  const getTypeBadgeColor = (associateType) => {
    switch (associateType) {
      case COMMERCIAL_ASSOCIATE_TYPE_OF_ID:
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case RESIDENTIAL_ASSOCIATE_TYPE_OF_ID:
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Get badge color for job seeker status
  const getJobSeekerBadgeColor = (isJobSeeker) => {
    return isJobSeeker === 1
      ? "bg-purple-100 text-purple-800 border border-purple-200"
      : "bg-gray-100 text-gray-800 border border-gray-200";
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
                  <WrenchScrewdriverIcon
                    className="w-4 h-4 mr-2"
                    aria-hidden="true"
                  />
                  Associates
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black flex items-center">
            <WrenchScrewdriverIcon
              className="w-8 h-8 mr-3 text-blue-600"
              aria-hidden="true"
            />
            Associates Management
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
              Associate List
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
                onClick={() => navigate("/admin/associates/search")}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <MagnifyingGlassIcon
                  className="w-5 h-5 mr-1"
                  aria-hidden="true"
                />
                Advanced Search
              </button>
              <button
                onClick={() => navigate("/admin/associates/add/step-1-search")}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-1" aria-hidden="true" />
                Add Associate
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
                  onClick={() => fetchAssociates(currentCursor)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
                  aria-label="Refresh associate list"
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
                    placeholder="Search associates..."
                    className="w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500"
                    onKeyPress={handleSearchKeyPress}
                    aria-label="Search associates"
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
                    aria-label="Sort associates by"
                  >
                    {ASSOCIATE_SORT_OPTIONS.map((option) => (
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
                    {ASSOCIATE_STATUS_OPTIONS.map((option) => (
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
                    {ASSOCIATE_TYPE_OPTIONS.map((option) => (
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
                      htmlFor="join-date-input"
                      className="block text-sm font-medium text-black mb-1"
                    >
                      Join Date (From)
                    </label>
                    <input
                      id="join-date-input"
                      type="date"
                      value={joinDateGte}
                      onChange={(e) => {
                        setJoinDateGte(e.target.value);
                        setTimeout(() => handleFilterChange(), 0);
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      aria-label="Filter by join date from"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Special Filters
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isJobSeeker}
                          onChange={(e) => {
                            setIsJobSeeker(e.target.checked);
                            setTimeout(() => handleFilterChange(), 0);
                          }}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-black">
                          Filter by Job Seekers
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={hasTaxId}
                          onChange={(e) => {
                            setHasTaxId(e.target.checked);
                            setTimeout(() => handleFilterChange(), 0);
                          }}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-black">
                          Filter by Charges Tax
                        </span>
                      </label>
                    </div>
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
            {loading && !associates.length ? (
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
                  Loading associates...
                </span>
              </div>
            ) : associates.length > 0 ? (
              <>
                {/* Results count */}
                <div className="mb-4 text-sm text-black" aria-live="polite">
                  Showing <strong>{associates.length}</strong> associates
                  {totalCount > 0 && ` of ${totalCount} total`}
                  {searchQuery && ` (filtered by "${searchQuery}")`}
                </div>

                {/* List Display */}
                {viewType === VIEW_TYPE_TABULAR ? (
                  /* Table View */
                  <div
                    className="overflow-x-auto"
                    role="region"
                    aria-label="Associates table"
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
                            Phone
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                          >
                            Email
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
                        {associates.map((associate, index) => (
                          <tr
                            key={associate.id}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-zinc-200"} hover:bg-blue-50 cursor-pointer focus-within:bg-blue-50`}
                            onClick={() => {
                              setSelectedAssociate(associate);
                              setShowDetailModal(true);
                            }}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedAssociate(associate);
                                setShowDetailModal(true);
                              }
                            }}
                            role="row"
                            aria-label={`View details for ${associate.organizationName || `${associate.firstName} ${associate.lastName}`}`}
                          >
                            <td className="px-4 py-4 text-base">
                              <Link
                                to={`/admin/associate/${associate.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                              >
                                {associate.type ===
                                COMMERCIAL_ASSOCIATE_TYPE_OF_ID ? (
                                  <>
                                    <BuildingOffice2Icon
                                      className="w-5 h-5 mr-2 flex-shrink-0"
                                      aria-hidden="true"
                                    />
                                    <span className="text-lg">
                                      {associate.organizationName ||
                                        `${associate.firstName} ${associate.lastName}`}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <HomeIcon
                                      className="w-5 h-5 mr-2 flex-shrink-0"
                                      aria-hidden="true"
                                    />
                                    <span className="text-lg">
                                      {associate.firstName} {associate.lastName}
                                    </span>
                                  </>
                                )}
                              </Link>
                            </td>
                            <td className="px-4 py-4 text-base text-black">
                              {associate.phone ? (
                                <span className="flex items-center text-lg">
                                  <PhoneIcon
                                    className="w-5 h-5 mr-2 text-gray-400"
                                    aria-hidden="true"
                                  />
                                  {associate.phone}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic text-lg">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-base text-black">
                              {associate.email ? (
                                <a
                                  href={`mailto:${associate.email}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                                  aria-label={`Send email to ${associate.email}`}
                                >
                                  <EnvelopeIcon
                                    className="w-5 h-5 mr-2 text-gray-400"
                                    aria-hidden="true"
                                  />
                                  <span className="text-lg">
                                    {associate.email}
                                  </span>
                                </a>
                              ) : (
                                <span className="text-gray-400 italic text-lg">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                      `/admin/associate/${associate.id}`,
                                    );
                                  }}
                                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                  aria-label={`View details for ${associate.organizationName || `${associate.firstName} ${associate.lastName}`}`}
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
                    {associates.map((associate) => (
                      <div
                        key={associate.id}
                        className="bg-white border-2 border-zinc-300 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer focus-within:shadow-md"
                        onClick={() => {
                          setSelectedAssociate(associate);
                          setShowDetailModal(true);
                        }}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedAssociate(associate);
                            setShowDetailModal(true);
                          }
                        }}
                        role="listitem"
                        aria-label={`Associate card for ${associate.organizationName || `${associate.firstName} ${associate.lastName}`}`}
                      >
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-black">
                            <Link
                              to={`/admin/associate/${associate.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 flex items-start focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                            >
                              {associate.type ===
                              COMMERCIAL_ASSOCIATE_TYPE_OF_ID ? (
                                <>
                                  <BuildingOffice2Icon
                                    className="w-6 h-6 mr-2 flex-shrink-0 mt-0.5"
                                    aria-hidden="true"
                                  />
                                  <span className="text-xl">
                                    {associate.organizationName ||
                                      `${associate.firstName} ${associate.lastName}`}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <HomeIcon
                                    className="w-6 h-6 mr-2 flex-shrink-0 mt-0.5"
                                    aria-hidden="true"
                                  />
                                  <span className="text-xl">
                                    {associate.firstName} {associate.lastName}
                                  </span>
                                </>
                              )}
                            </Link>
                          </h3>
                        </div>

                        <div className="space-y-2 text-base text-black mb-4">
                          {associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID &&
                            associate.organizationName && (
                              <div className="text-base">
                                <strong className="text-black">Contact:</strong>{" "}
                                {associate.firstName} {associate.lastName}
                              </div>
                            )}
                          {associate.email && (
                            <div className="flex items-center text-lg">
                              <EnvelopeIcon
                                className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0"
                                aria-hidden="true"
                              />
                              <span className="truncate">
                                {associate.email}
                              </span>
                            </div>
                          )}
                          {associate.phone && (
                            <div className="flex items-center text-lg">
                              <PhoneIcon
                                className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0"
                                aria-hidden="true"
                              />
                              {associate.phone}
                            </div>
                          )}
                          {associate.addressLine1 && (
                            <div className="text-sm text-gray-600 mt-2">
                              {associate.addressLine1}
                              {associate.city && `, ${associate.city}`}
                              {associate.region && `, ${associate.region}`}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/associate/${associate.id}`);
                          }}
                          className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          aria-label={`View details for ${associate.organizationName || `${associate.firstName} ${associate.lastName}`}`}
                        >
                          View Details
                          <ChevronRightIcon
                            className="w-4 h-4 ml-1"
                            aria-hidden="true"
                          />
                        </button>
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
                            ({totalCount} total associates)
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
                <WrenchScrewdriverIcon
                  className="mx-auto h-12 w-12 text-gray-400"
                  aria-hidden="true"
                />
                <h3 className="mt-2 text-sm font-medium text-black">
                  No Associates Found
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {searchQuery ||
                  statusFilter !== "1" ||
                  typeFilter ||
                  isJobSeeker ||
                  hasTaxId
                    ? "No associates match your current filters. Try adjusting your search criteria."
                    : "No associates have been added yet."}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  {(searchQuery ||
                    statusFilter !== "1" ||
                    typeFilter ||
                    isJobSeeker ||
                    hasTaxId) && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() =>
                      navigate("/admin/associates/add/step-1-search")
                    }
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                    Add First Associate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedAssociate && (
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
                  Associate Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedAssociate(null);
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
                      {selectedAssociate.type ===
                      COMMERCIAL_ASSOCIATE_TYPE_OF_ID
                        ? "Organization Name:"
                        : "Full Name:"}
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-base font-semibold text-black flex items-center">
                      {selectedAssociate.type ===
                      COMMERCIAL_ASSOCIATE_TYPE_OF_ID ? (
                        <>
                          <BuildingOffice2Icon
                            className="w-5 h-5 mr-2 text-gray-600"
                            aria-hidden="true"
                          />
                          {selectedAssociate.organizationName ||
                            `${selectedAssociate.firstName} ${selectedAssociate.lastName}`}
                        </>
                      ) : (
                        <>
                          <UserIcon
                            className="w-5 h-5 mr-2 text-gray-600"
                            aria-hidden="true"
                          />
                          {selectedAssociate.firstName}{" "}
                          {selectedAssociate.lastName}
                        </>
                      )}
                    </div>
                  </div>

                  {selectedAssociate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID &&
                    selectedAssociate.organizationName && (
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Contact Person:
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                          {selectedAssociate.firstName}{" "}
                          {selectedAssociate.lastName}
                        </div>
                      </div>
                    )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Email:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                        {selectedAssociate.email ? (
                          <a
                            href={`mailto:${selectedAssociate.email}`}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <EnvelopeIcon
                              className="w-4 h-4 mr-2"
                              aria-hidden="true"
                            />
                            {selectedAssociate.email}
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
                        {selectedAssociate.phone ? (
                          <span className="flex items-center">
                            <PhoneIcon
                              className="w-4 h-4 mr-2"
                              aria-hidden="true"
                            />
                            {selectedAssociate.phone}
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
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeBadgeColor(selectedAssociate.type)}`}
                        >
                          {selectedAssociate.type ===
                          COMMERCIAL_ASSOCIATE_TYPE_OF_ID ? (
                            <BuildingOffice2Icon
                              className="w-4 h-4 mr-1"
                              aria-hidden="true"
                            />
                          ) : (
                            <HomeIcon
                              className="w-4 h-4 mr-1"
                              aria-hidden="true"
                            />
                          )}
                          {getAssociateTypeDisplay(selectedAssociate.type)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Job Seeker:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getJobSeekerBadgeColor(selectedAssociate.isJobSeeker)}`}
                        >
                          <BriefcaseIcon
                            className="w-4 h-4 mr-1"
                            aria-hidden="true"
                          />
                          {selectedAssociate.isJobSeeker === 1 ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedAssociate.addressLine1 && (
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Address:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                        {selectedAssociate.addressLine1}
                        {selectedAssociate.city &&
                          `, ${selectedAssociate.city}`}
                        {selectedAssociate.region &&
                          `, ${selectedAssociate.region}`}
                        {selectedAssociate.postalCode &&
                          ` ${selectedAssociate.postalCode}`}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedAssociate(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(`/admin/associate/${selectedAssociate.id}/edit`);
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
                    navigate(`/admin/associate/${selectedAssociate.id}`);
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
        {showDeleteModal && associateToDelete && (
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
                  Archive Associate
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-black mb-4">
                  Are you sure you want to archive this associate? They will no
                  longer appear in active lists.
                </p>

                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                  <p className="text-sm font-medium text-black mb-1">
                    <strong>Name:</strong> {associateToDelete.firstName}{" "}
                    {associateToDelete.lastName}
                  </p>
                  {associateToDelete.email && (
                    <p className="text-sm text-black mt-1">
                      <strong>Email:</strong> {associateToDelete.email}
                    </p>
                  )}
                  <p className="text-sm text-black mt-1">
                    <strong>Type:</strong>{" "}
                    {getAssociateTypeDisplay(associateToDelete.type)}
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
                      system administrator. The associate's data will be
                      preserved.
                    </span>
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setAssociateToDelete(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAssociate}
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
                      Archive Associate
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

export default AdminAssociateListPage;
