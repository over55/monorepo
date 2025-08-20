// File Path: web/workery-frontend/src/constants/Staff.js
//
export const STAFF_PHONE_TYPE_LANDLINE = 1;
export const STAFF_PHONE_TYPE_MOBILE = 2;
export const STAFF_PHONE_TYPE_WORK = 3;

export const STAFF_ORGANIZATION_TYPE_UNKNOWN = 1;
export const STAFF_ORGANIZATION_TYPE_PRIVATE = 2;
export const STAFF_ORGANIZATION_TYPE_NON_PROFIT = 3;
export const STAFF_ORGANIZATION_TYPE_GOVERNMENT = 4;

export const STAFF_TYPE_EXECUTIVE = 1;
export const STAFF_TYPE_MANAGEMENT = 2;
export const STAFF_TYPE_FRONTLINE = 3;

// Staff type filter options
export const STAFF_TYPE_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Executive" },
  { value: 2, label: "Management" },
  { value: 3, label: "Frontline" },
];

// Staff status filter options
export const STAFF_STATUS_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Active" },
  { value: 2, label: "Archived" },
];

// Staff sort options
export const STAFF_SORT_OPTIONS = [
  { value: "lexical_name,DESC", label: "Name (Z → A)" },
  { value: "lexical_name,ASC", label: "Name (A → Z)" },
  { value: "join_date,DESC", label: "Join Date (Newest → Oldest)" },
  { value: "join_date,ASC", label: "Join Date (Oldest → Newest)" },
  { value: "created_at,DESC", label: "Created (Newest → Oldest)" },
  { value: "created_at,ASC", label: "Created (Oldest → Newest)" },
  { value: "email,ASC", label: "Email (A → Z)" },
  { value: "email,DESC", label: "Email (Z → A)" },
];

// Staff type mapping
export const STAFF_TYPE_MAP = {
  1: "Executive",
  2: "Management",
  3: "Frontline",
};
