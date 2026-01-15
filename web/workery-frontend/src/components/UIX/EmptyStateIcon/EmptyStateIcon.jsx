// File Path: web/frontend/src/components/UIX/EmptyStateIcon/EmptyStateIcon.jsx
// UIX Mobile Optimizations Applied

import React, { useMemo, memo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";
import Card from "../Card/Card.jsx";

// Move constants outside component to prevent recreation
const SIZE_CLASSES = {
  sm: {
    container: "p-2",
    icon: "h-8 w-8",
  },
  md: {
    container: "p-2.5",
    icon: "h-10 w-10",
  },
  lg: {
    container: "p-3",
    icon: "h-12 w-12",
  },
  xl: {
    container: "p-4",
    icon: "h-16 w-16",
  },
};

/**
 * EmptyStateIcon Component
 * Theme-aware icon display for empty states with gradient background
 * Provides consistent styling for "no items found" scenarios
 *
 * @param {React.ComponentType} icon - Heroicon component to display
 * @param {string} className - Additional CSS classes for the container
 * @param {string} size - Icon size (sm, md, lg, xl)
 */
const EmptyStateIcon = memo(
  ({ icon: Icon, className = "", size = "lg", ...props }) => {
    const { getThemeClasses } = useUIXTheme();

    // Get size configuration from constant
    const sizeConfig = SIZE_CLASSES[size] || SIZE_CLASSES.lg;

    // Memoize theme classes
    const themeClasses = useMemo(
      () => ({
        bgGradientSecondary: getThemeClasses("bg-gradient-secondary"),
      }),
      [getThemeClasses],
    );

    // Memoize container classes - all hooks MUST be before any conditional returns
    const containerClasses = useMemo(
      () =>
        `${sizeConfig.container} rounded-2xl shadow-lg mx-auto w-fit mb-4 ${themeClasses.bgGradientSecondary} ${className}`.trim(),
      [sizeConfig.container, themeClasses.bgGradientSecondary, className],
    );

    // Memoize icon classes
    const iconClasses = useMemo(
      () => `${sizeConfig.icon} text-white`,
      [sizeConfig.icon],
    );

    // Early return AFTER all hooks
    if (!Icon) {
      return null;
    }

    return (
      <Card padding="p-0" className={`${containerClasses} border-0`} {...props}>
        <Icon className={iconClasses} />
      </Card>
    );
  },
);

// Add display name for better debugging
EmptyStateIcon.displayName = "EmptyStateIcon";

export default EmptyStateIcon;
