// File Path: web/workery-frontend/src/constants/Customer.js

export const UNASSIGNED_CUSTOMER_TYPE_OF_ID = 1;
export const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 2;
export const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;

// Constants for filtering and sorting
export const CUSTOMER_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "1", label: "Active" },
  { value: "2", label: "Inactive" },
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

export const CLIENT_PHONE_TYPE_WORK = 1;
