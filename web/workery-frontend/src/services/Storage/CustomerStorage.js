// File Path: monorepo/web/workery-frontend/src/services/Storage/CustomerStorage.js

/**
 * CustomerStorage handles all customer-related data storage operations
 * Manages customer caching, local storage, and data persistence
 */
export class CustomerStorage {
  constructor() {
    this.CUSTOMERS_CACHE_KEY = "WORKERY_CUSTOMERS_CACHE";
    this.CUSTOMERS_TIMESTAMP_KEY = "WORKERY_CUSTOMERS_TIMESTAMP";
    this.CUSTOMER_COUNT_CACHE_KEY = "WORKERY_CUSTOMER_COUNT_CACHE";
    this.CUSTOMER_COUNT_TIMESTAMP_KEY = "WORKERY_CUSTOMER_COUNT_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for customers (shorter due to frequent updates)
    this.COUNT_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for count data

    // In-memory cache for current session
    this.memoryCache = {
      customers: null,
      customersTimestamp: null,
      isCustomersLoading: false,
      customerCount: null,
      customerCountTimestamp: null,
      isCustomerCountLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("CustomerStorage initialized");
    }
  }

  /**
   * Gets customers list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached customers data or null if not found/expired
   */
  getCustomersFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isCustomersMemoryCacheValid(maxAge)) {
      console.log("CustomerStorage: Using memory cache for customers list");
      return this.memoryCache.customers;
    }

    // Check localStorage cache
    try {
      const cachedCustomers = localStorage.getItem(this.CUSTOMERS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(
        this.CUSTOMERS_TIMESTAMP_KEY,
      );

      if (cachedCustomers && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const customersData = JSON.parse(cachedCustomers);

          // Update memory cache with localStorage data
          this.memoryCache.customers = customersData;
          this.memoryCache.customersTimestamp = timestamp;
          this.memoryCache.isCustomersLoading = false;

          console.log(
            "CustomerStorage: Using localStorage cache for customers list",
          );
          return customersData;
        } else {
          console.log("CustomerStorage: localStorage cache expired, clearing");
          this._clearCustomersLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "CustomerStorage: Error reading customers from localStorage",
        error,
      );
      this._clearCustomersLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves customers list to cache (both memory and localStorage)
   * @param {Object} customersData - Customers data to cache
   */
  saveCustomersToCache(customersData) {
    if (!customersData) {
      console.warn(
        "CustomerStorage: Attempted to save null/undefined customers data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.customers = customersData;
    this.memoryCache.customersTimestamp = timestamp;
    this.memoryCache.isCustomersLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.CUSTOMERS_CACHE_KEY,
        JSON.stringify(customersData),
      );
      localStorage.setItem(this.CUSTOMERS_TIMESTAMP_KEY, timestamp.toString());

      console.log("CustomerStorage: Customers list cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        count: customersData.results ? customersData.results.length : 0,
      });
    } catch (error) {
      console.error(
        "CustomerStorage: Error saving customers to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets customer count from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached customer count data or null if not found/expired
   */
  getCustomerCountFromCache(maxAge = this.COUNT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isCustomerCountMemoryCacheValid(maxAge)) {
      console.log("CustomerStorage: Using memory cache for customer count");
      return this.memoryCache.customerCount;
    }

    // Check localStorage cache
    try {
      const cachedCount = localStorage.getItem(this.CUSTOMER_COUNT_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(
        this.CUSTOMER_COUNT_TIMESTAMP_KEY,
      );

      if (cachedCount && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const countData = JSON.parse(cachedCount);

          // Update memory cache with localStorage data
          this.memoryCache.customerCount = countData;
          this.memoryCache.customerCountTimestamp = timestamp;
          this.memoryCache.isCustomerCountLoading = false;

          console.log(
            "CustomerStorage: Using localStorage cache for customer count",
          );
          return countData;
        } else {
          console.log(
            "CustomerStorage: Customer count cache expired, clearing",
          );
          this._clearCustomerCountLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "CustomerStorage: Error reading customer count from localStorage",
        error,
      );
      this._clearCustomerCountLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves customer count to cache (both memory and localStorage)
   * @param {Object} countData - Customer count data to cache
   */
  saveCustomerCountToCache(countData) {
    if (!countData) {
      console.warn(
        "CustomerStorage: Attempted to save null/undefined customer count data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.customerCount = countData;
    this.memoryCache.customerCountTimestamp = timestamp;
    this.memoryCache.isCustomerCountLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.CUSTOMER_COUNT_CACHE_KEY,
        JSON.stringify(countData),
      );
      localStorage.setItem(
        this.CUSTOMER_COUNT_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("CustomerStorage: Customer count cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        count: countData.count || countData,
      });
    } catch (error) {
      console.error(
        "CustomerStorage: Error saving customer count to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears customers cache (memory and localStorage)
   */
  clearCustomersCache() {
    // Clear memory cache
    this.memoryCache.customers = null;
    this.memoryCache.customersTimestamp = null;
    this.memoryCache.isCustomersLoading = false;

    // Clear localStorage cache
    this._clearCustomersLocalStorageCache();

    console.log("CustomerStorage: Customers cache cleared");
  }

  /**
   * Clears customer count cache (memory and localStorage)
   */
  clearCustomerCountCache() {
    // Clear memory cache
    this.memoryCache.customerCount = null;
    this.memoryCache.customerCountTimestamp = null;
    this.memoryCache.isCustomerCountLoading = false;

    // Clear localStorage cache
    this._clearCustomerCountLocalStorageCache();

    console.log("CustomerStorage: Customer count cache cleared");
  }

  /**
   * Clears all customer caches
   */
  clearAllCache() {
    this.clearCustomersCache();
    this.clearCustomerCountCache();
    console.log("CustomerStorage: All caches cleared");
  }

  /**
   * Sets loading state for customers cache
   * @param {boolean} isLoading - Loading state
   */
  setCustomersCacheLoading(isLoading) {
    this.memoryCache.isCustomersLoading = isLoading;
  }

  /**
   * Gets loading state from customers cache
   * @returns {boolean} - Current loading state
   */
  isCustomersCacheLoading() {
    return this.memoryCache.isCustomersLoading;
  }

  /**
   * Sets loading state for customer count cache
   * @param {boolean} isLoading - Loading state
   */
  setCustomerCountCacheLoading(isLoading) {
    this.memoryCache.isCustomerCountLoading = isLoading;
  }

  /**
   * Gets loading state from customer count cache
   * @returns {boolean} - Current loading state
   */
  isCustomerCountCacheLoading() {
    return this.memoryCache.isCustomerCountLoading;
  }

  /**
   * Gets cache information for debugging
   * @returns {Object} - Cache state information
   */
  getCustomersCacheInfo() {
    const customersMemoryValid = this._isCustomersMemoryCacheValid();
    const customersLocalStorageValid =
      this._isCustomersLocalStorageCacheValid();
    const countMemoryValid = this._isCustomerCountMemoryCacheValid();
    const countLocalStorageValid =
      this._isCustomerCountLocalStorageCacheValid();

    return {
      customers: {
        memoryCache: {
          hasData: !!this.memoryCache.customers,
          timestamp: this.memoryCache.customersTimestamp,
          age: this.memoryCache.customersTimestamp
            ? Date.now() - this.memoryCache.customersTimestamp
            : null,
          isValid: customersMemoryValid,
          isLoading: this.memoryCache.isCustomersLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.CUSTOMERS_CACHE_KEY),
          timestamp: localStorage.getItem(this.CUSTOMERS_TIMESTAMP_KEY),
          isValid: customersLocalStorageValid,
        },
        cacheDuration: this.DEFAULT_CACHE_DURATION,
      },
      customerCount: {
        memoryCache: {
          hasData: !!this.memoryCache.customerCount,
          timestamp: this.memoryCache.customerCountTimestamp,
          age: this.memoryCache.customerCountTimestamp
            ? Date.now() - this.memoryCache.customerCountTimestamp
            : null,
          isValid: countMemoryValid,
          isLoading: this.memoryCache.isCustomerCountLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.CUSTOMER_COUNT_CACHE_KEY),
          timestamp: localStorage.getItem(this.CUSTOMER_COUNT_TIMESTAMP_KEY),
          isValid: countLocalStorageValid,
        },
        cacheDuration: this.COUNT_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for customers
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `CustomerStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for customer count
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCountCacheDuration(durationMs) {
    this.COUNT_CACHE_DURATION = durationMs;
    console.log(
      `CustomerStorage: Count cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves customer preferences to localStorage
   * @param {Object} preferences - Customer preferences object
   */
  saveCustomerPreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_CUSTOMER_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("CustomerStorage: Customer preferences saved");
    } catch (error) {
      console.error(
        "CustomerStorage: Error saving customer preferences",
        error,
      );
    }
  }

  /**
   * Gets customer preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Customer preferences or null if not found/expired
   */
  getCustomerPreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_CUSTOMER_PREFERENCES");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_CUSTOMER_PREFERENCES");
        }
      }
    } catch (error) {
      console.error(
        "CustomerStorage: Error reading customer preferences",
        error,
      );
    }

    return null;
  }

  /**
   * Clears customer preferences
   */
  clearCustomerPreferences() {
    localStorage.removeItem("WORKERY_CUSTOMER_PREFERENCES");
    console.log("CustomerStorage: Customer preferences cleared");
  }

  /**
   * Clears all customer-related data from storage
   */
  clearAllCustomerData() {
    this.clearAllCache();
    this.clearCustomerPreferences();

    console.log("CustomerStorage: All customer data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isCustomersMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (!this.memoryCache.customers || !this.memoryCache.customersTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.customersTimestamp;
    return age < maxAge;
  }

  _isCustomersLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.CUSTOMERS_TIMESTAMP_KEY);
      const customers = localStorage.getItem(this.CUSTOMERS_CACHE_KEY);

      if (!timestamp || !customers) {
        return false;
      }

      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  _isCustomerCountMemoryCacheValid(maxAge = this.COUNT_CACHE_DURATION) {
    if (
      !this.memoryCache.customerCount ||
      !this.memoryCache.customerCountTimestamp
    ) {
      return false;
    }
    const age = Date.now() - this.memoryCache.customerCountTimestamp;
    return age < maxAge;
  }

  _isCustomerCountLocalStorageCacheValid(maxAge = this.COUNT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.CUSTOMER_COUNT_TIMESTAMP_KEY);
      const count = localStorage.getItem(this.CUSTOMER_COUNT_CACHE_KEY);

      if (!timestamp || !count) {
        return false;
      }

      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  _clearCustomersLocalStorageCache() {
    localStorage.removeItem(this.CUSTOMERS_CACHE_KEY);
    localStorage.removeItem(this.CUSTOMERS_TIMESTAMP_KEY);
  }

  _clearCustomerCountLocalStorageCache() {
    localStorage.removeItem(this.CUSTOMER_COUNT_CACHE_KEY);
    localStorage.removeItem(this.CUSTOMER_COUNT_TIMESTAMP_KEY);
  }
}
