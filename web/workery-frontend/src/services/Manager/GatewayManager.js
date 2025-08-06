// File Path: monorepo/web/workery-frontend/src/services/Manager/GatewayManager.js

/**
 * GatewayManager combines GatewayAPI with business logic for gateway operations
 * Handles system information, logout, and password recovery workflows
 */
export class GatewayManager {
  constructor(gatewayAPI, tokenStorage = null) {
    this.gatewayAPI = gatewayAPI;
    this.tokenStorage = tokenStorage; // Optional, for logout cleanup
  }

  /**
   * Gets version information from the API
   * @returns {Promise<Object>} - Version information
   */
  async getVersion() {
    try {
      const versionData = await this.gatewayAPI.getVersion();
      return versionData;
    } catch (error) {
      console.error("GatewayManager: Failed to get version", error);
      throw error;
    }
  }

  /**
   * Callback-based version of getVersion for compatibility
   * @param {Function} onSuccessCallback
   * @param {Function} onErrorCallback
   * @param {Function} onDoneCallback
   */
  getVersionWithCallbacks(onSuccessCallback, onErrorCallback, onDoneCallback) {
    this.getVersion()
      .then((data) => {
        if (onSuccessCallback) {
          onSuccessCallback(data);
        }
      })
      .catch((error) => {
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      })
      .finally(() => {
        if (onDoneCallback) {
          onDoneCallback();
        }
      });
  }

  /**
   * Performs complete logout workflow
   * Calls the logout API and cleans up local tokens
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // Call the logout API endpoint
      await this.gatewayAPI.logout();

      // Clean up local tokens if token storage is available
      if (this.tokenStorage) {
        this.tokenStorage.clearTokens();
        console.log("GatewayManager: Cleared tokens after logout");
      }

      console.log("GatewayManager: Logout completed successfully");
    } catch (error) {
      console.error("GatewayManager: Logout failed", error);

      // Even if API call fails, clean up tokens locally
      if (this.tokenStorage) {
        this.tokenStorage.clearTokens();
        console.log("GatewayManager: Cleared tokens after logout error");
      }

      throw error;
    }
  }

  /**
   * Callback-based version of logout for compatibility
   * @param {Function} onSuccessCallback
   * @param {Function} onErrorCallback
   * @param {Function} onDoneCallback
   */
  logoutWithCallbacks(onSuccessCallback, onErrorCallback, onDoneCallback) {
    this.logout()
      .then(() => {
        if (onSuccessCallback) {
          onSuccessCallback(null);
        }
      })
      .catch((error) => {
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      })
      .finally(() => {
        if (onDoneCallback) {
          onDoneCallback();
        }
      });
  }

  /**
   * Initiates forgot password workflow
   * @param {string} email - User's email address
   * @returns {Promise<void>}
   */
  async forgotPassword(email) {
    try {
      // Validate email format
      if (!email || !email.trim()) {
        throw {
          email: "Email address is required",
        };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw {
          email: "Please enter a valid email address",
        };
      }

      // Call the API
      await this.gatewayAPI.forgotPassword(email.trim().toLowerCase());

      console.log("GatewayManager: Forgot password request sent successfully");
    } catch (error) {
      console.error("GatewayManager: Forgot password failed", error);
      throw error;
    }
  }

  /**
   * Callback-based version of forgotPassword for compatibility
   * @param {string} email
   * @param {Function} onSuccessCallback
   * @param {Function} onErrorCallback
   * @param {Function} onDoneCallback
   */
  forgotPasswordWithCallbacks(
    email,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
  ) {
    this.forgotPassword(email)
      .then(() => {
        if (onSuccessCallback) {
          onSuccessCallback();
        }
      })
      .catch((error) => {
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      })
      .finally(() => {
        if (onDoneCallback) {
          onDoneCallback();
        }
      });
  }

  /**
   * Performs password reset with verification code
   * @param {Object} resetData - { verificationCode, password, passwordRepeat }
   * @returns {Promise<void>}
   */
  async resetPassword(resetData) {
    try {
      // Validate input
      const errors = this._validatePasswordResetData(resetData);
      if (Object.keys(errors).length > 0) {
        throw errors;
      }

      // Call the API
      await this.gatewayAPI.resetPassword({
        verificationCode: resetData.verificationCode.trim(),
        password: resetData.password,
        passwordRepeat: resetData.passwordRepeat,
      });

      console.log("GatewayManager: Password reset completed successfully");
    } catch (error) {
      console.error("GatewayManager: Password reset failed", error);
      throw error;
    }
  }

  /**
   * Callback-based version of resetPassword for compatibility
   * @param {string} verificationCode
   * @param {string} password
   * @param {string} passwordRepeat
   * @param {Function} onSuccessCallback
   * @param {Function} onErrorCallback
   * @param {Function} onDoneCallback
   */
  resetPasswordWithCallbacks(
    verificationCode,
    password,
    passwordRepeat,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
  ) {
    this.resetPassword({ verificationCode, password, passwordRepeat })
      .then(() => {
        if (onSuccessCallback) {
          onSuccessCallback();
        }
      })
      .catch((error) => {
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      })
      .finally(() => {
        if (onDoneCallback) {
          onDoneCallback();
        }
      });
  }

  /**
   * Validates password reset data
   * @private
   * @param {Object} resetData
   * @returns {Object} - Error object
   */
  _validatePasswordResetData(resetData) {
    const errors = {};

    // Validate verification code
    if (!resetData.verificationCode || !resetData.verificationCode.trim()) {
      errors.verificationCode = "Verification code is required";
    }

    // Validate password
    if (!resetData.password) {
      errors.password = "Password is required";
    } else if (resetData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    // Validate password confirmation
    if (!resetData.passwordRepeat) {
      errors.passwordRepeat = "Password confirmation is required";
    } else if (resetData.password !== resetData.passwordRepeat) {
      errors.passwordRepeat = "Passwords do not match";
    }

    return errors;
  }
}
