// File: src/components/UIX/SearchResultsCard/SearchResultsCard.jsx
// Reusable search results card component for wizard search results pages

import React, { memo, useMemo, useCallback } from "react";
import { Link } from "react-router";
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";
import FormCard from "../FormCard/FormCard.jsx";
import Spinner from "../Loading/Spinner.jsx";

/**
 * SearchResultsCard Component
 * A reusable card component for displaying search results with filters,
 * pagination, empty state, and alternative actions.
 *
 * @param {Array} searchParams - Array of {label, value} for displaying search terms
 * @param {React.Node} filters - Filter components to render
 * @param {React.Node} children - Results content (grid of cards)
 * @param {boolean} isLoading - Loading state
 * @param {boolean} isEmpty - Whether results are empty
 * @param {Object} emptyState - Empty state configuration
 * @param {React.Component} emptyState.icon - Icon component
 * @param {string} emptyState.title - Title text
 * @param {string} emptyState.message - Message text
 * @param {string} emptyState.backLink - Link for "Try different search"
 * @param {Object} pagination - Pagination configuration
 * @param {number} pagination.pageSize - Current page size
 * @param {function} pagination.onPageSizeChange - Page size change handler
 * @param {function} pagination.onNext - Next page handler
 * @param {function} pagination.onPrevious - Previous page handler
 * @param {boolean} pagination.hasNext - Has next page
 * @param {boolean} pagination.hasPrevious - Has previous page
 * @param {Object} alternativeAction - Alternative action configuration
 * @param {string} alternativeAction.searchAgainLink - Link for search again button
 * @param {string} alternativeAction.createLabel - Label for create button
 * @param {function} alternativeAction.onCreate - Create button handler
 * @param {React.Component} alternativeAction.createIcon - Icon for create button
 * @param {string} backLink - Back link URL
 * @param {string} backLabel - Back link label
 */
const SearchResultsCard = memo(function SearchResultsCard({
  searchParams = [],
  filters,
  children,
  isLoading = false,
  isEmpty = false,
  emptyState = {},
  pagination = {},
  alternativeAction = {},
  backLink,
  backLabel = "Back to Search",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      textMuted: getThemeClasses("text-muted"),
      bgCard: getThemeClasses("bg-card") || "bg-white dark:bg-gray-800",
      borderLight: getThemeClasses("border-light") || "border-gray-200",
    }),
    [getThemeClasses]
  );

  // Default empty state values
  const {
    icon: EmptyIcon = ClipboardDocumentListIcon,
    title: emptyTitle = "No Results Found",
    message: emptyMessage = "No results found matching your search criteria.",
    backLink: emptyBackLink = backLink,
  } = emptyState;

  // Default alternative action values
  const {
    searchAgainLink = backLink,
    createLabel = "Create New",
    onCreate,
    createIcon: CreateIcon = UserPlusIcon,
  } = alternativeAction;

  // Pagination handlers
  const {
    pageSize = 50,
    onPageSizeChange,
    onNext,
    onPrevious,
    hasNext = false,
    hasPrevious = false,
  } = pagination;

  const handlePageSizeChange = useCallback(
    (e) => {
      if (onPageSizeChange) {
        onPageSizeChange(parseInt(e.target.value));
      }
    },
    [onPageSizeChange]
  );

  return (
    <FormCard maxWidth="7xl">
      {/* Search Parameters & Filters */}
      <div className="mb-8 pb-8 border-b-2 border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-end gap-5">
          {/* Current Search Parameters */}
          {searchParams.length > 0 && (
            <div className="flex-shrink-0">
              <p className="text-base sm:text-lg font-medium text-gray-500 mb-2">
                Search Terms
              </p>
              <div className="flex flex-wrap gap-2">
                {searchParams.map((param, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-4 py-2 rounded-full text-base sm:text-lg font-medium bg-blue-100 text-blue-800"
                  >
                    {param.label}: {param.value}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          {filters && (
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {filters}
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <Spinner text="Searching..." />
      ) : isEmpty ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl">
          <EmptyIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
            {emptyTitle}
          </h3>
          <p className="text-base sm:text-lg text-gray-600 mb-5">
            {emptyMessage}
          </p>
          {emptyBackLink && (
            <Link
              to={emptyBackLink}
              className="inline-flex items-center text-base sm:text-lg text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Try a different search
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Results Content */}
          {children}

          {/* Pagination */}
          {(onPageSizeChange || hasNext || hasPrevious) && (
            <div className="pt-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              {onPageSizeChange && (
                <div className="flex items-center">
                  <label className="text-base sm:text-lg text-gray-700 mr-3">
                    Show
                  </label>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="px-4 py-2.5 text-base sm:text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-base sm:text-lg text-gray-700 ml-3">
                    per page
                  </span>
                </div>
              )}
              <div className="flex gap-3">
                {hasPrevious && onPrevious && (
                  <button
                    onClick={onPrevious}
                    className="inline-flex items-center px-5 py-3 text-base sm:text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeftIcon className="w-5 h-5 mr-2" />
                    Previous
                  </button>
                )}
                {hasNext && onNext && (
                  <button
                    onClick={onNext}
                    className="inline-flex items-center px-5 py-3 text-base sm:text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Next
                    <ChevronRightIcon className="w-5 h-5 ml-2" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* OR Divider */}
      {(searchAgainLink || onCreate) && (
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-6 bg-white text-lg sm:text-xl font-medium text-gray-500">
              OR
            </span>
          </div>
        </div>
      )}

      {/* Alternative Actions Section */}
      {(searchAgainLink || onCreate) && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-8 text-center">
          <CreateIcon className="w-16 h-16 mx-auto text-green-600 mb-4" />
          <p className="text-lg sm:text-xl text-gray-700 mb-5 font-medium">
            Can't find what you're looking for?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {searchAgainLink && (
              <Link to={searchAgainLink}>
                <button className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-base sm:text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                  Search Again
                </button>
              </Link>
            )}
            {onCreate && (
              <button
                onClick={onCreate}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 text-base sm:text-lg font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
              >
                <CreateIcon className="w-5 h-5 mr-2" />
                {createLabel}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Back Link */}
      {backLink && (
        <div className="pt-6">
          <Link
            to={backLink}
            className="inline-flex items-center text-base sm:text-lg text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            {backLabel}
          </Link>
        </div>
      )}
    </FormCard>
  );
});

SearchResultsCard.displayName = "SearchResultsCard";

export default SearchResultsCard;
