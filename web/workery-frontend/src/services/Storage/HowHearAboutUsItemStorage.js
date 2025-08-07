// File Path: web/workery-frontend/src/services/Storage/HowHearAboutUsItemStorage.js

/**
 * Storage service for How Hear About Us Item data
 * Handles caching and local persistence
 */
export class HowHearAboutUsItemStorage {
  constructor() {
    this.cache = new Map();
    this.listCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Generate cache key for list operations
   */
  _generateListCacheKey(params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});

    return `list_${JSON.stringify(sortedParams)}`;
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
   * Store How Hear About Us Item list in cache
   */
  setList(params, data) {
    const key = this._generateListCacheKey(params);
    this.listCache.set(key, {
      data,
      timestamp: Date.now(),
    });
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
  }

  /**
   * Invalidate all caches
   */
  invalidateAll() {
    this.cache.clear();
    this.listCache.clear();
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
  }
}
