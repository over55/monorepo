// File Path: src/components/UIX/TypeBadge/TypeBadge.jsx
// UIX Mobile Optimizations Applied
// TypeBadge Component - Theme-aware entity type display

import React, { memo, useMemo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * TypeBadge Component
 * Theme-aware badge for displaying entity types (Executive, Management, Frontline, etc.)
 *
 * @param {Object} props
 * @param {string} props.label - The type label to display
 * @param {string} props.variant - Badge variant: 'primary', 'secondary', 'info', 'default'
 * @param {string} props.size - Badge size: 'sm', 'md', 'lg'
 * @param {string} props.className - Additional CSS classes
 */

// Static size classes
const SIZE_CLASSES = Object.freeze({
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-xs lg:text-sm",
  lg: "px-4 py-1.5 text-sm lg:text-base",
});

const TypeBadge = memo(function TypeBadge({
  label,
  variant = "info",
  size = "md",
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme class based on variant
  const themeClass = useMemo(() => {
    const variantKey = `badge-${variant}`;
    const classes = getThemeClasses(variantKey);

    // Fallback classes if theme class not found
    const fallbacks = {
      primary: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      secondary: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
      info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      warning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };

    return classes || fallbacks[variant] || fallbacks.default;
  }, [variant, getThemeClasses]);

  // Memoize size class
  const sizeClass = useMemo(
    () => SIZE_CLASSES[size] || SIZE_CLASSES.md,
    [size],
  );

  // Memoize final badge classes
  const badgeClasses = useMemo(
    () =>
      `inline-flex items-center rounded-full font-medium ${sizeClass} ${themeClass} ${className}`.trim(),
    [sizeClass, themeClass, className],
  );

  if (!label) return null;

  return (
    <span className={badgeClasses} role="status">
      {label}
    </span>
  );
});

TypeBadge.displayName = "TypeBadge";

export default TypeBadge;
