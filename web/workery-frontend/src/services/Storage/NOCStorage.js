// File Path: monorepo/web/workery-frontend/src/services/Storage/NOCStorage.js

/**
 * NOCStorage handles all National Occupational Classification-related data storage operations
 * Manages NOC caching, local storage, and data persistence
 */
export class NOCStorage {
  constructor() {
    this.NOCS_CACHE_KEY = "WORKERY_NOCS_CACHE";
    this.NOCS_TIMESTAMP_KEY = "WORKERY_NOCS_TIMESTAMP";
    this.NOC_SELECT_OPTIONS_CACHE_KEY = "WORKERY_NOC_SELECT_OPTIONS_CACHE";
    this.NOC_SELECT_OPTIONS_TIMESTAMP_KEY =
      "WORKERY_NOC_SELECT_OPTIONS_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
    this.SELECT_OPTIONS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for select options

    // In-memory cache for current session
    this.memoryCache = {
      nocs: null,
      nocsTimestamp: null,
      isNocsLoading: false,
      selectOptions: null,
      selectOptionsTimestamp: null,
      isSelectOptionsLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("NOCStorage initialized");
    }
  }

  /**
   * Gets NOCs list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached NOCs data or null if not found/expired
   */
  getNocsFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isNocsMemoryCacheValid(maxAge)) {
      console.log("NOCStorage: Using memory cache for NOCs list");
      return this.memoryCache.nocs;
    }

    // Check localStorage cache
    try {
      const cachedNocs = localStorage.getItem(this.NOCS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(this.NOCS_TIMESTAMP_KEY);

      if (cachedNocs && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const nocsData = JSON.parse(cachedNocs);

          // Update memory cache with localStorage data
          this.memoryCache.nocs = nocsData;
          this.memoryCache.nocsTimestamp = timestamp;
          this.memoryCache.isNocsLoading = false;

          console.log("NOCStorage: Using localStorage cache for NOCs list");
          return nocsData;
        } else {
          console.log("NOCStorage: localStorage cache expired, clearing");
          this._clearNocsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error("NOCStorage: Error reading NOCs from localStorage", error);
      this._clearNocsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves NOCs list to cache (both memory and localStorage)
   * @param {Object} nocsData - NOCs data to cache
   */
  saveNocsToCache(nocsData) {
    if (!nocsData) {
      console.warn("NOCStorage: Attempted to save null/undefined NOCs data");
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.nocs = nocsData;
    this.memoryCache.nocsTimestamp = timestamp;
    this.memoryCache.isNocsLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(this.NOCS_CACHE_KEY, JSON.stringify(nocsData));
      localStorage.setItem(this.NOCS_TIMESTAMP_KEY, timestamp.toString());

      console.log("NOCStorage: NOCs list cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        count: nocsData.results ? nocsData.results.length : 0,
      });
    } catch (error) {
      console.error("NOCStorage: Error saving NOCs to localStorage", error);
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets NOC select options from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached select options data or null if not found/expired
   */
  getSelectOptionsFromCache(maxAge = this.SELECT_OPTIONS_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isSelectOptionsMemoryCacheValid(maxAge)) {
      console.log("NOCStorage: Using memory cache for select options");
      return this.memoryCache.selectOptions;
    }

    // Check localStorage cache
    try {
      const cachedSelectOptions = localStorage.getItem(
        this.NOC_SELECT_OPTIONS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.NOC_SELECT_OPTIONS_TIMESTAMP_KEY,
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
            "NOCStorage: Using localStorage cache for select options",
          );
          return selectOptionsData;
        } else {
          console.log("NOCStorage: Select options cache expired, clearing");
          this._clearSelectOptionsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "NOCStorage: Error reading select options from localStorage",
        error,
      );
      this._clearSelectOptionsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves NOC select options to cache (both memory and localStorage)
   * @param {Object} selectOptionsData - Select options data to cache
   */
  saveSelectOptionsToCache(selectOptionsData) {
    if (!selectOptionsData) {
      console.warn(
        "NOCStorage: Attempted to save null/undefined select options data",
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
        this.NOC_SELECT_OPTIONS_CACHE_KEY,
        JSON.stringify(selectOptionsData),
      );
      localStorage.setItem(
        this.NOC_SELECT_OPTIONS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("NOCStorage: Select options cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        optionsCount: Array.isArray(selectOptionsData)
          ? selectOptionsData.length
          : "N/A",
      });
    } catch (error) {
      console.error(
        "NOCStorage: Error saving select options to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears NOCs cache (memory and localStorage)
   */
  clearNocsCache() {
    // Clear memory cache
    this.memoryCache.nocs = null;
    this.memoryCache.nocsTimestamp = null;
    this.memoryCache.isNocsLoading = false;

    // Clear localStorage cache
    this._clearNocsLocalStorageCache();

    console.log("NOCStorage: NOCs cache cleared");
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

    console.log("NOCStorage: Select options cache cleared");
  }

  /**
   * Clears all NOC caches
   */
  clearAllCache() {
    this.clearNocsCache();
    this.clearSelectOptionsCache();
    console.log("NOCStorage: All caches cleared");
  }

  /**
   * Sets loading state for NOCs cache
   * @param {boolean} isLoading - Loading state
   */
  setNocsCacheLoading(isLoading) {
    this.memoryCache.isNocsLoading = isLoading;
  }

  /**
   * Gets loading state from NOCs cache
   * @returns {boolean} - Current loading state
   */
  isNocsCacheLoading() {
    return this.memoryCache.isNocsLoading;
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
  getNocsCacheInfo() {
    const nocsMemoryValid = this._isNocsMemoryCacheValid();
    const nocsLocalStorageValid = this._isNocsLocalStorageCacheValid();
    const selectOptionsMemoryValid = this._isSelectOptionsMemoryCacheValid();
    const selectOptionsLocalStorageValid =
      this._isSelectOptionsLocalStorageCacheValid();

    return {
      nocs: {
        memoryCache: {
          hasData: !!this.memoryCache.nocs,
          timestamp: this.memoryCache.nocsTimestamp,
          age: this.memoryCache.nocsTimestamp
            ? Date.now() - this.memoryCache.nocsTimestamp
            : null,
          isValid: nocsMemoryValid,
          isLoading: this.memoryCache.isNocsLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.NOCS_CACHE_KEY),
          timestamp: localStorage.getItem(this.NOCS_TIMESTAMP_KEY),
          isValid: nocsLocalStorageValid,
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
          hasData: !!localStorage.getItem(this.NOC_SELECT_OPTIONS_CACHE_KEY),
          timestamp: localStorage.getItem(
            this.NOC_SELECT_OPTIONS_TIMESTAMP_KEY,
          ),
          isValid: selectOptionsLocalStorageValid,
        },
        cacheDuration: this.SELECT_OPTIONS_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for NOCs
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `NOCStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for select options
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.SELECT_OPTIONS_CACHE_DURATION = durationMs;
    console.log(
      `NOCStorage: Select options cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves NOC preferences to localStorage
   * @param {Object} preferences - NOC preferences object
   */
  saveNocPreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_NOC_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("NOCStorage: NOC preferences saved");
    } catch (error) {
      console.error("NOCStorage: Error saving NOC preferences", error);
    }
  }

  /**
   * Gets NOC preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - NOC preferences or null if not found/expired
   */
  getNocPreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_NOC_PREFERENCES");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_NOC_PREFERENCES");
        }
      }
    } catch (error) {
      console.error("NOCStorage: Error reading NOC preferences", error);
    }

    return null;
  }

  /**
   * Clears NOC preferences
   */
  clearNocPreferences() {
    localStorage.removeItem("WORKERY_NOC_PREFERENCES");
    console.log("NOCStorage: NOC preferences cleared");
  }

  /**
   * Clears all NOC-related data from storage
   */
  clearAllNocData() {
    this.clearAllCache();
    this.clearNocPreferences();

    console.log("NOCStorage: All NOC data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isNocsMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (!this.memoryCache.nocs || !this.memoryCache.nocsTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.nocsTimestamp;
    return age < maxAge;
  }

  _isNocsLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.NOCS_TIMESTAMP_KEY);
      const nocs = localStorage.getItem(this.NOCS_CACHE_KEY);

      if (!timestamp || !nocs) {
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
        this.NOC_SELECT_OPTIONS_TIMESTAMP_KEY,
      );
      const selectOptions = localStorage.getItem(
        this.NOC_SELECT_OPTIONS_CACHE_KEY,
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

  _clearNocsLocalStorageCache() {
    localStorage.removeItem(this.NOCS_CACHE_KEY);
    localStorage.removeItem(this.NOCS_TIMESTAMP_KEY);
  }

  _clearSelectOptionsLocalStorageCache() {
    localStorage.removeItem(this.NOC_SELECT_OPTIONS_CACHE_KEY);
    localStorage.removeItem(this.NOC_SELECT_OPTIONS_TIMESTAMP_KEY);
  }
}
