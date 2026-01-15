// File: src/components/UIX/EntityListPage/EntityListPage.jsx
// UIX Mobile Optimizations Applied

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Squares2X2Icon,
  TableCellsIcon,
  HomeIcon,
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
} from "../";

// Constants
const VIEW_TYPE_TABULAR = "tabular";
const VIEW_TYPE_GRID = "grid";

/**
 * EntityListPage - A reusable list page component for managing entities
 */
const EntityListPage = memo(({ config }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getThemeClasses } = useUIXTheme();

  // Refs for cleanup
  const isMounted = useRef(true);
  const timeoutRef = useRef(null);

  // List state
  const [entityList, setEntityList] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Pagination state (cursor-based)
  const [pageSize, setPageSize] = useState(config.defaultPageSize || 25);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [currentCursor, setCurrentCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");

  // Filter state
  const [sortBy, setSortBy] = useState(config.defaultSort || "name");
  const [sortOrder, setSortOrder] = useState(config.defaultSortOrder || "ASC");
  const [status, setStatus] = useState(config.defaultStatus || "1");
  const [type, setType] = useState(config.defaultType || "0");
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [viewType, setViewType] = useState(
    config.defaultViewType || VIEW_TYPE_GRID,
  );

  // Force refresh counter
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Memoized callbacks
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  const resetPagination = useCallback(() => {
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
  }, []);

  // Fetch entity list - properly memoized
  const fetchEntityList = useCallback(
    async (forceRefresh = false) => {
      if (!isMounted.current) return;

      setIsLoading(true);
      setErrors({});

      try {
        const params = config.buildParams({
          pageSize,
          currentCursor,
          sortBy,
          sortOrder,
          status,
          type,
          searchQuery,
        });

        const response = await config.fetchData(
          params,
          onUnauthorized,
          forceRefresh,
        );

        if (!isMounted.current) return;

        if (config.onFetchSuccess) {
          config.onFetchSuccess(response, setEntityList, setNextCursor);
        } else {
          setEntityList({
            results: response.results || [],
            count: response.count || 0,
          });
          setNextCursor(
            response.hasNextPage || response.nextCursor
              ? response.nextCursor || ""
              : "",
          );
        }
      } catch (error) {
        if (!isMounted.current) return;

        if (config.onFetchError) {
          config.onFetchError(error, setErrors);
        } else {
          setErrors({
            general: `Failed to load ${config.entityNamePlural.toLowerCase()}. Please try again.`,
          });
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    },
    [
      currentCursor,
      pageSize,
      sortBy,
      sortOrder,
      status,
      type,
      searchQuery,
      config,
      onUnauthorized,
    ],
  );

  // Pagination handlers
  const handlePageChange = useCallback(
    (direction) => {
      if (direction === "next" && nextCursor) {
        setPreviousCursors((prev) => [...prev, currentCursor]);
        setCurrentCursor(nextCursor);
      } else if (direction === "previous" && previousCursors.length > 0) {
        setPreviousCursors((prev) => {
          const newPrev = [...prev];
          const previousCursor = newPrev.pop();
          setCurrentCursor(previousCursor);
          return newPrev;
        });
      }
    },
    [currentCursor, nextCursor, previousCursors],
  );

  // Search handler
  const handleSearch = useCallback(() => {
    setSearchQuery(tempSearchQuery);
    resetPagination();
  }, [tempSearchQuery, resetPagination]);

  // Filter handlers
  const handleStatusChange = useCallback(
    (newStatus) => {
      setStatus(newStatus);
      resetPagination();
    },
    [resetPagination],
  );

  const handleTypeChange = useCallback(
    (newType) => {
      setType(newType);
      resetPagination();
    },
    [resetPagination],
  );

  const handleSortChange = useCallback(
    (sortValue) => {
      const [field, order] = sortValue.split(",");
      setSortBy(field);
      setSortOrder(order);
      resetPagination();
    },
    [resetPagination],
  );

  const handlePageSizeChange = useCallback(
    (newPageSize) => {
      setPageSize(parseInt(newPageSize));
      resetPagination();
    },
    [resetPagination],
  );

  const handleClearFilters = useCallback(() => {
    setStatus(config.defaultStatus || "1");
    setType(config.defaultType || "0");
    setSortBy(config.defaultSort || "name");
    setSortOrder(config.defaultSortOrder || "ASC");
    setSearchQuery("");
    setTempSearchQuery("");
    resetPagination();
    setRefreshCounter((prev) => prev + 1);
  }, [config, resetPagination]);

  const handleRefresh = useCallback(() => {
    fetchEntityList(true);
  }, [fetchEntityList]);

  const handleSuccessMessageClose = useCallback(() => {
    setSuccessMessage("");
  }, []);

  // View type handlers
  const handleViewTypeChange = useCallback((newViewType) => {
    setViewType(newViewType);
  }, []);

  // Navigation handlers
  const navigateToSearch = useCallback(() => {
    navigate(config.routes.search);
  }, [navigate, config.routes.search]);

  const navigateToCreate = useCallback(() => {
    navigate(config.routes.create);
  }, [navigate, config.routes.create]);

  const navigateToDetail = useCallback(
    (entityId) => {
      navigate(config.routes.detail.replace(":id", entityId));
    },
    [navigate, config.routes.detail],
  );

  // Memoized configurations
  const searchFilterConfig = useMemo(
    () => ({
      searchTerm: searchQuery,
      tempSearchTerm: tempSearchQuery,
      onSearchTermChange: setTempSearchQuery,
      onSearch: handleSearch,
      searchPlaceholder:
        config.searchPlaceholder ||
        `Search ${config.entityNamePlural.toLowerCase()}...`,
      statusOptions: config.statusOptions || [],
      statusFilter: status,
      onStatusFilterChange: handleStatusChange,
      typeOptions: config.typeOptions || [],
      typeFilter: type,
      onTypeFilterChange: handleTypeChange,
      sortOptions: config.sortOptions || [],
      sortValue: `${sortBy},${sortOrder}`,
      onSortChange: handleSortChange,
      pageSizeOptions: config.pageSizeOptions || [],
      pageSize,
      onPageSizeChange: handlePageSizeChange,
      onClearFilters: handleClearFilters,
      onRefresh: handleRefresh,
    }),
    [
      searchQuery,
      tempSearchQuery,
      handleSearch,
      config,
      status,
      handleStatusChange,
      type,
      handleTypeChange,
      sortBy,
      sortOrder,
      handleSortChange,
      pageSize,
      handlePageSizeChange,
      handleClearFilters,
      handleRefresh,
    ],
  );

  const paginationConfig = useMemo(
    () => ({
      currentPage: previousCursors.length + 1,
      totalCount: entityList?.count || 0,
      hasNextPage: !!nextCursor,
      onPageChange: (direction) => {
        if (direction > previousCursors.length + 1) {
          handlePageChange("next");
        } else {
          handlePageChange("previous");
        }
      },
    }),
    [previousCursors, entityList, nextCursor, handlePageChange],
  );

  const emptyStateConfig = useMemo(
    () => ({
      icon: config.icon,
      title: config.emptyState?.title || `No ${config.entityNamePlural} Found`,
      description:
        searchQuery ||
        status !== (config.defaultStatus || "1") ||
        type !== (config.defaultType || "0")
          ? config.emptyState?.filterDescription ||
            `No ${config.entityNamePlural.toLowerCase()} match your current filters. Try adjusting your search criteria.`
          : config.emptyState?.emptyDescription ||
            `No ${config.entityNamePlural.toLowerCase()} have been added yet.`,
      actionLabel: config.emptyState?.actionLabel || `Add ${config.entityName}`,
      onActionClick: navigateToCreate,
      isCreateAction: true,
    }),
    [config, searchQuery, status, type, navigateToCreate],
  );

  // Memoized header actions
  const headerActions = useMemo(
    () => [
      <div key="view-toggle" className="flex items-center gap-1">
        <Button
          variant={viewType === VIEW_TYPE_TABULAR ? "primary" : "ghost"}
          onClick={() => handleViewTypeChange(VIEW_TYPE_TABULAR)}
          size="sm"
        >
          <TableCellsIcon className="w-5 h-5" />
        </Button>
        <Button
          variant={viewType === VIEW_TYPE_GRID ? "primary" : "ghost"}
          onClick={() => handleViewTypeChange(VIEW_TYPE_GRID)}
          size="sm"
        >
          <Squares2X2Icon className="w-5 h-5" />
        </Button>
      </div>,
      <Button
        key="search"
        variant="secondary"
        size="md"
        onClick={navigateToSearch}
        icon={config.searchIcon}
      >
        Advanced Search
      </Button>,
      <Button
        key="add"
        variant="success"
        size="lg"
        onClick={navigateToCreate}
        icon={config.createIcon}
      >
        {config.createLabel || `Create ${config.entityName}`}
      </Button>,
    ],
    [
      viewType,
      handleViewTypeChange,
      navigateToSearch,
      navigateToCreate,
      config,
    ],
  );

  const headerConfig = useMemo(
    () => ({
      icon: config.icon,
      title: `${config.entityName} Management`,
      showHeader: true,
      subtitle: `Manage your ${config.entityNamePlural.toLowerCase()} and their information`,
      decorativeIcon: <DetailPageIcon icon={config.icon} />,
      actions: headerActions,
    }),
    [config, headerActions],
  );

  // Initial load effect
  useEffect(() => {
    fetchEntityList(true);
  }, [fetchEntityList, refreshCounter]);

  // Handle success message from navigation state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title);

      timeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          setSuccessMessage("");
        }
      }, 3000);
    }
  }, [location]);

  // Memoized grid content renderer
  const renderGridContent = useCallback(() => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div
            className={`animate-spin rounded-full h-8 w-8 border-b-2 ${getThemeClasses("border-primary")}`}
          ></div>
          <span className={`ml-3 ${getThemeClasses("text-secondary")}`}>
            Loading {config.entityNamePlural.toLowerCase()}...
          </span>
        </div>
      );
    }

    if (entityList?.results?.length > 0) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {entityList.results.map((entity) =>
            config.renderGridItem ? (
              config.renderGridItem(entity, navigate)
            ) : (
              <Card
                key={entity.id}
                onClick={() => navigateToDetail(entity.id)}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <config.icon
                      className={`w-8 h-8 ${getThemeClasses("link-primary")} mr-3`}
                    />
                    <div>
                      <h3
                        className={`text-lg font-semibold ${getThemeClasses("text-primary")}`}
                      >
                        {entity.name ||
                          entity.organizationName ||
                          `${entity.firstName} ${entity.lastName}`}
                      </h3>
                    </div>
                  </div>
                </div>
              </Card>
            ),
          )}
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <config.icon
          className={`mx-auto h-12 w-12 ${getThemeClasses("text-muted")}`}
        />
        <h3
          className={`mt-2 text-sm font-medium ${getThemeClasses("text-primary")}`}
        >
          {emptyStateConfig.title}
        </h3>
        <p className={`mt-1 text-sm ${getThemeClasses("text-secondary")}`}>
          {emptyStateConfig.description}
        </p>
        <div className="mt-6">
          <Button
            variant="success"
            onClick={emptyStateConfig.onActionClick}
            icon={config.createIcon}
          >
            {emptyStateConfig.actionLabel}
          </Button>
        </div>
      </div>
    );
  }, [
    isLoading,
    entityList,
    config,
    getThemeClasses,
    emptyStateConfig,
    navigate,
    navigateToDetail,
  ]);

  return (
    <UIXThemeProvider>
      <>
        {/* Breadcrumb */}
        <Breadcrumb items={config.breadcrumbItems} />

        {/* Conditional Rendering: DataList for table view, Custom Grid for card view */}
        {viewType === VIEW_TYPE_TABULAR ? (
          <DataList
            data={entityList?.results || []}
            columns={config.columns}
            isLoading={isLoading}
            errors={errors}
            successMessage={successMessage}
            onSuccessMessageClose={handleSuccessMessageClose}
            searchFilter={searchFilterConfig}
            pagination={paginationConfig}
            emptyState={emptyStateConfig}
            header={headerConfig}
          />
        ) : (
          /* Standalone Grid View */
          <div
            className={`min-h-dvh ${getThemeClasses("bg-gradient-primary")}`}
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorY: 'contain',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Decorative background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div
                className={`absolute -top-40 -right-40 w-80 h-80 ${getThemeClasses("decorative-primary")} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob`}
              ></div>
              <div
                className={`absolute -bottom-40 -left-40 w-80 h-80 ${getThemeClasses("decorative-secondary")} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000`}
              ></div>
              <div
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 ${getThemeClasses("decorative-accent")} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000`}
              ></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
              {/* Success Message */}
              {successMessage && (
                <div
                  className={`mb-6 sm:mb-8 p-4 ${getThemeClasses("success-bg")} border ${getThemeClasses("success-border")} rounded-lg flex items-center`}
                >
                  <span
                    className={`text-sm ${getThemeClasses("success-text")}`}
                  >
                    {successMessage}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSuccessMessageClose}
                    className={`ml-auto ${getThemeClasses("success-text")} hover:opacity-75`}
                    aria-label="Close"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* Main Content Layout */}
              <div className="max-w-7xl mx-auto">
                <div
                  className={`${getThemeClasses("bg-card")} shadow-xl rounded-2xl overflow-hidden border ${getThemeClasses("border-secondary")} hover:shadow-2xl transition-shadow duration-300`}
                >
                  {/* Header Section */}
                  <div
                    className={`px-6 sm:px-8 py-6 border-b ${getThemeClasses("border-secondary")}`}
                  >
                    <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start">
                          <div
                            className={`p-3 rounded-2xl shadow-lg mr-4 flex-shrink-0 ${getThemeClasses("bg-gradient-secondary")}`}
                          >
                            <config.icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                          </div>
                          <div className="text-center lg:text-left">
                            <h1
                              className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${getThemeClasses("text-primary")} leading-tight`}
                            >
                              {config.entityName} Management
                            </h1>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-3">
                        {headerActions}
                      </div>
                    </div>
                  </div>

                  {/* Search Filter Component */}
                  <SearchFilter {...searchFilterConfig} />

                  {/* Grid Content Section */}
                  <div className="p-6">{renderGridContent()}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    </UIXThemeProvider>
  );
});

// Add display name
EntityListPage.displayName = "EntityListPage";

export default EntityListPage;
