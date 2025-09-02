// File Path: web/workery-frontend/src/pages/Admin/Setting/InactiveClient/List/Page.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useCustomerManager } from "../../../../../services/Services";
import {
  UserGroupIcon,
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
  EnvelopeIcon,
  PhoneIcon,
  BuildingOffice2Icon,
  HomeIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ChevronLeftIcon,
  Cog6ToothIcon,
  CalendarIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  UNASSIGNED_CUSTOMER_TYPE_OF_ID,
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  CUSTOMER_STATUS_INACTIVE,
  CUSTOMER_DEACTIVATION_REASON_MAP,
  PAGE_SIZE_OPTIONS,
} from "../../../../../constants/Customer";
import { formatDateForDisplay } from "../../../../../services/Helpers/DateFormatter";

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

  // View state
  const [viewType, setViewType] = useState(VIEW_TYPE_TABULAR);

  // No modals needed - everything is handled in the Update page

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

        // Default sort by lexical name descending
        filtersMap.set("sort_field", "lexical_name");
        filtersMap.set("sort_order", "DESC");

        // IMPORTANT: Filter for inactive/archived clients only
        filtersMap.set("status", CUSTOMER_STATUS_INACTIVE);

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
    [pageSize, customerManager, onUnauthorized],
  );

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

  // No restore handler needed - handled in Update page

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

          {/* Simple Controls Section */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
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

              {/* Refresh Button */}
              <button
                onClick={() => fetchInactiveClients(currentCursor)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <ArrowPathIcon className="w-4 h-4 mr-1" />
                Refresh
              </button>
            </div>
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
                          <tr key={client.id} className="hover:bg-gray-50">
                            <td className="px-3 py-4 text-sm">
                              <Link
                                to={`/admin/customer/${client.id}`}
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
                              {formatDateForDisplay(client.modifiedAt)}
                            </td>
                            <td className="px-3 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    navigate(`/admin/customer/${client.id}`);
                                  }}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                >
                                  <EyeIcon className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
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
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="mb-3">
                          <h3 className="text-base font-semibold text-gray-900">
                            <Link
                              to={`/admin/customer/${client.id}`}
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
                            Modified: {formatDateForDisplay(client.modifiedAt)}
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
                            onClick={() => {
                              navigate(`/admin/customer/${client.id}`);
                            }}
                            className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => {
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
                  No clients have been archived or deactivated yet.
                </p>
                <div className="mt-6 flex justify-center gap-3">
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
      </div>
    </div>
  );
}

export default SettingInactiveClientListPage;
