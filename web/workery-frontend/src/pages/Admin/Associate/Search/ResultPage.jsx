// File Path: web/workery-frontend/src/pages/Admin/Associate/Search/ResultPage.jsx
// UIX Upgraded - Uses UIX primitives (Card, Badge, Button, Modal, Alert, etc.)
// @uix-page: UniversalListPage

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  useAuthManager,
  useAssociateManager,
} from "../../../../services/Services";
import {
  MagnifyingGlassIcon,
  WrenchScrewdriverIcon,
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
  MapPinIcon,
  ArchiveBoxIcon,
  EyeIcon,
  CheckCircleIcon,
  FunnelIcon,
  UserIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  Alert,
  Breadcrumb,
  Spinner,
  Modal,
  Button,
  Card,
  Badge,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import { formatPhoneNumber, normalizePhoneForSearch } from "../../../../utils/phoneFormat";

// Constants
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 1;
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 2;

// Static sort options
const ASSOCIATE_SORT_OPTIONS = Object.freeze([
  { value: "last_name,ASC", label: "Last Name (A-Z)" },
  { value: "last_name,DESC", label: "Last Name (Z-A)" },
  { value: "lexical_name,ASC", label: "Name (A-Z)" },
  { value: "lexical_name,DESC", label: "Name (Z-A)" },
  { value: "join_date,DESC", label: "Newest First" },
  { value: "join_date,ASC", label: "Oldest First" },
]);

// Static status filter options
const ASSOCIATE_STATUS_FILTER_OPTIONS = Object.freeze([
  { value: 0, label: "All" },
  { value: 1, label: "Active" },
  { value: 2, label: "Archived" },
]);

// Static type filter options
const ASSOCIATE_TYPE_OF_FILTER_OPTIONS = Object.freeze([
  { value: 0, label: "All" },
  { value: 1, label: "Residential" },
  { value: 2, label: "Commercial" },
]);

// Static page size options
const PAGE_SIZE_OPTIONS = Object.freeze([
  { value: 10, label: "10 per page" },
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
]);

// Static breadcrumb items
const BREADCRUMB_ITEMS = Object.freeze([
  { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
  { label: "Associates", to: "/admin/associates", icon: WrenchScrewdriverIcon },
  { label: "Search", to: "/admin/associates/search", icon: MagnifyingGlassIcon },
  { label: "Results", icon: MagnifyingGlassIcon, isActive: true },
]);

// Associate Card Component
const AssociateCard = memo(function AssociateCard({
  associate,
  onArchiveClick,
  formatPhone,
}) {
  const { getThemeClasses } = useUIXTheme();

  return (
    <Card padding="p-0">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <Link
          to={`/admin/associate/${associate.id}`}
          className={`flex items-start ${getThemeClasses("link-primary")} font-semibold`}
        >
          {associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID ? (
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
        {associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
          <div className={`font-medium ${getThemeClasses("text-primary")}`}>
            {associate.firstName} {associate.lastName}
          </div>
        )}

        {associate.addressLine1 && (
          <div className={`flex items-start ${getThemeClasses("text-secondary")}`}>
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
          <div className={`flex items-center ${getThemeClasses("text-secondary")}`}>
            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
            <a
              href={`tel:${associate.phone}`}
              className={getThemeClasses("link-primary")}
            >
              {formatPhoneNumber(associate.phone)}
            </a>
          </div>
        )}

        {associate.email && (
          <div className={`flex items-center ${getThemeClasses("text-secondary")}`}>
            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
            <a
              href={`mailto:${associate.email}`}
              className={`${getThemeClasses("link-primary")} truncate`}
            >
              {associate.email}
            </a>
          </div>
        )}

        {/* Associate Type Badge */}
        <div className="pt-2">
          <Badge
            variant={associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID ? "info" : "success"}
            size="sm"
          >
            {associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID
              ? "Commercial"
              : "Residential"}
          </Badge>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <Link
          to={`/admin/associate/${associate.id}`}
          className={`inline-flex items-center text-sm font-medium ${getThemeClasses("link-primary")}`}
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          View Details
        </Link>
        <button
          onClick={() => onArchiveClick(associate)}
          className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-800"
        >
          <ArchiveBoxIcon className="h-4 w-4 mr-1" />
          Archive
        </button>
      </div>
    </Card>
  );
});

// Main Component
const AdminAssociateSearchResultPage = memo(function AdminAssociateSearchResultPage() {
  const authManager = useAuthManager();
  const associateManager = useAssociateManager();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getThemeClasses } = useUIXTheme();

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
  const [selectedAssociateForDeletion, setSelectedAssociateForDeletion] = useState(null);
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

  // Memoized theme classes
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      linkPrimary: getThemeClasses("link-primary"),
    }),
    [getThemeClasses],
  );

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Check authentication on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
    }
  }, [authManager, navigate]);

  // Fetch associates list
  const fetchList = useCallback(() => {
    setFetching(true);
    setErrors({});

    const params = new Map();
    params.set("page_size", pageSize);

    if (currentCursor !== "") {
      params.set("cursor", currentCursor);
    }

    const sortArray = sortByValue.split(",");
    params.set("sort_field", sortArray[0]);
    params.set("sort_order", sortArray[1]);

    if (firstName) params.set("first_name", firstName);
    if (lastName) params.set("last_name", lastName);
    if (email) params.set("email", email);
    if (phone) params.set("phone", normalizePhoneForSearch(phone));
    if (organizationName) params.set("organization_name", organizationName);
    if (status !== 0) params.set("status", status);
    if (typeOf !== 0) params.set("type", typeOf);
    if (createdAtGTE) {
      const date = new Date(createdAtGTE);
      params.set("created_at_gte", date.getTime());
    }

    associateManager.getAssociatesWithFiltersMapWithCallbacks(
      params,
      (response) => {
        if (response.results !== null) {
          setAssociates(response);
          if (response.hasNextPage) {
            setNextCursor(response.nextCursor);
          }
        } else {
          setAssociates({ results: [] });
        }
      },
      (apiErr) => {
        setErrors(apiErr);
        window.scrollTo(0, 0);
      },
      () => setFetching(false),
      onUnauthorized,
      true,
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
    associateManager,
    onUnauthorized,
  ]);

  // Fetch list when parameters change
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Handle pagination
  const onNextClicked = useCallback(() => {
    const arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  }, [previousCursors, currentCursor, nextCursor]);

  const onPreviousClicked = useCallback(() => {
    const arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  }, [previousCursors]);

  // Handle archive
  const onDeleteConfirmButtonClick = useCallback(() => {
    if (!selectedAssociateForDeletion) return;

    setFetching(true);
    associateManager.archiveAssociateWithCallbacks(
      selectedAssociateForDeletion.id,
      () => {
        setSuccessMessage("Associate archived successfully");
        setTimeout(() => setSuccessMessage(""), 2000);
        fetchList();
      },
      () => {
        setErrors({ message: "Failed archiving associate" });
        setTimeout(() => setErrors({}), 2000);
        window.scrollTo(0, 0);
      },
      () => {
        setFetching(false);
        setSelectedAssociateForDeletion(null);
      },
      onUnauthorized,
    );
  }, [selectedAssociateForDeletion, associateManager, onUnauthorized, fetchList]);

  // Build search criteria display
  const searchCriteria = useMemo(() => {
    const criteria = [];
    if (firstName) criteria.push({ label: "First Name", value: firstName, icon: UserIcon });
    if (lastName) criteria.push({ label: "Last Name", value: lastName, icon: UserIcon });
    if (email) criteria.push({ label: "Email", value: email, icon: EnvelopeIcon });
    if (phone) criteria.push({ label: "Phone", value: phone, icon: PhoneIcon });
    if (organizationName) criteria.push({ label: "Organization", value: organizationName, icon: BuildingOffice2Icon });
    criteria.push({ label: "Status", value: isActive ? "Active Only" : "All", icon: CheckCircleIcon });
    return criteria;
  }, [firstName, lastName, email, phone, organizationName, isActive]);

  // Handle filter changes
  const handleSortChange = useCallback((e) => setSortByValue(e.target.value), []);
  const handlePageSizeChange = useCallback((e) => {
    setPageSize(parseInt(e.target.value));
    setPreviousCursors([]);
    setCurrentCursor("");
  }, []);

  // Calculate pagination info
  const currentPage = previousCursors.length + 1;
  const totalCount = associates?.count || 0;
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(startRecord + (associates?.results?.length || 0) - 1, totalCount);

  if (isFetching && !associates) {
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
                <WrenchScrewdriverIcon className={`h-8 w-8 ${themeClasses.linkPrimary} mr-3`} />
                <h1 className={`text-3xl font-bold ${themeClasses.textPrimary}`}>
                  Search Results
                </h1>
              </div>
              <p className={`mt-2 text-lg ${themeClasses.textSecondary} ml-11`}>
                Associate search results
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/associates/search")}
              icon={ArrowLeftIcon}
            >
              Back to Search
            </Button>
          </div>

          {/* Search Criteria Display */}
          {searchCriteria.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchCriteria.map((criteria, index) => {
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
          <Alert type="success" className="mb-6" dismissible onDismiss={() => setSuccessMessage("")}>
            <CheckCircleIcon className="h-5 w-5 mr-2 inline" />
            {successMessage}
          </Alert>
        )}

        {errors.message && (
          <Alert type="error" className="mb-6" dismissible onDismiss={() => setErrors({})}>
            {errors.message}
          </Alert>
        )}

        {/* Main Content */}
        <Card>
          {/* Results Header with Filters */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className={`text-xl font-semibold ${themeClasses.textPrimary} flex items-center`}>
                  <MagnifyingGlassIcon className={`h-5 w-5 mr-2 ${themeClasses.linkPrimary}`} />
                  Results
                </h2>
                {!isFetching && associates?.results && (
                  <p className={`mt-1 text-sm ${themeClasses.textSecondary}`}>
                    Found <span className="font-semibold">{totalCount}</span> associates
                  </p>
                )}
              </div>

              {/* Filters and Sorting */}
              {!isFetching && associates?.results?.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    icon={FunnelIcon}
                  >
                    Filters
                    <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                  </Button>

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created After</label>
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
            ) : associates?.results?.length > 0 ? (
              <>
                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {associates.results.map((associate) => (
                    <AssociateCard
                      key={associate.id}
                      associate={associate}
                      onArchiveClick={setSelectedAssociateForDeletion}
                      formatPhone={formatPhone}
                    />
                  ))}
                </div>

                {/* Pagination Footer */}
                {(previousCursors.length > 0 || associates.hasNextPage) && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="hidden sm:block">
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startRecord}</span> to{" "}
                        <span className="font-medium">{endRecord}</span> of{" "}
                        <span className="font-medium">{totalCount}</span> results
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onPreviousClicked}
                        disabled={previousCursors.length === 0}
                        icon={ChevronLeftIcon}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-4 py-2 text-sm text-gray-700">
                        Page {currentPage}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onNextClicked}
                        disabled={!associates.hasNextPage}
                      >
                        Next
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 px-4">
                <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Associates Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No associates match your search criteria. Try adjusting your search terms or filters.
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate("/admin/associates/search")}
                  icon={ArrowLeftIcon}
                >
                  Try New Search
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Bottom Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/associates/search")}
            icon={ArrowLeftIcon}
          >
            Search Again
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/admin/associates")}
          >
            Back to Associates
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedAssociateForDeletion}
        onClose={() => setSelectedAssociateForDeletion(null)}
        title="Archive Associate"
      >
        {selectedAssociateForDeletion && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              You are about to <strong>archive</strong> this associate. It will no longer appear on
              your dashboard. This action can be undone but you'll need to contact the system
              administrator. Are you sure you would like to continue?
            </p>

            <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500 mb-4">
              <p className="text-sm font-medium text-gray-700">
                <strong>Name:</strong>{" "}
                {selectedAssociateForDeletion.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID
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

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setSelectedAssociateForDeletion(null)}>
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
});

// Wrapper with UIXThemeProvider
function AdminAssociateSearchResultPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminAssociateSearchResultPage />
    </UIXThemeProvider>
  );
}

export default AdminAssociateSearchResultPageWithProvider;
