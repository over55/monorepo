// File Path: web/workery-frontend/src/constants/FieldOptions.js

/**
 * Order Unassign Reason Options
 */
export const ORDER_UNASSIGN_REASON_OPTIONS = [
  { value: 1, label: "Other (please specify)" },
  { value: 2, label: "Associate not available" },
  { value: 3, label: "Client request" },
  { value: 4, label: "Associate performance issue" },
  { value: 5, label: "Scheduling conflict" },
];

export const ORDER_UNASSIGN_REASON_OPTIONS_WITH_EMPTY_OPTIONS = [
  { value: 0, label: "Please select" },
  ...ORDER_UNASSIGN_REASON_OPTIONS,
];

/**
 * Order Postpone Reason Options
 */
export const ORDER_POSTPONE_REASON_OPTIONS = [
  { value: 1, label: "Other (please specify)" },
  { value: 2, label: "Customer not available" },
  { value: 3, label: "Associate not available" },
  { value: 4, label: "Weather conditions" },
  { value: 5, label: "Material not available" },
  { value: 6, label: "Customer request" },
];

export const ORDER_POSTPONE_REASON_OPTIONS_WITH_EMPTY_OPTION = [
  { value: 0, label: "Please select" },
  ...ORDER_POSTPONE_REASON_OPTIONS,
];

/**
 * Order/Task Close Reason Options
 */
export const TASK_ITEM_CLOSE_REASON_OPTIONS = [
  { value: 1, label: "Other (please specify)" },
  { value: 2, label: "Customer cancelled" },
  { value: 3, label: "Associate cancelled" },
  { value: 4, label: "Job not completed satisfactorily" },
  { value: 5, label: "Job completed by someone else" },
  { value: 6, label: "Work no longer needed" },
  { value: 7, label: "Customer did not return call" },
  { value: 8, label: "Associate did not have necessary equipment" },
  { value: 9, label: "Associate did not have necessary skills" },
  { value: 10, label: "Associate refused to do job" },
  { value: 11, label: "Unable to agree on a price" },
  { value: 12, label: "Associate was terminated" },
];

export const TASK_ITEM_CLOSE_REASON_OPTIONS_WITH_EMPTY_OPTION = [
  { value: 0, label: "Please select" },
  ...TASK_ITEM_CLOSE_REASON_OPTIONS,
];

/**
 * Order Incident Closing Reason Options
 */
export const ORDER_INCIDENT_CLOSING_REASON_OPTIONS = [
  { value: 1, label: "Other (please specify)" },
  { value: 2, label: "Resolved by associate" },
  { value: 3, label: "Resolved by customer" },
  { value: 4, label: "Resolved by staff" },
  { value: 5, label: "No longer an issue" },
  { value: 6, label: "Duplicate incident" },
];

export const ORDER_INCIDENT_CLOSING_REASON_OPTIONS_WITH_EMPTY_OPTIONS = [
  { value: 0, label: "Please select" },
  ...ORDER_INCIDENT_CLOSING_REASON_OPTIONS,
];

/**
 * Order Incident Sort Options
 */
export const ORDER_INCIDENT_SORT_OPTIONS = [
  { value: "created_at,DESC", label: "Newest → Oldest" },
  { value: "created_at,ASC", label: "Oldest → Newest" },
  { value: "title,ASC", label: "Title (A → Z)" },
  { value: "title,DESC", label: "Title (Z → A)" },
];

export const CLIENT_PHONE_TYPE_LANDLINE = 1;
export const CLIENT_PHONE_TYPE_MOBILE = 2;
export const CLIENT_PHONE_TYPE_WORK = 3;

export const CLIENT_PHONE_TYPE_OF_MAP = {
  [CLIENT_PHONE_TYPE_LANDLINE]: "Landline",
  [CLIENT_PHONE_TYPE_MOBILE]: "Mobile",
  [CLIENT_PHONE_TYPE_WORK]: "Work",
};

export const ASSOCIATE_PHONE_TYPE_LANDLINE = 1;
export const ASSOCIATE_PHONE_TYPE_MOBILE = 2;
export const ASSOCIATE_PHONE_TYPE_WORK = 3;

export const ASSOCIATE_PHONE_TYPE_OF_MAP = {
  [ASSOCIATE_PHONE_TYPE_LANDLINE]: "Landline",
  [ASSOCIATE_PHONE_TYPE_MOBILE]: "Mobile",
  [ASSOCIATE_PHONE_TYPE_WORK]: "Work",
};

export const TASK_ITEM_ORDER_CANCEL_REASON_OPTIONS = [
  {
    value: 2,
    label: "Quote was too high",
  },
  {
    value: 3,
    label: "Job completed by someone else",
  },
  {
    value: 5,
    label: "Work no longer needed",
  },
  {
    value: 6,
    label: "Client not satisfied with Associate",
  },
  {
    value: 7,
    label: "Client did work themselves",
  },
  {
    value: 8,
    label: "No Associate available",
  },
  {
    value: 9,
    label: "Work environment unsuitable",
  },
  {
    value: 10,
    label: "Client did not return call",
  },
  {
    value: 11,
    label: "Associate did not have necessary equipment",
  },
  {
    value: 12,
    label: "Repair not possible",
  },
  {
    value: 13,
    label: "Could not meet deadline",
  },
  {
    value: 14,
    label: "Associate did not call client",
  },
  {
    value: 15,
    label: "Member issue",
  },
  {
    value: 16,
    label: "Client billing issue",
  },
  {
    value: 1,
    label: "Other",
  },
];

export const TASK_ITEM_ORDER_CANCEL_REASON_OPTIONS_WITH_EMPTY_OPTION = [
  { value: 0, label: "Please select" }, // EMPTY OPTION
  ...TASK_ITEM_ORDER_CANCEL_REASON_OPTIONS,
];

export const ORDER_INVOICE_PAYMENT_METHODS_OPTIONS = [
  { value: 2, label: "Cash" },
  { value: 3, label: "Cheque" },
  { value: 4, label: "E-transfer" },
  { value: 5, label: "Debit" },
  { value: 6, label: "Credit" },
  { value: 7, label: "Purchase Order" },
  { value: 8, label: "Cryptocurrency" },
  { value: 1, label: "Other" },
];

/**
 * Order Status Filter Options
 */
export const ORDER_STATUS_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "New" },
  { value: 2, label: "Declined" },
  { value: 3, label: "Pending" },
  { value: 4, label: "Cancelled" },
  { value: 5, label: "Ongoing" },
  { value: 6, label: "In Progress" },
  { value: 7, label: "Completed but Unpaid" },
  { value: 8, label: "Completed and Paid" },
  { value: 9, label: "Archived" },
];

/**
 * Order Type Filter Options
 */
export const ORDER_TYPE_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Unassigned" },
  { value: 2, label: "Residential" },
  { value: 3, label: "Commercial" },
];

/**
 * Order Sort Options
 */
export const ORDER_SORT_OPTIONS = [
  { value: "created_at,DESC", label: "Created (Newest → Oldest)" },
  { value: "created_at,ASC", label: "Created (Oldest → Newest)" },
  { value: "customer_lexical_name,ASC", label: "Customer (A → Z)" },
  { value: "customer_lexical_name,DESC", label: "Customer (Z → A)" },
  { value: "associate_lexical_name,ASC", label: "Associate (A → Z)" },
  { value: "associate_lexical_name,DESC", label: "Associate (Z → A)" },
  { value: "assignment_date,DESC", label: "Assigned Date (Newest → Oldest)" },
  { value: "assignment_date,ASC", label: "Assigned Date (Oldest → Newest)" },
  { value: "start_date,DESC", label: "Start Date (Newest → Oldest)" },
  { value: "start_date,ASC", label: "Start Date (Oldest → Newest)" },
];

/**
 * Page Size Options
 */
export const PAGE_SIZE_OPTIONS = [
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
];

/**
 * Default Order List Sort By Value
 */
export const DEFAULT_ORDER_LIST_SORT_BY_VALUE = "start_date,DESC";

/**
 * Financial Status Filter Options
 */
export const FINANCIAL_STATUS_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Pending" },
  { value: 2, label: "Paid" },
  { value: 3, label: "Cancelled" },
];

/**
 * Financial Type Filter Options
 */
export const FINANCIAL_TYPE_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Invoice" },
  { value: 2, label: "Payment" },
  { value: 3, label: "Refund" },
  { value: 4, label: "Adjustment" },
  { value: 5, label: "Credit" },
  { value: 6, label: "Debit" },
];

/**
 * Financial Sort Options
 */
export const FINANCIAL_SORT_OPTIONS = [
  {
    value: "transaction_date,DESC",
    label: "Transaction Date (Newest → Oldest)",
  },
  {
    value: "transaction_date,ASC",
    label: "Transaction Date (Oldest → Newest)",
  },
  { value: "amount,DESC", label: "Amount (Highest → Lowest)" },
  { value: "amount,ASC", label: "Amount (Lowest → Highest)" },
  { value: "due_date,DESC", label: "Due Date (Newest → Oldest)" },
  { value: "due_date,ASC", label: "Due Date (Oldest → Newest)" },
  { value: "created_at,DESC", label: "Created (Newest → Oldest)" },
  { value: "created_at,ASC", label: "Created (Oldest → Newest)" },
];

/**
 * Default Financial List Sort By Value
 */
export const DEFAULT_FINANCIAL_LIST_SORT_BY_VALUE = "transaction_date,DESC";

export const ORDER_INVOICE_QUOTE_VALIDITY_OPTIONS = [
  { value: 30, label: "30 days" },
  { value: 45, label: "45 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
  { value: 120, label: "120 days" },
];

export const DEFAULT_STAFF_LIST_SORT_BY_VALUE = "lexical_name,ASC";
export const DEFAULT_STAFF_STATUS_FILTER_OPTION = 1; // 1=Active

export const GENDER_OPTIONS = [
  { value: 2, label: "Male" },
  { value: 3, label: "Female" },
  { value: 4, label: "Transgender" },
  { value: 5, label: "Gender non-binary" },
  { value: 6, label: "Two Spirit" },
  { value: 7, label: "Prefer not to say" },
  { value: 8, label: "Do not know" },
  { value: 1, label: "Other" },
];

export const GENDER_OPTIONS_WITH_EMPTY_OPTION = [
  { value: 0, label: "Please select" }, // EMPTY OPTION
  ...GENDER_OPTIONS,
];

export const IDENTIFY_AS_OPTIONS = [
  // { value: 1, label: 'Other' },
  { value: 2, label: "Prefer not to say" },
  { value: 3, label: "Women " },
  { value: 4, label: "Newcomer" },
  { value: 5, label: "Racialized Person" },
  { value: 6, label: "Veteran" },
  { value: 7, label: "Francophone" },
  { value: 8, label: "Person with disability" },
  { value: 9, label: "Inuit" },
  { value: 10, label: "First Nations" },
  { value: 11, label: "Metis" },
];
