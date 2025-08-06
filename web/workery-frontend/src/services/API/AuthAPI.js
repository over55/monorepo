import axios from "axios";
import { camelizeKeys, decamelizeKeys } from "humps";

/**
 * AuthAPI handles all authentication-related API calls
 */
export class AuthAPI {
  constructor(baseURL, endpoints) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log("AuthAPI initialized with:", {
        baseURL: this.baseURL,
        loginEndpoint: this.endpoints.LOGIN,
      });
    }
  }

  /**
   * Performs login API call
   * @param {Object} credentials - { email, password }
   * @returns {Promise} - Resolves to user profile data or rejects with error
   */
  async login(credentials) {
    try {
      // Create axios instance for login (no auth headers needed)
      const apiClient = axios.create({
        baseURL: this.baseURL,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // Convert camelCase to snake_case for API
      const decamelizedData = decamelizeKeys(credentials);

      // Make the API call
      const response = await apiClient.post(
        this.endpoints.LOGIN,
        decamelizedData,
      );

      // Convert snake_case response to camelCase
      const profile = camelizeKeys(response.data);

      return profile;
    } catch (error) {
      // Handle and format errors
      let errorData = null;

      if (error.response?.data) {
        errorData = error.response.data;
      } else if (error.response) {
        errorData = error.response;
      } else {
        errorData = error;
      }

      // Convert error to camelCase
      let formattedErrors = camelizeKeys(errorData);

      // Check for specific error messages and standardize them
      const errorStr = JSON.stringify(formattedErrors);
      if (errorStr.includes("Incorrect email or password")) {
        formattedErrors = {
          auth: "Incorrect email or password",
        };
      }

      throw formattedErrors;
    }
  }
}
