// File Path: monorepo/web/workery-frontend/src/services/Storage/StaffStorage.js

/**
 * StaffStorage handles all staff-related data storage operations
 * Manages staff caching, local storage, and data persistence
 */
export class StaffStorage {
  constructor() {
    this.STAFF_CACHE_KEY = "WORKERY_STAFF_CACHE";
    this.STAFF_TIMESTAMP_KEY = "WORKERY_STAFF_TIMESTAMP";
    this.STAFF_SELECT_OPTIONS_CACHE_KEY = "WORKERY_STAFF_SELECT_OPTIONS_CACHE";
    this.STAFF_SELECT_OPTIONS_TIMESTAMP_KEY =
      "WORKERY_STAFF_SELECT_OPTIONS_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
    this.SELECT_OPTIONS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for select options

    // In-memory cache for current session
    this.memoryCache = {
      staff: null,
      staffTimestamp: null,
      isStaffLoading: false,
      selectOptions: null,
      selectOptionsTimestamp: null,
      isSelectOptionsLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("StaffStorage initialized");
    }
  }

  /**
   * Gets staff list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached staff data or null if not found/expired
   */
  getStaffFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isStaffMemoryCacheValid(maxAge)) {
      console.log("StaffStorage: Using memory cache for staff list");
      return this.memoryCache.staff;
    }

    // Check localStorage cache
    try {
      const cachedStaff = localStorage.getItem(this.STAFF_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(this.STAFF_TIMESTAMP_KEY);

      if (cachedStaff && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const staffData = JSON.parse(cachedStaff);

          // Update memory cache with localStorage data
          this.memoryCache.staff = staffData;
          this.memoryCache.staffTimestamp = timestamp;
          this.memoryCache.isStaffLoading = false;

          console.log("StaffStorage: Using localStorage cache for staff list");
          return staffData;
        } else {
          console.log("StaffStorage: localStorage cache expired, clearing");
          this._clearStaffLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "StaffStorage: Error reading staff from localStorage",
        error,
      );
      this._clearStaffLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves staff list to cache (both memory and localStorage)
   * @param {Object} staffData - Staff data to cache
   */
  saveStaffToCache(staffData) {
    if (!staffData) {
      console.warn("StaffStorage: Attempted to save null/undefined staff data");
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.staff = staffData;
    this.memoryCache.staffTimestamp = timestamp;
    this.memoryCache.isStaffLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(this.STAFF_CACHE_KEY, JSON.stringify(staffData));
      localStorage.setItem(this.STAFF_TIMESTAMP_KEY, timestamp.toString());

      console.log("StaffStorage: Staff list cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        count: staffData.results ? staffData.results.length : 0,
      });
    } catch (error) {
      console.error("StaffStorage: Error saving staff to localStorage", error);
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets staff select options from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached select options data or null if not found/expired
   */
  getSelectOptionsFromCache(maxAge = this.SELECT_OPTIONS_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isSelectOptionsMemoryCacheValid(maxAge)) {
      console.log("StaffStorage: Using memory cache for select options");
      return this.memoryCache.selectOptions;
    }

    // Check localStorage cache
    try {
      const cachedSelectOptions = localStorage.getItem(
        this.STAFF_SELECT_OPTIONS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.STAFF_SELECT_OPTIONS_TIMESTAMP_KEY,
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
            "StaffStorage: Using localStorage cache for select options",
          );
          return selectOptionsData;
        } else {
          console.log("StaffStorage: Select options cache expired, clearing");
          this._clearSelectOptionsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "StaffStorage: Error reading select options from localStorage",
        error,
      );
      this._clearSelectOptionsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves staff select options to cache (both memory and localStorage)
   * @param {Object} selectOptionsData - Select options data to cache
   */
  saveSelectOptionsToCache(selectOptionsData) {
    if (!selectOptionsData) {
      console.warn(
        "StaffStorage: Attempted to save null/undefined select options data",
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
        this.STAFF_SELECT_OPTIONS_CACHE_KEY,
        JSON.stringify(selectOptionsData),
      );
      localStorage.setItem(
        this.STAFF_SELECT_OPTIONS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("StaffStorage: Select options cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        optionsCount: Array.isArray(selectOptionsData)
          ? selectOptionsData.length
          : selectOptionsData.results
            ? selectOptionsData.results.length
            : "N/A",
      });
    } catch (error) {
      console.error(
        "StaffStorage: Error saving select options to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears staff cache (memory and localStorage)
   */
  clearStaffCache() {
    // Clear memory cache
    this.memoryCache.staff = null;
    this.memoryCache.staffTimestamp = null;
    this.memoryCache.isStaffLoading = false;

    // Clear localStorage cache
    this._clearStaffLocalStorageCache();

    console.log("StaffStorage: Staff cache cleared");
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

    console.log("StaffStorage: Select options cache cleared");
  }

  /**
   * Clears all staff caches
   */
  clearAllCache() {
    this.clearStaffCache();
    this.clearSelectOptionsCache();
    console.log("StaffStorage: All caches cleared");
  }

  /**
   * Sets loading state for staff cache
   * @param {boolean} isLoading - Loading state
   */
  setStaffCacheLoading(isLoading) {
    this.memoryCache.isStaffLoading = isLoading;
  }

  /**
   * Gets loading state from staff cache
   * @returns {boolean} - Current loading state
   */
  isStaffCacheLoading() {
    return this.memoryCache.isStaffLoading;
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
  getStaffCacheInfo() {
    const staffMemoryValid = this._isStaffMemoryCacheValid();
    const staffLocalStorageValid = this._isStaffLocalStorageCacheValid();
    const selectOptionsMemoryValid = this._isSelectOptionsMemoryCacheValid();
    const selectOptionsLocalStorageValid =
      this._isSelectOptionsLocalStorageCacheValid();

    return {
      staff: {
        memoryCache: {
          hasData: !!this.memoryCache.staff,
          timestamp: this.memoryCache.staffTimestamp,
          age: this.memoryCache.staffTimestamp
            ? Date.now() - this.memoryCache.staffTimestamp
            : null,
          isValid: staffMemoryValid,
          isLoading: this.memoryCache.isStaffLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.STAFF_CACHE_KEY),
          timestamp: localStorage.getItem(this.STAFF_TIMESTAMP_KEY),
          isValid: staffLocalStorageValid,
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
          hasData: !!localStorage.getItem(this.STAFF_SELECT_OPTIONS_CACHE_KEY),
          timestamp: localStorage.getItem(
            this.STAFF_SELECT_OPTIONS_TIMESTAMP_KEY,
          ),
          isValid: selectOptionsLocalStorageValid,
        },
        cacheDuration: this.SELECT_OPTIONS_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for staff
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `StaffStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for select options
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.SELECT_OPTIONS_CACHE_DURATION = durationMs;
    console.log(
      `StaffStorage: Select options cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves staff preferences to localStorage
   * @param {Object} preferences - Staff preferences object
   */
  saveStaffPreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_STAFF_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("StaffStorage: Staff preferences saved");
    } catch (error) {
      console.error("StaffStorage: Error saving staff preferences", error);
    }
  }

  /**
   * Gets staff preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Staff preferences or null if not found/expired
   */
  getStaffPreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_STAFF_PREFERENCES");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_STAFF_PREFERENCES");
        }
      }
    } catch (error) {
      console.error("StaffStorage: Error reading staff preferences", error);
    }

    return null;
  }

  /**
   * Clears staff preferences
   */
  clearStaffPreferences() {
    localStorage.removeItem("WORKERY_STAFF_PREFERENCES");
    console.log("StaffStorage: Staff preferences cleared");
  }

  /**
   * Clears all staff-related data from storage
   */
  clearAllStaffData() {
    this.clearAllCache();
    this.clearStaffPreferences();

    console.log("StaffStorage: All staff data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isStaffMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (!this.memoryCache.staff || !this.memoryCache.staffTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.staffTimestamp;
    return age < maxAge;
  }

  _isStaffLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.STAFF_TIMESTAMP_KEY);
      const staff = localStorage.getItem(this.STAFF_CACHE_KEY);

      if (!timestamp || !staff) {
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
        this.STAFF_SELECT_OPTIONS_TIMESTAMP_KEY,
      );
      const selectOptions = localStorage.getItem(
        this.STAFF_SELECT_OPTIONS_CACHE_KEY,
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

  _clearStaffLocalStorageCache() {
    localStorage.removeItem(this.STAFF_CACHE_KEY);
    localStorage.removeItem(this.STAFF_TIMESTAMP_KEY);
  }

  _clearSelectOptionsLocalStorageCache() {
    localStorage.removeItem(this.STAFF_SELECT_OPTIONS_CACHE_KEY);
    localStorage.removeItem(this.STAFF_SELECT_OPTIONS_TIMESTAMP_KEY);
  }
}
