// monorepo/web/workery-frontend/src/pages/Admin/SkillSet/AssociateSearchResultPage.jsx
// @uix-page: SkillSetAssociateSearchResultPage
// UIX Upgraded - Uses UIX primitives (Card, Alert, Button, Spinner, Breadcrumb, Badge)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  EyeIcon,
  FunnelIcon,
  XMarkIcon,
  CheckBadgeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useAssociateManager } from "../../../services/Services";
import {
  Card,
  Alert,
  Button,
  Spinner,
  Breadcrumb,
  Badge,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../components/UIX";

// Constants for filtering and sorting
const ASSOCIATE_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "1", label: "Active" },
  { value: "0", label: "Archived" },
];

const ASSOCIATE_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "0", label: "All" },
  { value: "1", label: "Residential" },
  { value: "2", label: "Commercial" },
];

const ASSOCIATE_SORT_OPTIONS = [
  { value: "lexical_name,ASC", label: "Name (A → Z)" },
  { value: "lexical_name,DESC", label: "Name (Z → A)" },
  { value: "join_date,DESC", label: "Join Date (Newest → Oldest)" },
  { value: "join_date,ASC", label: "Join Date (Oldest → Newest)" },
];

const PAGE_SIZE_OPTIONS = [
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
  { value: 250, label: "250 per page" },
];

function AdminSkillSetAssociateSearchResultPage() {
  const [searchParams] = useSearchParams();
  const associateManager = useAssociateManager();
  const { getThemeClasses } = useUIXTheme();

  // Get search parameters from URL
  const skillSetIDsStr = searchParams.get("ssids");
  const targetSkillSetIDs = skillSetIDsStr ? skillSetIDsStr.split(",") : [];
  const searchType = searchParams.get("type");

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon,
    },
    {
      label: "Skill Sets",
      to: "/admin/skill-sets",
      icon: WrenchScrewdriverIcon,
    },
    {
      label: "Results",
      icon: UserGroupIcon,
      isActive: true,
    },
  ], []);

  // State management
  const [associates, setAssociates] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtering and sorting states
  const [status, setStatus] = useState("1"); // Active by default (string to match select value)
  const [type, setType] = useState(""); // Empty string for "All Types"
  const [sortBy, setSortBy] = useState("lexical_name,ASC");

  // Pagination states
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentCursor, setCurrentCursor] = useState("");

  // Clear filters handler
  const handleClearFilters = () => {
    setStatus("1");
    setType("");
    setSortBy("lexical_name,ASC");
    setCurrentCursor("");
    setPreviousCursors([]);
    setCurrentPage(1);
  };

  // Fetch associates data
  const fetchAssociates = async () => {
    setFetching(true);
    setErrors({});

    try {
      // Build filters map for API call (matching AdminAssociateListPage pattern)
      const filtersMap = new Map();

      // Add cursor if provided
      if (currentCursor) {
        filtersMap.set("cursor", currentCursor);
      }

      // Use the correct parameter name for page size
      filtersMap.set("page_size", pageSize.toString());

      // Add sorting
      if (sortBy) {
        const [sortField, sortOrder] = sortBy.split(",");
        filtersMap.set("sort_field", sortField);
        // Backend expects 1 for ASC, -1 for DESC
        filtersMap.set("sort_order", sortOrder === "DESC" ? "-1" : "1");
      }

      // Add status filter
      if (status !== "") {
        filtersMap.set("status", status.toString());
      }

      // Add type filter
      if (type !== "" && type !== "0") {
        filtersMap.set("type", type.toString());
      }

      // FIXED: Use the correct backend parameter names for skill set filtering
      if (searchType === "all" && skillSetIDsStr) {
        // For "all" search type, associates must have ALL selected skill sets
        // Backend expects "all_skill_set_ids" parameter
        filtersMap.set("all_skill_set_ids", skillSetIDsStr);
      } else if (searchType === "in" && skillSetIDsStr) {
        // For "in" search type, associates must have ANY of the selected skill sets
        // Backend expects "in_skill_set_ids" parameter
        filtersMap.set("in_skill_set_ids", skillSetIDsStr);
      }
      // NOTE: Removed "skill_set_search_type" as it's not used by the backend

      // Call API through manager using filtersMap approach
      const response = await associateManager.getAssociatesWithFiltersMap(
        filtersMap,
        null,
        true, // force refresh to ensure we get fresh results
      );

      if (response) {
        setAssociates(response);
        setTotalCount(response.count || 0);

        // Handle pagination response
        if (
          response.nextCursor !== undefined &&
          response.nextCursor !== null &&
          response.nextCursor !== ""
        ) {
          setNextCursor(response.nextCursor);
          setHasNextPage(true);
        } else {
          setNextCursor("");
          setHasNextPage(false);
        }

        // Alternative: Check if hasNextPage is explicitly set
        if (response.hasNextPage !== undefined) {
          setHasNextPage(response.hasNextPage);
        }
      }
    } catch (error) {
      console.error("Failed to fetch associates:", error);
      setErrors({
        general: "Failed to load associates. Please try again.",
      });
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  // Load data when component mounts or search parameters change
  useEffect(() => {
    if (skillSetIDsStr && searchType) {
      // Reset pagination when filters change
      if (currentCursor === "") {
        setPreviousCursors([]);
        setCurrentPage(1);
      }
      fetchAssociates();
    }
  }, [skillSetIDsStr, searchType]); // Only depend on search parameters

  // Load data when pagination or filters change
  useEffect(() => {
    if (skillSetIDsStr && searchType) {
      fetchAssociates();
    }
  }, [currentCursor, pageSize, status, type, sortBy]);

  // Handle pagination
  const handleNextPage = () => {
    if (hasNextPage && nextCursor) {
      // Push current cursor to history for "Previous" functionality
      setPreviousCursors((prev) => [...prev, currentCursor]);
      // Update current cursor which will trigger fetchAssociates via useEffect
      setCurrentCursor(nextCursor);
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (previousCursors.length > 0) {
      // Pop the last cursor from history
      const newHistory = [...previousCursors];
      const previousCursor = newHistory.pop();
      // Update history
      setPreviousCursors(newHistory);
      // Update current cursor which will trigger fetchAssociates via useEffect
      setCurrentCursor(previousCursor || "");
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentCursor("");
    setPreviousCursors([]);
    setCurrentPage(1);
    setNextCursor("");
    setHasNextPage(false);
  };

  // Check if a skill set ID is in the target list
  const isTargetSkillSet = (skillSetId) => {
    return targetSkillSetIDs.includes(String(skillSetId));
  };

  // Calculate pagination info
  const hasPreviousPage = previousCursors.length > 0;
  const currentPageNumber = previousCursors.length + 1;

  // Render loading state
  if (isFetching && !associates) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Card padding="p-0" className="flex items-center justify-center min-h-[400px] border-0 shadow-none">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading associates...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Prepare table columns
  const columns = [
    {
      header: "Name",
      accessor: "name",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.firstName} {row.lastName}
          </div>
          {row.organizationName && (
            <div className="text-sm text-gray-500">{row.organizationName}</div>
          )}
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: "contact",
      render: (row) => (
        <div className="space-y-1">
          {row.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <PhoneIcon className="w-4 h-4 mr-1" />
              {row.phone}
            </div>
          )}
          {row.email && (
            <div className="flex items-center text-sm">
              <EnvelopeIcon className="w-4 h-4 mr-1 text-gray-400" />
              <a
                href={`mailto:${row.email}`}
                className="text-blue-600 hover:text-blue-700"
              >
                {row.email}
              </a>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Skill Sets",
      accessor: "skillSets",
      render: (row) => {
        if (!row.skillSets || row.skillSets.length === 0) {
          return <span className="text-gray-400">No skills</span>;
        }
        return (
          <div className="space-y-1">
            {row.skillSets.map((skillSet) => {
              const isTarget = isTargetSkillSet(skillSet.id);
              return (
                <div
                  key={skillSet.id}
                  className={`inline-flex items-center mr-2 mb-1 ${
                    isTarget ? "" : ""
                  }`}
                >
                  {isTarget && (
                    <CheckBadgeIcon className="w-4 h-4 mr-1 text-green-600" />
                  )}
                  <Badge variant={isTarget ? "success" : "default"} size="sm">
                    {skillSet.subCategory}
                  </Badge>
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      header: "Actions",
      accessor: "actions",
      align: "right",
      render: (row) => (
        <Link to={`/admin/associate/${row.id}`}>
          <Button variant="ghost" size="sm" icon={EyeIcon}>
            View
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
              <WrenchScrewdriverIcon className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.linkPrimary}`} />
              Search Results
            </h1>
            <p className={`mt-1 text-sm ${themeClasses.textSecondary}`}>
              Found {totalCount} associate{totalCount !== 1 ? "s" : ""} matching
              your search criteria
            </p>
          </div>
          <Link to="/admin/skill-sets">
            <Button variant="secondary">
              <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
              New Search
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Summary Card */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <div className="p-4">
          <div className="flex items-start">
            <MagnifyingGlassIcon className="w-5 h-5 mt-0.5 mr-3 text-blue-600" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900">
                Search Criteria
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                Showing associates who have{" "}
                <strong>{searchType === "all" ? "ALL" : "ANY"}</strong> of the
                selected skill sets ({targetSkillSetIDs.length} skill
                {targetSkillSetIDs.length === 1 ? " set" : " sets"} selected)
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {errors.general && (
        <Alert type="error" className="mb-6">
          {errors.general}
        </Alert>
      )}

      {/* Results Section */}
      <Card className="shadow-lg">
        {/* Filter Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Associates</h2>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                icon={FunnelIcon}
              >
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
              {(status !== "1" ||
                type !== "" ||
                sortBy !== "lexical_name,ASC") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  icon={XMarkIcon}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setCurrentCursor("");
                  setPreviousCursors([]);
                  setCurrentPage(1);
                }}
                options={ASSOCIATE_STATUS_OPTIONS}
              />

              <Select
                label="Type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setCurrentCursor("");
                  setPreviousCursors([]);
                  setCurrentPage(1);
                }}
                options={ASSOCIATE_TYPE_OPTIONS}
              />

              <Select
                label="Sort By"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentCursor("");
                  setPreviousCursors([]);
                  setCurrentPage(1);
                }}
                options={ASSOCIATE_SORT_OPTIONS}
              />
            </div>
          </div>
        )}

        {/* Results Table or Empty State */}
        {associates && associates.results && associates.results.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={associates.results}
                className="min-w-full"
              />
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) =>
                      handlePageSizeChange(parseInt(e.target.value))
                    }
                    className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">
                    Page {currentPageNumber} • Total: {totalCount} associates
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={!hasPreviousPage}
                    icon={ChevronLeftIcon}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!hasNextPage}
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Associates Found
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              No associates match your search criteria. Try adjusting your filters or search terms.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/admin/skill-sets">
                <Button variant="secondary">
                  <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                  Search Again
                </Button>
              </Link>
              <Link to="/admin/associates/add/step-1-search">
                <Button variant="primary">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  Add New Associate
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>

      {/* Bottom Navigation */}
      <div className="mt-6 flex justify-between">
        <Link to="/admin/skill-sets">
          <Button variant="outline" icon={ChevronLeftIcon}>
            Back to Search
          </Button>
        </Link>
        {associates && associates.results && associates.results.length > 0 && (
          <Link to="/admin/associates">
            <Button variant="ghost">Browse All Associates →</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// Wrapper with UIXThemeProvider
function AdminSkillSetAssociateSearchResultPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminSkillSetAssociateSearchResultPage />
    </UIXThemeProvider>
  );
}

export default AdminSkillSetAssociateSearchResultPageWithProvider;
