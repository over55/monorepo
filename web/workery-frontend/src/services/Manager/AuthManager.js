/**
 * AuthManager combines AuthAPI and TokenStorage to provide
 * high-level authentication business logic
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
      } else {
        throw new Error("Login response missing required tokens");
      }

      return profile;
    } catch (error) {
      // Clean up any partial state on error
      this.tokenStorage.clearTokens();
      throw error;
    }
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
   * Logs out the user
   */
  logout() {
    this.tokenStorage.clearTokens();
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
}
