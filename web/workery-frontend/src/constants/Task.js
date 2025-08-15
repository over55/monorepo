// File Path: web/workery-frontend/src/constants/Task.js

/**
 * Task Status Constants
 */
export const TASK_STATUS = {
  ACTIVE: 1,
  ARCHIVED: 2,
  CLOSED: 3,
  PENDING: 4,
};

/**
 * Task List View Types
 */
export const TASK_LIST_VIEW_TYPE = {
  TABULAR: "tabular",
  GRID: "grid",
};

/**
 * Task Pagination Constants
 */
export const TASK_PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [
    { value: 10, label: "10" },
    { value: 25, label: "25" },
    { value: 50, label: "50" },
    { value: 100, label: "100" },
  ],
};

/**
 * Task Sort Options
 */
export const TASK_SORT_OPTIONS = [
  { value: "due_date,DESC", label: "Due Date (Newest → Oldest)" },
  { value: "due_date,ASC", label: "Due Date (Oldest → Newest)" },
  { value: "created_at,DESC", label: "Created (Newest → Oldest)" },
  { value: "created_at,ASC", label: "Created (Oldest → Newest)" },
  { value: "customer_lexical_name,ASC", label: "Customer Name (A → Z)" },
  { value: "customer_lexical_name,DESC", label: "Customer Name (Z → A)" },
  { value: "associate_lexical_name,ASC", label: "Associate Name (A → Z)" },
  { value: "associate_lexical_name,DESC", label: "Associate Name (Z → A)" },
];

export const DEFAULT_TASK_SORT_BY = "due_date,DESC";

/**
 * Task Type Filter Options
 */
export const TASK_TYPE_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Assign Associate" },
  { value: 2, label: "Follow Up" },
  { value: 3, label: "48 Hour Follow Up" },
  { value: 4, label: "Completion Survey" },
  { value: 5, label: "Order Completion" },
];

/**
 * Task Is Closed Filter Options
 */
export const TASK_IS_CLOSED_FILTER = {
  ALL: 0,
  CLOSED: 1,
  OPEN: 2,
};

/**
 * Valid Task Types for Validation
 */
export const VALID_TASK_TYPES = [1, 2, 3, 4, 5, 6, 7];

/**
 * Valid Task Statuses for Validation
 */
export const VALID_TASK_STATUSES = [1, 2, 3, 4];

/**
 * Task Assign Associate Status
 */
export const TASK_ASSIGN_ASSOCIATE_STATUS = {
  ACCEPTED: 3,
  DECLINED: 4,
};

/**
 * Task Assign Associate - How Was Job Accepted
 */
export const TASK_HOW_JOB_ACCEPTED = {
  PHONE: 1,
  TEXT: 2,
  EMAIL: 3,
  IN_PERSON: 4,
};

/**
 * Task Assign Associate - Why Job Declined
 */
export const TASK_WHY_JOB_DECLINED = {
  ASSOCIATE_BUSY: 1,
  NO_SKILLS: 2,
  NO_TRAVEL: 3,
  NO_WORK_WITH_CLIENT: 4,
};

/**
 * Task Survey - Was Survey Conducted
 */
export const TASK_SURVEY_STATUS = {
  NO: 0,
  YES: 1,
  NOT_CONDUCTED: 2,
};

/**
 * Task Survey - No Survey Conducted Reason Options
 */
export const TASK_NO_SURVEY_CONDUCTED_REASON_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Other" },
  { value: 2, label: "Unable to reach client" },
  { value: 3, label: "Client did not want to complete survey" },
  { value: 4, label: "Client no longer with company" },
];

/**
 * Task Survey - Response Values
 */
export const TASK_SURVEY_RESPONSE = {
  YES: 1,
  NO: 2,
};

/**
 * Task Completion - Was Completed Values
 */
export const TASK_COMPLETION_STATUS = {
  NOT_SET: 0,
  COMPLETED: 1,
  NOT_COMPLETED: 2,
};

/**
 * Task Completion - Has Inputted Financials
 */
export const TASK_HAS_FINANCIALS = {
  NOT_SET: 0,
  YES: 1,
  NO: 2,
};

/**
 * Task Completion - Invoice Paid To
 */
export const TASK_INVOICE_PAID_TO = {
  NOT_SET: 0,
  ASSOCIATE: 1,
  ORGANIZATION: 2,
};

/**
 * Task Wizard Steps
 */
export const TASK_WIZARD_STEPS = {
  ASSIGN_ASSOCIATE: {
    TOTAL: 4,
    DETAIL: 1,
    SELECT: 2,
    CONFIRM: 3,
    SUBMIT: 4,
  },
  ORDER_COMPLETION: {
    TOTAL: 5,
    DETAIL: 1,
    COMPLETION: 2,
    FINANCIALS: 3,
    COMMENT: 4,
    SUBMIT: 5,
  },
  SURVEY: {
    TOTAL: 3,
    DETAIL: 1,
    QUESTIONS: 2,
    SUBMIT: 3,
  },
};

/**
 * Task Progress Percentages
 */
export const TASK_PROGRESS_PERCENTAGE = {
  STEP_1_OF_3: 33,
  STEP_2_OF_3: 66,
  STEP_3_OF_3: 100,
  STEP_1_OF_4: 25,
  STEP_2_OF_4: 50,
  STEP_3_OF_4: 75,
  STEP_4_OF_4: 100,
  STEP_1_OF_5: 20,
  STEP_2_OF_5: 40,
  STEP_3_OF_5: 60,
  STEP_4_OF_5: 80,
  STEP_5_OF_5: 100,
};

export const TASK_ITEM_CLOSE_REASON_OTHER = 1;
export const DEFAULT_TASK_ITEM_LIST_SORT_BY_VALUE = "due_date,DESC";
export const TASK_ITEM_TYPE_ASSIGN_ASSOCIATE = 1;
export const TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_AND_CUSTOMER_AGREED_TO_MEET = 2;
export const TASK_ITEM_TYPE_FOLLOW_UP_CUSTOMER_SURVEY = 3; // DEPRECATED
export const TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_ACCEPT_JOB = 4;
export const TASK_ITEM_TYPE_UPDATE_ONGOING_JOB = 5;
export const TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_COMPLETE_JOB = 6;
export const TASK_ITEM_TYPE_FOLLOW_UP_DID_CUSTOMER_REVIEW_ASSOCIATE_AFTER_JOB = 7;
