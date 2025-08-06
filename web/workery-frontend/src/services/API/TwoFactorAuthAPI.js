// File Path: monorepo/web/workery-frontend/src/services/API/TwoFactorAuthAPI.js

import { camelizeKeys } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";

/**
 * TwoFactorAuthAPI handles all 2FA-related API calls
 */
export class TwoFactorAuthAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("TwoFactorAuthAPI initialized with:", {
        baseURL: this.baseURL,
        generateOTPEndpoint: this.endpoints.GENERATE_OTP,
        generateOTPQREndpoint: this.endpoints.GENERATE_OTP_QR,
        verifyOTPEndpoint: this.endpoints.VERIFY_OTP,
        validateOTPEndpoint: this.endpoints.VALIDATE_OTP,
        disableOTPEndpoint: this.endpoints.DISABLE_OTP,
        recoveryOTPEndpoint: this.endpoints.RECOVERY_OTP,
      });
    }
  }

  /**
   * Generates OTP secret for 2FA setup
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - OTP setup data { base32, optAuthURL }
   */
  async generateOTP(onUnauthorizedCallback = null) {
    try {
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const response = await authenticatedAxios.post(
        this.endpoints.GENERATE_OTP,
      );

      // Transform response data to match expected format
      const data = {
        base32: response.data.base32,
        optAuthURL: response.data.otpauth_url,
      };

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Generates OTP secret and QR code image for 2FA setup
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<string>} - Blob URL for the QR code image
   */
  async generateOTPAndQRCode(onUnauthorizedCallback = null) {
    try {
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const response = await authenticatedAxios.post(
        this.endpoints.GENERATE_OTP_QR,
        {},
        { responseType: "blob" },
      );

      const binaryData = response.data;

      // Create a Blob from the binary data
      const blob = new Blob([binaryData], { type: "image/png" });

      // Create a Blob URL from the Blob object
      const blobUrl = URL.createObjectURL(blob);

      console.log("TwoFactorAuthAPI: Generated QR code blob URL:", blobUrl);

      return blobUrl;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Verifies OTP during initial 2FA setup
   * @param {Object} payload - OTP verification data
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Verification response data
   */
  async verifyOTP(payload, onUnauthorizedCallback = null) {
    try {
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const response = await authenticatedAxios.post(
        this.endpoints.VERIFY_OTP,
        payload,
      );

      return response.data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Validates OTP during login/authentication
   * @param {Object} payload - OTP validation data
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Validation response data
   */
  async validateOTP(payload, onUnauthorizedCallback = null) {
    try {
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const response = await authenticatedAxios.post(
        this.endpoints.VALIDATE_OTP,
        payload,
      );

      return response.data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Disables 2FA for the current user
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Disable response data
   */
  async disableOTP(onUnauthorizedCallback = null) {
    try {
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const response = await authenticatedAxios.post(
        this.endpoints.DISABLE_OTP,
      );

      return response.data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Uses recovery code for 2FA when regular OTP is not available
   * @param {Object} payload - Recovery OTP data
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Recovery response data
   */
  async recoveryOTP(payload, onUnauthorizedCallback = null) {
    try {
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const response = await authenticatedAxios.post(
        this.endpoints.RECOVERY_OTP,
        payload,
      );

      return response.data;
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
