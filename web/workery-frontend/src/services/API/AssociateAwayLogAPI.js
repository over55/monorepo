// File Path: monorepo/web/workery-frontend/src/services/API/AssociateAwayLogAPI.js

import { camelizeKeys, decamelizeKeys, decamelize } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * AssociateAwayLogAPI handles all associate away log-related API calls
 */
export class AssociateAwayLogAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("AssociateAwayLogAPI initialized with:", {
        baseURL: this.baseURL,
        associateAwayLogsEndpoint: this.endpoints.ASSOCIATE_AWAY_LOGS,
        associateAwayLogDetailEndpoint:
          this.endpoints.ASSOCIATE_AWAY_LOG_DETAIL,
      });
    }
  }

  /**
   * Gets list of associate away logs with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Associate away logs list with pagination data
   */
  async getAssociateAwayLogs(params = {}, onUnauthorizedCallback = null) {
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
        ? `${this.endpoints.ASSOCIATE_AWAY_LOGS}?${queryString}`
        : this.endpoints.ASSOCIATE_AWAY_LOGS;

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
        });
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets list of associate away logs using legacy filtersMap approach for backward compatibility
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Associate away logs list with pagination data
   */
  async getAssociateAwayLogsWithFiltersMap(
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
      let aURL = this.endpoints.ASSOCIATE_AWAY_LOGS;
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
   * Creates a new associate away log
   * @param {Object} associateAwayLogData - Associate away log data to create
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Created associate away log data
   */
  async createAssociateAwayLog(
    associateAwayLogData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      const decamelizedData = decamelizeKeys(associateAwayLogData);

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ASSOCIATE_AWAY_LOGS,
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
   * Gets details for a specific associate away log
   * @param {string|number} associateAwayLogId - The ID of the associate away log
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Associate away log details
   */
  async getAssociateAwayLogDetail(
    associateAwayLogId,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate associate away log ID
      if (
        !associateAwayLogId ||
        (typeof associateAwayLogId !== "string" &&
          typeof associateAwayLogId !== "number")
      ) {
        throw {
          associateAwayLogId: "Valid associate away log ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ASSOCIATE_AWAY_LOG_DETAIL.replace(
        "{id}",
        associateAwayLogId,
      );

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log(
          "AssociateAwayLogAPI: Retrieved associate away log detail:",
          data,
        );
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates a specific associate away log
   * @param {Object} decamelizedData - Already decamelized data with ID included (matching original API signature)
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated associate away log data
   */
  async updateAssociateAwayLog(decamelizedData, onUnauthorizedCallback = null) {
    try {
      // Validate that data contains ID
      if (!decamelizedData || !decamelizedData.id) {
        throw {
          id: "Associate away log ID is required in decamelized data",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ASSOCIATE_AWAY_LOG_DETAIL.replace(
        "{id}",
        decamelizedData.id,
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
   * Updates a specific associate away log (modern approach with separate ID and data)
   * @param {string|number} associateAwayLogId - The ID of the associate away log
   * @param {Object} associateAwayLogData - Associate away log data to update
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated associate away log data
   */
  async updateAssociateAwayLogModern(
    associateAwayLogId,
    associateAwayLogData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate associate away log ID
      if (
        !associateAwayLogId ||
        (typeof associateAwayLogId !== "string" &&
          typeof associateAwayLogId !== "number")
      ) {
        throw {
          associateAwayLogId: "Valid associate away log ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      const decamelizedData = decamelizeKeys(associateAwayLogData);

      // Ensure ID is included in the data
      decamelizedData.id = associateAwayLogId;

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ASSOCIATE_AWAY_LOG_DETAIL.replace(
        "{id}",
        associateAwayLogId,
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
   * Deletes a specific associate away log
   * @param {string|number} associateAwayLogId - The ID of the associate away log to delete
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Delete response data
   */
  async deleteAssociateAwayLog(
    associateAwayLogId,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate associate away log ID
      if (
        !associateAwayLogId ||
        (typeof associateAwayLogId !== "string" &&
          typeof associateAwayLogId !== "number")
      ) {
        throw {
          associateAwayLogId: "Valid associate away log ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ASSOCIATE_AWAY_LOG_DETAIL.replace(
        "{id}",
        associateAwayLogId,
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
