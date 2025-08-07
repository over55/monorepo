// File Path: monorepo/web/workery-frontend/src/services/Manager/InsuranceRequirementManager.js

/**
 * InsuranceRequirementManager handles all insurance requirement-related business logic
 * Combines InsuranceRequirementAPI with InsuranceRequirementStorage for complete insurance requirement management
 */
export class InsuranceRequirementManager {
  constructor(insuranceRequirementAPI, insuranceRequirementStorage) {
    this.insuranceRequirementAPI = insuranceRequirementAPI;
    this.insuranceRequirementStorage = insuranceRequirementStorage;
  }

  /**
   * Gets insurance requirement select options with caching
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Insurance requirement select options
   */
  async getInsuranceRequirementSelectOptions(
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedOptions =
          this.insuranceRequirementStorage.getSelectOptionsFromCache();
        if (cachedOptions) {
          return cachedOptions;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.insuranceRequirementStorage.isSelectOptionsCacheLoading()) {
        console.log(
          "InsuranceRequirementManager: Select options request already in progress",
        );
        return this._waitForCurrentSelectOptionsRequest();
      }

      this.insuranceRequirementStorage.setSelectOptionsCacheLoading(true);

      console.log(
        "InsuranceRequirementManager: Fetching fresh select options data",
      );

      try {
        // Fetch fresh data from API
        const optionsData =
          await this.insuranceRequirementAPI.getInsuranceRequirementSelectOptions(
            onUnauthorizedCallback,
          );

        // Save to storage cache
        this.insuranceRequirementStorage.saveSelectOptionsToCache(optionsData);

        console.log(
          "InsuranceRequirementManager: Select options data fetched successfully",
        );

        return optionsData;
      } finally {
        this.insuranceRequirementStorage.setSelectOptionsCacheLoading(false);
      }
    } catch (error) {
      this.insuranceRequirementStorage.setSelectOptionsCacheLoading(false);
      console.error(
        "InsuranceRequirementManager: Failed to get select options",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets list of insurance requirements with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Insurance requirements list with pagination data
   */
  async getInsuranceRequirements(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedInsuranceRequirements =
          this.insuranceRequirementStorage.getInsuranceRequirementsFromCache();
        if (cachedInsuranceRequirements) {
          return cachedInsuranceRequirements;
        }
      }

      // Prevent multiple simultaneous requests
      if (
        this.insuranceRequirementStorage.isInsuranceRequirementsCacheLoading()
      ) {
        console.log(
          "InsuranceRequirementManager: Insurance requirements request already in progress",
        );
        return this._waitForCurrentInsuranceRequirementsRequest();
      }

      this.insuranceRequirementStorage.setInsuranceRequirementsCacheLoading(
        true,
      );

      console.log(
        "InsuranceRequirementManager: Fetching fresh insurance requirements data",
        params,
      );

      try {
        // Validate and clean parameters
        const validatedParams =
          this._validateInsuranceRequirementsParams(params);

        // Fetch fresh data from API
        const insuranceRequirementsData =
          await this.insuranceRequirementAPI.getInsuranceRequirements(
            validatedParams,
            onUnauthorizedCallback,
          );

        // Save to storage cache
        this.insuranceRequirementStorage.saveInsuranceRequirementsToCache(
          insuranceRequirementsData,
        );

        console.log(
          "InsuranceRequirementManager: Insurance requirements data fetched successfully:",
          {
            count: insuranceRequirementsData.results
              ? insuranceRequirementsData.results.length
              : 0,
            totalCount: insuranceRequirementsData.count,
          },
        );

        return insuranceRequirementsData;
      } finally {
        this.insuranceRequirementStorage.setInsuranceRequirementsCacheLoading(
          false,
        );
      }
    } catch (error) {
      this.insuranceRequirementStorage.setInsuranceRequirementsCacheLoading(
        false,
      );
      console.error(
        "InsuranceRequirementManager: Failed to get insurance requirements",
        error,
      );
      throw error;
    }
  }

  /**
   * Creates a new insurance requirement with validation
   * @param {Object} insuranceRequirementData - Insurance requirement data to create
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Created insurance requirement data
   */
  async createInsuranceRequirement(
    insuranceRequirementData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate insurance requirement data
      const validationErrors = this._validateInsuranceRequirementData(
        insuranceRequirementData,
        true,
      );
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(
        "InsuranceRequirementManager: Creating new insurance requirement",
      );

      // Call API to create insurance requirement
      const createdInsuranceRequirementData =
        await this.insuranceRequirementAPI.createInsuranceRequirement(
          insuranceRequirementData,
          onUnauthorizedCallback,
        );

      // Clear insurance requirements cache since new data has been added
      this.insuranceRequirementStorage.clearInsuranceRequirementsCache();
      this.insuranceRequirementStorage.clearSelectOptionsCache();

      console.log(
        "InsuranceRequirementManager: Insurance requirement created successfully:",
        {
          id: createdInsuranceRequirementData.id,
          name: createdInsuranceRequirementData.name,
        },
      );

      return createdInsuranceRequirementData;
    } catch (error) {
      console.error(
        "InsuranceRequirementManager: Failed to create insurance requirement",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets details for a specific insurance requirement
   * @param {string|number} insuranceRequirementId - The ID of the insurance requirement
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Insurance requirement details
   */
  async getInsuranceRequirementDetail(
    insuranceRequirementId,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate insurance requirement ID
      const validationError = this._validateInsuranceRequirementId(
        insuranceRequirementId,
      );
      if (validationError) {
        throw validationError;
      }

      console.log(
        `InsuranceRequirementManager: Fetching insurance requirement detail for ID ${insuranceRequirementId}`,
      );

      // Call API to get insurance requirement details
      const insuranceRequirementData =
        await this.insuranceRequirementAPI.getInsuranceRequirementDetail(
          insuranceRequirementId,
          onUnauthorizedCallback,
        );

      console.log(
        "InsuranceRequirementManager: Insurance requirement detail fetched successfully:",
        {
          id: insuranceRequirementData.id,
          name: insuranceRequirementData.name,
        },
      );

      return insuranceRequirementData;
    } catch (error) {
      console.error(
        "InsuranceRequirementManager: Failed to get insurance requirement detail",
        error,
      );
      throw error;
    }
  }

  /**
   * Updates a specific insurance requirement
   * @param {string|number} insuranceRequirementId - The ID of the insurance requirement
   * @param {Object} insuranceRequirementData - Insurance requirement data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated insurance requirement data
   */
  async updateInsuranceRequirement(
    insuranceRequirementId,
    insuranceRequirementData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate insurance requirement ID
      const insuranceRequirementIdError = this._validateInsuranceRequirementId(
        insuranceRequirementId,
      );
      if (insuranceRequirementIdError) {
        throw insuranceRequirementIdError;
      }

      // Validate insurance requirement data
      const validationErrors = this._validateInsuranceRequirementData(
        insuranceRequirementData,
      );
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(
        `InsuranceRequirementManager: Updating insurance requirement ID ${insuranceRequirementId}`,
      );

      // Call API to update insurance requirement
      const updatedInsuranceRequirementData =
        await this.insuranceRequirementAPI.updateInsuranceRequirement(
          insuranceRequirementId,
          insuranceRequirementData,
          onUnauthorizedCallback,
        );

      // Clear insurance requirements cache since data has been updated
      this.insuranceRequirementStorage.clearInsuranceRequirementsCache();
      this.insuranceRequirementStorage.clearSelectOptionsCache();

      console.log(
        "InsuranceRequirementManager: Insurance requirement updated successfully",
      );

      return updatedInsuranceRequirementData;
    } catch (error) {
      console.error(
        "InsuranceRequirementManager: Failed to update insurance requirement",
        error,
      );
      throw error;
    }
  }

  /**
   * Deletes a specific insurance requirement
   * @param {string|number} insuranceRequirementId - The ID of the insurance requirement to delete
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Delete response
   */
  async deleteInsuranceRequirement(
    insuranceRequirementId,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate insurance requirement ID
      const validationError = this._validateInsuranceRequirementId(
        insuranceRequirementId,
      );
      if (validationError) {
        throw validationError;
      }

      console.log(
        `InsuranceRequirementManager: Deleting insurance requirement ID ${insuranceRequirementId}`,
      );

      // Call API to delete insurance requirement
      const deleteResponse =
        await this.insuranceRequirementAPI.deleteInsuranceRequirement(
          insuranceRequirementId,
          onUnauthorizedCallback,
        );

      // Clear insurance requirements cache since data has been updated
      this.insuranceRequirementStorage.clearInsuranceRequirementsCache();
      this.insuranceRequirementStorage.clearSelectOptionsCache();

      console.log(
        "InsuranceRequirementManager: Insurance requirement deleted successfully",
      );

      return deleteResponse;
    } catch (error) {
      console.error(
        "InsuranceRequirementManager: Failed to delete insurance requirement",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets insurance requirement preferences
   * @returns {Object|null} - Insurance requirement preferences or null
   */
  getInsuranceRequirementPreferences() {
    return this.insuranceRequirementStorage.getInsuranceRequirementPreferences();
  }

  /**
   * Saves insurance requirement preferences
   * @param {Object} preferences - Preferences object
   */
  saveInsuranceRequirementPreferences(preferences) {
    this.insuranceRequirementStorage.saveInsuranceRequirementPreferences(
      preferences,
    );
  }

  /**
   * Clears the insurance requirements cache
   */
  clearInsuranceRequirementsCache() {
    this.insuranceRequirementStorage.clearInsuranceRequirementsCache();
  }

  /**
   * Clears the select options cache
   */
  clearSelectOptionsCache() {
    this.insuranceRequirementStorage.clearSelectOptionsCache();
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.insuranceRequirementStorage.clearAllCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getInsuranceRequirementsCacheInfo() {
    return this.insuranceRequirementStorage.getInsuranceRequirementsCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setInsuranceRequirementsCacheDuration(durationMs) {
    this.insuranceRequirementStorage.setCacheDuration(durationMs);
  }

  /**
   * Sets select options cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.insuranceRequirementStorage.setSelectOptionsCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getInsuranceRequirementSelectOptionsWithCallbacks(
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getInsuranceRequirementSelectOptions(
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

  getInsuranceRequirementsWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getInsuranceRequirements(params, onUnauthorizedCallback, forceRefresh)
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

  createInsuranceRequirementWithCallbacks(
    insuranceRequirementData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createInsuranceRequirement(
      insuranceRequirementData,
      onUnauthorizedCallback,
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

  getInsuranceRequirementDetailWithCallbacks(
    insuranceRequirementId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getInsuranceRequirementDetail(
      insuranceRequirementId,
      onUnauthorizedCallback,
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

  updateInsuranceRequirementWithCallbacks(
    insuranceRequirementId,
    insuranceRequirementData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateInsuranceRequirement(
      insuranceRequirementId,
      insuranceRequirementData,
      onUnauthorizedCallback,
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

  deleteInsuranceRequirementWithCallbacks(
    insuranceRequirementId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.deleteInsuranceRequirement(
      insuranceRequirementId,
      onUnauthorizedCallback,
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
   * Private validation methods
   */

  _validateInsuranceRequirementId(insuranceRequirementId) {
    if (
      !insuranceRequirementId ||
      (typeof insuranceRequirementId !== "string" &&
        typeof insuranceRequirementId !== "number")
    ) {
      return {
        insuranceRequirementId: "Valid insurance requirement ID is required",
      };
    }
    return null;
  }

  _validateInsuranceRequirementsParams(params) {
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
        "name",
        "created_at",
        "updated_at",
        "status",
        "description",
        "sort_number",
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

  _validateInsuranceRequirementData(
    insuranceRequirementData,
    isCreate = false,
  ) {
    const errors = {};

    if (
      !insuranceRequirementData ||
      typeof insuranceRequirementData !== "object"
    ) {
      errors.general = "Insurance requirement data is required";
      return errors;
    }

    // Validate name (required)
    if (
      !insuranceRequirementData.name ||
      !insuranceRequirementData.name.trim()
    ) {
      errors.name = "Insurance requirement name is required";
    } else if (insuranceRequirementData.name.length > 100) {
      errors.name =
        "Insurance requirement name must be less than 100 characters";
    }

    // Validate description (optional)
    if (
      insuranceRequirementData.description &&
      insuranceRequirementData.description.length > 500
    ) {
      errors.description = "Description must be less than 500 characters";
    }

    // Validate status (optional)
    if (insuranceRequirementData.status !== undefined) {
      const validStatuses = [1, 2]; // Active, Inactive
      if (!validStatuses.includes(insuranceRequirementData.status)) {
        errors.status = "Invalid insurance requirement status";
      }
    }

    // Validate sort order (optional)
    if (insuranceRequirementData.sortOrder !== undefined) {
      if (
        typeof insuranceRequirementData.sortOrder !== "number" ||
        insuranceRequirementData.sortOrder < 0
      ) {
        errors.sortOrder = "Sort order must be a non-negative number";
      }
    }

    return errors;
  }

  /**
   * Waits for current insurance requirements request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentInsuranceRequirementsRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (
          !this.insuranceRequirementStorage.isInsuranceRequirementsCacheLoading()
        ) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData =
            this.insuranceRequirementStorage.getInsuranceRequirementsFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Insurance requirements request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Insurance requirements request timeout"));
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
        if (!this.insuranceRequirementStorage.isSelectOptionsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData =
            this.insuranceRequirementStorage.getSelectOptionsFromCache();
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
