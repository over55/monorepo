// File Path: monorepo/web/frontend/src/constants/Facilitator.js

/**
 * Facilitator Constants
 */

// Facilitator Status Constants
export const FACILITATOR_STATUS_ACTIVE = 1;
export const FACILITATOR_STATUS_ARCHIVED = 2;

// Job Seeker Status
export const FACILITATOR_IS_JOB_SEEKER_YES = 1;
export const FACILITATOR_IS_JOB_SEEKER_NO = 2;

// Gender Options
export const FACILITATOR_GENDER_OTHER = 1;
export const FACILITATOR_GENDER_MALE = 2;
export const FACILITATOR_GENDER_FEMALE = 3;
export const FACILITATOR_GENDER_PREFER_NOT_TO_SAY = 4;

// Identify As Options
export const FACILITATOR_IDENTIFY_AS_OTHER = 1;
export const FACILITATOR_IDENTIFY_AS_PREFER_NOT_TO_SAY = 2;
export const FACILITATOR_IDENTIFY_AS_WOMEN = 3;
export const FACILITATOR_IDENTIFY_AS_NEWCOMER = 4;
export const FACILITATOR_IDENTIFY_AS_RACIALIZED_PERSON = 5;
export const FACILITATOR_IDENTIFY_AS_VETERAN = 6;
export const FACILITATOR_IDENTIFY_AS_FRANCOPHONE = 7;
export const FACILITATOR_IDENTIFY_AS_PERSON_WITH_DISABILITY = 8;
export const FACILITATOR_IDENTIFY_AS_INUIT = 9;
export const FACILITATOR_IDENTIFY_AS_FIRST_NATIONS = 10;
export const FACILITATOR_IDENTIFY_AS_METIS = 11;

// Status in Country Options - These match backend correctly
export const FACILITATOR_STATUS_IN_COUNTRY_OTHER = 1;
export const FACILITATOR_STATUS_IN_COUNTRY_CANADIAN_CITIZEN = 2;
export const FACILITATOR_STATUS_IN_COUNTRY_PERMANENT_RESIDENT = 3;
export const FACILITATOR_STATUS_IN_COUNTRY_NATURALIZED_CITIZEN = 4;
export const FACILITATOR_STATUS_IN_COUNTRY_PROTECTED_PERSON = 5;
export const FACILITATOR_STATUS_IN_COUNTRY_PREFER_NOT_TO_SAY = 6;

// Marital Status Options - FIXED to match backend
export const FACILITATOR_MARITAL_STATUS_OTHER = 1;
export const FACILITATOR_MARITAL_STATUS_MARRIED = 2;
export const FACILITATOR_MARITAL_STATUS_COMMON_LAW = 3;
export const FACILITATOR_MARITAL_STATUS_DIVORCED = 4;
export const FACILITATOR_MARITAL_STATUS_SEPARATED = 5;
export const FACILITATOR_MARITAL_STATUS_WIDOWED = 6;
export const FACILITATOR_MARITAL_STATUS_SINGLE = 7;
export const FACILITATOR_MARITAL_STATUS_PREFER_NOT_TO_SAY = 8;

// Education Level Options - FIXED to match backend
export const FACILITATOR_EDUCATION_OTHER = 1;
export const FACILITATOR_EDUCATION_GRADE_0_TO_8 = 2;
export const FACILITATOR_EDUCATION_GRADE_9 = 3;
export const FACILITATOR_EDUCATION_GRADE_10 = 4;
export const FACILITATOR_EDUCATION_GRADE_11 = 5;
export const FACILITATOR_EDUCATION_GRADE_12_OR_EQUIVALENT = 6;
export const FACILITATOR_EDUCATION_OAC = 7;
export const FACILITATOR_EDUCATION_CERTIFICATE_OF_APPRENTICESHIP = 8;
export const FACILITATOR_EDUCATION_JOURNEYPERSON = 9;
export const FACILITATOR_EDUCATION_CERTIFICATE_OR_DIPLOMA = 10;
export const FACILITATOR_EDUCATION_BACHELORS_DEGREE = 11;
export const FACILITATOR_EDUCATION_POST_GRADUATE = 12;

export const FACILITATOR_PHONE_TYPE_LANDLINE = 1;
export const FACILITATOR_PHONE_TYPE_MOBILE = 2;
export const FACILITATOR_PHONE_TYPE_WORK = 3;

// Constants for filtering and sorting
export const FACILITATOR_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "1", label: "Active" },
  { value: "0", label: "Archived" },
];

export const FACILITATOR_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "0", label: "All" },
  { value: "1", label: "Individual" },
  { value: "2", label: "Representative" },
];

export const FACILITATOR_SORT_OPTIONS = [
  { value: "lexical_name,ASC", label: "Name (A → Z)" },
  { value: "lexical_name,DESC", label: "Name (Z → A)" },
  { value: "join_date,DESC", label: "Join Date (Newest → Oldest)" },
  { value: "join_date,ASC", label: "Join Date (Oldest → Newest)" },
];

export const PAGE_SIZE_OPTIONS = [
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
  { value: 250, label: "250 per page" },
];

export const REPRESENTATIVE_FACILITATOR_TYPE_OF_ID = 2;
export const INDIVIDUAL_FACILITATOR_TYPE_OF_ID = 1;

// Add these option arrays for use in forms
export const FACILITATOR_STATUS_IN_COUNTRY_OPTIONS_WITH_EMPTY_OPTIONS = [
  { value: 0, label: "Please select" },
  {
    value: FACILITATOR_STATUS_IN_COUNTRY_CANADIAN_CITIZEN,
    label: "Canadian Citizen",
  },
  {
    value: FACILITATOR_STATUS_IN_COUNTRY_PERMANENT_RESIDENT,
    label: "Permanent Resident",
  },
  {
    value: FACILITATOR_STATUS_IN_COUNTRY_NATURALIZED_CITIZEN,
    label: "Naturalized Canadian Citizen",
  },
  {
    value: FACILITATOR_STATUS_IN_COUNTRY_PROTECTED_PERSON,
    label: "Protected Person",
  },
  { value: FACILITATOR_STATUS_IN_COUNTRY_OTHER, label: "Other" },
  {
    value: FACILITATOR_STATUS_IN_COUNTRY_PREFER_NOT_TO_SAY,
    label: "Prefer not to say",
  },
];

export const FACILITATOR_MARITAL_STATUS_OPTIONS_WITH_EMPTY_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: FACILITATOR_MARITAL_STATUS_MARRIED, label: "Married" },
  { value: FACILITATOR_MARITAL_STATUS_COMMON_LAW, label: "Common Law" },
  { value: FACILITATOR_MARITAL_STATUS_DIVORCED, label: "Divorced" },
  { value: FACILITATOR_MARITAL_STATUS_SEPARATED, label: "Separated" },
  { value: FACILITATOR_MARITAL_STATUS_WIDOWED, label: "Widowed" },
  { value: FACILITATOR_MARITAL_STATUS_SINGLE, label: "Single" },
  {
    value: FACILITATOR_MARITAL_STATUS_PREFER_NOT_TO_SAY,
    label: "Prefer not to say",
  },
  { value: FACILITATOR_MARITAL_STATUS_OTHER, label: "Other" },
];

export const FACILITATOR_ACCOMPLISHED_EDUCATION_OPTIONS_WITH_EMPTY_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: FACILITATOR_EDUCATION_GRADE_0_TO_8, label: "Grade 0-8" },
  { value: FACILITATOR_EDUCATION_GRADE_9, label: "Grade 9" },
  { value: FACILITATOR_EDUCATION_GRADE_10, label: "Grade 10" },
  { value: FACILITATOR_EDUCATION_GRADE_11, label: "Grade 11" },
  {
    value: FACILITATOR_EDUCATION_GRADE_12_OR_EQUIVALENT,
    label: "Grade 12 (or equivalent)",
  },
  { value: FACILITATOR_EDUCATION_OAC, label: "OAC" },
  {
    value: FACILITATOR_EDUCATION_CERTIFICATE_OF_APPRENTICESHIP,
    label: "Certificate of Apprenticeship",
  },
  { value: FACILITATOR_EDUCATION_JOURNEYPERSON, label: "Journeyperson" },
  {
    value: FACILITATOR_EDUCATION_CERTIFICATE_OR_DIPLOMA,
    label: "Certificate/Diploma",
  },
  { value: FACILITATOR_EDUCATION_BACHELORS_DEGREE, label: "Bachelor's Degree" },
  { value: FACILITATOR_EDUCATION_POST_GRADUATE, label: "Post Graduate" },
  { value: FACILITATOR_EDUCATION_OTHER, label: "Other" },
];

export const FACILITATOR_STATUS_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Active" },
  { value: 2, label: "Archived" },
];

export const FACILITATOR_TYPE_OF_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: INDIVIDUAL_FACILITATOR_TYPE_OF_ID, label: "Individual" },
  { value: REPRESENTATIVE_FACILITATOR_TYPE_OF_ID, label: "Representative" },
];

export const FACILITATOR_PHONE_TYPE_OF_OPTIONS = [
  { value: FACILITATOR_PHONE_TYPE_LANDLINE, label: "Landline" },
  { value: FACILITATOR_PHONE_TYPE_MOBILE, label: "Mobile" },
  { value: FACILITATOR_PHONE_TYPE_WORK, label: "Work" },
];

export const FACILITATOR_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS = [
  { value: 0, label: "Please select" }, // EMPTY OPTION
  ...FACILITATOR_PHONE_TYPE_OF_OPTIONS,
];

// Facilitator Level Constants
export const FACILITATOR_LEVEL_IN_TRAINING = 1;
export const FACILITATOR_LEVEL_SECONDARY_FACILITATOR = 2;
export const FACILITATOR_LEVEL_LEAD_FACILITATOR = 3;
export const FACILITATOR_LEVEL_TRAINER = 4;

export const FACILITATOR_LEVEL_OPTIONS = [
  { value: "", label: "Select a level" },
  { value: "1", label: "Level 1 (in training)" },
  { value: "2", label: "Level 2 (secondary facilitator)" },
  { value: "3", label: "Level 3 (lead facilitator)" },
  { value: "4", label: "Level 4 (trainer)" },
];

// Facilitator Type (for upgrade/downgrade)
export const FACILITATOR_TYPE_UNASSIGNED = 1;
export const FACILITATOR_TYPE_RESIDENTIAL = 2;
export const FACILITATOR_TYPE_BUSINESS = 3;

// Facilitator Organization Type Constants
export const FACILITATOR_ORGANIZATION_TYPE_PRIVATE = 1;
export const FACILITATOR_ORGANIZATION_TYPE_NON_PROFIT = 2;
export const FACILITATOR_ORGANIZATION_TYPE_GOVERNMENT = 3;

export const FACILITATOR_ORGANIZATION_TYPE_OPTIONS = [
  { value: "", label: "Please select" },
  { value: "1", label: "Private" },
  { value: "2", label: "Non-Profit" },
  { value: "3", label: "Government" },
];
