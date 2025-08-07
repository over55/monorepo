// File Path: monorepo/web/workery-frontend/src/services/Storage/SkillSetStorage.js

/**
 * SkillSetStorage handles all skill set-related data storage operations
 * Manages skill set caching, local storage, and data persistence
 */
export class SkillSetStorage {
  constructor() {
    this.SKILL_SETS_CACHE_KEY = "WORKERY_SKILL_SETS_CACHE";
    this.SKILL_SETS_TIMESTAMP_KEY = "WORKERY_SKILL_SETS_TIMESTAMP";
    this.SKILL_SET_SELECT_OPTIONS_CACHE_KEY =
      "WORKERY_SKILL_SET_SELECT_OPTIONS_CACHE";
    this.SKILL_SET_SELECT_OPTIONS_TIMESTAMP_KEY =
      "WORKERY_SKILL_SET_SELECT_OPTIONS_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
    this.SELECT_OPTIONS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for select options

    // In-memory cache for current session
    this.memoryCache = {
      skillSets: null,
      skillSetsTimestamp: null,
      isSkillSetsLoading: false,
      selectOptions: null,
      selectOptionsTimestamp: null,
      isSelectOptionsLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("SkillSetStorage initialized");
    }
  }

  /**
   * Gets skill sets list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached skill sets data or null if not found/expired
   */
  getSkillSetsFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isSkillSetsMemoryCacheValid(maxAge)) {
      console.log("SkillSetStorage: Using memory cache for skill sets list");
      return this.memoryCache.skillSets;
    }

    // Check localStorage cache
    try {
      const cachedSkillSets = localStorage.getItem(this.SKILL_SETS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(
        this.SKILL_SETS_TIMESTAMP_KEY,
      );

      if (cachedSkillSets && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const skillSetsData = JSON.parse(cachedSkillSets);

          // Update memory cache with localStorage data
          this.memoryCache.skillSets = skillSetsData;
          this.memoryCache.skillSetsTimestamp = timestamp;
          this.memoryCache.isSkillSetsLoading = false;

          console.log(
            "SkillSetStorage: Using localStorage cache for skill sets list",
          );
          return skillSetsData;
        } else {
          console.log("SkillSetStorage: localStorage cache expired, clearing");
          this._clearSkillSetsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "SkillSetStorage: Error reading skill sets from localStorage",
        error,
      );
      this._clearSkillSetsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves skill sets list to cache (both memory and localStorage)
   * @param {Object} skillSetsData - Skill sets data to cache
   */
  saveSkillSetsToCache(skillSetsData) {
    if (!skillSetsData) {
      console.warn(
        "SkillSetStorage: Attempted to save null/undefined skill sets data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.skillSets = skillSetsData;
    this.memoryCache.skillSetsTimestamp = timestamp;
    this.memoryCache.isSkillSetsLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.SKILL_SETS_CACHE_KEY,
        JSON.stringify(skillSetsData),
      );
      localStorage.setItem(this.SKILL_SETS_TIMESTAMP_KEY, timestamp.toString());

      console.log("SkillSetStorage: Skill sets list cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        count: skillSetsData.results ? skillSetsData.results.length : 0,
      });
    } catch (error) {
      console.error(
        "SkillSetStorage: Error saving skill sets to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets skill set select options from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached select options data or null if not found/expired
   */
  getSelectOptionsFromCache(maxAge = this.SELECT_OPTIONS_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isSelectOptionsMemoryCacheValid(maxAge)) {
      console.log("SkillSetStorage: Using memory cache for select options");
      return this.memoryCache.selectOptions;
    }

    // Check localStorage cache
    try {
      const cachedSelectOptions = localStorage.getItem(
        this.SKILL_SET_SELECT_OPTIONS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.SKILL_SET_SELECT_OPTIONS_TIMESTAMP_KEY,
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
            "SkillSetStorage: Using localStorage cache for select options",
          );
          return selectOptionsData;
        } else {
          console.log(
            "SkillSetStorage: Select options cache expired, clearing",
          );
          this._clearSelectOptionsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "SkillSetStorage: Error reading select options from localStorage",
        error,
      );
      this._clearSelectOptionsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves skill set select options to cache (both memory and localStorage)
   * @param {Object} selectOptionsData - Select options data to cache
   */
  saveSelectOptionsToCache(selectOptionsData) {
    if (!selectOptionsData) {
      console.warn(
        "SkillSetStorage: Attempted to save null/undefined select options data",
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
        this.SKILL_SET_SELECT_OPTIONS_CACHE_KEY,
        JSON.stringify(selectOptionsData),
      );
      localStorage.setItem(
        this.SKILL_SET_SELECT_OPTIONS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("SkillSetStorage: Select options cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        optionsCount: Array.isArray(selectOptionsData)
          ? selectOptionsData.length
          : "N/A",
      });
    } catch (error) {
      console.error(
        "SkillSetStorage: Error saving select options to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears skill sets cache (memory and localStorage)
   */
  clearSkillSetsCache() {
    // Clear memory cache
    this.memoryCache.skillSets = null;
    this.memoryCache.skillSetsTimestamp = null;
    this.memoryCache.isSkillSetsLoading = false;

    // Clear localStorage cache
    this._clearSkillSetsLocalStorageCache();

    console.log("SkillSetStorage: Skill sets cache cleared");
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

    console.log("SkillSetStorage: Select options cache cleared");
  }

  /**
   * Clears all skill set caches
   */
  clearAllCache() {
    this.clearSkillSetsCache();
    this.clearSelectOptionsCache();
    console.log("SkillSetStorage: All caches cleared");
  }

  /**
   * Sets loading state for skill sets cache
   * @param {boolean} isLoading - Loading state
   */
  setSkillSetsCacheLoading(isLoading) {
    this.memoryCache.isSkillSetsLoading = isLoading;
  }

  /**
   * Gets loading state from skill sets cache
   * @returns {boolean} - Current loading state
   */
  isSkillSetsCacheLoading() {
    return this.memoryCache.isSkillSetsLoading;
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
  getSkillSetsCacheInfo() {
    const skillSetsMemoryValid = this._isSkillSetsMemoryCacheValid();
    const skillSetsLocalStorageValid =
      this._isSkillSetsLocalStorageCacheValid();
    const selectOptionsMemoryValid = this._isSelectOptionsMemoryCacheValid();
    const selectOptionsLocalStorageValid =
      this._isSelectOptionsLocalStorageCacheValid();

    return {
      skillSets: {
        memoryCache: {
          hasData: !!this.memoryCache.skillSets,
          timestamp: this.memoryCache.skillSetsTimestamp,
          age: this.memoryCache.skillSetsTimestamp
            ? Date.now() - this.memoryCache.skillSetsTimestamp
            : null,
          isValid: skillSetsMemoryValid,
          isLoading: this.memoryCache.isSkillSetsLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.SKILL_SETS_CACHE_KEY),
          timestamp: localStorage.getItem(this.SKILL_SETS_TIMESTAMP_KEY),
          isValid: skillSetsLocalStorageValid,
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
            this.SKILL_SET_SELECT_OPTIONS_CACHE_KEY,
          ),
          timestamp: localStorage.getItem(
            this.SKILL_SET_SELECT_OPTIONS_TIMESTAMP_KEY,
          ),
          isValid: selectOptionsLocalStorageValid,
        },
        cacheDuration: this.SELECT_OPTIONS_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for skill sets
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `SkillSetStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for select options
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.SELECT_OPTIONS_CACHE_DURATION = durationMs;
    console.log(
      `SkillSetStorage: Select options cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves skill set preferences to localStorage
   * @param {Object} preferences - Skill set preferences object
   */
  saveSkillSetPreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_SKILL_SET_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("SkillSetStorage: Skill set preferences saved");
    } catch (error) {
      console.error(
        "SkillSetStorage: Error saving skill set preferences",
        error,
      );
    }
  }

  /**
   * Gets skill set preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Skill set preferences or null if not found/expired
   */
  getSkillSetPreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_SKILL_SET_PREFERENCES");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_SKILL_SET_PREFERENCES");
        }
      }
    } catch (error) {
      console.error(
        "SkillSetStorage: Error reading skill set preferences",
        error,
      );
    }

    return null;
  }

  /**
   * Clears skill set preferences
   */
  clearSkillSetPreferences() {
    localStorage.removeItem("WORKERY_SKILL_SET_PREFERENCES");
    console.log("SkillSetStorage: Skill set preferences cleared");
  }

  /**
   * Saves skill set filters/settings
   * @param {Object} filters - Skill set filters object
   */
  saveSkillSetFilters(filters) {
    try {
      localStorage.setItem(
        "WORKERY_SKILL_SET_FILTERS",
        JSON.stringify({
          filters: filters,
          timestamp: Date.now(),
        }),
      );
      console.log("SkillSetStorage: Skill set filters saved");
    } catch (error) {
      console.error("SkillSetStorage: Error saving skill set filters", error);
    }
  }

  /**
   * Gets skill set filters/settings
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Skill set filters or null if not found/expired
   */
  getSkillSetFilters(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_SKILL_SET_FILTERS");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.filters;
        } else {
          // Clean up expired filters
          localStorage.removeItem("WORKERY_SKILL_SET_FILTERS");
        }
      }
    } catch (error) {
      console.error("SkillSetStorage: Error reading skill set filters", error);
    }

    return null;
  }

  /**
   * Clears skill set filters
   */
  clearSkillSetFilters() {
    localStorage.removeItem("WORKERY_SKILL_SET_FILTERS");
    console.log("SkillSetStorage: Skill set filters cleared");
  }

  /**
   * Clears all skill set-related data from storage
   */
  clearAllSkillSetData() {
    this.clearAllCache();
    this.clearSkillSetPreferences();
    this.clearSkillSetFilters();

    console.log("SkillSetStorage: All skill set data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isSkillSetsMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (!this.memoryCache.skillSets || !this.memoryCache.skillSetsTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.skillSetsTimestamp;
    return age < maxAge;
  }

  _isSkillSetsLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.SKILL_SETS_TIMESTAMP_KEY);
      const skillSets = localStorage.getItem(this.SKILL_SETS_CACHE_KEY);

      if (!timestamp || !skillSets) {
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
        this.SKILL_SET_SELECT_OPTIONS_TIMESTAMP_KEY,
      );
      const selectOptions = localStorage.getItem(
        this.SKILL_SET_SELECT_OPTIONS_CACHE_KEY,
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

  _clearSkillSetsLocalStorageCache() {
    localStorage.removeItem(this.SKILL_SETS_CACHE_KEY);
    localStorage.removeItem(this.SKILL_SETS_TIMESTAMP_KEY);
  }

  _clearSelectOptionsLocalStorageCache() {
    localStorage.removeItem(this.SKILL_SET_SELECT_OPTIONS_CACHE_KEY);
    localStorage.removeItem(this.SKILL_SET_SELECT_OPTIONS_TIMESTAMP_KEY);
  }
}
