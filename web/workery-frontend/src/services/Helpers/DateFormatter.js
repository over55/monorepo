// File Path: monorepo/web/workery-frontend/src/services/Helpers/DateFormatter.js

import { DateTime } from "luxon";

/**
 * Date formatting utility functions
 */

/**
 * Formats an ISO date string to a readable date format
 * @param {string} dateString - ISO date string
 * @param {string} format - Format type: 'short', 'medium', 'long', 'full'
 * @returns {string} - Formatted date or fallback
 */
export function formatDate(dateString, format = "medium") {
  if (!dateString) return "-";

  try {
    const dt = DateTime.fromISO(dateString);

    if (!dt.isValid) {
      // Try to parse as a different format if ISO fails
      const jsDate = new Date(dateString);
      if (!isNaN(jsDate.getTime())) {
        const fallbackDt = DateTime.fromJSDate(jsDate);
        if (fallbackDt.isValid) {
          return getFormattedDate(fallbackDt, format);
        }
      }

      console.warn("Invalid date:", dateString);
      return dateString; // Return original if can't parse
    }

    return getFormattedDate(dt, format);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Return original on error
  }
}

/**
 * Formats a DateTime object based on format type
 * @private
 */
function getFormattedDate(dt, format) {
  switch (format) {
    case "short":
      return dt.toLocaleString(DateTime.DATE_SHORT); // 10/14/1983
    case "medium":
      return dt.toLocaleString(DateTime.DATE_MED); // Oct 14, 1983
    case "long":
      return dt.toLocaleString(DateTime.DATE_FULL); // October 14, 1983
    case "full":
      return dt.toLocaleString(DateTime.DATE_HUGE); // Tuesday, October 14, 1983
    case "iso":
      return dt.toISODate(); // 1983-10-14
    case "custom":
      return dt.toFormat("MMM dd, yyyy"); // Oct 14, 1983
    default:
      return dt.toLocaleString(DateTime.DATE_MED);
  }
}

/**
 * Formats an ISO datetime string to a readable datetime format
 * @param {string} dateTimeString - ISO datetime string
 * @param {string} format - Format type: 'short', 'medium', 'long'
 * @returns {string} - Formatted datetime or fallback
 */
export function formatDateTime(dateTimeString, format = "medium") {
  if (!dateTimeString) return "-";

  try {
    const dt = DateTime.fromISO(dateTimeString);

    if (!dt.isValid) {
      console.warn("Invalid datetime:", dateTimeString);
      return dateTimeString;
    }

    switch (format) {
      case "short":
        return dt.toLocaleString(DateTime.DATETIME_SHORT);
      case "medium":
        return dt.toLocaleString(DateTime.DATETIME_MED);
      case "long":
        return dt.toLocaleString(DateTime.DATETIME_FULL);
      default:
        return dt.toLocaleString(DateTime.DATETIME_MED);
    }
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return dateTimeString;
  }
}

/**
 * Formats a date for display in tables/lists
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date for display
 */
export function formatDateForDisplay(dateString) {
  if (!dateString) return "-";

  // Check for zero/null date values (Go's zero time)
  if (
    dateString === "0001-01-01T00:00:00Z" ||
    dateString === "0001-01-01T00:00:00" ||
    dateString.startsWith("0001-01-01")
  ) {
    return "-";
  }

  // If already formatted (contains month name), return as is
  if (/[A-Za-z]/.test(dateString) && !dateString.includes("T")) {
    return dateString;
  }

  return formatDate(dateString, "medium");
}

/**
 * Gets relative time (e.g., "2 days ago", "in 3 hours")
 * @param {string} dateString - ISO date string
 * @returns {string} - Relative time string
 */
export function getRelativeTime(dateString) {
  if (!dateString) return "-";

  try {
    const dt = DateTime.fromISO(dateString);

    if (!dt.isValid) {
      return formatDate(dateString, "medium");
    }

    return dt.toRelative();
  } catch (error) {
    console.error("Error getting relative time:", error);
    return formatDate(dateString, "medium");
  }
}

/**
 * Formats a date range
 * @param {string} startDate - Start date ISO string
 * @param {string} endDate - End date ISO string
 * @returns {string} - Formatted date range
 */
export function formatDateRange(startDate, endDate) {
  const start = formatDate(startDate, "medium");
  const end = formatDate(endDate, "medium");

  if (start === "-" && end === "-") return "-";
  if (start === "-") return `Until ${end}`;
  if (end === "-") return `From ${start}`;

  return `${start} - ${end}`;
}

/**
 * Gets days between two dates
 * @param {string} startDate - Start date ISO string
 * @param {string} endDate - End date ISO string
 * @returns {number|null} - Number of days or null
 */
export function getDaysBetween(startDate, endDate) {
  if (!startDate || !endDate) return null;

  try {
    const start = DateTime.fromISO(startDate);
    const end = DateTime.fromISO(endDate);

    if (!start.isValid || !end.isValid) return null;

    const diff = end.diff(start, "days");
    return Math.floor(diff.days);
  } catch (error) {
    console.error("Error calculating days between:", error);
    return null;
  }
}

/**
 * Checks if a date is in the past
 * @param {string} dateString - ISO date string
 * @returns {boolean} - True if date is in the past
 */
export function isDateInPast(dateString) {
  if (!dateString) return false;

  try {
    const dt = DateTime.fromISO(dateString);
    if (!dt.isValid) return false;

    return dt < DateTime.now();
  } catch (error) {
    console.error("Error checking if date is in past:", error);
    return false;
  }
}

/**
 * Checks if a date is today
 * @param {string} dateString - ISO date string
 * @returns {boolean} - True if date is today
 */
export function isToday(dateString) {
  if (!dateString) return false;

  try {
    const dt = DateTime.fromISO(dateString);
    if (!dt.isValid) return false;

    const today = DateTime.now();
    return dt.hasSame(today, "day");
  } catch (error) {
    console.error("Error checking if date is today:", error);
    return false;
  }
}

/**
 * Formats a date for API submission (ISO format)
 * @param {string|Date} date - Date string or Date object
 * @returns {string} - ISO formatted date string
 */
export function formatDateForAPI(date) {
  if (!date) return null;

  try {
    let dt;

    if (date instanceof Date) {
      dt = DateTime.fromJSDate(date);
    } else if (typeof date === "string") {
      // Try to parse the string
      dt = DateTime.fromISO(date);

      if (!dt.isValid) {
        // Try other formats
        dt = DateTime.fromFormat(date, "MM/dd/yyyy");
      }
    } else {
      return null;
    }

    if (!dt.isValid) return null;

    return dt.toISO();
  } catch (error) {
    console.error("Error formatting date for API:", error);
    return null;
  }
}
