// File Path: monorepo/web/workery-frontend/src/services/Manager/VehicleTypeManager.js

/**
 * VehicleTypeManager handles all vehicle type-related business logic
 * Combines VehicleTypeAPI with VehicleTypeStorage for complete vehicle type management
 */
export class VehicleTypeManager {
  constructor(vehicleTypeAPI, vehicleTypeStorage) {
    this.vehicleTypeAPI = vehicleTypeAPI;
    this.vehicleTypeStorage = vehicleTypeStorage;
  }

  /**
   * Gets vehicle type select options with caching
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Vehicle type select options
   */
  async getVehicleTypeSelectOptions(
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedOptions =
          this.vehicleTypeStorage.getSelectOptionsFromCache();
        if (cachedOptions) {
          return cachedOptions;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.vehicleTypeStorage.isSelectOptionsCacheLoading()) {
        console.log(
          "VehicleTypeManager: Select options request already in progress",
        );
        return this._waitForCurrentSelectOptionsRequest();
      }

      this.vehicleTypeStorage.setSelectOptionsCacheLoading(true);

      console.log("VehicleTypeManager: Fetching fresh select options data");

      try {
        // Fetch fresh data from API
        const optionsData =
          await this.vehicleTypeAPI.getVehicleTypeSelectOptions(
            onUnauthorizedCallback,
          );

        // Save to storage cache
        this.vehicleTypeStorage.saveSelectOptionsToCache(optionsData);

        console.log(
          "VehicleTypeManager: Select options data fetched successfully",
        );

        return optionsData;
      } finally {
        this.vehicleTypeStorage.setSelectOptionsCacheLoading(false);
      }
    } catch (error) {
      this.vehicleTypeStorage.setSelectOptionsCacheLoading(false);
      console.error("VehicleTypeManager: Failed to get select options", error);
      throw error;
    }
  }

  /**
   * Gets list of vehicle types with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Vehicle types list with pagination data
   */
  async getVehicleTypes(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedVehicleTypes =
          this.vehicleTypeStorage.getVehicleTypesFromCache();
        if (cachedVehicleTypes) {
          return cachedVehicleTypes;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.vehicleTypeStorage.isVehicleTypesCacheLoading()) {
        console.log(
          "VehicleTypeManager: Vehicle types request already in progress",
        );
        return this._waitForCurrentVehicleTypesRequest();
      }

      this.vehicleTypeStorage.setVehicleTypesCacheLoading(true);

      console.log(
        "VehicleTypeManager: Fetching fresh vehicle types data",
        params,
      );

      try {
        // Validate and clean parameters
        const validatedParams = this._validateVehicleTypesParams(params);

        // Fetch fresh data from API
        const vehicleTypesData = await this.vehicleTypeAPI.getVehicleTypes(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.vehicleTypeStorage.saveVehicleTypesToCache(vehicleTypesData);

        console.log(
          "VehicleTypeManager: Vehicle types data fetched successfully:",
          {
            count: vehicleTypesData.results
              ? vehicleTypesData.results.length
              : 0,
            totalCount: vehicleTypesData.count,
          },
        );

        return vehicleTypesData;
      } finally {
        this.vehicleTypeStorage.setVehicleTypesCacheLoading(false);
      }
    } catch (error) {
      this.vehicleTypeStorage.setVehicleTypesCacheLoading(false);
      console.error("VehicleTypeManager: Failed to get vehicle types", error);
      throw error;
    }
  }

  /**
   * Creates a new vehicle type with validation
   * @param {Object} vehicleTypeData - Vehicle type data to create
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Created vehicle type data
   */
  async createVehicleType(vehicleTypeData, onUnauthorizedCallback = null) {
    try {
      // Validate vehicle type data
      const validationErrors = this._validateVehicleTypeData(
        vehicleTypeData,
        true,
      );
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("VehicleTypeManager: Creating new vehicle type");

      // Call API to create vehicle type
      const createdVehicleTypeData =
        await this.vehicleTypeAPI.createVehicleType(
          vehicleTypeData,
          onUnauthorizedCallback,
        );

      // Clear vehicle types cache since new data has been added
      this.vehicleTypeStorage.clearVehicleTypesCache();
      this.vehicleTypeStorage.clearSelectOptionsCache();

      console.log("VehicleTypeManager: Vehicle type created successfully:", {
        id: createdVehicleTypeData.id,
        name: createdVehicleTypeData.name,
      });

      return createdVehicleTypeData;
    } catch (error) {
      console.error("VehicleTypeManager: Failed to create vehicle type", error);
      throw error;
    }
  }

  /**
   * Gets details for a specific vehicle type
   * @param {string|number} vehicleTypeId - The ID of the vehicle type
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Vehicle type details
   */
  async getVehicleTypeDetail(vehicleTypeId, onUnauthorizedCallback = null) {
    try {
      // Validate vehicle type ID
      const validationError = this._validateVehicleTypeId(vehicleTypeId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `VehicleTypeManager: Fetching vehicle type detail for ID ${vehicleTypeId}`,
      );

      // Call API to get vehicle type details
      const vehicleTypeData = await this.vehicleTypeAPI.getVehicleTypeDetail(
        vehicleTypeId,
        onUnauthorizedCallback,
      );

      console.log(
        "VehicleTypeManager: Vehicle type detail fetched successfully:",
        {
          id: vehicleTypeData.id,
          name: vehicleTypeData.name,
        },
      );

      return vehicleTypeData;
    } catch (error) {
      console.error(
        "VehicleTypeManager: Failed to get vehicle type detail",
        error,
      );
      throw error;
    }
  }

  /**
   * Updates a specific vehicle type
   * @param {string|number} vehicleTypeId - The ID of the vehicle type
   * @param {Object} vehicleTypeData - Vehicle type data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated vehicle type data
   */
  async updateVehicleType(
    vehicleTypeId,
    vehicleTypeData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate vehicle type ID
      const vehicleTypeIdError = this._validateVehicleTypeId(vehicleTypeId);
      if (vehicleTypeIdError) {
        throw vehicleTypeIdError;
      }

      // Validate vehicle type data
      const validationErrors = this._validateVehicleTypeData(vehicleTypeData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(
        `VehicleTypeManager: Updating vehicle type ID ${vehicleTypeId}`,
      );

      // Call API to update vehicle type
      const updatedVehicleTypeData =
        await this.vehicleTypeAPI.updateVehicleType(
          vehicleTypeId,
          vehicleTypeData,
          onUnauthorizedCallback,
        );

      // Clear vehicle types cache since data has been updated
      this.vehicleTypeStorage.clearVehicleTypesCache();
      this.vehicleTypeStorage.clearSelectOptionsCache();

      console.log("VehicleTypeManager: Vehicle type updated successfully");

      return updatedVehicleTypeData;
    } catch (error) {
      console.error("VehicleTypeManager: Failed to update vehicle type", error);
      throw error;
    }
  }

  /**
   * Deletes a specific vehicle type
   * @param {string|number} vehicleTypeId - The ID of the vehicle type to delete
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Delete response
   */
  async deleteVehicleType(vehicleTypeId, onUnauthorizedCallback = null) {
    try {
      // Validate vehicle type ID
      const validationError = this._validateVehicleTypeId(vehicleTypeId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `VehicleTypeManager: Deleting vehicle type ID ${vehicleTypeId}`,
      );

      // Call API to delete vehicle type
      const deleteResponse = await this.vehicleTypeAPI.deleteVehicleType(
        vehicleTypeId,
        onUnauthorizedCallback,
      );

      // Clear vehicle types cache since data has been updated
      this.vehicleTypeStorage.clearVehicleTypesCache();
      this.vehicleTypeStorage.clearSelectOptionsCache();

      console.log("VehicleTypeManager: Vehicle type deleted successfully");

      return deleteResponse;
    } catch (error) {
      console.error("VehicleTypeManager: Failed to delete vehicle type", error);
      throw error;
    }
  }

  /**
   * Gets vehicle type preferences
   * @returns {Object|null} - Vehicle type preferences or null
   */
  getVehicleTypePreferences() {
    return this.vehicleTypeStorage.getVehicleTypePreferences();
  }

  /**
   * Saves vehicle type preferences
   * @param {Object} preferences - Preferences object
   */
  saveVehicleTypePreferences(preferences) {
    this.vehicleTypeStorage.saveVehicleTypePreferences(preferences);
  }

  /**
   * Clears the vehicle types cache
   */
  clearVehicleTypesCache() {
    this.vehicleTypeStorage.clearVehicleTypesCache();
  }

  /**
   * Clears the select options cache
   */
  clearSelectOptionsCache() {
    this.vehicleTypeStorage.clearSelectOptionsCache();
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.vehicleTypeStorage.clearAllCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getVehicleTypesCacheInfo() {
    return this.vehicleTypeStorage.getVehicleTypesCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setVehicleTypesCacheDuration(durationMs) {
    this.vehicleTypeStorage.setCacheDuration(durationMs);
  }

  /**
   * Sets select options cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.vehicleTypeStorage.setSelectOptionsCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getVehicleTypeSelectOptionsWithCallbacks(
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getVehicleTypeSelectOptions(onUnauthorizedCallback, forceRefresh)
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

  getVehicleTypesWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getVehicleTypes(params, onUnauthorizedCallback, forceRefresh)
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

  createVehicleTypeWithCallbacks(
    vehicleTypeData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createVehicleType(vehicleTypeData, onUnauthorizedCallback)
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

  getVehicleTypeDetailWithCallbacks(
    vehicleTypeId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getVehicleTypeDetail(vehicleTypeId, onUnauthorizedCallback)
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

  updateVehicleTypeWithCallbacks(
    vehicleTypeId,
    vehicleTypeData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateVehicleType(
      vehicleTypeId,
      vehicleTypeData,
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

  deleteVehicleTypeWithCallbacks(
    vehicleTypeId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.deleteVehicleType(vehicleTypeId, onUnauthorizedCallback)
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

  _validateVehicleTypeId(vehicleTypeId) {
    if (
      !vehicleTypeId ||
      (typeof vehicleTypeId !== "string" && typeof vehicleTypeId !== "number")
    ) {
      return { vehicleTypeId: "Valid vehicle type ID is required" };
    }
    return null;
  }

  _validateVehicleTypesParams(params) {
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

  _validateVehicleTypeData(vehicleTypeData, isCreate = false) {
    const errors = {};

    if (!vehicleTypeData || typeof vehicleTypeData !== "object") {
      errors.general = "Vehicle type data is required";
      return errors;
    }

    // Validate name (required)
    if (!vehicleTypeData.name || !vehicleTypeData.name.trim()) {
      errors.name = "Vehicle type name is required";
    } else if (vehicleTypeData.name.length > 100) {
      errors.name = "Vehicle type name must be less than 100 characters";
    }

    // Validate description (optional)
    if (
      vehicleTypeData.description &&
      vehicleTypeData.description.length > 500
    ) {
      errors.description = "Description must be less than 500 characters";
    }

    // Validate status (optional)
    if (vehicleTypeData.status !== undefined) {
      const validStatuses = [1, 2]; // Active, Inactive
      if (!validStatuses.includes(vehicleTypeData.status)) {
        errors.status = "Invalid vehicle type status";
      }
    }

    // Validate sort order (optional)
    if (vehicleTypeData.sortOrder !== undefined) {
      if (
        typeof vehicleTypeData.sortOrder !== "number" ||
        vehicleTypeData.sortOrder < 0
      ) {
        errors.sortOrder = "Sort order must be a non-negative number";
      }
    }

    return errors;
  }

  /**
   * Waits for current vehicle types request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentVehicleTypesRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.vehicleTypeStorage.isVehicleTypesCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.vehicleTypeStorage.getVehicleTypesFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Vehicle types request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Vehicle types request timeout"));
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
        if (!this.vehicleTypeStorage.isSelectOptionsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData =
            this.vehicleTypeStorage.getSelectOptionsFromCache();
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
