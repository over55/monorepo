// File Path: monorepo/web/workery-frontend/src/services/API/VersionAPI.js

import axios from "axios";
import { camelizeKeys } from "humps";

/**
 * VersionAPI handles system version information API calls
 */
export class VersionAPI {
  constructor(baseURL, endpoints) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("VersionAPI initialized with:", {
        baseURL: this.baseURL,
        versionEndpoint: this.endpoints.VERSION,
      });
    }
  }

  /**
   * Gets version information from the API
   * @returns {Promise<Object>} - Version information
   */
  async getVersion() {
    try {
      const apiClient = this._createBasicClient();

      const response = await apiClient.get(this.endpoints.VERSION);

      // Convert snake_case response to camelCase
      const data = camelizeKeys(response.data);

      return data;
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
   * @returns {Object} - Formatted error object
   */
  _formatError(error) {
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
    const formattedErrors = camelizeKeys(errorData);
    return formattedErrors;
  }
}
