// File: src/components/UIX/SearchCriteriaPills/SearchCriteriaPills.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move static default values outside component to prevent recreation
const DEFAULT_TITLE = "Search Criteria";

/**
 * SearchCriteriaPills Component - Performance Optimized
 * Display search criteria as pills with icons and values
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static default values moved outside component
 * - Memoized className strings to prevent re-concatenation
 * - Memoized title section
 * - Memoized pills rendering
 * - Theme-aware colors (no hardcoded values)
 * - Prevented unnecessary re-renders
 *
 * @param {Array} criteria - Array of criteria objects: [{ icon, label, value }]
 * @param {string} className - Additional CSS classes for container
 * @param {string} pillClassName - Additional CSS classes for individual pills
 * @param {boolean} showTitle - Whether to show the title
 * @param {string} title - Title text
 */
const SearchCriteriaPills = memo(function SearchCriteriaPills({
  criteria = [],
  className = "",
  pillClassName = "",
  showTitle = true,
  title = DEFAULT_TITLE,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary") || "text-gray-800 dark:text-gray-100",
      pillBg: getThemeClasses("pill-bg") || "bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800",
      pillText: getThemeClasses("pill-text") || "text-blue-800 dark:text-blue-200",
      pillBorder: getThemeClasses("pill-border") || "border-blue-200 dark:border-blue-700",
    }),
    [getThemeClasses],
  );

  // Memoize container className - all hooks MUST be before any conditional returns
  const containerClassName = useMemo(() => {
    return className ? `mb-6 ${className}` : "mb-6";
  }, [className]);

  // Memoize pill base className
  const pillBaseClassName = useMemo(() => {
    const baseClasses = `inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-semibold ${themeClasses.pillBg} ${themeClasses.pillText} border ${themeClasses.pillBorder}`;
    return pillClassName ? `${baseClasses} ${pillClassName}` : baseClasses;
  }, [pillClassName, themeClasses]);

  // Memoize title section
  const titleSection = useMemo(() => {
    if (!showTitle) return null;

    return (
      <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-3`}>
        {title}
      </h3>
    );
  }, [showTitle, title, themeClasses.textPrimary]);

  // Memoize pills rendering
  const pillsList = useMemo(() => {
    if (!criteria || criteria.length === 0) return [];

    return criteria.map((criteriaItem, index) => {
      const Icon = criteriaItem.icon;
      return (
        <span key={criteriaItem.label || index} className={pillBaseClassName}>
          {Icon && <Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />}
          <span className="truncate max-w-[150px] sm:max-w-none">
            {criteriaItem.label}: "{criteriaItem.value}"
          </span>
        </span>
      );
    });
  }, [criteria, pillBaseClassName]);

  // Early return AFTER all hooks for empty criteria
  if (!criteria || criteria.length === 0) {
    return null;
  }

  return (
    <div className={containerClassName}>
      {titleSection}
      <div className="flex flex-wrap gap-2 sm:gap-3">{pillsList}</div>
    </div>
  );
});

// Set display name for React DevTools
SearchCriteriaPills.displayName = "SearchCriteriaPills";

export default SearchCriteriaPills;
