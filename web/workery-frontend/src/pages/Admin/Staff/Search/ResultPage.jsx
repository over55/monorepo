// File Path: web/workery-frontend/src/pages/Admin/Staff/Search/ResultPage.jsx
// UIX Upgraded - Uses UIX primitives (Modal, Select, Card)

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useStaffManager } from "../../../../services/Services";
import {
  Spinner,
  Breadcrumb,
  Alert,
  Button,
  Modal,
  Select,
  Badge,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  ArrowLeftIcon,
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

// Get type badge variant helper
const getTypeBadgeVariant = (typeValue) => {
  switch (typeValue) {
    case 1: return "info";      // Executive
    case 2: return "primary";   // Management
    case 3: return "success";   // Frontline
    default: return "secondary";
  }
};

// Get status badge variant helper
const getStatusBadgeVariant = (statusValue) => {
  switch (statusValue) {
    case 1: return "success"; // Active
    case 2: return "secondary"; // Archived
    default: return "secondary";
  }
};

// Memoized Staff Card Component
const StaffCard = memo(function StaffCard({ staff, onArchive, themeClasses }) {
  return (
    <div className={`${themeClasses.bgCard} border ${themeClasses.cardBorder} rounded-lg hover:shadow-lg transition-shadow`}>
      {/* Card Header */}
      <div className={`p-4 border-b ${themeClasses.borderLight}`}>
        <Link
          to={`/admin/staff/${staff.id}`}
          className={`flex items-start ${themeClasses.linkPrimary} font-semibold`}
        >
          <UserIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>
            {staff.name || `${staff.firstName} ${staff.lastName}`}
          </span>
        </Link>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-2 text-sm">
        {staff.phone && (
          <div className={`flex items-center ${themeClasses.textSecondary}`}>
            <PhoneIcon className={`h-4 w-4 mr-2 ${themeClasses.textMuted}`} />
            <a
              href={`tel:${staff.phone}`}
              className={themeClasses.linkPrimary}
            >
              {formatPhone(staff.phone)}
            </a>
          </div>
        )}

        {staff.email && (
          <div className={`flex items-center ${themeClasses.textSecondary}`}>
            <EnvelopeIcon className={`h-4 w-4 mr-2 ${themeClasses.textMuted}`} />
            <a
              href={`mailto:${staff.email}`}
              className={`${themeClasses.linkPrimary} truncate`}
            >
              {staff.email}
            </a>
          </div>
        )}

        {/* Type and Status Badges */}
        <div className="pt-2 flex flex-wrap gap-2">
          {staff.type && (
            <Badge variant={getTypeBadgeVariant(staff.type)} icon={BriefcaseIcon}>
              {STAFF_TYPE_MAP[staff.type]}
            </Badge>
          )}
          {staff.status && (
            <Badge variant={getStatusBadgeVariant(staff.status)}>
              {staff.status === 1 ? "Active" : "Archived"}
            </Badge>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className={`px-4 py-3 ${themeClasses.bgMuted} border-t ${themeClasses.borderLight} flex justify-between items-center`}>
        <div className="flex gap-2">
          <Link
            to={`/admin/staff/${staff.id}`}
            className={`inline-flex items-center text-sm font-medium ${themeClasses.linkPrimary}`}
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            View
          </Link>
          <Link
            to={`/admin/staff/${staff.id}/edit`}
            className={`inline-flex items-center text-sm font-medium ${themeClasses.linkPrimary}`}
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onArchive(staff);
          }}
          className={`inline-flex items-center text-sm font-medium ${themeClasses.textDanger}`}
        >
          <ArchiveBoxIcon className="h-4 w-4 mr-1" />
          Archive
        </button>
      </div>
    </div>
  );
});

StaffCard.displayName = 'StaffCard';

// Main content component
const ResultPageContent = memo(function ResultPageContent() {
  const navigate = useNavigate();
  const staffManager = useStaffManager();
  const [searchParams] = useSearchParams();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    textMuted: getThemeClasses("text-muted"),
    textDanger: getThemeClasses("text-danger"),
    linkPrimary: getThemeClasses("link-primary"),
    bgPage: getThemeClasses("bg-page"),
    bgCard: getThemeClasses("bg-card"),
    bgMuted: getThemeClasses("bg-muted"),
    cardBorder: getThemeClasses("card-border"),
    borderLight: getThemeClasses("border-light"),
    borderMedium: getThemeClasses("border-medium"),
    iconPrimary: getThemeClasses("icon-primary"),
    badgeInfoBg: getThemeClasses("badge-info-bg"),
    badgeInfoText: getThemeClasses("badge-info-text"),
  }), [getThemeClasses]);

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Staff", to: "/admin/staff", icon: UserGroupIcon },
    { label: "Search", to: "/admin/staff/search", icon: MagnifyingGlassIcon },
    { label: "Results", icon: MagnifyingGlassIcon, isActive: true },
  ], []);

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
  const [selectedStaffForDeletion, setSelectedStaffForDeletion] = useState(null);

  // Memoized unauthorized handler
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch staff list based on search criteria
  const fetchStaffList = useCallback(() => {
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

    // Use the manager to fetch staff with force refresh
    staffManager.getStaffWithFiltersMapWithCallbacks(
      filtersMap,
      (response) => {
        setStaffList(response);
        if (response.hasNextPage) {
          setNextCursor(response.nextCursor);
        } else {
          setNextCursor("");
        }
      },
      (error) => {
        setErrors(error);
        window.scrollTo(0, 0);
      },
      () => setIsLoading(false),
      onUnauthorized,
      true,
    );
  }, [firstName, lastName, email, phone, currentCursor, pageSize, sortBy, status, type, staffManager, onUnauthorized]);

  // Pagination handlers
  const handleNextPage = useCallback(() => {
    if (nextCursor) {
      const newPreviousCursors = [...previousCursors];
      newPreviousCursors.push(currentCursor);
      setPreviousCursors(newPreviousCursors);
      setCurrentCursor(nextCursor);
    }
  }, [nextCursor, previousCursors, currentCursor]);

  const handlePreviousPage = useCallback(() => {
    if (previousCursors.length > 0) {
      const newPreviousCursors = [...previousCursors];
      const previousCursor = newPreviousCursors.pop();
      setPreviousCursors(newPreviousCursors);
      setCurrentCursor(previousCursor);
    }
  }, [previousCursors]);

  // Filter change handlers
  const handleSortByChange = useCallback((value) => {
    setSortBy(value);
    setPreviousCursors([]);
    setCurrentCursor("");
  }, []);

  const handleStatusChange = useCallback((value) => {
    setStatus(parseInt(value));
    setPreviousCursors([]);
    setCurrentCursor("");
  }, []);

  const handleTypeChange = useCallback((value) => {
    setType(parseInt(value));
    setPreviousCursors([]);
    setCurrentCursor("");
  }, []);

  const handlePageSizeChange = useCallback((value) => {
    setPageSize(parseInt(value));
    setPreviousCursors([]);
    setCurrentCursor("");
  }, []);

  // Archive handler
  const handleArchiveStaff = useCallback((staff) => {
    setSelectedStaffForDeletion(staff);
  }, []);

  // Confirm archive handler
  const handleConfirmDelete = useCallback(() => {
    if (selectedStaffForDeletion) {
      setIsLoading(true);

      staffManager.archiveStaffWithCallbacks(
        selectedStaffForDeletion.id,
        () => {
          setSuccessMessage("Staff member archived successfully");
          setTimeout(() => setSuccessMessage(""), 2000);
          setSelectedStaffForDeletion(null);
          fetchStaffList();
        },
        (error) => {
          setErrors({ message: "Failed archiving staff member" });
          setTimeout(() => setErrors({}), 2000);
          window.scrollTo(0, 0);
        },
        () => {
          setIsLoading(false);
          setSelectedStaffForDeletion(null);
        },
        onUnauthorized,
      );
    }
  }, [selectedStaffForDeletion, staffManager, onUnauthorized, fetchStaffList]);

  // Cancel archive handler
  const handleCancelDelete = useCallback(() => {
    setSelectedStaffForDeletion(null);
  }, []);

  // Build search criteria display
  const searchCriteria = useMemo(() => {
    const criteria = [];
    if (firstName) criteria.push({ label: "First Name", value: firstName, icon: UserIcon });
    if (lastName) criteria.push({ label: "Last Name", value: lastName, icon: UserIcon });
    if (email) criteria.push({ label: "Email", value: email, icon: EnvelopeIcon });
    if (phone) criteria.push({ label: "Phone", value: phone, icon: PhoneIcon });
    criteria.push({ label: "Status", value: isActive ? "Active Only" : "All", icon: CheckCircleIcon });
    return criteria;
  }, [firstName, lastName, email, phone, isActive]);

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

  if (isLoading && !staffList) {
    return (
      <div className={`min-h-screen ${themeClasses.bgPage} flex items-center justify-center`}>
        <div className="text-center">
          <Spinner size="lg" />
          <p className={`mt-4 ${themeClasses.textSecondary}`}>Loading search results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.bgPage}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-8" />

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center">
                <UserGroupIcon className={`h-8 w-8 ${themeClasses.iconPrimary} mr-3`} />
                <h1 className={`text-3xl font-bold ${themeClasses.textPrimary}`}>
                  Search Results
                </h1>
              </div>
              <p className={`mt-2 text-lg ${themeClasses.textSecondary} ml-11`}>
                Staff search results
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/admin/staff/search")}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </div>

          {/* Search Criteria Display */}
          {searchCriteria.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchCriteria.map((criteria, index) => {
                const Icon = criteria.icon;
                return (
                  <Badge key={index} variant="info" icon={Icon}>
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
            {successMessage}
          </Alert>
        )}

        {errors.message && (
          <Alert type="error" className="mb-6" dismissible onDismiss={() => setErrors({})}>
            {errors.message}
          </Alert>
        )}

        {/* Main Content */}
        <div className={`${themeClasses.bgCard} shadow-sm rounded-lg`}>
          {/* Results Header with Filters */}
          <div className={`px-6 py-4 border-b ${themeClasses.borderMedium}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className={`text-xl font-semibold ${themeClasses.textPrimary} flex items-center`}>
                  <MagnifyingGlassIcon className={`h-5 w-5 mr-2 ${themeClasses.iconPrimary}`} />
                  Results
                </h2>
                {!isLoading && staffList && staffList.results && (
                  <p className={`mt-1 text-sm ${themeClasses.textSecondary}`}>
                    Found <span className="font-semibold">{totalCount}</span>{" "}
                    staff members
                    {searchCriteria.length > 0 && " matching your criteria"}
                  </p>
                )}
              </div>

              {/* Filters and Sorting */}
              {!isLoading && staffList?.results?.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  {/* Toggle Filters */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <FunnelIcon className="h-4 w-4 mr-1.5" />
                    Filters
                    <ChevronDownIcon
                      className={`h-4 w-4 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`}
                    />
                  </Button>

                  {/* Sort By */}
                  <div className="flex items-center">
                    <ArrowsUpDownIcon className={`h-4 w-4 ${themeClasses.textMuted} mr-2`} />
                    <Select
                      value={sortBy}
                      onChange={handleSortByChange}
                      options={STAFF_SORT_OPTIONS}
                      className="min-w-[160px]"
                    />
                  </div>

                  {/* Page Size */}
                  <div className="flex items-center">
                    <AdjustmentsHorizontalIcon className={`h-4 w-4 ${themeClasses.textMuted} mr-2`} />
                    <Select
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      options={PAGE_SIZE_OPTIONS}
                      className="min-w-[120px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Expandable Filters Panel */}
            {showFilters && (
              <div className={`mt-4 pt-4 border-t ${themeClasses.borderMedium}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>
                      Status
                    </label>
                    <Select
                      value={status}
                      onChange={handleStatusChange}
                      options={STAFF_STATUS_FILTER_OPTIONS}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>
                      Type
                    </label>
                    <Select
                      value={type}
                      onChange={handleTypeChange}
                      options={STAFF_TYPE_FILTER_OPTIONS}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Spinner size="lg" />
                <p className={`mt-4 ${themeClasses.textSecondary}`}>Updating results...</p>
              </div>
            ) : staffList?.results?.length > 0 ? (
              <>
                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {staffList.results.map((staff) => (
                    <StaffCard
                      key={staff.id}
                      staff={staff}
                      onArchive={handleArchiveStaff}
                      themeClasses={themeClasses}
                    />
                  ))}
                </div>

                {/* Pagination Footer */}
                {(previousCursors.length > 0 || staffList.hasNextPage) && (
                  <div className={`${themeClasses.bgCard} px-4 py-3 flex items-center justify-between border-t ${themeClasses.borderMedium}`}>
                    <div className="flex-1 flex justify-between sm:hidden">
                      <Button
                        variant="outline"
                        onClick={handlePreviousPage}
                        disabled={previousCursors.length === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleNextPage}
                        disabled={!staffList.hasNextPage}
                      >
                        Next
                      </Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className={`text-sm ${themeClasses.textSecondary}`}>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={previousCursors.length === 0}
                            className="rounded-l-md rounded-r-none"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </Button>
                          <span className={`relative inline-flex items-center px-4 py-2 border ${themeClasses.cardBorder} ${themeClasses.bgCard} text-sm font-medium ${themeClasses.textSecondary}`}>
                            Page {currentPage}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={!staffList.hasNextPage}
                            className="rounded-r-md rounded-l-none"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </Button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 px-4">
                <UserGroupIcon className={`mx-auto h-12 w-12 ${themeClasses.textMuted} mb-4`} />
                <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-2`}>
                  No Staff Members Found
                </h3>
                <p className={`${themeClasses.textSecondary} mb-6 max-w-md mx-auto`}>
                  No staff members match your search criteria. Try adjusting
                  your search terms or filters.
                </p>
                <Button variant="primary" onClick={() => navigate("/admin/staff/search")}>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Try New Search
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
          <Button variant="outline" onClick={() => navigate("/admin/staff/search")}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Search Again
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/staff")}>
            Back to Staff
          </Button>
        </div>
      </div>

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={!!selectedStaffForDeletion}
        onClose={handleCancelDelete}
        title="Archive Staff Member"
        icon={ExclamationTriangleIcon}
        iconColor="amber"
        maxWidth="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              loading={isLoading}
            >
              <ArchiveBoxIcon className="h-4 w-4 mr-2" />
              Confirm Archive
            </Button>
          </div>
        }
      >
        <p className={`text-sm ${themeClasses.textSecondary} mb-4`}>
          You are about to <strong>archive</strong> this staff member.
          They will no longer appear on your dashboard. This action can be
          undone but you'll need to contact the system administrator. Are
          you sure you would like to continue?
        </p>

        {selectedStaffForDeletion && (
          <Alert type="warning">
            <p className="text-sm font-medium">
              <strong>Name:</strong>{" "}
              {selectedStaffForDeletion.name ||
                `${selectedStaffForDeletion.firstName} ${selectedStaffForDeletion.lastName}`}
            </p>
            {selectedStaffForDeletion.email && (
              <p className="text-sm mt-1">
                <strong>Email:</strong> {selectedStaffForDeletion.email}
              </p>
            )}
            {selectedStaffForDeletion.type && (
              <p className="text-sm mt-1">
                <strong>Type:</strong>{" "}
                {STAFF_TYPE_MAP[selectedStaffForDeletion.type]}
              </p>
            )}
          </Alert>
        )}
      </Modal>
    </div>
  );
});

ResultPageContent.displayName = 'ResultPageContent';

// Wrapper with UIXThemeProvider
function AdminStaffSearchResultPage() {
  return (
    <UIXThemeProvider>
      <ResultPageContent />
    </UIXThemeProvider>
  );
}

export default AdminStaffSearchResultPage;
