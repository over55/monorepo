/**
 * Attachment type constants matching backend definitions
 * Backend: cloud/workery-backend/app/attachment/datastore/datastore.go
 */

export const ATTACHMENT_OWNERSHIP_TYPE = {
  CUSTOMER: 1,
  ASSOCIATE: 2,
  ORDER: 3,
  STAFF: 4,
};

export const ATTACHMENT_TYPES = {
  CUSTOMER: 1,
  ASSOCIATE: 2,
  ORDER: 3,
  STAFF: 4,
};

export const ATTACHMENT_STATUS = {
  ACTIVE: 1,
  ARCHIVED: 2,
};

export const ATTACHMENT_STATUS_LABELS = {
  [ATTACHMENT_STATUS.ACTIVE]: "Active",
  [ATTACHMENT_STATUS.ARCHIVED]: "Archived",
};

export const ATTACHMENT_TYPE_NAMES = {
  customer: ATTACHMENT_TYPES.CUSTOMER,
  associate: ATTACHMENT_TYPES.ASSOCIATE,
  order: ATTACHMENT_TYPES.ORDER,
  staff: ATTACHMENT_TYPES.STAFF,
};

export const ATTACHMENT_TYPE_LABELS = {
  [ATTACHMENT_TYPES.CUSTOMER]: "Customer",
  [ATTACHMENT_TYPES.ASSOCIATE]: "Associate",
  [ATTACHMENT_TYPES.ORDER]: "Order",
  [ATTACHMENT_TYPES.STAFF]: "Staff",
};

// File validation constants
export const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const DEFAULT_ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
];

export const FILE_TYPE_LABELS = {
  "image/jpeg": "JPEG Image",
  "image/png": "PNG Image",
  "image/gif": "GIF Image",
  "image/webp": "WebP Image",
  "application/pdf": "PDF Document",
  "application/msword": "Word Document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word Document",
  "application/vnd.ms-excel": "Excel Spreadsheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    "Excel Spreadsheet",
  "text/plain": "Text File",
  "text/csv": "CSV File",
};
