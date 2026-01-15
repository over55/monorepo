// File: monorepo/web/frontend/src/components/UI/Date/Date.jsx
// UIX Mobile Optimizations Applied

import React, { useMemo, useCallback, memo } from "react";
import {
  ExclamationTriangleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move constants outside component to prevent recreation
const ZERO_DATE_PATTERNS = [
  "0001-01-01", // Go zero date
  "1970-01-01T00:00:00Z", // Unix epoch (sometimes used as null)
  "0000-00-00", // MySQL zero date
  "1900-01-01", // SQL Server min date (sometimes used as null)
];

const SIZE_CLASSES = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-base",
  lg: "px-5 py-4 text-base sm:text-lg",
};

const LABEL_SIZE_CLASSES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-base sm:text-lg",
};

/**
 * Check if a date is considered "zero" or invalid
 * Handles various zero date formats from different backends
 */
const isZeroDate = (dateValue) => {
  if (!dateValue) return true;

  const dateStr = String(dateValue);
  return ZERO_DATE_PATTERNS.some((pattern) => dateStr.startsWith(pattern));
};

/**
 * Format a date value for HTML date input
 * Returns empty string for zero/invalid dates
 */
const formatDateForInput = (dateValue) => {
  if (!dateValue || isZeroDate(dateValue)) {
    return "";
  }

  try {
    let date;

    if (typeof dateValue === "string") {
      // Check if it's already in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
      }
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return "";
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "";
    }

    // Format as YYYY-MM-DD for HTML date input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
};

/**
 * Enhanced DateInput Component with Modern UIX Styling
 * Date input field with validation and zero-date handling, matching Input component styling
 *
 * @param {string} label - Input label
 * @param {string} value - Date value (handles various formats including ISO strings)
 * @param {function} onChange - Change handler (receives formatted date string)
 * @param {string} error - Error message
 * @param {boolean} disabled - Whether input is disabled
 * @param {boolean} required - Whether input is required
 * @param {string} min - Minimum date allowed
 * @param {string} max - Maximum date allowed
 * @param {string} helperText - Helper text below input
 * @param {string} className - Additional CSS classes
 * @param {string} placeholder - Placeholder text
 * @param {string} size - Size variant (sm, md, lg)
 * @param {React.Component} icon - Optional icon component
 */
const DateInput = memo(
  ({
    label,
    value,
    onChange,
    error,
    disabled = false,
    required = false,
    min,
    max,
    helperText,
    className = "",
    placeholder = "Select a date",
    size = "lg",
    icon: Icon,
  }) => {
    const { getThemeClasses } = useUIXTheme();

    // Memoize formatted value to prevent unnecessary recalculations
    const formattedValue = useMemo(() => formatDateForInput(value), [value]);

    // Memoize change handler to prevent recreation on every render
    const handleDateChange = useCallback(
      (e) => {
        const newValue = e.target.value;
        onChange(newValue);
      },
      [onChange],
    );

    // Memoize theme classes to prevent excessive theme function calls
    const themeClasses = useMemo(
      () => ({
        textPrimary: getThemeClasses("text-primary"),
        textDanger: getThemeClasses("text-danger"),
        textMuted: getThemeClasses("text-muted"),
        placeholderMuted: getThemeClasses("placeholder-muted"),
        inputFocusRing: getThemeClasses("input-focus-ring"),
        inputBorder: getThemeClasses("input-border"),
        inputBorderError: getThemeClasses("input-border-error"),
        bgDisabled: getThemeClasses("bg-disabled"),
        bgCard: getThemeClasses("bg-card"),
      }),
      [getThemeClasses],
    );

    // Memoize size classes
    const sizeClass = useMemo(() => SIZE_CLASSES[size], [size]);
    const labelSizeClass = useMemo(() => LABEL_SIZE_CLASSES[size], [size]);

    // Memoize input classes to prevent string concatenation on every render
    const inputClasses = useMemo(() => {
      return `
      w-full
      ${sizeClass}
      ${Icon ? "pl-10" : "pl-5"}
      border-2 rounded-xl shadow-sm
      transition-all duration-200
      ${themeClasses.placeholderMuted}
      focus:outline-none ${themeClasses.inputFocusRing}
      ${error ? themeClasses.inputBorderError : themeClasses.inputBorder}
      ${disabled ? `${themeClasses.bgDisabled} cursor-not-allowed` : themeClasses.bgCard}
    `
        .replace(/\s+/g, " ")
        .trim();
    }, [sizeClass, Icon, themeClasses, error, disabled]);

    // Memoize label classes
    const labelClasses = useMemo(
      () =>
        `block ${labelSizeClass} font-semibold ${themeClasses.textPrimary} mb-3 flex items-center`,
      [labelSizeClass, themeClasses.textPrimary],
    );

    // Memoize icon classes
    const iconClasses = useMemo(
      () => `h-5 w-5 ${themeClasses.textMuted}`,
      [themeClasses.textMuted],
    );

    // Memoize helper text classes
    const helperTextClasses = useMemo(
      () => `mt-1 text-xs ${themeClasses.textMuted}`,
      [themeClasses.textMuted],
    );

    // Memoize error classes (without animation to prevent reflow)
    const errorClasses = useMemo(
      () => `mt-1 text-sm ${themeClasses.textDanger} flex items-center`,
      [themeClasses.textDanger],
    );

    return (
      <div className={className}>
        {label && (
          <label className={labelClasses}>
            {label}
            {required && (
              <span className={`${themeClasses.textDanger} ml-1`}>*</span>
            )}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className={iconClasses} />
            </div>
          )}
          <input
            type="date"
            value={formattedValue}
            onChange={handleDateChange}
            disabled={disabled}
            required={required}
            min={min}
            max={max}
            placeholder={placeholder}
            className={inputClasses}
          />
        </div>

        {helperText && !error && (
          <p className={helperTextClasses}>{helperText}</p>
        )}
        {error && (
          <p className={errorClasses}>
            <ExclamationTriangleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  },
);

// Add display name for better debugging
DateInput.displayName = "DateInput";

// Export with multiple names for flexibility
export default DateInput;
export { DateInput as Date };
