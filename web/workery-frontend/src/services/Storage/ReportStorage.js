// File: web/workery-frontend/src/services/Storage/ReportStorage.js

/**
 * ReportStorage handles report-related data storage operations
 * Reports are typically not cached since they're generated on-demand
 */
export class ReportStorage {
  constructor() {
    this.REPORT_PREFERENCES_KEY = "WORKERY_REPORT_PREFERENCES";
    this.REPORT_HISTORY_KEY = "WORKERY_REPORT_HISTORY";
    this.MAX_HISTORY_ITEMS = 20;

    if (process.env.NODE_ENV === "development") {
      console.log("ReportStorage initialized");
    }
  }

  /**
   * Saves report preferences (default filters, etc.)
   * @param {Object} preferences - Report preferences
   */
  saveReportPreferences(preferences) {
    try {
      localStorage.setItem(
        this.REPORT_PREFERENCES_KEY,
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("ReportStorage: Report preferences saved");
    } catch (error) {
      console.error("ReportStorage: Error saving report preferences", error);
    }
  }

  /**
   * Gets report preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 30 days)
   * @returns {Object|null} - Report preferences or null
   */
  getReportPreferences(maxAge = 30 * 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem(this.REPORT_PREFERENCES_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem(this.REPORT_PREFERENCES_KEY);
        }
      }
    } catch (error) {
      console.error("ReportStorage: Error reading report preferences", error);
    }

    return null;
  }

  /**
   * Adds a report download to history
   * @param {Object} reportInfo - Information about the downloaded report
   */
  addToReportHistory(reportInfo) {
    try {
      const history = this.getReportHistory() || [];

      // Add new report to beginning
      history.unshift({
        ...reportInfo,
        downloadedAt: Date.now(),
      });

      // Keep only the most recent items
      const trimmedHistory = history.slice(0, this.MAX_HISTORY_ITEMS);

      localStorage.setItem(
        this.REPORT_HISTORY_KEY,
        JSON.stringify(trimmedHistory),
      );

      console.log("ReportStorage: Added to report history");
    } catch (error) {
      console.error("ReportStorage: Error saving report history", error);
    }
  }

  /**
   * Gets report download history
   * @returns {Array} - Array of report history items
   */
  getReportHistory() {
    try {
      const stored = localStorage.getItem(this.REPORT_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("ReportStorage: Error reading report history", error);
      return [];
    }
  }

  /**
   * Clears report history
   */
  clearReportHistory() {
    localStorage.removeItem(this.REPORT_HISTORY_KEY);
    console.log("ReportStorage: Report history cleared");
  }

  /**
   * Clears all report-related data
   */
  clearAllReportData() {
    localStorage.removeItem(this.REPORT_PREFERENCES_KEY);
    localStorage.removeItem(this.REPORT_HISTORY_KEY);
    console.log("ReportStorage: All report data cleared");
  }
}
