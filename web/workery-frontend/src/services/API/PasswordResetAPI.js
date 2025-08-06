// File Path: monorepo/web/workery-frontend/src/services/API/PasswordResetAPI.js

import axios from "axios";
import { camelizeKeys } from "humps";

/**
 * PasswordResetAPI handles password recovery-related API calls
 */
export class PasswordResetAPI {
  constructor(baseURL, endpoints) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("PasswordResetAPI initialized with:", {
        baseURL: this.baseURL,
        forgotPasswordEndpoint: this.endpoints.FORGOT_PASSWORD,
        passwordResetEndpoint: this.endpoints.PASSWORD_RESET,
      });
    }
  }

  /**
   * Sends forgot password request
   * @param {string} email - User's email address
   * @returns {Promise<void>} - Resolves when request is successful
   */
  async forgotPassword(email) {
    try {
      const apiClient = this._createBasicClient();

      const requestData = { email: email };
      await apiClient.post(this.endpoints.FORGOT_PASSWORD, requestData);

      // Forgot password API typically doesn't return data
      return;
    } catch (error) {
      throw this._formatError(error, true);
    }
  }

  /**
   * Performs password reset with verification code
   * @param {Object} resetData - { verificationCode, password, passwordRepeat }
   * @returns {Promise<void>} - Resolves when reset is successful
   */
  async resetPassword(resetData) {
    try {
      const apiClient = this._createBasicClient();

      // Convert camelCase to snake_case for API
      const apiData = {
        verification_code: resetData.verificationCode,
        password: resetData.password,
        password_repeated: resetData.passwordRepeat,
      };

      await apiClient.post(this.endpoints.PASSWORD_RESET, apiData);

      // Password reset API typically doesn't return data
      return;
    } catch (error) {
      throw this._formatError(error, true);
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
