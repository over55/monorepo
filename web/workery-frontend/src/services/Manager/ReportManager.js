// File: web/workery-frontend/src/services/Manager/ReportManager.js

/**
 * ReportManager handles all report-related business logic
 * Combines ReportAPI with ReportStorage for complete report management
 */
export class ReportManager {
  constructor(reportAPI, reportStorage) {
    this.reportAPI = reportAPI;
    this.reportStorage = reportStorage;
  }

  /**
   * Downloads a report and triggers browser download
   * @param {number} reportId - The report ID
   * @param {Object} params - Report parameters
   * @param {string} filename - Filename for download
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<boolean>} - Success status
   */
  async downloadReport(
    reportId,
    params = {},
    filename = null,
    onUnauthorizedCallback = null,
  ) {
    try {
      console.log(`ReportManager: Downloading report ${reportId}`, params);

      // Get the blob from API
      const blob = await this.reportAPI.downloadReport(
        reportId,
        params,
        onUnauthorizedCallback,
      );

      // Generate filename if not provided
      if (!filename) {
        const timestamp = new Date().toISOString().split("T")[0];
        filename = `report_${reportId}_${timestamp}.csv`;
      }

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

      // Add to history
      this.reportStorage.addToReportHistory({
        reportId,
        filename,
        params,
      });

      console.log(`ReportManager: Report ${reportId} downloaded successfully`);
      return true;
    } catch (error) {
      console.error("ReportManager: Failed to download report", error);
      throw error;
    }
  }

  /**
   * Downloads Due Service Fees Report (Report ID: 1)
   * @param {Date} fromDate - Start date
   * @param {Date} toDate - End date
   * @param {number} jobStatus - Job status filter
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<boolean>} - Success status
   */
  async downloadDueServiceFeesReport(
    fromDate,
    toDate,
    jobStatus = 0,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate parameters
      const validationErrors = this.validateDueServiceFeesReportParams(
        fromDate,
        toDate,
      );
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("ReportManager: Downloading Due Service Fees Report", {
        fromDate,
        toDate,
        jobStatus,
      });

      // Get the blob from API
      const blob = await this.reportAPI.downloadDueServiceFeesReport(
        fromDate,
        toDate,
        jobStatus,
        onUnauthorizedCallback,
      );

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `due_service_fees_report_${timestamp}.csv`;

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

      // Save to history
      this.reportStorage.addToReportHistory({
        reportId: 1,
        reportType: "Due Service Fees",
        filename,
        params: {
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
          jobStatus,
        },
      });

      // Save preferences for next time
      this.reportStorage.saveReportPreferences({
        lastDueServiceFeesReport: {
          jobStatus,
        },
      });

      console.log(
        "ReportManager: Due Service Fees Report downloaded successfully",
      );
      return true;
    } catch (error) {
      console.error(
        "ReportManager: Failed to download Due Service Fees Report",
        error,
      );
      throw error;
    }
  }

  /**
   * Validates Due Service Fees Report parameters
   * @param {Date} fromDate - Start date
   * @param {Date} toDate - End date
   * @returns {Object} - Validation errors
   */
  validateDueServiceFeesReportParams(fromDate, toDate) {
    const errors = {};

    // Check if dates are provided
    if (!fromDate) {
      errors.fromDate = "From date is required";
    } else if (!(fromDate instanceof Date) || isNaN(fromDate.getTime())) {
      errors.fromDate = "Invalid from date";
    }

    if (!toDate) {
      errors.toDate = "To date is required";
    } else if (!(toDate instanceof Date) || isNaN(toDate.getTime())) {
      errors.toDate = "Invalid to date";
    }

    // Check date range
    if (fromDate && toDate && fromDate > toDate) {
      errors.toDate = "To date must be after from date";
    }

    // Check for future dates
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (toDate && toDate > today) {
      errors.toDate = "To date cannot be in the future";
    }

    return errors;
  }

  /**
   * Gets list of available reports
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - List of available reports
   */
  async getReportsList(onUnauthorizedCallback = null) {
    try {
      console.log("ReportManager: Fetching reports list");

      const reportsList = await this.reportAPI.getReportsList(
        onUnauthorizedCallback,
      );

      console.log("ReportManager: Reports list fetched successfully");
      return reportsList;
    } catch (error) {
      console.error("ReportManager: Failed to get reports list", error);
      throw error;
    }
  }

  /**
   * Gets report preferences
   * @returns {Object|null} - Report preferences or null
   */
  getReportPreferences() {
    return this.reportStorage.getReportPreferences();
  }

  /**
   * Saves report preferences
   * @param {Object} preferences - Report preferences
   */
  saveReportPreferences(preferences) {
    this.reportStorage.saveReportPreferences(preferences);
  }

  /**
   * Gets report download history
   * @returns {Array} - Report history
   */
  getReportHistory() {
    return this.reportStorage.getReportHistory();
  }

  /**
   * Clears report history
   */
  clearReportHistory() {
    this.reportStorage.clearReportHistory();
  }

  /**
   * Callback-based versions for compatibility
   */

  downloadReportWithCallbacks(
    reportId,
    params,
    filename,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.downloadReport(reportId, params, filename, onUnauthorizedCallback)
      .then((result) => {
        if (onSuccessCallback) {
          onSuccessCallback(result);
        }
      })
      .catch((error) => {
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      })
      .finally(() => {
        if (onDoneCallback) {
          onDoneCallback();
        }
      });
  }

  downloadDueServiceFeesReportWithCallbacks(
    fromDate,
    toDate,
    jobStatus,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.downloadDueServiceFeesReport(
      fromDate,
      toDate,
      jobStatus,
      onUnauthorizedCallback,
    )
      .then((result) => {
        if (onSuccessCallback) {
          onSuccessCallback(result);
        }
      })
      .catch((error) => {
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      })
      .finally(() => {
        if (onDoneCallback) {
          onDoneCallback();
        }
      });
  }

  getReportsListWithCallbacks(
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getReportsList(onUnauthorizedCallback)
      .then((data) => {
        if (onSuccessCallback) {
          onSuccessCallback(data);
        }
      })
      .catch((error) => {
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      })
      .finally(() => {
        if (onDoneCallback) {
          onDoneCallback();
        }
      });
  }
}
