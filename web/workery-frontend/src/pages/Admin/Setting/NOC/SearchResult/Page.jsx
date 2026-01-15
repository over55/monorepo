// File Path: web/workery-frontend/src/pages/Admin/Setting/NOC/SearchResult/Page.jsx
// @uix-page: SettingNOCSearchResultPage

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useNOCManager } from "../../../../../services/Services";
import {
  MagnifyingGlassIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsUpDownIcon,
  HashtagIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  FolderIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  HomeIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import {
  Breadcrumb,
  PageHeader,
  Alert,
  Button,
  Select,
  SearchCriteriaPills,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../components/UIX";

function SettingNOCSearchResultPage() {
  return (
    <UIXThemeProvider>
      <SettingNOCSearchResultPageContent />
    </UIXThemeProvider>
  );
}

const SettingNOCSearchResultPageContent = memo(
  function SettingNOCSearchResultPageContent() {
    const nocManager = useNOCManager();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { getThemeClasses } = useUIXTheme();

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

    // Memoize theme classes
    const themeClasses = useMemo(
      () => ({
        bgGradientPrimary: getThemeClasses("bg-gradient-primary") || "bg-gradient-to-br from-gray-50 via-white to-red-50",
        linkText: getThemeClasses("text-primary") || "text-gray-900",
        linkHover: getThemeClasses("text-primary-hover") || "hover:bg-gray-50",
        textMuted: getThemeClasses("text-muted") || "text-gray-500",
        textPrimary: getThemeClasses("text-primary") || "text-gray-900",
        accentText: getThemeClasses("text-accent") || "text-red-500",
        badgeActiveBg: getThemeClasses("badge-active-bg") || "bg-red-100",
        badgeActiveText: getThemeClasses("badge-active-text") || "text-red-800",
        badgeInactiveBg: getThemeClasses("badge-inactive-bg") || "bg-gray-100",
        badgeInactiveText: getThemeClasses("badge-inactive-text") || "text-gray-500",
        loadingSpinner: getThemeClasses("loading-spinner") || "text-red-600",
        errorText: getThemeClasses("text-error") || "text-red-600",
        errorBg: getThemeClasses("bg-error-light") || "bg-red-50",
        errorBorder: getThemeClasses("border-error") || "border-red-200",
        focusRing: getThemeClasses("focus-ring") || "focus:ring-red-500",
        alertInfoBg: getThemeClasses("alert-info-bg") || "bg-blue-50",
        borderPrimary: getThemeClasses("border-primary") || "border-gray-200",
        // Decorative blobs
        blobPrimary: getThemeClasses("blob-primary") || "bg-purple-200",
        blobSecondary: getThemeClasses("blob-secondary") || "bg-yellow-200",
        blobTertiary: getThemeClasses("blob-tertiary") || "bg-pink-200",
        // Card/table styling
        bgCard: getThemeClasses("bg-card") || "bg-white",
        borderLight: getThemeClasses("border-light") || "border-gray-100",
        borderMedium: getThemeClasses("border-medium") || "border-gray-200",
        tableHeaderBg: getThemeClasses("table-header-bg") || "bg-gray-50",
      }),
      [getThemeClasses],
    );

    const onUnauthorized = useCallback(() => {
      navigate("/login?unauthorized=true");
    }, [navigate]);

    const performSearch = useCallback(
      async (page = 1) => {
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

          const response = await nocManager.getNOCs(
            params,
            onUnauthorized,
            true,
          );

          setNocs(response.results || []);
          setTotalCount(response.count || 0);
          setHasNextPage(response.hasNextPage || false);
          setHasPreviousPage(page > 1);
          setCurrentPage(page);
        } catch (err) {
          if (import.meta.env.DEV) {
            console.error("Failed to search NOCs:", err);
          }
          setError(err.message || "Failed to search NOCs");
          setNocs([]);
        } finally {
          setIsLoading(false);
        }
      },
      [
        pageSize,
        sortBy,
        sortOrder,
        urlSearchText,
        urlCode,
        urlUnitGroupTitle,
        nocManager,
        onUnauthorized,
      ],
    );

    const _handlePreviousPage = useCallback(() => {
      if (hasPreviousPage) {
        performSearch(currentPage - 1);
      }
    }, [hasPreviousPage, currentPage, performSearch]);

    const _handleNextPage = useCallback(() => {
      if (hasNextPage) {
        performSearch(currentPage + 1);
      }
    }, [hasNextPage, currentPage, performSearch]);

    const handleRowClick = useCallback(
      (noc) => {
        navigate(`/admin/settings/noc/${noc.id}/detail`);
      },
      [navigate],
    );

    const handleSortChange = useCallback((value) => {
      const [field, order] = value.split(",");
      setSortBy(field);
      setSortOrder(order);
      setCurrentPage(1);
    }, []);

    const _handlePageSizeChange = useCallback((value) => {
      setPageSize(parseInt(value));
      setCurrentPage(1);
    }, []);

    // Auto-search on mount and scroll to top
    useEffect(() => {
      // Scroll to top when component mounts
      window.scrollTo(0, 0);
      performSearch(1);
    }, [sortBy, sortOrder, pageSize, performSearch]);

    // Build search criteria display
    const searchCriteria = useMemo(() => {
      const criteria = [];
      if (urlSearchText)
        criteria.push({
          label: "Keywords",
          value: urlSearchText,
          icon: MagnifyingGlassIcon,
        });
      if (urlCode)
        criteria.push({ label: "Code", value: urlCode, icon: HashtagIcon });
      if (urlUnitGroupTitle)
        criteria.push({
          label: "Unit Group",
          value: urlUnitGroupTitle,
          icon: DocumentTextIcon,
        });
      return criteria;
    }, [urlSearchText, urlCode, urlUnitGroupTitle]);

    const _totalPages = useMemo(
      () => Math.ceil(totalCount / pageSize),
      [totalCount, pageSize],
    );

    return (
      <div className={`min-h-screen ${themeClasses.bgGradientPrimary}`}>
        {/* Decorative background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-40 -right-40 w-80 h-80 ${themeClasses.blobPrimary} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob`}></div>
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${themeClasses.blobSecondary} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000`}></div>
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 ${themeClasses.blobTertiary} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000`}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <Breadcrumb
            items={[
              {
                label: "Dashboard",
                to: "/admin/dashboard",
                icon: HomeIcon,
              },
              {
                label: "Settings",
                to: "/admin/settings",
                icon: Cog6ToothIcon,
              },
              {
                label: "NOC Search",
                to: "/admin/settings/noc/search",
                icon: AcademicCapIcon,
              },
              {
                label: "Search Results",
                icon: ChartBarIcon,
                isActive: true,
              },
            ]}
          />

          <PageHeader
            icon={AcademicCapIcon}
            title="NOC"
            subtitle="National Occupational Classification"
            actions={[
              <Button
                key="back"
                variant="secondary"
                onClick={() => navigate("/admin/settings/noc/search")}
                icon={ArrowLeftIcon}
              >
                Back to Search
              </Button>,
            ]}
          />

          {/* Search Criteria Display */}
          <SearchCriteriaPills criteria={searchCriteria} className="mb-8" />

          {error && (
            <Alert
              type="error"
              enhanced={true}
              dismissible={true}
              onDismiss={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Main Content - Enhanced with modern design */}
          <div className={`${themeClasses.bgCard} shadow-xl rounded-2xl overflow-hidden border ${themeClasses.borderLight} hover:shadow-2xl transition-shadow duration-300`}>
            {/* Results Header - Enhanced styling */}
            <div
              className={`px-6 sm:px-8 py-3 sm:py-4 ${themeClasses.bgGradientPrimary}`}
            >
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                    <div className="p-2 bg-white/20 rounded-lg mr-3 backdrop-blur-sm">
                      <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    Search Results
                  </h2>
                  {!isLoading && nocs.length > 0 && (
                    <p
                      className={`mt-1 text-sm sm:text-base ${themeClasses.textMuted}`}
                    >
                      Found{" "}
                      <span className="font-bold text-white">{totalCount}</span>{" "}
                      NOC classifications
                      {searchCriteria.length > 0 && " matching your criteria"}
                    </p>
                  )}
                </div>

                {/* Filters and Sorting - Enhanced styling */}
                {!isLoading && nocs.length > 0 && (
                  <div className="flex flex-col xs:flex-row gap-3">
                    {/* Sort By */}
                    <div className="flex items-center">
                      <ArrowsUpDownIcon className="h-5 w-5 text-white/70 mr-2 hidden sm:block" />
                      <Select
                        id="sort"
                        value={`${sortBy},${sortOrder}`}
                        onChange={handleSortChange}
                        size="sm"
                        placeholder={null}
                        options={[
                          { value: "code,ASC", label: "Code (A-Z)" },
                          { value: "code,DESC", label: "Code (Z-A)" },
                          { value: "unit_group_title,ASC", label: "Title (A-Z)" },
                          { value: "unit_group_title,DESC", label: "Title (Z-A)" },
                        ]}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Content */}
            <div className="overflow-hidden">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-24">
                  <div className="relative">
                    <svg
                      className={`animate-spin h-12 w-12 sm:h-16 sm:w-16 ${themeClasses.loadingSpinner}`}
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
                    <SparklesIcon
                      className={`absolute top-0 -right-2 h-4 w-4 ${themeClasses.accentText} animate-pulse`}
                    />
                  </div>
                  <p
                    className={`mt-4 text-base sm:text-lg ${themeClasses.textMuted} font-medium`}
                  >
                    Searching NOC database...
                  </p>
                </div>
              ) : nocs.length === 0 ? (
                <div className="text-center py-8 sm:py-12 px-4">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 ${themeClasses.badgeInactiveBg} rounded-full mb-4`}
                  >
                    <MagnifyingGlassIcon
                      className={`h-8 w-8 sm:h-10 sm:w-10 ${themeClasses.textMuted}`}
                    />
                  </div>
                  <h3
                    className={`text-lg sm:text-xl font-bold ${themeClasses.linkText} mb-2`}
                  >
                    No NOCs Found
                  </h3>
                  <p
                    className={`text-sm sm:text-base ${themeClasses.textMuted} mb-6 max-w-md mx-auto`}
                  >
                    No results were found. Try adjusting your search terms or
                    using different keywords.
                  </p>
                  <Button
                    variant="primary"
                    gradient={true}
                    onClick={() => navigate("/admin/settings/noc/search")}
                    icon={ArrowLeftIcon}
                  >
                    Try New Search
                  </Button>
                </div>
              ) : (
                <>
                  {/* Results Table - Enhanced styling */}
                  <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${themeClasses.borderMedium}`}>
                      <thead
                        className={themeClasses.tableHeaderBg}
                      >
                        <tr>
                          <th
                            scope="col"
                            className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold ${themeClasses.linkText} uppercase tracking-wider`}
                          >
                            <div className="flex items-center">
                              <div
                                className={`p-1 ${themeClasses.alertInfoBg} rounded mr-2`}
                              >
                                <HashtagIcon
                                  className={`h-4 w-4 ${themeClasses.textPrimary}`}
                                />
                              </div>
                              Code
                            </div>
                          </th>
                          <th
                            scope="col"
                            className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold ${themeClasses.linkText} uppercase tracking-wider`}
                          >
                            <div className="flex items-center">
                              <div
                                className={`p-1 ${themeClasses.badgeActiveBg} rounded mr-2`}
                              >
                                <BriefcaseIcon
                                  className={`h-4 w-4 ${themeClasses.accentText}`}
                                />
                              </div>
                              Unit Group Title
                            </div>
                          </th>
                          <th
                            scope="col"
                            className={`hidden md:table-cell px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold ${themeClasses.linkText} uppercase tracking-wider`}
                          >
                            <div className="flex items-center">
                              <div
                                className={`p-1 ${themeClasses.alertInfoBg} rounded mr-2`}
                              >
                                <FolderIcon
                                  className={`h-4 w-4 ${themeClasses.textPrimary}`}
                                />
                              </div>
                              Major Group
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`${themeClasses.bgCard} divide-y ${themeClasses.borderMedium}`}>
                        {nocs.map((noc, index) => (
                          <tr
                            key={noc.id || index}
                            onClick={() => handleRowClick(noc)}
                            className={`${themeClasses.linkHover} cursor-pointer transition-all duration-200 group`}
                          >
                            <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm sm:text-base font-bold bg-gradient-to-r from-${themeClasses.alertInfoBg} to-${themeClasses.alertInfoBg} ${themeClasses.textPrimary} border ${themeClasses.borderPrimary} group-hover:shadow-sm transition-shadow`}
                              >
                                {noc.code}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 sm:py-5">
                              <div
                                className={`text-sm sm:text-base font-semibold ${themeClasses.linkText} leading-relaxed`}
                              >
                                {noc.unitGroupTitle}
                              </div>
                              {/* Show major group on mobile as subtitle */}
                              <div
                                className={`md:hidden mt-1 text-xs sm:text-sm ${themeClasses.textMuted}`}
                              >
                                {noc.majorGroupCode && noc.majorGroupTitle ? (
                                  <span>
                                    <span
                                      className={`font-semibold ${themeClasses.textPrimary}`}
                                    >
                                      {noc.majorGroupCode}
                                    </span>{" "}
                                    - {noc.majorGroupTitle}
                                  </span>
                                ) : (
                                  noc.majorGroupTitle || (
                                    <span
                                      className={`${themeClasses.textMuted} italic`}
                                    >
                                      Not specified
                                    </span>
                                  )
                                )}
                              </div>
                            </td>
                            <td className="hidden md:table-cell px-4 sm:px-6 py-4 sm:py-5">
                              <div
                                className={`text-sm sm:text-base ${themeClasses.linkText}`}
                              >
                                {noc.majorGroupCode && noc.majorGroupTitle ? (
                                  <span>
                                    <span
                                      className={`font-bold ${themeClasses.textPrimary}`}
                                    >
                                      {noc.majorGroupCode}
                                    </span>{" "}
                                    - {noc.majorGroupTitle}
                                  </span>
                                ) : (
                                  noc.majorGroupTitle || (
                                    <span
                                      className={`${themeClasses.textMuted} italic`}
                                    >
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
                </>
              )}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slideIn {
            animation: slideIn 0.3s ease-out;
          }
        `}</style>
      </div>
    );
  },
);

SettingNOCSearchResultPageContent.displayName =
  "SettingNOCSearchResultPageContent";

export default SettingNOCSearchResultPage;
