// File Path: monorepo/web/workery-frontend/src/services/API/TenantAPI.js

import { camelizeKeys, decamelizeKeys } from "humps";
import { createAuthenticatedAxios } from "../helpers/AuthenticatedAxios";

/**
 * TenantAPI handles tenant-related API calls
 */
export class TenantAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("TenantAPI initialized with:", {
        baseURL: this.baseURL,
        executiveVisitsTenantEndpoint: this.endpoints.EXECUTIVE_VISITS_TENANT,
      });
    }
  }

  /**
   * Executive visits tenant - allows an executive to switch to a specific tenant
   * @param {number} tenantID - The ID of the tenant to visit
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Response data from the API
   */
  async executiveVisitsTenant(tenantID, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Prepare the request data (convert to snake_case for API)
      const requestData = {
        tenant_id: tenantID,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.EXECUTIVE_VISITS_TENANT,
        requestData,
      );

      // Convert response from snake_case to camelCase
      const camelizedData = camelizeKeys(response.data);

      return camelizedData;
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
