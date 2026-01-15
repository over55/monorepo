// File: src/components/UIX/UniversalListPage/UniversalListPage.jsx
// UIX Mobile Optimizations Applied

import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Squares2X2Icon,
  TableCellsIcon,
  HomeIcon,
  EnvelopeIcon,
  PhoneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  DataList,
  Breadcrumb,
  Button,
  useUIXTheme,
  DetailPageIcon,
  UIXThemeProvider,
  SearchFilter,
  Card,
  ViewButton,
} from "../";

// Move static constants outside component to prevent recreation
const VIEW_TYPE_TABULAR = "tabular";
const VIEW_TYPE_GRID = "grid";
const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_SORT = "name";
const DEFAULT_SORT_ORDER = "ASC";
const DEFAULT_STATUS = "1";
const DEFAULT_TYPE = "0";

/**
 * UniversalListPage - Performance Optimized
 * A reusable list page component based on the EventListPage structure
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static constants moved outside component
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized event handlers with useCallback
 * - Memoized configuration objects (pagination, empty state, search filter)
 * - Memoized grid items rendering
 * - Memoized header actions
 * - Prevented unnecessary re-renders
 * This component follows the exact pattern and spacing used in the conference list page
 *
 * @param {Object} props - Component props
 * @param {Object} props.config - Configuration object containing all necessary settings
 * @param {string} props.config.entityName - Name of the entity (e.g., "Organization", "Speaker")
 * @param {string} props.config.entityNamePlural - Plural name of the entity
 * @param {React.Component} props.config.icon - Icon component for the entity
 * @param {Object} props.config.routes - Route configuration object
 * @param {string} props.config.routes.search - Advanced search route
 * @param {string} props.config.routes.create - Create new entity route
 * @param {string} props.config.routes.detail - Detail page route template (with :id)
 * @param {Array} props.config.breadcrumbItems - Breadcrumb navigation items
 * @param {Array} props.config.columns - DataList column configuration
 * @param {Array} props.config.statusOptions - Status filter options
 * @param {Array} props.config.typeOptions - Type filter options
 * @param {Array} props.config.sortOptions - Sort options
 * @param {string} props.config.searchPlaceholder - Search input placeholder text
 * @param {Object} props.config.emptyState - Empty state configuration
 * @param {Function} props.config.fetchData - Function to fetch data (should return promise)
 * @param {Function} props.config.buildParams - Function to build API parameters
 * @param {Function} props.config.renderGridItem - Function to render individual grid items
 * @param {string} props.config.defaultStatus - Default status filter value
 * @param {string} props.config.defaultType - Default type filter value
 * @param {string} props.config.defaultSort - Default sort value
 * @param {string} props.config.defaultSortOrder - Default sort order
 * @param {number} props.config.defaultPageSize - Default page size
 * @param {string} props.config.defaultViewType - Default view type (tabular/grid)
 */
const UniversalListPage = memo(function UniversalListPage({ config }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      successBg: getThemeClasses('success-bg'),
      successBorder: getThemeClasses('success-border'),
      successText: getThemeClasses('success-text'),
      borderSecondary: getThemeClasses('border-secondary'),
      textPrimary: getThemeClasses('text-primary'),
      textSecondary: getThemeClasses('text-secondary'),
      textMuted: getThemeClasses('text-muted'),
      borderPrimary: getThemeClasses('border-primary'),
      cardBorder: getThemeClasses('card-border'),
      linkPrimary: getThemeClasses('link-primary'),
      pageHeaderIconBg: getThemeClasses('page-header-icon-bg'),
      pageHeaderIcon: getThemeClasses('page-header-icon'),
    }),
    [getThemeClasses],
  );

  // Mounted ref to prevent state updates after unmount (prevents memory leaks)
  const isMountedRef = useRef(true);

  // Cleanup effect to set mounted ref to false on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // List state
  const [entityList, setEntityList] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Pagination state (cursor-based)
  const [pageSize, setPageSize] = useState(config.defaultPageSize || DEFAULT_PAGE_SIZE);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [currentCursor, setCurrentCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");

  // Filter state
  const [sortBy, setSortBy] = useState(config.defaultSort || DEFAULT_SORT);
  const [sortOrder, setSortOrder] = useState(config.defaultSortOrder || DEFAULT_SORT_ORDER);
  const [status, setStatus] = useState(config.defaultStatus || DEFAULT_STATUS);
  const [type, setType] = useState(config.defaultType || DEFAULT_TYPE);
  const [searchQuery, setSearchQuery] = useState(config.defaultSearchQuery || "");
  const [tempSearchQuery, setTempSearchQuery] = useState(config.defaultSearchQuery || "");
  const [viewType, setViewType] = useState(config.defaultViewType || VIEW_TYPE_GRID);

  // Force refresh counter to bypass cache
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Memoize unauthorized handler
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch entity list with useCallback to prevent infinite loops
  const fetchEntityList = useCallback(
    async (forceRefresh = false) => {
      console.log("🔵 UniversalListPage fetchEntityList called with state:", {
        currentCursor,
        pageSize,
        sortBy,
        sortOrder,
        status,
        type,
        searchQuery,
        forceRefresh
      });

      // Check if mounted before setting loading state
      if (!isMountedRef.current) return;
      setIsLoading(true);
      setErrors({});

      try {
        // Build params using the provided function
        const params = config.buildParams({
          pageSize,
          currentCursor,
          sortBy,
          sortOrder,
          status,
          type,
          searchQuery,
        });

        // Fetch data using the provided function
        const response = await config.fetchData(params, onUnauthorized, forceRefresh);

        // Check if still mounted before updating state
        if (!isMountedRef.current) return;

        // Handle success using the provided callback or default handling
        if (config.onFetchSuccess) {
          config.onFetchSuccess(response, setEntityList, setNextCursor);
        } else {
          // Default success handling
          console.log("🔵 UniversalListPage fetchEntityList response:", {
            resultsCount: response.results?.length,
            totalCount: response.count,
            hasNextPage: response.hasNextPage,
            nextCursor: response.nextCursor
          });

          setEntityList({
            results: response.results || [],
            count: response.count || 0,
          });

          if (response.hasNextPage || (response.nextCursor && response.nextCursor !== "")) {
            console.log("🟢 Setting nextCursor to:", response.nextCursor);
            setNextCursor(response.nextCursor || "");
          } else {
            console.log("🔴 No next page - clearing nextCursor");
            setNextCursor("");
          }
        }
      } catch (error) {
        // Check if still mounted before updating error state
        if (!isMountedRef.current) return;

        // Handle error using the provided callback or default handling
        if (config.onFetchError) {
          config.onFetchError(error, setErrors);
        } else {
          // Default error handling
          console.error(`Error fetching ${config.entityNamePlural.toLowerCase()}:`, error);
          setErrors({ general: `Failed to load ${config.entityNamePlural.toLowerCase()}. Please try again.` });
        }
      } finally {
        // Check if still mounted before clearing loading state
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [currentCursor, pageSize, sortBy, sortOrder, status, type, searchQuery, config, onUnauthorized],
  );

  // Memoize pagination handlers
  const handlePageChange = useCallback((direction) => {
    console.log("🔵 UniversalListPage handlePageChange:", { direction, currentCursor, nextCursor, previousCursorsLength: previousCursors.length });

    if (direction === "next" && nextCursor) {
      console.log("🟢 Moving to next page with cursor:", nextCursor);
      const newPreviousCursors = [...previousCursors];
      newPreviousCursors.push(currentCursor);
      setPreviousCursors(newPreviousCursors);
      setCurrentCursor(nextCursor);
    } else if (direction === "previous" && previousCursors.length > 0) {
      const newPreviousCursors = [...previousCursors];
      const previousCursor = newPreviousCursors.pop();
      console.log("🟢 Moving to previous page with cursor:", previousCursor);
      setPreviousCursors(newPreviousCursors);
      setCurrentCursor(previousCursor);
    } else {
      console.log("🔴 Cannot change page - direction:", direction, "nextCursor:", nextCursor, "previousCursors:", previousCursors.length);
    }
  }, [nextCursor, previousCursors, currentCursor]);

  // Memoize search handler
  const handleSearch = useCallback(() => {
    setSearchQuery(tempSearchQuery);
    // Reset pagination when search changes
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
  }, [tempSearchQuery]);

  // Memoize filter handlers
  const handleStatusChange = useCallback((newStatus) => {
    setStatus(newStatus);
    // Reset pagination when filter changes
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
  }, []);

  const handleTypeChange = useCallback((newType) => {
    setType(newType);
    // Reset pagination when filter changes
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
  }, []);

  const handleSortChange = useCallback((sortValue) => {
    const [field, order] = sortValue.split(",");
    setSortBy(field);
    setSortOrder(order);
    // Reset pagination when sort changes
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
  }, []);

  const handlePageSizeChange = useCallback((newPageSize) => {
    console.log("🔵 UniversalListPage handlePageSizeChange called with:", newPageSize);
    const parsedSize = parseInt(newPageSize);
    console.log("🔵 UniversalListPage setting pageSize to:", parsedSize);
    setPageSize(parsedSize);
    // Reset pagination when page size changes
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
  }, []);

  // Memoize clear filters handler
  const handleClearFilters = useCallback(() => {
    setStatus(config.defaultStatus || DEFAULT_STATUS);
    setType(config.defaultType || DEFAULT_TYPE);
    setSortBy(config.defaultSort || DEFAULT_SORT);
    setSortOrder(config.defaultSortOrder || DEFAULT_SORT_ORDER);
    setSearchQuery("");
    setTempSearchQuery("");
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
    setRefreshCounter((prev) => prev + 1);
  }, [config.defaultStatus, config.defaultType, config.defaultSort, config.defaultSortOrder]);

  // Memoize search filter configuration for DataList
  const searchFilterConfig = useMemo(() => {
    return {
      searchTerm: searchQuery,
      tempSearchTerm: tempSearchQuery,
      onSearchTermChange: setTempSearchQuery,
      onSearch: handleSearch,
      searchPlaceholder: config.searchPlaceholder || `Search ${config.entityNamePlural.toLowerCase()}...`,
      statusOptions: config.statusOptions || [],
      statusFilter: status,
      onStatusFilterChange: handleStatusChange,
      typeOptions: config.typeOptions || [],
      typeFilter: type,
      onTypeFilterChange: handleTypeChange,
      typeFilterLabel: config.typeFilterLabel || "Type",
      sortOptions: config.sortOptions || [],
      sortValue: `${sortBy},${sortOrder}`,
      onSortChange: handleSortChange,
      pageSizeOptions: config.pageSizeOptions || [],
      pageSize: pageSize,
      onPageSizeChange: handlePageSizeChange,
      onClearFilters: handleClearFilters,
      onRefresh: () => fetchEntityList(true)
    };
  }, [
    searchQuery,
    tempSearchQuery,
    handleSearch,
    config.searchPlaceholder,
    config.entityNamePlural,
    config.statusOptions,
    status,
    handleStatusChange,
    config.typeOptions,
    type,
    handleTypeChange,
    config.typeFilterLabel,
    config.sortOptions,
    sortBy,
    sortOrder,
    handleSortChange,
    config.pageSizeOptions,
    pageSize,
    handlePageSizeChange,
    handleClearFilters,
    fetchEntityList
  ]);

  // Memoize pagination configuration (cursor-based)
  const paginationConfig = useMemo(() => ({
    currentPage: previousCursors.length + 1,
    totalCount: entityList?.count || 0,
    hasNextPage: !!nextCursor,
    onPageChange: (direction) => {
      if (direction > previousCursors.length + 1) {
        handlePageChange("next");
      } else {
        handlePageChange("previous");
      }
    }
  }), [previousCursors.length, entityList?.count, nextCursor, handlePageChange]);

  // Memoize empty state configuration
  const emptyStateConfig = useMemo(() => {
    const baseConfig = {
      icon: config.icon,
      title: config.emptyState?.title || `No ${config.entityNamePlural} Found`,
      description: searchQuery || status !== (config.defaultStatus || DEFAULT_STATUS) || type !== (config.defaultType || DEFAULT_TYPE)
        ? (config.emptyState?.filterDescription || `No ${config.entityNamePlural.toLowerCase()} match your current filters. Try adjusting your search criteria.`)
        : (config.emptyState?.emptyDescription || `No ${config.entityNamePlural.toLowerCase()} have been added yet.`),
    };

    // Only add action button if explicitly provided or if create route exists
    if (config.emptyState?.actionLabel !== null && config.emptyState?.actionLabel !== undefined) {
      // Use explicit actionLabel from config
      if (config.emptyState.actionLabel) {
        baseConfig.actionLabel = config.emptyState.actionLabel;
        baseConfig.onActionClick = () => navigate(config.routes.create);
        baseConfig.isCreateAction = true;
      }
      // If actionLabel is explicitly set to empty string or null, don't add button
    } else if (config.routes?.create) {
      // Fallback to default create button if create route exists
      baseConfig.actionLabel = `Add ${config.entityName}`;
      baseConfig.onActionClick = () => navigate(config.routes.create);
      baseConfig.isCreateAction = true;
    }

    return baseConfig;
  }, [config, searchQuery, status, type, navigate]);

  // Memoize view type toggle handlers
  const handleViewTypeTabular = useCallback(() => setViewType(VIEW_TYPE_TABULAR), []);
  const handleViewTypeGrid = useCallback(() => setViewType(VIEW_TYPE_GRID), []);
  const handleNavigateToSearch = useCallback(() => navigate(config.routes.search), [navigate, config.routes.search]);
  const handleNavigateToCreate = useCallback(() => navigate(config.routes.create), [navigate, config.routes.create]);

  // Memoize header actions for DataList
  const headerActions = useMemo(() => {
    const actions = [
      <div key="view-toggle" className="flex items-center justify-center gap-1">
        <Button
          variant={viewType === VIEW_TYPE_TABULAR ? "primary" : "ghost"}
          onClick={handleViewTypeTabular}
          size="sm"
        >
          <TableCellsIcon className="w-5 h-5" />
        </Button>
        <Button
          variant={viewType === VIEW_TYPE_GRID ? "primary" : "ghost"}
          onClick={handleViewTypeGrid}
          size="sm"
        >
          <Squares2X2Icon className="w-5 h-5" />
        </Button>
      </div>
    ];

    // Only add search button if search route is defined AND not explicitly disabled
    if (config.routes?.search && config.showSearchButton !== false) {
      actions.push(
        <Button
          key="search"
          variant="secondary"
          size="lg"
          onClick={handleNavigateToSearch}
          icon={config.searchIcon}
          className="w-full sm:w-auto"
        >
          Advanced Search
        </Button>
      );
    }

    // Only add create button if create route is defined AND not explicitly disabled
    if (config.routes?.create && config.showCreateButton !== false) {
      actions.push(
        <Button
          key="add"
          variant="success"
          size="lg"
          onClick={handleNavigateToCreate}
          icon={config.createIcon}
          className="w-full sm:w-auto"
        >
          {config.createLabel || `Create ${config.entityName}`}
        </Button>
      );
    }

    return actions;
  }, [viewType, handleViewTypeTabular, handleViewTypeGrid, handleNavigateToSearch, handleNavigateToCreate, config.routes?.search, config.routes?.create, config.showSearchButton, config.showCreateButton, config.searchIcon, config.createIcon, config.createLabel, config.entityName]);

  // Memoize grid items rendering
  const gridItems = useMemo(() => {
    if (!entityList?.results || entityList.results.length === 0) return null;

    return entityList.results.map((entity, index) => {
      // Generate a unique key that handles cases where entity.id might be 0, null, or undefined
      const uniqueKey = entity.id !== null && entity.id !== undefined ? `entity-${entity.id}` : `index-${index}`;

      return config.renderGridItem ? (
        <div key={uniqueKey}>
          {config.renderGridItem(entity, navigate)}
        </div>
      ) : (
        <Card
          key={uniqueKey}
          className="hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <config.icon className={`w-8 h-8 mr-3 ${themeClasses.textMuted}`} />
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
                    {entity.name || entity.organizationName || `${entity.firstName} ${entity.lastName}`}
                  </h3>
                  {entity.organizationName && entity.firstName && entity.lastName && (
                    <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>
                      Contact: {entity.firstName} {entity.lastName}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {config.getStatusBadge && config.getStatusBadge(entity)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {entity.email && (
                <div className={`flex items-center text-sm ${themeClasses.textSecondary}`}>
                  <EnvelopeIcon className={`w-4 h-4 mr-2 ${themeClasses.textMuted}`} />
                  <span className={`${themeClasses.linkPrimary}`}>
                    {entity.email}
                  </span>
                </div>
              )}
              {entity.phone && (
                <div className={`flex items-center text-sm ${themeClasses.textSecondary}`}>
                  <PhoneIcon className={`w-4 h-4 mr-2 ${themeClasses.textMuted}`} />
                  <span>{entity.phone}</span>
                </div>
              )}
            </div>

            <div className={`mt-4 pt-4 border-t ${themeClasses.cardBorder} flex justify-end`}>
              <ViewButton
                to={config.routes.detail.replace(':id', entity.id)}
                text={`View ${config.entityName}`}
              />
            </div>
          </div>
        </Card>
      );
    });
  }, [entityList?.results, config, navigate, themeClasses]);

  // Initial load effect - fetchEntityList is properly memoized with all filter/pagination
  // dependencies, so we only need it and refreshCounter in the dependency array.
  // The refreshCounter allows manual refresh triggering via handleClearFilters.
  useEffect(() => {
    fetchEntityList(true);
  }, [fetchEntityList, refreshCounter]);

  // Handle success message from navigation state
  useEffect(() => {
    let timeoutId = null;

    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title);
      timeoutId = setTimeout(() => setSuccessMessage(""), 3000);
    }

    // Cleanup timeout on unmount or location change
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [location]);

  return (
    <UIXThemeProvider>
      <>
        {/* Breadcrumb */}
        <Breadcrumb items={config.breadcrumbItems} />

        {/* Screen reader description */}
        <div
          id={`${config.entityName.toLowerCase()}-table-description`}
          className="sr-only"
          aria-hidden="true"
        >
          Table showing {config.entityNamePlural.toLowerCase()} with details including name and other relevant information. Use the search and filter controls above to narrow results.
        </div>

        {/* Conditional Rendering: DataList for table view, Custom Grid for card view */}
        {viewType === VIEW_TYPE_TABULAR ? (
          <DataList
            data={entityList?.results || []}
            columns={config.columns}
            isLoading={isLoading}
            errors={errors}
            successMessage={successMessage}
            onSuccessMessageClose={() => setSuccessMessage("")}
            searchFilter={searchFilterConfig}
            pagination={paginationConfig}
            emptyState={emptyStateConfig}
            header={{
              icon: config.icon,
              title: config.title || `${config.entityName} Management`,
              showHeader: true,
              subtitle: config.subtitle || `Manage your ${config.entityNamePlural.toLowerCase()} and their information`,
              decorativeIcon: <DetailPageIcon icon={config.icon} />,
              actions: headerActions
            }}
            aria-describedby={`${config.entityName.toLowerCase()}-table-description`}
          />
        ) : (
          /* Grid View */
          <div
            className="min-h-dvh"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorY: 'contain',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            <div className="relative">
              {/* Success Message */}
              {successMessage && (
                <div className={`mb-6 sm:mb-8 p-4 ${themeClasses.successBg} border ${themeClasses.successBorder} rounded-lg flex items-center`}>
                  <span className={`text-sm ${themeClasses.successText}`}>{successMessage}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSuccessMessage("")}
                    className={`ml-auto ${themeClasses.successText} hover:opacity-75`}
                    aria-label="Close"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* Main Content Layout - Centered */}
              <div className="max-w-7xl mx-auto">
                <Card padding="p-0" className="shadow-xl hover:shadow-2xl transition-shadow duration-300">

                  {/* Header Section - Inside the white card */}
                  <div className={`px-6 sm:px-8 py-6 border-b ${themeClasses.borderSecondary}`}>
                    <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start">
                          <div className={`p-3 rounded-2xl shadow-lg mr-4 flex-shrink-0 ${themeClasses.pageHeaderIconBg}`}>
                            <config.icon className={`h-8 w-8 sm:h-10 sm:w-10 ${themeClasses.pageHeaderIcon}`} />
                          </div>
                          <div className="text-center lg:text-left">
                            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${themeClasses.textPrimary} leading-tight`}>
                              {config.title || `${config.entityName} Management`}
                            </h1>
                            {config.subtitle && (
                              <p className={`mt-2 text-sm sm:text-base ${themeClasses.textSecondary}`}>
                                {config.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Action buttons - stacked on mobile, inline on larger screens */}
                      <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        {/* View toggle buttons - always in a row */}
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant={viewType === VIEW_TYPE_TABULAR ? "primary" : "ghost"}
                            onClick={handleViewTypeTabular}
                            size="sm"
                          >
                            <TableCellsIcon className="w-5 h-5" />
                          </Button>
                          <Button
                            variant={viewType === VIEW_TYPE_GRID ? "primary" : "ghost"}
                            onClick={handleViewTypeGrid}
                            size="sm"
                          >
                            <Squares2X2Icon className="w-5 h-5" />
                          </Button>
                        </div>
                        {/* Only show search button if search route is defined AND not explicitly disabled */}
                        {config.routes?.search && config.showSearchButton !== false && (
                          <Button
                            variant="secondary"
                            size="lg"
                            onClick={handleNavigateToSearch}
                            icon={config.searchIcon}
                            className="w-full sm:w-auto"
                          >
                            Advanced Search
                          </Button>
                        )}
                        {/* Only show create button if create route is defined AND not explicitly disabled */}
                        {config.routes?.create && config.showCreateButton !== false && (
                          <Button
                            variant="success"
                            size="lg"
                            onClick={handleNavigateToCreate}
                            icon={config.createIcon}
                            className="w-full sm:w-auto"
                          >
                            {config.createLabel || `Create ${config.entityName}`}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Search Filter Component - Same as EventListPage */}
                  <SearchFilter
                    searchTerm={searchQuery}
                    tempSearchTerm={tempSearchQuery}
                    onSearchTermChange={setTempSearchQuery}
                    onSearch={handleSearch}
                    searchPlaceholder={config.searchPlaceholder || `Search ${config.entityNamePlural.toLowerCase()}...`}
                    statusOptions={config.statusOptions || []}
                    statusFilter={status}
                    onStatusFilterChange={handleStatusChange}
                    typeOptions={config.typeOptions || []}
                    typeFilter={type}
                    onTypeFilterChange={handleTypeChange}
                    typeFilterLabel={config.typeFilterLabel || "Type"}
                    sortOptions={config.sortOptions || []}
                    sortValue={`${sortBy},${sortOrder}`}
                    onSortChange={handleSortChange}
                    pageSizeOptions={config.pageSizeOptions || []}
                    pageSize={pageSize}
                    onPageSizeChange={handlePageSizeChange}
                    onClearFilters={handleClearFilters}
                    onRefresh={searchFilterConfig.onRefresh}
                  />

                  {/* Grid Content Section - Same as EventListPage */}
                  <div className="p-6">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${themeClasses.borderPrimary}`}></div>
                        <span className={`ml-3 ${themeClasses.textSecondary}`}>Loading...</span>
                      </div>
                    ) : entityList?.results?.length > 0 ? (
                      <>
                        {/* Results count */}
                        <div className={`mb-6 text-sm ${themeClasses.textSecondary}`}>
                          Showing <strong>{entityList.results.length}</strong> {config.entityNamePlural.toLowerCase()}
                          {entityList.count > 0 && ` of ${entityList.count} total`}
                          {searchQuery && ` (filtered by "${searchQuery}")`}
                        </div>

                        {/* Grid View */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {gridItems}
                        </div>
                      </>
                    ) : (
                      /* Empty State */
                      <div className="text-center py-12">
                        <config.icon className={`mx-auto h-12 w-12 ${themeClasses.textMuted}`} />
                        <h3 className={`mt-2 text-sm font-medium ${themeClasses.textPrimary}`}>
                          {emptyStateConfig.title}
                        </h3>
                        <p className={`mt-1 text-sm ${themeClasses.textSecondary}`}>
                          {emptyStateConfig.description}
                        </p>
                        {/* Only show action button if actionLabel is provided */}
                        {emptyStateConfig.actionLabel && (
                          <div className="mt-6">
                            <Button
                              variant="success"
                              onClick={emptyStateConfig.onActionClick}
                              icon={config.createIcon}
                            >
                              {emptyStateConfig.actionLabel}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pagination for Grid View */}
                    {entityList?.results?.length > 0 && (
                      <div className="mt-8 flex justify-center">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              console.log("🔵 PREVIOUS button clicked!");
                              handlePageChange("previous");
                            }}
                            disabled={previousCursors.length === 0}
                          >
                            Previous
                          </Button>
                          <span className={`px-3 py-1 text-sm ${themeClasses.textSecondary}`}>
                            Page {previousCursors.length + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              console.log("🟢 NEXT button clicked! nextCursor:", nextCursor);
                              handlePageChange("next");
                            }}
                            disabled={!nextCursor}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </>
    </UIXThemeProvider>
  );
});

// Set display name for React DevTools
UniversalListPage.displayName = 'UniversalListPage';

export default UniversalListPage;