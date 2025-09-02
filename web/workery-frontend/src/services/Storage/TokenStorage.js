// File Path: monorepo/web/workery-frontend/src/services/Storage/TokenStorage.js

export class TokenStorage {
  constructor() {
    this.ACCESS_TOKEN_KEY = "WORKERY_ACCESS_TOKEN";
    this.REFRESH_TOKEN_KEY = "WORKERY_REFRESH_TOKEN";
  }

  /**
   * Get the current access token
   * @returns {string|null}
   */
  getAccessToken() {
    try {
      const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      // Return null if token is undefined, empty, or "undefined" string
      if (!token || token === "undefined" || token === "null" || token === "") {
        return null;
      }
      return token;
    } catch (error) {
      console.error("TokenStorage: Error getting access token", error);
      return null;
    }
  }

  /**
   * Get the current refresh token
   * @returns {string|null}
   */
  getRefreshToken() {
    try {
      const token = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      // Return null if token is undefined, empty, or "undefined" string
      if (!token || token === "undefined" || token === "null" || token === "") {
        return null;
      }
      return token;
    } catch (error) {
      console.error("TokenStorage: Error getting refresh token", error);
      return null;
    }
  }

  /**
   * Set tokens
   * @param {Object} tokens - { accessToken, refreshToken }
   */
  setTokens({ accessToken, refreshToken }) {
    try {
      if (accessToken) {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      }
      if (refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      console.error("TokenStorage: Error setting tokens", error);
    }
  }

  /**
   * Set access token
   * @param {string} token
   */
  setAccessToken(token) {
    try {
      if (token && token !== "undefined" && token !== "null") {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
      }
    } catch (error) {
      console.error("TokenStorage: Error setting access token", error);
    }
  }

  /**
   * Set refresh token
   * @param {string} token
   */
  setRefreshToken(token) {
    try {
      if (token && token !== "undefined" && token !== "null") {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
      }
    } catch (error) {
      console.error("TokenStorage: Error setting refresh token", error);
    }
  }

  /**
   * Clear all tokens
   */
  clearTokens() {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      console.log("TokenStorage: cleared all tokens");
    } catch (error) {
      console.error("TokenStorage: Error clearing tokens", error);
    }
  }

  /**
   * Clear all storage
   */
  clearAllStorage() {
    this.clearTokens();
    // Clear any other storage items if needed
  }

  /**
   * Check if we have valid tokens
   * @returns {boolean}
   */
  hasValidTokens() {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    return !!(accessToken && refreshToken);
  }

  /**
   * Get both tokens
   * @returns {Object} - { accessToken, refreshToken }
   */
  getTokens() {
    return {
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken(),
    };
  }
}
