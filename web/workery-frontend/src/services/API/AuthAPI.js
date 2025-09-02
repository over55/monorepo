// File Path: monorepo/web/workery-frontend/src/services/API/AuthAPI.js

import axios from "axios";
import { camelizeKeys, decamelizeKeys } from "humps";

/**
 * AuthAPI handles all authentication-related API calls
 */
export class AuthAPI {
  constructor(baseURL, endpoints, tokenStorage = null) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("AuthAPI initialized with:", {
        baseURL: this.baseURL,
        loginEndpoint: this.endpoints.LOGIN,
        logoutEndpoint: this.endpoints.LOGOUT,
        hasTokenStorage: !!this.tokenStorage,
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
    console.log("AuthAPI.logout: Starting logout process");

    // Always succeed logout - the backend call is optional
    // The main goal is to clear local state
    try {
      // Get the access token
      const accessToken = this.tokenStorage
        ? this.tokenStorage.getAccessToken()
        : null;

      console.log("AuthAPI.logout: Token present?", !!accessToken);

      // Only try to call backend if we have a token
      if (
        accessToken &&
        accessToken !== "undefined" &&
        accessToken !== "null"
      ) {
        // Create a simple axios request
        const fullUrl = `${this.baseURL}${this.endpoints.LOGOUT}`;
        console.log("AuthAPI.logout: Calling", fullUrl);

        // Use a promise with timeout to prevent hanging
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            console.log("AuthAPI.logout: Request timed out, continuing anyway");
            resolve(null);
          }, 3000); // 3 second timeout
        });

        const logoutPromise = axios.post(
          fullUrl,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `JWT ${accessToken}`,
            },
          },
        );

        // Race between logout and timeout
        await Promise.race([logoutPromise, timeoutPromise]);
        console.log("AuthAPI.logout: Backend logout complete");
      } else {
        console.log("AuthAPI.logout: No valid token, skipping backend call");
      }
    } catch (error) {
      // Log the error but don't throw it
      console.log(
        "AuthAPI.logout: Backend call failed, but continuing:",
        error.message,
      );
    }

    console.log("AuthAPI.logout: Logout process complete");
    return null;
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
