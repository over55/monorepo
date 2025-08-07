// File Path: monorepo/web/workery-frontend/src/services/Manager/FinancialManager.js

/**
 * FinancialManager handles all financial-related business logic
 * Combines FinancialAPI with FinancialStorage for complete financial management
 */
export class FinancialManager {
  constructor(financialAPI, financialStorage) {
    this.financialAPI = financialAPI;
    this.financialStorage = financialStorage;
  }

  /**
   * Gets financial select options with caching
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Financial select options
   */
  async getFinancialSelectOptions(
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedOptions = this.financialStorage.getSelectOptionsFromCache();
        if (cachedOptions) {
          return cachedOptions;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.financialStorage.isSelectOptionsCacheLoading()) {
        console.log(
          "FinancialManager: Select options request already in progress",
        );
        return this._waitForCurrentSelectOptionsRequest();
      }

      this.financialStorage.setSelectOptionsCacheLoading(true);

      console.log("FinancialManager: Fetching fresh select options data");

      try {
        // Fetch fresh data from API
        const optionsData = await this.financialAPI.getFinancialSelectOptions(
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.financialStorage.saveSelectOptionsToCache(optionsData);

        console.log(
          "FinancialManager: Select options data fetched successfully",
        );

        return optionsData;
      } finally {
        this.financialStorage.setSelectOptionsCacheLoading(false);
      }
    } catch (error) {
      this.financialStorage.setSelectOptionsCacheLoading(false);
      console.error("FinancialManager: Failed to get select options", error);
      throw error;
    }
  }

  /**
   * Gets list of financial records with caching, filtering, and pagination
   * @param {Object} params - Query parameters { page, limit, search, sortBy, sortOrder, startDate, endDate, type }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Financial records list with pagination data
   */
  async getFinancials(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedFinancials = this.financialStorage.getFinancialsFromCache();
        if (cachedFinancials) {
          return cachedFinancials;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.financialStorage.isFinancialsCacheLoading()) {
        console.log(
          "FinancialManager: Financial records request already in progress",
        );
        return this._waitForCurrentFinancialsRequest();
      }

      this.financialStorage.setFinancialsCacheLoading(true);

      console.log(
        "FinancialManager: Fetching fresh financial records data",
        params,
      );

      try {
        // Validate and clean parameters
        const validatedParams = this._validateFinancialsParams(params);

        // Fetch fresh data from API
        const financialsData = await this.financialAPI.getFinancials(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.financialStorage.saveFinancialsToCache(financialsData);

        console.log(
          "FinancialManager: Financial records data fetched successfully:",
          {
            count: financialsData.results ? financialsData.results.length : 0,
            totalCount: financialsData.count,
          },
        );

        return financialsData;
      } finally {
        this.financialStorage.setFinancialsCacheLoading(false);
      }
    } catch (error) {
      this.financialStorage.setFinancialsCacheLoading(false);
      console.error("FinancialManager: Failed to get financial records", error);
      throw error;
    }
  }

  /**
   * Creates a new financial record with validation
   * @param {Object} financialData - Financial record data to create
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Created financial record data
   */
  async createFinancial(financialData, onUnauthorizedCallback = null) {
    try {
      // Validate financial data
      const validationErrors = this._validateFinancialData(financialData, true);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log("FinancialManager: Creating new financial record");

      // Call API to create financial record
      const createdFinancialData = await this.financialAPI.createFinancial(
        financialData,
        onUnauthorizedCallback,
      );

      // Clear financial records cache since new data has been added
      this.financialStorage.clearFinancialsCache();
      this.financialStorage.clearSelectOptionsCache();
      this.financialStorage.clearSummaryCache();

      console.log("FinancialManager: Financial record created successfully:", {
        id: createdFinancialData.id,
        type: createdFinancialData.type,
        amount: createdFinancialData.amount,
      });

      return createdFinancialData;
    } catch (error) {
      console.error(
        "FinancialManager: Failed to create financial record",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets details for a specific financial record
   * @param {string|number} financialId - The ID of the financial record
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Financial record details
   */
  async getFinancialDetail(financialId, onUnauthorizedCallback = null) {
    try {
      // Validate financial ID
      const validationError = this._validateFinancialId(financialId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `FinancialManager: Fetching financial record detail for ID ${financialId}`,
      );

      // Call API to get financial record details
      const financialData = await this.financialAPI.getFinancialDetail(
        financialId,
        onUnauthorizedCallback,
      );

      console.log(
        "FinancialManager: Financial record detail fetched successfully:",
        {
          id: financialData.id,
          type: financialData.type,
          amount: financialData.amount,
        },
      );

      return financialData;
    } catch (error) {
      console.error(
        "FinancialManager: Failed to get financial record detail",
        error,
      );
      throw error;
    }
  }

  /**
   * Updates a specific financial record
   * @param {string|number} financialId - The ID of the financial record
   * @param {Object} financialData - Financial record data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated financial record data
   */
  async updateFinancial(
    financialId,
    financialData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate financial ID
      const financialIdError = this._validateFinancialId(financialId);
      if (financialIdError) {
        throw financialIdError;
      }

      // Validate financial data
      const validationErrors = this._validateFinancialData(financialData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(
        `FinancialManager: Updating financial record ID ${financialId}`,
      );

      // Call API to update financial record
      const updatedFinancialData = await this.financialAPI.updateFinancial(
        financialId,
        financialData,
        onUnauthorizedCallback,
      );

      // Clear financial records cache since data has been updated
      this.financialStorage.clearFinancialsCache();
      this.financialStorage.clearSelectOptionsCache();
      this.financialStorage.clearSummaryCache();

      console.log("FinancialManager: Financial record updated successfully");

      return updatedFinancialData;
    } catch (error) {
      console.error(
        "FinancialManager: Failed to update financial record",
        error,
      );
      throw error;
    }
  }

  /**
   * Deletes a specific financial record
   * @param {string|number} financialId - The ID of the financial record to delete
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Delete response
   */
  async deleteFinancial(financialId, onUnauthorizedCallback = null) {
    try {
      // Validate financial ID
      const validationError = this._validateFinancialId(financialId);
      if (validationError) {
        throw validationError;
      }

      console.log(
        `FinancialManager: Deleting financial record ID ${financialId}`,
      );

      // Call API to delete financial record
      const deleteResponse = await this.financialAPI.deleteFinancial(
        financialId,
        onUnauthorizedCallback,
      );

      // Clear financial records cache since data has been updated
      this.financialStorage.clearFinancialsCache();
      this.financialStorage.clearSelectOptionsCache();
      this.financialStorage.clearSummaryCache();

      console.log("FinancialManager: Financial record deleted successfully");

      return deleteResponse;
    } catch (error) {
      console.error(
        "FinancialManager: Failed to delete financial record",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets financial summary with caching
   * @param {Object} params - Query parameters { startDate, endDate, type }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Financial summary data
   */
  async getFinancialSummary(
    params = {},
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedSummary = this.financialStorage.getSummaryFromCache();
        if (cachedSummary) {
          return cachedSummary;
        }
      }

      // Prevent multiple simultaneous requests
      if (this.financialStorage.isSummaryCacheLoading()) {
        console.log("FinancialManager: Summary request already in progress");
        return this._waitForCurrentSummaryRequest();
      }

      this.financialStorage.setSummaryCacheLoading(true);

      console.log("FinancialManager: Fetching fresh summary data", params);

      try {
        // Validate and clean parameters
        const validatedParams = this._validateSummaryParams(params);

        // Fetch fresh data from API
        const summaryData = await this.financialAPI.getFinancialSummary(
          validatedParams,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.financialStorage.saveSummaryToCache(summaryData);

        console.log("FinancialManager: Summary data fetched successfully");

        return summaryData;
      } finally {
        this.financialStorage.setSummaryCacheLoading(false);
      }
    } catch (error) {
      this.financialStorage.setSummaryCacheLoading(false);
      console.error("FinancialManager: Failed to get summary", error);
      throw error;
    }
  }

  /**
   * Exports financial data
   * @param {Object} params - Export parameters { format, startDate, endDate, type }
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Export response
   */
  async exportFinancials(params = {}, onUnauthorizedCallback = null) {
    try {
      console.log("FinancialManager: Exporting financial data", params);

      // Validate export parameters
      const validationErrors = this._validateExportParams(params);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      // Call API to export financial data
      const exportResponse = await this.financialAPI.exportFinancials(
        params,
        onUnauthorizedCallback,
      );

      console.log("FinancialManager: Financial data exported successfully");

      return exportResponse;
    } catch (error) {
      console.error("FinancialManager: Failed to export financial data", error);
      throw error;
    }
  }

  /**
   * Gets financial preferences
   * @returns {Object|null} - Financial preferences or null
   */
  getFinancialPreferences() {
    return this.financialStorage.getFinancialPreferences();
  }

  /**
   * Saves financial preferences
   * @param {Object} preferences - Preferences object
   */
  saveFinancialPreferences(preferences) {
    this.financialStorage.saveFinancialPreferences(preferences);
  }

  /**
   * Clears the financial records cache
   */
  clearFinancialsCache() {
    this.financialStorage.clearFinancialsCache();
  }

  /**
   * Clears the select options cache
   */
  clearSelectOptionsCache() {
    this.financialStorage.clearSelectOptionsCache();
  }

  /**
   * Clears the summary cache
   */
  clearSummaryCache() {
    this.financialStorage.clearSummaryCache();
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.financialStorage.clearAllCache();
  }

  /**
   * Gets current cache state information
   * @returns {Object} - Cache state details
   */
  getFinancialsCacheInfo() {
    return this.financialStorage.getFinancialsCacheInfo();
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setFinancialsCacheDuration(durationMs) {
    this.financialStorage.setCacheDuration(durationMs);
  }

  /**
   * Sets select options cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSelectOptionsCacheDuration(durationMs) {
    this.financialStorage.setSelectOptionsCacheDuration(durationMs);
  }

  /**
   * Sets summary cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setSummaryCacheDuration(durationMs) {
    this.financialStorage.setSummaryCacheDuration(durationMs);
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getFinancialSelectOptionsWithCallbacks(
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getFinancialSelectOptions(onUnauthorizedCallback, forceRefresh)
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

  getFinancialsWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getFinancials(params, onUnauthorizedCallback, forceRefresh)
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

  createFinancialWithCallbacks(
    financialData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.createFinancial(financialData, onUnauthorizedCallback)
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

  getFinancialDetailWithCallbacks(
    financialId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getFinancialDetail(financialId, onUnauthorizedCallback)
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

  updateFinancialWithCallbacks(
    financialId,
    financialData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateFinancial(financialId, financialData, onUnauthorizedCallback)
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

  deleteFinancialWithCallbacks(
    financialId,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.deleteFinancial(financialId, onUnauthorizedCallback)
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

  getFinancialSummaryWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getFinancialSummary(params, onUnauthorizedCallback, forceRefresh)
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

  exportFinancialsWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.exportFinancials(params, onUnauthorizedCallback)
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

  _validateFinancialId(financialId) {
    if (
      !financialId ||
      (typeof financialId !== "string" && typeof financialId !== "number")
    ) {
      return { financialId: "Valid financial record ID is required" };
    }
    return null;
  }

  _validateFinancialsParams(params) {
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
        "amount",
        "type",
        "transaction_date",
        "due_date",
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
          validatedParams.sortOrder = "DESC"; // Default to newest first for financial records
        }
      }
    }

    // Validate date filters
    if (params.startDate && typeof params.startDate === "string") {
      validatedParams.startDate = params.startDate;
    }

    if (params.endDate && typeof params.endDate === "string") {
      validatedParams.endDate = params.endDate;
    }

    // Validate type filter
    if (params.type && typeof params.type === "string") {
      validatedParams.type = params.type;
    }

    // Validate status
    if (params.status && typeof params.status === "string") {
      validatedParams.status = params.status;
    }

    return validatedParams;
  }

  _validateFinancialData(financialData, isCreate = false) {
    const errors = {};

    if (!financialData || typeof financialData !== "object") {
      errors.general = "Financial record data is required";
      return errors;
    }

    // Validate amount (required)
    if (financialData.amount === undefined || financialData.amount === null) {
      errors.amount = "Amount is required";
    } else if (
      typeof financialData.amount !== "number" ||
      isNaN(financialData.amount)
    ) {
      errors.amount = "Amount must be a valid number";
    } else if (financialData.amount < 0) {
      errors.amount = "Amount cannot be negative";
    }

    // Validate type (required)
    if (!financialData.type || !financialData.type.trim()) {
      errors.type = "Financial record type is required";
    }

    // Validate transaction date (optional)
    if (
      financialData.transactionDate &&
      typeof financialData.transactionDate !== "string"
    ) {
      errors.transactionDate = "Transaction date must be a valid date string";
    }

    // Validate due date (optional)
    if (financialData.dueDate && typeof financialData.dueDate !== "string") {
      errors.dueDate = "Due date must be a valid date string";
    }

    // Validate description (optional)
    if (financialData.description && financialData.description.length > 1000) {
      errors.description = "Description must be less than 1000 characters";
    }

    // Validate status (optional)
    if (financialData.status !== undefined) {
      const validStatuses = [1, 2, 3]; // Pending, Paid, Cancelled
      if (!validStatuses.includes(financialData.status)) {
        errors.status = "Invalid financial record status";
      }
    }

    return errors;
  }

  _validateSummaryParams(params) {
    const validatedParams = {};

    // Validate date filters
    if (params.startDate && typeof params.startDate === "string") {
      validatedParams.startDate = params.startDate;
    }

    if (params.endDate && typeof params.endDate === "string") {
      validatedParams.endDate = params.endDate;
    }

    // Validate type filter
    if (params.type && typeof params.type === "string") {
      validatedParams.type = params.type;
    }

    return validatedParams;
  }

  _validateExportParams(params) {
    const errors = {};

    // Validate format
    if (params.format && !["csv", "xlsx", "pdf"].includes(params.format)) {
      errors.format = "Export format must be csv, xlsx, or pdf";
    }

    // Validate date range
    if (params.startDate && params.endDate) {
      const startDate = new Date(params.startDate);
      const endDate = new Date(params.endDate);

      if (startDate > endDate) {
        errors.dateRange = "Start date cannot be after end date";
      }
    }

    return errors;
  }

  /**
   * Waits for current financial records request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentFinancialsRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.financialStorage.isFinancialsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.financialStorage.getFinancialsFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Financial records request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Financial records request timeout"));
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
        if (!this.financialStorage.isSelectOptionsCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.financialStorage.getSelectOptionsFromCache();
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
   * Waits for current summary request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForCurrentSummaryRequest() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.financialStorage.isSummaryCacheLoading()) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData = this.financialStorage.getSummaryFromCache();
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error("Summary request failed"));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Summary request timeout"));
      }, 30000);
    });
  }
}
