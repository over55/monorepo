// File Path: monorepo/web/workery-frontend/src/services/API/TenantAPI.js

import { camelizeKeys, decamelizeKeys } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";

/**
 * TenantAPI handles all tenant-related API calls
 */
export class TenantAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("TenantAPI initialized with:", {
        baseURL: this.baseURL,
        tenantsEndpoint: this.endpoints.TENANTS,
        tenantDetailEndpoint: this.endpoints.TENANT_DETAIL,
        executiveVisitsTenantEndpoint: this.endpoints.EXECUTIVE_VISITS_TENANT,
        updateTaxRateEndpoint: this.endpoints.TENANT_UPDATE_TAX_RATE,
      });
    }
  }

  /**
   * Gets list of tenants with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Tenants list with pagination data
   */
  async getTenants(params = {}, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add pagination params
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("page_size", params.limit);

      // Add search params
      if (params.search) queryParams.append("search", params.search);

      // Add sorting params
      if (params.sortBy && params.sortOrder) {
        queryParams.append("sort_by", `${params.sortBy},${params.sortOrder}`);
      }

      // Add filtering params
      if (params.status) queryParams.append("status", params.status);
      if (params.type) queryParams.append("type", params.type);

      const queryString = queryParams.toString();
      const url = queryString
        ? `${this.endpoints.TENANTS}?${queryString}`
        : this.endpoints.TENANTS;

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const camelizedData = camelizeKeys(response.data);

      return camelizedData;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets details for a specific tenant
   * @param {number} tenantId - The ID of the tenant
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Tenant details
   */
  async getTenantDetail(tenantId, onUnauthorizedCallback = null) {
    try {
      // Validate tenant ID
      if (!tenantId || typeof tenantId !== "string" || tenantId.trim() === "") {
        throw {
          tenantId: "Valid tenant ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.TENANT_DETAIL.replace("{id}", tenantId);

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const camelizedData = camelizeKeys(response.data);

      return camelizedData;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates a specific tenant
   * @param {number} tenantId - The ID of the tenant
   * @param {Object} tenantData - Tenant data to update
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated tenant data
   */
  async updateTenant(tenantId, tenantData, onUnauthorizedCallback = null) {
    try {
      // Validate tenant ID
      if (!tenantId || typeof tenantId !== "string" || tenantId.trim() === "") {
        throw {
          tenantId: "Valid tenant ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      const decamelizedData = decamelizeKeys(tenantData);

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.TENANT_DETAIL.replace("{id}", tenantId);

      // Make the API call
      const response = await authenticatedAxios.put(url, decamelizedData);

      // Convert response from snake_case to camelCase
      const camelizedData = camelizeKeys(response.data);

      return camelizedData;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Executive visits tenant - allows an executive to switch to a specific tenant
   * @param {number} tenantID - The ID of the tenant to visit
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Response data from the API
   */
  async executiveVisitsTenant(tenantID, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Prepare the request data (convert to snake_case for API)
      const requestData = {
        tenant_id: tenantID,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.EXECUTIVE_VISITS_TENANT,
        requestData,
      );

      // Convert response from snake_case to camelCase
      const camelizedData = camelizeKeys(response.data);

      return camelizedData;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates tax rate for a tenant (operation endpoint)
   * @param {Object} taxRateData - Tax rate update data { tenantId, taxRate }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Tax rate update response
   */
  async updateTaxRate(taxRateData, onUnauthorizedCallback = null) {
    try {
      // Validate required fields
      if (
        !taxRateData.tenantId ||
        typeof taxRateData.tenantId !== "string" ||
        taxRateData.tenantId.trim() === ""
      ) {
        throw {
          tenantId: "Valid tenant ID is required",
        };
      }

      if (!taxRateData.taxRate || typeof taxRateData.taxRate !== "number") {
        throw {
          taxRate: "Valid tax rate is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      const decamelizedData = decamelizeKeys(taxRateData);

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.TENANT_UPDATE_TAX_RATE,
        decamelizedData,
      );

      // Convert response from snake_case to camelCase
      const camelizedData = camelizeKeys(response.data);

      return camelizedData;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Creates a new tenant
   * @param {Object} tenantData - Tenant data to create
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Created tenant data
   */
  async createTenant(tenantData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      const decamelizedData = decamelizeKeys(tenantData);

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.TENANTS,
        decamelizedData,
      );

      // Convert response from snake_case to camelCase
      const camelizedData = camelizeKeys(response.data);

      return camelizedData;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Archives/deactivates a tenant
   * @param {number} tenantId - The ID of the tenant to archive
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Archive response
   */
  async archiveTenant(tenantId, onUnauthorizedCallback = null) {
    try {
      // Validate tenant ID
      if (!tenantId || typeof tenantId !== "string" || tenantId.trim() === "") {
        throw {
          tenantId: "Valid tenant ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.TENANT_DETAIL.replace("{id}", tenantId);

      // Make the API call with DELETE method
      const response = await authenticatedAxios.delete(url);

      // Convert response from snake_case to camelCase
      const camelizedData = camelizeKeys(response.data);

      return camelizedData;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Formats error responses consistently
   * @private
   * @param {Error} error - Original error from axios or interceptor
   * @returns {Object} - Formatted error object
   */
  _formatError(error) {
    let errorData = null;

    // Handle different error structures
    if (error.response?.data) {
      errorData = error.response.data;
    } else if (error.response) {
      errorData = error.response;
    } else if (typeof error === "object" && error !== null) {
      // Already processed by our interceptor
      errorData = error;
    } else {
      errorData = { message: error.message || "Unknown error occurred" };
    }

    // Convert error to camelCase
    const formattedErrors = camelizeKeys(errorData);
    return formattedErrors;
  }
}
