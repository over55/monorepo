// File Path: monorepo/web/workery-frontend/src/services/Manager/AuthManager.js

/**
 * AuthManager handles all authentication-related business logic
 * Combines AuthAPI and TokenStorage to provide complete authentication workflows
 */
export class AuthManager {
  constructor(authAPI, tokenStorage) {
    this.authAPI = authAPI;
    this.tokenStorage = tokenStorage;
  }

  /**
   * Performs login with credentials
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - Resolves with user profile data
   */
  async login(credentials) {
    try {
      // Call the API to authenticate
      const profile = await this.authAPI.login(credentials);

      // Clear previous session data on successful login
      this.tokenStorage.clearAllStorage();

      // Save the new tokens
      if (profile.accessToken && profile.refreshToken) {
        this.tokenStorage.setTokens({
          accessToken: profile.accessToken,
          refreshToken: profile.refreshToken,
        });

        console.log("AuthManager: Login successful, tokens saved");
      } else {
        throw new Error("Login response missing required tokens");
      }

      return profile;
    } catch (error) {
      console.error("AuthManager: Login failed", error);
      // Clean up any partial state on error
      this.tokenStorage.clearTokens();
      throw error;
    }
  }

  /**
   * Performs complete logout workflow
   * Calls the logout API and cleans up local tokens
   * @returns {Promise<void>}
   */
  async logout() {
    console.log("AuthManager.logout: Starting");

    try {
      // Try to call the backend logout, but don't wait forever
      await this.authAPI.logout();
      console.log("AuthManager.logout: API call completed");
    } catch (error) {
      // Log but don't throw - we still want to clear local state
      console.log(
        "AuthManager.logout: API call failed, continuing anyway:",
        error.message,
      );
    }

    // Always clear tokens regardless of API call result
    this.tokenStorage.clearTokens();
    console.log("AuthManager.logout: Tokens cleared, logout complete");
  }

  /**
   * Callback-based login for compatibility with existing components
   * @param {Object} credentials
   * @param {Function} onSuccessCallback
   * @param {Function} onErrorCallback
   * @param {Function} onDoneCallback
   */
  loginWithCallbacks(
    credentials,
    onSuccessCallback,
    onErrorCallback,
    onDoneCallback,
  ) {
    this.login(credentials)
      .then((profile) => {
        if (onSuccessCallback) {
          onSuccessCallback(profile);
        }
      })
      .catch((error) => {
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      })
      .finally(() => {
        if (onDoneCallback) {
          onDoneCallback();
        }
      });
  }

  /**
   * Callback-based version of logout for compatibility
   * @param {Function} onSuccessCallback
   * @param {Function} onErrorCallback
   * @param {Function} onDoneCallback
   */
  logoutWithCallbacks(onSuccessCallback, onErrorCallback, onDoneCallback) {
    this.logout()
      .then(() => {
        if (onSuccessCallback) {
          onSuccessCallback(null);
        }
      })
      .catch((error) => {
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      })
      .finally(() => {
        if (onDoneCallback) {
          onDoneCallback();
        }
      });
  }

  /**
   * Checks if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.tokenStorage.hasValidTokens();
  }

  /**
   * Gets current access token
   * @returns {string|null}
   */
  getAccessToken() {
    return this.tokenStorage.getAccessToken();
  }

  /**
   * Gets current refresh token
   * @returns {string|null}
   */
  getRefreshToken() {
    return this.tokenStorage.getRefreshToken();
  }

  /**
   * Gets current authentication state information
   * @returns {Object} - Authentication state details
   */
  getAuthState() {
    const tokens = this.tokenStorage.getTokens();
    return {
      isAuthenticated: this.isAuthenticated(),
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken,
      tokens: {
        accessToken: tokens.accessToken ? "[PRESENT]" : null,
        refreshToken: tokens.refreshToken ? "[PRESENT]" : null,
      },
    };
  }

  /**
   * Clears only authentication data (not full storage)
   */
  clearAuthData() {
    this.tokenStorage.clearTokens();
    console.log("AuthManager: Cleared authentication data");
  }

  /**
   * Validates current session
   * @returns {Promise<boolean>} - True if session is valid
   */
  async validateSession() {
    if (!this.isAuthenticated()) {
      return false;
    }

    // TODO: Add API call to validate token with server
    // For now, just check if tokens exist
    return true;
  }
}
