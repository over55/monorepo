// File Path: monorepo/web/workery-frontend/src/services/Storage/ActivitySheetStorage.js

/**
 * ActivitySheetStorage handles all activity sheet-related data storage operations
 * Manages activity sheet caching, local storage, and data persistence
 */
export class ActivitySheetStorage {
  constructor() {
    this.ACTIVITY_SHEETS_CACHE_KEY = "WORKERY_ACTIVITY_SHEETS_CACHE";
    this.ACTIVITY_SHEETS_TIMESTAMP_KEY = "WORKERY_ACTIVITY_SHEETS_TIMESTAMP";
    this.ACTIVITY_SHEET_SELECT_OPTIONS_CACHE_KEY =
      "WORKERY_ACTIVITY_SHEET_SELECT_OPTIONS_CACHE";
    this.ACTIVITY_SHEET_SELECT_OPTIONS_TIMESTAMP_KEY =
      "WORKERY_ACTIVITY_SHEET_SELECT_OPTIONS_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
    this.SELECT_OPTIONS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for select options

    // In-memory cache for current session
    this.memoryCache = {
      activitySheets: null,
      activitySheetsTimestamp: null,
      isActivitySheetsLoading: false,
      selectOptions: null,
      selectOptionsTimestamp: null,
      isSelectOptionsLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("ActivitySheetStorage initialized");
    }
  }

  /**
   * Gets activity sheets list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached activity sheets data or null if not found/expired
   */
  getActivitySheetsFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isActivitySheetsMemoryCacheValid(maxAge)) {
      console.log(
        "ActivitySheetStorage: Using memory cache for activity sheets list",
      );
      return this.memoryCache.activitySheets;
    }

    // Check localStorage cache
    try {
      const cachedActivitySheets = localStorage.getItem(
        this.ACTIVITY_SHEETS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.ACTIVITY_SHEETS_TIMESTAMP_KEY,
      );

      if (cachedActivitySheets && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const activitySheetsData = JSON.parse(cachedActivitySheets);

          // Update memory cache with localStorage data
          this.memoryCache.activitySheets = activitySheetsData;
          this.memoryCache.activitySheetsTimestamp = timestamp;
          this.memoryCache.isActivitySheetsLoading = false;

          console.log(
            "ActivitySheetStorage: Using localStorage cache for activity sheets list",
          );
          return activitySheetsData;
        } else {
          console.log(
            "ActivitySheetStorage: localStorage cache expired, clearing",
          );
          this._clearActivitySheetsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "ActivitySheetStorage: Error reading activity sheets from localStorage",
        error,
      );
      this._clearActivitySheetsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves activity sheets list to cache (both memory and localStorage)
   * @param {Object} activitySheetsData - Activity sheets data to cache
   */
  saveActivitySheetsToCache(activitySheetsData) {
    if (!activitySheetsData) {
      console.warn(
        "ActivitySheetStorage: Attempted to save null/undefined activity sheets data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.activitySheets = activitySheetsData;
    this.memoryCache.activitySheetsTimestamp = timestamp;
    this.memoryCache.isActivitySheetsLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.ACTIVITY_SHEETS_CACHE_KEY,
        JSON.stringify(activitySheetsData),
      );
      localStorage.setItem(
        this.ACTIVITY_SHEETS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log(
        "ActivitySheetStorage: Activity sheets list cached successfully",
        {
          timestamp: new Date(timestamp).toISOString(),
          count: activitySheetsData.results
            ? activitySheetsData.results.length
            : 0,
        },
      );
    } catch (error) {
      console.error(
        "ActivitySheetStorage: Error saving activity sheets to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets activity sheet select options from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached select options data or null if not found/expired
   */
  getSelectOptionsFromCache(maxAge = this.SELECT_OPTIONS_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isSelectOptionsMemoryCacheValid(maxAge)) {
      console.log(
        "ActivitySheetStorage: Using memory cache for select options",
      );
      return this.memoryCache.selectOptions;
    }

    // Check localStorage cache
    try {
      const cachedSelectOptions = localStorage.getItem(
        this.ACTIVITY_SHEET_SELECT_OPTIONS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.ACTIVITY_SHEET_SELECT_OPTIONS_TIMESTAMP_KEY,
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
            "ActivitySheetStorage: Using localStorage cache for select options",
          );
          return selectOptionsData;
        } else {
          console.log(
            "ActivitySheetStorage: Select options cache expired, clearing",
          );
          this._clearSelectOptionsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "ActivitySheetStorage: Error reading select options from localStorage",
        error,
      );
      this._clearSelectOptionsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves activity sheet select options to cache (both memory and localStorage)
   * @param {Object} selectOptionsData - Select options data to cache
   */
  saveSelectOptionsToCache(selectOptionsData) {
    if (!selectOptionsData) {
      console.warn(
        "ActivitySheetStorage: Attempted to save null/undefined select options data",
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
        this.ACTIVITY_SHEET_SELECT_OPTIONS_CACHE_KEY,
        JSON.stringify(selectOptionsData),
      );
      localStorage.setItem(
        this.ACTIVITY_SHEET_SELECT_OPTIONS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("ActivitySheetStorage: Select options cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        optionsCount: Array.isArray(selectOptionsData)
          ? selectOptionsData.length
          : "N/A",
      });
    } catch (error) {
      console.error(
        "ActivitySheetStorage: Error saving select options to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears activity sheets cache (memory and localStorage)
   */
  clearActivitySheetsCache() {
    // Clear memory cache
    this.memoryCache.activitySheets = null;
    this.memoryCache.activitySheetsTimestamp = null;
    this.memoryCache.isActivitySheetsLoading = false;

    // Clear localStorage cache
    this._clearActivitySheetsLocalStorageCache();

    console.log("ActivitySheetStorage: Activity sheets cache cleared");
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

    console.log("ActivitySheetStorage: Select options cache cleared");
  }

  /**
   * Clears all activity sheet caches
   */
  clearAllCache() {
    this.clearActivitySheetsCache();
    this.clearSelectOptionsCache();
    console.log("ActivitySheetStorage: All caches cleared");
  }

  /**
   * Sets loading state for activity sheets cache
   * @param {boolean} isLoading - Loading state
   */
  setActivitySheetsCacheLoading(isLoading) {
    this.memoryCache.isActivitySheetsLoading = isLoading;
  }

  /**
   * Gets loading state from activity sheets cache
   * @returns {boolean} - Current loading state
   */
  isActivitySheetsCacheLoading() {
    return this.memoryCache.isActivitySheetsLoading;
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
  getActivitySheetsCacheInfo() {
    const activitySheetsMemoryValid = this._isActivitySheetsMemoryCacheValid();
    const activitySheetsLocalStorageValid =
      this._isActivitySheetsLocalStorageCacheValid();
    const selectOptionsMemoryValid = this._isSelectOptionsMemoryCacheValid();
    const selectOptionsLocalStorageValid =
      this._isSelectOptionsLocalStorageCacheValid();

    return {
      activitySheets: {
        memoryCache: {
          hasData: !!this.memoryCache.activitySheets,
          timestamp: this.memoryCache.activitySheetsTimestamp,
          age: this.memoryCache.activitySheetsTimestamp
            ? Date.now() - this.memoryCache.activitySheetsTimestamp
            : null,
          isValid: activitySheetsMemoryValid,
          isLoading: this.memoryCache.isActivitySheetsLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.ACTIVITY_SHEETS_CACHE_KEY),
          timestamp: localStorage.getItem(this.ACTIVITY_SHEETS_TIMESTAMP_KEY),
          isValid: activitySheetsLocalStorageValid,
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
            this.ACTIVITY_SHEET_SELECT_OPTIONS_CACHE_KEY,
          ),
          timestamp: localStorage.getItem(
            this.ACTIVITY_SHEET_SELECT_OPTIONS_TIMESTAMP_KEY,
          ),
          isValid: selectOptionsLocalStorageValid,
        },
        cacheDuration: this.SELECT_OPTIONS_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for activity sheets
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `ActivitySheetStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for select options
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.SELECT_OPTIONS_CACHE_DURATION = durationMs;
    console.log(
      `ActivitySheetStorage: Select options cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves activity sheet preferences to localStorage
   * @param {Object} preferences - Activity sheet preferences object
   */
  saveActivitySheetPreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_ACTIVITY_SHEET_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("ActivitySheetStorage: Activity sheet preferences saved");
    } catch (error) {
      console.error(
        "ActivitySheetStorage: Error saving activity sheet preferences",
        error,
      );
    }
  }

  /**
   * Gets activity sheet preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Activity sheet preferences or null if not found/expired
   */
  getActivitySheetPreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_ACTIVITY_SHEET_PREFERENCES");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_ACTIVITY_SHEET_PREFERENCES");
        }
      }
    } catch (error) {
      console.error(
        "ActivitySheetStorage: Error reading activity sheet preferences",
        error,
      );
    }

    return null;
  }

  /**
   * Clears activity sheet preferences
   */
  clearActivitySheetPreferences() {
    localStorage.removeItem("WORKERY_ACTIVITY_SHEET_PREFERENCES");
    console.log("ActivitySheetStorage: Activity sheet preferences cleared");
  }

  /**
   * Clears all activity sheet-related data from storage
   */
  clearAllActivitySheetData() {
    this.clearAllCache();
    this.clearActivitySheetPreferences();

    console.log("ActivitySheetStorage: All activity sheet data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isActivitySheetsMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (
      !this.memoryCache.activitySheets ||
      !this.memoryCache.activitySheetsTimestamp
    ) {
      return false;
    }
    const age = Date.now() - this.memoryCache.activitySheetsTimestamp;
    return age < maxAge;
  }

  _isActivitySheetsLocalStorageCacheValid(
    maxAge = this.DEFAULT_CACHE_DURATION,
  ) {
    try {
      const timestamp = localStorage.getItem(
        this.ACTIVITY_SHEETS_TIMESTAMP_KEY,
      );
      const activitySheets = localStorage.getItem(
        this.ACTIVITY_SHEETS_CACHE_KEY,
      );

      if (!timestamp || !activitySheets) {
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
        this.ACTIVITY_SHEET_SELECT_OPTIONS_TIMESTAMP_KEY,
      );
      const selectOptions = localStorage.getItem(
        this.ACTIVITY_SHEET_SELECT_OPTIONS_CACHE_KEY,
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

  _clearActivitySheetsLocalStorageCache() {
    localStorage.removeItem(this.ACTIVITY_SHEETS_CACHE_KEY);
    localStorage.removeItem(this.ACTIVITY_SHEETS_TIMESTAMP_KEY);
  }

  _clearSelectOptionsLocalStorageCache() {
    localStorage.removeItem(this.ACTIVITY_SHEET_SELECT_OPTIONS_CACHE_KEY);
    localStorage.removeItem(this.ACTIVITY_SHEET_SELECT_OPTIONS_TIMESTAMP_KEY);
  }
}
