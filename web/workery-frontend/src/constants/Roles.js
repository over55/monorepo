// File Path: monorepo/web/workery-frontend/src/constants/Roles.js

/**
 * Role constants matching the backend role system
 * These should match the role IDs used in the API
 */

export const EXECUTIVE_ROLE_ID = 1;
export const MANAGEMENT_ROLE_ID = 2;
export const FRONTLINE_ROLE_ID = 3;
export const ASSOCIATE_ROLE_ID = 4;
export const CUSTOMER_ROLE_ID = 5;
export const ASSOCIATE_JOB_SEEKER_ROLE_ID = 6;

// Additional role-related constants
export const ASSOCIATE_IS_JOB_SEEKER_YES = 1;
export const ASSOCIATE_IS_JOB_SEEKER_NO = 2;

/**
 * Role name mappings for display purposes
 */
export const ROLE_NAMES = {
  [EXECUTIVE_ROLE_ID]: "Executive",
  [MANAGEMENT_ROLE_ID]: "Management",
  [FRONTLINE_ROLE_ID]: "Frontline",
  [ASSOCIATE_ROLE_ID]: "Associate",
  [CUSTOMER_ROLE_ID]: "Customer",
  [ASSOCIATE_JOB_SEEKER_ROLE_ID]: "Associate Job Seeker",
};

/**
 * Default redirect paths for each role after login
 */
export const ROLE_REDIRECT_PATHS = {
  [EXECUTIVE_ROLE_ID]: "/root/tenants",
  [MANAGEMENT_ROLE_ID]: "/admin/dashboard",
  [FRONTLINE_ROLE_ID]: "/admin/dashboard",
  [ASSOCIATE_ROLE_ID]: "/a/dashboard",
  [CUSTOMER_ROLE_ID]: "/c/dashboard",
  [ASSOCIATE_JOB_SEEKER_ROLE_ID]: "/js/dashboard",
};

/**
 * Gets the redirect path for a given role
 * @param {number} roleId - The role ID
 * @returns {string} - The redirect path, defaults to /501 for unknown roles
 */
export function getRoleRedirectPath(roleId) {
  return ROLE_REDIRECT_PATHS[roleId] || "/501";
}

/**
 * Gets the role name for a given role ID
 * @param {number} roleId - The role ID
 * @returns {string} - The role name, defaults to "Unknown" for unknown roles
 */
export function getRoleName(roleId) {
  return ROLE_NAMES[roleId] || "Unknown";
}

/**
 * Checks if a role ID is valid
 * @param {number} roleId - The role ID to check
 * @returns {boolean} - True if the role ID is valid
 */
export function isValidRole(roleId) {
  return Object.keys(ROLE_NAMES).includes(String(roleId));
}
