// File Path: monorepo/web/workery-frontend/src/services/Storage/DashboardStorage.js

/**
 * DashboardStorage handles all dashboard-related data storage operations
 * Manages dashboard caching, local storage, and data persistence
 */
export class DashboardStorage {
  constructor() {
    this.DASHBOARD_CACHE_KEY = "WORKERY_DASHBOARD_CACHE";
    this.DASHBOARD_TIMESTAMP_KEY = "WORKERY_DASHBOARD_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

    // In-memory cache for current session
    this.memoryCache = {
      dashboard: null,
      timestamp: null,
      isLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("DashboardStorage initialized");
    }
  }

  /**
   * Gets dashboard data from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached dashboard data or null if not found/expired
   */
  getDashboardFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isMemoryCacheValid(maxAge)) {
      console.log("DashboardStorage: Using memory cache for dashboard");
      return this.memoryCache.dashboard;
    }

    // Check localStorage cache
    try {
      const cachedDashboard = localStorage.getItem(this.DASHBOARD_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(
        this.DASHBOARD_TIMESTAMP_KEY,
      );

      if (cachedDashboard && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const dashboardData = JSON.parse(cachedDashboard);

          // Update memory cache with localStorage data
          this.memoryCache = {
            dashboard: dashboardData,
            timestamp: timestamp,
            isLoading: false,
          };

          console.log(
            "DashboardStorage: Using localStorage cache for dashboard",
          );
          return dashboardData;
        } else {
          console.log("DashboardStorage: localStorage cache expired, clearing");
          this._clearLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "DashboardStorage: Error reading dashboard from localStorage",
        error,
      );
      this._clearLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves dashboard data to cache (both memory and localStorage)
   * @param {Object} dashboardData - Dashboard data to cache
   */
  saveDashboardToCache(dashboardData) {
    if (!dashboardData) {
      console.warn(
        "DashboardStorage: Attempted to save null/undefined dashboard data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache = {
      dashboard: dashboardData,
      timestamp: timestamp,
      isLoading: false,
    };

    // Save to localStorage
    try {
      localStorage.setItem(
        this.DASHBOARD_CACHE_KEY,
        JSON.stringify(dashboardData),
      );
      localStorage.setItem(this.DASHBOARD_TIMESTAMP_KEY, timestamp.toString());

      console.log("DashboardStorage: Dashboard data cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        dataKeys: Object.keys(dashboardData),
      });
    } catch (error) {
      console.error(
        "DashboardStorage: Error saving dashboard to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears all dashboard cache (memory and localStorage)
   */
  clearDashboardCache() {
    // Clear memory cache
    this.memoryCache = {
      dashboard: null,
      timestamp: null,
      isLoading: false,
    };

    // Clear localStorage cache
    this._clearLocalStorageCache();

    console.log("DashboardStorage: All dashboard cache cleared");
  }

  /**
   * Checks if dashboard cache is valid
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {boolean} - True if cache is valid
   */
  isDashboardCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    return (
      this._isMemoryCacheValid(maxAge) || this._isLocalStorageCacheValid(maxAge)
    );
  }

  /**
   * Gets cache information for debugging
   * @returns {Object} - Cache state information
   */
  getDashboardCacheInfo() {
    const memoryValid = this._isMemoryCacheValid();
    const localStorageValid = this._isLocalStorageCacheValid();

    return {
      memoryCache: {
        hasData: !!this.memoryCache.dashboard,
        timestamp: this.memoryCache.timestamp,
        age: this.memoryCache.timestamp
          ? Date.now() - this.memoryCache.timestamp
          : null,
        isValid: memoryValid,
        isLoading: this.memoryCache.isLoading,
      },
      localStorage: {
        hasData: !!localStorage.getItem(this.DASHBOARD_CACHE_KEY),
        timestamp: localStorage.getItem(this.DASHBOARD_TIMESTAMP_KEY),
        isValid: localStorageValid,
      },
      cacheDuration: this.DEFAULT_CACHE_DURATION,
    };
  }

  /**
   * Sets loading state for cache
   * @param {boolean} isLoading - Loading state
   */
  setDashboardCacheLoading(isLoading) {
    this.memoryCache.isLoading = isLoading;
  }

  /**
   * Gets loading state from cache
   * @returns {boolean} - Current loading state
   */
  isDashboardCacheLoading() {
    return this.memoryCache.isLoading;
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `DashboardStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves dashboard widgets configuration
   * @param {Object} widgetsConfig - Widget configuration object
   */
  saveDashboardWidgetsConfig(widgetsConfig) {
    try {
      localStorage.setItem(
        "WORKERY_DASHBOARD_WIDGETS_CONFIG",
        JSON.stringify(widgetsConfig),
      );
      console.log("DashboardStorage: Dashboard widgets configuration saved");
    } catch (error) {
      console.error(
        "DashboardStorage: Error saving dashboard widgets config",
        error,
      );
    }
  }

  /**
   * Gets dashboard widgets configuration
   * @returns {Object|null} - Widget configuration or null if not found
   */
  getDashboardWidgetsConfig() {
    try {
      const config = localStorage.getItem("WORKERY_DASHBOARD_WIDGETS_CONFIG");
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.error(
        "DashboardStorage: Error reading dashboard widgets config",
        error,
      );
      return null;
    }
  }

  /**
   * Clears dashboard widgets configuration
   */
  clearDashboardWidgetsConfig() {
    localStorage.removeItem("WORKERY_DASHBOARD_WIDGETS_CONFIG");
    console.log("DashboardStorage: Dashboard widgets configuration cleared");
  }

  /**
   * Saves dashboard filters/preferences
   * @param {Object} filters - Dashboard filters object
   */
  saveDashboardFilters(filters) {
    try {
      localStorage.setItem(
        "WORKERY_DASHBOARD_FILTERS",
        JSON.stringify({
          filters: filters,
          timestamp: Date.now(),
        }),
      );
      console.log("DashboardStorage: Dashboard filters saved");
    } catch (error) {
      console.error("DashboardStorage: Error saving dashboard filters", error);
    }
  }

  /**
   * Gets dashboard filters/preferences
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Dashboard filters or null if not found/expired
   */
  getDashboardFilters(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const stored = localStorage.getItem("WORKERY_DASHBOARD_FILTERS");

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.filters;
        } else {
          // Clean up expired filters
          localStorage.removeItem("WORKERY_DASHBOARD_FILTERS");
        }
      }
    } catch (error) {
      console.error("DashboardStorage: Error reading dashboard filters", error);
    }

    return null;
  }

  /**
   * Clears dashboard filters
   */
  clearDashboardFilters() {
    localStorage.removeItem("WORKERY_DASHBOARD_FILTERS");
    console.log("DashboardStorage: Dashboard filters cleared");
  }

  /**
   * Clears all dashboard-related data from storage
   */
  clearAllDashboardData() {
    this.clearDashboardCache();
    this.clearDashboardWidgetsConfig();
    this.clearDashboardFilters();

    console.log("DashboardStorage: All dashboard data cleared");
  }

  /**
   * Checks if memory cache is valid
   * @private
   * @param {number} maxAge - Maximum age in milliseconds
   * @returns {boolean}
   */
  _isMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (!this.memoryCache.dashboard || !this.memoryCache.timestamp) {
      return false;
    }

    const age = Date.now() - this.memoryCache.timestamp;
    return age < maxAge;
  }

  /**
   * Checks if localStorage cache is valid
   * @private
   * @param {number} maxAge - Maximum age in milliseconds
   * @returns {boolean}
   */
  _isLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.DASHBOARD_TIMESTAMP_KEY);
      const dashboard = localStorage.getItem(this.DASHBOARD_CACHE_KEY);

      if (!timestamp || !dashboard) {
        return false;
      }

      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clears localStorage cache only
   * @private
   */
  _clearLocalStorageCache() {
    localStorage.removeItem(this.DASHBOARD_CACHE_KEY);
    localStorage.removeItem(this.DASHBOARD_TIMESTAMP_KEY);
  }
}
