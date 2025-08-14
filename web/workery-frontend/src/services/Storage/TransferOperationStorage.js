// File Path: web/workery-frontend/src/services/Storage/TransferOperationStorage.js

/**
 * TransferOperationStorage handles storage for the order transfer operation wizard
 */
export class TransferOperationStorage {
  constructor() {
    this.STORAGE_KEY = "WORKERY_TRANSFER_OPERATION";
  }

  /**
   * Gets the transfer operation state from session storage
   * @returns {Object} - Transfer operation state or default state
   */
  getTransferOperation() {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error(
        "TransferOperationStorage: Error reading from storage",
        error,
      );
    }

    // Return default state
    return {
      // Client search parameters
      clientIsAdvancedFiltering: false,
      clientSearch: "",
      clientEmail: "",
      clientPhone: "",
      clientFirstName: "",
      clientLastName: "",
      pickedClientID: "",
      pickedClientName: "",

      // Associate search parameters
      associateIsAdvancedFiltering: false,
      associateSearch: "",
      associateEmail: "",
      associatePhone: "",
      associateFirstName: "",
      associateLastName: "",
      pickedAssociateID: "",
      pickedAssociateName: "",
    };
  }

  /**
   * Saves the transfer operation state to session storage
   * @param {Object} state - Transfer operation state to save
   */
  saveTransferOperation(state) {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("TransferOperationStorage: Error saving to storage", error);
    }
  }

  /**
   * Clears the transfer operation state
   */
  clearTransferOperation() {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("TransferOperationStorage: Error clearing storage", error);
    }
  }
}
