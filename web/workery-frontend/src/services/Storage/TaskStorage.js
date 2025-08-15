// File Path: web/workery-frontend/src/services/Storage/TaskStorage.js

import { STORAGE_KEYS, CACHE_DURATIONS } from "../../constants/Storage";

/**
 * TaskStorage handles all task-related data storage operations
 * Manages task caching, local storage, and data persistence
 */
export class TaskStorage {
  constructor() {
    // Use constants from Storage.js
    this.TASKS_CACHE_KEY = STORAGE_KEYS.TASKS_CACHE;
    this.TASKS_TIMESTAMP_KEY = STORAGE_KEYS.TASKS_TIMESTAMP;
    this.TASK_COUNT_CACHE_KEY = STORAGE_KEYS.TASK_COUNT_CACHE;
    this.TASK_COUNT_TIMESTAMP_KEY = STORAGE_KEYS.TASK_COUNT_TIMESTAMP;
    this.TASK_ASSIGNABLE_ASSOCIATES_CACHE_KEY =
      STORAGE_KEYS.TASK_ASSIGNABLE_ASSOCIATES_CACHE;
    this.TASK_ASSIGNABLE_ASSOCIATES_TIMESTAMP_KEY =
      STORAGE_KEYS.TASK_ASSIGNABLE_ASSOCIATES_TIMESTAMP;

    // Use cache durations from constants
    this.DEFAULT_CACHE_DURATION = CACHE_DURATIONS.DEFAULT_TASKS;
    this.COUNT_CACHE_DURATION = CACHE_DURATIONS.TASK_COUNT;
    this.ASSOCIATES_CACHE_DURATION = CACHE_DURATIONS.ASSIGNABLE_ASSOCIATES;

    // In-memory cache for current session
    this.memoryCache = {
      tasks: null,
      tasksTimestamp: null,
      isTasksLoading: false,
      taskCount: null,
      taskCountTimestamp: null,
      isTaskCountLoading: false,
      assignableAssociates: new Map(), // Map of taskId -> associates data
      assignableAssociatesTimestamps: new Map(), // Map of taskId -> timestamp
      isAssignableAssociatesLoading: new Set(), // Set of taskIds currently loading
    };

    if (process.env.NODE_ENV === "development") {
      console.log("TaskStorage initialized");
    }
  }

  /**
   * Gets tasks list from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached tasks data or null if not found/expired
   */
  getTasksFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isTasksMemoryCacheValid(maxAge)) {
      console.log("TaskStorage: Using memory cache for tasks list");
      return this.memoryCache.tasks;
    }

    // Check localStorage cache
    try {
      const cachedTasks = localStorage.getItem(this.TASKS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(this.TASKS_TIMESTAMP_KEY);

      if (cachedTasks && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const tasksData = JSON.parse(cachedTasks);

          // Update memory cache with localStorage data
          this.memoryCache.tasks = tasksData;
          this.memoryCache.tasksTimestamp = timestamp;
          this.memoryCache.isTasksLoading = false;

          console.log("TaskStorage: Using localStorage cache for tasks list");
          return tasksData;
        } else {
          console.log("TaskStorage: localStorage cache expired, clearing");
          this._clearTasksLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "TaskStorage: Error reading tasks from localStorage",
        error,
      );
      this._clearTasksLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves tasks list to cache (both memory and localStorage)
   * @param {Object} tasksData - Tasks data to cache
   */
  saveTasksToCache(tasksData) {
    if (!tasksData) {
      console.warn("TaskStorage: Attempted to save null/undefined tasks data");
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.tasks = tasksData;
    this.memoryCache.tasksTimestamp = timestamp;
    this.memoryCache.isTasksLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(this.TASKS_CACHE_KEY, JSON.stringify(tasksData));
      localStorage.setItem(this.TASKS_TIMESTAMP_KEY, timestamp.toString());

      console.log("TaskStorage: Tasks list cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        count: tasksData.results ? tasksData.results.length : 0,
      });
    } catch (error) {
      console.error("TaskStorage: Error saving tasks to localStorage", error);
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets task count from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached task count data or null if not found/expired
   */
  getTaskCountFromCache(maxAge = this.COUNT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isTaskCountMemoryCacheValid(maxAge)) {
      console.log("TaskStorage: Using memory cache for task count");
      return this.memoryCache.taskCount;
    }

    // Check localStorage cache
    try {
      const cachedTaskCount = localStorage.getItem(this.TASK_COUNT_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(
        this.TASK_COUNT_TIMESTAMP_KEY,
      );

      if (cachedTaskCount && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const taskCountData = JSON.parse(cachedTaskCount);

          // Update memory cache with localStorage data
          this.memoryCache.taskCount = taskCountData;
          this.memoryCache.taskCountTimestamp = timestamp;
          this.memoryCache.isTaskCountLoading = false;

          console.log("TaskStorage: Using localStorage cache for task count");
          return taskCountData;
        } else {
          console.log("TaskStorage: Task count cache expired, clearing");
          this._clearTaskCountLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "TaskStorage: Error reading task count from localStorage",
        error,
      );
      this._clearTaskCountLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves task count to cache (both memory and localStorage)
   * @param {Object} taskCountData - Task count data to cache
   */
  saveTaskCountToCache(taskCountData) {
    if (!taskCountData) {
      console.warn(
        "TaskStorage: Attempted to save null/undefined task count data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.taskCount = taskCountData;
    this.memoryCache.taskCountTimestamp = timestamp;
    this.memoryCache.isTaskCountLoading = false;

    // Save to localStorage
    try {
      localStorage.setItem(
        this.TASK_COUNT_CACHE_KEY,
        JSON.stringify(taskCountData),
      );
      localStorage.setItem(this.TASK_COUNT_TIMESTAMP_KEY, timestamp.toString());

      console.log("TaskStorage: Task count cached successfully", {
        timestamp: new Date(timestamp).toISOString(),
        count: taskCountData.count || taskCountData.total || "N/A",
      });
    } catch (error) {
      console.error(
        "TaskStorage: Error saving task count to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Gets assignable associates for a task from cache (memory first, then localStorage)
   * @param {string|number} taskId - The task ID
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached assignable associates data or null if not found/expired
   */
  getAssignableAssociatesFromCache(
    taskId,
    maxAge = this.ASSOCIATES_CACHE_DURATION,
  ) {
    const taskIdStr = String(taskId);

    // Check memory cache first (fastest)
    if (this._isAssignableAssociatesMemoryCacheValid(taskIdStr, maxAge)) {
      console.log(
        `TaskStorage: Using memory cache for assignable associates for task ${taskId}`,
      );
      return this.memoryCache.assignableAssociates.get(taskIdStr);
    }

    // Check localStorage cache
    try {
      const cacheKey = `${this.TASK_ASSIGNABLE_ASSOCIATES_CACHE_KEY}_${taskIdStr}`;
      const timestampKey = `${this.TASK_ASSIGNABLE_ASSOCIATES_TIMESTAMP_KEY}_${taskIdStr}`;

      const cachedAssociates = localStorage.getItem(cacheKey);
      const cachedTimestamp = localStorage.getItem(timestampKey);

      if (cachedAssociates && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const associatesData = JSON.parse(cachedAssociates);

          // Update memory cache with localStorage data
          this.memoryCache.assignableAssociates.set(taskIdStr, associatesData);
          this.memoryCache.assignableAssociatesTimestamps.set(
            taskIdStr,
            timestamp,
          );

          console.log(
            `TaskStorage: Using localStorage cache for assignable associates for task ${taskId}`,
          );
          return associatesData;
        } else {
          console.log(
            `TaskStorage: Assignable associates cache expired for task ${taskId}, clearing`,
          );
          this._clearAssignableAssociatesLocalStorageCache(taskIdStr);
        }
      }
    } catch (error) {
      console.error(
        `TaskStorage: Error reading assignable associates for task ${taskId} from localStorage`,
        error,
      );
      this._clearAssignableAssociatesLocalStorageCache(taskIdStr);
    }

    return null;
  }

  /**
   * Saves assignable associates for a task to cache (both memory and localStorage)
   * @param {string|number} taskId - The task ID
   * @param {Object} associatesData - Assignable associates data to cache
   */
  saveAssignableAssociatesToCache(taskId, associatesData) {
    if (!associatesData) {
      console.warn(
        `TaskStorage: Attempted to save null/undefined assignable associates data for task ${taskId}`,
      );
      return;
    }

    const taskIdStr = String(taskId);
    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache.assignableAssociates.set(taskIdStr, associatesData);
    this.memoryCache.assignableAssociatesTimestamps.set(taskIdStr, timestamp);
    this.memoryCache.isAssignableAssociatesLoading.delete(taskIdStr);

    // Save to localStorage
    try {
      const cacheKey = `${this.TASK_ASSIGNABLE_ASSOCIATES_CACHE_KEY}_${taskIdStr}`;
      const timestampKey = `${this.TASK_ASSIGNABLE_ASSOCIATES_TIMESTAMP_KEY}_${taskIdStr}`;

      localStorage.setItem(cacheKey, JSON.stringify(associatesData));
      localStorage.setItem(timestampKey, timestamp.toString());

      console.log(
        `TaskStorage: Assignable associates cached successfully for task ${taskId}`,
        {
          timestamp: new Date(timestamp).toISOString(),
          count: associatesData.results ? associatesData.results.length : 0,
        },
      );
    } catch (error) {
      console.error(
        `TaskStorage: Error saving assignable associates for task ${taskId} to localStorage`,
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears tasks cache (memory and localStorage)
   */
  clearTasksCache() {
    // Clear memory cache
    this.memoryCache.tasks = null;
    this.memoryCache.tasksTimestamp = null;
    this.memoryCache.isTasksLoading = false;

    // Clear localStorage cache
    this._clearTasksLocalStorageCache();

    console.log("TaskStorage: Tasks cache cleared");
  }

  /**
   * Clears task count cache (memory and localStorage)
   */
  clearTaskCountCache() {
    // Clear memory cache
    this.memoryCache.taskCount = null;
    this.memoryCache.taskCountTimestamp = null;
    this.memoryCache.isTaskCountLoading = false;

    // Clear localStorage cache
    this._clearTaskCountLocalStorageCache();

    console.log("TaskStorage: Task count cache cleared");
  }

  /**
   * Clears assignable associates cache for a specific task
   * @param {string|number} taskId - The task ID
   */
  clearAssignableAssociatesCache(taskId) {
    const taskIdStr = String(taskId);

    // Clear memory cache
    this.memoryCache.assignableAssociates.delete(taskIdStr);
    this.memoryCache.assignableAssociatesTimestamps.delete(taskIdStr);
    this.memoryCache.isAssignableAssociatesLoading.delete(taskIdStr);

    // Clear localStorage cache
    this._clearAssignableAssociatesLocalStorageCache(taskIdStr);

    console.log(
      `TaskStorage: Assignable associates cache cleared for task ${taskId}`,
    );
  }

  /**
   * Clears all assignable associates caches
   */
  clearAllAssignableAssociatesCache() {
    // Clear memory cache
    this.memoryCache.assignableAssociates.clear();
    this.memoryCache.assignableAssociatesTimestamps.clear();
    this.memoryCache.isAssignableAssociatesLoading.clear();

    // Clear localStorage cache for all tasks
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith(this.TASK_ASSIGNABLE_ASSOCIATES_CACHE_KEY) ||
            key.startsWith(this.TASK_ASSIGNABLE_ASSOCIATES_TIMESTAMP_KEY))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error(
        "TaskStorage: Error clearing all assignable associates cache",
        error,
      );
    }

    console.log("TaskStorage: All assignable associates caches cleared");
  }

  /**
   * Clears all task caches
   */
  clearAllCache() {
    this.clearTasksCache();
    this.clearTaskCountCache();
    this.clearAllAssignableAssociatesCache();
    console.log("TaskStorage: All caches cleared");
  }

  /**
   * Sets loading state for tasks cache
   * @param {boolean} isLoading - Loading state
   */
  setTasksCacheLoading(isLoading) {
    this.memoryCache.isTasksLoading = isLoading;
  }

  /**
   * Gets loading state from tasks cache
   * @returns {boolean} - Current loading state
   */
  isTasksCacheLoading() {
    return this.memoryCache.isTasksLoading;
  }

  /**
   * Sets loading state for task count cache
   * @param {boolean} isLoading - Loading state
   */
  setTaskCountCacheLoading(isLoading) {
    this.memoryCache.isTaskCountLoading = isLoading;
  }

  /**
   * Gets loading state from task count cache
   * @returns {boolean} - Current loading state
   */
  isTaskCountCacheLoading() {
    return this.memoryCache.isTaskCountLoading;
  }

  /**
   * Sets loading state for assignable associates cache
   * @param {string|number} taskId - The task ID
   * @param {boolean} isLoading - Loading state
   */
  setAssignableAssociatesCacheLoading(taskId, isLoading) {
    const taskIdStr = String(taskId);
    if (isLoading) {
      this.memoryCache.isAssignableAssociatesLoading.add(taskIdStr);
    } else {
      this.memoryCache.isAssignableAssociatesLoading.delete(taskIdStr);
    }
  }

  /**
   * Gets loading state from assignable associates cache
   * @param {string|number} taskId - The task ID
   * @returns {boolean} - Current loading state
   */
  isAssignableAssociatesCacheLoading(taskId) {
    const taskIdStr = String(taskId);
    return this.memoryCache.isAssignableAssociatesLoading.has(taskIdStr);
  }

  /**
   * Gets cache information for debugging
   * @returns {Object} - Cache state information
   */
  getTasksCacheInfo() {
    const tasksMemoryValid = this._isTasksMemoryCacheValid();
    const tasksLocalStorageValid = this._isTasksLocalStorageCacheValid();
    const taskCountMemoryValid = this._isTaskCountMemoryCacheValid();
    const taskCountLocalStorageValid =
      this._isTaskCountLocalStorageCacheValid();

    return {
      tasks: {
        memoryCache: {
          hasData: !!this.memoryCache.tasks,
          timestamp: this.memoryCache.tasksTimestamp,
          age: this.memoryCache.tasksTimestamp
            ? Date.now() - this.memoryCache.tasksTimestamp
            : null,
          isValid: tasksMemoryValid,
          isLoading: this.memoryCache.isTasksLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.TASKS_CACHE_KEY),
          timestamp: localStorage.getItem(this.TASKS_TIMESTAMP_KEY),
          isValid: tasksLocalStorageValid,
        },
        cacheDuration: this.DEFAULT_CACHE_DURATION,
      },
      taskCount: {
        memoryCache: {
          hasData: !!this.memoryCache.taskCount,
          timestamp: this.memoryCache.taskCountTimestamp,
          age: this.memoryCache.taskCountTimestamp
            ? Date.now() - this.memoryCache.taskCountTimestamp
            : null,
          isValid: taskCountMemoryValid,
          isLoading: this.memoryCache.isTaskCountLoading,
        },
        localStorage: {
          hasData: !!localStorage.getItem(this.TASK_COUNT_CACHE_KEY),
          timestamp: localStorage.getItem(this.TASK_COUNT_TIMESTAMP_KEY),
          isValid: taskCountLocalStorageValid,
        },
        cacheDuration: this.COUNT_CACHE_DURATION,
      },
      assignableAssociates: {
        memoryCache: {
          taskCount: this.memoryCache.assignableAssociates.size,
          loadingTasks: Array.from(
            this.memoryCache.isAssignableAssociatesLoading,
          ),
        },
        cacheDuration: this.ASSOCIATES_CACHE_DURATION,
      },
    };
  }

  /**
   * Sets cache duration for tasks
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `TaskStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for task count
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setTaskCountCacheDuration(durationMs) {
    this.COUNT_CACHE_DURATION = durationMs;
    console.log(
      `TaskStorage: Task count cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Sets cache duration for assignable associates
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setAssignableAssociatesCacheDuration(durationMs) {
    this.ASSOCIATES_CACHE_DURATION = durationMs;
    console.log(
      `TaskStorage: Assignable associates cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves task preferences to localStorage
   * @param {Object} preferences - Task preferences object
   */
  saveTaskPreferences(preferences) {
    try {
      localStorage.setItem(
        STORAGE_KEYS.TASK_PREFERENCES,
        JSON.stringify({
          preferences: preferences,
          timestamp: Date.now(),
        }),
      );
      console.log("TaskStorage: Task preferences saved");
    } catch (error) {
      console.error("TaskStorage: Error saving task preferences", error);
    }
  }

  /**
   * Gets task preferences from localStorage
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} - Task preferences or null if not found/expired
   */
  getTaskPreferences(maxAge = CACHE_DURATIONS.PREFERENCES) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASK_PREFERENCES);

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.preferences;
        } else {
          // Clean up expired preferences
          localStorage.removeItem(STORAGE_KEYS.TASK_PREFERENCES);
        }
      }
    } catch (error) {
      console.error("TaskStorage: Error reading task preferences", error);
    }

    return null;
  }

  /**
   * Clears task preferences
   */
  clearTaskPreferences() {
    localStorage.removeItem(STORAGE_KEYS.TASK_PREFERENCES);
    console.log("TaskStorage: Task preferences cleared");
  }

  /**
   * Clears all task-related data from storage
   */
  clearAllTaskData() {
    this.clearAllCache();
    this.clearTaskPreferences();

    console.log("TaskStorage: All task data cleared");
  }

  /**
   * Private helper methods for cache validation
   */

  _isTasksMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (!this.memoryCache.tasks || !this.memoryCache.tasksTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.tasksTimestamp;
    return age < maxAge;
  }

  _isTasksLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.TASKS_TIMESTAMP_KEY);
      const tasks = localStorage.getItem(this.TASKS_CACHE_KEY);

      if (!timestamp || !tasks) {
        return false;
      }

      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  _isTaskCountMemoryCacheValid(maxAge = this.COUNT_CACHE_DURATION) {
    if (!this.memoryCache.taskCount || !this.memoryCache.taskCountTimestamp) {
      return false;
    }
    const age = Date.now() - this.memoryCache.taskCountTimestamp;
    return age < maxAge;
  }

  _isTaskCountLocalStorageCacheValid(maxAge = this.COUNT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.TASK_COUNT_TIMESTAMP_KEY);
      const taskCount = localStorage.getItem(this.TASK_COUNT_CACHE_KEY);

      if (!timestamp || !taskCount) {
        return false;
      }

      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  _isAssignableAssociatesMemoryCacheValid(
    taskId,
    maxAge = this.ASSOCIATES_CACHE_DURATION,
  ) {
    const taskIdStr = String(taskId);
    if (
      !this.memoryCache.assignableAssociates.has(taskIdStr) ||
      !this.memoryCache.assignableAssociatesTimestamps.has(taskIdStr)
    ) {
      return false;
    }
    const timestamp =
      this.memoryCache.assignableAssociatesTimestamps.get(taskIdStr);
    const age = Date.now() - timestamp;
    return age < maxAge;
  }

  _clearTasksLocalStorageCache() {
    localStorage.removeItem(this.TASKS_CACHE_KEY);
    localStorage.removeItem(this.TASKS_TIMESTAMP_KEY);
  }

  _clearTaskCountLocalStorageCache() {
    localStorage.removeItem(this.TASK_COUNT_CACHE_KEY);
    localStorage.removeItem(this.TASK_COUNT_TIMESTAMP_KEY);
  }

  _clearAssignableAssociatesLocalStorageCache(taskId) {
    const taskIdStr = String(taskId);
    const cacheKey = `${this.TASK_ASSIGNABLE_ASSOCIATES_CACHE_KEY}_${taskIdStr}`;
    const timestampKey = `${this.TASK_ASSIGNABLE_ASSOCIATES_TIMESTAMP_KEY}_${taskIdStr}`;

    localStorage.removeItem(cacheKey);
    localStorage.removeItem(timestampKey);
  }
}
