// File Path: monorepo/web/workery-frontend/src/services/Storage/OrderStorage.js

/**
 * OrderStorage handles all order-related data storage operations
 * Manages order caching, local storage, and data persistence
 */
export class OrderStorage {
  constructor() {
    this.ORDERS_CACHE_KEY = "WORKERY_ORDERS_CACHE";
    this.ORDERS_TIMESTAMP_KEY = "WORKERY_ORDERS_TIMESTAMP";
    this.ORDER_SELECT_OPTIONS_CACHE_KEY = "WORKERY_ORDER_SELECT_OPTIONS_CACHE";
    this.ORDER_SELECT_OPTIONS_TIMESTAMP_KEY =
      "WORKERY_ORDER_SELECT_OPTIONS_TIMESTAMP";
    this.ORDER_COUNT_CACHE_KEY = "WORKERY_ORDER_COUNT_CACHE";
    this.ORDER_COUNT_TIMESTAMP_KEY = "WORKERY_ORDER_COUNT_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for orders (more dynamic data)
    this.SELECT_OPTIONS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for select options
    this.COUNT_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for count data

    // In-memory cache for current session
    this.memoryCache = {
      orders: null,
      ordersTimestamp: null,
      isOrdersLoading: false,
      selectOptions: null,
      selectOptionsTimestamp: null,
      isSelectOptionsLoading: false,
      count: null,
      countTimestamp: null,
      isCountLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("OrderStorage initialized");
    }
  }

  /**
   * Gets orders list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached orders data or null if not found/expired
   */
  getOrdersFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isOrdersMemoryCacheValid(maxAge)) {
      console.log("OrderStorage: Using memory cache for orders list");
      return this.memoryCache.orders;
    }

    // Check localStorage cache
    try {
      const cachedOrders = localStorage.getItem(this.ORDERS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(this.ORDERS_TIMESTAMP_KEY);

      if (cachedOrders && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const ordersData = JSON.parse(cachedOrders);

          // Update memory cache with localStorage data
          this.memoryCache.orders = ordersData;
          this.memoryCache.ordersTimestamp = timestamp;
          this.memoryCache.isOrdersLoading = false;

          console.log("OrderStorage: Using localStorage cache for orders list");
          return ordersData;
        } else {
          console.log("OrderStorage: localStorage cache expired, clearing");
          this._clearOrdersLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "OrderStorage: Error reading orders from localStorage",
        error,
      );
      this._clearOrdersLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves orders list to cache (both memory and localStorage)
   * @param {Object} ordersData - Orders data to cache
   */
  saveOrdersToCache(ordersData) {
    if (!ordersData) {
      console.warn(
        "OrderStorage: Attempted to save null/undefined orders data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.orders = ordersData;
    this.memoryCache.ordersTimestamp = timestamp;
    this.memoryCache.isOrdersLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(this.ORDERS_CACHE_KEY, JSON.stringify(ordersData));
      localStorage.setItem(this.ORDERS_TIMESTAMP_KEY, timestamp.toString());

      console.log("OrderStorage: Orders list cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        count: ordersData.results ? ordersData.results.length : 0,
      });
    } catch (error) {
      console.error("OrderStorage: Error saving orders to localStorage", error);
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets order select options from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached select options data or null if not found/expired
   */
  getSelectOptionsFromCache(maxAge = this.SELECT_OPTIONS_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isSelectOptionsMemoryCacheValid(maxAge)) {
      console.log("OrderStorage: Using memory cache for select options");
      return this.memoryCache.selectOptions;
    }

    // Check localStorage cache
    try {
      const cachedSelectOptions = localStorage.getItem(
        this.ORDER_SELECT_OPTIONS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.ORDER_SELECT_OPTIONS_TIMESTAMP_KEY,
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
            "OrderStorage: Using localStorage cache for select options",
          );
          return selectOptionsData;
        } else {
          console.log("OrderStorage: Select options cache expired, clearing");
          this._clearSelectOptionsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "OrderStorage: Error reading select options from localStorage",
        error,
      );
      this._clearSelectOptionsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves order select options to cache (both memory and localStorage)
   * @param {Object} selectOptionsData - Select options data to cache
   */
  saveSelectOptionsToCache(selectOptionsData) {
    if (!selectOptionsData) {
      console.warn(
        "OrderStorage: Attempted to save null/undefined select options data",
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
        this.ORDER_SELECT_OPTIONS_CACHE_KEY,
        JSON.stringify(selectOptionsData),
      );
      localStorage.setItem(
        this.ORDER_SELECT_OPTIONS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("OrderStorage: Select options cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        optionsCount: Array.isArray(selectOptionsData)
          ? selectOptionsData.length
          : "N/A",
      });
    } catch (error) {
      console.error(
        "OrderStorage: Error saving select options to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets order count from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached count data or null if not found/expired
   */
  getCountFromCache(maxAge = this.COUNT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isCountMemoryCacheValid(maxAge)) {
      console.log("OrderStorage: Using memory cache for order count");
      return this.memoryCache.count;
    }

    // Check localStorage cache
    try {
      const cachedCount = localStorage.getItem(this.ORDER_COUNT_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(
        this.ORDER_COUNT_TIMESTAMP_KEY,
      );

      if (cachedCount && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const countData = JSON.parse(cachedCount);

          // Update memory cache with localStorage data
          this.memoryCache.count = countData;
          this.memoryCache.countTimestamp = timestamp;
          this.memoryCache.isCountLoading = false;

          console.log("OrderStorage: Using localStorage cache for order count");
          return countData;
        } else {
          console.log("OrderStorage: Count cache expired, clearing");
          this._clearCountLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "OrderStorage: Error reading count from localStorage",
        error,
      );
      this._clearCountLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves order count to cache (both memory and localStorage)
   * @param {Object} countData - Count data to cache
   */
  saveCountToCache(countData) {
    if (!countData) {
      console.warn("OrderStorage: Attempted to save null/undefined count data");
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.count = countData;
    this.memoryCache.countTimestamp = timestamp;
    this.memoryCache.isCountLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.ORDER_COUNT_CACHE_KEY,
        JSON.stringify(countData),
      );
      localStorage.setItem(
        this.ORDER_COUNT_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("OrderStorage: Count cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        count: countData.count || countData.total || "N/A",
      });
    } catch (error) {
      console.error("OrderStorage: Error saving count to localStorage", error);
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears orders cache (memory and localStorage)
   */
  clearOrdersCache() {
    // Clear memory cache
    this.memoryCache.orders = null;
    this.memoryCache.ordersTimestamp = null;
    this.memoryCache.isOrdersLoading = false;

    // Clear localStorage cache
    this._clearOrdersLocalStorageCache();

    console.log("OrderStorage: Orders cache cleared");
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

    console.log("OrderStorage: Select options cache cleared");
  }

  /**
   * Clears count cache (memory and localStorage)
   */
  clearCountCache() {
    // Clear memory cache
    this.memoryCache.count = null;
    this.memoryCache.countTimestamp = null;
    this.memoryCache.isCountLoading = false;

    // Clear localStorage cache
    this._clearCountLocalStorageCache();

    console.log("OrderStorage: Count cache cleared");
  }

  /**
   * Clears all order caches
   */
  clearAllCache() {
    this.clearOrdersCache();
    this.clearSelectOptionsCache();
    this.clearCountCache();
    console.log("OrderStorage: All caches cleared");
  }

  /**
   * Sets loading state for orders cache
   * @param {boolean} isLoading - Loading state
   */
  setOrdersCacheLoading(isLoading) {
    this.memoryCache.isOrdersLoading = isLoading;
  }

  /**
   * Gets loading state from orders cache
   * @returns {boolean} - Current loading state
   */
  isOrdersCacheLoading() {
    return this.memoryCache.isOrdersLoading;
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
   * Sets loading state for count cache
   * @param {boolean} isLoading - Loading state
   */
  setCountCacheLoading(isLoading) {
    this.memoryCache.isCountLoading = isLoading;
  }

  /**
   * Gets loading state from count cache
   * @returns {boolean} - Current loading state
   */
  isCountCacheLoading() {
    return this.memoryCache.isCountLoading;
  }

  /**
   * Gets cache information for debugging
   * @returns {Object} - Cache state information
   */
  getOrdersCacheInfo() {
    const ordersMemoryValid = this._isOrdersMemoryCacheValid();
    const ordersLocalStorageValid = this._isOrdersLocalStorageCacheValid();
    const selectOptionsMemoryValid = this._isSelectOptionsMemoryCacheValid();
    const selectOptionsLocalStorageValid =
      this._isSelectOptionsLocalStorageCacheValid();
    const countMemoryValid = this._isCountMemoryCacheValid();
    const countLocalStorageValid = this._isCountLocalStorageCacheValid();

    return {
      orders: {
        memoryCache: {
          hasData: !!this.memoryCache.orders,
          timestamp: this.memoryCache.ordersTimestamp,
          age: this.memoryCache.ordersTimestamp
            ? Date.now() - this.memoryCache.ordersTimestamp
            : null,
          isValid: ordersMemoryValid,
          isLoading: this.memoryCache.isOrdersLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.ORDERS_CACHE_KEY),
          timestamp: localStorage.getItem(this.ORDERS_TIMESTAMP_KEY),
          isValid: ordersLocalStorageValid,
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
          hasData: !!localStorage.getItem(this.ORDER_SELECT_OPTIONS_CACHE_KEY),
          timestamp: localStorage.getItem(
            this.ORDER_SELECT_OPTIONS_TIMESTAMP_KEY,
          ),
          isValid: selectOptionsLocalStorageValid,
        },
        cacheDuration: this.SELECT_OPTIONS_CACHE_DURATION,
      },
      count: {
        memoryCache: {
          hasData: !!this.memoryCache.count,
          timestamp: this.memoryCache.countTimestamp,
          age: this.memoryCache.countTimestamp
            ? Date.now() - this.memoryCache.countTimestamp
            : null,
          isValid: countMemoryValid,
          isLoading: this.memoryCache.isCountLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.ORDER_COUNT_CACHE_KEY),
          timestamp: localStorage.getItem(this.ORDER_COUNT_TIMESTAMP_KEY),
          isValid: countLocalStorageValid,
        },
        cacheDuration: this.COUNT_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for orders
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `OrderStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for select options
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.SELECT_OPTIONS_CACHE_DURATION = durationMs;
    console.log(
      `OrderStorage: Select options cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for count
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCountCacheDuration(durationMs) {
    this.COUNT_CACHE_DURATION = durationMs;
    console.log(
      `OrderStorage: Count cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves order preferences to localStorage
   * @param {Object} preferences - Order preferences object
   */
  saveOrderPreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_ORDER_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("OrderStorage: Order preferences saved");
    } catch (error) {
      console.error("OrderStorage: Error saving order preferences", error);
    }
  }

  /**
   * Gets order preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Order preferences or null if not found/expired
   */
  getOrderPreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_ORDER_PREFERENCES");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_ORDER_PREFERENCES");
        }
      }
    } catch (error) {
      console.error("OrderStorage: Error reading order preferences", error);
    }

    return null;
  }

  /**
   * Clears order preferences
   */
  clearOrderPreferences() {
    localStorage.removeItem("WORKERY_ORDER_PREFERENCES");
    console.log("OrderStorage: Order preferences cleared");
  }

  /**
   * Clears all order-related data from storage
   */
  clearAllOrderData() {
    this.clearAllCache();
    this.clearOrderPreferences();

    console.log("OrderStorage: All order data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isOrdersMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (!this.memoryCache.orders || !this.memoryCache.ordersTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.ordersTimestamp;
    return age < maxAge;
  }

  _isOrdersLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.ORDERS_TIMESTAMP_KEY);
      const orders = localStorage.getItem(this.ORDERS_CACHE_KEY);

      if (!timestamp || !orders) {
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
        this.ORDER_SELECT_OPTIONS_TIMESTAMP_KEY,
      );
      const selectOptions = localStorage.getItem(
        this.ORDER_SELECT_OPTIONS_CACHE_KEY,
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

  _isCountMemoryCacheValid(maxAge = this.COUNT_CACHE_DURATION) {
    if (!this.memoryCache.count || !this.memoryCache.countTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.countTimestamp;
    return age < maxAge;
  }

  _isCountLocalStorageCacheValid(maxAge = this.COUNT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.ORDER_COUNT_TIMESTAMP_KEY);
      const count = localStorage.getItem(this.ORDER_COUNT_CACHE_KEY);

      if (!timestamp || !count) {
        return false;
      }

      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  _clearOrdersLocalStorageCache() {
    localStorage.removeItem(this.ORDERS_CACHE_KEY);
    localStorage.removeItem(this.ORDERS_TIMESTAMP_KEY);
  }

  _clearSelectOptionsLocalStorageCache() {
    localStorage.removeItem(this.ORDER_SELECT_OPTIONS_CACHE_KEY);
    localStorage.removeItem(this.ORDER_SELECT_OPTIONS_TIMESTAMP_KEY);
  }

  _clearCountLocalStorageCache() {
    localStorage.removeItem(this.ORDER_COUNT_CACHE_KEY);
    localStorage.removeItem(this.ORDER_COUNT_TIMESTAMP_KEY);
  }
}
