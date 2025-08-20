// File Path: web/workery-frontend/src/pages/Admin/Setting/NOC/SearchResult/Page.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useNOCManager } from "../../../../../services/Services";
import {
  MagnifyingGlassIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsUpDownIcon,
  HashtagIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  FolderIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

function SettingNOCSearchResultPage() {
  const nocManager = useNOCManager();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL search parameters
  const urlSearchText = searchParams.get("q") || "";
  const urlCode = searchParams.get("c") || "";
  const urlUnitGroupTitle = searchParams.get("ugt") || "";

  // Component state
  const [nocs, setNocs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState("code");
  const [sortOrder, setSortOrder] = useState("ASC");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const performSearch = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: pageSize,
        sortBy,
        sortOrder,
      };

      // Add search parameters
      if (urlSearchText.trim()) {
        params.search = urlSearchText.trim();
      }
      if (urlCode.trim()) {
        params.code = urlCode.trim();
      }
      if (urlUnitGroupTitle.trim()) {
        params.ugt = urlUnitGroupTitle.trim();
      }

      const response = await nocManager.getNOCs(params, onUnauthorized, true);

      setNocs(response.results || []);
      setTotalCount(response.count || 0);
      setHasNextPage(response.hasNextPage || false);
      setHasPreviousPage(page > 1);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to search NOCs:", err);
      setError(err.message || "Failed to search NOCs");
      setNocs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      performSearch(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      performSearch(currentPage + 1);
    }
  };

  const handleRowClick = (noc) => {
    navigate(`/admin/settings/noc/${noc.id}/detail`);
  };

  const handleSortChange = (e) => {
    const [field, order] = e.target.value.split(",");
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Auto-search on mount and scroll to top
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    performSearch(1);
  }, [sortBy, sortOrder, pageSize]);

  // Build search criteria display
  const searchCriteria = [];
  if (urlSearchText)
    searchCriteria.push({
      label: "Keywords",
      value: urlSearchText,
      icon: MagnifyingGlassIcon,
    });
  if (urlCode)
    searchCriteria.push({ label: "Code", value: urlCode, icon: HashtagIcon });
  if (urlUnitGroupTitle)
    searchCriteria.push({
      label: "Unit Group",
      value: urlUnitGroupTitle,
      icon: DocumentTextIcon,
    });

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        minHeight: "100vh",
        minHeight: "100dvh",
        paddingBottom: "env(keyboard-inset-height, 0px)",
      }}
    >
      <div
        className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 pb-safe"
        style={{
          paddingBottom:
            "max(1rem, env(safe-area-inset-bottom), env(keyboard-inset-height, 0px))",
          paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
          paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        }}
      >
        {/* Breadcrumb - iOS & Android Optimized */}
        <nav
          className="flex mb-4 sm:mb-6 lg:mb-8 overflow-x-auto -webkit-overflow-scrolling-touch"
          aria-label="Breadcrumb"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-3 whitespace-nowrap">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200 min-h-[48px] px-2 py-2 rounded-md touch-manipulation"
                style={{
                  WebkitTapHighlightColor: "transparent",
                  minHeight: "48px",
                  touchAction: "manipulation",
                }}
              >
                Dashboard
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-3 h-3 text-gray-400 mx-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
                <button
                  onClick={() => navigate("/admin/settings")}
                  className="ml-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-indigo-600 md:ml-2 transition-colors duration-200 min-h-[48px] px-2 py-2 rounded-md touch-manipulation"
                  style={{
                    WebkitTapHighlightColor: "transparent",
                    minHeight: "48px",
                    touchAction: "manipulation",
                  }}
                >
                  Settings
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-3 h-3 text-gray-400 mx-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
                <button
                  onClick={() => navigate("/admin/settings/noc/search")}
                  className="ml-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-indigo-600 md:ml-2 transition-colors duration-200 min-h-[48px] px-2 py-2 rounded-md touch-manipulation"
                  style={{
                    WebkitTapHighlightColor: "transparent",
                    minHeight: "48px",
                    touchAction: "manipulation",
                  }}
                >
                  NOC Search
                </button>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg
                  className="w-3 h-3 text-gray-400 mx-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
                <span className="ml-1 text-xs sm:text-sm font-medium text-gray-500 md:ml-2">
                  Search Results
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header Section - Improved mobile layout */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-start">
                <AcademicCapIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 mr-2 sm:mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                    National Occupational Classification
                  </h1>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg text-gray-600">
                    Search Results
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => navigate("/admin/settings/noc/search")}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 w-full sm:w-auto justify-center min-h-[48px] touch-manipulation"
                style={{
                  WebkitTapHighlightColor: "transparent",
                  minHeight: "48px",
                  touchAction: "manipulation",
                }}
              >
                <ArrowLeftIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Back to Search
              </button>
            </div>
          </div>

          {/* Search Criteria Display - Improved mobile layout */}
          {searchCriteria.length > 0 && (
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
              {searchCriteria.map((criteria, index) => {
                const Icon = criteria.icon;
                return (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                    <span className="truncate max-w-[120px] sm:max-w-none">
                      {criteria.label}: "{criteria.value}"
                    </span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Error Alert - Improved mobile layout */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
              </div>
              <div className="ml-2 sm:ml-3 flex-1">
                <p className="text-xs sm:text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-2 sm:pl-3">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex text-red-400 hover:text-red-500 transition-colors duration-200 p-2 min-h-[48px] min-w-[48px] items-center justify-center rounded-md touch-manipulation"
                  style={{
                    WebkitTapHighlightColor: "transparent",
                    minHeight: "48px",
                    minWidth: "48px",
                    touchAction: "manipulation",
                  }}
                >
                  <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          {/* Results Header - Improved mobile layout */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                  <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-indigo-600" />
                  Search Results
                </h2>
                {!isLoading && nocs.length > 0 && (
                  <p className="mt-1 text-xs sm:text-sm text-gray-600">
                    Found <span className="font-semibold">{totalCount}</span>{" "}
                    NOC classifications
                    {searchCriteria.length > 0 && " matching your criteria"}
                  </p>
                )}
              </div>

              {/* Filters and Sorting - Improved mobile layout */}
              {!isLoading && nocs.length > 0 && (
                <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                  {/* Sort By */}
                  <div className="flex items-center">
                    <label htmlFor="sort" className="sr-only">
                      Sort by
                    </label>
                    <ArrowsUpDownIcon className="h-4 w-4 text-gray-400 mr-2 hidden sm:block" />
                    <select
                      id="sort"
                      value={`${sortBy},${sortOrder}`}
                      onChange={handleSortChange}
                      className="block w-full sm:w-auto rounded-lg border-gray-300 py-2 sm:py-1.5 pl-3 pr-8 text-xs sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[48px] appearance-none bg-white touch-manipulation"
                      style={{
                        WebkitTapHighlightColor: "transparent",
                        minHeight: "48px",
                        WebkitAppearance: "none",
                        touchAction: "manipulation",
                      }}
                    >
                      <option value="code,ASC">Code (A-Z)</option>
                      <option value="code,DESC">Code (Z-A)</option>
                      <option value="unit_group_title,ASC">Title (A-Z)</option>
                      <option value="unit_group_title,DESC">Title (Z-A)</option>
                    </select>
                  </div>

                  {/* Page Size */}
                  <div className="flex items-center">
                    <label htmlFor="pageSize" className="sr-only">
                      Items per page
                    </label>
                    <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-400 mr-2 hidden sm:block" />
                    <select
                      id="pageSize"
                      value={pageSize.toString()}
                      onChange={handlePageSizeChange}
                      className="block w-full sm:w-auto rounded-lg border-gray-300 py-2 sm:py-1.5 pl-3 pr-8 text-xs sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[44px] appearance-none bg-white"
                      style={{
                        WebkitTapHighlightColor: "transparent",
                        minHeight: "44px",
                        WebkitAppearance: "none",
                      }}
                    >
                      <option value="25">25 per page</option>
                      <option value="50">50 per page</option>
                      <option value="100">100 per page</option>
                      <option value="200">200 per page</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Content */}
          <div className="overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                <svg
                  className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-indigo-600 mb-3 sm:mb-4"
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
                <p className="text-sm sm:text-base text-gray-600">
                  Searching NOC database...
                </p>
              </div>
            ) : nocs.length === 0 ? (
              <div className="text-center py-12 sm:py-16 px-4">
                <MagnifyingGlassIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  No NOCs Found
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
                  No National Occupational Classifications match your search
                  criteria. Try adjusting your search terms or using different
                  keywords.
                </p>
                <button
                  onClick={() => navigate("/admin/settings/noc/search")}
                  className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 min-h-[48px] touch-manipulation"
                  style={{
                    WebkitTapHighlightColor: "transparent",
                    minHeight: "48px",
                    touchAction: "manipulation",
                  }}
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Try New Search
                </button>
              </div>
            ) : (
              <>
                {/* Results Table - Improved mobile responsiveness */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            <HashtagIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Code
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            <BriefcaseIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Unit Group Title
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            <FolderIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Major Group
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {nocs.map((noc, index) => (
                        <tr
                          key={noc.id || index}
                          onClick={() => handleRowClick(noc)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors min-h-[48px] touch-manipulation"
                          style={{
                            WebkitTapHighlightColor: "rgba(79, 70, 229, 0.1)",
                            minHeight: "48px",
                            touchAction: "manipulation",
                          }}
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-md text-xs sm:text-sm font-medium bg-indigo-100 text-indigo-800">
                              {noc.code}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 leading-tight">
                              {noc.unitGroupTitle}
                            </div>
                            {/* Show major group on mobile as subtitle */}
                            <div className="md:hidden mt-1 text-xs text-gray-600">
                              {noc.majorGroupCode && noc.majorGroupTitle ? (
                                <span>
                                  <span className="font-medium">
                                    {noc.majorGroupCode}
                                  </span>{" "}
                                  - {noc.majorGroupTitle}
                                </span>
                              ) : (
                                noc.majorGroupTitle || (
                                  <span className="text-gray-400 italic">
                                    Not specified
                                  </span>
                                )
                              )}
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4">
                            <div className="text-xs sm:text-sm text-gray-600">
                              {noc.majorGroupCode && noc.majorGroupTitle ? (
                                <span>
                                  <span className="font-medium">
                                    {noc.majorGroupCode}
                                  </span>{" "}
                                  - {noc.majorGroupTitle}
                                </span>
                              ) : (
                                noc.majorGroupTitle || (
                                  <span className="text-gray-400 italic">
                                    Not specified
                                  </span>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer - Improved mobile layout */}
                {(hasPreviousPage || hasNextPage) && (
                  <div className="bg-white px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={handlePreviousPage}
                        disabled={!hasPreviousPage || isLoading}
                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-h-[48px] touch-manipulation"
                        style={{
                          WebkitTapHighlightColor: "transparent",
                          minHeight: "48px",
                          touchAction: "manipulation",
                        }}
                      >
                        Previous
                      </button>
                      <button
                        onClick={handleNextPage}
                        disabled={!hasNextPage || isLoading}
                        className="ml-3 relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-h-[48px] touch-manipulation"
                        style={{
                          WebkitTapHighlightColor: "transparent",
                          minHeight: "48px",
                          touchAction: "manipulation",
                        }}
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">
                            {(currentPage - 1) * pageSize + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(currentPage * pageSize, totalCount)}
                          </span>{" "}
                          of <span className="font-medium">{totalCount}</span>{" "}
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
                            disabled={!hasPreviousPage || isLoading}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-h-[48px] min-w-[48px] touch-manipulation"
                            style={{
                              WebkitTapHighlightColor: "transparent",
                              minHeight: "48px",
                              minWidth: "48px",
                              touchAction: "manipulation",
                            }}
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon
                              className="h-4 w-4 sm:h-5 sm:w-5"
                              aria-hidden="true"
                            />
                          </button>

                          {/* Page Numbers */}
                          <span
                            className="relative inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 min-h-[48px]"
                            style={{ minHeight: "48px" }}
                          >
                            Page {currentPage}{" "}
                            {totalPages > 1 && `of ${totalPages}`}
                          </span>

                          <button
                            onClick={handleNextPage}
                            disabled={!hasNextPage || isLoading}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-h-[48px] min-w-[48px] touch-manipulation"
                            style={{
                              WebkitTapHighlightColor: "transparent",
                              minHeight: "48px",
                              minWidth: "48px",
                              touchAction: "manipulation",
                            }}
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon
                              className="h-4 w-4 sm:h-5 sm:w-5"
                              aria-hidden="true"
                            />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom Action Buttons - iOS & Android Optimized */}
        <div
          className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pb-safe"
          style={{
            paddingBottom:
              "max(0.75rem, env(safe-area-inset-bottom), env(keyboard-inset-height, 0px))",
          }}
        >
          <button
            onClick={() => navigate("/admin/settings/noc/search")}
            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 min-h-[48px] touch-manipulation"
            style={{
              WebkitTapHighlightColor: "transparent",
              minHeight: "48px",
              touchAction: "manipulation",
            }}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Search
          </button>
          <button
            onClick={() => navigate("/admin/settings")}
            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 min-h-[48px] touch-manipulation"
            style={{
              WebkitTapHighlightColor: "transparent",
              minHeight: "48px",
              touchAction: "manipulation",
            }}
          >
            Settings Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingNOCSearchResultPage;
