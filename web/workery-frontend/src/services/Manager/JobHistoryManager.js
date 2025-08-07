// File Path: web/workery-frontend/src/services/Manager/JobHistoryManager.js

/**
 * JobHistoryManager handles all job history-related business logic
 * Combines JobHistoryAPI with JobHistoryStorage for complete job history management
 */
export class JobHistoryManager {
  constructor(jobHistoryAPI, jobHistoryStorage) {
    this.jobHistoryAPI = jobHistoryAPI;
    this.jobHistoryStorage = jobHistoryStorage;
  }

  /**
   * Gets list of job history with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Job history list with pagination data
   */
  async getJobHistory(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedJobHistory =
          this.jobHistoryStorage.getJobHistoryFromCache();
        if (cachedJobHistory) {
          return cachedJobHistory;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.jobHistoryStorage.isJobHistoryCacheLoading()) {
        console.log(
          "JobHistoryManager: Job history request already in progress",
        );
        return this._waitForCurrentJobHistoryRequest();
      }

      this.jobHistoryStorage.setJobHistoryCacheLoading(true);

      console.log("JobHistoryManager: Fetching fresh job history data", params);

      try {
        // Validate and clean parameters
        const validatedParams = this._validateJobHistoryParams(params);

        // Fetch fresh data from API
        const jobHistoryData = await this.jobHistoryAPI.getJobHistory(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.jobHistoryStorage.saveJobHistoryToCache(jobHistoryData);

        console.log(
          "JobHistoryManager: Job history data fetched successfully:",
          {
            count: jobHistoryData.results ? jobHistoryData.results.length : 0,
            totalCount: jobHistoryData.count,
          },
        );

        return jobHistoryData;
      } finally {
        this.jobHistoryStorage.setJobHistoryCacheLoading(false);
      }
    } catch (error) {
      this.jobHistoryStorage.setJobHistoryCacheLoading(false);
      console.error("JobHistoryManager: Failed to get job history", error);
      throw error;
    }
  }

  /**
   * Gets job history using legacy filtersMap approach for backward compatibility
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Job history list with pagination data
   */
  async getJobHistoryWithFiltersMap(
    filtersMap = new Map(),
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedJobHistory =
          this.jobHistoryStorage.getJobHistoryFromCache();
        if (cachedJobHistory) {
          return cachedJobHistory;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.jobHistoryStorage.isJobHistoryCacheLoading()) {
        console.log(
          "JobHistoryManager: Job history request already in progress",
        );
        return this._waitForCurrentJobHistoryRequest();
      }

      this.jobHistoryStorage.setJobHistoryCacheLoading(true);

      console.log(
        "JobHistoryManager: Fetching fresh job history data with filtersMap",
        filtersMap,
      );

      try {
        // Fetch fresh data from API using legacy method
        const jobHistoryData =
          await this.jobHistoryAPI.getJobHistoryWithFiltersMap(
            filtersMap,
            onUnauthorizedCallback,
          );

        // Save to storage cache
        this.jobHistoryStorage.saveJobHistoryToCache(jobHistoryData);

        console.log(
          "JobHistoryManager: Job history data fetched successfully:",
          {
            count: jobHistoryData.results ? jobHistoryData.results.length : 0,
            totalCount: jobHistoryData.count,
          },
        );

        return jobHistoryData;
      } finally {
        this.jobHistoryStorage.setJobHistoryCacheLoading(false);
      }
    } catch (error) {
      this.jobHistoryStorage.setJobHistoryCacheLoading(false);
      console.error("JobHistoryManager: Failed to get job history", error);
      throw error;
    }
  }

  /**
   * Creates a new job history entry with validation
   * @param {Object} jobHistoryData - Job history data to create
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Created job history data
   */
  async createJobHistory(jobHistoryData, onUnauthorizedCallback = null) {
    try {
      // Validate job history data
      const validationErrors = this._validateJobHistoryData(
        jobHistoryData,
        true,
      );
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("JobHistoryManager: Creating new job history entry");

      // Call API to create job history
      const createdJobHistoryData = await this.jobHistoryAPI.createJobHistory(
        jobHistoryData,
        onUnauthorizedCallback,
      );

      // Clear job history cache since new data has been added
      this.jobHistoryStorage.clearJobHistoryCache();

      console.log(
        "JobHistoryManager: Job history entry created successfully:",
        {
          id: createdJobHistoryData.id,
        },
      );

      return createdJobHistoryData;
    } catch (error) {
      console.error("JobHistoryManager: Failed to create job history", error);
      throw error;
    }
  }

  /**
   * Gets details for a specific job history entry
   * @param {string|number} jobHistoryId - The ID of the job history entry
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Job history details
   */
  async getJobHistoryDetail(jobHistoryId, onUnauthorizedCallback = null) {
    try {
      // Validate job history ID
      const validationError = this._validateJobHistoryId(jobHistoryId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `JobHistoryManager: Fetching job history detail for ID ${jobHistoryId}`,
      );

      // Call API to get job history details
      const jobHistoryData = await this.jobHistoryAPI.getJobHistoryDetail(
        jobHistoryId,
        onUnauthorizedCallback,
      );

      console.log(
        "JobHistoryManager: Job history detail fetched successfully:",
        {
          id: jobHistoryData.id,
        },
      );

      return jobHistoryData;
    } catch (error) {
      console.error(
        "JobHistoryManager: Failed to get job history detail",
        error,
      );
      throw error;
    }
  }

  /**
   * Updates a specific job history entry
   * @param {string|number} jobHistoryId - The ID of the job history entry
   * @param {Object} jobHistoryData - Job history data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated job history data
   */
  async updateJobHistory(
    jobHistoryId,
    jobHistoryData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate job history ID
      const jobHistoryIdError = this._validateJobHistoryId(jobHistoryId);
      if (jobHistoryIdError) {
        throw jobHistoryIdError;
      }

      // Validate job history data
      const validationErrors = this._validateJobHistoryData(jobHistoryData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(`JobHistoryManager: Updating job history ID ${jobHistoryId}`);

      // Call API to update job history
      const updatedJobHistoryData = await this.jobHistoryAPI.updateJobHistory(
        jobHistoryId,
        jobHistoryData,
        onUnauthorizedCallback,
      );

      // Clear job history cache since data has been updated
      this.jobHistoryStorage.clearJobHistoryCache();

      console.log("JobHistoryManager: Job history updated successfully");

      return updatedJobHistoryData;
    } catch (error) {
      console.error("JobHistoryManager: Failed to update job history", error);
      throw error;
    }
  }

  /**
   * Deletes a specific job history entry
   * @param {string|number} jobHistoryId - The ID of the job history entry to delete
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Delete response
   */
  async deleteJobHistory(jobHistoryId, onUnauthorizedCallback = null) {
    try {
      // Validate job history ID
      const validationError = this._validateJobHistoryId(jobHistoryId);
      if (validationError) {
        throw validationError;
      }

      console.log(`JobHistoryManager: Deleting job history ID ${jobHistoryId}`);

      // Call API to delete job history
      const deleteResponse = await this.jobHistoryAPI.deleteJobHistory(
        jobHistoryId,
        onUnauthorizedCallback,
      );

      // Clear job history cache since data has been updated
      this.jobHistoryStorage.clearJobHistoryCache();

      console.log("JobHistoryManager: Job history deleted successfully");

      return deleteResponse;
    } catch (error) {
      console.error("JobHistoryManager: Failed to delete job history", error);
      throw error;
    }
  }

  /**
   * Archives a specific job history entry
   * @param {string|number} jobHistoryId - The ID of the job history entry to archive
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Archive response
   */
  async archiveJobHistory(jobHistoryId, onUnauthorizedCallback = null) {
    try {
      // Validate job history ID
      const validationError = this._validateJobHistoryId(jobHistoryId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `JobHistoryManager: Archiving job history ID ${jobHistoryId}`,
      );

      // Call API to archive job history
      const archiveResponse = await this.jobHistoryAPI.archiveJobHistory(
        jobHistoryId,
        onUnauthorizedCallback,
      );

      // Clear job history cache since data has been updated
      this.jobHistoryStorage.clearJobHistoryCache();

      console.log("JobHistoryManager: Job history archived successfully");

      return archiveResponse;
    } catch (error) {
      console.error("JobHistoryManager: Failed to archive job history", error);
      throw error;
    }
  }

  /**
   * Gets job history preferences
   * @returns {Object|null} - Job history preferences or null
   */
  getJobHistoryPreferences() {
    return this.jobHistoryStorage.getJobHistoryPreferences();
  }

  /**
   * Saves job history preferences
   * @param {Object} preferences - Preferences object
   */
  saveJobHistoryPreferences(preferences) {
    this.jobHistoryStorage.saveJobHistoryPreferences(preferences);
  }

  /**
   * Clears the job history cache
   */
  clearJobHistoryCache() {
    this.jobHistoryStorage.clearJobHistoryCache();
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.jobHistoryStorage.clearAllCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getJobHistoryCacheInfo() {
    return this.jobHistoryStorage.getJobHistoryCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setJobHistoryCacheDuration(durationMs) {
    this.jobHistoryStorage.setCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getJobHistoryWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getJobHistory(params, onUnauthorizedCallback, forceRefresh)
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

  getJobHistoryWithFiltersMapAndCallbacks(
    filtersMap = new Map(),
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getJobHistoryWithFiltersMap(
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

  createJobHistoryWithCallbacks(
    jobHistoryData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createJobHistory(jobHistoryData, onUnauthorizedCallback)
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

  getJobHistoryDetailWithCallbacks(
    jobHistoryId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getJobHistoryDetail(jobHistoryId, onUnauthorizedCallback)
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

  updateJobHistoryWithCallbacks(
    jobHistoryId,
    jobHistoryData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateJobHistory(jobHistoryId, jobHistoryData, onUnauthorizedCallback)
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

  deleteJobHistoryWithCallbacks(
    jobHistoryId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.deleteJobHistory(jobHistoryId, onUnauthorizedCallback)
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

  archiveJobHistoryWithCallbacks(
    jobHistoryId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.archiveJobHistory(jobHistoryId, onUnauthorizedCallback)
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

  _validateJobHistoryId(jobHistoryId) {
    if (
      !jobHistoryId ||
      (typeof jobHistoryId !== "string" && typeof jobHistoryId !== "number")
    ) {
      return { jobHistoryId: "Valid job history ID is required" };
    }
    return null;
  }

  _validateJobHistoryParams(params) {
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
        "associate_id",
        "order_id",
        "task_id",
        "comment",
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
    if (params.associateId && typeof params.associateId === "string") {
      validatedParams.associateId = params.associateId;
    }

    if (params.orderId && typeof params.orderId === "string") {
      validatedParams.orderId = params.orderId;
    }

    if (params.taskId && typeof params.taskId === "string") {
      validatedParams.taskId = params.taskId;
    }

    return validatedParams;
  }

  _validateJobHistoryData(jobHistoryData, isCreate = false) {
    const errors = {};

    if (!jobHistoryData || typeof jobHistoryData !== "object") {
      errors.general = "Job history data is required";
      return errors;
    }

    // Validate associate ID (optional, depends on use case)
    if (
      jobHistoryData.associateId &&
      typeof jobHistoryData.associateId !== "string"
    ) {
      errors.associateId = "Associate ID must be a valid string";
    }

    // Validate order ID (optional, depends on use case)
    if (jobHistoryData.orderId && typeof jobHistoryData.orderId !== "string") {
      errors.orderId = "Order ID must be a valid string";
    }

    // Validate task ID (optional, depends on use case)
    if (jobHistoryData.taskId && typeof jobHistoryData.taskId !== "string") {
      errors.taskId = "Task ID must be a valid string";
    }

    // Validate comment (optional)
    if (jobHistoryData.comment && jobHistoryData.comment.length > 1000) {
      errors.comment = "Comment must be less than 1000 characters";
    }

    return errors;
  }

  /**
   * Waits for current job history request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentJobHistoryRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.jobHistoryStorage.isJobHistoryCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.jobHistoryStorage.getJobHistoryFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Job history request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Job history request timeout"));
      }, 30000);
    });
  }
}
