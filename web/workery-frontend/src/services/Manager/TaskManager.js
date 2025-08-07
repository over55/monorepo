// File Path: monorepo/web/workery-frontend/src/services/Manager/TaskManager.js

/**
 * TaskManager handles all task-related business logic
 * Combines TaskAPI with TaskStorage for complete task management
 */
export class TaskManager {
  constructor(taskAPI, taskStorage) {
    this.taskAPI = taskAPI;
    this.taskStorage = taskStorage;
  }

  /**
   * Gets list of tasks with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Tasks list with pagination data
   */
  async getTasks(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedTasks = this.taskStorage.getTasksFromCache();
        if (cachedTasks) {
          return cachedTasks;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.taskStorage.isTasksCacheLoading()) {
        console.log("TaskManager: Tasks request already in progress");
        return this._waitForCurrentTasksRequest();
      }

      this.taskStorage.setTasksCacheLoading(true);

      console.log("TaskManager: Fetching fresh tasks data", params);

      try {
        // Validate and clean parameters
        const validatedParams = this._validateTasksParams(params);

        // Fetch fresh data from API
        const tasksData = await this.taskAPI.getTasks(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.taskStorage.saveTasksToCache(tasksData);

        console.log("TaskManager: Tasks data fetched successfully:", {
          count: tasksData.results ? tasksData.results.length : 0,
          totalCount: tasksData.count,
        });

        return tasksData;
      } finally {
        this.taskStorage.setTasksCacheLoading(false);
      }
    } catch (error) {
      this.taskStorage.setTasksCacheLoading(false);
      console.error("TaskManager: Failed to get tasks", error);
      throw error;
    }
  }

  /**
   * Gets task count with caching
   * @param {Object} params - Query parameters for filtering
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Task count data
   */
  async getTaskCount(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedTaskCount = this.taskStorage.getTaskCountFromCache();
        if (cachedTaskCount) {
          return cachedTaskCount;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.taskStorage.isTaskCountCacheLoading()) {
        console.log("TaskManager: Task count request already in progress");
        return this._waitForCurrentTaskCountRequest();
      }

      this.taskStorage.setTaskCountCacheLoading(true);

      console.log("TaskManager: Fetching fresh task count data", params);

      try {
        // Validate and clean parameters
        const validatedParams = this._validateTaskCountParams(params);

        // Fetch fresh data from API
        const taskCountData = await this.taskAPI.getTaskCount(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.taskStorage.saveTaskCountToCache(taskCountData);

        console.log("TaskManager: Task count data fetched successfully:", {
          count: taskCountData.count || taskCountData.total,
        });

        return taskCountData;
      } finally {
        this.taskStorage.setTaskCountCacheLoading(false);
      }
    } catch (error) {
      this.taskStorage.setTaskCountCacheLoading(false);
      console.error("TaskManager: Failed to get task count", error);
      throw error;
    }
  }

  /**
   * Creates a new task with validation
   * @param {Object} taskData - Task data to create
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Created task data
   */
  async createTask(taskData, onUnauthorizedCallback = null) {
    try {
      // Validate task data
      const validationErrors = this._validateTaskData(taskData, true);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("TaskManager: Creating new task");

      // Call API to create task
      const createdTaskData = await this.taskAPI.createTask(
        taskData,
        onUnauthorizedCallback,
      );

      // Clear tasks cache since new data has been added
      this.taskStorage.clearTasksCache();
      this.taskStorage.clearTaskCountCache();

      console.log("TaskManager: Task created successfully:", {
        id: createdTaskData.id,
        title: createdTaskData.title,
      });

      return createdTaskData;
    } catch (error) {
      console.error("TaskManager: Failed to create task", error);
      throw error;
    }
  }

  /**
   * Gets details for a specific task
   * @param {string|number} taskId - The ID of the task
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Task details
   */
  async getTaskDetail(taskId, onUnauthorizedCallback = null) {
    try {
      // Validate task ID
      const validationError = this._validateTaskId(taskId);
      if (validationError) {
        throw validationError;
      }

      console.log(`TaskManager: Fetching task detail for ID ${taskId}`);

      // Call API to get task details
      const taskData = await this.taskAPI.getTaskDetail(
        taskId,
        onUnauthorizedCallback,
      );

      console.log("TaskManager: Task detail fetched successfully:", {
        id: taskData.id,
        title: taskData.title,
      });

      return taskData;
    } catch (error) {
      console.error("TaskManager: Failed to get task detail", error);
      throw error;
    }
  }

  /**
   * Updates a specific task
   * @param {string|number} taskId - The ID of the task
   * @param {Object} taskData - Task data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated task data
   */
  async updateTask(taskId, taskData, onUnauthorizedCallback = null) {
    try {
      // Validate task ID
      const taskIdError = this._validateTaskId(taskId);
      if (taskIdError) {
        throw taskIdError;
      }

      // Validate task data
      const validationErrors = this._validateTaskData(taskData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(`TaskManager: Updating task ID ${taskId}`);

      // Call API to update task
      const updatedTaskData = await this.taskAPI.updateTask(
        taskId,
        taskData,
        onUnauthorizedCallback,
      );

      // Clear tasks cache since data has been updated
      this.taskStorage.clearTasksCache();
      this.taskStorage.clearTaskCountCache();

      console.log("TaskManager: Task updated successfully");

      return updatedTaskData;
    } catch (error) {
      console.error("TaskManager: Failed to update task", error);
      throw error;
    }
  }

  /**
   * Deletes a specific task
   * @param {string|number} taskId - The ID of the task to delete
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Delete response
   */
  async deleteTask(taskId, onUnauthorizedCallback = null) {
    try {
      // Validate task ID
      const validationError = this._validateTaskId(taskId);
      if (validationError) {
        throw validationError;
      }

      console.log(`TaskManager: Deleting task ID ${taskId}`);

      // Call API to delete task
      const deleteResponse = await this.taskAPI.deleteTask(
        taskId,
        onUnauthorizedCallback,
      );

      // Clear tasks cache since data has been updated
      this.taskStorage.clearTasksCache();
      this.taskStorage.clearTaskCountCache();
      this.taskStorage.clearAssignableAssociatesCache(taskId);

      console.log("TaskManager: Task deleted successfully");

      return deleteResponse;
    } catch (error) {
      console.error("TaskManager: Failed to delete task", error);
      throw error;
    }
  }

  /**
   * Gets assignable associates for a task with caching
   * @param {string|number} taskId - The ID of the task
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Assignable associates data
   */
  async getAssignableAssociates(
    taskId,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Validate task ID
      const validationError = this._validateTaskId(taskId);
      if (validationError) {
        throw validationError;
      }

      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedAssociates =
          this.taskStorage.getAssignableAssociatesFromCache(taskId);
        if (cachedAssociates) {
          return cachedAssociates;
        }
      }

      // Prevent multiple simultaneous requests for the same task
      if (this.taskStorage.isAssignableAssociatesCacheLoading(taskId)) {
        console.log(
          `TaskManager: Assignable associates request already in progress for task ${taskId}`,
        );
        return this._waitForCurrentAssignableAssociatesRequest(taskId);
      }

      this.taskStorage.setAssignableAssociatesCacheLoading(taskId, true);

      console.log(
        `TaskManager: Fetching fresh assignable associates data for task ${taskId}`,
      );

      try {
        // Fetch fresh data from API
        const associatesData = await this.taskAPI.getAssignableAssociates(
          taskId,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.taskStorage.saveAssignableAssociatesToCache(
          taskId,
          associatesData,
        );

        console.log(
          "TaskManager: Assignable associates data fetched successfully:",
          {
            taskId: taskId,
            count: associatesData.results ? associatesData.results.length : 0,
          },
        );

        return associatesData;
      } finally {
        this.taskStorage.setAssignableAssociatesCacheLoading(taskId, false);
      }
    } catch (error) {
      this.taskStorage.setAssignableAssociatesCacheLoading(taskId, false);
      console.error("TaskManager: Failed to get assignable associates", error);
      throw error;
    }
  }

  /**
   * Assigns an associate to a task
   * @param {Object} assignmentData - Assignment data (will be decamelized)
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Assignment response
   */
  async assignAssociate(assignmentData, onUnauthorizedCallback = null) {
    try {
      // Validate assignment data
      const validationErrors = this._validateAssignmentData(assignmentData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("TaskManager: Assigning associate to task");

      // Call API to assign associate (data should already be decamelized)
      const assignmentResponse = await this.taskAPI.assignAssociate(
        assignmentData,
        onUnauthorizedCallback,
      );

      // Clear related caches since data has been updated
      this.taskStorage.clearTasksCache();
      this.taskStorage.clearTaskCountCache();

      // Clear assignable associates cache for the task if taskId is available
      if (assignmentData.task_id || assignmentData.taskId) {
        const taskId = assignmentData.task_id || assignmentData.taskId;
        this.taskStorage.clearAssignableAssociatesCache(taskId);
      }

      console.log("TaskManager: Associate assigned successfully");

      return assignmentResponse;
    } catch (error) {
      console.error("TaskManager: Failed to assign associate", error);
      throw error;
    }
  }

  /**
   * Completes a task/order
   * @param {Object} completionData - Completion data (will be decamelized)
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Completion response
   */
  async completeOrder(completionData, onUnauthorizedCallback = null) {
    try {
      // Validate completion data
      const validationErrors = this._validateCompletionData(completionData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("TaskManager: Completing task/order");

      // Call API to complete order (data should already be decamelized)
      const completionResponse = await this.taskAPI.completeOrder(
        completionData,
        onUnauthorizedCallback,
      );

      // Clear related caches since data has been updated
      this.taskStorage.clearTasksCache();
      this.taskStorage.clearTaskCountCache();

      console.log("TaskManager: Task/order completed successfully");

      return completionResponse;
    } catch (error) {
      console.error("TaskManager: Failed to complete task/order", error);
      throw error;
    }
  }

  /**
   * Submits a task survey
   * @param {Object} surveyData - Survey data (will be decamelized)
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Survey response
   */
  async submitSurvey(surveyData, onUnauthorizedCallback = null) {
    try {
      // Validate survey data
      const validationErrors = this._validateSurveyData(surveyData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("TaskManager: Submitting task survey");

      // Call API to submit survey (data should already be decamelized)
      const surveyResponse = await this.taskAPI.submitSurvey(
        surveyData,
        onUnauthorizedCallback,
      );

      // Clear related caches since data has been updated
      this.taskStorage.clearTasksCache();
      this.taskStorage.clearTaskCountCache();

      console.log("TaskManager: Task survey submitted successfully");

      return surveyResponse;
    } catch (error) {
      console.error("TaskManager: Failed to submit task survey", error);
      throw error;
    }
  }

  /**
   * Postpones a task
   * @param {Object} postponeData - Postpone data (will be decamelized)
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Postpone response
   */
  async postponeTask(postponeData, onUnauthorizedCallback = null) {
    try {
      // Validate postpone data
      const validationErrors = this._validatePostponeData(postponeData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("TaskManager: Postponing task");

      // Call API to postpone task (data should already be decamelized)
      const postponeResponse = await this.taskAPI.postponeTask(
        postponeData,
        onUnauthorizedCallback,
      );

      // Clear related caches since data has been updated
      this.taskStorage.clearTasksCache();
      this.taskStorage.clearTaskCountCache();

      console.log("TaskManager: Task postponed successfully");

      return postponeResponse;
    } catch (error) {
      console.error("TaskManager: Failed to postpone task", error);
      throw error;
    }
  }

  /**
   * Closes a task
   * @param {Object} closeData - Close data (will be decamelized)
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Close response
   */
  async closeTask(closeData, onUnauthorizedCallback = null) {
    try {
      // Validate close data
      const validationErrors = this._validateCloseData(closeData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("TaskManager: Closing task");

      // Call API to close task (data should already be decamelized)
      const closeResponse = await this.taskAPI.closeTask(
        closeData,
        onUnauthorizedCallback,
      );

      // Clear related caches since data has been updated
      this.taskStorage.clearTasksCache();
      this.taskStorage.clearTaskCountCache();

      console.log("TaskManager: Task closed successfully");

      return closeResponse;
    } catch (error) {
      console.error("TaskManager: Failed to close task", error);
      throw error;
    }
  }

  /**
   * Gets task preferences
   * @returns {Object|null} - Task preferences or null
   */
  getTaskPreferences() {
    return this.taskStorage.getTaskPreferences();
  }

  /**
   * Saves task preferences
   * @param {Object} preferences - Preferences object
   */
  saveTaskPreferences(preferences) {
    this.taskStorage.saveTaskPreferences(preferences);
  }

  /**
   * Clears the tasks cache
   */
  clearTasksCache() {
    this.taskStorage.clearTasksCache();
  }

  /**
   * Clears the task count cache
   */
  clearTaskCountCache() {
    this.taskStorage.clearTaskCountCache();
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.taskStorage.clearAllCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getTasksCacheInfo() {
    return this.taskStorage.getTasksCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setTasksCacheDuration(durationMs) {
    this.taskStorage.setCacheDuration(durationMs);
  }

  /**
   * Sets task count cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setTaskCountCacheDuration(durationMs) {
    this.taskStorage.setTaskCountCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getTasksWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getTasks(params, onUnauthorizedCallback, forceRefresh)
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

  getTaskCountWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getTaskCount(params, onUnauthorizedCallback, forceRefresh)
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

  createTaskWithCallbacks(
    taskData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createTask(taskData, onUnauthorizedCallback)
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

  getTaskDetailWithCallbacks(
    taskId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getTaskDetail(taskId, onUnauthorizedCallback)
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

  updateTaskWithCallbacks(
    taskId,
    taskData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateTask(taskId, taskData, onUnauthorizedCallback)
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

  deleteTaskWithCallbacks(
    taskId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.deleteTask(taskId, onUnauthorizedCallback)
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

  getAssignableAssociatesWithCallbacks(
    taskId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getAssignableAssociates(taskId, onUnauthorizedCallback, forceRefresh)
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

  assignAssociateWithCallbacks(
    assignmentData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.assignAssociate(assignmentData, onUnauthorizedCallback)
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

  completeOrderWithCallbacks(
    completionData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.completeOrder(completionData, onUnauthorizedCallback)
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

  submitSurveyWithCallbacks(
    surveyData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.submitSurvey(surveyData, onUnauthorizedCallback)
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

  postponeTaskWithCallbacks(
    postponeData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.postponeTask(postponeData, onUnauthorizedCallback)
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

  closeTaskWithCallbacks(
    closeData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.closeTask(closeData, onUnauthorizedCallback)
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
   * Private validation methods
   */

  _validateTaskId(taskId) {
    if (!taskId || (typeof taskId !== "string" && typeof taskId !== "number")) {
      return { taskId: "Valid task ID is required" };
    }
    return null;
  }

  _validateTasksParams(params) {
    const validatedParams = {};

    // Validate pagination
    if (params.page && typeof params.page === "number" && params.page > 0) {
      validatedParams.page = params.page;
    }

    if (
      params.limit &&
      typeof params.limit === "number" &&
      params.limit > 0 &&
      params.limit <= 1000
    ) {
      validatedParams.limit = params.limit;
    }

    // Validate search
    if (
      params.search &&
      typeof params.search === "string" &&
      params.search.trim()
    ) {
      validatedParams.search = params.search.trim();
    }

    // Validate sorting
    if (params.sortBy && typeof params.sortBy === "string") {
      const allowedSortFields = [
        "title",
        "description",
        "created_at",
        "updated_at",
        "status",
        "type",
        "due_date",
      ];
      if (allowedSortFields.includes(params.sortBy)) {
        validatedParams.sortBy = params.sortBy;

        if (params.sortOrder && ["ASC", "DESC"].includes(params.sortOrder)) {
          validatedParams.sortOrder = params.sortOrder;
        } else {
          validatedParams.sortOrder = "ASC";
        }
      }
    }

    // Validate filters
    if (params.status && typeof params.status === "string") {
      validatedParams.status = params.status;
    }

    if (params.type && typeof params.type === "string") {
      validatedParams.type = params.type;
    }

    return validatedParams;
  }

  _validateTaskCountParams(params) {
    const validatedParams = {};

    // Only include filtering parameters for count
    if (params.status && typeof params.status === "string") {
      validatedParams.status = params.status;
    }

    if (params.type && typeof params.type === "string") {
      validatedParams.type = params.type;
    }

    if (
      params.search &&
      typeof params.search === "string" &&
      params.search.trim()
    ) {
      validatedParams.search = params.search.trim();
    }

    return validatedParams;
  }

  _validateTaskData(taskData, isCreate = false) {
    const errors = {};

    if (!taskData || typeof taskData !== "object") {
      errors.general = "Task data is required";
      return errors;
    }

    // Validate title (required for create, optional for update)
    if (isCreate && (!taskData.title || !taskData.title.trim())) {
      errors.title = "Task title is required";
    } else if (taskData.title && taskData.title.length > 100) {
      errors.title = "Task title must be less than 100 characters";
    }

    // Validate description (optional)
    if (taskData.description && taskData.description.length > 1000) {
      errors.description = "Description must be less than 1000 characters";
    }

    // Validate type (optional)
    if (taskData.type !== undefined) {
      const validTypes = [1, 2, 3, 4, 5]; // Update with actual valid types
      if (!validTypes.includes(taskData.type)) {
        errors.type = "Invalid task type";
      }
    }

    // Validate status (optional)
    if (taskData.status !== undefined) {
      const validStatuses = [1, 2, 3, 4]; // Update with actual valid statuses
      if (!validStatuses.includes(taskData.status)) {
        errors.status = "Invalid task status";
      }
    }

    return errors;
  }

  _validateAssignmentData(assignmentData) {
    const errors = {};

    if (!assignmentData || typeof assignmentData !== "object") {
      errors.general = "Assignment data is required";
      return errors;
    }

    // Basic validation - adjust according to your API requirements
    const taskId = assignmentData.task_id || assignmentData.taskId;
    const associateId =
      assignmentData.associate_id || assignmentData.associateId;

    if (!taskId) {
      errors.taskId = "Task ID is required";
    }

    if (!associateId) {
      errors.associateId = "Associate ID is required";
    }

    return errors;
  }

  _validateCompletionData(completionData) {
    const errors = {};

    if (!completionData || typeof completionData !== "object") {
      errors.general = "Completion data is required";
      return errors;
    }

    // Basic validation - adjust according to your API requirements
    const taskId = completionData.task_id || completionData.taskId;

    if (!taskId) {
      errors.taskId = "Task ID is required";
    }

    return errors;
  }

  _validateSurveyData(surveyData) {
    const errors = {};

    if (!surveyData || typeof surveyData !== "object") {
      errors.general = "Survey data is required";
      return errors;
    }

    // Basic validation - adjust according to your API requirements
    const taskId = surveyData.task_id || surveyData.taskId;

    if (!taskId) {
      errors.taskId = "Task ID is required";
    }

    return errors;
  }

  _validatePostponeData(postponeData) {
    const errors = {};

    if (!postponeData || typeof postponeData !== "object") {
      errors.general = "Postpone data is required";
      return errors;
    }

    // Basic validation - adjust according to your API requirements
    const taskId = postponeData.task_id || postponeData.taskId;

    if (!taskId) {
      errors.taskId = "Task ID is required";
    }

    return errors;
  }

  _validateCloseData(closeData) {
    const errors = {};

    if (!closeData || typeof closeData !== "object") {
      errors.general = "Close data is required";
      return errors;
    }

    // Basic validation - adjust according to your API requirements
    const taskId = closeData.task_id || closeData.taskId;

    if (!taskId) {
      errors.taskId = "Task ID is required";
    }

    return errors;
  }

  /**
   * Waits for current tasks request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentTasksRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.taskStorage.isTasksCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.taskStorage.getTasksFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Tasks request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Tasks request timeout"));
      }, 30000);
    });
  }

  /**
   * Waits for current task count request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentTaskCountRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.taskStorage.isTaskCountCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.taskStorage.getTaskCountFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Task count request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Task count request timeout"));
      }, 30000);
    });
  }

  /**
   * Waits for current assignable associates request to complete
   * @private
   * @param {string|number} taskId - The task ID
   * @returns {Promise<Object>}
   */
  _waitForCurrentAssignableAssociatesRequest(taskId) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.taskStorage.isAssignableAssociatesCacheLoading(taskId)) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData =
            this.taskStorage.getAssignableAssociatesFromCache(taskId);
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Assignable associates request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Assignable associates request timeout"));
      }, 30000);
    });
  }
}
