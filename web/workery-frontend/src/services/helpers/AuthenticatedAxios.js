// File Path: web/workery-frontend/src/services/Helpers/AuthenticatedAxios.js

import axios from "axios";
import { camelizeKeys } from "humps";
import { API_ENDPOINTS } from "../Config/APIConfig";
import {
  AUTH_TOKEN_TYPE,
  HTTP_HEADERS,
  HTTP_STATUS,
} from "../../constants/Authentication";

/**
 * Creates an authenticated Axios instance with automatic token refresh
 * Based on the original customAxios.js functionality
 */
export function createAuthenticatedAxios(
  baseURL,
  tokenStorage,
  onUnauthorizedCallback = null,
) {
  // Get current access token
  const accessToken = tokenStorage.getAccessToken();

  // Create authenticated axios instance
  const authenticatedAxios = axios.create({
    baseURL: baseURL,
    headers: {
      Authorization: `${AUTH_TOKEN_TYPE.JWT} ${accessToken}`,
      "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON,
      Accept: HTTP_HEADERS.ACCEPT_JSON,
    },
  });

  // Add response interceptor for automatic token refresh
  authenticatedAxios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalConfig = error.config;

      // Handle 401 unauthorized errors
      if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
        const refreshToken = tokenStorage.getRefreshToken();

        if (refreshToken) {
          try {
            // Attempt to refresh the token
            const refreshResponse = await handleTokenRefresh(
              baseURL,
              refreshToken,
            );

            if (refreshResponse && refreshResponse.status === HTTP_STATUS.OK) {
              // Extract new tokens
              const newAccessToken = refreshResponse.data.access_token;
              const newRefreshToken = refreshResponse.data.refresh_token;

              // Save new tokens
              tokenStorage.setAccessToken(newAccessToken);
              tokenStorage.setRefreshToken(newRefreshToken);

              // Update the original request with new token
              const retryConfig = {
                ...originalConfig,
                headers: {
                  ...originalConfig.headers,
                  Authorization: `${AUTH_TOKEN_TYPE.JWT} ${newAccessToken}`,
                },
              };

              // Retry the original request
              return authenticatedAxios(retryConfig);
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);

            // If refresh fails with 401, call unauthorized callback
            if (
              refreshError.response?.status === HTTP_STATUS.UNAUTHORIZED &&
              onUnauthorizedCallback
            ) {
              onUnauthorizedCallback();
            }
          }
        } else if (onUnauthorizedCallback) {
          // No refresh token available, call unauthorized callback
          onUnauthorizedCallback();
        }
      }

      // Return the error data in a consistent format
      return Promise.reject(error.response?.data || error);
    },
  );

  return authenticatedAxios;
}

/**
 * Handles token refresh API call
 * @private
 */
async function handleTokenRefresh(baseURL, refreshToken) {
  const refreshAxios = axios.create({
    baseURL: baseURL,
    headers: {
      "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON,
      Accept: HTTP_HEADERS.ACCEPT_JSON,
      Authorization: `${AUTH_TOKEN_TYPE.BEARER} ${refreshToken}`,
    },
  });

  const refreshData = {
    value: refreshToken,
  };

  try {
    const response = await refreshAxios.post(
      API_ENDPOINTS.REFRESH_TOKEN,
      refreshData,
    );
    return response;
  } catch (error) {
    console.error("Token refresh request failed:", error);
    throw error;
  }
}
