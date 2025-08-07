// File Path: monorepo/web/workery-frontend/src/services/Storage/CommentStorage.js

/**
 * CommentStorage handles all comment-related data storage operations
 * Manages comment caching, local storage, and data persistence
 */
export class CommentStorage {
  constructor() {
    this.COMMENTS_CACHE_KEY = "WORKERY_COMMENTS_CACHE";
    this.COMMENTS_TIMESTAMP_KEY = "WORKERY_COMMENTS_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds (shorter for comments)

    // In-memory cache for current session
    this.memoryCache = {
      comments: null,
      commentsTimestamp: null,
      isCommentsLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("CommentStorage initialized");
    }
  }

  /**
   * Gets comments list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached comments data or null if not found/expired
   */
  getCommentsFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isCommentsMemoryCacheValid(maxAge)) {
      console.log("CommentStorage: Using memory cache for comments list");
      return this.memoryCache.comments;
    }

    // Check localStorage cache
    try {
      const cachedComments = localStorage.getItem(this.COMMENTS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(this.COMMENTS_TIMESTAMP_KEY);

      if (cachedComments && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const commentsData = JSON.parse(cachedComments);

          // Update memory cache with localStorage data
          this.memoryCache.comments = commentsData;
          this.memoryCache.commentsTimestamp = timestamp;
          this.memoryCache.isCommentsLoading = false;

          console.log(
            "CommentStorage: Using localStorage cache for comments list",
          );
          return commentsData;
        } else {
          console.log("CommentStorage: localStorage cache expired, clearing");
          this._clearCommentsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "CommentStorage: Error reading comments from localStorage",
        error,
      );
      this._clearCommentsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves comments list to cache (both memory and localStorage)
   * @param {Object} commentsData - Comments data to cache
   */
  saveCommentsToCache(commentsData) {
    if (!commentsData) {
      console.warn(
        "CommentStorage: Attempted to save null/undefined comments data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.comments = commentsData;
    this.memoryCache.commentsTimestamp = timestamp;
    this.memoryCache.isCommentsLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.COMMENTS_CACHE_KEY,
        JSON.stringify(commentsData),
      );
      localStorage.setItem(this.COMMENTS_TIMESTAMP_KEY, timestamp.toString());

      console.log("CommentStorage: Comments list cached successfully", {
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
   * Clears comments cache (memory and localStorage)
   */
  clearCommentsCache() {
    // Clear memory cache
    this.memoryCache.comments = null;
    this.memoryCache.commentsTimestamp = null;
    this.memoryCache.isCommentsLoading = false;

    // Clear localStorage cache
    this._clearCommentsLocalStorageCache();

    console.log("CommentStorage: Comments cache cleared");
  }

  /**
   * Clears all comment caches
   */
  clearAllCache() {
    this.clearCommentsCache();
    console.log("CommentStorage: All caches cleared");
  }

  /**
   * Sets loading state for comments cache
   * @param {boolean} isLoading - Loading state
   */
  setCommentsCacheLoading(isLoading) {
    this.memoryCache.isCommentsLoading = isLoading;
  }

  /**
   * Gets loading state from comments cache
   * @returns {boolean} - Current loading state
   */
  isCommentsCacheLoading() {
    return this.memoryCache.isCommentsLoading;
  }

  /**
   * Gets cache information for debugging
   * @returns {Object} - Cache state information
   */
  getCommentsCacheInfo() {
    const commentsMemoryValid = this._isCommentsMemoryCacheValid();
    const commentsLocalStorageValid = this._isCommentsLocalStorageCacheValid();

    return {
      comments: {
        memoryCache: {
          hasData: !!this.memoryCache.comments,
          timestamp: this.memoryCache.commentsTimestamp,
          age: this.memoryCache.commentsTimestamp
            ? Date.now() - this.memoryCache.commentsTimestamp
            : null,
          isValid: commentsMemoryValid,
          isLoading: this.memoryCache.isCommentsLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.COMMENTS_CACHE_KEY),
          timestamp: localStorage.getItem(this.COMMENTS_TIMESTAMP_KEY),
          isValid: commentsLocalStorageValid,
        },
        cacheDuration: this.DEFAULT_CACHE_DURATION,
      },
    };
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

  _isCommentsMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (!this.memoryCache.comments || !this.memoryCache.commentsTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.commentsTimestamp;
    return age < maxAge;
  }

  _isCommentsLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.COMMENTS_TIMESTAMP_KEY);
      const comments = localStorage.getItem(this.COMMENTS_CACHE_KEY);

      if (!timestamp || !comments) {
        return false;
      }

      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  _clearCommentsLocalStorageCache() {
    localStorage.removeItem(this.COMMENTS_CACHE_KEY);
    localStorage.removeItem(this.COMMENTS_TIMESTAMP_KEY);
  }
}
