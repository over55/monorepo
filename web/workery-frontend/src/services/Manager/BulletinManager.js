// File Path: monorepo/web/workery-frontend/src/services/Manager/BulletinManager.js

/**
 * BulletinManager handles all bulletin-related business logic
 * Combines BulletinAPI with BulletinStorage for complete bulletin management
 */
export class BulletinManager {
  constructor(bulletinAPI, bulletinStorage) {
    this.bulletinAPI = bulletinAPI;
    this.bulletinStorage = bulletinStorage;
  }

  /**
   * Gets list of bulletins with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Bulletins list with pagination data
   */
  async getBulletins(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedBulletins = this.bulletinStorage.getBulletinsFromCache();
        if (cachedBulletins) {
          return cachedBulletins;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.bulletinStorage.isBulletinsCacheLoading()) {
        console.log("BulletinManager: Bulletins request already in progress");
        return this._waitForCurrentBulletinsRequest();
      }

      this.bulletinStorage.setBulletinsCacheLoading(true);

      console.log("BulletinManager: Fetching fresh bulletins data", params);

      try {
        // Validate and clean parameters
        const validatedParams = this._validateBulletinsParams(params);

        // Fetch fresh data from API
        const bulletinsData = await this.bulletinAPI.getBulletins(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.bulletinStorage.saveBulletinsToCache(bulletinsData);

        console.log("BulletinManager: Bulletins data fetched successfully:", {
          count: bulletinsData.results ? bulletinsData.results.length : 0,
          totalCount: bulletinsData.count,
        });

        return bulletinsData;
      } finally {
        this.bulletinStorage.setBulletinsCacheLoading(false);
      }
    } catch (error) {
      this.bulletinStorage.setBulletinsCacheLoading(false);
      console.error("BulletinManager: Failed to get bulletins", error);
      throw error;
    }
  }

  /**
   * Gets list of bulletins using legacy filtersMap approach for backward compatibility
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Bulletins list with pagination data
   */
  async getBulletinsWithFiltersMap(
    filtersMap = new Map(),
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedBulletins = this.bulletinStorage.getBulletinsFromCache();
        if (cachedBulletins) {
          return cachedBulletins;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.bulletinStorage.isBulletinsCacheLoading()) {
        console.log("BulletinManager: Bulletins request already in progress");
        return this._waitForCurrentBulletinsRequest();
      }

      this.bulletinStorage.setBulletinsCacheLoading(true);

      console.log(
        "BulletinManager: Fetching fresh bulletins data with filtersMap",
        filtersMap,
      );

      try {
        // Fetch fresh data from API using filtersMap
        const bulletinsData = await this.bulletinAPI.getBulletinsWithFiltersMap(
          filtersMap,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.bulletinStorage.saveBulletinsToCache(bulletinsData);

        console.log("BulletinManager: Bulletins data fetched successfully:", {
          count: bulletinsData.results ? bulletinsData.results.length : 0,
          totalCount: bulletinsData.count,
        });

        return bulletinsData;
      } finally {
        this.bulletinStorage.setBulletinsCacheLoading(false);
      }
    } catch (error) {
      this.bulletinStorage.setBulletinsCacheLoading(false);
      console.error(
        "BulletinManager: Failed to get bulletins with filtersMap",
        error,
      );
      throw error;
    }
  }

  /**
   * Creates a new bulletin with validation
   * @param {Object} bulletinData - Bulletin data to create
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Created bulletin data
   */
  async createBulletin(bulletinData, onUnauthorizedCallback = null) {
    try {
      // Validate bulletin data
      const validationErrors = this._validateBulletinData(bulletinData, true);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("BulletinManager: Creating new bulletin");

      // Call API to create bulletin
      const createdBulletinData = await this.bulletinAPI.createBulletin(
        bulletinData,
        onUnauthorizedCallback,
      );

      // Clear bulletins cache since new data has been added
      this.bulletinStorage.clearBulletinsCache();

      console.log("BulletinManager: Bulletin created successfully:", {
        id: createdBulletinData.id,
        text: createdBulletinData.text,
      });

      return createdBulletinData;
    } catch (error) {
      console.error("BulletinManager: Failed to create bulletin", error);
      throw error;
    }
  }

  /**
   * Gets details for a specific bulletin
   * @param {string|number} bulletinId - The ID of the bulletin
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Bulletin details
   */
  async getBulletinDetail(bulletinId, onUnauthorizedCallback = null) {
    try {
      // Validate bulletin ID
      const validationError = this._validateBulletinId(bulletinId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `BulletinManager: Fetching bulletin detail for ID ${bulletinId}`,
      );

      // Call API to get bulletin details
      const bulletinData = await this.bulletinAPI.getBulletinDetail(
        bulletinId,
        onUnauthorizedCallback,
      );

      console.log("BulletinManager: Bulletin detail fetched successfully:", {
        id: bulletinData.id,
        text: bulletinData.text,
      });

      return bulletinData;
    } catch (error) {
      console.error("BulletinManager: Failed to get bulletin detail", error);
      throw error;
    }
  }

  /**
   * Updates a specific bulletin
   * @param {string|number} bulletinId - The ID of the bulletin
   * @param {Object} bulletinData - Bulletin data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated bulletin data
   */
  async updateBulletin(
    bulletinId,
    bulletinData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate bulletin ID
      const bulletinIdError = this._validateBulletinId(bulletinId);
      if (bulletinIdError) {
        throw bulletinIdError;
      }

      // Validate bulletin data
      const validationErrors = this._validateBulletinData(bulletinData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(`BulletinManager: Updating bulletin ID ${bulletinId}`);

      // Call API to update bulletin
      const updatedBulletinData = await this.bulletinAPI.updateBulletin(
        bulletinId,
        bulletinData,
        onUnauthorizedCallback,
      );

      // Clear bulletins cache since data has been updated
      this.bulletinStorage.clearBulletinsCache();

      console.log("BulletinManager: Bulletin updated successfully");

      return updatedBulletinData;
    } catch (error) {
      console.error("BulletinManager: Failed to update bulletin", error);
      throw error;
    }
  }

  /**
   * Deletes a specific bulletin
   * @param {string|number} bulletinId - The ID of the bulletin to delete
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<void>} - Delete confirmation
   */
  async deleteBulletin(bulletinId, onUnauthorizedCallback = null) {
    try {
      // Validate bulletin ID
      const validationError = this._validateBulletinId(bulletinId);
      if (validationError) {
        throw validationError;
      }

      console.log(`BulletinManager: Deleting bulletin ID ${bulletinId}`);

      // Call API to delete bulletin
      await this.bulletinAPI.deleteBulletin(bulletinId, onUnauthorizedCallback);

      // Clear bulletins cache since data has been updated
      this.bulletinStorage.clearBulletinsCache();

      console.log("BulletinManager: Bulletin deleted successfully");
    } catch (error) {
      console.error("BulletinManager: Failed to delete bulletin", error);
      throw error;
    }
  }

  /**
   * Archives a specific bulletin
   * @param {string|number} bulletinId - The ID of the bulletin to archive
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Archive response data
   */
  async archiveBulletin(bulletinId, onUnauthorizedCallback = null) {
    try {
      // Validate bulletin ID
      const validationError = this._validateBulletinId(bulletinId);
      if (validationError) {
        throw validationError;
      }

      console.log(`BulletinManager: Archiving bulletin ID ${bulletinId}`);

      // Call API to archive bulletin
      const archiveResponse = await this.bulletinAPI.archiveBulletin(
        bulletinId,
        onUnauthorizedCallback,
      );

      // Clear bulletins cache since data has been updated
      this.bulletinStorage.clearBulletinsCache();

      console.log("BulletinManager: Bulletin archived successfully");

      return archiveResponse;
    } catch (error) {
      console.error("BulletinManager: Failed to archive bulletin", error);
      throw error;
    }
  }

  /**
   * Gets bulletin preferences
   * @returns {Object|null} - Bulletin preferences or null
   */
  getBulletinPreferences() {
    return this.bulletinStorage.getBulletinPreferences();
  }

  /**
   * Saves bulletin preferences
   * @param {Object} preferences - Preferences object
   */
  saveBulletinPreferences(preferences) {
    this.bulletinStorage.saveBulletinPreferences(preferences);
  }

  /**
   * Clears the bulletins cache
   */
  clearBulletinsCache() {
    this.bulletinStorage.clearBulletinsCache();
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.bulletinStorage.clearAllCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getBulletinsCacheInfo() {
    return this.bulletinStorage.getBulletinsCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setBulletinsCacheDuration(durationMs) {
    this.bulletinStorage.setCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getBulletinsWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getBulletins(params, onUnauthorizedCallback, forceRefresh)
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

  getBulletinsWithFiltersMapAndCallbacks(
    filtersMap = new Map(),
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getBulletinsWithFiltersMap(
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

  createBulletinWithCallbacks(
    bulletinData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createBulletin(bulletinData, onUnauthorizedCallback)
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

  getBulletinDetailWithCallbacks(
    bulletinId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getBulletinDetail(bulletinId, onUnauthorizedCallback)
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

  updateBulletinWithCallbacks(
    bulletinId,
    bulletinData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateBulletin(bulletinId, bulletinData, onUnauthorizedCallback)
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

  deleteBulletinWithCallbacks(
    bulletinId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.deleteBulletin(bulletinId, onUnauthorizedCallback)
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

  archiveBulletinWithCallbacks(
    bulletinId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.archiveBulletin(bulletinId, onUnauthorizedCallback)
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
   * Legacy methods that match the original API signatures exactly
   */

  getBulletinListAPI(
    filtersMap = new Map(),
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback,
  ) {
    this.getBulletinsWithFiltersMapAndCallbacks(
      filtersMap,
      onSuccessCallback,
      onErrorCallback,
      onDoneCallback,
      onUnauthorizedCallback,
      false, // Don't force refresh by default
    );
  }

  postBulletinCreateAPI(
    data,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback,
  ) {
    this.createBulletinWithCallbacks(
      data,
      onSuccessCallback,
      onErrorCallback,
      onDoneCallback,
      onUnauthorizedCallback,
    );
  }

  getBulletinDetailAPI(
    organizationID,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback,
  ) {
    this.getBulletinDetailWithCallbacks(
      organizationID,
      onSuccessCallback,
      onErrorCallback,
      onDoneCallback,
      onUnauthorizedCallback,
    );
  }

  putBulletinUpdateAPI(
    data,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback,
  ) {
    this.updateBulletinWithCallbacks(
      data.id,
      data,
      onSuccessCallback,
      onErrorCallback,
      onDoneCallback,
      onUnauthorizedCallback,
    );
  }

  deleteBulletinAPI(
    id,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback,
  ) {
    this.deleteBulletinWithCallbacks(
      id,
      onSuccessCallback,
      onErrorCallback,
      onDoneCallback,
      onUnauthorizedCallback,
    );
  }

  postArchiveBulletinAPI(
    id,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback,
  ) {
    this.archiveBulletinWithCallbacks(
      id,
      onSuccessCallback,
      onErrorCallback,
      onDoneCallback,
      onUnauthorizedCallback,
    );
  }

  /**
   * Private validation methods
   */

  _validateBulletinId(bulletinId) {
    if (
      !bulletinId ||
      (typeof bulletinId !== "string" && typeof bulletinId !== "number")
    ) {
      return { bulletinId: "Valid bulletin ID is required" };
    }
    return null;
  }

  _validateBulletinsParams(params) {
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
        "text",
        "created_at",
        "updated_at",
        "status",
        "how_did_you_hear_about_us",
      ];
      if (allowedSortFields.includes(params.sortBy)) {
        validatedParams.sortBy = params.sortBy;

        if (params.sortOrder && ["ASC", "DESC"].includes(params.sortOrder)) {
          validatedParams.sortOrder = params.sortOrder;
        } else {
          validatedParams.sortOrder = "DESC"; // Default to newest first
        }
      }
    }

    // FIX: Validate status filter - accept both string and number
    if (
      params.status !== undefined &&
      params.status !== null &&
      params.status !== ""
    ) {
      // Convert to string if it's a number, or keep as string
      validatedParams.status = String(params.status);
    }

    // Add any other custom filters
    const customFilterKeys = Object.keys(params).filter(
      (key) =>
        !["page", "limit", "search", "sortBy", "sortOrder", "status"].includes(
          key,
        ),
    );

    customFilterKeys.forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        validatedParams[key] = params[key];
      }
    });

    return validatedParams;
  }

  _validateBulletinData(bulletinData, isCreate = false) {
    const errors = {};

    if (!bulletinData || typeof bulletinData !== "object") {
      errors.general = "Bulletin data is required";
      return errors;
    }

    // Validate text (required)
    if (!bulletinData.text || !bulletinData.text.trim()) {
      errors.text = "Bulletin text is required";
    } else if (bulletinData.text.length > 1000) {
      errors.text = "Bulletin text must be less than 1000 characters";
    }

    // Validate howDidYouHearAboutUsID (optional)
    if (bulletinData.howDidYouHearAboutUsID !== undefined) {
      if (
        typeof bulletinData.howDidYouHearAboutUsID !== "number" ||
        bulletinData.howDidYouHearAboutUsID < 1
      ) {
        errors.howDidYouHearAboutUsID = "Invalid how did you hear about us ID";
      }
    }

    // Validate status (optional)
    if (bulletinData.status !== undefined) {
      const validStatuses = [1, 2]; // Active, Archived
      if (!validStatuses.includes(bulletinData.status)) {
        errors.status = "Invalid bulletin status";
      }
    }

    return errors;
  }

  /**
   * Waits for current bulletins request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentBulletinsRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.bulletinStorage.isBulletinsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.bulletinStorage.getBulletinsFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Bulletins request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Bulletins request timeout"));
      }, 30000);
    });
  }
}
