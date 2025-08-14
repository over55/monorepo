// File Path: monorepo/web/workery-frontend/src/services/Storage/SurveyStorage.js

/**
 * SurveyStorage handles the survey wizard state
 * Persists data across steps in the multi-step form
 */
export class SurveyStorage {
  constructor() {
    this.STORAGE_KEY = "WORKERY_SURVEY_WIZARD";
    this.DEFAULT_STATE = {
      wasSurveyConducted: 0,
      noSurveyConductedReason: 0,
      noSurveyConductedReasonOther: "",
      comment: "",
      wasJobSatisfactory: 0,
      wasJobFinishedOnTimeAndOnBudget: 0,
      wasAssociatePunctual: 0,
      wasAssociateProfessional: 0,
      wouldCustomerReferOurOrganization: 0,
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
        return { ...this.DEFAULT_STATE, ...parsed };
      }
    } catch (error) {
      console.error("SurveyStorage: Error reading state", error);
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
      console.log("SurveyStorage: State updated", updates);
    } catch (error) {
      console.error("SurveyStorage: Error updating state", error);
    }
  }

  /**
   * Clears the wizard state
   */
  clearState() {
    sessionStorage.removeItem(this.STORAGE_KEY);
    console.log("SurveyStorage: State cleared");
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
      console.log("SurveyStorage: State reset to defaults");
    } catch (error) {
      console.error("SurveyStorage: Error resetting state", error);
    }
  }
}
