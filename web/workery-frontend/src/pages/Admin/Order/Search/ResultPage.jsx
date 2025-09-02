// File Path: web/workery-frontend/src/pages/Admin/Order/Search/ResultPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuthManager, useOrderManager } from "../../../../services/Services";
import {
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  ArrowLeftIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsUpDownIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  BuildingOffice2Icon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  EyeIcon,
  CheckCircleIcon,
  CalendarIcon,
  FunnelIcon,
  UserIcon,
  ChevronDownIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  HashtagIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon as ExclamationTriangleIconSolid } from "@heroicons/react/24/solid";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";

// Constants for order types and statuses
const RESIDENTIAL_ORDER_TYPE_OF_ID = 1;
const COMMERCIAL_ORDER_TYPE_OF_ID = 2;
const UNASSIGNED_ORDER_TYPE_OF_ID = 3;

// Sort options
const ORDER_SORT_OPTIONS = [
  { value: "created_at,DESC", label: "Newest First" },
  { value: "created_at,ASC", label: "Oldest First" },
  { value: "start_date,DESC", label: "Start Date (Newest)" },
  { value: "start_date,ASC", label: "Start Date (Oldest)" },
  { value: "customer_last_name,ASC", label: "Customer Name (A-Z)" },
  { value: "customer_last_name,DESC", label: "Customer Name (Z-A)" },
];

// Status filter options
const ORDER_STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "1", label: "New" },
  { value: "2", label: "Assigned" },
  { value: "3", label: "In Progress" },
  { value: "4", label: "Completed" },
  { value: "5", label: "Closed" },
  { value: "6", label: "Cancelled" },
];

// Type filter options
const ORDER_TYPE_FILTER_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "1", label: "Residential" },
  { value: "2", label: "Commercial" },
  { value: "3", label: "Unassigned" },
];

// Page size options
const PAGE_SIZE_OPTIONS = [
  { value: 10, label: "10 per page" },
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
];

function AdminOrderSearchResultPage() {
  const authManager = useAuthManager();
  const orderManager = useOrderManager();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract search parameters from URL
  const searchCriteria = {
    customerFirstName: searchParams.get("cfn") || "",
    customerLastName: searchParams.get("cln") || "",
    customerEmail: searchParams.get("ce") || "",
    customerPhone: searchParams.get("cp") || "",
    customerOrganizationName: searchParams.get("con") || "",
    generalSearch: searchParams.get("q") || "",
    associateFirstName: searchParams.get("afn") || "",
    associateLastName: searchParams.get("aln") || "",
    associateEmail: searchParams.get("ae") || "",
    associatePhone: searchParams.get("ap") || "",
    associateOrganizationName: searchParams.get("aon") || "",
    orderWjid: searchParams.get("owjid") || "",
  };

  // Component states
  const [errors, setErrors] = useState({});
  const [orders, setOrders] = useState([]);
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortByValue, setSortByValue] = useState("created_at,DESC");
  const [status, setStatus] = useState("");
  const [typeOf, setTypeOf] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
    }
  }, [authManager, navigate]);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const buildSearchParams = (page = 1) => {
    const params = {
      page: page,
      limit: pageSize,
    };

    // Add sorting
    if (sortByValue) {
      const [field, order] = sortByValue.split(",");
      params.sortBy = field;
      params.sortOrder = order;
    }

    // Add status filter
    if (status) {
      params.status = status;
    }

    // Add type filter
    if (typeOf) {
      params.type = typeOf;
    }

    // Add search criteria
    if (searchCriteria.generalSearch) {
      params.search = searchCriteria.generalSearch;
    }
    if (searchCriteria.customerFirstName) {
      params.customerFirstName = searchCriteria.customerFirstName;
    }
    if (searchCriteria.customerLastName) {
      params.customerLastName = searchCriteria.customerLastName;
    }
    if (searchCriteria.customerEmail) {
      params.customerEmail = searchCriteria.customerEmail;
    }
    if (searchCriteria.customerPhone) {
      params.customerPhone = searchCriteria.customerPhone;
    }
    if (searchCriteria.customerOrganizationName) {
      params.customerOrganizationName = searchCriteria.customerOrganizationName;
    }
    if (searchCriteria.associateFirstName) {
      params.associateFirstName = searchCriteria.associateFirstName;
    }
    if (searchCriteria.associateLastName) {
      params.associateLastName = searchCriteria.associateLastName;
    }
    if (searchCriteria.associateEmail) {
      params.associateEmail = searchCriteria.associateEmail;
    }
    if (searchCriteria.associatePhone) {
      params.associatePhone = searchCriteria.associatePhone;
    }
    if (searchCriteria.associateOrganizationName) {
      params.associateOrganizationName =
        searchCriteria.associateOrganizationName;
    }
    if (searchCriteria.orderWjid) {
      params.wjid = searchCriteria.orderWjid;
    }

    return params;
  };

  const fetchOrders = async (page = 1) => {
    if (isFetching) {
      console.log("Already fetching, skipping duplicate request");
      return;
    }

    setFetching(true);
    setErrors({});

    try {
      const params = buildSearchParams(page);

      console.log("Fetching orders with params:", params);

      // Clear the orders cache to ensure fresh data
      orderManager.clearOrdersCache();

      // Fetch orders using the OrderManager
      const ordersData = await orderManager.getOrders(
        params,
        onUnauthorized,
        true, // Force refresh
      );

      console.log("Orders data received:", {
        resultsCount: ordersData.results ? ordersData.results.length : 0,
        totalCount: ordersData.count,
        page: page,
      });

      setOrders(ordersData.results || []);
      setTotalCount(ordersData.count || 0);
      setCurrentPage(page);
      setHasSearched(true);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setErrors({
        message: error.message || "Failed to load order search results",
      });
      setOrders([]);
      setTotalCount(0);
      setHasSearched(true);
    } finally {
      setFetching(false);
    }
  };

  // Fetch list when parameters change
  useEffect(() => {
    let mounted = true;

    if (mounted && authManager.isAuthenticated()) {
      const hasAnyCriteria = Object.values(searchCriteria).some(
        (value) => value && value.trim(),
      );

      if (hasAnyCriteria) {
        fetchOrders(currentPage);
      } else {
        setErrors({
          message:
            "No search criteria provided. Please go back and enter search terms.",
        });
        setHasSearched(true);
      }
    }

    return () => {
      mounted = false;
    };
  }, [pageSize, sortByValue, status, typeOf, currentPage]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (isFetching) {
      return;
    }

    const totalPages = Math.ceil(totalCount / pageSize);

    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      console.log(`Changing to page ${newPage} of ${totalPages}`);
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortByValue(e.target.value);
    setCurrentPage(1);
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Safe field access helper
  const getFieldValue = (obj, path, defaultValue = "") => {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined && current[key] !== null
        ? current[key]
        : defaultValue;
    }, obj);
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

  // Get status badge style
  const getStatusBadgeClass = (status) => {
    const statusNum = parseInt(status);
    switch (statusNum) {
      case 1: // New
        return "bg-green-100 text-green-800";
      case 2: // Assigned
        return "bg-blue-100 text-blue-800";
      case 3: // In Progress
        return "bg-yellow-100 text-yellow-800";
      case 4: // Completed
        return "bg-purple-100 text-purple-800";
      case 5: // Closed
        return "bg-gray-100 text-gray-800";
      case 6: // Cancelled
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    const statusNum = parseInt(status);
    switch (statusNum) {
      case 1:
        return "New";
      case 2:
        return "Assigned";
      case 3:
        return "In Progress";
      case 4:
        return "Completed";
      case 5:
        return "Closed";
      case 6:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  // Build search criteria display
  const getSearchCriteriaDisplay = () => {
    const criteria = [];

    if (searchCriteria.generalSearch) {
      criteria.push({
        label: "Keywords",
        value: searchCriteria.generalSearch,
        icon: MagnifyingGlassIcon,
      });
    }
    if (searchCriteria.customerFirstName || searchCriteria.customerLastName) {
      const name = [
        searchCriteria.customerFirstName,
        searchCriteria.customerLastName,
      ]
        .filter(Boolean)
        .join(" ");
      criteria.push({
        label: "Customer",
        value: name,
        icon: UserIcon,
      });
    }
    if (searchCriteria.customerEmail) {
      criteria.push({
        label: "Customer Email",
        value: searchCriteria.customerEmail,
        icon: EnvelopeIcon,
      });
    }
    if (searchCriteria.customerPhone) {
      criteria.push({
        label: "Customer Phone",
        value: searchCriteria.customerPhone,
        icon: PhoneIcon,
      });
    }
    if (searchCriteria.customerOrganizationName) {
      criteria.push({
        label: "Customer Org",
        value: searchCriteria.customerOrganizationName,
        icon: BuildingOffice2Icon,
      });
    }
    if (searchCriteria.associateFirstName || searchCriteria.associateLastName) {
      const name = [
        searchCriteria.associateFirstName,
        searchCriteria.associateLastName,
      ]
        .filter(Boolean)
        .join(" ");
      criteria.push({
        label: "Associate",
        value: name,
        icon: UserGroupIcon,
      });
    }
    if (searchCriteria.associateEmail) {
      criteria.push({
        label: "Associate Email",
        value: searchCriteria.associateEmail,
        icon: EnvelopeIcon,
      });
    }
    if (searchCriteria.associatePhone) {
      criteria.push({
        label: "Associate Phone",
        value: searchCriteria.associatePhone,
        icon: PhoneIcon,
      });
    }
    if (searchCriteria.associateOrganizationName) {
      criteria.push({
        label: "Associate Org",
        value: searchCriteria.associateOrganizationName,
        icon: BuildingOffice2Icon,
      });
    }
    if (searchCriteria.orderWjid) {
      criteria.push({
        label: "Job #",
        value: searchCriteria.orderWjid,
        icon: HashtagIcon,
      });
    }

    return criteria;
  };

  const searchCriteriaDisplay = getSearchCriteriaDisplay();

  // Calculate current page info
  const totalPages = Math.ceil(totalCount / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  if (isFetching && !hasSearched) {
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
                  to="/admin/orders"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  Orders
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/orders/search"
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
                <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Search Results
                </h1>
              </div>
              <p className="mt-2 text-lg text-gray-600 ml-11">
                Order search results
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/orders/search")}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Search
            </button>
          </div>

          {/* Search Criteria Display */}
          {searchCriteriaDisplay.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchCriteriaDisplay.map((criteria, index) => {
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
                {!isFetching && hasSearched && (
                  <p className="mt-1 text-sm text-gray-600">
                    Found <span className="font-semibold">{totalCount}</span>{" "}
                    order{totalCount !== 1 ? "s" : ""}
                    {searchCriteriaDisplay.length > 0 &&
                      " matching your criteria"}
                  </p>
                )}
              </div>

              {/* Filters and Sorting */}
              {!isFetching && hasSearched && orders.length > 0 && (
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
                      value={sortByValue}
                      onChange={handleSortChange}
                      className="block rounded-lg border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {ORDER_SORT_OPTIONS.map((option) => (
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
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full rounded-lg border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {ORDER_STATUS_FILTER_OPTIONS.map((option) => (
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
                      value={typeOf}
                      onChange={(e) => setTypeOf(e.target.value)}
                      className="w-full rounded-lg border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {ORDER_TYPE_FILTER_OPTIONS.map((option) => (
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
            {isFetching ? (
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
            ) : hasSearched && orders.length > 0 ? (
              <>
                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {orders.map((order) => {
                    const wjid = getFieldValue(order, "wjid") || order.id;
                    const customerFirstName = getFieldValue(
                      order,
                      "customerFirstName",
                      "",
                    );
                    const customerLastName = getFieldValue(
                      order,
                      "customerLastName",
                      "",
                    );
                    const customerOrgName = getFieldValue(
                      order,
                      "customerOrganizationName",
                      "",
                    );
                    const associateFirstName = getFieldValue(
                      order,
                      "associateFirstName",
                      "",
                    );
                    const associateLastName = getFieldValue(
                      order,
                      "associateLastName",
                      "",
                    );
                    const orderType = parseInt(
                      getFieldValue(order, "type", "0"),
                    );
                    const orderStatus = getFieldValue(order, "status", "");
                    const startDate = getFieldValue(order, "startDate");
                    const description = getFieldValue(
                      order,
                      "description",
                      "No description",
                    );
                    const customerEmail = getFieldValue(order, "customerEmail");
                    const customerPhone = getFieldValue(order, "customerPhone");

                    const customerName =
                      customerOrgName ||
                      `${customerFirstName} ${customerLastName}`.trim() ||
                      "Unknown Customer";
                    const associateName =
                      `${associateFirstName} ${associateLastName}`.trim() ||
                      "Unassigned";

                    return (
                      <div
                        key={order.id}
                        className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                      >
                        {/* Card Header */}
                        <div className="p-4 border-b border-gray-100">
                          <Link
                            to={`/admin/order/${wjid}`}
                            className="flex items-start text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            <HashtagIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Job #{wjid}</span>
                          </Link>
                          {/* Status Badge */}
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(orderStatus)}`}
                            >
                              {getStatusLabel(orderStatus)}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 space-y-2 text-sm">
                          {/* Customer Info */}
                          <div className="font-medium text-gray-900 flex items-start">
                            {orderType === COMMERCIAL_ORDER_TYPE_OF_ID ? (
                              <BuildingOffice2Icon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <HomeIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="font-medium">{customerName}</div>
                              {customerFirstName &&
                                customerLastName &&
                                customerOrgName && (
                                  <div className="text-gray-500 text-xs">
                                    {customerFirstName} {customerLastName}
                                  </div>
                                )}
                            </div>
                          </div>

                          {/* Associate */}
                          <div className="flex items-center text-gray-600">
                            <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <span
                              className={
                                associateName === "Unassigned"
                                  ? "text-gray-400 italic"
                                  : ""
                              }
                            >
                              {associateName}
                            </span>
                          </div>

                          {/* Start Date */}
                          {startDate && (
                            <div className="flex items-center text-gray-600">
                              <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                              {formatDateForDisplay(startDate)}
                            </div>
                          )}

                          {/* Customer Contact */}
                          {customerPhone && (
                            <div className="flex items-center text-gray-600">
                              <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <a
                                href={`tel:${customerPhone}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {formatPhone(customerPhone)}
                              </a>
                            </div>
                          )}

                          {customerEmail && (
                            <div className="flex items-center text-gray-600">
                              <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <a
                                href={`mailto:${customerEmail}`}
                                className="text-blue-600 hover:text-blue-800 truncate"
                              >
                                {customerEmail}
                              </a>
                            </div>
                          )}

                          {/* Description Preview */}
                          <div className="pt-2 text-gray-600">
                            <p
                              className="text-xs line-clamp-2"
                              title={description}
                            >
                              {description}
                            </p>
                          </div>

                          {/* Order Type Badge */}
                          <div className="pt-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                orderType === COMMERCIAL_ORDER_TYPE_OF_ID
                                  ? "bg-blue-100 text-blue-800"
                                  : orderType === RESIDENTIAL_ORDER_TYPE_OF_ID
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {orderType === COMMERCIAL_ORDER_TYPE_OF_ID
                                ? "Commercial"
                                : orderType === RESIDENTIAL_ORDER_TYPE_OF_ID
                                  ? "Residential"
                                  : "Unassigned"}
                            </span>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-center">
                          <Link
                            to={`/admin/order/${wjid}`}
                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View Details
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
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
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
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
                            Page {currentPage} of {totalPages}
                          </span>

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
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
            ) : hasSearched ? (
              <div className="text-center py-16 px-4">
                <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Orders Found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No orders match your search criteria. Try adjusting your
                  search terms or filters.
                </p>
                <Link
                  to="/admin/orders/search"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Try New Search
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
          <button
            onClick={() => navigate("/admin/orders/search")}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Search Again
          </button>
          <button
            onClick={() => navigate("/admin/orders")}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderSearchResultPage;
