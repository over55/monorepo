// File Path: monorepo/web/workery-frontend/src/services/API/CustomerAPI.js

import { camelizeKeys, decamelizeKeys, decamelize } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * CustomerAPI handles all customer-related API calls
 */
export class CustomerAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("CustomerAPI initialized with:", {
        baseURL: this.baseURL,
        customersEndpoint: this.endpoints.CUSTOMERS,
        customerDetailEndpoint: this.endpoints.CUSTOMER_DETAIL,
        customerCountEndpoint: this.endpoints.CUSTOMER_COUNT,
      });
    }
  }

  /**
   * Gets list of customers with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Customers list with pagination data
   */
  async getCustomers(params = {}, onUnauthorizedCallback = null) {
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
        ? `${this.endpoints.CUSTOMERS}?${queryString}`
        : this.endpoints.CUSTOMERS;

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
   * Gets list of customers using legacy filtersMap approach for backward compatibility
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Customers list with pagination data
   */
  async getCustomersWithFiltersMap(
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
      let aURL = this.endpoints.CUSTOMERS;
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
          item.createdAt = DateTime.fromISO(item.createdAt).toLocaleString(
            DateTime.DATETIME_MED,
          );
        });
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets count of customers with optional filtering
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Customer count data
   */
  async getCustomerCount(
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
      let aURL = this.endpoints.CUSTOMER_COUNT;
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
   * Creates a new customer
   * @param {Object} customerData - Customer data to create
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Created customer data
   */
  async createCustomer(customerData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      console.log("createCustomer: pre-fix:", customerData);

      // Convert camelCase to snake_case for API
      let decamelizedData = decamelizeKeys(customerData);

      // BUGFIX: Handle the howDidYouHearAboutUs field specially
      // The backend expects how_did_you_hear_about_us_id as a MongoDB ObjectID string
      if (customerData.howDidYouHearAboutUsID) {
        decamelizedData.how_did_you_hear_about_us_id = String(
          customerData.howDidYouHearAboutUsID,
        );
        delete decamelizedData.how_did_you_hear_about_us_i_d; // Remove the incorrectly decamelized key
      }

      // Ensure tags are strings (MongoDB ObjectIDs)
      if (decamelizedData.tags && Array.isArray(decamelizedData.tags)) {
        decamelizedData.tags = decamelizedData.tags.map((tag) => String(tag));
      }

      console.log("createCustomer: post-fix:", decamelizedData);

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.CUSTOMERS,
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
   * Gets details for a specific customer
   * @param {string|number} customerId - The ID of the customer
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Customer details
   */
  async getCustomerDetail(customerId, onUnauthorizedCallback = null) {
    try {
      // Validate customer ID
      if (
        !customerId ||
        (typeof customerId !== "string" && typeof customerId !== "number")
      ) {
        throw {
          customerId: "Valid customer ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.CUSTOMER_DETAIL.replace("{id}", customerId);

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      let data = camelizeKeys(response.data);

      // BUGFIX: Handle the howDidYouHearAboutUs field specially (from old implementation)
      if (data.howDidYouHearAboutUsId) {
        data.howDidYouHearAboutUsID = data.howDidYouHearAboutUsId;
      }

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log("CustomerAPI: Retrieved customer detail:", data);
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates a specific customer
   * @param {string|number} customerId - The ID of the customer
   * @param {Object} customerData - Customer data to update
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated customer data
   */
  async updateCustomer(
    customerId,
    customerData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate customer ID
      if (
        !customerId ||
        (typeof customerId !== "string" && typeof customerId !== "number")
      ) {
        throw {
          customerId: "Valid customer ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      console.log("updateCustomer: pre-fix:", customerData);

      // Convert camelCase to snake_case for API
      let decamelizedData = decamelizeKeys(customerData);

      // BUGFIX: Handle the howDidYouHearAboutUs field specially
      if (customerData.howDidYouHearAboutUsID) {
        decamelizedData.how_did_you_hear_about_us_id = String(
          customerData.howDidYouHearAboutUsID,
        );
        delete decamelizedData.how_did_you_hear_about_us_i_d; // Remove the incorrectly decamelized key
      }

      // BUGFIX: Ensure ID is properly set (from old implementation)
      decamelizedData.id = customerData.id || customerId;
      delete decamelizedData.i_d;

      // Ensure tags are strings (MongoDB ObjectIDs)
      if (decamelizedData.tags && Array.isArray(decamelizedData.tags)) {
        decamelizedData.tags = decamelizedData.tags.map((tag) => String(tag));
      }

      console.log("updateCustomer: post-fix:", decamelizedData);

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.CUSTOMER_DETAIL.replace("{id}", customerId);

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
   * Deletes a specific customer
   * @param {string|number} customerId - The ID of the customer to delete
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Delete response data
   */
  async deleteCustomer(customerId, onUnauthorizedCallback = null) {
    try {
      // Validate customer ID
      if (
        !customerId ||
        (typeof customerId !== "string" && typeof customerId !== "number")
      ) {
        throw {
          customerId: "Valid customer ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.CUSTOMER_DETAIL.replace("{id}", customerId);

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
   * Archives a specific customer
   * @param {string|number} customerId - The ID of the customer to archive
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Archive response data
   */
  async archiveCustomer(customerId, onUnauthorizedCallback = null) {
    try {
      // Validate customer ID
      if (
        !customerId ||
        (typeof customerId !== "string" && typeof customerId !== "number")
      ) {
        throw {
          customerId: "Valid customer ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const data = {
        customer_id: customerId,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.CUSTOMER_ARCHIVE_OPERATION,
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
   * Creates a comment for a customer
   * @param {string|number} customerId - The ID of the customer
   * @param {string} content - Comment content
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Comment creation response data
   */
  async createCustomerComment(
    customerId,
    content,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate parameters
      if (
        !customerId ||
        (typeof customerId !== "string" && typeof customerId !== "number")
      ) {
        throw {
          customerId: "Valid customer ID is required",
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
        customer_id: customerId,
        content: content,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.CUSTOMER_CREATE_COMMENT_OPERATION,
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
   * Upgrades a customer
   * @param {Object} decamelizedData - Already decamelized upgrade data
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Upgrade response data
   */
  async upgradeCustomer(decamelizedData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.CUSTOMER_UPGRADE_OPERATION,
        decamelizedData,
      );

      // Convert response from snake_case to camelCase
      const responseData = camelizeKeys(response.data);

      return responseData;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Downgrades a customer
   * @param {string|number} customerId - The ID of the customer to downgrade
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Downgrade response data
   */
  async downgradeCustomer(customerId, onUnauthorizedCallback = null) {
    try {
      // Validate customer ID
      if (
        !customerId ||
        (typeof customerId !== "string" && typeof customerId !== "number")
      ) {
        throw {
          customerId: "Valid customer ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const data = {
        customer_id: customerId,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.CUSTOMER_DOWNGRADE_OPERATION,
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
   * Uploads avatar for a customer
   * @param {FormData} formData - Form data containing the avatar file
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Avatar upload response data
   */
  async uploadCustomerAvatar(formData, onUnauthorizedCallback = null) {
    try {
      // Validate form data
      if (!(formData instanceof FormData)) {
        throw {
          formData: "Valid FormData is required for avatar upload",
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
        this.endpoints.CUSTOMER_AVATAR_OPERATION,
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
   * Changes password for a customer
   * @param {Object} passwordData - Password change data
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Password change response data
   */
  async changeCustomerPassword(passwordData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.CUSTOMER_CHANGE_PASSWORD_OPERATION,
        passwordData,
      );

      // Convert response from snake_case to camelCase
      const responseData = camelizeKeys(response.data);

      return responseData;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Changes two-factor authentication settings for a customer
   * @param {Object} twoFactorData - 2FA change data
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - 2FA change response data
   */
  async changeCustomerTwoFactorAuth(
    twoFactorData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.CUSTOMER_CHANGE_2FA_OPERATION,
        twoFactorData,
      );

      // Convert response from snake_case to camelCase
      const responseData = camelizeKeys(response.data);

      return responseData;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Bans a customer
   * @param {Object} banData - Ban data
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Ban response data
   */
  async banCustomer(banData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.CUSTOMER_BAN_OPERATION,
        banData,
      );

      // Convert response from snake_case to camelCase
      const responseData = camelizeKeys(response.data);

      return responseData;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Unbans a customer
   * @param {Object} unbanData - Unban data
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Unban response data
   */
  async unbanCustomer(unbanData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.CUSTOMER_UNBAN_OPERATION,
        unbanData,
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
