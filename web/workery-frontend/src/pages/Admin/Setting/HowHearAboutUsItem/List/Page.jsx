// File Path: web/workery-frontend/src/pages/Admin/Setting/HowHearAboutUsItem/List/Page.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useHowHearAboutUsItemManager } from "../../../../../services/Services";
import {
  MegaphoneIcon,
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
  HashtagIcon,
  UserGroupIcon,
  UsersIcon,
  BriefcaseIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function SettingHowHearAboutUsItemListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const howHearAboutUsItemManager = useHowHearAboutUsItemManager();
  const isLoadingRef = useRef(false);

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortBy, setSortBy] = useState("sortNumber");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch how hear about us items
  const fetchItems = async (params = {}) => {
    // Prevent double loading
    if (isLoadingRef.current && !params.forceRefresh) {
      return;
    }

    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);

      const queryParams = {
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortOrder,
        search: searchTerm,
        ...params,
      };

      if (status) {
        queryParams.status = status;
      }

      if (roleFilter) {
        queryParams.role = roleFilter;
      }

      const response = await howHearAboutUsItemManager.getList(
        queryParams,
        onUnauthorized,
        params.forceRefresh || false,
      );

      setItems(response.results || []);
      setTotalCount(response.count || 0);
      setHasNextPage(response.hasNextPage || false);

      console.log("HowHearAboutUsItemListPage: Items fetched successfully:", {
        count: response.results ? response.results.length : 0,
        totalCount: response.count,
      });
    } catch (err) {
      console.error("HowHearAboutUsItemListPage: Failed to fetch items:", err);
      setError(err.message || "Failed to load items");
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };

  // Handle search
  const handleSearch = () => {
    setSearchTerm(tempSearchTerm);
    setCurrentPage(1);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedItem) return;

    // Check if item is system protected
    if (selectedItem.text === "Other") {
      setError("Cannot delete the 'Other' item as it is system-protected.");
      setShowDeleteModal(false);
      return;
    }

    try {
      setIsDeleting(true);
      await howHearAboutUsItemManager.delete(selectedItem.id, onUnauthorized);

      console.log("HowHearAboutUsItemListPage: Item deleted successfully");
      setSuccessMessage("How Hear About Us Item deleted successfully");
      setShowDeleteModal(false);
      setSelectedItem(null);

      // Refresh the list
      await fetchItems({ forceRefresh: true });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("HowHearAboutUsItemListPage: Failed to delete item:", err);
      setError(err.message || "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setTempSearchTerm("");
    setStatus("");
    setRoleFilter("");
    setSortBy("sortNumber");
    setSortOrder("ASC");
    setCurrentPage(1);

    // Force refresh with cleared values
    setTimeout(() => {
      fetchItems({ forceRefresh: true });
    }, 0);
  };

  // Get status badge
  const getStatusBadge = (itemStatus) => {
    const isActive = itemStatus === 1;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  // Get role badges
  const getRoleBadges = (item) => {
    const badges = [];
    if (item.isForAssociate) {
      badges.push(
        <span
          key="associate"
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
        >
          <BriefcaseIcon className="w-3 h-3 mr-1" />
          Associate
        </span>,
      );
    }
    if (item.isForCustomer) {
      badges.push(
        <span
          key="customer"
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
        >
          <UsersIcon className="w-3 h-3 mr-1" />
          Customer
        </span>,
      );
    }
    if (item.isForStaff) {
      badges.push(
        <span
          key="staff"
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
        >
          <UserGroupIcon className="w-3 h-3 mr-1" />
          Staff
        </span>,
      );
    }
    return badges.length > 0 ? (
      badges
    ) : (
      <span className="text-gray-400 italic text-xs">No roles</span>
    );
  };

  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchItems();
  }, [
    currentPage,
    pageSize,
    searchTerm,
    status,
    roleFilter,
    sortBy,
    sortOrder,
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

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
                  <MegaphoneIcon className="w-4 h-4 mr-2" />
                  How Hear About Us Items
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MegaphoneIcon className="w-8 h-8 mr-3 text-blue-600" />
            How Hear About Us Items
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
              Items List
            </h2>
            <button
              onClick={() =>
                navigate("/admin/settings/how-hear-about-us-item/create")
              }
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              New Item
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
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Clear Filters
                </button>
                <button
                  onClick={() => fetchItems({ forceRefresh: true })}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-1" />
                  Refresh
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tempSearchTerm}
                    onChange={(e) => setTempSearchTerm(e.target.value)}
                    placeholder="Search by text..."
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Status Filter */}
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

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    <option value="">All Roles</option>
                    <option value="associate">Associate</option>
                    <option value="customer">Customer</option>
                    <option value="staff">Staff</option>
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
                    }}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    <option value="sortNumber,ASC">
                      Sort Number (Low to High)
                    </option>
                    <option value="sortNumber,DESC">
                      Sort Number (High to Low)
                    </option>
                    <option value="text,ASC">Text (A-Z)</option>
                    <option value="text,DESC">Text (Z-A)</option>
                    <option value="created_at,DESC">
                      Created Date (Newest)
                    </option>
                    <option value="created_at,ASC">
                      Created Date (Oldest)
                    </option>
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
                      setPageSize(parseInt(e.target.value));
                      setCurrentPage(1);
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
                <span className="ml-3 text-gray-600">Loading items...</span>
              </div>
            ) : items.length > 0 ? (
              <>
                {/* Results count */}
                <div className="mb-4 text-sm text-gray-600">
                  Showing {startRecord}-{endRecord} of {totalCount} items
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sort #
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Text
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Available For
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
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
                      {items.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowDetailModal(true);
                          }}
                        >
                          <td className="px-3 py-4 text-sm font-medium text-gray-900">
                            <span className="inline-flex items-center">
                              <HashtagIcon className="w-4 h-4 mr-1 text-gray-400" />
                              {item.sortNumber ?? "—"}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-sm">
                            <Link
                              to={`/admin/settings/how-hear-about-us-item/${item.id}/detail`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                            >
                              {item.text}
                              {item.text === "Other" && (
                                <LockClosedIcon className="w-3 h-3 ml-2 text-amber-500" />
                              )}
                            </Link>
                          </td>
                          <td className="px-3 py-4 text-sm">
                            <div className="flex flex-wrap gap-1">
                              {getRoleBadges(item)}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm">
                            {getStatusBadge(item.status)}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/admin/settings/how-hear-about-us-item/${item.id}/detail`,
                                  );
                                }}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                <EyeIcon className="w-4 h-4 mr-1.5" />
                                View
                              </button>
                              {item.text !== "Other" ? (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(
                                        `/admin/settings/how-hear-about-us-item/${item.id}/update`,
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
                                      setSelectedItem(item);
                                      setShowDeleteModal(true);
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                  >
                                    <TrashIcon className="w-4 h-4 mr-1.5" />
                                    Delete
                                  </button>
                                </>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-amber-800 bg-amber-100 rounded-lg">
                                  <LockClosedIcon className="w-4 h-4 mr-1.5" />
                                  Protected
                                </span>
                              )}
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
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
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
                <MegaphoneIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No Items Found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || status || roleFilter
                    ? "No items match your search criteria."
                    : "No How Hear About Us items have been created yet."}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() =>
                      navigate("/admin/settings/how-hear-about-us-item/create")
                    }
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Create First Item
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedItem && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MegaphoneIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Item Details
                  {selectedItem.text === "Other" && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      <LockClosedIcon className="w-3 h-3 mr-1" />
                      System Protected
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedItem(null);
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
                      {selectedItem.text}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sort Number:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-900 flex items-center">
                        <HashtagIcon className="w-4 h-4 mr-1 text-gray-500" />
                        {selectedItem.sortNumber ?? "N/A"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status:
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {getStatusBadge(selectedItem.status)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Available For:
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-sm">
                            <BriefcaseIcon className="w-4 h-4 mr-2 text-blue-500" />
                            Associates
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              selectedItem.isForAssociate
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          >
                            {selectedItem.isForAssociate ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-sm">
                            <UsersIcon className="w-4 h-4 mr-2 text-purple-500" />
                            Customers
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              selectedItem.isForCustomer
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          >
                            {selectedItem.isForCustomer ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-sm">
                            <UserGroupIcon className="w-4 h-4 mr-2 text-green-500" />
                            Staff
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              selectedItem.isForStaff
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          >
                            {selectedItem.isForStaff ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <CalendarDaysIcon className="w-4 h-4 mr-1" />
                        Created:
                      </div>
                      <p className="text-sm text-gray-900">
                        {selectedItem.createdAt
                          ? new Date(selectedItem.createdAt).toLocaleString()
                          : "Not available"}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <UserIcon className="w-4 h-4 mr-1" />
                        Created By:
                      </div>
                      <p className="text-sm text-gray-900">
                        {selectedItem.createdByUserName || "Not available"}
                      </p>
                    </div>
                    {selectedItem.modifiedAt && (
                      <div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <CalendarDaysIcon className="w-4 h-4 mr-1" />
                          Modified:
                        </div>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedItem.modifiedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedItem.modifiedByUserName && (
                      <div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <UserIcon className="w-4 h-4 mr-1" />
                          Modified By:
                        </div>
                        <p className="text-sm text-gray-900">
                          {selectedItem.modifiedByUserName}
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
                    setSelectedItem(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedItem.text !== "Other" && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        navigate(
                          `/admin/settings/how-hear-about-us-item/${selectedItem.id}/update`,
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
                        setShowDeleteModal(true);
                      }}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedItem && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-600" />
                  Delete Item
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete this item? This action cannot
                  be undone.
                </p>

                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    <strong>Text:</strong> {selectedItem.text}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Sort Number:</strong>{" "}
                    {selectedItem.sortNumber ?? "N/A"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {getRoleBadges(selectedItem)}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800 flex items-start">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>
                      <strong>Warning:</strong> This will affect forms where
                      this option is displayed, historical records that
                      reference this option, and reports that include this data.
                    </span>
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedItem(null);
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
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

export default SettingHowHearAboutUsItemListPage;
