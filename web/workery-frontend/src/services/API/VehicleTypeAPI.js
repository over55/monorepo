// File Path: monorepo/web/workery-frontend/src/services/API/VehicleTypeAPI.js

import { camelizeKeys, decamelizeKeys } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * VehicleTypeAPI handles all vehicle type-related API calls
 */
export class VehicleTypeAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("VehicleTypeAPI initialized with:", {
        baseURL: this.baseURL,
        vehicleTypesEndpoint: this.endpoints.VEHICLE_TYPES,
        vehicleTypeDetailEndpoint: this.endpoints.VEHICLE_TYPE_DETAIL,
        vehicleTypeSelectOptionsEndpoint:
          this.endpoints.VEHICLE_TYPE_SELECT_OPTIONS,
      });
    }
  }

  /**
   * Gets vehicle type select options for dropdowns
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Vehicle type select options
   */
  async getVehicleTypeSelectOptions(onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call
      const response = await authenticatedAxios.get(
        this.endpoints.VEHICLE_TYPE_SELECT_OPTIONS,
      );

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets list of vehicle types with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Vehicle types list with pagination data
   */
  async getVehicleTypes(params = {}, onUnauthorizedCallback = null) {
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

      // Add any additional filters
      Object.keys(params).forEach((key) => {
        if (!["page", "limit", "search", "sortBy", "sortOrder"].includes(key)) {
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
        ? `${this.endpoints.VEHICLE_TYPES}?${queryString}`
        : this.endpoints.VEHICLE_TYPES;

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
        });
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Creates a new vehicle type
   * @param {Object} vehicleTypeData - Vehicle type data to create
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Created vehicle type data
   */
  async createVehicleType(vehicleTypeData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      const decamelizedData = decamelizeKeys(vehicleTypeData);

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.VEHICLE_TYPES,
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
   * Gets details for a specific vehicle type
   * @param {string|number} vehicleTypeId - The ID of the vehicle type
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Vehicle type details
   */
  async getVehicleTypeDetail(vehicleTypeId, onUnauthorizedCallback = null) {
    try {
      // Validate vehicle type ID
      if (
        !vehicleTypeId ||
        (typeof vehicleTypeId !== "string" && typeof vehicleTypeId !== "number")
      ) {
        throw {
          vehicleTypeId: "Valid vehicle type ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.VEHICLE_TYPE_DETAIL.replace(
        "{id}",
        vehicleTypeId,
      );

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log("VehicleTypeAPI: Retrieved vehicle type detail:", data);
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates a specific vehicle type
   * @param {string|number} vehicleTypeId - The ID of the vehicle type
   * @param {Object} vehicleTypeData - Vehicle type data to update
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated vehicle type data
   */
  async updateVehicleType(
    vehicleTypeId,
    vehicleTypeData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate vehicle type ID
      if (
        !vehicleTypeId ||
        (typeof vehicleTypeId !== "string" && typeof vehicleTypeId !== "number")
      ) {
        throw {
          vehicleTypeId: "Valid vehicle type ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      const decamelizedData = decamelizeKeys(vehicleTypeData);

      // Ensure ID is included in the data
      decamelizedData.id = vehicleTypeId;

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.VEHICLE_TYPE_DETAIL.replace(
        "{id}",
        vehicleTypeId,
      );

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
   * Deletes a specific vehicle type
   * @param {string|number} vehicleTypeId - The ID of the vehicle type to delete
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Delete response data
   */
  async deleteVehicleType(vehicleTypeId, onUnauthorizedCallback = null) {
    try {
      // Validate vehicle type ID
      if (
        !vehicleTypeId ||
        (typeof vehicleTypeId !== "string" && typeof vehicleTypeId !== "number")
      ) {
        throw {
          vehicleTypeId: "Valid vehicle type ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.VEHICLE_TYPE_DETAIL.replace(
        "{id}",
        vehicleTypeId,
      );

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
