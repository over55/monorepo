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
