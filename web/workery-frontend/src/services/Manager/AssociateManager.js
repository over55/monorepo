// File Path: monorepo/web/workery-frontend/src/services/Manager/AssociateManager.js

/**
 * AssociateManager handles all associate-related business logic
 * Combines AssociateAPI with AssociateStorage for complete associate management
 */
export class AssociateManager {
  constructor(associateAPI, associateStorage) {
    this.associateAPI = associateAPI;
    this.associateStorage = associateStorage;
  }

  /**
   * Gets list of associates with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Associates list with pagination data
   */
  async getAssociates(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedAssociates = this.associateStorage.getAssociatesFromCache();
        if (cachedAssociates) {
          return cachedAssociates;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.associateStorage.isAssociatesCacheLoading()) {
        console.log("AssociateManager: Associates request already in progress");
        return this._waitForCurrentAssociatesRequest();
      }

      this.associateStorage.setAssociatesCacheLoading(true);

      console.log("AssociateManager: Fetching fresh associates data", params);

      try {
        // Validate and clean parameters
        const validatedParams = this._validateAssociatesParams(params);

        // Fetch fresh data from API
        const associatesData = await this.associateAPI.getAssociates(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.associateStorage.saveAssociatesToCache(associatesData);

        console.log("AssociateManager: Associates data fetched successfully:", {
          count: associatesData.results ? associatesData.results.length : 0,
          totalCount: associatesData.count,
        });

        return associatesData;
      } finally {
        this.associateStorage.setAssociatesCacheLoading(false);
      }
    } catch (error) {
      this.associateStorage.setAssociatesCacheLoading(false);
      console.error("AssociateManager: Failed to get associates", error);
      throw error;
    }
  }

  /**
   * Gets associates using legacy filtersMap approach for backward compatibility
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Associates list with pagination data
   */
  async getAssociatesWithFiltersMap(
    filtersMap = new Map(),
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedAssociates = this.associateStorage.getAssociatesFromCache();
        if (cachedAssociates) {
          return cachedAssociates;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.associateStorage.isAssociatesCacheLoading()) {
        console.log("AssociateManager: Associates request already in progress");
        return this._waitForCurrentAssociatesRequest();
      }

      this.associateStorage.setAssociatesCacheLoading(true);

      console.log(
        "AssociateManager: Fetching fresh associates data with filters map",
        filtersMap,
      );

      try {
        // Fetch fresh data from API using legacy method
        const associatesData =
          await this.associateAPI.getAssociatesWithFiltersMap(
            filtersMap,
            onUnauthorizedCallback,
          );

        // Save to storage cache
        this.associateStorage.saveAssociatesToCache(associatesData);

        console.log("AssociateManager: Associates data fetched successfully:", {
          count: associatesData.results ? associatesData.results.length : 0,
          totalCount: associatesData.count,
        });

        return associatesData;
      } finally {
        this.associateStorage.setAssociatesCacheLoading(false);
      }
    } catch (error) {
      this.associateStorage.setAssociatesCacheLoading(false);
      console.error("AssociateManager: Failed to get associates", error);
      throw error;
    }
  }

  /**
   * Gets associate select options with caching
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Associate select options
   */
  async getAssociateSelectOptions(
    filtersMap = new Map(),
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedOptions = this.associateStorage.getSelectOptionsFromCache();
        if (cachedOptions) {
          return cachedOptions;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.associateStorage.isSelectOptionsCacheLoading()) {
        console.log(
          "AssociateManager: Select options request already in progress",
        );
        return this._waitForCurrentSelectOptionsRequest();
      }

      this.associateStorage.setSelectOptionsCacheLoading(true);

      console.log("AssociateManager: Fetching fresh select options data");

      try {
        // Fetch fresh data from API
        const optionsData = await this.associateAPI.getAssociateSelectOptions(
          filtersMap,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.associateStorage.saveSelectOptionsToCache(optionsData);

        console.log(
          "AssociateManager: Select options data fetched successfully",
        );

        return optionsData;
      } finally {
        this.associateStorage.setSelectOptionsCacheLoading(false);
      }
    } catch (error) {
      this.associateStorage.setSelectOptionsCacheLoading(false);
      console.error("AssociateManager: Failed to get select options", error);
      throw error;
    }
  }

  /**
   * Creates a new associate with validation
   * @param {Object} associateData - Associate data to create
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Created associate data
   */
  async createAssociate(associateData, onUnauthorizedCallback = null) {
    try {
      // Validate associate data
      const validationErrors = this._validateAssociateData(associateData, true);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("AssociateManager: Creating new associate");

      // Call API to create associate
      const createdAssociateData = await this.associateAPI.createAssociate(
        associateData,
        onUnauthorizedCallback,
      );

      // Clear associates cache since new data has been added
      this.associateStorage.clearAssociatesCache();
      this.associateStorage.clearSelectOptionsCache();

      console.log("AssociateManager: Associate created successfully:", {
        id: createdAssociateData.id,
        name: `${createdAssociateData.firstName} ${createdAssociateData.lastName}`,
      });

      return createdAssociateData;
    } catch (error) {
      console.error("AssociateManager: Failed to create associate", error);
      throw error;
    }
  }

  /**
   * Gets details for a specific associate
   * @param {string|number} associateId - The ID of the associate
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Associate details
   */
  async getAssociateDetail(associateId, onUnauthorizedCallback = null) {
    try {
      // Validate associate ID
      const validationError = this._validateAssociateId(associateId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `AssociateManager: Fetching associate detail for ID ${associateId}`,
      );

      // Call API to get associate details
      const associateData = await this.associateAPI.getAssociateDetail(
        associateId,
        onUnauthorizedCallback,
      );

      console.log("AssociateManager: Associate detail fetched successfully:", {
        id: associateData.id,
        name: `${associateData.firstName} ${associateData.lastName}`,
      });

      return associateData;
    } catch (error) {
      console.error("AssociateManager: Failed to get associate detail", error);
      throw error;
    }
  }

  /**
   * Updates a specific associate
   * @param {string|number} associateId - The ID of the associate
   * @param {Object} associateData - Associate data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated associate data
   */
  async updateAssociate(
    associateId,
    associateData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate associate ID
      const associateIdError = this._validateAssociateId(associateId);
      if (associateIdError) {
        throw associateIdError;
      }

      // Validate associate data
      const validationErrors = this._validateAssociateData(associateData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(`AssociateManager: Updating associate ID ${associateId}`);

      // Call API to update associate
      const updatedAssociateData = await this.associateAPI.updateAssociate(
        associateId,
        associateData,
        onUnauthorizedCallback,
      );

      // Clear associates cache since data has been updated
      this.associateStorage.clearAssociatesCache();

      console.log("AssociateManager: Associate updated successfully");

      return updatedAssociateData;
    } catch (error) {
      console.error("AssociateManager: Failed to update associate", error);
      throw error;
    }
  }

  /**
   * Deletes a specific associate
   * @param {string|number} associateId - The ID of the associate to delete
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Delete response
   */
  async deleteAssociate(associateId, onUnauthorizedCallback = null) {
    try {
      // Validate associate ID
      const validationError = this._validateAssociateId(associateId);
      if (validationError) {
        throw validationError;
      }

      console.log(`AssociateManager: Deleting associate ID ${associateId}`);

      // Call API to delete associate
      const deleteResponse = await this.associateAPI.deleteAssociate(
        associateId,
        onUnauthorizedCallback,
      );

      // Clear associates cache since data has been updated
      this.associateStorage.clearAssociatesCache();
      this.associateStorage.clearSelectOptionsCache();

      console.log("AssociateManager: Associate deleted successfully");

      return deleteResponse;
    } catch (error) {
      console.error("AssociateManager: Failed to delete associate", error);
      throw error;
    }
  }

  /**
   * Archives a specific associate
   * @param {string|number} associateId - The ID of the associate to archive
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Archive response
   */
  async archiveAssociate(associateId, onUnauthorizedCallback = null) {
    try {
      // Validate associate ID
      const validationError = this._validateAssociateId(associateId);
      if (validationError) {
        throw validationError;
      }

      console.log(`AssociateManager: Archiving associate ID ${associateId}`);

      // Call API to archive associate
      const archiveResponse = await this.associateAPI.archiveAssociate(
        associateId,
        onUnauthorizedCallback,
      );

      // Clear associates cache since data has been updated
      this.associateStorage.clearAssociatesCache();

      console.log("AssociateManager: Associate archived successfully");

      return archiveResponse;
    } catch (error) {
      console.error("AssociateManager: Failed to archive associate", error);
      throw error;
    }
  }

  /**
   * Creates a comment for an associate
   * @param {string|number} associateId - The ID of the associate
   * @param {string} content - Comment content
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Comment creation response
   */
  async createAssociateComment(
    associateId,
    content,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate parameters
      const associateIdError = this._validateAssociateId(associateId);
      if (associateIdError) {
        throw associateIdError;
      }

      if (!content || typeof content !== "string" || !content.trim()) {
        throw { content: "Comment content is required" };
      }

      console.log(
        `AssociateManager: Creating comment for associate ${associateId}`,
      );

      // Call API to create comment
      const commentResponse = await this.associateAPI.createAssociateComment(
        associateId,
        content,
        onUnauthorizedCallback,
      );

      console.log("AssociateManager: Associate comment created successfully");

      return commentResponse;
    } catch (error) {
      console.error(
        "AssociateManager: Failed to create associate comment",
        error,
      );
      throw error;
    }
  }

  /**
   * Upgrades an associate
   * @param {Object} upgradeData - Upgrade data
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Upgrade response
   */
  async upgradeAssociate(upgradeData, onUnauthorizedCallback = null) {
    try {
      console.log("AssociateManager: Upgrading associate");

      // Call API to upgrade associate
      const upgradeResponse = await this.associateAPI.upgradeAssociate(
        upgradeData,
        onUnauthorizedCallback,
      );

      // Clear associates cache since data has been updated
      this.associateStorage.clearAssociatesCache();

      console.log("AssociateManager: Associate upgraded successfully");

      return upgradeResponse;
    } catch (error) {
      console.error("AssociateManager: Failed to upgrade associate", error);
      throw error;
    }
  }

  /**
   * Downgrades an associate
   * @param {string|number} associateId - The ID of the associate to downgrade
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Downgrade response
   */
  async downgradeAssociate(associateId, onUnauthorizedCallback = null) {
    try {
      // Validate associate ID
      const validationError = this._validateAssociateId(associateId);
      if (validationError) {
        throw validationError;
      }

      console.log(`AssociateManager: Downgrading associate ID ${associateId}`);

      // Call API to downgrade associate
      const downgradeResponse = await this.associateAPI.downgradeAssociate(
        associateId,
        onUnauthorizedCallback,
      );

      // Clear associates cache since data has been updated
      this.associateStorage.clearAssociatesCache();

      console.log("AssociateManager: Associate downgraded successfully");

      return downgradeResponse;
    } catch (error) {
      console.error("AssociateManager: Failed to downgrade associate", error);
      throw error;
    }
  }

  /**
   * Uploads avatar for an associate
   * @param {FormData} formData - Form data containing the avatar file
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Avatar upload response
   */
  async uploadAssociateAvatar(formData, onUnauthorizedCallback = null) {
    try {
      // Validate form data
      if (!(formData instanceof FormData)) {
        throw { formData: "Valid FormData is required for avatar upload" };
      }

      console.log("AssociateManager: Uploading associate avatar");

      // Call API to upload avatar
      const avatarResponse = await this.associateAPI.uploadAssociateAvatar(
        formData,
        onUnauthorizedCallback,
      );

      console.log("AssociateManager: Associate avatar uploaded successfully");

      return avatarResponse;
    } catch (error) {
      console.error(
        "AssociateManager: Failed to upload associate avatar",
        error,
      );
      throw error;
    }
  }

  /**
   * Changes password for an associate
   * @param {Object} passwordData - Password change data
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Password change response
   */
  async changeAssociatePassword(passwordData, onUnauthorizedCallback = null) {
    try {
      // Validate password data
      const validationErrors = this._validatePasswordData(passwordData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("AssociateManager: Changing associate password");

      // Call API to change password
      const passwordResponse = await this.associateAPI.changeAssociatePassword(
        passwordData,
        onUnauthorizedCallback,
      );

      console.log("AssociateManager: Associate password changed successfully");

      return passwordResponse;
    } catch (error) {
      console.error(
        "AssociateManager: Failed to change associate password",
        error,
      );
      throw error;
    }
  }

  /**
   * Changes two-factor authentication settings for an associate
   * @param {Object} twoFactorData - 2FA change data
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - 2FA change response
   */
  async changeAssociateTwoFactorAuth(
    twoFactorData,
    onUnauthorizedCallback = null,
  ) {
    try {
      console.log("AssociateManager: Changing associate 2FA settings");

      // Call API to change 2FA settings
      const twoFactorResponse =
        await this.associateAPI.changeAssociateTwoFactorAuth(
          twoFactorData,
          onUnauthorizedCallback,
        );

      console.log(
        "AssociateManager: Associate 2FA settings changed successfully",
      );

      return twoFactorResponse;
    } catch (error) {
      console.error(
        "AssociateManager: Failed to change associate 2FA settings",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets associate preferences
   * @returns {Object|null} - Associate preferences or null
   */
  getAssociatePreferences() {
    return this.associateStorage.getAssociatePreferences();
  }

  /**
   * Saves associate preferences
   * @param {Object} preferences - Preferences object
   */
  saveAssociatePreferences(preferences) {
    this.associateStorage.saveAssociatePreferences(preferences);
  }

  /**
   * Clears the associates cache
   */
  clearAssociatesCache() {
    this.associateStorage.clearAssociatesCache();
  }

  /**
   * Clears the select options cache
   */
  clearSelectOptionsCache() {
    this.associateStorage.clearSelectOptionsCache();
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.associateStorage.clearAllCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getAssociatesCacheInfo() {
    return this.associateStorage.getAssociatesCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setAssociatesCacheDuration(durationMs) {
    this.associateStorage.setCacheDuration(durationMs);
  }

  /**
   * Sets select options cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.associateStorage.setSelectOptionsCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getAssociatesWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getAssociates(params, onUnauthorizedCallback, forceRefresh)
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

  getAssociatesWithFiltersMapWithCallbacks(
    filtersMap = new Map(),
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getAssociatesWithFiltersMap(
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

  getAssociateSelectOptionsWithCallbacks(
    filtersMap = new Map(),
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getAssociateSelectOptions(
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

  createAssociateWithCallbacks(
    associateData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createAssociate(associateData, onUnauthorizedCallback)
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

  getAssociateDetailWithCallbacks(
    associateId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getAssociateDetail(associateId, onUnauthorizedCallback)
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

  updateAssociateWithCallbacks(
    associateId,
    associateData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateAssociate(associateId, associateData, onUnauthorizedCallback)
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

  deleteAssociateWithCallbacks(
    associateId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.deleteAssociate(associateId, onUnauthorizedCallback)
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

  archiveAssociateWithCallbacks(
    associateId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.archiveAssociate(associateId, onUnauthorizedCallback)
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

  createAssociateCommentWithCallbacks(
    associateId,
    content,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createAssociateComment(associateId, content, onUnauthorizedCallback)
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

  upgradeAssociateWithCallbacks(
    upgradeData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.upgradeAssociate(upgradeData, onUnauthorizedCallback)
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

  downgradeAssociateWithCallbacks(
    associateId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.downgradeAssociate(associateId, onUnauthorizedCallback)
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

  uploadAssociateAvatarWithCallbacks(
    formData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.uploadAssociateAvatar(formData, onUnauthorizedCallback)
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

  changeAssociatePasswordWithCallbacks(
    passwordData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.changeAssociatePassword(passwordData, onUnauthorizedCallback)
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

  changeAssociateTwoFactorAuthWithCallbacks(
    twoFactorData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.changeAssociateTwoFactorAuth(twoFactorData, onUnauthorizedCallback)
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

  _validateAssociateId(associateId) {
    if (
      !associateId ||
      (typeof associateId !== "string" && typeof associateId !== "number")
    ) {
      return { associateId: "Valid associate ID is required" };
    }
    return null;
  }

  _validateAssociatesParams(params) {
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

    // Validate sorting - FIXED: Only include backend-supported sort fields
    if (params.sortBy && typeof params.sortBy === "string") {
      const allowedSortFields = ["lexical_name", "join_date"];
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

    if (params.typeOf && typeof params.typeOf === "string") {
      validatedParams.typeOf = params.typeOf;
    }

    return validatedParams;
  }

  _validateAssociateData(associateData, isCreate = false) {
    const errors = {};

    if (!associateData || typeof associateData !== "object") {
      errors.general = "Associate data is required";
      return errors;
    }

    // Validate first name (required)
    if (!associateData.firstName || !associateData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (associateData.firstName.length > 50) {
      errors.firstName = "First name must be less than 50 characters";
    }

    // Validate last name (required)
    if (!associateData.lastName || !associateData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (associateData.lastName.length > 50) {
      errors.lastName = "Last name must be less than 50 characters";
    }

    // Validate email (required)
    if (!associateData.email || !associateData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(associateData.email.trim())) {
      errors.email = "Invalid email format";
    }

    // Validate phone (optional)
    if (associateData.phone && associateData.phone.length > 20) {
      errors.phone = "Phone number must be less than 20 characters";
    }

    // Validate associate type (optional)
    if (associateData.typeOf !== undefined) {
      const validTypes = [1, 2, 3]; // Unassigned, Residential, Commercial
      if (!validTypes.includes(associateData.typeOf)) {
        errors.typeOf = "Invalid associate type";
      }
    }

    // Validate status (optional)
    if (associateData.status !== undefined) {
      const validStatuses = [1, 2]; // Active, Archived
      if (!validStatuses.includes(associateData.status)) {
        errors.status = "Invalid associate status";
      }
    }

    return errors;
  }

  _validatePasswordData(passwordData) {
    const errors = {};

    if (!passwordData || typeof passwordData !== "object") {
      errors.general = "Password data is required";
      return errors;
    }

    // Validate current password
    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    // Validate new password
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "New password must be at least 8 characters";
    }

    // Validate password confirmation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Password confirmation does not match";
    }

    return errors;
  }

  /**
   * Waits for current associates request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentAssociatesRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.associateStorage.isAssociatesCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.associateStorage.getAssociatesFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Associates request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Associates request timeout"));
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
        if (!this.associateStorage.isSelectOptionsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.associateStorage.getSelectOptionsFromCache();
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
