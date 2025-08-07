// File Path: monorepo/web/workery-frontend/src/services/API/InsuranceRequirementAPI.js

import { camelizeKeys, decamelizeKeys } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * InsuranceRequirementAPI handles all insurance requirement-related API calls
 */
export class InsuranceRequirementAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("InsuranceRequirementAPI initialized with:", {
        baseURL: this.baseURL,
        insuranceRequirementsEndpoint: this.endpoints.INSURANCE_REQUIREMENTS,
        insuranceRequirementDetailEndpoint:
          this.endpoints.INSURANCE_REQUIREMENT_DETAIL,
        insuranceRequirementSelectOptionsEndpoint:
          this.endpoints.INSURANCE_REQUIREMENT_SELECT_OPTIONS,
      });
    }
  }

  /**
   * Gets insurance requirement select options for dropdowns
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Insurance requirement select options
   */
  async getInsuranceRequirementSelectOptions(onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call
      const response = await authenticatedAxios.get(
        this.endpoints.INSURANCE_REQUIREMENT_SELECT_OPTIONS,
      );

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets list of insurance requirements with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Insurance requirements list with pagination data
   */
  async getInsuranceRequirements(params = {}, onUnauthorizedCallback = null) {
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
        ? `${this.endpoints.INSURANCE_REQUIREMENTS}?${queryString}`
        : this.endpoints.INSURANCE_REQUIREMENTS;

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
   * Creates a new insurance requirement
   * @param {Object} insuranceRequirementData - Insurance requirement data to create
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Created insurance requirement data
   */
  async createInsuranceRequirement(
    insuranceRequirementData,
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
      const decamelizedData = decamelizeKeys(insuranceRequirementData);

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.INSURANCE_REQUIREMENTS,
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
   * Gets details for a specific insurance requirement
   * @param {string|number} insuranceRequirementId - The ID of the insurance requirement
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Insurance requirement details
   */
  async getInsuranceRequirementDetail(
    insuranceRequirementId,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate insurance requirement ID
      if (
        !insuranceRequirementId ||
        (typeof insuranceRequirementId !== "string" &&
          typeof insuranceRequirementId !== "number")
      ) {
        throw {
          insuranceRequirementId: "Valid insurance requirement ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.INSURANCE_REQUIREMENT_DETAIL.replace(
        "{id}",
        insuranceRequirementId,
      );

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log(
          "InsuranceRequirementAPI: Retrieved insurance requirement detail:",
          data,
        );
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates a specific insurance requirement
   * @param {string|number} insuranceRequirementId - The ID of the insurance requirement
   * @param {Object} insuranceRequirementData - Insurance requirement data to update
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated insurance requirement data
   */
  async updateInsuranceRequirement(
    insuranceRequirementId,
    insuranceRequirementData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate insurance requirement ID
      if (
        !insuranceRequirementId ||
        (typeof insuranceRequirementId !== "string" &&
          typeof insuranceRequirementId !== "number")
      ) {
        throw {
          insuranceRequirementId: "Valid insurance requirement ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      const decamelizedData = decamelizeKeys(insuranceRequirementData);

      // Ensure ID is included in the data
      decamelizedData.id = insuranceRequirementId;

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.INSURANCE_REQUIREMENT_DETAIL.replace(
        "{id}",
        insuranceRequirementId,
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
   * Deletes a specific insurance requirement
   * @param {string|number} insuranceRequirementId - The ID of the insurance requirement to delete
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Delete response data
   */
  async deleteInsuranceRequirement(
    insuranceRequirementId,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate insurance requirement ID
      if (
        !insuranceRequirementId ||
        (typeof insuranceRequirementId !== "string" &&
          typeof insuranceRequirementId !== "number")
      ) {
        throw {
          insuranceRequirementId: "Valid insurance requirement ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.INSURANCE_REQUIREMENT_DETAIL.replace(
        "{id}",
        insuranceRequirementId,
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
