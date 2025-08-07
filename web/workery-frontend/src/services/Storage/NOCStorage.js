// File Path: monorepo/web/workery-frontend/src/services/Storage/NOCStorage.js

/**
 * NOCStorage handles all National Occupational Classification-related data storage operations
 * Manages NOC caching, local storage, and data persistence
 * Since NOC is reference data, uses longer cache durations
 */
export class NOCStorage {
  constructor() {
    this.NOC_LIST_CACHE_KEY = "WORKERY_NOC_LIST_CACHE";
    this.NOC_LIST_TIMESTAMP_KEY = "WORKERY_NOC_LIST_TIMESTAMP";
    this.NOC_SELECT_OPTIONS_CACHE_KEY = "WORKERY_NOC_SELECT_OPTIONS_CACHE";
    this.NOC_SELECT_OPTIONS_TIMESTAMP_KEY =
      "WORKERY_NOC_SELECT_OPTIONS_TIMESTAMP";
    this.NOC_DETAIL_CACHE_KEY_PREFIX = "WORKERY_NOC_DETAIL_CACHE_";
    this.NOC_DETAIL_TIMESTAMP_KEY_PREFIX = "WORKERY_NOC_DETAIL_TIMESTAMP_";

    // Longer cache durations for reference data
    this.DEFAULT_CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
    this.SELECT_OPTIONS_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours for select options
    this.DETAIL_CACHE_DURATION = 60 * 60 * 1000; // 1 hour for individual NOC details

    // In-memory cache for current session
    this.memoryCache = {
      nocList: null,
      nocListTimestamp: null,
      isNOCListLoading: false,
      selectOptions: null,
      selectOptionsTimestamp: null,
      isSelectOptionsLoading: false,
      nocDetails: new Map(), // Cache individual NOC details by ID
      nocDetailTimestamps: new Map(),
    };

    if (process.env.NODE_ENV === "development") {
      console.log(
        "NOCStorage initialized with longer cache durations for reference data",
      );
    }
  }

  /**
   * Gets NOC list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached NOC data or null if not found/expired
   */
  getNOCListFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isNOCListMemoryCacheValid(maxAge)) {
      console.log("NOCStorage: Using memory cache for NOC list");
      return this.memoryCache.nocList;
    }

    // Check localStorage cache
    try {
      const cachedNOCList = localStorage.getItem(this.NOC_LIST_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(this.NOC_LIST_TIMESTAMP_KEY);

      if (cachedNOCList && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const nocListData = JSON.parse(cachedNOCList);

          // Update memory cache with localStorage data
          this.memoryCache.nocList = nocListData;
          this.memoryCache.nocListTimestamp = timestamp;
          this.memoryCache.isNOCListLoading = false;

          console.log("NOCStorage: Using localStorage cache for NOC list");
          return nocListData;
        } else {
          console.log("NOCStorage: localStorage cache expired, clearing");
          this._clearNOCListLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "NOCStorage: Error reading NOC list from localStorage",
        error,
      );
      this._clearNOCListLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves NOC list to cache (both memory and localStorage)
   * @param {Object} nocListData - NOC data to cache
   */
  saveNOCListToCache(nocListData) {
    if (!nocListData) {
      console.warn(
        "NOCStorage: Attempted to save null/undefined NOC list data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.nocList = nocListData;
    this.memoryCache.nocListTimestamp = timestamp;
    this.memoryCache.isNOCListLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.NOC_LIST_CACHE_KEY,
        JSON.stringify(nocListData),
      );
      localStorage.setItem(this.NOC_LIST_TIMESTAMP_KEY, timestamp.toString());

      console.log("NOCStorage: NOC list cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        count: nocListData.results ? nocListData.results.length : 0,
      });
    } catch (error) {
      console.error("NOCStorage: Error saving NOC list to localStorage", error);
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
   * Gets individual NOC detail from cache
   * @param {string|number} nocId - NOC ID
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached NOC detail or null if not found/expired
   */
  getNOCDetailFromCache(nocId, maxAge = this.DETAIL_CACHE_DURATION) {
    const cacheKey = `${nocId}`;

    // Check memory cache first
    if (this.memoryCache.nocDetails.has(cacheKey)) {
      const timestamp = this.memoryCache.nocDetailTimestamps.get(cacheKey);
      if (timestamp && Date.now() - timestamp < maxAge) {
        console.log(`NOCStorage: Using memory cache for NOC detail ${nocId}`);
        return this.memoryCache.nocDetails.get(cacheKey);
      } else {
        // Remove expired memory cache
        this.memoryCache.nocDetails.delete(cacheKey);
        this.memoryCache.nocDetailTimestamps.delete(cacheKey);
      }
    }

    // Check localStorage cache
    try {
      const localStorageKey = `${this.NOC_DETAIL_CACHE_KEY_PREFIX}${nocId}`;
      const timestampKey = `${this.NOC_DETAIL_TIMESTAMP_KEY_PREFIX}${nocId}`;

      const cachedDetail = localStorage.getItem(localStorageKey);
      const cachedTimestamp = localStorage.getItem(timestampKey);

      if (cachedDetail && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const detailData = JSON.parse(cachedDetail);

          // Update memory cache
          this.memoryCache.nocDetails.set(cacheKey, detailData);
          this.memoryCache.nocDetailTimestamps.set(cacheKey, timestamp);

          console.log(
            `NOCStorage: Using localStorage cache for NOC detail ${nocId}`,
          );
          return detailData;
        } else {
          // Clean up expired localStorage cache
          localStorage.removeItem(localStorageKey);
          localStorage.removeItem(timestampKey);
        }
      }
    } catch (error) {
      console.error(
        `NOCStorage: Error reading NOC detail ${nocId} from localStorage`,
        error,
      );
    }

    return null;
  }

  /**
   * Saves individual NOC detail to cache
   * @param {string|number} nocId - NOC ID
   * @param {Object} detailData - NOC detail data to cache
   */
  saveNOCDetailToCache(nocId, detailData) {
    if (!detailData) {
      console.warn(
        `NOCStorage: Attempted to save null/undefined NOC detail data for ${nocId}`,
      );
      return;
    }

    const timestamp = Date.now();
    const cacheKey = `${nocId}`;

    // Save to memory cache
    this.memoryCache.nocDetails.set(cacheKey, detailData);
    this.memoryCache.nocDetailTimestamps.set(cacheKey, timestamp);

    // Save to localStorage
    try {
      const localStorageKey = `${this.NOC_DETAIL_CACHE_KEY_PREFIX}${nocId}`;
      const timestampKey = `${this.NOC_DETAIL_TIMESTAMP_KEY_PREFIX}${nocId}`;

      localStorage.setItem(localStorageKey, JSON.stringify(detailData));
      localStorage.setItem(timestampKey, timestamp.toString());

      console.log(`NOCStorage: NOC detail ${nocId} cached successfully`);
    } catch (error) {
      console.error(
        `NOCStorage: Error saving NOC detail ${nocId} to localStorage`,
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears NOC list cache (memory and localStorage)
   */
  clearNOCListCache() {
    // Clear memory cache
    this.memoryCache.nocList = null;
    this.memoryCache.nocListTimestamp = null;
    this.memoryCache.isNOCListLoading = false;

    // Clear localStorage cache
    this._clearNOCListLocalStorageCache();

    console.log("NOCStorage: NOC list cache cleared");
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
   * Clears all NOC detail caches
   */
  clearNOCDetailCaches() {
    // Clear memory cache
    this.memoryCache.nocDetails.clear();
    this.memoryCache.nocDetailTimestamps.clear();

    // Clear localStorage cache
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (
          key.startsWith(this.NOC_DETAIL_CACHE_KEY_PREFIX) ||
          key.startsWith(this.NOC_DETAIL_TIMESTAMP_KEY_PREFIX)
        ) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error(
        "NOCStorage: Error clearing NOC detail caches from localStorage",
        error,
      );
    }

    console.log("NOCStorage: All NOC detail caches cleared");
  }

  /**
   * Clears all NOC caches
   */
  clearAllCache() {
    this.clearNOCListCache();
    this.clearSelectOptionsCache();
    this.clearNOCDetailCaches();
    console.log("NOCStorage: All NOC caches cleared");
  }

  /**
   * Sets loading state for NOC list cache
   * @param {boolean} isLoading - Loading state
   */
  setNOCListCacheLoading(isLoading) {
    this.memoryCache.isNOCListLoading = isLoading;
  }

  /**
   * Gets loading state from NOC list cache
   * @returns {boolean} - Current loading state
   */
  isNOCListCacheLoading() {
    return this.memoryCache.isNOCListLoading;
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
  getNOCCacheInfo() {
    const nocListMemoryValid = this._isNOCListMemoryCacheValid();
    const nocListLocalStorageValid = this._isNOCListLocalStorageCacheValid();
    const selectOptionsMemoryValid = this._isSelectOptionsMemoryCacheValid();
    const selectOptionsLocalStorageValid =
      this._isSelectOptionsLocalStorageCacheValid();

    return {
      nocList: {
        memoryCache: {
          hasData: !!this.memoryCache.nocList,
          timestamp: this.memoryCache.nocListTimestamp,
          age: this.memoryCache.nocListTimestamp
            ? Date.now() - this.memoryCache.nocListTimestamp
            : null,
          isValid: nocListMemoryValid,
          isLoading: this.memoryCache.isNOCListLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.NOC_LIST_CACHE_KEY),
          timestamp: localStorage.getItem(this.NOC_LIST_TIMESTAMP_KEY),
          isValid: nocListLocalStorageValid,
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
      nocDetails: {
        memoryCacheCount: this.memoryCache.nocDetails.size,
        detailCacheDuration: this.DETAIL_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for NOC list
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
  saveNOCPreferences(preferences) {
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
   * @param {number} maxAge - Maximum age in milliseconds (default: 7 days for preferences)
   * @returns {Object|null} - NOC preferences or null if not found/expired
   */
  getNOCPreferences(maxAge = 7 * 24 * 60 * 60 * 1000) {
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
  clearNOCPreferences() {
    localStorage.removeItem("WORKERY_NOC_PREFERENCES");
    console.log("NOCStorage: NOC preferences cleared");
  }

  /**
   * Clears all NOC-related data from storage
   */
  clearAllNOCData() {
    this.clearAllCache();
    this.clearNOCPreferences();

    console.log("NOCStorage: All NOC data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isNOCListMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (!this.memoryCache.nocList || !this.memoryCache.nocListTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.nocListTimestamp;
    return age < maxAge;
  }

  _isNOCListLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.NOC_LIST_TIMESTAMP_KEY);
      const nocList = localStorage.getItem(this.NOC_LIST_CACHE_KEY);

      if (!timestamp || !nocList) {
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

  _clearNOCListLocalStorageCache() {
    localStorage.removeItem(this.NOC_LIST_CACHE_KEY);
    localStorage.removeItem(this.NOC_LIST_TIMESTAMP_KEY);
  }

  _clearSelectOptionsLocalStorageCache() {
    localStorage.removeItem(this.NOC_SELECT_OPTIONS_CACHE_KEY);
    localStorage.removeItem(this.NOC_SELECT_OPTIONS_TIMESTAMP_KEY);
  }
}
