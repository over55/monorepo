// File Path: monorepo/web/workery-frontend/src/services/Manager/DashboardManager.js

/**
 * DashboardManager handles dashboard-related business logic
 * Manages dashboard data fetching, caching, and state management
 */
export class DashboardManager {
  constructor(dashboardAPI) {
    this.dashboardAPI = dashboardAPI;
    this.dashboardCache = {
      data: null,
      timestamp: null,
      isLoading: false,
    };
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  }

  /**
   * Gets dashboard data with automatic caching
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Dashboard data
   */
  async getDashboard(onUnauthorizedCallback = null, forceRefresh = false) {
    try {
      // Check cache first (unless force refresh is requested)
      if (!forceRefresh && this._isCacheValid()) {
        console.log("DashboardManager: Using cached dashboard data");
        return this.dashboardCache.data;
      }

      // Prevent multiple simultaneous requests
      if (this.dashboardCache.isLoading) {
        console.log("DashboardManager: Dashboard request already in progress");
        // Wait for the current request to complete
        return this._waitForCurrentRequest();
      }

      this.dashboardCache.isLoading = true;

      console.log("DashboardManager: Fetching fresh dashboard data");

      // Fetch fresh data from API
      const dashboardData = await this.dashboardAPI.getDashboard(
        onUnauthorizedCallback,
      );

      // Update cache
      this.dashboardCache = {
        data: dashboardData,
        timestamp: Date.now(),
        isLoading: false,
      };

      console.log(
        "DashboardManager: Dashboard data fetched successfully:",
        dashboardData,
      );

      return dashboardData;
    } catch (error) {
      this.dashboardCache.isLoading = false;
      console.error("DashboardManager: Failed to get dashboard", error);
      throw error;
    }
  }

  /**
   * Callback-based version of getDashboard for compatibility with legacy code
   * @param {Function} onSuccessCallback
   * @param {Function} onErrorCallback
   * @param {Function} onDoneCallback
   * @param {Function} onUnauthorizedCallback
   * @param {boolean} forceRefresh
   */
  getDashboardWithCallbacks(
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getDashboard(onUnauthorizedCallback, forceRefresh)
      .then((data) => {
        if (onSuccessCallback) {
          onSuccessCallback(data);
        }
      })
      .catch((error) => {
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      })
      .finally(() => {
        if (onDoneCallback) {
          onDoneCallback();
        }
      });
  }

  /**
   * Clears the dashboard cache
   */
  clearCache() {
    this.dashboardCache = {
      data: null,
      timestamp: null,
      isLoading: false,
    };
    console.log("DashboardManager: Cache cleared");
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getCacheInfo() {
    return {
      hasCachedData: !!this.dashboardCache.data,
      cacheAge: this.dashboardCache.timestamp
        ? Date.now() - this.dashboardCache.timestamp
        : null,
      isLoading: this.dashboardCache.isLoading,
      isValid: this._isCacheValid(),
      cacheDuration: this.CACHE_DURATION,
    };
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.CACHE_DURATION = durationMs;
    console.log(
      `DashboardManager: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Checks if cached data is still valid
   * @private
   * @returns {boolean}
   */
  _isCacheValid() {
    if (!this.dashboardCache.data || !this.dashboardCache.timestamp) {
      return false;
    }

    const age = Date.now() - this.dashboardCache.timestamp;
    return age < this.CACHE_DURATION;
  }

  /**
   * Waits for current request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.dashboardCache.isLoading) {
          clearInterval(checkInterval);
          if (this.dashboardCache.data) {
            resolve(this.dashboardCache.data);
          } else {
            reject(new Error("Dashboard request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Dashboard request timeout"));
      }, 30000);
    });
  }
}
