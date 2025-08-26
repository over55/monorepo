// File Path: monorepo/web/workery-frontend/src/services/API/FinancialAPI.js

import { camelizeKeys, decamelizeKeys } from "humps";
import { createAuthenticatedAxios } from "../Helpers/AuthenticatedAxios";
import { DateTime } from "luxon";

/**
 * FinancialAPI handles financial operations on Orders
 * Note: Financial operations are part of the Order module in the backend
 */
export class FinancialAPI {
  constructor(baseURL, endpoints, tokenStorage) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
    this.tokenStorage = tokenStorage;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("FinancialAPI initialized with:", {
        baseURL: this.baseURL,
        orderDetailEndpoint: this.endpoints.ORDER_DETAIL,
        financialUpdateEndpoint: this.endpoints.FINANCIAL_UPDATE,
      });
    }
  }

  /**
   * Gets order detail which includes financial information
   * @param {number} orderWJID - The Work Job ID of the order
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Order details including financial data
   */
  async getOrderFinancialDetail(orderWJID, onUnauthorizedCallback = null) {
    try {
      // Validate order WJID
      if (!orderWJID || typeof orderWJID !== "number") {
        throw {
          orderWJID: "Valid order WJID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Use the order detail endpoint - /order/{wjid}
      const url = `/order/${orderWJID}`;

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      // Extract and format financial data
      const financialData = {
        id: data.id,
        wjid: data.wjid,
        // Financial fields
        completionDate: data.completionDate,
        invoicePaidTo: data.invoicePaidTo,
        invoiceDate: data.invoiceDate,
        invoiceIds: data.invoiceIds,
        invoiceQuotedLabourAmount: data.invoiceQuotedLabourAmount || 0,
        invoiceQuotedMaterialAmount: data.invoiceQuotedMaterialAmount || 0,
        invoiceQuotedOtherCostsAmount: data.invoiceQuotedOtherCostsAmount || 0,
        invoiceTotalQuoteAmount: data.invoiceTotalQuoteAmount || 0,
        invoiceLabourAmount: data.invoiceLabourAmount || 0,
        invoiceMaterialAmount: data.invoiceMaterialAmount || 0,
        invoiceOtherCostsAmount: data.invoiceOtherCostsAmount || 0,
        invoiceTaxAmount: data.invoiceTaxAmount || 0,
        invoiceIsCustomTaxAmount: data.invoiceIsCustomTaxAmount || false,
        invoiceTotalAmount: data.invoiceTotalAmount || 0,
        invoiceDepositAmount: data.invoiceDepositAmount || 0,
        invoiceAmountDue: data.invoiceAmountDue || 0,
        invoiceServiceFeeId: data.invoiceServiceFeeId,
        invoiceServiceFeeName: data.invoiceServiceFeeName,
        invoiceServiceFeePercentage: data.invoiceServiceFeePercentage || 0,
        invoiceServiceFeeAmount: data.invoiceServiceFeeAmount || 0,
        invoiceServiceFeePaymentDate: data.invoiceServiceFeePaymentDate,
        paymentMethods: data.paymentMethods || [],
        invoiceActualServiceFeeAmountPaid:
          data.invoiceActualServiceFeeAmountPaid || 0,
        invoiceBalanceOwingAmount: data.invoiceBalanceOwingAmount || 0,
        // Order info for context
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        associateName: data.associateName,
        status: data.status,
        description: data.description,
      };

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log(
          "FinancialAPI: Retrieved order financial detail:",
          financialData,
        );
      }

      return financialData;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Updates financial information for an order
   * @param {number} orderWJID - The Work Job ID of the order
   * @param {Object} financialData - Financial data to update
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
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
        throw {
          orderWJID: "Valid order WJID is required",
        };
      }

      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Prepare the request data matching backend OrderFinancialUpdateRequestIDO
      const requestData = {
        wjid: orderWJID,
        completion_date: financialData.completionDate || "",
        invoice_paid_to: financialData.invoicePaidTo || 0,
        payment_status: financialData.paymentStatus || 0,
        invoice_date: financialData.invoiceDate || "",
        invoice_ids: financialData.invoiceIds || "",
        invoice_quoted_labour_amount:
          financialData.invoiceQuotedLabourAmount || 0,
        invoice_quoted_material_amount:
          financialData.invoiceQuotedMaterialAmount || 0,
        invoice_quoted_other_costs_amount:
          financialData.invoiceQuotedOtherCostsAmount || 0,
        invoice_total_quote_amount: financialData.invoiceTotalQuoteAmount || 0,
        invoice_labour_amount: financialData.invoiceLabourAmount || 0,
        invoice_material_amount: financialData.invoiceMaterialAmount || 0,
        invoice_other_costs_amount: financialData.invoiceOtherCostsAmount || 0,
        invoice_tax_amount: financialData.invoiceTaxAmount || 0,
        invoice_is_custom_tax_amount:
          financialData.invoiceIsCustomTaxAmount || false,
        invoice_total_amount: financialData.invoiceTotalAmount || 0,
        invoice_deposit_amount: financialData.invoiceDepositAmount || 0,
        invoice_amount_due: financialData.invoiceAmountDue || 0,
        invoice_service_fee_id: financialData.invoiceServiceFeeId || "",
        invoice_service_fee_amount: financialData.invoiceServiceFeeAmount || 0,
        invoice_service_fee_payment_date:
          financialData.invoiceServiceFeePaymentDate || "",
        payment_methods: financialData.paymentMethods || [],
        invoice_actual_service_fee_amount_paid:
          financialData.invoiceActualServiceFeeAmountPaid || 0,
        invoice_balance_owing_amount:
          financialData.invoiceBalanceOwingAmount || 0,
      };

      // Use the financial update endpoint - /order/financial/{wjid}
      const url = `/order/financial/${orderWJID}`;

      // Make the API call
      const response = await authenticatedAxios.put(url, requestData);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      if (process.env.NODE_ENV === "development") {
        console.log("FinancialAPI: Updated order financial data successfully");
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets list of orders with financial filters
   * @param {Object} params - Query parameters for filtering orders by financial criteria
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Orders list with financial data
   */
  async getOrdersWithFinancialData(params = {}, onUnauthorizedCallback = null) {
    try {
      // Create authenticated axios instance
      const authenticatedAxios = createAuthenticatedAxios(
        this.baseURL,
        this.tokenStorage,
        onUnauthorizedCallback,
      );

      // Build query parameters for orders with financial filters
      const queryParams = new URLSearchParams();

      // Add pagination params
      if (params.page) queryParams.append("page", params.page);
      if (params.pageSize) queryParams.append("page_size", params.pageSize);

      // Add financial status filters (map to order statuses)
      if (params.financialStatus) {
        // Map financial status to order status
        const statusMap = {
          pending: "6", // In Progress
          unpaid: "7", // Completed but Unpaid
          paid: "8", // Completed and Paid
        };
        const orderStatus = statusMap[params.financialStatus];
        if (orderStatus) {
          queryParams.append("status", orderStatus);
        }
      }

      // Add date filters for financial reporting
      if (params.completionDateStart) {
        queryParams.append("completion_date_gte", params.completionDateStart);
      }
      if (params.completionDateEnd) {
        queryParams.append("completion_date_lte", params.completionDateEnd);
      }
      if (params.invoiceDateStart) {
        queryParams.append(
          "invoice_service_fee_payment_date_gte",
          params.invoiceDateStart,
        );
      }
      if (params.invoiceDateEnd) {
        queryParams.append(
          "invoice_service_fee_payment_date_lte",
          params.invoiceDateEnd,
        );
      }

      // Add sorting
      if (params.sortBy) {
        queryParams.append("sort_by", params.sortBy);
      }

      const queryString = queryParams.toString();
      const url = queryString ? `/orders?${queryString}` : "/orders";

      // Make the API call
      const response = await authenticatedAxios.get(url);

      // Convert response from snake_case to camelCase
      const data = camelizeKeys(response.data);

      // Process and extract financial data from orders
      if (data.results && Array.isArray(data.results)) {
        data.results = data.results.map((order) => ({
          ...order,
          // Ensure financial fields are present
          financialSummary: {
            totalAmount: order.invoiceTotalAmount || 0,
            amountPaid: order.invoiceActualServiceFeeAmountPaid || 0,
            balanceOwing: order.invoiceBalanceOwingAmount || 0,
            isPaid: order.status === 8, // Completed and Paid
            paymentMethods: order.paymentMethods || [],
          },
        }));
      }

      return data;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Gets financial summary data by aggregating order data
   * @param {Object} params - Query parameters { startDate, endDate }
   * @param {Function} onUnauthorizedCallback - Called when token refresh fails
   * @returns {Promise<Object>} - Financial summary data
   */
  async getFinancialSummary(params = {}, onUnauthorizedCallback = null) {
    try {
      // Since there's no dedicated summary endpoint, we'll fetch orders and calculate
      const ordersData = await this.getOrdersWithFinancialData(
        {
          ...params,
          pageSize: 1000, // Get more records for summary
          financialStatus: "paid", // Only completed and paid orders
        },
        onUnauthorizedCallback,
      );

      // Calculate summary from orders
      const summary = {
        totalRevenue: 0,
        totalServiceFees: 0,
        totalOutstanding: 0,
        orderCount: 0,
        paidCount: 0,
        unpaidCount: 0,
      };

      if (ordersData.results && Array.isArray(ordersData.results)) {
        ordersData.results.forEach((order) => {
          summary.orderCount++;

          if (order.status === 8) {
            // Completed and Paid
            summary.paidCount++;
            summary.totalRevenue += order.invoiceTotalAmount || 0;
            summary.totalServiceFees += order.invoiceServiceFeeAmount || 0;
          } else if (order.status === 7) {
            // Completed but Unpaid
            summary.unpaidCount++;
            summary.totalOutstanding += order.invoiceAmountDue || 0;
          }
        });
      }

      return summary;
    } catch (error) {
      throw this._formatError(error);
    }
  }

  /**
   * Formats error responses consistently
   * @private
   * @param {Error} error - Original error from axios or interceptor
   * @returns {Object} - Formatted error object
   */
  _formatError(error) {
    let errorData = null;

    // Handle different error structures
    if (error.response?.data) {
      errorData = error.response.data;
    } else if (error.response) {
      errorData = error.response;
    } else if (typeof error === "object" && error !== null) {
      // Already processed by our interceptor
      errorData = error;
    } else {
      errorData = { message: error.message || "Unknown error occurred" };
    }

    // Convert error to camelCase
    const formattedErrors = camelizeKeys(errorData);
    return formattedErrors;
  }
}
