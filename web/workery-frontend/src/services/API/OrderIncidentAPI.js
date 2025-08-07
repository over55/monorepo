// File Path: web/workery-frontend/src/services/API/OrderIncidentAPI.js

import { camelizeKeys, decamelizeKeys, decamelize } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * OrderIncidentAPI handles all order incident-related API calls
 */
export class OrderIncidentAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("OrderIncidentAPI initialized with:", {
        baseURL: this.baseURL,
        orderIncidentsEndpoint: this.endpoints.ORDER_INCIDENTS,
        orderIncidentDetailEndpoint: this.endpoints.ORDER_INCIDENT_DETAIL,
        orderIncidentSelectOptionsEndpoint:
          this.endpoints.ORDER_INCIDENT_SELECT_OPTIONS,
      });
    }
  }

  /**
   * Gets list of order incidents with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Order incidents list with pagination data
   */
  async getOrderIncidents(params = {}, onUnauthorizedCallback = null) {
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
        ? `${this.endpoints.ORDER_INCIDENTS}?${queryString}`
        : this.endpoints.ORDER_INCIDENTS;

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
          if (item.incidentDate) {
            item.incidentDate = DateTime.fromISO(
              item.incidentDate,
            ).toLocaleString(DateTime.DATETIME_MED);
          }
        });
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets order incidents using legacy filtersMap approach for backward compatibility
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Order incidents list with pagination data
   */
  async getOrderIncidentsWithFiltersMap(
    filtersMap = new Map(),
    onUnauthorizedCallback = null,
  ) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Build URL with filters map (matching old implementation exactly)
      let aURL = this.endpoints.ORDER_INCIDENTS;
      filtersMap.forEach((value, key) => {
        let decamelizedkey = decamelize(key);
        if (aURL.indexOf("?") > -1) {
          aURL += "&" + decamelizedkey + "=" + encodeURIComponent(value);
        } else {
          aURL += "?" + decamelizedkey + "=" + encodeURIComponent(value);
        }
      });

      // Make the API call
      const response = await authenticatedAxios.get(aURL);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      // Process date formatting for results (matching old implementation)
      if (
        data.results !== undefined &&
        data.results !== null &&
        data.results.length > 0
      ) {
        data.results.forEach((item, index) => {
          if (item.createdAt) {
            item.createdAt = DateTime.fromISO(item.createdAt).toLocaleString(
              DateTime.DATETIME_MED,
            );
          }
          if (item.incidentDate) {
            item.incidentDate = DateTime.fromISO(
              item.incidentDate,
            ).toLocaleString(DateTime.DATETIME_MED);
          }
        });
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets order incident select options with optional filtering
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Order incident select options
   */
  async getOrderIncidentSelectOptions(
    filtersMap = new Map(),
    onUnauthorizedCallback = null,
  ) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Build URL with filters map (matching old implementation exactly)
      let aURL = this.endpoints.ORDER_INCIDENT_SELECT_OPTIONS;
      filtersMap.forEach((value, key) => {
        let decamelizedkey = decamelize(key);
        if (aURL.indexOf("?") > -1) {
          aURL += "&" + decamelizedkey + "=" + encodeURIComponent(value);
        } else {
          aURL += "?" + decamelizedkey + "=" + encodeURIComponent(value);
        }
      });

      // Make the API call
      const response = await authenticatedAxios.get(aURL);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Creates a new order incident
   * @param {Object} orderIncidentData - Order incident data to create
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Created order incident data
   */
  async createOrderIncident(orderIncidentData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      console.log("createOrderIncident: pre-fix:", orderIncidentData);

      // Convert camelCase to snake_case for API
      let decamelizedData = decamelizeKeys(orderIncidentData);

      console.log("createOrderIncident: post-fix:", decamelizedData);

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ORDER_INCIDENTS,
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
   * Gets details for a specific order incident
   * @param {string|number} orderIncidentId - The ID of the order incident
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Order incident details
   */
  async getOrderIncidentDetail(orderIncidentId, onUnauthorizedCallback = null) {
    try {
      // Validate order incident ID
      if (
        !orderIncidentId ||
        (typeof orderIncidentId !== "string" &&
          typeof orderIncidentId !== "number")
      ) {
        throw {
          orderIncidentId: "Valid order incident ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ORDER_INCIDENT_DETAIL.replace(
        "{id}",
        orderIncidentId,
      );

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      let data = camelizeKeys(response.data);

      // Process date formatting
      if (data.createdAt) {
        data.createdAt = DateTime.fromISO(data.createdAt).toLocaleString(
          DateTime.DATETIME_MED,
        );
      }
      if (data.incidentDate) {
        data.incidentDate = DateTime.fromISO(data.incidentDate).toLocaleString(
          DateTime.DATETIME_MED,
        );
      }

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log("OrderIncidentAPI: Retrieved order incident detail:", data);
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates a specific order incident
   * @param {string|number} orderIncidentId - The ID of the order incident
   * @param {Object} orderIncidentData - Order incident data to update
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated order incident data
   */
  async updateOrderIncident(
    orderIncidentId,
    orderIncidentData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate order incident ID
      if (
        !orderIncidentId ||
        (typeof orderIncidentId !== "string" &&
          typeof orderIncidentId !== "number")
      ) {
        throw {
          orderIncidentId: "Valid order incident ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      console.log("updateOrderIncident: pre-fix:", orderIncidentData);

      // Convert camelCase to snake_case for API
      let decamelizedData = decamelizeKeys(orderIncidentData);

      // Ensure ID is properly set
      decamelizedData.id = orderIncidentData.id || orderIncidentId;

      console.log("updateOrderIncident: post-fix:", decamelizedData);

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ORDER_INCIDENT_DETAIL.replace(
        "{id}",
        orderIncidentId,
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
   * Deletes a specific order incident
   * @param {string|number} orderIncidentId - The ID of the order incident to delete
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Delete response data
   */
  async deleteOrderIncident(orderIncidentId, onUnauthorizedCallback = null) {
    try {
      // Validate order incident ID
      if (
        !orderIncidentId ||
        (typeof orderIncidentId !== "string" &&
          typeof orderIncidentId !== "number")
      ) {
        throw {
          orderIncidentId: "Valid order incident ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ORDER_INCIDENT_DETAIL.replace(
        "{id}",
        orderIncidentId,
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
   * Archives a specific order incident
   * @param {string|number} orderIncidentId - The ID of the order incident to archive
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Archive response data
   */
  async archiveOrderIncident(orderIncidentId, onUnauthorizedCallback = null) {
    try {
      // Validate order incident ID
      if (
        !orderIncidentId ||
        (typeof orderIncidentId !== "string" &&
          typeof orderIncidentId !== "number")
      ) {
        throw {
          orderIncidentId: "Valid order incident ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const data = {
        order_incident_id: orderIncidentId,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ORDER_INCIDENT_ARCHIVE_OPERATION,
        data,
      );

      // Convert response from snake_case to camelCase
      const responseData = camelizeKeys(response.data);

      return responseData;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Creates a comment for an order incident
   * @param {string|number} orderIncidentId - The ID of the order incident
   * @param {string} content - Comment content
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Comment creation response data
   */
  async createOrderIncidentComment(
    orderIncidentId,
    content,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate parameters
      if (
        !orderIncidentId ||
        (typeof orderIncidentId !== "string" &&
          typeof orderIncidentId !== "number")
      ) {
        throw {
          orderIncidentId: "Valid order incident ID is required",
        };
      }

      if (!content || typeof content !== "string" || !content.trim()) {
        throw {
          content: "Comment content is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const data = {
        order_incident_id: orderIncidentId,
        content: content,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ORDER_INCIDENT_CREATE_COMMENT_OPERATION,
        data,
      );

      // Convert response from snake_case to camelCase
      const responseData = camelizeKeys(response.data);

      return responseData;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Uploads file attachment for an order incident
   * @param {FormData} formData - Form data containing the file
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - File upload response data
   */
  async uploadOrderIncidentFile(formData, onUnauthorizedCallback = null) {
    try {
      // Validate form data
      if (!(formData instanceof FormData)) {
        throw {
          formData: "Valid FormData is required for file upload",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call with multipart/form-data headers
      const response = await authenticatedAxios.post(
        this.endpoints.ORDER_INCIDENT_FILE_UPLOAD_OPERATION,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        },
      );

      // Convert response from snake_case to camelCase
      const responseData = camelizeKeys(response.data);

      return responseData;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets order incident statistics
   * @param {Object} params - Query parameters for statistics
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Statistics data
   */
  async getOrderIncidentStatistics(params = {}, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ""
        ) {
          queryParams.append(key, params[key]);
        }
      });

      const queryString = queryParams.toString();
      const url = queryString
        ? `${this.endpoints.ORDER_INCIDENT_STATISTICS}?${queryString}`
        : this.endpoints.ORDER_INCIDENT_STATISTICS;

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
