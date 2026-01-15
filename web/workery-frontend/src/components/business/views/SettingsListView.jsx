import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  UIXThemeProvider,
  useUIXTheme,
  Breadcrumb,
  PageHeader,
  Alert,
  Button,
  SearchFilter,
  CreateButton,
  CreateFirstButton,
  EmptyStateIcon,
  Table,
  Loading,
  Card,
} from "../../UIX";
import {
  ArrowLeftIcon,
  HomeIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

function SettingsListView({
  // Entity configuration (legacy props)
  entityType,
  entityTypePlural,
  entityIcon,
  entityManager,

  // Entity configuration (new props - aliases)
  entityName, // alias for entityType
  entityNamePlural, // alias for entityTypePlural
  icon, // alias for entityIcon
  fetchItems: fetchItemsProp, // new callback-based approach
  breadcrumbItems: breadcrumbItemsProp, // allow custom breadcrumbs

  // Path configuration
  basePath,
  settingsPath = "/admin/settings",
  createPath,
  detailPath, // new prop for detail path base
  detailPathTemplate, // template with {id} placeholder
  editPathTemplate, // template with {id} placeholder
  deletePathTemplate, // template with {id} placeholder

  // Display configuration
  title,
  subtitle,
  emptyStateTitle,
  emptyStateMessage,

  // Table configuration
  columns,
  searchFields = ["name"],
  searchPlaceholder = "Search...",
  displayField = "name", // field to display in messages

  // Status configuration
  statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "1", label: "Active" },
    { value: "2", label: "Inactive" },
  ],

  // Sort configuration
  sortOptions = [
    { value: "name,ASC", label: "Name (A-Z)" },
    { value: "name,DESC", label: "Name (Z-A)" },
    { value: "created_at,DESC", label: "Created Date (Newest)" },
    { value: "created_at,ASC", label: "Created Date (Oldest)" },
  ],

  // Pagination configuration
  defaultPageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],

  // Default sort
  defaultSortBy = "name",
  defaultSortOrder = "ASC",

  // Custom renderers
  customRowRenderer,
  customEmptyState,

  // Callbacks
  onRowClick,
  onItemAction,

  // Item protection
  canModifyItem,
  protectedItemLabel = "Protected",
}) {
  // Resolve aliases - prefer new props, fall back to legacy
  const resolvedEntityType = entityName || entityType || (title ? title.toLowerCase().replace(/s$/, "") : "item");
  const resolvedEntityTypePlural = entityNamePlural || entityTypePlural || title || "Items";
  const resolvedEntityIcon = icon || entityIcon;

  return (
    <UIXThemeProvider>
      <SettingsListViewContent
        entityType={resolvedEntityType}
        entityTypePlural={resolvedEntityTypePlural}
        entityIcon={resolvedEntityIcon}
        entityManager={entityManager}
        fetchItemsProp={fetchItemsProp}
        breadcrumbItemsProp={breadcrumbItemsProp}
        basePath={basePath}
        settingsPath={settingsPath}
        createPath={createPath}
        detailPath={detailPath}
        detailPathTemplate={detailPathTemplate}
        editPathTemplate={editPathTemplate}
        deletePathTemplate={deletePathTemplate}
        title={title}
        subtitle={subtitle}
        emptyStateTitle={emptyStateTitle}
        emptyStateMessage={emptyStateMessage}
        columns={columns}
        searchFields={searchFields}
        searchPlaceholder={searchPlaceholder}
        displayField={displayField}
        statusOptions={statusOptions}
        sortOptions={sortOptions}
        defaultPageSize={defaultPageSize}
        pageSizeOptions={pageSizeOptions}
        defaultSortBy={defaultSortBy}
        defaultSortOrder={defaultSortOrder}
        customRowRenderer={customRowRenderer}
        customEmptyState={customEmptyState}
        onRowClick={onRowClick}
        onItemAction={onItemAction}
        canModifyItem={canModifyItem}
        protectedItemLabel={protectedItemLabel}
      />
    </UIXThemeProvider>
  );
}

function SettingsListViewContent({
  entityType,
  entityTypePlural,
  entityIcon,
  entityManager,
  fetchItemsProp,
  breadcrumbItemsProp,
  basePath,
  settingsPath,
  createPath,
  // eslint-disable-next-line no-unused-vars
  detailPath,
  // eslint-disable-next-line no-unused-vars
  detailPathTemplate,
  // eslint-disable-next-line no-unused-vars
  editPathTemplate,
  // eslint-disable-next-line no-unused-vars
  deletePathTemplate,
  title,
  subtitle,
  emptyStateTitle,
  emptyStateMessage,
  columns,
  // eslint-disable-next-line no-unused-vars
  searchFields,
  searchPlaceholder,
  // eslint-disable-next-line no-unused-vars
  displayField,
  statusOptions,
  sortOptions,
  defaultPageSize,
  pageSizeOptions,
  defaultSortBy,
  defaultSortOrder,
  // eslint-disable-next-line no-unused-vars
  customRowRenderer,
  customEmptyState,
  onRowClick,
  // eslint-disable-next-line no-unused-vars
  onItemAction,
  // eslint-disable-next-line no-unused-vars
  canModifyItem,
  // eslint-disable-next-line no-unused-vars
  protectedItemLabel,
}) {
  const { getThemeClasses } = useUIXTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoadingRef = useRef(false);

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination state - using cursor-based pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState("");
  const [previousCursors, setPreviousCursors] = useState([]); // Stack of previous cursors for back navigation
  const [currentCursor, setCurrentCursor] = useState("");

  // Filter/Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortOrder, setSortOrder] = useState(defaultSortOrder);

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      bgGradientPrimary: getThemeClasses("bg-gradient-primary"),
      bgPrimary: getThemeClasses("bg-primary"),
      bgSecondary: getThemeClasses("bg-secondary"),
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      textMuted: getThemeClasses("text-muted"),
      border: getThemeClasses("border"),
      borderSecondary: getThemeClasses("border-secondary"),
      buttonBg: getThemeClasses("button-bg"),
      buttonHover: getThemeClasses("button-hover"),
      alertInfoBg: getThemeClasses("alert-info-bg"),
      decorativePrimary: getThemeClasses("decorative-primary"),
      decorativeSecondary: getThemeClasses("decorative-secondary"),
      decorativeAccent: getThemeClasses("decorative-accent"),
    }),
    [getThemeClasses],
  );

  // Handlers
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Get manager method name based on entity type - memoized to prevent recreation
  const getManagerMethodName = useCallback(() => {
    // Convert entityType to proper method name (e.g., 'vehicleType' -> 'getVehicleTypes')
    if (!entityType) return null;
    const methodName = `get${entityType.charAt(0).toUpperCase() + entityType.slice(1)}s`;
    return methodName;
  }, [entityType]);

  // Fetch items
  const fetchItems = useCallback(async (params = {}) => {
    if (isLoadingRef.current && !params.forceRefresh) {
      return;
    }

    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);

      // Use cursor-based pagination
      const cursorToUse = params.cursor !== undefined ? params.cursor : currentCursor;

      const queryParams = {
        limit: pageSize,
        search: searchTerm,
        sortBy,
        sortOrder,
        ...params,
      };

      // Only add cursor if we have one (empty string = first page)
      if (cursorToUse) {
        queryParams.cursor = cursorToUse;
      }

      if (statusFilter) {
        queryParams.status = statusFilter;
      }

      let response;

      // Use fetchItemsProp callback if provided, otherwise use entityManager
      if (fetchItemsProp && typeof fetchItemsProp === "function") {
        response = await fetchItemsProp(queryParams, onUnauthorized, params.forceRefresh || false);
      } else if (entityManager) {
        // Dynamically call the appropriate manager method
        const methodName = getManagerMethodName();
        if (!methodName || typeof entityManager[methodName] !== "function") {
          throw new Error(`Method ${methodName} not found on entity manager`);
        }
        response = await entityManager[methodName](
          queryParams,
          onUnauthorized,
          params.forceRefresh || false,
        );
      } else {
        throw new Error("Either fetchItems callback or entityManager must be provided");
      }

      // Handle different response formats
      const results = response.results || response || [];
      const count = response.count || results.length || 0;
      const hasNext = response.hasNextPage || !!response.nextCursor || false;
      const responseCursor = response.nextCursor || "";

      setItems(results);
      setTotalCount(count);
      setHasNextPage(hasNext);
      setNextCursor(responseCursor);

    } catch (err) {
      console.error(`Failed to fetch ${entityTypePlural}:`, err);
      setError(err.message || `Failed to load ${entityTypePlural}`);
      setItems([]);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [currentCursor, pageSize, searchTerm, sortBy, sortOrder, statusFilter, entityManager, entityTypePlural, onUnauthorized, getManagerMethodName, fetchItemsProp]);

  // Search handler
  const handleSearch = useCallback(() => {
    setSearchTerm(tempSearchTerm);
    setCurrentPage(1);
    // Reset cursor state for new search
    setCurrentCursor("");
    setPreviousCursors([]);
    setNextCursor("");
    // Trigger immediate fetch with the new search term (no cursor = first page)
    fetchItems({
      search: tempSearchTerm,
      cursor: "",
      forceRefresh: true
    });
  }, [tempSearchTerm, fetchItems]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setTempSearchTerm("");
    setSearchTerm("");
    setSortBy(defaultSortBy);
    setSortOrder(defaultSortOrder);
    setStatusFilter("");
    setCurrentPage(1);
    // Reset cursor state
    setCurrentCursor("");
    setPreviousCursors([]);
    setNextCursor("");

    fetchItems({ cursor: "", forceRefresh: true });
  }, [defaultSortBy, defaultSortOrder, fetchItems]);

  // Go to next page using cursor
  const handleNextPage = useCallback(() => {
    if (!nextCursor) return;

    // Save current cursor to history for back navigation
    setPreviousCursors(prev => [...prev, currentCursor]);
    setCurrentCursor(nextCursor);
    setCurrentPage(prev => prev + 1);

    // Fetch with the next cursor
    fetchItems({ cursor: nextCursor, forceRefresh: true });
  }, [nextCursor, currentCursor, fetchItems]);

  // Go to previous page using cursor history
  const handlePreviousPage = useCallback(() => {
    if (previousCursors.length === 0) return;

    // Pop the last cursor from history
    const newPreviousCursors = [...previousCursors];
    const prevCursor = newPreviousCursors.pop();

    setPreviousCursors(newPreviousCursors);
    setCurrentCursor(prevCursor);
    setCurrentPage(prev => Math.max(1, prev - 1));

    // Fetch with the previous cursor (empty string for first page)
    fetchItems({ cursor: prevCursor, forceRefresh: true });
  }, [previousCursors, fetchItems]);

  // Initial load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchItems();
  }, [fetchItems]);

  // Handle success message from navigation state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  }, [location]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Default breadcrumb items - memoized to prevent recreation
  // Use custom breadcrumbs if provided, otherwise generate default
  const breadcrumbItems = useMemo(() => {
    if (breadcrumbItemsProp && breadcrumbItemsProp.length > 0) {
      return breadcrumbItemsProp;
    }
    return [
      {
        label: "Dashboard",
        to: "/admin/dashboard",
        icon: HomeIcon,
      },
      {
        label: "Settings",
        to: settingsPath,
        icon: Cog6ToothIcon,
      },
      {
        label: title || entityTypePlural,
        icon: entityIcon,
        isActive: true,
      },
    ];
  }, [breadcrumbItemsProp, settingsPath, title, entityTypePlural, entityIcon]);

  // Helper to get singular form from plural (handles common cases)
  const getSingularForm = useCallback((plural) => {
    if (!plural) return "Item";
    // Handle common irregular plurals
    if (plural.toLowerCase().endsWith("ies")) {
      return plural.slice(0, -3) + "y";
    }
    if (plural.toLowerCase().endsWith("s")) {
      return plural.slice(0, -1);
    }
    return plural;
  }, []);

  // Default page actions - memoized to prevent recreation
  const pageActions = useMemo(() => [
    <Button
      key="back"
      variant="secondary"
      size="lg"
      onClick={() => navigate(settingsPath)}
      icon={ArrowLeftIcon}
    >
      Back to Settings
    </Button>,
    <CreateButton
      key="create"
      onClick={() => navigate(createPath || `${basePath}/create`)}
    >
      New {getSingularForm(entityTypePlural)}
    </CreateButton>
  ], [navigate, settingsPath, createPath, basePath, entityTypePlural, getSingularForm]);

  return (
    <Card padding="p-0" className={`min-h-screen ${themeClasses.bgGradientPrimary} shadow-none border-0`}>
      {/* Decorative background elements */}
      <Card padding="p-0" className="fixed inset-0 overflow-hidden pointer-events-none shadow-none border-0 bg-transparent">
        <Card padding="p-0" className={`absolute -top-40 -right-40 w-80 h-80 ${themeClasses.decorativePrimary} rounded-full mix-blend-multiply filter blur-xl opacity-20 settings-animate-blob shadow-none border-0`} />
        <Card padding="p-0" className={`absolute -bottom-40 -left-40 w-80 h-80 ${themeClasses.decorativeSecondary} rounded-full mix-blend-multiply filter blur-xl opacity-20 settings-animate-blob settings-animation-delay-2000 shadow-none border-0`} />
        <Card padding="p-0" className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 ${themeClasses.decorativeAccent} rounded-full mix-blend-multiply filter blur-xl opacity-20 settings-animate-blob settings-animation-delay-4000 shadow-none border-0`} />
      </Card>

      <Card padding="p-0" className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 shadow-none border-0 bg-transparent">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <PageHeader
          icon={entityIcon}
          title={title || entityTypePlural}
          subtitle={subtitle || `Manage ${entityTypePlural?.toLowerCase() || entityType || "item"} settings`}
          actions={pageActions}
        />

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage("")}
            className="mb-6 sm:mb-8"
          />
        )}

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-6 sm:mb-8"
          />
        )}

        {/* Main Content */}
        <Card padding="p-0" className="max-w-4xl mx-auto shadow-none border-0 bg-transparent">
          <Card padding="p-0" className={`${themeClasses.bgPrimary} shadow-xl rounded-2xl overflow-hidden ${themeClasses.border} hover:shadow-2xl transition-shadow duration-300`}>

            {/* Search Filter */}
            <SearchFilter
              searchTerm={searchTerm}
              tempSearchTerm={tempSearchTerm}
              onSearchTermChange={setTempSearchTerm}
              onSearch={handleSearch}
              searchPlaceholder={searchPlaceholder}
              statusOptions={statusOptions}
              statusFilter={statusFilter}
              onStatusFilterChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
                // Reset cursor state for new filter
                setCurrentCursor("");
                setPreviousCursors([]);
                setNextCursor("");
              }}
              sortOptions={sortOptions}
              sortValue={`${sortBy},${sortOrder}`}
              onSortChange={(value) => {
                const [field, order] = value.split(",");
                setSortBy(field);
                setSortOrder(order);
                setCurrentPage(1);
                // Reset cursor state for new sort
                setCurrentCursor("");
                setPreviousCursors([]);
                setNextCursor("");
              }}
              pageSizeOptions={pageSizeOptions}
              pageSize={pageSize}
              onPageSizeChange={(value) => {
                setPageSize(value);
                setCurrentPage(1);
                // Reset cursor state for new page size
                setCurrentCursor("");
                setPreviousCursors([]);
                setNextCursor("");
              }}
              onClearFilters={clearFilters}
              onRefresh={() => fetchItems({ cursor: "", forceRefresh: true })}
            />

            {/* Content */}
            {isLoading ? (
              <Card padding="p-0" className="flex items-center justify-center py-12 shadow-none border-0 bg-transparent">
                <Loading size="lg" text={`Loading ${entityTypePlural || "items"}...`} />
              </Card>
            ) : items.length > 0 ? (
              <>
                {/* Table */}
                <Table
                  columns={columns}
                  data={items}
                  onRowClick={onRowClick}
                />

                {/* Pagination */}
                {totalCount > pageSize && (
                  <div className={`flex items-center justify-between border-t ${themeClasses.border} ${themeClasses.bgGradientPrimary} px-6 py-4`}>
                    {/* Mobile Pagination */}
                    <div className="flex-1 flex justify-between sm:hidden">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        aria-label="Go to previous page"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={handleNextPage}
                        disabled={!hasNextPage}
                        aria-label="Go to next page"
                      >
                        Next
                      </Button>
                    </div>

                    {/* Desktop Pagination */}
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className={`text-sm ${themeClasses.textSecondary}`}>
                          Showing{" "}
                          <span className="font-medium">{items.length}</span>{" "}
                          results
                          {totalCount > 0 && (
                            <>
                              {" "}of{" "}
                              <span className="font-medium">{totalCount}</span>{" "}
                              total
                            </>
                          )}
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <Button
                            variant="secondary"
                            size="md"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="rounded-r-none"
                            aria-label="Go to previous page"
                          >
                            Previous
                          </Button>
                          <span className={`relative inline-flex items-center px-5 py-2 border ${themeClasses.borderSecondary} ${themeClasses.alertInfoBg} text-sm font-medium ${themeClasses.textPrimary}`}>
                            Page {currentPage}
                          </span>
                          <Button
                            variant="secondary"
                            size="md"
                            onClick={handleNextPage}
                            disabled={!hasNextPage}
                            className="rounded-l-none"
                            aria-label="Go to next page"
                          >
                            Next
                          </Button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              customEmptyState || (
                <Card padding="p-0" className="text-center py-12 shadow-none border-0 bg-transparent">
                  <EmptyStateIcon icon={entityIcon} />
                  <Card padding="p-0" className={`mt-2 text-lg font-semibold ${themeClasses.textPrimary} shadow-none border-0 bg-transparent`}>
                    {emptyStateTitle || `No ${entityTypePlural || "Items"} Found`}
                  </Card>
                  <Card padding="p-0" className={`mt-1 text-sm ${themeClasses.textMuted} shadow-none border-0 bg-transparent`}>
                    {emptyStateMessage || (searchTerm || statusFilter
                      ? `No ${entityTypePlural || "items"} match your search criteria.`
                      : `No ${entityTypePlural || "items"} have been created yet.`)}
                  </Card>
                  <Card padding="p-0" className="mt-6 shadow-none border-0 bg-transparent">
                    <CreateFirstButton
                      onClick={() => navigate(createPath || `${basePath}/create`)}
                    >
                      Create First {getSingularForm(entityTypePlural)}
                    </CreateFirstButton>
                  </Card>
                </Card>
              )
            )}
          </Card>
        </Card>
      </Card>

      <style>{`
        @keyframes settings-blob {
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
        .settings-animate-blob {
          animation: settings-blob 7s infinite;
        }
        .settings-animation-delay-2000 {
          animation-delay: 2s;
        }
        .settings-animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </Card>
  );
}

export default SettingsListView;
