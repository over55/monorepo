// File Path: web/workery-frontend/src/services/API/JobHistoryAPI.js

import { camelizeKeys, decamelizeKeys, decamelize } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * JobHistoryAPI handles all job history-related API calls
 */
export class JobHistoryAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("JobHistoryAPI initialized with:", {
        baseURL: this.baseURL,
        jobHistoryEndpoint: this.endpoints.JOB_HISTORY,
        jobHistoryDetailEndpoint: this.endpoints.JOB_HISTORY_DETAIL,
      });
    }
  }

  /**
   * Gets list of job history with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Job history list with pagination data
   */
  async getJobHistory(params = {}, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add pagination params
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("page_size", params.limit);

      // Add search params
      if (params.search) queryParams.append("search", params.search);

      // Add sorting params
      if (params.sortBy && params.sortOrder) {
        queryParams.append("sort_by", `${params.sortBy},${params.sortOrder}`);
      }

      // Add any additional filters
      Object.keys(params).forEach((key) => {
        if (!["page", "limit", "search", "sortBy", "sortOrder"].includes(key)) {
          if (
            params[key] !== undefined &&
            params[key] !== null &&
            params[key] !== ""
          ) {
            queryParams.append(key, params[key]);
          }
        }
      });

      const queryString = queryParams.toString();
      const url = queryString
        ? `${this.endpoints.JOB_HISTORY}?${queryString}`
        : this.endpoints.JOB_HISTORY;

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      // Process date formatting for results (matching old implementation)
      if (
        data.results &&
        Array.isArray(data.results) &&
        data.results.length > 0
      ) {
        data.results.forEach((item) => {
          if (item.createdAt) {
            item.createdAt = DateTime.fromISO(item.createdAt).toLocaleString(
              DateTime.DATETIME_MED,
            );
          }
        });
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets job history using legacy filtersMap approach for backward compatibility
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Job history list with pagination data
   */
  async getJobHistoryWithFiltersMap(
    filtersMap = new Map(),
    onUnauthorizedCallback = null,
  ) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Build URL with filters map (matching old implementation exactly)
      let aURL = this.endpoints.JOB_HISTORY;
      filtersMap.forEach((value, key) => {
        let decamelizedkey = decamelize(key);
        if (aURL.indexOf("?") > -1) {
          aURL += "&" + decamelizedkey + "=" + encodeURIComponent(value);
        } else {
          aURL += "?" + decamelizedkey + "=" + encodeURIComponent(value);
        }
      });

      // Make the API call
      const response = await authenticatedAxios.get(aURL);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      // Process date formatting for results (matching old implementation)
      if (
        data.results !== undefined &&
        data.results !== null &&
        data.results.length > 0
      ) {
        data.results.forEach((item, index) => {
          item.createdAt = DateTime.fromISO(item.createdAt).toLocaleString(
            DateTime.DATETIME_MED,
          );
        });
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets details for a specific job history entry
   * @param {string|number} jobHistoryId - The ID of the job history entry
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Job history details
   */
  async getJobHistoryDetail(jobHistoryId, onUnauthorizedCallback = null) {
    try {
      // Validate job history ID
      if (
        !jobHistoryId ||
        (typeof jobHistoryId !== "string" && typeof jobHistoryId !== "number")
      ) {
        throw {
          jobHistoryId: "Valid job history ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.JOB_HISTORY_DETAIL.replace(
        "{id}",
        jobHistoryId,
      );

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      let data = camelizeKeys(response.data);

      // Process date formatting
      if (data.createdAt) {
        data.createdAt = DateTime.fromISO(data.createdAt).toLocaleString(
          DateTime.DATETIME_MED,
        );
      }

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log("JobHistoryAPI: Retrieved job history detail:", data);
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Creates a new job history entry
   * @param {Object} jobHistoryData - Job history data to create
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Created job history data
   */
  async createJobHistory(jobHistoryData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      console.log("createJobHistory: pre-fix:", jobHistoryData);

      // Convert camelCase to snake_case for API
      let decamelizedData = decamelizeKeys(jobHistoryData);

      console.log("createJobHistory: post-fix:", decamelizedData);

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.JOB_HISTORY,
        decamelizedData,
      );

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates a specific job history entry
   * @param {string|number} jobHistoryId - The ID of the job history entry
   * @param {Object} jobHistoryData - Job history data to update
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated job history data
   */
  async updateJobHistory(
    jobHistoryId,
    jobHistoryData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate job history ID
      if (
        !jobHistoryId ||
        (typeof jobHistoryId !== "string" && typeof jobHistoryId !== "number")
      ) {
        throw {
          jobHistoryId: "Valid job history ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      console.log("updateJobHistory: pre-fix:", jobHistoryData);

      // Convert camelCase to snake_case for API
      let decamelizedData = decamelizeKeys(jobHistoryData);

      // Ensure ID is properly set
      decamelizedData.id = jobHistoryData.id || jobHistoryId;

      console.log("updateJobHistory: post-fix:", decamelizedData);

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.JOB_HISTORY_DETAIL.replace(
        "{id}",
        jobHistoryId,
      );

      // Make the API call
      const response = await authenticatedAxios.put(url, decamelizedData);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Deletes a specific job history entry
   * @param {string|number} jobHistoryId - The ID of the job history entry to delete
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Delete response data
   */
  async deleteJobHistory(jobHistoryId, onUnauthorizedCallback = null) {
    try {
      // Validate job history ID
      if (
        !jobHistoryId ||
        (typeof jobHistoryId !== "string" && typeof jobHistoryId !== "number")
      ) {
        throw {
          jobHistoryId: "Valid job history ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.JOB_HISTORY_DETAIL.replace(
        "{id}",
        jobHistoryId,
      );

      // Make the API call
      const response = await authenticatedAxios.delete(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Archives a specific job history entry
   * @param {string|number} jobHistoryId - The ID of the job history entry to archive
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Archive response data
   */
  async archiveJobHistory(jobHistoryId, onUnauthorizedCallback = null) {
    try {
      // Validate job history ID
      if (
        !jobHistoryId ||
        (typeof jobHistoryId !== "string" && typeof jobHistoryId !== "number")
      ) {
        throw {
          jobHistoryId: "Valid job history ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const data = {
        job_history_id: jobHistoryId,
      };

      // Make the API call (assuming archive endpoint exists)
      const response = await authenticatedAxios.post(
        this.endpoints.JOB_HISTORY_ARCHIVE_OPERATION || `/job-history/archive`,
        data,
      );

      // Convert response from snake_case to camelCase
      const responseData = camelizeKeys(response.data);

      return responseData;
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
      errorData = error.response.data;
    } else if (error.response) {
      errorData = error.response;
    } else if (typeof error === "object" && error !== null) {
      // Already processed by our interceptor
      errorData = error;
    } else {
      errorData = { message: error.message || "Unknown error occurred" };
    }

    // Convert error to camelCase
    const formattedErrors = camelizeKeys(errorData);
    return formattedErrors;
  }
}
