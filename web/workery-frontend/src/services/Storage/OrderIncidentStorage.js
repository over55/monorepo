// File Path: web/workery-frontend/src/services/Storage/OrderIncidentStorage.js

/**
 * OrderIncidentStorage handles all order incident-related data storage operations
 * Manages order incident caching, local storage, and data persistence
 */
export class OrderIncidentStorage {
  constructor() {
    this.ORDER_INCIDENTS_CACHE_KEY_PREFIX = "WORKERY_ORDER_INCIDENTS_CACHE_";
    this.ORDER_INCIDENTS_TIMESTAMP_KEY_PREFIX =
      "WORKERY_ORDER_INCIDENTS_TIMESTAMP_";
    this.ORDER_INCIDENT_SELECT_OPTIONS_CACHE_KEY =
      "WORKERY_ORDER_INCIDENT_SELECT_OPTIONS_CACHE";
    this.ORDER_INCIDENT_SELECT_OPTIONS_TIMESTAMP_KEY =
      "WORKERY_ORDER_INCIDENT_SELECT_OPTIONS_TIMESTAMP";
    this.ORDER_INCIDENT_STATISTICS_CACHE_KEY =
      "WORKERY_ORDER_INCIDENT_STATISTICS_CACHE";
    this.ORDER_INCIDENT_STATISTICS_TIMESTAMP_KEY =
      "WORKERY_ORDER_INCIDENT_STATISTICS_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
    this.SELECT_OPTIONS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for select options
    this.STATISTICS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for statistics

    // In-memory cache for current session - now supports multiple cache keys
    this.memoryCache = {
      orderIncidentsByKey: new Map(), // Map of cacheKey -> { data, timestamp, isLoading }
      selectOptions: null,
      selectOptionsTimestamp: null,
      isSelectOptionsLoading: false,
      statistics: null,
      statisticsTimestamp: null,
      isStatisticsLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log(
        "OrderIncidentStorage initialized with parameter-aware caching",
      );
    }
  }

  /**
   * Gets order incidents list from cache by specific cache key
   * @param {string} cacheKey - The cache key to retrieve
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached order incidents data or null if not found/expired
   */
  getOrderIncidentsCacheByKey(cacheKey, maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isOrderIncidentsMemoryCacheValidByKey(cacheKey, maxAge)) {
      console.log(
        "OrderIncidentStorage: Using memory cache for order incidents with key:",
        cacheKey,
      );
      return this.memoryCache.orderIncidentsByKey.get(cacheKey).data;
    }

    // Check localStorage cache
    try {
      const localStorageKey = `${this.ORDER_INCIDENTS_CACHE_KEY_PREFIX}${cacheKey}`;
      const timestampKey = `${this.ORDER_INCIDENTS_TIMESTAMP_KEY_PREFIX}${cacheKey}`;

      const cachedOrderIncidents = localStorage.getItem(localStorageKey);
      const cachedTimestamp = localStorage.getItem(timestampKey);

      if (cachedOrderIncidents && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const orderIncidentsData = JSON.parse(cachedOrderIncidents);

          // Update memory cache with localStorage data
          this.memoryCache.orderIncidentsByKey.set(cacheKey, {
            data: orderIncidentsData,
            timestamp: timestamp,
            isLoading: false,
          });

          console.log(
            "OrderIncidentStorage: Using localStorage cache for order incidents with key:",
            cacheKey,
          );
          return orderIncidentsData;
        } else {
          console.log(
            "OrderIncidentStorage: localStorage cache expired for key:",
            cacheKey,
          );
          this._clearOrderIncidentsLocalStorageCacheByKey(cacheKey);
        }
      }
    } catch (error) {
      console.error(
        "OrderIncidentStorage: Error reading order incidents from localStorage for key:",
        cacheKey,
        error,
      );
      this._clearOrderIncidentsLocalStorageCacheByKey(cacheKey);
    }

    return null;
  }

  /**
   * DEPRECATED: Gets order incidents from cache without considering parameters
   * @deprecated Use getOrderIncidentsCacheByKey instead
   */
  getOrderIncidentsFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    console.warn(
      "OrderIncidentStorage: getOrderIncidentsFromCache is deprecated. Use getOrderIncidentsCacheByKey instead.",
    );
    return this.getOrderIncidentsCacheByKey("default", maxAge);
  }

  /**
   * DEPRECATED: Use getOrderIncidentsCacheByKey instead
   * @deprecated
   */
  getOrderIncidentsFromCacheByKey(
    cacheKey,
    maxAge = this.DEFAULT_CACHE_DURATION,
  ) {
    return this.getOrderIncidentsCacheByKey(cacheKey, maxAge);
  }

  /**
   * Saves order incidents list to cache with specific cache key
   * @param {string} cacheKey - The cache key to save under
   * @param {Object} orderIncidentsData - Order incidents data to cache
   */
  saveOrderIncidentsToCacheByKey(cacheKey, orderIncidentsData) {
    if (!orderIncidentsData) {
      console.warn(
        "OrderIncidentStorage: Attempted to save null/undefined order incidents data",
      );
      return;
    }

    if (!cacheKey) {
      console.warn("OrderIncidentStorage: Cache key is required");
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.orderIncidentsByKey.set(cacheKey, {
      data: orderIncidentsData,
      timestamp: timestamp,
      isLoading: false,
    });

    // Save to localStorage
    try {
      const localStorageKey = `${this.ORDER_INCIDENTS_CACHE_KEY_PREFIX}${cacheKey}`;
      const timestampKey = `${this.ORDER_INCIDENTS_TIMESTAMP_KEY_PREFIX}${cacheKey}`;

      localStorage.setItem(localStorageKey, JSON.stringify(orderIncidentsData));
      localStorage.setItem(timestampKey, timestamp.toString());

      console.log(
        "OrderIncidentStorage: Order incidents list cached successfully",
        {
          cacheKey: cacheKey,
          timestamp: new Date(timestamp).toISOString(),
          count: orderIncidentsData.results
            ? orderIncidentsData.results.length
            : 0,
        },
      );
    } catch (error) {
      console.error(
        "OrderIncidentStorage: Error saving order incidents to localStorage for key:",
        cacheKey,
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * DEPRECATED: Saves order incidents to cache without considering parameters
   * @deprecated Use saveOrderIncidentsToCacheByKey instead
   */
  saveOrderIncidentsToCache(orderIncidentsData) {
    console.warn(
      "OrderIncidentStorage: saveOrderIncidentsToCache is deprecated. Use saveOrderIncidentsToCacheByKey instead.",
    );
    this.saveOrderIncidentsToCacheByKey("default", orderIncidentsData);
  }

  /**
   * Sets loading state for specific cache key
   * @param {string} cacheKey - The cache key
   * @param {boolean} isLoading - Loading state
   */
  setOrderIncidentsCacheLoadingForKey(cacheKey, isLoading) {
    if (!this.memoryCache.orderIncidentsByKey.has(cacheKey)) {
      this.memoryCache.orderIncidentsByKey.set(cacheKey, {
        data: null,
        timestamp: null,
        isLoading: isLoading,
      });
    } else {
      const cache = this.memoryCache.orderIncidentsByKey.get(cacheKey);
      cache.isLoading = isLoading;
    }
  }

  /**
   * Gets loading state for specific cache key
   * @param {string} cacheKey - The cache key
   * @returns {boolean} - Current loading state
   */
  isOrderIncidentsCacheLoadingForKey(cacheKey) {
    const cache = this.memoryCache.orderIncidentsByKey.get(cacheKey);
    return cache ? cache.isLoading : false;
  }

  /**
   * DEPRECATED: Sets loading state for default cache
   * @deprecated Use setOrderIncidentsCacheLoadingForKey instead
   */
  setOrderIncidentsCacheLoading(isLoading) {
    console.warn(
      "OrderIncidentStorage: setOrderIncidentsCacheLoading is deprecated. Use setOrderIncidentsCacheLoadingForKey instead.",
    );
    this.setOrderIncidentsCacheLoadingForKey("default", isLoading);
  }

  /**
   * DEPRECATED: Gets loading state from default cache
   * @deprecated Use isOrderIncidentsCacheLoadingForKey instead
   */
  isOrderIncidentsCacheLoading() {
    console.warn(
      "OrderIncidentStorage: isOrderIncidentsCacheLoading is deprecated. Use isOrderIncidentsCacheLoadingForKey instead.",
    );
    return this.isOrderIncidentsCacheLoadingForKey("default");
  }

  /**
   * Clears all order incidents caches (memory and localStorage)
   */
  clearAllOrderIncidentsCache() {
    // Clear all memory caches
    this.memoryCache.orderIncidentsByKey.clear();

    // Clear all localStorage caches with the prefix
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key.startsWith(this.ORDER_INCIDENTS_CACHE_KEY_PREFIX) ||
        key.startsWith(this.ORDER_INCIDENTS_TIMESTAMP_KEY_PREFIX)
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    console.log("OrderIncidentStorage: All order incidents caches cleared");
  }

  /**
   * DEPRECATED: Clears order incidents cache
   * @deprecated Use clearAllOrderIncidentsCache instead
   */
  clearOrderIncidentsCache() {
    console.warn(
      "OrderIncidentStorage: clearOrderIncidentsCache is deprecated. Use clearAllOrderIncidentsCache instead.",
    );
    this.clearAllOrderIncidentsCache();
  }

  /**
   * Clears order incidents cache for a specific key
   * @param {string} cacheKey - The cache key to clear
   */
  clearOrderIncidentsCacheByKey(cacheKey) {
    // Clear memory cache
    this.memoryCache.orderIncidentsByKey.delete(cacheKey);

    // Clear localStorage cache
    this._clearOrderIncidentsLocalStorageCacheByKey(cacheKey);

    console.log(`OrderIncidentStorage: Cache cleared for key: ${cacheKey}`);
  }

  /**
   * Gets order incident select options from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached select options data or null if not found/expired
   */
  getSelectOptionsFromCache(maxAge = this.SELECT_OPTIONS_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isSelectOptionsMemoryCacheValid(maxAge)) {
      console.log(
        "OrderIncidentStorage: Using memory cache for select options",
      );
      return this.memoryCache.selectOptions;
    }

    // Check localStorage cache
    try {
      const cachedSelectOptions = localStorage.getItem(
        this.ORDER_INCIDENT_SELECT_OPTIONS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.ORDER_INCIDENT_SELECT_OPTIONS_TIMESTAMP_KEY,
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
            "OrderIncidentStorage: Using localStorage cache for select options",
          );
          return selectOptionsData;
        } else {
          console.log(
            "OrderIncidentStorage: Select options cache expired, clearing",
          );
          this._clearSelectOptionsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "OrderIncidentStorage: Error reading select options from localStorage",
        error,
      );
      this._clearSelectOptionsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves order incident select options to cache (both memory and localStorage)
   * @param {Object} selectOptionsData - Select options data to cache
   */
  saveSelectOptionsToCache(selectOptionsData) {
    if (!selectOptionsData) {
      console.warn(
        "OrderIncidentStorage: Attempted to save null/undefined select options data",
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
        this.ORDER_INCIDENT_SELECT_OPTIONS_CACHE_KEY,
        JSON.stringify(selectOptionsData),
      );
      localStorage.setItem(
        this.ORDER_INCIDENT_SELECT_OPTIONS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("OrderIncidentStorage: Select options cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        optionsCount: Array.isArray(selectOptionsData)
          ? selectOptionsData.length
          : "N/A",
      });
    } catch (error) {
      console.error(
        "OrderIncidentStorage: Error saving select options to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets order incident statistics from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached statistics data or null if not found/expired
   */
  getStatisticsFromCache(maxAge = this.STATISTICS_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isStatisticsMemoryCacheValid(maxAge)) {
      console.log("OrderIncidentStorage: Using memory cache for statistics");
      return this.memoryCache.statistics;
    }

    // Check localStorage cache
    try {
      const cachedStatistics = localStorage.getItem(
        this.ORDER_INCIDENT_STATISTICS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.ORDER_INCIDENT_STATISTICS_TIMESTAMP_KEY,
      );

      if (cachedStatistics && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const statisticsData = JSON.parse(cachedStatistics);

          // Update memory cache with localStorage data
          this.memoryCache.statistics = statisticsData;
          this.memoryCache.statisticsTimestamp = timestamp;
          this.memoryCache.isStatisticsLoading = false;

          console.log(
            "OrderIncidentStorage: Using localStorage cache for statistics",
          );
          return statisticsData;
        } else {
          console.log(
            "OrderIncidentStorage: Statistics cache expired, clearing",
          );
          this._clearStatisticsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "OrderIncidentStorage: Error reading statistics from localStorage",
        error,
      );
      this._clearStatisticsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves order incident statistics to cache (both memory and localStorage)
   * @param {Object} statisticsData - Statistics data to cache
   */
  saveStatisticsToCache(statisticsData) {
    if (!statisticsData) {
      console.warn(
        "OrderIncidentStorage: Attempted to save null/undefined statistics data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.statistics = statisticsData;
    this.memoryCache.statisticsTimestamp = timestamp;
    this.memoryCache.isStatisticsLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.ORDER_INCIDENT_STATISTICS_CACHE_KEY,
        JSON.stringify(statisticsData),
      );
      localStorage.setItem(
        this.ORDER_INCIDENT_STATISTICS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("OrderIncidentStorage: Statistics cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
      });
    } catch (error) {
      console.error(
        "OrderIncidentStorage: Error saving statistics to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
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

    console.log("OrderIncidentStorage: Select options cache cleared");
  }

  /**
   * Clears statistics cache (memory and localStorage)
   */
  clearStatisticsCache() {
    // Clear memory cache
    this.memoryCache.statistics = null;
    this.memoryCache.statisticsTimestamp = null;
    this.memoryCache.isStatisticsLoading = false;

    // Clear localStorage cache
    this._clearStatisticsLocalStorageCache();

    console.log("OrderIncidentStorage: Statistics cache cleared");
  }

  /**
   * Clears all order incident caches
   */
  clearAllCache() {
    this.clearAllOrderIncidentsCache();
    this.clearSelectOptionsCache();
    this.clearStatisticsCache();
    console.log("OrderIncidentStorage: All caches cleared");
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
   * Sets loading state for statistics cache
   * @param {boolean} isLoading - Loading state
   */
  setStatisticsCacheLoading(isLoading) {
    this.memoryCache.isStatisticsLoading = isLoading;
  }

  /**
   * Gets loading state from statistics cache
   * @returns {boolean} - Current loading state
   */
  isStatisticsCacheLoading() {
    return this.memoryCache.isStatisticsLoading;
  }

  /**
   * Gets cache information for debugging
   * @returns {Object} - Cache state information
   */
  getOrderIncidentsCacheInfo() {
    const cacheInfo = {
      orderIncidents: {
        memoryCacheKeys: Array.from(
          this.memoryCache.orderIncidentsByKey.keys(),
        ),
        memoryCacheCount: this.memoryCache.orderIncidentsByKey.size,
        localStorageCacheCount: this._countLocalStorageCaches(),
        cacheDuration: this.DEFAULT_CACHE_DURATION,
      },
      selectOptions: {
        memoryCache: {
          hasData: !!this.memoryCache.selectOptions,
          timestamp: this.memoryCache.selectOptionsTimestamp,
          age: this.memoryCache.selectOptionsTimestamp
            ? Date.now() - this.memoryCache.selectOptionsTimestamp
            : null,
          isValid: this._isSelectOptionsMemoryCacheValid(),
          isLoading: this.memoryCache.isSelectOptionsLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(
            this.ORDER_INCIDENT_SELECT_OPTIONS_CACHE_KEY,
          ),
          timestamp: localStorage.getItem(
            this.ORDER_INCIDENT_SELECT_OPTIONS_TIMESTAMP_KEY,
          ),
          isValid: this._isSelectOptionsLocalStorageCacheValid(),
        },
        cacheDuration: this.SELECT_OPTIONS_CACHE_DURATION,
      },
      statistics: {
        memoryCache: {
          hasData: !!this.memoryCache.statistics,
          timestamp: this.memoryCache.statisticsTimestamp,
          age: this.memoryCache.statisticsTimestamp
            ? Date.now() - this.memoryCache.statisticsTimestamp
            : null,
          isValid: this._isStatisticsMemoryCacheValid(),
          isLoading: this.memoryCache.isStatisticsLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(
            this.ORDER_INCIDENT_STATISTICS_CACHE_KEY,
          ),
          timestamp: localStorage.getItem(
            this.ORDER_INCIDENT_STATISTICS_TIMESTAMP_KEY,
          ),
          isValid: this._isStatisticsLocalStorageCacheValid(),
        },
        cacheDuration: this.STATISTICS_CACHE_DURATION,
      },
    };

    // Add details for each cached key
    cacheInfo.orderIncidents.details = {};
    this.memoryCache.orderIncidentsByKey.forEach((value, key) => {
      cacheInfo.orderIncidents.details[key] = {
        hasData: !!value.data,
        timestamp: value.timestamp,
        age: value.timestamp ? Date.now() - value.timestamp : null,
        isLoading: value.isLoading,
        isValid: this._isOrderIncidentsMemoryCacheValidByKey(key),
      };
    });

    return cacheInfo;
  }

  /**
   * Sets cache duration for order incidents
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `OrderIncidentStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for select options
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.SELECT_OPTIONS_CACHE_DURATION = durationMs;
    console.log(
      `OrderIncidentStorage: Select options cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for statistics
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setStatisticsCacheDuration(durationMs) {
    this.STATISTICS_CACHE_DURATION = durationMs;
    console.log(
      `OrderIncidentStorage: Statistics cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves order incident preferences to localStorage
   * @param {Object} preferences - Order incident preferences object
   */
  saveOrderIncidentPreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_ORDER_INCIDENT_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("OrderIncidentStorage: Order incident preferences saved");
    } catch (error) {
      console.error(
        "OrderIncidentStorage: Error saving order incident preferences",
        error,
      );
    }
  }

  /**
   * Gets order incident preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Order incident preferences or null if not found/expired
   */
  getOrderIncidentPreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_ORDER_INCIDENT_PREFERENCES");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_ORDER_INCIDENT_PREFERENCES");
        }
      }
    } catch (error) {
      console.error(
        "OrderIncidentStorage: Error reading order incident preferences",
        error,
      );
    }

    return null;
  }

  /**
   * Clears order incident preferences
   */
  clearOrderIncidentPreferences() {
    localStorage.removeItem("WORKERY_ORDER_INCIDENT_PREFERENCES");
    console.log("OrderIncidentStorage: Order incident preferences cleared");
  }

  /**
   * Clears all order incident-related data from storage
   */
  clearAllOrderIncidentData() {
    this.clearAllCache();
    this.clearOrderIncidentPreferences();

    console.log("OrderIncidentStorage: All order incident data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isOrderIncidentsMemoryCacheValidByKey(
    cacheKey,
    maxAge = this.DEFAULT_CACHE_DURATION,
  ) {
    const cache = this.memoryCache.orderIncidentsByKey.get(cacheKey);
    if (!cache || !cache.data || !cache.timestamp) {
      return false;
    }
    const age = Date.now() - cache.timestamp;
    return age < maxAge;
  }

  _isOrderIncidentsLocalStorageCacheValidByKey(
    cacheKey,
    maxAge = this.DEFAULT_CACHE_DURATION,
  ) {
    try {
      const timestampKey = `${this.ORDER_INCIDENTS_TIMESTAMP_KEY_PREFIX}${cacheKey}`;
      const localStorageKey = `${this.ORDER_INCIDENTS_CACHE_KEY_PREFIX}${cacheKey}`;

      const timestamp = localStorage.getItem(timestampKey);
      const orderIncidents = localStorage.getItem(localStorageKey);

      if (!timestamp || !orderIncidents) {
        return false;
      }

      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  _clearOrderIncidentsLocalStorageCacheByKey(cacheKey) {
    const localStorageKey = `${this.ORDER_INCIDENTS_CACHE_KEY_PREFIX}${cacheKey}`;
    const timestampKey = `${this.ORDER_INCIDENTS_TIMESTAMP_KEY_PREFIX}${cacheKey}`;

    localStorage.removeItem(localStorageKey);
    localStorage.removeItem(timestampKey);
  }

  _countLocalStorageCaches() {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.ORDER_INCIDENTS_CACHE_KEY_PREFIX)) {
        count++;
      }
    }
    return count;
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
        this.ORDER_INCIDENT_SELECT_OPTIONS_TIMESTAMP_KEY,
      );
      const selectOptions = localStorage.getItem(
        this.ORDER_INCIDENT_SELECT_OPTIONS_CACHE_KEY,
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

  _isStatisticsMemoryCacheValid(maxAge = this.STATISTICS_CACHE_DURATION) {
    if (!this.memoryCache.statistics || !this.memoryCache.statisticsTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.statisticsTimestamp;
    return age < maxAge;
  }

  _isStatisticsLocalStorageCacheValid(maxAge = this.STATISTICS_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(
        this.ORDER_INCIDENT_STATISTICS_TIMESTAMP_KEY,
      );
      const statistics = localStorage.getItem(
        this.ORDER_INCIDENT_STATISTICS_CACHE_KEY,
      );

      if (!timestamp || !statistics) {
        return false;
      }

      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  _clearSelectOptionsLocalStorageCache() {
    localStorage.removeItem(this.ORDER_INCIDENT_SELECT_OPTIONS_CACHE_KEY);
    localStorage.removeItem(this.ORDER_INCIDENT_SELECT_OPTIONS_TIMESTAMP_KEY);
  }

  _clearStatisticsLocalStorageCache() {
    localStorage.removeItem(this.ORDER_INCIDENT_STATISTICS_CACHE_KEY);
    localStorage.removeItem(this.ORDER_INCIDENT_STATISTICS_TIMESTAMP_KEY);
  }
}
