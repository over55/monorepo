// File Path: web/workery-frontend/src/constants/Order.js

// Order Type Constants
export const ORDER_TYPE_RESIDENTIAL = 1;
export const ORDER_TYPE_COMMERCIAL = 2;
export const ORDER_TYPE_UNASSIGNED = 3;

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
// IMPORTANT: Convert numeric values to strings for HTML select elements
export const ORDER_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: String(ORDER_STATUS_NEW), label: "New" }, // "1"
  { value: String(ORDER_STATUS_DECLINED), label: "Declined" }, // "2"
  { value: String(ORDER_STATUS_PENDING), label: "Pending" }, // "3"
  { value: String(ORDER_STATUS_CANCELLED), label: "Cancelled" }, // "4"
  { value: String(ORDER_STATUS_ONGOING), label: "Ongoing" }, // "5"
  { value: String(ORDER_STATUS_IN_PROGRESS), label: "In Progress" }, // "6"
  {
    value: String(ORDER_STATUS_COMPLETED_BUT_UNPAID),
    label: "Completed but unpaid",
  }, // "7"
  {
    value: String(ORDER_STATUS_COMPLETED_AND_PAID),
    label: "Completed and paid",
  }, // "8"
  { value: String(ORDER_STATUS_ARCHIVED), label: "Archived" }, // "9"
];

// Order status map for display
export const ORDER_STATUS_MAP = {
  1: "New",
  2: "Declined",
  3: "Pending",
  4: "Cancelled",
  5: "Ongoing",
  6: "In Progress",
  7: "Completed but unpaid",
  8: "Completed and paid",
  9: "Archived",
};

// Client phone type map for display (used in Order context)
export const ORDER_CLIENT_PHONE_TYPE_MAP = {
  1: "Work",
  2: "Home",
  3: "Mobile",
};

// Associate phone type map for display (used in Order context)
export const ORDER_ASSOCIATE_PHONE_TYPE_MAP = {
  1: "Work",
  2: "Home",
  3: "Mobile",
};
