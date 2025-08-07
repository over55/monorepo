// File Path: monorepo/web/workery-frontend/src/services/Storage/AttachmentStorage.js

/**
 * AttachmentStorage handles all attachment-related data storage operations
 * Manages attachment metadata caching, local storage, and data persistence
 * Note: We cache metadata only, not actual file data
 */
export class AttachmentStorage {
  constructor() {
    this.ATTACHMENTS_CACHE_KEY = "WORKERY_ATTACHMENTS_CACHE";
    this.ATTACHMENTS_TIMESTAMP_KEY = "WORKERY_ATTACHMENTS_TIMESTAMP";
    this.ATTACHMENT_STATS_CACHE_KEY = "WORKERY_ATTACHMENT_STATS_CACHE";
    this.ATTACHMENT_STATS_TIMESTAMP_KEY = "WORKERY_ATTACHMENT_STATS_TIMESTAMP";
    this.ATTACHMENT_THUMBNAILS_CACHE_KEY =
      "WORKERY_ATTACHMENT_THUMBNAILS_CACHE";
    this.ATTACHMENT_THUMBNAILS_TIMESTAMP_KEY =
      "WORKERY_ATTACHMENT_THUMBNAILS_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for attachment metadata
    this.STATS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for stats
    this.THUMBNAILS_CACHE_DURATION = 60 * 60 * 1000; // 1 hour for thumbnails

    // In-memory cache for current session
    this.memoryCache = {
      attachments: null,
      attachmentsTimestamp: null,
      isAttachmentsLoading: false,
      stats: null,
      statsTimestamp: null,
      isStatsLoading: false,
      thumbnails: new Map(), // Map of attachmentId -> thumbnail data
      thumbnailsTimestamp: new Map(), // Map of attachmentId -> timestamp
    };

    if (process.env.NODE_ENV === "development") {
      console.log("AttachmentStorage initialized");
    }
  }

  /**
   * Gets attachment metadata list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached attachment metadata or null if not found/expired
   */
  getAttachmentsFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isAttachmentsMemoryCacheValid(maxAge)) {
      console.log("AttachmentStorage: Using memory cache for attachments list");
      return this.memoryCache.attachments;
    }

    // Check localStorage cache
    try {
      const cachedAttachments = localStorage.getItem(
        this.ATTACHMENTS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.ATTACHMENTS_TIMESTAMP_KEY,
      );

      if (cachedAttachments && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const attachmentsData = JSON.parse(cachedAttachments);

          // Update memory cache with localStorage data
          this.memoryCache.attachments = attachmentsData;
          this.memoryCache.attachmentsTimestamp = timestamp;
          this.memoryCache.isAttachmentsLoading = false;

          console.log(
            "AttachmentStorage: Using localStorage cache for attachments list",
          );
          return attachmentsData;
        } else {
          console.log(
            "AttachmentStorage: localStorage cache expired, clearing",
          );
          this._clearAttachmentsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "AttachmentStorage: Error reading attachments from localStorage",
        error,
      );
      this._clearAttachmentsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves attachment metadata list to cache (both memory and localStorage)
   * @param {Object} attachmentsData - Attachment metadata to cache
   */
  saveAttachmentsToCache(attachmentsData) {
    if (!attachmentsData) {
      console.warn(
        "AttachmentStorage: Attempted to save null/undefined attachments data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.attachments = attachmentsData;
    this.memoryCache.attachmentsTimestamp = timestamp;
    this.memoryCache.isAttachmentsLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.ATTACHMENTS_CACHE_KEY,
        JSON.stringify(attachmentsData),
      );
      localStorage.setItem(
        this.ATTACHMENTS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("AttachmentStorage: Attachments list cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        count: attachmentsData.results ? attachmentsData.results.length : 0,
      });
    } catch (error) {
      console.error(
        "AttachmentStorage: Error saving attachments to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets attachment statistics from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached stats data or null if not found/expired
   */
  getStatsFromCache(maxAge = this.STATS_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isStatsMemoryCacheValid(maxAge)) {
      console.log("AttachmentStorage: Using memory cache for stats");
      return this.memoryCache.stats;
    }

    // Check localStorage cache
    try {
      const cachedStats = localStorage.getItem(this.ATTACHMENT_STATS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(
        this.ATTACHMENT_STATS_TIMESTAMP_KEY,
      );

      if (cachedStats && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const statsData = JSON.parse(cachedStats);

          // Update memory cache with localStorage data
          this.memoryCache.stats = statsData;
          this.memoryCache.statsTimestamp = timestamp;
          this.memoryCache.isStatsLoading = false;

          console.log("AttachmentStorage: Using localStorage cache for stats");
          return statsData;
        } else {
          console.log("AttachmentStorage: Stats cache expired, clearing");
          this._clearStatsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "AttachmentStorage: Error reading stats from localStorage",
        error,
      );
      this._clearStatsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves attachment statistics to cache (both memory and localStorage)
   * @param {Object} statsData - Stats data to cache
   */
  saveStatsToCache(statsData) {
    if (!statsData) {
      console.warn(
        "AttachmentStorage: Attempted to save null/undefined stats data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.stats = statsData;
    this.memoryCache.statsTimestamp = timestamp;
    this.memoryCache.isStatsLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.ATTACHMENT_STATS_CACHE_KEY,
        JSON.stringify(statsData),
      );
      localStorage.setItem(
        this.ATTACHMENT_STATS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("AttachmentStorage: Stats cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
      });
    } catch (error) {
      console.error(
        "AttachmentStorage: Error saving stats to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets a thumbnail from cache
   * @param {string|number} attachmentId - The attachment ID
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {string|null} - Cached thumbnail URL or null if not found/expired
   */
  getThumbnailFromCache(attachmentId, maxAge = this.THUMBNAILS_CACHE_DURATION) {
    const key = String(attachmentId);

    // Check memory cache first
    const thumbnail = this.memoryCache.thumbnails.get(key);
    const timestamp = this.memoryCache.thumbnailsTimestamp.get(key);

    if (thumbnail && timestamp) {
      const age = Date.now() - timestamp;
      if (age < maxAge) {
        console.log(
          `AttachmentStorage: Using memory cache for thumbnail ${attachmentId}`,
        );
        return thumbnail;
      } else {
        // Remove expired thumbnail
        this.memoryCache.thumbnails.delete(key);
        this.memoryCache.thumbnailsTimestamp.delete(key);
      }
    }

    // Check localStorage cache
    try {
      const cachedThumbnails = localStorage.getItem(
        this.ATTACHMENT_THUMBNAILS_CACHE_KEY,
      );
      const cachedTimestamps = localStorage.getItem(
        this.ATTACHMENT_THUMBNAILS_TIMESTAMP_KEY,
      );

      if (cachedThumbnails && cachedTimestamps) {
        const thumbnails = JSON.parse(cachedThumbnails);
        const timestamps = JSON.parse(cachedTimestamps);

        if (thumbnails[key] && timestamps[key]) {
          const age = Date.now() - timestamps[key];
          if (age < maxAge) {
            // Update memory cache
            this.memoryCache.thumbnails.set(key, thumbnails[key]);
            this.memoryCache.thumbnailsTimestamp.set(key, timestamps[key]);

            console.log(
              `AttachmentStorage: Using localStorage cache for thumbnail ${attachmentId}`,
            );
            return thumbnails[key];
          }
        }
      }
    } catch (error) {
      console.error(
        "AttachmentStorage: Error reading thumbnails from localStorage",
        error,
      );
    }

    return null;
  }

  /**
   * Saves a thumbnail to cache
   * @param {string|number} attachmentId - The attachment ID
   * @param {string} thumbnailUrl - The thumbnail URL to cache
   */
  saveThumbnailToCache(attachmentId, thumbnailUrl) {
    if (!attachmentId || !thumbnailUrl) {
      console.warn(
        "AttachmentStorage: Attempted to save invalid thumbnail data",
      );
      return;
    }

    const key = String(attachmentId);
    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.thumbnails.set(key, thumbnailUrl);
    this.memoryCache.thumbnailsTimestamp.set(key, timestamp);

    // Save to localStorage
    try {
      // Get existing data
      const existingThumbnails = localStorage.getItem(
        this.ATTACHMENT_THUMBNAILS_CACHE_KEY,
      );
      const existingTimestamps = localStorage.getItem(
        this.ATTACHMENT_THUMBNAILS_TIMESTAMP_KEY,
      );

      const thumbnails = existingThumbnails
        ? JSON.parse(existingThumbnails)
        : {};
      const timestamps = existingTimestamps
        ? JSON.parse(existingTimestamps)
        : {};

      // Update with new data
      thumbnails[key] = thumbnailUrl;
      timestamps[key] = timestamp;

      // Clean up old entries (keep only last 100 thumbnails)
      const entries = Object.entries(timestamps)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 100);

      const cleanedThumbnails = {};
      const cleanedTimestamps = {};

      entries.forEach(([id, ts]) => {
        cleanedThumbnails[id] = thumbnails[id];
        cleanedTimestamps[id] = ts;
      });

      localStorage.setItem(
        this.ATTACHMENT_THUMBNAILS_CACHE_KEY,
        JSON.stringify(cleanedThumbnails),
      );
      localStorage.setItem(
        this.ATTACHMENT_THUMBNAILS_TIMESTAMP_KEY,
        JSON.stringify(cleanedTimestamps),
      );

      console.log(
        `AttachmentStorage: Thumbnail cached successfully for ${attachmentId}`,
      );
    } catch (error) {
      console.error(
        "AttachmentStorage: Error saving thumbnails to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears attachments cache (memory and localStorage)
   */
  clearAttachmentsCache() {
    // Clear memory cache
    this.memoryCache.attachments = null;
    this.memoryCache.attachmentsTimestamp = null;
    this.memoryCache.isAttachmentsLoading = false;

    // Clear localStorage cache
    this._clearAttachmentsLocalStorageCache();

    console.log("AttachmentStorage: Attachments cache cleared");
  }

  /**
   * Clears stats cache (memory and localStorage)
   */
  clearStatsCache() {
    // Clear memory cache
    this.memoryCache.stats = null;
    this.memoryCache.statsTimestamp = null;
    this.memoryCache.isStatsLoading = false;

    // Clear localStorage cache
    this._clearStatsLocalStorageCache();

    console.log("AttachmentStorage: Stats cache cleared");
  }

  /**
   * Clears thumbnails cache (memory and localStorage)
   */
  clearThumbnailsCache() {
    // Clear memory cache
    this.memoryCache.thumbnails.clear();
    this.memoryCache.thumbnailsTimestamp.clear();

    // Clear localStorage cache
    this._clearThumbnailsLocalStorageCache();

    console.log("AttachmentStorage: Thumbnails cache cleared");
  }

  /**
   * Clears all attachment caches
   */
  clearAllCache() {
    this.clearAttachmentsCache();
    this.clearStatsCache();
    this.clearThumbnailsCache();
    console.log("AttachmentStorage: All caches cleared");
  }

  /**
   * Sets loading state for attachments cache
   * @param {boolean} isLoading - Loading state
   */
  setAttachmentsCacheLoading(isLoading) {
    this.memoryCache.isAttachmentsLoading = isLoading;
  }

  /**
   * Gets loading state from attachments cache
   * @returns {boolean} - Current loading state
   */
  isAttachmentsCacheLoading() {
    return this.memoryCache.isAttachmentsLoading;
  }

  /**
   * Sets loading state for stats cache
   * @param {boolean} isLoading - Loading state
   */
  setStatsCacheLoading(isLoading) {
    this.memoryCache.isStatsLoading = isLoading;
  }

  /**
   * Gets loading state from stats cache
   * @returns {boolean} - Current loading state
   */
  isStatsCacheLoading() {
    return this.memoryCache.isStatsLoading;
  }

  /**
   * Gets cache information for debugging
   * @returns {Object} - Cache state information
   */
  getAttachmentsCacheInfo() {
    const attachmentsMemoryValid = this._isAttachmentsMemoryCacheValid();
    const attachmentsLocalStorageValid =
      this._isAttachmentsLocalStorageCacheValid();
    const statsMemoryValid = this._isStatsMemoryCacheValid();
    const statsLocalStorageValid = this._isStatsLocalStorageCacheValid();

    return {
      attachments: {
        memoryCache: {
          hasData: !!this.memoryCache.attachments,
          timestamp: this.memoryCache.attachmentsTimestamp,
          age: this.memoryCache.attachmentsTimestamp
            ? Date.now() - this.memoryCache.attachmentsTimestamp
            : null,
          isValid: attachmentsMemoryValid,
          isLoading: this.memoryCache.isAttachmentsLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.ATTACHMENTS_CACHE_KEY),
          timestamp: localStorage.getItem(this.ATTACHMENTS_TIMESTAMP_KEY),
          isValid: attachmentsLocalStorageValid,
        },
        cacheDuration: this.DEFAULT_CACHE_DURATION,
      },
      stats: {
        memoryCache: {
          hasData: !!this.memoryCache.stats,
          timestamp: this.memoryCache.statsTimestamp,
          age: this.memoryCache.statsTimestamp
            ? Date.now() - this.memoryCache.statsTimestamp
            : null,
          isValid: statsMemoryValid,
          isLoading: this.memoryCache.isStatsLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.ATTACHMENT_STATS_CACHE_KEY),
          timestamp: localStorage.getItem(this.ATTACHMENT_STATS_TIMESTAMP_KEY),
          isValid: statsLocalStorageValid,
        },
        cacheDuration: this.STATS_CACHE_DURATION,
      },
      thumbnails: {
        memoryCache: {
          count: this.memoryCache.thumbnails.size,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.ATTACHMENT_THUMBNAILS_CACHE_KEY),
        },
        cacheDuration: this.THUMBNAILS_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for attachments
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `AttachmentStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for stats
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setStatsCacheDuration(durationMs) {
    this.STATS_CACHE_DURATION = durationMs;
    console.log(
      `AttachmentStorage: Stats cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for thumbnails
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setThumbnailsCacheDuration(durationMs) {
    this.THUMBNAILS_CACHE_DURATION = durationMs;
    console.log(
      `AttachmentStorage: Thumbnails cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves attachment preferences to localStorage
   * @param {Object} preferences - Attachment preferences object
   */
  saveAttachmentPreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_ATTACHMENT_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("AttachmentStorage: Attachment preferences saved");
    } catch (error) {
      console.error(
        "AttachmentStorage: Error saving attachment preferences",
        error,
      );
    }
  }

  /**
   * Gets attachment preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Attachment preferences or null if not found/expired
   */
  getAttachmentPreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_ATTACHMENT_PREFERENCES");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_ATTACHMENT_PREFERENCES");
        }
      }
    } catch (error) {
      console.error(
        "AttachmentStorage: Error reading attachment preferences",
        error,
      );
    }

    return null;
  }

  /**
   * Clears attachment preferences
   */
  clearAttachmentPreferences() {
    localStorage.removeItem("WORKERY_ATTACHMENT_PREFERENCES");
    console.log("AttachmentStorage: Attachment preferences cleared");
  }

  /**
   * Clears all attachment-related data from storage
   */
  clearAllAttachmentData() {
    this.clearAllCache();
    this.clearAttachmentPreferences();

    console.log("AttachmentStorage: All attachment data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isAttachmentsMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (
      !this.memoryCache.attachments ||
      !this.memoryCache.attachmentsTimestamp
    ) {
      return false;
    }
    const age = Date.now() - this.memoryCache.attachmentsTimestamp;
    return age < maxAge;
  }

  _isAttachmentsLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.ATTACHMENTS_TIMESTAMP_KEY);
      const attachments = localStorage.getItem(this.ATTACHMENTS_CACHE_KEY);

      if (!timestamp || !attachments) {
        return false;
      }

      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  _isStatsMemoryCacheValid(maxAge = this.STATS_CACHE_DURATION) {
    if (!this.memoryCache.stats || !this.memoryCache.statsTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.statsTimestamp;
    return age < maxAge;
  }

  _isStatsLocalStorageCacheValid(maxAge = this.STATS_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(
        this.ATTACHMENT_STATS_TIMESTAMP_KEY,
      );
      const stats = localStorage.getItem(this.ATTACHMENT_STATS_CACHE_KEY);

      if (!timestamp || !stats) {
        return false;
      }

      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  _clearAttachmentsLocalStorageCache() {
    localStorage.removeItem(this.ATTACHMENTS_CACHE_KEY);
    localStorage.removeItem(this.ATTACHMENTS_TIMESTAMP_KEY);
  }

  _clearStatsLocalStorageCache() {
    localStorage.removeItem(this.ATTACHMENT_STATS_CACHE_KEY);
    localStorage.removeItem(this.ATTACHMENT_STATS_TIMESTAMP_KEY);
  }

  _clearThumbnailsLocalStorageCache() {
    localStorage.removeItem(this.ATTACHMENT_THUMBNAILS_CACHE_KEY);
    localStorage.removeItem(this.ATTACHMENT_THUMBNAILS_TIMESTAMP_KEY);
  }
}
