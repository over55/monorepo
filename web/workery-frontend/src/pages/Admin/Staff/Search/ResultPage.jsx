// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Search/ResultPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useStaffManager } from "../../../../services/Services";
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsUpDownIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArchiveBoxIcon,
  EyeIcon,
  CheckCircleIcon,
  FunnelIcon,
  UserIcon,
  ChevronDownIcon,
  BriefcaseIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon as ExclamationTriangleIconSolid } from "@heroicons/react/24/solid";

// Staff type filter options
const STAFF_TYPE_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Executive" },
  { value: 2, label: "Management" },
  { value: 3, label: "Frontline" },
];

// Staff status filter options
const STAFF_STATUS_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Active" },
  { value: 2, label: "Archived" },
];

// Staff sort options
const STAFF_SORT_OPTIONS = [
  { value: "lexical_name,ASC", label: "Name (A-Z)" },
  { value: "lexical_name,DESC", label: "Name (Z-A)" },
  { value: "join_date,DESC", label: "Newest First" },
  { value: "join_date,ASC", label: "Oldest First" },
  { value: "created_at,DESC", label: "Recently Created" },
  { value: "created_at,ASC", label: "Oldest Created" },
];

// Staff type mapping
const STAFF_TYPE_MAP = {
  1: "Executive",
  2: "Management",
  3: "Frontline",
};

// Page size options
const PAGE_SIZE_OPTIONS = [
  { value: 10, label: "10 per page" },
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
];

function AdminStaffSearchResultPage() {
  const navigate = useNavigate();
  const staffManager = useStaffManager();
  const [searchParams] = useSearchParams();

  // Extract search parameters from URL
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";
  const isActive = searchParams.get("active") === "1";

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
  const [status, setStatus] = useState(isActive ? 1 : 0);
  const [type, setType] = useState(0);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStaffForDeletion, setSelectedStaffForDeletion] =
    useState(null);

  // Fetch staff list based on search criteria
  const fetchStaffList = useCallback(() => {
    console.log("Fetching search results with:", {
      firstName,
      lastName,
      email,
      phone,
      status,
      type,
      sortBy,
      pageSize,
      currentCursor,
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

    // Add search criteria from URL
    if (firstName) filtersMap.set("first_name", firstName);
    if (lastName) filtersMap.set("last_name", lastName);
    if (email) filtersMap.set("email", email);
    if (phone) filtersMap.set("phone", phone);

    // Add filters
    if (status > 0) {
      filtersMap.set("status", status);
    }

    if (type > 0) {
      filtersMap.set("type", type);
    }

    console.log("API call with filters:", Array.from(filtersMap.entries()));

    // Use the manager to fetch staff with force refresh
    staffManager.getStaffWithFiltersMapWithCallbacks(
      filtersMap,
      onFetchSuccess,
      onFetchError,
      onFetchDone,
      onUnauthorized,
      true, // Force refresh to bypass cache
    );
  }, [
    firstName,
    lastName,
    email,
    phone,
    currentCursor,
    pageSize,
    sortBy,
    status,
    type,
  ]);

  const onFetchSuccess = (response) => {
    console.log("Search results fetched successfully:", {
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
    console.error("Error fetching search results:", error);
    setErrors(error);
    window.scrollTo(0, 0);
  };

  const onFetchDone = () => {
    setIsLoading(false);
  };

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (nextCursor) {
      const newPreviousCursors = [...previousCursors];
      newPreviousCursors.push(currentCursor);
      setPreviousCursors(newPreviousCursors);
      setCurrentCursor(nextCursor);
    }
  };

  const handlePreviousPage = () => {
    if (previousCursors.length > 0) {
      const newPreviousCursors = [...previousCursors];
      const previousCursor = newPreviousCursors.pop();
      setPreviousCursors(newPreviousCursors);
      setCurrentCursor(previousCursor);
    }
  };

  // Filter change handlers
  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
    setPreviousCursors([]);
    setCurrentCursor("");
  };

  const handleStatusChange = (e) => {
    setStatus(parseInt(e.target.value));
    setPreviousCursors([]);
    setCurrentCursor("");
  };

  const handleTypeChange = (e) => {
    setType(parseInt(e.target.value));
    setPreviousCursors([]);
    setCurrentCursor("");
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setPreviousCursors([]);
    setCurrentCursor("");
  };

  // Delete handlers
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

    // Update notification
    setSuccessMessage("Staff member archived successfully");
    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);

    setSelectedStaffForDeletion(null);
    // Refresh the list
    fetchStaffList();
  };

  const onDeleteError = (error) => {
    console.error("Error archiving staff:", error);
    setErrors({ message: "Failed archiving staff member" });
    setTimeout(() => {
      setErrors({});
    }, 2000);

    window.scrollTo(0, 0);
  };

  const onDeleteDone = () => {
    setIsLoading(false);
    setSelectedStaffForDeletion(null);
  };

  // Format phone number
  const formatPhone = (phone) => {
    if (!phone) return "-";
    const cleaned = phone.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  // Build search criteria display
  const searchCriteria = [];
  if (firstName)
    searchCriteria.push({
      label: "First Name",
      value: firstName,
      icon: UserIcon,
    });
  if (lastName)
    searchCriteria.push({
      label: "Last Name",
      value: lastName,
      icon: UserIcon,
    });
  if (email)
    searchCriteria.push({ label: "Email", value: email, icon: EnvelopeIcon });
  if (phone)
    searchCriteria.push({ label: "Phone", value: phone, icon: PhoneIcon });
  searchCriteria.push({
    label: "Status",
    value: isActive ? "Active Only" : "All",
    icon: CheckCircleIcon,
  });

  // Calculate current page info
  const currentPage = previousCursors.length + 1;
  const totalCount = staffList?.count || 0;
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(
    startRecord + (staffList?.results?.length || 0) - 1,
    totalCount,
  );

  // Effect to fetch data when component mounts or filters change
  useEffect(() => {
    fetchStaffList();
  }, [fetchStaffList]);

  // Get type badge color
  const getTypeBadgeColor = (typeValue) => {
    switch (typeValue) {
      case 1: // Executive
        return "bg-purple-100 text-purple-800";
      case 2: // Management
        return "bg-blue-100 text-blue-800";
      case 3: // Frontline
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (statusValue) => {
    switch (statusValue) {
      case 1: // Active
        return "bg-green-100 text-green-800";
      case 2: // Archived
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading && !staffList) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading search results...</p>
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
                  to="/admin/staff"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  Staff
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/staff/search"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  Search
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  Results
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Search Results
                </h1>
              </div>
              <p className="mt-2 text-lg text-gray-600 ml-11">
                Staff search results
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/staff/search")}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Search
            </button>
          </div>

          {/* Search Criteria Display */}
          {searchCriteria.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchCriteria.map((criteria, index) => {
                const Icon = criteria.icon;
                return (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    <Icon className="h-4 w-4 mr-1.5" />
                    {criteria.label}: {criteria.value}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setSuccessMessage("")}
                  className="inline-flex text-green-400 hover:text-green-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {errors.message && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIconSolid className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{errors.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setErrors({})}
                  className="inline-flex text-red-400 hover:text-red-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          {/* Results Header with Filters */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Results
                </h2>
                {!isLoading && staffList && staffList.results && (
                  <p className="mt-1 text-sm text-gray-600">
                    Found <span className="font-semibold">{totalCount}</span>{" "}
                    staff members
                    {searchCriteria.length > 0 && " matching your criteria"}
                  </p>
                )}
              </div>

              {/* Filters and Sorting */}
              {!isLoading &&
                staffList &&
                staffList.results &&
                staffList.results.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Toggle Filters */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FunnelIcon className="h-4 w-4 mr-1.5" />
                      Filters
                      <ChevronDownIcon
                        className={`h-4 w-4 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Sort By */}
                    <div className="flex items-center">
                      <ArrowsUpDownIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <select
                        value={sortBy}
                        onChange={handleSortByChange}
                        className="block rounded-lg border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {STAFF_SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Page Size */}
                    <div className="flex items-center">
                      <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <select
                        value={pageSize.toString()}
                        onChange={handlePageSizeChange}
                        className="block rounded-lg border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {PAGE_SIZE_OPTIONS.map((option) => (
                          <option
                            key={option.value}
                            value={option.value.toString()}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
            </div>

            {/* Expandable Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={handleStatusChange}
                      className="w-full rounded-lg border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {STAFF_STATUS_FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={type}
                      onChange={handleTypeChange}
                      className="w-full rounded-lg border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {STAFF_TYPE_FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <svg
                  className="animate-spin h-10 w-10 text-blue-600 mb-4"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="text-gray-600">Updating results...</p>
              </div>
            ) : staffList &&
              staffList.results &&
              staffList.results.length > 0 ? (
              <>
                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {staffList.results.map((staff) => (
                    <div
                      key={staff.id}
                      className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                    >
                      {/* Card Header */}
                      <div className="p-4 border-b border-gray-100">
                        <Link
                          to={`/admin/staff/${staff.id}`}
                          className="flex items-start text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          <UserIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                          <span>
                            {staff.name ||
                              `${staff.firstName} ${staff.lastName}`}
                          </span>
                        </Link>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-2 text-sm">
                        {staff.phone && (
                          <div className="flex items-center text-gray-600">
                            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <a
                              href={`tel:${staff.phone}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {formatPhone(staff.phone)}
                            </a>
                          </div>
                        )}

                        {staff.email && (
                          <div className="flex items-center text-gray-600">
                            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <a
                              href={`mailto:${staff.email}`}
                              className="text-blue-600 hover:text-blue-800 truncate"
                            >
                              {staff.email}
                            </a>
                          </div>
                        )}

                        {/* Type and Status Badges */}
                        <div className="pt-2 flex flex-wrap gap-2">
                          {staff.type && (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(staff.type)}`}
                            >
                              <BriefcaseIcon className="h-3 w-3 mr-1" />
                              {STAFF_TYPE_MAP[staff.type]}
                            </span>
                          )}
                          {staff.status && (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(staff.status)}`}
                            >
                              {staff.status === 1 ? "Active" : "Archived"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <div className="flex gap-2">
                          <Link
                            to={`/admin/staff/${staff.id}`}
                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </Link>
                          <Link
                            to={`/admin/staff/${staff.id}/edit`}
                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStaffForDeletion(staff);
                          }}
                          className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          <ArchiveBoxIcon className="h-4 w-4 mr-1" />
                          Archive
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Footer */}
                {(previousCursors.length > 0 || staffList.hasNextPage) && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={handlePreviousPage}
                        disabled={previousCursors.length === 0}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={handleNextPage}
                        disabled={!staffList.hasNextPage}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">{startRecord}</span> to{" "}
                          <span className="font-medium">{endRecord}</span> of{" "}
                          <span className="font-medium">{totalCount}</span>{" "}
                          results
                        </p>
                      </div>
                      <div>
                        <nav
                          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                          aria-label="Pagination"
                        >
                          <button
                            onClick={handlePreviousPage}
                            disabled={previousCursors.length === 0}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </button>
                          {/* Page Numbers */}
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            Page {currentPage}
                          </span>
                          dom
                          <button
                            onClick={handleNextPage}
                            disabled={!staffList.hasNextPage}
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
                )}
              </>
            ) : (
              <div className="text-center py-16 px-4">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Staff Members Found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No staff members match your search criteria. Try adjusting
                  your search terms or filters.
                </p>
                <Link
                  to="/admin/staff/search"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Try New Search
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
          <button
            onClick={() => navigate("/admin/staff/search")}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Search Again
          </button>
          <button
            onClick={() => navigate("/admin/staff")}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Staff
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {selectedStaffForDeletion && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-amber-600" />
                Archive Staff Member
              </h3>
            </div>

            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                You are about to <strong>archive</strong> this staff member.
                They will no longer appear on your dashboard. This action can be
                undone but you'll need to contact the system administrator. Are
                you sure you would like to continue?
              </p>

              <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                <p className="text-sm font-medium text-gray-700">
                  <strong>Name:</strong>{" "}
                  {selectedStaffForDeletion.name ||
                    `${selectedStaffForDeletion.firstName} ${selectedStaffForDeletion.lastName}`}
                </p>
                {selectedStaffForDeletion.email && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Email:</strong> {selectedStaffForDeletion.email}
                  </p>
                )}
                {selectedStaffForDeletion.type && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Type:</strong>{" "}
                    {STAFF_TYPE_MAP[selectedStaffForDeletion.type]}
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedStaffForDeletion(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
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
                    Archiving...
                  </>
                ) : (
                  <>
                    <ArchiveBoxIcon className="h-4 w-4 mr-2" />
                    Confirm Archive
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStaffSearchResultPage;
