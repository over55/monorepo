// File Path: monorepo/web/workery-frontend/src/pages/Admin/Setting/Bulletin/List/Page.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useBulletinManager } from "../../../../../services/Services";
import { formatDateForDisplay } from "../../../../../services/Helpers/DateFormatter";
import {
  NewspaperIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  XMarkIcon,
  TrashIcon,
  PencilSquareIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function SettingBulletinListPage() {
  const bulletinManager = useBulletinManager();
  const navigate = useNavigate();
  const location = useLocation();
  const abortControllerRef = useRef(null);

  // Component state
  const [bulletins, setBulletins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Filter and search state
  const [temporarySearchText, setTemporarySearchText] = useState("");
  const [actualSearchText, setActualSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");

  // Cursor-based pagination state
  const [currentCursor, setCurrentCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursorHistory, setCursorHistory] = useState([]); // Track cursor history for going back
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load bulletins
  const loadBulletins = async (cursor = "", isNavigatingBack = false) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      const params = {
        cursor: cursor,
        limit: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder,
      };

      if (actualSearchText) {
        params.search = actualSearchText;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      console.log("Loading bulletins with params:", params);

      const response = await bulletinManager.getBulletins(
        params,
        onUnauthorized,
        true, // Force refresh
      );

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setBulletins(response.results || []);
      setTotalCount(response.count || 0);
      setNextCursor(response.nextCursor || "");
      setHasNextPage(response.hasNextPage || false);

      // Update cursor history when moving forward
      if (!isNavigatingBack && cursor && cursor !== currentCursor) {
        setCursorHistory((prev) =>
          [...prev, currentCursor].filter((c) => c !== ""),
        );
      }

      setCurrentCursor(cursor);
    } catch (err) {
      // Don't set error if request was aborted
      if (err.name !== "AbortError") {
        console.error("Failed to load bulletins:", err);
        setError(err.message || "Failed to load bulletins");
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Initial load and filter changes
  useEffect(() => {
    // Reset cursor history when filters change
    setCursorHistory([]);
    setCurrentCursor("");
    loadBulletins("");
  }, [actualSearchText, statusFilter, sortBy, sortOrder, pageSize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
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

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Event handlers
  const handleSearch = () => {
    setActualSearchText(temporarySearchText);
  };

  const handleClearFilter = () => {
    setStatusFilter("");
    setSortBy("created_at");
    setSortOrder("DESC");
    setActualSearchText("");
    setTemporarySearchText("");
    setCursorHistory([]);
    setCurrentCursor("");
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    const [field, order] = e.target.value.split(",");
    setSortBy(field);
    setSortOrder(order);
  };

  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    setPageSize(newPageSize);
  };

  const handleNextPage = () => {
    if (hasNextPage && nextCursor) {
      loadBulletins(nextCursor, false);
    }
  };

  const handlePreviousPage = () => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      const previousCursor = newHistory.pop();
      setCursorHistory(newHistory);
      loadBulletins(previousCursor, true);
    }
  };

  const handleRefresh = () => {
    loadBulletins(currentCursor, false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBulletinForDeletion) return;

    try {
      setIsLoading(true);
      await bulletinManager.deleteBulletin(
        selectedBulletinForDeletion.id,
        onUnauthorized,
      );
      setSuccessMessage("Bulletin deleted successfully");
      setShowDeleteModal(false);
      setSelectedBulletinForDeletion(null);
      // Reload from the beginning after deletion
      setCursorHistory([]);
      setCurrentCursor("");
      loadBulletins("");
    } catch (err) {
      console.error("Failed to delete bulletin:", err);
      setError(err.message || "Failed to delete bulletin");
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBulletinForDeletion, setSelectedBulletinForDeletion] =
    useState(null);

  // Check if we can go back
  const hasPreviousPage = cursorHistory.length > 0;

  // Calculate display range
  const displayedCount = bulletins.length;
  const startRecord = displayedCount > 0 ? 1 : 0;
  const endRecord = displayedCount;

  if (isLoading && !bulletins.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Bulletins...</p>
        </div>
      </div>
    );
  }

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
                  <span className="inline-flex items-center">
                    <Cog6ToothIcon className="w-4 h-4 mr-2" />
                    Settings
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <NewspaperIcon className="w-4 h-4 mr-2" />
                  Bulletins
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <NewspaperIcon className="w-8 h-8 mr-3 text-blue-600" />
            Bulletins
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

        {/* Main Card */}
        <div className="bg-white shadow-sm rounded-lg">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
              Bulletins List
            </h2>
            <button
              onClick={() => navigate("/admin/settings/bulletin/create")}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              New Bulletin
            </button>
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
                  onClick={handleClearFilter}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Clear Filters
                </button>
                <button
                  onClick={handleRefresh}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-1" />
                  Refresh
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by text..."
                    value={temporarySearchText}
                    onChange={(e) => setTemporarySearchText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="1">Active</option>
                    <option value="0">Archived</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <div className="relative">
                  <select
                    value={`${sortBy},${sortOrder}`}
                    onChange={handleSortChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    <option value="created_at,DESC">Created (Newest)</option>
                    <option value="created_at,ASC">Created (Oldest)</option>
                    <option value="text,ASC">Text (A-Z)</option>
                    <option value="text,DESC">Text (Z-A)</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Items per page */}
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
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="px-6 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading bulletins...</span>
              </div>
            ) : bulletins && bulletins.length > 0 ? (
              <>
                {/* Results count */}
                <div className="mb-4 text-sm text-gray-600 flex justify-between items-center">
                  <span>
                    Showing {displayedCount}{" "}
                    {displayedCount === 1 ? "bulletin" : "bulletins"}
                    {totalCount > 0 && ` (Total: ${totalCount})`}
                  </span>
                  {(hasNextPage || hasPreviousPage) && (
                    <span className="text-xs text-gray-500">
                      Use navigation below to see more results
                    </span>
                  )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Text
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-80">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bulletins.map((bulletin) => (
                        <tr
                          key={bulletin.id}
                          onClick={() =>
                            navigate(
                              `/admin/settings/bulletin/${bulletin.id}/detail`,
                            )
                          }
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-3 py-4 text-sm">
                            <Link
                              to={`/admin/settings/bulletin/${bulletin.id}/detail`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              <div className="max-w-md truncate">
                                {bulletin.text}
                              </div>
                            </Link>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {formatDateForDisplay(bulletin.createdAt)}
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/admin/settings/bulletin/${bulletin.id}/detail`,
                                  );
                                }}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                <EyeIcon className="w-4 h-4 mr-1.5" />
                                View
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/admin/settings/bulletin/${bulletin.id}/update`,
                                  );
                                }}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                              >
                                <PencilSquareIcon className="w-4 h-4 mr-1.5" />
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBulletinForDeletion(bulletin);
                                  setShowDeleteModal(true);
                                }}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                              >
                                <TrashIcon className="w-4 h-4 mr-1.5" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cursor-based Pagination */}
                {(hasNextPage || hasPreviousPage) && (
                  <div className="mt-6 flex items-center justify-between border-t pt-4">
                    <button
                      onClick={handlePreviousPage}
                      disabled={!hasPreviousPage}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    >
                      <ChevronLeftIcon className="w-5 h-5 mr-1" />
                      Previous
                    </button>

                    <div className="text-sm text-gray-700">
                      {hasNextPage && !hasPreviousPage && (
                        <span>More results available →</span>
                      )}
                      {!hasNextPage && hasPreviousPage && (
                        <span>← Back to previous results</span>
                      )}
                      {hasNextPage && hasPreviousPage && (
                        <span>Navigate for more results</span>
                      )}
                      {!hasNextPage && !hasPreviousPage && (
                        <span>All results displayed</span>
                      )}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={!hasNextPage}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    >
                      Next
                      <ChevronRightIcon className="w-5 h-5 ml-1" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <NewspaperIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No Bulletins Found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {actualSearchText || statusFilter
                    ? "No bulletins match your search criteria."
                    : "No bulletins have been created yet."}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate("/admin/settings/bulletin/create")}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Create First Bulletin
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedBulletinForDeletion && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-600" />
                  Delete Bulletin
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete this bulletin? This action
                  cannot be undone.
                </p>

                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm text-gray-700">
                    <strong>Text:</strong> {selectedBulletinForDeletion.text}
                  </p>
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800 flex items-start">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>
                      <strong>Warning:</strong> This will permanently delete
                      this bulletin and cannot be recovered.
                    </span>
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedBulletinForDeletion(null);
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
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
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete
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

export default SettingBulletinListPage;
