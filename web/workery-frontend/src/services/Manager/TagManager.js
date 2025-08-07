// File Path: monorepo/web/workery-frontend/src/services/Manager/TagManager.js

/**
 * TagManager handles all tag-related business logic
 * Combines TagAPI with TagStorage for complete tag management
 */
export class TagManager {
  constructor(tagAPI, tagStorage) {
    this.tagAPI = tagAPI;
    this.tagStorage = tagStorage;
  }

  /**
   * Gets tag select options with caching
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Tag select options
   */
  async getTagSelectOptions(
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedOptions = this.tagStorage.getSelectOptionsFromCache();
        if (cachedOptions) {
          return cachedOptions;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.tagStorage.isSelectOptionsCacheLoading()) {
        console.log("TagManager: Select options request already in progress");
        return this._waitForCurrentSelectOptionsRequest();
      }

      this.tagStorage.setSelectOptionsCacheLoading(true);

      console.log("TagManager: Fetching fresh select options data");

      try {
        // Fetch fresh data from API
        const optionsData = await this.tagAPI.getTagSelectOptions(
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.tagStorage.saveSelectOptionsToCache(optionsData);

        console.log("TagManager: Select options data fetched successfully");

        return optionsData;
      } finally {
        this.tagStorage.setSelectOptionsCacheLoading(false);
      }
    } catch (error) {
      this.tagStorage.setSelectOptionsCacheLoading(false);
      console.error("TagManager: Failed to get select options", error);
      throw error;
    }
  }

  /**
   * Gets list of tags with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Tags list with pagination data
   */
  async getTags(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedTags = this.tagStorage.getTagsFromCache();
        if (cachedTags) {
          return cachedTags;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.tagStorage.isTagsCacheLoading()) {
        console.log("TagManager: Tags request already in progress");
        return this._waitForCurrentTagsRequest();
      }

      this.tagStorage.setTagsCacheLoading(true);

      console.log("TagManager: Fetching fresh tags data", params);

      try {
        // Validate and clean parameters
        const validatedParams = this._validateTagsParams(params);

        // Fetch fresh data from API
        const tagsData = await this.tagAPI.getTags(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.tagStorage.saveTagsToCache(tagsData);

        console.log("TagManager: Tags data fetched successfully:", {
          count: tagsData.results ? tagsData.results.length : 0,
          totalCount: tagsData.count,
        });

        return tagsData;
      } finally {
        this.tagStorage.setTagsCacheLoading(false);
      }
    } catch (error) {
      this.tagStorage.setTagsCacheLoading(false);
      console.error("TagManager: Failed to get tags", error);
      throw error;
    }
  }

  /**
   * Creates a new tag with validation
   * @param {Object} tagData - Tag data to create
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Created tag data
   */
  async createTag(tagData, onUnauthorizedCallback = null) {
    try {
      // Validate tag data
      const validationErrors = this._validateTagData(tagData, true);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("TagManager: Creating new tag");

      // Call API to create tag
      const createdTagData = await this.tagAPI.createTag(
        tagData,
        onUnauthorizedCallback,
      );

      // Clear tags cache since new data has been added
      this.tagStorage.clearTagsCache();
      this.tagStorage.clearSelectOptionsCache();

      console.log("TagManager: Tag created successfully:", {
        id: createdTagData.id,
        text: createdTagData.text,
      });

      return createdTagData;
    } catch (error) {
      console.error("TagManager: Failed to create tag", error);
      throw error;
    }
  }

  /**
   * Gets details for a specific tag
   * @param {string|number} tagId - The ID of the tag
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Tag details
   */
  async getTagDetail(tagId, onUnauthorizedCallback = null) {
    try {
      // Validate tag ID
      const validationError = this._validateTagId(tagId);
      if (validationError) {
        throw validationError;
      }

      console.log(`TagManager: Fetching tag detail for ID ${tagId}`);

      // Call API to get tag details
      const tagData = await this.tagAPI.getTagDetail(
        tagId,
        onUnauthorizedCallback,
      );

      console.log("TagManager: Tag detail fetched successfully:", {
        id: tagData.id,
        text: tagData.text,
      });

      return tagData;
    } catch (error) {
      console.error("TagManager: Failed to get tag detail", error);
      throw error;
    }
  }

  /**
   * Updates a specific tag
   * @param {string|number} tagId - The ID of the tag
   * @param {Object} tagData - Tag data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated tag data
   */
  async updateTag(tagId, tagData, onUnauthorizedCallback = null) {
    try {
      // Validate tag ID
      const tagIdError = this._validateTagId(tagId);
      if (tagIdError) {
        throw tagIdError;
      }

      // Validate tag data
      const validationErrors = this._validateTagData(tagData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(`TagManager: Updating tag ID ${tagId}`);

      // Call API to update tag
      const updatedTagData = await this.tagAPI.updateTag(
        tagId,
        tagData,
        onUnauthorizedCallback,
      );

      // Clear tags cache since data has been updated
      this.tagStorage.clearTagsCache();
      this.tagStorage.clearSelectOptionsCache();

      console.log("TagManager: Tag updated successfully");

      return updatedTagData;
    } catch (error) {
      console.error("TagManager: Failed to update tag", error);
      throw error;
    }
  }

  /**
   * Deletes a specific tag
   * @param {string|number} tagId - The ID of the tag to delete
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Delete response
   */
  async deleteTag(tagId, onUnauthorizedCallback = null) {
    try {
      // Validate tag ID
      const validationError = this._validateTagId(tagId);
      if (validationError) {
        throw validationError;
      }

      console.log(`TagManager: Deleting tag ID ${tagId}`);

      // Call API to delete tag
      const deleteResponse = await this.tagAPI.deleteTag(
        tagId,
        onUnauthorizedCallback,
      );

      // Clear tags cache since data has been updated
      this.tagStorage.clearTagsCache();
      this.tagStorage.clearSelectOptionsCache();

      console.log("TagManager: Tag deleted successfully");

      return deleteResponse;
    } catch (error) {
      console.error("TagManager: Failed to delete tag", error);
      throw error;
    }
  }

  /**
   * Gets tag preferences
   * @returns {Object|null} - Tag preferences or null
   */
  getTagPreferences() {
    return this.tagStorage.getTagPreferences();
  }

  /**
   * Saves tag preferences
   * @param {Object} preferences - Preferences object
   */
  saveTagPreferences(preferences) {
    this.tagStorage.saveTagPreferences(preferences);
  }

  /**
   * Gets tag filters
   * @returns {Object|null} - Tag filters or null
   */
  getTagFilters() {
    return this.tagStorage.getTagFilters();
  }

  /**
   * Saves tag filters
   * @param {Object} filters - Filters object
   */
  saveTagFilters(filters) {
    this.tagStorage.saveTagFilters(filters);
  }

  /**
   * Clears the tags cache
   */
  clearTagsCache() {
    this.tagStorage.clearTagsCache();
  }

  /**
   * Clears the select options cache
   */
  clearSelectOptionsCache() {
    this.tagStorage.clearSelectOptionsCache();
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.tagStorage.clearAllCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getTagsCacheInfo() {
    return this.tagStorage.getTagsCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setTagsCacheDuration(durationMs) {
    this.tagStorage.setCacheDuration(durationMs);
  }

  /**
   * Sets select options cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.tagStorage.setSelectOptionsCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getTagSelectOptionsWithCallbacks(
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getTagSelectOptions(onUnauthorizedCallback, forceRefresh)
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

  getTagsWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getTags(params, onUnauthorizedCallback, forceRefresh)
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

  createTagWithCallbacks(
    tagData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createTag(tagData, onUnauthorizedCallback)
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

  getTagDetailWithCallbacks(
    tagId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getTagDetail(tagId, onUnauthorizedCallback)
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

  updateTagWithCallbacks(
    tagId,
    tagData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateTag(tagId, tagData, onUnauthorizedCallback)
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

  deleteTagWithCallbacks(
    tagId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.deleteTag(tagId, onUnauthorizedCallback)
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

  _validateTagId(tagId) {
    if (!tagId || (typeof tagId !== "string" && typeof tagId !== "number")) {
      return { tagId: "Valid tag ID is required" };
    }
    return null;
  }

  _validateTagsParams(params) {
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
        "text",
        "created_at",
        "updated_at",
        "status",
        "description",
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

    return validatedParams;
  }

  _validateTagData(tagData, isCreate = false) {
    const errors = {};

    if (!tagData || typeof tagData !== "object") {
      errors.general = "Tag data is required";
      return errors;
    }

    // Validate text (required) - tags typically use 'text' field instead of 'name'
    if (!tagData.text || !tagData.text.trim()) {
      errors.text = "Tag text is required";
    } else if (tagData.text.length > 100) {
      errors.text = "Tag text must be less than 100 characters";
    }

    // Validate description (optional)
    if (tagData.description && tagData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    // Validate status (optional)
    if (tagData.status !== undefined) {
      const validStatuses = [1, 2]; // Active, Inactive
      if (!validStatuses.includes(tagData.status)) {
        errors.status = "Invalid tag status";
      }
    }

    // Validate sort order (optional)
    if (tagData.sortOrder !== undefined) {
      if (typeof tagData.sortOrder !== "number" || tagData.sortOrder < 0) {
        errors.sortOrder = "Sort order must be a non-negative number";
      }
    }

    // Validate color (optional) - tags often have color fields
    if (tagData.color && typeof tagData.color === "string") {
      // Basic hex color validation
      if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(tagData.color)) {
        errors.color = "Color must be a valid hex color code (e.g., #FF0000)";
      }
    }

    return errors;
  }

  /**
   * Waits for current tags request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentTagsRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.tagStorage.isTagsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.tagStorage.getTagsFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Tags request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Tags request timeout"));
      }, 30000);
    });
  }

  /**
   * Waits for current select options request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentSelectOptionsRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.tagStorage.isSelectOptionsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.tagStorage.getSelectOptionsFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Select options request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Select options request timeout"));
      }, 30000);
    });
  }
}
