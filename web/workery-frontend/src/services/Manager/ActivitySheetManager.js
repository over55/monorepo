// File Path: monorepo/web/workery-frontend/src/services/Manager/ActivitySheetManager.js

/**
 * ActivitySheetManager handles all activity sheet-related business logic
 * Combines ActivitySheetAPI with ActivitySheetStorage for complete activity sheet management
 */
export class ActivitySheetManager {
  constructor(activitySheetAPI, activitySheetStorage) {
    this.activitySheetAPI = activitySheetAPI;
    this.activitySheetStorage = activitySheetStorage;
  }

  /**
   * Gets activity sheet select options with caching
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Activity sheet select options
   */
  async getActivitySheetSelectOptions(
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedOptions =
          this.activitySheetStorage.getSelectOptionsFromCache();
        if (cachedOptions) {
          return cachedOptions;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.activitySheetStorage.isSelectOptionsCacheLoading()) {
        console.log(
          "ActivitySheetManager: Select options request already in progress",
        );
        return this._waitForCurrentSelectOptionsRequest();
      }

      this.activitySheetStorage.setSelectOptionsCacheLoading(true);

      console.log("ActivitySheetManager: Fetching fresh select options data");

      try {
        // Fetch fresh data from API
        const optionsData =
          await this.activitySheetAPI.getActivitySheetSelectOptions(
            onUnauthorizedCallback,
          );

        // Save to storage cache
        this.activitySheetStorage.saveSelectOptionsToCache(optionsData);

        console.log(
          "ActivitySheetManager: Select options data fetched successfully",
        );

        return optionsData;
      } finally {
        this.activitySheetStorage.setSelectOptionsCacheLoading(false);
      }
    } catch (error) {
      this.activitySheetStorage.setSelectOptionsCacheLoading(false);
      console.error(
        "ActivitySheetManager: Failed to get select options",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets list of activity sheets with caching, filtering, and pagination
   * @param {Object} params - Query parameters
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Activity sheets list with pagination data
   */
  async getActivitySheets(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check if this is a filtered request
      const isFilteredRequest = !!(
        params.order_wjid ||
        params.order_id ||
        params.associate_id ||
        params.status ||
        params.search ||
        params.cursor // Pagination also means we shouldn't use generic cache
      );

      // For filtered requests, always get fresh data and don't use cache
      if (isFilteredRequest) {
        console.log(
          "ActivitySheetManager: Filtered request detected, bypassing cache",
          params,
        );

        // Clear any existing cache to prevent stale data from showing
        this.activitySheetStorage.clearActivitySheetsCache();

        // Set loading state
        this.activitySheetStorage.setActivitySheetsCacheLoading(true);

        try {
          // Fetch fresh data from API
          const activitySheetsData =
            await this.activitySheetAPI.getActivitySheets(
              params,
              onUnauthorizedCallback,
            );

          // Don't cache filtered results
          console.log(
            "ActivitySheetManager: Filtered activity sheets data fetched successfully (not cached):",
            {
              count: activitySheetsData.results
                ? activitySheetsData.results.length
                : 0,
              hasNextPage: activitySheetsData.hasNextPage,
              params: params,
            },
          );

          return activitySheetsData;
        } finally {
          this.activitySheetStorage.setActivitySheetsCacheLoading(false);
        }
      }

      // For unfiltered requests, use normal caching logic
      if (!forceRefresh) {
        const cachedActivitySheets =
          this.activitySheetStorage.getActivitySheetsFromCache();
        if (cachedActivitySheets) {
          console.log(
            "ActivitySheetManager: Using cached activity sheets data",
          );
          return cachedActivitySheets;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.activitySheetStorage.isActivitySheetsCacheLoading()) {
        console.log(
          "ActivitySheetManager: Activity sheets request already in progress",
        );
        return this._waitForCurrentActivitySheetsRequest();
      }

      this.activitySheetStorage.setActivitySheetsCacheLoading(true);

      console.log(
        "ActivitySheetManager: Fetching fresh activity sheets data (unfiltered)",
        params,
      );

      try {
        // Fetch fresh data from API
        const activitySheetsData =
          await this.activitySheetAPI.getActivitySheets(
            params,
            onUnauthorizedCallback,
          );

        // Cache unfiltered results
        this.activitySheetStorage.saveActivitySheetsToCache(activitySheetsData);

        console.log(
          "ActivitySheetManager: Activity sheets data fetched and cached successfully:",
          {
            count: activitySheetsData.results
              ? activitySheetsData.results.length
              : 0,
            hasNextPage: activitySheetsData.hasNextPage,
          },
        );

        return activitySheetsData;
      } finally {
        this.activitySheetStorage.setActivitySheetsCacheLoading(false);
      }
    } catch (error) {
      this.activitySheetStorage.setActivitySheetsCacheLoading(false);
      console.error(
        "ActivitySheetManager: Failed to get activity sheets",
        error,
      );
      throw error;
    }
  }

  /**
   * Creates a new activity sheet with validation
   * @param {Object} activitySheetData - Activity sheet data to create
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Created activity sheet data
   */
  async createActivitySheet(activitySheetData, onUnauthorizedCallback = null) {
    try {
      // Validate activity sheet data
      const validationErrors = this._validateActivitySheetData(
        activitySheetData,
        true,
      );
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("ActivitySheetManager: Creating new activity sheet");

      // Call API to create activity sheet
      const createdActivitySheetData =
        await this.activitySheetAPI.createActivitySheet(
          activitySheetData,
          onUnauthorizedCallback,
        );

      // Clear activity sheets cache since new data has been added
      this.activitySheetStorage.clearActivitySheetsCache();
      this.activitySheetStorage.clearSelectOptionsCache();

      console.log(
        "ActivitySheetManager: Activity sheet created successfully:",
        {
          id: createdActivitySheetData.id,
          name: createdActivitySheetData.name || createdActivitySheetData.title,
        },
      );

      return createdActivitySheetData;
    } catch (error) {
      console.error(
        "ActivitySheetManager: Failed to create activity sheet",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets details for a specific activity sheet
   * @param {string|number} activitySheetId - The ID of the activity sheet
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Activity sheet details
   */
  async getActivitySheetDetail(activitySheetId, onUnauthorizedCallback = null) {
    try {
      // Validate activity sheet ID
      const validationError = this._validateActivitySheetId(activitySheetId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `ActivitySheetManager: Fetching activity sheet detail for ID ${activitySheetId}`,
      );

      // Call API to get activity sheet details
      const activitySheetData =
        await this.activitySheetAPI.getActivitySheetDetail(
          activitySheetId,
          onUnauthorizedCallback,
        );

      console.log(
        "ActivitySheetManager: Activity sheet detail fetched successfully:",
        {
          id: activitySheetData.id,
          name: activitySheetData.name || activitySheetData.title,
        },
      );

      return activitySheetData;
    } catch (error) {
      console.error(
        "ActivitySheetManager: Failed to get activity sheet detail",
        error,
      );
      throw error;
    }
  }

  /**
   * Updates a specific activity sheet
   * @param {string|number} activitySheetId - The ID of the activity sheet
   * @param {Object} activitySheetData - Activity sheet data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated activity sheet data
   */
  async updateActivitySheet(
    activitySheetId,
    activitySheetData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate activity sheet ID
      const activitySheetIdError =
        this._validateActivitySheetId(activitySheetId);
      if (activitySheetIdError) {
        throw activitySheetIdError;
      }

      // Validate activity sheet data
      const validationErrors =
        this._validateActivitySheetData(activitySheetData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(
        `ActivitySheetManager: Updating activity sheet ID ${activitySheetId}`,
      );

      // Call API to update activity sheet
      const updatedActivitySheetData =
        await this.activitySheetAPI.updateActivitySheet(
          activitySheetId,
          activitySheetData,
          onUnauthorizedCallback,
        );

      // Clear activity sheets cache since data has been updated
      this.activitySheetStorage.clearActivitySheetsCache();
      this.activitySheetStorage.clearSelectOptionsCache();

      console.log("ActivitySheetManager: Activity sheet updated successfully");

      return updatedActivitySheetData;
    } catch (error) {
      console.error(
        "ActivitySheetManager: Failed to update activity sheet",
        error,
      );
      throw error;
    }
  }

  /**
   * Deletes a specific activity sheet
   * @param {string|number} activitySheetId - The ID of the activity sheet to delete
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Delete response
   */
  async deleteActivitySheet(activitySheetId, onUnauthorizedCallback = null) {
    try {
      // Validate activity sheet ID
      const validationError = this._validateActivitySheetId(activitySheetId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `ActivitySheetManager: Deleting activity sheet ID ${activitySheetId}`,
      );

      // Call API to delete activity sheet
      const deleteResponse = await this.activitySheetAPI.deleteActivitySheet(
        activitySheetId,
        onUnauthorizedCallback,
      );

      // Clear activity sheets cache since data has been updated
      this.activitySheetStorage.clearActivitySheetsCache();
      this.activitySheetStorage.clearSelectOptionsCache();

      console.log("ActivitySheetManager: Activity sheet deleted successfully");

      return deleteResponse;
    } catch (error) {
      console.error(
        "ActivitySheetManager: Failed to delete activity sheet",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets activity sheet preferences
   * @returns {Object|null} - Activity sheet preferences or null
   */
  getActivitySheetPreferences() {
    return this.activitySheetStorage.getActivitySheetPreferences();
  }

  /**
   * Saves activity sheet preferences
   * @param {Object} preferences - Preferences object
   */
  saveActivitySheetPreferences(preferences) {
    this.activitySheetStorage.saveActivitySheetPreferences(preferences);
  }

  /**
   * Clears the activity sheets cache
   */
  clearActivitySheetsCache() {
    this.activitySheetStorage.clearActivitySheetsCache();
  }

  /**
   * Clears the select options cache
   */
  clearSelectOptionsCache() {
    this.activitySheetStorage.clearSelectOptionsCache();
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.activitySheetStorage.clearAllCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getActivitySheetsCacheInfo() {
    return this.activitySheetStorage.getActivitySheetsCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setActivitySheetsCacheDuration(durationMs) {
    this.activitySheetStorage.setCacheDuration(durationMs);
  }

  /**
   * Sets select options cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.activitySheetStorage.setSelectOptionsCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getActivitySheetSelectOptionsWithCallbacks(
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getActivitySheetSelectOptions(onUnauthorizedCallback, forceRefresh)
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

  getActivitySheetsWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getActivitySheets(params, onUnauthorizedCallback, forceRefresh)
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

  createActivitySheetWithCallbacks(
    activitySheetData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createActivitySheet(activitySheetData, onUnauthorizedCallback)
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

  getActivitySheetDetailWithCallbacks(
    activitySheetId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getActivitySheetDetail(activitySheetId, onUnauthorizedCallback)
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

  updateActivitySheetWithCallbacks(
    activitySheetId,
    activitySheetData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateActivitySheet(
      activitySheetId,
      activitySheetData,
      onUnauthorizedCallback,
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

  deleteActivitySheetWithCallbacks(
    activitySheetId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.deleteActivitySheet(activitySheetId, onUnauthorizedCallback)
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

  _validateActivitySheetId(activitySheetId) {
    if (
      !activitySheetId ||
      (typeof activitySheetId !== "string" &&
        typeof activitySheetId !== "number")
    ) {
      return { activitySheetId: "Valid activity sheet ID is required" };
    }
    return null;
  }

  _validateActivitySheetData(activitySheetData, isCreate = false) {
    const errors = {};

    if (!activitySheetData || typeof activitySheetData !== "object") {
      errors.general = "Activity sheet data is required";
      return errors;
    }

    // Validate name or title (required)
    const name = activitySheetData.name || activitySheetData.title;
    if (isCreate && (!name || !name.trim())) {
      errors.name = "Activity sheet name/title is required";
    } else if (name && name.length > 100) {
      errors.name =
        "Activity sheet name/title must be less than 100 characters";
    }

    // Validate description (optional)
    if (
      activitySheetData.description &&
      activitySheetData.description.length > 500
    ) {
      errors.description = "Description must be less than 500 characters";
    }

    // Validate status (optional)
    if (activitySheetData.status !== undefined) {
      const validStatuses = [1, 2, 3, 4, 5]; // Based on backend constants
      if (!validStatuses.includes(activitySheetData.status)) {
        errors.status = "Invalid activity sheet status";
      }
    }

    return errors;
  }

  /**
   * Waits for current activity sheets request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentActivitySheetsRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.activitySheetStorage.isActivitySheetsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData =
            this.activitySheetStorage.getActivitySheetsFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Activity sheets request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Activity sheets request timeout"));
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
        if (!this.activitySheetStorage.isSelectOptionsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData =
            this.activitySheetStorage.getSelectOptionsFromCache();
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
