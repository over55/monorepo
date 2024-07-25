export const PAGINATION_LIMIT = 250;
export const PAGE_SIZE_OPTIONS = 25;

export const EXECUTIVE_ROLE_ID = 1;
export const MANAGEMENT_ROLE_ID = 2;
export const FRONTLINE_ROLE_ID = 3;
export const ASSOCIATE_ROLE_ID = 4;
export const CUSTOMER_ROLE_ID = 5;
export const ASSOCIATE_JOB_SEEKER_ROLE_ID = 6;
export const ANONYMOUS_ROLE_ID = 0;

// Use to control the form field required.
export const FIELD_IS_VALID = 1;
export const FIELD_IS_ERROR = 2;
export const FIELD_IS_REQUIRED = 3;
export const FIELD_IS_OPTIONAL = 4;

export function getFieldClass(code) {
  switch (code) {
    case FIELD_IS_VALID:
      return "is-success";
    case FIELD_IS_ERROR:
      return "is-danger";
    case FIELD_IS_REQUIRED:
      return "is-primary";
    case FIELD_IS_OPTIONAL:
      return "is-success";
    default:
      return null;
  }
}

//----------------------------------------------------------------------------//
//                                Clients                                     //
//----------------------------------------------------------------------------//
// Value copied from the following URL:
// https://github.com/over55/monorepo/blob/master/app/customer/datastore/datastore.go

export const UNASSIGNED_CUSTOMER_TYPE_OF_ID = 1;
export const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 2;
export const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;

export const UNASSIGNED_ASSOCIATE_TYPE_OF_ID = 1;
export const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;
export const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;

export const UNASSIGNED_STAFF_TYPE_OF_ID = 1;
export const RESIDENTIAL_STAFF_TYPE_OF_ID = 2;
export const COMMERCIAL_STAFF_TYPE_OF_ID = 3;

// The following are the default sort by values to use.
export const DEFAULT_CLIENT_LIST_SORT_BY_VALUE = "lexical_name,ASC";
export const DEFAULT_CLIENT_STATUS_FILTER_OPTION = 1; // 1=Active

export const CLIENT_PHONE_TYPE_LANDLINE = 1;
export const CLIENT_PHONE_TYPE_MOBILE = 2;
export const CLIENT_PHONE_TYPE_WORK = 3;

export const CLIENT_ORGANIZATION_TYPE_UNKNOWN = 1;
export const CLIENT_ORGANIZATION_TYPE_PRIVATE = 2;
export const CLIENT_ORGANIZATION_TYPE_NON_PROFIT = 3;
export const CLIENT_ORGANIZATION_TYPE_GOVERNMENT = 4;

export const CLIENT_STATUS_ACTIVE = 1;
export const CLIENT_STATUS_ARCHIVED = 2;

export const ASSOCIATE_STATUS_ACTIVE = 1;
export const ASSOCIATE_STATUS_ARCHIVED = 2;

export const STAFF_STATUS_ACTIVE = 1;
export const STAFF_STATUS_ARCHIVED = 2;

//----------------------------------------------------------------------------//
//                               Associates                                   //
//----------------------------------------------------------------------------//
// Value copied from the following URL:
// https://github.com/over55/monorepo/blob/master/app/associate/datastore/datastore.go

// The following are the default sort by values to use.
export const DEFAULT_ASSOCIATE_LIST_SORT_BY_VALUE = "lexical_name,ASC";
export const DEFAULT_ASSOCIATE_STATUS_FILTER_OPTION = 1; // 1=Active

export const ASSOCIATE_PHONE_TYPE_LANDLINE = 1;
export const ASSOCIATE_PHONE_TYPE_MOBILE = 2;
export const ASSOCIATE_PHONE_TYPE_WORK = 3;

export const ASSOCIATE_ORGANIZATION_TYPE_UNKNOWN = 1;
export const ASSOCIATE_ORGANIZATION_TYPE_PRIVATE = 2;
export const ASSOCIATE_ORGANIZATION_TYPE_NON_PROFIT = 3;
export const ASSOCIATE_ORGANIZATION_TYPE_GOVERNMENT = 4;

export const ASSOCIATE_IS_JOB_SEEKER_YES = 1;
export const ASSOCIATE_IS_JOB_SEEKER_NO = 2;

export const ASSOCIATE_STATUS_IN_COUNTRY_OTHER = 1;
export const ASSOCIATE_STATUS_IN_COUNTRY_CANADA_CITIZEN = 2;
export const ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT = 3;
export const ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CANADIAN_CITIZEN = 4;
export const ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSONS = 5;
export const ASSOCIATE_STATUS_IN_COUNTRY_PREFER_NOT_TO_SAY = 6;

export const ASSOCIATE_MARITAL_STATUS_OTHER = 1;
export const ASSOCIATE_MARITAL_STATUS_MARRIED = 2;
export const ASSOCIATE_MARITAL_STATUS_COMMON_LAW = 3;
export const ASSOCIATE_MARITAL_STATUS_DIVORCED = 4;
export const ASSOCIATE_MARITAL_STATUS_SEPARATED = 5;
export const ASSOCIATE_MARITAL_STATUS_WIDOWED = 6;
export const ASSOCIATE_MARITAL_STATUS_SINGLE = 7;
export const ASSOCIATE_MARITAL_STATUS_PREFER_NOT_TO_SAY = 8;

export const ASSOCIATE_ACCOMPLISHED_EDUCATION_OTHER = 1;
export const ASSOCIATE_ACCOMPLISHED_EDUCATION_GRADE_0_TO_8 = 2;
export const ASSOCIATE_ACCOMPLISHED_EDUCATION_GRADE_9 = 3;
export const ASSOCIATE_ACCOMPLISHED_EDUCATION_GRADE_10 = 4;
export const ASSOCIATE_ACCOMPLISHED_EDUCATION_GRADE_11 = 5;
export const ASSOCIATE_ACCOMPLISHED_EDUCATION_GRADE_12_OR_EQUIVALENT = 6;
export const ASSOCIATE_ACCOMPLISHED_EDUCATION_OAC = 7;
export const ASSOCIATE_ACCOMPLISHED_EDUCATION_CERTIFICATE_OF_APPRENTICENSHIP = 8;
export const ASSOCIATE_ACCOMPLISHED_EDUCATION_JOURNEYPERSON = 9;
export const ASSOCIATE_ACCOMPLISHED_EDUCATION_CERTIFICATE_OR_DIPLOMA = 10;
export const ASSOCIATE_ACCOMPLISHED_EDUCATION_BACHELORS_DEGREE = 11;
export const ASSOCIATE_ACCOMPLISHED_EDUCATION_POST_GRADUATE = 12;

//----------------------------------------------------------------------------//
//                          Associates Away Logs                              //
//----------------------------------------------------------------------------//
// Value copied from the following URL:
// TODO

// Nothing.

//----------------------------------------------------------------------------//
//                                Orders                                      //
//----------------------------------------------------------------------------//
// Value copied from the following URL:
// https://github.com/over55/monorepo/blob/master/app/order/datastore/constants.go

export const DEFAULT_ORDER_LIST_SORT_BY_VALUE = "created_at,DESC";

export const RESIDENTIAL_ORDER_TYPE_OF_ID = 1;
export const COMMERCIAL_ORDER_TYPE_OF_ID = 2;
export const UNASSIGNED_ORDER_TYPE_OF_ID = 3;

export const ORDER_STATUS_NEW = 1;
export const ORDER_STATUS_DECLINED = 2;
export const ORDER_STATUS_PENDING = 3;
export const ORDER_STATUS_CANCELLED = 4;
export const ORDER_STATUS_ONGOING = 5;
export const ORDER_STATUS_IN_PROGRESS = 6;
export const ORDER_STATUS_COMPLETED_BUT_UNPAID = 7;
export const ORDER_STATUS_COMPLETED_AND_PAID = 8;
export const ORDER_STATUS_ARCHIVED = 9;

export const ORDER_INCIDENT_INIATOR_CLIENT = 1;
export const ORDER_INCIDENT_INIATOR_ASSOCIATE = 2;
export const ORDER_INCIDENT_INIATOR_STAFF = 3;

//----------------------------------------------------------------------------//
//                            Activity Sheets                                 //
//----------------------------------------------------------------------------//
// Value copied from the following URL:
// https://github.com/over55/monorepo/blob/master/app/activitysheet/datastore/datastore.go

export const DEFAULT_ACTIVITY_SHEET_LIST_SORT_BY_VALUE = "created_at,DESC";

export const ACTIVITY_SHEET_STATUS_ARCHIVED = 1;
export const ACTIVITY_SHEET_STATUS_ERROR = 2;
export const ACTIVITY_SHEET_STATUS_ACCEPTED = 3;
export const ACTIVITY_SHEET_STATUS_DECLINED = 4;
export const ACTIVITY_SHEET_STATUS_PENDING = 5;

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

// TaskItemStatusActive                                    = 1
// TaskItemStatusArchived                                  = 2
// TaskItemTypeAssignedAssociate                           = 1
// TaskItemTypeFollowUpDidAssociateAndCustomerAgreedToMeet = 2
// TaskItemTypeFollowUpCustomerSurvey                      = 3 // DEPRECATED
// TaskItemTypeFollowUpDidAssociateAcceptJob               = 4
// TaskItemTypeUpdateOngoingJob                            = 5
// TaskItemTypeFollowUpDidAssociateCompleteJob             = 6
// TaskItemTypeFollowUpDidCustomerReviewAssociateAfterJob  = 7

//----------------------------------------------------------------------------//
//                            ATTACHMENTS                                     //
//----------------------------------------------------------------------------//
// Value copied from the following URL:
// https://github.com/over55/monorepo/blob/master/app/attachment/datastore/datastore.go

export const ATTACHMENT_STATUS_ACTIVE = 1;
export const ATTACHMENT_STATUS_ARCHIVED = 2;

export const ATTACHMENT_TYPE_CUSTOMER = 1;
export const ATTACHMENT_TYPE_ASSOCIATE = 2;
export const ATTACHMENT_TYPE_ORDER = 3;
export const ATTACHMENT_TYPE_STAFF = 4;

//----------------------------------------------------------------------------//
//                              BULLETINS                                     //
//----------------------------------------------------------------------------//

export const DEFAULT_BULLETIN_LIST_SORT_BY_VALUE = "created_at,DESC";
export const DEFAULT_BULLETIN_STATUS_FILTER_OPTION = 1; // 1=Active

//----------------------------------------------------------------------------//
//                            SKILL SETS                                      //
//----------------------------------------------------------------------------//

export const DEFAULT_SKILL_SET_LIST_SORT_BY_VALUE = "sub_category,ASC";
export const DEFAULT_SKILL_SET_STATUS_FILTER_OPTION = 1; // 1=Active

//----------------------------------------------------------------------------//
//                          ASSOCIATE AWAY LOG                                //
//----------------------------------------------------------------------------//

export const DEFAULT_ASSOCIATE_AWAY_LOG_LIST_SORT_BY_VALUE = "created_at,DESC";
export const DEFAULT_ASSOCIATE_AWAY_LOG_STATUS_FILTER_OPTION = 1; // 1=Active

//----------------------------------------------------------------------------//
//                       INSURANCE REQUIREMENTS                               //
//----------------------------------------------------------------------------//

export const DEFAULT_INSURANCE_REQUIREMENT_LIST_SORT_BY_VALUE =
  "created_at,DESC";
export const DEFAULT_INSURANCE_REQUIREMENT_STATUS_FILTER_OPTION = 1; // 1=Active

//----------------------------------------------------------------------------//
//                          INACTIVE CLIENTS                                  //
//----------------------------------------------------------------------------//

export const DEFAULT_INACTIVE_CLIENT_LIST_SORT_BY_VALUE = "join_date,DESC";
export const DEFAULT_INACTIVE_CLIENT_STATUS_FILTER_OPTION = 2; // 2=Archived

//----------------------------------------------------------------------------//
//                         HOW HEAR ABOUT US ITEMS                            //
//----------------------------------------------------------------------------//

export const DEFAULT_HOW_HEAR_ABOUT_US_ITEM_LIST_SORT_BY_VALUE = "text,ASC";
export const DEFAULT_HOW_HEAR_ABOUT_US_ITEM_STATUS_FILTER_OPTION = 1; // 1=Active

//----------------------------------------------------------------------------//
//                                   Staff                                    //
//----------------------------------------------------------------------------//
// Value copied from the following URL:
// https://github.com/over55/monorepo/blob/master/app/associate/datastore/datastore.go

// The following are the default sort by values to use.
export const DEFAULT_STAFF_LIST_SORT_BY_VALUE = "lexical_name,ASC";
export const DEFAULT_STAFF_STATUS_FILTER_OPTION = 1; // 1=Active

export const STAFF_PHONE_TYPE_LANDLINE = 1;
export const STAFF_PHONE_TYPE_MOBILE = 2;
export const STAFF_PHONE_TYPE_WORK = 3;

export const STAFF_ORGANIZATION_TYPE_UNKNOWN = 1;
export const STAFF_ORGANIZATION_TYPE_PRIVATE = 2;
export const STAFF_ORGANIZATION_TYPE_NON_PROFIT = 3;
export const STAFF_ORGANIZATION_TYPE_GOVERNMENT = 4;

export const STAFF_TYPE_EXECUTIVE = 1;
export const STAFF_TYPE_MANAGEMENT = 2;
export const STAFF_TYPE_FRONTLINE = 3;

//----------------------------------------------------------------------------//
//                                 Comment                                    //
//----------------------------------------------------------------------------//

// The following are the default sort by values to use.
export const DEFAULT_COMMENT_LIST_SORT_BY_VALUE = "created_at,DESC";

//----------------------------------------------------------------------------//
//                                 Common                                    //
//----------------------------------------------------------------------------//
export const LIST_VIEW_TYPE_TABULAR = 1;
export const LIST_VIEW_TYPE_GRID = 2;
