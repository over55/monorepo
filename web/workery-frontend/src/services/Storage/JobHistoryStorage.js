// File Path: web/workery-frontend/src/services/Storage/JobHistoryStorage.js

/**
 * JobHistoryStorage handles all job history-related data storage operations
 * Manages job history caching, local storage, and data persistence
 */
export class JobHistoryStorage {
  constructor() {
    this.JOB_HISTORY_CACHE_KEY = "WORKERY_JOB_HISTORY_CACHE";
    this.JOB_HISTORY_TIMESTAMP_KEY = "WORKERY_JOB_HISTORY_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

    // In-memory cache for current session
    this.memoryCache = {
      jobHistory: null,
      jobHistoryTimestamp: null,
      isJobHistoryLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("JobHistoryStorage initialized");
    }
  }

  /**
   * Gets job history list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached job history data or null if not found/expired
   */
  getJobHistoryFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isJobHistoryMemoryCacheValid(maxAge)) {
      console.log("JobHistoryStorage: Using memory cache for job history list");
      return this.memoryCache.jobHistory;
    }

    // Check localStorage cache
    try {
      const cachedJobHistory = localStorage.getItem(this.JOB_HISTORY_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(
        this.JOB_HISTORY_TIMESTAMP_KEY,
      );

      if (cachedJobHistory && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const jobHistoryData = JSON.parse(cachedJobHistory);

          // Update memory cache with localStorage data
          this.memoryCache.jobHistory = jobHistoryData;
          this.memoryCache.jobHistoryTimestamp = timestamp;
          this.memoryCache.isJobHistoryLoading = false;

          console.log(
            "JobHistoryStorage: Using localStorage cache for job history list",
          );
          return jobHistoryData;
        } else {
          console.log(
            "JobHistoryStorage: localStorage cache expired, clearing",
          );
          this._clearJobHistoryLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "JobHistoryStorage: Error reading job history from localStorage",
        error,
      );
      this._clearJobHistoryLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves job history list to cache (both memory and localStorage)
   * @param {Object} jobHistoryData - Job history data to cache
   */
  saveJobHistoryToCache(jobHistoryData) {
    if (!jobHistoryData) {
      console.warn(
        "JobHistoryStorage: Attempted to save null/undefined job history data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.jobHistory = jobHistoryData;
    this.memoryCache.jobHistoryTimestamp = timestamp;
    this.memoryCache.isJobHistoryLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.JOB_HISTORY_CACHE_KEY,
        JSON.stringify(jobHistoryData),
      );
      localStorage.setItem(
        this.JOB_HISTORY_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("JobHistoryStorage: Job history list cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        count: jobHistoryData.results ? jobHistoryData.results.length : 0,
      });
    } catch (error) {
      console.error(
        "JobHistoryStorage: Error saving job history to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears job history cache (memory and localStorage)
   */
  clearJobHistoryCache() {
    // Clear memory cache
    this.memoryCache.jobHistory = null;
    this.memoryCache.jobHistoryTimestamp = null;
    this.memoryCache.isJobHistoryLoading = false;

    // Clear localStorage cache
    this._clearJobHistoryLocalStorageCache();

    console.log("JobHistoryStorage: Job history cache cleared");
  }

  /**
   * Clears all job history caches
   */
  clearAllCache() {
    this.clearJobHistoryCache();
    console.log("JobHistoryStorage: All caches cleared");
  }

  /**
   * Sets loading state for job history cache
   * @param {boolean} isLoading - Loading state
   */
  setJobHistoryCacheLoading(isLoading) {
    this.memoryCache.isJobHistoryLoading = isLoading;
  }

  /**
   * Gets loading state from job history cache
   * @returns {boolean} - Current loading state
   */
  isJobHistoryCacheLoading() {
    return this.memoryCache.isJobHistoryLoading;
  }

  /**
   * Gets cache information for debugging
   * @returns {Object} - Cache state information
   */
  getJobHistoryCacheInfo() {
    const jobHistoryMemoryValid = this._isJobHistoryMemoryCacheValid();
    const jobHistoryLocalStorageValid =
      this._isJobHistoryLocalStorageCacheValid();

    return {
      jobHistory: {
        memoryCache: {
          hasData: !!this.memoryCache.jobHistory,
          timestamp: this.memoryCache.jobHistoryTimestamp,
          age: this.memoryCache.jobHistoryTimestamp
            ? Date.now() - this.memoryCache.jobHistoryTimestamp
            : null,
          isValid: jobHistoryMemoryValid,
          isLoading: this.memoryCache.isJobHistoryLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.JOB_HISTORY_CACHE_KEY),
          timestamp: localStorage.getItem(this.JOB_HISTORY_TIMESTAMP_KEY),
          isValid: jobHistoryLocalStorageValid,
        },
        cacheDuration: this.DEFAULT_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for job history
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `JobHistoryStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves job history preferences to localStorage
   * @param {Object} preferences - Job history preferences object
   */
  saveJobHistoryPreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_JOB_HISTORY_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("JobHistoryStorage: Job history preferences saved");
    } catch (error) {
      console.error(
        "JobHistoryStorage: Error saving job history preferences",
        error,
      );
    }
  }

  /**
   * Gets job history preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Job history preferences or null if not found/expired
   */
  getJobHistoryPreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_JOB_HISTORY_PREFERENCES");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_JOB_HISTORY_PREFERENCES");
        }
      }
    } catch (error) {
      console.error(
        "JobHistoryStorage: Error reading job history preferences",
        error,
      );
    }

    return null;
  }

  /**
   * Clears job history preferences
   */
  clearJobHistoryPreferences() {
    localStorage.removeItem("WORKERY_JOB_HISTORY_PREFERENCES");
    console.log("JobHistoryStorage: Job history preferences cleared");
  }

  /**
   * Clears all job history-related data from storage
   */
  clearAllJobHistoryData() {
    this.clearAllCache();
    this.clearJobHistoryPreferences();

    console.log("JobHistoryStorage: All job history data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isJobHistoryMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (!this.memoryCache.jobHistory || !this.memoryCache.jobHistoryTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.jobHistoryTimestamp;
    return age < maxAge;
  }

  _isJobHistoryLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.JOB_HISTORY_TIMESTAMP_KEY);
      const jobHistory = localStorage.getItem(this.JOB_HISTORY_CACHE_KEY);

      if (!timestamp || !jobHistory) {
        return false;
      }

      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  _clearJobHistoryLocalStorageCache() {
    localStorage.removeItem(this.JOB_HISTORY_CACHE_KEY);
    localStorage.removeItem(this.JOB_HISTORY_TIMESTAMP_KEY);
  }
}
