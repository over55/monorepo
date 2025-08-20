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

export const UNASSIGNED_STAFF_TYPE_OF_ID = 1;
export const RESIDENTIAL_STAFF_TYPE_OF_ID = 2;
export const COMMERCIAL_STAFF_TYPE_OF_ID = 3;

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

export const STAFF_PHONE_TYPE_OF_OPTIONS = [
  { value: STAFF_PHONE_TYPE_LANDLINE, label: "Landline" },
  { value: STAFF_PHONE_TYPE_MOBILE, label: "Mobile" },
  { value: STAFF_PHONE_TYPE_WORK, label: "Work" },
];

export const STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS = [
  { value: 0, label: "Please select" }, // EMPTY OPTION
  ...STAFF_PHONE_TYPE_OF_OPTIONS,
];

export const STAFF_ORGANIZATION_TYPE_OPTIONS = [
  { value: STAFF_ORGANIZATION_TYPE_PRIVATE, label: "Private" },
  { value: STAFF_ORGANIZATION_TYPE_NON_PROFIT, label: "Non-profit" },
  { value: STAFF_ORGANIZATION_TYPE_GOVERNMENT, label: "Government" },
];

export const STAFF_ORGANIZATION_TYPE_OPTIONS_WITH_EMPTY_OPTIONS = [
  { value: 0, label: "Please select" }, // EMPTY OPTION
  ...STAFF_ORGANIZATION_TYPE_OPTIONS,
];

// Gender constant for Staff (similar to Associate)
export const STAFF_GENDER_OTHER = 1;
export const STAFF_GENDER_MALE = 2;
export const STAFF_GENDER_FEMALE = 3;
export const STAFF_GENDER_PREFER_NOT_TO_SAY = 4;
