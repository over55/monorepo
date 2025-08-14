// File Path: monorepo/web/workery-frontend/src/services/Storage/OrderCompletionStorage.js

/**
 * OrderCompletionStorage handles the order completion wizard state
 * Persists data across steps in the multi-step form
 */
export class OrderCompletionStorage {
  constructor() {
    this.STORAGE_KEY = "WORKERY_ORDER_COMPLETION_WIZARD";
    this.DEFAULT_STATE = {
      // Step 2 fields
      wasCompleted: 0,
      reason: 0,
      reasonOther: "",
      completionDate: null,
      reasonComment: "",
      closingReasonComment: "",
      visits: 1,

      // Step 3 fields
      hasInputtedFinancials: 0,
      invoicePaidTo: 0,
      paymentStatus: 0,
      invoiceDate: null,
      invoiceIDs: "",
      invoiceQuotedLabourAmount: 0,
      invoiceQuotedMaterialAmount: 0,
      invoiceQuotedOtherCostsAmount: 0,
      invoiceTotalQuoteAmount: 0,
      invoiceLabourAmount: 0,
      invoiceMaterialAmount: 0,
      invoiceOtherCostsAmount: 0,
      invoiceTaxAmount: 0,
      invoiceIsCustomTaxAmount: false,
      invoiceTotalAmount: 0,
      invoiceDepositAmount: 0,
      invoiceAmountDue: 0,
      invoiceServiceFeeID: "",
      invoiceServiceFeePercentage: 0,
      invoiceServiceFee: null,
      invoiceServiceFeeOther: "",
      isInvoiceServiceFeeOther: false,
      invoiceServiceFeeAmount: 0,
      invoiceServiceFeePaymentDate: null,
      invoiceActualServiceFeeAmountPaid: 0,
      invoiceBalanceOwingAmount: 0,
      paymentMethods: [],

      // Step 4 fields
      comment: "",
    };
  }

  /**
   * Gets the current wizard state
   * @returns {Object} - Current wizard state or default state
   */
  getState() {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (parsed.completionDate) {
          parsed.completionDate = new Date(parsed.completionDate);
        }
        if (parsed.invoiceDate) {
          parsed.invoiceDate = new Date(parsed.invoiceDate);
        }
        if (parsed.invoiceServiceFeePaymentDate) {
          parsed.invoiceServiceFeePaymentDate = new Date(
            parsed.invoiceServiceFeePaymentDate,
          );
        }
        return { ...this.DEFAULT_STATE, ...parsed };
      }
    } catch (error) {
      console.error("OrderCompletionStorage: Error reading state", error);
    }
    return { ...this.DEFAULT_STATE };
  }

  /**
   * Updates the wizard state
   * @param {Object} updates - Partial state updates
   */
  updateState(updates) {
    try {
      const currentState = this.getState();
      const newState = { ...currentState, ...updates };
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(newState));
      console.log("OrderCompletionStorage: State updated", updates);
    } catch (error) {
      console.error("OrderCompletionStorage: Error updating state", error);
    }
  }

  /**
   * Clears the wizard state
   */
  clearState() {
    sessionStorage.removeItem(this.STORAGE_KEY);
    console.log("OrderCompletionStorage: State cleared");
  }

  /**
   * Resets to default state
   */
  resetState() {
    try {
      sessionStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.DEFAULT_STATE),
      );
      console.log("OrderCompletionStorage: State reset to defaults");
    } catch (error) {
      console.error("OrderCompletionStorage: Error resetting state", error);
    }
  }
}
