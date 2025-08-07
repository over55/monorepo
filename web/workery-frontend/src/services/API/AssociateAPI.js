// File Path: monorepo/web/workery-frontend/src/services/API/AssociateAPI.js

import { camelizeKeys, decamelizeKeys, decamelize } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * AssociateAPI handles all associate-related API calls
 */
export class AssociateAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("AssociateAPI initialized with:", {
        baseURL: this.baseURL,
        associatesEndpoint: this.endpoints.ASSOCIATES,
        associateDetailEndpoint: this.endpoints.ASSOCIATE_DETAIL,
        associateSelectOptionsEndpoint: this.endpoints.ASSOCIATE_SELECT_OPTIONS,
      });
    }
  }

  /**
   * Gets list of associates with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Associates list with pagination data
   */
  async getAssociates(params = {}, onUnauthorizedCallback = null) {
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
        ? `${this.endpoints.ASSOCIATES}?${queryString}`
        : this.endpoints.ASSOCIATES;

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
   * Gets list of associates using legacy filtersMap approach for backward compatibility
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Associates list with pagination data
   */
  async getAssociatesWithFiltersMap(
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
      let aURL = this.endpoints.ASSOCIATES;
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
   * Gets associate select options with optional filtering
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Associate select options
   */
  async getAssociateSelectOptions(
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
      let aURL = this.endpoints.ASSOCIATE_SELECT_OPTIONS;
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
   * Creates a new associate
   * @param {Object} associateData - Associate data to create
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Created associate data
   */
  async createAssociate(associateData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      console.log("createAssociate: pre-fix:", associateData);

      // Convert camelCase to snake_case for API
      let decamelizedData = decamelizeKeys(associateData);

      // BUGFIX: Handle the howDidYouHearAboutUs field specially (from old implementation)
      if (associateData.howDidYouHearAboutUsID) {
        decamelizedData.how_did_you_hear_about_us_id =
          associateData.howDidYouHearAboutUsID;
        delete decamelizedData.how_did_you_hear_about_us_i_d;
      }

      console.log("createAssociate: post-fix:", decamelizedData);

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ASSOCIATES,
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
   * Gets details for a specific associate
   * @param {string|number} associateId - The ID of the associate
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Associate details
   */
  async getAssociateDetail(associateId, onUnauthorizedCallback = null) {
    try {
      // Validate associate ID
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

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ASSOCIATE_DETAIL.replace("{id}", associateId);

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
        console.log("AssociateAPI: Retrieved associate detail:", data);
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates a specific associate
   * @param {string|number} associateId - The ID of the associate
   * @param {Object} associateData - Associate data to update
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated associate data
   */
  async updateAssociate(
    associateId,
    associateData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate associate ID
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

      console.log("updateAssociate: pre-fix:", associateData);

      // Convert camelCase to snake_case for API
      let decamelizedData = decamelizeKeys(associateData);

      // BUGFIX: Handle the howDidYouHearAboutUs field specially (from old implementation)
      if (associateData.howDidYouHearAboutUsID) {
        decamelizedData.how_did_you_hear_about_us_id =
          associateData.howDidYouHearAboutUsID;
        delete decamelizedData.how_did_you_hear_about_us_i_d;
      }

      // BUGFIX: Ensure ID is properly set (from old implementation)
      decamelizedData.id = associateData.id || associateId;
      delete decamelizedData.i_d;

      console.log("updateAssociate: post-fix:", decamelizedData);

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ASSOCIATE_DETAIL.replace("{id}", associateId);

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
   * Deletes a specific associate
   * @param {string|number} associateId - The ID of the associate to delete
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Delete response data
   */
  async deleteAssociate(associateId, onUnauthorizedCallback = null) {
    try {
      // Validate associate ID
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

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.ASSOCIATE_DETAIL.replace("{id}", associateId);

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
   * Archives a specific associate
   * @param {string|number} associateId - The ID of the associate to archive
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Archive response data
   */
  async archiveAssociate(associateId, onUnauthorizedCallback = null) {
    try {
      // Validate associate ID
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
        associate_id: associateId,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ASSOCIATE_ARCHIVE_OPERATION,
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
   * Creates a comment for an associate
   * @param {string|number} associateId - The ID of the associate
   * @param {string} content - Comment content
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Comment creation response data
   */
  async createAssociateComment(
    associateId,
    content,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate parameters
      if (
        !associateId ||
        (typeof associateId !== "string" && typeof associateId !== "number")
      ) {
        throw {
          associateId: "Valid associate ID is required",
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
        associate_id: associateId,
        content: content,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ASSOCIATE_CREATE_COMMENT_OPERATION,
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
   * Upgrades an associate
   * @param {Object} decamelizedData - Already decamelized upgrade data
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Upgrade response data
   */
  async upgradeAssociate(decamelizedData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ASSOCIATE_UPGRADE_OPERATION,
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
   * Downgrades an associate
   * @param {string|number} associateId - The ID of the associate to downgrade
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Downgrade response data
   */
  async downgradeAssociate(associateId, onUnauthorizedCallback = null) {
    try {
      // Validate associate ID
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
        associate_id: associateId,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ASSOCIATE_DOWNGRADE_OPERATION,
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
   * Uploads avatar for an associate
   * @param {FormData} formData - Form data containing the avatar file
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Avatar upload response data
   */
  async uploadAssociateAvatar(formData, onUnauthorizedCallback = null) {
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
        this.endpoints.ASSOCIATE_AVATAR_OPERATION,
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
   * Changes password for an associate
   * @param {Object} passwordData - Password change data
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Password change response data
   */
  async changeAssociatePassword(passwordData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.ASSOCIATE_CHANGE_PASSWORD_OPERATION,
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
   * Changes two-factor authentication settings for an associate
   * @param {Object} twoFactorData - 2FA change data
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - 2FA change response data
   */
  async changeAssociateTwoFactorAuth(
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
        this.endpoints.ASSOCIATE_CHANGE_2FA_OPERATION,
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
