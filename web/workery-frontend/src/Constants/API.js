/**
 *  The API web-services endpoints.
 */
const HTTP_API_SERVER =
  process.env.REACT_APP_API_PROTOCOL + "://" + process.env.REACT_APP_API_DOMAIN;

/**
 * Gateway
 */
export const WORKERY_API_BASE_PATH = "/api/v1";
export const WORKERY_VERSION_ENDPOINT = "version";
export const WORKERY_LOGIN_API_ENDPOINT = HTTP_API_SERVER + "/api/v1/login";
export const WORKERY_LOGOUT_API_ENDPOINT = HTTP_API_SERVER + "/api/v1/logout";
export const WORKERY_EXECUTIVE_VISITS_TENANT_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/executive-visit-tenant";
export const WORKERY_DASHBOARD_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/dashboard";
export const WORKERY_2FA_GENERATE_OTP_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/otp/generate";
export const WORKERY_2FA_GENERATE_OTP_AND_QR_CODE_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/otp/generate-qr-code";
export const WORKERY_2FA_VERIFY_OTP_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/otp/verify";
export const WORKERY_2FA_VALIDATE_OTP_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/otp/validate";
export const WORKERY_2FA_DISABLED_OTP_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/otp/disable";
export const WORKERY_2FA_RECOVERY_OTP_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/otp/recovery";

/**
 * Tenants
 */
export const WORKERY_TENANTS_API_ENDPOINT = HTTP_API_SERVER + "/api/v1/tenants";
export const WORKERY_TENANT_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/tenant/{id}";
export const WORKERY_TENANT_OPERATIONS_UPDATE_TAX_RATE_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/tenants/operations/update-tax-rate";

/**
 * Accounts
 */

export const WORKERY_ACCOUNT_API_ENDPOINT = HTTP_API_SERVER + "/api/v1/profile";
export const WORKERY_ACCOUNT_CHANGE_PASSWORD_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/profile/change-password";
export const WORKERY_ACCOUNT_AVATAR_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/account/operation/avatar";

/**
 * Clients
 */
export const WORKERY_CLIENTS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/customers";
export const WORKERY_CLIENT_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/customer/{id}";
export const WORKERY_CLIENT_ARCHIVE_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/customers/operation/archive";
export const WORKERY_CLIENT_CREATE_COMMENT_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/customers/operation/create-comment";
export const WORKERY_CLIENT_UPGRADE_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/customers/operation/upgrade";
export const WORKERY_CLIENT_DOWNGRADE_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/customers/operation/downgrade";
export const WORKERY_CLIENT_AVATAR_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/customers/operation/avatar";
export const WORKERY_CLIENT_CHANGE_2FA_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/customers/operations/change-2fa";
export const WORKERY_CLIENT_BAN_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/customers/operations/ban";
export const WORKERY_CLIENT_UNBAN_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/customers/operations/unban";

/**
 * Tags
 */
export const WORKERY_TAGS_API_ENDPOINT = HTTP_API_SERVER + "/api/v1/tags";
export const WORKERY_TAG_API_ENDPOINT = HTTP_API_SERVER + "/api/v1/tag/{id}";
export const WORKERY_TAG_SELECT_OPTIONS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/tags/select-options";

/**
 * Incidents
 */
export const WORKERY_ORDER_INCIDENTS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/order-incidents";
export const WORKERY_ORDER_INCIDENT_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/order-incident/{id}";
export const WORKERY_ORDER_INCIDENT_SELECT_OPTIONS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/order-incidents/select-options";
export const WORKERY_ORDER_INCIDENT_CREATE_COMMENT_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/order-incidents/operation/create-comment";
export const WORKERY_ORDER_INCIDENT_CREATE_ATTACHMENT_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/order-incidents/operation/create-attachment";

/**
 * Skill Sets
 */
export const WORKERY_SKILL_SETS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/skill-sets";
export const WORKERY_SKILL_SET_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/skill-set/{id}";
export const WORKERY_SKILL_SET_SELECT_OPTIONS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/skill-sets/select-options";
export const WORKERY_SKILL_SET_ARCHIVE_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/skill-sets/operation/archive";

/**
 * How Hear About Us Item
 */
export const WORKERY_HOW_HEAR_ABOUT_US_ITEMS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/how-hear-about-us-items";
export const WORKERY_HOW_HEAR_ABOUT_US_ITEM_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/how-hear-about-us-item/{id}";
export const WORKERY_HOW_HEAR_ABOUT_US_ITEM_SELECT_OPTIONS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/how-hear-about-us-items/select-options";

/**
 * Insurance Requirement
 */
export const WORKERY_INSURANCE_REQUIREMENTS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/insurance-requirements";
export const WORKERY_INSURANCE_REQUIREMENT_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/insurance-requirement/{id}";
export const WORKERY_INSURANCE_REQUIREMENT_SELECT_OPTIONS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/insurance-requirements/select-options";

/**
 * Vehicle Type
 */
export const WORKERY_VEHICLE_TYPES_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/vehicle-types";
export const WORKERY_VEHICLE_TYPE_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/vehicle-type/{id}";
export const WORKERY_VEHICLE_TYPE_SELECT_OPTIONS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/vehicle-types/select-options";

/**
 * Service Fee
 */
export const WORKERY_SERVICE_FEES_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/service-fees";
export const WORKERY_SERVICE_FEE_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/service-fee/{id}";
export const WORKERY_SERVICE_FEE_SELECT_OPTIONS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/service-fees/select-options";

/**
 * Attachments
 */
export const WORKERY_ATTACHMENTS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/attachments";
export const WORKERY_ATTACHMENT_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/attachment/{id}";

/**
 * Associates
 */
export const WORKERY_ASSOCIATES_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/associates";
export const WORKERY_ASSOCIATE_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/associate/{id}";
export const WORKERY_ASSOCIATE_ARCHIVE_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/associates/operation/archive";
export const WORKERY_ASSOCIATE_CREATE_COMMENT_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/associates/operation/create-comment";
export const WORKERY_ASSOCIATE_UPGRADE_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/associates/operation/upgrade";
export const WORKERY_ASSOCIATE_DOWNGRADE_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/associates/operation/downgrade";
export const WORKERY_ASSOCIATE_AVATAR_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/associates/operation/avatar";
export const WORKERY_ASSOCIATE_CHANGE_PASSWORD_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/associates/operations/change-password";

/**
 * Orders
 */
export const WORKERY_ORDERS_API_ENDPOINT = HTTP_API_SERVER + "/api/v1/orders";
export const WORKERY_ORDER_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/order/{id}";
export const WORKERY_ORDER_CREATE_COMMENT_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/orders/operation/create-comment";
export const WORKERY_ORDER_UNASSIGN_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/orders/operation/unassign";
export const WORKERY_ORDER_CLOSE_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/orders/operation/close";
export const WORKERY_ORDER_POSTPONE_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/orders/operation/postpone";
export const WORKERY_ORDER_TRANSFER_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/orders/operation/transfer";
export const WORKERY_ORDER_GENERATE_INVOICE_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/orders/operation/generate-invoice";
export const WORKERY_ORDER_INVOICE_DOWNLOAD_PDF_API_URL =
  HTTP_API_SERVER + "/api/v1/order/XXX/download-invoice-pdf";
export const WORKERY_ORDER_CLONE_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/orders/operation/clone";

/**
 * Activity Sheets
 */
export const WORKERY_ACTIVITY_SHEETS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/activity-sheets";
export const WORKERY_ACTIVITY_SHEET_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/activity-sheet/";

/**
 * Tasks
 */

export const WORKERY_TASKS_API_ENDPOINT = HTTP_API_SERVER + "/api/v1/tasks";
export const WORKERY_TASKS_COUNT_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/tasks/count";
export const WORKERY_TASK_API_ENDPOINT = HTTP_API_SERVER + "/api/v1/task/{id}";
export const WORKERY_TASK_ASSIGNABLE_ASSOCIATES_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/task/{id}/assignable-associates";
export const WORKERY_TASK_ASSIGN_ASSOCIATE_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/task-operations/assign-associate";
export const WORKERY_TASK_FOLLOW_UP_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/task-operations/follow-up";
export const WORKERY_TASK_FOLLOW_UP_PENDING_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/task-operations/follow-up-pending";
export const WORKERY_TASK_ORDER_COMPLETION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/task-operations/order-completion";
export const WORKERY_TASK_SURVEY_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/task-operations/survey";
export const WORKERY_TASK_POSTPONE_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/task-operations/postpone";
export const WORKERY_TASK_CLOSE_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/task-operations/close";

/**
 * Bulletin
 */

export const WORKERY_BULLETINS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/bulletins";
export const WORKERY_BULLETIN_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/bulletin/{id}";
export const WORKERY_BULLETIN_ARCHIVE_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/bulletins/operation/archive";

/**
 * Away Log
 */
export const WORKERY_AWAY_LOG_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/associate-away-logs";
export const WORKERY_AWAY_LOG_DETAIL_API_URL =
  HTTP_API_SERVER + "/api/v1/associate-away-log/{id}";

/**
 * Associate
 */

export const WORKERY_ASSOCIATE_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/associates";
export const WORKERY_ASSOCIATE_DETAIL_API_URL =
  HTTP_API_SERVER + "/api/v1/associate/";
export const WORKERY_ASSOCIATE_COMMENT_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/associate-comments";
export const WORKERY_ASSOCIATE_CONTACT_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/associate/XXX/contact";
export const WORKERY_ASSOCIATE_ADDRESS_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/associate/XXX/address";
export const WORKERY_ASSOCIATE_ACCOUNT_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/associate/XXX/account";
export const WORKERY_ASSOCIATE_METRICS_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/associate/XXX/metrics";
export const WORKERY_ASSOCIATE_FILE_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/associate-files";
export const WORKERY_ASSOCIATE_FILE_ARCHIVE_API_URL =
  HTTP_API_SERVER + "/api/v1/associate-file/XXX/";
export const WORKERY_ASSOCIATE_AVATAR_CREATE_OR_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/associate-operations/upload-avatar";
export const WORKERY_ASSOCIATE_BALANCE_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/associate-operations/balance";
// export const WORKERY_ASSOCIATE_CHANGE_PASSWORD_OPERATION_API_URL =
//   HTTP_API_SERVER + "/api/v1/associate-operations/password";
export const WORKERY_ASSOCIATE_UPGRADE_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/associate-operations/upgrade-residential";
export const WORKERY_ASSOCIATE_DOWNGRADE_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/associate-operations/downgrade-commercial";
export const WORKERY_ASSOCIATE_ARCHIVE_API_URL =
  HTTP_API_SERVER + "/api/v1/associate-operations/archive";
export const WORKERY_ASSOCIATE_PERMANENTLY_DELETE_UPGRADE_API_URL =
  HTTP_API_SERVER + "/api/v1/associate-operations/permanently-delete";
export const WORKERY_ASSOCIATES_SELECT_OPTIONS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/associates/select-options";
export const WORKERY_ASSOCIATE_CHANGE_2FA_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/associates/operations/change-2fa";

/**
 * Staff
 */

export const WORKERY_STAFF_LIST_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/staffs";
export const WORKERY_STAFF_DETAIL_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/staff/{id}";
export const WORKERY_STAFF_COMMENT_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/staff-comments";
export const WORKERY_STAFF_CREATE_COMMENT_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/staffs/operation/create-comment";
export const WORKERY_STAFF_ADDRESS_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/staff/XXX/address";
export const WORKERY_STAFF_ACCOUNT_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/staff/XXX/account";
export const WORKERY_STAFF_METRICS_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/staff/XXX/metrics";
export const WORKERY_STAFF_UPGRADE_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/staffs/operation/upgrade";
export const WORKERY_STAFF_DOWNGRADE_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/staffs/operation/downgrade";
export const WORKERY_STAFF_CHANGE_PASSWORD_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/staffs/operations/change-password";
export const WORKERY_STAFF_CHANGE_2FA_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/staffs/operations/change-2fa";
export const WORKERY_STAFF_AVATAR_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/staffs/operation/avatar";
export const WORKERY_STAFF_ARCHIVE_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/staffs/operation/archive";
export const WORKERY_STAFF_PERMANENTLY_DELETE_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/staffs/operation/permanently-delete";
export const WORKERY_STAFF_SELECT_OPTIONS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/staffs/select-options";

/**
 * Report
 */

export const WORKERY_REPORT_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/report/{reportID}";

/**
 * Comments
 */

export const WORKERY_COMMENT_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/comments";

/**
 * National Occupational Classification
 */
export const WORKERY_NATIONAL_OCCUPATIONAL_CLASSIFICATIONS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/national-occupational-classifications";
export const WORKERY_NATIONAL_OCCUPATIONAL_CLASSIFICATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/national-occupational-classification/{id}";
export const WORKERY_NATIONAL_OCCUPATIONAL_CLASSIFICATION_SELECT_OPTIONS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/national-occupational-classifications/select-options";

/**
 * North America Industry Classification System
 */
export const WORKERY_NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEMS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/north-america-industry-classification-systems";
export const WORKERY_NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEM_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/north-america-industry-classification-system/{id}";
export const WORKERY_NORTH_AMERICA_INDUSTRY_CLASSIFICATION_SYSTEM_SELECT_OPTIONS_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/north-america-industry-classification-systems/select-options";

//
// Continue below ...
//

export const WORKERY_FORGOT_PASSWORD_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/forgot-password";
export const WORKERY_PASSWORD_RESET_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/password-reset";
export const WORKERY_REFRESH_TOKEN_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/refresh-token";
export const WORKERY_REFRESH_TOKEN_API_URL =
  HTTP_API_SERVER + "/api/v1/refresh-token";
export const WORKERY_PROFILE_API_URL = HTTP_API_SERVER + "/api/v1/profile";
export const WORKERY_DASHBOARD_API_URL = HTTP_API_SERVER + "/api/v1/dashboard";
export const WORKERY_NAVIGATION_API_URL =
  HTTP_API_SERVER + "/api/v1/navigation";
export const WORKERY_CLIENT_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/customers";
export const WORKERY_CLIENT_COUNT_API_URL =
  HTTP_API_SERVER + "/api/v1/customers/count";
export const WORKERY_CLIENT_DETAIL_API_URL =
  HTTP_API_SERVER + "/api/v1/customer/";
export const WORKERY_CLIENT_ARCHIVE_API_URL =
  HTTP_API_SERVER + "/api/v1/customer-operations/archive";
export const WORKERY_CLIENT_REZ_UPGRADE_API_URL =
  HTTP_API_SERVER + "/api/v1/customer-operations/upgrade-residential";
export const WORKERY_CLIENT_PERMANENTLY_DELETE_UPGRADE_API_URL =
  HTTP_API_SERVER + "/api/v1/customer-operations/permanently-delete";
export const WORKERY_CLIENT_AVATAR_CREATE_OR_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/customer-operations/upload-avatar";
export const WORKERY_CLIENT_CHANGE_PASSWORD_OPERATION_API_ENDPOINT =
  HTTP_API_SERVER + "/api/v1/customers/operations/change-password";
export const WORKERY_CLIENT_COMMENT_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/customer-comments";
export const WORKERY_CLIENT_FILE_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/customer-files";
export const WORKERY_CLIENT_FILE_ARCHIVE_API_URL =
  HTTP_API_SERVER + "/api/v1/customer-file/XXX/";
export const WORKERY_CLIENT_CONTACT_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/customer/XXX/contact";
export const WORKERY_CLIENT_ADDRESS_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/customer/XXX/address";
export const WORKERY_CLIENT_METRICS_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/customer/XXX/metrics";
export const WORKERY_ORDER_LIST_API_URL = HTTP_API_SERVER + "/api/v1/orders";
export const WORKERY_ORDER_INVOICE_RETRIEVE_API_URL =
  HTTP_API_SERVER + "/api/v1/order/XXX/invoice";
export const WORKERY_ORDER_DETAIL_API_URL = HTTP_API_SERVER + "/api/v1/order/";
export const WORKERY_ORDER_LITE_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/order/XXX/lite";
export const WORKERY_ORDER_FINANCIAL_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/order/XXX/financial";
export const WORKERY_ORDER_COMMENT_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/order-comments";
export const WORKERY_ORDER_TRANSFER_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/order-operations/transfer";
export const WORKERY_ORDER_UNASSIGN_ASSOCIATE_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/order-operations/unassign";
export const WORKERY_ORDER_CLOSE_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/order-operations/close";
export const WORKERY_ORDER_REOPEN_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/order-operations/reopen";
export const WORKERY_ORDER_POSTPONE_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/order-operations/postpone";
export const WORKERY_TASK_ORDER_COMPLETION_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/order-operations/order-completion";
export const WORKERY_ORDER_INVOICE_OPERATION_API_URL =
  HTTP_API_SERVER + "/api/v1/order-operations/invoice";
export const WORKERY_ORDER_FILE_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/order-files";
export const WORKERY_ORDER_FILE_ARCHIVE_API_URL =
  HTTP_API_SERVER + "/api/v1/order-file/XXX/";
export const WORKERY_MY_ORDER_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/my-orders";
export const WORKERY_MY_ORDER_DETAIL_API_URL =
  HTTP_API_SERVER + "/api/v1/my-order/";
export const WORKERY_INVOICE_FIRST_SECTION_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/order/XXX/invoice/first-section";
export const WORKERY_INVOICE_SECOND_SECTION_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/order/XXX/invoice/second-section";
export const WORKERY_INVOICE_THIRD_SECTION_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/order/XXX/invoice/third-section";
export const WORKERY_DEPOSIT_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/order/XXX/deposits";
export const WORKERY_DEPOSIT_DETAIL_API_URL =
  HTTP_API_SERVER + "/api/v1/order/XXX/deposit/YYY";
export const WORKERY_TASK_AVAILABLE_ASSOCIATE_LIST_CREATE_API_URL =
  "task-operations/available-associates";
export const WORKERY_FINANCIAL_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/financials";
export const WORKERY_FINANCIAL_DETAIL_API_URL =
  HTTP_API_SERVER + "/api/v1/financial/";
export const WORKERY_PRIVATE_FILE_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/private-files";
export const WORKERY_PRIVATE_FILE_DETAIL_API_URL =
  HTTP_API_SERVER + "/api/v1/private-file/";
export const WORKERY_BULLETIN_BOARD_ITEM_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/bulletin-board-items";
export const WORKERY_BULLETIN_BOARD_ITEM_DETAIL_API_URL =
  HTTP_API_SERVER + "/api/v1/bulletin-board-item/";
export const WORKERY_INSURANCE_REQUIREMENT_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/insurance-requirements";
export const WORKERY_INSURANCE_REQUIREMENT_DETAIL_API_URL =
  HTTP_API_SERVER + "/api/v1/insurance-requirement/";
export const WORKERY_SERVICE_FEE_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/order-service-fees";
export const WORKERY_SERVICE_FEE_DETAIL_API_URL =
  HTTP_API_SERVER + "/api/v1/order-service-fee/";
export const WORKERY_ARCHIVED_CLIENT_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/deactivated-customers";
export const WORKERY_VEHICLE_TYPE_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/vehicle-types";
export const WORKERY_VEHICLE_TYPE_DETAIL_API_URL =
  HTTP_API_SERVER + "/api/v1/vehicle-type/";
export const WORKERY_PARTNER_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/partners";
export const WORKERY_PARTNER_DETAIL_API_URL =
  HTTP_API_SERVER + "/api/v1/partner/";
export const WORKERY_PARTNER_ARCHIVE_API_URL =
  HTTP_API_SERVER + "/api/v1/partner-operations/archive";
export const WORKERY_PARTNER_REZ_UPGRADE_API_URL =
  HTTP_API_SERVER + "/api/v1/partner-operations/upgrade-residential";
export const WORKERY_PARTNER_PERMANENTLY_DELETE_UPGRADE_API_URL =
  HTTP_API_SERVER + "/api/v1/partner-operations/permanently-delete";
export const WORKERY_PARTNER_AVATAR_CREATE_OR_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/partner-operations/upload-avatar";
export const WORKERY_PARTNER_COMMENT_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/partner-comments";
export const WORKERY_PARTNER_FILE_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/partner-files";
export const WORKERY_PARTNER_FILE_ARCHIVE_API_URL =
  HTTP_API_SERVER + "/api/v1/partner-file/XXX/";
export const WORKERY_PARTNER_CONTACT_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/partner/XXX/contact";
export const WORKERY_PARTNER_ADDRESS_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/partner/XXX/address";
export const WORKERY_PARTNER_METRICS_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/partner/XXX/metrics";
export const WORKERY_REPORT_ONE_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/1";
export const WORKERY_REPORT_TWO_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/2";
export const WORKERY_REPORT_THREE_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/3";
export const WORKERY_REPORT_FOUR_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/4";
export const WORKERY_REPORT_FIVE_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/5";
export const WORKERY_REPORT_SIX_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/6";
export const WORKERY_REPORT_SEVEN_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/7";
export const WORKERY_REPORT_EIGHT_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/8";
export const WORKERY_REPORT_NINE_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/9";
export const WORKERY_REPORT_TEN_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/10";
export const WORKERY_REPORT_ELEVEN_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/11";
export const WORKERY_REPORT_TWELVE_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/12";
export const WORKERY_REPORT_THIRTEEN_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/13";
export const WORKERY_REPORT_FOURTEEN_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/14";
export const WORKERY_REPORT_FIFTHTEEN_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/15";
export const WORKERY_REPORT_SIXTEEN_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/16";
export const WORKERY_REPORT_SEVENTEEN_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/17";
export const WORKERY_REPORT_EIGHTEEN_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/18";
export const WORKERY_REPORT_NINETEEN_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/19";
export const WORKERY_REPORT_TWENTY_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/20";
export const WORKERY_REPORT_TWENTY_ONE_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/21";
export const WORKERY_REPORT_TWENTY_TWO_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/22";
export const WORKERY_REPORT_TWENTY_THREE_CSV_DOWNLOAD_API_URL =
  HTTP_API_SERVER + "/api/v1/download-report/23";
export const WORKERY_ONGOING_ORDER_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/ongoing-orders";
export const WORKERY_ONGOING_ORDER_DETAIL_API_URL =
  HTTP_API_SERVER + "/api/v1/ongoing-order/";
export const WORKERY_ONGOING_ORDER_COMMENT_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/ongoing-order-comments";
export const WORKERY_ONGOING_ORDER_RETRIEVE_UPDATE_API_URL =
  HTTP_API_SERVER + "/api/v1/v2/ongoing-order/XXX/";
export const WORKERY_STAFF_FILE_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/staff-files";
export const WORKERY_STAFF_FILE_ARCHIVE_API_URL =
  HTTP_API_SERVER + "/api/v1/staff-file/XXX/";
export const WORKERY_TAG_ITEM_SEARCH_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/v1/search";

/**
 * Job History
 */

export const WORKERY_JOB_HISTORY_LIST_API_URL =
  HTTP_API_SERVER + "/api/v1/job-history";
