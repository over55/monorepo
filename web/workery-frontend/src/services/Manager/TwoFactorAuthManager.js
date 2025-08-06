// File Path: monorepo/web/workery-frontend/src/services/Manager/TwoFactorAuthManager.js

/**
 * TwoFactorAuthManager handles all 2FA-related business logic
 * Manages 2FA setup, verification, validation, and recovery workflows
 */
export class TwoFactorAuthManager {
  constructor(twoFactorAuthAPI) {
    this.twoFactorAuthAPI = twoFactorAuthAPI;
    this.setupState = {
      qrCodeBlobUrl: null,
      base32Secret: null,
      optAuthURL: null,
      isSetupInProgress: false,
      setupStep: null, // 'generate' | 'verify' | 'complete'
    };
  }

  /**
   * Generates OTP secret for 2FA setup
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - OTP setup data
   */
  async generateOTP(onUnauthorizedCallback = null) {
    try {
      this.setupState.isSetupInProgress = true;
      this.setupState.setupStep = "generate";

      console.log("TwoFactorAuthManager: Generating OTP secret");

      const otpData = await this.twoFactorAuthAPI.generateOTP(
        onUnauthorizedCallback,
      );

      // Update setup state
      this.setupState.base32Secret = otpData.base32;
      this.setupState.optAuthURL = otpData.optAuthURL;
      this.setupState.setupStep = "verify";

      console.log("TwoFactorAuthManager: OTP secret generated successfully");

      return otpData;
    } catch (error) {
      this.setupState.isSetupInProgress = false;
      this.setupState.setupStep = null;
      console.error("TwoFactorAuthManager: Failed to generate OTP", error);
      throw error;
    }
  }

  /**
   * Generates OTP secret with QR code image
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<string>} - Blob URL for QR code image
   */
  async generateOTPAndQRCode(onUnauthorizedCallback = null) {
    try {
      this.setupState.isSetupInProgress = true;
      this.setupState.setupStep = "generate";

      console.log("TwoFactorAuthManager: Generating OTP with QR code");

      const qrCodeBlobUrl = await this.twoFactorAuthAPI.generateOTPAndQRCode(
        onUnauthorizedCallback,
      );

      // Update setup state
      this.setupState.qrCodeBlobUrl = qrCodeBlobUrl;
      this.setupState.setupStep = "verify";

      console.log("TwoFactorAuthManager: OTP QR code generated successfully");

      return qrCodeBlobUrl;
    } catch (error) {
      this.setupState.isSetupInProgress = false;
      this.setupState.setupStep = null;
      console.error(
        "TwoFactorAuthManager: Failed to generate OTP QR code",
        error,
      );
      throw error;
    }
  }

  /**
   * Verifies OTP during setup process
   * @param {Object} otpData - { code, secret?, ... }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Verification result
   */
  async verifyOTP(otpData, onUnauthorizedCallback = null) {
    try {
      // Validate input
      if (!otpData || !otpData.code) {
        throw {
          code: "OTP code is required for verification",
        };
      }

      console.log("TwoFactorAuthManager: Verifying OTP during setup");

      const verificationResult = await this.twoFactorAuthAPI.verifyOTP(
        otpData,
        onUnauthorizedCallback,
      );

      // Update setup state on successful verification
      if (verificationResult) {
        this.setupState.setupStep = "complete";
        console.log("TwoFactorAuthManager: OTP verification successful");
      }

      return verificationResult;
    } catch (error) {
      console.error("TwoFactorAuthManager: OTP verification failed", error);
      throw error;
    }
  }

  /**
   * Validates OTP during login/authentication
   * @param {Object} otpData - { code, ... }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Validation result
   */
  async validateOTP(otpData, onUnauthorizedCallback = null) {
    try {
      // Validate input
      if (!otpData || !otpData.code) {
        throw {
          code: "OTP code is required for validation",
        };
      }

      console.log("TwoFactorAuthManager: Validating OTP for authentication");

      const validationResult = await this.twoFactorAuthAPI.validateOTP(
        otpData,
        onUnauthorizedCallback,
      );

      console.log("TwoFactorAuthManager: OTP validation successful");

      return validationResult;
    } catch (error) {
      console.error("TwoFactorAuthManager: OTP validation failed", error);
      throw error;
    }
  }

  /**
   * Disables 2FA for the current user
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Disable result
   */
  async disableOTP(onUnauthorizedCallback = null) {
    try {
      console.log("TwoFactorAuthManager: Disabling 2FA");

      const disableResult = await this.twoFactorAuthAPI.disableOTP(
        onUnauthorizedCallback,
      );

      // Clear setup state
      this.clearSetupState();

      console.log("TwoFactorAuthManager: 2FA disabled successfully");

      return disableResult;
    } catch (error) {
      console.error("TwoFactorAuthManager: Failed to disable 2FA", error);
      throw error;
    }
  }

  /**
   * Uses recovery code when regular OTP is not available
   * @param {Object} recoveryData - { recoveryCode, ... }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Recovery result
   */
  async recoveryOTP(recoveryData, onUnauthorizedCallback = null) {
    try {
      // Validate input
      if (!recoveryData || !recoveryData.recoveryCode) {
        throw {
          recoveryCode: "Recovery code is required",
        };
      }

      console.log("TwoFactorAuthManager: Using recovery code for 2FA");

      const recoveryResult = await this.twoFactorAuthAPI.recoveryOTP(
        recoveryData,
        onUnauthorizedCallback,
      );

      console.log("TwoFactorAuthManager: Recovery code used successfully");

      return recoveryResult;
    } catch (error) {
      console.error("TwoFactorAuthManager: Recovery code failed", error);
      throw error;
    }
  }

  /**
   * Callback-based version of generateOTP for compatibility
   */
  generateOTPWithCallbacks(
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.generateOTP(onUnauthorizedCallback)
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
   * Callback-based version of generateOTPAndQRCode for compatibility
   */
  generateOTPAndQRCodeWithCallbacks(
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.generateOTPAndQRCode(onUnauthorizedCallback)
      .then((blobUrl) => {
        if (onSuccessCallback) {
          onSuccessCallback(blobUrl);
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
   * Callback-based version of verifyOTP for compatibility
   */
  verifyOTPWithCallbacks(
    payload,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.verifyOTP(payload, onUnauthorizedCallback)
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
   * Callback-based version of validateOTP for compatibility
   */
  validateOTPWithCallbacks(
    payload,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.validateOTP(payload, onUnauthorizedCallback)
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
   * Callback-based version of disableOTP for compatibility
   */
  disableOTPWithCallbacks(
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.disableOTP(onUnauthorizedCallback)
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
   * Callback-based version of recoveryOTP for compatibility
   */
  recoveryOTPWithCallbacks(
    payload,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.recoveryOTP(payload, onUnauthorizedCallback)
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
   * Gets current 2FA setup state
   * @returns {Object} - Setup state information
   */
  getSetupState() {
    return {
      qrCodeBlobUrl: this.setupState.qrCodeBlobUrl,
      base32Secret: this.setupState.base32Secret,
      optAuthURL: this.setupState.optAuthURL,
      isSetupInProgress: this.setupState.isSetupInProgress,
      setupStep: this.setupState.setupStep,
      canProceedToVerify: this.setupState.setupStep === "verify",
      isSetupComplete: this.setupState.setupStep === "complete",
    };
  }

  /**
   * Clears the setup state
   */
  clearSetupState() {
    // Clean up blob URL to prevent memory leaks
    if (this.setupState.qrCodeBlobUrl) {
      URL.revokeObjectURL(this.setupState.qrCodeBlobUrl);
    }

    this.setupState = {
      qrCodeBlobUrl: null,
      base32Secret: null,
      optAuthURL: null,
      isSetupInProgress: false,
      setupStep: null,
    };

    console.log("TwoFactorAuthManager: Setup state cleared");
  }

  /**
   * Validates OTP code format
   * @param {string} code - OTP code to validate
   * @returns {Object|null} - Error object or null if valid
   */
  validateOTPCode(code) {
    if (!code || typeof code !== "string") {
      return { code: "OTP code is required" };
    }

    const cleanCode = code.trim().replace(/\s/g, "");

    if (cleanCode.length !== 6) {
      return { code: "OTP code must be exactly 6 digits" };
    }

    if (!/^\d{6}$/.test(cleanCode)) {
      return { code: "OTP code must contain only numbers" };
    }

    return null;
  }

  /**
   * Validates recovery code format
   * @param {string} recoveryCode - Recovery code to validate
   * @returns {Object|null} - Error object or null if valid
   */
  validateRecoveryCode(recoveryCode) {
    if (!recoveryCode || typeof recoveryCode !== "string") {
      return { recoveryCode: "Recovery code is required" };
    }

    const cleanCode = recoveryCode.trim().replace(/\s/g, "");

    if (cleanCode.length < 8) {
      return { recoveryCode: "Recovery code is too short" };
    }

    if (cleanCode.length > 32) {
      return { recoveryCode: "Recovery code is too long" };
    }

    return null;
  }
}
