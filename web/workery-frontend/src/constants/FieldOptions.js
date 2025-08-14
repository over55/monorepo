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
