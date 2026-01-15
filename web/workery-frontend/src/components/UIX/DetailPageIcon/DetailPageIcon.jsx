// File Path: web/frontend/src/components/UIX/DetailPageIcon/DetailPageIcon.jsx
// UIX Mobile Optimizations Applied

import React, { useMemo, memo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move constants outside component to prevent recreation
const SIZE_CLASSES = {
  md: {
    container: "p-2.5",
    icon: "h-6 w-6 sm:h-8 sm:w-8",
  },
  lg: {
    container: "p-3",
    icon: "h-8 w-8 sm:h-10 sm:w-10",
  },
  xl: {
    container: "p-4",
    icon: "h-10 w-10 sm:h-12 sm:w-12",
  },
};

/**
 * DetailPageIcon Component
 * Theme-aware icon display for detail page headers with gradient background
 * Provides consistent styling for page title icons in detail views
 *
 * @param {React.ComponentType} icon - Heroicon component to display
 * @param {string} className - Additional CSS classes for the container
 * @param {string} size - Icon size (md, lg, xl)
 * @param {boolean} gradient - Whether to use gradient background (default: true)
 */
const DetailPageIcon = memo(
  ({ icon: Icon, className = "", size = "lg" }) => {
    const { getThemeClasses } = useUIXTheme();

    // Memoize theme classes - all hooks MUST be before any conditional returns
    const themeClasses = useMemo(
      () => ({
        pageHeaderIconBg: getThemeClasses("page-header-icon-bg"),
        pageHeaderIcon: getThemeClasses("page-header-icon"),
      }),
      [getThemeClasses],
    );

    // Get size classes from constant
    const sizeConfig = SIZE_CLASSES[size] || SIZE_CLASSES.lg;

    // Memoize container classes
    const containerClasses = useMemo(
      () =>
        `
    ${sizeConfig.container}
    rounded-2xl shadow-lg mr-4 flex-shrink-0
    ${themeClasses.pageHeaderIconBg}
    ${className}
  `
          .replace(/\s+/g, " ")
          .trim(),
      [sizeConfig.container, themeClasses.pageHeaderIconBg, className],
    );

    // Memoize icon classes - themed icon color on themed background
    const iconClasses = useMemo(
      () => `${sizeConfig.icon} ${themeClasses.pageHeaderIcon}`,
      [sizeConfig.icon, themeClasses.pageHeaderIcon],
    );

    // Early return AFTER all hooks if no icon provided
    if (!Icon) {
      return null;
    }

    return (
      <div className={containerClasses}>
        <Icon className={iconClasses} />
      </div>
    );
  },
);

// Add display name for better debugging
DetailPageIcon.displayName = "DetailPageIcon";

export default DetailPageIcon;
