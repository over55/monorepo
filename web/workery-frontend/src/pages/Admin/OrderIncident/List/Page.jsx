// File Path: monorepo/web/workery-frontend/src/pages/Admin/OrderIncident/List/Page.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import {
  useOrderIncidentManager,
  useAuthManager,
} from "../../../../services/Services";
import {
  FireIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  XMarkIcon,
  PencilSquareIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  UserIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ShieldExclamationIcon,
  ClipboardDocumentCheckIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  TableCellsIcon,
  Squares2X2Icon,
  BriefcaseIcon,
  UserGroupIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { ORDER_INCIDENT_SORT_OPTIONS } from "../../../../constants/FieldOptions";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";

// Status constants
const INCIDENT_STATUS_OPEN = "open";
const INCIDENT_STATUS_CLOSED = "closed";

const INCIDENT_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: INCIDENT_STATUS_OPEN, label: "Open" },
  { value: INCIDENT_STATUS_CLOSED, label: "Closed" },
];

const INITIATOR_OPTIONS = [
  { value: "", label: "All Initiators" },
  { value: "1", label: "Client" },
  { value: "2", label: "Associate" },
  { value: "3", label: "Staff" },
];

const PAGE_SIZE_OPTIONS = [
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
  { value: 250, label: "250 per page" },
];

const VIEW_TYPE_TABULAR = "tabular";
const VIEW_TYPE_GRID = "grid";

function AdminOrderIncidentListPage() {
  const orderIncidentManager = useOrderIncidentManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [incidents, setIncidents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [initiatorFilter, setInitiatorFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at,DESC");
  const [viewType, setViewType] = useState(VIEW_TYPE_TABULAR);
  const [showFilters, setShowFilters] = useState(false);

  // Additional filters
  const [createdDateGte, setCreatedDateGte] = useState("");
  const [createdDateLte, setCreatedDateLte] = useState("");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch incidents using the manager
  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build params
      const params = {
        sortBy: sortBy,
        page: currentPage,
        limit: pageSize,
      };

      // Add search if present
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      // Add filters
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (initiatorFilter) {
        params.initiator = initiatorFilter;
      }
      if (createdDateGte) {
        params.createdDateGte = createdDateGte;
      }
      if (createdDateLte) {
        params.createdDateLte = createdDateLte;
      }

      // Use the manager method with forceRefresh to bypass cache for filter changes
      const response = await orderIncidentManager.getOrderIncidents(
        params,
        onUnauthorized,
        false, // Don't force refresh for normal pagination
      );

      setIncidents(response.results || []);
      setTotalCount(response.count || 0);
      setHasNextPage(response.hasNextPage || false);
    } catch (err) {
      console.error("Failed to fetch incidents:", err);
      setError("Failed to load incidents. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    pageSize,
    sortBy,
    searchQuery,
    statusFilter,
    initiatorFilter,
    createdDateGte,
    createdDateLte,
    currentPage,
    orderIncidentManager,
    onUnauthorized,
  ]);

  // Handle search
  const handleSearch = () => {
    setSearchQuery(tempSearchQuery);
    setCurrentPage(1);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  // Handle initiator filter change
  const handleInitiatorFilterChange = (e) => {
    const newInitiator = e.target.value;
    setInitiatorFilter(newInitiator);
    setCurrentPage(1);
  };

  // Handle date filter changes
  const handleCreatedDateGteChange = (e) => {
    setCreatedDateGte(e.target.value);
    setCurrentPage(1);
  };

  const handleCreatedDateLteChange = (e) => {
    setCreatedDateLte(e.target.value);
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setTempSearchQuery("");
    setStatusFilter("");
    setInitiatorFilter("");
    setSortBy("created_at,DESC");
    setCreatedDateGte("");
    setCreatedDateLte("");
    setCurrentPage(1);
    setShowFilters(false);
  }, []);

  // Trigger fetch when relevant parameters change
  useEffect(() => {
    fetchIncidents();
  }, [
    currentPage,
    pageSize,
    sortBy,
    searchQuery,
    statusFilter,
    initiatorFilter,
    createdDateGte,
    createdDateLte,
  ]);

  // Check authentication on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
    }
  }, [authManager, navigate]);

  // Handle success message from navigation state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  }, [location]);

  // Format initiator for display
  const getInitiatorDisplay = (initiator) => {
    switch (initiator) {
      case 1:
        return "Client";
      case 2:
        return "Associate";
      case 3:
        return "Staff";
      default:
        return "Unknown";
    }
  };

  // Get badge color for initiator
  const getInitiatorBadgeColor = (initiator) => {
    switch (initiator) {
      case 1:
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case 2:
        return "bg-green-100 text-green-800 border border-green-200";
      case 3:
        return "bg-purple-100 text-purple-800 border border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Get badge color for status
  const getStatusBadgeColor = (incident) => {
    return incident.closingReason
      ? "bg-green-100 text-green-800 border border-green-200"
      : "bg-amber-100 text-amber-800 border border-amber-200";
  };

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasPreviousPage = currentPage > 1;

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
                  <FireIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                  Incidents
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black flex items-center">
            <FireIcon
              className="w-8 h-8 mr-3 text-red-600"
              aria-hidden="true"
            />
            Incidents Management
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
              Incident List
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
                onClick={() => navigate("/admin/incidents/search")}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <MagnifyingGlassIcon
                  className="w-5 h-5 mr-1"
                  aria-hidden="true"
                />
                Advanced Search
              </button>
              <button
                onClick={() => navigate("/admin/incidents/create")}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-1" aria-hidden="true" />
                Add Incident
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
                  onClick={() => fetchIncidents()}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
                  aria-label="Refresh incident list"
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
                    placeholder="Search incidents..."
                    className="w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500"
                    onKeyPress={handleSearchKeyPress}
                    aria-label="Search incidents"
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
                    aria-label="Sort incidents by"
                  >
                    {ORDER_INCIDENT_SORT_OPTIONS.map((option) => (
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
                    onChange={handleStatusFilterChange}
                    className="w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-black"
                    aria-label="Filter by status"
                  >
                    {INCIDENT_STATUS_OPTIONS.map((option) => (
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

              {/* Initiator Filter */}
              <div>
                <label
                  htmlFor="initiator-select"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Initiated By
                </label>
                <div className="relative">
                  <select
                    id="initiator-select"
                    value={initiatorFilter}
                    onChange={handleInitiatorFilterChange}
                    className="w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-black"
                    aria-label="Filter by initiator"
                  >
                    {INITIATOR_OPTIONS.map((option) => (
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
                      htmlFor="created-date-from"
                      className="block text-sm font-medium text-black mb-1"
                    >
                      Created Date (From)
                    </label>
                    <input
                      id="created-date-from"
                      type="date"
                      value={createdDateGte}
                      onChange={handleCreatedDateGteChange}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      aria-label="Filter by created date from"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="created-date-to"
                      className="block text-sm font-medium text-black mb-1"
                    >
                      Created Date (To)
                    </label>
                    <input
                      id="created-date-to"
                      type="date"
                      value={createdDateLte}
                      onChange={handleCreatedDateLteChange}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      aria-label="Filter by created date to"
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
            {loading && !incidents.length ? (
              <div
                className="flex items-center justify-center py-12"
                role="status"
                aria-live="polite"
              >
                <div
                  className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
                  aria-hidden="true"
                ></div>
                <span className="ml-3 text-gray-600">Loading incidents...</span>
              </div>
            ) : incidents.length > 0 ? (
              <>
                {/* Results count */}
                <div className="mb-4 text-sm text-black" aria-live="polite">
                  Showing <strong>{incidents.length}</strong> incidents
                  {totalCount > 0 && ` of ${totalCount} total`}
                  {searchQuery && ` (filtered by "${searchQuery}")`}
                </div>

                {/* List Display */}
                {viewType === VIEW_TYPE_TABULAR ? (
                  /* Table View */
                  <div
                    className="overflow-x-auto"
                    role="region"
                    aria-label="Incidents table"
                  >
                    <table className="min-w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider rounded-tl-lg"
                          >
                            Title
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                          >
                            Order
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                          >
                            Initiated By
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                          >
                            Created At
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
                        {incidents.map((incident, index) => (
                          <tr
                            key={incident.id}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-zinc-200"} hover:bg-blue-50 cursor-pointer focus-within:bg-blue-50`}
                            onClick={() => {
                              setSelectedIncident(incident);
                              setShowDetailModal(true);
                            }}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedIncident(incident);
                                setShowDetailModal(true);
                              }
                            }}
                            role="row"
                            aria-label={`View details for ${incident.title}`}
                          >
                            <td className="px-4 py-4 text-base">
                              <Link
                                to={`/admin/incident/${incident.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                              >
                                <ShieldExclamationIcon
                                  className="w-5 h-5 mr-2 flex-shrink-0"
                                  aria-hidden="true"
                                />
                                <span className="text-lg">
                                  {incident.title}
                                </span>
                              </Link>
                            </td>
                            <td className="px-4 py-4 text-base text-black">
                              {incident.orderId ? (
                                <Link
                                  to={`/admin/order/${incident.orderId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-600 hover:text-blue-800 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                                  aria-label={`View order ${incident.orderId}`}
                                >
                                  #{incident.orderId}
                                </Link>
                              ) : (
                                <span className="text-gray-400 italic text-lg">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-base">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getInitiatorBadgeColor(incident.initiator)}`}
                              >
                                {getInitiatorDisplay(incident.initiator)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-base text-black">
                              <span className="text-lg">
                                {formatDateForDisplay(incident.createdAt)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-base">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(incident)}`}
                              >
                                {incident.closingReason ? "Closed" : "Open"}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/incident/${incident.id}`);
                                  }}
                                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                  aria-label={`View details for ${incident.title}`}
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
                    {incidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="bg-white border-2 border-zinc-300 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer focus-within:shadow-md"
                        onClick={() => {
                          setSelectedIncident(incident);
                          setShowDetailModal(true);
                        }}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedIncident(incident);
                            setShowDetailModal(true);
                          }
                        }}
                        role="listitem"
                        aria-label={`Incident card for ${incident.title}`}
                      >
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-black">
                            <Link
                              to={`/admin/incident/${incident.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 flex items-start focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                            >
                              <ShieldExclamationIcon
                                className="w-6 h-6 mr-2 flex-shrink-0 mt-0.5"
                                aria-hidden="true"
                              />
                              <span className="line-clamp-2 text-xl">
                                {incident.title}
                              </span>
                            </Link>
                          </h3>
                        </div>

                        <div className="space-y-2 text-base text-black mb-4">
                          {incident.orderId && (
                            <div className="flex items-center text-lg">
                              <DocumentTextIcon
                                className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0"
                                aria-hidden="true"
                              />
                              <span>
                                Order{" "}
                                <Link
                                  to={`/admin/order/${incident.orderId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-0.5"
                                >
                                  #{incident.orderId}
                                </Link>
                              </span>
                            </div>
                          )}
                          <div className="flex items-center text-lg">
                            <CalendarDaysIcon
                              className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0"
                              aria-hidden="true"
                            />
                            {formatDateForDisplay(incident.createdAt)}
                          </div>
                          {incident.description && (
                            <div className="text-sm text-gray-600 line-clamp-2 mt-2">
                              {incident.description}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getInitiatorBadgeColor(incident.initiator)}`}
                          >
                            {getInitiatorDisplay(incident.initiator)}
                          </span>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(incident)}`}
                          >
                            {incident.closingReason ? (
                              <>
                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                Closed
                              </>
                            ) : (
                              <>
                                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                                Open
                              </>
                            )}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/incident/${incident.id}`);
                          }}
                          className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          aria-label={`View details for ${incident.title}`}
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
                        Page <span className="font-medium">{currentPage}</span>
                        {totalPages > 0 && (
                          <>
                            {" "}
                            of <span className="font-medium">{totalPages}</span>
                          </>
                        )}
                        {totalCount > 0 && (
                          <span className="ml-2 text-gray-600">
                            ({totalCount} total incidents)
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
                          Page {currentPage}
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
                <FireIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-black">
                  No Incidents Found
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {searchQuery ||
                  statusFilter ||
                  initiatorFilter ||
                  createdDateGte ||
                  createdDateLte
                    ? "No incidents match your current filters. Try adjusting your search criteria."
                    : "No incidents have been reported yet."}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  {(searchQuery ||
                    statusFilter ||
                    initiatorFilter ||
                    createdDateGte ||
                    createdDateLte) && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/admin/incidents/create")}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Report First Incident
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedIncident && (
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
                  <ShieldExclamationIcon
                    className="w-5 h-5 mr-2 text-red-600"
                    aria-hidden="true"
                  />
                  Incident Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedIncident(null);
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
                      Title:
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-base font-semibold text-black">
                      {selectedIncident.title}
                    </div>
                  </div>

                  {selectedIncident.description && (
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Description:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                        {selectedIncident.description}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Order:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                        {selectedIncident.orderId ? (
                          <Link
                            to={`/admin/order/${selectedIncident.orderId}`}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <DocumentTextIcon className="w-4 h-4 mr-2" />
                            Order #{selectedIncident.orderId}
                          </Link>
                        ) : (
                          <span className="text-gray-400 italic">
                            Not linked to an order
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Created At:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                        <span className="flex items-center">
                          <CalendarDaysIcon className="w-4 h-4 mr-2" />
                          {formatDateForDisplay(selectedIncident.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Initiated By:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getInitiatorBadgeColor(selectedIncident.initiator)}`}
                        >
                          <UserGroupIcon className="w-4 h-4 mr-1" />
                          {getInitiatorDisplay(selectedIncident.initiator)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Status:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(selectedIncident)}`}
                        >
                          {selectedIncident.closingReason ? (
                            <>
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Closed
                            </>
                          ) : (
                            <>
                              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                              Open
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedIncident.closingReason && (
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Closing Reason:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                        {selectedIncident.closingReason}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedIncident(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(`/admin/incident/${selectedIncident.id}/edit`);
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <PencilSquareIcon className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(`/admin/incident/${selectedIncident.id}`);
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrderIncidentListPage;
