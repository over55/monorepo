// File Path: monorepo/web/workery-frontend/src/services/Manager/TenantManager.js

/**
 * TenantManager handles tenant-related business logic
 * Manages tenant operations like executive visits and tenant switching
 */
export class TenantManager {
  constructor(tenantAPI) {
    this.tenantAPI = tenantAPI;
    this.currentTenant = {
      id: null,
      data: null,
      visitedAt: null,
    };
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
      if (!tenantID || typeof tenantID !== "number") {
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

      // Update current tenant state
      this.currentTenant = {
        id: tenantID,
        data: visitResponse,
        visitedAt: Date.now(),
      };

      console.log(
        "TenantManager: Executive visit successful:",
        this.currentTenant,
      );

      return visitResponse;
    } catch (error) {
      console.error("TenantManager: Executive visit failed", error);
      throw error;
    }
  }

  /**
   * Callback-based version of executiveVisitsTenant for compatibility
   * @param {number} tenantID
   * @param {Function} onSuccessCallback
   * @param {Function} onErrorCallback
   * @param {Function} onDoneCallback
   * @param {Function} onUnauthorizedCallback
   */
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

  /**
   * Gets current tenant information
   * @returns {Object} - Current tenant state
   */
  getCurrentTenant() {
    return {
      id: this.currentTenant.id,
      data: this.currentTenant.data,
      visitedAt: this.currentTenant.visitedAt,
      isActive: !!this.currentTenant.id,
      visitAge: this.currentTenant.visitedAt
        ? Date.now() - this.currentTenant.visitedAt
        : null,
    };
  }

  /**
   * Clears current tenant context
   */
  clearCurrentTenant() {
    this.currentTenant = {
      id: null,
      data: null,
      visitedAt: null,
    };
    console.log("TenantManager: Cleared current tenant context");
  }

  /**
   * Checks if executive has visited a tenant
   * @returns {boolean}
   */
  hasActiveTenantVisit() {
    return !!this.currentTenant.id;
  }
}
