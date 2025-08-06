// File Path: monorepo/web/workery-frontend/src/services/Manager/VersionManager.js

/**
 * VersionManager handles system version information
 * Focused on providing application and API version details
 */
export class VersionManager {
  constructor(versionAPI) {
    this.versionAPI = versionAPI;
  }

  /**
   * Gets version information from the API
   * @returns {Promise<Object>} - Version information
   */
  async getVersion() {
    try {
      const versionData = await this.versionAPI.getVersion();

      console.log(
        "VersionManager: Retrieved version information:",
        versionData,
      );
      return versionData;
    } catch (error) {
      console.error("VersionManager: Failed to get version", error);
      throw error;
    }
  }

  /**
   * Callback-based version of getVersion for compatibility
   * @param {Function} onSuccessCallback
   * @param {Function} onErrorCallback
   * @param {Function} onDoneCallback
   */
  getVersionWithCallbacks(onSuccessCallback, onErrorCallback, onDoneCallback) {
    this.getVersion()
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
   * Gets version information with caching
   * @param {number} cacheTimeMs - Cache duration in milliseconds (default: 5 minutes)
   * @returns {Promise<Object>} - Version information (cached or fresh)
   */
  async getVersionCached(cacheTimeMs = 5 * 60 * 1000) {
    const now = Date.now();
    const cacheKey = "version_cache";
    const timestampKey = "version_cache_timestamp";

    try {
      // Check if we have cached data
      const cachedData = localStorage.getItem(cacheKey);
      const cachedTimestamp = localStorage.getItem(timestampKey);

      if (cachedData && cachedTimestamp) {
        const age = now - parseInt(cachedTimestamp);
        if (age < cacheTimeMs) {
          console.log("VersionManager: Using cached version data");
          return JSON.parse(cachedData);
        }
      }

      // Fetch fresh data
      const versionData = await this.getVersion();

      // Cache the data
      localStorage.setItem(cacheKey, JSON.stringify(versionData));
      localStorage.setItem(timestampKey, now.toString());

      return versionData;
    } catch (error) {
      // If we have stale cached data and the API fails, return the cached version
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        console.warn("VersionManager: API failed, using stale cached data");
        return JSON.parse(cachedData);
      }
      throw error;
    }
  }

  /**
   * Clears version cache
   */
  clearVersionCache() {
    localStorage.removeItem("version_cache");
    localStorage.removeItem("version_cache_timestamp");
    console.log("VersionManager: Cleared version cache");
  }

  /**
   * Gets version summary for display purposes
   * @returns {Promise<Object>} - Simplified version info
   */
  async getVersionSummary() {
    try {
      const versionData = await this.getVersion();

      // Extract key information for display
      return {
        version: versionData.version || "Unknown",
        buildDate: versionData.buildDate || versionData.build_date || "Unknown",
        environment: versionData.environment || "Unknown",
        apiVersion:
          versionData.apiVersion || versionData.api_version || "Unknown",
      };
    } catch (error) {
      console.error("VersionManager: Failed to get version summary", error);
      throw error;
    }
  }
}
