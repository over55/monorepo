// File Path: monorepo/web/workery-frontend/src/services/API/BulletinAPI.js

import { camelizeKeys, decamelizeKeys, decamelize } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * BulletinAPI handles all bulletin-related API calls
 */
export class BulletinAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("BulletinAPI initialized with:", {
        baseURL: this.baseURL,
        bulletinsEndpoint: this.endpoints.BULLETINS,
        bulletinDetailEndpoint: this.endpoints.BULLETIN_DETAIL,
        bulletinArchiveEndpoint: this.endpoints.BULLETIN_ARCHIVE_OPERATION,
      });
    }
  }

  /**
   * Gets list of bulletins with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Bulletins list with pagination data
   */
  async getBulletins(params = {}, onUnauthorizedCallback = null) {
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

      // FIX: Add sorting params as separate parameters matching backend expectations
      if (params.sortBy) {
        queryParams.append("sort_field", params.sortBy);
      }

      if (params.sortOrder) {
        queryParams.append("sort_order", params.sortOrder);
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
        ? `${this.endpoints.BULLETINS}?${queryString}`
        : this.endpoints.BULLETINS;

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
   * Gets list of bulletins using legacy filtersMap approach for backward compatibility
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Bulletins list with pagination data
   */
  async getBulletinsWithFiltersMap(
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

      // Build URL with filters map
      let aURL = this.endpoints.BULLETINS;
      filtersMap.forEach((value, key) => {
        let decamelizedkey = decamelize(key);

        // FIX: Special handling for sort parameters to match backend expectations
        if (key === "sortBy") {
          decamelizedkey = "sort_field";
        } else if (key === "sortOrder") {
          decamelizedkey = "sort_order";
        }

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
   * Creates a new bulletin
   * @param {Object} bulletinData - Bulletin data to create
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Created bulletin data
   */
  async createBulletin(bulletinData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      let decamelizedData = decamelizeKeys(bulletinData);

      // BUGFIX: Handle the howDidYouHearAboutUs field specially (from old implementation)
      if (bulletinData.howDidYouHearAboutUsID) {
        decamelizedData.how_did_you_hear_about_us_id =
          bulletinData.howDidYouHearAboutUsID;
        delete decamelizedData.how_did_you_hear_about_us_i_d;
      }

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.BULLETINS,
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
   * Gets details for a specific bulletin
   * @param {string|number} bulletinId - The ID of the bulletin
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Bulletin details
   */
  async getBulletinDetail(bulletinId, onUnauthorizedCallback = null) {
    try {
      // Validate bulletin ID
      if (
        !bulletinId ||
        (typeof bulletinId !== "string" && typeof bulletinId !== "number")
      ) {
        throw {
          bulletinId: "Valid bulletin ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.BULLETIN_DETAIL.replace("{id}", bulletinId);

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      let data = camelizeKeys(response.data);

      // BUGFIX: Handle the howDidYouHearAboutUs field specially (from old implementation)
      if (data.howDidYouHearAboutUsId) {
        data.howDidYouHearAboutUsID = data.howDidYouHearAboutUsId;
      }

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log("BulletinAPI: Retrieved bulletin detail:", data);
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates a specific bulletin
   * @param {string|number} bulletinId - The ID of the bulletin
   * @param {Object} bulletinData - Bulletin data to update
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated bulletin data
   */
  async updateBulletin(
    bulletinId,
    bulletinData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate bulletin ID
      if (
        !bulletinId ||
        (typeof bulletinId !== "string" && typeof bulletinId !== "number")
      ) {
        throw {
          bulletinId: "Valid bulletin ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      let decamelizedData = decamelizeKeys(bulletinData);

      // BUGFIX: Handle the howDidYouHearAboutUs field specially (from old implementation)
      if (bulletinData.howDidYouHearAboutUsID) {
        decamelizedData.how_did_you_hear_about_us_id =
          bulletinData.howDidYouHearAboutUsID;
        delete decamelizedData.how_did_you_hear_about_us_i_d;
      }

      // BUGFIX: Ensure ID is properly set (from old implementation)
      decamelizedData.id = bulletinData.id || bulletinId;
      delete decamelizedData.i_d;

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.BULLETIN_DETAIL.replace("{id}", bulletinId);

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
   * Deletes a specific bulletin
   * @param {string|number} bulletinId - The ID of the bulletin to delete
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<void>} - Delete confirmation
   */
  async deleteBulletin(bulletinId, onUnauthorizedCallback = null) {
    try {
      // Validate bulletin ID
      if (
        !bulletinId ||
        (typeof bulletinId !== "string" && typeof bulletinId !== "number")
      ) {
        throw {
          bulletinId: "Valid bulletin ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.BULLETIN_DETAIL.replace("{id}", bulletinId);

      // Make the API call
      await authenticatedAxios.delete(url);

      // Return success (original implementation returned nothing)
      return;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Archives a specific bulletin
   * @param {string|number} bulletinId - The ID of the bulletin to archive
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Archive response data
   */
  async archiveBulletin(bulletinId, onUnauthorizedCallback = null) {
    try {
      // Validate bulletin ID
      if (
        !bulletinId ||
        (typeof bulletinId !== "string" && typeof bulletinId !== "number")
      ) {
        throw {
          bulletinId: "Valid bulletin ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Note: The original implementation used 'customer_id' which seems incorrect for bulletins,
      // but keeping it for backward compatibility
      const data = {
        customer_id: bulletinId,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.BULLETIN_ARCHIVE_OPERATION,
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
