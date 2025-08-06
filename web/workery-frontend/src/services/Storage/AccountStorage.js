// File Path: monorepo/web/workery-frontend/src/services/Storage/AccountStorage.js

/**
 * AccountStorage handles all account/profile-related data storage operations
 * Manages profile caching, local storage, and data persistence
 */
export class AccountStorage {
  constructor() {
    this.PROFILE_CACHE_KEY = "WORKERY_ACCOUNT_PROFILE_CACHE";
    this.PROFILE_TIMESTAMP_KEY = "WORKERY_ACCOUNT_PROFILE_TIMESTAMP";
    this.DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

    // In-memory cache for current session
    this.memoryCache = {
      profile: null,
      timestamp: null,
      isLoading: false,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("AccountStorage initialized");
    }
  }

  /**
   * Gets profile data from cache (memory first, then localStorage)
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {Object|null} - Cached profile data or null if not found/expired
   */
  getProfileFromCache(maxAge = this.DEFAULT_CACHE_DURATION) {
    // Check memory cache first (fastest)
    if (this._isMemoryCacheValid(maxAge)) {
      console.log("AccountStorage: Using memory cache for profile");
      return this.memoryCache.profile;
    }

    // Check localStorage cache
    try {
      const cachedProfile = localStorage.getItem(this.PROFILE_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(this.PROFILE_TIMESTAMP_KEY);

      if (cachedProfile && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;

        if (age < maxAge) {
          const profileData = JSON.parse(cachedProfile);

          // Update memory cache with localStorage data
          this.memoryCache = {
            profile: profileData,
            timestamp: timestamp,
            isLoading: false,
          };

          console.log("AccountStorage: Using localStorage cache for profile");
          return profileData;
        } else {
          console.log("AccountStorage: localStorage cache expired, clearing");
          this._clearLocalStorageCache();
        }
      }
    } catch (error) {
      console.error(
        "AccountStorage: Error reading profile from localStorage",
        error,
      );
      this._clearLocalStorageCache();
    }

    return null;
  }

  /**
   * Saves profile data to cache (both memory and localStorage)
   * @param {Object} profileData - Profile data to cache
   */
  saveProfileToCache(profileData) {
    if (!profileData) {
      console.warn(
        "AccountStorage: Attempted to save null/undefined profile data",
      );
      return;
    }

    const timestamp = Date.now();

    // Save to memory cache
    this.memoryCache = {
      profile: profileData,
      timestamp: timestamp,
      isLoading: false,
    };

    // Save to localStorage
    try {
      localStorage.setItem(this.PROFILE_CACHE_KEY, JSON.stringify(profileData));
      localStorage.setItem(this.PROFILE_TIMESTAMP_KEY, timestamp.toString());

      console.log("AccountStorage: Profile data cached successfully", {
        id: profileData.id,
        email: profileData.email,
        timestamp: new Date(timestamp).toISOString(),
      });
    } catch (error) {
      console.error(
        "AccountStorage: Error saving profile to localStorage",
        error,
      );
      // Continue with memory cache even if localStorage fails
    }
  }

  /**
   * Clears all profile cache (memory and localStorage)
   */
  clearProfileCache() {
    // Clear memory cache
    this.memoryCache = {
      profile: null,
      timestamp: null,
      isLoading: false,
    };

    // Clear localStorage cache
    this._clearLocalStorageCache();

    console.log("AccountStorage: All profile cache cleared");
  }

  /**
   * Checks if profile cache is valid
   * @param {number} maxAge - Maximum age of cache in milliseconds
   * @returns {boolean} - True if cache is valid
   */
  isProfileCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    return (
      this._isMemoryCacheValid(maxAge) || this._isLocalStorageCacheValid(maxAge)
    );
  }

  /**
   * Gets cache information for debugging
   * @returns {Object} - Cache state information
   */
  getProfileCacheInfo() {
    const memoryValid = this._isMemoryCacheValid();
    const localStorageValid = this._isLocalStorageCacheValid();

    return {
      memoryCache: {
        hasData: !!this.memoryCache.profile,
        timestamp: this.memoryCache.timestamp,
        age: this.memoryCache.timestamp
          ? Date.now() - this.memoryCache.timestamp
          : null,
        isValid: memoryValid,
        isLoading: this.memoryCache.isLoading,
      },
      localStorage: {
        hasData: !!localStorage.getItem(this.PROFILE_CACHE_KEY),
        timestamp: localStorage.getItem(this.PROFILE_TIMESTAMP_KEY),
        isValid: localStorageValid,
      },
      cacheDuration: this.DEFAULT_CACHE_DURATION,
    };
  }

  /**
   * Sets loading state for cache
   * @param {boolean} isLoading - Loading state
   */
  setProfileCacheLoading(isLoading) {
    this.memoryCache.isLoading = isLoading;
  }

  /**
   * Gets loading state from cache
   * @returns {boolean} - Current loading state
   */
  isProfileCacheLoading() {
    return this.memoryCache.isLoading;
  }

  /**
   * Sets cache duration
   * @param {number} durationMs - Cache duration in milliseconds
   */
  setCacheDuration(durationMs) {
    this.DEFAULT_CACHE_DURATION = durationMs;
    console.log(
      `AccountStorage: Cache duration set to ${durationMs}ms (${durationMs / 1000 / 60} minutes)`,
    );
  }

  /**
   * Saves user preferences to localStorage
   * @param {Object} preferences - User preferences object
   */
  saveUserPreferences(preferences) {
    try {
      localStorage.setItem(
        "WORKERY_USER_PREFERENCES",
        JSON.stringify(preferences),
      );
      console.log("AccountStorage: User preferences saved");
    } catch (error) {
      console.error("AccountStorage: Error saving user preferences", error);
    }
  }

  /**
   * Gets user preferences from localStorage
   * @returns {Object|null} - User preferences or null if not found
   */
  getUserPreferences() {
    try {
      const preferences = localStorage.getItem("WORKERY_USER_PREFERENCES");
      return preferences ? JSON.parse(preferences) : null;
    } catch (error) {
      console.error("AccountStorage: Error reading user preferences", error);
      return null;
    }
  }

  /**
   * Clears user preferences from localStorage
   */
  clearUserPreferences() {
    localStorage.removeItem("WORKERY_USER_PREFERENCES");
    console.log("AccountStorage: User preferences cleared");
  }

  /**
   * Saves temporary form data (for form recovery)
   * @param {string} formKey - Unique form identifier
   * @param {Object} formData - Form data to save
   */
  saveFormData(formKey, formData) {
    try {
      const key = `WORKERY_FORM_DATA_${formKey}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          data: formData,
          timestamp: Date.now(),
        }),
      );
      console.log(`AccountStorage: Form data saved for ${formKey}`);
    } catch (error) {
      console.error("AccountStorage: Error saving form data", error);
    }
  }

  /**
   * Gets temporary form data
   * @param {string} formKey - Unique form identifier
   * @param {number} maxAge - Maximum age in milliseconds (default: 1 hour)
   * @returns {Object|null} - Form data or null if not found/expired
   */
  getFormData(formKey, maxAge = 60 * 60 * 1000) {
    try {
      const key = `WORKERY_FORM_DATA_${formKey}`;
      const stored = localStorage.getItem(key);

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        if (age < maxAge) {
          return parsed.data;
        } else {
          // Clean up expired form data
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error("AccountStorage: Error reading form data", error);
    }

    return null;
  }

  /**
   * Clears temporary form data
   * @param {string} formKey - Unique form identifier
   */
  clearFormData(formKey) {
    const key = `WORKERY_FORM_DATA_${formKey}`;
    localStorage.removeItem(key);
    console.log(`AccountStorage: Form data cleared for ${formKey}`);
  }

  /**
   * Clears all account-related data from storage
   */
  clearAllAccountData() {
    this.clearProfileCache();
    this.clearUserPreferences();

    // Clear all form data
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("WORKERY_FORM_DATA_")) {
        localStorage.removeItem(key);
      }
    });

    console.log("AccountStorage: All account data cleared");
  }

  /**
   * Checks if memory cache is valid
   * @private
   * @param {number} maxAge - Maximum age in milliseconds
   * @returns {boolean}
   */
  _isMemoryCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    if (!this.memoryCache.profile || !this.memoryCache.timestamp) {
      return false;
    }

    const age = Date.now() - this.memoryCache.timestamp;
    return age < maxAge;
  }

  /**
   * Checks if localStorage cache is valid
   * @private
   * @param {number} maxAge - Maximum age in milliseconds
   * @returns {boolean}
   */
  _isLocalStorageCacheValid(maxAge = this.DEFAULT_CACHE_DURATION) {
    try {
      const timestamp = localStorage.getItem(this.PROFILE_TIMESTAMP_KEY);
      const profile = localStorage.getItem(this.PROFILE_CACHE_KEY);

      if (!timestamp || !profile) {
        return false;
      }

      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clears localStorage cache only
   * @private
   */
  _clearLocalStorageCache() {
    localStorage.removeItem(this.PROFILE_CACHE_KEY);
    localStorage.removeItem(this.PROFILE_TIMESTAMP_KEY);
  }
}
