// File Path: web/workery-frontend/src/constants/Customer.js

export const UNASSIGNED_CUSTOMER_TYPE_OF_ID = 1;
export const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 2;
export const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;

// Phone Type Constants
export const CLIENT_PHONE_TYPE_LANDLINE = 1;
export const CLIENT_PHONE_TYPE_MOBILE = 2;
export const CLIENT_PHONE_TYPE_WORK = 3;
export const CUSTOMER_PHONE_TYPE_WORK = 3;

export const CUSTOMER_STATUS_ACTIVE = 1;
export const CUSTOMER_STATUS_INACTIVE = 2;

// Customer status object (for components that expect object format)
export const CUSTOMER_STATUS = {
  ACTIVE: CUSTOMER_STATUS_ACTIVE,
  INACTIVE: CUSTOMER_STATUS_INACTIVE,
  ARCHIVED: CUSTOMER_STATUS_INACTIVE, // Alias for compatibility
};

// Constants for filtering and sorting
export const CUSTOMER_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: String(CUSTOMER_STATUS_ACTIVE), label: "Active" },
  { value: String(CUSTOMER_STATUS_INACTIVE), label: "Inactive" },
];

export const CUSTOMER_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "1", label: "Unassigned" },
  { value: "2", label: "Residential" },
  { value: "3", label: "Commercial" },
];

export const CUSTOMER_SORT_OPTIONS = [
  { value: "lexical_name,ASC", label: "Name (A-Z)" },
  { value: "lexical_name,DESC", label: "Name (Z-A)" },
  // { value: "join_date,DESC", label: "Newest First" }, // Deprecated
  // { value: "join_date,ASC", label: "Oldest First" },  // Deprecated
];

export const PAGE_SIZE_OPTIONS = [
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
];

// Deactivation reason constants
export const CUSTOMER_DEACTIVATION_REASON_MAP = {
  1: "Other",
  2: "Blacklisted",
  3: "Moved",
  4: "Deceased",
  5: "Do not contact",
  6: "Duplicate",
  7: "Other",
};
