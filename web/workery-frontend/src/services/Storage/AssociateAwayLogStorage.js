// File Path: monorepo/web/workery-frontend/src/services/Storage/AssociateAwayLogStorage.js

/**
 * AssociateAwayLogStorage handles all associate away log-related data storage operations
 * Manages associate away log caching, local storage, and data persistence
 */
export class AssociateAwayLogStorage {
  constructor() {
    this.ASSOCIATE_AWAY_LOGS_CACHE_KEY = "WORKERY_ASSOCIATE_AWAY_LOGS_CACHE";
    this.ASSOCIATE_AWAY_LOGS_TIMESTAMP_KEY =
      "WORKERY_ASSOCIATE_AWAY_LOGS_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

    // In-memory cache for current session
    this.memoryCache = {
      associateAwayLogs: null,
      associateAwayLogsTimestamp: null,
      isAssociateAwayLogsLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("AssociateAwayLogStorage initialized");
    }
  }

  /**
   * Gets associate away logs list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached associate away logs data or null if not found/expired
   */
  getAssociateAwayLogsFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isAssociateAwayLogsMemoryCacheValid(maxAge)) {
      console.log(
        "AssociateAwayLogStorage: Using memory cache for associate away logs list",
      );
      return this.memoryCache.associateAwayLogs;
    }

    // Check localStorage cache
    try {
      const cachedAssociateAwayLogs = localStorage.getItem(
        this.ASSOCIATE_AWAY_LOGS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.ASSOCIATE_AWAY_LOGS_TIMESTAMP_KEY,
      );

      if (cachedAssociateAwayLogs && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const associateAwayLogsData = JSON.parse(cachedAssociateAwayLogs);

          // Update memory cache with localStorage data
          this.memoryCache.associateAwayLogs = associateAwayLogsData;
          this.memoryCache.associateAwayLogsTimestamp = timestamp;
          this.memoryCache.isAssociateAwayLogsLoading = false;

          console.log(
            "AssociateAwayLogStorage: Using localStorage cache for associate away logs list",
          );
          return associateAwayLogsData;
        } else {
          console.log(
            "AssociateAwayLogStorage: localStorage cache expired, clearing",
          );
          this._clearAssociateAwayLogsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "AssociateAwayLogStorage: Error reading associate away logs from localStorage",
        error,
      );
      this._clearAssociateAwayLogsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves associate away logs list to cache (both memory and localStorage)
   * @param {Object} associateAwayLogsData - Associate away logs data to cache
   */
  saveAssociateAwayLogsToCache(associateAwayLogsData) {
    if (!associateAwayLogsData) {
      console.warn(
        "AssociateAwayLogStorage: Attempted to save null/undefined associate away logs data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.associateAwayLogs = associateAwayLogsData;
    this.memoryCache.associateAwayLogsTimestamp = timestamp;
    this.memoryCache.isAssociateAwayLogsLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.ASSOCIATE_AWAY_LOGS_CACHE_KEY,
        JSON.stringify(associateAwayLogsData),
      );
      localStorage.setItem(
        this.ASSOCIATE_AWAY_LOGS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log(
        "AssociateAwayLogStorage: Associate away logs list cached successfully",
        {
          timestamp: new Date(timestamp).toISOString(),
          count: associateAwayLogsData.results
            ? associateAwayLogsData.results.length
            : 0,
        },
      );
    } catch (error) {
      console.error(
        "AssociateAwayLogStorage: Error saving associate away logs to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears associate away logs cache (memory and localStorage)
   */
  clearAssociateAwayLogsCache() {
    // Clear memory cache
    this.memoryCache.associateAwayLogs = null;
    this.memoryCache.associateAwayLogsTimestamp = null;
    this.memoryCache.isAssociateAwayLogsLoading = false;

    // Clear localStorage cache
    this._clearAssociateAwayLogsLocalStorageCache();

    console.log("AssociateAwayLogStorage: Associate away logs cache cleared");
  }

  /**
   * Clears all associate away log caches
   */
  clearAllCache() {
    this.clearAssociateAwayLogsCache();
    console.log("AssociateAwayLogStorage: All caches cleared");
  }

  /**
   * Sets loading state for associate away logs cache
   * @param {boolean} isLoading - Loading state
   */
  setAssociateAwayLogsCacheLoading(isLoading) {
    this.memoryCache.isAssociateAwayLogsLoading = isLoading;
  }

  /**
   * Gets loading state from associate away logs cache
   * @returns {boolean} - Current loading state
   */
  isAssociateAwayLogsCacheLoading() {
    return this.memoryCache.isAssociateAwayLogsLoading;
  }

  /**
   * Gets cache information for debugging
   * @returns {Object} - Cache state information
   */
  getAssociateAwayLogsCacheInfo() {
    const associateAwayLogsMemoryValid =
      this._isAssociateAwayLogsMemoryCacheValid();
    const associateAwayLogsLocalStorageValid =
      this._isAssociateAwayLogsLocalStorageCacheValid();

    return {
      associateAwayLogs: {
        memoryCache: {
          hasData: !!this.memoryCache.associateAwayLogs,
          timestamp: this.memoryCache.associateAwayLogsTimestamp,
          age: this.memoryCache.associateAwayLogsTimestamp
            ? Date.now() - this.memoryCache.associateAwayLogsTimestamp
            : null,
          isValid: associateAwayLogsMemoryValid,
          isLoading: this.memoryCache.isAssociateAwayLogsLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.ASSOCIATE_AWAY_LOGS_CACHE_KEY),
          timestamp: localStorage.getItem(
            this.ASSOCIATE_AWAY_LOGS_TIMESTAMP_KEY,
          ),
          isValid: associateAwayLogsLocalStorageValid,
        },
        cacheDuration: this.DEFAULT_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for associate away logs
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `AssociateAwayLogStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves associate away log preferences to localStorage
   * @param {Object} preferences - Associate away log preferences object
   */
  saveAssociateAwayLogPreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_ASSOCIATE_AWAY_LOG_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log(
        "AssociateAwayLogStorage: Associate away log preferences saved",
      );
    } catch (error) {
      console.error(
        "AssociateAwayLogStorage: Error saving associate away log preferences",
        error,
      );
    }
  }

  /**
   * Gets associate away log preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Associate away log preferences or null if not found/expired
   */
  getAssociateAwayLogPreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem(
        "WORKERY_ASSOCIATE_AWAY_LOG_PREFERENCES",
      );

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_ASSOCIATE_AWAY_LOG_PREFERENCES");
        }
      }
    } catch (error) {
      console.error(
        "AssociateAwayLogStorage: Error reading associate away log preferences",
        error,
      );
    }

    return null;
  }

  /**
   * Clears associate away log preferences
   */
  clearAssociateAwayLogPreferences() {
    localStorage.removeItem("WORKERY_ASSOCIATE_AWAY_LOG_PREFERENCES");
    console.log(
      "AssociateAwayLogStorage: Associate away log preferences cleared",
    );
  }

  /**
   * Clears all associate away log-related data from storage
   */
  clearAllAssociateAwayLogData() {
    this.clearAllCache();
    this.clearAssociateAwayLogPreferences();

    console.log("AssociateAwayLogStorage: All associate away log data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isAssociateAwayLogsMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (
      !this.memoryCache.associateAwayLogs ||
      !this.memoryCache.associateAwayLogsTimestamp
    ) {
      return false;
    }
    const age = Date.now() - this.memoryCache.associateAwayLogsTimestamp;
    return age < maxAge;
  }

  _isAssociateAwayLogsLocalStorageCacheValid(
    maxAge = this.DEFAULT_CACHE_DURATION,
  ) {
    try {
      const timestamp = localStorage.getItem(
        this.ASSOCIATE_AWAY_LOGS_TIMESTAMP_KEY,
      );
      const associateAwayLogs = localStorage.getItem(
        this.ASSOCIATE_AWAY_LOGS_CACHE_KEY,
      );

      if (!timestamp || !associateAwayLogs) {
        return false;
      }

      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  _clearAssociateAwayLogsLocalStorageCache() {
    localStorage.removeItem(this.ASSOCIATE_AWAY_LOGS_CACHE_KEY);
    localStorage.removeItem(this.ASSOCIATE_AWAY_LOGS_TIMESTAMP_KEY);
  }
}
