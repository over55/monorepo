// File Path: monorepo/web/workery-frontend/src/services/API/NOCAPI.js

import { camelizeKeys } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * NOCAPI handles all National Occupational Classification-related API calls
 * This is primarily a read-only reference data API
 */
export class NOCAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("NOCAPI initialized with:", {
        baseURL: this.baseURL,
        nocListEndpoint: this.endpoints.NOC_LIST,
        nocDetailEndpoint: this.endpoints.NOC_DETAIL,
        nocSelectOptionsEndpoint: this.endpoints.NOC_SELECT_OPTIONS,
      });
    }
  }

  /**
   * Gets NOC select options for dropdowns
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - NOC select options
   */
  async getNOCSelectOptions(onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call
      const response = await authenticatedAxios.get(
        this.endpoints.NOC_SELECT_OPTIONS,
      );

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets list of National Occupational Classifications with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - NOC list with pagination data
   */
  async getNOCList(params = {}, onUnauthorizedCallback = null) {
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
        ? `${this.endpoints.NOC_LIST}?${queryString}`
        : this.endpoints.NOC_LIST;

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
   * Gets details for a specific National Occupational Classification
   * @param {string|number} nocId - The ID of the NOC
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - NOC details
   */
  async getNOCDetail(nocId, onUnauthorizedCallback = null) {
    try {
      // Validate NOC ID
      if (!nocId || (typeof nocId !== "string" && typeof nocId !== "number")) {
        throw {
          nocId: "Valid NOC ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.NOC_DETAIL.replace("{id}", nocId);

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log("NOCAPI: Retrieved NOC detail:", data);
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Search NOCs by code or title
   * @param {string} query - Search query
   * @param {Object} options - Search options { limit, includeDetails }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Search results
   */
  async searchNOCs(query, options = {}, onUnauthorizedCallback = null) {
    try {
      if (!query || typeof query !== "string" || !query.trim()) {
        throw {
          query: "Search query is required",
        };
      }

      const searchParams = {
        search: query.trim(),
        limit: options.limit || 50,
        ...options,
      };

      return await this.getNOCList(searchParams, onUnauthorizedCallback);
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets NOCs by category or skill level
   * @param {Object} filters - Filter criteria { category, skillLevel, majorGroup }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Filtered NOC results
   */
  async getNOCsByCategory(filters = {}, onUnauthorizedCallback = null) {
    try {
      const params = {
        limit: 100, // Default larger limit for category searches
        ...filters,
      };

      return await this.getNOCList(params, onUnauthorizedCallback);
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
