// File Path: monorepo/web/workery-frontend/src/services/Manager/CustomerManager.js

/**
 * CustomerManager handles all customer-related business logic
 * Combines CustomerAPI with CustomerStorage for complete customer management
 */
export class CustomerManager {
  constructor(customerAPI, customerStorage) {
    this.customerAPI = customerAPI;
    this.customerStorage = customerStorage;
  }

  /**
   * Gets list of customers with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Customers list with pagination data
   */
  async getCustomers(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedCustomers = this.customerStorage.getCustomersFromCache();
        if (cachedCustomers) {
          return cachedCustomers;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.customerStorage.isCustomersCacheLoading()) {
        console.log("CustomerManager: Customers request already in progress");
        return this._waitForCurrentCustomersRequest();
      }

      this.customerStorage.setCustomersCacheLoading(true);

      console.log("CustomerManager: Fetching fresh customers data", params);

      try {
        // Validate and clean parameters
        const validatedParams = this._validateCustomersParams(params);

        // Fetch fresh data from API
        const customersData = await this.customerAPI.getCustomers(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.customerStorage.saveCustomersToCache(customersData);

        console.log("CustomerManager: Customers data fetched successfully:", {
          count: customersData.results ? customersData.results.length : 0,
          totalCount: customersData.count,
        });

        return customersData;
      } finally {
        this.customerStorage.setCustomersCacheLoading(false);
      }
    } catch (error) {
      this.customerStorage.setCustomersCacheLoading(false);
      console.error("CustomerManager: Failed to get customers", error);
      throw error;
    }
  }

  /**
   * Gets customers using legacy filtersMap approach for backward compatibility
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Customers list with pagination data
   */
  async getCustomersWithFiltersMap(
    filtersMap = new Map(),
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedCustomers = this.customerStorage.getCustomersFromCache();
        if (cachedCustomers) {
          return cachedCustomers;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.customerStorage.isCustomersCacheLoading()) {
        console.log("CustomerManager: Customers request already in progress");
        return this._waitForCurrentCustomersRequest();
      }

      this.customerStorage.setCustomersCacheLoading(true);

      console.log(
        "CustomerManager: Fetching fresh customers data with filters map",
        filtersMap,
      );

      try {
        // Fetch fresh data from API using legacy method
        const customersData = await this.customerAPI.getCustomersWithFiltersMap(
          filtersMap,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.customerStorage.saveCustomersToCache(customersData);

        console.log("CustomerManager: Customers data fetched successfully:", {
          count: customersData.results ? customersData.results.length : 0,
          totalCount: customersData.count,
        });

        return customersData;
      } finally {
        this.customerStorage.setCustomersCacheLoading(false);
      }
    } catch (error) {
      this.customerStorage.setCustomersCacheLoading(false);
      console.error("CustomerManager: Failed to get customers", error);
      throw error;
    }
  }

  /**
   * Gets customer count with caching
   * @param {Map} filtersMap - Map of filter key-value pairs
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Customer count data
   */
  async getCustomerCount(
    filtersMap = new Map(),
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedCount = this.customerStorage.getCustomerCountFromCache();
        if (cachedCount) {
          return cachedCount;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.customerStorage.isCustomerCountCacheLoading()) {
        console.log(
          "CustomerManager: Customer count request already in progress",
        );
        return this._waitForCurrentCustomerCountRequest();
      }

      this.customerStorage.setCustomerCountCacheLoading(true);

      console.log("CustomerManager: Fetching fresh customer count data");

      try {
        // Fetch fresh data from API
        const countData = await this.customerAPI.getCustomerCount(
          filtersMap,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.customerStorage.saveCustomerCountToCache(countData);

        console.log(
          "CustomerManager: Customer count data fetched successfully",
        );

        return countData;
      } finally {
        this.customerStorage.setCustomerCountCacheLoading(false);
      }
    } catch (error) {
      this.customerStorage.setCustomerCountCacheLoading(false);
      console.error("CustomerManager: Failed to get customer count", error);
      throw error;
    }
  }

  /**
   * Creates a new customer with validation
   * @param {Object} customerData - Customer data to create
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Created customer data
   */
  async createCustomer(customerData, onUnauthorizedCallback = null) {
    try {
      // Validate customer data
      const validationErrors = this._validateCustomerData(customerData, true);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("CustomerManager: Creating new customer");

      // Call API to create customer
      const createdCustomerData = await this.customerAPI.createCustomer(
        customerData,
        onUnauthorizedCallback,
      );

      // Clear customers cache since new data has been added
      this.customerStorage.clearCustomersCache();
      this.customerStorage.clearCustomerCountCache();

      console.log("CustomerManager: Customer created successfully:", {
        id: createdCustomerData.id,
        name: `${createdCustomerData.firstName} ${createdCustomerData.lastName}`,
      });

      return createdCustomerData;
    } catch (error) {
      console.error("CustomerManager: Failed to create customer", error);
      throw error;
    }
  }

  /**
   * Gets details for a specific customer
   * @param {string|number} customerId - The ID of the customer
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Customer details
   */
  async getCustomerDetail(customerId, onUnauthorizedCallback = null) {
    try {
      // Validate customer ID
      const validationError = this._validateCustomerId(customerId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `CustomerManager: Fetching customer detail for ID ${customerId}`,
      );

      // Call API to get customer details
      const customerData = await this.customerAPI.getCustomerDetail(
        customerId,
        onUnauthorizedCallback,
      );

      console.log("CustomerManager: Customer detail fetched successfully:", {
        id: customerData.id,
        name: `${customerData.firstName} ${customerData.lastName}`,
      });

      return customerData;
    } catch (error) {
      console.error("CustomerManager: Failed to get customer detail", error);
      throw error;
    }
  }

  /**
   * Updates a specific customer
   * @param {string|number} customerId - The ID of the customer
   * @param {Object} customerData - Customer data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated customer data
   */
  async updateCustomer(
    customerId,
    customerData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate customer ID
      const customerIdError = this._validateCustomerId(customerId);
      if (customerIdError) {
        throw customerIdError;
      }

      // Validate customer data
      const validationErrors = this._validateCustomerData(customerData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(`CustomerManager: Updating customer ID ${customerId}`);

      // Call API to update customer
      const updatedCustomerData = await this.customerAPI.updateCustomer(
        customerId,
        customerData,
        onUnauthorizedCallback,
      );

      // Clear customers cache since data has been updated
      this.customerStorage.clearCustomersCache();

      console.log("CustomerManager: Customer updated successfully");

      return updatedCustomerData;
    } catch (error) {
      console.error("CustomerManager: Failed to update customer", error);
      throw error;
    }
  }

  /**
   * Deletes a specific customer
   * @param {string|number} customerId - The ID of the customer to delete
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Delete response
   */
  async deleteCustomer(customerId, onUnauthorizedCallback = null) {
    try {
      // Validate customer ID
      const validationError = this._validateCustomerId(customerId);
      if (validationError) {
        throw validationError;
      }

      console.log(`CustomerManager: Deleting customer ID ${customerId}`);

      // Call API to delete customer
      const deleteResponse = await this.customerAPI.deleteCustomer(
        customerId,
        onUnauthorizedCallback,
      );

      // Clear customers cache since data has been updated
      this.customerStorage.clearCustomersCache();
      this.customerStorage.clearCustomerCountCache();

      console.log("CustomerManager: Customer deleted successfully");

      return deleteResponse;
    } catch (error) {
      console.error("CustomerManager: Failed to delete customer", error);
      throw error;
    }
  }

  /**
   * Archives a specific customer
   * @param {string|number} customerId - The ID of the customer to archive
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Archive response
   */
  async archiveCustomer(customerId, onUnauthorizedCallback = null) {
    try {
      // Validate customer ID
      const validationError = this._validateCustomerId(customerId);
      if (validationError) {
        throw validationError;
      }

      console.log(`CustomerManager: Archiving customer ID ${customerId}`);

      // Call API to archive customer
      const archiveResponse = await this.customerAPI.archiveCustomer(
        customerId,
        onUnauthorizedCallback,
      );

      // Clear customers cache since data has been updated
      this.customerStorage.clearCustomersCache();
      this.customerStorage.clearCustomerCountCache();

      console.log("CustomerManager: Customer archived successfully");

      return archiveResponse;
    } catch (error) {
      console.error("CustomerManager: Failed to archive customer", error);
      throw error;
    }
  }

  /**
   * Creates a comment for a customer
   * @param {string|number} customerId - The ID of the customer
   * @param {string} content - Comment content
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Comment creation response
   */
  async createCustomerComment(
    customerId,
    content,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate parameters
      const customerIdError = this._validateCustomerId(customerId);
      if (customerIdError) {
        throw customerIdError;
      }

      if (!content || typeof content !== "string" || !content.trim()) {
        throw { content: "Comment content is required" };
      }

      console.log(
        `CustomerManager: Creating comment for customer ${customerId}`,
      );

      // Call API to create comment
      const commentResponse = await this.customerAPI.createCustomerComment(
        customerId,
        content,
        onUnauthorizedCallback,
      );

      console.log("CustomerManager: Customer comment created successfully");

      return commentResponse;
    } catch (error) {
      console.error(
        "CustomerManager: Failed to create customer comment",
        error,
      );
      throw error;
    }
  }

  /**
   * Upgrades a customer
   * @param {Object} upgradeData - Upgrade data
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Upgrade response
   */
  async upgradeCustomer(upgradeData, onUnauthorizedCallback = null) {
    try {
      console.log("CustomerManager: Upgrading customer");

      // Call API to upgrade customer
      const upgradeResponse = await this.customerAPI.upgradeCustomer(
        upgradeData,
        onUnauthorizedCallback,
      );

      // Clear customers cache since data has been updated
      this.customerStorage.clearCustomersCache();

      console.log("CustomerManager: Customer upgraded successfully");

      return upgradeResponse;
    } catch (error) {
      console.error("CustomerManager: Failed to upgrade customer", error);
      throw error;
    }
  }

  /**
   * Downgrades a customer
   * @param {string|number} customerId - The ID of the customer to downgrade
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Downgrade response
   */
  async downgradeCustomer(customerId, onUnauthorizedCallback = null) {
    try {
      // Validate customer ID
      const validationError = this._validateCustomerId(customerId);
      if (validationError) {
        throw validationError;
      }

      console.log(`CustomerManager: Downgrading customer ID ${customerId}`);

      // Call API to downgrade customer
      const downgradeResponse = await this.customerAPI.downgradeCustomer(
        customerId,
        onUnauthorizedCallback,
      );

      // Clear customers cache since data has been updated
      this.customerStorage.clearCustomersCache();

      console.log("CustomerManager: Customer downgraded successfully");

      return downgradeResponse;
    } catch (error) {
      console.error("CustomerManager: Failed to downgrade customer", error);
      throw error;
    }
  }

  /**
   * Uploads avatar for a customer
   * @param {FormData} formData - Form data containing the avatar file
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Avatar upload response
   */
  async uploadCustomerAvatar(formData, onUnauthorizedCallback = null) {
    try {
      // Validate form data
      if (!(formData instanceof FormData)) {
        throw { formData: "Valid FormData is required for avatar upload" };
      }

      console.log("CustomerManager: Uploading customer avatar");

      // Call API to upload avatar
      const avatarResponse = await this.customerAPI.uploadCustomerAvatar(
        formData,
        onUnauthorizedCallback,
      );

      console.log("CustomerManager: Customer avatar uploaded successfully");

      return avatarResponse;
    } catch (error) {
      console.error("CustomerManager: Failed to upload customer avatar", error);
      throw error;
    }
  }

  /**
   * Changes password for a customer
   * @param {Object} passwordData - Password change data
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Password change response
   */
  async changeCustomerPassword(passwordData, onUnauthorizedCallback = null) {
    try {
      // Validate password data
      const validationErrors = this._validatePasswordData(passwordData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("CustomerManager: Changing customer password");

      // Call API to change password
      const passwordResponse = await this.customerAPI.changeCustomerPassword(
        passwordData,
        onUnauthorizedCallback,
      );

      console.log("CustomerManager: Customer password changed successfully");

      return passwordResponse;
    } catch (error) {
      console.error(
        "CustomerManager: Failed to change customer password",
        error,
      );
      throw error;
    }
  }

  /**
   * Changes two-factor authentication settings for a customer
   * @param {Object} twoFactorData - 2FA change data
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - 2FA change response
   */
  async changeCustomerTwoFactorAuth(
    twoFactorData,
    onUnauthorizedCallback = null,
  ) {
    try {
      console.log("CustomerManager: Changing customer 2FA settings");

      // Call API to change 2FA settings
      const twoFactorResponse =
        await this.customerAPI.changeCustomerTwoFactorAuth(
          twoFactorData,
          onUnauthorizedCallback,
        );

      console.log(
        "CustomerManager: Customer 2FA settings changed successfully",
      );

      return twoFactorResponse;
    } catch (error) {
      console.error(
        "CustomerManager: Failed to change customer 2FA settings",
        error,
      );
      throw error;
    }
  }

  /**
   * Bans a customer
   * @param {Object} banData - Ban data
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Ban response
   */
  async banCustomer(banData, onUnauthorizedCallback = null) {
    try {
      console.log("CustomerManager: Banning customer");

      // Call API to ban customer
      const banResponse = await this.customerAPI.banCustomer(
        banData,
        onUnauthorizedCallback,
      );

      // Clear customers cache since data has been updated
      this.customerStorage.clearCustomersCache();

      console.log("CustomerManager: Customer banned successfully");

      return banResponse;
    } catch (error) {
      console.error("CustomerManager: Failed to ban customer", error);
      throw error;
    }
  }

  /**
   * Unbans a customer
   * @param {Object} unbanData - Unban data
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Unban response
   */
  async unbanCustomer(unbanData, onUnauthorizedCallback = null) {
    try {
      console.log("CustomerManager: Unbanning customer");

      // Call API to unban customer
      const unbanResponse = await this.customerAPI.unbanCustomer(
        unbanData,
        onUnauthorizedCallback,
      );

      // Clear customers cache since data has been updated
      this.customerStorage.clearCustomersCache();

      console.log("CustomerManager: Customer unbanned successfully");

      return unbanResponse;
    } catch (error) {
      console.error("CustomerManager: Failed to unban customer", error);
      throw error;
    }
  }

  /**
   * Gets customer preferences
   * @returns {Object|null} - Customer preferences or null
   */
  getCustomerPreferences() {
    return this.customerStorage.getCustomerPreferences();
  }

  /**
   * Saves customer preferences
   * @param {Object} preferences - Preferences object
   */
  saveCustomerPreferences(preferences) {
    this.customerStorage.saveCustomerPreferences(preferences);
  }

  /**
   * Clears the customers cache
   */
  clearCustomersCache() {
    this.customerStorage.clearCustomersCache();
  }

  /**
   * Clears the customer count cache
   */
  clearCustomerCountCache() {
    this.customerStorage.clearCustomerCountCache();
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.customerStorage.clearAllCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getCustomersCacheInfo() {
    return this.customerStorage.getCustomersCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCustomersCacheDuration(durationMs) {
    this.customerStorage.setCacheDuration(durationMs);
  }

  /**
   * Sets customer count cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCustomerCountCacheDuration(durationMs) {
    this.customerStorage.setCountCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getCustomersWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getCustomers(params, onUnauthorizedCallback, forceRefresh)
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

  getCustomersWithFiltersMapWithCallbacks(
    filtersMap = new Map(),
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getCustomersWithFiltersMap(
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

  getCustomerCountWithCallbacks(
    filtersMap = new Map(),
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getCustomerCount(filtersMap, onUnauthorizedCallback, forceRefresh)
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

  createCustomerWithCallbacks(
    customerData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createCustomer(customerData, onUnauthorizedCallback)
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

  getCustomerDetailWithCallbacks(
    customerId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getCustomerDetail(customerId, onUnauthorizedCallback)
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

  updateCustomerWithCallbacks(
    customerId,
    customerData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateCustomer(customerId, customerData, onUnauthorizedCallback)
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

  deleteCustomerWithCallbacks(
    customerId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.deleteCustomer(customerId, onUnauthorizedCallback)
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

  archiveCustomerWithCallbacks(
    customerId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.archiveCustomer(customerId, onUnauthorizedCallback)
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

  createCustomerCommentWithCallbacks(
    customerId,
    content,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createCustomerComment(customerId, content, onUnauthorizedCallback)
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

  upgradeCustomerWithCallbacks(
    upgradeData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.upgradeCustomer(upgradeData, onUnauthorizedCallback)
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

  downgradeCustomerWithCallbacks(
    customerId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.downgradeCustomer(customerId, onUnauthorizedCallback)
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

  uploadCustomerAvatarWithCallbacks(
    formData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.uploadCustomerAvatar(formData, onUnauthorizedCallback)
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

  changeCustomerPasswordWithCallbacks(
    passwordData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.changeCustomerPassword(passwordData, onUnauthorizedCallback)
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

  changeCustomerTwoFactorAuthWithCallbacks(
    twoFactorData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.changeCustomerTwoFactorAuth(twoFactorData, onUnauthorizedCallback)
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

  banCustomerWithCallbacks(
    banData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.banCustomer(banData, onUnauthorizedCallback)
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

  unbanCustomerWithCallbacks(
    unbanData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.unbanCustomer(unbanData, onUnauthorizedCallback)
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

  _validateCustomerId(customerId) {
    if (
      !customerId ||
      (typeof customerId !== "string" && typeof customerId !== "number")
    ) {
      return { customerId: "Valid customer ID is required" };
    }
    return null;
  }

  _validateCustomersParams(params) {
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
        "lexical_name",
        "first_name",
        "last_name",
        "email",
        "phone",
        "created_at",
        "updated_at",
        "status",
        "type_of",
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

    if (params.typeOf && typeof params.typeOf === "string") {
      validatedParams.typeOf = params.typeOf;
    }

    return validatedParams;
  }

  _validateCustomerData(customerData, isCreate = false) {
    const errors = {};

    if (!customerData || typeof customerData !== "object") {
      errors.general = "Customer data is required";
      return errors;
    }

    // Validate first name (required)
    if (!customerData.firstName || !customerData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (customerData.firstName.length > 50) {
      errors.firstName = "First name must be less than 50 characters";
    }

    // Validate last name (required)
    if (!customerData.lastName || !customerData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (customerData.lastName.length > 50) {
      errors.lastName = "Last name must be less than 50 characters";
    }

    // Validate email (required)
    if (!customerData.email || !customerData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email.trim())) {
      errors.email = "Invalid email format";
    }

    // Validate phone (optional)
    if (customerData.phone && customerData.phone.length > 20) {
      errors.phone = "Phone number must be less than 20 characters";
    }

    // Validate customer type (optional)
    if (customerData.typeOf !== undefined) {
      const validTypes = [1, 2, 3]; // Unassigned, Residential, Commercial
      if (!validTypes.includes(customerData.typeOf)) {
        errors.typeOf = "Invalid customer type";
      }
    }

    // Validate status (optional)
    if (customerData.status !== undefined) {
      const validStatuses = [1, 2]; // Active, Archived
      if (!validStatuses.includes(customerData.status)) {
        errors.status = "Invalid customer status";
      }
    }

    // Clean tags array
    if (customerData.tags && Array.isArray(customerData.tags)) {
      customerData.tags = customerData.tags.filter(
        (tag) =>
          tag !== null &&
          tag !== undefined &&
          tag !== "" &&
          tag !== "0" &&
          tag !== 0,
      );
    }

    return errors;
  }

  _validatePasswordData(passwordData) {
    const errors = {};

    if (!passwordData || typeof passwordData !== "object") {
      errors.general = "Password data is required";
      return errors;
    }

    // Validate current password
    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    // Validate new password
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "New password must be at least 8 characters";
    }

    // Validate password confirmation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Password confirmation does not match";
    }

    return errors;
  }

  /**
   * Waits for current customers request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentCustomersRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.customerStorage.isCustomersCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.customerStorage.getCustomersFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Customers request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Customers request timeout"));
      }, 30000);
    });
  }

  /**
   * Waits for current customer count request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentCustomerCountRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.customerStorage.isCustomerCountCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.customerStorage.getCustomerCountFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Customer count request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Customer count request timeout"));
      }, 30000);
    });
  }
}
