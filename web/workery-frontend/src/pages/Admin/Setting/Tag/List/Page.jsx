// File Path: web/workery-frontend/src/pages/Admin/Setting/Tag/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTagManager } from "../../../../../services/Services";
import {
  TagIcon,
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
  CalendarDaysIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function SettingTagListPage() {
  const tagManager = useTagManager();
  const navigate = useNavigate();
  const location = useLocation();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState(null);
  const [selectedTagForDeletion, setSelectedTagForDeletion] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Pagination
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // Filtering
  const [temporarySearchText, setTemporarySearchText] = useState("");
  const [actualSearchText, setActualSearchText] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("text");
  const [sortOrder, setSortOrder] = useState("ASC");

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchTags = async (
    page = 1,
    limit = 50,
    search = "",
    statusFilter = "",
    sortField = "text",
    sortDirection = "ASC",
    forceRefresh = false,
  ) => {
    setIsLoading(true);
    setErrors({});

    try {
      const params = {
        page: page,
        limit: limit,
        sortBy: sortField,
        sortOrder: sortDirection,
      };

      if (search) {
        params.search = search;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const tagsData = await tagManager.getTags(
        params,
        onUnauthorized,
        forceRefresh,
      );

      setTags(tagsData);
      setHasNextPage(tagsData.hasNextPage || false);
      setHasPreviousPage(page > 1);

      console.log("TagListPage: Tags fetched successfully:", {
        count: tagsData.results ? tagsData.results.length : 0,
        totalCount: tagsData.count,
      });
    } catch (error) {
      console.error("TagListPage: Failed to fetch tags:", error);
      setErrors({ fetch: error.message || "Failed to load tags" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchTags(nextPage, pageSize, actualSearchText, status, sortBy, sortOrder);
  };

  const handlePreviousPage = () => {
    const prevPage = currentPage - 1;
    setCurrentPage(prevPage);
    fetchTags(prevPage, pageSize, actualSearchText, status, sortBy, sortOrder);
  };

  const handleSearch = () => {
    setActualSearchText(temporarySearchText);
    setCurrentPage(1);
    fetchTags(1, pageSize, temporarySearchText, status, sortBy, sortOrder);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTagForDeletion) return;

    setIsLoading(true);

    try {
      await tagManager.deleteTag(selectedTagForDeletion.id, onUnauthorized);

      setSuccessMessage("Tag deleted successfully");
      fetchTags(
        currentPage,
        pageSize,
        actualSearchText,
        status,
        sortBy,
        sortOrder,
        true,
      );
      setSelectedTagForDeletion(null);
      console.log("TagListPage: Tag deleted successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("TagListPage: Failed to delete tag:", error);
      setErrors({ delete: error.message || "Failed to delete tag" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilter = () => {
    setStatus("");
    setSortBy("text");
    setSortOrder("ASC");
    setActualSearchText("");
    setTemporarySearchText("");
    setCurrentPage(1);

    // Force refresh with cleared values
    setTimeout(() => {
      fetchTags(1, pageSize, "", "", "text", "ASC", true);
    }, 0);
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);
      fetchTags();
    }

    return () => {
      mounted = false;
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

  // Calculate pagination info
  const totalCount = tags?.count || 0;
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);
  const totalPages = Math.ceil(totalCount / pageSize);

  if (isLoading && !tags) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Tags...</p>
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
                  <TagIcon className="w-4 h-4 mr-2" />
                  Tags
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <TagIcon className="w-8 h-8 mr-3 text-blue-600" />
            Tags
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

        {errors.fetch && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {errors.fetch}
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {errors.delete && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {errors.delete}
            </span>
            <button
              onClick={() => setErrors({})}
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
              Tags List
            </h2>
            <button
              onClick={() => navigate("/admin/settings/tag/create")}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              New Tag
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
                  onClick={() =>
                    fetchTags(
                      currentPage,
                      pageSize,
                      actualSearchText,
                      status,
                      sortBy,
                      sortOrder,
                      true,
                    )
                  }
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
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="1">Active</option>
                    <option value="2">Inactive</option>
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
                    onChange={(e) => {
                      const [field, order] = e.target.value.split(",");
                      setSortBy(field);
                      setSortOrder(order);
                      setCurrentPage(1);
                      fetchTags(
                        1,
                        pageSize,
                        actualSearchText,
                        status,
                        field,
                        order,
                      );
                    }}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    <option value="text,ASC">Text (A-Z)</option>
                    <option value="text,DESC">Text (Z-A)</option>
                    <option value="created_at,ASC">Created (Oldest)</option>
                    <option value="created_at,DESC">Created (Newest)</option>
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
                    onChange={(e) => {
                      const newPageSize = parseInt(e.target.value);
                      setPageSize(newPageSize);
                      setCurrentPage(1);
                      fetchTags(
                        1,
                        newPageSize,
                        actualSearchText,
                        status,
                        sortBy,
                        sortOrder,
                      );
                    }}
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
                <span className="ml-3 text-gray-600">Loading tags...</span>
              </div>
            ) : tags && tags.results && tags.results.length > 0 ? (
              <>
                {/* Results count */}
                <div className="mb-4 text-sm text-gray-600">
                  Showing {startRecord}-{endRecord} of {totalCount} tags
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
                          Description
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
                      {tags.results.map((tag) => (
                        <tr
                          key={tag.id}
                          onClick={() => {
                            setSelectedTag(tag);
                            setShowDetailModal(true);
                          }}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-3 py-4 text-sm">
                            <Link
                              to={`/admin/settings/tag/${tag.id}/detail`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {tag.text}
                            </Link>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            <div className="max-w-xs truncate">
                              {tag.description || (
                                <span className="text-gray-400 italic">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {tag.createdAt || "—"}
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/admin/settings/tag/${tag.id}/detail`,
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
                                    `/admin/settings/tag/${tag.id}/update`,
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
                                  setSelectedTagForDeletion(tag);
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handlePreviousPage}
                        disabled={!hasPreviousPage}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={handleNextPage}
                        disabled={!hasNextPage}
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
                <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No Tags Found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {actualSearchText || status
                    ? "No tags match your search criteria."
                    : "No tags have been created yet."}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate("/admin/settings/tag/create")}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Create First Tag
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedTag && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TagIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Tag Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedTag(null);
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
                      Text:
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-base font-semibold text-gray-900">
                      {selectedTag.text}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description:
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 min-h-[60px]">
                      {selectedTag.description || (
                        <span className="text-gray-400 italic">
                          No description provided
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status:
                    </label>
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                        selectedTag.status === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedTag.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <CalendarDaysIcon className="w-4 h-4 mr-1" />
                        Created:
                      </div>
                      <p className="text-sm text-gray-900">
                        {selectedTag.createdAt || "Not available"}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <UserIcon className="w-4 h-4 mr-1" />
                        Created By:
                      </div>
                      <p className="text-sm text-gray-900">
                        {selectedTag.createdByUserName || "Not available"}
                      </p>
                    </div>
                    {selectedTag.modifiedAt && (
                      <div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <CalendarDaysIcon className="w-4 h-4 mr-1" />
                          Modified:
                        </div>
                        <p className="text-sm text-gray-900">
                          {selectedTag.modifiedAt}
                        </p>
                      </div>
                    )}
                    {selectedTag.modifiedByUserName && (
                      <div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <UserIcon className="w-4 h-4 mr-1" />
                          Modified By:
                        </div>
                        <p className="text-sm text-gray-900">
                          {selectedTag.modifiedByUserName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedTag(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(`/admin/settings/tag/${selectedTag.id}/update`);
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600"
                >
                  <PencilSquareIcon className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedTagForDeletion(selectedTag);
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {selectedTagForDeletion && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-600" />
                  Delete Tag
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete this tag? This action cannot
                  be undone.
                </p>

                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    <strong>Text:</strong> {selectedTagForDeletion.text}
                  </p>
                  {selectedTagForDeletion.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Description:</strong>{" "}
                      {selectedTagForDeletion.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800 flex items-start">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>
                      <strong>Warning:</strong> This will affect any items or
                      records that reference this tag.
                    </span>
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedTagForDeletion(null)}
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

export default SettingTagListPage;
