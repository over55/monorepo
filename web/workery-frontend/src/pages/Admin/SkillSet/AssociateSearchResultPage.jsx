// monorepo/web/workery-frontend/src/pages/Admin/SkillSet/AssociateSearchResultPage.jsx

import React, { useState, useEffect } from "react";
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
  Select,
  Loading,
  Badge,
  EmptyState,
  Table,
} from "../../../components/UI";
import {
  ASSOCIATE_STATUS_OPTIONS,
  ASSOCIATE_TYPE_OPTIONS,
  ASSOCIATE_SORT_OPTIONS,
} from "../../../constants/Associate";
import { PAGE_SIZE_OPTIONS } from "../../../constants/FieldOptions";

function AdminSkillSetAssociateSearchResultPage() {
  const [searchParams] = useSearchParams();
  const associateManager = useAssociateManager();

  // Get search parameters from URL
  const skillSetIDsStr = searchParams.get("ssids");
  const targetSkillSetIDs = skillSetIDsStr ? skillSetIDsStr.split(",") : [];
  const searchType = searchParams.get("type");

  // Component states
  const [associates, setAssociates] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtering and sorting states
  const [status, setStatus] = useState(1); // Active by default
  const [type, setType] = useState(0); // All types
  const [sortBy, setSortBy] = useState("lexical_name,ASC");

  // Pagination states
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");

  // Fetch associates data
  const fetchAssociates = async () => {
    setFetching(true);
    setErrors({});

    try {
      // Build params for API call
      const params = {
        pageSize: pageSize,
        cursor: currentCursor,
        status: status,
        type: type,
        sortBy: sortBy,
      };

      // Add skill set filtering based on search type
      if (searchType === "all") {
        params.allSkillSetIds = skillSetIDsStr;
      } else if (searchType === "in") {
        params.inSkillSetIds = skillSetIDsStr;
      }

      // Call API through manager
      const response = await associateManager.getAssociates(params);

      if (response) {
        setAssociates(response);
        setTotalCount(response.count || 0);

        // Handle pagination
        if (response.hasNextPage) {
          setNextCursor(response.nextCursor);
        } else {
          setNextCursor("");
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

  // Load data when dependencies change
  useEffect(() => {
    if (skillSetIDsStr && searchType) {
      fetchAssociates();
    }
  }, [
    currentCursor,
    pageSize,
    status,
    type,
    sortBy,
    skillSetIDsStr,
    searchType,
  ]);

  // Handle pagination
  const handleNextPage = () => {
    if (nextCursor) {
      setPreviousCursors([...previousCursors, currentCursor]);
      setCurrentCursor(nextCursor);
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (previousCursors.length > 0) {
      const newPreviousCursors = [...previousCursors];
      const previousCursor = newPreviousCursors.pop();
      setPreviousCursors(newPreviousCursors);
      setCurrentCursor(previousCursor);
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle filter reset
  const handleClearFilters = (e) => {
    e.preventDefault();
    setStatus(1);
    setType(0);
    setSortBy("lexical_name,ASC");
    setCurrentCursor("");
    setPreviousCursors([]);
    setCurrentPage(1);
  };

  // Check if a skill set ID is in the target list
  const isTargetSkillSet = (skillSetId) => {
    return targetSkillSetIDs.includes(String(skillSetId));
  };

  // Render loading state
  if (isFetching && !associates) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading
          size="lg"
          text="Loading associates..."
          className="min-h-[400px]"
        />
      </div>
    );
  }

  // Prepare table columns
  const columns = [
    {
      header: "Name",
      accessor: "name",
      render: (value, row) => (
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
      render: (value, row) => (
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
      render: (value, row) => {
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
      render: (value, row) => (
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
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to="/admin/skill-sets"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                  Skill Sets
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <UserGroupIcon className="w-4 h-4 mr-2" />
                Results
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <WrenchScrewdriverIcon className="w-8 h-8 mr-3 text-blue-600" />
              Search Results
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Found {totalCount} associate{totalCount !== 1 ? "s" : ""} matching
              your search criteria
            </p>
          </div>
          <Link to="/admin/skill-sets">
            <Button variant="outline" icon={MagnifyingGlassIcon}>
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
              {(status !== 1 ||
                type !== 0 ||
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
                  setStatus(parseInt(e.target.value));
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
                  setType(parseInt(e.target.value));
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
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value));
                      setCurrentCursor("");
                      setPreviousCursors([]);
                      setCurrentPage(1);
                    }}
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
                    Page {currentPage} • Total: {totalCount} associates
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={previousCursors.length === 0}
                    icon={ChevronLeftIcon}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!nextCursor}
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="No Associates Found"
            description="No associates match your search criteria. Try adjusting your filters or search terms."
            icon={UserGroupIcon}
            action={
              <div className="flex gap-3">
                <Link to="/admin/skill-sets">
                  <Button variant="outline" icon={MagnifyingGlassIcon}>
                    Search Again
                  </Button>
                </Link>
                <Link to="/admin/associates/add/step-1-search">
                  <Button variant="primary" icon={UserGroupIcon}>
                    Add New Associate
                  </Button>
                </Link>
              </div>
            }
            className="py-12"
          />
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

export default AdminSkillSetAssociateSearchResultPage;
