// File: monorepo/web/workery-frontend/src/components/UI/Date/Date.jsx

import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

/**
 * Date Component
 * Date input field with validation and zero-date handling
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
 */
function DateInput({
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
}) {
  /**
   * Check if a date is considered "zero" or invalid
   * Handles various zero date formats from different backends
   */
  const isZeroDate = (dateValue) => {
    if (!dateValue) return true;

    const zeroDatePatterns = [
      "0001-01-01", // Go zero date
      "1970-01-01T00:00:00Z", // Unix epoch (sometimes used as null)
      "0000-00-00", // MySQL zero date
      "1900-01-01", // SQL Server min date (sometimes used as null)
    ];

    // Check if the date string starts with any zero date pattern
    const dateStr = String(dateValue);
    return zeroDatePatterns.some((pattern) => dateStr.startsWith(pattern));
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
      // Handle various input formats
      let date;

      if (typeof dateValue === "string") {
        // Check if it's already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          return dateValue;
        }
        // Parse ISO strings or other date formats
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
    } catch (e) {
      console.warn("Date formatting error:", e);
      return "";
    }
  };

  /**
   * Handle date change event
   * Passes the raw date string to the parent
   */
  const handleDateChange = (e) => {
    const newValue = e.target.value;
    // Pass the raw value to parent - they can decide how to store it
    onChange(newValue);
  };

  const formattedValue = formatDateForInput(value);

  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
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
        className={`
          w-full px-4 py-3
          border rounded-lg
          transition-all duration-200
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-offset-1
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
          }
          ${disabled ? "bg-gray-50 cursor-not-allowed opacity-60" : "bg-white"}
        `}
      />
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}

// Export with multiple names for flexibility
export default DateInput;
export { DateInput as Date };
