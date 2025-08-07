// File Path: monorepo/web/workery-frontend/src/services/Manager/NAICSManager.js

/**
 * NAICSManager handles all North America Industry Classification System-related business logic
 * Combines NAICSAPI with NAICSStorage for complete NAICS management
 */
export class NAICSManager {
  constructor(naicsAPI, naicsStorage) {
    this.naicsAPI = naicsAPI;
    this.naicsStorage = naicsStorage;
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

      // Prevent multiple simultaneous requests
      if (this.naicsStorage.isSelectOptionsCacheLoading()) {
        console.log("NAICSManager: Select options request already in progress");
        return this._waitForCurrentSelectOptionsRequest();
      }

      this.naicsStorage.setSelectOptionsCacheLoading(true);

      console.log("NAICSManager: Fetching fresh select options data");

      try {
        // Fetch fresh data from API
        const optionsData = await this.naicsAPI.getNAICSSelectOptions(
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.naicsStorage.saveSelectOptionsToCache(optionsData);

        console.log("NAICSManager: Select options data fetched successfully");

        return optionsData;
      } finally {
        this.naicsStorage.setSelectOptionsCacheLoading(false);
      }
    } catch (error) {
      this.naicsStorage.setSelectOptionsCacheLoading(false);
      console.error("NAICSManager: Failed to get select options", error);
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
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedNaics = this.naicsStorage.getNaicsFromCache();
        if (cachedNaics) {
          return cachedNaics;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.naicsStorage.isNaicsCacheLoading()) {
        console.log("NAICSManager: NAICS request already in progress");
        return this._waitForCurrentNaicsRequest();
      }

      this.naicsStorage.setNaicsCacheLoading(true);

      console.log("NAICSManager: Fetching fresh NAICS data", params);

      try {
        // Validate and clean parameters
        const validatedParams = this._validateNaicsParams(params);

        // Fetch fresh data from API
        const naicsData = await this.naicsAPI.getNAICS(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.naicsStorage.saveNaicsToCache(naicsData);

        console.log("NAICSManager: NAICS data fetched successfully:", {
          count: naicsData.results ? naicsData.results.length : 0,
          totalCount: naicsData.count,
        });

        return naicsData;
      } finally {
        this.naicsStorage.setNaicsCacheLoading(false);
      }
    } catch (error) {
      this.naicsStorage.setNaicsCacheLoading(false);
      console.error("NAICSManager: Failed to get NAICS", error);
      throw error;
    }
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
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getNaicsCacheInfo() {
    return this.naicsStorage.getNaicsCacheInfo();
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
        "industry_title",
        "created_at",
        "updated_at",
        "sector",
        "subsector",
        "industry_group",
        "naics_industry",
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

  /**
   * Waits for current NAICS request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentNaicsRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.naicsStorage.isNaicsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.naicsStorage.getNaicsFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("NAICS request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("NAICS request timeout"));
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
        if (!this.naicsStorage.isSelectOptionsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.naicsStorage.getSelectOptionsFromCache();
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
