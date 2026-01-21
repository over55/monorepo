// File: src/components/UIX/StatCard/StatCard.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * StatCard Component
 * Displays a statistic or metric in a styled box
 * Used for variance displays, cost summaries, and key metrics
 *
 * @param {string} label - Stat label
 * @param {string|number} value - Stat value to display
 * @param {string} helperText - Optional helper text below the value
 * @param {string} variant - Style variant (default, positive, negative, highlight)
 * @param {string} size - Size variant (sm, md, lg)
 * @param {string} className - Additional CSS classes
 */
const StatCard = memo(function StatCard({
  label,
  value,
  helperText,
  variant = "default",
  size = "md",
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      bgDisabled: getThemeClasses("bg-disabled"),
      borderSecondary: getThemeClasses("border-secondary"),
      textSecondary: getThemeClasses("text-secondary"),
      textPrimary: getThemeClasses("text-primary"),
      textMuted: getThemeClasses("text-muted"),
    }),
    [getThemeClasses],
  );

  // Memoize size classes
  const sizeClasses = useMemo(() => {
    switch (size) {
      case "sm":
        return { value: "text-lg", padding: "p-3" };
      case "lg":
        return { value: "text-2xl", padding: "p-6" };
      default: // md
        return { value: "text-lg", padding: "p-4" };
    }
  }, [size]);

  // Memoize value color based on variant
  const valueColorClass = useMemo(() => {
    switch (variant) {
      case "positive":
        return "text-green-600 dark:text-green-400";
      case "negative":
        return "text-red-600 dark:text-red-400";
      case "highlight":
        return themeClasses.textPrimary;
      default:
        return themeClasses.textPrimary;
    }
  }, [variant, themeClasses.textPrimary]);

  // Memoize background class based on variant
  const bgClass = useMemo(() => {
    switch (variant) {
      case "highlight":
        return "bg-blue-50 dark:bg-blue-900/20";
      default:
        return themeClasses.bgDisabled;
    }
  }, [variant, themeClasses.bgDisabled]);

  // Memoize container classes
  const containerClasses = useMemo(
    () =>
      `${bgClass} ${sizeClasses.padding} rounded-lg border ${themeClasses.borderSecondary} ${className}`.trim(),
    [bgClass, sizeClasses.padding, themeClasses.borderSecondary, className],
  );

  return (
    <div className={containerClasses}>
      <label
        className={`block text-sm font-medium mb-1 ${themeClasses.textSecondary}`}
      >
        {label}
      </label>
      <p className={`${sizeClasses.value} font-semibold ${valueColorClass}`}>
        {value}
      </p>
      {helperText && (
        <p className={`text-xs ${themeClasses.textMuted} mt-1`}>{helperText}</p>
      )}
    </div>
  );
});

StatCard.displayName = "StatCard";

export default StatCard;
