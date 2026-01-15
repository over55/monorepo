// File: src/components/UIX/SearchFilter/SearchFilter.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";
import Card from "../Card/Card.jsx";
import Button from "../Button/Button.jsx";
import Input from "../Input/Input.jsx";
import Select from "../Select/Select.jsx";

// Move static default values outside component to prevent recreation
const DEFAULT_SEARCH_PLACEHOLDER = "Search...";
const DEFAULT_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "1", label: "Active" },
  { value: "2", label: "Inactive" },
];
const DEFAULT_SORT_OPTIONS = [
  { value: "name,ASC", label: "Name (A-Z)" },
  { value: "name,DESC", label: "Name (Z-A)" },
  { value: "created_at,DESC", label: "Created Date (Newest)" },
  { value: "created_at,ASC", label: "Created Date (Oldest)" },
];
const DEFAULT_PAGE_SIZE_OPTIONS = [
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
];

/**
 * SearchFilter Component - Performance Optimized
 * Reusable search and filter widget for list pages
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static default values moved outside component
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized className strings to prevent re-concatenation
 * - Optimized event handlers with useCallback
 * - Memoized sections (header, search input, filters, selects)
 * - Prevented unnecessary re-renders
 *
 * @param {string} searchTerm - Current search term
 * @param {string} tempSearchTerm - Temporary search term (for input)
 * @param {function} onSearchTermChange - Handler for search term changes
 * @param {function} onSearch - Handler for search submission
 * @param {string} searchPlaceholder - Placeholder text for search input
 * @param {Array} statusOptions - Array of {value, label} for status filter
 * @param {string} statusFilter - Current status filter value
 * @param {function} onStatusFilterChange - Handler for status filter changes
 * @param {Array} typeOptions - Array of {value, label} for type filter (optional)
 * @param {string} typeFilter - Current type filter value (optional)
 * @param {function} onTypeFilterChange - Handler for type filter changes (optional)
 * @param {string} typeFilterLabel - Label for the type filter (default: "Type")
 * @param {Array} sortOptions - Array of {value, label} for sort options
 * @param {string} sortValue - Current sort value (field,order)
 * @param {function} onSortChange - Handler for sort changes
 * @param {Array} pageSizeOptions - Array of page size values
 * @param {number} pageSize - Current page size
 * @param {function} onPageSizeChange - Handler for page size changes
 * @param {function} onClearFilters - Handler for clearing all filters
 * @param {function} onRefresh - Handler for refresh action
 * @param {string} className - Additional CSS classes
 */
const SearchFilter = memo(function SearchFilter({
  tempSearchTerm,
  onSearchTermChange,
  onSearch,
  searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
  statusOptions = DEFAULT_STATUS_OPTIONS,
  statusFilter,
  onStatusFilterChange,
  typeOptions,
  typeFilter,
  onTypeFilterChange,
  typeFilterLabel = "Type",
  sortOptions = DEFAULT_SORT_OPTIONS,
  sortValue,
  onSortChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  pageSize,
  onPageSizeChange,
  onClearFilters,
  onRefresh,
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      searchBg: getThemeClasses('search-bg'),
      borderSecondary: getThemeClasses('border-secondary'),
      textPrimary: getThemeClasses('text-primary'),
      textSecondary: getThemeClasses('text-secondary'),
    }),
    [getThemeClasses],
  );

  // Memoize event handlers to prevent unnecessary re-renders
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && onSearch) {
        e.preventDefault();
        onSearch();
      }
    },
    [onSearch],
  );

  const handleSearchTermChange = useCallback(
    (value) => {
      if (onSearchTermChange) {
        onSearchTermChange(value);
      }
    },
    [onSearchTermChange],
  );

  const handleStatusChange = useCallback(
    (value) => {
      if (onStatusFilterChange) {
        onStatusFilterChange(value);
      }
    },
    [onStatusFilterChange],
  );

  const handleTypeChange = useCallback(
    (value) => {
      if (onTypeFilterChange) {
        onTypeFilterChange(value);
      }
    },
    [onTypeFilterChange],
  );

  const handleSortChange = useCallback(
    (value) => {
      if (onSortChange) {
        onSortChange(value);
      }
    },
    [onSortChange],
  );

  const handlePageSizeChange = useCallback(
    (value) => {
      if (onPageSizeChange) {
        onPageSizeChange(Number(value));
      }
    },
    [onPageSizeChange],
  );

  // Memoize container className
  const containerClassName = useMemo(() => {
    return `px-6 py-4 ${themeClasses.searchBg} border-b ${themeClasses.borderSecondary} !rounded-none ${className}`.trim();
  }, [className, themeClasses.searchBg, themeClasses.borderSecondary]);

  // Memoize grid className based on statusOptions and typeOptions
  // Use explicit Tailwind classes (dynamic class names don't work with Tailwind)
  const gridClassName = useMemo(() => {
    const hasStatus = statusOptions && statusOptions.length > 0;
    const hasType = typeOptions && typeOptions.length > 0;
    // Base columns: search, sort, page size = 3
    // + 1 for status if shown, + 1 for type if shown
    const columns = 3 + (hasStatus ? 1 : 0) + (hasType ? 1 : 0);

    // Map column count to explicit Tailwind grid classes
    const gridColsMap = {
      3: "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3",
      4: "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4",
      5: "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    };

    return gridColsMap[columns] || gridColsMap[3];
  }, [statusOptions, typeOptions]);

  // Normalize page size options to always have value/label format
  const normalizedPageSizeOptions = useMemo(() => {
    return pageSizeOptions.map((option) => {
      if (typeof option === 'number') {
        return { value: option, label: String(option) };
      }
      return option;
    });
  }, [pageSizeOptions]);

  return (
    <Card padding="p-0" className={containerClassName}>
      {/* Header with title and actions */}
      <Card padding="p-0" className="flex items-center justify-between mb-4 shadow-none border-0 bg-transparent">
        <Card padding="p-0" className={`text-sm font-medium ${themeClasses.textPrimary} flex items-center shadow-none border-0 bg-transparent`}>
          <FunnelIcon className={`w-4 h-4 mr-2 ${themeClasses.textSecondary}`} />
          Filter & Search
        </Card>
        <Card padding="p-0" className="flex items-center gap-2 shadow-none border-0 bg-transparent">
          {onClearFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              icon={XMarkIcon}
              aria-label="Clear all filters"
              title="Clear all filters"
            >
              Clear Filters
            </Button>
          )}
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              icon={ArrowPathIcon}
              aria-label="Refresh data"
              title="Refresh data"
            >
              Refresh
            </Button>
          )}
        </Card>
      </Card>

      {/* Filter Controls Grid */}
      <Card padding="p-0" className={`${gridClassName} shadow-none border-0 bg-transparent`}>
        {/* Search Input */}
        <Input
          label="Search"
          id="search-filter-input"
          name="search"
          type="text"
          value={tempSearchTerm}
          onChange={handleSearchTermChange}
          placeholder={searchPlaceholder}
          onKeyPress={handleKeyPress}
          size="md"
          rightIcon={
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearch}
              aria-label="Search"
              title="Search"
              className="p-1"
            >
              <MagnifyingGlassIcon className={`w-5 h-5 ${themeClasses.textSecondary}`} />
            </Button>
          }
        />

        {/* Status Filter (optional) */}
        {statusOptions && statusOptions.length > 0 && (
          <Select
            label="Status"
            id="search-filter-status"
            name="status"
            value={statusFilter}
            onChange={handleStatusChange}
            options={statusOptions}
            size="md"
          />
        )}

        {/* Type Filter (optional) */}
        {typeOptions && typeOptions.length > 0 && (
          <Select
            label={typeFilterLabel}
            id="search-filter-type"
            name="type"
            value={typeFilter}
            onChange={handleTypeChange}
            options={typeOptions}
            size="md"
          />
        )}

        {/* Sort Options */}
        <Select
          label="Sort By"
          id="search-filter-sort"
          name="sort"
          value={sortValue}
          onChange={handleSortChange}
          options={sortOptions}
          size="md"
        />

        {/* Items per page */}
        <Select
          label="Items per page"
          id="search-filter-pagesize"
          name="pageSize"
          value={pageSize}
          onChange={handlePageSizeChange}
          options={normalizedPageSizeOptions}
          size="md"
        />
      </Card>
    </Card>
  );
});

// Set display name for React DevTools
SearchFilter.displayName = 'SearchFilter';

export default SearchFilter;
