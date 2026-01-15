// File: src/components/UI/EmptyState/EmptyState.jsx
// UIX Mobile Optimizations Applied

import React, { useMemo, memo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * EmptyState Component
 * Placeholder for when no data is available
 *
 * @param {string} title - Main empty state message
 * @param {string} description - Additional description
 * @param {React.Component} icon - Icon component to display
 * @param {React.ReactNode} action - Call-to-action element
 * @param {string} className - Additional CSS classes
 */
const EmptyState = memo(
  ({
    title = "No data found",
    description = "",
    icon: Icon,
    action,
    className = "",
  }) => {
    const { getThemeClasses } = useUIXTheme();

    // Memoize theme classes
    const themeClasses = useMemo(
      () => ({
        icon: getThemeClasses("info-card-content-icon"),
        title: getThemeClasses("info-card-content-text"),
        description: getThemeClasses("info-card-content-text-secondary"),
      }),
      [getThemeClasses],
    );

    // Memoize container classes
    const containerClasses = useMemo(
      () => `text-center py-12 ${className}`.trim(),
      [className],
    );

    // Memoize icon classes
    const iconClasses = useMemo(
      () => `mx-auto h-12 w-12 ${themeClasses.icon}`,
      [themeClasses.icon],
    );

    // Memoize title classes
    const titleClasses = useMemo(
      () => `mt-2 text-sm font-medium ${themeClasses.title}`,
      [themeClasses.title],
    );

    // Memoize description classes
    const descriptionClasses = useMemo(
      () => `mt-1 text-sm ${themeClasses.description}`,
      [themeClasses.description],
    );

    // Memoize icon element
    const iconElement = useMemo(() => {
      if (!Icon) return null;
      return <Icon className={iconClasses} />;
    }, [Icon, iconClasses]);

    // Memoize description element
    const descriptionElement = useMemo(() => {
      if (!description) return null;
      return <p className={descriptionClasses}>{description}</p>;
    }, [description, descriptionClasses]);

    // Memoize action element
    const actionElement = useMemo(() => {
      if (!action) return null;
      return <div className="mt-6">{action}</div>;
    }, [action]);

    return (
      <div className={containerClasses}>
        {iconElement}
        <h3 className={titleClasses}>{title}</h3>
        {descriptionElement}
        {actionElement}
      </div>
    );
  },
);

// Add display name for better debugging
EmptyState.displayName = "EmptyState";

export default EmptyState;
