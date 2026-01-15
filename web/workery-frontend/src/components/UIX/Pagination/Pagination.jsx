// File: src/components/UI/Pagination/Pagination.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo, useCallback } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move static constant outside component to prevent recreation
const MAX_VISIBLE_PAGES = 7;

/**
 * Pagination Component - Performance Optimized
 * Page navigation controls
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static constant moved outside component
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized className strings to prevent re-concatenation
 * - Memoized page calculations and array generation
 * - Optimized event handlers with useCallback
 * - Prevented unnecessary re-renders
 *
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Page change handler
 * @param {string} className - Additional CSS classes
 */
const Pagination = memo(function Pagination({ currentPage, totalPages, onPageChange, className = "" }) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      textMuted: getThemeClasses('text-muted'),
      bgCard: getThemeClasses('bg-card'),
      inputBorder: getThemeClasses('input-border'),
      hoverBgDisabled: getThemeClasses('hover:bg-disabled'),
      paginationActive: getThemeClasses('pagination-active'),
      paginationInactive: getThemeClasses('pagination-inactive'),
    }),
    [getThemeClasses],
  );

  // Memoize page range calculation
  const pageRange = useMemo(() => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
    let endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

    if (endPage - startPage < MAX_VISIBLE_PAGES - 1) {
      startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return { pages, startPage, endPage };
  }, [currentPage, totalPages]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handlePrevious = useCallback(() => {
    onPageChange(currentPage - 1);
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    onPageChange(currentPage + 1);
  }, [currentPage, onPageChange]);

  const handleFirstPage = useCallback(() => {
    onPageChange(1);
  }, [onPageChange]);

  const handleLastPage = useCallback(() => {
    onPageChange(totalPages);
  }, [totalPages, onPageChange]);

  const handlePageClick = useCallback((page) => {
    return () => onPageChange(page);
  }, [onPageChange]);

  // Memoize navigation button className with mobile optimizations
  const navButtonClassName = useMemo(() => {
    return `px-3 py-2 min-h-[44px] text-sm font-medium ${themeClasses.textMuted} ${themeClasses.bgCard} border ${themeClasses.inputBorder} rounded-lg ${themeClasses.hoverBgDisabled} disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation select-none`;
  }, [themeClasses]);

  // Memoize standard page button className with mobile optimizations
  const standardPageButtonClassName = useMemo(() => {
    return `px-3 py-2 min-h-[44px] min-w-[44px] text-sm font-medium ${themeClasses.textMuted} ${themeClasses.bgCard} border ${themeClasses.inputBorder} rounded-lg ${themeClasses.hoverBgDisabled} touch-manipulation select-none`;
  }, [themeClasses]);

  // Memoize container className
  const containerClassName = useMemo(() => {
    return className ? `flex items-center justify-between ${className}` : 'flex items-center justify-between';
  }, [className]);

  // Memoize first page section
  const firstPageSection = useMemo(() => {
    if (pageRange.startPage <= 1) return null;

    return (
      <>
        <button onClick={handleFirstPage} className={standardPageButtonClassName}>
          1
        </button>
        {pageRange.startPage > 2 && <span className="px-2 py-2">...</span>}
      </>
    );
  }, [pageRange.startPage, handleFirstPage, standardPageButtonClassName]);

  // Memoize last page section
  const lastPageSection = useMemo(() => {
    if (pageRange.endPage >= totalPages) return null;

    return (
      <>
        {pageRange.endPage < totalPages - 1 && <span className="px-2 py-2">...</span>}
        <button onClick={handleLastPage} className={standardPageButtonClassName}>
          {totalPages}
        </button>
      </>
    );
  }, [pageRange.endPage, totalPages, handleLastPage, standardPageButtonClassName]);

  // Memoize page buttons with mobile optimizations
  const pageButtons = useMemo(() => {
    return pageRange.pages.map((page) => (
      <button
        key={page}
        onClick={handlePageClick(page)}
        className={`px-3 py-2 min-h-[44px] min-w-[44px] text-sm font-medium rounded-lg touch-manipulation select-none ${
          currentPage === page
            ? themeClasses.paginationActive
            : themeClasses.paginationInactive
        }`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {page}
      </button>
    ));
  }, [pageRange.pages, currentPage, themeClasses.paginationActive, themeClasses.paginationInactive, handlePageClick]);

  return (
    <nav className={containerClassName}>
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={navButtonClassName}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        Previous
      </button>

      <div className="flex gap-1">
        {firstPageSection}
        {pageButtons}
        {lastPageSection}
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={navButtonClassName}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        Next
      </button>
    </nav>
  );
});

// Set display name for React DevTools
Pagination.displayName = 'Pagination';

export default Pagination;
