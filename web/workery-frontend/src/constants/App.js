// File Path: web/workery-frontend/src/constants/App.js

// ... existing constants ...

export const UNASSIGNED_CUSTOMER_TYPE_OF_ID = 1;
export const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 2;
export const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;

export const ORDER_STATUS_NEW = 1;
export const ORDER_STATUS_DECLINED = 2;
export const ORDER_STATUS_PENDING = 3;
export const ORDER_STATUS_CANCELLED = 4;
export const ORDER_STATUS_ONGOING = 5;
export const ORDER_STATUS_IN_PROGRESS = 6;
export const ORDER_STATUS_COMPLETED_BUT_UNPAID = 7;
export const ORDER_STATUS_COMPLETED_AND_PAID = 8;
export const ORDER_STATUS_ARCHIVED = 9;

// Order Incident Initiator Types
export const ORDER_INCIDENT_INIATOR_CLIENT = 1;
export const ORDER_INCIDENT_INIATOR_ASSOCIATE = 2;
export const ORDER_INCIDENT_INIATOR_STAFF = 3;
//----------------------------------------------------------------------------//
//                             Task Items                                     //
//----------------------------------------------------------------------------//
// Value copied from the following URL:
// https://github.com/over55/monorepo/blob/master/app/taskitem/datastore/datastore.go

export const TASK_ITEM_CLOSE_REASON_OTHER = 1;
export const DEFAULT_TASK_ITEM_LIST_SORT_BY_VALUE = "due_date,DESC";
export const TASK_ITEM_TYPE_ASSIGN_ASSOCIATE = 1;
export const TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_AND_CUSTOMER_AGREED_TO_MEET = 2;
export const TASK_ITEM_TYPE_FOLLOW_UP_CUSTOMER_SURVEY = 3; // DEPRECATED
export const TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_ACCEPT_JOB = 4;
export const TASK_ITEM_TYPE_UPDATE_ONGOING_JOB = 5;
export const TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_COMPLETE_JOB = 6;
export const TASK_ITEM_TYPE_FOLLOW_UP_DID_CUSTOMER_REVIEW_ASSOCIATE_AFTER_JOB = 7;
