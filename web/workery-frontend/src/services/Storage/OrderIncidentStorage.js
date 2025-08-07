// File Path: web/workery-frontend/src/services/Storage/OrderIncidentStorage.js

/**
 * OrderIncidentStorage handles all order incident-related data storage operations
 * Manages order incident caching, local storage, and data persistence
 */
export class OrderIncidentStorage {
  constructor() {
    this.ORDER_INCIDENTS_CACHE_KEY = "WORKERY_ORDER_INCIDENTS_CACHE";
    this.ORDER_INCIDENTS_TIMESTAMP_KEY = "WORKERY_ORDER_INCIDENTS_TIMESTAMP";
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

    // In-memory cache for current session
    this.memoryCache = {
      orderIncidents: null,
      orderIncidentsTimestamp: null,
      isOrderIncidentsLoading: false,
      selectOptions: null,
      selectOptionsTimestamp: null,
      isSelectOptionsLoading: false,
      statistics: null,
      statisticsTimestamp: null,
      isStatisticsLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("OrderIncidentStorage initialized");
    }
  }

  /**
   * Gets order incidents list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached order incidents data or null if not found/expired
   */
  getOrderIncidentsFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isOrderIncidentsMemoryCacheValid(maxAge)) {
      console.log(
        "OrderIncidentStorage: Using memory cache for order incidents list",
      );
      return this.memoryCache.orderIncidents;
    }

    // Check localStorage cache
    try {
      const cachedOrderIncidents = localStorage.getItem(
        this.ORDER_INCIDENTS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.ORDER_INCIDENTS_TIMESTAMP_KEY,
      );

      if (cachedOrderIncidents && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const orderIncidentsData = JSON.parse(cachedOrderIncidents);

          // Update memory cache with localStorage data
          this.memoryCache.orderIncidents = orderIncidentsData;
          this.memoryCache.orderIncidentsTimestamp = timestamp;
          this.memoryCache.isOrderIncidentsLoading = false;

          console.log(
            "OrderIncidentStorage: Using localStorage cache for order incidents list",
          );
          return orderIncidentsData;
        } else {
          console.log(
            "OrderIncidentStorage: localStorage cache expired, clearing",
          );
          this._clearOrderIncidentsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "OrderIncidentStorage: Error reading order incidents from localStorage",
        error,
      );
      this._clearOrderIncidentsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves order incidents list to cache (both memory and localStorage)
   * @param {Object} orderIncidentsData - Order incidents data to cache
   */
  saveOrderIncidentsToCache(orderIncidentsData) {
    if (!orderIncidentsData) {
      console.warn(
        "OrderIncidentStorage: Attempted to save null/undefined order incidents data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.orderIncidents = orderIncidentsData;
    this.memoryCache.orderIncidentsTimestamp = timestamp;
    this.memoryCache.isOrderIncidentsLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.ORDER_INCIDENTS_CACHE_KEY,
        JSON.stringify(orderIncidentsData),
      );
      localStorage.setItem(
        this.ORDER_INCIDENTS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log(
        "OrderIncidentStorage: Order incidents list cached successfully",
        {
          timestamp: new Date(timestamp).toISOString(),
          count: orderIncidentsData.results
            ? orderIncidentsData.results.length
            : 0,
        },
      );
    } catch (error) {
      console.error(
        "OrderIncidentStorage: Error saving order incidents to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
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
   * Clears order incidents cache (memory and localStorage)
   */
  clearOrderIncidentsCache() {
    // Clear memory cache
    this.memoryCache.orderIncidents = null;
    this.memoryCache.orderIncidentsTimestamp = null;
    this.memoryCache.isOrderIncidentsLoading = false;

    // Clear localStorage cache
    this._clearOrderIncidentsLocalStorageCache();

    console.log("OrderIncidentStorage: Order incidents cache cleared");
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
    this.clearOrderIncidentsCache();
    this.clearSelectOptionsCache();
    this.clearStatisticsCache();
    console.log("OrderIncidentStorage: All caches cleared");
  }

  /**
   * Sets loading state for order incidents cache
   * @param {boolean} isLoading - Loading state
   */
  setOrderIncidentsCacheLoading(isLoading) {
    this.memoryCache.isOrderIncidentsLoading = isLoading;
  }

  /**
   * Gets loading state from order incidents cache
   * @returns {boolean} - Current loading state
   */
  isOrderIncidentsCacheLoading() {
    return this.memoryCache.isOrderIncidentsLoading;
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
    const orderIncidentsMemoryValid = this._isOrderIncidentsMemoryCacheValid();
    const orderIncidentsLocalStorageValid =
      this._isOrderIncidentsLocalStorageCacheValid();
    const selectOptionsMemoryValid = this._isSelectOptionsMemoryCacheValid();
    const selectOptionsLocalStorageValid =
      this._isSelectOptionsLocalStorageCacheValid();
    const statisticsMemoryValid = this._isStatisticsMemoryCacheValid();
    const statisticsLocalStorageValid =
      this._isStatisticsLocalStorageCacheValid();

    return {
      orderIncidents: {
        memoryCache: {
          hasData: !!this.memoryCache.orderIncidents,
          timestamp: this.memoryCache.orderIncidentsTimestamp,
          age: this.memoryCache.orderIncidentsTimestamp
            ? Date.now() - this.memoryCache.orderIncidentsTimestamp
            : null,
          isValid: orderIncidentsMemoryValid,
          isLoading: this.memoryCache.isOrderIncidentsLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.ORDER_INCIDENTS_CACHE_KEY),
          timestamp: localStorage.getItem(this.ORDER_INCIDENTS_TIMESTAMP_KEY),
          isValid: orderIncidentsLocalStorageValid,
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
            this.ORDER_INCIDENT_SELECT_OPTIONS_CACHE_KEY,
          ),
          timestamp: localStorage.getItem(
            this.ORDER_INCIDENT_SELECT_OPTIONS_TIMESTAMP_KEY,
          ),
          isValid: selectOptionsLocalStorageValid,
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
          isValid: statisticsMemoryValid,
          isLoading: this.memoryCache.isStatisticsLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(
            this.ORDER_INCIDENT_STATISTICS_CACHE_KEY,
          ),
          timestamp: localStorage.getItem(
            this.ORDER_INCIDENT_STATISTICS_TIMESTAMP_KEY,
          ),
          isValid: statisticsLocalStorageValid,
        },
        cacheDuration: this.STATISTICS_CACHE_DURATION,
      },
    };
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

  _isOrderIncidentsMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (
      !this.memoryCache.orderIncidents ||
      !this.memoryCache.orderIncidentsTimestamp
    ) {
      return false;
    }
    const age = Date.now() - this.memoryCache.orderIncidentsTimestamp;
    return age < maxAge;
  }

  _isOrderIncidentsLocalStorageCacheValid(
    maxAge = this.DEFAULT_CACHE_DURATION,
  ) {
    try {
      const timestamp = localStorage.getItem(
        this.ORDER_INCIDENTS_TIMESTAMP_KEY,
      );
      const orderIncidents = localStorage.getItem(
        this.ORDER_INCIDENTS_CACHE_KEY,
      );

      if (!timestamp || !orderIncidents) {
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

  _clearOrderIncidentsLocalStorageCache() {
    localStorage.removeItem(this.ORDER_INCIDENTS_CACHE_KEY);
    localStorage.removeItem(this.ORDER_INCIDENTS_TIMESTAMP_KEY);
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
