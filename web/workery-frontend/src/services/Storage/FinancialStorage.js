// File Path: monorepo/web/workery-frontend/src/services/Storage/FinancialStorage.js

/**
 * FinancialStorage handles order financial data storage and caching
 * Note: Financial data is part of Order entities in the backend
 */
export class FinancialStorage {
  constructor() {
    // Cache keys for order financial data
    this.ORDER_FINANCIALS_CACHE_KEY = "WORKERY_ORDER_FINANCIALS_CACHE";
    this.ORDER_FINANCIALS_TIMESTAMP_KEY = "WORKERY_ORDER_FINANCIALS_TIMESTAMP";
    this.FINANCIAL_SUMMARY_CACHE_KEY = "WORKERY_FINANCIAL_SUMMARY_CACHE";
    this.FINANCIAL_SUMMARY_TIMESTAMP_KEY =
      "WORKERY_FINANCIAL_SUMMARY_TIMESTAMP";

    // Cache durations
    this.DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for order financial data
    this.SUMMARY_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for summary data

    // In-memory cache for current session
    this.memoryCache = {
      orderFinancials: new Map(), // Map of orderWJID to financial data
      orderFinancialsTimestamp: new Map(),
      isOrderFinancialsLoading: new Map(),
      summary: null,
      summaryTimestamp: null,
      isSummaryLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("FinancialStorage initialized");
    }
  }

  /**
   * Gets order financial data from cache
   * @param {number} orderWJID - The Work Job ID of the order
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached financial data or null if not found/expired
   */
  getOrderFinancialFromCache(orderWJID, maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first
    if (this._isOrderFinancialMemoryCacheValid(orderWJID, maxAge)) {
      console.log(
        `FinancialStorage: Using memory cache for order ${orderWJID} financial data`,
      );
      return this.memoryCache.orderFinancials.get(orderWJID);
    }

    // Check localStorage cache
    try {
      const cacheKey = `${this.ORDER_FINANCIALS_CACHE_KEY}_${orderWJID}`;
      const timestampKey = `${this.ORDER_FINANCIALS_TIMESTAMP_KEY}_${orderWJID}`;

      const cachedData = localStorage.getItem(cacheKey);
      const cachedTimestamp = localStorage.getItem(timestampKey);

      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const financialData = JSON.parse(cachedData);

          // Update memory cache
          this.memoryCache.orderFinancials.set(orderWJID, financialData);
          this.memoryCache.orderFinancialsTimestamp.set(orderWJID, timestamp);

          console.log(
            `FinancialStorage: Using localStorage cache for order ${orderWJID} financial data`,
          );
          return financialData;
        } else {
          console.log(
            `FinancialStorage: Cache expired for order ${orderWJID}, clearing`,
          );
          this._clearOrderFinancialLocalStorageCache(orderWJID);
        }
      }
    } catch (error) {
      console.error(
        `FinancialStorage: Error reading order ${orderWJID} financial data from localStorage`,
        error,
      );
      this._clearOrderFinancialLocalStorageCache(orderWJID);
    }

    return null;
  }

  /**
   * Saves order financial data to cache
   * @param {number} orderWJID - The Work Job ID of the order
   * @param {Object} financialData - Financial data to cache
   */
  saveOrderFinancialToCache(orderWJID, financialData) {
    if (!financialData) {
      console.warn(
        `FinancialStorage: Attempted to save null/undefined financial data for order ${orderWJID}`,
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.orderFinancials.set(orderWJID, financialData);
    this.memoryCache.orderFinancialsTimestamp.set(orderWJID, timestamp);
    this.memoryCache.isOrderFinancialsLoading.set(orderWJID, false);

    // Save to localStorage
    try {
      const cacheKey = `${this.ORDER_FINANCIALS_CACHE_KEY}_${orderWJID}`;
      const timestampKey = `${this.ORDER_FINANCIALS_TIMESTAMP_KEY}_${orderWJID}`;

      localStorage.setItem(cacheKey, JSON.stringify(financialData));
      localStorage.setItem(timestampKey, timestamp.toString());

      console.log(
        `FinancialStorage: Order ${orderWJID} financial data cached successfully`,
        {
          timestamp: new Date(timestamp).toISOString(),
        },
      );
    } catch (error) {
      console.error(
        `FinancialStorage: Error saving order ${orderWJID} financial data to localStorage`,
        error,
      );
    }
  }

  /**
   * Gets financial summary from cache
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached summary data or null if not found/expired
   */
  getSummaryFromCache(maxAge = this.SUMMARY_CACHE_DURATION) {
    // Check memory cache first
    if (this._isSummaryMemoryCacheValid(maxAge)) {
      console.log("FinancialStorage: Using memory cache for summary");
      return this.memoryCache.summary;
    }

    // Check localStorage cache
    try {
      const cachedSummary = localStorage.getItem(
        this.FINANCIAL_SUMMARY_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.FINANCIAL_SUMMARY_TIMESTAMP_KEY,
      );

      if (cachedSummary && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const summaryData = JSON.parse(cachedSummary);

          // Update memory cache
          this.memoryCache.summary = summaryData;
          this.memoryCache.summaryTimestamp = timestamp;
          this.memoryCache.isSummaryLoading = false;

          console.log("FinancialStorage: Using localStorage cache for summary");
          return summaryData;
        } else {
          console.log("FinancialStorage: Summary cache expired, clearing");
          this._clearSummaryLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "FinancialStorage: Error reading summary from localStorage",
        error,
      );
      this._clearSummaryLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves financial summary to cache
   * @param {Object} summaryData - Summary data to cache
   */
  saveSummaryToCache(summaryData) {
    if (!summaryData) {
      console.warn(
        "FinancialStorage: Attempted to save null/undefined summary data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.summary = summaryData;
    this.memoryCache.summaryTimestamp = timestamp;
    this.memoryCache.isSummaryLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.FINANCIAL_SUMMARY_CACHE_KEY,
        JSON.stringify(summaryData),
      );
      localStorage.setItem(
        this.FINANCIAL_SUMMARY_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("FinancialStorage: Summary cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
      });
    } catch (error) {
      console.error(
        "FinancialStorage: Error saving summary to localStorage",
        error,
      );
    }
  }

  /**
   * Clears order financial cache for a specific order
   * @param {number} orderWJID - The Work Job ID of the order
   */
  clearOrderFinancialCache(orderWJID) {
    // Clear memory cache
    this.memoryCache.orderFinancials.delete(orderWJID);
    this.memoryCache.orderFinancialsTimestamp.delete(orderWJID);
    this.memoryCache.isOrderFinancialsLoading.delete(orderWJID);

    // Clear localStorage cache
    this._clearOrderFinancialLocalStorageCache(orderWJID);

    console.log(`FinancialStorage: Order ${orderWJID} financial cache cleared`);
  }

  /**
   * Clears all order financial caches
   */
  clearAllOrderFinancialCaches() {
    // Clear memory cache
    this.memoryCache.orderFinancials.clear();
    this.memoryCache.orderFinancialsTimestamp.clear();
    this.memoryCache.isOrderFinancialsLoading.clear();

    // Clear all localStorage caches for orders
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith(this.ORDER_FINANCIALS_CACHE_KEY) ||
          key.startsWith(this.ORDER_FINANCIALS_TIMESTAMP_KEY))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    console.log("FinancialStorage: All order financial caches cleared");
  }

  /**
   * Clears summary cache
   */
  clearSummaryCache() {
    // Clear memory cache
    this.memoryCache.summary = null;
    this.memoryCache.summaryTimestamp = null;
    this.memoryCache.isSummaryLoading = false;

    // Clear localStorage cache
    this._clearSummaryLocalStorageCache();

    console.log("FinancialStorage: Summary cache cleared");
  }

  /**
   * Clears all financial caches
   */
  clearAllCache() {
    this.clearAllOrderFinancialCaches();
    this.clearSummaryCache();
    console.log("FinancialStorage: All caches cleared");
  }

  /**
   * Sets loading state for order financial cache
   * @param {number} orderWJID - The Work Job ID of the order
   * @param {boolean} isLoading - Loading state
   */
  setOrderFinancialCacheLoading(orderWJID, isLoading) {
    this.memoryCache.isOrderFinancialsLoading.set(orderWJID, isLoading);
  }

  /**
   * Gets loading state for order financial cache
   * @param {number} orderWJID - The Work Job ID of the order
   * @returns {boolean} - Current loading state
   */
  isOrderFinancialCacheLoading(orderWJID) {
    return this.memoryCache.isOrderFinancialsLoading.get(orderWJID) || false;
  }

  /**
   * Sets loading state for summary cache
   * @param {boolean} isLoading - Loading state
   */
  setSummaryCacheLoading(isLoading) {
    this.memoryCache.isSummaryLoading = isLoading;
  }

  /**
   * Gets loading state from summary cache
   * @returns {boolean} - Current loading state
   */
  isSummaryCacheLoading() {
    return this.memoryCache.isSummaryLoading;
  }

  /**
   * Saves financial preferences to localStorage
   * @param {Object} preferences - Financial preferences object
   */
  saveFinancialPreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_FINANCIAL_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("FinancialStorage: Financial preferences saved");
    } catch (error) {
      console.error(
        "FinancialStorage: Error saving financial preferences",
        error,
      );
    }
  }

  /**
   * Gets financial preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Financial preferences or null if not found/expired
   */
  getFinancialPreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_FINANCIAL_PREFERENCES");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_FINANCIAL_PREFERENCES");
        }
      }
    } catch (error) {
      console.error(
        "FinancialStorage: Error reading financial preferences",
        error,
      );
    }

    return null;
  }

  /**
   * Private helper methods
   */

  _isOrderFinancialMemoryCacheValid(
    orderWJID,
    maxAge = this.DEFAULT_CACHE_DURATION,
  ) {
    const data = this.memoryCache.orderFinancials.get(orderWJID);
    const timestamp = this.memoryCache.orderFinancialsTimestamp.get(orderWJID);

    if (!data || !timestamp) {
      return false;
    }

    const age = Date.now() - timestamp;
    return age < maxAge;
  }

  _isSummaryMemoryCacheValid(maxAge = this.SUMMARY_CACHE_DURATION) {
    if (!this.memoryCache.summary || !this.memoryCache.summaryTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.summaryTimestamp;
    return age < maxAge;
  }

  _clearOrderFinancialLocalStorageCache(orderWJID) {
    const cacheKey = `${this.ORDER_FINANCIALS_CACHE_KEY}_${orderWJID}`;
    const timestampKey = `${this.ORDER_FINANCIALS_TIMESTAMP_KEY}_${orderWJID}`;
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(timestampKey);
  }

  _clearSummaryLocalStorageCache() {
    localStorage.removeItem(this.FINANCIAL_SUMMARY_CACHE_KEY);
    localStorage.removeItem(this.FINANCIAL_SUMMARY_TIMESTAMP_KEY);
  }

  /**
   * Gets cache information for debugging
   * @returns {Object} - Cache state information
   */
  getCacheInfo() {
    return {
      orderFinancials: {
        memoryCacheSize: this.memoryCache.orderFinancials.size,
        loadingStates: Array.from(
          this.memoryCache.isOrderFinancialsLoading.entries(),
        ),
      },
      summary: {
        hasData: !!this.memoryCache.summary,
        timestamp: this.memoryCache.summaryTimestamp,
        age: this.memoryCache.summaryTimestamp
          ? Date.now() - this.memoryCache.summaryTimestamp
          : null,
        isLoading: this.memoryCache.isSummaryLoading,
      },
    };
  }
}
