// File Path: monorepo/web/workery-frontend/src/services/Manager/CommentManager.js

/**
 * CommentManager handles all comment-related business logic
 * Combines CommentAPI with CommentStorage for complete comment management
 */
export class CommentManager {
  constructor(commentAPI, commentStorage) {
    this.commentAPI = commentAPI;
    this.commentStorage = commentStorage;
  }

  /**
   * Gets list of comments with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Comments list with pagination data
   */
  async getComments(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Create a filters map from params for cache key generation
      const filtersMap = new Map();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          filtersMap.set(key, value.toString());
        }
      });

      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedComments =
          this.commentStorage.getCommentsFromCache(filtersMap);
        if (cachedComments) {
          console.log("CommentManager: Returning cached comments");
          return cachedComments;
        }
      }

      // Prevent multiple simultaneous requests for the same filters
      if (this.commentStorage.isCommentsCacheLoading(filtersMap)) {
        console.log("CommentManager: Comments request already in progress");
        return this._waitForCurrentCommentsRequest(filtersMap);
      }

      this.commentStorage.setCommentsCacheLoading(filtersMap, true);

      console.log("CommentManager: Fetching fresh comments data", params);

      try {
        // Validate and clean parameters
        const validatedParams = this._validateCommentsParams(params);

        // Fetch fresh data from API
        const commentsData = await this.commentAPI.getComments(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache with filters
        this.commentStorage.saveCommentsToCache(filtersMap, commentsData);

        console.log("CommentManager: Comments data fetched successfully:", {
          count: commentsData.results ? commentsData.results.length : 0,
          totalCount: commentsData.count,
        });

        return commentsData;
      } finally {
        this.commentStorage.setCommentsCacheLoading(filtersMap, false);
      }
    } catch (error) {
      const filtersMap = new Map();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          filtersMap.set(key, value.toString());
        }
      });
      this.commentStorage.setCommentsCacheLoading(filtersMap, false);
      console.error("CommentManager: Failed to get comments", error);
      throw error;
    }
  }

  /**
   * Gets list of comments using legacy filtersMap approach for backward compatibility
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Comments list with pagination data
   */
  async getCommentsWithFiltersMap(
    filtersMap = new Map(),
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedComments =
          this.commentStorage.getCommentsFromCache(filtersMap);
        if (cachedComments) {
          console.log(
            "CommentManager: Returning cached comments for filters",
            Array.from(filtersMap.entries()),
          );
          return cachedComments;
        }
      }

      // Prevent multiple simultaneous requests for the same filters
      if (this.commentStorage.isCommentsCacheLoading(filtersMap)) {
        console.log("CommentManager: Comments request already in progress");
        return this._waitForCurrentCommentsRequest(filtersMap);
      }

      this.commentStorage.setCommentsCacheLoading(filtersMap, true);

      console.log(
        "CommentManager: Fetching fresh comments data with filtersMap",
        Array.from(filtersMap.entries()),
      );

      try {
        // Fetch fresh data from API using filtersMap
        const commentsData = await this.commentAPI.getCommentsWithFiltersMap(
          filtersMap,
          onUnauthorizedCallback,
        );

        // Save to storage cache with the same filters map
        this.commentStorage.saveCommentsToCache(filtersMap, commentsData);

        console.log("CommentManager: Comments data fetched successfully:", {
          count: commentsData.results ? commentsData.results.length : 0,
          totalCount: commentsData.count,
          hasNextPage: commentsData.hasNextPage,
          nextCursor: commentsData.nextCursor,
        });

        return commentsData;
      } finally {
        this.commentStorage.setCommentsCacheLoading(filtersMap, false);
      }
    } catch (error) {
      this.commentStorage.setCommentsCacheLoading(filtersMap, false);
      console.error(
        "CommentManager: Failed to get comments with filtersMap",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets comment preferences
   * @returns {Object|null} - Comment preferences or null
   */
  getCommentPreferences() {
    return this.commentStorage.getCommentPreferences();
  }

  /**
   * Saves comment preferences
   * @param {Object} preferences - Preferences object
   */
  saveCommentPreferences(preferences) {
    this.commentStorage.saveCommentPreferences(preferences);
  }

  /**
   * Clears the comments cache
   */
  clearCommentsCache() {
    this.commentStorage.clearCommentsCache();
  }

  /**
   * Clears specific cache entry
   * @param {Map} filtersMap - Map of filter parameters
   */
  clearSpecificCache(filtersMap = new Map()) {
    this.commentStorage.clearSpecificCache(filtersMap);
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.commentStorage.clearAllCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getCommentsCacheInfo() {
    return this.commentStorage.getCommentsCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCommentsCacheDuration(durationMs) {
    this.commentStorage.setCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getCommentsWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getComments(params, onUnauthorizedCallback, forceRefresh)
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

  getCommentsWithFiltersMapAndCallbacks(
    filtersMap = new Map(),
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getCommentsWithFiltersMap(
      filtersMap,
      onUnauthorizedCallback,
      forceRefresh,
    )
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
   * Legacy method that matches the original getCommentListAPI signature exactly
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onSuccessCallback - Success callback
   * @param {Function} onErrorCallback - Error callback
   * @param {Function} onDoneCallback - Done callback (always called)
   * @param {Function} onUnauthorizedCallback - Unauthorized callback
   */
  getCommentListAPI(
    filtersMap = new Map(),
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback,
  ) {
    this.getCommentsWithFiltersMapAndCallbacks(
      filtersMap,
      onSuccessCallback,
      onErrorCallback,
      onDoneCallback,
      onUnauthorizedCallback,
      false, // Don't force refresh by default
    );
  }

  /**
   * Private validation methods
   */

  _validateCommentsParams(params) {
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
        "created_at",
        "updated_at",
        "content",
        "created_by",
        "status",
      ];
      if (allowedSortFields.includes(params.sortBy)) {
        validatedParams.sortBy = params.sortBy;

        if (params.sortOrder && ["ASC", "DESC"].includes(params.sortOrder)) {
          validatedParams.sortOrder = params.sortOrder;
        } else {
          validatedParams.sortOrder = "DESC"; // Default to newest first for comments
        }
      }
    }

    // Validate filters
    if (params.status && typeof params.status === "string") {
      validatedParams.status = params.status;
    }

    // Add content type filter if provided
    if (params.contentType && typeof params.contentType === "string") {
      validatedParams.contentType = params.contentType;
    }

    // Add content object ID filter if provided
    if (
      params.contentObjectId &&
      (typeof params.contentObjectId === "string" ||
        typeof params.contentObjectId === "number")
    ) {
      validatedParams.contentObjectId = params.contentObjectId;
    }

    return validatedParams;
  }

  /**
   * Waits for current comments request to complete
   * @private
   * @param {Map} filtersMap - Map of filter parameters
   * @returns {Promise<Object>}
   */
  _waitForCurrentCommentsRequest(filtersMap = new Map()) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.commentStorage.isCommentsCacheLoading(filtersMap)) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData =
            this.commentStorage.getCommentsFromCache(filtersMap);
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Comments request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Comments request timeout"));
      }, 30000);
    });
  }
}
