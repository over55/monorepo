// File Path: monorepo/web/workery-frontend/src/services/Storage/TokenStorage.js

/**
 * TokenStorage handles all token-related local storage operations
 */
export class TokenStorage {
  constructor() {
    this.ACCESS_TOKEN_KEY = "WORKERY_TOKEN_UTILITY_ACCESS_TOKEN_DATA";
    this.REFRESH_TOKEN_KEY = "WORKERY_TOKEN_UTILITY_REFRESH_TOKEN_DATA";
  }

  /**
   * Saves access token to local storage
   * @param {string} accessToken
   */
  setAccessToken(accessToken) {
    if (accessToken !== undefined && accessToken !== null) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      console.log("TokenStorage: saved access token");
    } else {
      console.error("TokenStorage: Attempting to set undefined access token");
    }
  }

  /**
   * Saves refresh token to local storage
   * @param {string} refreshToken
   */
  setRefreshToken(refreshToken) {
    if (refreshToken !== undefined && refreshToken !== null) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      console.log("TokenStorage: saved refresh token");
    } else {
      console.error("TokenStorage: Attempting to set undefined refresh token");
    }
  }

  /**
   * Gets access token from local storage
   * @returns {string|null}
   */
  getAccessToken() {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Gets refresh token from local storage
   * @returns {string|null}
   */
  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Clears all tokens from local storage
   */
  clearTokens() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    console.log("TokenStorage: cleared all tokens");
  }

  /**
   * Clears entire local storage (used on successful login)
   */
  clearAllStorage() {
    localStorage.clear();
    console.log("TokenStorage: cleared entire local storage");
  }

  /**
   * Saves both tokens at once
   * @param {Object} tokens - { accessToken, refreshToken }
   */
  setTokens(tokens) {
    this.setAccessToken(tokens.accessToken);
    this.setRefreshToken(tokens.refreshToken);
  }

  /**
   * Gets both tokens at once
   * @returns {Object} - { accessToken, refreshToken }
   */
  getTokens() {
    return {
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken(),
    };
  }

  /**
   * Checks if user has valid tokens
   * @returns {boolean}
   */
  hasValidTokens() {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    return !!(accessToken && refreshToken);
  }
}
