// File Path: monorepo/web/workery-frontend/src/services/Storage/ServiceFeeStorage.js

/**
 * ServiceFeeStorage handles all service fee-related data storage operations
 * Manages service fee caching, local storage, and data persistence
 */
export class ServiceFeeStorage {
  constructor() {
    this.SERVICE_FEES_CACHE_KEY = "WORKERY_SERVICE_FEES_CACHE";
    this.SERVICE_FEES_TIMESTAMP_KEY = "WORKERY_SERVICE_FEES_TIMESTAMP";
    this.SERVICE_FEE_SELECT_OPTIONS_CACHE_KEY =
      "WORKERY_SERVICE_FEE_SELECT_OPTIONS_CACHE";
    this.SERVICE_FEE_SELECT_OPTIONS_TIMESTAMP_KEY =
      "WORKERY_SERVICE_FEE_SELECT_OPTIONS_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
    this.SELECT_OPTIONS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for select options

    // In-memory cache for current session
    this.memoryCache = {
      serviceFees: null,
      serviceFeesTimestamp: null,
      isServiceFeesLoading: false,
      selectOptions: null,
      selectOptionsTimestamp: null,
      isSelectOptionsLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("ServiceFeeStorage initialized");
    }
  }

  /**
   * Gets service fees list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached service fees data or null if not found/expired
   */
  getServiceFeesFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isServiceFeesMemoryCacheValid(maxAge)) {
      console.log(
        "ServiceFeeStorage: Using memory cache for service fees list",
      );
      return this.memoryCache.serviceFees;
    }

    // Check localStorage cache
    try {
      const cachedServiceFees = localStorage.getItem(
        this.SERVICE_FEES_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.SERVICE_FEES_TIMESTAMP_KEY,
      );

      if (cachedServiceFees && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const serviceFeesData = JSON.parse(cachedServiceFees);

          // Update memory cache with localStorage data
          this.memoryCache.serviceFees = serviceFeesData;
          this.memoryCache.serviceFeesTimestamp = timestamp;
          this.memoryCache.isServiceFeesLoading = false;

          console.log(
            "ServiceFeeStorage: Using localStorage cache for service fees list",
          );
          return serviceFeesData;
        } else {
          console.log(
            "ServiceFeeStorage: localStorage cache expired, clearing",
          );
          this._clearServiceFeesLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "ServiceFeeStorage: Error reading service fees from localStorage",
        error,
      );
      this._clearServiceFeesLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves service fees list to cache (both memory and localStorage)
   * @param {Object} serviceFeesData - Service fees data to cache
   */
  saveServiceFeesToCache(serviceFeesData) {
    if (!serviceFeesData) {
      console.warn(
        "ServiceFeeStorage: Attempted to save null/undefined service fees data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.serviceFees = serviceFeesData;
    this.memoryCache.serviceFeesTimestamp = timestamp;
    this.memoryCache.isServiceFeesLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.SERVICE_FEES_CACHE_KEY,
        JSON.stringify(serviceFeesData),
      );
      localStorage.setItem(
        this.SERVICE_FEES_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("ServiceFeeStorage: Service fees list cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        count: serviceFeesData.results ? serviceFeesData.results.length : 0,
      });
    } catch (error) {
      console.error(
        "ServiceFeeStorage: Error saving service fees to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets service fee select options from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached select options data or null if not found/expired
   */
  getSelectOptionsFromCache(maxAge = this.SELECT_OPTIONS_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isSelectOptionsMemoryCacheValid(maxAge)) {
      console.log("ServiceFeeStorage: Using memory cache for select options");
      return this.memoryCache.selectOptions;
    }

    // Check localStorage cache
    try {
      const cachedSelectOptions = localStorage.getItem(
        this.SERVICE_FEE_SELECT_OPTIONS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.SERVICE_FEE_SELECT_OPTIONS_TIMESTAMP_KEY,
      );

      if (cachedSelectOptions && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const selectOptionsData = JSON.parse(cachedSelectOptions);

          // Update memory cache with localStorage data
          this.memoryCache.selectOptions = selectOptionsData;
          this.memoryCache.selectOptionsTimestamp = timestamp;
          this.memoryCache.isSelectOptionsLoading = false;

          console.log(
            "ServiceFeeStorage: Using localStorage cache for select options",
          );
          return selectOptionsData;
        } else {
          console.log(
            "ServiceFeeStorage: Select options cache expired, clearing",
          );
          this._clearSelectOptionsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "ServiceFeeStorage: Error reading select options from localStorage",
        error,
      );
      this._clearSelectOptionsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves service fee select options to cache (both memory and localStorage)
   * @param {Object} selectOptionsData - Select options data to cache
   */
  saveSelectOptionsToCache(selectOptionsData) {
    if (!selectOptionsData) {
      console.warn(
        "ServiceFeeStorage: Attempted to save null/undefined select options data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.selectOptions = selectOptionsData;
    this.memoryCache.selectOptionsTimestamp = timestamp;
    this.memoryCache.isSelectOptionsLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.SERVICE_FEE_SELECT_OPTIONS_CACHE_KEY,
        JSON.stringify(selectOptionsData),
      );
      localStorage.setItem(
        this.SERVICE_FEE_SELECT_OPTIONS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("ServiceFeeStorage: Select options cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        optionsCount: Array.isArray(selectOptionsData)
          ? selectOptionsData.length
          : "N/A",
      });
    } catch (error) {
      console.error(
        "ServiceFeeStorage: Error saving select options to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears service fees cache (memory and localStorage)
   */
  clearServiceFeesCache() {
    // Clear memory cache
    this.memoryCache.serviceFees = null;
    this.memoryCache.serviceFeesTimestamp = null;
    this.memoryCache.isServiceFeesLoading = false;

    // Clear localStorage cache
    this._clearServiceFeesLocalStorageCache();

    console.log("ServiceFeeStorage: Service fees cache cleared");
  }

  /**
   * Clears select options cache (memory and localStorage)
   */
  clearSelectOptionsCache() {
    // Clear memory cache
    this.memoryCache.selectOptions = null;
    this.memoryCache.selectOptionsTimestamp = null;
    this.memoryCache.isSelectOptionsLoading = false;

    // Clear localStorage cache
    this._clearSelectOptionsLocalStorageCache();

    console.log("ServiceFeeStorage: Select options cache cleared");
  }

  /**
   * Clears all service fee caches
   */
  clearAllCache() {
    this.clearServiceFeesCache();
    this.clearSelectOptionsCache();
    console.log("ServiceFeeStorage: All caches cleared");
  }

  /**
   * Sets loading state for service fees cache
   * @param {boolean} isLoading - Loading state
   */
  setServiceFeesCacheLoading(isLoading) {
    this.memoryCache.isServiceFeesLoading = isLoading;
  }

  /**
   * Gets loading state from service fees cache
   * @returns {boolean} - Current loading state
   */
  isServiceFeesCacheLoading() {
    return this.memoryCache.isServiceFeesLoading;
  }

  /**
   * Sets loading state for select options cache
   * @param {boolean} isLoading - Loading state
   */
  setSelectOptionsCacheLoading(isLoading) {
    this.memoryCache.isSelectOptionsLoading = isLoading;
  }

  /**
   * Gets loading state from select options cache
   * @returns {boolean} - Current loading state
   */
  isSelectOptionsCacheLoading() {
    return this.memoryCache.isSelectOptionsLoading;
  }

  /**
   * Gets cache information for debugging
   * @returns {Object} - Cache state information
   */
  getServiceFeesCacheInfo() {
    const serviceFeesMemoryValid = this._isServiceFeesMemoryCacheValid();
    const serviceFeesLocalStorageValid =
      this._isServiceFeesLocalStorageCacheValid();
    const selectOptionsMemoryValid = this._isSelectOptionsMemoryCacheValid();
    const selectOptionsLocalStorageValid =
      this._isSelectOptionsLocalStorageCacheValid();

    return {
      serviceFees: {
        memoryCache: {
          hasData: !!this.memoryCache.serviceFees,
          timestamp: this.memoryCache.serviceFeesTimestamp,
          age: this.memoryCache.serviceFeesTimestamp
            ? Date.now() - this.memoryCache.serviceFeesTimestamp
            : null,
          isValid: serviceFeesMemoryValid,
          isLoading: this.memoryCache.isServiceFeesLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.SERVICE_FEES_CACHE_KEY),
          timestamp: localStorage.getItem(this.SERVICE_FEES_TIMESTAMP_KEY),
          isValid: serviceFeesLocalStorageValid,
        },
        cacheDuration: this.DEFAULT_CACHE_DURATION,
      },
      selectOptions: {
        memoryCache: {
          hasData: !!this.memoryCache.selectOptions,
          timestamp: this.memoryCache.selectOptionsTimestamp,
          age: this.memoryCache.selectOptionsTimestamp
            ? Date.now() - this.memoryCache.selectOptionsTimestamp
            : null,
          isValid: selectOptionsMemoryValid,
          isLoading: this.memoryCache.isSelectOptionsLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(
            this.SERVICE_FEE_SELECT_OPTIONS_CACHE_KEY,
          ),
          timestamp: localStorage.getItem(
            this.SERVICE_FEE_SELECT_OPTIONS_TIMESTAMP_KEY,
          ),
          isValid: selectOptionsLocalStorageValid,
        },
        cacheDuration: this.SELECT_OPTIONS_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for service fees
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `ServiceFeeStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for select options
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.SELECT_OPTIONS_CACHE_DURATION = durationMs;
    console.log(
      `ServiceFeeStorage: Select options cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves service fee preferences to localStorage
   * @param {Object} preferences - Service fee preferences object
   */
  saveServiceFeePreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_SERVICE_FEE_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("ServiceFeeStorage: Service fee preferences saved");
    } catch (error) {
      console.error(
        "ServiceFeeStorage: Error saving service fee preferences",
        error,
      );
    }
  }

  /**
   * Gets service fee preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Service fee preferences or null if not found/expired
   */
  getServiceFeePreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_SERVICE_FEE_PREFERENCES");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_SERVICE_FEE_PREFERENCES");
        }
      }
    } catch (error) {
      console.error(
        "ServiceFeeStorage: Error reading service fee preferences",
        error,
      );
    }

    return null;
  }

  /**
   * Clears service fee preferences
   */
  clearServiceFeePreferences() {
    localStorage.removeItem("WORKERY_SERVICE_FEE_PREFERENCES");
    console.log("ServiceFeeStorage: Service fee preferences cleared");
  }

  /**
   * Saves service fee filters/settings
   * @param {Object} filters - Service fee filters object
   */
  saveServiceFeeFilters(filters) {
    try {
      localStorage.setItem(
        "WORKERY_SERVICE_FEE_FILTERS",
        JSON.stringify({
          filters: filters,
          timestamp: Date.now(),
        }),
      );
      console.log("ServiceFeeStorage: Service fee filters saved");
    } catch (error) {
      console.error(
        "ServiceFeeStorage: Error saving service fee filters",
        error,
      );
    }
  }

  /**
   * Gets service fee filters/settings
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Service fee filters or null if not found/expired
   */
  getServiceFeeFilters(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_SERVICE_FEE_FILTERS");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.filters;
        } else {
          // Clean up expired filters
          localStorage.removeItem("WORKERY_SERVICE_FEE_FILTERS");
        }
      }
    } catch (error) {
      console.error(
        "ServiceFeeStorage: Error reading service fee filters",
        error,
      );
    }

    return null;
  }

  /**
   * Clears service fee filters
   */
  clearServiceFeeFilters() {
    localStorage.removeItem("WORKERY_SERVICE_FEE_FILTERS");
    console.log("ServiceFeeStorage: Service fee filters cleared");
  }

  /**
   * Clears all service fee-related data from storage
   */
  clearAllServiceFeeData() {
    this.clearAllCache();
    this.clearServiceFeePreferences();
    this.clearServiceFeeFilters();

    console.log("ServiceFeeStorage: All service fee data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isServiceFeesMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (
      !this.memoryCache.serviceFees ||
      !this.memoryCache.serviceFeesTimestamp
    ) {
      return false;
    }
    const age = Date.now() - this.memoryCache.serviceFeesTimestamp;
    return age < maxAge;
  }

  _isServiceFeesLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.SERVICE_FEES_TIMESTAMP_KEY);
      const serviceFees = localStorage.getItem(this.SERVICE_FEES_CACHE_KEY);

      if (!timestamp || !serviceFees) {
        return false;
      }

      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  _isSelectOptionsMemoryCacheValid(
    maxAge = this.SELECT_OPTIONS_CACHE_DURATION,
  ) {
    if (
      !this.memoryCache.selectOptions ||
      !this.memoryCache.selectOptionsTimestamp
    ) {
      return false;
    }
    const age = Date.now() - this.memoryCache.selectOptionsTimestamp;
    return age < maxAge;
  }

  _isSelectOptionsLocalStorageCacheValid(
    maxAge = this.SELECT_OPTIONS_CACHE_DURATION,
  ) {
    try {
      const timestamp = localStorage.getItem(
        this.SERVICE_FEE_SELECT_OPTIONS_TIMESTAMP_KEY,
      );
      const selectOptions = localStorage.getItem(
        this.SERVICE_FEE_SELECT_OPTIONS_CACHE_KEY,
      );

      if (!timestamp || !selectOptions) {
        return false;
      }

      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  _clearServiceFeesLocalStorageCache() {
    localStorage.removeItem(this.SERVICE_FEES_CACHE_KEY);
    localStorage.removeItem(this.SERVICE_FEES_TIMESTAMP_KEY);
  }

  _clearSelectOptionsLocalStorageCache() {
    localStorage.removeItem(this.SERVICE_FEE_SELECT_OPTIONS_CACHE_KEY);
    localStorage.removeItem(this.SERVICE_FEE_SELECT_OPTIONS_TIMESTAMP_KEY);
  }
}
