// File Path: web/workery-frontend/src/constants/Authentication.js

/**
 * Authentication Token Types
 */
export const AUTH_TOKEN_TYPE = {
  JWT: "JWT",
  BEARER: "Bearer",
};

/**
 * HTTP Headers
 */
export const HTTP_HEADERS = {
  CONTENT_TYPE_JSON: "application/json",
  ACCEPT_JSON: "application/json",
};

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * Authentication Routes
 */
export const AUTH_ROUTES = {
  LOGIN: "/login",
  LOGOUT: "/logout",
  UNAUTHORIZED: "/login?unauthorized=true",
  DASHBOARD_REDIRECT: "/dashboard",
};
