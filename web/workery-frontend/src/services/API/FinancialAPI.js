// File Path: monorepo/web/workery-frontend/src/services/API/FinancialAPI.js

import { camelizeKeys, decamelizeKeys } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * FinancialAPI handles all financial-related API calls
 */
export class FinancialAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("FinancialAPI initialized with:", {
        baseURL: this.baseURL,
        financialsEndpoint: this.endpoints.FINANCIALS,
        financialDetailEndpoint: this.endpoints.FINANCIAL_DETAIL,
        financialUpdateEndpoint: this.endpoints.FINANCIAL_UPDATE,
        financialSelectOptionsEndpoint: this.endpoints.FINANCIAL_SELECT_OPTIONS,
      });
    }
  }

  /**
   * Gets financial select options for dropdowns
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Financial select options
   */
  async getFinancialSelectOptions(onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call
      const response = await authenticatedAxios.get(
        this.endpoints.FINANCIAL_SELECT_OPTIONS,
      );

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets list of financial records with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder, startDate, endDate, type }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Financial records list with pagination data
   */
  async getFinancials(params = {}, onUnauthorizedCallback = null) {
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

      // Add date range filters
      if (params.startDate) queryParams.append("start_date", params.startDate);
      if (params.endDate) queryParams.append("end_date", params.endDate);

      // Add financial type filter
      if (params.type) queryParams.append("type", params.type);

      // Add any additional filters
      Object.keys(params).forEach((key) => {
        if (
          ![
            "page",
            "limit",
            "search",
            "sortBy",
            "sortOrder",
            "startDate",
            "endDate",
            "type",
          ].includes(key)
        ) {
          if (
            params[key] !== undefined &&
            params[key] !== null &&
            params[key] !== ""
          ) {
            queryParams.append(key, params[key]);
          }
        }
      });

      const queryString = queryParams.toString();
      const url = queryString
        ? `${this.endpoints.FINANCIALS}?${queryString}`
        : this.endpoints.FINANCIALS;

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      // Process date formatting for results
      if (
        data.results &&
        Array.isArray(data.results) &&
        data.results.length > 0
      ) {
        data.results.forEach((item) => {
          if (item.createdAt) {
            item.createdAt = DateTime.fromISO(item.createdAt).toLocaleString(
              DateTime.DATETIME_MED,
            );
          }
          if (item.transactionDate) {
            item.transactionDate = DateTime.fromISO(
              item.transactionDate,
            ).toLocaleString(DateTime.DATE_MED);
          }
          if (item.dueDate) {
            item.dueDate = DateTime.fromISO(item.dueDate).toLocaleString(
              DateTime.DATE_MED,
            );
          }
        });
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Creates a new financial record
   * @param {Object} financialData - Financial record data to create
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Created financial record data
   */
  async createFinancial(financialData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      const decamelizedData = decamelizeKeys(financialData);

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.FINANCIALS,
        decamelizedData,
      );

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets details for a specific financial record
   * @param {string|number} financialId - The ID of the financial record
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Financial record details
   */
  async getFinancialDetail(financialId, onUnauthorizedCallback = null) {
    try {
      // Validate financial ID
      if (
        !financialId ||
        (typeof financialId !== "string" && typeof financialId !== "number")
      ) {
        throw {
          financialId: "Valid financial record ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.FINANCIAL_DETAIL.replace("{id}", financialId);

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      // Format dates
      if (data.transactionDate) {
        data.transactionDate = DateTime.fromISO(
          data.transactionDate,
        ).toLocaleString(DateTime.DATE_MED);
      }
      if (data.dueDate) {
        data.dueDate = DateTime.fromISO(data.dueDate).toLocaleString(
          DateTime.DATE_MED,
        );
      }

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log("FinancialAPI: Retrieved financial record detail:", data);
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates a specific financial record
   * @param {string|number} financialId - The ID of the financial record
   * @param {Object} financialData - Financial record data to update
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated financial record data
   */
  async updateFinancial(
    financialId,
    financialData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate financial ID
      if (
        !financialId ||
        (typeof financialId !== "string" && typeof financialId !== "number")
      ) {
        throw {
          financialId: "Valid financial record ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      let decamelizedData = decamelizeKeys(financialData);

      // Handle the special case for ID field (from old code pattern)
      if (decamelizedData.i_d) {
        decamelizedData.id = decamelizedData.i_d;
        delete decamelizedData.i_d;
      }

      // Ensure ID is included in the data
      decamelizedData.id = financialId;

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.FINANCIAL_UPDATE.replace("{id}", financialId);

      // Make the API call
      const response = await authenticatedAxios.put(url, decamelizedData);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Deletes a specific financial record
   * @param {string|number} financialId - The ID of the financial record to delete
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Delete response data
   */
  async deleteFinancial(financialId, onUnauthorizedCallback = null) {
    try {
      // Validate financial ID
      if (
        !financialId ||
        (typeof financialId !== "string" && typeof financialId !== "number")
      ) {
        throw {
          financialId: "Valid financial record ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.FINANCIAL_DETAIL.replace("{id}", financialId);

      // Make the API call
      const response = await authenticatedAxios.delete(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets financial summary/statistics
   * @param {Object} params - Query parameters { startDate, endDate, type }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Financial summary data
   */
  async getFinancialSummary(params = {}, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params.startDate) queryParams.append("start_date", params.startDate);
      if (params.endDate) queryParams.append("end_date", params.endDate);
      if (params.type) queryParams.append("type", params.type);

      const queryString = queryParams.toString();
      const url = queryString
        ? `${this.endpoints.FINANCIALS}/summary?${queryString}`
        : `${this.endpoints.FINANCIALS}/summary`;

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Exports financial data
   * @param {Object} params - Export parameters { format, startDate, endDate, type }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Export response data
   */
  async exportFinancials(params = {}, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params.format) queryParams.append("format", params.format);
      if (params.startDate) queryParams.append("start_date", params.startDate);
      if (params.endDate) queryParams.append("end_date", params.endDate);
      if (params.type) queryParams.append("type", params.type);

      const queryString = queryParams.toString();
      const url = queryString
        ? `${this.endpoints.FINANCIALS}/export?${queryString}`
        : `${this.endpoints.FINANCIALS}/export`;

      // Make the API call
      const response = await authenticatedAxios.get(url, {
        responseType: "blob", // Handle file downloads
      });

      return response;
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
