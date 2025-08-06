// File Path: monorepo/web/workery-frontend/src/services/Storage/TenantStorage.js

/**
 * TenantStorage handles all tenant-related data storage operations
 * Manages tenant caching, current tenant context, and tenant preferences
 */
export class TenantStorage {
  constructor() {
    this.TENANTS_CACHE_KEY = "WORKERY_TENANTS_CACHE";
    this.TENANTS_TIMESTAMP_KEY = "WORKERY_TENANTS_TIMESTAMP";
    this.CURRENT_TENANT_KEY = "WORKERY_CURRENT_TENANT";
    this.TENANT_PREFERENCES_KEY = "WORKERY_TENANT_PREFERENCES";
    this.DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for tenants list

    // In-memory cache for current session
    this.memoryCache = {
      tenants: null,
      timestamp: null,
      isLoading: false,
    };

    // Current tenant context
    this.currentTenantContext = {
      tenant: null,
      visitedAt: null,
      isActive: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("TenantStorage initialized");
    }
  }

  /**
   * Gets tenants list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached tenants data or null if not found/expired
   */
  getTenantsFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isMemoryCacheValid(maxAge)) {
      console.log("TenantStorage: Using memory cache for tenants list");
      return this.memoryCache.tenants;
    }

    // Check localStorage cache
    try {
      const cachedTenants = localStorage.getItem(this.TENANTS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(this.TENANTS_TIMESTAMP_KEY);

      if (cachedTenants && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const tenantsData = JSON.parse(cachedTenants);

          // Update memory cache with localStorage data
          this.memoryCache = {
            tenants: tenantsData,
            timestamp: timestamp,
            isLoading: false,
          };

          console.log(
            "TenantStorage: Using localStorage cache for tenants list",
          );
          return tenantsData;
        } else {
          console.log("TenantStorage: localStorage cache expired, clearing");
          this._clearLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "TenantStorage: Error reading tenants from localStorage",
        error,
      );
      this._clearLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves tenants list to cache (both memory and localStorage)
   * @param {Object} tenantsData - Tenants data to cache
   */
  saveTenantsToCache(tenantsData) {
    if (!tenantsData) {
      console.warn(
        "TenantStorage: Attempted to save null/undefined tenants data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache = {
      tenants: tenantsData,
      timestamp: timestamp,
      isLoading: false,
    };

    // Save to localStorage
    try {
      localStorage.setItem(this.TENANTS_CACHE_KEY, JSON.stringify(tenantsData));
      localStorage.setItem(this.TENANTS_TIMESTAMP_KEY, timestamp.toString());

      console.log("TenantStorage: Tenants list cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        count: tenantsData.results ? tenantsData.results.length : 0,
      });
    } catch (error) {
      console.error(
        "TenantStorage: Error saving tenants to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears tenants cache (memory and localStorage)
   */
  clearTenantsCache() {
    // Clear memory cache
    this.memoryCache = {
      tenants: null,
      timestamp: null,
      isLoading: false,
    };

    // Clear localStorage cache
    this._clearLocalStorageCache();

    console.log("TenantStorage: Tenants cache cleared");
  }

  /**
   * Sets loading state for tenants cache
   * @param {boolean} isLoading - Loading state
   */
  setTenantsCacheLoading(isLoading) {
    this.memoryCache.isLoading = isLoading;
  }

  /**
   * Gets loading state from tenants cache
   * @returns {boolean} - Current loading state
   */
  isTenantsCacheLoading() {
    return this.memoryCache.isLoading;
  }

  /**
   * Gets current tenant context
   * @returns {Object|null} - Current tenant data or null
   */
  getCurrentTenant() {
    // Check memory first
    if (
      this.currentTenantContext.tenant &&
      this.currentTenantContext.isActive
    ) {
      return {
        ...this.currentTenantContext.tenant,
        visitedAt: this.currentTenantContext.visitedAt,
        isActive: this.currentTenantContext.isActive,
      };
    }

    // Check localStorage
    try {
      const storedTenant = localStorage.getItem(this.CURRENT_TENANT_KEY);
      if (storedTenant) {
        const tenantData = JSON.parse(storedTenant);

        // Update memory context
        this.currentTenantContext = {
          tenant: tenantData.tenant,
          visitedAt: tenantData.visitedAt,
          isActive: tenantData.isActive,
        };

        return tenantData;
      }
    } catch (error) {
      console.error("TenantStorage: Error reading current tenant", error);
      this.clearCurrentTenant();
    }

    return null;
  }

  /**
   * Sets current tenant context
   * @param {Object} tenantData - Tenant data
   * @param {number} visitedAt - Timestamp when tenant was visited
   */
  setCurrentTenant(tenantData, visitedAt = Date.now()) {
    const tenantContext = {
      tenant: tenantData,
      visitedAt: visitedAt,
      isActive: true,
    };

    // Update memory context
    this.currentTenantContext = tenantContext;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.CURRENT_TENANT_KEY,
        JSON.stringify(tenantContext),
      );
      console.log("TenantStorage: Current tenant set", {
        id: tenantData.id,
        name: tenantData.name,
        visitedAt: new Date(visitedAt).toISOString(),
      });
    } catch (error) {
      console.error("TenantStorage: Error saving current tenant", error);
    }
  }

  /**
   * Clears current tenant context
   */
  clearCurrentTenant() {
    // Clear memory context
    this.currentTenantContext = {
      tenant: null,
      visitedAt: null,
      isActive: false,
    };

    // Clear localStorage
    localStorage.removeItem(this.CURRENT_TENANT_KEY);
    console.log("TenantStorage: Current tenant cleared");
  }

  /**
   * Checks if there's an active tenant visit
   * @returns {boolean} - True if there's an active tenant visit
   */
  hasActiveTenantVisit() {
    const currentTenant = this.getCurrentTenant();
    return !!(currentTenant && currentTenant.isActive);
  }

  /**
   * Gets tenant preferences for a specific tenant
   * @param {number} tenantId - Tenant ID
   * @returns {Object|null} - Tenant preferences or null
   */
  getTenantPreferences(tenantId) {
    try {
      const preferences = localStorage.getItem(
        `${this.TENANT_PREFERENCES_KEY}_${tenantId}`,
      );
      return preferences ? JSON.parse(preferences) : null;
    } catch (error) {
      console.error("TenantStorage: Error reading tenant preferences", error);
      return null;
    }
  }

  /**
   * Saves tenant preferences for a specific tenant
   * @param {number} tenantId - Tenant ID
   * @param {Object} preferences - Preferences object
   */
  saveTenantPreferences(tenantId, preferences) {
    try {
      localStorage.setItem(
        `${this.TENANT_PREFERENCES_KEY}_${tenantId}`,
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log(`TenantStorage: Preferences saved for tenant ${tenantId}`);
    } catch (error) {
      console.error("TenantStorage: Error saving tenant preferences", error);
    }
  }

  /**
   * Clears tenant preferences for a specific tenant
   * @param {number} tenantId - Tenant ID
   */
  clearTenantPreferences(tenantId) {
    localStorage.removeItem(`${this.TENANT_PREFERENCES_KEY}_${tenantId}`);
    console.log(`TenantStorage: Preferences cleared for tenant ${tenantId}`);
  }

  /**
   * Gets tenant filter settings
   * @returns {Object|null} - Filter settings or null
   */
  getTenantFilters() {
    try {
      const filters = localStorage.getItem("WORKERY_TENANT_FILTERS");
      if (filters) {
        const parsed = JSON.parse(filters);

        // Check if filters are not too old (24 hours)
        const age = Date.now() - parsed.timestamp;
        if (age < 24 * 60 * 60 * 1000) {
          return parsed.filters;
        } else {
          localStorage.removeItem("WORKERY_TENANT_FILTERS");
        }
      }
    } catch (error) {
      console.error("TenantStorage: Error reading tenant filters", error);
    }

    return null;
  }

  /**
   * Saves tenant filter settings
   * @param {Object} filters - Filter settings
   */
  saveTenantFilters(filters) {
    try {
      localStorage.setItem(
        "WORKERY_TENANT_FILTERS",
        JSON.stringify({
          filters: filters,
          timestamp: Date.now(),
        }),
      );
      console.log("TenantStorage: Tenant filters saved");
    } catch (error) {
      console.error("TenantStorage: Error saving tenant filters", error);
    }
  }

  /**
   * Clears tenant filter settings
   */
  clearTenantFilters() {
    localStorage.removeItem("WORKERY_TENANT_FILTERS");
    console.log("TenantStorage: Tenant filters cleared");
  }

  /**
   * Gets cache information for debugging
   * @returns {Object} - Cache state information
   */
  getTenantsCacheInfo() {
    const memoryValid = this._isMemoryCacheValid();
    const localStorageValid = this._isLocalStorageCacheValid();

    return {
      memoryCache: {
        hasData: !!this.memoryCache.tenants,
        timestamp: this.memoryCache.timestamp,
        age: this.memoryCache.timestamp
          ? Date.now() - this.memoryCache.timestamp
          : null,
        isValid: memoryValid,
        isLoading: this.memoryCache.isLoading,
      },
      localStorage: {
        hasData: !!localStorage.getItem(this.TENANTS_CACHE_KEY),
        timestamp: localStorage.getItem(this.TENANTS_TIMESTAMP_KEY),
        isValid: localStorageValid,
      },
      currentTenant: this.getCurrentTenant(),
      cacheDuration: this.DEFAULT_CACHE_DURATION,
    };
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `TenantStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Clears all tenant-related data from storage
   */
  clearAllTenantData() {
    this.clearTenantsCache();
    this.clearCurrentTenant();
    this.clearTenantFilters();

    // Clear all tenant preferences
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.TENANT_PREFERENCES_KEY)) {
        localStorage.removeItem(key);
      }
    });

    console.log("TenantStorage: All tenant data cleared");
  }

  /**
   * Checks if memory cache is valid
   * @private
   * @param {number} maxAge - Maximum age in milliseconds
   * @returns {boolean}
   */
  _isMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (!this.memoryCache.tenants || !this.memoryCache.timestamp) {
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
      const timestamp = localStorage.getItem(this.TENANTS_TIMESTAMP_KEY);
      const tenants = localStorage.getItem(this.TENANTS_CACHE_KEY);

      if (!timestamp || !tenants) {
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
    localStorage.removeItem(this.TENANTS_CACHE_KEY);
    localStorage.removeItem(this.TENANTS_TIMESTAMP_KEY);
  }
}
