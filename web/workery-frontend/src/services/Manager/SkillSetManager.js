// File Path: monorepo/web/workery-frontend/src/services/Manager/SkillSetManager.js

/**
 * SkillSetManager handles all skill set-related business logic
 * Combines SkillSetAPI with SkillSetStorage for complete skill set management
 */
export class SkillSetManager {
  constructor(skillSetAPI, skillSetStorage) {
    this.skillSetAPI = skillSetAPI;
    this.skillSetStorage = skillSetStorage;
  }

  /**
   * Gets skill set select options with caching
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Skill set select options
   */
  async getSkillSetSelectOptions(
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedOptions = this.skillSetStorage.getSelectOptionsFromCache();
        if (cachedOptions) {
          return cachedOptions;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.skillSetStorage.isSelectOptionsCacheLoading()) {
        console.log(
          "SkillSetManager: Select options request already in progress",
        );
        return this._waitForCurrentSelectOptionsRequest();
      }

      this.skillSetStorage.setSelectOptionsCacheLoading(true);

      console.log("SkillSetManager: Fetching fresh select options data");

      try {
        // Fetch fresh data from API
        const optionsData = await this.skillSetAPI.getSkillSetSelectOptions(
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.skillSetStorage.saveSelectOptionsToCache(optionsData);

        console.log(
          "SkillSetManager: Select options data fetched successfully",
        );

        return optionsData;
      } finally {
        this.skillSetStorage.setSelectOptionsCacheLoading(false);
      }
    } catch (error) {
      this.skillSetStorage.setSelectOptionsCacheLoading(false);
      console.error("SkillSetManager: Failed to get select options", error);
      throw error;
    }
  }

  /**
   * Gets list of skill sets with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Skill sets list with pagination data
   */
  async getSkillSets(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedSkillSets = this.skillSetStorage.getSkillSetsFromCache();
        if (cachedSkillSets) {
          return cachedSkillSets;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.skillSetStorage.isSkillSetsCacheLoading()) {
        console.log("SkillSetManager: Skill sets request already in progress");
        return this._waitForCurrentSkillSetsRequest();
      }

      this.skillSetStorage.setSkillSetsCacheLoading(true);

      console.log("SkillSetManager: Fetching fresh skill sets data", params);

      try {
        // Validate and clean parameters
        const validatedParams = this._validateSkillSetsParams(params);

        // Fetch fresh data from API
        const skillSetsData = await this.skillSetAPI.getSkillSets(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.skillSetStorage.saveSkillSetsToCache(skillSetsData);

        console.log("SkillSetManager: Skill sets data fetched successfully:", {
          count: skillSetsData.results ? skillSetsData.results.length : 0,
          totalCount: skillSetsData.count,
        });

        return skillSetsData;
      } finally {
        this.skillSetStorage.setSkillSetsCacheLoading(false);
      }
    } catch (error) {
      this.skillSetStorage.setSkillSetsCacheLoading(false);
      console.error("SkillSetManager: Failed to get skill sets", error);
      throw error;
    }
  }

  /**
   * Creates a new skill set with validation
   * @param {Object} skillSetData - Skill set data to create
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Created skill set data
   */
  async createSkillSet(skillSetData, onUnauthorizedCallback = null) {
    try {
      // Validate skill set data
      const validationErrors = this._validateSkillSetData(skillSetData, true);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("SkillSetManager: Creating new skill set");

      // Call API to create skill set
      const createdSkillSetData = await this.skillSetAPI.createSkillSet(
        skillSetData,
        onUnauthorizedCallback,
      );

      // Clear skill sets cache since new data has been added
      this.skillSetStorage.clearSkillSetsCache();
      this.skillSetStorage.clearSelectOptionsCache();

      console.log("SkillSetManager: Skill set created successfully:", {
        id: createdSkillSetData.id,
        category: createdSkillSetData.category,
        subCategory: createdSkillSetData.subCategory,
      });

      return createdSkillSetData;
    } catch (error) {
      console.error("SkillSetManager: Failed to create skill set", error);
      throw error;
    }
  }

  /**
   * Gets details for a specific skill set
   * @param {string|number} skillSetId - The ID of the skill set
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Skill set details
   */
  async getSkillSetDetail(skillSetId, onUnauthorizedCallback = null) {
    try {
      // Validate skill set ID
      const validationError = this._validateSkillSetId(skillSetId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `SkillSetManager: Fetching skill set detail for ID ${skillSetId}`,
      );

      // Call API to get skill set details
      const skillSetData = await this.skillSetAPI.getSkillSetDetail(
        skillSetId,
        onUnauthorizedCallback,
      );

      console.log("SkillSetManager: Skill set detail fetched successfully:", {
        id: skillSetData.id,
        category: skillSetData.category,
        subCategory: skillSetData.subCategory,
      });

      return skillSetData;
    } catch (error) {
      console.error("SkillSetManager: Failed to get skill set detail", error);
      throw error;
    }
  }

  /**
   * Updates a specific skill set
   * @param {string|number} skillSetId - The ID of the skill set
   * @param {Object} skillSetData - Skill set data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated skill set data
   */
  async updateSkillSet(
    skillSetId,
    skillSetData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate skill set ID
      const skillSetIdError = this._validateSkillSetId(skillSetId);
      if (skillSetIdError) {
        throw skillSetIdError;
      }

      // Validate skill set data
      const validationErrors = this._validateSkillSetData(skillSetData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(`SkillSetManager: Updating skill set ID ${skillSetId}`);

      // Call API to update skill set
      const updatedSkillSetData = await this.skillSetAPI.updateSkillSet(
        skillSetId,
        skillSetData,
        onUnauthorizedCallback,
      );

      // Clear skill sets cache since data has been updated
      this.skillSetStorage.clearSkillSetsCache();
      this.skillSetStorage.clearSelectOptionsCache();

      console.log("SkillSetManager: Skill set updated successfully");

      return updatedSkillSetData;
    } catch (error) {
      console.error("SkillSetManager: Failed to update skill set", error);
      throw error;
    }
  }

  /**
   * Deletes a specific skill set
   * @param {string|number} skillSetId - The ID of the skill set to delete
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Delete response
   */
  async deleteSkillSet(skillSetId, onUnauthorizedCallback = null) {
    try {
      // Validate skill set ID
      const validationError = this._validateSkillSetId(skillSetId);
      if (validationError) {
        throw validationError;
      }

      console.log(`SkillSetManager: Deleting skill set ID ${skillSetId}`);

      // Call API to delete skill set
      const deleteResponse = await this.skillSetAPI.deleteSkillSet(
        skillSetId,
        onUnauthorizedCallback,
      );

      // Clear skill sets cache since data has been updated
      this.skillSetStorage.clearSkillSetsCache();
      this.skillSetStorage.clearSelectOptionsCache();

      console.log("SkillSetManager: Skill set deleted successfully");

      return deleteResponse;
    } catch (error) {
      console.error("SkillSetManager: Failed to delete skill set", error);
      throw error;
    }
  }

  /**
   * Gets skill set preferences
   * @returns {Object|null} - Skill set preferences or null
   */
  getSkillSetPreferences() {
    return this.skillSetStorage.getSkillSetPreferences();
  }

  /**
   * Saves skill set preferences
   * @param {Object} preferences - Preferences object
   */
  saveSkillSetPreferences(preferences) {
    this.skillSetStorage.saveSkillSetPreferences(preferences);
  }

  /**
   * Gets skill set filters
   * @returns {Object|null} - Skill set filters or null
   */
  getSkillSetFilters() {
    return this.skillSetStorage.getSkillSetFilters();
  }

  /**
   * Saves skill set filters
   * @param {Object} filters - Filters object
   */
  saveSkillSetFilters(filters) {
    this.skillSetStorage.saveSkillSetFilters(filters);
  }

  /**
   * Clears the skill sets cache
   */
  clearSkillSetsCache() {
    this.skillSetStorage.clearSkillSetsCache();
  }

  /**
   * Clears the select options cache
   */
  clearSelectOptionsCache() {
    this.skillSetStorage.clearSelectOptionsCache();
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.skillSetStorage.clearAllCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getSkillSetsCacheInfo() {
    return this.skillSetStorage.getSkillSetsCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSkillSetsCacheDuration(durationMs) {
    this.skillSetStorage.setCacheDuration(durationMs);
  }

  /**
   * Sets select options cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.skillSetStorage.setSelectOptionsCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getSkillSetSelectOptionsWithCallbacks(
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getSkillSetSelectOptions(onUnauthorizedCallback, forceRefresh)
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

  getSkillSetsWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getSkillSets(params, onUnauthorizedCallback, forceRefresh)
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

  createSkillSetWithCallbacks(
    skillSetData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createSkillSet(skillSetData, onUnauthorizedCallback)
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

  getSkillSetDetailWithCallbacks(
    skillSetId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getSkillSetDetail(skillSetId, onUnauthorizedCallback)
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

  updateSkillSetWithCallbacks(
    skillSetId,
    skillSetData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateSkillSet(skillSetId, skillSetData, onUnauthorizedCallback)
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

  deleteSkillSetWithCallbacks(
    skillSetId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.deleteSkillSet(skillSetId, onUnauthorizedCallback)
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

  _validateSkillSetId(skillSetId) {
    if (
      !skillSetId ||
      (typeof skillSetId !== "string" && typeof skillSetId !== "number")
    ) {
      return { skillSetId: "Valid skill set ID is required" };
    }
    return null;
  }

  _validateSkillSetsParams(params) {
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
        "category",
        "sub_category",
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

    if (params.category && typeof params.category === "string") {
      validatedParams.category = params.category;
    }

    return validatedParams;
  }

  _validateSkillSetData(skillSetData, isCreate = false) {
    const errors = {};

    if (!skillSetData || typeof skillSetData !== "object") {
      errors.general = "Skill set data is required";
      return errors;
    }

    // Validate category (required)
    if (!skillSetData.category || !skillSetData.category.trim()) {
      errors.category = "Skill set category is required";
    } else if (skillSetData.category.length > 127) {
      errors.category = "Category must be less than 127 characters";
    }

    // Validate sub-category (required)
    if (!skillSetData.subCategory || !skillSetData.subCategory.trim()) {
      errors.subCategory = "Skill set sub-category is required";
    } else if (skillSetData.subCategory.length > 127) {
      errors.subCategory = "Sub-category must be less than 127 characters";
    }

    // Validate description (optional)
    if (skillSetData.description && skillSetData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    // Validate status (optional)
    if (skillSetData.status !== undefined) {
      const validStatuses = [1, 2]; // Active, Inactive
      if (!validStatuses.includes(skillSetData.status)) {
        errors.status = "Invalid skill set status";
      }
    }

    // Validate sort order (optional)
    if (skillSetData.sortOrder !== undefined) {
      if (
        typeof skillSetData.sortOrder !== "number" ||
        skillSetData.sortOrder < 0
      ) {
        errors.sortOrder = "Sort order must be a non-negative number";
      }
    }

    // Validate insurance requirement (optional)
    if (skillSetData.insuranceRequirement !== undefined) {
      const validInsuranceRequirements = [1, 2, 3]; // None, Commercial General Liability, etc.
      if (
        !validInsuranceRequirements.includes(skillSetData.insuranceRequirement)
      ) {
        errors.insuranceRequirement = "Invalid insurance requirement";
      }
    }

    return errors;
  }

  /**
   * Waits for current skill sets request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentSkillSetsRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.skillSetStorage.isSkillSetsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.skillSetStorage.getSkillSetsFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Skill sets request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Skill sets request timeout"));
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
        if (!this.skillSetStorage.isSelectOptionsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.skillSetStorage.getSelectOptionsFromCache();
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
