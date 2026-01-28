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

/**
 * Convert a local date string (YYYY-MM-DD) to ISO format without timezone shifts
 * This fixes the common bug where new Date("2024-06-02") creates a UTC midnight date
 * which shifts to the previous day when converted to local timezone
 *
 * @param {string} dateStr - The local date string in YYYY-MM-DD format
 * @returns {string} - ISO datetime string with time set to noon local time
 *
 * @example
 * // User in EST selects June 2, 2024
 * convertLocalDateToISO("2024-06-02") // Returns "2024-06-02T17:00:00.000Z" (noon EST in UTC)
 * // NOT "2024-06-02T00:00:00.000Z" which would display as June 1st in EST
 */
export function convertLocalDateToISO(dateStr) {
  if (!dateStr || isZeroDate(dateStr)) {
    return "";
  }

  // If already an ISO datetime string, return as-is
  if (dateStr.includes("T")) {
    return dateStr;
  }

  try {
    // Parse as local date components to avoid UTC interpretation
    const [year, month, day] = dateStr.split('-').map(Number);

    if (!year || !month || !day) {
      console.warn("Invalid date format:", dateStr);
      return "";
    }

    // Create date in local timezone (month is 0-indexed)
    const localDate = new Date(year, month - 1, day);

    // Set to noon local time to avoid timezone edge cases
    localDate.setHours(12, 0, 0, 0);

    return localDate.toISOString();
  } catch (e) {
    console.warn("Date conversion error:", e);
    return "";
  }
}

/**
 * Convert a local date string (YYYY-MM-DD) to a timestamp (milliseconds since epoch)
 * representing midnight in the LOCAL timezone, not UTC
 *
 * This fixes the common bug where new Date("2024-06-02").getTime() creates a UTC midnight
 * timestamp, which represents the previous day in many timezones
 *
 * @param {string} dateStr - The local date string in YYYY-MM-DD format
 * @returns {number} - Timestamp in milliseconds representing midnight local time
 *
 * @example
 * // User in EST selects June 2, 2024
 * convertLocalDateToTimestamp("2024-06-02") // Returns timestamp for 2024-06-02 00:00:00 EST
 * // NOT the timestamp for 2024-06-02 00:00:00 UTC (which is 2024-06-01 19:00:00 EST)
 */
export function convertLocalDateToTimestamp(dateStr) {
  if (!dateStr || isZeroDate(dateStr)) {
    return null;
  }

  try {
    // Parse as local date components to avoid UTC interpretation
    const [year, month, day] = dateStr.split('-').map(Number);

    if (!year || !month || !day) {
      console.warn("Invalid date format:", dateStr);
      return null;
    }

    // Create date at midnight in local timezone (month is 0-indexed)
    const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);

    return localDate.getTime();
  } catch (e) {
    console.warn("Date conversion error:", e);
    return null;
  }
}
