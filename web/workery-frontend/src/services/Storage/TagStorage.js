// File Path: monorepo/web/workery-frontend/src/services/Storage/TagStorage.js

/**
 * TagStorage handles all tag-related data storage operations
 * Manages tag caching, local storage, and data persistence
 */
export class TagStorage {
  constructor() {
    this.TAGS_CACHE_KEY = "WORKERY_TAGS_CACHE";
    this.TAGS_TIMESTAMP_KEY = "WORKERY_TAGS_TIMESTAMP";
    this.TAG_SELECT_OPTIONS_CACHE_KEY = "WORKERY_TAG_SELECT_OPTIONS_CACHE";
    this.TAG_SELECT_OPTIONS_TIMESTAMP_KEY =
      "WORKERY_TAG_SELECT_OPTIONS_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
    this.SELECT_OPTIONS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for select options

    // In-memory cache for current session
    this.memoryCache = {
      tags: null,
      tagsTimestamp: null,
      isTagsLoading: false,
      selectOptions: null,
      selectOptionsTimestamp: null,
      isSelectOptionsLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("TagStorage initialized");
    }
  }

  /**
   * Gets tags list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached tags data or null if not found/expired
   */
  getTagsFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isTagsMemoryCacheValid(maxAge)) {
      console.log("TagStorage: Using memory cache for tags list");
      return this.memoryCache.tags;
    }

    // Check localStorage cache
    try {
      const cachedTags = localStorage.getItem(this.TAGS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(this.TAGS_TIMESTAMP_KEY);

      if (cachedTags && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const tagsData = JSON.parse(cachedTags);

          // Update memory cache with localStorage data
          this.memoryCache.tags = tagsData;
          this.memoryCache.tagsTimestamp = timestamp;
          this.memoryCache.isTagsLoading = false;

          console.log("TagStorage: Using localStorage cache for tags list");
          return tagsData;
        } else {
          console.log("TagStorage: localStorage cache expired, clearing");
          this._clearTagsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error("TagStorage: Error reading tags from localStorage", error);
      this._clearTagsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves tags list to cache (both memory and localStorage)
   * @param {Object} tagsData - Tags data to cache
   */
  saveTagsToCache(tagsData) {
    if (!tagsData) {
      console.warn("TagStorage: Attempted to save null/undefined tags data");
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.tags = tagsData;
    this.memoryCache.tagsTimestamp = timestamp;
    this.memoryCache.isTagsLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(this.TAGS_CACHE_KEY, JSON.stringify(tagsData));
      localStorage.setItem(this.TAGS_TIMESTAMP_KEY, timestamp.toString());

      console.log("TagStorage: Tags list cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        count: tagsData.results ? tagsData.results.length : 0,
      });
    } catch (error) {
      console.error("TagStorage: Error saving tags to localStorage", error);
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets tag select options from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached select options data or null if not found/expired
   */
  getSelectOptionsFromCache(maxAge = this.SELECT_OPTIONS_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isSelectOptionsMemoryCacheValid(maxAge)) {
      console.log("TagStorage: Using memory cache for select options");
      return this.memoryCache.selectOptions;
    }

    // Check localStorage cache
    try {
      const cachedSelectOptions = localStorage.getItem(
        this.TAG_SELECT_OPTIONS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.TAG_SELECT_OPTIONS_TIMESTAMP_KEY,
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
            "TagStorage: Using localStorage cache for select options",
          );
          return selectOptionsData;
        } else {
          console.log("TagStorage: Select options cache expired, clearing");
          this._clearSelectOptionsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "TagStorage: Error reading select options from localStorage",
        error,
      );
      this._clearSelectOptionsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves tag select options to cache (both memory and localStorage)
   * @param {Object} selectOptionsData - Select options data to cache
   */
  saveSelectOptionsToCache(selectOptionsData) {
    if (!selectOptionsData) {
      console.warn(
        "TagStorage: Attempted to save null/undefined select options data",
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
        this.TAG_SELECT_OPTIONS_CACHE_KEY,
        JSON.stringify(selectOptionsData),
      );
      localStorage.setItem(
        this.TAG_SELECT_OPTIONS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("TagStorage: Select options cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        optionsCount: Array.isArray(selectOptionsData)
          ? selectOptionsData.length
          : "N/A",
      });
    } catch (error) {
      console.error(
        "TagStorage: Error saving select options to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears tags cache (memory and localStorage)
   */
  clearTagsCache() {
    // Clear memory cache
    this.memoryCache.tags = null;
    this.memoryCache.tagsTimestamp = null;
    this.memoryCache.isTagsLoading = false;

    // Clear localStorage cache
    this._clearTagsLocalStorageCache();

    console.log("TagStorage: Tags cache cleared");
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

    console.log("TagStorage: Select options cache cleared");
  }

  /**
   * Clears all tag caches
   */
  clearAllCache() {
    this.clearTagsCache();
    this.clearSelectOptionsCache();
    console.log("TagStorage: All caches cleared");
  }

  /**
   * Sets loading state for tags cache
   * @param {boolean} isLoading - Loading state
   */
  setTagsCacheLoading(isLoading) {
    this.memoryCache.isTagsLoading = isLoading;
  }

  /**
   * Gets loading state from tags cache
   * @returns {boolean} - Current loading state
   */
  isTagsCacheLoading() {
    return this.memoryCache.isTagsLoading;
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
   * Gets cache information for debugging
   * @returns {Object} - Cache state information
   */
  getTagsCacheInfo() {
    const tagsMemoryValid = this._isTagsMemoryCacheValid();
    const tagsLocalStorageValid = this._isTagsLocalStorageCacheValid();
    const selectOptionsMemoryValid = this._isSelectOptionsMemoryCacheValid();
    const selectOptionsLocalStorageValid =
      this._isSelectOptionsLocalStorageCacheValid();

    return {
      tags: {
        memoryCache: {
          hasData: !!this.memoryCache.tags,
          timestamp: this.memoryCache.tagsTimestamp,
          age: this.memoryCache.tagsTimestamp
            ? Date.now() - this.memoryCache.tagsTimestamp
            : null,
          isValid: tagsMemoryValid,
          isLoading: this.memoryCache.isTagsLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.TAGS_CACHE_KEY),
          timestamp: localStorage.getItem(this.TAGS_TIMESTAMP_KEY),
          isValid: tagsLocalStorageValid,
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
          hasData: !!localStorage.getItem(this.TAG_SELECT_OPTIONS_CACHE_KEY),
          timestamp: localStorage.getItem(
            this.TAG_SELECT_OPTIONS_TIMESTAMP_KEY,
          ),
          isValid: selectOptionsLocalStorageValid,
        },
        cacheDuration: this.SELECT_OPTIONS_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for tags
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `TagStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for select options
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.SELECT_OPTIONS_CACHE_DURATION = durationMs;
    console.log(
      `TagStorage: Select options cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves tag preferences to localStorage
   * @param {Object} preferences - Tag preferences object
   */
  saveTagPreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_TAG_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("TagStorage: Tag preferences saved");
    } catch (error) {
      console.error("TagStorage: Error saving tag preferences", error);
    }
  }

  /**
   * Gets tag preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Tag preferences or null if not found/expired
   */
  getTagPreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_TAG_PREFERENCES");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_TAG_PREFERENCES");
        }
      }
    } catch (error) {
      console.error("TagStorage: Error reading tag preferences", error);
    }

    return null;
  }

  /**
   * Clears tag preferences
   */
  clearTagPreferences() {
    localStorage.removeItem("WORKERY_TAG_PREFERENCES");
    console.log("TagStorage: Tag preferences cleared");
  }

  /**
   * Saves tag filters/settings
   * @param {Object} filters - Tag filters object
   */
  saveTagFilters(filters) {
    try {
      localStorage.setItem(
        "WORKERY_TAG_FILTERS",
        JSON.stringify({
          filters: filters,
          timestamp: Date.now(),
        }),
      );
      console.log("TagStorage: Tag filters saved");
    } catch (error) {
      console.error("TagStorage: Error saving tag filters", error);
    }
  }

  /**
   * Gets tag filters/settings
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Tag filters or null if not found/expired
   */
  getTagFilters(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_TAG_FILTERS");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.filters;
        } else {
          // Clean up expired filters
          localStorage.removeItem("WORKERY_TAG_FILTERS");
        }
      }
    } catch (error) {
      console.error("TagStorage: Error reading tag filters", error);
    }

    return null;
  }

  /**
   * Clears tag filters
   */
  clearTagFilters() {
    localStorage.removeItem("WORKERY_TAG_FILTERS");
    console.log("TagStorage: Tag filters cleared");
  }

  /**
   * Clears all tag-related data from storage
   */
  clearAllTagData() {
    this.clearAllCache();
    this.clearTagPreferences();
    this.clearTagFilters();

    console.log("TagStorage: All tag data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isTagsMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (!this.memoryCache.tags || !this.memoryCache.tagsTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.tagsTimestamp;
    return age < maxAge;
  }

  _isTagsLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.TAGS_TIMESTAMP_KEY);
      const tags = localStorage.getItem(this.TAGS_CACHE_KEY);

      if (!timestamp || !tags) {
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
        this.TAG_SELECT_OPTIONS_TIMESTAMP_KEY,
      );
      const selectOptions = localStorage.getItem(
        this.TAG_SELECT_OPTIONS_CACHE_KEY,
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

  _clearTagsLocalStorageCache() {
    localStorage.removeItem(this.TAGS_CACHE_KEY);
    localStorage.removeItem(this.TAGS_TIMESTAMP_KEY);
  }

  _clearSelectOptionsLocalStorageCache() {
    localStorage.removeItem(this.TAG_SELECT_OPTIONS_CACHE_KEY);
    localStorage.removeItem(this.TAG_SELECT_OPTIONS_TIMESTAMP_KEY);
  }
}
