// File: src/components/UIX/DataField/DataField.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * DataField Component
 * Displays a simple labeled read-only field with value
 * Lighter weight than InfoField - no background box styling
 *
 * @param {string} label - Field label
 * @param {any} value - Field value to display
 * @param {string} emptyText - Text to display when value is empty (default: "-")
 * @param {string} helperText - Optional helper text below the value
 * @param {boolean} fullWidth - Whether field spans full width (for long text)
 * @param {string} className - Additional CSS classes
 */
const DataField = memo(function DataField({
  label,
  value,
  emptyText = "-",
  helperText,
  fullWidth = false,
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      textSecondary: getThemeClasses("text-secondary"),
      textPrimary: getThemeClasses("text-primary"),
      textMuted: getThemeClasses("text-muted"),
    }),
    [getThemeClasses],
  );

  // Memoize container classes
  const containerClasses = useMemo(
    () => (fullWidth ? `md:col-span-2 ${className}` : className).trim(),
    [fullWidth, className],
  );

  // Memoize displayed value
  const displayValue = useMemo(() => {
    if (value === null || value === undefined || value === "") {
      return emptyText;
    }
    return value;
  }, [value, emptyText]);

  return (
    <div className={containerClasses}>
      <label
        className={`block text-sm font-medium mb-1 ${themeClasses.textSecondary}`}
      >
        {label}
      </label>
      <p className={`text-base sm:text-lg font-medium ${themeClasses.textPrimary}`}>{displayValue}</p>
      {helperText && (
        <p className={`text-xs ${themeClasses.textMuted} mt-1`}>{helperText}</p>
      )}
    </div>
  );
});

DataField.displayName = "DataField";

export default DataField;
