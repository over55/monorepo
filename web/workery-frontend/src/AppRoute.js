import { React, useState } from "react";
import "bulma/css/bulma.min.css";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RecoilRoot } from "recoil";

// System, Login, Register, Index, etc
import Login from "./Components/Gateway/Login";
import TwoFactorAuthenticationWizardStep1 from "./Components/Gateway/2FA/Step1";
import TwoFactorAuthenticationWizardStep2 from "./Components/Gateway/2FA/Step2";
import TwoFactorAuthenticationWizardStep3 from "./Components/Gateway/2FA/Step3";
import TwoFactorAuthenticationBackupCodeGenerate from "./Components/Gateway/2FA/BackupCodeGenerate";
import TwoFactorAuthenticationBackupCodeRecovery from "./Components/Gateway/2FA/BackupCodeRecovery";
import TwoFactorAuthenticationValidateOnLogin from "./Components/Gateway/2FA/ValidateOnLogin";
import IndexStaticPage from "./Components/Gateway/Index";
import RegisterStart from "./Components/Gateway/Register/Start";
import RegisterJobSeekerStep1 from "./Components/Gateway/Register/JobSeeker/Step1";
import RegisterEmployerStep1 from "./Components/Gateway/Register/Employer/Step1";
import TopAlertBanner from "./Components/Misc/TopAlertBanner";
import Sidebar from "./Components/Menu/Sidebar";
import Topbar from "./Components/Menu/Top";
import NotFoundError from "./Components/Misc/NotFoundError";
import NotImplementedError from "./Components/Misc/NotImplementedError";
import ForgotPassword from "./Components/Gateway/ForgotPassword";
import PasswordReset from "./Components/Gateway/PasswordReset";
import PrivacyStaticPage from "./Components/Misc/Privacy";
import TermsOfServiceStaticPage from "./Components/Misc/TOS";
import DashboardHelp from "./Components/Misc/DashboardHelp";

// Account
import AccountDetail from "./Components/Account/Detail/View";
import AccountUpdate from "./Components/Account/Update/View";
import AccountTwoFactorAuthenticationDetail from "./Components/Account/2FA/View";
import AccountEnableTwoFactorAuthenticationStep1 from "./Components/Account/2FA/EnableStep1View";
import AccountEnableTwoFactorAuthenticationStep2 from "./Components/Account/2FA/EnableStep2View";
import AccountEnableTwoFactorAuthenticationStep3 from "./Components/Account/2FA/EnableStep3View";
import AccountTwoFactorAuthenticationBackupCodeGenerate from "./Components/Account/2FA/BackupCodeGenerateView";
import AccountMoreLaunchpad from "./Components/Account/More/LaunchpadView";
import AccountMoreOperationChangePassword from "./Components/Account/More/Operation/ChangePassword/View";

// Root
import RootDashboard from "./Components/Root/Dashboard";
import RootTenantList from "./Components/Root/Tenant/List";
import RootTenantDetail from "./Components/Root/Tenant/Detail";
import RootTenantUpdate from "./Components/Root/Tenant/Update";
import ToTenantRedirector from "./Components/Root/ToTenantRedirector";

// Redirectors.
import AnonymousCurrentUserRedirector from "./Components/Misc/AnonymousCurrentUserRedirector";
import TwoFactorAuthenticationRedirector from "./Components/Misc/TwoFactorAuthenticationRedirector";
import LogoutRedirector from "./Components/Gateway/LogoutRedirector";
import AutoLogoutAfterInactivityRedirector from "./Components/Misc/AutoLogoutAfterInactivityRedirector";

// Associate Dashboard
import AssociateDashboard from "./Components/Associate/Dashboard/View";

// Associate Order
// import AssociateOrderUpdate from "./Components/Associate/Order/Detail/Update/Update";
// import AssociateOrderAddStep4 from "./Components/Associate/Order/Add/Step4";
// import AssociateOrderAddStep3 from "./Components/Associate/Order/Add/Step3";
// import AssociateOrderAddStep2 from "./Components/Associate/Order/Add/Step2";
// import AssociateOrderAddStep2Launchpad from "./Components/Associate/Order/Add/Step2Launchpad";
// import AssociateOrderAddStep1PartB from "./Components/Associate/Order/Add/Step1PartB";
// import AssociateOrderAddStep1PartA from "./Components/Associate/Order/Add/Step1PartA";
// import AssociateOrderMoreIncidentDetail from "./Components/Associate/Order/Detail/More/Incident/Detail/View";
// import AssociateOrderMoreIncidentCreate from "./Components/Associate/Order/Detail/More/Incident/Create/View";
// import AssociateOrderMoreIncidentList from "./Components/Associate/Order/Detail/More/Incident/List/View";
// import AssociateOrderMoreTransferOperationStep5 from "./Components/Associate/Order/Detail/More/Transfer/OperationStep5";
// import AssociateOrderMoreTransferOperationStep4 from "./Components/Associate/Order/Detail/More/Transfer/OperationStep4";
// import AssociateOrderMoreTransferOperationStep3 from "./Components/Associate/Order/Detail/More/Transfer/OperationStep3";
// import AssociateOrderMoreTransferOperationStep2 from "./Components/Associate/Order/Detail/More/Transfer/OperationStep2";
// import AssociateOrderMoreTransferOperationStep1 from "./Components/Associate/Order/Detail/More/Transfer/OperationStep1";
// import AssociateOrderMorePostponeOperation from "./Components/Associate/Order/Detail/More/Postpone/operation";
// import AssociateOrderMoreCloseOperation from "./Components/Associate/Order/Detail/More/Close/operation";
// import AssociateOrderMoreUnassignOperation from "./Components/Associate/Order/Detail/More/Unassign/Operation";
// import AssociateOrderMoreDeleteOperation from "./Components/Associate/Order/Detail/More/Delete/Operation";
// import AssociateOrderMore from "./Components/Associate/Order/Detail/More/More";
// import AssociateOrderAttachmentAdd from "./Components/Associate/Order/Detail/Attachment/Add";
// import AssociateOrderAttachmentDetail from "./Components/Associate/Order/Detail/Attachment/Detail";
// import AssociateOrderAttachmentUpdate from "./Components/Associate/Order/Detail/Attachment/Update";
// import AssociateOrderAttachmentList from "./Components/Associate/Order/Detail/Attachment/List";
// import AssociateOrderCommentList from "./Components/Associate/Order/Detail/Comment/List";
// import AssociateOrderTaskList from "./Components/Associate/Order/Detail/Task/List";
// import AssociateOrderActivitySheetList from "./Components/Associate/Order/Detail/ActivitySheet/List";
// import AssociateOrderSearchResult from "./Components/Associate/Order/Search/Result";
// import AssociateOrderSearch from "./Components/Associate/Order/Search/Search";
import AssociateOrderDetailFull from "./Components/Associate/Order/Detail/Full";
import AssociateOrderDetailLite from "./Components/Associate/Order/Detail/Lite";
import AssociateOrderList from "./Components/Associate/Order/List/View";

// Associate Financial
// import AssociateFinancialMoreCloneOperation from "./Components/Associate/Financial/Detail/More/Clone/Clone";
// import AssociateFinancialMore from "./Components/Associate/Financial/Detail/More/More";
import AssociateFinancialGenerateInvoiceStep4 from "./Components/Associate/Financial/Detail/Invoice/Generate/Step4";
import AssociateFinancialGenerateInvoiceStep3 from "./Components/Associate/Financial/Detail/Invoice/Generate/Step3";
import AssociateFinancialGenerateInvoiceStep2 from "./Components/Associate/Financial/Detail/Invoice/Generate/Step2";
import AssociateFinancialGenerateInvoiceStep1 from "./Components/Associate/Financial/Detail/Invoice/Generate/Step1";
// import AssociateFinancialUpdate from "./Components/Associate/Financial/Update/View";
import AssociateFinancialInvoiceDetail from "./Components/Associate/Financial/Detail/Invoice/Detail";
import AssociateFinancialDetailFull from "./Components/Associate/Financial/Detail/Full";
import AssociateFinancialList from "./Components/Associate/Financial/List/List";

// Associate Customers
import AssociateClientList from "./Components/Associate/Client/List/View";
import AssociateClientDetailLite from "./Components/Associate/Client/Detail/LiteView";
import AssociateClientDetailFull from "./Components/Associate/Client/Detail/FullView";
import AssociateClientDetailOrderList from "./Components/Associate/Client/Detail/Order/ListView";

// Customer Dashboard
import CustomerDashboard from "./Components/Customer/Dashboard/View";

// Customer Order
import CustomerOrderDetailFull from "./Components/Customer/Order/Detail/Full";
import CustomerOrderDetailLite from "./Components/Customer/Order/Detail/Lite";
import CustomerOrderList from "./Components/Customer/Order/List/View";

// Customer Financial
// import CustomerFinancialMoreCloneOperation from "./Components/Customer/Financial/Detail/More/Clone/Clone";
// import CustomerFinancialMore from "./Components/Customer/Financial/Detail/More/More";
import CustomerFinancialGenerateInvoiceStep4 from "./Components/Customer/Financial/Detail/Invoice/Generate/Step4";
import CustomerFinancialGenerateInvoiceStep3 from "./Components/Customer/Financial/Detail/Invoice/Generate/Step3";
import CustomerFinancialGenerateInvoiceStep2 from "./Components/Customer/Financial/Detail/Invoice/Generate/Step2";
import CustomerFinancialGenerateInvoiceStep1 from "./Components/Customer/Financial/Detail/Invoice/Generate/Step1";
// import CustomerFinancialUpdate from "./Components/Customer/Financial/Update/View";
import CustomerFinancialInvoiceDetail from "./Components/Customer/Financial/Detail/Invoice/Detail";
import CustomerFinancialDetailFull from "./Components/Customer/Financial/Detail/Full";
import CustomerFinancialList from "./Components/Customer/Financial/List/List";

// Customer Associates
import ClientAssociateList from "./Components/Customer/Associate/List/View";
import ClientAssociateDetailLite from "./Components/Customer/Associate/Detail/LiteView";
import ClientAssociateDetailFull from "./Components/Customer/Associate/Detail/FullView";
import ClientAssociateDetailOrderList from "./Components/Customer/Associate/Detail/Order/ListView";

// Job Seeker Dashboard
import JobSeekerDashboard from "./Components/JobSeeker/Dashboard/View";

// Admin Dashboard, Help
import AdminSettingHowHearAboutUsItemList from "./Components/Admin/Setting/HowHearAboutUsItem/List";
import AdminSettingVehicleTypeList from "./Components/Admin/Setting/VehicleType/List";
import AdminSettingInactiveClientList from "./Components/Admin/Setting/InactiveClient/List";
import AdminSettingServiceFeeList from "./Components/Admin/Setting/ServiceFee/List";
import AdminSettingInsuranceRequirementList from "./Components/Admin/Setting/InsuranceRequirement/List";
import AdminSettingAssociateAwayLogList from "./Components/Admin/Setting/AssociateAwayLog/List";
import AdminSettingTagList from "./Components/Admin/Setting/Tag/List";
import AdminSettingSkillSetList from "./Components/Admin/Setting/SkillSet/List";
import AdminSettingBulletinList from "./Components/Admin/Setting/Bulletin/List";
import AdminSettingLaunchpad from "./Components/Admin/Setting/Launchpad";
import AdminDashboard from "./Components/Admin/Dashboard/View";
import AdminDashboardCommentList from "./Components/Admin/Dashboard/Comments/List";
import AdminFinancialMoreCloneOperation from "./Components/Admin/Financial/Detail/More/Clone/Clone";
import AdminFinancialMore from "./Components/Admin/Financial/Detail/More/More";
import AdminFinancialGenerateInvoiceStep4 from "./Components/Admin/Financial/Detail/Invoice/Generate/Step4";
import AdminFinancialGenerateInvoiceStep3 from "./Components/Admin/Financial/Detail/Invoice/Generate/Step3";
import AdminFinancialGenerateInvoiceStep2 from "./Components/Admin/Financial/Detail/Invoice/Generate/Step2";
import AdminFinancialGenerateInvoiceStep1 from "./Components/Admin/Financial/Detail/Invoice/Generate/Step1";
import AdminFinancialUpdate from "./Components/Admin/Financial/Update/View";
import AdminFinancialInvoiceDetail from "./Components/Admin/Financial/Detail/Invoice/Detail";
import AdminFinancialDetailFull from "./Components/Admin/Financial/Detail/Full";
import AdminFinancialList from "./Components/Admin/Financial/List/List";

import AdminTaskItemCloseOperation from "./Components/Admin/TaskItem/Operation/Close/Close";
import AdminTaskItemPostponeOperation from "./Components/Admin/TaskItem/Operation/Postpone/Postpone";
import AdminTaskItemSurveyStep1 from "./Components/Admin/TaskItem/Update/Survey/Step1";
import AdminTaskItemSurveyStep2 from "./Components/Admin/TaskItem/Update/Survey/Step2";
import AdminTaskItemSurveyStep3 from "./Components/Admin/TaskItem/Update/Survey/Step3";
import AdminTaskItemOrderCompletionStep1 from "./Components/Admin/TaskItem/Update/OrderCompletion/Step1";
import AdminTaskItemOrderCompletionStep2 from "./Components/Admin/TaskItem/Update/OrderCompletion/Step2";
import AdminTaskItemOrderCompletionStep3 from "./Components/Admin/TaskItem/Update/OrderCompletion/Step3";
import AdminTaskItemOrderCompletionStep4 from "./Components/Admin/TaskItem/Update/OrderCompletion/Step4";
import AdminTaskItemOrderCompletionStep5 from "./Components/Admin/TaskItem/Update/OrderCompletion/Step5";
import AdminTaskItemAssignAssociateStep1 from "./Components/Admin/TaskItem/Update/AssignAssociate/Step1";
import AdminTaskItemAssignAssociateStep2 from "./Components/Admin/TaskItem/Update/AssignAssociate/Step2";
import AdminTaskItemAssignAssociateStep3 from "./Components/Admin/TaskItem/Update/AssignAssociate/Step3";
import AdminTaskItemAssignAssociateStep4 from "./Components/Admin/TaskItem/Update/AssignAssociate/Step4";
import AdminTaskItemList from "./Components/Admin/TaskItem/List/View";

import AdminOrderUpdate from "./Components/Admin/Order/Detail/Update/Update";
import AdminOrderAddStep4 from "./Components/Admin/Order/Add/Step4";
import AdminOrderAddStep3 from "./Components/Admin/Order/Add/Step3";
import AdminOrderAddStep2 from "./Components/Admin/Order/Add/Step2";
import AdminOrderAddStep2Launchpad from "./Components/Admin/Order/Add/Step2Launchpad";
import AdminOrderAddStep1PartB from "./Components/Admin/Order/Add/Step1PartB";
import AdminOrderAddStep1PartA from "./Components/Admin/Order/Add/Step1PartA";
import AdminOrderMoreIncidentDetail from "./Components/Admin/Order/Detail/More/Incident/Detail/View";
import AdminOrderMoreIncidentCreate from "./Components/Admin/Order/Detail/More/Incident/Create/View";
import AdminOrderMoreIncidentList from "./Components/Admin/Order/Detail/More/Incident/List/View";
import AdminOrderMoreTransferOperationStep5 from "./Components/Admin/Order/Detail/More/Transfer/OperationStep5";
import AdminOrderMoreTransferOperationStep4 from "./Components/Admin/Order/Detail/More/Transfer/OperationStep4";
import AdminOrderMoreTransferOperationStep3 from "./Components/Admin/Order/Detail/More/Transfer/OperationStep3";
import AdminOrderMoreTransferOperationStep2 from "./Components/Admin/Order/Detail/More/Transfer/OperationStep2";
import AdminOrderMoreTransferOperationStep1 from "./Components/Admin/Order/Detail/More/Transfer/OperationStep1";
import AdminOrderMorePostponeOperation from "./Components/Admin/Order/Detail/More/Postpone/operation";
import AdminOrderMoreCloseOperation from "./Components/Admin/Order/Detail/More/Close/operation";
import AdminOrderMoreUnassignOperation from "./Components/Admin/Order/Detail/More/Unassign/Operation";
import AdminOrderMoreDeleteOperation from "./Components/Admin/Order/Detail/More/Delete/Operation";
import AdminOrderMore from "./Components/Admin/Order/Detail/More/More";
import AdminOrderAttachmentAdd from "./Components/Admin/Order/Detail/Attachment/Add";
import AdminOrderAttachmentDetail from "./Components/Admin/Order/Detail/Attachment/Detail";
import AdminOrderAttachmentUpdate from "./Components/Admin/Order/Detail/Attachment/Update";
import AdminOrderAttachmentList from "./Components/Admin/Order/Detail/Attachment/List";
import AdminOrderCommentList from "./Components/Admin/Order/Detail/Comment/List";
import AdminOrderTaskList from "./Components/Admin/Order/Detail/Task/List";
import AdminOrderActivitySheetList from "./Components/Admin/Order/Detail/ActivitySheet/List";
import AdminOrderDetailFull from "./Components/Admin/Order/Detail/Full";
import AdminOrderDetailLite from "./Components/Admin/Order/Detail/Lite";
import AdminOrderSearchResult from "./Components/Admin/Order/Search/Result";
import AdminOrderSearch from "./Components/Admin/Order/Search/Search";
import AdminOrderList from "./Components/Admin/Order/List/View";

// Admin Order Incident
import AdminOrderIncidentList from "./Components/Admin/OrderIncident/List/View";
import AdminOrderIncidentCreate from "./Components/Admin/OrderIncident/Create/View";
import AdminOrderIncidentDetail from "./Components/Admin/OrderIncident/Detail/View";

import AdminClientList from "./Components/Admin/Client/List/View";
import AdminClientSearchResult from "./Components/Admin/Client/Search/Result";
import AdminClientSearch from "./Components/Admin/Client/Search/Search";
import AdminClientAddStep1PartA from "./Components/Admin/Client/Add/Step1PartA";
import AdminClientAddStep1PartB from "./Components/Admin/Client/Add/Step1PartB";
import AdminClientAddStep2 from "./Components/Admin/Client/Add/Step2";
import AdminClientAddStep3 from "./Components/Admin/Client/Add/Step3";
import AdminClientAddStep4 from "./Components/Admin/Client/Add/Step4";
import AdminClientAddStep5 from "./Components/Admin/Client/Add/Step5";
import AdminClientAddStep6 from "./Components/Admin/Client/Add/Step6";
import AdminClientDetailLite from "./Components/Admin/Client/Detail/LiteView";
import AdminClientDetailFull from "./Components/Admin/Client/Detail/FullView";
import AdminClientUpdate from "./Components/Admin/Client/Update/View";
import AdminClientDetailOrderList from "./Components/Admin/Client/Detail/Order/ListView";
import AdminClientDetailCommentList from "./Components/Admin/Client/Detail/Comment/ListView";
import AdminClientDetailAttachmentList from "./Components/Admin/Client/Detail/Attachment/List";
import AdminClientDetailMore from "./Components/Admin/Client/Detail/More/View";
import AdminClientDeleteOperation from "./Components/Admin/Client/Detail/More/Delete/View";
import AdminClientArchiveOperation from "./Components/Admin/Client/Detail/More/Archive/View";
import AdminClientUnarchiveOperation from "./Components/Admin/Client/Detail/More/Unarchive/View";
import AdminClientUpgradeOperation from "./Components/Admin/Client/Detail/More/Upgrade/View";
import AdminClientDowngradeOperation from "./Components/Admin/Client/Detail/More/Downgrade/View";
import AdminClientAvatarOperation from "./Components/Admin/Client/Detail/More/Avatar/View";
import AdminClientMoreOperationChangePassword from "./Components/Admin/Client/Detail/More/ChangePassword/View";
import AdminClientMoreOperation2FAToggle from "./Components/Admin/Client/Detail/More/2FA/ToggleView";
import AdminClientAttachmentAdd from "./Components/Admin/Client/Detail/Attachment/Add";
import AdminClientAttachmentDetail from "./Components/Admin/Client/Detail/Attachment/Detail";
import AdminClientAttachmentUpdate from "./Components/Admin/Client/Detail/Attachment/Update";
import AdminAssociateList from "./Components/Admin/Associate/List/View";
import AdminAssociateSearchResult from "./Components/Admin/Associate/Search/Result";
import AdminAssociateSearch from "./Components/Admin/Associate/Search/Search";
import AdminAssociateAddStep1PartA from "./Components/Admin/Associate/Add/Step1PartA";
import AdminAssociateAddStep1PartB from "./Components/Admin/Associate/Add/Step1PartB";
import AdminAssociateAddStep2 from "./Components/Admin/Associate/Add/Step2";
import AdminAssociateAddStep3 from "./Components/Admin/Associate/Add/Step3";
import AdminAssociateAddStep4 from "./Components/Admin/Associate/Add/Step4";
import AdminAssociateAddStep5 from "./Components/Admin/Associate/Add/Step5";
import AdminAssociateAddStep6 from "./Components/Admin/Associate/Add/Step6";
import AdminAssociateAddStep7 from "./Components/Admin/Associate/Add/Step7";
import AdminAssociateDetailLite from "./Components/Admin/Associate/Detail/LiteView";
import AdminAssociateDetailFull from "./Components/Admin/Associate/Detail/FullView";
import AdminAssociateUpdate from "./Components/Admin/Associate/Update/View";
import AdminAssociateDetailOrderList from "./Components/Admin/Associate/Detail/Order/List";
import AdminAssociateDetailCommentList from "./Components/Admin/Associate/Detail/Comment/ListView";
import AdminAssociateDetailAttachmentList from "./Components/Admin/Associate/Detail/Attachment/List";
import AdminAssociateDetailMore from "./Components/Admin/Associate/Detail/More/View";
import AdminAssociateDeleteOperation from "./Components/Admin/Associate/Detail/More/Delete/View";
import AdminAssociateArchiveOperation from "./Components/Admin/Associate/Detail/More/Archive/View";
import AdminAssociateUnarchiveOperation from "./Components/Admin/Associate/Detail/More/Unarchive/View";
import AdminAssociateUpgradeOperation from "./Components/Admin/Associate/Detail/More/Upgrade/View";
import AdminAssociateDowngradeOperation from "./Components/Admin/Associate/Detail/More/Downgrade/View";
import AdminAssociateAvatarOperation from "./Components/Admin/Associate/Detail/More/Avatar/View";
import AdminAssociateMoreOperationChangePassword from "./Components/Admin/Associate/Detail/More/ChangePassword/View";
import AdminAssociateMoreOperation2FAToggle from "./Components/Admin/Associate/Detail/More/2FA/ToggleView";
import AdminAssociateAttachmentAdd from "./Components/Admin/Associate/Detail/Attachment/Add";
import AdminAssociateAttachmentDetail from "./Components/Admin/Associate/Detail/Attachment/Detail";
import AdminAssociateAttachmentUpdate from "./Components/Admin/Associate/Detail/Attachment/Update";
import AdminStaffList from "./Components/Admin/Staff/List/View";
import AdminStaffSearchResult from "./Components/Admin/Staff/Search/Result";
import AdminStaffSearch from "./Components/Admin/Staff/Search/Search";
import AdminStaffAddStep1PartA from "./Components/Admin/Staff/Add/Step1PartA";
import AdminStaffAddStep1PartB from "./Components/Admin/Staff/Add/Step1PartB";
import AdminStaffAddStep2 from "./Components/Admin/Staff/Add/Step2";
import AdminStaffAddStep3 from "./Components/Admin/Staff/Add/Step3";
import AdminStaffAddStep4 from "./Components/Admin/Staff/Add/Step4";
import AdminStaffAddStep5 from "./Components/Admin/Staff/Add/Step5";
import AdminStaffAddStep6 from "./Components/Admin/Staff/Add/Step6";
import AdminStaffAddStep7 from "./Components/Admin/Staff/Add/Step7";
import AdminStaffDetailLite from "./Components/Admin/Staff/Detail/LiteView";
import AdminStaffDetailFull from "./Components/Admin/Staff/Detail/FullView";
import AdminStaffUpdate from "./Components/Admin/Staff/Update/Update";
import AdminStaffDetailCommentList from "./Components/Admin/Staff/Detail/Comment/ListView";
import AdminStaffDetailAttachmentList from "./Components/Admin/Staff/Attachment/List";
import AdminStaffAttachmentAdd from "./Components/Admin/Staff/Attachment/Add";
import AdminStaffAttachmentDetail from "./Components/Admin/Staff/Attachment/Detail";
import AdminStaffAttachmentUpdate from "./Components/Admin/Staff/Attachment/Update";
import AdminStaffDetailMore from "./Components/Admin/Staff/Detail/More/View";
import AdminStaffAvatarOperation from "./Components/Admin/Staff/Detail/More/Avatar/View";
import AdminStaffArchiveOperation from "./Components/Admin/Staff/Detail/More/Archive/View";
import AdminStaffUnarchiveOperation from "./Components/Admin/Staff/Detail/More/Unarchive/View";
import AdminStaffDeleteOperation from "./Components/Admin/Staff/Detail/More/Delete/View";
import AdminStaffUpgradeOperation from "./Components/Admin/Staff/Detail/More/Upgrade/View";
import AdminStaffDowngradeOperation from "./Components/Admin/Staff/Detail/More/Downgrade/View";
import AdminStaffMoreOperationChangePassword from "./Components/Admin/Staff/Detail/More/ChangePassword/View";
import AdminStaffMoreOperation2FAToggle from "./Components/Admin/Staff/Detail/More/2FA/ToggleView";
import AdminAssociateSkillSetSearch from "./Components/Admin/SkillSet/AssociateSearch";
import AdminAssociateSkillSetSearchResult from "./Components/Admin/SkillSet/AssociateSearchResult";
import AdminReportLaunchpad from "./Components/Admin/Report/Launchpad";
import AdminTaskItemCountBackgroundRefresher from "./Components/Admin/TaskItem/Background/TaskItemCountBackgroundRefresher";
import AdminReport01 from "./Components/Admin/Report/00To09/01/View";
import AdminReport02 from "./Components/Admin/Report/00To09/02/View";
import AdminReport03 from "./Components/Admin/Report/00To09/03/View";
import AdminReport04 from "./Components/Admin/Report/00To09/04/View";
import AdminReport05 from "./Components/Admin/Report/00To09/05/View";
import AdminReport06 from "./Components/Admin/Report/00To09/06/View";
import AdminReport07 from "./Components/Admin/Report/00To09/07/View";
import AdminReport08 from "./Components/Admin/Report/00To09/08/View";
import AdminReport09 from "./Components/Admin/Report/00To09/09/View";
import AdminReport10 from "./Components/Admin/Report/10To19/10/View";
import AdminReport11 from "./Components/Admin/Report/10To19/11/View";
import AdminReport12 from "./Components/Admin/Report/10To19/12/View";
import AdminReport13 from "./Components/Admin/Report/10To19/13/View";
import AdminReport15 from "./Components/Admin/Report/10To19/15/View";
import AdminReport16 from "./Components/Admin/Report/10To19/16/View";
import AdminReport17 from "./Components/Admin/Report/10To19/17/View";
import AdminReport19 from "./Components/Admin/Report/10To19/19/View";
import AdminReport20 from "./Components/Admin/Report/20To29/20/View";
import AdminReport21 from "./Components/Admin/Report/20To29/21/View";
import AdminReport22 from "./Components/Admin/Report/20To29/22/View";

function AppRoute() {
  return (
    <div class="is-widescreen is-size-5-widescreen is-size-6-tablet is-size-7-mobile">
      {/*
          NOTES FOR ABOVE
          USE THE FOLLOWING TEXT SIZES BASED ON DEVICE TYPE
          - is-size-5-widescreen
          - is-size-6-tablet
          - is-size-7-mobile
      */}
      <RecoilRoot>
        <AdminTaskItemCountBackgroundRefresher />
        <Router>
          <AutoLogoutAfterInactivityRedirector />
          <AnonymousCurrentUserRedirector />
          <TwoFactorAuthenticationRedirector />
          <TopAlertBanner />
          <Topbar />
          <div class="columns">
            <Sidebar />
            <div class="column">
              <section class="main-content columns is-fullheight">
                <Routes>
                  {/*
                      #########
                      CUSTOMERS
                      #########
                  */}
                  <Route
                    exact
                    path="/c/dashboard"
                    element={<CustomerDashboard />}
                  />
                  <Route exact path="/c/help" element={<DashboardHelp />} />
                  <Route
                    exact
                    path="/c/orders"
                    element={<CustomerOrderList />}
                  />
                  <Route
                    exact
                    path="/c/order/:oid/full"
                    element={<CustomerOrderDetailFull />}
                  />
                  <Route
                    exact
                    path="/c/order/:oid"
                    element={<CustomerOrderDetailLite />}
                  />
                  <Route
                    exact
                    path="/c/financials"
                    element={<CustomerFinancialList />}
                  />
                  <Route
                    exact
                    path="/c/financial/:oid"
                    element={<CustomerFinancialDetailFull />}
                  />
                  <Route
                    exact
                    path="/c/financial/:oid/invoice"
                    element={<CustomerFinancialInvoiceDetail />}
                  />
                  <Route
                    exact
                    path="/c/financial/:oid/invoice/generate/step-4"
                    element={<CustomerFinancialGenerateInvoiceStep4 />}
                  />
                  <Route
                    exact
                    path="/c/financial/:oid/invoice/generate/step-3"
                    element={<CustomerFinancialGenerateInvoiceStep3 />}
                  />
                  <Route
                    exact
                    path="/c/financial/:oid/invoice/generate/step-2"
                    element={<CustomerFinancialGenerateInvoiceStep2 />}
                  />
                  <Route
                    exact
                    path="/c/financial/:oid/invoice/generate/step-1"
                    element={<CustomerFinancialGenerateInvoiceStep1 />}
                  />
                  <Route
                    exact
                    path="/c/associates"
                    element={<ClientAssociateList />}
                  />
                  <Route
                    exact
                    path="/c/associates/:cid"
                    element={<ClientAssociateDetailLite />}
                  />
                  <Route
                    exact
                    path="/c/associates/:cid/detail"
                    element={<ClientAssociateDetailFull />}
                  />
                  <Route
                    exact
                    path="/c/associates/:cid/orders"
                    element={<ClientAssociateDetailOrderList />}
                  />

                  {/*
                      #########
                      ASSOCIATE
                      #########
                  */}
                  <Route
                    exact
                    path="/a/dashboard"
                    element={<AssociateDashboard />}
                  />
                  <Route
                    exact
                    path="/a/orders"
                    element={<AssociateOrderList />}
                  />
                  <Route
                    exact
                    path="/a/order/:oid/full"
                    element={<AssociateOrderDetailFull />}
                  />
                  <Route
                    exact
                    path="/a/order/:oid"
                    element={<AssociateOrderDetailLite />}
                  />
                  <Route
                    exact
                    path="/a/financials"
                    element={<AssociateFinancialList />}
                  />
                  <Route
                    exact
                    path="/a/financial/:oid"
                    element={<AssociateFinancialDetailFull />}
                  />
                  <Route
                    exact
                    path="/a/financial/:oid/invoice"
                    element={<AssociateFinancialInvoiceDetail />}
                  />
                  <Route
                    exact
                    path="/a/financial/:oid/invoice/generate/step-4"
                    element={<AssociateFinancialGenerateInvoiceStep4 />}
                  />
                  <Route
                    exact
                    path="/a/financial/:oid/invoice/generate/step-3"
                    element={<AssociateFinancialGenerateInvoiceStep3 />}
                  />
                  <Route
                    exact
                    path="/a/financial/:oid/invoice/generate/step-2"
                    element={<AssociateFinancialGenerateInvoiceStep2 />}
                  />
                  <Route
                    exact
                    path="/a/financial/:oid/invoice/generate/step-1"
                    element={<AssociateFinancialGenerateInvoiceStep1 />}
                  />
                  <Route
                    exact
                    path="/a/clients"
                    element={<AssociateClientList />}
                  />
                  <Route
                    exact
                    path="/a/client/:cid"
                    element={<AssociateClientDetailLite />}
                  />
                  <Route
                    exact
                    path="/a/client/:cid/detail"
                    element={<AssociateClientDetailFull />}
                  />
                  <Route
                    exact
                    path="/a/client/:cid/orders"
                    element={<AssociateClientDetailOrderList />}
                  />
                  <Route exact path="/a/help" element={<DashboardHelp />} />

                  {/*
                      ###########
                      JOB SEEKER
                      ###########
                  */}
                  <Route
                    exact
                    path="/js/dashboard"
                    element={<JobSeekerDashboard />}
                  />
                  <Route exact path="/js/help" element={<DashboardHelp />} />

                  {/*
                      #########
                      STAFF
                      #########
                  */}
                  <Route
                    exact
                    path="/admin/report/22"
                    element={<AdminReport22 />}
                  />
                  <Route
                    exact
                    path="/admin/report/21"
                    element={<AdminReport21 />}
                  />
                  <Route
                    exact
                    path="/admin/report/20"
                    element={<AdminReport20 />}
                  />
                  <Route
                    exact
                    path="/admin/report/19"
                    element={<AdminReport19 />}
                  />
                  <Route
                    exact
                    path="/admin/report/17"
                    element={<AdminReport17 />}
                  />
                  <Route
                    exact
                    path="/admin/report/16"
                    element={<AdminReport16 />}
                  />
                  <Route
                    exact
                    path="/admin/report/15"
                    element={<AdminReport15 />}
                  />
                  <Route
                    exact
                    path="/admin/report/13"
                    element={<AdminReport13 />}
                  />
                  <Route
                    exact
                    path="/admin/report/12"
                    element={<AdminReport12 />}
                  />
                  <Route
                    exact
                    path="/admin/report/11"
                    element={<AdminReport11 />}
                  />
                  <Route
                    exact
                    path="/admin/report/10"
                    element={<AdminReport10 />}
                  />
                  <Route
                    exact
                    path="/admin/report/9"
                    element={<AdminReport09 />}
                  />
                  <Route
                    exact
                    path="/admin/report/8"
                    element={<AdminReport08 />}
                  />
                  <Route
                    exact
                    path="/admin/report/7"
                    element={<AdminReport07 />}
                  />
                  <Route
                    exact
                    path="/admin/report/6"
                    element={<AdminReport06 />}
                  />
                  <Route
                    exact
                    path="/admin/report/5"
                    element={<AdminReport05 />}
                  />
                  <Route
                    exact
                    path="/admin/report/4"
                    element={<AdminReport04 />}
                  />
                  <Route
                    exact
                    path="/admin/report/3"
                    element={<AdminReport03 />}
                  />
                  <Route
                    exact
                    path="/admin/report/2"
                    element={<AdminReport02 />}
                  />
                  <Route
                    exact
                    path="/admin/report/1"
                    element={<AdminReport01 />}
                  />
                  <Route
                    exact
                    path="/admin/reports"
                    element={<AdminReportLaunchpad />}
                  />
                  <Route
                    exact
                    path="/admin/skill-sets/search-results"
                    element={<AdminAssociateSkillSetSearchResult />}
                  />
                  <Route
                    exact
                    path="/admin/skill-sets"
                    element={<AdminAssociateSkillSetSearch />}
                  />
                  <Route
                    exact
                    path="/admin/staff/:aid/change-password"
                    element={<AdminStaffMoreOperationChangePassword />}
                  />
                  <Route
                    exact
                    path="/admin/staff/:sid/2fa"
                    element={<AdminStaffMoreOperation2FAToggle />}
                  />
                  <Route
                    exact
                    path="/admin/staff/:aid/downgrade"
                    element={<AdminStaffDowngradeOperation />}
                  />
                  <Route
                    exact
                    path="/admin/staff/:aid/upgrade"
                    element={<AdminStaffUpgradeOperation />}
                  />
                  <Route
                    exact
                    path="/admin/staff/:aid/permadelete"
                    element={<AdminStaffDeleteOperation />}
                  />
                  <Route
                    exact
                    path="/admin/staff/:aid/unarchive"
                    element={<AdminStaffUnarchiveOperation />}
                  />
                  <Route
                    exact
                    path="/admin/staff/:aid/archive"
                    element={<AdminStaffArchiveOperation />}
                  />
                  <Route
                    exact
                    path="/admin/staff/:aid/avatar"
                    element={<AdminStaffAvatarOperation />}
                  />
                  <Route
                    exact
                    path="/admin/staff/:aid/more"
                    element={<AdminStaffDetailMore />}
                  />
                  <Route
                    exact
                    path="/admin/staff/:aid/attachment/:atid/edit"
                    element={<AdminStaffAttachmentUpdate />}
                  />
                  <Route
                    exact
                    path="/admin/staff/:aid/attachment/:atid"
                    element={<AdminStaffAttachmentDetail />}
                  />
                  <Route
                    exact
                    path="/admin/staff/:aid/attachments/add"
                    element={<AdminStaffAttachmentAdd />}
                  />
                  <Route
                    exact
                    path="/admin/staff/:aid/attachments"
                    element={<AdminStaffDetailAttachmentList />}
                  />
                  <Route
                    exact
                    path="/admin/staff/:aid/comments"
                    element={<AdminStaffDetailCommentList />}
                  />
                  <Route
                    exact
                    path="/admin/staff/:aid/edit"
                    element={<AdminStaffUpdate />}
                  />
                  <Route
                    exact
                    path="/admin/staff/:aid/detail"
                    element={<AdminStaffDetailFull />}
                  />
                  <Route
                    exact
                    path="/admin/staff/:aid"
                    element={<AdminStaffDetailLite />}
                  />
                  <Route
                    exact
                    path="/admin/staff/add/step-7"
                    element={<AdminStaffAddStep7 />}
                  />
                  <Route
                    exact
                    path="/admin/staff/add/step-6"
                    element={<AdminStaffAddStep6 />}
                  />
                  <Route
                    exact
                    path="/admin/staff/add/step-5"
                    element={<AdminStaffAddStep5 />}
                  />
                  <Route
                    exact
                    path="/admin/staff/add/step-4"
                    element={<AdminStaffAddStep4 />}
                  />
                  <Route
                    exact
                    path="/admin/staff/add/step-3"
                    element={<AdminStaffAddStep3 />}
                  />
                  <Route
                    exact
                    path="/admin/staff/add/step-2"
                    element={<AdminStaffAddStep2 />}
                  />
                  <Route
                    exact
                    path="/admin/staff/add/step-1-results"
                    element={<AdminStaffAddStep1PartB />}
                  />
                  <Route
                    exact
                    path="/admin/staff/add/step-1-search"
                    element={<AdminStaffAddStep1PartA />}
                  />
                  <Route
                    exact
                    path="/admin/staff/search-result"
                    element={<AdminStaffSearchResult />}
                  />
                  <Route
                    exact
                    path="/admin/staff/search"
                    element={<AdminStaffSearch />}
                  />
                  <Route
                    exact
                    path="/admin/staff"
                    element={<AdminStaffList />}
                  />
                  <Route
                    exact
                    path="/admin/associate/:aid/downgrade"
                    element={<AdminAssociateDowngradeOperation />}
                  />
                  <Route
                    exact
                    path="/admin/associate/:aid/upgrade"
                    element={<AdminAssociateUpgradeOperation />}
                  />
                  <Route
                    exact
                    path="/admin/associate/:aid/unarchive"
                    element={<AdminAssociateUnarchiveOperation />}
                  />
                  <Route
                    exact
                    path="/admin/associate/:aid/archive"
                    element={<AdminAssociateArchiveOperation />}
                  />
                  <Route
                    exact
                    path="/admin/associate/:aid/permadelete"
                    element={<AdminAssociateDeleteOperation />}
                  />
                  <Route
                    exact
                    path="/admin/associate/:aid/avatar"
                    element={<AdminAssociateAvatarOperation />}
                  />
                  <Route
                    exact
                    path="/admin/associate/:aid/change-password"
                    element={<AdminAssociateMoreOperationChangePassword />}
                  />
                  <Route
                    exact
                    path="/admin/associate/:aid/change-2fa"
                    element={<AdminAssociateMoreOperation2FAToggle />}
                  />
                  <Route
                    exact
                    path="/admin/associate/:aid/edit"
                    element={<AdminAssociateUpdate />}
                  />
                  <Route
                    exact
                    path="/admin/associate/:aid/attachment/:atid/edit"
                    element={<AdminAssociateAttachmentUpdate />}
                  />
                  <Route
                    exact
                    path="/admin/associate/:aid/attachment/:atid"
                    element={<AdminAssociateAttachmentDetail />}
                  />
                  <Route
                    exact
                    path="/admin/associate/:aid/attachments/add"
                    element={<AdminAssociateAttachmentAdd />}
                  />
                  <Route
                    exact
                    path="/admin/associate/:aid/attachments"
                    element={<AdminAssociateDetailAttachmentList />}
                  />
                  <Route
                    exact
                    path="/admin/associate/:aid/more"
                    element={<AdminAssociateDetailMore />}
                  />
                  <Route
                    exact
                    path="/admin/associate/:aid/comments"
                    element={<AdminAssociateDetailCommentList />}
                  />
                  <Route
                    exact
                    path="/admin/associate/:aid/orders"
                    element={<AdminAssociateDetailOrderList />}
                  />
                  <Route
                    exact
                    path="/admin/associate/:aid/detail"
                    element={<AdminAssociateDetailFull />}
                  />
                  <Route
                    exact
                    path="/admin/associate/:aid"
                    element={<AdminAssociateDetailLite />}
                  />
                  <Route
                    exact
                    path="/admin/associates/add/step-7"
                    element={<AdminAssociateAddStep7 />}
                  />
                  <Route
                    exact
                    path="/admin/associates/add/step-6"
                    element={<AdminAssociateAddStep6 />}
                  />
                  <Route
                    exact
                    path="/admin/associates/add/step-5"
                    element={<AdminAssociateAddStep5 />}
                  />
                  <Route
                    exact
                    path="/admin/associates/add/step-4"
                    element={<AdminAssociateAddStep4 />}
                  />
                  <Route
                    exact
                    path="/admin/associates/add/step-3"
                    element={<AdminAssociateAddStep3 />}
                  />
                  <Route
                    exact
                    path="/admin/associates/add/step-2"
                    element={<AdminAssociateAddStep2 />}
                  />
                  <Route
                    exact
                    path="/admin/associates/add/step-1-results"
                    element={<AdminAssociateAddStep1PartB />}
                  />
                  <Route
                    exact
                    path="/admin/associates/add/step-1-search"
                    element={<AdminAssociateAddStep1PartA />}
                  />
                  <Route
                    exact
                    path="/admin/associates/search-result"
                    element={<AdminAssociateSearchResult />}
                  />
                  <Route
                    exact
                    path="/admin/associates/search"
                    element={<AdminAssociateSearch />}
                  />
                  <Route
                    exact
                    path="/admin/associates"
                    element={<AdminAssociateList />}
                  />
                  <Route
                    exact
                    path="/admin/client/:cid/change-password"
                    element={<AdminClientMoreOperationChangePassword />}
                  />
                  <Route
                    exact
                    path="/admin/client/:cid/change-2fa"
                    element={<AdminClientMoreOperation2FAToggle />}
                  />
                  <Route
                    exact
                    path="/admin/client/:cid/downgrade"
                    element={<AdminClientDowngradeOperation />}
                  />
                  <Route
                    exact
                    path="/admin/client/:cid/upgrade"
                    element={<AdminClientUpgradeOperation />}
                  />
                  <Route
                    exact
                    path="/admin/client/:cid/unarchive"
                    element={<AdminClientUnarchiveOperation />}
                  />
                  <Route
                    exact
                    path="/admin/client/:cid/archive"
                    element={<AdminClientArchiveOperation />}
                  />
                  <Route
                    exact
                    path="/admin/client/:cid/permadelete"
                    element={<AdminClientDeleteOperation />}
                  />
                  <Route
                    exact
                    path="/admin/client/:cid/avatar"
                    element={<AdminClientAvatarOperation />}
                  />
                  <Route
                    exact
                    path="/admin/client/:cid/more"
                    element={<AdminClientDetailMore />}
                  />
                  <Route
                    exact
                    path="/admin/client/:cid/attachment/:aid/edit"
                    element={<AdminClientAttachmentUpdate />}
                  />
                  <Route
                    exact
                    path="/admin/client/:cid/attachment/:aid"
                    element={<AdminClientAttachmentDetail />}
                  />
                  <Route
                    exact
                    path="/admin/client/:cid/attachments/add"
                    element={<AdminClientAttachmentAdd />}
                  />
                  <Route
                    exact
                    path="/admin/client/:cid/attachments"
                    element={<AdminClientDetailAttachmentList />}
                  />
                  <Route
                    exact
                    path="/admin/client/:cid/comments"
                    element={<AdminClientDetailCommentList />}
                  />
                  <Route
                    exact
                    path="/admin/client/:cid/orders"
                    element={<AdminClientDetailOrderList />}
                  />
                  <Route
                    exact
                    path="/admin/client/:cid/edit"
                    element={<AdminClientUpdate />}
                  />
                  <Route
                    exact
                    path="/admin/client/:cid/detail"
                    element={<AdminClientDetailFull />}
                  />
                  <Route
                    exact
                    path="/admin/client/:cid"
                    element={<AdminClientDetailLite />}
                  />
                  <Route
                    exact
                    path="/admin/clients/add/step-6"
                    element={<AdminClientAddStep6 />}
                  />
                  <Route
                    exact
                    path="/admin/clients/add/step-5"
                    element={<AdminClientAddStep5 />}
                  />
                  <Route
                    exact
                    path="/admin/clients/add/step-4"
                    element={<AdminClientAddStep4 />}
                  />
                  <Route
                    exact
                    path="/admin/clients/add/step-3"
                    element={<AdminClientAddStep3 />}
                  />
                  <Route
                    exact
                    path="/admin/clients/add/step-2"
                    element={<AdminClientAddStep2 />}
                  />
                  <Route
                    exact
                    path="/admin/clients/add/step-1-results"
                    element={<AdminClientAddStep1PartB />}
                  />
                  <Route
                    exact
                    path="/admin/clients/add/step-1-search"
                    element={<AdminClientAddStep1PartA />}
                  />
                  <Route
                    exact
                    path="/admin/clients/search-result"
                    element={<AdminClientSearchResult />}
                  />
                  <Route
                    exact
                    path="/admin/clients/search"
                    element={<AdminClientSearch />}
                  />
                  <Route
                    exact
                    path="/admin/clients"
                    element={<AdminClientList />}
                  />

                  <Route
                    exact
                    path="/admin/order/:oid/more/incident/:oiid"
                    element={<AdminOrderMoreIncidentDetail />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/more/incidents/create"
                    element={<AdminOrderMoreIncidentCreate />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/more/incidents"
                    element={<AdminOrderMoreIncidentList />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/more/transfer/step-5"
                    element={<AdminOrderMoreTransferOperationStep5 />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/more/transfer/step-4"
                    element={<AdminOrderMoreTransferOperationStep4 />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/more/transfer/step-3"
                    element={<AdminOrderMoreTransferOperationStep3 />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/more/transfer/step-2"
                    element={<AdminOrderMoreTransferOperationStep2 />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/more/transfer/step-1"
                    element={<AdminOrderMoreTransferOperationStep1 />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/more/postpone"
                    element={<AdminOrderMorePostponeOperation />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/more/close"
                    element={<AdminOrderMoreCloseOperation />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/more/unassign"
                    element={<AdminOrderMoreUnassignOperation />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/more/delete"
                    element={<AdminOrderMoreDeleteOperation />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/more"
                    element={<AdminOrderMore />}
                  />
                  <Route
                    exact
                    path="/admin/orders/add/step-4"
                    element={<AdminOrderAddStep4 />}
                  />
                  <Route
                    exact
                    path="/admin/orders/add/step-3"
                    element={<AdminOrderAddStep3 />}
                  />
                  <Route
                    exact
                    path="/admin/orders/add/step-2-from-launchpad"
                    element={<AdminOrderAddStep2Launchpad />}
                  />
                  <Route
                    exact
                    path="/admin/orders/add/step-2"
                    element={<AdminOrderAddStep2 />}
                  />
                  <Route
                    exact
                    path="/admin/orders/add/step-1-results"
                    element={<AdminOrderAddStep1PartB />}
                  />
                  <Route
                    exact
                    path="/admin/orders/add/step-1-search"
                    element={<AdminOrderAddStep1PartA />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/edit"
                    element={<AdminOrderUpdate />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/update"
                    element={<AdminOrderUpdate />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/attachment/:aid/edit"
                    element={<AdminOrderAttachmentUpdate />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/attachment/:aid"
                    element={<AdminOrderAttachmentDetail />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/attachments/add"
                    element={<AdminOrderAttachmentAdd />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/attachments"
                    element={<AdminOrderAttachmentList />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/comments"
                    element={<AdminOrderCommentList />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/tasks"
                    element={<AdminOrderTaskList />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/activity-sheets"
                    element={<AdminOrderActivitySheetList />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid/full"
                    element={<AdminOrderDetailFull />}
                  />
                  <Route
                    exact
                    path="/admin/order/:oid"
                    element={<AdminOrderDetailLite />}
                  />
                  <Route
                    exact
                    path="/admin/orders/search-result"
                    element={<AdminOrderSearchResult />}
                  />
                  <Route
                    exact
                    path="/admin/orders/search"
                    element={<AdminOrderSearch />}
                  />
                  <Route
                    exact
                    path="/admin/orders"
                    element={<AdminOrderList />}
                  />
                  <Route
                    exact
                    path="/admin/incidents"
                    element={<AdminOrderIncidentList />}
                  />
                  <Route
                    exact
                    path="/admin/incidents/create"
                    element={<AdminOrderIncidentCreate />}
                  />
                  <Route
                    exact
                    path="/admin/incident/:oid/:oiid"
                    element={<AdminOrderIncidentDetail />}
                  />

                  <Route
                    exact
                    path="/admin/task/:tid/close"
                    element={<AdminTaskItemCloseOperation />}
                  />
                  <Route
                    exact
                    path="/admin/task/:tid/postpone"
                    element={<AdminTaskItemPostponeOperation />}
                  />
                  <Route
                    exact
                    path="/admin/task/:tid/survey/step-3"
                    element={<AdminTaskItemSurveyStep3 />}
                  />
                  <Route
                    exact
                    path="/admin/task/:tid/survey/step-2"
                    element={<AdminTaskItemSurveyStep2 />}
                  />
                  <Route
                    exact
                    path="/admin/task/:tid/survey/step-1"
                    element={<AdminTaskItemSurveyStep1 />}
                  />
                  <Route
                    exact
                    path="/admin/task/:tid/order-completion/step-5"
                    element={<AdminTaskItemOrderCompletionStep5 />}
                  />
                  <Route
                    exact
                    path="/admin/task/:tid/order-completion/step-4"
                    element={<AdminTaskItemOrderCompletionStep4 />}
                  />
                  <Route
                    exact
                    path="/admin/task/:tid/order-completion/step-3"
                    element={<AdminTaskItemOrderCompletionStep3 />}
                  />
                  <Route
                    exact
                    path="/admin/task/:tid/order-completion/step-2"
                    element={<AdminTaskItemOrderCompletionStep2 />}
                  />
                  <Route
                    exact
                    path="/admin/task/:tid/order-completion/step-1"
                    element={<AdminTaskItemOrderCompletionStep1 />}
                  />
                  <Route
                    exact
                    path="/admin/task/:tid/assign-associate/step-4"
                    element={<AdminTaskItemAssignAssociateStep4 />}
                  />
                  <Route
                    exact
                    path="/admin/task/:tid/assign-associate/step-3"
                    element={<AdminTaskItemAssignAssociateStep3 />}
                  />
                  <Route
                    exact
                    path="/admin/task/:tid/assign-associate/step-2"
                    element={<AdminTaskItemAssignAssociateStep2 />}
                  />
                  <Route
                    exact
                    path="/admin/task/:tid/assign-associate/step-1"
                    element={<AdminTaskItemAssignAssociateStep1 />}
                  />
                  <Route
                    exact
                    path="/admin/tasks"
                    element={<AdminTaskItemList />}
                  />
                  <Route
                    exact
                    path="/admin/financial/:oid/more/clone"
                    element={<AdminFinancialMoreCloneOperation />}
                  />
                  <Route
                    exact
                    path="/admin/financial/:oid/more"
                    element={<AdminFinancialMore />}
                  />
                  <Route
                    exact
                    path="/admin/financial/:oid/invoice/generate/step-4"
                    element={<AdminFinancialGenerateInvoiceStep4 />}
                  />
                  <Route
                    exact
                    path="/admin/financial/:oid/invoice/generate/step-3"
                    element={<AdminFinancialGenerateInvoiceStep3 />}
                  />
                  <Route
                    exact
                    path="/admin/financial/:oid/invoice/generate/step-2"
                    element={<AdminFinancialGenerateInvoiceStep2 />}
                  />
                  <Route
                    exact
                    path="/admin/financial/:oid/invoice/generate/step-1"
                    element={<AdminFinancialGenerateInvoiceStep1 />}
                  />
                  <Route
                    exact
                    path="/admin/financial/:oid/invoice"
                    element={<AdminFinancialInvoiceDetail />}
                  />
                  <Route
                    exact
                    path="/admin/financial/:oid/edit"
                    element={<AdminFinancialUpdate />}
                  />
                  <Route
                    exact
                    path="/admin/financial/:oid"
                    element={<AdminFinancialDetailFull />}
                  />
                  <Route
                    exact
                    path="/admin/financials"
                    element={<AdminFinancialList />}
                  />
                  <Route
                    exact
                    path="/admin/settings/how-hear-about-us-items"
                    element={<AdminSettingHowHearAboutUsItemList />}
                  />
                  <Route
                    exact
                    path="/admin/settings/vehicle-types"
                    element={<AdminSettingVehicleTypeList />}
                  />
                  <Route
                    exact
                    path="/admin/settings/inactive-clients"
                    element={<AdminSettingInactiveClientList />}
                  />
                  <Route
                    exact
                    path="/admin/settings/service-fees"
                    element={<AdminSettingServiceFeeList />}
                  />
                  <Route
                    exact
                    path="/admin/settings/insurance-requirements"
                    element={<AdminSettingInsuranceRequirementList />}
                  />
                  <Route
                    exact
                    path="/admin/settings/associate-away-logs"
                    element={<AdminSettingAssociateAwayLogList />}
                  />
                  <Route
                    exact
                    path="/admin/settings/tags"
                    element={<AdminSettingTagList />}
                  />
                  <Route
                    exact
                    path="/admin/settings/skill-sets"
                    element={<AdminSettingSkillSetList />}
                  />
                  <Route
                    exact
                    path="/admin/settings/bulletins"
                    element={<AdminSettingBulletinList />}
                  />
                  <Route
                    exact
                    path="/admin/settings"
                    element={<AdminSettingLaunchpad />}
                  />
                  <Route exact path="/admin/help" element={<DashboardHelp />} />
                  <Route
                    exact
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                  />
                  <Route
                    exact
                    path="/admin/dashboard/comments"
                    element={<AdminDashboardCommentList />}
                  />
                  <Route
                    exact
                    path="/root/tenant/:tid/start"
                    element={<ToTenantRedirector />}
                  />
                  <Route
                    exact
                    path="/root/tenant/:tid/edit"
                    element={<RootTenantUpdate />}
                  />
                  <Route
                    exact
                    path="/root/tenant/:tid"
                    element={<RootTenantDetail />}
                  />
                  <Route
                    exact
                    path="/root/tenants"
                    element={<RootTenantList />}
                  />
                  <Route
                    exact
                    path="/root/dashboard"
                    element={<RootDashboard />}
                  />

                  <Route
                    exact
                    path="/account/edit"
                    element={<AccountUpdate />}
                  />
                  <Route exact path="/account" element={<AccountDetail />} />
                  <Route
                    exact
                    path="/account/2fa"
                    element={<AccountTwoFactorAuthenticationDetail />}
                  />
                  <Route
                    exact
                    path="/account/2fa/setup/step-1"
                    element={<AccountEnableTwoFactorAuthenticationStep1 />}
                  />
                  <Route
                    exact
                    path="/account/2fa/setup/step-2"
                    element={<AccountEnableTwoFactorAuthenticationStep2 />}
                  />
                  <Route
                    exact
                    path="/account/2fa/setup/step-3"
                    element={<AccountEnableTwoFactorAuthenticationStep3 />}
                  />
                  <Route
                    exact
                    path="/account/2fa/backup-code"
                    element={
                      <AccountTwoFactorAuthenticationBackupCodeGenerate />
                    }
                  />

                  <Route
                    exact
                    path="/account/more"
                    element={<AccountMoreLaunchpad />}
                  />
                  <Route
                    exact
                    path="/account/more/change-password"
                    element={<AccountMoreOperationChangePassword />}
                  />

                  <Route exact path="/register" element={<RegisterStart />} />
                  <Route
                    exact
                    path="/register/job-seeker/step-1"
                    element={<RegisterJobSeekerStep1 />}
                  />
                  <Route
                    exact
                    path="/register/employer/step-1"
                    element={<RegisterEmployerStep1 />}
                  />
                  <Route exact path="/login" element={<Login />} />
                  <Route
                    exact
                    path="/login/2fa/step-1"
                    element={<TwoFactorAuthenticationWizardStep1 />}
                  />
                  <Route
                    exact
                    path="/login/2fa/step-2"
                    element={<TwoFactorAuthenticationWizardStep2 />}
                  />
                  <Route
                    exact
                    path="/login/2fa/step-3"
                    element={<TwoFactorAuthenticationWizardStep3 />}
                  />
                  <Route
                    exact
                    path="/login/2fa/backup-code"
                    element={<TwoFactorAuthenticationBackupCodeGenerate />}
                  />
                  <Route
                    exact
                    path="/login/2fa/backup-code-recovery"
                    element={<TwoFactorAuthenticationBackupCodeRecovery />}
                  />
                  <Route
                    exact
                    path="/login/2fa"
                    element={<TwoFactorAuthenticationValidateOnLogin />}
                  />
                  <Route exact path="/logout" element={<LogoutRedirector />} />
                  <Route
                    exact
                    path="/forgot-password"
                    element={<ForgotPassword />}
                  />
                  <Route
                    exact
                    path="/password-reset"
                    element={<PasswordReset />}
                  />
                  <Route
                    exact
                    path="/terms-of-service"
                    element={<TermsOfServiceStaticPage />}
                  />
                  <Route
                    exact
                    path="/privacy"
                    element={<PrivacyStaticPage />}
                  />
                  <Route exact path="/501" element={<NotImplementedError />} />
                  <Route exact path="/" element={<IndexStaticPage />} />
                  <Route path="*" element={<NotFoundError />} />
                </Routes>
              </section>
              <div>
                {/* DEVELOPERS NOTE: Mobile tab-bar menu can go here */}
              </div>
              <footer class="footer is-hidden">
                <div class="container">
                  <div class="content has-text-centered">
                    <p>Hello</p>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </Router>
      </RecoilRoot>
    </div>
  );
}

export default AppRoute;
