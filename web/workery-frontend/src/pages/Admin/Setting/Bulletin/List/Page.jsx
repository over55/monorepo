import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useBulletinManager } from "../../../../../services/Services";
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
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function SettingBulletinListPage() {
  const bulletinManager = useBulletinManager();
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);

  // Component state
  const [bulletins, setBulletins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Filter and search state
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState(null);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load bulletins
  const loadBulletins = async (forceRefresh = false) => {
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
        page: currentPage,
        limit: pageSize,
        search: searchText,
        sortBy: sortBy,
        sortOrder: sortOrder,
      };

      // Add status filter - keep as STRING, don't convert to number
      if (statusFilter !== "") {
        params.status = statusFilter; // Keep as string!
      }

      console.log("Loading bulletins with params:", params);

      const response = await bulletinManager.getBulletins(
        params,
        onUnauthorized,
        true, // Always force refresh to ensure filters are applied
      );

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setBulletins(response.results || []);
      setTotalCount(response.count || 0);
      setHasNextPage(response.hasNextPage || false);
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

  // Effects
  useEffect(() => {
    loadBulletins(true); // Force refresh on filter changes
  }, [currentPage, pageSize, searchText, statusFilter, sortBy, sortOrder]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Event handlers
  const handleSearch = () => {
    setCurrentPage(1);
    // No need to manually call loadBulletins, useEffect will handle it
  };

  const handleClearFilters = () => {
    // Clear all state values at once
    setSearchText("");
    setStatusFilter("");
    setSortBy("created_at");
    setSortOrder("DESC");
    setCurrentPage(1);
    // useEffect will automatically trigger loadBulletins
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    console.log("Status filter changed to:", newStatus); // Debug log
    setStatusFilter(newStatus);
    setCurrentPage(1);
    // useEffect will automatically trigger loadBulletins
  };

  const handleSortChange = (e) => {
    const [field, order] = e.target.value.split(",");
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
    // useEffect will automatically trigger loadBulletins
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
    // useEffect will automatically trigger loadBulletins
  };

  const handleViewDetail = (bulletin) => {
    setSelectedBulletin(bulletin);
    setShowDetailModal(true);
  };

  const handleDelete = (bulletin) => {
    setSelectedBulletin(bulletin);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBulletin) return;

    try {
      setIsLoading(true);
      await bulletinManager.deleteBulletin(selectedBulletin.id, onUnauthorized);
      setSuccessMessage("Bulletin deleted successfully");
      setShowDeleteModal(false);
      setSelectedBulletin(null);
      loadBulletins(true);
    } catch (err) {
      console.error("Failed to delete bulletin:", err);
      setError(err.message || "Failed to delete bulletin");
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

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
            <NewspaperIcon className="w-8 h-8 mr-3 text-gray-700" />
            Bulletins
          </h1>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{successMessage}</span>
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
            <span>{error}</span>
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
              List
            </h2>
            <button
              onClick={() => navigate("/admin/settings/bulletin/create")}
              className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              New
            </button>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <FunnelIcon className="w-4 h-4 mr-2" />
                Filtering & Sorting
              </h3>
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                Clear Filter
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by name"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
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
                    <option value="2">Archived</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort by
                </label>
                <div className="relative">
                  <select
                    value={`${sortBy},${sortOrder}`}
                    onChange={handleSortChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    <option value="created_at,DESC">Created At (Newest)</option>
                    <option value="created_at,ASC">Created At (Oldest)</option>
                    <option value="text,ASC">Text (A-Z)</option>
                    <option value="text,DESC">Text (Z-A)</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Table Content - rest of the component remains the same */}
          <div className="px-6 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading bulletins...</span>
              </div>
            ) : bulletins.length > 0 ? (
              <>
                {/* Results count */}
                <div className="mb-4 text-sm text-gray-600">
                  Showing {startRecord}-{endRecord} of {totalCount} bulletins
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Text
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                          <ChevronDownIcon className="inline w-4 h-4 ml-1" />
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bulletins.map((bulletin) => (
                        <tr
                          key={bulletin.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleViewDetail(bulletin)}
                        >
                          <td className="px-3 py-4 text-sm text-gray-900">
                            <div className="max-w-md truncate">
                              {bulletin.text}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {new Date(bulletin.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "2-digit",
                                day: "2-digit",
                                year: "numeric",
                              },
                            )}
                            ,{" "}
                            {new Date(bulletin.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              },
                            )}
                          </td>
                          <td className="px-3 py-4 text-sm text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetail(bulletin);
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-700">
                        Page size:
                      </label>
                      <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ← Previous
                      </button>
                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!hasNextPage || currentPage >= totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
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
                  {searchText || statusFilter
                    ? "No bulletins match your current filters."
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

        {/* Modals remain the same - Detail Modal and Delete Modal */}
        {/* ... rest of the component unchanged ... */}
      </div>
    </div>
  );
}

export default SettingBulletinListPage;
