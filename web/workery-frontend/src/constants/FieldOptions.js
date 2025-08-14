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
