// File Path: web/workery-frontend/src/services/Storage/HowHearAboutUsItemStorage.js

/**
 * Storage service for How Hear About Us Item data
 * Handles caching and local persistence with cursor-based pagination support
 */
export class HowHearAboutUsItemStorage {
  constructor() {
    this.cache = new Map();
    this.listCache = new Map();
    this.cursorCache = new Map(); // Cache for cursor-based pagination
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Generate cache key for list operations with cursor support
   */
  _generateListCacheKey(params = {}) {
    // Include cursor in the cache key
    const cacheParams = {
      cursor: params.cursor || "",
      pageSize: params.pageSize || 25,
      sortField: params.sortField || "sort_number",
      sortOrder: params.sortOrder || 1,
      status: params.status || "",
      search: params.search || "",
    };

    const sortedParams = Object.keys(cacheParams)
      .sort()
      .reduce((result, key) => {
        result[key] = cacheParams[key];
        return result;
      }, {});

    return `list_${JSON.stringify(sortedParams)}`;
  }

  /**
   * Generate cache key for cursor navigation
   */
  _generateCursorCacheKey(cursor, params = {}) {
    const key = {
      cursor: cursor || "",
      sortField: params.sortField || "sort_number",
      sortOrder: params.sortOrder || 1,
      pageSize: params.pageSize || 25,
    };
    return `cursor_${JSON.stringify(key)}`;
  }

  /**
   * Check if cache entry is valid
   */
  _isCacheValid(entry) {
    if (!entry) return false;
    return Date.now() - entry.timestamp < this.cacheExpiry;
  }

  /**
   * Store How Hear About Us Item detail in cache
   */
  setDetail(id, data) {
    this.cache.set(`detail_${id}`, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get How Hear About Us Item detail from cache
   */
  getDetail(id) {
    const entry = this.cache.get(`detail_${id}`);
    if (this._isCacheValid(entry)) {
      return entry.data;
    }
    return null;
  }

  /**
   * Store How Hear About Us Item list in cache with cursor support
   */
  setList(params, data) {
    const key = this._generateListCacheKey(params);
    this.listCache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Also cache by cursor for faster navigation
    if (params.cursor !== undefined) {
      const cursorKey = this._generateCursorCacheKey(params.cursor, params);
      this.cursorCache.set(cursorKey, {
        data,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Get How Hear About Us Item list from cache
   */
  getList(params) {
    const key = this._generateListCacheKey(params);
    const entry = this.listCache.get(key);
    if (this._isCacheValid(entry)) {
      return entry.data;
    }

    // Try cursor cache as fallback
    if (params.cursor !== undefined) {
      const cursorKey = this._generateCursorCacheKey(params.cursor, params);
      const cursorEntry = this.cursorCache.get(cursorKey);
      if (this._isCacheValid(cursorEntry)) {
        return cursorEntry.data;
      }
    }

    return null;
  }

  /**
   * Store select options in cache
   */
  setSelectOptions(data) {
    this.cache.set("select_options", {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get select options from cache
   */
  getSelectOptions() {
    const entry = this.cache.get("select_options");
    if (this._isCacheValid(entry)) {
      return entry.data;
    }
    return null;
  }

  /**
   * Store cursor navigation history
   */
  setCursorHistory(key, cursors) {
    this.cache.set(`cursor_history_${key}`, {
      data: cursors,
      timestamp: Date.now(),
    });
  }

  /**
   * Get cursor navigation history
   */
  getCursorHistory(key) {
    const entry = this.cache.get(`cursor_history_${key}`);
    if (this._isCacheValid(entry)) {
      return entry.data;
    }
    return [];
  }

  /**
   * Invalidate cache for a specific item
   */
  invalidateDetail(id) {
    this.cache.delete(`detail_${id}`);
  }

  /**
   * Invalidate all list caches
   */
  invalidateAllLists() {
    this.listCache.clear();
    this.cursorCache.clear();
    // Clear cursor history
    for (const key of this.cache.keys()) {
      if (key.startsWith("cursor_history_")) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalidate all caches
   */
  invalidateAll() {
    this.cache.clear();
    this.listCache.clear();
    this.cursorCache.clear();
  }

  /**
   * Update item in cache after modification
   */
  updateItem(id, data) {
    this.setDetail(id, data);
    // Invalidate list caches since they may contain outdated data
    this.invalidateAllLists();
  }

  /**
   * Remove item from cache after deletion
   */
  removeItem(id) {
    this.invalidateDetail(id);
    this.invalidateAllLists();
  }

  /**
   * Add new item to cache
   */
  addItem(data) {
    if (data.id) {
      this.setDetail(data.id, data);
    }
    // Invalidate list caches to force refresh
    this.invalidateAllLists();
  }

  /**
   * Get cache statistics (for debugging)
   */
  getCacheStats() {
    return {
      detailCacheSize: this.cache.size,
      listCacheSize: this.listCache.size,
      cursorCacheSize: this.cursorCache.size,
      cacheExpiry: this.cacheExpiry,
    };
  }

  /**
   * Clear expired cache entries
   */
  cleanup() {
    const now = Date.now();

    // Clean detail cache
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.cacheExpiry) {
        this.cache.delete(key);
      }
    }

    // Clean list cache
    for (const [key, entry] of this.listCache.entries()) {
      if (now - entry.timestamp >= this.cacheExpiry) {
        this.listCache.delete(key);
      }
    }

    // Clean cursor cache
    for (const [key, entry] of this.cursorCache.entries()) {
      if (now - entry.timestamp >= this.cacheExpiry) {
        this.cursorCache.delete(key);
      }
    }
  }
}
