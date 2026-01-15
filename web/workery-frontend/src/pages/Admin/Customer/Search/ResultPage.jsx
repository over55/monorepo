// File Path: monorepo/web/workery-frontend/src/pages/Admin/Customer/Search/ResultPage.jsx
// UIX Upgraded - Uses UIX primitives (Card, Alert, Button, Breadcrumb, Spinner, etc.)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { DateTime } from "luxon";
import {
  useAuthManager,
  useCustomerManager,
} from "../../../../services/Services";
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
  HomeIcon,
  BuildingOffice2Icon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ArchiveBoxIcon,
  EyeIcon,
  CheckCircleIcon,
  CalendarIcon,
  FunnelIcon,
  UserIcon,
  ChevronDownIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon as ExclamationTriangleIconSolid } from "@heroicons/react/24/solid";
import {
  Alert,
  Breadcrumb,
  Spinner,
  Modal,
  Button,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";

// Constants for customer types and statuses - matching old implementation
const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 1;
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 2;
const CUSTOMER_STATUS_ACTIVE = 1;

// Sort options - matching backend expectations
const CUSTOMER_SORT_OPTIONS = [
  { value: "last_name,ASC", label: "Last Name (A-Z)" },
  { value: "last_name,DESC", label: "Last Name (Z-A)" },
  { value: "lexical_name,ASC", label: "Name (A-Z)" },
  { value: "lexical_name,DESC", label: "Name (Z-A)" },
  { value: "created_at,DESC", label: "Newest First" },
  { value: "created_at,ASC", label: "Oldest First" },
];

// Status filter options - matching backend expectations
const CUSTOMER_STATUS_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Active" },
  { value: 2, label: "Archived" },
];

// Type filter options - matching backend expectations
const CUSTOMER_TYPE_OF_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Residential" },
  { value: 2, label: "Commercial" },
];

// Page size options
const PAGE_SIZE_OPTIONS = [
  { value: 10, label: "10 per page" },
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
];

function AdminCustomerSearchResultPage() {
  const authManager = useAuthManager();
  const customerManager = useCustomerManager();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Extract search parameters from URL
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";
  const organizationName = searchParams.get("on") || "";
  const isActive = searchParams.get("active") === "1";

  // Component states
  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState(null);
  const [selectedCustomerForDeletion, setSelectedCustomerForDeletion] =
    useState(null);
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");
  const [sortByValue, setSortByValue] = useState("last_name,ASC");
  const [status, setStatus] = useState(isActive ? 1 : 0);
  const [typeOf, setTypeOf] = useState(0);
  const [createdAtGTE, setCreatedAtGTE] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon,
    },
    {
      label: "Customers",
      to: "/admin/customers",
      icon: UserGroupIcon,
    },
    {
      label: "Search",
      to: "/admin/customers/search",
      icon: MagnifyingGlassIcon,
    },
    {
      label: "Results",
      icon: MagnifyingGlassIcon,
      isActive: true,
    },
  ], []);

  // Check authentication on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
    }
  }, [authManager, navigate]);

  // API callback handlers
  const onCustomerListSuccess = (response) => {
    console.log("onCustomerListSuccess: Starting...", response);
    if (response.results !== null) {
      setCustomers(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor);
      }
    } else {
      setCustomers({ results: [] });
    }
  };

  const onCustomerListError = (apiErr) => {
    console.log("onCustomerListError: Starting...", apiErr);
    setErrors(apiErr);
    window.scrollTo(0, 0);
  };

  const onCustomerListDone = () => {
    console.log("onCustomerListDone: Starting...");
    setFetching(false);
  };

  // Fetch customers list
  const fetchList = useCallback(() => {
    setFetching(true);
    setErrors({});

    console.log("fetchList: Starting with params:", {
      firstName,
      lastName,
      email,
      phone,
      organizationName,
      status,
      typeOf,
      createdAtGTE,
      sortByValue,
      pageSize,
      currentCursor,
    });

    // Build filters map for API call
    const params = new Map();
    params.set("page_size", pageSize);
    params.set("sort_field", "last_name");

    if (currentCursor !== "") {
      params.set("cursor", currentCursor);
    }

    // Sort parameters
    const sortArray = sortByValue.split(",");
    params.set("sort_field", sortArray[0]);
    params.set("sort_order", sortArray[1]);

    // Search parameters from URL
    if (firstName !== undefined && firstName !== null && firstName !== "") {
      params.set("first_name", firstName);
    }
    if (lastName !== undefined && lastName !== null && lastName !== "") {
      params.set("last_name", lastName);
    }
    if (email !== undefined && email !== null && email !== "") {
      params.set("email", email);
    }
    if (phone !== undefined && phone !== null && phone !== "") {
      params.set("phone", phone);
    }
    if (
      organizationName !== undefined &&
      organizationName !== null &&
      organizationName !== ""
    ) {
      params.set("organization_name", organizationName);
    }

    // Filter parameters
    if (status !== undefined && status !== null && status !== 0) {
      params.set("status", status);
    }
    if (typeOf !== undefined && typeOf !== null && typeOf !== 0) {
      params.set("type", typeOf);
    }
    if (
      createdAtGTE !== undefined &&
      createdAtGTE !== null &&
      createdAtGTE !== ""
    ) {
      const date = new Date(createdAtGTE);
      const jStr = date.getTime();
      params.set("created_at_gte", jStr);
    }

    console.log(
      "fetchList: Calling API with params Map:",
      Array.from(params.entries()),
    );

    // Call API through manager using callback pattern
    customerManager.getCustomersWithFiltersMapWithCallbacks(
      params,
      onCustomerListSuccess,
      onCustomerListError,
      onCustomerListDone,
      onUnauthorized,
      true, // Force refresh to bypass cache
    );
  }, [
    firstName,
    lastName,
    email,
    phone,
    organizationName,
    status,
    typeOf,
    createdAtGTE,
    sortByValue,
    pageSize,
    currentCursor,
    customerManager,
    onUnauthorized,
  ]);

  // Fetch list when parameters change
  useEffect(() => {
    let mounted = true;

    if (mounted) {
      fetchList();
    }

    return () => {
      mounted = false;
    };
  }, [
    currentCursor,
    pageSize,
    sortByValue,
    status,
    typeOf,
    createdAtGTE,
    firstName,
    lastName,
    email,
    phone,
    organizationName,
  ]);

  // Handle pagination
  const onNextClicked = () => {
    console.log("onNextClicked: Going to next page");
    const arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = () => {
    console.log("onPreviousClicked: Going to previous page");
    const arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  };

  // Archive callback handlers
  const onCustomerDeleteSuccess = () => {
    console.log("onCustomerDeleteSuccess: Starting...");

    // Update notification
    setSuccessMessage("Customer archived successfully");
    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);

    // Fetch again an updated list
    fetchList();
  };

  const onCustomerDeleteError = (apiErr) => {
    console.log("onCustomerDeleteError: Starting...", apiErr);
    setErrors(apiErr);

    // Update notification
    setErrors({ message: "Failed archiving customer" });
    setTimeout(() => {
      setErrors({});
    }, 2000);

    window.scrollTo(0, 0);
  };

  const onCustomerDeleteDone = () => {
    console.log("onCustomerDeleteDone: Starting...");
    setFetching(false);
    setSelectedCustomerForDeletion(null);
  };

  // Handle customer deletion/archiving
  const onDeleteConfirmButtonClick = () => {
    if (!selectedCustomerForDeletion) return;

    console.log(
      "onDeleteConfirmButtonClick: Archiving customer",
      selectedCustomerForDeletion.id,
    );
    setFetching(true);

    // Call archive API through manager using callback pattern
    customerManager.archiveCustomerWithCallbacks(
      selectedCustomerForDeletion.id,
      onCustomerDeleteSuccess,
      onCustomerDeleteError,
      onCustomerDeleteDone,
      onUnauthorized,
    );
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
  const searchCriteria = useMemo(() => {
    const criteria = [];
    if (firstName)
      criteria.push({
        label: "First Name",
        value: firstName,
        icon: UserIcon,
      });
    if (lastName)
      criteria.push({
        label: "Last Name",
        value: lastName,
        icon: UserIcon,
      });
    if (email)
      criteria.push({ label: "Email", value: email, icon: EnvelopeIcon });
    if (phone)
      criteria.push({ label: "Phone", value: phone, icon: PhoneIcon });
    if (organizationName)
      criteria.push({
        label: "Organization",
        value: organizationName,
        icon: BuildingOffice2Icon,
      });
    criteria.push({
      label: "Status",
      value: isActive ? "Active Only" : "All",
      icon: CheckCircleIcon,
    });
    return criteria;
  }, [firstName, lastName, email, phone, organizationName, isActive]);

  // Handle sort change
  const handleSortChange = (e) => {
    setSortByValue(e.target.value);
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setPreviousCursors([]);
    setCurrentCursor("");
  };

  // Calculate current page info
  const currentPage = previousCursors.length + 1;
  const totalCount = customers?.count || 0;
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(
    startRecord + (customers?.results?.length || 0) - 1,
    totalCount,
  );

  if (isFetching && !customers) {
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
        <Breadcrumb items={breadcrumbItems} className="mb-8" />

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center">
                <UserGroupIcon className={`h-8 w-8 ${themeClasses.linkPrimary} mr-3`} />
                <h1 className={`text-3xl font-bold ${themeClasses.textPrimary}`}>
                  Search Results
                </h1>
              </div>
              <p className={`mt-2 text-lg ${themeClasses.textSecondary} ml-11`}>
                Customer search results
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/customers/search")}
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
          <Alert type="success" className="mb-6" dismissible onDismiss={() => setSuccessMessage("")}>
            <CheckCircleIcon className="h-5 w-5 mr-2 inline" />
            {successMessage}
          </Alert>
        )}

        {errors.message && (
          <Alert type="error" className="mb-6" dismissible onDismiss={() => setErrors({})}>
            <ExclamationTriangleIconSolid className="h-5 w-5 mr-2 inline" />
            {errors.message}
          </Alert>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          {/* Results Header with Filters */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className={`text-xl font-semibold ${themeClasses.textPrimary} flex items-center`}>
                  <MagnifyingGlassIcon className={`h-5 w-5 mr-2 ${themeClasses.linkPrimary}`} />
                  Results
                </h2>
                {!isFetching && customers && customers.results && (
                  <p className={`mt-1 text-sm ${themeClasses.textSecondary}`}>
                    Found <span className="font-semibold">{totalCount}</span>{" "}
                    customers
                    {searchCriteria.length > 0 && " matching your criteria"}
                  </p>
                )}
              </div>

              {/* Filters and Sorting */}
              {!isFetching &&
                customers &&
                customers.results &&
                customers.results.length > 0 && (
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
                        {CUSTOMER_SORT_OPTIONS.map((option) => (
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(parseInt(e.target.value))}
                      className="w-full rounded-lg border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {CUSTOMER_STATUS_FILTER_OPTIONS.map((option) => (
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
                      onChange={(e) => setTypeOf(parseInt(e.target.value))}
                      className="w-full rounded-lg border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {CUSTOMER_TYPE_OF_FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created After
                    </label>
                    <input
                      type="date"
                      value={createdAtGTE}
                      onChange={(e) => setCreatedAtGTE(e.target.value)}
                      className="w-full rounded-lg border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Content */}
          <div className="p-6">
            {isFetching ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600">Updating results...</p>
              </div>
            ) : customers &&
              customers.results &&
              customers.results.length > 0 ? (
              <>
                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {customers.results.map((customer) => (
                    <div
                      key={customer.id}
                      className={`bg-white border ${customer.isBanned ? "border-red-200" : "border-gray-200"} rounded-lg hover:shadow-lg transition-shadow`}
                    >
                      {/* Card Header */}
                      <div
                        className={`p-4 border-b ${customer.isBanned ? "border-red-100 bg-red-50" : "border-gray-100"}`}
                      >
                        <Link
                          to={`/admin/customer/${customer.id}`}
                          className="flex items-start text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID ? (
                            <>
                              <BuildingOffice2Icon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                              <span>
                                {customer.organizationName ||
                                  `${customer.firstName} ${customer.lastName}`}
                              </span>
                            </>
                          ) : (
                            <>
                              <HomeIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                              <span>
                                {customer.firstName} {customer.lastName}
                              </span>
                            </>
                          )}
                        </Link>
                        {customer.isBanned && (
                          <div className="flex items-center mt-2 text-red-600 text-sm">
                            <NoSymbolIcon className="h-4 w-4 mr-1" />
                            Banned
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-2 text-sm">
                        {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                          <div className="font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </div>
                        )}

                        {customer.addressLine1 && (
                          <div className="flex items-start text-gray-600">
                            <MapPinIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <div>{customer.addressLine1}</div>
                              {(customer.city || customer.region) && (
                                <div>
                                  {customer.city && customer.region
                                    ? `${customer.city}, ${customer.region}`
                                    : customer.city || customer.region}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {customer.phone && (
                          <div className="flex items-center text-gray-600">
                            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <a
                              href={`tel:${customer.phone}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {formatPhone(customer.phone)}
                            </a>
                          </div>
                        )}

                        {customer.email && (
                          <div className="flex items-center text-gray-600">
                            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <a
                              href={`mailto:${customer.email}`}
                              className="text-blue-600 hover:text-blue-800 truncate"
                            >
                              {customer.email}
                            </a>
                          </div>
                        )}

                        {/* Customer Type Badge */}
                        <div className="pt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID
                              ? "Commercial"
                              : "Residential"}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <Link
                          to={`/admin/customer/${customer.id}`}
                          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Details
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomerForDeletion(customer);
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
                {(previousCursors.length > 0 || customers.hasNextPage) && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={onPreviousClicked}
                        disabled={previousCursors.length === 0}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={onNextClicked}
                        disabled={!customers.hasNextPage}
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
                            onClick={onPreviousClicked}
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

                          <button
                            onClick={onNextClicked}
                            disabled={!customers.hasNextPage}
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
                  No Customers Found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No customers match your search criteria. Try adjusting your
                  search terms or filters.
                </p>
                <Link
                  to="/admin/customers/search"
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
            onClick={() => navigate("/admin/customers/search")}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Search Again
          </button>
          <button
            onClick={() => navigate("/admin/customers")}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Customers
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedCustomerForDeletion}
        onClose={() => setSelectedCustomerForDeletion(null)}
        title="Archive Customer"
      >
        {selectedCustomerForDeletion && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              You are about to <strong>archive</strong> this customer. It will
              no longer appear on your dashboard. This action can be undone
              but you'll need to contact the system administrator. Are you
              sure you would like to continue?
            </p>

            <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500 mb-4">
              <p className="text-sm font-medium text-gray-700">
                <strong>Name:</strong>{" "}
                {selectedCustomerForDeletion.type ===
                COMMERCIAL_CUSTOMER_TYPE_OF_ID
                  ? selectedCustomerForDeletion.organizationName ||
                    `${selectedCustomerForDeletion.firstName} ${selectedCustomerForDeletion.lastName}`
                  : `${selectedCustomerForDeletion.firstName} ${selectedCustomerForDeletion.lastName}`}
              </p>
              {selectedCustomerForDeletion.email && (
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Email:</strong> {selectedCustomerForDeletion.email}
                </p>
              )}
              {selectedCustomerForDeletion.isBanned && (
                <p className="text-sm text-red-600 mt-1">
                  <strong>Status:</strong> This customer is currently banned
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => setSelectedCustomerForDeletion(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={onDeleteConfirmButtonClick}
                disabled={isFetching}
                loading={isFetching}
                icon={ArchiveBoxIcon}
              >
                {isFetching ? "Archiving..." : "Confirm Archive"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

// Wrapper with UIXThemeProvider
function AdminCustomerSearchResultPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminCustomerSearchResultPage />
    </UIXThemeProvider>
  );
}

export default AdminCustomerSearchResultPageWithProvider;
