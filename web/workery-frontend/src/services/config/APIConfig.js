/**
 * API Configuration - Simple Vite version
 */

// Base API configuration
export const API_BASE_PATH = "/api/v1";

/**
 * Gets the API base URL from Vite environment variables
 */
export function getAPIBaseURL() {
  const protocol = import.meta.env.VITE_API_PROTOCOL;
  const domain = import.meta.env.VITE_API_DOMAIN;
  return `${protocol}://${domain}${API_BASE_PATH}`;
}

/**
 * Gets the HTTP API Server base URL (without API path)
 */
export function getHTTPAPIServer() {
  const protocol = import.meta.env.VITE_API_PROTOCOL;
  const domain = import.meta.env.VITE_API_DOMAIN;
  return `${protocol}://${domain}`;
}

/**
 * Gets the app base URL (frontend URL)
 */
export function getAppBaseURL() {
  const protocol = import.meta.env.VITE_WWW_PROTOCOL;
  const domain = import.meta.env.VITE_WWW_DOMAIN;
  return `${protocol}://${domain}`;
}

/**
 * Environment configuration
 */
export const ENV_CONFIG = {
  API_PROTOCOL: import.meta.env.VITE_API_PROTOCOL,
  API_DOMAIN: import.meta.env.VITE_API_DOMAIN,
  WWW_PROTOCOL: import.meta.env.VITE_WWW_PROTOCOL,
  WWW_DOMAIN: import.meta.env.VITE_WWW_DOMAIN,
  DEV_MODE: import.meta.env.VITE_DEV_MODE === "true",
  MODE: import.meta.env.MODE,
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
};

/**
 * API Endpoints configuration
 */
export const API_ENDPOINTS = {
  // Authentication endpoints
  LOGIN: "/login",
  LOGOUT: "/logout",
  REFRESH_TOKEN: "/refresh-token",
  FORGOT_PASSWORD: "/forgot-password",
  PASSWORD_RESET: "/password-reset",

  // Gateway endpoints
  VERSION: "/version",
  DASHBOARD: "/dashboard",
  EXECUTIVE_VISITS_TENANT: "/executive-visit-tenant",

  // 2FA endpoints
  GENERATE_OTP: "/otp/generate",
  GENERATE_OTP_QR: "/otp/generate-qr-code",
  VERIFY_OTP: "/otp/verify",
  VALIDATE_OTP: "/otp/validate",
  DISABLE_OTP: "/otp/disable",
  RECOVERY_OTP: "/otp/recovery",
};

/**
 * Gets full API URLs (when you need complete URLs)
 */
export function getFullAPIUrls() {
  const httpServer = getHTTPAPIServer();
  const basePath = API_BASE_PATH;

  return {
    LOGIN: `${httpServer}${basePath}${API_ENDPOINTS.LOGIN}`,
    LOGOUT: `${httpServer}${basePath}${API_ENDPOINTS.LOGOUT}`,
    REFRESH_TOKEN: `${httpServer}${basePath}${API_ENDPOINTS.REFRESH_TOKEN}`,
    DASHBOARD: `${httpServer}${basePath}${API_ENDPOINTS.DASHBOARD}`,
  };
}

/**
 * Debug helper - logs current configuration in development
 */
export function logAPIConfig() {
  if (ENV_CONFIG.IS_DEVELOPMENT) {
    console.group("🔧 API Configuration");
    console.log("API Base URL:", getAPIBaseURL());
    console.log("App Base URL:", getAppBaseURL());
    console.log("Environment:", ENV_CONFIG.MODE);
    console.log("Dev Mode:", ENV_CONFIG.DEV_MODE);
    console.groupEnd();
  }
}
