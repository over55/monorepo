// File Path: monorepo/web/workery-frontend/src/services/API/AccountAPI.js

import { camelizeKeys, decamelizeKeys } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";

/**
 * AccountAPI handles all account/profile-related API calls
 */
export class AccountAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("AccountAPI initialized with:", {
        baseURL: this.baseURL,
        profileEndpoint: this.endpoints.ACCOUNT_PROFILE,
        changePasswordEndpoint: this.endpoints.ACCOUNT_CHANGE_PASSWORD,
        avatarEndpoint: this.endpoints.ACCOUNT_AVATAR,
      });
    }
  }

  /**
   * Gets account/profile details for the authenticated user
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - User profile data
   */
  async getAccountDetail(onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call
      const response = await authenticatedAxios.get(
        this.endpoints.ACCOUNT_PROFILE,
      );

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      // Minor fix for organizationID (maintain compatibility)
      if (data.organizationId) {
        data.organizationID = data.organizationId;
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates account/profile information
   * @param {Object} accountData - Profile data to update
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated profile data
   */
  async updateAccount(accountData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      let decamelizedData = decamelizeKeys(accountData);

      // Minor fixes for address fields (maintain compatibility with backend expectations)
      if (decamelizedData.address_line1) {
        decamelizedData.address_line_1 = decamelizedData.address_line1;
        delete decamelizedData.address_line1;
      }
      if (decamelizedData.address_line2) {
        decamelizedData.address_line_2 = decamelizedData.address_line2;
        delete decamelizedData.address_line2;
      }

      // Make the API call
      const response = await authenticatedAxios.put(
        this.endpoints.ACCOUNT_PROFILE,
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
   * Changes account password
   * @param {Object} passwordData - Password change data { oldPassword, newPassword, confirmPassword }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Password change response
   */
  async changePassword(passwordData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      const decamelizedData = decamelizeKeys(passwordData);

      // Make the API call
      const response = await authenticatedAxios.put(
        this.endpoints.ACCOUNT_CHANGE_PASSWORD,
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
   * Uploads account avatar/profile picture
   * @param {FormData} formData - FormData containing the avatar file
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Avatar upload response
   */
  async uploadAvatar(formData, onUnauthorizedCallback = null) {
    try {
      // Validate that formData is provided and is FormData instance
      if (!formData || !(formData instanceof FormData)) {
        throw {
          avatar: "Valid FormData with avatar file is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call with multipart/form-data headers
      const response = await authenticatedAxios.post(
        this.endpoints.ACCOUNT_AVATAR,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        },
      );

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
