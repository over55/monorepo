// File Path: monorepo/web/workery-frontend/src/services/Storage/InvoiceGenerationStorage.js

/**
 * InvoiceGenerationStorage handles invoice generation wizard state
 */
export class InvoiceGenerationStorage {
  constructor() {
    this.STORAGE_KEY = "WORKERY_INVOICE_GENERATION_DATA";
  }

  /**
   * Gets the current invoice generation data
   * @returns {Object|null} - Invoice generation data or null
   */
  getInvoiceGenerationData() {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("InvoiceGenerationStorage: Error reading data", error);
      return null;
    }
  }

  /**
   * Saves invoice generation data
   * @param {Object} data - Invoice generation data
   */
  saveInvoiceGenerationData(data) {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      if (process.env.NODE_ENV === "development") {
        console.log("InvoiceGenerationStorage: Data saved");
      }
    } catch (error) {
      console.error("InvoiceGenerationStorage: Error saving data", error);
    }
  }

  /**
   * Updates specific fields in invoice generation data
   * @param {Object} updates - Fields to update
   */
  updateInvoiceGenerationData(updates) {
    const current = this.getInvoiceGenerationData() || {};
    const updated = { ...current, ...updates };
    this.saveInvoiceGenerationData(updated);
  }

  /**
   * Clears invoice generation data
   */
  clearInvoiceGenerationData() {
    sessionStorage.removeItem(this.STORAGE_KEY);
    if (process.env.NODE_ENV === "development") {
      console.log("InvoiceGenerationStorage: Data cleared");
    }
  }
}
