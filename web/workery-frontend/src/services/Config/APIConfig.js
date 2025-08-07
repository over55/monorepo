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

  // Customer endpoints (renamed from Client)
  CUSTOMERS: "/customers",
  CUSTOMER_DETAIL: "/customer/{id}",
  CUSTOMER_COUNT: "/customers/count",
  CUSTOMER_ARCHIVE_OPERATION: "/customers/operation/archive",
  CUSTOMER_CREATE_COMMENT_OPERATION: "/customers/operation/create-comment",
  CUSTOMER_UPGRADE_OPERATION: "/customers/operation/upgrade",
  CUSTOMER_DOWNGRADE_OPERATION: "/customers/operation/downgrade",
  CUSTOMER_AVATAR_OPERATION: "/customers/operation/avatar",
  CUSTOMER_CHANGE_PASSWORD_OPERATION: "/customers/operations/change-password",
  CUSTOMER_CHANGE_2FA_OPERATION: "/customers/operations/change-2fa",
  CUSTOMER_BAN_OPERATION: "/customers/operations/ban",
  CUSTOMER_UNBAN_OPERATION: "/customers/operations/unban",

  // Vehicle Type endpoints
  VEHICLE_TYPES: "/vehicle-types",
  VEHICLE_TYPE_DETAIL: "/vehicle-type/{id}",
  VEHICLE_TYPE_SELECT_OPTIONS: "/vehicle-types/select-options",

  // Tag endpoints
  TAGS: "/tags",
  TAG_DETAIL: "/tag/{id}",
  TAG_SELECT_OPTIONS: "/tags/select-options",

  // Skill Set endpoints
  SKILL_SETS: "/skill-sets",
  SKILL_SET_DETAIL: "/skill-set/{id}",
  SKILL_SET_SELECT_OPTIONS: "/skill-sets/select-options",

  // National Occupational Classification endpoints
  NATIONAL_OCCUPATIONAL_CLASSIFICATIONS:
    "/national-occupational-classifications",
  NATIONAL_OCCUPATIONAL_CLASSIFICATION_DETAIL:
    "/national-occupational-classification/{id}",
  NATIONAL_OCCUPATIONAL_CLASSIFICATION_SELECT_OPTIONS:
    "/national-occupational-classifications/select-options",

  // North America Industry Classification System endpoints
  NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEMS:
    "/north-america-industry-classification-systems",
  NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEM_DETAIL:
    "/north-america-industry-classification-system/{id}",
  NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEM_SELECT_OPTIONS:
    "/north-america-industry-classification-systems/select-options",

  // Insurance Requirement endpoints
  INSURANCE_REQUIREMENTS: "/insurance-requirements",
  INSURANCE_REQUIREMENT_DETAIL: "/insurance-requirement/{id}",
  INSURANCE_REQUIREMENT_SELECT_OPTIONS:
    "/insurance-requirements/select-options",

  // Service Fee endpoints
  SERVICE_FEES: "/service-fees",
  SERVICE_FEE_DETAIL: "/service-fee/{id}",
  SERVICE_FEE_SELECT_OPTIONS: "/service-fees/select-options",

  // Comment endpoints
  COMMENTS: "/comments",

  // Bulletin endpoints
  BULLETINS: "/bulletins",
  BULLETIN_DETAIL: "/bulletin/{id}",
  BULLETIN_ARCHIVE_OPERATION: "/bulletins/operation/archive",

  // Associate Away Log endpoints
  ASSOCIATE_AWAY_LOGS: "/associate-away-logs",
  ASSOCIATE_AWAY_LOG_DETAIL: "/associate-away-log/{id}",
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
    CUSTOMERS: `${httpServer}${basePath}${API_ENDPOINTS.CUSTOMERS}`,
    CUSTOMER_DETAIL: `${httpServer}${basePath}${API_ENDPOINTS.CUSTOMER_DETAIL}`,
    CUSTOMER_COUNT: `${httpServer}${basePath}${API_ENDPOINTS.CUSTOMER_COUNT}`,
    CUSTOMER_ARCHIVE_OPERATION: `${httpServer}${basePath}${API_ENDPOINTS.CUSTOMER_ARCHIVE_OPERATION}`,
    CUSTOMER_CREATE_COMMENT_OPERATION: `${httpServer}${basePath}${API_ENDPOINTS.CUSTOMER_CREATE_COMMENT_OPERATION}`,
    CUSTOMER_UPGRADE_OPERATION: `${httpServer}${basePath}${API_ENDPOINTS.CUSTOMER_UPGRADE_OPERATION}`,
    CUSTOMER_DOWNGRADE_OPERATION: `${httpServer}${basePath}${API_ENDPOINTS.CUSTOMER_DOWNGRADE_OPERATION}`,
    CUSTOMER_AVATAR_OPERATION: `${httpServer}${basePath}${API_ENDPOINTS.CUSTOMER_AVATAR_OPERATION}`,
    CUSTOMER_CHANGE_PASSWORD_OPERATION: `${httpServer}${basePath}${API_ENDPOINTS.CUSTOMER_CHANGE_PASSWORD_OPERATION}`,
    CUSTOMER_CHANGE_2FA_OPERATION: `${httpServer}${basePath}${API_ENDPOINTS.CUSTOMER_CHANGE_2FA_OPERATION}`,
    CUSTOMER_BAN_OPERATION: `${httpServer}${basePath}${API_ENDPOINTS.CUSTOMER_BAN_OPERATION}`,
    CUSTOMER_UNBAN_OPERATION: `${httpServer}${basePath}${API_ENDPOINTS.CUSTOMER_UNBAN_OPERATION}`,
    VEHICLE_TYPES: `${httpServer}${basePath}${API_ENDPOINTS.VEHICLE_TYPES}`,
    VEHICLE_TYPE_DETAIL: `${httpServer}${basePath}${API_ENDPOINTS.VEHICLE_TYPE_DETAIL}`,
    VEHICLE_TYPE_SELECT_OPTIONS: `${httpServer}${basePath}${API_ENDPOINTS.VEHICLE_TYPE_SELECT_OPTIONS}`,
    TAGS: `${httpServer}${basePath}${API_ENDPOINTS.TAGS}`,
    TAG_DETAIL: `${httpServer}${basePath}${API_ENDPOINTS.TAG_DETAIL}`,
    TAG_SELECT_OPTIONS: `${httpServer}${basePath}${API_ENDPOINTS.TAG_SELECT_OPTIONS}`,
    SKILL_SETS: `${httpServer}${basePath}${API_ENDPOINTS.SKILL_SETS}`,
    SKILL_SET_DETAIL: `${httpServer}${basePath}${API_ENDPOINTS.SKILL_SET_DETAIL}`,
    SKILL_SET_SELECT_OPTIONS: `${httpServer}${basePath}${API_ENDPOINTS.SKILL_SET_SELECT_OPTIONS}`,
    NATIONAL_OCCUPATIONAL_CLASSIFICATIONS: `${httpServer}${basePath}${API_ENDPOINTS.NATIONAL_OCCUPATIONAL_CLASSIFICATIONS}`,
    NATIONAL_OCCUPATIONAL_CLASSIFICATION_DETAIL: `${httpServer}${basePath}${API_ENDPOINTS.NATIONAL_OCCUPATIONAL_CLASSIFICATION_DETAIL}`,
    NATIONAL_OCCUPATIONAL_CLASSIFICATION_SELECT_OPTIONS: `${httpServer}${basePath}${API_ENDPOINTS.NATIONAL_OCCUPATIONAL_CLASSIFICATION_SELECT_OPTIONS}`,
    NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEMS: `${httpServer}${basePath}${API_ENDPOINTS.NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEMS}`,
    NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEM_DETAIL: `${httpServer}${basePath}${API_ENDPOINTS.NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEM_DETAIL}`,
    NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEM_SELECT_OPTIONS: `${httpServer}${basePath}${API_ENDPOINTS.NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEM_SELECT_OPTIONS}`,
    INSURANCE_REQUIREMENTS: `${httpServer}${basePath}${API_ENDPOINTS.INSURANCE_REQUIREMENTS}`,
    INSURANCE_REQUIREMENT_DETAIL: `${httpServer}${basePath}${API_ENDPOINTS.INSURANCE_REQUIREMENT_DETAIL}`,
    INSURANCE_REQUIREMENT_SELECT_OPTIONS: `${httpServer}${basePath}${API_ENDPOINTS.INSURANCE_REQUIREMENT_SELECT_OPTIONS}`,
    SERVICE_FEES: `${httpServer}${basePath}${API_ENDPOINTS.SERVICE_FEES}`,
    SERVICE_FEE_DETAIL: `${httpServer}${basePath}${API_ENDPOINTS.SERVICE_FEE_DETAIL}`,
    SERVICE_FEE_SELECT_OPTIONS: `${httpServer}${basePath}${API_ENDPOINTS.SERVICE_FEE_SELECT_OPTIONS}`,
    COMMENTS: `${httpServer}${basePath}${API_ENDPOINTS.COMMENTS}`,
    BULLETINS: `${httpServer}${basePath}${API_ENDPOINTS.BULLETINS}`,
    BULLETIN_DETAIL: `${httpServer}${basePath}${API_ENDPOINTS.BULLETIN_DETAIL}`,
    BULLETIN_ARCHIVE_OPERATION: `${httpServer}${basePath}${API_ENDPOINTS.BULLETIN_ARCHIVE_OPERATION}`,
    ASSOCIATE_AWAY_LOGS: `${httpServer}${basePath}${API_ENDPOINTS.ASSOCIATE_AWAY_LOGS}`,
    ASSOCIATE_AWAY_LOG_DETAIL: `${httpServer}${basePath}${API_ENDPOINTS.ASSOCIATE_AWAY_LOG_DETAIL}`,
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
