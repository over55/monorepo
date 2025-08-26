// File Path: monorepo/web/workery-frontend/src/services/Manager/FinancialManager.js

import {
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
} from "../../constants/Order";

/**
 * FinancialManager handles order financial business logic
 * Coordinates between FinancialAPI and FinancialStorage for order financial management
 */
export class FinancialManager {
  constructor(financialAPI, financialStorage) {
    this.financialAPI = financialAPI;
    this.financialStorage = financialStorage;
  }

  /**
   * Gets financial details for a specific order
   * @param {number} orderWJID - The Work Job ID of the order
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @param {boolean} forceRefresh - Whether to bypass cache and force fresh data
   * @returns {Promise<Object>} - Order financial details
   */
  async getOrderFinancialDetail(
    orderWJID,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    try {
      // Validate order WJID
      if (!orderWJID || typeof orderWJID !== "number") {
        throw { orderWJID: "Valid order WJID is required" };
      }

      // Check storage cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedData =
          this.financialStorage.getOrderFinancialFromCache(orderWJID);
        if (cachedData) {
          return cachedData;
        }
      }

      // Prevent multiple simultaneous requests for same order
      if (this.financialStorage.isOrderFinancialCacheLoading(orderWJID)) {
        console.log(
          `FinancialManager: Financial detail request already in progress for order ${orderWJID}`,
        );
        return this._waitForOrderFinancialRequest(orderWJID);
      }

      this.financialStorage.setOrderFinancialCacheLoading(orderWJID, true);

      console.log(
        `FinancialManager: Fetching fresh financial data for order ${orderWJID}`,
      );

      try {
        // Fetch fresh data from API
        const financialData = await this.financialAPI.getOrderFinancialDetail(
          orderWJID,
          onUnauthorizedCallback,
        );

        // Save to storage cache
        this.financialStorage.saveOrderFinancialToCache(
          orderWJID,
          financialData,
        );

        console.log(
          `FinancialManager: Order ${orderWJID} financial data fetched successfully`,
        );

        return financialData;
      } finally {
        this.financialStorage.setOrderFinancialCacheLoading(orderWJID, false);
      }
    } catch (error) {
      this.financialStorage.setOrderFinancialCacheLoading(orderWJID, false);
      console.error(
        `FinancialManager: Failed to get financial data for order ${orderWJID}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Updates financial information for an order
   * @param {number} orderWJID - The Work Job ID of the order
   * @param {Object} financialData - Financial data to update
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Updated order data
   */
  async updateOrderFinancial(
    orderWJID,
    financialData,
    onUnauthorizedCallback = null,
  ) {
    try {
      // Validate order WJID
      if (!orderWJID || typeof orderWJID !== "number") {
        throw { orderWJID: "Valid order WJID is required" };
      }

      // Validate financial data
      const validationErrors = this._validateFinancialData(financialData);
      if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
      }

      console.log(
        `FinancialManager: Updating financial data for order ${orderWJID}`,
      );

      // Call API to update financial data
      const updatedData = await this.financialAPI.updateOrderFinancial(
        orderWJID,
        financialData,
        onUnauthorizedCallback,
      );

      // Clear cache for this order since data has been updated
      this.financialStorage.clearOrderFinancialCache(orderWJID);
      this.financialStorage.clearSummaryCache();

      console.log(
        `FinancialManager: Order ${orderWJID} financial data updated successfully`,
      );

      return updatedData;
    } catch (error) {
      console.error(
        `FinancialManager: Failed to update financial data for order ${orderWJID}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Gets orders with financial data for reporting
   * @param {Object} params - Query parameters for filtering
   * @param {Function} onUnauthorizedCallback - Called when authentication fails
   * @returns {Promise<Object>} - Orders list with financial data
   */
  async getOrdersWithFinancialData(params = {}, onUnauthorizedCallback = null) {
    try {
      console.log(
        "FinancialManager: Fetching orders with financial data",
        params,
      );

      // Validate and clean parameters
      const validatedParams = this._validateOrdersParams(params);

      // Fetch data from API
      const ordersData = await this.financialAPI.getOrdersWithFinancialData(
        validatedParams,
        onUnauthorizedCallback,
      );

      console.log(
        "FinancialManager: Orders with financial data fetched successfully:",
        {
          count: ordersData.results ? ordersData.results.length : 0,
          totalCount: ordersData.count,
        },
      );

      return ordersData;
    } catch (error) {
      console.error(
        "FinancialManager: Failed to get orders with financial data",
        error,
      );
      throw error;
    }
  }

  /**
   * Gets financial summary with caching
   * @param {Object} params - Query parameters { startDate, endDate }
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
        return this._waitForSummaryRequest();
      }

      this.financialStorage.setSummaryCacheLoading(true);

      console.log("FinancialManager: Fetching fresh summary data", params);

      try {
        // Validate parameters
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
   * Clears order financial cache
   * @param {number} orderWJID - The Work Job ID of the order
   */
  clearOrderFinancialCache(orderWJID) {
    this.financialStorage.clearOrderFinancialCache(orderWJID);
  }

  /**
   * Clears all caches
   */
  clearAllCache() {
    this.financialStorage.clearAllCache();
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
   * Gets cache state information
   * @returns {Object} - Cache state details
   */
  getCacheInfo() {
    return this.financialStorage.getCacheInfo();
  }

  /**
   * Callback-based versions for compatibility with existing components
   */

  getOrderFinancialDetailWithCallbacks(
    orderWJID,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
    forceRefresh = false,
  ) {
    this.getOrderFinancialDetail(
      orderWJID,
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

  updateOrderFinancialWithCallbacks(
    orderWJID,
    financialData,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.updateOrderFinancial(orderWJID, financialData, onUnauthorizedCallback)
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

  getOrdersWithFinancialDataWithCallbacks(
    params = {},
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
    onUnauthorizedCallback = null,
  ) {
    this.getOrdersWithFinancialData(params, onUnauthorizedCallback)
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

  /**
   * Private validation methods
   */

  _validateFinancialData(financialData) {
    const errors = {};

    if (!financialData || typeof financialData !== "object") {
      errors.general = "Financial data is required";
      return errors;
    }

    // Validate payment status if provided
    if (financialData.paymentStatus) {
      const validStatuses = [
        ORDER_STATUS_COMPLETED_BUT_UNPAID,
        ORDER_STATUS_COMPLETED_AND_PAID,
      ];
      if (!validStatuses.includes(financialData.paymentStatus)) {
        errors.paymentStatus = "Invalid payment status";
      }
    }

    // Validate invoice paid to
    if (
      financialData.invoicePaidTo &&
      ![1, 2].includes(financialData.invoicePaidTo)
    ) {
      errors.invoicePaidTo =
        "Invoice must be paid to either Associate (1) or Organization (2)";
    }

    // Validate amounts are numbers
    const amountFields = [
      "invoiceQuotedLabourAmount",
      "invoiceQuotedMaterialAmount",
      "invoiceQuotedOtherCostsAmount",
      "invoiceTotalQuoteAmount",
      "invoiceLabourAmount",
      "invoiceMaterialAmount",
      "invoiceOtherCostsAmount",
      "invoiceTaxAmount",
      "invoiceTotalAmount",
      "invoiceDepositAmount",
      "invoiceAmountDue",
      "invoiceServiceFeeAmount",
      "invoiceActualServiceFeeAmountPaid",
      "invoiceBalanceOwingAmount",
    ];

    amountFields.forEach((field) => {
      if (financialData[field] !== undefined && financialData[field] !== null) {
        const value = parseFloat(financialData[field]);
        if (isNaN(value) || value < 0) {
          errors[field] = `${field} must be a valid non-negative number`;
        }
      }
    });

    // Validate payment methods array
    if (
      financialData.paymentMethods &&
      !Array.isArray(financialData.paymentMethods)
    ) {
      errors.paymentMethods = "Payment methods must be an array";
    }

    return errors;
  }

  _validateOrdersParams(params) {
    const validatedParams = {};

    // Validate pagination
    if (params.page && typeof params.page === "number" && params.page > 0) {
      validatedParams.page = params.page;
    }

    if (
      params.pageSize &&
      typeof params.pageSize === "number" &&
      params.pageSize > 0 &&
      params.pageSize <= 1000
    ) {
      validatedParams.pageSize = params.pageSize;
    }

    // Validate financial status filter
    if (
      params.financialStatus &&
      ["pending", "unpaid", "paid"].includes(params.financialStatus)
    ) {
      validatedParams.financialStatus = params.financialStatus;
    }

    // Validate date filters
    if (
      params.completionDateStart &&
      typeof params.completionDateStart === "string"
    ) {
      validatedParams.completionDateStart = params.completionDateStart;
    }

    if (
      params.completionDateEnd &&
      typeof params.completionDateEnd === "string"
    ) {
      validatedParams.completionDateEnd = params.completionDateEnd;
    }

    if (
      params.invoiceDateStart &&
      typeof params.invoiceDateStart === "string"
    ) {
      validatedParams.invoiceDateStart = params.invoiceDateStart;
    }

    if (params.invoiceDateEnd && typeof params.invoiceDateEnd === "string") {
      validatedParams.invoiceDateEnd = params.invoiceDateEnd;
    }

    // Validate sorting
    if (params.sortBy && typeof params.sortBy === "string") {
      validatedParams.sortBy = params.sortBy;
    }

    return validatedParams;
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

    return validatedParams;
  }

  /**
   * Waits for current order financial request to complete
   * @private
   * @param {number} orderWJID - The Work Job ID of the order
   * @returns {Promise<Object>}
   */
  _waitForOrderFinancialRequest(orderWJID) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.financialStorage.isOrderFinancialCacheLoading(orderWJID)) {
          clearInterval(checkInterval);

          // Try to get cached data
          const cachedData =
            this.financialStorage.getOrderFinancialFromCache(orderWJID);
          if (cachedData) {
            resolve(cachedData);
          } else {
            reject(new Error(`Order ${orderWJID} financial request failed`));
          }
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error(`Order ${orderWJID} financial request timeout`));
      }, 30000);
    });
  }

  /**
   * Waits for current summary request to complete
   * @private
   * @returns {Promise<Object>}
   */
  _waitForSummaryRequest() {
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
