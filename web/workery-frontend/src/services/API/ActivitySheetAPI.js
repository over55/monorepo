// File Path: monorepo/web/workery-frontend/src/services/API/ActivitySheetAPI.js

import { camelizeKeys, decamelizeKeys } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * ActivitySheetAPI handles all activity sheet-related API calls
 */
export class ActivitySheetAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("ActivitySheetAPI initialized with:", {
        baseURL: this.baseURL,
        activitySheetsEndpoint: this.endpoints.ACTIVITY_SHEETS,
        activitySheetDetailEndpoint: this.endpoints.ACTIVITY_SHEET_DETAIL,
        activitySheetSelectOptionsEndpoint:
          this.endpoints.ACTIVITY_SHEET_SELECT_OPTIONS,
      });
    }
  }

  /**
   * Gets activity sheet select options for dropdowns
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Activity sheet select options
   */
  async getActivitySheetSelectOptions(onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call
      const response = await authenticatedAxios.get(
        this.endpoints.ACTIVITY_SHEET_SELECT_OPTIONS,
      );

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets list of activity sheets with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Activity sheets list with pagination data
   */
  async getActivitySheets(params = {}, onUnauthorizedCallback = null) {
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
        ? `${this.endpoints.ACTIVITY_SHEETS}?${queryString}`
        : this.endpoints.ACTIVITY_SHEETS;

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
   * Creates a new activity sheet
   * @param {Object} activitySheetData - Activity sheet data to create
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Created activity sheet data
   */
  async createActivitySheet(activitySheetData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      const decamelizedData = decamelizeKeys(activitySheetData);

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ACTIVITY_SHEETS,
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
   * Gets details for a specific activity sheet
   * @param {string|number} activitySheetId - The ID of the activity sheet
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Activity sheet details
   */
  async getActivitySheetDetail(activitySheetId, onUnauthorizedCallback = null) {
    try {
      // Validate activity sheet ID
      if (
        !activitySheetId ||
        (typeof activitySheetId !== "string" &&
          typeof activitySheetId !== "number")
      ) {
        throw {
          activitySheetId: "Valid activity sheet ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ACTIVITY_SHEET_DETAIL.replace(
        "{id}",
        activitySheetId,
      );

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log("ActivitySheetAPI: Retrieved activity sheet detail:", data);
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates a specific activity sheet
   * @param {string|number} activitySheetId - The ID of the activity sheet
   * @param {Object} activitySheetData - Activity sheet data to update
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated activity sheet data
   */
  async updateActivitySheet(
    activitySheetId,
    activitySheetData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate activity sheet ID
      if (
        !activitySheetId ||
        (typeof activitySheetId !== "string" &&
          typeof activitySheetId !== "number")
      ) {
        throw {
          activitySheetId: "Valid activity sheet ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      let decamelizedData = decamelizeKeys(activitySheetData);

      // Handle the special case for ID field (from old code)
      if (decamelizedData.i_d) {
        decamelizedData.id = decamelizedData.i_d;
        delete decamelizedData.i_d;
      }

      // Ensure ID is included in the data
      decamelizedData.id = activitySheetId;

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ACTIVITY_SHEET_DETAIL.replace(
        "{id}",
        activitySheetId,
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
   * Deletes a specific activity sheet
   * @param {string|number} activitySheetId - The ID of the activity sheet to delete
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Delete response data
   */
  async deleteActivitySheet(activitySheetId, onUnauthorizedCallback = null) {
    try {
      // Validate activity sheet ID
      if (
        !activitySheetId ||
        (typeof activitySheetId !== "string" &&
          typeof activitySheetId !== "number")
      ) {
        throw {
          activitySheetId: "Valid activity sheet ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ACTIVITY_SHEET_DETAIL.replace(
        "{id}",
        activitySheetId,
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
