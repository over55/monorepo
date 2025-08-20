// File Path: web/workery-frontend/src/constants/Associate.js

/**
 * Associate Constants
 */

export const ASSOCIATE_STATUS_ACTIVE = 1;

// Job Seeker Status
export const ASSOCIATE_IS_JOB_SEEKER_YES = 1;
export const ASSOCIATE_IS_JOB_SEEKER_NO = 2;

// Gender Options
export const ASSOCIATE_GENDER_OTHER = 1;
export const ASSOCIATE_GENDER_MALE = 2;
export const ASSOCIATE_GENDER_FEMALE = 3;
export const ASSOCIATE_GENDER_PREFER_NOT_TO_SAY = 4;

// Identify As Options
export const ASSOCIATE_IDENTIFY_AS_OTHER = 1;
export const ASSOCIATE_IDENTIFY_AS_PREFER_NOT_TO_SAY = 2;
export const ASSOCIATE_IDENTIFY_AS_WOMEN = 3;
export const ASSOCIATE_IDENTIFY_AS_NEWCOMER = 4;
export const ASSOCIATE_IDENTIFY_AS_RACIALIZED_PERSON = 5;
export const ASSOCIATE_IDENTIFY_AS_VETERAN = 6;
export const ASSOCIATE_IDENTIFY_AS_FRANCOPHONE = 7;
export const ASSOCIATE_IDENTIFY_AS_PERSON_WITH_DISABILITY = 8;
export const ASSOCIATE_IDENTIFY_AS_INUIT = 9;
export const ASSOCIATE_IDENTIFY_AS_FIRST_NATIONS = 10;
export const ASSOCIATE_IDENTIFY_AS_METIS = 11;

// Status in Country Options
export const ASSOCIATE_STATUS_IN_COUNTRY_CANADIAN_CITIZEN = "canadian_citizen";
export const ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT =
  "permanent_resident";
export const ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CITIZEN =
  "naturalized_citizen";
export const ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSON = "protected_person";
export const ASSOCIATE_STATUS_IN_COUNTRY_OTHER = "other";

// Marital Status Options
export const ASSOCIATE_MARITAL_STATUS_SINGLE = "single";
export const ASSOCIATE_MARITAL_STATUS_MARRIED = "married";
export const ASSOCIATE_MARITAL_STATUS_DIVORCED = "divorced";
export const ASSOCIATE_MARITAL_STATUS_WIDOWED = "widowed";
export const ASSOCIATE_MARITAL_STATUS_OTHER = "other";

// Education Level Options
export const ASSOCIATE_EDUCATION_ELEMENTARY = "elementary";
export const ASSOCIATE_EDUCATION_HIGH_SCHOOL = "high_school";
export const ASSOCIATE_EDUCATION_COLLEGE = "college";
export const ASSOCIATE_EDUCATION_UNIVERSITY = "university";
export const ASSOCIATE_EDUCATION_POST_GRADUATE = "post_graduate";
export const ASSOCIATE_EDUCATION_OTHER = "other";

export const ASSOCIATE_PHONE_TYPE_WORK = 1;

// Constants for filtering and sorting
export const ASSOCIATE_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "1", label: "Active" },
  { value: "0", label: "Archived" },
];

export const ASSOCIATE_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "0", label: "All" },
  { value: "1", label: "Residential" },
  { value: "2", label: "Commercial" },
];

export const ASSOCIATE_SORT_OPTIONS = [
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

export const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 2;
export const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 1;
