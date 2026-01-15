// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Search/ResultPage.jsx
// UIX Upgraded - Uses UIX primitives (Breadcrumb, Spinner, UIXThemeProvider)
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  Breadcrumb,
  Spinner,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import { DateTime } from "luxon";
import {
  useAuthManager,
  useAssociateManager,
} from "../../../../services/Services";
import {
  MagnifyingGlassIcon,
  WrenchScrewdriverIcon,
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
  BriefcaseIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon as ExclamationTriangleIconSolid } from "@heroicons/react/24/solid";

// Constants for associate types and statuses - matching old implementation
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 1;
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 2;
const ASSOCIATE_STATUS_ACTIVE = 1;

// Sort options - matching backend expectations
const ASSOCIATE_SORT_OPTIONS = [
  { value: "last_name,ASC", label: "Last Name (A-Z)" },
  { value: "last_name,DESC", label: "Last Name (Z-A)" },
  { value: "lexical_name,ASC", label: "Name (A-Z)" },
  { value: "lexical_name,DESC", label: "Name (Z-A)" },
  { value: "join_date,DESC", label: "Newest First" },
  { value: "join_date,ASC", label: "Oldest First" },
];

// Status filter options - matching backend expectations
const ASSOCIATE_STATUS_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Active" },
  { value: 2, label: "Archived" },
];

// Type filter options - matching backend expectations
const ASSOCIATE_TYPE_OF_FILTER_OPTIONS = [
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

function AdminAssociateSearchResultPage() {
  const authManager = useAuthManager();
  const associateManager = useAssociateManager();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      pageContainer: getThemeClasses("pageContainer"),
      contentWrapper: getThemeClasses("contentWrapper"),
    }),
    [getThemeClasses],
  );

  // Memoize onUnauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", path: "/admin/dashboard", icon: "ChartBarIcon" },
      { label: "Associates", path: "/admin/associates" },
      { label: "Search", path: "/admin/associates/search" },
      { label: "Results" },
    ],
    [],
  );

  // Extract search parameters from URL
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";
  const organizationName = searchParams.get("on") || "";
  const isActive = searchParams.get("active") === "1";

  // Component states
  const [errors, setErrors] = useState({});
  const [associates, setAssociates] = useState(null);
  const [selectedAssociateForDeletion, setSelectedAssociateForDeletion] =
    useState(null);
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");
  const [sortByValue, setSortByValue] = useState("last_name,ASC"); // Default sort by last name
  const [status, setStatus] = useState(isActive ? 1 : 0); // 1 for active only, 0 for all
  const [typeOf, setTypeOf] = useState(0); // 0 for all types
  const [createdAtGTE, setCreatedAtGTE] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
    }
  }, [authManager, navigate]);

  // API callback handlers
  const onAssociateListSuccess = (response) => {
    console.log("onAssociateListSuccess: Starting...", response);
    if (response.results !== null) {
      setAssociates(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor);
      }
    } else {
      setAssociates({ results: [] });
    }
  };

  const onAssociateListError = (apiErr) => {
    console.log("onAssociateListError: Starting...", apiErr);
    setErrors(apiErr);
    window.scrollTo(0, 0);
  };

  const onAssociateListDone = () => {
    console.log("onAssociateListDone: Starting...");
    setFetching(false);
  };

  // Fetch associates list
  const fetchList = () => {
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

    // Build filters map for API call - using exact same format as old code
    const params = new Map();
    params.set("page_size", pageSize);
    params.set("sort_field", "last_name"); // Default sort field

    if (currentCursor !== "") {
      params.set("cursor", currentCursor);
    }

    // Sort parameters - matching old implementation
    const sortArray = sortByValue.split(",");
    params.set("sort_field", sortArray[0]);
    params.set("sort_order", sortArray[1]);

    // Search parameters from URL - using snake_case as backend expects
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
    associateManager.getAssociatesWithFiltersMapWithCallbacks(
      params,
      onAssociateListSuccess,
      onAssociateListError,
      onAssociateListDone,
      onUnauthorized,
      true, // Force refresh to bypass cache
    );
  };

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
  const onNextClicked = (e) => {
    console.log("onNextClicked: Going to next page");
    const arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = (e) => {
    console.log("onPreviousClicked: Going to previous page");
    const arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  };

  // Archive callback handlers
  const onAssociateDeleteSuccess = (response) => {
    console.log("onAssociateDeleteSuccess: Starting...");

    // Update notification
    setSuccessMessage("Associate archived successfully");
    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);

    // Fetch again an updated list
    fetchList();
  };

  const onAssociateDeleteError = (apiErr) => {
    console.log("onAssociateDeleteError: Starting...", apiErr);
    setErrors(apiErr);

    // Update notification
    setErrors({ message: "Failed archiving associate" });
    setTimeout(() => {
      setErrors({});
    }, 2000);

    window.scrollTo(0, 0);
  };

  const onAssociateDeleteDone = () => {
    console.log("onAssociateDeleteDone: Starting...");
    setFetching(false);
    setSelectedAssociateForDeletion(null);
  };

  // Handle associate deletion/archiving
  const onDeleteConfirmButtonClick = () => {
    if (!selectedAssociateForDeletion) return;

    console.log(
      "onDeleteConfirmButtonClick: Archiving associate",
      selectedAssociateForDeletion.id,
    );
    setFetching(true);

    // Call archive API through manager using callback pattern
    associateManager.archiveAssociateWithCallbacks(
      selectedAssociateForDeletion.id,
      onAssociateDeleteSuccess,
      onAssociateDeleteError,
      onAssociateDeleteDone,
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
  if (organizationName)
    searchCriteria.push({
      label: "Organization",
      value: organizationName,
      icon: BuildingOffice2Icon,
    });
  searchCriteria.push({
    label: "Status",
    value: isActive ? "Active Only" : "All",
    icon: CheckCircleIcon,
  });

  // Handle sort change
  const handleSortChange = (e) => {
    const [field, order] = e.target.value.split(",");
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
  const totalCount = associates?.count || 0;
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(
    startRecord + (associates?.results?.length || 0) - 1,
    totalCount,
  );

  if (isFetching && !associates) {
    return <Spinner text="Loading search results..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center">
                <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Search Results
                </h1>
              </div>
              <p className="mt-2 text-lg text-gray-600 ml-11">
                Associate search results
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/associates/search")}
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
                {!isFetching && associates && associates.results && (
                  <p className="mt-1 text-sm text-gray-600">
                    Found <span className="font-semibold">{totalCount}</span>{" "}
                    associates
                    {searchCriteria.length > 0 && " matching your criteria"}
                  </p>
                )}
              </div>

              {/* Filters and Sorting */}
              {!isFetching &&
                associates &&
                associates.results &&
                associates.results.length > 0 && (
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
                        {ASSOCIATE_SORT_OPTIONS.map((option) => (
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
                      {ASSOCIATE_STATUS_FILTER_OPTIONS.map((option) => (
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
                      {ASSOCIATE_TYPE_OF_FILTER_OPTIONS.map((option) => (
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
              <Spinner text="Updating results..." />
            ) : associates &&
              associates.results &&
              associates.results.length > 0 ? (
              <>
                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {associates.results.map((associate) => (
                    <div
                      key={associate.id}
                      className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                    >
                      {/* Card Header */}
                      <div className="p-4 border-b border-gray-100">
                        <Link
                          to={`/admin/associate/${associate.id}`}
                          className="flex items-start text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          {associate.type ===
                          COMMERCIAL_ASSOCIATE_TYPE_OF_ID ? (
                            <>
                              <BuildingOffice2Icon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                              <span>
                                {associate.organizationName ||
                                  `${associate.firstName} ${associate.lastName}`}
                              </span>
                            </>
                          ) : (
                            <>
                              <HomeIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                              <span>
                                {associate.firstName} {associate.lastName}
                              </span>
                            </>
                          )}
                        </Link>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-2 text-sm">
                        {associate.type ===
                          RESIDENTIAL_ASSOCIATE_TYPE_OF_ID && (
                          <div className="font-medium text-gray-900">
                            {associate.firstName} {associate.lastName}
                          </div>
                        )}

                        {associate.addressLine1 && (
                          <div className="flex items-start text-gray-600">
                            <MapPinIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <div>{associate.addressLine1}</div>
                              {(associate.city || associate.region) && (
                                <div>
                                  {associate.city && associate.region
                                    ? `${associate.city}, ${associate.region}`
                                    : associate.city || associate.region}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {associate.phone && (
                          <div className="flex items-center text-gray-600">
                            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <a
                              href={`tel:${associate.phone}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {formatPhone(associate.phone)}
                            </a>
                          </div>
                        )}

                        {associate.email && (
                          <div className="flex items-center text-gray-600">
                            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <a
                              href={`mailto:${associate.email}`}
                              className="text-blue-600 hover:text-blue-800 truncate"
                            >
                              {associate.email}
                            </a>
                          </div>
                        )}

                        {/* Associate Type Badge */}
                        <div className="pt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID
                              ? "Commercial"
                              : "Residential"}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <Link
                          to={`/admin/associate/${associate.id}`}
                          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Details
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAssociateForDeletion(associate);
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
                {(previousCursors.length > 0 || associates.hasNextPage) && (
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
                        disabled={!associates.hasNextPage}
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
                            disabled={!associates.hasNextPage}
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
                <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Associates Found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No associates match your search criteria. Try adjusting your
                  search terms or filters.
                </p>
                <Link
                  to="/admin/associates/search"
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
            onClick={() => navigate("/admin/associates/search")}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Search Again
          </button>
          <button
            onClick={() => navigate("/admin/associates")}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Associates
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {selectedAssociateForDeletion && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-amber-600" />
                Archive Associate
              </h3>
            </div>

            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                You are about to <strong>archive</strong> this associate. It
                will no longer appear on your dashboard. This action can be
                undone but you'll need to contact the system administrator. Are
                you sure you would like to continue?
              </p>

              <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                <p className="text-sm font-medium text-gray-700">
                  <strong>Name:</strong>{" "}
                  {selectedAssociateForDeletion.type ===
                  COMMERCIAL_ASSOCIATE_TYPE_OF_ID
                    ? selectedAssociateForDeletion.organizationName ||
                      `${selectedAssociateForDeletion.firstName} ${selectedAssociateForDeletion.lastName}`
                    : `${selectedAssociateForDeletion.firstName} ${selectedAssociateForDeletion.lastName}`}
                </p>
                {selectedAssociateForDeletion.email && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Email:</strong> {selectedAssociateForDeletion.email}
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedAssociateForDeletion(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onDeleteConfirmButtonClick}
                disabled={isFetching}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetching ? (
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

export default function AdminAssociateSearchResultPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminAssociateSearchResultPage />
    </UIXThemeProvider>
  );
}
