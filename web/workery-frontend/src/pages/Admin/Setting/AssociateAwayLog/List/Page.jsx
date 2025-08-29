// File Path: monorepo/web/workery-frontend/src/pages/Admin/Setting/AssociateAwayLog/List/Page.jsx

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAssociateAwayLogManager,
  useAssociateManager,
} from "../../../../../services/Services";
import {
  CalendarDaysIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  XMarkIcon,
  TrashIcon,
  PencilSquareIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ShieldExclamationIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

// Constants - Updated to match backend
const SORT_OPTIONS = [
  { value: "created_at,DESC", label: "Created At (Newest)" },
  { value: "created_at,ASC", label: "Created At (Oldest)" },
  { value: "start_date,DESC", label: "Start Date (Newest)" },
  { value: "start_date,ASC", label: "Start Date (Oldest)" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "1", label: "Active" },
  { value: "2", label: "Archived" },
];

// Updated reason map to include expired documents
const REASON_MAP = {
  1: "Other",
  2: "Going on vacation",
  3: "Personal reasons",
  4: "Commercial insurance expired",
  5: "Police check expired",
  6: "Auto Insurance Expired",
  7: "WSIB Expired",
  8: "Dues Date Expired",
};

// Constants for reason codes
const REASON_COMMERCIAL_INSURANCE_EXPIRED = 4;
const REASON_POLICE_CHECK_EXPIRED = 5;

function SettingAssociateAwayLogListPage() {
  const associateAwayLogManager = useAssociateAwayLogManager();
  const associateManager = useAssociateManager();
  const navigate = useNavigate();
  const isLoadingRef = useRef(false);

  // State management
  const [associateAwayLogs, setAssociateAwayLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Associates with expired documents
  const [associatesWithExpiredDocs, setAssociatesWithExpiredDocs] = useState(
    [],
  );
  const [checkingExpiredDocs, setCheckingExpiredDocs] = useState(false);
  const [showExpiredDocsModal, setShowExpiredDocsModal] = useState(false);

  // Filter state
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [pageSize, setPageSize] = useState(25);

  // Cursor-based pagination state
  const [currentCursor, setCurrentCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursorHistory, setCursorHistory] = useState([]); // Stack to track previous cursors
  const [totalCount, setTotalCount] = useState(0);

  // Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAwayLog, setSelectedAwayLog] = useState(null);

  // Mobile filter toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Check for associates with expired insurance/police checks
  const checkForExpiredDocuments = async () => {
    try {
      setCheckingExpiredDocs(true);

      // Get all active associates
      const associatesResponse = await associateManager.getAssociates(
        {
          status: 1, // Active associates only
          limit: 1000, // Get a large batch
        },
        onUnauthorized,
        true, // Force refresh
      );

      if (!associatesResponse || !associatesResponse.results) {
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiredAssociates = [];

      // Check each associate for expired documents
      for (const associate of associatesResponse.results) {
        const expiredReasons = [];

        // Check commercial insurance expiry
        if (associate.commercialInsuranceExpiryDate) {
          const expiryDate = new Date(associate.commercialInsuranceExpiryDate);
          if (expiryDate < today) {
            expiredReasons.push({
              type: "insurance",
              reason: REASON_COMMERCIAL_INSURANCE_EXPIRED,
              expiryDate: associate.commercialInsuranceExpiryDate,
            });
          }
        }

        // Check police check expiry
        if (associate.policeCheckDate) {
          const policeCheckDate = new Date(associate.policeCheckDate);
          // Police checks typically expire after 3 years
          const expiryDate = new Date(policeCheckDate);
          expiryDate.setFullYear(expiryDate.getFullYear() + 3);

          if (expiryDate < today) {
            expiredReasons.push({
              type: "police",
              reason: REASON_POLICE_CHECK_EXPIRED,
              expiryDate: expiryDate.toISOString(),
            });
          }
        }

        if (expiredReasons.length > 0) {
          // Check if this associate already has an active away log for these reasons
          const hasExistingAwayLog = associateAwayLogs.some(
            (log) =>
              log.associateId === associate.id &&
              log.status === 1 && // Active
              expiredReasons.some((er) => er.reason === log.reason),
          );

          if (!hasExistingAwayLog) {
            expiredAssociates.push({
              associate,
              expiredReasons,
            });
          }
        }
      }

      setAssociatesWithExpiredDocs(expiredAssociates);

      // Show notification if there are associates with expired docs
      if (expiredAssociates.length > 0) {
        setError(
          `Found ${expiredAssociates.length} associate(s) with expired documents not on away list`,
        );
        setShowExpiredDocsModal(true);
      }
    } catch (err) {
      console.error("Failed to check for expired documents:", err);
    } finally {
      setCheckingExpiredDocs(false);
    }
  };

  // Create away log for expired document
  const createAwayLogForExpiredDoc = async (
    associateId,
    associateName,
    reason,
    expiryDate,
  ) => {
    try {
      setLoading(true);

      const awayLogData = {
        associateId: associateId,
        associateName: associateName,
        reason: reason,
        reasonOther: reason === 1 ? "Expired document" : "",
        untilFurtherNotice: 1, // Yes - until further notice
        startDate: expiryDate || new Date().toISOString(),
        status: 1, // Active
      };

      await associateAwayLogManager.createAssociateAwayLog(
        awayLogData,
        onUnauthorized,
      );

      setSuccess(`Away log created for ${associateName}`);

      // Reset pagination and refresh
      setCurrentCursor("");
      setCursorHistory([]);
      await fetchAssociateAwayLogs(true, "");

      // Re-check for expired documents
      await checkForExpiredDocuments();
    } catch (err) {
      console.error("Failed to create away log:", err);
      setError(err.message || "Failed to create away log");
    } finally {
      setLoading(false);
    }
  };

  // Create away logs for all expired documents
  const createAllAwayLogsForExpiredDocs = async () => {
    if (!associatesWithExpiredDocs || associatesWithExpiredDocs.length === 0) {
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const item of associatesWithExpiredDocs) {
      for (const expiredReason of item.expiredReasons) {
        try {
          await createAwayLogForExpiredDoc(
            item.associate.id,
            item.associate.name,
            expiredReason.reason,
            expiredReason.expiryDate,
          );
          successCount++;
        } catch (err) {
          errorCount++;
          console.error(
            `Failed to create away log for ${item.associate.name}:`,
            err,
          );
        }
      }
    }

    if (successCount > 0) {
      setSuccess(`Created ${successCount} away log(s) for expired documents`);
    }

    if (errorCount > 0) {
      setError(`Failed to create ${errorCount} away log(s)`);
    }

    setShowExpiredDocsModal(false);
    setLoading(false);

    // Reset pagination and refresh
    setCurrentCursor("");
    setCursorHistory([]);
    await fetchAssociateAwayLogs(true, "");
  };

  // Fetch associate away logs with cursor
  const fetchAssociateAwayLogs = async (forceRefresh = false, cursor = "") => {
    // Prevent double loading
    if (isLoadingRef.current && !forceRefresh) {
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      const params = {
        page_size: pageSize,
        cursor: cursor || undefined,
        search: searchText.trim() || undefined,
        status: statusFilter || undefined,
        sort_field: sortBy,
        sort_order: sortOrder,
      };

      // Remove undefined values
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      // Create filters map for the API
      const filtersMap = new Map();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          filtersMap.set(key, value);
        }
      });

      const response =
        await associateAwayLogManager.getAssociateAwayLogsWithFiltersMap(
          filtersMap,
          onUnauthorized,
          forceRefresh,
        );

      setAssociateAwayLogs(response.results || []);
      setTotalCount(response.count || 0);
      setNextCursor(response.nextCursor || "");
      setHasNextPage(response.hasNextPage || false);

      // After fetching away logs, check for expired documents
      await checkForExpiredDocuments();
    } catch (err) {
      console.error("Failed to fetch associate away logs:", err);
      setError(err.message || "Failed to load associate away logs");
      setAssociateAwayLogs([]);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  // Handle search
  const handleSearch = () => {
    setCurrentCursor("");
    setCursorHistory([]);
    fetchAssociateAwayLogs(true, "");
  };

  // Clear filters
  const handleClearFilters = async () => {
    setSearchText("");
    setStatusFilter("");
    setSortBy("created_at");
    setSortOrder("DESC");
    setCurrentCursor("");
    setCursorHistory([]);
    setShowMobileFilters(false);

    // Force refresh with cleared values
    setTimeout(() => {
      fetchAssociateAwayLogs(true, "");
    }, 0);
  };

  // Handle pagination
  const handleNextPage = () => {
    if (hasNextPage && nextCursor) {
      // Save current cursor to history for "previous" functionality
      setCursorHistory((prev) => [...prev, currentCursor]);
      setCurrentCursor(nextCursor);
      fetchAssociateAwayLogs(true, nextCursor);
    }
  };

  const handlePreviousPage = () => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      const previousCursor = newHistory.pop();
      setCursorHistory(newHistory);
      setCurrentCursor(previousCursor);
      fetchAssociateAwayLogs(true, previousCursor);
    }
  };

  // Handle view detail
  const handleViewDetail = (awayLog) => {
    setSelectedAwayLog(awayLog);
    setShowDetailModal(true);
  };

  // Handle delete
  const handleDelete = (awayLog) => {
    setSelectedAwayLog(awayLog);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedAwayLog) return;

    try {
      setLoading(true);
      await associateAwayLogManager.deleteAssociateAwayLog(
        selectedAwayLog.id,
        onUnauthorized,
      );
      setSuccess("Associate away log deleted successfully");
      setShowDeleteModal(false);
      setSelectedAwayLog(null);

      // Reset to first page after delete
      setCurrentCursor("");
      setCursorHistory([]);
      fetchAssociateAwayLogs(true, "");
    } catch (err) {
      console.error("Failed to delete associate away log:", err);
      setError(err.message || "Failed to delete associate away log");
    } finally {
      setLoading(false);
    }
  };

  // Initial load and handle filter changes
  useEffect(() => {
    // Reset cursor when filters change
    setCurrentCursor("");
    setCursorHistory([]);
    fetchAssociateAwayLogs(true, "");
  }, [statusFilter, sortBy, sortOrder, pageSize]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Format datetime helper
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Calculate displayed records
  const startRecord = associateAwayLogs.length > 0 ? 1 : 0;
  const endRecord = associateAwayLogs.length;
  const hasPreviousPage = cursorHistory.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumb - Responsive */}
        <nav className="flex mb-4 sm:mb-6 lg:mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-wrap">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <ChartBarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Link
                  to="/admin/settings"
                  className="ml-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <Cog6ToothIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Settings
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="ml-1 text-xs sm:text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <CalendarDaysIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Associate Away Logs</span>
                  <span className="sm:hidden">Away Logs</span>
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header - Responsive */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
            <CalendarDaysIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-2 sm:mr-3 text-gray-700" />
            <span className="hidden sm:inline">Associate Away Logs</span>
            <span className="sm:hidden">Away Logs</span>
          </h1>
        </div>

        {/* Success/Error Messages - Responsive */}
        {success && (
          <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 text-green-800 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-sm sm:text-base">
              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              <span className="break-words">{success}</span>
            </span>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-600 hover:text-green-800 ml-2 flex-shrink-0"
            >
              <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-800 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-sm sm:text-base">
              <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              <span className="break-words">{error}</span>
            </span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
            >
              <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {/* Expired Documents Warning */}
        {associatesWithExpiredDocs.length > 0 && !showExpiredDocsModal && (
          <div className="mb-4 sm:mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 sm:px-4 sm:py-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="flex items-center text-sm sm:text-base">
                <ShieldExclamationIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                <span>
                  {associatesWithExpiredDocs.length} associate(s) have expired
                  documents but are not on the away list
                </span>
              </span>
              <button
                onClick={() => setShowExpiredDocsModal(true)}
                className="ml-2 px-3 py-1 bg-amber-600 text-white text-xs sm:text-sm rounded hover:bg-amber-700"
              >
                View & Fix
              </button>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white shadow-sm rounded-lg">
          {/* Card Header - Responsive */}
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
              <ClipboardDocumentListIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              List
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => checkForExpiredDocuments()}
                disabled={checkingExpiredDocs}
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-500 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:opacity-50"
              >
                {checkingExpiredDocs ? (
                  <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-0.5 sm:mr-1 animate-spin" />
                ) : (
                  <DocumentCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-0.5 sm:mr-1" />
                )}
                <span className="hidden sm:inline">Check Expired Docs</span>
                <span className="sm:hidden">Check</span>
              </button>
              <button
                onClick={() =>
                  navigate("/admin/settings/associate-away-log/create")
                }
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">New</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          {/* Filters Section - Responsive */}
          <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                <FunnelIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Filtering & Sorting</span>
                <span className="sm:hidden">Filters</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="sm:hidden text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  {showMobileFilters ? "Hide" : "Show"} Filters
                </button>
                <button
                  onClick={handleClearFilters}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <XMarkIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                  Clear
                </button>
              </div>
            </div>

            {/* Desktop filters or expanded mobile filters */}
            <div
              className={`grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 ${showMobileFilters ? "block" : "hidden sm:grid"}`}
            >
              {/* Search */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Search:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search by associate..."
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 pr-8 sm:pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                    }}
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 pr-8 sm:pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    {STATUS_FILTER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Sort by
                </label>
                <div className="relative">
                  <select
                    value={`${sortBy},${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split(",");
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 pr-8 sm:pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Table Content - Responsive */}
          <div className="px-4 py-3 sm:px-6 sm:py-4">
            {loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
                <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600">
                  Loading...
                </span>
              </div>
            ) : associateAwayLogs.length > 0 ? (
              <>
                {/* Results count */}
                <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                  Showing {startRecord}-{endRecord} of {totalCount} logs
                </div>

                {/* Desktop Table - Hidden on mobile */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Associate
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Date
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Until
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {associateAwayLogs.map((awayLog) => (
                        <tr
                          key={awayLog.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            navigate(
                              `/admin/settings/associate-away-log/${awayLog.id}/detail`,
                            )
                          }
                        >
                          <td className="px-3 py-4 text-sm">
                            <Link
                              to={`/admin/associate/${awayLog.associateId}`}
                              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <UserIcon className="w-4 h-4 mr-1" />
                              {awayLog.associateName ||
                                `Associate #${awayLog.associateId}`}
                            </Link>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900">
                            <div className="flex items-center">
                              {(awayLog.reason ===
                                REASON_COMMERCIAL_INSURANCE_EXPIRED ||
                                awayLog.reason ===
                                  REASON_POLICE_CHECK_EXPIRED) && (
                                <ShieldExclamationIcon className="w-4 h-4 mr-1 text-amber-500" />
                              )}
                              {awayLog.reason === 1
                                ? awayLog.reasonOther || "Other"
                                : REASON_MAP[awayLog.reason] || "Unknown"}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                              {formatDate(awayLog.startDate)}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-sm">
                            {awayLog.untilFurtherNotice === 1 ? (
                              <span className="text-amber-600 font-medium flex items-center">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                Further Notice
                              </span>
                            ) : (
                              <span className="text-gray-500 flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                                {formatDate(awayLog.untilDate)}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {formatDate(awayLog.createdAt)}
                          </td>
                          <td className="px-3 py-4 text-sm text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetail(awayLog);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                            >
                              View
                              <ChevronRightIcon className="w-4 h-4 ml-1" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Card View - Visible on mobile and tablet */}
                <div className="lg:hidden space-y-3">
                  {associateAwayLogs.map((awayLog) => (
                    <div
                      key={awayLog.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/admin/settings/associate-away-log/${awayLog.id}/detail`,
                        )
                      }
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Link
                          to={`/admin/associate/${awayLog.associateId}`}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <UserIcon className="w-4 h-4 mr-1" />
                          {awayLog.associateName ||
                            `Associate #${awayLog.associateId}`}
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(awayLog);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-start">
                          <span className="text-gray-500 w-20 flex-shrink-0">
                            Reason:
                          </span>
                          <span className="text-gray-900 flex items-center">
                            {(awayLog.reason ===
                              REASON_COMMERCIAL_INSURANCE_EXPIRED ||
                              awayLog.reason ===
                                REASON_POLICE_CHECK_EXPIRED) && (
                              <ShieldExclamationIcon className="w-3 h-3 mr-1 text-amber-500" />
                            )}
                            {awayLog.reason === 1
                              ? awayLog.reasonOther || "Other"
                              : REASON_MAP[awayLog.reason] || "Unknown"}
                          </span>
                        </div>

                        <div className="flex items-start">
                          <span className="text-gray-500 w-20 flex-shrink-0">
                            Start:
                          </span>
                          <span className="text-gray-900 flex items-center">
                            <CalendarIcon className="w-3 h-3 mr-1 text-gray-400" />
                            {formatDate(awayLog.startDate)}
                          </span>
                        </div>

                        <div className="flex items-start">
                          <span className="text-gray-500 w-20 flex-shrink-0">
                            Until:
                          </span>
                          {awayLog.untilFurtherNotice === 1 ? (
                            <span className="text-amber-600 font-medium flex items-center">
                              <ClockIcon className="w-3 h-3 mr-1" />
                              Further Notice
                            </span>
                          ) : (
                            <span className="text-gray-900 flex items-center">
                              <CalendarIcon className="w-3 h-3 mr-1 text-gray-400" />
                              {formatDate(awayLog.untilDate)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-start">
                          <span className="text-gray-500 w-20 flex-shrink-0">
                            Created:
                          </span>
                          <span className="text-gray-900">
                            {formatDate(awayLog.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cursor-based Pagination - Responsive */}
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs sm:text-sm text-gray-700">
                      Per page:
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(parseInt(e.target.value));
                      }}
                      className="px-2 py-1 sm:px-3 sm:py-1 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={!hasPreviousPage}
                      className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                    >
                      <ChevronLeftIcon className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </button>

                    <span className="text-xs sm:text-sm text-gray-700 px-3">
                      Showing {startRecord} - {endRecord}
                    </span>

                    <button
                      onClick={handleNextPage}
                      disabled={!hasNextPage}
                      className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <CalendarDaysIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No Associate Away Logs Found
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  {searchText || statusFilter
                    ? "No away logs match your current filters."
                    : "No associate away logs have been created yet."}
                </p>
                <div className="mt-4 sm:mt-6">
                  <button
                    onClick={() =>
                      navigate("/admin/settings/associate-away-log/create")
                    }
                    className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    Create First Away Log
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expired Documents Modal */}
        {showExpiredDocsModal && associatesWithExpiredDocs.length > 0 && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <ShieldExclamationIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-amber-500" />
                  Associates with Expired Documents
                </h3>
                <button
                  onClick={() => setShowExpiredDocsModal(false)}
                  className="text-gray-400 hover:text-gray-500 p-1"
                >
                  <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="px-4 py-4 sm:px-6 overflow-y-auto max-h-[60vh]">
                <p className="text-sm text-gray-600 mb-4">
                  The following associates have expired insurance or police
                  checks but are not on the away list. You can automatically
                  create away logs for them.
                </p>

                <div className="space-y-3">
                  {associatesWithExpiredDocs.map((item) => (
                    <div
                      key={item.associate.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            to={`/admin/associate/${item.associate.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <UserIcon className="w-4 h-4 mr-1" />
                            {item.associate.name}
                          </Link>

                          <div className="mt-2 space-y-1">
                            {item.expiredReasons.map((reason, idx) => (
                              <div
                                key={idx}
                                className="text-xs text-gray-600 flex items-center"
                              >
                                <ShieldExclamationIcon className="w-3 h-3 mr-1 text-amber-500" />
                                <span className="font-medium">
                                  {reason.type === "insurance"
                                    ? "Insurance"
                                    : "Police Check"}
                                </span>
                                <span className="ml-1">
                                  expired on {formatDate(reason.expiryDate)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            item.expiredReasons.forEach((reason) => {
                              createAwayLogForExpiredDoc(
                                item.associate.id,
                                item.associate.name,
                                reason.reason,
                                reason.expiryDate,
                              );
                            });
                          }}
                          className="ml-4 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Create Away Log
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowExpiredDocsModal(false)}
                  className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createAllAwayLogsForExpiredDocs}
                  disabled={loading}
                  className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  Create All Away Logs ({associatesWithExpiredDocs.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal - Responsive */}
        {showDetailModal && selectedAwayLog && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <CalendarDaysIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  Away Log Details
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-500 p-1"
                >
                  <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="px-4 py-4 sm:px-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Associate:
                    </label>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Link
                        to={`/admin/associate/${selectedAwayLog.associateId}`}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                        {selectedAwayLog.associateName ||
                          `Associate #${selectedAwayLog.associateId}`}
                      </Link>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Reason:
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-xs sm:text-sm text-gray-900">
                      <div className="flex items-center">
                        {(selectedAwayLog.reason ===
                          REASON_COMMERCIAL_INSURANCE_EXPIRED ||
                          selectedAwayLog.reason ===
                            REASON_POLICE_CHECK_EXPIRED) && (
                          <ShieldExclamationIcon className="w-4 h-4 mr-1 text-amber-500" />
                        )}
                        {selectedAwayLog.reason === 1 ? (
                          <>
                            {REASON_MAP[1]}
                            {selectedAwayLog.reasonOther && (
                              <span className="block mt-1 italic">
                                "{selectedAwayLog.reasonOther}"
                              </span>
                            )}
                          </>
                        ) : (
                          REASON_MAP[selectedAwayLog.reason] || "Unknown"
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Start Date:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-xs sm:text-sm text-gray-900 flex items-center">
                        <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500" />
                        {formatDate(selectedAwayLog.startDate)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Until:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-xs sm:text-sm">
                        {selectedAwayLog.untilFurtherNotice === 1 ? (
                          <span className="text-amber-600 font-medium flex items-center">
                            <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Further Notice
                          </span>
                        ) : (
                          <span className="text-gray-900 flex items-center">
                            <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500" />
                            {formatDate(selectedAwayLog.untilDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Created:
                      </span>
                      <p className="text-gray-900 mt-1">
                        {formatDateTime(selectedAwayLog.createdAt)}
                      </p>
                    </div>
                    {selectedAwayLog.createdByUserName && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Created By:
                        </span>
                        <p className="text-gray-900 mt-1">
                          {selectedAwayLog.createdByUserName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(
                      `/admin/settings/associate-away-log/${selectedAwayLog.id}/update`,
                    );
                  }}
                  className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600"
                >
                  <PencilSquareIcon className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleDelete(selectedAwayLog);
                  }}
                  className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal - Responsive */}
        {showDeleteModal && selectedAwayLog && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-red-600" />
                  Delete Away Log
                </h3>
              </div>

              <div className="px-4 py-4 sm:px-6">
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Are you sure you want to delete this associate away log? This
                  action cannot be undone.
                </p>
                <div className="p-3 bg-gray-50 rounded-lg text-xs sm:text-sm">
                  <div className="space-y-1">
                    <p>
                      <strong>Associate:</strong>{" "}
                      {selectedAwayLog.associateName ||
                        `Associate #${selectedAwayLog.associateId}`}
                    </p>
                    <p>
                      <strong>Reason:</strong>{" "}
                      {selectedAwayLog.reason === 1
                        ? selectedAwayLog.reasonOther || "Other"
                        : REASON_MAP[selectedAwayLog.reason]}
                    </p>
                    <p>
                      <strong>Start Date:</strong>{" "}
                      {formatDate(selectedAwayLog.startDate)}
                    </p>
                    <p>
                      <strong>Until:</strong>{" "}
                      {selectedAwayLog.untilFurtherNotice === 1
                        ? "Further Notice"
                        : formatDate(selectedAwayLog.untilDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2 sm:space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingAssociateAwayLogListPage;
