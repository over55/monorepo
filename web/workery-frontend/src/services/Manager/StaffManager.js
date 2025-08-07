// File Path: monorepo/web/workery-frontend/src/services/Manager/StaffManager.js

/**
 * StaffManager handles all staff-related business logic
 * Combines StaffAPI with StaffStorage for complete staff management
 */
export class StaffManager {
  constructor(staffAPI, staffStorage) {
    this.staffAPI = staffAPI;
    this.staffStorage = staffStorage;
  }

  /**
   * Gets staff select options with caching
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Staff select options
   */
  async getStaffSelectOptions(
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedOptions = this.staffStorage.getSelectOptionsFromCache();
        if (cachedOptions) {
          return cachedOptions;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.staffStorage.isSelectOptionsCacheLoading()) {
        console.log("StaffManager: Select options request already in progress");
        return this._waitForCurrentSelectOptionsRequest();
      }

      this.staffStorage.setSelectOptionsCacheLoading(true);

      console.log("StaffManager: Fetching fresh select options data");

      try {
        // Fetch fresh data from API
        const optionsData = await this.staffAPI.getStaffSelectOptions(
          new Map(),
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.staffStorage.saveSelectOptionsToCache(optionsData);

        console.log("StaffManager: Select options data fetched successfully");

        return optionsData;
      } finally {
        this.staffStorage.setSelectOptionsCacheLoading(false);
      }
    } catch (error) {
      this.staffStorage.setSelectOptionsCacheLoading(false);
      console.error("StaffManager: Failed to get select options", error);
      throw error;
    }
  }

  /**
   * Gets list of staff with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Staff list with pagination data
   */
  async getStaff(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedStaff = this.staffStorage.getStaffFromCache();
        if (cachedStaff) {
          return cachedStaff;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.staffStorage.isStaffCacheLoading()) {
        console.log("StaffManager: Staff request already in progress");
        return this._waitForCurrentStaffRequest();
      }

      this.staffStorage.setStaffCacheLoading(true);

      console.log("StaffManager: Fetching fresh staff data", params);

      try {
        // Validate and clean parameters
        const validatedParams = this._validateStaffParams(params);

        // Fetch fresh data from API
        const staffData = await this.staffAPI.getStaff(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.staffStorage.saveStaffToCache(staffData);

        console.log("StaffManager: Staff data fetched successfully:", {
          count: staffData.results ? staffData.results.length : 0,
          totalCount: staffData.count,
        });

        return staffData;
      } finally {
        this.staffStorage.setStaffCacheLoading(false);
      }
    } catch (error) {
      this.staffStorage.setStaffCacheLoading(false);
      console.error("StaffManager: Failed to get staff", error);
      throw error;
    }
  }

  /**
   * Gets staff using legacy filtersMap approach for backward compatibility
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Staff list with pagination data
   */
  async getStaffWithFiltersMap(
    filtersMap = new Map(),
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedStaff = this.staffStorage.getStaffFromCache();
        if (cachedStaff) {
          return cachedStaff;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.staffStorage.isStaffCacheLoading()) {
        console.log("StaffManager: Staff request already in progress");
        return this._waitForCurrentStaffRequest();
      }

      this.staffStorage.setStaffCacheLoading(true);

      console.log("StaffManager: Fetching fresh staff data with filtersMap");

      try {
        // Fetch fresh data from API using legacy method
        const staffData = await this.staffAPI.getStaffWithFiltersMap(
          filtersMap,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.staffStorage.saveStaffToCache(staffData);

        console.log("StaffManager: Staff data (legacy) fetched successfully:", {
          count: staffData.results ? staffData.results.length : 0,
          totalCount: staffData.count,
        });

        return staffData;
      } finally {
        this.staffStorage.setStaffCacheLoading(false);
      }
    } catch (error) {
      this.staffStorage.setStaffCacheLoading(false);
      console.error("StaffManager: Failed to get staff (legacy)", error);
      throw error;
    }
  }

  /**
   * Creates a new staff member with validation
   * @param {Object} staffData - Staff data to create
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Created staff data
   */
  async createStaff(staffData, onUnauthorizedCallback = null) {
    try {
      // Validate staff data
      const validationErrors = this._validateStaffData(staffData, true);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("StaffManager: Creating new staff member");

      // Call API to create staff
      const createdStaffData = await this.staffAPI.createStaff(
        staffData,
        onUnauthorizedCallback,
      );

      // Clear staff cache since new data has been added
      this.staffStorage.clearStaffCache();
      this.staffStorage.clearSelectOptionsCache();

      console.log("StaffManager: Staff member created successfully:", {
        id: createdStaffData.id,
        email: createdStaffData.email,
      });

      return createdStaffData;
    } catch (error) {
      console.error("StaffManager: Failed to create staff member", error);
      throw error;
    }
  }

  /**
   * Gets details for a specific staff member
   * @param {string|number} staffId - The ID of the staff member
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Staff details
   */
  async getStaffDetail(staffId, onUnauthorizedCallback = null) {
    try {
      // Validate staff ID
      const validationError = this._validateStaffId(staffId);
      if (validationError) {
        throw validationError;
      }

      console.log(`StaffManager: Fetching staff detail for ID ${staffId}`);

      // Call API to get staff details
      const staffData = await this.staffAPI.getStaffDetail(
        staffId,
        onUnauthorizedCallback,
      );

      console.log("StaffManager: Staff detail fetched successfully:", {
        id: staffData.id,
        email: staffData.email,
      });

      return staffData;
    } catch (error) {
      console.error("StaffManager: Failed to get staff detail", error);
      throw error;
    }
  }

  /**
   * Updates a specific staff member
   * @param {string|number} staffId - The ID of the staff member
   * @param {Object} staffData - Staff data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated staff data
   */
  async updateStaff(staffId, staffData, onUnauthorizedCallback = null) {
    try {
      // Validate staff ID
      const staffIdError = this._validateStaffId(staffId);
      if (staffIdError) {
        throw staffIdError;
      }

      // Validate staff data
      const validationErrors = this._validateStaffData(staffData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(`StaffManager: Updating staff member ID ${staffId}`);

      // Call API to update staff
      const updatedStaffData = await this.staffAPI.updateStaff(
        staffId,
        staffData,
        onUnauthorizedCallback,
      );

      // Clear staff cache since data has been updated
      this.staffStorage.clearStaffCache();
      this.staffStorage.clearSelectOptionsCache();

      console.log("StaffManager: Staff member updated successfully");

      return updatedStaffData;
    } catch (error) {
      console.error("StaffManager: Failed to update staff member", error);
      throw error;
    }
  }

  /**
   * Deletes a specific staff member
   * @param {string|number} staffId - The ID of the staff member to delete
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Delete response
   */
  async deleteStaff(staffId, onUnauthorizedCallback = null) {
    try {
      // Validate staff ID
      const validationError = this._validateStaffId(staffId);
      if (validationError) {
        throw validationError;
      }

      console.log(`StaffManager: Deleting staff member ID ${staffId}`);

      // Call API to delete staff
      const deleteResponse = await this.staffAPI.deleteStaff(
        staffId,
        onUnauthorizedCallback,
      );

      // Clear staff cache since data has been updated
      this.staffStorage.clearStaffCache();
      this.staffStorage.clearSelectOptionsCache();

      console.log("StaffManager: Staff member deleted successfully");

      return deleteResponse;
    } catch (error) {
      console.error("StaffManager: Failed to delete staff member", error);
      throw error;
    }
  }

  /**
   * Archives a specific staff member
   * @param {string|number} staffId - The ID of the staff member to archive
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Archive response
   */
  async archiveStaff(staffId, onUnauthorizedCallback = null) {
    try {
      // Validate staff ID
      const validationError = this._validateStaffId(staffId);
      if (validationError) {
        throw validationError;
      }

      console.log(`StaffManager: Archiving staff member ID ${staffId}`);

      // Call API to archive staff
      const archiveResponse = await this.staffAPI.archiveStaff(
        staffId,
        onUnauthorizedCallback,
      );

      // Clear staff cache since data has been updated
      this.staffStorage.clearStaffCache();
      this.staffStorage.clearSelectOptionsCache();

      console.log("StaffManager: Staff member archived successfully");

      return archiveResponse;
    } catch (error) {
      console.error("StaffManager: Failed to archive staff member", error);
      throw error;
    }
  }

  /**
   * Permanently deletes a specific staff member
   * @param {string|number} staffId - The ID of the staff member to permanently delete
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Permanent delete response
   */
  async permanentlyDeleteStaff(staffId, onUnauthorizedCallback = null) {
    try {
      // Validate staff ID
      const validationError = this._validateStaffId(staffId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `StaffManager: Permanently deleting staff member ID ${staffId}`,
      );

      // Call API to permanently delete staff
      const deleteResponse = await this.staffAPI.permanentlyDeleteStaff(
        staffId,
        onUnauthorizedCallback,
      );

      // Clear staff cache since data has been updated
      this.staffStorage.clearStaffCache();
      this.staffStorage.clearSelectOptionsCache();

      console.log(
        "StaffManager: Staff member permanently deleted successfully",
      );

      return deleteResponse;
    } catch (error) {
      console.error(
        "StaffManager: Failed to permanently delete staff member",
        error,
      );
      throw error;
    }
  }

  /**
   * Creates a comment for a staff member
   * @param {string|number} staffId - The ID of the staff member
   * @param {string} content - Comment content
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Comment creation response
   */
  async createStaffComment(staffId, content, onUnauthorizedCallback = null) {
    try {
      // Validate parameters
      const staffIdError = this._validateStaffId(staffId);
      if (staffIdError) {
        throw staffIdError;
      }

      if (!content || typeof content !== "string" || !content.trim()) {
        throw {
          content: "Comment content is required",
        };
      }

      console.log(`StaffManager: Creating comment for staff ID ${staffId}`);

      // Call API to create comment
      const commentResponse = await this.staffAPI.createStaffComment(
        staffId,
        content,
        onUnauthorizedCallback,
      );

      console.log("StaffManager: Staff comment created successfully");

      return commentResponse;
    } catch (error) {
      console.error("StaffManager: Failed to create staff comment", error);
      throw error;
    }
  }

  /**
   * Upgrades a staff member
   * @param {Object} decamelizedData - Already decamelized upgrade data
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Upgrade response
   */
  async upgradeStaff(decamelizedData, onUnauthorizedCallback = null) {
    try {
      console.log("StaffManager: Upgrading staff member");

      // Call API to upgrade staff
      const upgradeResponse = await this.staffAPI.upgradeStaff(
        decamelizedData,
        onUnauthorizedCallback,
      );

      // Clear staff cache since data has been updated
      this.staffStorage.clearStaffCache();
      this.staffStorage.clearSelectOptionsCache();

      console.log("StaffManager: Staff member upgraded successfully");

      return upgradeResponse;
    } catch (error) {
      console.error("StaffManager: Failed to upgrade staff member", error);
      throw error;
    }
  }

  /**
   * Downgrades a staff member
   * @param {string|number} staffId - The ID of the staff member to downgrade
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Downgrade response
   */
  async downgradeStaff(staffId, onUnauthorizedCallback = null) {
    try {
      // Validate staff ID
      const validationError = this._validateStaffId(staffId);
      if (validationError) {
        throw validationError;
      }

      console.log(`StaffManager: Downgrading staff member ID ${staffId}`);

      // Call API to downgrade staff
      const downgradeResponse = await this.staffAPI.downgradeStaff(
        staffId,
        onUnauthorizedCallback,
      );

      // Clear staff cache since data has been updated
      this.staffStorage.clearStaffCache();
      this.staffStorage.clearSelectOptionsCache();

      console.log("StaffManager: Staff member downgraded successfully");

      return downgradeResponse;
    } catch (error) {
      console.error("StaffManager: Failed to downgrade staff member", error);
      throw error;
    }
  }

  /**
   * Uploads avatar for a staff member
   * @param {FormData} formData - Form data containing the avatar file
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Avatar upload response
   */
  async uploadStaffAvatar(formData, onUnauthorizedCallback = null) {
    try {
      // Validate form data
      if (!(formData instanceof FormData)) {
        throw {
          formData: "Valid FormData is required for avatar upload",
        };
      }

      console.log("StaffManager: Uploading staff avatar");

      // Call API to upload avatar
      const uploadResponse = await this.staffAPI.uploadStaffAvatar(
        formData,
        onUnauthorizedCallback,
      );

      console.log("StaffManager: Staff avatar uploaded successfully");

      return uploadResponse;
    } catch (error) {
      console.error("StaffManager: Failed to upload staff avatar", error);
      throw error;
    }
  }

  /**
   * Changes password for a staff member
   * @param {Object} passwordData - Password change data
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Password change response
   */
  async changeStaffPassword(passwordData, onUnauthorizedCallback = null) {
    try {
      console.log("StaffManager: Changing staff password");

      // Call API to change password
      const passwordResponse = await this.staffAPI.changeStaffPassword(
        passwordData,
        onUnauthorizedCallback,
      );

      console.log("StaffManager: Staff password changed successfully");

      return passwordResponse;
    } catch (error) {
      console.error("StaffManager: Failed to change staff password", error);
      throw error;
    }
  }

  /**
   * Changes two-factor authentication settings for a staff member
   * @param {Object} twoFactorData - 2FA change data
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - 2FA change response
   */
  async changeStaffTwoFactorAuth(twoFactorData, onUnauthorizedCallback = null) {
    try {
      console.log("StaffManager: Changing staff 2FA settings");

      // Call API to change 2FA
      const twoFactorResponse = await this.staffAPI.changeStaffTwoFactorAuth(
        twoFactorData,
        onUnauthorizedCallback,
      );

      console.log("StaffManager: Staff 2FA settings changed successfully");

      return twoFactorResponse;
    } catch (error) {
      console.error("StaffManager: Failed to change staff 2FA", error);
      throw error;
    }
  }

  /**
   * Gets staff preferences
   * @returns {Object|null} - Staff preferences or null
   */
  getStaffPreferences() {
    return this.staffStorage.getStaffPreferences();
  }

  /**
   * Saves staff preferences
   * @param {Object} preferences - Preferences object
   */
  saveStaffPreferences(preferences) {
    this.staffStorage.saveStaffPreferences(preferences);
  }

  /**
   * Clears the staff cache
   */
  clearStaffCache() {
    this.staffStorage.clearStaffCache();
  }

  /**
   * Clears the select options cache
   */
  clearSelectOptionsCache() {
    this.staffStorage.clearSelectOptionsCache();
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.staffStorage.clearAllCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getStaffCacheInfo() {
    return this.staffStorage.getStaffCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setStaffCacheDuration(durationMs) {
    this.staffStorage.setCacheDuration(durationMs);
  }

  /**
   * Sets select options cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.staffStorage.setSelectOptionsCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getStaffSelectOptionsWithCallbacks(
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getStaffSelectOptions(onUnauthorizedCallback, forceRefresh)
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

  getStaffWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getStaff(params, onUnauthorizedCallback, forceRefresh)
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

  getStaffWithFiltersMapWithCallbacks(
    filtersMap = new Map(),
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getStaffWithFiltersMap(
      filtersMap,
      onUnauthorizedCallback,
      forceRefresh,
    )
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

  createStaffWithCallbacks(
    staffData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createStaff(staffData, onUnauthorizedCallback)
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

  getStaffDetailWithCallbacks(
    staffId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getStaffDetail(staffId, onUnauthorizedCallback)
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

  updateStaffWithCallbacks(
    staffId,
    staffData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateStaff(staffId, staffData, onUnauthorizedCallback)
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

  deleteStaffWithCallbacks(
    staffId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.deleteStaff(staffId, onUnauthorizedCallback)
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

  archiveStaffWithCallbacks(
    staffId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.archiveStaff(staffId, onUnauthorizedCallback)
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

  permanentlyDeleteStaffWithCallbacks(
    staffId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.permanentlyDeleteStaff(staffId, onUnauthorizedCallback)
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

  createStaffCommentWithCallbacks(
    staffId,
    content,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createStaffComment(staffId, content, onUnauthorizedCallback)
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

  upgradeStaffWithCallbacks(
    decamelizedData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.upgradeStaff(decamelizedData, onUnauthorizedCallback)
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

  downgradeStaffWithCallbacks(
    staffId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.downgradeStaff(staffId, onUnauthorizedCallback)
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

  uploadStaffAvatarWithCallbacks(
    formData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.uploadStaffAvatar(formData, onUnauthorizedCallback)
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

  changeStaffPasswordWithCallbacks(
    passwordData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.changeStaffPassword(passwordData, onUnauthorizedCallback)
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

  changeStaffTwoFactorAuthWithCallbacks(
    twoFactorData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.changeStaffTwoFactorAuth(twoFactorData, onUnauthorizedCallback)
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
   * Private validation methods
   */

  _validateStaffId(staffId) {
    if (
      !staffId ||
      (typeof staffId !== "string" && typeof staffId !== "number")
    ) {
      return { staffId: "Valid staff ID is required" };
    }
    return null;
  }

  _validateStaffParams(params) {
    const validatedParams = {};

    // Validate pagination
    if (params.page && typeof params.page === "number" && params.page > 0) {
      validatedParams.page = params.page;
    }

    if (
      params.limit &&
      typeof params.limit === "number" &&
      params.limit > 0 &&
      params.limit <= 1000
    ) {
      validatedParams.limit = params.limit;
    }

    // Validate search
    if (
      params.search &&
      typeof params.search === "string" &&
      params.search.trim()
    ) {
      validatedParams.search = params.search.trim();
    }

    // Validate sorting
    if (params.sortBy && typeof params.sortBy === "string") {
      const allowedSortFields = [
        "email",
        "first_name",
        "last_name",
        "created_at",
        "updated_at",
        "status",
        "role",
      ];
      if (allowedSortFields.includes(params.sortBy)) {
        validatedParams.sortBy = params.sortBy;

        if (params.sortOrder && ["ASC", "DESC"].includes(params.sortOrder)) {
          validatedParams.sortOrder = params.sortOrder;
        } else {
          validatedParams.sortOrder = "ASC";
        }
      }
    }

    // Validate filters
    if (params.status && typeof params.status === "string") {
      validatedParams.status = params.status;
    }

    if (params.role && typeof params.role === "string") {
      validatedParams.role = params.role;
    }

    return validatedParams;
  }

  _validateStaffData(staffData, isCreate = false) {
    const errors = {};

    if (!staffData || typeof staffData !== "object") {
      errors.general = "Staff data is required";
      return errors;
    }

    // Validate email (required)
    if (!staffData.email || !staffData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffData.email)) {
      errors.email = "Valid email address is required";
    }

    // Validate first name (required)
    if (!staffData.firstName || !staffData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (staffData.firstName.length > 50) {
      errors.firstName = "First name must be less than 50 characters";
    }

    // Validate last name (required)
    if (!staffData.lastName || !staffData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (staffData.lastName.length > 50) {
      errors.lastName = "Last name must be less than 50 characters";
    }

    // Validate password (required for creation)
    if (isCreate && (!staffData.password || !staffData.password.trim())) {
      errors.password = "Password is required for new staff members";
    } else if (staffData.password && staffData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    // Validate phone number (optional)
    if (staffData.phone && staffData.phone.length > 20) {
      errors.phone = "Phone number must be less than 20 characters";
    }

    // Validate role (optional)
    if (staffData.role !== undefined) {
      const validRoles = [1, 2, 3]; // Executive, Management, Frontline
      if (!validRoles.includes(staffData.role)) {
        errors.role = "Invalid staff role";
      }
    }

    // Validate status (optional)
    if (staffData.status !== undefined) {
      const validStatuses = [1, 2]; // Active, Inactive
      if (!validStatuses.includes(staffData.status)) {
        errors.status = "Invalid staff status";
      }
    }

    return errors;
  }

  /**
   * Waits for current staff request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentStaffRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.staffStorage.isStaffCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.staffStorage.getStaffFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Staff request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Staff request timeout"));
      }, 30000);
    });
  }

  /**
   * Waits for current select options request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentSelectOptionsRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.staffStorage.isSelectOptionsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.staffStorage.getSelectOptionsFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Select options request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Select options request timeout"));
      }, 30000);
    });
  }
}
