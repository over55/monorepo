// File Path: monorepo/web/workery-frontend/src/services/API/TaskAPI.js

import { camelizeKeys, decamelizeKeys } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * TaskAPI handles all task-related API calls
 */
export class TaskAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("TaskAPI initialized with:", {
        baseURL: this.baseURL,
        tasksEndpoint: this.endpoints.TASKS,
        taskDetailEndpoint: this.endpoints.TASK_DETAIL,
        taskCountEndpoint: this.endpoints.TASK_COUNT,
        taskAssignableAssociatesEndpoint:
          this.endpoints.TASK_ASSIGNABLE_ASSOCIATES,
      });
    }
  }

  /**
   * Gets list of tasks with optional filtering, sorting, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder, status, etc. }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Tasks list with pagination data
   */
  async getTasks(params = {}, onUnauthorizedCallback = null) {
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
        ? `${this.endpoints.TASKS}?${queryString}`
        : this.endpoints.TASKS;

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
   * Gets count of tasks with optional filtering
   * @param {Object} params - Query parameters for filtering
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Task count data
   */
  async getTaskCount(params = {}, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add filters
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
        ? `${this.endpoints.TASK_COUNT}?${queryString}`
        : this.endpoints.TASK_COUNT;

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
   * Creates a new task
   * @param {Object} taskData - Task data to create
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Created task data
   */
  async createTask(taskData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      const decamelizedData = decamelizeKeys(taskData);

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.TASKS,
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
   * Gets details for a specific task
   * @param {string|number} taskId - The ID of the task
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Task details
   */
  async getTaskDetail(taskId, onUnauthorizedCallback = null) {
    try {
      // Validate task ID
      if (
        !taskId ||
        (typeof taskId !== "string" && typeof taskId !== "number")
      ) {
        throw {
          taskId: "Valid task ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.TASK_DETAIL.replace("{id}", taskId);

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      // Handle legacy field mappings for backward compatibility
      try {
        if (data.customerId) data.customerID = data.customerId;
        if (data.associateId) data.associateID = data.associateId;
        if (data.associateServiceFeeId)
          data.associateServiceFeeID = data.associateServiceFeeId;
      } catch (e) {
        console.log("TaskAPI: Field mapping exception:", e);
      }

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log("TaskAPI: Retrieved task detail:", data);
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates a specific task
   * @param {string|number} taskId - The ID of the task
   * @param {Object} taskData - Task data to update
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Updated task data
   */
  async updateTask(taskId, taskData, onUnauthorizedCallback = null) {
    try {
      // Validate task ID
      if (
        !taskId ||
        (typeof taskId !== "string" && typeof taskId !== "number")
      ) {
        throw {
          taskId: "Valid task ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Convert camelCase to snake_case for API
      const decamelizedData = decamelizeKeys(taskData);

      // Minor fix for ID field mapping
      if (decamelizedData.i_d) {
        decamelizedData.id = decamelizedData.i_d;
        delete decamelizedData.i_d;
      } else {
        decamelizedData.id = taskId;
      }

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.TASK_DETAIL.replace("{id}", taskId);

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
   * Deletes a specific task
   * @param {string|number} taskId - The ID of the task to delete
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Delete response data
   */
  async deleteTask(taskId, onUnauthorizedCallback = null) {
    try {
      // Validate task ID
      if (
        !taskId ||
        (typeof taskId !== "string" && typeof taskId !== "number")
      ) {
        throw {
          taskId: "Valid task ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.TASK_DETAIL.replace("{id}", taskId);

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
   * Gets assignable associates for a specific task
   * @param {string|number} taskId - The ID of the task
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Assignable associates data
   */
  async getAssignableAssociates(taskId, onUnauthorizedCallback = null) {
    try {
      // Validate task ID
      if (
        !taskId ||
        (typeof taskId !== "string" && typeof taskId !== "number")
      ) {
        throw {
          taskId: "Valid task ID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Replace {id} placeholder in endpoint
      const url = this.endpoints.TASK_ASSIGNABLE_ASSOCIATES.replace(
        "{id}",
        taskId,
      );

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
   * Assigns an associate to a task
   * @param {Object} assignmentData - Assignment data (already decamelized)
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Assignment response data
   */
  async assignAssociate(assignmentData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Data should already be decamelized when passed to this method
      const decamelizedData = assignmentData;

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.TASK_ASSIGN_ASSOCIATE_OPERATION,
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
   * Completes a task/order
   * @param {Object} completionData - Completion data (already decamelized)
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Completion response data
   */
  async completeOrder(completionData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Data should already be decamelized when passed to this method
      const decamelizedData = completionData;

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.TASK_ORDER_COMPLETION_OPERATION,
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
   * Submits a task survey
   * @param {Object} surveyData - Survey data (already decamelized)
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Survey response data
   */
  async submitSurvey(surveyData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Data should already be decamelized when passed to this method
      const decamelizedData = surveyData;

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.TASK_SURVEY_OPERATION,
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
   * Postpones a task
   * @param {Object} postponeData - Postpone data (already decamelized)
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Postpone response data
   */
  async postponeTask(postponeData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Data should already be decamelized when passed to this method
      const decamelizedData = postponeData;

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.TASK_POSTPONE_OPERATION,
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
   * Closes a task
   * @param {Object} closeData - Close data (already decamelized)
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Close response data
   */
  async closeTask(closeData, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Data should already be decamelized when passed to this method
      const decamelizedData = closeData;

      // Make the API call
      const response = await authenticatedAxios.post(
        this.endpoints.TASK_CLOSE_OPERATION,
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
