// File Path: web/frontend/src/components/UIX/DataList/DataList.jsx
// UIX Mobile Optimizations Applied
// Reusable DataList component - Performance Optimized

import React, { memo, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { SearchFilter, Alert, DetailPageIcon } from "../";
import Button from "../Button/Button";
import { ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * DataList Component - Performance Optimized
 * A complete data listing component with search, filters, table, and pagination
 *
 * Performance & Theme Optimizations:
 * - Component memoization with React.memo
 * - All colors from theme system (no hardcoded values)
 * - Proper key generation using item.id
 * - Memoized theme classes
 */

// Table Cell Component - Separated for performance
const TableCell = memo(function TableCell({
  column,
  item,
  rowIndex,
  themeClasses,
}) {
  // Memoize cell content
  const cellContent = useMemo(() => {
    // Custom render function - pass full item as first argument for intuitive access
    if (typeof column.render === "function") {
      return column.render(item, rowIndex);
    }

    // Get the value
    let value = null;
    if (column.accessor) {
      value = item[column.accessor];
    } else if (column.key) {
      value = item[column.key];
    } else if (column.field) {
      value = item[column.field];
    } else if (column.dataIndex) {
      value = item[column.dataIndex];
    }

    // Handle special column types
    if (column.type === "link" && value) {
      const linkPath =
        typeof column.linkPath === "function"
          ? column.linkPath(item)
          : column.linkPath?.replace(":id", item.id);

      return (
        <Link
          to={linkPath}
          className={`${themeClasses.textPrimary} ${themeClasses.linkHover} font-medium`}
        >
          {value}
        </Link>
      );
    }

    if (column.type === "action" && column.actionConfig) {
      const {
        label,
        linkPath,
        className: actionClassName,
      } = column.actionConfig;
      const path =
        typeof linkPath === "function"
          ? linkPath(item)
          : linkPath?.replace(":id", item.id);

      return (
        <Link
          to={path}
          className={
            actionClassName ||
            `inline-flex items-center px-4 py-2 min-h-[44px] text-base font-bold ${themeClasses.viewButton} rounded-lg transition-all duration-200 touch-manipulation select-none`
          }
          title={label}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {label}
          <ChevronRightIcon className="w-5 h-5 ml-2" />
        </Link>
      );
    }

    // Return the value or placeholder
    return value !== null && value !== undefined ? (
      <span className={themeClasses.textPrimary}>{value}</span>
    ) : (
      <span className={`${themeClasses.textMuted} italic`}>—</span>
    );
  }, [column, item, rowIndex, themeClasses]);

  // Memoize cell alignment classes
  const alignmentClass = useMemo(() => {
    if (column.align === "center") return "text-center";
    if (column.align === "right") return "text-right";
    return "text-left";
  }, [column.align]);

  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-lg align-middle ${alignmentClass}`}
    >
      {cellContent}
    </td>
  );
});

TableCell.displayName = "TableCell";

// Table Row Component - Separated for performance
const TableRow = memo(function TableRow({
  item,
  columns,
  rowIndex,
  themeClasses,
}) {
  return (
    <tr
      className={`${themeClasses.tableRowHover} transition-all duration-200 border-b ${themeClasses.borderLight}`}
    >
      {columns.map((column, colIndex) => (
        <TableCell
          key={column.key || column.accessor || column.field || `col-${colIndex}`}
          column={column}
          item={item}
          rowIndex={rowIndex}
          themeClasses={themeClasses}
        />
      ))}
    </tr>
  );
});

TableRow.displayName = "TableRow";

// Main DataList Component
const DataList = memo(
  function DataList({
    // Data props
    data = [],
    columns = [],
    isLoading = false,
    errors = {},
    successMessage = "",
    onSuccessMessageClose = () => {},

    // Search filter props
    searchFilter = {},

    // Pagination props
    pagination = {},

    // Empty state props
    emptyState = {},

    // Header props
    header = {},

    // Style props
    className = "",
  }) {
    const { getThemeClasses } = useUIXTheme();

    // Memoize theme classes
    const themeClasses = useMemo(
      () => ({
        borderPrimary: getThemeClasses("border-primary"),
        borderLight: getThemeClasses("border-light") || "border-gray-100 dark:border-gray-700",
        cardBorder: getThemeClasses("card-border") || "border-gray-200 dark:border-gray-700",
        borderDefault: getThemeClasses("border-default") || "border-gray-200 dark:border-gray-600",
        bgGradientPrimary: getThemeClasses("bg-gradient-primary"),
        bgGradientSecondary: getThemeClasses("bg-gradient-secondary"),
        bgCard: getThemeClasses("bg-card") || "bg-white dark:bg-gray-800",
        bgPage: getThemeClasses("bg-page") || "bg-gray-50 dark:bg-gray-950",
        tableHeaderBg: getThemeClasses("table-header-bg"),
        tableRowHover: getThemeClasses("table-row-hover"),
        viewButton: getThemeClasses("view-button"),
        badgeSecondary: getThemeClasses("badge-secondary"),
        textPrimary: getThemeClasses("text-primary") || "text-gray-900 dark:text-gray-100",
        textSecondary: getThemeClasses("text-secondary") || "text-gray-700 dark:text-gray-300",
        textMuted: getThemeClasses("text-muted") || "text-gray-400 dark:text-gray-500",
        linkPrimary: getThemeClasses("link-primary") || "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300",
        linkHover: getThemeClasses("link-hover") || "hover:text-blue-600 dark:hover:text-blue-400",
        buttonBg: getThemeClasses("bg-card") || "bg-white dark:bg-gray-800",
        buttonHover: getThemeClasses("button-hover") || "hover:bg-gray-50 dark:hover:bg-gray-700",
        // Page header icon classes
        pageHeaderIconBg: getThemeClasses("page-header-icon-bg"),
        pageHeaderIcon: getThemeClasses("page-header-icon"),
        // Decorative blob colors
        blobPrimary: getThemeClasses("blob-primary") || "bg-purple-200 dark:bg-purple-900",
        blobSecondary: getThemeClasses("blob-secondary") || "bg-yellow-200 dark:bg-yellow-900",
        blobTertiary: getThemeClasses("blob-tertiary") || "bg-pink-200 dark:bg-pink-900",
      }),
      [getThemeClasses],
    );

    // Extract and memoize search filter props
    const searchFilterProps = useMemo(
      () => {
        const props = {
          searchTerm: searchFilter.searchTerm || "",
          tempSearchTerm: searchFilter.tempSearchTerm || "",
          onSearchTermChange: searchFilter.onSearchTermChange || (() => {}),
          onSearch: searchFilter.onSearch || (() => {}),
          searchPlaceholder: searchFilter.searchPlaceholder || "Search...",
          statusOptions: searchFilter.statusOptions || [],
          statusFilter: searchFilter.statusFilter || "",
          onStatusFilterChange: searchFilter.onStatusFilterChange || (() => {}),
          typeOptions: searchFilter.typeOptions,
          typeFilter: searchFilter.typeFilter || "",
          onTypeFilterChange: searchFilter.onTypeFilterChange || (() => {}),
          typeFilterLabel: searchFilter.typeFilterLabel || "Type",
          sortOptions: searchFilter.sortOptions || [],
          sortValue: searchFilter.sortValue || "",
          onSortChange: searchFilter.onSortChange || (() => {}),
          pageSizeOptions: searchFilter.pageSizeOptions || [10, 25, 50, 100],
          pageSize: searchFilter.pageSize || 25,
          onPageSizeChange: searchFilter.onPageSizeChange || (() => {}),
          onClearFilters: searchFilter.onClearFilters || (() => {}),
          onRefresh: searchFilter.onRefresh || (() => {}),
        };
        return props;
      },
      [searchFilter],
    );

    // Extract and memoize pagination props
    const paginationProps = useMemo(
      () => ({
        currentPage: pagination.currentPage || 1,
        totalCount: pagination.totalCount || 0,
        hasNextPage: pagination.hasNextPage || false,
        onPageChange: pagination.onPageChange || (() => {}),
      }),
      [pagination],
    );

    // Extract and memoize empty state props
    const emptyStateProps = useMemo(
      () => ({
        icon: emptyState.icon || PlusIcon,
        title: emptyState.title || "No Items Found",
        description:
          emptyState.description || "No items have been created yet.",
        actionLabel: emptyState.actionLabel || "Create First Item",
        onActionClick: emptyState.onActionClick || (() => {}),
        showAction:
          emptyState.showAction !== undefined ? emptyState.showAction : true,
        isCreateAction: emptyState.isCreateAction || false,
      }),
      [emptyState],
    );

    // Extract and memoize header props
    const headerProps = useMemo(
      () => ({
        icon: header.icon,
        title: header.title,
        actions: header.actions || [],
        showHeader: header.showHeader || false,
      }),
      [header],
    );

    // Memoize pagination handlers
    const handlePreviousPage = useCallback(() => {
      paginationProps.onPageChange(paginationProps.currentPage - 1);
    }, [paginationProps]);

    const handleNextPage = useCallback(() => {
      paginationProps.onPageChange(paginationProps.currentPage + 1);
    }, [paginationProps]);

    // Loading state
    if (isLoading && (!data || data.length === 0)) {
      return (
        <div className={`min-h-screen ${themeClasses.bgPage} flex items-center justify-center`}>
          <div className="text-center">
            <div
              className={`animate-spin rounded-full h-12 w-12 border-b-2 ${themeClasses.borderPrimary} mx-auto`}
            ></div>
            <p className={`mt-4 ${themeClasses.textSecondary}`}>Loading...</p>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`min-h-screen ${themeClasses.bgGradientPrimary} ${className}`}
      >
        {/* Decorative background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-40 -right-40 w-80 h-80 ${themeClasses.blobPrimary} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob`}></div>
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${themeClasses.blobSecondary} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000`}></div>
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 ${themeClasses.blobTertiary} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000`}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Success Message */}
          {successMessage && (
            <Alert
              type="success"
              message={successMessage}
              onClose={onSuccessMessageClose}
              className="mb-6 sm:mb-8"
            />
          )}

          {/* Error Messages */}
          {Object.keys(errors).length > 0 && (
            <Alert
              type="error"
              message={Object.values(errors)[0]}
              onClose={() => {}}
              className="mb-6 sm:mb-8"
            />
          )}

          {/* Main Content Layout */}
          <div className="w-full">
            <div className={`${themeClasses.bgCard} shadow-xl rounded-2xl overflow-hidden border-2 ${themeClasses.cardBorder} hover:shadow-2xl transition-shadow duration-300`}>
              {/* Header Section */}
              {headerProps.showHeader && (
                <div className={`px-6 sm:px-8 py-6 border-b ${themeClasses.borderDefault} ${themeClasses.bgCard}`}>
                  <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start">
                        {headerProps.icon && (
                          <div
                            className={`p-3 rounded-2xl shadow-lg mr-4 flex-shrink-0 ${themeClasses.pageHeaderIconBg}`}
                          >
                            <headerProps.icon className={`h-8 w-8 sm:h-10 sm:w-10 ${themeClasses.pageHeaderIcon}`} />
                          </div>
                        )}
                        <div className="text-center lg:text-left">
                          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${themeClasses.textPrimary} leading-tight`}>
                            {headerProps.title}
                          </h1>
                        </div>
                      </div>
                    </div>
                    {/* Action buttons - stacked on mobile, inline on larger screens */}
                    <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                      {headerProps.actions.map((action, index) => (
                        <div key={index} className="w-full sm:w-auto">{action}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Search Filter Component */}
              <SearchFilter {...searchFilterProps} />

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div
                    className={`animate-spin rounded-full h-12 w-12 border-b-2 ${themeClasses.borderPrimary}`}
                  ></div>
                  <span className={`ml-3 ${themeClasses.textSecondary}`}>Loading...</span>
                </div>
              ) : data && data.length > 0 ? (
                <>
                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className={`w-full min-w-full divide-y ${themeClasses.borderDefault}`}>
                      <thead className={themeClasses.tableHeaderBg}>
                        <tr>
                          {columns.map((column, index) => (
                            <th
                              key={column.key || column.accessor || column.field || `header-${index}`}
                              className={`px-6 py-4 text-base font-bold text-white uppercase tracking-wider ${
                                column.align === "center"
                                  ? "text-center"
                                  : column.align === "right"
                                    ? "text-right"
                                    : "text-left"
                              }`}
                            >
                              {column.header ||
                                column.label ||
                                column.title ||
                                ""}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className={`${themeClasses.bgCard} divide-y ${themeClasses.borderDefault}`}>
                        {data.map((item, rowIndex) => (
                          <TableRow
                            key={item.id != null ? `item-${item.id}` : `row-${rowIndex}`}
                            item={item}
                            columns={columns}
                            rowIndex={rowIndex}
                            themeClasses={themeClasses}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {paginationProps.totalCount > searchFilterProps.pageSize && (
                    <div
                      className={`px-6 py-4 flex items-center justify-between border-t ${themeClasses.borderDefault} ${themeClasses.bgGradientPrimary}`}
                    >
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={handlePreviousPage}
                          disabled={paginationProps.currentPage === 1}
                          className={`relative inline-flex items-center px-5 py-3 min-h-[44px] border ${themeClasses.borderDefault} text-sm font-medium rounded-xl ${themeClasses.textSecondary} ${themeClasses.buttonBg} ${themeClasses.buttonHover} hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation select-none`}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          Previous
                        </button>
                        <button
                          onClick={handleNextPage}
                          disabled={!paginationProps.hasNextPage}
                          className={`ml-3 relative inline-flex items-center px-5 py-3 min-h-[44px] border ${themeClasses.borderDefault} text-sm font-medium rounded-xl ${themeClasses.textSecondary} ${themeClasses.buttonBg} ${themeClasses.buttonHover} hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation select-none`}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className={`text-sm ${themeClasses.textSecondary}`}>
                            Showing{" "}
                            <span className="font-medium">{data.length}</span>{" "}
                            results
                            {paginationProps.totalCount > 0 && (
                              <>
                                {" "}
                                of{" "}
                                <span className="font-medium">
                                  {paginationProps.totalCount}
                                </span>{" "}
                                total
                              </>
                            )}
                          </p>
                        </div>
                        <div>
                          <nav
                            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                            aria-label="Pagination"
                          >
                            <button
                              onClick={handlePreviousPage}
                              disabled={paginationProps.currentPage === 1}
                              className={`relative inline-flex items-center px-4 py-3 min-h-[44px] rounded-l-xl border ${themeClasses.borderDefault} ${themeClasses.buttonBg} text-sm font-medium ${themeClasses.textMuted} ${themeClasses.buttonHover} hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation select-none`}
                              style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                              Previous
                            </button>
                            <span
                              className={`relative inline-flex items-center px-5 py-3 min-h-[44px] border-t border-b ${themeClasses.borderDefault} ${themeClasses.badgeSecondary} text-sm font-medium`}
                            >
                              Page {paginationProps.currentPage}
                            </span>
                            <button
                              onClick={handleNextPage}
                              disabled={!paginationProps.hasNextPage}
                              className={`relative inline-flex items-center px-4 py-3 min-h-[44px] rounded-r-xl border ${themeClasses.borderDefault} ${themeClasses.buttonBg} text-sm font-medium ${themeClasses.textMuted} ${themeClasses.buttonHover} hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation select-none`}
                              style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                              Next
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Empty State */
                <div className="text-center py-12">
                  <div className="mx-auto w-fit mb-4">
                    <DetailPageIcon icon={emptyStateProps.icon} size="xl" />
                  </div>
                  <h3 className={`mt-2 text-lg font-semibold ${themeClasses.textPrimary}`}>
                    {emptyStateProps.title}
                  </h3>
                  <p className={`mt-1 text-sm ${themeClasses.textMuted}`}>
                    {emptyStateProps.description}
                  </p>
                  {emptyStateProps.showAction &&
                    emptyStateProps.onActionClick && (
                      <div className="mt-6">
                        <Button
                          variant={
                            emptyStateProps.isCreateAction
                              ? "success"
                              : "primary"
                          }
                          size="lg"
                          onClick={emptyStateProps.onActionClick}
                          icon={PlusIcon}
                        >
                          {emptyStateProps.actionLabel}
                        </Button>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison - only re-render when important props change
    // Note: We avoid JSON.stringify for props that may contain React components,
    // functions, or circular references. Use shallow equality instead.

    // Simple value comparisons
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.className !== nextProps.className) return false;
    if (prevProps.successMessage !== nextProps.successMessage) return false;

    // Data comparison (length and reference)
    if (prevProps.data?.length !== nextProps.data?.length) return false;
    if (prevProps.data !== nextProps.data) return false;

    // Columns comparison (length and reference - columns contain render functions)
    if (prevProps.columns?.length !== nextProps.columns?.length) return false;
    if (prevProps.columns !== nextProps.columns) return false;

    // Errors comparison (shallow)
    if (prevProps.errors !== nextProps.errors) return false;

    // SearchFilter comparison (reference only - contains functions)
    if (prevProps.searchFilter !== nextProps.searchFilter) return false;

    // Pagination comparison (reference only - contains functions)
    if (prevProps.pagination !== nextProps.pagination) return false;

    // EmptyState comparison (reference only - contains icon components)
    if (prevProps.emptyState !== nextProps.emptyState) return false;

    // Header comparison (reference only - may contain components)
    if (prevProps.header !== nextProps.header) return false;

    return true;
  },
);

DataList.displayName = "DataList";

export default DataList;
