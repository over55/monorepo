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
  [EXECUTIVE_ROLE_ID]: "/root/dashboard",
  [MANAGEMENT_ROLE_ID]: "/admin/dashboard",
  [FRONTLINE_ROLE_ID]: "/admin/dashboard",
  [ASSOCIATE_ROLE_ID]: "/a/dashboard",
  [CUSTOMER_ROLE_ID]: "/c/dashboard",
  [ASSOCIATE_JOB_SEEKER_ROLE_ID]: "/js/dashboard",
};

/**
 * Gets the redirect path for a given role
 * @param {number|string} roleId - The role ID (handles both number and string)
 * @returns {string} - The redirect path, defaults to /501 for unknown roles
 */
export function getRoleRedirectPath(roleId) {
  // Convert to number to handle string inputs from API
  const numericRoleId =
    typeof roleId === "string" ? parseInt(roleId, 10) : roleId;

  // Log for debugging
  if (process.env.NODE_ENV === "development") {
    console.log("getRoleRedirectPath:", {
      originalRoleId: roleId,
      originalType: typeof roleId,
      numericRoleId: numericRoleId,
      foundPath: ROLE_REDIRECT_PATHS[numericRoleId],
      allPaths: ROLE_REDIRECT_PATHS,
    });
  }

  return ROLE_REDIRECT_PATHS[numericRoleId] || "/501";
}

/**
 * Gets the role name for a given role ID
 * @param {number|string} roleId - The role ID (handles both number and string)
 * @returns {string} - The role name, defaults to "Unknown" for unknown roles
 */
export function getRoleName(roleId) {
  // Convert to number to handle string inputs from API
  const numericRoleId =
    typeof roleId === "string" ? parseInt(roleId, 10) : roleId;
  return ROLE_NAMES[numericRoleId] || "Unknown";
}

/**
 * Checks if a role ID is valid
 * @param {number|string} roleId - The role ID to check (handles both number and string)
 * @returns {boolean} - True if the role ID is valid
 */
export function isValidRole(roleId) {
  // Convert to number to handle string inputs from API
  const numericRoleId =
    typeof roleId === "string" ? parseInt(roleId, 10) : roleId;
  return Object.keys(ROLE_NAMES).includes(String(numericRoleId));
}
