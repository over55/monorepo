// File Path: web/workery-frontend/src/pages/Admin/Staff/Search/ResultPage.jsx
// UIX Upgraded - Uses UIX primitives (Card, Badge, Button, Modal, Alert, etc.)
// @uix-page: UniversalListPage

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useStaffManager } from "../../../../services/Services";
import {
  Spinner,
  Breadcrumb,
  Alert,
  Button,
  Modal,
  Card,
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

// Static staff type filter options
const STAFF_TYPE_FILTER_OPTIONS = Object.freeze([
  { value: 0, label: "All" },
  { value: 1, label: "Executive" },
  { value: 2, label: "Management" },
  { value: 3, label: "Frontline" },
]);

// Static staff status filter options
const STAFF_STATUS_FILTER_OPTIONS = Object.freeze([
  { value: 0, label: "All" },
  { value: 1, label: "Active" },
  { value: 2, label: "Archived" },
]);

// Static staff sort options
const STAFF_SORT_OPTIONS = Object.freeze([
  { value: "lexical_name,ASC", label: "Name (A-Z)" },
  { value: "lexical_name,DESC", label: "Name (Z-A)" },
  { value: "join_date,DESC", label: "Newest First" },
  { value: "join_date,ASC", label: "Oldest First" },
  { value: "created_at,DESC", label: "Recently Created" },
  { value: "created_at,ASC", label: "Oldest Created" },
]);

// Static staff type mapping
const STAFF_TYPE_MAP = Object.freeze({
  1: "Executive",
  2: "Management",
  3: "Frontline",
});

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
  { label: "Staff", to: "/admin/staff", icon: UserGroupIcon },
  { label: "Search", to: "/admin/staff/search", icon: MagnifyingGlassIcon },
  { label: "Results", icon: MagnifyingGlassIcon, isActive: true },
]);

// Staff Card Component
const StaffCard = memo(function StaffCard({ staff, onArchive, formatPhone }) {
  const { getThemeClasses } = useUIXTheme();

  // Get type badge variant
  const getTypeBadgeVariant = (typeValue) => {
    switch (typeValue) {
      case 1: return "info";      // Executive
      case 2: return "primary";   // Management
      case 3: return "success";   // Frontline
      default: return "secondary";
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (statusValue) => {
    switch (statusValue) {
      case 1: return "success"; // Active
      case 2: return "secondary"; // Archived
      default: return "secondary";
    }
  };

  return (
    <Card padding="p-0">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <Link
          to={`/admin/staff/${staff.id}`}
          className={`flex items-start ${getThemeClasses("link-primary")} font-semibold`}
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
          <div className={`flex items-center ${getThemeClasses("text-secondary")}`}>
            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
            <a
              href={`tel:${staff.phone}`}
              className={getThemeClasses("link-primary")}
            >
              {formatPhone(staff.phone)}
            </a>
          </div>
        )}

        {staff.email && (
          <div className={`flex items-center ${getThemeClasses("text-secondary")}`}>
            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
            <a
              href={`mailto:${staff.email}`}
              className={`${getThemeClasses("link-primary")} truncate`}
            >
              {staff.email}
            </a>
          </div>
        )}

        {/* Type and Status Badges */}
        <div className="pt-2 flex flex-wrap gap-2">
          {staff.type && (
            <Badge variant={getTypeBadgeVariant(staff.type)} size="sm">
              <BriefcaseIcon className="h-3 w-3 mr-1" />
              {STAFF_TYPE_MAP[staff.type]}
            </Badge>
          )}
          {staff.status && (
            <Badge variant={getStatusBadgeVariant(staff.status)} size="sm">
              {staff.status === 1 ? "Active" : "Archived"}
            </Badge>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <div className="flex gap-2">
          <Link
            to={`/admin/staff/${staff.id}`}
            className={`inline-flex items-center text-sm font-medium ${getThemeClasses("link-primary")}`}
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            View
          </Link>
          <Link
            to={`/admin/staff/${staff.id}/edit`}
            className={`inline-flex items-center text-sm font-medium ${getThemeClasses("link-primary")}`}
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
const AdminStaffSearchResultPage = memo(function AdminStaffSearchResultPage() {
  const navigate = useNavigate();
  const staffManager = useStaffManager();
  const [searchParams] = useSearchParams();
  const { getThemeClasses } = useUIXTheme();

  // Extract search parameters from URL
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";
  const isActive = searchParams.get("active") === "1";

  // Component states
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

  // Memoized theme classes
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      linkPrimary: getThemeClasses("link-primary"),
    }),
    [getThemeClasses],
  );

  // Memoized unauthorized handler
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Format phone number
  const formatPhone = useCallback((phone) => {
    if (!phone) return "-";
    const cleaned = phone.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  }, []);

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
  const handleSortByChange = useCallback((e) => {
    setSortBy(e.target.value);
    setPreviousCursors([]);
    setCurrentCursor("");
  }, []);

  const handleStatusChange = useCallback((e) => {
    setStatus(parseInt(e.target.value));
    setPreviousCursors([]);
    setCurrentCursor("");
  }, []);

  const handleTypeChange = useCallback((e) => {
    setType(parseInt(e.target.value));
    setPreviousCursors([]);
    setCurrentCursor("");
  }, []);

  const handlePageSizeChange = useCallback((e) => {
    setPageSize(parseInt(e.target.value));
    setPreviousCursors([]);
    setCurrentCursor("");
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
        () => {
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
                <UserGroupIcon className={`h-8 w-8 ${themeClasses.linkPrimary} mr-3`} />
                <h1 className={`text-3xl font-bold ${themeClasses.textPrimary}`}>
                  Search Results
                </h1>
              </div>
              <p className={`mt-2 text-lg ${themeClasses.textSecondary} ml-11`}>
                Staff search results
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/staff/search")}
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
                {!isLoading && staffList?.results && (
                  <p className={`mt-1 text-sm ${themeClasses.textSecondary}`}>
                    Found <span className="font-semibold">{totalCount}</span> staff members
                  </p>
                )}
              </div>

              {/* Filters and Sorting */}
              {!isLoading && staffList?.results?.length > 0 && (
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
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
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600">Updating results...</p>
              </div>
            ) : staffList?.results?.length > 0 ? (
              <>
                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {staffList.results.map((staff) => (
                    <StaffCard
                      key={staff.id}
                      staff={staff}
                      onArchive={setSelectedStaffForDeletion}
                      formatPhone={formatPhone}
                    />
                  ))}
                </div>

                {/* Pagination Footer */}
                {(previousCursors.length > 0 || staffList.hasNextPage) && (
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
                        onClick={handlePreviousPage}
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
                        onClick={handleNextPage}
                        disabled={!staffList.hasNextPage}
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
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Staff Members Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No staff members match your search criteria. Try adjusting your search terms or filters.
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate("/admin/staff/search")}
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
            onClick={() => navigate("/admin/staff/search")}
            icon={ArrowLeftIcon}
          >
            Search Again
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/admin/staff")}
          >
            Back to Staff
          </Button>
        </div>
      </div>

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={!!selectedStaffForDeletion}
        onClose={() => setSelectedStaffForDeletion(null)}
        title="Archive Staff Member"
      >
        {selectedStaffForDeletion && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              You are about to <strong>archive</strong> this staff member.
              They will no longer appear on your dashboard. This action can be
              undone but you'll need to contact the system administrator. Are
              you sure you would like to continue?
            </p>

            <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500 mb-4">
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
                  <strong>Type:</strong> {STAFF_TYPE_MAP[selectedStaffForDeletion.type]}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setSelectedStaffForDeletion(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={isLoading}
                loading={isLoading}
                icon={ArchiveBoxIcon}
              >
                {isLoading ? "Archiving..." : "Confirm Archive"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
});

// Wrapper with UIXThemeProvider
function AdminStaffSearchResultPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminStaffSearchResultPage />
    </UIXThemeProvider>
  );
}

export default AdminStaffSearchResultPageWithProvider;
