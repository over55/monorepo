// File Path: monorepo/web/workery-frontend/src/services/API/NOCAPI.js

import { camelizeKeys, decamelizeKeys } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * NOCAPI handles all National Occupational Classification-related API calls
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
        nocListEndpoint: this.endpoints.NATIONAL_OCCUPATIONAL_CLASSIFICATIONS,
        nocDetailEndpoint:
          this.endpoints.NATIONAL_OCCUPATIONAL_CLASSIFICATION_DETAIL,
        nocSelectOptionsEndpoint:
          this.endpoints.NATIONAL_OCCUPATIONAL_CLASSIFICATION_SELECT_OPTIONS,
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
        this.endpoints.NATIONAL_OCCUPATIONAL_CLASSIFICATION_SELECT_OPTIONS,
      );

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets list of NOCs with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder, code, ugt }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - NOCs list with pagination data
   */
  async getNOCs(params = {}, onUnauthorizedCallback = null) {
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

      // Add search params - FIXED: Handle all search types properly
      if (params.search) queryParams.append("search", params.search);
      if (params.code) queryParams.append("code", params.code);
      if (params.ugt) queryParams.append("ugt", params.ugt);

      // Add sorting params - FIXED: Use correct backend format
      if (params.sortBy) {
        queryParams.append("sort_field", params.sortBy);
        if (params.sortOrder) {
          queryParams.append("sort_order", params.sortOrder);
        }
      }

      // Add any additional filters that aren't already handled
      Object.keys(params).forEach((key) => {
        if (
          ![
            "page",
            "limit",
            "search",
            "sortBy",
            "sortOrder",
            "code",
            "ugt",
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
        ? `${this.endpoints.NATIONAL_OCCUPATIONAL_CLASSIFICATIONS}?${queryString}`
        : this.endpoints.NATIONAL_OCCUPATIONAL_CLASSIFICATIONS;

      // Debug log in development
      if (process.env.NODE_ENV === "development") {
        console.log("NOCAPI: Making request to:", url);
        console.log("NOCAPI: Query params:", queryString);
      }

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
   * Gets details for a specific NOC
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
      const url =
        this.endpoints.NATIONAL_OCCUPATIONAL_CLASSIFICATION_DETAIL.replace(
          "{id}",
          nocId,
        );

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
