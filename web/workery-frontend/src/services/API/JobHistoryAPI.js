// File Path: monorepo/web/workery-frontend/src/services/API/JobHistoryAPI.js

import { camelizeKeys, decamelizeKeys } from "humps";
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
   * Gets list of job history records with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder, associateId, customerId, startDate, endDate, status }
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

      // Add filtering params
      if (params.associateId)
        queryParams.append("associate_id", params.associateId);
      if (params.customerId)
        queryParams.append("customer_id", params.customerId);
      if (params.orderId) queryParams.append("order_id", params.orderId);
      if (params.status) queryParams.append("status", params.status);

      // Add date range filters
      if (params.startDate) queryParams.append("start_date", params.startDate);
      if (params.endDate) queryParams.append("end_date", params.endDate);

      // Add job type filter
      if (params.jobType) queryParams.append("job_type", params.jobType);

      // Add any additional filters
      Object.keys(params).forEach((key) => {
        if (
          ![
            "page",
            "limit",
            "search",
            "sortBy",
            "sortOrder",
            "associateId",
            "customerId",
            "orderId",
            "status",
            "startDate",
            "endDate",
            "jobType",
          ].includes(key)
        ) {
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

      // Process date formatting for results
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
          if (item.updatedAt) {
            item.updatedAt = DateTime.fromISO(item.updatedAt).toLocaleString(
              DateTime.DATETIME_MED,
            );
          }
          if (item.completedAt) {
            item.completedAt = DateTime.fromISO(
              item.completedAt,
            ).toLocaleString(DateTime.DATETIME_MED);
          }
          if (item.startDate) {
            item.startDate = DateTime.fromISO(item.startDate).toLocaleString(
              DateTime.DATE_MED,
            );
          }
          if (item.completionDate) {
            item.completionDate = DateTime.fromISO(
              item.completionDate,
            ).toLocaleString(DateTime.DATE_MED);
          }
        });
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets details for a specific job history record
   * @param {string|number} jobHistoryId - The ID of the job history record
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
      const data = camelizeKeys(response.data);

      // Format dates
      if (data.createdAt) {
        data.createdAt = DateTime.fromISO(data.createdAt).toLocaleString(
          DateTime.DATETIME_MED,
        );
      }
      if (data.updatedAt) {
        data.updatedAt = DateTime.fromISO(data.updatedAt).toLocaleString(
          DateTime.DATETIME_MED,
        );
      }
      if (data.completedAt) {
        data.completedAt = DateTime.fromISO(data.completedAt).toLocaleString(
          DateTime.DATETIME_MED,
        );
      }
      if (data.startDate) {
        data.startDate = DateTime.fromISO(data.startDate).toLocaleString(
          DateTime.DATE_MED,
        );
      }
      if (data.completionDate) {
        data.completionDate = DateTime.fromISO(
          data.completionDate,
        ).toLocaleString(DateTime.DATE_MED);
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
   * Gets job history statistics
   * @param {Object} params - Query parameters { associateId, customerId, startDate, endDate, jobType }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Job history statistics
   */
  async getJobHistoryStats(params = {}, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params.associateId)
        queryParams.append("associate_id", params.associateId);
      if (params.customerId)
        queryParams.append("customer_id", params.customerId);
      if (params.startDate) queryParams.append("start_date", params.startDate);
      if (params.endDate) queryParams.append("end_date", params.endDate);
      if (params.jobType) queryParams.append("job_type", params.jobType);

      const queryString = queryParams.toString();
      const url = queryString
        ? `${this.endpoints.JOB_HISTORY}/stats?${queryString}`
        : `${this.endpoints.JOB_HISTORY}/stats`;

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Exports job history data
   * @param {Object} params - Export parameters { format, associateId, customerId, startDate, endDate, jobType }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Export response data
   */
  async exportJobHistory(params = {}, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params.format) queryParams.append("format", params.format);
      if (params.associateId)
        queryParams.append("associate_id", params.associateId);
      if (params.customerId)
        queryParams.append("customer_id", params.customerId);
      if (params.startDate) queryParams.append("start_date", params.startDate);
      if (params.endDate) queryParams.append("end_date", params.endDate);
      if (params.jobType) queryParams.append("job_type", params.jobType);

      const queryString = queryParams.toString();
      const url = queryString
        ? `${this.endpoints.JOB_HISTORY}/export?${queryString}`
        : `${this.endpoints.JOB_HISTORY}/export`;

      // Make the API call
      const response = await authenticatedAxios.get(url, {
        responseType: "blob", // Handle file downloads
      });

      return response;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets job history summary for a specific associate
   * @param {string|number} associateId - The ID of the associate
   * @param {Object} params - Query parameters { startDate, endDate, jobType }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Associate job history summary
   */
  async getAssociateJobHistorySummary(
    associateId,
    params = {},
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate associate ID
      if (
        !associateId ||
        (typeof associateId !== "string" && typeof associateId !== "number")
      ) {
        throw {
          associateId: "Valid associate ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("associate_id", associateId);

      if (params.startDate) queryParams.append("start_date", params.startDate);
      if (params.endDate) queryParams.append("end_date", params.endDate);
      if (params.jobType) queryParams.append("job_type", params.jobType);

      const queryString = queryParams.toString();
      const url = `${this.endpoints.JOB_HISTORY}/associate-summary?${queryString}`;

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets job history summary for a specific customer
   * @param {string|number} customerId - The ID of the customer
   * @param {Object} params - Query parameters { startDate, endDate, jobType }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Customer job history summary
   */
  async getCustomerJobHistorySummary(
    customerId,
    params = {},
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate customer ID
      if (
        !customerId ||
        (typeof customerId !== "string" && typeof customerId !== "number")
      ) {
        throw {
          customerId: "Valid customer ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("customer_id", customerId);

      if (params.startDate) queryParams.append("start_date", params.startDate);
      if (params.endDate) queryParams.append("end_date", params.endDate);
      if (params.jobType) queryParams.append("job_type", params.jobType);

      const queryString = queryParams.toString();
      const url = `${this.endpoints.JOB_HISTORY}/customer-summary?${queryString}`;

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
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
