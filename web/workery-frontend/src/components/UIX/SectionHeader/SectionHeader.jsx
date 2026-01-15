// File: src/components/UIX/SectionHeader/SectionHeader.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * SectionHeader Component
 * Header for sections within cards with optional icon
 *
 * @param {string} title - Section title
 * @param {React.Component} icon - Optional icon component
 * @param {string} className - Additional CSS classes
 */
const SectionHeader = memo(function SectionHeader({
  title,
  icon: Icon,
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
    }),
    [getThemeClasses],
  );

  // Memoize container classes
  const containerClasses = useMemo(
    () =>
      Icon
        ? `flex items-center mb-4 ${className}`.trim()
        : `mb-6 ${className}`.trim(),
    [Icon, className],
  );

  return (
    <div className={containerClasses}>
      {Icon && (
        <Icon className={`w-6 h-6 mr-2 ${themeClasses.textSecondary}`} />
      )}
      <h2 className={`text-xl font-semibold ${themeClasses.textPrimary}`}>
        {title}
      </h2>
    </div>
  );
});

SectionHeader.displayName = "SectionHeader";

export default SectionHeader;
