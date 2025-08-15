// File Path: web/workery-frontend/src/constants/Financial.js

/**
 * Financial Status Constants
 */
export const FINANCIAL_STATUS_PENDING = 1;
export const FINANCIAL_STATUS_PAID = 2;
export const FINANCIAL_STATUS_CANCELLED = 3;

/**
 * Financial Type Constants
 */
export const FINANCIAL_TYPE_INVOICE = 1;
export const FINANCIAL_TYPE_PAYMENT = 2;
export const FINANCIAL_TYPE_REFUND = 3;
export const FINANCIAL_TYPE_ADJUSTMENT = 4;
export const FINANCIAL_TYPE_CREDIT = 5;
export const FINANCIAL_TYPE_DEBIT = 6;

/**
 * Financial Status Labels
 */
export const FINANCIAL_STATUS_LABELS = {
  [FINANCIAL_STATUS_PENDING]: "Pending",
  [FINANCIAL_STATUS_PAID]: "Paid",
  [FINANCIAL_STATUS_CANCELLED]: "Cancelled",
};

/**
 * Financial Type Labels
 */
export const FINANCIAL_TYPE_LABELS = {
  [FINANCIAL_TYPE_INVOICE]: "Invoice",
  [FINANCIAL_TYPE_PAYMENT]: "Payment",
  [FINANCIAL_TYPE_REFUND]: "Refund",
  [FINANCIAL_TYPE_ADJUSTMENT]: "Adjustment",
  [FINANCIAL_TYPE_CREDIT]: "Credit",
  [FINANCIAL_TYPE_DEBIT]: "Debit",
};

/**
 * Financial Type Icons
 */
export const FINANCIAL_TYPE_ICONS = {
  [FINANCIAL_TYPE_INVOICE]: "📄",
  [FINANCIAL_TYPE_PAYMENT]: "💰",
  [FINANCIAL_TYPE_REFUND]: "💸",
  [FINANCIAL_TYPE_ADJUSTMENT]: "⚖️",
  [FINANCIAL_TYPE_CREDIT]: "➕",
  [FINANCIAL_TYPE_DEBIT]: "➖",
};

/**
 * Financial Status Colors
 */
export const FINANCIAL_STATUS_COLORS = {
  [FINANCIAL_STATUS_PENDING]: "warning",
  [FINANCIAL_STATUS_PAID]: "success",
  [FINANCIAL_STATUS_CANCELLED]: "danger",
};

/**
 * Default Financial List Sort Value
 */
export const DEFAULT_FINANCIAL_LIST_SORT_BY_VALUE = "transaction_date,DESC";
