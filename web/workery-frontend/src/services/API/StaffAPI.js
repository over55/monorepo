// File Path: monorepo/web/workery-frontend/src/services/API/StaffAPI.js

import { camelizeKeys, decamelizeKeys, decamelize } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * StaffAPI handles all staff-related API calls
 */
export class StaffAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("StaffAPI initialized with:", {
        baseURL: this.baseURL,
        staffEndpoint: this.endpoints.STAFF,
        staffDetailEndpoint: this.endpoints.STAFF_DETAIL,
        staffSelectOptionsEndpoint: this.endpoints.STAFF_SELECT_OPTIONS,
      });
    }
  }

  /**
   * Gets list of staff with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Staff list with pagination data
   */
  async getStaff(params = {}, onUnauthorizedCallback = null) {
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
        ? `${this.endpoints.STAFF}?${queryString}`
        : this.endpoints.STAFF;

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
   * Gets list of staff using legacy filtersMap approach for backward compatibility
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Staff list with pagination data
   */
  async getStaffWithFiltersMap(
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
      let aURL = this.endpoints.STAFF;
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
   * Gets staff select options with optional filtering
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Staff select options
   */
  async getStaffSelectOptions(
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
      let aURL = this.endpoints.STAFF_SELECT_OPTIONS;
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
   * Creates a new staff member
   * @param {Object} staffData - Staff data to create
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Created staff data
   */
  async createStaff(staffData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      console.log("createStaff: pre-fix:", staffData);

      // Convert camelCase to snake_case for API
      let decamelizedData = decamelizeKeys(staffData);

      // BUGFIX: Handle howDidYouHearAboutUs field correctly
      if (staffData.howDidYouHearAboutUsID) {
        decamelizedData.how_did_you_hear_about_us_id =
          staffData.howDidYouHearAboutUsID;
        delete decamelizedData.how_did_you_hear_about_us_i_d;
      }

      console.log("createStaff: post-fix:", decamelizedData);

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.STAFF,
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
   * Gets details for a specific staff member
   * @param {string|number} staffId - The ID of the staff member
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Staff details
   */
  async getStaffDetail(staffId, onUnauthorizedCallback = null) {
    try {
      // Validate staff ID
      if (
        !staffId ||
        (typeof staffId !== "string" && typeof staffId !== "number")
      ) {
        throw {
          staffId: "Valid staff ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.STAFF_DETAIL.replace("{id}", staffId);

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      let data = camelizeKeys(response.data);

      // BUGFIX: Handle howDidYouHearAboutUs field correctly
      if (data.howDidYouHearAboutUsId) {
        data.howDidYouHearAboutUsID = data.howDidYouHearAboutUsId;
      }

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log("StaffAPI: Retrieved staff detail:", data);
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates a specific staff member
   * @param {string|number} staffId - The ID of the staff member
   * @param {Object} staffData - Staff data to update
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated staff data
   */
  async updateStaff(staffId, staffData, onUnauthorizedCallback = null) {
    try {
      // Validate staff ID
      if (
        !staffId ||
        (typeof staffId !== "string" && typeof staffId !== "number")
      ) {
        throw {
          staffId: "Valid staff ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      console.log("updateStaff: pre-fix:", staffData);

      // Convert camelCase to snake_case for API
      let decamelizedData = decamelizeKeys(staffData);

      // BUGFIX: Handle howDidYouHearAboutUs field correctly
      if (staffData.howDidYouHearAboutUsID) {
        decamelizedData.how_did_you_hear_about_us_id =
          staffData.howDidYouHearAboutUsID;
        delete decamelizedData.how_did_you_hear_about_us_i_d;
      }

      // BUGFIX: Ensure ID is properly set
      decamelizedData.id = staffData.id || staffId;
      delete decamelizedData.i_d;

      console.log("updateStaff: post-fix:", decamelizedData);

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.STAFF_DETAIL.replace("{id}", staffId);

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
   * Deletes a specific staff member
   * @param {string|number} staffId - The ID of the staff member to delete
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Delete response data
   */
  async deleteStaff(staffId, onUnauthorizedCallback = null) {
    try {
      // Validate staff ID
      if (
        !staffId ||
        (typeof staffId !== "string" && typeof staffId !== "number")
      ) {
        throw {
          staffId: "Valid staff ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.STAFF_DETAIL.replace("{id}", staffId);

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
   * Archives a specific staff member
   * @param {string|number} staffId - The ID of the staff member to archive
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Archive response data
   */
  async archiveStaff(staffId, onUnauthorizedCallback = null) {
    try {
      // Validate staff ID
      if (
        !staffId ||
        (typeof staffId !== "string" && typeof staffId !== "number")
      ) {
        throw {
          staffId: "Valid staff ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const data = {
        staff_id: staffId,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.STAFF_ARCHIVE_OPERATION,
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
   * Permanently deletes a specific staff member
   * @param {string|number} staffId - The ID of the staff member to permanently delete
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Permanent delete response data
   */
  async permanentlyDeleteStaff(staffId, onUnauthorizedCallback = null) {
    try {
      // Validate staff ID
      if (
        !staffId ||
        (typeof staffId !== "string" && typeof staffId !== "number")
      ) {
        throw {
          staffId: "Valid staff ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const data = {
        staff_id: staffId,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.STAFF_PERMANENTLY_DELETE_OPERATION,
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
   * Creates a comment for a staff member
   * @param {string|number} staffId - The ID of the staff member
   * @param {string} content - Comment content
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Comment creation response data
   */
  async createStaffComment(staffId, content, onUnauthorizedCallback = null) {
    try {
      // Validate parameters
      if (
        !staffId ||
        (typeof staffId !== "string" && typeof staffId !== "number")
      ) {
        throw {
          staffId: "Valid staff ID is required",
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
        staff_id: staffId,
        content: content,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.STAFF_CREATE_COMMENT_OPERATION,
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
   * Upgrades a staff member
   * @param {Object} decamelizedData - Already decamelized upgrade data
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Upgrade response data
   */
  async upgradeStaff(decamelizedData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.STAFF_UPGRADE_OPERATION,
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
   * Downgrades a staff member
   * @param {string|number} staffId - The ID of the staff member to downgrade
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Downgrade response data
   */
  async downgradeStaff(staffId, onUnauthorizedCallback = null) {
    try {
      // Validate staff ID
      if (
        !staffId ||
        (typeof staffId !== "string" && typeof staffId !== "number")
      ) {
        throw {
          staffId: "Valid staff ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      const data = {
        staff_id: staffId,
      };

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.STAFF_DOWNGRADE_OPERATION,
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
   * Uploads avatar for a staff member
   * @param {FormData} formData - Form data containing the avatar file
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Avatar upload response data
   */
  async uploadStaffAvatar(formData, onUnauthorizedCallback = null) {
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
        this.endpoints.STAFF_AVATAR_OPERATION,
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
   * Changes password for a staff member
   * @param {Object} passwordData - Password change data
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Password change response data
   */
  async changeStaffPassword(passwordData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert request data from camelCase to snake_case
      const decamelizedData = decamelizeKeys(passwordData);

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.STAFF_CHANGE_PASSWORD_OPERATION,
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
   * Changes two-factor authentication settings for a staff member
   * @param {Object} twoFactorData - 2FA change data
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - 2FA change response data
   */
  async changeStaffTwoFactorAuth(twoFactorData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.STAFF_CHANGE_2FA_OPERATION,
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
