// File Path: monorepo/web/workery-frontend/src/services/Storage/StaffAddWizardStorage.js

/**
 * StaffAddWizardStorage handles the multi-step staff creation wizard state
 */
export class StaffAddWizardStorage {
  constructor() {
    this.STORAGE_KEY = "WORKERY_ADD_STAFF_WIZARD_DATA";
    this.DEFAULT_STATE = {
      // Step 2
      type: null,
      country: "Canada",

      // Step 3 - Contact
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      phoneType: 0,
      otherPhone: "",
      otherPhoneType: 0,
      isOkToText: false,
      isOkToEmail: false,

      // Step 4 - Address
      postalCode: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      region: "",
      hasShippingAddress: false,
      shippingName: "",
      shippingPhone: "",
      shippingCountry: "",
      shippingRegion: "",
      shippingCity: "",
      shippingAddressLine1: "",
      shippingAddressLine2: "",
      shippingPostalCode: "",

      // Step 5 - Account
      limitSpecial: "",
      policeCheck: null,
      driversLicenseClass: "",
      vehicleTypes: [],
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactTelephone: "",
      emergencyContactAlternativeTelephone: "",
      description: "",
      preferredLanguage: "",
      password: "",
      passwordRepeated: "",

      // Step 6 - Metrics
      tags: [],
      howDidYouHearAboutUsID: "",
      isHowDidYouHearAboutUsOther: false,
      howDidYouHearAboutUsOther: "",
      birthDate: null,
      joinDate: null,
      gender: 0,
      genderOther: "",
      additionalComment: "",
      identifyAs: [],
    };
  }

  /**
   * Get current wizard state
   * @returns {Object} Current wizard state
   */
  getWizardState() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("StaffAddWizardStorage: Error reading wizard state", error);
    }
    return { ...this.DEFAULT_STATE };
  }

  /**
   * Save wizard state
   * @param {Object} state - State to save
   */
  saveWizardState(state) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
      console.log("StaffAddWizardStorage: Wizard state saved");
    } catch (error) {
      console.error("StaffAddWizardStorage: Error saving wizard state", error);
    }
  }

  /**
   * Update wizard state with partial data
   * @param {Object} updates - Partial state updates
   */
  updateWizardState(updates) {
    const currentState = this.getWizardState();
    const newState = { ...currentState, ...updates };
    this.saveWizardState(newState);
    return newState;
  }

  /**
   * Clear wizard state
   */
  clearWizardState() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log("StaffAddWizardStorage: Wizard state cleared");
    } catch (error) {
      console.error(
        "StaffAddWizardStorage: Error clearing wizard state",
        error,
      );
    }
  }

  /**
   * Reset to default state
   */
  resetWizardState() {
    this.saveWizardState({ ...this.DEFAULT_STATE });
    return { ...this.DEFAULT_STATE };
  }
}
