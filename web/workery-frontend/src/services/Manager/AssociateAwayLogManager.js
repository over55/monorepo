// File Path: monorepo/web/workery-frontend/src/services/Manager/AssociateAwayLogManager.js

/**
 * AssociateAwayLogManager handles all associate away log-related business logic
 * Combines AssociateAwayLogAPI with AssociateAwayLogStorage for complete associate away log management
 */
export class AssociateAwayLogManager {
  constructor(associateAwayLogAPI, associateAwayLogStorage) {
    this.associateAwayLogAPI = associateAwayLogAPI;
    this.associateAwayLogStorage = associateAwayLogStorage;
  }

  /**
   * Gets list of associate away logs with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Associate away logs list with pagination data
   */
  async getAssociateAwayLogs(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedAssociateAwayLogs =
          this.associateAwayLogStorage.getAssociateAwayLogsFromCache();
        if (cachedAssociateAwayLogs) {
          return cachedAssociateAwayLogs;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.associateAwayLogStorage.isAssociateAwayLogsCacheLoading()) {
        console.log(
          "AssociateAwayLogManager: Associate away logs request already in progress",
        );
        return this._waitForCurrentAssociateAwayLogsRequest();
      }

      this.associateAwayLogStorage.setAssociateAwayLogsCacheLoading(true);

      console.log(
        "AssociateAwayLogManager: Fetching fresh associate away logs data",
        params,
      );

      try {
        // Validate and clean parameters
        const validatedParams = this._validateAssociateAwayLogsParams(params);

        // Fetch fresh data from API
        const associateAwayLogsData =
          await this.associateAwayLogAPI.getAssociateAwayLogs(
            validatedParams,
            onUnauthorizedCallback,
          );

        // Save to storage cache
        this.associateAwayLogStorage.saveAssociateAwayLogsToCache(
          associateAwayLogsData,
        );

        console.log(
          "AssociateAwayLogManager: Associate away logs data fetched successfully:",
          {
            count: associateAwayLogsData.results
              ? associateAwayLogsData.results.length
              : 0,
            totalCount: associateAwayLogsData.count,
          },
        );

        return associateAwayLogsData;
      } finally {
        this.associateAwayLogStorage.setAssociateAwayLogsCacheLoading(false);
      }
    } catch (error) {
      this.associateAwayLogStorage.setAssociateAwayLogsCacheLoading(false);
      console.error(
        "AssociateAwayLogManager: Failed to get associate away logs",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets list of associate away logs using legacy filtersMap approach for backward compatibility
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Associate away logs list with pagination data
   */
  async getAssociateAwayLogsWithFiltersMap(
    filtersMap = new Map(),
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedAssociateAwayLogs =
          this.associateAwayLogStorage.getAssociateAwayLogsFromCache();
        if (cachedAssociateAwayLogs) {
          return cachedAssociateAwayLogs;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.associateAwayLogStorage.isAssociateAwayLogsCacheLoading()) {
        console.log(
          "AssociateAwayLogManager: Associate away logs request already in progress",
        );
        return this._waitForCurrentAssociateAwayLogsRequest();
      }

      this.associateAwayLogStorage.setAssociateAwayLogsCacheLoading(true);

      console.log(
        "AssociateAwayLogManager: Fetching fresh associate away logs data with filtersMap",
        filtersMap,
      );

      try {
        // Fetch fresh data from API using filtersMap
        const associateAwayLogsData =
          await this.associateAwayLogAPI.getAssociateAwayLogsWithFiltersMap(
            filtersMap,
            onUnauthorizedCallback,
          );

        // Save to storage cache
        this.associateAwayLogStorage.saveAssociateAwayLogsToCache(
          associateAwayLogsData,
        );

        console.log(
          "AssociateAwayLogManager: Associate away logs data fetched successfully:",
          {
            count: associateAwayLogsData.results
              ? associateAwayLogsData.results.length
              : 0,
            totalCount: associateAwayLogsData.count,
          },
        );

        return associateAwayLogsData;
      } finally {
        this.associateAwayLogStorage.setAssociateAwayLogsCacheLoading(false);
      }
    } catch (error) {
      this.associateAwayLogStorage.setAssociateAwayLogsCacheLoading(false);
      console.error(
        "AssociateAwayLogManager: Failed to get associate away logs with filtersMap",
        error,
      );
      throw error;
    }
  }

  /**
   * Creates a new associate away log with validation
   * @param {Object} associateAwayLogData - Associate away log data to create
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Created associate away log data
   */
  async createAssociateAwayLog(
    associateAwayLogData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate associate away log data
      const validationErrors = this._validateAssociateAwayLogData(
        associateAwayLogData,
        true,
      );
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("AssociateAwayLogManager: Creating new associate away log");

      // Call API to create associate away log
      const createdAssociateAwayLogData =
        await this.associateAwayLogAPI.createAssociateAwayLog(
          associateAwayLogData,
          onUnauthorizedCallback,
        );

      // Clear associate away logs cache since new data has been added
      this.associateAwayLogStorage.clearAssociateAwayLogsCache();

      console.log(
        "AssociateAwayLogManager: Associate away log created successfully:",
        {
          id: createdAssociateAwayLogData.id,
        },
      );

      return createdAssociateAwayLogData;
    } catch (error) {
      console.error(
        "AssociateAwayLogManager: Failed to create associate away log",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets details for a specific associate away log
   * @param {string|number} associateAwayLogId - The ID of the associate away log
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Associate away log details
   */
  async getAssociateAwayLogDetail(
    associateAwayLogId,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate associate away log ID
      const validationError =
        this._validateAssociateAwayLogId(associateAwayLogId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `AssociateAwayLogManager: Fetching associate away log detail for ID ${associateAwayLogId}`,
      );

      // Call API to get associate away log details
      const associateAwayLogData =
        await this.associateAwayLogAPI.getAssociateAwayLogDetail(
          associateAwayLogId,
          onUnauthorizedCallback,
        );

      console.log(
        "AssociateAwayLogManager: Associate away log detail fetched successfully:",
        {
          id: associateAwayLogData.id,
        },
      );

      return associateAwayLogData;
    } catch (error) {
      console.error(
        "AssociateAwayLogManager: Failed to get associate away log detail",
        error,
      );
      throw error;
    }
  }

  /**
   * Updates a specific associate away log using legacy approach (decamelized data)
   * @param {Object} decamelizedData - Already decamelized data with ID included (matching original API signature)
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated associate away log data
   */
  async updateAssociateAwayLog(decamelizedData, onUnauthorizedCallback = null) {
    try {
      // Validate that data contains ID
      if (!decamelizedData || !decamelizedData.id) {
        throw {
          id: "Associate away log ID is required in decamelized data",
        };
      }

      console.log(
        `AssociateAwayLogManager: Updating associate away log ID ${decamelizedData.id}`,
      );

      // Call API to update associate away log
      const updatedAssociateAwayLogData =
        await this.associateAwayLogAPI.updateAssociateAwayLog(
          decamelizedData,
          onUnauthorizedCallback,
        );

      // Clear associate away logs cache since data has been updated
      this.associateAwayLogStorage.clearAssociateAwayLogsCache();

      console.log(
        "AssociateAwayLogManager: Associate away log updated successfully",
      );

      return updatedAssociateAwayLogData;
    } catch (error) {
      console.error(
        "AssociateAwayLogManager: Failed to update associate away log",
        error,
      );
      throw error;
    }
  }

  /**
   * Updates a specific associate away log using modern approach (separate ID and data)
   * @param {string|number} associateAwayLogId - The ID of the associate away log
   * @param {Object} associateAwayLogData - Associate away log data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated associate away log data
   */
  async updateAssociateAwayLogModern(
    associateAwayLogId,
    associateAwayLogData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate associate away log ID
      const associateAwayLogIdError =
        this._validateAssociateAwayLogId(associateAwayLogId);
      if (associateAwayLogIdError) {
        throw associateAwayLogIdError;
      }

      // Validate associate away log data
      const validationErrors =
        this._validateAssociateAwayLogData(associateAwayLogData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(
        `AssociateAwayLogManager: Updating associate away log ID ${associateAwayLogId}`,
      );

      // Call API to update associate away log
      const updatedAssociateAwayLogData =
        await this.associateAwayLogAPI.updateAssociateAwayLogModern(
          associateAwayLogId,
          associateAwayLogData,
          onUnauthorizedCallback,
        );

      // Clear associate away logs cache since data has been updated
      this.associateAwayLogStorage.clearAssociateAwayLogsCache();

      console.log(
        "AssociateAwayLogManager: Associate away log updated successfully",
      );

      return updatedAssociateAwayLogData;
    } catch (error) {
      console.error(
        "AssociateAwayLogManager: Failed to update associate away log",
        error,
      );
      throw error;
    }
  }

  /**
   * Deletes a specific associate away log
   * @param {string|number} associateAwayLogId - The ID of the associate away log to delete
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Delete response
   */
  async deleteAssociateAwayLog(
    associateAwayLogId,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate associate away log ID
      const validationError =
        this._validateAssociateAwayLogId(associateAwayLogId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `AssociateAwayLogManager: Deleting associate away log ID ${associateAwayLogId}`,
      );

      // Call API to delete associate away log
      const deleteResponse =
        await this.associateAwayLogAPI.deleteAssociateAwayLog(
          associateAwayLogId,
          onUnauthorizedCallback,
        );

      // Clear associate away logs cache since data has been updated
      this.associateAwayLogStorage.clearAssociateAwayLogsCache();

      console.log(
        "AssociateAwayLogManager: Associate away log deleted successfully",
      );

      return deleteResponse;
    } catch (error) {
      console.error(
        "AssociateAwayLogManager: Failed to delete associate away log",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets associate away log preferences
   * @returns {Object|null} - Associate away log preferences or null
   */
  getAssociateAwayLogPreferences() {
    return this.associateAwayLogStorage.getAssociateAwayLogPreferences();
  }

  /**
   * Saves associate away log preferences
   * @param {Object} preferences - Preferences object
   */
  saveAssociateAwayLogPreferences(preferences) {
    this.associateAwayLogStorage.saveAssociateAwayLogPreferences(preferences);
  }

  /**
   * Clears the associate away logs cache
   */
  clearAssociateAwayLogsCache() {
    this.associateAwayLogStorage.clearAssociateAwayLogsCache();
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.associateAwayLogStorage.clearAllCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getAssociateAwayLogsCacheInfo() {
    return this.associateAwayLogStorage.getAssociateAwayLogsCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setAssociateAwayLogsCacheDuration(durationMs) {
    this.associateAwayLogStorage.setCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getAssociateAwayLogsWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getAssociateAwayLogs(params, onUnauthorizedCallback, forceRefresh)
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

  getAssociateAwayLogsWithFiltersMapAndCallbacks(
    filtersMap = new Map(),
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getAssociateAwayLogsWithFiltersMap(
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

  createAssociateAwayLogWithCallbacks(
    associateAwayLogData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createAssociateAwayLog(associateAwayLogData, onUnauthorizedCallback)
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

  getAssociateAwayLogDetailWithCallbacks(
    associateAwayLogId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getAssociateAwayLogDetail(associateAwayLogId, onUnauthorizedCallback)
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

  updateAssociateAwayLogWithCallbacks(
    decamelizedData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateAssociateAwayLog(decamelizedData, onUnauthorizedCallback)
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

  deleteAssociateAwayLogWithCallbacks(
    associateAwayLogId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.deleteAssociateAwayLog(associateAwayLogId, onUnauthorizedCallback)
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

  getAssociateAwayLogListAPI(
    filtersMap = new Map(),
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback,
  ) {
    this.getAssociateAwayLogsWithFiltersMapAndCallbacks(
      filtersMap,
      onSuccessCallback,
      onErrorCallback,
      onDoneCallback,
      onUnauthorizedCallback,
      false, // Don't force refresh by default
    );
  }

  postAssociateAwayLogCreateAPI(
    data,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback,
  ) {
    this.createAssociateAwayLogWithCallbacks(
      data,
      onSuccessCallback,
      onErrorCallback,
      onDoneCallback,
      onUnauthorizedCallback,
    );
  }

  getAssociateAwayLogDetailAPI(
    aalID,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback,
  ) {
    this.getAssociateAwayLogDetailWithCallbacks(
      aalID,
      onSuccessCallback,
      onErrorCallback,
      onDoneCallback,
      onUnauthorizedCallback,
    );
  }

  putAssociateAwayLogUpdateAPI(
    decamelizedData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback,
  ) {
    this.updateAssociateAwayLogWithCallbacks(
      decamelizedData,
      onSuccessCallback,
      onErrorCallback,
      onDoneCallback,
      onUnauthorizedCallback,
    );
  }

  deleteAssociateAwayLogAPI(
    id,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback,
  ) {
    this.deleteAssociateAwayLogWithCallbacks(
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

  _validateAssociateAwayLogId(associateAwayLogId) {
    if (
      !associateAwayLogId ||
      (typeof associateAwayLogId !== "string" &&
        typeof associateAwayLogId !== "number")
    ) {
      return { associateAwayLogId: "Valid associate away log ID is required" };
    }
    return null;
  }

  _validateAssociateAwayLogsParams(params) {
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
        "created_at",
        "updated_at",
        "reason",
        "start_date",
        "until_date",
        "until_further_notice",
        "associate_id",
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

    // Validate filters
    if (
      params.associateId &&
      (typeof params.associateId === "string" ||
        typeof params.associateId === "number")
    ) {
      validatedParams.associateId = params.associateId;
    }

    if (params.reason && typeof params.reason === "string") {
      validatedParams.reason = params.reason;
    }

    if (
      params.untilFurtherNotice &&
      typeof params.untilFurtherNotice === "string"
    ) {
      validatedParams.untilFurtherNotice = params.untilFurtherNotice;
    }

    return validatedParams;
  }

  _validateAssociateAwayLogData(associateAwayLogData, isCreate = false) {
    const errors = {};

    if (!associateAwayLogData || typeof associateAwayLogData !== "object") {
      errors.general = "Associate away log data is required";
      return errors;
    }

    // Validate associate ID (required)
    if (!associateAwayLogData.associateId) {
      errors.associateId = "Associate ID is required";
    } else if (
      typeof associateAwayLogData.associateId !== "number" ||
      associateAwayLogData.associateId < 1
    ) {
      errors.associateId = "Valid associate ID is required";
    }

    // Validate reason (required)
    if (!associateAwayLogData.reason) {
      errors.reason = "Reason is required";
    } else if (
      typeof associateAwayLogData.reason !== "number" ||
      associateAwayLogData.reason < 1
    ) {
      errors.reason = "Valid reason is required";
    }

    // Validate start date (required)
    if (!associateAwayLogData.startDate) {
      errors.startDate = "Start date is required";
    }

    // Validate until further notice (required)
    if (associateAwayLogData.untilFurtherNotice === undefined) {
      errors.untilFurtherNotice = "Until further notice is required";
    } else if (
      typeof associateAwayLogData.untilFurtherNotice !== "number" ||
      ![1, 2].includes(associateAwayLogData.untilFurtherNotice)
    ) {
      errors.untilFurtherNotice =
        "Valid until further notice value is required (1 or 2)";
    }

    // If not until further notice, validate until date
    if (
      associateAwayLogData.untilFurtherNotice === 2 &&
      !associateAwayLogData.untilDate
    ) {
      errors.untilDate = "Until date is required when not until further notice";
    }

    // Validate reason other (optional, but required if reason is "Other")
    if (
      associateAwayLogData.reason === 1 &&
      (!associateAwayLogData.reasonOther ||
        !associateAwayLogData.reasonOther.trim())
    ) {
      errors.reasonOther = "Reason other is required when reason is 'Other'";
    }

    return errors;
  }

  /**
   * Waits for current associate away logs request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentAssociateAwayLogsRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.associateAwayLogStorage.isAssociateAwayLogsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData =
            this.associateAwayLogStorage.getAssociateAwayLogsFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Associate away logs request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Associate away logs request timeout"));
      }, 30000);
    });
  }
}
