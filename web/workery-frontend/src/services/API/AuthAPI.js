// File Path: monorepo/web/workery-frontend/src/services/API/AuthAPI.js

import axios from "axios";
import { camelizeKeys, decamelizeKeys } from "humps";

/**
 * AuthAPI handles all authentication-related API calls
 */
export class AuthAPI {
  constructor(baseURL, endpoints) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("AuthAPI initialized with:", {
        baseURL: this.baseURL,
        loginEndpoint: this.endpoints.LOGIN,
        logoutEndpoint: this.endpoints.LOGOUT,
      });
    }
  }

  /**
   * Performs login API call
   * @param {Object} credentials - { email, password }
   * @returns {Promise} - Resolves to user profile data or rejects with error
   */
  async login(credentials) {
    try {
      // Create axios instance for login (no auth headers needed)
      const apiClient = this._createBasicClient();

      // Convert camelCase to snake_case for API
      const decamelizedData = decamelizeKeys(credentials);

      // Make the API call
      const response = await apiClient.post(
        this.endpoints.LOGIN,
        decamelizedData,
      );

      // Convert snake_case response to camelCase
      const profile = camelizeKeys(response.data);

      return profile;
    } catch (error) {
      throw this._formatError(error, true);
    }
  }

  /**
   * Performs logout API call
   * @returns {Promise<null>} - Always resolves to null on success
   */
  async logout() {
    try {
      const apiClient = this._createBasicClient();

      // Send empty data object for logout
      const data = {};
      await apiClient.post(this.endpoints.LOGOUT, data);

      // Logout API typically returns null or empty response
      return null;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Creates a basic axios client for unauthenticated requests
   * @private
   */
  _createBasicClient() {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }

  /**
   * Formats error responses consistently
   * @private
   * @param {Error} error - Original error from axios
   * @param {boolean} handleAuthErrors - Whether to handle "Incorrect email or password" messages
   * @returns {Object} - Formatted error object
   */
  _formatError(error, handleAuthErrors = false) {
    let errorData = null;

    // Extract error data from axios error structure
    if (error.response?.data) {
      errorData = error.response.data;
    } else if (error.response) {
      errorData = error.response;
    } else {
      errorData = error;
    }

    // Convert error to camelCase
    let formattedErrors = camelizeKeys(errorData);

    // Handle specific error messages for auth-related endpoints
    if (handleAuthErrors) {
      const errorStr = JSON.stringify(formattedErrors);
      if (errorStr.includes("Incorrect email or password")) {
        formattedErrors = {
          auth: "Incorrect email or password",
        };
      }
    }

    return formattedErrors;
  }
}
