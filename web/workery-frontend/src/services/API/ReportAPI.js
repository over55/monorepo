// File: web/workery-frontend/src/services/API/ReportAPI.js

import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";

/**
 * ReportAPI handles all report-related API calls
 */
export class ReportAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("ReportAPI initialized with:", {
        baseURL: this.baseURL,
        reportEndpoint: this.endpoints.REPORT_DETAIL,
      });
    }
  }

  /**
   * Downloads a report with given parameters
   * @param {number} reportId - The report ID to download
   * @param {Object} params - Report parameters (from_dt, to_dt, state, etc.)
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Blob>} - Report data as blob
   */
  async downloadReport(reportId, params = {}, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance with blob response type
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Configure for binary download
      authenticatedAxios.defaults.responseType = "blob";
      authenticatedAxios.defaults.headers["Accept"] =
        "application/octet-stream";

      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add all parameters
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ""
        ) {
          queryParams.append(key, params[key]);
        }
      });

      // Build URL with report ID
      const url = this.endpoints.REPORT_DETAIL.replace("{reportID}", reportId);
      const fullUrl = queryParams.toString()
        ? `${url}?${queryParams.toString()}`
        : url;

      console.log(
        `ReportAPI: Downloading report ${reportId} with params:`,
        params,
      );

      // Make the API call
      const response = await authenticatedAxios.get(fullUrl);

      // Return the blob data
      return response.data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Downloads Due Service Fees Report (Report ID: 1)
   * @param {Date} fromDate - Start date
   * @param {Date} toDate - End date
   * @param {number} state - Job status filter
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Blob>} - Report data as blob
   */
  async downloadDueServiceFeesReport(
    fromDate,
    toDate,
    state = 0,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate dates
      if (!fromDate || !(fromDate instanceof Date)) {
        throw { fromDate: "Valid from date is required" };
      }

      if (!toDate || !(toDate instanceof Date)) {
        throw { toDate: "Valid to date is required" };
      }

      // Convert dates to timestamps (matching old implementation)
      const params = {
        from_dt: fromDate.getTime(),
        to_dt: toDate.getTime(),
        state: parseInt(state) || 0,
      };

      // Download report ID 1
      return await this.downloadReport(1, params, onUnauthorizedCallback);
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets list of available reports
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - List of available reports
   */
  async getReportsList(onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call
      const response = await authenticatedAxios.get(this.endpoints.REPORTS);

      // Return the data
      return response.data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Formats error responses consistently
   * @private
   * @param {Error} error - Original error from axios or interceptor
   * @returns {Object} - Formatted error object
   */
  _formatError(error) {
    let errorData = null;

    // Handle different error structures
    if (error.response?.data) {
      // For blob responses, we might need to read the error differently
      if (error.response.data instanceof Blob) {
        // Return a generic error for blob responses
        errorData = {
          message: error.response.statusText || "Failed to download report",
          status: error.response.status,
        };
      } else {
        errorData = error.response.data;
      }
    } else if (error.response) {
      errorData = error.response;
    } else if (typeof error === "object" && error !== null) {
      // Already processed by our interceptor or validation
      errorData = error;
    } else {
      errorData = { message: error.message || "Unknown error occurred" };
    }

    return errorData;
  }
}
