// File Path: monorepo/web/workery-frontend/src/services/Manager/OrderManager.js

/**
 * OrderManager handles all work order-related business logic
 * Combines OrderAPI with OrderStorage for complete order management
 */
export class OrderManager {
  constructor(orderAPI, orderStorage) {
    this.orderAPI = orderAPI;
    this.orderStorage = orderStorage;
  }

  /**
   * Gets order select options with caching
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Order select options
   */
  async getOrderSelectOptions(
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedOptions = this.orderStorage.getSelectOptionsFromCache();
        if (cachedOptions) {
          return cachedOptions;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.orderStorage.isSelectOptionsCacheLoading()) {
        console.log("OrderManager: Select options request already in progress");
        return this._waitForCurrentSelectOptionsRequest();
      }

      this.orderStorage.setSelectOptionsCacheLoading(true);

      console.log("OrderManager: Fetching fresh select options data");

      try {
        // Fetch fresh data from API
        const optionsData = await this.orderAPI.getOrderSelectOptions(
          new Map(),
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.orderStorage.saveSelectOptionsToCache(optionsData);

        console.log("OrderManager: Select options data fetched successfully");

        return optionsData;
      } finally {
        this.orderStorage.setSelectOptionsCacheLoading(false);
      }
    } catch (error) {
      this.orderStorage.setSelectOptionsCacheLoading(false);
      console.error("OrderManager: Failed to get select options", error);
      throw error;
    }
  }

  /**
   * Gets order count with caching
   * @param {Object} params - Query parameters for filtering
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Order count data
   */
  async getOrderCount(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedCount = this.orderStorage.getCountFromCache();
        if (cachedCount) {
          return cachedCount;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.orderStorage.isCountCacheLoading()) {
        console.log("OrderManager: Count request already in progress");
        return this._waitForCurrentCountRequest();
      }

      this.orderStorage.setCountCacheLoading(true);

      console.log("OrderManager: Fetching fresh count data", params);

      try {
        // Fetch fresh data from API
        const countData = await this.orderAPI.getOrderCount(
          params,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.orderStorage.saveCountToCache(countData);

        console.log("OrderManager: Count data fetched successfully");

        return countData;
      } finally {
        this.orderStorage.setCountCacheLoading(false);
      }
    } catch (error) {
      this.orderStorage.setCountCacheLoading(false);
      console.error("OrderManager: Failed to get order count", error);
      throw error;
    }
  }

  /**
   * Gets list of orders with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder, status, customerId, associateId }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Orders list with pagination data
   */
  async getOrders(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedOrders = this.orderStorage.getOrdersFromCache();
        if (cachedOrders) {
          return cachedOrders;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.orderStorage.isOrdersCacheLoading()) {
        console.log("OrderManager: Orders request already in progress");
        return this._waitForCurrentOrdersRequest();
      }

      this.orderStorage.setOrdersCacheLoading(true);

      console.log("OrderManager: Fetching fresh orders data", params);

      try {
        // Validate and clean parameters
        const validatedParams = this._validateOrdersParams(params);

        // Fetch fresh data from API
        const ordersData = await this.orderAPI.getOrders(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.orderStorage.saveOrdersToCache(ordersData);

        console.log("OrderManager: Orders data fetched successfully:", {
          count: ordersData.results ? ordersData.results.length : 0,
          totalCount: ordersData.count,
        });

        return ordersData;
      } finally {
        this.orderStorage.setOrdersCacheLoading(false);
      }
    } catch (error) {
      this.orderStorage.setOrdersCacheLoading(false);
      console.error("OrderManager: Failed to get orders", error);
      throw error;
    }
  }

  /**
   * Gets orders using legacy filtersMap approach for backward compatibility
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Orders list with pagination data
   */
  async getOrdersWithFiltersMap(
    filtersMap = new Map(),
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedOrders = this.orderStorage.getOrdersFromCache();
        if (cachedOrders) {
          return cachedOrders;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.orderStorage.isOrdersCacheLoading()) {
        console.log("OrderManager: Orders request already in progress");
        return this._waitForCurrentOrdersRequest();
      }

      this.orderStorage.setOrdersCacheLoading(true);

      console.log("OrderManager: Fetching fresh orders data with filtersMap");

      try {
        // Fetch fresh data from API using legacy method
        const ordersData = await this.orderAPI.getOrdersWithFiltersMap(
          filtersMap,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.orderStorage.saveOrdersToCache(ordersData);

        console.log(
          "OrderManager: Orders data (legacy) fetched successfully:",
          {
            count: ordersData.results ? ordersData.results.length : 0,
            totalCount: ordersData.count,
          },
        );

        return ordersData;
      } finally {
        this.orderStorage.setOrdersCacheLoading(false);
      }
    } catch (error) {
      this.orderStorage.setOrdersCacheLoading(false);
      console.error("OrderManager: Failed to get orders (legacy)", error);
      throw error;
    }
  }

  /**
   * Creates a new work order with validation
   * @param {Object} orderData - Order data to create
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Created order data
   */
  async createOrder(orderData, onUnauthorizedCallback = null) {
    try {
      // Validate order data
      const validationErrors = this._validateOrderData(orderData, true);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("OrderManager: Creating new order");

      // Call API to create order
      const createdOrderData = await this.orderAPI.createOrder(
        orderData,
        onUnauthorizedCallback,
      );

      // Clear order caches since new data has been added
      this.orderStorage.clearOrdersCache();
      this.orderStorage.clearCountCache();
      this.orderStorage.clearSelectOptionsCache();

      console.log("OrderManager: Order created successfully:", {
        id: createdOrderData.id,
        title: createdOrderData.title || createdOrderData.description,
      });

      return createdOrderData;
    } catch (error) {
      console.error("OrderManager: Failed to create order", error);
      throw error;
    }
  }

  /**
   * Gets details for a specific order
   * @param {string|number} orderId - The ID of the order
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Order details
   */
  async getOrderDetail(orderId, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      const validationError = this._validateOrderId(orderId);
      if (validationError) {
        throw validationError;
      }

      console.log(`OrderManager: Fetching order detail for ID ${orderId}`);

      // Call API to get order details
      const orderData = await this.orderAPI.getOrderDetail(
        orderId,
        onUnauthorizedCallback,
      );

      console.log("OrderManager: Order detail fetched successfully:", {
        id: orderData.id,
        title: orderData.title || orderData.description,
      });

      return orderData;
    } catch (error) {
      console.error("OrderManager: Failed to get order detail", error);
      throw error;
    }
  }

  /**
   * Updates a specific order
   * @param {string|number} orderId - The ID of the order
   * @param {Object} orderData - Order data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated order data
   */
  async updateOrder(orderId, orderData, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      const orderIdError = this._validateOrderId(orderId);
      if (orderIdError) {
        throw orderIdError;
      }

      // Validate order data
      const validationErrors = this._validateOrderData(orderData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(`OrderManager: Updating order ID ${orderId}`);

      // Call API to update order
      const updatedOrderData = await this.orderAPI.updateOrder(
        orderId,
        orderData,
        onUnauthorizedCallback,
      );

      // Clear order caches since data has been updated
      this.orderStorage.clearOrdersCache();
      this.orderStorage.clearCountCache();

      console.log("OrderManager: Order updated successfully");

      return updatedOrderData;
    } catch (error) {
      console.error("OrderManager: Failed to update order", error);
      throw error;
    }
  }

  /**
   * Deletes a specific order
   * @param {string|number} orderId - The ID of the order to delete
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Delete response
   */
  async deleteOrder(orderId, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      const validationError = this._validateOrderId(orderId);
      if (validationError) {
        throw validationError;
      }

      console.log(`OrderManager: Deleting order ID ${orderId}`);

      // Call API to delete order
      const deleteResponse = await this.orderAPI.deleteOrder(
        orderId,
        onUnauthorizedCallback,
      );

      // Clear order caches since data has been updated
      this.orderStorage.clearOrdersCache();
      this.orderStorage.clearCountCache();
      this.orderStorage.clearSelectOptionsCache();

      console.log("OrderManager: Order deleted successfully");

      return deleteResponse;
    } catch (error) {
      console.error("OrderManager: Failed to delete order", error);
      throw error;
    }
  }

  /**
   * Archives a specific order
   * @param {string|number} orderId - The ID of the order to archive
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Archive response
   */
  async archiveOrder(orderId, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      const validationError = this._validateOrderId(orderId);
      if (validationError) {
        throw validationError;
      }

      console.log(`OrderManager: Archiving order ID ${orderId}`);

      // Call API to archive order
      const archiveResponse = await this.orderAPI.archiveOrder(
        orderId,
        onUnauthorizedCallback,
      );

      // Clear order caches since data has been updated
      this.orderStorage.clearOrdersCache();
      this.orderStorage.clearCountCache();

      console.log("OrderManager: Order archived successfully");

      return archiveResponse;
    } catch (error) {
      console.error("OrderManager: Failed to archive order", error);
      throw error;
    }
  }

  /**
   * Creates a comment for an order
   * @param {string|number} orderId - The ID of the order
   * @param {string} content - Comment content
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Comment creation response
   */
  async createOrderComment(orderId, content, onUnauthorizedCallback = null) {
    try {
      // Validate parameters
      const orderIdError = this._validateOrderId(orderId);
      if (orderIdError) {
        throw orderIdError;
      }

      if (!content || typeof content !== "string" || !content.trim()) {
        throw {
          content: "Comment content is required",
        };
      }

      console.log(`OrderManager: Creating comment for order ID ${orderId}`);

      // Call API to create comment
      const commentResponse = await this.orderAPI.createOrderComment(
        orderId,
        content,
        onUnauthorizedCallback,
      );

      console.log("OrderManager: Order comment created successfully");

      return commentResponse;
    } catch (error) {
      console.error("OrderManager: Failed to create order comment", error);
      throw error;
    }
  }

  /**
   * Assigns an associate to an order
   * @param {string|number} orderId - The ID of the order
   * @param {string|number} associateId - The ID of the associate to assign
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Assignment response
   */
  async assignAssociateToOrder(
    orderId,
    associateId,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate parameters
      const orderIdError = this._validateOrderId(orderId);
      if (orderIdError) {
        throw orderIdError;
      }

      if (
        !associateId ||
        (typeof associateId !== "string" && typeof associateId !== "number")
      ) {
        throw {
          associateId: "Valid associate ID is required",
        };
      }

      console.log(
        `OrderManager: Assigning associate ${associateId} to order ${orderId}`,
      );

      // Call API to assign associate
      const assignmentResponse = await this.orderAPI.assignAssociateToOrder(
        orderId,
        associateId,
        onUnauthorizedCallback,
      );

      // Clear order caches since data has been updated
      this.orderStorage.clearOrdersCache();

      console.log("OrderManager: Associate assigned successfully");

      return assignmentResponse;
    } catch (error) {
      console.error("OrderManager: Failed to assign associate to order", error);
      throw error;
    }
  }

  /**
   * Unassigns an associate from an order
   * @param {string|number} orderId - The ID of the order
   * @param {number} reason - The reason code for unassignment
   * @param {string} reasonOther - Other reason text if reason is 1
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Unassignment response
   */
  async unassignAssociateFromOrder(
    orderId,
    reason,
    reasonOther,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate order ID
      const validationError = this._validateOrderId(orderId);
      if (validationError) {
        throw validationError;
      }

      // Validate reason
      if (!reason || typeof reason !== "number") {
        throw {
          reason: "Reason is required",
        };
      }

      // Validate reasonOther if reason is 1
      if (reason === 1 && (!reasonOther || !reasonOther.trim())) {
        throw {
          reasonOther:
            "Reason description is required when 'Other' is selected",
        };
      }

      console.log(
        `OrderManager: Unassigning associate from order ${orderId} with reason ${reason}`,
      );

      // Call API to unassign associate
      const unassignmentResponse =
        await this.orderAPI.unassignAssociateFromOrder(
          orderId,
          reason,
          reasonOther,
          onUnauthorizedCallback,
        );

      // Clear order caches since data has been updated
      this.orderStorage.clearOrdersCache();

      console.log("OrderManager: Associate unassigned successfully");

      return unassignmentResponse;
    } catch (error) {
      console.error(
        "OrderManager: Failed to unassign associate from order",
        error,
      );
      throw error;
    }
  }

  /**
   * Completes an order
   * @param {string|number} orderId - The ID of the order to complete
   * @param {Object} completionData - Completion data (optional)
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Completion response
   */
  async completeOrder(
    orderId,
    completionData = {},
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate order ID
      const validationError = this._validateOrderId(orderId);
      if (validationError) {
        throw validationError;
      }

      console.log(`OrderManager: Completing order ID ${orderId}`);

      // Call API to complete order
      const completionResponse = await this.orderAPI.completeOrder(
        orderId,
        completionData,
        onUnauthorizedCallback,
      );

      // Clear order caches since data has been updated
      this.orderStorage.clearOrdersCache();
      this.orderStorage.clearCountCache();

      console.log("OrderManager: Order completed successfully");

      return completionResponse;
    } catch (error) {
      console.error("OrderManager: Failed to complete order", error);
      throw error;
    }
  }

  /**
   * Closes an order
   * @param {string|number} orderId - The ID of the order to close
   * @param {Object} closureData - Closure data (optional)
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Closure response
   */
  async closeOrder(orderId, closureData = {}, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      const validationError = this._validateOrderId(orderId);
      if (validationError) {
        throw validationError;
      }

      console.log(`OrderManager: Closing order ID ${orderId}`);

      // Call API to close order
      const closureResponse = await this.orderAPI.closeOrder(
        orderId,
        closureData,
        onUnauthorizedCallback,
      );

      // Clear order caches since data has been updated
      this.orderStorage.clearOrdersCache();
      this.orderStorage.clearCountCache();

      console.log("OrderManager: Order closed successfully");

      return closureResponse;
    } catch (error) {
      console.error("OrderManager: Failed to close order", error);
      throw error;
    }
  }

  /**
   * Reopens an order
   * @param {string|number} orderId - The ID of the order to reopen
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Reopen response
   */
  async reopenOrder(orderId, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      const validationError = this._validateOrderId(orderId);
      if (validationError) {
        throw validationError;
      }

      console.log(`OrderManager: Reopening order ID ${orderId}`);

      // Call API to reopen order
      const reopenResponse = await this.orderAPI.reopenOrder(
        orderId,
        onUnauthorizedCallback,
      );

      // Clear order caches since data has been updated
      this.orderStorage.clearOrdersCache();
      this.orderStorage.clearCountCache();

      console.log("OrderManager: Order reopened successfully");

      return reopenResponse;
    } catch (error) {
      console.error("OrderManager: Failed to reopen order", error);
      throw error;
    }
  }

  /**
   * Creates invoice for an order
   * @param {string|number} orderId - The ID of the order to invoice
   * @param {Object} invoiceData - Invoice data
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Invoice response
   */
  async invoiceOrder(orderId, invoiceData = {}, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      const validationError = this._validateOrderId(orderId);
      if (validationError) {
        throw validationError;
      }

      console.log(`OrderManager: Creating invoice for order ID ${orderId}`);

      // Call API to create invoice
      const invoiceResponse = await this.orderAPI.invoiceOrder(
        orderId,
        invoiceData,
        onUnauthorizedCallback,
      );

      console.log("OrderManager: Order invoice created successfully");

      return invoiceResponse;
    } catch (error) {
      console.error("OrderManager: Failed to create order invoice", error);
      throw error;
    }
  }

  /**
   * Clones an order
   * @param {string|number} orderId - The ID of the order to clone
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Clone response
   */
  async cloneOrder(orderId, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      const validationError = this._validateOrderId(orderId);
      if (validationError) {
        throw validationError;
      }

      console.log(`OrderManager: Cloning order ID ${orderId}`);

      // Call API to clone order
      const cloneResponse = await this.orderAPI.cloneOrder(
        orderId,
        onUnauthorizedCallback,
      );

      // Clear order caches since new data has been added
      this.orderStorage.clearOrdersCache();
      this.orderStorage.clearCountCache();

      console.log("OrderManager: Order cloned successfully");

      return cloneResponse;
    } catch (error) {
      console.error("OrderManager: Failed to clone order", error);
      throw error;
    }
  }

  /**
   * Uploads file for an order
   * @param {FormData} formData - Form data containing the file
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - File upload response
   */
  async uploadOrderFile(formData, onUnauthorizedCallback = null) {
    try {
      // Validate form data
      if (!(formData instanceof FormData)) {
        throw {
          formData: "Valid FormData is required for file upload",
        };
      }

      console.log("OrderManager: Uploading order file");

      // Call API to upload file
      const uploadResponse = await this.orderAPI.uploadOrderFile(
        formData,
        onUnauthorizedCallback,
      );

      console.log("OrderManager: Order file uploaded successfully");

      return uploadResponse;
    } catch (error) {
      console.error("OrderManager: Failed to upload order file", error);
      throw error;
    }
  }

  /**
   * Postpones an order
   * @param {string|number} orderId - The ID of the order to postpone
   * @param {Object} postponeData - Postpone data including new date
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Postpone response
   */
  async postponeOrder(orderId, postponeData, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      const validationError = this._validateOrderId(orderId);
      if (validationError) {
        throw validationError;
      }

      console.log(`OrderManager: Postponing order ID ${orderId}`);

      // Call API to postpone order
      const postponeResponse = await this.orderAPI.postponeOrder(
        orderId,
        postponeData,
        onUnauthorizedCallback,
      );

      // Clear order caches since data has been updated
      this.orderStorage.clearOrdersCache();

      console.log("OrderManager: Order postponed successfully");

      return postponeResponse;
    } catch (error) {
      console.error("OrderManager: Failed to postpone order", error);
      throw error;
    }
  }

  /**
   * Transfers an order to another associate or customer
   * @param {string|number} orderId - The ID of the order to transfer
   * @param {Object} transferData - Transfer data
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Transfer response
   */
  async transferOrder(orderId, transferData, onUnauthorizedCallback = null) {
    try {
      // Validate order ID
      const validationError = this._validateOrderId(orderId);
      if (validationError) {
        throw validationError;
      }

      console.log(`OrderManager: Transferring order ID ${orderId}`);

      // Call API to transfer order
      const transferResponse = await this.orderAPI.transferOrder(
        orderId,
        transferData,
        onUnauthorizedCallback,
      );

      // Clear order caches since data has been updated
      this.orderStorage.clearOrdersCache();

      console.log("OrderManager: Order transferred successfully");

      return transferResponse;
    } catch (error) {
      console.error("OrderManager: Failed to transfer order", error);
      throw error;
    }
  }

  /**
   * Gets order preferences
   * @returns {Object|null} - Order preferences or null
   */
  getOrderPreferences() {
    return this.orderStorage.getOrderPreferences();
  }

  /**
   * Saves order preferences
   * @param {Object} preferences - Preferences object
   */
  saveOrderPreferences(preferences) {
    this.orderStorage.saveOrderPreferences(preferences);
  }

  /**
   * Clears the orders cache
   */
  clearOrdersCache() {
    this.orderStorage.clearOrdersCache();
  }

  /**
   * Clears the select options cache
   */
  clearSelectOptionsCache() {
    this.orderStorage.clearSelectOptionsCache();
  }

  /**
   * Clears the count cache
   */
  clearCountCache() {
    this.orderStorage.clearCountCache();
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.orderStorage.clearAllCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getOrdersCacheInfo() {
    return this.orderStorage.getOrdersCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setOrdersCacheDuration(durationMs) {
    this.orderStorage.setCacheDuration(durationMs);
  }

  /**
   * Sets select options cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.orderStorage.setSelectOptionsCacheDuration(durationMs);
  }

  /**
   * Sets count cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCountCacheDuration(durationMs) {
    this.orderStorage.setCountCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getOrderSelectOptionsWithCallbacks(
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getOrderSelectOptions(onUnauthorizedCallback, forceRefresh)
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

  getOrderCountWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getOrderCount(params, onUnauthorizedCallback, forceRefresh)
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

  getOrdersWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getOrders(params, onUnauthorizedCallback, forceRefresh)
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

  getOrdersWithFiltersMapWithCallbacks(
    filtersMap = new Map(),
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getOrdersWithFiltersMap(
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

  createOrderWithCallbacks(
    orderData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createOrder(orderData, onUnauthorizedCallback)
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

  getOrderDetailWithCallbacks(
    orderId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getOrderDetail(orderId, onUnauthorizedCallback)
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

  updateOrderWithCallbacks(
    orderId,
    orderData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateOrder(orderId, orderData, onUnauthorizedCallback)
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

  deleteOrderWithCallbacks(
    orderId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.deleteOrder(orderId, onUnauthorizedCallback)
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

  // Additional callback methods for other operations...
  archiveOrderWithCallbacks(
    orderId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.archiveOrder(orderId, onUnauthorizedCallback)
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

  createOrderCommentWithCallbacks(
    orderId,
    content,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createOrderComment(orderId, content, onUnauthorizedCallback)
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

  assignAssociateToOrderWithCallbacks(
    orderId,
    associateId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.assignAssociateToOrder(orderId, associateId, onUnauthorizedCallback)
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
    orderId,
    completionData = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.completeOrder(orderId, completionData, onUnauthorizedCallback)
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

  _validateOrderId(orderId) {
    if (
      !orderId ||
      (typeof orderId !== "string" && typeof orderId !== "number")
    ) {
      return { orderId: "Valid order ID is required" };
    }
    return null;
  }

  _validateOrdersParams(params) {
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
        "start_date",
        "completion_date",
        "status",
        "priority",
        "customer_name",
        "associate_name",
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

    if (params.customerId && typeof params.customerId === "string") {
      validatedParams.customerId = params.customerId;
    }

    if (params.associateId && typeof params.associateId === "string") {
      validatedParams.associateId = params.associateId;
    }

    if (params.startDate && typeof params.startDate === "string") {
      validatedParams.startDate = params.startDate;
    }

    if (params.completionDate && typeof params.completionDate === "string") {
      validatedParams.completionDate = params.completionDate;
    }

    return validatedParams;
  }

  _validateOrderData(orderData, isCreate = false) {
    const errors = {};

    if (!orderData || typeof orderData !== "object") {
      errors.general = "Order data is required";
      return errors;
    }

    // Validate description (required)
    if (!orderData.description || !orderData.description.trim()) {
      errors.description = "Order description is required";
    } else if (orderData.description.length > 1000) {
      errors.description = "Description must be less than 1000 characters";
    }

    // Validate customer ID (required)
    if (
      isCreate &&
      (!orderData.customerId || !orderData.customerId.toString().trim())
    ) {
      errors.customerId = "Customer ID is required for new orders";
    }

    // Validate start date (optional)
    if (orderData.startDate && typeof orderData.startDate !== "string") {
      errors.startDate = "Start date must be a valid date string";
    }

    // Validate completion date (optional)
    if (
      orderData.completionDate &&
      typeof orderData.completionDate !== "string"
    ) {
      errors.completionDate = "Completion date must be a valid date string";
    }

    // Validate status (optional)
    if (orderData.status !== undefined) {
      const validStatuses = [
        "new",
        "assigned",
        "in_progress",
        "completed",
        "closed",
        "cancelled",
      ];
      if (!validStatuses.includes(orderData.status)) {
        errors.status = "Invalid order status";
      }
    }

    // Validate priority (optional)
    if (orderData.priority !== undefined) {
      const validPriorities = ["low", "normal", "high", "urgent"];
      if (!validPriorities.includes(orderData.priority)) {
        errors.priority = "Invalid order priority";
      }
    }

    return errors;
  }

  /**
   * Waits for current orders request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentOrdersRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.orderStorage.isOrdersCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.orderStorage.getOrdersFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Orders request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Orders request timeout"));
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
        if (!this.orderStorage.isSelectOptionsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.orderStorage.getSelectOptionsFromCache();
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
   * Waits for current count request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentCountRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.orderStorage.isCountCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.orderStorage.getCountFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Count request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Count request timeout"));
      }, 30000);
    });
  }
}
