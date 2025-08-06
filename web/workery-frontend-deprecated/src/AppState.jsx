import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  AtomEffect,
} from "recoil";
import { recoilPersist } from "recoil-persist";
import {
  DEFAULT_CLIENT_LIST_SORT_BY_VALUE,
  DEFAULT_ASSOCIATE_LIST_SORT_BY_VALUE,
  DEFAULT_CLIENT_STATUS_FILTER_OPTION,
  DEFAULT_ORDER_LIST_SORT_BY_VALUE,
  DEFAULT_TASK_ITEM_LIST_SORT_BY_VALUE,
  DEFAULT_STAFF_LIST_SORT_BY_VALUE,
  DEFAULT_COMMENT_LIST_SORT_BY_VALUE,
} from "./Constants/App";

import {
  CLIENT_PHONE_TYPE_LANDLINE,
  CLIENT_PHONE_TYPE_MOBILE,
  ASSOCIATE_PHONE_TYPE_LANDLINE,
  ASSOCIATE_PHONE_TYPE_MOBILE,
  STAFF_PHONE_TYPE_LANDLINE,
  STAFF_PHONE_TYPE_MOBILE,
  LIST_VIEW_TYPE_TABULAR,
} from "./Constants/App";

// Control whether the hamburer menu icon was clicked or not. This state is
// needed by 'TopNavigation' an 'SideNavigation' components.
export const onHamburgerClickedState = atom({
  key: "onHamburgerClicked", // unique ID (with respect to other atoms/selectors)
  default: false, // default value (aka initial value)
});

// Control what message to display at the top as a banner in the app.
export const topAlertMessageState = atom({
  key: "topBannerAlertMessage",
  default: "",
});

// Control what type of message to display at the top as a banner in the app.
export const topAlertStatusState = atom({
  key: "topBannerAlertStatus",
  default: "success",
});

// https://github.com/polemius/recoil-persist
const { persistAtom } = recoilPersist();

export const currentUserState = atom({
  key: "currentUser",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const currentUserIsInactiveState = atom({
  key: "currentUserIsInactive",
  default: false,
  effects_UNSTABLE: [persistAtom],
});

export const currentOTPResponseState = atom({
  key: "currentOTPResponse",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

// ------------------------------------------------ Add ------------------------------------------------ //

export const ADD_CUSTOMER_STATE_DEFAULT = {
  type: 0,
  organizationName: "",
  organizationType: 0,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  phoneType: CLIENT_PHONE_TYPE_MOBILE,
  phoneExtension: "",
  otherPhone: "",
  otherPhoneType: CLIENT_PHONE_TYPE_LANDLINE,
  otherPhoneExtension: "",
  isOkToText: false,
  isOkToEmail: false,
  postalCode: "",
  addressLine1: "",
  addressLine2: "",
  city: "London",
  region: "Ontario",
  country: "Canada",
  hasShippingAddress: false,
  shippingName: "",
  shippingPhone: "",
  shippingCountry: "",
  shippingRegion: "",
  shippingCity: "",
  shippingAddressLine1: "",
  shippingAddressLine2: "",
  shippingPostalCode: "",
  tags: [],
  comments: [],
  gender: 0,
  genderOther: "",
  joinDate: new Date(),
  birthDate: null,
  howDidYouHearAboutUsID: "",
  isHowDidYouHearAboutUsOther: false,
  howDidYouHearAboutUsOther: "",
  additionalComment: "",
  identifyAs: [],
  preferredLanguage: "English",
  password: "",
  passwordRepeated: "",
};

export const addCustomerState = atom({
  key: "addCustomer",
  default: ADD_CUSTOMER_STATE_DEFAULT,
  effects_UNSTABLE: [persistAtom],
});

export const ADD_ASSOCIATE_STATE_DEFAULT = {
  type: 0,
  organizationName: "",
  organizationType: 0,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  phoneType: ASSOCIATE_PHONE_TYPE_MOBILE,
  phoneExtension: "",
  otherPhone: "",
  otherPhoneType: ASSOCIATE_PHONE_TYPE_LANDLINE,
  otherPhoneExtension: "",
  isOkToText: false,
  isOkToEmail: false,
  postalCode: "",
  addressLine1: "",
  addressLine2: "",
  city: "London",
  region: "Ontario",
  country: "Canada",
  hasShippingAddress: false,
  shippingName: "",
  shippingPhone: "",
  shippingCountry: "",
  shippingRegion: "",
  shippingCity: "",
  shippingAddressLine1: "",
  shippingAddressLine2: "",
  shippingPostalCode: "",
  tags: [],
  comments: [],
  gender: 0,
  genderOther: "",
  joinDate: new Date(),
  birthDate: null,
  howDidYouHearAboutUsID: "",
  isHowDidYouHearAboutUsOther: false,
  howDidYouHearAboutUsOther: "",
  additionalComment: "",
  skillSets: [],
  insuranceRequirements: [],
  hourlySalaryDesired: [],
  limitSpecial: "",
  duesDate: "",
  commercialInsuranceExpiryDate: "",
  autoInsuranceExpiryDate: "",
  wsibNumber: "",
  wsibInsuranceDate: "",
  policeCheck: "",
  taxId: "",
  driversLicenseClass: "",
  vehicleTypes: [],
  serviceFeeId: "",
  isServiceFeeOther: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactTelephone: "",
  emergencyContactAlternativeTelephone: "",
  description: "",
  preferredLanguage: "English",
  identifyAs: [],
  isJobSeeker: "",
  statusInCountry: "",
  statusInCountryOther: "",
  countryOfOrigin: "",
  dateOfEntryIntoCountry: "",
  maritalStatus: "",
  maritalStatusOther: "",
  accomplishedEducation: "",
  accomplishedEducationOther: "",
  password: "",
  passwordRepeated: "",
};

export const addAssociateState = atom({
  key: "addAssociate",
  default: ADD_ASSOCIATE_STATE_DEFAULT,
  effects_UNSTABLE: [persistAtom],
});

export const ADD_ORDER_STATE_DEFAULT = {
  customerID: "",
  startDate: null,
  isOngoing: 2,
  isHomeSupportService: 2,
  skillSets: [],
  additonalComment: "",
  tags: [],
};

export const addOrderState = atom({
  key: "addCustomer",
  default: ADD_ORDER_STATE_DEFAULT,
  effects_UNSTABLE: [persistAtom],
});

export const ADD_TASK_ITEM_ASSIGN_ASSOCIATE_STATE_DEFAULT = {
  status: 0,
  comment: "",
  associateID: "",
  associateName: "",
  associatePhone: "",
  associateEmail: "",
  associateOrganizationName: "",
  associateContactsLast30Days: 0,
  associateWsibNumber: "",
  associateHourlySalaryDesired: 0,
  associateSkillSets: [],
  howWasJobAccepted: 0,
  whyJobDeclined: 0,
  predefinedComment: "",
};

export const addTaskItemAssignAssociateState = atom({
  key: "addTaskItemAssignAssociate",
  default: ADD_TASK_ITEM_ASSIGN_ASSOCIATE_STATE_DEFAULT,
  effects_UNSTABLE: [persistAtom],
});

export const ADD_TASK_ITEM_ORDER_COMPLETION_STATE_DEFAULT = {
  wasCompleted: 0, //0=unselected, 1=Yes, 2=No
  reason: 0,
  reasonOther: "",
  completionDate: null,
  reasonComment: "",
  visits: 1,
  closingReasonComment: "",

  hasInputtedFinancials: 0,
  invoicePaidTo: 0,
  paymentStatus: 0,
  completionDate: null,
  invoiceDate: null,
  invoiceIDs: "",
  invoiceQuotedLabourAmount: "",
  invoiceQuotedMaterialAmount: "",
  invoiceQuotedOtherCostsAmount: 0,
  invoiceTotalQuoteAmount: "",
  invoiceLabourAmount: "",
  invoiceMaterialAmount: "",
  invoiceOtherCostsAmount: 0,
  invoiceTaxAmount: 0,
  invoiceIsCustomTaxAmount: false,
  invoiceTotalAmount: "",
  invoiceDepositAmount: 0,
  invoiceAmountDue: "",
  invoiceServiceFeeID: "",
  invoiceServiceFeePercentage: 0,
  invoiceServiceFee: null,
  invoiceServiceFeeOther: "",
  isInvoiceServiceFeeOther: 0,
  invoiceServiceFeeAmount: "",
  invoiceServiceFeeDateClientPaidInvoice: "",
  invoiceActualServiceFeeAmountPaid: 0,
  invoiceBalanceOwingAmount: "",
  paymentMethods: [],
};

export const addTaskItemOrderCompletionState = atom({
  key: "addTaskItemOrderCompletion",
  default: ADD_TASK_ITEM_ORDER_COMPLETION_STATE_DEFAULT,
  effects_UNSTABLE: [persistAtom],
});

export const ADD_TASK_ITEM_SURVEY_STATE_DEFAULT = {
  wasSurveyConducted: 0, //0=unselected, 1=Yes, 2=No
  noSurveyConductedReason: 0,
  noSurveyConductedReasonOther: "",
  comment: "",
  wasJobSatisfactory: 0,
  wasJobFinishedOnTimeAndOnBudget: 0,
  wasAssociatePunctual: 0,
  wasAssociateProfessional: 0,
  wouldCustomerReferOurOrganization: 0,
};

export const addTaskItemSurveyState = atom({
  key: "addTaskItemSurvey",
  default: ADD_TASK_ITEM_SURVEY_STATE_DEFAULT,
  effects_UNSTABLE: [persistAtom],
});

export const ADD_STAFF_STATE_DEFAULT = {
  type: 0,
  organizationName: "",
  organizationType: 0,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  phoneType: STAFF_PHONE_TYPE_MOBILE,
  phoneExtension: "",
  otherPhone: "",
  otherPhoneType: STAFF_PHONE_TYPE_LANDLINE,
  otherExtension: "",
  isOkToText: false,
  isOkToEmail: false,
  postalCode: "",
  addressLine1: "",
  addressLine2: "",
  city: "London",
  region: "Ontario",
  country: "Canada",
  hasShippingAddress: false,
  shippingName: "",
  shippingPhone: "",
  shippingCountry: "",
  shippingRegion: "",
  shippingCity: "",
  shippingAddressLine1: "",
  shippingAddressLine2: "",
  shippingPostalCode: "",
  tags: [],
  comments: [],
  gender: 0,
  genderOther: "",
  joinDate: new Date(),
  birthDate: null,
  howDidYouHearAboutUsID: "",
  isHowDidYouHearAboutUsOther: false,
  howDidYouHearAboutUsOther: "",
  additionalComment: "",
  skillSets: [],
  insuranceRequirements: [],
  hourlySalaryDesired: [],
  limitSpecial: "",
  duesDate: "",
  commercialInsuranceExpiryDate: "",
  autoInsuranceExpiryDate: "",
  wsibNumber: "",
  wsibInsuranceDate: "",
  policeCheck: "",
  taxId: "",
  driversLicenseClass: "",
  vehicleTypes: [],
  serviceFeeId: "",
  isServiceFeeOther: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactTelephone: "",
  emergencyContactAlternativeTelephone: "",
  description: "",
  preferredLanguage: "English",
  identifyAs: [],
  password: "",
  passwordRepeated: "",
};

export const addStaffState = atom({
  key: "addStaff",
  default: ADD_STAFF_STATE_DEFAULT,
  effects_UNSTABLE: [persistAtom],
});

// ------------------------------------------------ Operations ------------------------------------------------ //

export const TRANSFER_ORDER_OPERATION_STATE_DEFAULT = {
  pickedAssociateID: "",
  pickedAssociateName: "",
  associateIsAdvancedFiltering: false,
  associateEmail: "",
  associatePhone: "",
  associateFirstName: "",
  associateLastName: "",
  associateSearch: "",
  pickedClientID: "",
  pickedClientName: "",
  clientIsAdvancedFiltering: false,
  clientEmail: "",
  clientPhone: "",
  clientFirstName: "",
  clientLastName: "",
  clientSearch: "",
};

export const transferOrderOperationState = atom({
  key: "transferOrderOperation",
  default: TRANSFER_ORDER_OPERATION_STATE_DEFAULT,
  effects_UNSTABLE: [persistAtom],
});

export const GENERATE_INVOICE_STATE_DEFAULT = {
  invoiceId: "",
  invoiceDate: null,
  associateName: "",
  associateTelephone: "",
  associateTaxId: "",
  customerName: "",
  customerAddress: "",
  customerEmail: "",

  invoiceId: "",
  line01Quantity: "",
  line01Description: "",
  line01UnitPrice: "",
  line01Amount: "",
  line02Quantity: "",
  line02Description: "",
  line02UnitPrice: "",
  line02Amount: "",
  line03Quantity: "",
  line03Description: "",
  line03UnitPrice: "",
  line03Amount: "",
  line04Quantity: "",
  line04Description: "",
  line04UnitPrice: "",
  line04Amount: "",
  line05Quantity: "",
  line05Description: "",
  line05UnitPrice: "",
  line05Amount: "",
  line06Quantity: "",
  line06Description: "",
  line06UnitPrice: "",
  line06Amount: "",
  line07Quantity: "",
  line07Description: "",
  line07UnitPrice: "",
  line07Amount: "",
  line08Quantity: "",
  line08Description: "",
  line08UnitPrice: "",
  line08Amount: "",
  line09Quantity: "",
  line09Description: "",
  line09UnitPrice: "",
  line09Amount: "",
  line10Quantity: "",
  line10Description: "",
  line10UnitPrice: "",
  line10Amount: "",
  line11Quantity: "",
  line11Description: "",
  line11UnitPrice: "",
  line11Amount: "",
  line12Quantity: "",
  line12Description: "",
  line12UnitPrice: "",
  line12Amount: "",
  line13Quantity: "",
  line13Description: "",
  line13UnitPrice: "",
  line13Amount: "",
  line14Quantity: "",
  line14Description: "",
  line14UnitPrice: "",
  line14Amount: "",
  line15Quantity: "",
  line15Description: "",
  line15UnitPrice: "",
  line15Amount: "",

  invoiceLabourAmount: "",
  invoiceMaterialAmount: "",
  invoiceOtherCostsAmount: "",
  invoiceTaxAmount: 0,
  invoiceIsCustomTaxAmount: false,
  invoiceTotalAmount: "",
  invoiceDepositAmount: "",
  invoiceAmountDue: "",
  invoiceQuoteDays: 30, // Set default for 30 days.
  associateTaxId: "",
  invoiceQuoteDate: null,
  invoiceCustomersApproval: "",
  line01Notes: "",
  line02Notes: "",
  dateClientPaidInvoice: null,
  paymentMethods: [],
  clientSignature: "",
  associateSignDate: null,
  associateSignature: "",
};

export const generateOrderInvoiceState = atom({
  key: "generateOrderInvoice",
  default: GENERATE_INVOICE_STATE_DEFAULT,
  effects_UNSTABLE: [persistAtom],
});

export const regenerateOrderInvoiceState = atom({
  key: "regenerateOrderInvoice",
  default: GENERATE_INVOICE_STATE_DEFAULT,
  effects_UNSTABLE: [persistAtom],
});

// ------------------------------------------------ Detail ------------------------------------------------ //

// Used to store the task item detail so we don't have to make an API call again.
export const taskItemDetailState = atom({
  key: "taskItemDetail",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const orderDetailState = atom({
  key: "orderDetail",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const bulletinDetailState = atom({
  key: "bulletinDetail",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const taskItemActiveCountState = atom({
  key: "taskItemActiveCount",
  default: 0,
  effects_UNSTABLE: [persistAtom],
});

// ------------------------------------------------ Filter ------------------------------------------------ //

// Clients

export const clientFilterJoinDatetState = atom({
  key: "clientFilterJoinDatet",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const clientFilterStatusState = atom({
  key: "clientFilterStatus",
  default: 1, // 1=active
  effects_UNSTABLE: [persistAtom],
});

export const clientFilterTypeState = atom({
  key: "clientFilterType",
  default: 0,
  effects_UNSTABLE: [persistAtom],
});

export const clientFilterSortState = atom({
  key: "clientFilterSort",
  default: DEFAULT_CLIENT_LIST_SORT_BY_VALUE,
  effects_UNSTABLE: [persistAtom],
});

export const clientListViewTypeState = atom({
  key: "clientListViewType",
  default: LIST_VIEW_TYPE_TABULAR,
  effects_UNSTABLE: [persistAtom],
});

export const clientListSeeAllFiltersState = atom({
  key: "clientListSeeAllFilters",
  default: false,
  effects_UNSTABLE: [persistAtom],
});

// Asssociates

export const associateFilterJoinDatetState = atom({
  key: "associateFilterJoinDatet",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const associateFilterStatusState = atom({
  key: "associateFilterStatus",
  default: 1, // 1=active
  effects_UNSTABLE: [persistAtom],
});

export const associateFilterTypeState = atom({
  key: "associateFilterType",
  default: 0,
  effects_UNSTABLE: [persistAtom],
});

export const associateFilterSortState = atom({
  key: "associateFilterSort",
  default: DEFAULT_ASSOCIATE_LIST_SORT_BY_VALUE,
  effects_UNSTABLE: [persistAtom],
});

export const associateListViewTypeState = atom({
  key: "associateListViewType",
  default: LIST_VIEW_TYPE_TABULAR,
  effects_UNSTABLE: [persistAtom],
});

export const associateListSeeAllFiltersState = atom({
  key: "associateListSeeAllFilters",
  default: false,
  effects_UNSTABLE: [persistAtom],
});

// Orders

export const orderFilterJoinDatetState = atom({
  key: "orderFilterJoinDatet",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const orderFilterStatusState = atom({
  key: "orderFilterStatus",
  default: 0, // 0=All
  effects_UNSTABLE: [persistAtom],
});

export const orderFilterTypeState = atom({
  key: "orderFilterType",
  default: 0,
  effects_UNSTABLE: [persistAtom],
});

export const orderFilterSortState = atom({
  key: "orderFilterSort",
  default: DEFAULT_ORDER_LIST_SORT_BY_VALUE,
  effects_UNSTABLE: [persistAtom],
});

export const orderListViewTypeState = atom({
  key: "orderListViewType",
  default: LIST_VIEW_TYPE_TABULAR,
  effects_UNSTABLE: [persistAtom],
});

export const orderListSeeAllFiltersState = atom({
  key: "orderListSeeAllFilters",
  default: false,
  effects_UNSTABLE: [persistAtom],
});

// Task Items

export const taskItemFilterJoinDatetState = atom({
  key: "taskItemFilterJoinDatet",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const taskItemFilterStatusState = atom({
  key: "taskItemFilterStatus",
  default: 0, // 0=All
  effects_UNSTABLE: [persistAtom],
});

export const taskItemFilterTypeState = atom({
  key: "taskItemFilterType",
  default: 0,
  effects_UNSTABLE: [persistAtom],
});

export const taskItemFilterIsClosedState = atom({
  key: "taskItemFilterIsClosed",
  default: 2, //0=all, 1=true, 2=false
  effects_UNSTABLE: [persistAtom],
});

export const taskItemFilterSortState = atom({
  key: "taskItemFilterSortState",
  default: DEFAULT_TASK_ITEM_LIST_SORT_BY_VALUE,
  effects_UNSTABLE: [persistAtom],
});

export const taskItemListViewTypeState = atom({
  key: "taskItemListViewType",
  default: LIST_VIEW_TYPE_TABULAR,
  effects_UNSTABLE: [persistAtom],
});

export const taskItemListSeeAllFiltersState = atom({
  key: "taskItemListSeeAllFilters",
  default: false,
  effects_UNSTABLE: [persistAtom],
});

// Bulletins

export const bulletinFilterJoinDatetState = atom({
  key: "bulletinFilterJoinDatet",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const bulletinFilterStatusState = atom({
  key: "bulletinFilterStatus",
  default: 1, // 1=active
  effects_UNSTABLE: [persistAtom],
});

export const bulletinFilterTypeState = atom({
  key: "bulletinFilterType",
  default: 0,
  effects_UNSTABLE: [persistAtom],
});

export const bulletinFilterSortState = atom({
  key: "bulletinFilterSort",
  default: "created_at,ASC",
  effects_UNSTABLE: [persistAtom],
});

// Tags

export const tagFilterJoinDatetState = atom({
  key: "tagFilterJoinDatet",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const tagFilterStatusState = atom({
  key: "tagFilterStatus",
  default: 1, // 1=active
  effects_UNSTABLE: [persistAtom],
});

export const tagFilterTypeState = atom({
  key: "tagFilterType",
  default: 0,
  effects_UNSTABLE: [persistAtom],
});

export const tagFilterSortState = atom({
  key: "tagFilterSort",
  default: "created_at,ASC",
  effects_UNSTABLE: [persistAtom],
});

// Insurance Requirement

export const insuranceRequirementFilterJoinDatetState = atom({
  key: "insuranceRequirementFilterJoinDatet",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const insuranceRequirementFilterStatusState = atom({
  key: "insuranceRequirementFilterStatus",
  default: 1, // 1=active
  effects_UNSTABLE: [persistAtom],
});

export const insuranceRequirementFilterTypeState = atom({
  key: "insuranceRequirementFilterType",
  default: 0,
  effects_UNSTABLE: [persistAtom],
});

export const insuranceRequirementFilterSortState = atom({
  key: "insuranceRequirementFilterSort",
  default: "created_at,ASC",
  effects_UNSTABLE: [persistAtom],
});

// Inactive Client

export const inactiveClientFilterJoinDatetState = atom({
  key: "inactiveClientFilterJoinDatet",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const inactiveClientFilterStatusState = atom({
  key: "inactiveClientFilterStatus",
  default: 1, // 1=active
  effects_UNSTABLE: [persistAtom],
});

export const inactiveClientFilterTypeState = atom({
  key: "inactiveClientFilterType",
  default: 0,
  effects_UNSTABLE: [persistAtom],
});

export const inactiveClientFilterSortState = atom({
  key: "inactiveClientFilterSort",
  default: "join_date,DESC",
  effects_UNSTABLE: [persistAtom],
});

// Vehicle Type

export const vehicleTypeFilterJoinDatetState = atom({
  key: "vehicleTypeFilterJoinDatet",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const vehicleTypeFilterStatusState = atom({
  key: "vehicleTypeFilterStatus",
  default: 1, // 1=active
  effects_UNSTABLE: [persistAtom],
});

export const vehicleTypeFilterTypeState = atom({
  key: "vehicleTypeFilterType",
  default: 0,
  effects_UNSTABLE: [persistAtom],
});

export const vehicleTypeFilterSortState = atom({
  key: "vehicleTypeFilterSort",
  default: "created_at,ASC",
  effects_UNSTABLE: [persistAtom],
});

// Staff

export const staffFilterJoinDatetState = atom({
  key: "staffFilterJoinDatet",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const staffFilterStatusState = atom({
  key: "staffFilterStatus",
  default: 1, // 1=active
  effects_UNSTABLE: [persistAtom],
});

export const staffFilterTypeState = atom({
  key: "staffFilterType",
  default: 0,
  effects_UNSTABLE: [persistAtom],
});

export const staffFilterSortState = atom({
  key: "staffFilterSort",
  default: DEFAULT_STAFF_LIST_SORT_BY_VALUE,
  effects_UNSTABLE: [persistAtom],
});

export const staffListViewTypeState = atom({
  key: "staffListViewType",
  default: LIST_VIEW_TYPE_TABULAR,
  effects_UNSTABLE: [persistAtom],
});

export const staffListSeeAllFiltersState = atom({
  key: "staffListSeeAllFilters",
  default: false,
  effects_UNSTABLE: [persistAtom],
});

// Comments

export const commentFilterJoinDatetState = atom({
  key: "commentFilterJoinDatet",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const commentFilterStatusState = atom({
  key: "commentFilterStatus",
  default: 1, // 1=active
  effects_UNSTABLE: [persistAtom],
});

export const commentFilterTypeState = atom({
  key: "commentFilterType",
  default: 0,
  effects_UNSTABLE: [persistAtom],
});

export const commentFilterSortState = atom({
  key: "commentFilterSort",
  default: DEFAULT_COMMENT_LIST_SORT_BY_VALUE,
  effects_UNSTABLE: [persistAtom],
});

// Incidents

export const incidentFilterJoinDatetState = atom({
  key: "incidentFilterJoinDatet",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const incidentFilterStatusState = atom({
  key: "incidentFilterStatus",
  default: 1, // 1=active
  effects_UNSTABLE: [persistAtom],
});

export const incidentFilterTypeState = atom({
  key: "incidentFilterType",
  default: 0,
  effects_UNSTABLE: [persistAtom],
});

export const incidentFilterSortState = atom({
  key: "incidentFilterSort",
  default: DEFAULT_CLIENT_LIST_SORT_BY_VALUE,
  effects_UNSTABLE: [persistAtom],
});

export const incidentListViewTypeState = atom({
  key: "incidentListViewType",
  default: LIST_VIEW_TYPE_TABULAR,
  effects_UNSTABLE: [persistAtom],
});

export const incidentListSeeAllFiltersState = atom({
  key: "incidentListSeeAllFilters",
  default: false,
  effects_UNSTABLE: [persistAtom],
});

// ------------------------------------------------ Register ------------------------------------------------ //

export const REGISTER_JOB_SEEKER_STATE_DEFAULT = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  phoneType: CLIENT_PHONE_TYPE_MOBILE,
  otherPhone: "",
  otherPhoneType: CLIENT_PHONE_TYPE_LANDLINE,
  isOkToText: false,
  isOkToEmail: false,
  postalCode: "",
  addressLine1: "",
  addressLine2: "",
  city: "London",
  region: "Ontario",
  country: "Canada",
  hasShippingAddress: false,
  shippingName: "",
  shippingPhone: "",
  shippingCountry: "",
  shippingRegion: "",
  shippingCity: "",
  shippingAddressLine1: "",
  shippingAddressLine2: "",
  shippingPostalCode: "",
  tags: [],
  comments: [],
  gender: 0,
  genderOther: "",
  joinDate: new Date(),
  birthDate: null,
  howDidYouHearAboutUsID: "",
  isHowDidYouHearAboutUsOther: false,
  howDidYouHearAboutUsOther: "",
  additionalComment: "",
  identifyAs: [],
  password: "",
  passwordRepeated: "",
};

export const registerJobSeekerState = atom({
  key: "registerJobSeeker",
  default: REGISTER_JOB_SEEKER_STATE_DEFAULT,
  effects_UNSTABLE: [persistAtom],
});
