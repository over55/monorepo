// File Path: web/workery-frontend/src/services/Storage/OrderCreationStorage.js

/**
 * OrderCreationStorage handles temporary storage for multi-step order creation
 * Maintains state across the order creation wizard steps
 */
export class OrderCreationStorage {
  constructor() {
    this.ORDER_CREATION_KEY = "WORKERY_ORDER_CREATION_STATE";
    this.ORDER_CREATION_TIMESTAMP_KEY = "WORKERY_ORDER_CREATION_TIMESTAMP";
    this.EXPIRY_DURATION = 60 * 60 * 1000; // 1 hour expiry for order creation state

    if (process.env.NODE_ENV === "development") {
      console.log("OrderCreationStorage initialized");
    }
  }

  /**
   * Saves order creation state to localStorage
   * @param {Object} orderData - Partial order data being created
   */
  saveOrderCreation(orderData) {
    if (!orderData) {
      console.warn(
        "OrderCreationStorage: Attempted to save null/undefined order data",
      );
      return;
    }

    try {
      const timestamp = Date.now();

      localStorage.setItem(this.ORDER_CREATION_KEY, JSON.stringify(orderData));
      localStorage.setItem(
        this.ORDER_CREATION_TIMESTAMP_KEY,
        timestamp.toString(),
      );

      console.log("OrderCreationStorage: Order creation state saved", {
        timestamp: new Date(timestamp).toISOString(),
        customerId: orderData.customerId,
        hasDescription: !!orderData.description,
        skillSetsCount: orderData.skillSets ? orderData.skillSets.length : 0,
      });
    } catch (error) {
      console.error(
        "OrderCreationStorage: Error saving order creation state",
        error,
      );
    }
  }

  /**
   * Gets order creation state from localStorage
   * @returns {Object|null} - Order creation data or null if not found/expired
   */
  getOrderCreation() {
    try {
      const orderData = localStorage.getItem(this.ORDER_CREATION_KEY);
      const timestamp = localStorage.getItem(this.ORDER_CREATION_TIMESTAMP_KEY);

      if (!orderData || !timestamp) {
        return null;
      }

      // Check if data has expired
      const age = Date.now() - parseInt(timestamp);
      if (age > this.EXPIRY_DURATION) {
        console.log(
          "OrderCreationStorage: Order creation state expired, clearing",
        );
        this.clearOrderCreation();
        return null;
      }

      const parsed = JSON.parse(orderData);

      console.log("OrderCreationStorage: Retrieved order creation state", {
        age: Math.round(age / 1000 / 60) + " minutes",
        customerId: parsed.customerId,
      });

      return parsed;
    } catch (error) {
      console.error(
        "OrderCreationStorage: Error reading order creation state",
        error,
      );
      this.clearOrderCreation();
      return null;
    }
  }

  /**
   * Updates specific fields in the order creation state
   * @param {Object} updates - Fields to update
   */
  updateOrderCreation(updates) {
    const currentData = this.getOrderCreation() || {};
    const updatedData = {
      ...currentData,
      ...updates,
    };

    this.saveOrderCreation(updatedData);
  }

  /**
   * Clears order creation state from localStorage
   */
  clearOrderCreation() {
    try {
      localStorage.removeItem(this.ORDER_CREATION_KEY);
      localStorage.removeItem(this.ORDER_CREATION_TIMESTAMP_KEY);

      console.log("OrderCreationStorage: Order creation state cleared");
    } catch (error) {
      console.error(
        "OrderCreationStorage: Error clearing order creation state",
        error,
      );
    }
  }

  /**
   * Checks if order creation state exists and is valid
   * @returns {boolean} - True if valid order creation state exists
   */
  hasValidOrderCreation() {
    const orderData = this.getOrderCreation();
    return orderData !== null && orderData !== undefined;
  }

  /**
   * Gets the age of the current order creation state
   * @returns {number|null} - Age in milliseconds or null if no state exists
   */
  getOrderCreationAge() {
    try {
      const timestamp = localStorage.getItem(this.ORDER_CREATION_TIMESTAMP_KEY);

      if (!timestamp) {
        return null;
      }

      return Date.now() - parseInt(timestamp);
    } catch (error) {
      return null;
    }
  }

  /**
   * Validates that required fields are present for a given step
   * @param {number} step - The step number to validate for
   * @returns {boolean} - True if all required fields for the step are present
   */
  validateStep(step) {
    const orderData = this.getOrderCreation();

    if (!orderData) {
      return false;
    }

    switch (step) {
      case 1:
        // Step 1 requires customer selection
        return !!orderData.customerId;

      case 2:
        // Step 2 requires job type info
        return (
          !!orderData.customerId &&
          orderData.isOngoing !== null &&
          orderData.isOngoing !== undefined &&
          orderData.isHomeSupportService !== null &&
          orderData.isHomeSupportService !== undefined
        );

      case 3:
        // Step 3 requires description and skill sets
        return (
          !!orderData.customerId &&
          !!orderData.description &&
          orderData.skillSets &&
          orderData.skillSets.length > 0
        );

      case 4:
        // Step 4 is review, so all previous steps must be complete
        return this.validateStep(3);

      default:
        return false;
    }
  }

  /**
   * Gets a summary of the current order creation state
   * @returns {Object} - Summary information
   */
  getOrderCreationSummary() {
    const orderData = this.getOrderCreation();

    if (!orderData) {
      return {
        exists: false,
        isValid: false,
        customerId: null,
        completedSteps: [],
      };
    }

    const completedSteps = [];
    if (orderData.customerId) completedSteps.push(1);
    if (orderData.isOngoing !== null && orderData.isHomeSupportService !== null)
      completedSteps.push(2);
    if (orderData.description && orderData.skillSets?.length > 0)
      completedSteps.push(3);

    return {
      exists: true,
      isValid: true,
      customerId: orderData.customerId,
      customerName:
        `${orderData.customerFirstName || ""} ${orderData.customerLastName || ""}`.trim(),
      completedSteps: completedSteps,
      age: this.getOrderCreationAge(),
      data: orderData,
    };
  }
}
