// File Path: monorepo/web/workery-frontend/src/services/Config/APIConfig.js

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

  // Account endpoints
  ACCOUNT_PROFILE: "/profile",
  ACCOUNT_CHANGE_PASSWORD: "/profile/change-password",
  ACCOUNT_AVATAR: "/account/operation/avatar",

  // Tenant endpoints
  TENANTS: "/tenants",
  TENANT_DETAIL: "/tenant/{id}",
  TENANT_UPDATE_TAX_RATE: "/tenants/operations/update-tax-rate",

  // Vehicle Type endpoints
  VEHICLE_TYPES: "/vehicle-types",
  VEHICLE_TYPE_DETAIL: "/vehicle-type/{id}",
  VEHICLE_TYPE_SELECT_OPTIONS: "/vehicle-types/operation/select-options",
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
    FORGOT_PASSWORD: `${httpServer}${basePath}${API_ENDPOINTS.FORGOT_PASSWORD}`,
    PASSWORD_RESET: `${httpServer}${basePath}${API_ENDPOINTS.PASSWORD_RESET}`,
    VERSION: `${httpServer}${basePath}${API_ENDPOINTS.VERSION}`,
    DASHBOARD: `${httpServer}${basePath}${API_ENDPOINTS.DASHBOARD}`,
    EXECUTIVE_VISITS_TENANT: `${httpServer}${basePath}${API_ENDPOINTS.EXECUTIVE_VISITS_TENANT}`,
    ACCOUNT_PROFILE: `${httpServer}${basePath}${API_ENDPOINTS.ACCOUNT_PROFILE}`,
    ACCOUNT_CHANGE_PASSWORD: `${httpServer}${basePath}${API_ENDPOINTS.ACCOUNT_CHANGE_PASSWORD}`,
    ACCOUNT_AVATAR: `${httpServer}${basePath}${API_ENDPOINTS.ACCOUNT_AVATAR}`,
    TENANTS: `${httpServer}${basePath}${API_ENDPOINTS.TENANTS}`,
    TENANT_DETAIL: `${httpServer}${basePath}${API_ENDPOINTS.TENANT_DETAIL}`,
    TENANT_UPDATE_TAX_RATE: `${httpServer}${basePath}${API_ENDPOINTS.TENANT_UPDATE_TAX_RATE}`,
    VEHICLE_TYPES: `${httpServer}${basePath}${API_ENDPOINTS.VEHICLE_TYPES}`,
    VEHICLE_TYPE_DETAIL: `${httpServer}${basePath}${API_ENDPOINTS.VEHICLE_TYPE_DETAIL}`,
    VEHICLE_TYPE_SELECT_OPTIONS: `${httpServer}${basePath}${API_ENDPOINTS.VEHICLE_TYPE_SELECT_OPTIONS}`,
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
