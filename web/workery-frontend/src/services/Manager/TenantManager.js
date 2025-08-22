// File Path: monorepo/web/workery-frontend/src/services/Manager/TenantManager.js

/**
 * TenantManager handles all tenant-related business logic
 * Combines TenantAPI with TenantStorage for complete tenant management
 */
export class TenantManager {
  constructor(tenantAPI, tenantStorage) {
    this.tenantAPI = tenantAPI;
    this.tenantStorage = tenantStorage;
  }

  /**
   * Gets list of tenants with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder, status, type }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Tenants list with pagination data
   */
  async getTenants(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedTenants = this.tenantStorage.getTenantsFromCache();
        if (cachedTenants) {
          return cachedTenants;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.tenantStorage.isTenantsCacheLoading()) {
        console.log("TenantManager: Tenants request already in progress");
        return this._waitForCurrentTenantsRequest();
      }

      this.tenantStorage.setTenantsCacheLoading(true);

      console.log("TenantManager: Fetching fresh tenants data", params);

      try {
        // Validate and clean parameters
        const validatedParams = this._validateTenantsParams(params);

        // Fetch fresh data from API
        const tenantsData = await this.tenantAPI.getTenants(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.tenantStorage.saveTenantsToCache(tenantsData);

        console.log("TenantManager: Tenants data fetched successfully:", {
          count: tenantsData.results ? tenantsData.results.length : 0,
          totalCount: tenantsData.count,
        });

        return tenantsData;
      } finally {
        this.tenantStorage.setTenantsCacheLoading(false);
      }
    } catch (error) {
      this.tenantStorage.setTenantsCacheLoading(false);
      console.error("TenantManager: Failed to get tenants", error);
      throw error;
    }
  }

  /**
   * Gets details for a specific tenant
   * @param {number} tenantId - The ID of the tenant
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Tenant details
   */
  async getTenantDetail(tenantId, onUnauthorizedCallback = null) {
    try {
      // Validate tenant ID
      const validationError = this._validateTenantId(tenantId);
      if (validationError) {
        throw validationError;
      }

      console.log(`TenantManager: Fetching tenant detail for ID ${tenantId}`);

      // Call API to get tenant details
      const tenantData = await this.tenantAPI.getTenantDetail(
        tenantId,
        onUnauthorizedCallback,
      );

      console.log("TenantManager: Tenant detail fetched successfully:", {
        id: tenantData.id,
        name: tenantData.name,
      });

      return tenantData;
    } catch (error) {
      console.error("TenantManager: Failed to get tenant detail", error);
      throw error;
    }
  }

  /**
   * Updates a specific tenant
   * @param {number} tenantId - The ID of the tenant
   * @param {Object} tenantData - Tenant data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated tenant data
   */
  async updateTenant(tenantId, tenantData, onUnauthorizedCallback = null) {
    try {
      // Validate tenant ID
      const tenantIdError = this._validateTenantId(tenantId);
      if (tenantIdError) {
        throw tenantIdError;
      }

      // Validate tenant data
      const validationErrors = this._validateTenantData(tenantData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(`TenantManager: Updating tenant ID ${tenantId}`);

      // Call API to update tenant
      const updatedTenantData = await this.tenantAPI.updateTenant(
        tenantId,
        tenantData,
        onUnauthorizedCallback,
      );

      // Clear tenants cache since data has been updated
      this.tenantStorage.clearTenantsCache();

      console.log("TenantManager: Tenant updated successfully");

      return updatedTenantData;
    } catch (error) {
      console.error("TenantManager: Failed to update tenant", error);
      throw error;
    }
  }

  /**
   * Creates a new tenant
   * @param {Object} tenantData - Tenant data to create
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Created tenant data
   */
  async createTenant(tenantData, onUnauthorizedCallback = null) {
    try {
      // Validate tenant data
      const validationErrors = this._validateTenantData(tenantData, true);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("TenantManager: Creating new tenant");

      // Call API to create tenant
      const createdTenantData = await this.tenantAPI.createTenant(
        tenantData,
        onUnauthorizedCallback,
      );

      // Clear tenants cache since new data has been added
      this.tenantStorage.clearTenantsCache();

      console.log("TenantManager: Tenant created successfully:", {
        id: createdTenantData.id,
        name: createdTenantData.name,
      });

      return createdTenantData;
    } catch (error) {
      console.error("TenantManager: Failed to create tenant", error);
      throw error;
    }
  }

  /**
   * Archives/deactivates a tenant
   * @param {number} tenantId - The ID of the tenant to archive
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Archive response
   */
  async archiveTenant(tenantId, onUnauthorizedCallback = null) {
    try {
      // Validate tenant ID
      const validationError = this._validateTenantId(tenantId);
      if (validationError) {
        throw validationError;
      }

      console.log(`TenantManager: Archiving tenant ID ${tenantId}`);

      // Call API to archive tenant
      const archiveResponse = await this.tenantAPI.archiveTenant(
        tenantId,
        onUnauthorizedCallback,
      );

      // Clear tenants cache since data has been updated
      this.tenantStorage.clearTenantsCache();

      // If this was the current tenant, clear the context
      const currentTenant = this.tenantStorage.getCurrentTenant();
      if (currentTenant && currentTenant.id === tenantId) {
        this.tenantStorage.clearCurrentTenant();
      }

      console.log("TenantManager: Tenant archived successfully");

      return archiveResponse;
    } catch (error) {
      console.error("TenantManager: Failed to archive tenant", error);
      throw error;
    }
  }

  /**
   * Executive visits tenant - allows switching to a specific tenant context
   * @param {number} tenantID - The ID of the tenant to visit
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Tenant data and visit response
   */
  async executiveVisitsTenant(tenantID, onUnauthorizedCallback = null) {
    try {
      // Validate tenant ID
      if (!tenantID || typeof tenantID !== "string" || tenantID.trim() === "") {
        throw {
          tenantId: "Valid tenant ID is required",
        };
      }

      console.log(`TenantManager: Executive visiting tenant ${tenantID}`);

      // Call the API
      const visitResponse = await this.tenantAPI.executiveVisitsTenant(
        tenantID,
        onUnauthorizedCallback,
      );

      // Update current tenant context in storage
      this.tenantStorage.setCurrentTenant(visitResponse, Date.now());

      console.log("TenantManager: Executive visit successful:", visitResponse);

      return visitResponse;
    } catch (error) {
      console.error("TenantManager: Executive visit failed", error);
      throw error;
    }
  }

  /**
   * Updates tax rate for a tenant
   * @param {Object} taxRateData - Tax rate update data { tenantId, taxRate }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Tax rate update response
   */
  async updateTaxRate(taxRateData, onUnauthorizedCallback = null) {
    try {
      // Validate tax rate data
      const validationErrors = this._validateTaxRateData(taxRateData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("TenantManager: Updating tax rate", {
        tenantId: taxRateData.tenantId,
        taxRate: taxRateData.taxRate,
      });

      // Call API to update tax rate
      const updateResponse = await this.tenantAPI.updateTaxRate(
        taxRateData,
        onUnauthorizedCallback,
      );

      // Clear tenants cache since data has been updated
      this.tenantStorage.clearTenantsCache();

      console.log("TenantManager: Tax rate updated successfully");

      return updateResponse;
    } catch (error) {
      console.error("TenantManager: Failed to update tax rate", error);
      throw error;
    }
  }

  /**
   * Gets current tenant information from storage
   * @returns {Object|null} - Current tenant state or null
   */
  getCurrentTenant() {
    return this.tenantStorage.getCurrentTenant();
  }

  /**
   * Clears current tenant context
   */
  clearCurrentTenant() {
    this.tenantStorage.clearCurrentTenant();
  }

  /**
   * Checks if executive has visited a tenant
   * @returns {boolean}
   */
  hasActiveTenantVisit() {
    return this.tenantStorage.hasActiveTenantVisit();
  }

  /**
   * Gets tenant preferences
   * @param {number} tenantId - Tenant ID
   * @returns {Object|null} - Tenant preferences or null
   */
  getTenantPreferences(tenantId) {
    return this.tenantStorage.getTenantPreferences(tenantId);
  }

  /**
   * Saves tenant preferences
   * @param {number} tenantId - Tenant ID
   * @param {Object} preferences - Preferences object
   */
  saveTenantPreferences(tenantId, preferences) {
    this.tenantStorage.saveTenantPreferences(tenantId, preferences);
  }

  /**
   * Gets tenant filter settings
   * @returns {Object|null} - Filter settings or null
   */
  getTenantFilters() {
    return this.tenantStorage.getTenantFilters();
  }

  /**
   * Saves tenant filter settings
   * @param {Object} filters - Filter settings
   */
  saveTenantFilters(filters) {
    this.tenantStorage.saveTenantFilters(filters);
  }

  /**
   * Clears the tenants cache
   */
  clearTenantsCache() {
    this.tenantStorage.clearTenantsCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getTenantsCacheInfo() {
    return this.tenantStorage.getTenantsCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setTenantsCacheDuration(durationMs) {
    this.tenantStorage.setCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getTenantsWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getTenants(params, onUnauthorizedCallback, forceRefresh)
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

  getTenantDetailWithCallbacks(
    tenantId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getTenantDetail(tenantId, onUnauthorizedCallback)
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

  updateTenantWithCallbacks(
    tenantId,
    tenantData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateTenant(tenantId, tenantData, onUnauthorizedCallback)
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

  createTenantWithCallbacks(
    tenantData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createTenant(tenantData, onUnauthorizedCallback)
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

  archiveTenantWithCallbacks(
    tenantId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.archiveTenant(tenantId, onUnauthorizedCallback)
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

  executiveVisitsTenantWithCallbacks(
    tenantID,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.executiveVisitsTenant(tenantID, onUnauthorizedCallback)
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

  updateTaxRateWithCallbacks(
    taxRateData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateTaxRate(taxRateData, onUnauthorizedCallback)
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
   * Private validation methods
   */

  _validateTenantId(tenantId) {
    if (!tenantId || typeof tenantId !== "string" || tenantId.trim() === "") {
      return { tenantId: "Valid tenant ID is required" };
    }
    return null;
  }

  _validateTenantsParams(params) {
    const validatedParams = {};

    // Validate pagination
    if (params.page && typeof params.page === "number" && params.page > 0) {
      validatedParams.page = params.page;
    }

    if (
      params.limit &&
      typeof params.limit === "number" &&
      params.limit > 0 &&
      params.limit <= 1000
    ) {
      validatedParams.limit = params.limit;
    }

    // Validate search
    if (
      params.search &&
      typeof params.search === "string" &&
      params.search.trim()
    ) {
      validatedParams.search = params.search.trim();
    }

    // Validate sorting
    if (params.sortBy && typeof params.sortBy === "string") {
      const allowedSortFields = ["name", "created_at", "updated_at", "status"];
      if (allowedSortFields.includes(params.sortBy)) {
        validatedParams.sortBy = params.sortBy;

        if (params.sortOrder && ["ASC", "DESC"].includes(params.sortOrder)) {
          validatedParams.sortOrder = params.sortOrder;
        } else {
          validatedParams.sortOrder = "ASC";
        }
      }
    }

    // Validate filters
    if (params.status && typeof params.status === "string") {
      validatedParams.status = params.status;
    }

    if (params.type && typeof params.type === "string") {
      validatedParams.type = params.type;
    }

    return validatedParams;
  }

  _validateTenantData(tenantData, isCreate = false) {
    const errors = {};

    if (!tenantData || typeof tenantData !== "object") {
      errors.general = "Tenant data is required";
      return errors;
    }

    // Validate name (required)
    if (!tenantData.name || !tenantData.name.trim()) {
      errors.name = "Tenant name is required";
    } else if (tenantData.name.length > 100) {
      errors.name = "Tenant name must be less than 100 characters";
    }

    // Validate schema name (required for creation)
    if (isCreate) {
      if (!tenantData.schemaName || !tenantData.schemaName.trim()) {
        errors.schemaName = "Schema name is required";
      } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(tenantData.schemaName)) {
        errors.schemaName =
          "Schema name must start with a letter and contain only letters, numbers, and underscores";
      }
    }

    // Validate description (optional)
    if (tenantData.description && tenantData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    // Validate tax rate (optional)
    if (tenantData.taxRate !== undefined) {
      if (
        typeof tenantData.taxRate !== "number" ||
        tenantData.taxRate < 0 ||
        tenantData.taxRate > 100
      ) {
        errors.taxRate = "Tax rate must be a number between 0 and 100";
      }
    }

    // Validate timezone (optional)
    if (tenantData.timezone && typeof tenantData.timezone !== "string") {
      errors.timezone = "Timezone must be a valid string";
    }

    // Validate state/status (optional)
    if (tenantData.state !== undefined) {
      const validStates = [1, 2]; // Active, Inactive
      if (!validStates.includes(tenantData.state)) {
        errors.state = "Invalid tenant state";
      }
    }

    return errors;
  }

  _validateTaxRateData(taxRateData) {
    const errors = {};

    if (!taxRateData || typeof taxRateData !== "object") {
      errors.general = "Tax rate data is required";
      return errors;
    }

    // Validate tenant ID
    if (!taxRateData.tenantId || typeof taxRateData.tenantId !== "string") {
      errors.tenantId = "Valid tenant ID is required";
    }

    // Validate tax rate
    if (taxRateData.taxRate === undefined || taxRateData.taxRate === null) {
      errors.taxRate = "Tax rate is required";
    } else if (
      typeof taxRateData.taxRate !== "number" ||
      taxRateData.taxRate < 0 ||
      taxRateData.taxRate > 100
    ) {
      errors.taxRate = "Tax rate must be a number between 0 and 100";
    }

    return errors;
  }

  /**
   * Waits for current tenants request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentTenantsRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.tenantStorage.isTenantsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.tenantStorage.getTenantsFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Tenants request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Tenants request timeout"));
      }, 30000);
    });
  }
}
