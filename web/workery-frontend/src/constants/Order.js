// File Path: web/workery-frontend/src/constants/Order.js

// Order Type Constants
export const ORDER_TYPE_UNASSIGNED = 1;
export const ORDER_TYPE_RESIDENTIAL = 2;
export const ORDER_TYPE_COMMERCIAL = 3;

// Order Status Constants
export const ORDER_STATUS_NEW = 1;
export const ORDER_STATUS_DECLINED = 2;
export const ORDER_STATUS_PENDING = 3;
export const ORDER_STATUS_CANCELLED = 4;
export const ORDER_STATUS_ONGOING = 5;
export const ORDER_STATUS_IN_PROGRESS = 6;
export const ORDER_STATUS_COMPLETED_BUT_UNPAID = 7;
export const ORDER_STATUS_COMPLETED_AND_PAID = 8;
export const ORDER_STATUS_ARCHIVED = 9;

// Constants for filtering and sorting
export const ORDER_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: ORDER_STATUS_NEW, label: "New" },
  { value: ORDER_STATUS_DECLINED, label: "Declined" },
  { value: ORDER_STATUS_PENDING, label: "Pending" },
  { value: ORDER_STATUS_CANCELLED, label: "Cancelled" },
  { value: ORDER_STATUS_ONGOING, label: "Ongoing" },
  { value: ORDER_STATUS_IN_PROGRESS, label: "In Progress" },
  { value: ORDER_STATUS_COMPLETED_BUT_UNPAID, label: "Completed but unpaid" },
  { value: ORDER_STATUS_COMPLETED_AND_PAID, label: "Completed and paid" },
  { value: ORDER_STATUS_ARCHIVED, label: "Archived" },
];
