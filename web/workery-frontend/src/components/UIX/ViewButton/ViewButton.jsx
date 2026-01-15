// File: src/components/UIX/ViewButton/ViewButton.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from "react";
import { Link } from "react-router";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move static default values outside component to prevent recreation with mobile optimizations
const DEFAULT_TEXT = "View";
const DEFAULT_TITLE = "View Details";
const BASE_CLASSES = "inline-flex items-center px-4 py-2 min-h-[44px] text-base font-bold rounded-lg transition-all duration-200 touch-manipulation select-none";

/**
 * Validates that a URL is a safe internal path to prevent open redirect attacks.
 * Only allows relative paths starting with "/" that don't redirect to external sites.
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if the URL is a safe internal path
 */
const isInternalUrl = (url) => {
  if (!url || typeof url !== "string") return false;

  // Must start with single forward slash (not // which is protocol-relative)
  if (!url.startsWith("/") || url.startsWith("//")) return false;

  // Block javascript: protocol attempts
  if (url.toLowerCase().includes("javascript:")) return false;

  // Block data: protocol attempts
  if (url.toLowerCase().includes("data:")) return false;

  // Block any URL that contains backslashes (potential bypass attempt)
  if (url.includes("\\")) return false;

  return true;
};

// Fallback path when URL validation fails
const FALLBACK_PATH = "/admin/dashboard";

/**
 * ViewButton Component - Performance Optimized
 * Standardized view button for list pages in Admin Settings
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static default values and base classes moved outside component
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized className string
 * - Memoized linkTo computation
 * - Prevented unnecessary re-renders
 *
 * @param {string} basePath - The base route path (e.g., "/admin/settings/tag")
 * @param {string|number} itemId - The item ID for the detail route
 * @param {string} to - Direct route path (overrides basePath/itemId)
 * @param {string} text - Optional custom text (defaults to "View")
 * @param {string} title - Optional custom title attribute (defaults to "View Details")
 * @param {string} className - Optional custom CSS classes (extends default styling)
 * @param {function} onClick - Optional click handler
 */
const ViewButton = memo(function ViewButton({
  basePath,
  itemId,
  to,
  text = DEFAULT_TEXT,
  title = DEFAULT_TITLE,
  className = "",
  onClick,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(() => {
    return getThemeClasses('view-button');
  }, [getThemeClasses]);

  // Memoize linkTo computation with security validation
  const linkTo = useMemo(() => {
    const computedUrl = to || `${basePath}/${itemId}/detail`;

    // Validate URL is a safe internal path to prevent open redirects
    if (!isInternalUrl(computedUrl)) {
      if (import.meta.env.DEV) {
        console.warn(
          "[ViewButton] Blocked potentially unsafe URL:",
          computedUrl,
          "- Redirecting to fallback path"
        );
      }
      return FALLBACK_PATH;
    }

    return computedUrl;
  }, [to, basePath, itemId]);

  // Memoize className string
  const combinedClassName = useMemo(() => {
    return `${BASE_CLASSES} ${themeClasses} ${className}`;
  }, [themeClasses, className]);

  return (
    <Link
      to={linkTo}
      className={combinedClassName}
      title={title}
      onClick={onClick}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {text}
      <ChevronRightIcon className="w-5 h-5 ml-2" />
    </Link>
  );
});

// Set display name for React DevTools
ViewButton.displayName = 'ViewButton';

export default ViewButton;