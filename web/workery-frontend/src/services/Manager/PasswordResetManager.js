// File Path: monorepo/web/workery-frontend/src/services/Manager/PasswordResetManager.js

/**
 * PasswordResetManager handles the complete password recovery workflow
 * Manages both forgot password initiation and password reset completion
 */
export class PasswordResetManager {
  constructor(passwordResetAPI) {
    this.passwordResetAPI = passwordResetAPI;
    this.resetState = {
      email: null,
      verificationCodeSent: false,
      resetInProgress: false,
    };
  }

  /**
   * Initiates forgot password workflow
   * @param {string} email - User's email address
   * @returns {Promise<void>}
   */
  async forgotPassword(email) {
    try {
      // Validate email format
      const validationError = this._validateEmail(email);
      if (validationError) {
        throw validationError;
      }

      const cleanEmail = email.trim().toLowerCase();

      // Call the API
      await this.passwordResetAPI.forgotPassword(cleanEmail);

      // Update state
      this.resetState.email = cleanEmail;
      this.resetState.verificationCodeSent = true;
      this.resetState.resetInProgress = false;

      console.log(
        "PasswordResetManager: Forgot password request sent successfully for:",
        cleanEmail,
      );
    } catch (error) {
      console.error("PasswordResetManager: Forgot password failed", error);
      throw error;
    }
  }

  /**
   * Performs password reset with verification code
   * @param {Object} resetData - { verificationCode, password, passwordRepeat }
   * @returns {Promise<void>}
   */
  async resetPassword(resetData) {
    try {
      // Validate input
      const validationErrors = this._validatePasswordResetData(resetData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      this.resetState.resetInProgress = true;

      // Call the API
      await this.passwordResetAPI.resetPassword({
        verificationCode: resetData.verificationCode.trim(),
        password: resetData.password,
        passwordRepeat: resetData.passwordRepeat,
      });

      // Clear state after successful reset
      this._clearResetState();

      console.log(
        "PasswordResetManager: Password reset completed successfully",
      );
    } catch (error) {
      this.resetState.resetInProgress = false;
      console.error("PasswordResetManager: Password reset failed", error);
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
   * Gets current password reset workflow state
   * @returns {Object} - Current state information
   */
  getResetState() {
    return {
      email: this.resetState.email,
      verificationCodeSent: this.resetState.verificationCodeSent,
      resetInProgress: this.resetState.resetInProgress,
      canProceedToReset:
        this.resetState.verificationCodeSent &&
        !this.resetState.resetInProgress,
    };
  }

  /**
   * Clears the current password reset workflow state
   */
  clearResetState() {
    this._clearResetState();
    console.log("PasswordResetManager: Reset state cleared");
  }

  /**
   * Resends the forgot password request for the current email
   * @returns {Promise<void>}
   */
  async resendVerificationCode() {
    if (!this.resetState.email) {
      throw {
        general:
          "No email address set for password reset. Please start the process again.",
      };
    }

    try {
      await this.forgotPassword(this.resetState.email);
      console.log(
        "PasswordResetManager: Verification code resent to:",
        this.resetState.email,
      );
    } catch (error) {
      console.error(
        "PasswordResetManager: Failed to resend verification code",
        error,
      );
      throw error;
    }
  }

  /**
   * Validates email format
   * @private
   * @param {string} email
   * @returns {Object|null} - Error object or null if valid
   */
  _validateEmail(email) {
    if (!email || !email.trim()) {
      return {
        email: "Email address is required",
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return {
        email: "Please enter a valid email address",
      };
    }

    return null;
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
    } else if (resetData.verificationCode.trim().length < 4) {
      errors.verificationCode = "Verification code appears to be too short";
    }

    // Validate password
    if (!resetData.password) {
      errors.password = "Password is required";
    } else if (resetData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    } else if (resetData.password.length > 128) {
      errors.password = "Password must be less than 128 characters long";
    }

    // Validate password confirmation
    if (!resetData.passwordRepeat) {
      errors.passwordRepeat = "Password confirmation is required";
    } else if (resetData.password !== resetData.passwordRepeat) {
      errors.passwordRepeat = "Passwords do not match";
    }

    // Check for common weak passwords
    if (resetData.password && this._isWeakPassword(resetData.password)) {
      errors.password =
        "Password is too weak. Please choose a stronger password.";
    }

    return errors;
  }

  /**
   * Checks if password is too weak
   * @private
   * @param {string} password
   * @returns {boolean}
   */
  _isWeakPassword(password) {
    const weakPasswords = [
      "password",
      "123456",
      "password123",
      "admin",
      "qwerty",
      "letmein",
      "welcome",
      "monkey",
      "1234567890",
    ];

    const lowerPassword = password.toLowerCase();
    return weakPasswords.some((weak) => lowerPassword.includes(weak));
  }

  /**
   * Clears the internal reset state
   * @private
   */
  _clearResetState() {
    this.resetState = {
      email: null,
      verificationCodeSent: false,
      resetInProgress: false,
    };
  }
}
