// File: src/components/UIX/SearchResultsPage/SearchResultsPage.jsx
// UIX Mobile Optimizations Applied
// Reusable SearchResultsPage component for displaying search results with filtering and pagination

import React, { memo, useMemo } from "react";
import {
  UIXThemeProvider,
  useUIXTheme,
  DataList,
  Breadcrumb,
  Button,
} from "../";
import {
  MagnifyingGlassIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

// Move static default values outside component to prevent recreation
const DEFAULT_PAGE_TITLE = "Search Results";

/**
 * Reusable SearchResultsPage Component - Performance Optimized
 * A complete search results page component with filtering, pagination, and theme support
 *
 * Performance optimizations:
 * - Component memoization with React.memo for both inner and outer components
 * - Static default values moved outside component
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized className strings to prevent re-concatenation
 * - Memoized sections (breadcrumb, search criteria, header, action buttons)
 * - Prevented unnecessary re-renders
 *
 * Features:
 * - Theme-aware styling that adapts to red/blue/purple/green/charcoal themes
 * - Configurable breadcrumb navigation
 * - Search criteria display with pills
 * - Action buttons for navigation
 * - DataList integration for results display
 * - Responsive design for mobile and desktop
 * - Standardized layout and spacing
 *
 * @param {Object} props
 * @param {Array} props.breadcrumbItems - Breadcrumb navigation configuration
 * @param {Array} props.searchCriteria - Array of search criteria strings to display
 * @param {string} props.pageTitle - Main page title
 * @param {Array} props.actionButtons - Action button configurations
 * @param {Array} props.results - Search results data array
 * @param {Array} props.columns - DataList column configuration
 * @param {boolean} props.isLoading - Loading state
 * @param {Object} props.errors - Error state object
 * @param {string} props.successMessage - Success message to display
 * @param {Function} props.onSuccessMessageClose - Success message close handler
 * @param {Object} props.searchFilter - Search filter configuration for DataList
 * @param {Object} props.pagination - Pagination configuration for DataList
 * @param {Object} props.emptyState - Empty state configuration for DataList
 * @param {Object} props.emptyState.isCreateAction - When true, uses green button for add/create actions
 * @param {boolean} props.showSearchCriteria - Whether to show search criteria section
 * @param {string} props.className - Additional CSS classes
 */

// Inner component that uses the theme hook
const SearchResultsPageInner = memo(function SearchResultsPageInner({
  breadcrumbItems = [],
  searchCriteria = [],
  pageTitle = DEFAULT_PAGE_TITLE,
  actionButtons = [],
  results = [],
  columns = [],
  isLoading = false,
  errors = {},
  successMessage = "",
  onSuccessMessageClose = () => {},
  searchFilter = {},
  pagination = {},
  emptyState = {},
  showSearchCriteria = true,
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      alertInfoBg: getThemeClasses('alert-info-bg'),
      alertInfoBorder: getThemeClasses('alert-info-border'),
      textPrimary: getThemeClasses('text-primary'),
      badgePrimary: getThemeClasses('badge-primary'),
    }),
    [getThemeClasses],
  );

  // Memoize className strings
  const criteriaContainerClassName = useMemo(() => {
    return `${themeClasses.alertInfoBg} border ${themeClasses.alertInfoBorder} rounded-lg p-4`;
  }, [themeClasses.alertInfoBg, themeClasses.alertInfoBorder]);

  const criteriaIconClassName = useMemo(() => {
    return `h-5 w-5 ${themeClasses.textPrimary} mr-2`;
  }, [themeClasses.textPrimary]);

  const criteriaTitleClassName = useMemo(() => {
    return `text-sm font-medium ${themeClasses.textPrimary}`;
  }, [themeClasses.textPrimary]);

  const criteriaBadgeClassName = useMemo(() => {
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${themeClasses.badgePrimary}`;
  }, [themeClasses.badgePrimary]);

  const pageTitleClassName = useMemo(() => {
    return `text-2xl font-bold ${themeClasses.textPrimary}`;
  }, [themeClasses.textPrimary]);

  // Memoize breadcrumb section
  const breadcrumbSection = useMemo(() => {
    if (breadcrumbItems.length === 0) return null;
    return <Breadcrumb items={breadcrumbItems} />;
  }, [breadcrumbItems]);

  // Memoize search criteria pills
  const criteriaPills = useMemo(() => {
    return searchCriteria.map((criteria, index) => (
      <span key={index} className={criteriaBadgeClassName}>
        {criteria}
      </span>
    ));
  }, [searchCriteria, criteriaBadgeClassName]);

  // Memoize search criteria section
  const searchCriteriaSection = useMemo(() => {
    if (!showSearchCriteria || searchCriteria.length === 0) return null;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className={criteriaContainerClassName}>
          <div className="flex items-center mb-2">
            <MagnifyingGlassIcon className={criteriaIconClassName} />
            <h3 className={criteriaTitleClassName}>Search Criteria</h3>
          </div>
          <div className="flex flex-wrap gap-2">{criteriaPills}</div>
        </div>
      </div>
    );
  }, [
    showSearchCriteria,
    searchCriteria.length,
    criteriaContainerClassName,
    criteriaIconClassName,
    criteriaTitleClassName,
    criteriaPills,
  ]);

  // Memoize action buttons
  const actionButtonsSection = useMemo(() => {
    if (actionButtons.length === 0) return null;

    return (
      <div className="flex gap-3">
        {actionButtons.map((button, index) => (
          <Button
            key={index}
            variant={button.variant || "secondary"}
            onClick={button.onClick}
            icon={button.icon}
            disabled={button.disabled}
          >
            {button.label}
          </Button>
        ))}
      </div>
    );
  }, [actionButtons]);

  return (
    <div className={className}>
      {breadcrumbSection}

      {searchCriteriaSection}

      {/* Page Header with Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex justify-between items-center">
          <h1 className={pageTitleClassName}>{pageTitle}</h1>
          {actionButtonsSection}
        </div>
      </div>

      {/* DataList Component */}
      <DataList
        data={results}
        columns={columns}
        isLoading={isLoading}
        errors={errors}
        successMessage={successMessage}
        onSuccessMessageClose={onSuccessMessageClose}
        searchFilter={searchFilter}
        pagination={pagination}
        emptyState={emptyState}
      />
    </div>
  );
});

// Set display name for React DevTools
SearchResultsPageInner.displayName = 'SearchResultsPageInner';

// Main wrapper component that provides theme context
const SearchResultsPage = memo(function SearchResultsPage({
  // Core data
  breadcrumbItems = [],
  searchCriteria = [],
  pageTitle = DEFAULT_PAGE_TITLE,
  actionButtons = [],
  results = [],
  columns = [],

  // State
  isLoading = false,
  errors = {},
  successMessage = "",
  onSuccessMessageClose = () => {},

  // DataList props
  searchFilter = {},
  pagination = {},
  emptyState = {},

  // UI options
  showSearchCriteria = true,
  className = "",
}) {
  return (
    <UIXThemeProvider>
      <SearchResultsPageInner
        breadcrumbItems={breadcrumbItems}
        searchCriteria={searchCriteria}
        pageTitle={pageTitle}
        actionButtons={actionButtons}
        results={results}
        columns={columns}
        isLoading={isLoading}
        errors={errors}
        successMessage={successMessage}
        onSuccessMessageClose={onSuccessMessageClose}
        searchFilter={searchFilter}
        pagination={pagination}
        emptyState={emptyState}
        showSearchCriteria={showSearchCriteria}
        className={className}
      />
    </UIXThemeProvider>
  );
});

// Set display name for React DevTools
SearchResultsPage.displayName = 'SearchResultsPage';

export default SearchResultsPage;

// Export helper function for reuse in other components
export { SearchResultsPage };