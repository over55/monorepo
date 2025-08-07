// File Path: monorepo/web/workery-frontend/src/services/Storage/AssociateStorage.js

/**
 * AssociateStorage handles all associate-related data storage operations
 * Manages associate caching, local storage, and data persistence
 */
export class AssociateStorage {
  constructor() {
    this.ASSOCIATES_CACHE_KEY = "WORKERY_ASSOCIATES_CACHE";
    this.ASSOCIATES_TIMESTAMP_KEY = "WORKERY_ASSOCIATES_TIMESTAMP";
    this.ASSOCIATE_SELECT_OPTIONS_CACHE_KEY =
      "WORKERY_ASSOCIATE_SELECT_OPTIONS_CACHE";
    this.ASSOCIATE_SELECT_OPTIONS_TIMESTAMP_KEY =
      "WORKERY_ASSOCIATE_SELECT_OPTIONS_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
    this.SELECT_OPTIONS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for select options

    // In-memory cache for current session
    this.memoryCache = {
      associates: null,
      associatesTimestamp: null,
      isAssociatesLoading: false,
      selectOptions: null,
      selectOptionsTimestamp: null,
      isSelectOptionsLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("AssociateStorage initialized");
    }
  }

  /**
   * Gets associates list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached associates data or null if not found/expired
   */
  getAssociatesFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isAssociatesMemoryCacheValid(maxAge)) {
      console.log("AssociateStorage: Using memory cache for associates list");
      return this.memoryCache.associates;
    }

    // Check localStorage cache
    try {
      const cachedAssociates = localStorage.getItem(this.ASSOCIATES_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(
        this.ASSOCIATES_TIMESTAMP_KEY,
      );

      if (cachedAssociates && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const associatesData = JSON.parse(cachedAssociates);

          // Update memory cache with localStorage data
          this.memoryCache.associates = associatesData;
          this.memoryCache.associatesTimestamp = timestamp;
          this.memoryCache.isAssociatesLoading = false;

          console.log(
            "AssociateStorage: Using localStorage cache for associates list",
          );
          return associatesData;
        } else {
          console.log("AssociateStorage: localStorage cache expired, clearing");
          this._clearAssociatesLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "AssociateStorage: Error reading associates from localStorage",
        error,
      );
      this._clearAssociatesLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves associates list to cache (both memory and localStorage)
   * @param {Object} associatesData - Associates data to cache
   */
  saveAssociatesToCache(associatesData) {
    if (!associatesData) {
      console.warn(
        "AssociateStorage: Attempted to save null/undefined associates data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.associates = associatesData;
    this.memoryCache.associatesTimestamp = timestamp;
    this.memoryCache.isAssociatesLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.ASSOCIATES_CACHE_KEY,
        JSON.stringify(associatesData),
      );
      localStorage.setItem(this.ASSOCIATES_TIMESTAMP_KEY, timestamp.toString());

      console.log("AssociateStorage: Associates list cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        count: associatesData.results ? associatesData.results.length : 0,
      });
    } catch (error) {
      console.error(
        "AssociateStorage: Error saving associates to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets associate select options from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached select options data or null if not found/expired
   */
  getSelectOptionsFromCache(maxAge = this.SELECT_OPTIONS_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isSelectOptionsMemoryCacheValid(maxAge)) {
      console.log("AssociateStorage: Using memory cache for select options");
      return this.memoryCache.selectOptions;
    }

    // Check localStorage cache
    try {
      const cachedSelectOptions = localStorage.getItem(
        this.ASSOCIATE_SELECT_OPTIONS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.ASSOCIATE_SELECT_OPTIONS_TIMESTAMP_KEY,
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
            "AssociateStorage: Using localStorage cache for select options",
          );
          return selectOptionsData;
        } else {
          console.log(
            "AssociateStorage: Select options cache expired, clearing",
          );
          this._clearSelectOptionsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "AssociateStorage: Error reading select options from localStorage",
        error,
      );
      this._clearSelectOptionsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves associate select options to cache (both memory and localStorage)
   * @param {Object} selectOptionsData - Select options data to cache
   */
  saveSelectOptionsToCache(selectOptionsData) {
    if (!selectOptionsData) {
      console.warn(
        "AssociateStorage: Attempted to save null/undefined select options data",
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
        this.ASSOCIATE_SELECT_OPTIONS_CACHE_KEY,
        JSON.stringify(selectOptionsData),
      );
      localStorage.setItem(
        this.ASSOCIATE_SELECT_OPTIONS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("AssociateStorage: Select options cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        optionsCount: Array.isArray(selectOptionsData)
          ? selectOptionsData.length
          : selectOptionsData.results
            ? selectOptionsData.results.length
            : "N/A",
      });
    } catch (error) {
      console.error(
        "AssociateStorage: Error saving select options to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears associates cache (memory and localStorage)
   */
  clearAssociatesCache() {
    // Clear memory cache
    this.memoryCache.associates = null;
    this.memoryCache.associatesTimestamp = null;
    this.memoryCache.isAssociatesLoading = false;

    // Clear localStorage cache
    this._clearAssociatesLocalStorageCache();

    console.log("AssociateStorage: Associates cache cleared");
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

    console.log("AssociateStorage: Select options cache cleared");
  }

  /**
   * Clears all associate caches
   */
  clearAllCache() {
    this.clearAssociatesCache();
    this.clearSelectOptionsCache();
    console.log("AssociateStorage: All caches cleared");
  }

  /**
   * Sets loading state for associates cache
   * @param {boolean} isLoading - Loading state
   */
  setAssociatesCacheLoading(isLoading) {
    this.memoryCache.isAssociatesLoading = isLoading;
  }

  /**
   * Gets loading state from associates cache
   * @returns {boolean} - Current loading state
   */
  isAssociatesCacheLoading() {
    return this.memoryCache.isAssociatesLoading;
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
  getAssociatesCacheInfo() {
    const associatesMemoryValid = this._isAssociatesMemoryCacheValid();
    const associatesLocalStorageValid =
      this._isAssociatesLocalStorageCacheValid();
    const selectOptionsMemoryValid = this._isSelectOptionsMemoryCacheValid();
    const selectOptionsLocalStorageValid =
      this._isSelectOptionsLocalStorageCacheValid();

    return {
      associates: {
        memoryCache: {
          hasData: !!this.memoryCache.associates,
          timestamp: this.memoryCache.associatesTimestamp,
          age: this.memoryCache.associatesTimestamp
            ? Date.now() - this.memoryCache.associatesTimestamp
            : null,
          isValid: associatesMemoryValid,
          isLoading: this.memoryCache.isAssociatesLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.ASSOCIATES_CACHE_KEY),
          timestamp: localStorage.getItem(this.ASSOCIATES_TIMESTAMP_KEY),
          isValid: associatesLocalStorageValid,
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
            this.ASSOCIATE_SELECT_OPTIONS_CACHE_KEY,
          ),
          timestamp: localStorage.getItem(
            this.ASSOCIATE_SELECT_OPTIONS_TIMESTAMP_KEY,
          ),
          isValid: selectOptionsLocalStorageValid,
        },
        cacheDuration: this.SELECT_OPTIONS_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for associates
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `AssociateStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for select options
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.SELECT_OPTIONS_CACHE_DURATION = durationMs;
    console.log(
      `AssociateStorage: Select options cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves associate preferences to localStorage
   * @param {Object} preferences - Associate preferences object
   */
  saveAssociatePreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_ASSOCIATE_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("AssociateStorage: Associate preferences saved");
    } catch (error) {
      console.error(
        "AssociateStorage: Error saving associate preferences",
        error,
      );
    }
  }

  /**
   * Gets associate preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Associate preferences or null if not found/expired
   */
  getAssociatePreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_ASSOCIATE_PREFERENCES");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_ASSOCIATE_PREFERENCES");
        }
      }
    } catch (error) {
      console.error(
        "AssociateStorage: Error reading associate preferences",
        error,
      );
    }

    return null;
  }

  /**
   * Clears associate preferences
   */
  clearAssociatePreferences() {
    localStorage.removeItem("WORKERY_ASSOCIATE_PREFERENCES");
    console.log("AssociateStorage: Associate preferences cleared");
  }

  /**
   * Clears all associate-related data from storage
   */
  clearAllAssociateData() {
    this.clearAllCache();
    this.clearAssociatePreferences();

    console.log("AssociateStorage: All associate data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isAssociatesMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (!this.memoryCache.associates || !this.memoryCache.associatesTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.associatesTimestamp;
    return age < maxAge;
  }

  _isAssociatesLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.ASSOCIATES_TIMESTAMP_KEY);
      const associates = localStorage.getItem(this.ASSOCIATES_CACHE_KEY);

      if (!timestamp || !associates) {
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
        this.ASSOCIATE_SELECT_OPTIONS_TIMESTAMP_KEY,
      );
      const selectOptions = localStorage.getItem(
        this.ASSOCIATE_SELECT_OPTIONS_CACHE_KEY,
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

  _clearAssociatesLocalStorageCache() {
    localStorage.removeItem(this.ASSOCIATES_CACHE_KEY);
    localStorage.removeItem(this.ASSOCIATES_TIMESTAMP_KEY);
  }

  _clearSelectOptionsLocalStorageCache() {
    localStorage.removeItem(this.ASSOCIATE_SELECT_OPTIONS_CACHE_KEY);
    localStorage.removeItem(this.ASSOCIATE_SELECT_OPTIONS_TIMESTAMP_KEY);
  }
}
