// File Path: web/workery-frontend/src/pages/Admin/Order/Search/ResultPage.jsx
// UIX Upgraded - Uses UIX primitives (Card, Alert, Spinner, Breadcrumb, Button, Badge)
// @uix-page: SearchResultPage

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuthManager, useOrderManager } from "../../../../services/Services";
import {
  Card,
  Alert,
  Spinner,
  Breadcrumb,
  Button,
  Badge,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsUpDownIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  HomeIcon,
  BuildingOffice2Icon,
  PhoneIcon,
  EnvelopeIcon,
  EyeIcon,
  CalendarIcon,
  FunnelIcon,
  UserIcon,
  ChevronDownIcon,
  HashtagIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";

// Constants for order types - frozen for performance
const ORDER_TYPE_IDS = Object.freeze({
  RESIDENTIAL: 1,
  COMMERCIAL: 2,
  UNASSIGNED: 3,
});

// Static breadcrumb items
const BREADCRUMB_ITEMS = Object.freeze([
  { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
  { label: "Orders", to: "/admin/orders", icon: ClipboardDocumentListIcon },
  { label: "Search", to: "/admin/orders/search", icon: MagnifyingGlassIcon },
  { label: "Results", isActive: true },
]);

// Sort options - frozen for performance
const ORDER_SORT_OPTIONS = Object.freeze([
  { value: "created_at,DESC", label: "Newest First" },
  { value: "created_at,ASC", label: "Oldest First" },
  { value: "start_date,DESC", label: "Start Date (Newest)" },
  { value: "start_date,ASC", label: "Start Date (Oldest)" },
  { value: "customer_last_name,ASC", label: "Customer Name (A-Z)" },
  { value: "customer_last_name,DESC", label: "Customer Name (Z-A)" },
]);

// Status filter options - frozen for performance
const ORDER_STATUS_FILTER_OPTIONS = Object.freeze([
  { value: "", label: "All Statuses" },
  { value: "1", label: "New" },
  { value: "2", label: "Assigned" },
  { value: "3", label: "In Progress" },
  { value: "4", label: "Completed" },
  { value: "5", label: "Closed" },
  { value: "6", label: "Cancelled" },
]);

// Type filter options - frozen for performance
const ORDER_TYPE_FILTER_OPTIONS = Object.freeze([
  { value: "", label: "All Types" },
  { value: "1", label: "Residential" },
  { value: "2", label: "Commercial" },
  { value: "3", label: "Unassigned" },
]);

// Page size options - frozen for performance
const PAGE_SIZE_OPTIONS = Object.freeze([
  { value: 10, label: "10 per page" },
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
]);

// Status badge mapping - frozen for performance
const STATUS_BADGE_MAP = Object.freeze({
  1: { variant: "success", label: "New" },
  2: { variant: "info", label: "Assigned" },
  3: { variant: "warning", label: "In Progress" },
  4: { variant: "secondary", label: "Completed" },
  5: { variant: "default", label: "Closed" },
  6: { variant: "danger", label: "Cancelled" },
});

// Safe field access helper
const getFieldValue = (obj, path, defaultValue = "") => {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined && current[key] !== null
      ? current[key]
      : defaultValue;
  }, obj);
};

// Format phone number helper
const formatPhone = (phone) => {
  if (!phone) return "-";
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

// Memoized Order Card component
const OrderCard = memo(function OrderCard({ order }) {
  const wjid = getFieldValue(order, "wjid") || order.id;
  const customerFirstName = getFieldValue(order, "customerFirstName", "");
  const customerLastName = getFieldValue(order, "customerLastName", "");
  const customerOrgName = getFieldValue(order, "customerOrganizationName", "");
  const associateFirstName = getFieldValue(order, "associateFirstName", "");
  const associateLastName = getFieldValue(order, "associateLastName", "");
  const orderType = parseInt(getFieldValue(order, "type", "0"));
  const orderStatus = parseInt(getFieldValue(order, "status", "0"));
  const startDate = getFieldValue(order, "startDate");
  const description = getFieldValue(order, "description", "No description");
  const customerEmail = getFieldValue(order, "customerEmail");
  const customerPhone = getFieldValue(order, "customerPhone");

  const customerName =
    customerOrgName ||
    `${customerFirstName} ${customerLastName}`.trim() ||
    "Unknown Customer";
  const associateName =
    `${associateFirstName} ${associateLastName}`.trim() || "Unassigned";

  const statusConfig = STATUS_BADGE_MAP[orderStatus] || { variant: "default", label: "Unknown" };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <Link
          to={`/admin/order/${wjid}`}
          className="flex items-start text-blue-600 hover:text-blue-800 font-semibold"
        >
          <HashtagIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>Job #{wjid}</span>
        </Link>
        <div className="mt-2">
          <Badge variant={statusConfig.variant} size="sm">
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-2 text-sm">
        {/* Customer Info */}
        <div className="font-medium text-gray-900 flex items-start">
          {orderType === ORDER_TYPE_IDS.COMMERCIAL ? (
            <BuildingOffice2Icon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
          ) : (
            <HomeIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-medium">{customerName}</div>
            {customerFirstName && customerLastName && customerOrgName && (
              <div className="text-gray-500 text-xs">
                {customerFirstName} {customerLastName}
              </div>
            )}
          </div>
        </div>

        {/* Associate */}
        <div className="flex items-center text-gray-600">
          <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span className={associateName === "Unassigned" ? "text-gray-400 italic" : ""}>
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
            <a href={`tel:${customerPhone}`} className="text-blue-600 hover:text-blue-800">
              {formatPhone(customerPhone)}
            </a>
          </div>
        )}

        {customerEmail && (
          <div className="flex items-center text-gray-600">
            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
            <a href={`mailto:${customerEmail}`} className="text-blue-600 hover:text-blue-800 truncate">
              {customerEmail}
            </a>
          </div>
        )}

        {/* Description Preview */}
        <div className="pt-2 text-gray-600">
          <p className="text-xs line-clamp-2" title={description}>
            {description}
          </p>
        </div>

        {/* Order Type Badge */}
        <div className="pt-2">
          <Badge
            variant={
              orderType === ORDER_TYPE_IDS.COMMERCIAL
                ? "info"
                : orderType === ORDER_TYPE_IDS.RESIDENTIAL
                  ? "success"
                  : "default"
            }
            size="sm"
          >
            {orderType === ORDER_TYPE_IDS.COMMERCIAL
              ? "Commercial"
              : orderType === ORDER_TYPE_IDS.RESIDENTIAL
                ? "Residential"
                : "Unassigned"}
          </Badge>
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
});

// Main content component
const ResultPageContent = memo(function ResultPageContent() {
  const authManager = useAuthManager();
  const orderManager = useOrderManager();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Extract search parameters from URL - memoized
  const searchCriteria = useMemo(() => ({
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
  }), [searchParams]);

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

  // Memoized unauthorized handler
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Check authentication on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
    }
  }, [authManager, navigate]);

  // Build search params helper - memoized
  const buildSearchParams = useCallback((page = 1) => {
    const params = {
      page: page,
      limit: pageSize,
    };

    if (sortByValue) {
      const [field, order] = sortByValue.split(",");
      params.sortBy = field;
      params.sortOrder = order;
    }

    if (status) params.status = status;
    if (typeOf) params.type = typeOf;
    if (searchCriteria.generalSearch) params.search = searchCriteria.generalSearch;
    if (searchCriteria.customerFirstName) params.customerFirstName = searchCriteria.customerFirstName;
    if (searchCriteria.customerLastName) params.customerLastName = searchCriteria.customerLastName;
    if (searchCriteria.customerEmail) params.customerEmail = searchCriteria.customerEmail;
    if (searchCriteria.customerPhone) params.customerPhone = searchCriteria.customerPhone;
    if (searchCriteria.customerOrganizationName) params.customerOrganizationName = searchCriteria.customerOrganizationName;
    if (searchCriteria.associateFirstName) params.associateFirstName = searchCriteria.associateFirstName;
    if (searchCriteria.associateLastName) params.associateLastName = searchCriteria.associateLastName;
    if (searchCriteria.associateEmail) params.associateEmail = searchCriteria.associateEmail;
    if (searchCriteria.associatePhone) params.associatePhone = searchCriteria.associatePhone;
    if (searchCriteria.associateOrganizationName) params.associateOrganizationName = searchCriteria.associateOrganizationName;
    if (searchCriteria.orderWjid) params.wjid = searchCriteria.orderWjid;

    return params;
  }, [pageSize, sortByValue, status, typeOf, searchCriteria]);

  // Fetch orders function - memoized
  const fetchOrders = useCallback(async (page = 1) => {
    if (isFetching) return;

    setFetching(true);
    setErrors({});

    try {
      const params = buildSearchParams(page);
      orderManager.clearOrdersCache();

      const ordersData = await orderManager.getOrders(params, onUnauthorized, true);

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
  }, [buildSearchParams, isFetching, orderManager, onUnauthorized]);

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
          message: "No search criteria provided. Please go back and enter search terms.",
        });
        setHasSearched(true);
      }
    }

    return () => {
      mounted = false;
    };
  }, [pageSize, sortByValue, status, typeOf, currentPage, authManager, searchCriteria]);

  // Handle pagination
  const handlePageChange = useCallback((newPage) => {
    if (isFetching) return;

    const totalPages = Math.ceil(totalCount / pageSize);

    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  }, [isFetching, totalCount, pageSize, currentPage]);

  // Handle sort change
  const handleSortChange = useCallback((e) => {
    setSortByValue(e.target.value);
    setCurrentPage(1);
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  }, []);

  // Handle status filter change
  const handleStatusChange = useCallback((e) => {
    setStatus(e.target.value);
    setCurrentPage(1);
  }, []);

  // Handle type filter change
  const handleTypeChange = useCallback((e) => {
    setTypeOf(e.target.value);
    setCurrentPage(1);
  }, []);

  // Toggle filters
  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  // Dismiss handlers
  const handleDismissSuccess = useCallback(() => {
    setSuccessMessage("");
  }, []);

  const handleDismissError = useCallback(() => {
    setErrors({});
  }, []);

  // Navigation handlers
  const handleBackToSearch = useCallback(() => {
    navigate("/admin/orders/search");
  }, [navigate]);

  const handleBackToOrders = useCallback(() => {
    navigate("/admin/orders");
  }, [navigate]);

  // Build search criteria display - memoized
  const searchCriteriaDisplay = useMemo(() => {
    const criteria = [];

    if (searchCriteria.generalSearch) {
      criteria.push({ label: "Keywords", value: searchCriteria.generalSearch, icon: MagnifyingGlassIcon });
    }
    if (searchCriteria.customerFirstName || searchCriteria.customerLastName) {
      const name = [searchCriteria.customerFirstName, searchCriteria.customerLastName].filter(Boolean).join(" ");
      criteria.push({ label: "Customer", value: name, icon: UserIcon });
    }
    if (searchCriteria.customerEmail) {
      criteria.push({ label: "Customer Email", value: searchCriteria.customerEmail, icon: EnvelopeIcon });
    }
    if (searchCriteria.customerPhone) {
      criteria.push({ label: "Customer Phone", value: searchCriteria.customerPhone, icon: PhoneIcon });
    }
    if (searchCriteria.customerOrganizationName) {
      criteria.push({ label: "Customer Org", value: searchCriteria.customerOrganizationName, icon: BuildingOffice2Icon });
    }
    if (searchCriteria.associateFirstName || searchCriteria.associateLastName) {
      const name = [searchCriteria.associateFirstName, searchCriteria.associateLastName].filter(Boolean).join(" ");
      criteria.push({ label: "Associate", value: name, icon: UserGroupIcon });
    }
    if (searchCriteria.associateEmail) {
      criteria.push({ label: "Associate Email", value: searchCriteria.associateEmail, icon: EnvelopeIcon });
    }
    if (searchCriteria.associatePhone) {
      criteria.push({ label: "Associate Phone", value: searchCriteria.associatePhone, icon: PhoneIcon });
    }
    if (searchCriteria.associateOrganizationName) {
      criteria.push({ label: "Associate Org", value: searchCriteria.associateOrganizationName, icon: BuildingOffice2Icon });
    }
    if (searchCriteria.orderWjid) {
      criteria.push({ label: "Job #", value: searchCriteria.orderWjid, icon: HashtagIcon });
    }

    return criteria;
  }, [searchCriteria]);

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  if (isFetching && !hasSearched) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading search results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={BREADCRUMB_ITEMS} className="mb-8" />

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center">
                <ClipboardDocumentListIcon className={`h-8 w-8 mr-3 ${themeClasses.linkPrimary}`} />
                <h1 className={`text-3xl font-bold ${themeClasses.textPrimary}`}>
                  Search Results
                </h1>
              </div>
              <p className={`mt-2 text-lg ${themeClasses.textSecondary} ml-11`}>
                Order search results
              </p>
            </div>
            <Button variant="outline" onClick={handleBackToSearch} icon={ArrowLeftIcon}>
              Back to Search
            </Button>
          </div>

          {/* Search Criteria Display */}
          {searchCriteriaDisplay.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchCriteriaDisplay.map((criteria, index) => {
                const Icon = criteria.icon;
                return (
                  <Badge key={index} variant="info" size="sm" className="inline-flex items-center">
                    <Icon className="h-4 w-4 mr-1.5" />
                    {criteria.label}: {criteria.value}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert type="success" className="mb-6" dismissible onDismiss={handleDismissSuccess}>
            {successMessage}
          </Alert>
        )}

        {errors.message && (
          <Alert type="error" className="mb-6" dismissible onDismiss={handleDismissError}>
            {errors.message}
          </Alert>
        )}

        {/* Main Content */}
        <Card>
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
                    {searchCriteriaDisplay.length > 0 && " matching your criteria"}
                  </p>
                )}
              </div>

              {/* Filters and Sorting */}
              {!isFetching && hasSearched && orders.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  {/* Toggle Filters */}
                  <button
                    onClick={handleToggleFilters}
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
                        <option key={option.value} value={option.value.toString()}>
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
                      onChange={handleTypeChange}
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
                <Spinner size="lg" className="mb-4" />
                <p className="text-gray-600">Updating results...</p>
              </div>
            ) : hasSearched && orders.length > 0 ? (
              <>
                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
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
                          Showing <span className="font-medium">{startRecord}</span> to{" "}
                          <span className="font-medium">{endRecord}</span> of{" "}
                          <span className="font-medium">{totalCount}</span> results
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
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button>

                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            Page {currentPage} of {totalPages}
                          </span>

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
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
                  No orders match your search criteria. Try adjusting your search terms or filters.
                </p>
                <Button variant="primary" onClick={handleBackToSearch} icon={ArrowLeftIcon}>
                  Try New Search
                </Button>
              </div>
            ) : null}
          </div>
        </Card>

        {/* Bottom Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
          <Button variant="outline" onClick={handleBackToSearch} icon={ArrowLeftIcon}>
            Search Again
          </Button>
          <Button variant="outline" onClick={handleBackToOrders}>
            Back to Orders
          </Button>
        </div>
      </div>
    </div>
  );
});

// Wrapper with UIXThemeProvider
function AdminOrderSearchResultPage() {
  return (
    <UIXThemeProvider>
      <ResultPageContent />
    </UIXThemeProvider>
  );
}

export default AdminOrderSearchResultPage;
