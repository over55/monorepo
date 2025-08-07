// File Path: monorepo/web/workery-frontend/src/services/API/SkillSetAPI.js

import { camelizeKeys, decamelizeKeys } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * SkillSetAPI handles all skill set-related API calls
 */
export class SkillSetAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("SkillSetAPI initialized with:", {
        baseURL: this.baseURL,
        skillSetsEndpoint: this.endpoints.SKILL_SETS,
        skillSetDetailEndpoint: this.endpoints.SKILL_SET_DETAIL,
        skillSetSelectOptionsEndpoint: this.endpoints.SKILL_SET_SELECT_OPTIONS,
      });
    }
  }

  /**
   * Gets skill set select options for dropdowns
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Skill set select options
   */
  async getSkillSetSelectOptions(onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call
      const response = await authenticatedAxios.get(
        this.endpoints.SKILL_SET_SELECT_OPTIONS,
      );

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets list of skill sets with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Skill sets list with pagination data
   */
  async getSkillSets(params = {}, onUnauthorizedCallback = null) {
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
        ? `${this.endpoints.SKILL_SETS}?${queryString}`
        : this.endpoints.SKILL_SETS;

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
   * Creates a new skill set
   * @param {Object} skillSetData - Skill set data to create
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Created skill set data
   */
  async createSkillSet(skillSetData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      const decamelizedData = decamelizeKeys(skillSetData);

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.SKILL_SETS,
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
   * Gets details for a specific skill set
   * @param {string|number} skillSetId - The ID of the skill set
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Skill set details
   */
  async getSkillSetDetail(skillSetId, onUnauthorizedCallback = null) {
    try {
      // Validate skill set ID
      if (
        !skillSetId ||
        (typeof skillSetId !== "string" && typeof skillSetId !== "number")
      ) {
        throw {
          skillSetId: "Valid skill set ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.SKILL_SET_DETAIL.replace("{id}", skillSetId);

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log("SkillSetAPI: Retrieved skill set detail:", data);
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates a specific skill set
   * @param {string|number} skillSetId - The ID of the skill set
   * @param {Object} skillSetData - Skill set data to update
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated skill set data
   */
  async updateSkillSet(
    skillSetId,
    skillSetData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate skill set ID
      if (
        !skillSetId ||
        (typeof skillSetId !== "string" && typeof skillSetId !== "number")
      ) {
        throw {
          skillSetId: "Valid skill set ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      const decamelizedData = decamelizeKeys(skillSetData);

      // Ensure ID is included in the data
      decamelizedData.id = skillSetId;

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.SKILL_SET_DETAIL.replace("{id}", skillSetId);

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
   * Deletes a specific skill set
   * @param {string|number} skillSetId - The ID of the skill set to delete
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Delete response data
   */
  async deleteSkillSet(skillSetId, onUnauthorizedCallback = null) {
    try {
      // Validate skill set ID
      if (
        !skillSetId ||
        (typeof skillSetId !== "string" && typeof skillSetId !== "number")
      ) {
        throw {
          skillSetId: "Valid skill set ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.SKILL_SET_DETAIL.replace("{id}", skillSetId);

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
