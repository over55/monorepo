// File Path: web/workery-frontend/src/services/Manager/OrderIncidentManager.js

/**
 * OrderIncidentManager handles all order incident-related business logic
 * Combines OrderIncidentAPI with OrderIncidentStorage for complete order incident management
 */
export class OrderIncidentManager {
  constructor(orderIncidentAPI, orderIncidentStorage) {
    this.orderIncidentAPI = orderIncidentAPI;
    this.orderIncidentStorage = orderIncidentStorage;
  }

  /**
   * Gets order incident select options with caching
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Order incident select options
   */
  async getOrderIncidentSelectOptions(
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedOptions =
          this.orderIncidentStorage.getSelectOptionsFromCache();
        if (cachedOptions) {
          return cachedOptions;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.orderIncidentStorage.isSelectOptionsCacheLoading()) {
        console.log(
          "OrderIncidentManager: Select options request already in progress",
        );
        return this._waitForCurrentSelectOptionsRequest();
      }

      this.orderIncidentStorage.setSelectOptionsCacheLoading(true);

      console.log("OrderIncidentManager: Fetching fresh select options data");

      try {
        // Fetch fresh data from API
        const optionsData =
          await this.orderIncidentAPI.getOrderIncidentSelectOptions(
            new Map(),
            onUnauthorizedCallback,
          );

        // Save to storage cache
        this.orderIncidentStorage.saveSelectOptionsToCache(optionsData);

        console.log(
          "OrderIncidentManager: Select options data fetched successfully",
        );

        return optionsData;
      } finally {
        this.orderIncidentStorage.setSelectOptionsCacheLoading(false);
      }
    } catch (error) {
      this.orderIncidentStorage.setSelectOptionsCacheLoading(false);
      console.error(
        "OrderIncidentManager: Failed to get select options",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets list of order incidents with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Order incidents list with pagination data
   */
  async getOrderIncidents(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Generate a cache key based on the parameters
      const cacheKey = this._generateCacheKey(params);

      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedOrderIncidents =
          this.orderIncidentStorage.getOrderIncidentsCacheByKey(cacheKey);
        if (cachedOrderIncidents) {
          console.log(
            "OrderIncidentManager: Using cached data for key:",
            cacheKey,
          );
          return cachedOrderIncidents;
        }
      }

      // Prevent multiple simultaneous requests for the same parameters
      if (
        this.orderIncidentStorage.isOrderIncidentsCacheLoadingForKey(cacheKey)
      ) {
        console.log(
          "OrderIncidentManager: Order incidents request already in progress for key:",
          cacheKey,
        );
        return this._waitForCurrentOrderIncidentsRequest(cacheKey);
      }

      this.orderIncidentStorage.setOrderIncidentsCacheLoadingForKey(
        cacheKey,
        true,
      );

      console.log(
        "OrderIncidentManager: Fetching fresh order incidents data",
        params,
      );

      try {
        // Validate and clean parameters
        const validatedParams = this._validateOrderIncidentsParams(params);

        // Fetch fresh data from API
        const orderIncidentsData =
          await this.orderIncidentAPI.getOrderIncidents(
            validatedParams,
            onUnauthorizedCallback,
          );

        // Save to storage cache with the specific cache key
        this.orderIncidentStorage.saveOrderIncidentsToCacheByKey(
          cacheKey,
          orderIncidentsData,
        );

        console.log(
          "OrderIncidentManager: Order incidents data fetched successfully:",
          {
            count: orderIncidentsData.results
              ? orderIncidentsData.results.length
              : 0,
            totalCount: orderIncidentsData.count,
            cacheKey: cacheKey,
          },
        );

        return orderIncidentsData;
      } finally {
        this.orderIncidentStorage.setOrderIncidentsCacheLoadingForKey(
          cacheKey,
          false,
        );
      }
    } catch (error) {
      const cacheKey = this._generateCacheKey(params);
      this.orderIncidentStorage.setOrderIncidentsCacheLoadingForKey(
        cacheKey,
        false,
      );
      console.error(
        "OrderIncidentManager: Failed to get order incidents",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets order incidents using legacy filtersMap approach for backward compatibility
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Order incidents list with pagination data
   */
  async getOrderIncidentsWithFiltersMap(
    filtersMap = new Map(),
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Convert Map to params object for cache key generation
      const params = {};
      filtersMap.forEach((value, key) => {
        params[key] = value;
      });

      const cacheKey = this._generateCacheKey(params);

      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedOrderIncidents =
          this.orderIncidentStorage.getOrderIncidentsCacheByKey(cacheKey);
        if (cachedOrderIncidents) {
          return cachedOrderIncidents;
        }
      }

      // Prevent multiple simultaneous requests
      if (
        this.orderIncidentStorage.isOrderIncidentsCacheLoadingForKey(cacheKey)
      ) {
        console.log(
          "OrderIncidentManager: Order incidents request already in progress",
        );
        return this._waitForCurrentOrderIncidentsRequest(cacheKey);
      }

      this.orderIncidentStorage.setOrderIncidentsCacheLoadingForKey(
        cacheKey,
        true,
      );

      console.log(
        "OrderIncidentManager: Fetching fresh order incidents data with filtersMap",
        filtersMap,
      );

      try {
        // Fetch fresh data from API using legacy method
        const orderIncidentsData =
          await this.orderIncidentAPI.getOrderIncidentsWithFiltersMap(
            filtersMap,
            onUnauthorizedCallback,
          );

        // Save to storage cache
        this.orderIncidentStorage.saveOrderIncidentsToCacheByKey(
          cacheKey,
          orderIncidentsData,
        );

        console.log(
          "OrderIncidentManager: Order incidents data fetched successfully:",
          {
            count: orderIncidentsData.results
              ? orderIncidentsData.results.length
              : 0,
            totalCount: orderIncidentsData.count,
          },
        );

        return orderIncidentsData;
      } finally {
        this.orderIncidentStorage.setOrderIncidentsCacheLoadingForKey(
          cacheKey,
          false,
        );
      }
    } catch (error) {
      const params = {};
      filtersMap.forEach((value, key) => {
        params[key] = value;
      });
      const cacheKey = this._generateCacheKey(params);
      this.orderIncidentStorage.setOrderIncidentsCacheLoadingForKey(
        cacheKey,
        false,
      );
      console.error(
        "OrderIncidentManager: Failed to get order incidents",
        error,
      );
      throw error;
    }
  }

  /**
   * Creates a new order incident with validation
   * @param {Object} orderIncidentData - Order incident data to create
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Created order incident data
   */
  async createOrderIncident(orderIncidentData, onUnauthorizedCallback = null) {
    try {
      // Validate order incident data
      const validationErrors = this._validateOrderIncidentData(
        orderIncidentData,
        true,
      );
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("OrderIncidentManager: Creating new order incident");

      // Call API to create order incident
      const createdOrderIncidentData =
        await this.orderIncidentAPI.createOrderIncident(
          orderIncidentData,
          onUnauthorizedCallback,
        );

      // Clear ALL order incidents caches since new data has been added
      // This ensures that all filtered/searched views will be refreshed
      this.orderIncidentStorage.clearAllOrderIncidentsCache();
      this.orderIncidentStorage.clearSelectOptionsCache();
      this.orderIncidentStorage.clearStatisticsCache();

      console.log(
        "OrderIncidentManager: Order incident created successfully:",
        {
          id: createdOrderIncidentData.id,
          title: createdOrderIncidentData.title,
        },
      );

      return createdOrderIncidentData;
    } catch (error) {
      console.error(
        "OrderIncidentManager: Failed to create order incident",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets details for a specific order incident
   * @param {string|number} orderIncidentId - The ID of the order incident
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Order incident details
   */
  async getOrderIncidentDetail(orderIncidentId, onUnauthorizedCallback = null) {
    try {
      // Validate order incident ID
      const validationError = this._validateOrderIncidentId(orderIncidentId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `OrderIncidentManager: Fetching order incident detail for ID ${orderIncidentId}`,
      );

      // Call API to get order incident details
      const orderIncidentData =
        await this.orderIncidentAPI.getOrderIncidentDetail(
          orderIncidentId,
          onUnauthorizedCallback,
        );

      console.log(
        "OrderIncidentManager: Order incident detail fetched successfully:",
        {
          id: orderIncidentData.id,
          title: orderIncidentData.title,
        },
      );

      return orderIncidentData;
    } catch (error) {
      console.error(
        "OrderIncidentManager: Failed to get order incident detail",
        error,
      );
      throw error;
    }
  }

  /**
   * Updates a specific order incident
   * @param {string|number} orderIncidentId - The ID of the order incident
   * @param {Object} orderIncidentData - Order incident data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated order incident data
   */
  async updateOrderIncident(
    orderIncidentId,
    orderIncidentData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate order incident ID
      const orderIncidentIdError =
        this._validateOrderIncidentId(orderIncidentId);
      if (orderIncidentIdError) {
        throw orderIncidentIdError;
      }

      // Validate order incident data
      const validationErrors =
        this._validateOrderIncidentData(orderIncidentData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(
        `OrderIncidentManager: Updating order incident ID ${orderIncidentId}`,
      );

      // Call API to update order incident
      const updatedOrderIncidentData =
        await this.orderIncidentAPI.updateOrderIncident(
          orderIncidentId,
          orderIncidentData,
          onUnauthorizedCallback,
        );

      // Clear ALL order incidents caches since data has been updated
      this.orderIncidentStorage.clearAllOrderIncidentsCache();
      this.orderIncidentStorage.clearStatisticsCache();

      console.log("OrderIncidentManager: Order incident updated successfully");

      return updatedOrderIncidentData;
    } catch (error) {
      console.error(
        "OrderIncidentManager: Failed to update order incident",
        error,
      );
      throw error;
    }
  }

  /**
   * Deletes a specific order incident
   * @param {string|number} orderIncidentId - The ID of the order incident to delete
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Delete response
   */
  async deleteOrderIncident(orderIncidentId, onUnauthorizedCallback = null) {
    try {
      // Validate order incident ID
      const validationError = this._validateOrderIncidentId(orderIncidentId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `OrderIncidentManager: Deleting order incident ID ${orderIncidentId}`,
      );

      // Call API to delete order incident
      const deleteResponse = await this.orderIncidentAPI.deleteOrderIncident(
        orderIncidentId,
        onUnauthorizedCallback,
      );

      // Clear ALL order incidents caches since data has been deleted
      this.orderIncidentStorage.clearAllOrderIncidentsCache();
      this.orderIncidentStorage.clearSelectOptionsCache();
      this.orderIncidentStorage.clearStatisticsCache();

      console.log("OrderIncidentManager: Order incident deleted successfully");

      return deleteResponse;
    } catch (error) {
      console.error(
        "OrderIncidentManager: Failed to delete order incident",
        error,
      );
      throw error;
    }
  }

  /**
   * Archives a specific order incident
   * @param {string|number} orderIncidentId - The ID of the order incident to archive
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Archive response
   */
  async archiveOrderIncident(orderIncidentId, onUnauthorizedCallback = null) {
    try {
      // Validate order incident ID
      const validationError = this._validateOrderIncidentId(orderIncidentId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `OrderIncidentManager: Archiving order incident ID ${orderIncidentId}`,
      );

      // Call API to archive order incident
      const archiveResponse = await this.orderIncidentAPI.archiveOrderIncident(
        orderIncidentId,
        onUnauthorizedCallback,
      );

      // Clear ALL order incidents caches since data has been updated
      this.orderIncidentStorage.clearAllOrderIncidentsCache();
      this.orderIncidentStorage.clearStatisticsCache();

      console.log("OrderIncidentManager: Order incident archived successfully");

      return archiveResponse;
    } catch (error) {
      console.error(
        "OrderIncidentManager: Failed to archive order incident",
        error,
      );
      throw error;
    }
  }

  /**
   * Creates a comment for an order incident
   * @param {string|number} orderIncidentId - The ID of the order incident
   * @param {string} content - Comment content
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Comment creation response
   */
  async createOrderIncidentComment(
    orderIncidentId,
    content,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate parameters
      const orderIncidentIdError =
        this._validateOrderIncidentId(orderIncidentId);
      if (orderIncidentIdError) {
        throw orderIncidentIdError;
      }

      if (!content || typeof content !== "string" || !content.trim()) {
        throw {
          content: "Comment content is required",
        };
      }

      console.log(
        `OrderIncidentManager: Creating comment for order incident ID ${orderIncidentId}`,
      );

      // Call API to create comment
      const commentResponse =
        await this.orderIncidentAPI.createOrderIncidentComment(
          orderIncidentId,
          content,
          onUnauthorizedCallback,
        );

      console.log("OrderIncidentManager: Comment created successfully");

      return commentResponse;
    } catch (error) {
      console.error("OrderIncidentManager: Failed to create comment", error);
      throw error;
    }
  }

  /**
   * Uploads file attachment for an order incident
   * @param {FormData} formData - Form data containing the file
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - File upload response
   */
  async uploadOrderIncidentFile(formData, onUnauthorizedCallback = null) {
    try {
      // Validate form data
      if (!(formData instanceof FormData)) {
        throw {
          formData: "Valid FormData is required for file upload",
        };
      }

      console.log("OrderIncidentManager: Uploading file for order incident");

      // Call API to upload file
      const uploadResponse =
        await this.orderIncidentAPI.uploadOrderIncidentFile(
          formData,
          onUnauthorizedCallback,
        );

      console.log("OrderIncidentManager: File uploaded successfully");

      return uploadResponse;
    } catch (error) {
      console.error("OrderIncidentManager: Failed to upload file", error);
      throw error;
    }
  }

  /**
   * Gets order incident statistics with caching
   * @param {Object} params - Query parameters for statistics
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Statistics data
   */
  async getOrderIncidentStatistics(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedStatistics =
          this.orderIncidentStorage.getStatisticsFromCache();
        if (cachedStatistics) {
          return cachedStatistics;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.orderIncidentStorage.isStatisticsCacheLoading()) {
        console.log(
          "OrderIncidentManager: Statistics request already in progress",
        );
        return this._waitForCurrentStatisticsRequest();
      }

      this.orderIncidentStorage.setStatisticsCacheLoading(true);

      console.log(
        "OrderIncidentManager: Fetching fresh statistics data",
        params,
      );

      try {
        // Fetch fresh data from API
        const statisticsData =
          await this.orderIncidentAPI.getOrderIncidentStatistics(
            params,
            onUnauthorizedCallback,
          );

        // Save to storage cache
        this.orderIncidentStorage.saveStatisticsToCache(statisticsData);

        console.log(
          "OrderIncidentManager: Statistics data fetched successfully",
        );

        return statisticsData;
      } finally {
        this.orderIncidentStorage.setStatisticsCacheLoading(false);
      }
    } catch (error) {
      this.orderIncidentStorage.setStatisticsCacheLoading(false);
      console.error("OrderIncidentManager: Failed to get statistics", error);
      throw error;
    }
  }

  /**
   * Gets order incident preferences
   * @returns {Object|null} - Order incident preferences or null
   */
  getOrderIncidentPreferences() {
    return this.orderIncidentStorage.getOrderIncidentPreferences();
  }

  /**
   * Saves order incident preferences
   * @param {Object} preferences - Preferences object
   */
  saveOrderIncidentPreferences(preferences) {
    this.orderIncidentStorage.saveOrderIncidentPreferences(preferences);
  }

  /**
   * Clears the order incidents cache
   */
  clearOrderIncidentsCache() {
    this.orderIncidentStorage.clearAllOrderIncidentsCache();
  }

  /**
   * Clears the select options cache
   */
  clearSelectOptionsCache() {
    this.orderIncidentStorage.clearSelectOptionsCache();
  }

  /**
   * Clears the statistics cache
   */
  clearStatisticsCache() {
    this.orderIncidentStorage.clearStatisticsCache();
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.orderIncidentStorage.clearAllCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getOrderIncidentsCacheInfo() {
    return this.orderIncidentStorage.getOrderIncidentsCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setOrderIncidentsCacheDuration(durationMs) {
    this.orderIncidentStorage.setCacheDuration(durationMs);
  }

  /**
   * Sets select options cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.orderIncidentStorage.setSelectOptionsCacheDuration(durationMs);
  }

  /**
   * Sets statistics cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setStatisticsCacheDuration(durationMs) {
    this.orderIncidentStorage.setStatisticsCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getOrderIncidentSelectOptionsWithCallbacks(
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getOrderIncidentSelectOptions(onUnauthorizedCallback, forceRefresh)
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

  getOrderIncidentsWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getOrderIncidents(params, onUnauthorizedCallback, forceRefresh)
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

  getOrderIncidentsWithFiltersMapAndCallbacks(
    filtersMap = new Map(),
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getOrderIncidentsWithFiltersMap(
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

  createOrderIncidentWithCallbacks(
    orderIncidentData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createOrderIncident(orderIncidentData, onUnauthorizedCallback)
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

  getOrderIncidentDetailWithCallbacks(
    orderIncidentId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getOrderIncidentDetail(orderIncidentId, onUnauthorizedCallback)
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

  updateOrderIncidentWithCallbacks(
    orderIncidentId,
    orderIncidentData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateOrderIncident(
      orderIncidentId,
      orderIncidentData,
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

  deleteOrderIncidentWithCallbacks(
    orderIncidentId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.deleteOrderIncident(orderIncidentId, onUnauthorizedCallback)
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

  archiveOrderIncidentWithCallbacks(
    orderIncidentId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.archiveOrderIncident(orderIncidentId, onUnauthorizedCallback)
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

  getOrderIncidentStatisticsWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getOrderIncidentStatistics(
      params,
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
   * Private validation methods
   */

  _validateOrderIncidentId(orderIncidentId) {
    if (
      !orderIncidentId ||
      (typeof orderIncidentId !== "string" &&
        typeof orderIncidentId !== "number")
    ) {
      return { orderIncidentId: "Valid order incident ID is required" };
    }
    return null;
  }

  _validateOrderIncidentsParams(params) {
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

    // Validate sorting - handle combined format
    if (params.sortBy && typeof params.sortBy === "string") {
      // Check if sortBy contains combined format (e.g., "created_at,DESC")
      if (params.sortBy.includes(",")) {
        validatedParams.sortBy = params.sortBy;
      } else {
        // Separate field and order provided
        validatedParams.sortBy = params.sortBy;
        if (params.sortOrder) {
          validatedParams.sortOrder = params.sortOrder;
        }
      }
    }

    // Validate filters
    if (params.status && typeof params.status === "string") {
      validatedParams.status = params.status;
    }

    if (params.initiator && typeof params.initiator === "string") {
      validatedParams.initiator = params.initiator;
    }

    if (params.severity && typeof params.severity === "string") {
      validatedParams.severity = params.severity;
    }

    if (params.orderId && typeof params.orderId === "string") {
      validatedParams.orderId = params.orderId;
    }

    if (params.associateId && typeof params.associateId === "string") {
      validatedParams.associateId = params.associateId;
    }

    if (params.createdDateGte) {
      validatedParams.createdDateGte = params.createdDateGte;
    }

    if (params.createdDateLte) {
      validatedParams.createdDateLte = params.createdDateLte;
    }

    return validatedParams;
  }

  _validateOrderIncidentData(orderIncidentData, isCreate = false) {
    const errors = {};

    if (!orderIncidentData || typeof orderIncidentData !== "object") {
      errors.general = "Order incident data is required";
      return errors;
    }

    // Validate title (required)
    if (!orderIncidentData.title || !orderIncidentData.title.trim()) {
      errors.title = "Order incident title is required";
    } else if (orderIncidentData.title.length > 200) {
      errors.title = "Title must be less than 200 characters";
    }

    // Validate description (optional)
    if (
      orderIncidentData.description &&
      orderIncidentData.description.length > 2000
    ) {
      errors.description = "Description must be less than 2000 characters";
    }

    // Validate severity (optional)
    if (orderIncidentData.severity !== undefined) {
      const validSeverities = [1, 2, 3, 4, 5]; // Low, Medium, High, Critical, Emergency
      if (!validSeverities.includes(orderIncidentData.severity)) {
        errors.severity = "Invalid severity level";
      }
    }

    // Validate status (optional)
    if (orderIncidentData.status !== undefined) {
      const validStatuses = [1, 2, 3, 4]; // Open, In Progress, Resolved, Closed
      if (!validStatuses.includes(orderIncidentData.status)) {
        errors.status = "Invalid status";
      }
    }

    // Validate order ID (optional)
    if (
      orderIncidentData.orderId &&
      typeof orderIncidentData.orderId !== "string"
    ) {
      errors.orderId = "Order ID must be a valid string";
    }

    // Validate associate ID (optional)
    if (
      orderIncidentData.associateId &&
      typeof orderIncidentData.associateId !== "string"
    ) {
      errors.associateId = "Associate ID must be a valid string";
    }

    // Validate incident date (optional)
    if (orderIncidentData.incidentDate) {
      const date = new Date(orderIncidentData.incidentDate);
      if (isNaN(date.getTime())) {
        errors.incidentDate = "Invalid incident date";
      }
    }

    return errors;
  }

  /**
   * Generates a cache key based on query parameters
   * @private
   * @param {Object} params - Query parameters
   * @returns {string} - Cache key
   */
  _generateCacheKey(params) {
    // Create a normalized key from parameters
    const keyParts = [];

    // Include all relevant parameters in the cache key
    if (params.page) keyParts.push(`page:${params.page}`);
    if (params.limit) keyParts.push(`limit:${params.limit}`);
    if (params.search) keyParts.push(`search:${params.search}`);
    if (params.sortBy) keyParts.push(`sortBy:${params.sortBy}`);
    if (params.sortOrder) keyParts.push(`sortOrder:${params.sortOrder}`);
    if (params.status) keyParts.push(`status:${params.status}`);
    if (params.initiator) keyParts.push(`initiator:${params.initiator}`);
    if (params.severity) keyParts.push(`severity:${params.severity}`);
    if (params.orderId) keyParts.push(`orderId:${params.orderId}`);
    if (params.associateId) keyParts.push(`associateId:${params.associateId}`);
    if (params.createdDateGte)
      keyParts.push(`createdDateGte:${params.createdDateGte}`);
    if (params.createdDateLte)
      keyParts.push(`createdDateLte:${params.createdDateLte}`);

    // If no parameters, use a default key
    if (keyParts.length === 0) {
      return "default";
    }

    // Join parts with separator
    return keyParts.join("|");
  }

  /**
   * Waits for current order incidents request to complete
   * @private
   * @param {string} cacheKey - The cache key for the request
   * @returns {Promise<Object>}
   */
  _waitForCurrentOrderIncidentsRequest(cacheKey) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (
          !this.orderIncidentStorage.isOrderIncidentsCacheLoadingForKey(
            cacheKey,
          )
        ) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData =
            this.orderIncidentStorage.getOrderIncidentsCacheByKey(cacheKey);
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Order incidents request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Order incidents request timeout"));
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
        if (!this.orderIncidentStorage.isSelectOptionsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData =
            this.orderIncidentStorage.getSelectOptionsFromCache();
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

  /**
   * Waits for current statistics request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentStatisticsRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.orderIncidentStorage.isStatisticsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.orderIncidentStorage.getStatisticsFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Statistics request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Statistics request timeout"));
      }, 30000);
    });
  }
}
