// File Path: monorepo/web/workery-frontend/src/services/Storage/VehicleTypeStorage.js

/**
 * VehicleTypeStorage handles all vehicle type-related data storage operations
 * Manages vehicle type caching, local storage, and data persistence
 */
export class VehicleTypeStorage {
  constructor() {
    this.VEHICLE_TYPES_CACHE_KEY = "WORKERY_VEHICLE_TYPES_CACHE";
    this.VEHICLE_TYPES_TIMESTAMP_KEY = "WORKERY_VEHICLE_TYPES_TIMESTAMP";
    this.VEHICLE_TYPE_SELECT_OPTIONS_CACHE_KEY =
      "WORKERY_VEHICLE_TYPE_SELECT_OPTIONS_CACHE";
    this.VEHICLE_TYPE_SELECT_OPTIONS_TIMESTAMP_KEY =
      "WORKERY_VEHICLE_TYPE_SELECT_OPTIONS_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
    this.SELECT_OPTIONS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for select options

    // In-memory cache for current session
    this.memoryCache = {
      vehicleTypes: null,
      vehicleTypesTimestamp: null,
      isVehicleTypesLoading: false,
      selectOptions: null,
      selectOptionsTimestamp: null,
      isSelectOptionsLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("VehicleTypeStorage initialized");
    }
  }

  /**
   * Gets vehicle types list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached vehicle types data or null if not found/expired
   */
  getVehicleTypesFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isVehicleTypesMemoryCacheValid(maxAge)) {
      console.log(
        "VehicleTypeStorage: Using memory cache for vehicle types list",
      );
      return this.memoryCache.vehicleTypes;
    }

    // Check localStorage cache
    try {
      const cachedVehicleTypes = localStorage.getItem(
        this.VEHICLE_TYPES_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.VEHICLE_TYPES_TIMESTAMP_KEY,
      );

      if (cachedVehicleTypes && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const vehicleTypesData = JSON.parse(cachedVehicleTypes);

          // Update memory cache with localStorage data
          this.memoryCache.vehicleTypes = vehicleTypesData;
          this.memoryCache.vehicleTypesTimestamp = timestamp;
          this.memoryCache.isVehicleTypesLoading = false;

          console.log(
            "VehicleTypeStorage: Using localStorage cache for vehicle types list",
          );
          return vehicleTypesData;
        } else {
          console.log(
            "VehicleTypeStorage: localStorage cache expired, clearing",
          );
          this._clearVehicleTypesLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "VehicleTypeStorage: Error reading vehicle types from localStorage",
        error,
      );
      this._clearVehicleTypesLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves vehicle types list to cache (both memory and localStorage)
   * @param {Object} vehicleTypesData - Vehicle types data to cache
   */
  saveVehicleTypesToCache(vehicleTypesData) {
    if (!vehicleTypesData) {
      console.warn(
        "VehicleTypeStorage: Attempted to save null/undefined vehicle types data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.vehicleTypes = vehicleTypesData;
    this.memoryCache.vehicleTypesTimestamp = timestamp;
    this.memoryCache.isVehicleTypesLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.VEHICLE_TYPES_CACHE_KEY,
        JSON.stringify(vehicleTypesData),
      );
      localStorage.setItem(
        this.VEHICLE_TYPES_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log(
        "VehicleTypeStorage: Vehicle types list cached successfully",
        {
          timestamp: new Date(timestamp).toISOString(),
          count: vehicleTypesData.results ? vehicleTypesData.results.length : 0,
        },
      );
    } catch (error) {
      console.error(
        "VehicleTypeStorage: Error saving vehicle types to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets vehicle type select options from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached select options data or null if not found/expired
   */
  getSelectOptionsFromCache(maxAge = this.SELECT_OPTIONS_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isSelectOptionsMemoryCacheValid(maxAge)) {
      console.log("VehicleTypeStorage: Using memory cache for select options");
      return this.memoryCache.selectOptions;
    }

    // Check localStorage cache
    try {
      const cachedSelectOptions = localStorage.getItem(
        this.VEHICLE_TYPE_SELECT_OPTIONS_CACHE_KEY,
      );
      const cachedTimestamp = localStorage.getItem(
        this.VEHICLE_TYPE_SELECT_OPTIONS_TIMESTAMP_KEY,
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
            "VehicleTypeStorage: Using localStorage cache for select options",
          );
          return selectOptionsData;
        } else {
          console.log(
            "VehicleTypeStorage: Select options cache expired, clearing",
          );
          this._clearSelectOptionsLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "VehicleTypeStorage: Error reading select options from localStorage",
        error,
      );
      this._clearSelectOptionsLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves vehicle type select options to cache (both memory and localStorage)
   * @param {Object} selectOptionsData - Select options data to cache
   */
  saveSelectOptionsToCache(selectOptionsData) {
    if (!selectOptionsData) {
      console.warn(
        "VehicleTypeStorage: Attempted to save null/undefined select options data",
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
        this.VEHICLE_TYPE_SELECT_OPTIONS_CACHE_KEY,
        JSON.stringify(selectOptionsData),
      );
      localStorage.setItem(
        this.VEHICLE_TYPE_SELECT_OPTIONS_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("VehicleTypeStorage: Select options cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        optionsCount: Array.isArray(selectOptionsData)
          ? selectOptionsData.length
          : "N/A",
      });
    } catch (error) {
      console.error(
        "VehicleTypeStorage: Error saving select options to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears vehicle types cache (memory and localStorage)
   */
  clearVehicleTypesCache() {
    // Clear memory cache
    this.memoryCache.vehicleTypes = null;
    this.memoryCache.vehicleTypesTimestamp = null;
    this.memoryCache.isVehicleTypesLoading = false;

    // Clear localStorage cache
    this._clearVehicleTypesLocalStorageCache();

    console.log("VehicleTypeStorage: Vehicle types cache cleared");
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

    console.log("VehicleTypeStorage: Select options cache cleared");
  }

  /**
   * Clears all vehicle type caches
   */
  clearAllCache() {
    this.clearVehicleTypesCache();
    this.clearSelectOptionsCache();
    console.log("VehicleTypeStorage: All caches cleared");
  }

  /**
   * Sets loading state for vehicle types cache
   * @param {boolean} isLoading - Loading state
   */
  setVehicleTypesCacheLoading(isLoading) {
    this.memoryCache.isVehicleTypesLoading = isLoading;
  }

  /**
   * Gets loading state from vehicle types cache
   * @returns {boolean} - Current loading state
   */
  isVehicleTypesCacheLoading() {
    return this.memoryCache.isVehicleTypesLoading;
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
  getVehicleTypesCacheInfo() {
    const vehicleTypesMemoryValid = this._isVehicleTypesMemoryCacheValid();
    const vehicleTypesLocalStorageValid =
      this._isVehicleTypesLocalStorageCacheValid();
    const selectOptionsMemoryValid = this._isSelectOptionsMemoryCacheValid();
    const selectOptionsLocalStorageValid =
      this._isSelectOptionsLocalStorageCacheValid();

    return {
      vehicleTypes: {
        memoryCache: {
          hasData: !!this.memoryCache.vehicleTypes,
          timestamp: this.memoryCache.vehicleTypesTimestamp,
          age: this.memoryCache.vehicleTypesTimestamp
            ? Date.now() - this.memoryCache.vehicleTypesTimestamp
            : null,
          isValid: vehicleTypesMemoryValid,
          isLoading: this.memoryCache.isVehicleTypesLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.VEHICLE_TYPES_CACHE_KEY),
          timestamp: localStorage.getItem(this.VEHICLE_TYPES_TIMESTAMP_KEY),
          isValid: vehicleTypesLocalStorageValid,
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
            this.VEHICLE_TYPE_SELECT_OPTIONS_CACHE_KEY,
          ),
          timestamp: localStorage.getItem(
            this.VEHICLE_TYPE_SELECT_OPTIONS_TIMESTAMP_KEY,
          ),
          isValid: selectOptionsLocalStorageValid,
        },
        cacheDuration: this.SELECT_OPTIONS_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for vehicle types
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `VehicleTypeStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for select options
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.SELECT_OPTIONS_CACHE_DURATION = durationMs;
    console.log(
      `VehicleTypeStorage: Select options cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves vehicle type preferences to localStorage
   * @param {Object} preferences - Vehicle type preferences object
   */
  saveVehicleTypePreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_VEHICLE_TYPE_PREFERENCES",
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("VehicleTypeStorage: Vehicle type preferences saved");
    } catch (error) {
      console.error(
        "VehicleTypeStorage: Error saving vehicle type preferences",
        error,
      );
    }
  }

  /**
   * Gets vehicle type preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Vehicle type preferences or null if not found/expired
   */
  getVehicleTypePreferences(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_VEHICLE_TYPE_PREFERENCES");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem("WORKERY_VEHICLE_TYPE_PREFERENCES");
        }
      }
    } catch (error) {
      console.error(
        "VehicleTypeStorage: Error reading vehicle type preferences",
        error,
      );
    }

    return null;
  }

  /**
   * Clears vehicle type preferences
   */
  clearVehicleTypePreferences() {
    localStorage.removeItem("WORKERY_VEHICLE_TYPE_PREFERENCES");
    console.log("VehicleTypeStorage: Vehicle type preferences cleared");
  }

  /**
   * Clears all vehicle type-related data from storage
   */
  clearAllVehicleTypeData() {
    this.clearAllCache();
    this.clearVehicleTypePreferences();

    console.log("VehicleTypeStorage: All vehicle type data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isVehicleTypesMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (
      !this.memoryCache.vehicleTypes ||
      !this.memoryCache.vehicleTypesTimestamp
    ) {
      return false;
    }
    const age = Date.now() - this.memoryCache.vehicleTypesTimestamp;
    return age < maxAge;
  }

  _isVehicleTypesLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.VEHICLE_TYPES_TIMESTAMP_KEY);
      const vehicleTypes = localStorage.getItem(this.VEHICLE_TYPES_CACHE_KEY);

      if (!timestamp || !vehicleTypes) {
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
        this.VEHICLE_TYPE_SELECT_OPTIONS_TIMESTAMP_KEY,
      );
      const selectOptions = localStorage.getItem(
        this.VEHICLE_TYPE_SELECT_OPTIONS_CACHE_KEY,
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

  _clearVehicleTypesLocalStorageCache() {
    localStorage.removeItem(this.VEHICLE_TYPES_CACHE_KEY);
    localStorage.removeItem(this.VEHICLE_TYPES_TIMESTAMP_KEY);
  }

  _clearSelectOptionsLocalStorageCache() {
    localStorage.removeItem(this.VEHICLE_TYPE_SELECT_OPTIONS_CACHE_KEY);
    localStorage.removeItem(this.VEHICLE_TYPE_SELECT_OPTIONS_TIMESTAMP_KEY);
  }
}
