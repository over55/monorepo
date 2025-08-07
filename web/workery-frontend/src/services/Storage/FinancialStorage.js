// File Path: monorepo/web/workery-frontend/src/services/Storage/FinancialStorage.js

/**
 * FinancialStorage handles all financial-related data storage operations
 * Manages financial caching, local storage, and data persistence
 */
export class FinancialStorage {
  constructor() {
    this.FINANCIALS_CACHE_KEY = "WORKERY_FINANCIALS_CACHE";
    this.FINANCIALS_TIMESTAMP_KEY = "WORKERY_FINANCIALS_TIMESTAMP";
    this.FINANCIAL_SELECT_OPTIONS_CACHE_KEY =
      "WORKERY_FINANCIAL_SELECT_OPTIONS_CACHE";
    this.FINANCIAL_SELECT_OPTIONS_TIMESTAMP_KEY =
      "WORKERY_FINANCIAL_SELECT_OPTIONS_TIMESTAMP";
    this.FINANCIAL_SUMMARY_CACHE_KEY = "WORKERY_FINANCIAL_SUMMARY_CACHE";
    this.FINANCIAL_SUMMARY_TIMESTAMP_KEY =
      "WORKERY_FINANCIAL_SUMMARY_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for financial data
    this.SELECT_OPTIONS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for select options
    this.SUMMARY_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for summary data

    // In-memory cache for current session
    this.memoryCache = {
      financials: null,
      financialsTimestamp: null,
      isFinancialsLoading: false,
      selectOptions: null,
      selectOptionsTimestamp: null,
      isSelectOptionsLoading: false,
      summary: null,
      summaryTimestamp: null,
      isSummaryLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("FinancialStorage initialized");
    }
  }

  /**
   * Gets financial records list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached financial records data or null if not found/expired
   */
  getFinancialsFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isFinancialsMemoryCacheValid(maxAge)) {
      console.log(
        "FinancialStorage: Using memory cache for financial records list",
      );
      return this.memoryCache.financials;
    }

    // Check localStorage cache
    try {
      const cachedFinancials = localStorage.getItem(this.FINANCIALS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(
        this.FINANCIALS_TIMESTAMP_KEY,
      );

      if (cachedFinancials && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const financialsData = JSON.parse(cachedFinancials);

          // Update memory cache with localStorage data
          this.memoryCache.financials = financialsData;
          this.memoryCache.financialsTimestamp = timestamp;
          this.memoryCache.isFinancialsLoading = false;

          console.log(
            "FinancialStorage: Using localStorage cache for financial records list",
          );
          return financialsData;
        } else {
          console.log("FinancialStorage: localStorage cache expired, clearing");
          this._clearFinancialsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "FinancialStorage: Error reading financial records from localStorage",
        error,
      );
      this._clearFinancialsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves financial records list to cache (both memory and localStorage)
   * @param {Object} financialsData - Financial records data to cache
   */
  saveFinancialsToCache(financialsData) {
    if (!financialsData) {
      console.warn(
        "FinancialStorage: Attempted to save null/undefined financial records data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.financials = financialsData;
    this.memoryCache.financialsTimestamp = timestamp;
    this.memoryCache.isFinancialsLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.FINANCIALS_CACHE_KEY,
        JSON.stringify(financialsData),
      );
      localStorage.setItem(this.FINANCIALS_TIMESTAMP_KEY, timestamp.toString());

      console.log(
        "FinancialStorage: Financial records list cached successfully",
        {
          timestamp: new Date(timestamp).toISOString(),
          count: financialsData.results ? financialsData.results.length : 0,
        },
      );
    } catch (error) {
      console.error(
        "FinancialStorage: Error saving financial records to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets financial select options from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached select options data or null if not found/expired
   */
  getSelectOptionsFromCache(maxAge = this.SELECT_OPTIONS_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isSelectOptionsMemoryCacheValid(maxAge)) {
      console.log("FinancialStorage: Using memory cache for select options");
      return this.memoryCache.selectOptions;
    }

    // Check localStorage cache
    try {
      const cachedSelectOptions = localStorage.getItem(
        this.FINANCIAL_SELECT_OPTIONS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.FINANCIAL_SELECT_OPTIONS_TIMESTAMP_KEY,
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
            "FinancialStorage: Using localStorage cache for select options",
          );
          return selectOptionsData;
        } else {
          console.log(
            "FinancialStorage: Select options cache expired, clearing",
          );
          this._clearSelectOptionsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "FinancialStorage: Error reading select options from localStorage",
        error,
      );
      this._clearSelectOptionsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves financial select options to cache (both memory and localStorage)
   * @param {Object} selectOptionsData - Select options data to cache
   */
  saveSelectOptionsToCache(selectOptionsData) {
    if (!selectOptionsData) {
      console.warn(
        "FinancialStorage: Attempted to save null/undefined select options data",
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
        this.FINANCIAL_SELECT_OPTIONS_CACHE_KEY,
        JSON.stringify(selectOptionsData),
      );
      localStorage.setItem(
        this.FINANCIAL_SELECT_OPTIONS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("FinancialStorage: Select options cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        optionsCount: Array.isArray(selectOptionsData)
          ? selectOptionsData.length
          : "N/A",
      });
    } catch (error) {
      console.error(
        "FinancialStorage: Error saving select options to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets financial summary from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached summary data or null if not found/expired
   */
  getSummaryFromCache(maxAge = this.SUMMARY_CACHE_DURATION) {
    // Check memory cache first (fastest)
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

          // Update memory cache with localStorage data
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
   * Saves financial summary to cache (both memory and localStorage)
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
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears financial records cache (memory and localStorage)
   */
  clearFinancialsCache() {
    // Clear memory cache
    this.memoryCache.financials = null;
    this.memoryCache.financialsTimestamp = null;
    this.memoryCache.isFinancialsLoading = false;

    // Clear localStorage cache
    this._clearFinancialsLocalStorageCache();

    console.log("FinancialStorage: Financial records cache cleared");
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

    console.log("FinancialStorage: Select options cache cleared");
  }

  /**
   * Clears summary cache (memory and localStorage)
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
    this.clearFinancialsCache();
    this.clearSelectOptionsCache();
    this.clearSummaryCache();
    console.log("FinancialStorage: All caches cleared");
  }

  /**
   * Sets loading state for financial records cache
   * @param {boolean} isLoading - Loading state
   */
  setFinancialsCacheLoading(isLoading) {
    this.memoryCache.isFinancialsLoading = isLoading;
  }

  /**
   * Gets loading state from financial records cache
   * @returns {boolean} - Current loading state
   */
  isFinancialsCacheLoading() {
    return this.memoryCache.isFinancialsLoading;
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
   * Gets cache information for debugging
   * @returns {Object} - Cache state information
   */
  getFinancialsCacheInfo() {
    const financialsMemoryValid = this._isFinancialsMemoryCacheValid();
    const financialsLocalStorageValid =
      this._isFinancialsLocalStorageCacheValid();
    const selectOptionsMemoryValid = this._isSelectOptionsMemoryCacheValid();
    const selectOptionsLocalStorageValid =
      this._isSelectOptionsLocalStorageCacheValid();
    const summaryMemoryValid = this._isSummaryMemoryCacheValid();
    const summaryLocalStorageValid = this._isSummaryLocalStorageCacheValid();

    return {
      financials: {
        memoryCache: {
          hasData: !!this.memoryCache.financials,
          timestamp: this.memoryCache.financialsTimestamp,
          age: this.memoryCache.financialsTimestamp
            ? Date.now() - this.memoryCache.financialsTimestamp
            : null,
          isValid: financialsMemoryValid,
          isLoading: this.memoryCache.isFinancialsLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.FINANCIALS_CACHE_KEY),
          timestamp: localStorage.getItem(this.FINANCIALS_TIMESTAMP_KEY),
          isValid: financialsLocalStorageValid,
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
            this.FINANCIAL_SELECT_OPTIONS_CACHE_KEY,
          ),
          timestamp: localStorage.getItem(
            this.FINANCIAL_SELECT_OPTIONS_TIMESTAMP_KEY,
          ),
          isValid: selectOptionsLocalStorageValid,
        },
        cacheDuration: this.SELECT_OPTIONS_CACHE_DURATION,
      },
      summary: {
        memoryCache: {
          hasData: !!this.memoryCache.summary,
          timestamp: this.memoryCache.summaryTimestamp,
          age: this.memoryCache.summaryTimestamp
            ? Date.now() - this.memoryCache.summaryTimestamp
            : null,
          isValid: summaryMemoryValid,
          isLoading: this.memoryCache.isSummaryLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.FINANCIAL_SUMMARY_CACHE_KEY),
          timestamp: localStorage.getItem(this.FINANCIAL_SUMMARY_TIMESTAMP_KEY),
          isValid: summaryLocalStorageValid,
        },
        cacheDuration: this.SUMMARY_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for financial records
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `FinancialStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for select options
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.SELECT_OPTIONS_CACHE_DURATION = durationMs;
    console.log(
      `FinancialStorage: Select options cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for summary
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSummaryCacheDuration(durationMs) {
    this.SUMMARY_CACHE_DURATION = durationMs;
    console.log(
      `FinancialStorage: Summary cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
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
   * Clears financial preferences
   */
  clearFinancialPreferences() {
    localStorage.removeItem("WORKERY_FINANCIAL_PREFERENCES");
    console.log("FinancialStorage: Financial preferences cleared");
  }

  /**
   * Clears all financial-related data from storage
   */
  clearAllFinancialData() {
    this.clearAllCache();
    this.clearFinancialPreferences();

    console.log("FinancialStorage: All financial data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isFinancialsMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (!this.memoryCache.financials || !this.memoryCache.financialsTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.financialsTimestamp;
    return age < maxAge;
  }

  _isFinancialsLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.FINANCIALS_TIMESTAMP_KEY);
      const financials = localStorage.getItem(this.FINANCIALS_CACHE_KEY);

      if (!timestamp || !financials) {
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
        this.FINANCIAL_SELECT_OPTIONS_TIMESTAMP_KEY,
      );
      const selectOptions = localStorage.getItem(
        this.FINANCIAL_SELECT_OPTIONS_CACHE_KEY,
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

  _isSummaryMemoryCacheValid(maxAge = this.SUMMARY_CACHE_DURATION) {
    if (!this.memoryCache.summary || !this.memoryCache.summaryTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.summaryTimestamp;
    return age < maxAge;
  }

  _isSummaryLocalStorageCacheValid(maxAge = this.SUMMARY_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(
        this.FINANCIAL_SUMMARY_TIMESTAMP_KEY,
      );
      const summary = localStorage.getItem(this.FINANCIAL_SUMMARY_CACHE_KEY);

      if (!timestamp || !summary) {
        return false;
      }

      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  _clearFinancialsLocalStorageCache() {
    localStorage.removeItem(this.FINANCIALS_CACHE_KEY);
    localStorage.removeItem(this.FINANCIALS_TIMESTAMP_KEY);
  }

  _clearSelectOptionsLocalStorageCache() {
    localStorage.removeItem(this.FINANCIAL_SELECT_OPTIONS_CACHE_KEY);
    localStorage.removeItem(this.FINANCIAL_SELECT_OPTIONS_TIMESTAMP_KEY);
  }

  _clearSummaryLocalStorageCache() {
    localStorage.removeItem(this.FINANCIAL_SUMMARY_CACHE_KEY);
    localStorage.removeItem(this.FINANCIAL_SUMMARY_TIMESTAMP_KEY);
  }
}
