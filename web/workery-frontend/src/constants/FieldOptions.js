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
