// File Path: monorepo/web/workery-frontend/src/services/Storage/NAICSStorage.js

/**
 * NAICSStorage handles all North America Industry Classification System-related data storage operations
 * Manages NAICS caching, local storage, and data persistence
 */
export class NAICSStorage {
  constructor() {
    this.NAICS_CACHE_KEY = "WORKERY_NAICS_CACHE";
    this.NAICS_TIMESTAMP_KEY = "WORKERY_NAICS_TIMESTAMP";
    this.NAICS_SELECT_OPTIONS_CACHE_KEY = "WORKERY_NAICS_SELECT_OPTIONS_CACHE";
    this.NAICS_SELECT_OPTIONS_TIMESTAMP_KEY =
      "WORKERY_NAICS_SELECT_OPTIONS_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
    this.SELECT_OPTIONS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for select options

    // In-memory cache for current session
    this.memoryCache = {
      naics: null,
      naicsTimestamp: null,
      isNaicsLoading: false,
      selectOptions: null,
      selectOptionsTimestamp: null,
      isSelectOptionsLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("NAICSStorage initialized");
    }
  }

  /**
   * Gets NAICS list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached NAICS data or null if not found/expired
   */
  getNaicsFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isNaicsMemoryCacheValid(maxAge)) {
      console.log("NAICSStorage: Using memory cache for NAICS list");
      return this.memoryCache.naics;
    }

    // Check localStorage cache
    try {
      const cachedNaics = localStorage.getItem(this.NAICS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(this.NAICS_TIMESTAMP_KEY);

      if (cachedNaics && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const naicsData = JSON.parse(cachedNaics);

          // Update memory cache with localStorage data
          this.memoryCache.naics = naicsData;
          this.memoryCache.naicsTimestamp = timestamp;
          this.memoryCache.isNaicsLoading = false;

          console.log("NAICSStorage: Using localStorage cache for NAICS list");
          return naicsData;
        } else {
          console.log("NAICSStorage: localStorage cache expired, clearing");
          this._clearNaicsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "NAICSStorage: Error reading NAICS from localStorage",
        error,
      );
      this._clearNaicsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves NAICS list to cache (both memory and localStorage)
   * @param {Object} naicsData - NAICS data to cache
   */
  saveNaicsToCache(naicsData) {
    if (!naicsData) {
      console.warn("NAICSStorage: Attempted to save null/undefined NAICS data");
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.naics = naicsData;
    this.memoryCache.naicsTimestamp = timestamp;
    this.memoryCache.isNaicsLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(this.NAICS_CACHE_KEY, JSON.stringify(naicsData));
      localStorage.setItem(this.NAICS_TIMESTAMP_KEY, timestamp.toString());

      console.log("NAICSStorage: NAICS list cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        count: naicsData.results ? naicsData.results.length : 0,
      });
    } catch (error) {
      console.error("NAICSStorage: Error saving NAICS to localStorage", error);
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets NAICS select options from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached select options data or null if not found/expired
   */
  getSelectOptionsFromCache(maxAge = this.SELECT_OPTIONS_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isSelectOptionsMemoryCacheValid(maxAge)) {
      console.log("NAICSStorage: Using memory cache for select options");
      return this.memoryCache.selectOptions;
    }

    // Check localStorage cache
    try {
      const cachedSelectOptions = localStorage.getItem(
        this.NAICS_SELECT_OPTIONS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.NAICS_SELECT_OPTIONS_TIMESTAMP_KEY,
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
            "NAICSStorage: Using localStorage cache for select options",
          );
          return selectOptionsData;
        } else {
          console.log("NAICSStorage: Select options cache expired, clearing");
          this._clearSelectOptionsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "NAICSStorage: Error reading select options from localStorage",
        error,
      );
      this._clearSelectOptionsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves NAICS select options to cache (both memory and localStorage)
   * @param {Object} selectOptionsData - Select options data to cache
   */
  saveSelectOptionsToCache(selectOptionsData) {
    if (!selectOptionsData) {
      console.warn(
        "NAICSStorage: Attempted to save null/undefined select options data",
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
        this.NAICS_SELECT_OPTIONS_CACHE_KEY,
        JSON.stringify(selectOptionsData),
      );
      localStorage.setItem(
        this.NAICS_SELECT_OPTIONS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("NAICSStorage: Select options cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        optionsCount: Array.isArray(selectOptionsData)
          ? selectOptionsData.length
          : "N/A",
      });
    } catch (error) {
      console.error(
        "NAICSStorage: Error saving select options to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears NAICS cache (memory and localStorage)
   */
  clearNaicsCache() {
    // Clear memory cache
    this.memoryCache.naics = null;
    this.memoryCache.naicsTimestamp = null;
    this.memoryCache.isNaicsLoading = false;

    // Clear localStorage cache
    this._clearNaicsLocalStorageCache();

    console.log("NAICSStorage: NAICS cache cleared");
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

    console.log("NAICSStorage: Select options cache cleared");
  }

  /**
   * Clears all NAICS caches
   */
  clearAllCache() {
    this.clearNaicsCache();
    this.clearSelectOptionsCache();
    console.log("NAICSStorage: All caches cleared");
  }

  /**
   * Sets loading state for NAICS cache
   * @param {boolean} isLoading - Loading state
   */
  setNaicsCacheLoading(isLoading) {
    this.memoryCache.isNaicsLoading = isLoading;
  }

  /**
   * Gets loading state from NAICS cache
   * @returns {boolean} - Current loading state
   */
  isNaicsCacheLoading() {
    return this.memoryCache.isNaicsLoading;
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
  getNaicsCacheInfo() {
    const naicsMemoryValid = this._isNaicsMemoryCacheValid();
    const naicsLocalStorageValid = this._isNaicsLocalStorageCacheValid();
    const selectOptionsMemoryValid = this._isSelectOptionsMemoryCacheValid();
    const selectOptionsLocalStorageValid =
      this._isSelectOptionsLocalStorageCacheValid();

    return {
      naics: {
        memoryCache: {
          hasData: !!this.memoryCache.naics,
          timestamp: this.memoryCache.naicsTimestamp,
          age: this.memoryCache.naicsTimestamp
            ? Date.now() - this.memoryCache.naicsTimestamp
            : null,
          isValid: naicsMemoryValid,
          isLoading: this.memoryCache.isNaicsLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.NAICS_CACHE_KEY),
          timestamp: localStorage.getItem(this.NAICS_TIMESTAMP_KEY),
          isValid: naicsLocalStorageValid,
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
          hasData: !!localStorage.getItem(this.NAICS_SELECT_OPTIONS_CACHE_KEY),
          timestamp: localStorage.getItem(
            this.NAICS_SELECT_OPTIONS_TIMESTAMP_KEY,
          ),
          isValid: selectOptionsLocalStorageValid,
        },
        cacheDuration: this.SELECT_OPTIONS_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for NAICS
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `NAICSStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for select options
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.SELECT_OPTIONS_CACHE_DURATION = durationMs;
    console.log(
      `NAICSStorage: Select options cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves NAICS preferences to localStorage
   * @param {Object} preferences - NAICS preferences object
   */
  saveNaicsPreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_NAICS_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("NAICSStorage: NAICS preferences saved");
    } catch (error) {
      console.error("NAICSStorage: Error saving NAICS preferences", error);
    }
  }

  /**
   * Gets NAICS preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - NAICS preferences or null if not found/expired
   */
  getNaicsPreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_NAICS_PREFERENCES");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_NAICS_PREFERENCES");
        }
      }
    } catch (error) {
      console.error("NAICSStorage: Error reading NAICS preferences", error);
    }

    return null;
  }

  /**
   * Clears NAICS preferences
   */
  clearNaicsPreferences() {
    localStorage.removeItem("WORKERY_NAICS_PREFERENCES");
    console.log("NAICSStorage: NAICS preferences cleared");
  }

  /**
   * Clears all NAICS-related data from storage
   */
  clearAllNaicsData() {
    this.clearAllCache();
    this.clearNaicsPreferences();

    console.log("NAICSStorage: All NAICS data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isNaicsMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (!this.memoryCache.naics || !this.memoryCache.naicsTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.naicsTimestamp;
    return age < maxAge;
  }

  _isNaicsLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.NAICS_TIMESTAMP_KEY);
      const naics = localStorage.getItem(this.NAICS_CACHE_KEY);

      if (!timestamp || !naics) {
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
        this.NAICS_SELECT_OPTIONS_TIMESTAMP_KEY,
      );
      const selectOptions = localStorage.getItem(
        this.NAICS_SELECT_OPTIONS_CACHE_KEY,
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

  _clearNaicsLocalStorageCache() {
    localStorage.removeItem(this.NAICS_CACHE_KEY);
    localStorage.removeItem(this.NAICS_TIMESTAMP_KEY);
  }

  _clearSelectOptionsLocalStorageCache() {
    localStorage.removeItem(this.NAICS_SELECT_OPTIONS_CACHE_KEY);
    localStorage.removeItem(this.NAICS_SELECT_OPTIONS_TIMESTAMP_KEY);
  }
}
