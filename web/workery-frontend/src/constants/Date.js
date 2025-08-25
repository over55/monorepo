// File Path: web/workery-frontend/src/constants/Date.js

/**
 * Date Constants for handling various backend date formats
 */

// Zero/Invalid date patterns from various backend systems
export const ZERO_DATE_PATTERNS = [
  "0001-01-01", // Go zero date
  "1970-01-01T00:00:00Z", // Unix epoch (sometimes used as null)
  "0000-00-00", // MySQL zero date
  "1900-01-01", // SQL Server min date (sometimes used as null)
];

// Date format patterns
export const DATE_FORMATS = {
  ISO: "YYYY-MM-DD",
  ISO_DATETIME: "YYYY-MM-DDTHH:mm:ssZ",
  DISPLAY: "MMM DD, YYYY",
  INPUT: "YYYY-MM-DD", // HTML date input format
};

// Date validation constants
export const DATE_VALIDATION = {
  MIN_YEAR: 1900,
  MAX_YEAR: 2100,
};

/**
 * Check if a date is considered zero or invalid
 * @param {string|Date} dateValue - The date to check
 * @returns {boolean} - True if the date is zero/invalid
 */
export function isZeroDate(dateValue) {
  if (!dateValue) return true;

  const dateStr = String(dateValue);
  return ZERO_DATE_PATTERNS.some((pattern) => dateStr.startsWith(pattern));
}

/**
 * Format a date for HTML date input
 * @param {string|Date} dateValue - The date to format
 * @returns {string} - Formatted date string or empty string
 */
export function formatDateForInput(dateValue) {
  if (!dateValue || isZeroDate(dateValue)) {
    return "";
  }

  try {
    let date;

    if (typeof dateValue === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
      }
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return "";
    }

    if (isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (e) {
    console.warn("Date formatting error:", e);
    return "";
  }
}

/**
 * Parse a date string to Date object, handling zero dates
 * @param {string} dateStr - The date string to parse
 * @returns {Date|null} - Parsed Date object or null
 */
export function parseDate(dateStr) {
  if (!dateStr || isZeroDate(dateStr)) {
    return null;
  }

  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch (e) {
    return null;
  }
}
