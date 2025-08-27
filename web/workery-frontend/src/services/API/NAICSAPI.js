// File Path: monorepo/web/workery-frontend/src/services/API/NAICSAPI.js

import { camelizeKeys, decamelizeKeys } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * NAICSAPI handles all North America Industry Classification System-related API calls
 */
export class NAICSAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("NAICSAPI initialized with:", {
        baseURL: this.baseURL,
        naicsListEndpoint:
          this.endpoints.NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEMS,
        naicsDetailEndpoint:
          this.endpoints.NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEM_DETAIL,
        naicsSelectOptionsEndpoint:
          this.endpoints
            .NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEM_SELECT_OPTIONS,
      });
    }
  }

  /**
   * Gets NAICS select options for dropdowns
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - NAICS select options
   */
  async getNAICSSelectOptions(onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call
      const response = await authenticatedAxios.get(
        this.endpoints
          .NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEM_SELECT_OPTIONS,
      );

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets list of NAICS with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - NAICS list with pagination data
   */
  async getNAICS(params = {}, onUnauthorizedCallback = null, isRetry = false) {
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

      // Add specific field search params
      if (params.code) queryParams.append("code", params.code);
      if (params.industryTitle)
        queryParams.append("industry_title", params.industryTitle);

      // Also check for 'it' parameter (industry title abbreviation)
      if (params.it) queryParams.append("industry_title", params.it);

      // Add sorting params
      if (params.sortBy && params.sortOrder) {
        // Map camelCase field names to snake_case for the backend
        const sortFieldMap = {
          code: "code",
          code_str: "code_str",
          industryTitle: "industry_title",
          industry_title: "industry_title",
          createdAt: "created_at",
          created_at: "created_at",
          updatedAt: "updated_at",
          updated_at: "updated_at",
          sectorCode: "sector_code",
          sector_code: "sector_code",
          sectorTitle: "sector_title",
          sector_title: "sector_title",
          subsectorCode: "subsector_code",
          subsector_code: "subsector_code",
          subsectorTitle: "subsector_title",
          subsector_title: "subsector_title",
          industryGroupCode: "industry_group_code",
          industry_group_code: "industry_group_code",
          industryGroupTitle: "industry_group_title",
          industry_group_title: "industry_group_title",
          _id: "_id",
        };

        const mappedSortField = sortFieldMap[params.sortBy] || params.sortBy;
        queryParams.append("sort_by", `${mappedSortField},${params.sortOrder}`);
      }

      // Add any additional filters
      const excludedParams = [
        "page",
        "limit",
        "search",
        "sortBy",
        "sortOrder",
        "code",
        "industryTitle",
        "it",
      ];
      Object.keys(params).forEach((key) => {
        if (!excludedParams.includes(key)) {
          if (
            params[key] !== undefined &&
            params[key] !== null &&
            params[key] !== ""
          ) {
            // Convert camelCase to snake_case for backend
            const snakeKey = key.replace(
              /[A-Z]/g,
              (letter) => `_${letter.toLowerCase()}`,
            );
            queryParams.append(snakeKey, params[key]);
          }
        }
      });

      const queryString = queryParams.toString();
      const url = queryString
        ? `${this.endpoints.NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEMS}?${queryString}`
        : this.endpoints.NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEMS;

      // Log the request in development
      if (process.env.NODE_ENV === "development") {
        console.log("NAICSAPI: Making request to:", url);
        console.log("NAICSAPI: Query params:", queryString);
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
            // Keep the ISO format for consistency
            // The component can format it as needed
            item.createdAtFormatted = DateTime.fromISO(
              item.createdAt,
            ).toLocaleString(DateTime.DATETIME_MED);
          }
          if (item.updatedAt) {
            item.updatedAtFormatted = DateTime.fromISO(
              item.updatedAt,
            ).toLocaleString(DateTime.DATETIME_MED);
          }
        });
      }

      // Add pagination helpers
      if (data.count !== undefined) {
        const currentPage = params.page || 1;
        const pageSize = params.limit || 50;
        const totalPages = Math.ceil(data.count / pageSize);

        data.hasNextPage = currentPage < totalPages;
        data.hasPreviousPage = currentPage > 1;
        data.currentPage = currentPage;
        data.totalPages = totalPages;
        data.pageSize = pageSize;
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets details for a specific NAICS
   * @param {string|number} naicsId - The ID of the NAICS
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - NAICS details
   */
  async getNAICSDetail(naicsId, onUnauthorizedCallback = null) {
    try {
      // Validate NAICS ID
      if (
        !naicsId ||
        (typeof naicsId !== "string" && typeof naicsId !== "number")
      ) {
        throw {
          naicsId: "Valid NAICS ID is required",
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
        this.endpoints.NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEM_DETAIL.replace(
          "{id}",
          naicsId,
        );

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log("NAICSAPI: Retrieved NAICS detail:", data);
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

      // Log detailed error in development
      if (process.env.NODE_ENV === "development") {
        console.error("NAICSAPI Error Response:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      }
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

    // Add user-friendly message if not present
    if (!formattedErrors.message && formattedErrors.detail) {
      formattedErrors.message = formattedErrors.detail;
    } else if (!formattedErrors.message) {
      formattedErrors.message = "An error occurred while fetching NAICS data";
    }

    return formattedErrors;
  }
}
