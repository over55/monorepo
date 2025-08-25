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
  const [pageSize, setPageSize] = useState(25);
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

      // Use the manager method
      const response = await orderIncidentManager.getOrderIncidents(
        params,
        onUnauthorized,
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

  // Handle filter changes
  const handleFilterChange = useCallback(() => {
    setCurrentPage(1);
  }, []);

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

  // Initial data load and reload on parameter changes
  useEffect(() => {
    fetchIncidents();
  }, [
    sortBy,
    currentPage,
    pageSize,
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
        return "bg-blue-100 text-blue-800";
      case 2:
        return "bg-green-100 text-green-800";
      case 3:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get badge color for status
  const getStatusBadgeColor = (incident) => {
    return incident.closingReason
      ? "bg-green-100 text-green-800"
      : "bg-amber-100 text-amber-800";
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
                  <FireIcon className="w-4 h-4 mr-2" />
                  Incidents
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FireIcon className="w-8 h-8 mr-3 text-red-600" />
            Incidents Management
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
              Incident List
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
                onClick={() => navigate("/admin/incidents/create")}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-1" />
                Add Incident
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
                  onClick={() => fetchIncidents()}
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
                    placeholder="Search incidents..."
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
                    {ORDER_INCIDENT_SORT_OPTIONS.map((option) => (
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
                      handleFilterChange();
                    }}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    {INCIDENT_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Initiator Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initiated By
                </label>
                <div className="relative">
                  <select
                    value={initiatorFilter}
                    onChange={(e) => {
                      setInitiatorFilter(e.target.value);
                      handleFilterChange();
                    }}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    {INITIATOR_OPTIONS.map((option) => (
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
                      Created Date (From)
                    </label>
                    <input
                      type="date"
                      value={createdDateGte}
                      onChange={(e) => {
                        setCreatedDateGte(e.target.value);
                        handleFilterChange();
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created Date (To)
                    </label>
                    <input
                      type="date"
                      value={createdDateLte}
                      onChange={(e) => {
                        setCreatedDateLte(e.target.value);
                        handleFilterChange();
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
            {loading && !incidents.length ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading incidents...</span>
              </div>
            ) : incidents.length > 0 ? (
              <>
                {/* Results count */}
                <div className="mb-4 text-sm text-gray-600">
                  Showing <strong>{incidents.length}</strong> incidents
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
                            Title
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Initiated By
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created At
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
                        {incidents.map((incident) => (
                          <tr
                            key={incident.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setSelectedIncident(incident);
                              setShowDetailModal(true);
                            }}
                          >
                            <td className="px-3 py-4 text-sm">
                              <Link
                                to={`/admin/incident/${incident.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                              >
                                <ShieldExclamationIcon className="w-4 h-4 mr-2" />
                                {incident.title}
                              </Link>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              {incident.orderId ? (
                                <Link
                                  to={`/admin/order/${incident.orderId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  #{incident.orderId}
                                </Link>
                              ) : (
                                <span className="text-gray-400 italic">—</span>
                              )}
                            </td>
                            <td className="px-3 py-4 text-sm">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getInitiatorBadgeColor(incident.initiator)}`}
                              >
                                {getInitiatorDisplay(incident.initiator)}
                              </span>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              {formatDate(incident.createdAt)}
                            </td>
                            <td className="px-3 py-4 text-sm">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(incident)}`}
                              >
                                {incident.closingReason ? "Closed" : "Open"}
                              </span>
                            </td>
                            <td className="px-3 py-4">
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/incident/${incident.id}`);
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
                    {incidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setSelectedIncident(incident);
                          setShowDetailModal(true);
                        }}
                      >
                        <div className="mb-3">
                          <h3 className="text-base font-semibold text-gray-900">
                            <Link
                              to={`/admin/incident/${incident.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 flex items-start"
                            >
                              <ShieldExclamationIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-2">
                                {incident.title}
                              </span>
                            </Link>
                          </h3>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-3">
                          {incident.orderId && (
                            <div className="flex items-center">
                              <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-400" />
                              <span>
                                Order{" "}
                                <Link
                                  to={`/admin/order/${incident.orderId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  #{incident.orderId}
                                </Link>
                              </span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <CalendarDaysIcon className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(incident.createdAt)}
                          </div>
                          {incident.description && (
                            <div className="text-xs text-gray-500 line-clamp-2">
                              {incident.description}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getInitiatorBadgeColor(incident.initiator)}`}
                          >
                            {getInitiatorDisplay(incident.initiator)}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(incident)}`}
                          >
                            {incident.closingReason ? (
                              <>
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                Closed
                              </>
                            ) : (
                              <>
                                <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
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
                        Page <span className="font-medium">{currentPage}</span>
                        {totalPages > 0 && (
                          <>
                            {" "}
                            of <span className="font-medium">{totalPages}</span>
                          </>
                        )}
                        {totalCount > 0 && (
                          <span className="ml-2 text-gray-500">
                            ({totalCount} total incidents)
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
                          Page {currentPage}
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
                <FireIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No Incidents Found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
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
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/admin/incidents/create")}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ShieldExclamationIcon className="w-5 h-5 mr-2 text-red-600" />
                  Incident Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedIncident(null);
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
                      Title:
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-base font-semibold text-gray-900">
                      {selectedIncident.title}
                    </div>
                  </div>

                  {selectedIncident.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        {selectedIncident.description}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Created At:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        <span className="flex items-center">
                          <CalendarDaysIcon className="w-4 h-4 mr-2" />
                          {formatDate(selectedIncident.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Closing Reason:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(`/admin/incident/${selectedIncident.id}/edit`);
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600"
                >
                  <PencilSquareIcon className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(`/admin/incident/${selectedIncident.id}`);
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
      </div>
    </div>
  );
}

export default AdminOrderIncidentListPage;
