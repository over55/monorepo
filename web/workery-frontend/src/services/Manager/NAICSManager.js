// File Path: monorepo/web/workery-frontend/src/services/Manager/NAICSManager.js

/**
 * NAICSManager handles all North America Industry Classification System-related business logic
 * Combines NAICSAPI with NAICSStorage for complete NAICS management
 */
export class NAICSManager {
  constructor(naicsAPI, naicsStorage) {
    this.naicsAPI = naicsAPI;
    this.naicsStorage = naicsStorage;
    // Track pending requests to prevent duplicates
    this.pendingRequests = new Map();
  }

  /**
   * Gets NAICS select options with caching
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - NAICS select options
   */
  async getNAICSSelectOptions(
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedOptions = this.naicsStorage.getSelectOptionsFromCache();
        if (cachedOptions) {
          return cachedOptions;
        }
      }

      // Check if there's already a pending request for select options
      const requestKey = "select-options";
      if (this.pendingRequests.has(requestKey)) {
        console.log(
          "NAICSManager: Select options request already in progress, waiting...",
        );
        return this.pendingRequests.get(requestKey);
      }

      console.log("NAICSManager: Fetching fresh select options data");

      // Create the request promise
      const requestPromise = this._fetchSelectOptions(onUnauthorizedCallback);

      // Store the promise to prevent duplicate requests
      this.pendingRequests.set(requestKey, requestPromise);

      try {
        const result = await requestPromise;
        return result;
      } finally {
        // Clean up the pending request
        this.pendingRequests.delete(requestKey);
      }
    } catch (error) {
      console.error("NAICSManager: Failed to get select options", error);
      throw error;
    }
  }

  /**
   * Internal method to fetch select options
   * @private
   */
  async _fetchSelectOptions(onUnauthorizedCallback) {
    try {
      // Fetch fresh data from API
      const optionsData = await this.naicsAPI.getNAICSSelectOptions(
        onUnauthorizedCallback,
      );

      // Save to storage cache
      this.naicsStorage.saveSelectOptionsToCache(optionsData);

      console.log("NAICSManager: Select options data fetched successfully");

      return optionsData;
    } catch (error) {
      console.error("NAICSManager: Error fetching select options:", error);
      throw error;
    }
  }

  /**
   * Gets list of NAICS with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - NAICS list with pagination data
   */
  async getNAICS(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Create a unique key for this request based on parameters
      const requestKey = this._createRequestKey(params);

      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        // For now, skip cache for search results as they're dynamic
        // You could implement more sophisticated caching based on params
        // const cachedNaics = this.naicsStorage.getNaicsFromCache();
        // if (cachedNaics) {
        //   return cachedNaics;
        // }
      }

      // Check if there's already a pending request with the same parameters
      if (this.pendingRequests.has(requestKey)) {
        console.log(
          "NAICSManager: Similar NAICS request already in progress, waiting...",
        );
        return this.pendingRequests.get(requestKey);
      }

      console.log("NAICSManager: Fetching fresh NAICS data", params);

      // Validate and clean parameters
      const validatedParams = this._validateNaicsParams(params);

      // Create the request promise
      const requestPromise = this._fetchNAICS(
        validatedParams,
        onUnauthorizedCallback,
      );

      // Store the promise to prevent duplicate requests
      this.pendingRequests.set(requestKey, requestPromise);

      try {
        const result = await requestPromise;
        return result;
      } finally {
        // Clean up the pending request
        this.pendingRequests.delete(requestKey);
      }
    } catch (error) {
      console.error("NAICSManager: Failed to get NAICS", error);
      throw error;
    }
  }

  /**
   * Internal method to fetch NAICS data
   * @private
   */
  async _fetchNAICS(validatedParams, onUnauthorizedCallback) {
    try {
      // Fetch fresh data from API
      const naicsData = await this.naicsAPI.getNAICS(
        validatedParams,
        onUnauthorizedCallback,
      );

      // Only cache if it's a general listing without search params
      if (
        !validatedParams.search &&
        !validatedParams.code &&
        !validatedParams.industryTitle
      ) {
        this.naicsStorage.saveNaicsToCache(naicsData);
      }

      console.log("NAICSManager: NAICS data fetched successfully:", {
        count: naicsData.results ? naicsData.results.length : 0,
        totalCount: naicsData.count,
      });

      return naicsData;
    } catch (error) {
      console.error("NAICSManager: Error fetching NAICS:", error);
      throw error;
    }
  }

  /**
   * Creates a unique key for request deduplication
   * @private
   */
  _createRequestKey(params) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        if (params[key] !== undefined && params[key] !== null) {
          result[key] = params[key];
        }
        return result;
      }, {});

    return `naics-${JSON.stringify(sortedParams)}`;
  }

  /**
   * Gets details for a specific NAICS
   * @param {string|number} naicsId - The ID of the NAICS
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - NAICS details
   */
  async getNAICSDetail(naicsId, onUnauthorizedCallback = null) {
    try {
      // Validate NAICS ID
      const validationError = this._validateNAICSId(naicsId);
      if (validationError) {
        throw validationError;
      }

      console.log(`NAICSManager: Fetching NAICS detail for ID ${naicsId}`);

      // Call API to get NAICS details
      const naicsData = await this.naicsAPI.getNAICSDetail(
        naicsId,
        onUnauthorizedCallback,
      );

      console.log("NAICSManager: NAICS detail fetched successfully:", {
        id: naicsData.id,
        code: naicsData.code,
        industryTitle: naicsData.industryTitle,
      });

      return naicsData;
    } catch (error) {
      console.error("NAICSManager: Failed to get NAICS detail", error);
      throw error;
    }
  }

  /**
   * Gets NAICS preferences
   * @returns {Object|null} - NAICS preferences or null
   */
  getNAICSPreferences() {
    return this.naicsStorage.getNaicsPreferences();
  }

  /**
   * Saves NAICS preferences
   * @param {Object} preferences - Preferences object
   */
  saveNAICSPreferences(preferences) {
    this.naicsStorage.saveNaicsPreferences(preferences);
  }

  /**
   * Clears the NAICS cache
   */
  clearNaicsCache() {
    this.naicsStorage.clearNaicsCache();
    this.pendingRequests.clear();
  }

  /**
   * Clears the select options cache
   */
  clearSelectOptionsCache() {
    this.naicsStorage.clearSelectOptionsCache();
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.naicsStorage.clearAllCache();
    this.pendingRequests.clear();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getNaicsCacheInfo() {
    const cacheInfo = this.naicsStorage.getNaicsCacheInfo();
    cacheInfo.pendingRequests = this.pendingRequests.size;
    return cacheInfo;
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setNaicsCacheDuration(durationMs) {
    this.naicsStorage.setCacheDuration(durationMs);
  }

  /**
   * Sets select options cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.naicsStorage.setSelectOptionsCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getNAICSSelectOptionsWithCallbacks(
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getNAICSSelectOptions(onUnauthorizedCallback, forceRefresh)
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

  getNaicsWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getNAICS(params, onUnauthorizedCallback, forceRefresh)
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

  getNAICSDetailWithCallbacks(
    naicsId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getNAICSDetail(naicsId, onUnauthorizedCallback)
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

  _validateNAICSId(naicsId) {
    if (
      !naicsId ||
      (typeof naicsId !== "string" && typeof naicsId !== "number")
    ) {
      return { naicsId: "Valid NAICS ID is required" };
    }
    return null;
  }

  _validateNaicsParams(params) {
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
        "code",
        "code_str",
        "industry_title",
        "created_at",
        "updated_at",
        "sector_code",
        "sector_title",
        "subsector_code",
        "subsector_title",
        "industry_group_code",
        "industry_group_title",
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

    // Pass through additional parameters from search
    // These are the parameters that come from the search form
    if (params.code && typeof params.code === "string") {
      validatedParams.code = params.code.trim();
    }

    if (params.industryTitle && typeof params.industryTitle === "string") {
      validatedParams.industryTitle = params.industryTitle.trim();
    }

    // Also check for alternative parameter names that might be used
    if (params.it && typeof params.it === "string") {
      validatedParams.it = params.it.trim();
    }

    if (params.sector && typeof params.sector === "string") {
      validatedParams.sector = params.sector;
    }

    if (params.subsector && typeof params.subsector === "string") {
      validatedParams.subsector = params.subsector;
    }

    if (params.industryGroup && typeof params.industryGroup === "string") {
      validatedParams.industryGroup = params.industryGroup;
    }

    if (params.naicsIndustry && typeof params.naicsIndustry === "string") {
      validatedParams.naicsIndustry = params.naicsIndustry;
    }

    return validatedParams;
  }
}
