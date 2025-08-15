// File Path: web/workery-frontend/src/constants/Attachment.js

export const ATTACHMENT_OWNERSHIP_TYPE = {
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
