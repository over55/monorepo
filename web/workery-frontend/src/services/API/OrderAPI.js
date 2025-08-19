// File Path: monorepo/web/workery-frontend/src/services/API/OrderAPI.js

import { camelizeKeys, decamelizeKeys, decamelize } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * OrderAPI handles all work order-related API calls
 */
export class OrderAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("OrderAPI initialized with:", {
        baseURL: this.baseURL,
        ordersEndpoint: this.endpoints.ORDERS,
        orderDetailEndpoint: this.endpoints.ORDER_DETAIL,
        orderSelectOptionsEndpoint: this.endpoints.ORDER_SELECT_OPTIONS,
      });
    }
  }

  /**
   * Safely formats a date string
   * @private
   * @param {string} dateString - ISO date string
   * @param {string} format - Format type ('date' or 'datetime')
   * @returns {string|null} - Formatted date or null
   */
  _formatDate(dateString, format = "date") {
    if (!dateString) return null;

    // Check for zero/null date values (Go's zero time)
    if (
      dateString === "0001-01-01T00:00:00Z" ||
      dateString === "0001-01-01T00:00:00" ||
      dateString.startsWith("0001-01-01")
    ) {
      return null; // Return null so the component will show "-"
    }

    try {
      const dt = DateTime.fromISO(dateString);

      // Check if the date is valid
      if (!dt.isValid) {
        console.warn("Invalid date:", dateString, "Reason:", dt.invalidReason);
        return null;
      }

      // Return formatted date based on format type
      if (format === "datetime") {
        return dt.toLocaleString(DateTime.DATETIME_MED);
      } else {
        return dt.toLocaleString(DateTime.DATE_MED);
      }
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return null;
    }
  }

  /**
   * Gets list of orders with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder, status, customerId, associateId }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Orders list with pagination data
   */
  async getOrders(params = {}, onUnauthorizedCallback = null) {
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
      if (params.customerId)
        queryParams.append("customer_id", params.customerId);
      if (params.associateId)
        queryParams.append("associate_id", params.associateId);
      if (params.startDate) queryParams.append("start_date", params.startDate);
      if (params.completionDate)
        queryParams.append("completion_date", params.completionDate);

      // Add any additional filters
      Object.keys(params).forEach((key) => {
        if (
          ![
            "page",
            "limit",
            "search",
            "sortBy",
            "sortOrder",
            "status",
            "customerId",
            "associateId",
            "startDate",
            "completionDate",
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
        ? `${this.endpoints.ORDERS}?${queryString}`
        : this.endpoints.ORDERS;

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
          // Format dates safely
          if (item.createdAt) {
            item.createdAt =
              this._formatDate(item.createdAt, "datetime") || item.createdAt;
          }
          if (item.startDate) {
            item.startDate =
              this._formatDate(item.startDate, "date") || item.startDate;
          }
          if (item.completionDate) {
            item.completionDate =
              this._formatDate(item.completionDate, "date") ||
              item.completionDate;
          }
          if (item.assignmentDate) {
            item.assignmentDate =
              this._formatDate(item.assignmentDate, "date") ||
              item.assignmentDate;
          }
        });
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets list of orders using legacy filtersMap approach for backward compatibility
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Orders list with pagination data
   */
  async getOrdersWithFiltersMap(
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
      let aURL = this.endpoints.ORDERS;
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
          // Format dates safely
          if (item.createdAt) {
            item.createdAt =
              this._formatDate(item.createdAt, "datetime") || item.createdAt;
          }
          if (item.startDate) {
            item.startDate =
              this._formatDate(item.startDate, "date") || item.startDate;
          }
          if (item.completionDate) {
            item.completionDate =
              this._formatDate(item.completionDate, "date") ||
              item.completionDate;
          }
          if (item.assignmentDate) {
            item.assignmentDate =
              this._formatDate(item.assignmentDate, "date") ||
              item.assignmentDate;
          }
        });
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets order select options with optional filtering
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Order select options
   */
  async getOrderSelectOptions(
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
      let aURL = this.endpoints.ORDER_SELECT_OPTIONS;
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
   * Gets order count with optional filtering
   * @param {Object} params - Query parameters for filtering
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Order count data
   */
  async getOrderCount(params = {}, onUnauthorizedCallback = null) {
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
        ? `${this.endpoints.ORDER_COUNT}?${queryString}`
        : this.endpoints.ORDER_COUNT;

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
   * Creates a new work order
   * @param {Object} orderData - Order data to create
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Created order data
   */
  async createOrder(orderData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      console.log("createOrder: pre-fix:", orderData);

      // Convert camelCase to snake_case for API
      let decamelizedData = decamelizeKeys(orderData);

      console.log("createOrder: post-fix:", decamelizedData);

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ORDERS,
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
   * Gets details for a specific order
   * @param {string|number} orderId - The ID of the order
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Order details
   */
  async getOrderDetail(orderId, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      if (
        !orderId ||
        (typeof orderId !== "string" && typeof orderId !== "number")
      ) {
        throw {
          orderId: "Valid order ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ORDER_DETAIL.replace("{id}", orderId);

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      let data = camelizeKeys(response.data);

      // Process date formatting
      if (data.createdAt) {
        data.createdAt =
          this._formatDate(data.createdAt, "datetime") || data.createdAt;
      }
      if (data.startDate) {
        data.startDate =
          this._formatDate(data.startDate, "date") || data.startDate;
      }
      if (data.completionDate) {
        data.completionDate =
          this._formatDate(data.completionDate, "date") || data.completionDate;
      }
      if (data.assignmentDate) {
        data.assignmentDate =
          this._formatDate(data.assignmentDate, "date") || data.assignmentDate;
      }

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log("OrderAPI: Retrieved order detail:", data);
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates a specific order
   * @param {string|number} orderId - The ID of the order
   * @param {Object} orderData - Order data to update
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated order data
   */
  async updateOrder(orderId, orderData, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      if (
        !orderId ||
        (typeof orderId !== "string" && typeof orderId !== "number")
      ) {
        throw {
          orderId: "Valid order ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      console.log("updateOrder: pre-fix:", orderData);

      // Convert camelCase to snake_case for API
      let decamelizedData = decamelizeKeys(orderData);

      // BUGFIX: Ensure ID is properly set
      decamelizedData.id = orderData.id || orderId;
      delete decamelizedData.i_d;

      console.log("updateOrder: post-fix:", decamelizedData);

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ORDER_DETAIL.replace("{id}", orderId);

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
   * Deletes a specific order
   * @param {string|number} orderId - The ID of the order to delete
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Delete response data
   */
  async deleteOrder(orderId, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      if (
        !orderId ||
        (typeof orderId !== "string" && typeof orderId !== "number")
      ) {
        throw {
          orderId: "Valid order ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ORDER_DETAIL.replace("{id}", orderId);

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
   * Archives a specific order
   * @param {string|number} orderId - The ID of the order to archive
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Archive response data
   */
  async archiveOrder(orderId, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      if (
        !orderId ||
        (typeof orderId !== "string" && typeof orderId !== "number")
      ) {
        throw {
          orderId: "Valid order ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const data = {
        order_id: orderId,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ORDER_ARCHIVE_OPERATION,
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
   * Creates a comment for an order
   * @param {string|number} orderId - The ID of the order
   * @param {string} content - Comment content
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Comment creation response data
   */
  async createOrderComment(orderId, content, onUnauthorizedCallback = null) {
    try {
      // Validate parameters
      if (
        !orderId ||
        (typeof orderId !== "string" && typeof orderId !== "number")
      ) {
        throw {
          orderId: "Valid order ID is required",
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
        order_id: orderId,
        content: content,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ORDER_CREATE_COMMENT_OPERATION,
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
   * Assigns an associate to an order
   * @param {string|number} orderId - The ID of the order
   * @param {string|number} associateId - The ID of the associate to assign
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Assignment response data
   */
  async assignAssociateToOrder(
    orderId,
    associateId,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate parameters
      if (
        !orderId ||
        (typeof orderId !== "string" && typeof orderId !== "number")
      ) {
        throw {
          orderId: "Valid order ID is required",
        };
      }

      if (
        !associateId ||
        (typeof associateId !== "string" && typeof associateId !== "number")
      ) {
        throw {
          associateId: "Valid associate ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const data = {
        order_id: orderId,
        associate_id: associateId,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ORDER_ASSIGN_ASSOCIATE_OPERATION,
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
   * Unassigns an associate from an order
   * @param {string|number} orderId - The ID of the order
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Unassignment response data
   */
  async unassignAssociateFromOrder(orderId, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      if (
        !orderId ||
        (typeof orderId !== "string" && typeof orderId !== "number")
      ) {
        throw {
          orderId: "Valid order ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const data = {
        order_id: orderId,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ORDER_UNASSIGN_ASSOCIATE_OPERATION,
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
   * Completes an order
   * @param {string|number} orderId - The ID of the order to complete
   * @param {Object} completionData - Completion data (optional)
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Completion response data
   */
  async completeOrder(
    orderId,
    completionData = {},
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate order ID
      if (
        !orderId ||
        (typeof orderId !== "string" && typeof orderId !== "number")
      ) {
        throw {
          orderId: "Valid order ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const data = {
        order_id: orderId,
        ...decamelizeKeys(completionData),
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ORDER_COMPLETE_OPERATION,
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
   * Closes an order
   * @param {string|number} orderId - The ID of the order to close
   * @param {Object} closureData - Closure data (optional)
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Closure response data
   */
  async closeOrder(orderId, closureData = {}, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      if (
        !orderId ||
        (typeof orderId !== "string" && typeof orderId !== "number")
      ) {
        throw {
          orderId: "Valid order ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const data = {
        order_id: orderId,
        ...decamelizeKeys(closureData),
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ORDER_CLOSE_OPERATION,
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
   * Reopens an order
   * @param {string|number} orderId - The ID of the order to reopen
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Reopen response data
   */
  async reopenOrder(orderId, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      if (
        !orderId ||
        (typeof orderId !== "string" && typeof orderId !== "number")
      ) {
        throw {
          orderId: "Valid order ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const data = {
        order_id: orderId,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ORDER_REOPEN_OPERATION,
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
   * Creates invoice for an order
   * @param {string|number} orderId - The ID of the order to invoice
   * @param {Object} invoiceData - Invoice data
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Invoice response data
   */
  async invoiceOrder(orderId, invoiceData = {}, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      if (
        !orderId ||
        (typeof orderId !== "string" && typeof orderId !== "number")
      ) {
        throw {
          orderId: "Valid order ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const data = {
        order_id: orderId,
        ...decamelizeKeys(invoiceData),
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ORDER_INVOICE_OPERATION,
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
   * Clones an order
   * @param {string|number} orderId - The ID of the order to clone
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Clone response data
   */
  async cloneOrder(orderId, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      if (
        !orderId ||
        (typeof orderId !== "string" && typeof orderId !== "number")
      ) {
        throw {
          orderId: "Valid order ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const data = {
        order_id: orderId,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ORDER_CLONE_OPERATION,
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
   * Uploads file for an order
   * @param {FormData} formData - Form data containing the file
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - File upload response data
   */
  async uploadOrderFile(formData, onUnauthorizedCallback = null) {
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
        this.endpoints.ORDER_FILE_UPLOAD_OPERATION,
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
   * Postpones an order
   * @param {string|number} orderId - The ID of the order to postpone
   * @param {Object} postponeData - Postpone data including new date
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Postpone response data
   */
  async postponeOrder(orderId, postponeData, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      if (
        !orderId ||
        (typeof orderId !== "string" && typeof orderId !== "number")
      ) {
        throw {
          orderId: "Valid order ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const data = {
        order_id: orderId,
        ...decamelizeKeys(postponeData),
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ORDER_POSTPONE_OPERATION,
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
   * Transfers an order to another associate or customer
   * @param {string|number} orderId - The ID of the order to transfer
   * @param {Object} transferData - Transfer data
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Transfer response data
   */
  async transferOrder(orderId, transferData, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      if (
        !orderId ||
        (typeof orderId !== "string" && typeof orderId !== "number")
      ) {
        throw {
          orderId: "Valid order ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const data = {
        order_id: orderId,
        ...decamelizeKeys(transferData),
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ORDER_TRANSFER_OPERATION,
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
