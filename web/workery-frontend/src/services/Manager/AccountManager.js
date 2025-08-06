// File Path: monorepo/web/workery-frontend/src/services/Manager/AccountManager.js

/**
 * AccountManager handles all account/profile-related business logic
 * Combines AccountAPI with AccountStorage for complete account management
 */
export class AccountManager {
  constructor(accountAPI, accountStorage) {
    this.accountAPI = accountAPI;
    this.accountStorage = accountStorage;
  }

  /**
   * Gets account/profile details with automatic caching via AccountStorage
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - User profile data
   */
  async getAccountDetail(onUnauthorizedCallback = null, forceRefresh = false) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedProfile = this.accountStorage.getProfileFromCache();
        if (cachedProfile) {
          return cachedProfile;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.accountStorage.isProfileCacheLoading()) {
        console.log("AccountManager: Profile request already in progress");
        return this._waitForCurrentProfileRequest();
      }

      this.accountStorage.setProfileCacheLoading(true);

      console.log("AccountManager: Fetching fresh profile data");

      try {
        // Fetch fresh data from API
        const profileData = await this.accountAPI.getAccountDetail(
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.accountStorage.saveProfileToCache(profileData);

        console.log("AccountManager: Profile data fetched successfully:", {
          id: profileData.id,
          email: profileData.email,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
        });

        return profileData;
      } finally {
        this.accountStorage.setProfileCacheLoading(false);
      }
    } catch (error) {
      this.accountStorage.setProfileCacheLoading(false);
      console.error("AccountManager: Failed to get profile", error);
      throw error;
    }
  }

  /**
   * Updates account/profile information with validation
   * @param {Object} accountData - Profile data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated profile data
   */
  async updateAccount(accountData, onUnauthorizedCallback = null) {
    try {
      // Validate account data
      const validationErrors = this._validateAccountData(accountData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("AccountManager: Updating profile data");

      // Call API to update account
      const updatedProfileData = await this.accountAPI.updateAccount(
        accountData,
        onUnauthorizedCallback,
      );

      // Clear profile cache since data has been updated
      this.accountStorage.clearProfileCache();

      console.log("AccountManager: Profile updated successfully");

      return updatedProfileData;
    } catch (error) {
      console.error("AccountManager: Failed to update profile", error);
      throw error;
    }
  }

  /**
   * Changes account password with validation
   * @param {Object} passwordData - { oldPassword, newPassword, confirmPassword }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Password change response
   */
  async changePassword(passwordData, onUnauthorizedCallback = null) {
    try {
      // Validate password data
      const validationErrors = this._validatePasswordData(passwordData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("AccountManager: Changing password");

      // Call API to change password
      const changeResponse = await this.accountAPI.changePassword(
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        },
        onUnauthorizedCallback,
      );

      console.log("AccountManager: Password changed successfully");

      return changeResponse;
    } catch (error) {
      console.error("AccountManager: Failed to change password", error);
      throw error;
    }
  }

  /**
   * Uploads account avatar with validation
   * @param {File} avatarFile - The avatar image file
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Avatar upload response
   */
  async uploadAvatar(avatarFile, onUnauthorizedCallback = null) {
    try {
      // Validate avatar file
      const validationError = this._validateAvatarFile(avatarFile);
      if (validationError) {
        throw validationError;
      }

      console.log("AccountManager: Uploading avatar");

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      // Call API to upload avatar
      const uploadResponse = await this.accountAPI.uploadAvatar(
        formData,
        onUnauthorizedCallback,
      );

      // Clear profile cache since avatar has been updated
      this.accountStorage.clearProfileCache();

      console.log("AccountManager: Avatar uploaded successfully");

      return uploadResponse;
    } catch (error) {
      console.error("AccountManager: Failed to upload avatar", error);
      throw error;
    }
  }

  /**
   * Callback-based version of getAccountDetail for compatibility
   */
  getAccountDetailWithCallbacks(
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getAccountDetail(onUnauthorizedCallback, forceRefresh)
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
   * Callback-based version of updateAccount for compatibility
   */
  updateAccountWithCallbacks(
    accountData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateAccount(accountData, onUnauthorizedCallback)
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
   * Callback-based version of changePassword for compatibility
   */
  changePasswordWithCallbacks(
    passwordData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.changePassword(passwordData, onUnauthorizedCallback)
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
   * Callback-based version of uploadAvatar for compatibility
   */
  uploadAvatarWithCallbacks(
    avatarFile,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.uploadAvatar(avatarFile, onUnauthorizedCallback)
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
   * Clears the profile cache via AccountStorage
   */
  clearProfileCache() {
    this.accountStorage.clearProfileCache();
  }

  /**
   * Gets current cache state information from AccountStorage
   * @returns {Object} - Cache state details
   */
  getProfileCacheInfo() {
    return this.accountStorage.getProfileCacheInfo();
  }

  /**
   * Sets cache duration via AccountStorage
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setProfileCacheDuration(durationMs) {
    this.accountStorage.setCacheDuration(durationMs);
  }

  /**
   * Validates account data
   * @private
   * @param {Object} accountData - Account data to validate
   * @returns {Object} - Validation errors
   */
  _validateAccountData(accountData) {
    const errors = {};

    if (!accountData || typeof accountData !== "object") {
      errors.general = "Account data is required";
      return errors;
    }

    // Validate email if provided
    if (accountData.email !== undefined) {
      if (!accountData.email || !accountData.email.trim()) {
        errors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    // Validate first name if provided
    if (accountData.firstName !== undefined) {
      if (!accountData.firstName || !accountData.firstName.trim()) {
        errors.firstName = "First name is required";
      } else if (accountData.firstName.length > 50) {
        errors.firstName = "First name must be less than 50 characters";
      }
    }

    // Validate last name if provided
    if (accountData.lastName !== undefined) {
      if (!accountData.lastName || !accountData.lastName.trim()) {
        errors.lastName = "Last name is required";
      } else if (accountData.lastName.length > 50) {
        errors.lastName = "Last name must be less than 50 characters";
      }
    }

    // Validate phone if provided
    if (accountData.phone !== undefined) {
      if (accountData.phone && accountData.phone.length > 20) {
        errors.phone = "Phone number must be less than 20 characters";
      }
    }

    return errors;
  }

  /**
   * Validates password change data
   * @private
   * @param {Object} passwordData - Password data to validate
   * @returns {Object} - Validation errors
   */
  _validatePasswordData(passwordData) {
    const errors = {};

    if (!passwordData || typeof passwordData !== "object") {
      errors.general = "Password data is required";
      return errors;
    }

    // Validate old password
    if (!passwordData.oldPassword) {
      errors.oldPassword = "Current password is required";
    }

    // Validate new password
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters long";
    } else if (passwordData.newPassword.length > 128) {
      errors.newPassword = "New password must be less than 128 characters long";
    }

    // Validate confirm password
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Password confirmation is required";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "New password and confirmation do not match";
    }

    // Check if old and new password are the same
    if (
      passwordData.oldPassword &&
      passwordData.newPassword &&
      passwordData.oldPassword === passwordData.newPassword
    ) {
      errors.newPassword =
        "New password must be different from current password";
    }

    return errors;
  }

  /**
   * Validates avatar file
   * @private
   * @param {File} avatarFile - Avatar file to validate
   * @returns {Object|null} - Error object or null if valid
   */
  _validateAvatarFile(avatarFile) {
    if (!avatarFile) {
      return { avatar: "Avatar file is required" };
    }

    if (!(avatarFile instanceof File)) {
      return { avatar: "Invalid file format" };
    }

    // Check file size (default: 10MB limit, matching old config)
    const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
    if (avatarFile.size > maxFileSize) {
      return { avatar: "File is too large. The maximum size is 10 MB." };
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(avatarFile.type)) {
      return {
        avatar: "Invalid file type. Please upload a JPEG, PNG, or GIF image.",
      };
    }

    return null;
  }

  /**
   * Waits for current profile request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentProfileRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.accountStorage.isProfileCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.accountStorage.getProfileFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Profile request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Profile request timeout"));
      }, 30000);
    });
  }
}
