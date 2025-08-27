// File Path: monorepo/web/workery-frontend/src/services/Manager/NOCManager.js

/**
 * NOCManager handles all National Occupational Classification-related business logic
 * Combines NOCAPI with NOCStorage for complete NOC management
 */
export class NOCManager {
  constructor(nocAPI, nocStorage) {
    this.nocAPI = nocAPI;
    this.nocStorage = nocStorage;

    // Add promise tracking for concurrent requests
    this.pendingNocsRequest = null;
    this.pendingSelectOptionsRequest = null;
  }

  /**
   * Gets NOC select options with caching
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - NOC select options
   */
  async getNOCSelectOptions(
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedOptions = this.nocStorage.getSelectOptionsFromCache();
        if (cachedOptions) {
          return cachedOptions;
        }
      }

      // If there's already a pending request, return it
      if (this.pendingSelectOptionsRequest) {
        console.log("NOCManager: Returning existing select options request");
        return this.pendingSelectOptionsRequest;
      }

      console.log("NOCManager: Fetching fresh select options data");

      // Create the promise for the API request
      this.pendingSelectOptionsRequest = (async () => {
        try {
          this.nocStorage.setSelectOptionsCacheLoading(true);

          // Fetch fresh data from API
          const optionsData = await this.nocAPI.getNOCSelectOptions(
            onUnauthorizedCallback,
          );

          // Save to storage cache
          this.nocStorage.saveSelectOptionsToCache(optionsData);

          console.log("NOCManager: Select options data fetched successfully");

          return optionsData;
        } finally {
          this.nocStorage.setSelectOptionsCacheLoading(false);
          this.pendingSelectOptionsRequest = null;
        }
      })();

      return this.pendingSelectOptionsRequest;
    } catch (error) {
      this.nocStorage.setSelectOptionsCacheLoading(false);
      this.pendingSelectOptionsRequest = null;
      console.error("NOCManager: Failed to get select options", error);
      throw error;
    }
  }

  /**
   * Gets list of NOCs with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - NOCs list with pagination data
   */
  async getNOCs(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Generate a cache key based on params to handle different searches
      const cacheKey = JSON.stringify(params);

      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedNocs = this.nocStorage.getNocsFromCache();
        // Only use cache if it matches the same params
        if (cachedNocs && cachedNocs._cacheKey === cacheKey) {
          return cachedNocs;
        }
      }

      // If there's already a pending request with the same params, return it
      if (
        this.pendingNocsRequest &&
        this.pendingNocsRequest._cacheKey === cacheKey
      ) {
        console.log("NOCManager: Returning existing NOCs request");
        return this.pendingNocsRequest._promise;
      }

      console.log("NOCManager: Fetching fresh NOCs data", params);

      // Create the promise for the API request
      const requestPromise = (async () => {
        try {
          this.nocStorage.setNocsCacheLoading(true);

          // Validate and clean parameters
          const validatedParams = this._validateNocsParams(params);

          // Fetch fresh data from API
          const nocsData = await this.nocAPI.getNOCs(
            validatedParams,
            onUnauthorizedCallback,
          );

          // Add cache key to the data for validation
          nocsData._cacheKey = cacheKey;

          // Save to storage cache
          this.nocStorage.saveNocsToCache(nocsData);

          console.log("NOCManager: NOCs data fetched successfully:", {
            count: nocsData.results ? nocsData.results.length : 0,
            totalCount: nocsData.count,
          });

          return nocsData;
        } catch (error) {
          console.error("NOCManager: Error fetching NOCs", error);
          throw error;
        } finally {
          this.nocStorage.setNocsCacheLoading(false);
          this.pendingNocsRequest = null;
        }
      })();

      // Store the promise with its cache key
      this.pendingNocsRequest = {
        _promise: requestPromise,
        _cacheKey: cacheKey,
      };

      return requestPromise;
    } catch (error) {
      this.nocStorage.setNocsCacheLoading(false);
      this.pendingNocsRequest = null;
      console.error("NOCManager: Failed to get NOCs", error);
      throw error;
    }
  }

  /**
   * Gets details for a specific NOC
   * @param {string|number} nocId - The ID of the NOC
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - NOC details
   */
  async getNOCDetail(nocId, onUnauthorizedCallback = null) {
    try {
      // Validate NOC ID
      const validationError = this._validateNOCId(nocId);
      if (validationError) {
        throw validationError;
      }

      console.log(`NOCManager: Fetching NOC detail for ID ${nocId}`);

      // Call API to get NOC details
      const nocData = await this.nocAPI.getNOCDetail(
        nocId,
        onUnauthorizedCallback,
      );

      console.log("NOCManager: NOC detail fetched successfully:", {
        id: nocData.id,
        code: nocData.code,
        unitGroupTitle: nocData.unitGroupTitle,
      });

      return nocData;
    } catch (error) {
      console.error("NOCManager: Failed to get NOC detail", error);
      throw error;
    }
  }

  /**
   * Gets NOC preferences
   * @returns {Object|null} - NOC preferences or null
   */
  getNOCPreferences() {
    return this.nocStorage.getNocPreferences();
  }

  /**
   * Saves NOC preferences
   * @param {Object} preferences - Preferences object
   */
  saveNOCPreferences(preferences) {
    this.nocStorage.saveNocPreferences(preferences);
  }

  /**
   * Clears the NOCs cache
   */
  clearNocsCache() {
    this.nocStorage.clearNocsCache();
    this.pendingNocsRequest = null;
  }

  /**
   * Clears the select options cache
   */
  clearSelectOptionsCache() {
    this.nocStorage.clearSelectOptionsCache();
    this.pendingSelectOptionsRequest = null;
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.nocStorage.clearAllCache();
    this.pendingNocsRequest = null;
    this.pendingSelectOptionsRequest = null;
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getNocsCacheInfo() {
    return this.nocStorage.getNocsCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setNocsCacheDuration(durationMs) {
    this.nocStorage.setCacheDuration(durationMs);
  }

  /**
   * Sets select options cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.nocStorage.setSelectOptionsCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getNOCSelectOptionsWithCallbacks(
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getNOCSelectOptions(onUnauthorizedCallback, forceRefresh)
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

  getNocsWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getNOCs(params, onUnauthorizedCallback, forceRefresh)
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

  getNOCDetailWithCallbacks(
    nocId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getNOCDetail(nocId, onUnauthorizedCallback)
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

  _validateNOCId(nocId) {
    if (!nocId || (typeof nocId !== "string" && typeof nocId !== "number")) {
      return { nocId: "Valid NOC ID is required" };
    }
    return null;
  }

  _validateNocsParams(params) {
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

    // Validate code
    if (params.code && typeof params.code === "string" && params.code.trim()) {
      validatedParams.code = params.code.trim();
    }

    // Validate unit group title (ugt)
    if (params.ugt && typeof params.ugt === "string" && params.ugt.trim()) {
      validatedParams.ugt = params.ugt.trim();
    }

    // Validate sorting
    if (params.sortBy && typeof params.sortBy === "string") {
      const allowedSortFields = [
        "code",
        "unit_group_title",
        "created_at",
        "updated_at",
        "major_group",
        "sub_major_group",
        "minor_group",
        "unit_group",
        "_id",
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
    if (params.majorGroup && typeof params.majorGroup === "string") {
      validatedParams.majorGroup = params.majorGroup;
    }

    if (params.subMajorGroup && typeof params.subMajorGroup === "string") {
      validatedParams.subMajorGroup = params.subMajorGroup;
    }

    if (params.minorGroup && typeof params.minorGroup === "string") {
      validatedParams.minorGroup = params.minorGroup;
    }

    if (params.unitGroup && typeof params.unitGroup === "string") {
      validatedParams.unitGroup = params.unitGroup;
    }

    return validatedParams;
  }
}
