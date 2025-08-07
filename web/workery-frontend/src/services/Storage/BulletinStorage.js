// File Path: monorepo/web/workery-frontend/src/services/Storage/BulletinStorage.js

/**
 * BulletinStorage handles all bulletin-related data storage operations
 * Manages bulletin caching, local storage, and data persistence
 */
export class BulletinStorage {
  constructor() {
    this.BULLETINS_CACHE_KEY = "WORKERY_BULLETINS_CACHE";
    this.BULLETINS_TIMESTAMP_KEY = "WORKERY_BULLETINS_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

    // In-memory cache for current session
    this.memoryCache = {
      bulletins: null,
      bulletinsTimestamp: null,
      isBulletinsLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("BulletinStorage initialized");
    }
  }

  /**
   * Gets bulletins list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached bulletins data or null if not found/expired
   */
  getBulletinsFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isBulletinsMemoryCacheValid(maxAge)) {
      console.log("BulletinStorage: Using memory cache for bulletins list");
      return this.memoryCache.bulletins;
    }

    // Check localStorage cache
    try {
      const cachedBulletins = localStorage.getItem(this.BULLETINS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(
        this.BULLETINS_TIMESTAMP_KEY,
      );

      if (cachedBulletins && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const bulletinsData = JSON.parse(cachedBulletins);

          // Update memory cache with localStorage data
          this.memoryCache.bulletins = bulletinsData;
          this.memoryCache.bulletinsTimestamp = timestamp;
          this.memoryCache.isBulletinsLoading = false;

          console.log(
            "BulletinStorage: Using localStorage cache for bulletins list",
          );
          return bulletinsData;
        } else {
          console.log("BulletinStorage: localStorage cache expired, clearing");
          this._clearBulletinsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "BulletinStorage: Error reading bulletins from localStorage",
        error,
      );
      this._clearBulletinsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves bulletins list to cache (both memory and localStorage)
   * @param {Object} bulletinsData - Bulletins data to cache
   */
  saveBulletinsToCache(bulletinsData) {
    if (!bulletinsData) {
      console.warn(
        "BulletinStorage: Attempted to save null/undefined bulletins data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.bulletins = bulletinsData;
    this.memoryCache.bulletinsTimestamp = timestamp;
    this.memoryCache.isBulletinsLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.BULLETINS_CACHE_KEY,
        JSON.stringify(bulletinsData),
      );
      localStorage.setItem(this.BULLETINS_TIMESTAMP_KEY, timestamp.toString());

      console.log("BulletinStorage: Bulletins list cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        count: bulletinsData.results ? bulletinsData.results.length : 0,
      });
    } catch (error) {
      console.error(
        "BulletinStorage: Error saving bulletins to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears bulletins cache (memory and localStorage)
   */
  clearBulletinsCache() {
    // Clear memory cache
    this.memoryCache.bulletins = null;
    this.memoryCache.bulletinsTimestamp = null;
    this.memoryCache.isBulletinsLoading = false;

    // Clear localStorage cache
    this._clearBulletinsLocalStorageCache();

    console.log("BulletinStorage: Bulletins cache cleared");
  }

  /**
   * Clears all bulletin caches
   */
  clearAllCache() {
    this.clearBulletinsCache();
    console.log("BulletinStorage: All caches cleared");
  }

  /**
   * Sets loading state for bulletins cache
   * @param {boolean} isLoading - Loading state
   */
  setBulletinsCacheLoading(isLoading) {
    this.memoryCache.isBulletinsLoading = isLoading;
  }

  /**
   * Gets loading state from bulletins cache
   * @returns {boolean} - Current loading state
   */
  isBulletinsCacheLoading() {
    return this.memoryCache.isBulletinsLoading;
  }

  /**
   * Gets cache information for debugging
   * @returns {Object} - Cache state information
   */
  getBulletinsCacheInfo() {
    const bulletinsMemoryValid = this._isBulletinsMemoryCacheValid();
    const bulletinsLocalStorageValid =
      this._isBulletinsLocalStorageCacheValid();

    return {
      bulletins: {
        memoryCache: {
          hasData: !!this.memoryCache.bulletins,
          timestamp: this.memoryCache.bulletinsTimestamp,
          age: this.memoryCache.bulletinsTimestamp
            ? Date.now() - this.memoryCache.bulletinsTimestamp
            : null,
          isValid: bulletinsMemoryValid,
          isLoading: this.memoryCache.isBulletinsLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.BULLETINS_CACHE_KEY),
          timestamp: localStorage.getItem(this.BULLETINS_TIMESTAMP_KEY),
          isValid: bulletinsLocalStorageValid,
        },
        cacheDuration: this.DEFAULT_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for bulletins
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `BulletinStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves bulletin preferences to localStorage
   * @param {Object} preferences - Bulletin preferences object
   */
  saveBulletinPreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_BULLETIN_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("BulletinStorage: Bulletin preferences saved");
    } catch (error) {
      console.error(
        "BulletinStorage: Error saving bulletin preferences",
        error,
      );
    }
  }

  /**
   * Gets bulletin preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Bulletin preferences or null if not found/expired
   */
  getBulletinPreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_BULLETIN_PREFERENCES");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_BULLETIN_PREFERENCES");
        }
      }
    } catch (error) {
      console.error(
        "BulletinStorage: Error reading bulletin preferences",
        error,
      );
    }

    return null;
  }

  /**
   * Clears bulletin preferences
   */
  clearBulletinPreferences() {
    localStorage.removeItem("WORKERY_BULLETIN_PREFERENCES");
    console.log("BulletinStorage: Bulletin preferences cleared");
  }

  /**
   * Clears all bulletin-related data from storage
   */
  clearAllBulletinData() {
    this.clearAllCache();
    this.clearBulletinPreferences();

    console.log("BulletinStorage: All bulletin data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isBulletinsMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (!this.memoryCache.bulletins || !this.memoryCache.bulletinsTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.bulletinsTimestamp;
    return age < maxAge;
  }

  _isBulletinsLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.BULLETINS_TIMESTAMP_KEY);
      const bulletins = localStorage.getItem(this.BULLETINS_CACHE_KEY);

      if (!timestamp || !bulletins) {
        return false;
      }

      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  _clearBulletinsLocalStorageCache() {
    localStorage.removeItem(this.BULLETINS_CACHE_KEY);
    localStorage.removeItem(this.BULLETINS_TIMESTAMP_KEY);
  }
}
