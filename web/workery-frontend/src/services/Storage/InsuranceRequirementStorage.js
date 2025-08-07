// File Path: monorepo/web/workery-frontend/src/services/Storage/InsuranceRequirementStorage.js

/**
 * InsuranceRequirementStorage handles all insurance requirement-related data storage operations
 * Manages insurance requirement caching, local storage, and data persistence
 */
export class InsuranceRequirementStorage {
  constructor() {
    this.INSURANCE_REQUIREMENTS_CACHE_KEY =
      "WORKERY_INSURANCE_REQUIREMENTS_CACHE";
    this.INSURANCE_REQUIREMENTS_TIMESTAMP_KEY =
      "WORKERY_INSURANCE_REQUIREMENTS_TIMESTAMP";
    this.INSURANCE_REQUIREMENT_SELECT_OPTIONS_CACHE_KEY =
      "WORKERY_INSURANCE_REQUIREMENT_SELECT_OPTIONS_CACHE";
    this.INSURANCE_REQUIREMENT_SELECT_OPTIONS_TIMESTAMP_KEY =
      "WORKERY_INSURANCE_REQUIREMENT_SELECT_OPTIONS_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
    this.SELECT_OPTIONS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for select options

    // In-memory cache for current session
    this.memoryCache = {
      insuranceRequirements: null,
      insuranceRequirementsTimestamp: null,
      isInsuranceRequirementsLoading: false,
      selectOptions: null,
      selectOptionsTimestamp: null,
      isSelectOptionsLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("InsuranceRequirementStorage initialized");
    }
  }

  /**
   * Gets insurance requirements list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached insurance requirements data or null if not found/expired
   */
  getInsuranceRequirementsFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isInsuranceRequirementsMemoryCacheValid(maxAge)) {
      console.log(
        "InsuranceRequirementStorage: Using memory cache for insurance requirements list",
      );
      return this.memoryCache.insuranceRequirements;
    }

    // Check localStorage cache
    try {
      const cachedInsuranceRequirements = localStorage.getItem(
        this.INSURANCE_REQUIREMENTS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.INSURANCE_REQUIREMENTS_TIMESTAMP_KEY,
      );

      if (cachedInsuranceRequirements && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const insuranceRequirementsData = JSON.parse(
            cachedInsuranceRequirements,
          );

          // Update memory cache with localStorage data
          this.memoryCache.insuranceRequirements = insuranceRequirementsData;
          this.memoryCache.insuranceRequirementsTimestamp = timestamp;
          this.memoryCache.isInsuranceRequirementsLoading = false;

          console.log(
            "InsuranceRequirementStorage: Using localStorage cache for insurance requirements list",
          );
          return insuranceRequirementsData;
        } else {
          console.log(
            "InsuranceRequirementStorage: localStorage cache expired, clearing",
          );
          this._clearInsuranceRequirementsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "InsuranceRequirementStorage: Error reading insurance requirements from localStorage",
        error,
      );
      this._clearInsuranceRequirementsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves insurance requirements list to cache (both memory and localStorage)
   * @param {Object} insuranceRequirementsData - Insurance requirements data to cache
   */
  saveInsuranceRequirementsToCache(insuranceRequirementsData) {
    if (!insuranceRequirementsData) {
      console.warn(
        "InsuranceRequirementStorage: Attempted to save null/undefined insurance requirements data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.insuranceRequirements = insuranceRequirementsData;
    this.memoryCache.insuranceRequirementsTimestamp = timestamp;
    this.memoryCache.isInsuranceRequirementsLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.INSURANCE_REQUIREMENTS_CACHE_KEY,
        JSON.stringify(insuranceRequirementsData),
      );
      localStorage.setItem(
        this.INSURANCE_REQUIREMENTS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log(
        "InsuranceRequirementStorage: Insurance requirements list cached successfully",
        {
          timestamp: new Date(timestamp).toISOString(),
          count: insuranceRequirementsData.results
            ? insuranceRequirementsData.results.length
            : 0,
        },
      );
    } catch (error) {
      console.error(
        "InsuranceRequirementStorage: Error saving insurance requirements to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets insurance requirement select options from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached select options data or null if not found/expired
   */
  getSelectOptionsFromCache(maxAge = this.SELECT_OPTIONS_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isSelectOptionsMemoryCacheValid(maxAge)) {
      console.log(
        "InsuranceRequirementStorage: Using memory cache for select options",
      );
      return this.memoryCache.selectOptions;
    }

    // Check localStorage cache
    try {
      const cachedSelectOptions = localStorage.getItem(
        this.INSURANCE_REQUIREMENT_SELECT_OPTIONS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.INSURANCE_REQUIREMENT_SELECT_OPTIONS_TIMESTAMP_KEY,
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
            "InsuranceRequirementStorage: Using localStorage cache for select options",
          );
          return selectOptionsData;
        } else {
          console.log(
            "InsuranceRequirementStorage: Select options cache expired, clearing",
          );
          this._clearSelectOptionsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "InsuranceRequirementStorage: Error reading select options from localStorage",
        error,
      );
      this._clearSelectOptionsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves insurance requirement select options to cache (both memory and localStorage)
   * @param {Object} selectOptionsData - Select options data to cache
   */
  saveSelectOptionsToCache(selectOptionsData) {
    if (!selectOptionsData) {
      console.warn(
        "InsuranceRequirementStorage: Attempted to save null/undefined select options data",
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
        this.INSURANCE_REQUIREMENT_SELECT_OPTIONS_CACHE_KEY,
        JSON.stringify(selectOptionsData),
      );
      localStorage.setItem(
        this.INSURANCE_REQUIREMENT_SELECT_OPTIONS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log(
        "InsuranceRequirementStorage: Select options cached successfully",
        {
          timestamp: new Date(timestamp).toISOString(),
          optionsCount: Array.isArray(selectOptionsData)
            ? selectOptionsData.length
            : "N/A",
        },
      );
    } catch (error) {
      console.error(
        "InsuranceRequirementStorage: Error saving select options to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears insurance requirements cache (memory and localStorage)
   */
  clearInsuranceRequirementsCache() {
    // Clear memory cache
    this.memoryCache.insuranceRequirements = null;
    this.memoryCache.insuranceRequirementsTimestamp = null;
    this.memoryCache.isInsuranceRequirementsLoading = false;

    // Clear localStorage cache
    this._clearInsuranceRequirementsLocalStorageCache();

    console.log(
      "InsuranceRequirementStorage: Insurance requirements cache cleared",
    );
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

    console.log("InsuranceRequirementStorage: Select options cache cleared");
  }

  /**
   * Clears all insurance requirement caches
   */
  clearAllCache() {
    this.clearInsuranceRequirementsCache();
    this.clearSelectOptionsCache();
    console.log("InsuranceRequirementStorage: All caches cleared");
  }

  /**
   * Sets loading state for insurance requirements cache
   * @param {boolean} isLoading - Loading state
   */
  setInsuranceRequirementsCacheLoading(isLoading) {
    this.memoryCache.isInsuranceRequirementsLoading = isLoading;
  }

  /**
   * Gets loading state from insurance requirements cache
   * @returns {boolean} - Current loading state
   */
  isInsuranceRequirementsCacheLoading() {
    return this.memoryCache.isInsuranceRequirementsLoading;
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
  getInsuranceRequirementsCacheInfo() {
    const insuranceRequirementsMemoryValid =
      this._isInsuranceRequirementsMemoryCacheValid();
    const insuranceRequirementsLocalStorageValid =
      this._isInsuranceRequirementsLocalStorageCacheValid();
    const selectOptionsMemoryValid = this._isSelectOptionsMemoryCacheValid();
    const selectOptionsLocalStorageValid =
      this._isSelectOptionsLocalStorageCacheValid();

    return {
      insuranceRequirements: {
        memoryCache: {
          hasData: !!this.memoryCache.insuranceRequirements,
          timestamp: this.memoryCache.insuranceRequirementsTimestamp,
          age: this.memoryCache.insuranceRequirementsTimestamp
            ? Date.now() - this.memoryCache.insuranceRequirementsTimestamp
            : null,
          isValid: insuranceRequirementsMemoryValid,
          isLoading: this.memoryCache.isInsuranceRequirementsLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(
            this.INSURANCE_REQUIREMENTS_CACHE_KEY,
          ),
          timestamp: localStorage.getItem(
            this.INSURANCE_REQUIREMENTS_TIMESTAMP_KEY,
          ),
          isValid: insuranceRequirementsLocalStorageValid,
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
            this.INSURANCE_REQUIREMENT_SELECT_OPTIONS_CACHE_KEY,
          ),
          timestamp: localStorage.getItem(
            this.INSURANCE_REQUIREMENT_SELECT_OPTIONS_TIMESTAMP_KEY,
          ),
          isValid: selectOptionsLocalStorageValid,
        },
        cacheDuration: this.SELECT_OPTIONS_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for insurance requirements
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `InsuranceRequirementStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for select options
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.SELECT_OPTIONS_CACHE_DURATION = durationMs;
    console.log(
      `InsuranceRequirementStorage: Select options cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves insurance requirement preferences to localStorage
   * @param {Object} preferences - Insurance requirement preferences object
   */
  saveInsuranceRequirementPreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_INSURANCE_REQUIREMENT_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log(
        "InsuranceRequirementStorage: Insurance requirement preferences saved",
      );
    } catch (error) {
      console.error(
        "InsuranceRequirementStorage: Error saving insurance requirement preferences",
        error,
      );
    }
  }

  /**
   * Gets insurance requirement preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Insurance requirement preferences or null if not found/expired
   */
  getInsuranceRequirementPreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem(
        "WORKERY_INSURANCE_REQUIREMENT_PREFERENCES",
      );

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_INSURANCE_REQUIREMENT_PREFERENCES");
        }
      }
    } catch (error) {
      console.error(
        "InsuranceRequirementStorage: Error reading insurance requirement preferences",
        error,
      );
    }

    return null;
  }

  /**
   * Clears insurance requirement preferences
   */
  clearInsuranceRequirementPreferences() {
    localStorage.removeItem("WORKERY_INSURANCE_REQUIREMENT_PREFERENCES");
    console.log(
      "InsuranceRequirementStorage: Insurance requirement preferences cleared",
    );
  }

  /**
   * Clears all insurance requirement-related data from storage
   */
  clearAllInsuranceRequirementData() {
    this.clearAllCache();
    this.clearInsuranceRequirementPreferences();

    console.log(
      "InsuranceRequirementStorage: All insurance requirement data cleared",
    );
  }

  /**
   * Private helper methods for cache validation
   */

  _isInsuranceRequirementsMemoryCacheValid(
    maxAge = this.DEFAULT_CACHE_DURATION,
  ) {
    if (
      !this.memoryCache.insuranceRequirements ||
      !this.memoryCache.insuranceRequirementsTimestamp
    ) {
      return false;
    }
    const age = Date.now() - this.memoryCache.insuranceRequirementsTimestamp;
    return age < maxAge;
  }

  _isInsuranceRequirementsLocalStorageCacheValid(
    maxAge = this.DEFAULT_CACHE_DURATION,
  ) {
    try {
      const timestamp = localStorage.getItem(
        this.INSURANCE_REQUIREMENTS_TIMESTAMP_KEY,
      );
      const insuranceRequirements = localStorage.getItem(
        this.INSURANCE_REQUIREMENTS_CACHE_KEY,
      );

      if (!timestamp || !insuranceRequirements) {
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
        this.INSURANCE_REQUIREMENT_SELECT_OPTIONS_TIMESTAMP_KEY,
      );
      const selectOptions = localStorage.getItem(
        this.INSURANCE_REQUIREMENT_SELECT_OPTIONS_CACHE_KEY,
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

  _clearInsuranceRequirementsLocalStorageCache() {
    localStorage.removeItem(this.INSURANCE_REQUIREMENTS_CACHE_KEY);
    localStorage.removeItem(this.INSURANCE_REQUIREMENTS_TIMESTAMP_KEY);
  }

  _clearSelectOptionsLocalStorageCache() {
    localStorage.removeItem(
      this.INSURANCE_REQUIREMENT_SELECT_OPTIONS_CACHE_KEY,
    );
    localStorage.removeItem(
      this.INSURANCE_REQUIREMENT_SELECT_OPTIONS_TIMESTAMP_KEY,
    );
  }
}
