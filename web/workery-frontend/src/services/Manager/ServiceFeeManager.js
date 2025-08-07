// File Path: monorepo/web/workery-frontend/src/services/Manager/ServiceFeeManager.js

/**
 * ServiceFeeManager handles all service fee-related business logic
 * Combines ServiceFeeAPI with ServiceFeeStorage for complete service fee management
 */
export class ServiceFeeManager {
  constructor(serviceFeeAPI, serviceFeeStorage) {
    this.serviceFeeAPI = serviceFeeAPI;
    this.serviceFeeStorage = serviceFeeStorage;
  }

  /**
   * Gets service fee select options with caching
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Service fee select options
   */
  async getServiceFeeSelectOptions(
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedOptions =
          this.serviceFeeStorage.getSelectOptionsFromCache();
        if (cachedOptions) {
          return cachedOptions;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.serviceFeeStorage.isSelectOptionsCacheLoading()) {
        console.log(
          "ServiceFeeManager: Select options request already in progress",
        );
        return this._waitForCurrentSelectOptionsRequest();
      }

      this.serviceFeeStorage.setSelectOptionsCacheLoading(true);

      console.log("ServiceFeeManager: Fetching fresh select options data");

      try {
        // Fetch fresh data from API
        const optionsData = await this.serviceFeeAPI.getServiceFeeSelectOptions(
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.serviceFeeStorage.saveSelectOptionsToCache(optionsData);

        console.log(
          "ServiceFeeManager: Select options data fetched successfully",
        );

        return optionsData;
      } finally {
        this.serviceFeeStorage.setSelectOptionsCacheLoading(false);
      }
    } catch (error) {
      this.serviceFeeStorage.setSelectOptionsCacheLoading(false);
      console.error("ServiceFeeManager: Failed to get select options", error);
      throw error;
    }
  }

  /**
   * Gets list of service fees with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Service fees list with pagination data
   */
  async getServiceFees(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedServiceFees =
          this.serviceFeeStorage.getServiceFeesFromCache();
        if (cachedServiceFees) {
          return cachedServiceFees;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.serviceFeeStorage.isServiceFeesCacheLoading()) {
        console.log(
          "ServiceFeeManager: Service fees request already in progress",
        );
        return this._waitForCurrentServiceFeesRequest();
      }

      this.serviceFeeStorage.setServiceFeesCacheLoading(true);

      console.log(
        "ServiceFeeManager: Fetching fresh service fees data",
        params,
      );

      try {
        // Validate and clean parameters
        const validatedParams = this._validateServiceFeesParams(params);

        // Fetch fresh data from API
        const serviceFeesData = await this.serviceFeeAPI.getServiceFees(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.serviceFeeStorage.saveServiceFeesToCache(serviceFeesData);

        console.log(
          "ServiceFeeManager: Service fees data fetched successfully:",
          {
            count: serviceFeesData.results ? serviceFeesData.results.length : 0,
            totalCount: serviceFeesData.count,
          },
        );

        return serviceFeesData;
      } finally {
        this.serviceFeeStorage.setServiceFeesCacheLoading(false);
      }
    } catch (error) {
      this.serviceFeeStorage.setServiceFeesCacheLoading(false);
      console.error("ServiceFeeManager: Failed to get service fees", error);
      throw error;
    }
  }

  /**
   * Creates a new service fee with validation
   * @param {Object} serviceFeeData - Service fee data to create
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Created service fee data
   */
  async createServiceFee(serviceFeeData, onUnauthorizedCallback = null) {
    try {
      // Validate service fee data
      const validationErrors = this._validateServiceFeeData(
        serviceFeeData,
        true,
      );
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("ServiceFeeManager: Creating new service fee");

      // Call API to create service fee
      const createdServiceFeeData = await this.serviceFeeAPI.createServiceFee(
        serviceFeeData,
        onUnauthorizedCallback,
      );

      // Clear service fees cache since new data has been added
      this.serviceFeeStorage.clearServiceFeesCache();
      this.serviceFeeStorage.clearSelectOptionsCache();

      console.log("ServiceFeeManager: Service fee created successfully:", {
        id: createdServiceFeeData.id,
        title: createdServiceFeeData.title,
        amount: createdServiceFeeData.amount,
      });

      return createdServiceFeeData;
    } catch (error) {
      console.error("ServiceFeeManager: Failed to create service fee", error);
      throw error;
    }
  }

  /**
   * Gets details for a specific service fee
   * @param {string|number} serviceFeeId - The ID of the service fee
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Service fee details
   */
  async getServiceFeeDetail(serviceFeeId, onUnauthorizedCallback = null) {
    try {
      // Validate service fee ID
      const validationError = this._validateServiceFeeId(serviceFeeId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `ServiceFeeManager: Fetching service fee detail for ID ${serviceFeeId}`,
      );

      // Call API to get service fee details
      const serviceFeeData = await this.serviceFeeAPI.getServiceFeeDetail(
        serviceFeeId,
        onUnauthorizedCallback,
      );

      console.log(
        "ServiceFeeManager: Service fee detail fetched successfully:",
        {
          id: serviceFeeData.id,
          title: serviceFeeData.title,
          amount: serviceFeeData.amount,
        },
      );

      return serviceFeeData;
    } catch (error) {
      console.error(
        "ServiceFeeManager: Failed to get service fee detail",
        error,
      );
      throw error;
    }
  }

  /**
   * Updates a specific service fee
   * @param {string|number} serviceFeeId - The ID of the service fee
   * @param {Object} serviceFeeData - Service fee data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated service fee data
   */
  async updateServiceFee(
    serviceFeeId,
    serviceFeeData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate service fee ID
      const serviceFeeIdError = this._validateServiceFeeId(serviceFeeId);
      if (serviceFeeIdError) {
        throw serviceFeeIdError;
      }

      // Validate service fee data
      const validationErrors = this._validateServiceFeeData(serviceFeeData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(`ServiceFeeManager: Updating service fee ID ${serviceFeeId}`);

      // Call API to update service fee
      const updatedServiceFeeData = await this.serviceFeeAPI.updateServiceFee(
        serviceFeeId,
        serviceFeeData,
        onUnauthorizedCallback,
      );

      // Clear service fees cache since data has been updated
      this.serviceFeeStorage.clearServiceFeesCache();
      this.serviceFeeStorage.clearSelectOptionsCache();

      console.log("ServiceFeeManager: Service fee updated successfully");

      return updatedServiceFeeData;
    } catch (error) {
      console.error("ServiceFeeManager: Failed to update service fee", error);
      throw error;
    }
  }

  /**
   * Deletes a specific service fee
   * @param {string|number} serviceFeeId - The ID of the service fee to delete
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Delete response
   */
  async deleteServiceFee(serviceFeeId, onUnauthorizedCallback = null) {
    try {
      // Validate service fee ID
      const validationError = this._validateServiceFeeId(serviceFeeId);
      if (validationError) {
        throw validationError;
      }

      console.log(`ServiceFeeManager: Deleting service fee ID ${serviceFeeId}`);

      // Call API to delete service fee
      const deleteResponse = await this.serviceFeeAPI.deleteServiceFee(
        serviceFeeId,
        onUnauthorizedCallback,
      );

      // Clear service fees cache since data has been updated
      this.serviceFeeStorage.clearServiceFeesCache();
      this.serviceFeeStorage.clearSelectOptionsCache();

      console.log("ServiceFeeManager: Service fee deleted successfully");

      return deleteResponse;
    } catch (error) {
      console.error("ServiceFeeManager: Failed to delete service fee", error);
      throw error;
    }
  }

  /**
   * Gets service fee preferences
   * @returns {Object|null} - Service fee preferences or null
   */
  getServiceFeePreferences() {
    return this.serviceFeeStorage.getServiceFeePreferences();
  }

  /**
   * Saves service fee preferences
   * @param {Object} preferences - Preferences object
   */
  saveServiceFeePreferences(preferences) {
    this.serviceFeeStorage.saveServiceFeePreferences(preferences);
  }

  /**
   * Gets service fee filters
   * @returns {Object|null} - Service fee filters or null
   */
  getServiceFeeFilters() {
    return this.serviceFeeStorage.getServiceFeeFilters();
  }

  /**
   * Saves service fee filters
   * @param {Object} filters - Filters object
   */
  saveServiceFeeFilters(filters) {
    this.serviceFeeStorage.saveServiceFeeFilters(filters);
  }

  /**
   * Clears the service fees cache
   */
  clearServiceFeesCache() {
    this.serviceFeeStorage.clearServiceFeesCache();
  }

  /**
   * Clears the select options cache
   */
  clearSelectOptionsCache() {
    this.serviceFeeStorage.clearSelectOptionsCache();
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.serviceFeeStorage.clearAllCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getServiceFeesCacheInfo() {
    return this.serviceFeeStorage.getServiceFeesCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setServiceFeesCacheDuration(durationMs) {
    this.serviceFeeStorage.setCacheDuration(durationMs);
  }

  /**
   * Sets select options cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.serviceFeeStorage.setSelectOptionsCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getServiceFeeSelectOptionsWithCallbacks(
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getServiceFeeSelectOptions(onUnauthorizedCallback, forceRefresh)
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

  getServiceFeesWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getServiceFees(params, onUnauthorizedCallback, forceRefresh)
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

  createServiceFeeWithCallbacks(
    serviceFeeData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createServiceFee(serviceFeeData, onUnauthorizedCallback)
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

  getServiceFeeDetailWithCallbacks(
    serviceFeeId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getServiceFeeDetail(serviceFeeId, onUnauthorizedCallback)
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

  updateServiceFeeWithCallbacks(
    serviceFeeId,
    serviceFeeData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateServiceFee(serviceFeeId, serviceFeeData, onUnauthorizedCallback)
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

  deleteServiceFeeWithCallbacks(
    serviceFeeId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.deleteServiceFee(serviceFeeId, onUnauthorizedCallback)
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

  _validateServiceFeeId(serviceFeeId) {
    if (
      !serviceFeeId ||
      (typeof serviceFeeId !== "string" && typeof serviceFeeId !== "number")
    ) {
      return { serviceFeeId: "Valid service fee ID is required" };
    }
    return null;
  }

  _validateServiceFeesParams(params) {
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
        "amount",
        "percentage",
        "created_at",
        "updated_at",
        "status",
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

  _validateServiceFeeData(serviceFeeData, isCreate = false) {
    const errors = {};

    if (!serviceFeeData || typeof serviceFeeData !== "object") {
      errors.general = "Service fee data is required";
      return errors;
    }

    // Validate title (required)
    if (!serviceFeeData.title || !serviceFeeData.title.trim()) {
      errors.title = "Service fee title is required";
    } else if (serviceFeeData.title.length > 127) {
      errors.title = "Title must be less than 127 characters";
    }

    // Validate description (optional)
    if (serviceFeeData.description && serviceFeeData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    // Validate amount (required)
    if (serviceFeeData.amount === undefined || serviceFeeData.amount === null) {
      errors.amount = "Service fee amount is required";
    } else if (
      typeof serviceFeeData.amount !== "number" ||
      serviceFeeData.amount < 0
    ) {
      errors.amount = "Amount must be a non-negative number";
    } else if (serviceFeeData.amount > 999999.99) {
      errors.amount = "Amount must be less than $1,000,000";
    }

    // Validate percentage (optional, but if provided must be valid)
    if (
      serviceFeeData.percentage !== undefined &&
      serviceFeeData.percentage !== null
    ) {
      if (
        typeof serviceFeeData.percentage !== "number" ||
        serviceFeeData.percentage < 0 ||
        serviceFeeData.percentage > 100
      ) {
        errors.percentage = "Percentage must be a number between 0 and 100";
      }
    }

    // Validate status (optional)
    if (serviceFeeData.status !== undefined) {
      const validStatuses = [1, 2]; // Active, Inactive
      if (!validStatuses.includes(serviceFeeData.status)) {
        errors.status = "Invalid service fee status";
      }
    }

    // Validate type (optional)
    if (serviceFeeData.type !== undefined) {
      const validTypes = [1, 2, 3]; // Fixed, Percentage, Hourly, etc.
      if (!validTypes.includes(serviceFeeData.type)) {
        errors.type = "Invalid service fee type";
      }
    }

    // Business rule: cannot have both amount and percentage set to significant values
    if (
      serviceFeeData.amount &&
      serviceFeeData.percentage &&
      serviceFeeData.amount > 0 &&
      serviceFeeData.percentage > 0
    ) {
      errors.general =
        "Service fee cannot have both a fixed amount and percentage. Please choose one.";
    }

    // Business rule: must have either amount or percentage
    if (
      (!serviceFeeData.amount || serviceFeeData.amount <= 0) &&
      (!serviceFeeData.percentage || serviceFeeData.percentage <= 0)
    ) {
      errors.general =
        "Service fee must have either a fixed amount or percentage";
    }

    return errors;
  }

  /**
   * Waits for current service fees request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentServiceFeesRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.serviceFeeStorage.isServiceFeesCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.serviceFeeStorage.getServiceFeesFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Service fees request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Service fees request timeout"));
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
        if (!this.serviceFeeStorage.isSelectOptionsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.serviceFeeStorage.getSelectOptionsFromCache();
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
