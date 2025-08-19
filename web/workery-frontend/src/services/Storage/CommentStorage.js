// File Path: monorepo/web/workery-frontend/src/services/Storage/CommentStorage.js

/**
 * CommentStorage handles all comment-related data storage operations
 * Manages comment caching, local storage, and data persistence
 */
export class CommentStorage {
  constructor() {
    this.COMMENTS_CACHE_KEY_PREFIX = "WORKERY_COMMENTS_CACHE_";
    this.COMMENTS_TIMESTAMP_KEY_PREFIX = "WORKERY_COMMENTS_TIMESTAMP_";
    this.DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds (shorter for comments)

    // In-memory cache for current session - now uses Map for multiple cache entries
    this.memoryCache = new Map();
    this.loadingStates = new Map();

    if (process.env.NODE_ENV === "development") {
      console.log("CommentStorage initialized");
    }
  }

  /**
   * Generates a cache key based on filter parameters
   * @private
   * @param {Map} filtersMap - Map of filter parameters
   * @returns {string} - Cache key
   */
  _generateCacheKey(filtersMap = new Map()) {
    // Sort the keys to ensure consistent cache keys
    const sortedEntries = Array.from(filtersMap.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );

    // Create a unique key based on all filter parameters
    const keyParts = sortedEntries.map(([key, value]) => `${key}:${value}`);
    return keyParts.join("|");
  }

  /**
   * Gets comments list from cache (memory first, then localStorage)
   * @param {Map} filtersMap - Map of filter parameters (including cursor, page_size, etc.)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached comments data or null if not found/expired
   */
  getCommentsFromCache(
    filtersMap = new Map(),
    maxAge = this.DEFAULT_CACHE_DURATION,
  ) {
    const cacheKey = this._generateCacheKey(filtersMap);
    const fullCacheKey = this.COMMENTS_CACHE_KEY_PREFIX + cacheKey;
    const timestampKey = this.COMMENTS_TIMESTAMP_KEY_PREFIX + cacheKey;

    // Check memory cache first (fastest)
    if (this._isMemoryCacheValid(cacheKey, maxAge)) {
      console.log("CommentStorage: Using memory cache for comments list", {
        cacheKey,
      });
      return this.memoryCache.get(cacheKey).data;
    }

    // Check localStorage cache
    try {
      const cachedComments = localStorage.getItem(fullCacheKey);
      const cachedTimestamp = localStorage.getItem(timestampKey);

      if (cachedComments && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const commentsData = JSON.parse(cachedComments);

          // Update memory cache with localStorage data
          this.memoryCache.set(cacheKey, {
            data: commentsData,
            timestamp: timestamp,
          });

          console.log(
            "CommentStorage: Using localStorage cache for comments list",
            { cacheKey },
          );
          return commentsData;
        } else {
          console.log("CommentStorage: localStorage cache expired, clearing", {
            cacheKey,
          });
          this._clearSpecificLocalStorageCache(fullCacheKey, timestampKey);
        }
      }
    } catch (error) {
      console.error(
        "CommentStorage: Error reading comments from localStorage",
        error,
      );
      this._clearSpecificLocalStorageCache(fullCacheKey, timestampKey);
    }

    return null;
  }

  /**
   * Saves comments list to cache (both memory and localStorage)
   * @param {Map} filtersMap - Map of filter parameters
   * @param {Object} commentsData - Comments data to cache
   */
  saveCommentsToCache(filtersMap = new Map(), commentsData) {
    if (!commentsData) {
      console.warn(
        "CommentStorage: Attempted to save null/undefined comments data",
      );
      return;
    }

    const cacheKey = this._generateCacheKey(filtersMap);
    const fullCacheKey = this.COMMENTS_CACHE_KEY_PREFIX + cacheKey;
    const timestampKey = this.COMMENTS_TIMESTAMP_KEY_PREFIX + cacheKey;
    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.set(cacheKey, {
      data: commentsData,
      timestamp: timestamp,
    });

    // Save to localStorage
    try {
      localStorage.setItem(fullCacheKey, JSON.stringify(commentsData));
      localStorage.setItem(timestampKey, timestamp.toString());

      console.log("CommentStorage: Comments list cached successfully", {
        cacheKey,
        timestamp: new Date(timestamp).toISOString(),
        count: commentsData.results ? commentsData.results.length : 0,
      });
    } catch (error) {
      console.error(
        "CommentStorage: Error saving comments to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears all comments cache (memory and localStorage)
   */
  clearCommentsCache() {
    // Clear memory cache
    this.memoryCache.clear();
    this.loadingStates.clear();

    // Clear localStorage cache - remove all comment cache entries
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith(this.COMMENTS_CACHE_KEY_PREFIX) ||
          key.startsWith(this.COMMENTS_TIMESTAMP_KEY_PREFIX))
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    console.log("CommentStorage: All comments cache cleared");
  }

  /**
   * Clears specific cache entry
   * @param {Map} filtersMap - Map of filter parameters
   */
  clearSpecificCache(filtersMap = new Map()) {
    const cacheKey = this._generateCacheKey(filtersMap);
    const fullCacheKey = this.COMMENTS_CACHE_KEY_PREFIX + cacheKey;
    const timestampKey = this.COMMENTS_TIMESTAMP_KEY_PREFIX + cacheKey;

    // Clear from memory cache
    this.memoryCache.delete(cacheKey);
    this.loadingStates.delete(cacheKey);

    // Clear from localStorage
    this._clearSpecificLocalStorageCache(fullCacheKey, timestampKey);

    console.log("CommentStorage: Specific cache cleared", { cacheKey });
  }

  /**
   * Sets loading state for comments cache
   * @param {Map} filtersMap - Map of filter parameters
   * @param {boolean} isLoading - Loading state
   */
  setCommentsCacheLoading(filtersMap = new Map(), isLoading) {
    const cacheKey = this._generateCacheKey(filtersMap);
    this.loadingStates.set(cacheKey, isLoading);
  }

  /**
   * Gets loading state from comments cache
   * @param {Map} filtersMap - Map of filter parameters
   * @returns {boolean} - Current loading state
   */
  isCommentsCacheLoading(filtersMap = new Map()) {
    const cacheKey = this._generateCacheKey(filtersMap);
    return this.loadingStates.get(cacheKey) || false;
  }

  /**
   * Clears all comment caches
   */
  clearAllCache() {
    this.clearCommentsCache();
    console.log("CommentStorage: All caches cleared");
  }

  /**
   * Gets cache information for debugging
   * @returns {Object} - Cache state information
   */
  getCommentsCacheInfo() {
    const cacheInfo = {
      memoryCache: {
        entries: this.memoryCache.size,
        keys: Array.from(this.memoryCache.keys()),
      },
      loadingStates: {
        entries: this.loadingStates.size,
        loading: Array.from(this.loadingStates.entries())
          .filter(([_, loading]) => loading)
          .map(([key, _]) => key),
      },
      localStorage: {
        entries: 0,
      },
      cacheDuration: this.DEFAULT_CACHE_DURATION,
    };

    // Count localStorage entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.COMMENTS_CACHE_KEY_PREFIX)) {
        cacheInfo.localStorage.entries++;
      }
    }

    return cacheInfo;
  }

  /**
   * Sets cache duration for comments
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `CommentStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves comment preferences to localStorage
   * @param {Object} preferences - Comment preferences object
   */
  saveCommentPreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_COMMENT_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("CommentStorage: Comment preferences saved");
    } catch (error) {
      console.error("CommentStorage: Error saving comment preferences", error);
    }
  }

  /**
   * Gets comment preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Comment preferences or null if not found/expired
   */
  getCommentPreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_COMMENT_PREFERENCES");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_COMMENT_PREFERENCES");
        }
      }
    } catch (error) {
      console.error("CommentStorage: Error reading comment preferences", error);
    }

    return null;
  }

  /**
   * Clears comment preferences
   */
  clearCommentPreferences() {
    localStorage.removeItem("WORKERY_COMMENT_PREFERENCES");
    console.log("CommentStorage: Comment preferences cleared");
  }

  /**
   * Clears all comment-related data from storage
   */
  clearAllCommentData() {
    this.clearAllCache();
    this.clearCommentPreferences();

    console.log("CommentStorage: All comment data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isMemoryCacheValid(cacheKey, maxAge = this.DEFAULT_CACHE_DURATION) {
    const cached = this.memoryCache.get(cacheKey);
    if (!cached || !cached.timestamp) {
      return false;
    }
    const age = Date.now() - cached.timestamp;
    return age < maxAge;
  }

  _clearSpecificLocalStorageCache(fullCacheKey, timestampKey) {
    localStorage.removeItem(fullCacheKey);
    localStorage.removeItem(timestampKey);
  }
}
