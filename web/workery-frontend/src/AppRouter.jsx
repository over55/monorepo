// File Path: monorepo/web/workery-frontend/src/AppRouter.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { ServiceProvider } from "./services/Services";
import Layout from "./components/Layout/Layout";

////////////////////////////////////////////////////////////////
// Anonymous pages
////////////////////////////////////////////////////////////////
// Front-facing pages
import IndexPage from "./pages/Anonymous/Index/Page";
import LoginPage from "./pages/Anonymous/Login/Page";

// 2FA pages
import TwoFAStep1Page from "./pages/Anonymous/TwoFA/Step1Page";
import TwoFAStep2Page from "./pages/Anonymous/TwoFA/Step2Page";
import TwoFAStep3Page from "./pages/Anonymous/TwoFA/Step3Page";
import TwoFAValidationPage from "./pages/Anonymous/TwoFA/ValidationPage";
import TwoFABackupCodeGeneratePage from "./pages/Anonymous/TwoFA/BackupCodeGeneratePage";
import TwoFABackupCodeRecoveryPage from "./pages/Anonymous/TwoFA/BackupCodeRecoveryPage";

// Common pages
import DashboardRedirector from "./pages/Common/DashboardRedirector";

// Error pages
import NotFoundPage from "./pages/Common/Error/NotFoundPage";
import ServerErrorPage from "./pages/Common/Error/ServerErrorPage";

// Styles
const styles = {
  app: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
};

// Placeholder component for unimplemented pages
function PlaceholderPage({ title, description }) {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>{title}</h1>
      <p>{description}</p>
      <p style={{ marginTop: "20px" }}>
        <a href="/login">← Back to Login</a> | <a href="/">← Back to Home</a>
      </p>
    </div>
  );
}

////////////////////////////////////////////////////////////////
// Root pages
////////////////////////////////////////////////////////////////
// Root/Executive pages
import RootDashboardPage from "./pages/Root/Dashboard/Page";
import RootTenantListPage from "./pages/Root/Tenant/List/Page";
import RootTenantDetailPage from "./pages/Root/Tenant/Detail/Page";
import RootTenantUpdatePage from "./pages/Root/Tenant/Update/Page";
import ToTenantRedirector from "./pages/Root/ToTenant/Redirector";

////////////////////////////////////////////////////////////////
// Administration and Staff pages
////////////////////////////////////////////////////////////////
// Admin pages (Management/Frontline)
import AdminDashboardPage from "./pages/Admin/Dashboard/Page";

// Admin settings pages
import SettingDashboardPage from "./pages/Admin/Setting/Page";
import SettingVehicleTypeCreatePage from "./pages/Admin/Setting/VehicleType/Create/Page";
import SettingVehicleTypeListPage from "./pages/Admin/Setting/VehicleType/List/Page";
import SettingVehicleTypeDetailPage from "./pages/Admin/Setting/VehicleType/Detail/Page";
import SettingVehicleTypeUpdatePage from "./pages/Admin/Setting/VehicleType/Update/Page";
import SettingTagCreatePage from "./pages/Admin/Setting/Tag/Create/Page";
import SettingTagListPage from "./pages/Admin/Setting/Tag/List/Page";
import SettingTagDetailPage from "./pages/Admin/Setting/Tag/Detail/Page";
import SettingTagUpdatePage from "./pages/Admin/Setting/Tag/Update/Page";
import SettingSkillSetCreatePage from "./pages/Admin/Setting/SkillSet/Create/Page";
import SettingSkillSetListPage from "./pages/Admin/Setting/SkillSet/List/Page";
import SettingSkillSetDetailPage from "./pages/Admin/Setting/SkillSet/Detail/Page";
import SettingSkillSetUpdatePage from "./pages/Admin/Setting/SkillSet/Update/Page";
import SettingServiceFeeCreatePage from "./pages/Admin/Setting/ServiceFee/Create/Page";
import SettingServiceFeeListPage from "./pages/Admin/Setting/ServiceFee/List/Page";
import SettingServiceFeeDetailPage from "./pages/Admin/Setting/ServiceFee/Detail/Page";
import SettingServiceFeeUpdatePage from "./pages/Admin/Setting/ServiceFee/Update/Page";
import SettingServiceFeeDeletePage from "./pages/Admin/Setting/ServiceFee/Delete/Page";
import SettingNOCSearchPage from "./pages/Admin/Setting/NOC/Search/Page";
import SettingNOCSearchResultPage from "./pages/Admin/Setting/NOC/SearchResult/Page";
import SettingNAICSSearchPage from "./pages/Admin/Setting/NAICS/Search/Page";
import SettingNAICSSearchResultPage from "./pages/Admin/Setting/NAICS/SearchResult/Page";
import SettingInsuranceRequirementCreatePage from "./pages/Admin/Setting/InsuranceRequirement/Create/Page";
import SettingInsuranceRequirementListPage from "./pages/Admin/Setting/InsuranceRequirement/List/Page";
import SettingInsuranceRequirementDetailPage from "./pages/Admin/Setting/InsuranceRequirement/Detail/Page";
import SettingInsuranceRequirementUpdatePage from "./pages/Admin/Setting/InsuranceRequirement/Update/Page";
import SettingInactiveClientListPage from "./pages/Admin/Setting/InactiveClient/List/Page";
import SettingHowHearAboutUsItemCreatePage from "./pages/Admin/Setting/HowHearAboutUsItem/Create/Page";
import SettingHowHearAboutUsItemListPage from "./pages/Admin/Setting/HowHearAboutUsItem/List/Page";
import SettingHowHearAboutUsItemDetailPage from "./pages/Admin/Setting/HowHearAboutUsItem/Detail/Page";
import SettingHowHearAboutUsItemUpdatePage from "./pages/Admin/Setting/HowHearAboutUsItem/Update/Page";
import SettingBulletinCreatePage from "./pages/Admin/Setting/Bulletin/Create/Page";
import SettingBulletinListPage from "./pages/Admin/Setting/Bulletin/List/Page";
import SettingBulletinDetailPage from "./pages/Admin/Setting/Bulletin/Detail/Page";
import SettingBulletinUpdatePage from "./pages/Admin/Setting/Bulletin/Update/Page";
import SettingAssociateAwayLogListPage from "./pages/Admin/Setting/AssociateAwayLog/List/Page";
import SettingAssociateAwayLogDetailPage from "./pages/Admin/Setting/AssociateAwayLog/Detail/Page";
import SettingAssociateAwayLogCreatePage from "./pages/Admin/Setting/AssociateAwayLog/Create/Page";
import SettingAssociateAwayLogUpdatePage from "./pages/Admin/Setting/AssociateAwayLog/Update/Page";
import SettingAssociateAwayLogDeletePage from "./pages/Admin/Setting/AssociateAwayLog/Delete/Page";

// Admin client pages.
import AdminCustomerListPage from "./pages/Admin/Customer/List/Page";
import AdminCustomerAddStep1PartAPage from "./pages/Admin/Customer/Add/Step1PartAPage";
import AdminCustomerAddStep1PartBPage from "./pages/Admin/Customer/Add/Step1PartBPage";
import AdminCustomerAddStep2Page from "./pages/Admin/Customer/Add/Step2Page";
import AdminCustomerAddStep3Page from "./pages/Admin/Customer/Add/Step3Page";
import AdminCustomerAddStep4Page from "./pages/Admin/Customer/Add/Step4Page";
import AdminCustomerAddStep5Page from "./pages/Admin/Customer/Add/Step5Page";
import AdminCustomerAddStep6Page from "./pages/Admin/Customer/Add/Step6Page";
import AdminCustomerSearchCriteriaPage from "./pages/Admin/Customer/Search/CriteriaPage";
import AdminCustomerSearchResultPage from "./pages/Admin/Customer/Search/ResultPage";
import AdminCustomerUpdatePage from "./pages/Admin/Customer/Update/Page";
import AdminCustomerDetailLitePage from "./pages/Admin/Customer/Detail/LitePage";
import AdminCustomerDetailFullPage from "./pages/Admin/Customer/Detail/FullPage";
import AdminCustomerDetailOrderListPage from "./pages/Admin/Customer/Detail/Order/List/Page";
import AdminCustomerDetailCommentListPage from "./pages/Admin/Customer/Detail/Comment/List/Page";
import AdminCustomerDetailAttachmentAddPage from "./pages/Admin/Customer/Detail/Attachment/Add/Page";
import AdminCustomerDetailAttachmentListPage from "./pages/Admin/Customer/Detail/Attachment/List/Page";
import AdminCustomerDetailAttachmentDetailPage from "./pages/Admin/Customer/Detail/Attachment/Detail/Page";
import AdminCustomerDetailAttachmentUpdatePage from "./pages/Admin/Customer/Detail/Attachment/Update/Page";
import AdminCustomerDetailMorePage from "./pages/Admin/Customer/Detail/More/Page";
import AdminCustomerDetailMore2FAPage from "./pages/Admin/Customer/Detail/More/2FA/Page";
import AdminCustomerDetailMoreArchivePage from "./pages/Admin/Customer/Detail/More/Archive/Page";
import AdminCustomerDetailMoreAvatarPage from "./pages/Admin/Customer/Detail/More/Avatar/Page";
import AdminCustomerDetailMoreBanPage from "./pages/Admin/Customer/Detail/More/Ban/Page";
import AdminCustomerDetailMoreChangePasswordPage from "./pages/Admin/Customer/Detail/More/ChangePassword/Page";
import AdminCustomerDetailMoreDeletePage from "./pages/Admin/Customer/Detail/More/Delete/Page";
import AdminCustomerDetailMoreDowngradePage from "./pages/Admin/Customer/Detail/More/Downgrade/Page";
import AdminCustomerDetailMoreUnarchivePage from "./pages/Admin/Customer/Detail/More/Unarchive/Page";
import AdminCustomerDetailMoreUnbanPage from "./pages/Admin/Customer/Detail/More/Unban/Page";
import AdminCustomerDetailMoreUpgradePage from "./pages/Admin/Customer/Detail/More/Upgrade/Page";

// Admin associate pages.
import AdminAssociateListPage from "./pages/Admin/Associate/List/Page";
import AdminAssociateAddStep1PartAPage from "./pages/Admin/Associate/Add/Step1PartAPage";
import AdminAssociateAddStep1PartBPage from "./pages/Admin/Associate/Add/Step1PartBPage";
import AdminAssociateAddStep2Page from "./pages/Admin/Associate/Add/Step2Page";
import AdminAssociateAddStep3Page from "./pages/Admin/Associate/Add/Step3Page";
import AdminAssociateAddStep4Page from "./pages/Admin/Associate/Add/Step4Page";
import AdminAssociateAddStep5Page from "./pages/Admin/Associate/Add/Step5Page";
import AdminAssociateAddStep6Page from "./pages/Admin/Associate/Add/Step6Page";
import AdminAssociateAddStep7Page from "./pages/Admin/Associate/Add/Step7Page";
import AdminAssociateSearchCriteriaPage from "./pages/Admin/Associate/Search/CriteriaPage";
import AdminAssociateSearchResultPage from "./pages/Admin/Associate/Search/ResultPage";
import AdminAssociateUpdatePage from "./pages/Admin/Associate/Update/Page";
import AdminAssociateDetailLitePage from "./pages/Admin/Associate/Detail/LitePage";
import AdminAssociateDetailFullPage from "./pages/Admin/Associate/Detail/FullPage";
import AdminAssociateDetailCommentListPage from "./pages/Admin/Associate/Detail/Comment/List/Page";
import AdminAssociateDetailOrderListPage from "./pages/Admin/Associate/Detail/Order/List/Page";
import AdminAssociateDetailAttachmentAddPage from "./pages/Admin/Associate/Detail/Attachment/Add/Page";
import AdminAssociateDetailAttachmentListPage from "./pages/Admin/Associate/Detail/Attachment/List/Page";
import AdminAssociateDetailAttachmentDetailPage from "./pages/Admin/Associate/Detail/Attachment/Detail/Page";
import AdminAssociateDetailAttachmentUpdatePage from "./pages/Admin/Associate/Detail/Attachment/Update/Page";
import AdminAssociateDetailMorePage from "./pages/Admin/Associate/Detail/More/Page";
import AdminAssociateDetailMore2FAPage from "./pages/Admin/Associate/Detail/More/2FA/Page";
import AdminAssociateDetailMoreArchivePage from "./pages/Admin/Associate/Detail/More/Archive/Page";
import AdminAssociateDetailMoreAvatarPage from "./pages/Admin/Associate/Detail/More/Avatar/Page";
import AdminAssociateDetailMoreBanPage from "./pages/Admin/Associate/Detail/More/Ban/Page";
import AdminAssociateDetailMoreChangePasswordPage from "./pages/Admin/Associate/Detail/More/ChangePassword/Page";
import AdminAssociateDetailMoreDeletePage from "./pages/Admin/Associate/Detail/More/Delete/Page";
import AdminAssociateDetailMoreDowngradePage from "./pages/Admin/Associate/Detail/More/Downgrade/Page";
import AdminAssociateDetailMoreUnarchivePage from "./pages/Admin/Associate/Detail/More/Unarchive/Page";
import AdminAssociateDetailMoreUnbanPage from "./pages/Admin/Associate/Detail/More/Unban/Page";
import AdminAssociateDetailMoreUpgradePage from "./pages/Admin/Associate/Detail/More/Upgrade/Page";

// Admin order pages.
import AdminOrderListPage from "./pages/Admin/Order/List/Page";
import AdminOrderSearchCriteriaPage from "./pages/Admin/Order/Search/CriteriaPage";
import AdminOrderSearchResultPage from "./pages/Admin/Order/Search/ResultPage";
import AdminOrderAddStep1PartAPage from "./pages/Admin/Order/Add/Step1PartAPage";
import AdminOrderAddStep1PartBPage from "./pages/Admin/Order/Add/Step1PartBPage";
import AdminOrderAddStep2Page from "./pages/Admin/Order/Add/Step2Page";
import AdminOrderAddStep3Page from "./pages/Admin/Order/Add/Step3Page";
import AdminOrderAddStep4Page from "./pages/Admin/Order/Add/Step4Page";
import AdminOrderDetailLitePage from "./pages/Admin/Order/Detail/LitePage";
import AdminOrderDetailFullPage from "./pages/Admin/Order/Detail/FullPage";
import AdminOrderDetailMoreTaskListPage from "./pages/Admin/Order/Detail/Task/List/Page";
import AdminOrderDetailMorePage from "./pages/Admin/Order/Detail/More/Page";
import AdminOrderDetailMoreUnassignedPage from "./pages/Admin/Order/Detail/More/Unassign/Page";
import AdminOrderDetailMoreTransferStep1Page from "./pages/Admin/Order/Detail/More/Transfer/Step1Page";
import AdminOrderDetailMoreTransferStep2Page from "./pages/Admin/Order/Detail/More/Transfer/Step2Page";
import AdminOrderDetailMoreTransferStep3Page from "./pages/Admin/Order/Detail/More/Transfer/Step3Page";
import AdminOrderDetailMoreTransferStep4Page from "./pages/Admin/Order/Detail/More/Transfer/Step4Page";
import AdminOrderDetailMoreTransferStep5Page from "./pages/Admin/Order/Detail/More/Transfer/Step5Page";
import AdminOrderDetailMorePostponePage from "./pages/Admin/Order/Detail/More/Postpone/Page";
import AdminOrderDetailMoreIncidentListPage from "./pages/Admin/Order/Detail/More/Incident/List/Page";
import AdminOrderDetailMoreIncidentDetailPage from "./pages/Admin/Order/Detail/More/Incident/Detail/Page";
import AdminOrderDetailMoreIncidentAddPage from "./pages/Admin/Order/Detail/More/Incident/Add/Page";
import AdminOrderDetailMoreDeletePage from "./pages/Admin/Order/Detail/More/Delete/Page";
import AdminOrderDetailMoreClosePage from "./pages/Admin/Order/Detail/More/Close/Page";
import AdminOrderDetailCommentListPage from "./pages/Admin/Order/Detail/Comment/List/Page";
import AdminOrderDetailAttachmentAddPage from "./pages/Admin/Order/Detail/Attachment/Add/Page";
import AdminOrderDetailAttachmentDetailPage from "./pages/Admin/Order/Detail/Attachment/Detail/Page";
import AdminOrderDetailAttachmentListPage from "./pages/Admin/Order/Detail/Attachment/List/Page";
import AdminOrderDetailAttachmentUpdatePage from "./pages/Admin/Order/Detail/Attachment/Update/Page";
import AdminOrderDetailActivitySheetListPage from "./pages/Admin/Order/Detail/ActivitySheet/List/Page";
import AdminOrderUpdatePage from "./pages/Admin/Order/Update/Page";

// Task item pages.
import AdminTaskItemListPage from "./pages/Admin/TaskItem/List/Page";
import AdminTaskItemCloseOperationPage from "./pages/Admin/TaskItem/Operation/Close/Page";
import AdminTaskItemPostponeOperationPage from "./pages/Admin/TaskItem/Operation/Postpone/Page";
import AdminTaskItemAssignAssociateStep1Page from "./pages/Admin/TaskItem/Update/AssignAssociate/Step1Page";
import AdminTaskItemAssignAssociateStep2Page from "./pages/Admin/TaskItem/Update/AssignAssociate/Step2Page";
import AdminTaskItemAssignAssociateStep3Page from "./pages/Admin/TaskItem/Update/AssignAssociate/Step3Page";
import AdminTaskItemAssignAssociateStep4Page from "./pages/Admin/TaskItem/Update/AssignAssociate/Step4Page";
import AdminTaskItemOrderCompletionStep1Page from "./pages/Admin/TaskItem/Update/OrderCompletion/Step1Page";
import AdminTaskItemOrderCompletionStep2Page from "./pages/Admin/TaskItem/Update/OrderCompletion/Step2Page";
import AdminTaskItemOrderCompletionStep3Page from "./pages/Admin/TaskItem/Update/OrderCompletion/Step3Page";
import AdminTaskItemOrderCompletionStep4Page from "./pages/Admin/TaskItem/Update/OrderCompletion/Step4Page";
import AdminTaskItemOrderCompletionStep5Page from "./pages/Admin/TaskItem/Update/OrderCompletion/Step5Page";
import AdminTaskItemSurveyStep1Page from "./pages/Admin/TaskItem/Update/Survey/Step1Page";
import AdminTaskItemSurveyStep2Page from "./pages/Admin/TaskItem/Update/Survey/Step2Page";
import AdminTaskItemSurveyStep3Page from "./pages/Admin/TaskItem/Update/Survey/Step3Page";

// Admin financial pages.
import AdminFinancialListPage from "./pages/Admin/Financial/List/Page";
import AdminFinancialDetailPage from "./pages/Admin/Financial/Detail/Page";
import AdminFinancialUpdatePage from "./pages/Admin/Financial/Update/Page";
import AdminFinancialDetailMorePage from "./pages/Admin/Financial/Detail/More/Page";
import AdminFinancialDetailMoreClonePage from "./pages/Admin/Financial/Detail/More/Clone/Page";
import AdminFinancialInvoiceDetailPage from "./pages/Admin/Financial/Detail/Invoice/Page";
import AdminFinancialGenerateInvoiceStep1Page from "./pages/Admin/Financial/Detail/Invoice/Generate/Step1Page";
import AdminFinancialGenerateInvoiceStep2Page from "./pages/Admin/Financial/Detail/Invoice/Generate/Step2Page";
import AdminFinancialGenerateInvoiceStep3Page from "./pages/Admin/Financial/Detail/Invoice/Generate/Step3Page";
import AdminFinancialGenerateInvoiceStep4Page from "./pages/Admin/Financial/Detail/Invoice/Generate/Step4Page";

// Admin staff pages.
import AdminStaffListPage from "./pages/Admin/Staff/List/Page";
import AdminStaffAddStep1PartAPage from "./pages/Admin/Staff/Add/Step1PartAPage";
import AdminStaffAddStep1PartBPage from "./pages/Admin/Staff/Add/Step1PartBPage";
import AdminStaffAddStep2Page from "./pages/Admin/Staff/Add/Step2Page";
import AdminStaffAddStep3Page from "./pages/Admin/Staff/Add/Step3Page";
import AdminStaffAddStep4Page from "./pages/Admin/Staff/Add/Step4Page";
import AdminStaffAddStep5Page from "./pages/Admin/Staff/Add/Step5Page";
import AdminStaffAddStep6Page from "./pages/Admin/Staff/Add/Step6Page";
import AdminStaffAddStep7Page from "./pages/Admin/Staff/Add/Step7Page";
import AdminStaffSearchCriteriaPage from "./pages/Admin/Staff/Search/CriteriaPage";
import AdminStaffSearchResultPage from "./pages/Admin/Staff/Search/ResultPage";
import AdminStaffUpdatePage from "./pages/Admin/Staff/Update/Page";
import AdminStaffDetailLitePage from "./pages/Admin/Staff/Detail/LitePage";
import AdminStaffDetailFullPage from "./pages/Admin/Staff/Detail/FullPage";
import AdminStaffDetailCommentListPage from "./pages/Admin/Staff/Detail/Comment/List/Page";
import AdminStaffDetailOrderListPage from "./pages/Admin/Staff/Detail/Order/List/Page";
import AdminStaffDetailAttachmentAddPage from "./pages/Admin/Staff/Detail/Attachment/Add/Page";
import AdminStaffDetailAttachmentListPage from "./pages/Admin/Staff/Detail/Attachment/List/Page";
import AdminStaffDetailAttachmentDetailPage from "./pages/Admin/Staff/Detail/Attachment/Detail/Page";
import AdminStaffDetailAttachmentUpdatePage from "./pages/Admin/Staff/Detail/Attachment/Update/Page";
import AdminStaffDetailMorePage from "./pages/Admin/Staff/Detail/More/Page";
import AdminStaffDetailMore2FAPage from "./pages/Admin/Staff/Detail/More/2FA/Page";
import AdminStaffDetailMoreArchivePage from "./pages/Admin/Staff/Detail/More/Archive/Page";
import AdminStaffDetailMoreAvatarPage from "./pages/Admin/Staff/Detail/More/Avatar/Page";
import AdminStaffDetailMoreBanPage from "./pages/Admin/Staff/Detail/More/Ban/Page";
import AdminStaffDetailMoreChangePasswordPage from "./pages/Admin/Staff/Detail/More/ChangePassword/Page";
import AdminStaffDetailMoreDeletePage from "./pages/Admin/Staff/Detail/More/Delete/Page";
import AdminStaffDetailMoreDowngradePage from "./pages/Admin/Staff/Detail/More/Downgrade/Page";
import AdminStaffDetailMoreUnarchivePage from "./pages/Admin/Staff/Detail/More/Unarchive/Page";
import AdminStaffDetailMoreUnbanPage from "./pages/Admin/Staff/Detail/More/Unban/Page";
import AdminStaffDetailMoreUpgradePage from "./pages/Admin/Staff/Detail/More/Upgrade/Page";

// Admin skill set pages.
import AdminSkillSetAssociateSearchCriteriaPage from "./pages/Admin/SkillSet/AssociateSearchCriteriaPage";
import AdminSkillSetAssociateSearchResultPage from "./pages/Admin/SkillSet/AssociateSearchResultPage";

// Admin incident pages.
import AdminOrderIncidentListPage from "./pages/Admin/OrderIncident/List/Page";
import AdminOrderIncidentDetailPage from "./pages/Admin/OrderIncident/Detail/Page";
import AdminOrderIncidentAddPage from "./pages/Admin/OrderIncident/Add/Page";

// Admin order history pages.
import AdminJobHistoryLaunchpad from "./pages/Admin/OrderHistory/LaunchpadView";
import AdminMyJobHistoryListView from "./pages/Admin/OrderHistory/MyJobHistoryView";
import AdminTeamJobHistoryListView from "./pages/Admin/OrderHistory/TeamJobHistoryView";

////////////////////////////////////////////////////////////////
// Associate pages
////////////////////////////////////////////////////////////////
import AssociateDashboardPage from "./pages/Associate/Dashboard/Page";

////////////////////////////////////////////////////////////////
// Customer pages
////////////////////////////////////////////////////////////////
import CustomerDashboardPage from "./pages/Customer/Dashboard/Page";

////////////////////////////////////////////////////////////////
// Job Seeker pages
////////////////////////////////////////////////////////////////
import JobSeekerDashboardPage from "./pages/JobSeeker/Dashboard/Page";

////////////////////////////////////////////////////////////////
// Main App Router component
////////////////////////////////////////////////////////////////
function AppRouter() {
  return (
    <ServiceProvider>
      <Router>
        <div style={styles.app}>
          <Routes>
            {/* Front-facing pages (NO LAYOUT) */}
            <Route path="/" element={<IndexPage />} />
            <Route path="/index" element={<IndexPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/register"
              element={
                <PlaceholderPage
                  title="Register"
                  description="User registration"
                />
              }
            />
            <Route
              path="/register/job-seeker/step-1"
              element={
                <PlaceholderPage
                  title="Job Seeker Registration"
                  description="Step 1 of registration for job seekers"
                />
              }
            />
            <Route
              path="/register/employer/step-1"
              element={
                <PlaceholderPage
                  title="Employer Registration"
                  description="Step 1 of registration for employers"
                />
              }
            />
            <Route
              path="/register-successful"
              element={
                <PlaceholderPage
                  title="Registration Successful"
                  description="Your registration was successful"
                />
              }
            />
            <Route
              path="/verify"
              element={
                <PlaceholderPage
                  title="Verify Account"
                  description="Account verification"
                />
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PlaceholderPage
                  title="Forgot Password"
                  description="Password recovery page"
                />
              }
            />
            <Route
              path="/password-reset"
              element={
                <PlaceholderPage
                  title="Reset Password"
                  description="Password reset page"
                />
              }
            />
            <Route
              path="/logout"
              element={
                <PlaceholderPage
                  title="Logout"
                  description="You are being logged out."
                />
              }
            />
            <Route
              path="/terms-of-service"
              element={<PlaceholderPage title="Terms of Service" />}
            />
            <Route
              path="/terms"
              element={<Navigate to="/terms-of-service" />}
            />
            <Route
              path="/privacy"
              element={<PlaceholderPage title="Privacy Policy" />}
            />

            {/* 2FA pages (NO LAYOUT) */}
            <Route path="/login/2fa/step-1" element={<TwoFAStep1Page />} />
            <Route path="/login/2fa/step-2" element={<TwoFAStep2Page />} />
            <Route path="/login/2fa/step-3" element={<TwoFAStep3Page />} />
            <Route
              path="/login/2fa/step-3/backup-code"
              element={<TwoFABackupCodeGeneratePage />}
            />
            <Route path="/login/2fa" element={<TwoFAValidationPage />} />
            <Route
              path="/login/2fa/backup-code"
              element={<TwoFABackupCodeGeneratePage />}
            />
            <Route
              path="/login/2fa/backup-code-recovery"
              element={<TwoFABackupCodeRecoveryPage />}
            />

            {/* Root/Executive routes (NO LAYOUT) */}
            <Route path="/root/dashboard" element={<RootDashboardPage />} />
            <Route path="/root/tenants" element={<RootTenantListPage />} />
            <Route
              path="/root/tenant/:tid"
              element={<RootTenantDetailPage />}
            />
            <Route
              path="/root/tenant/:tid/edit"
              element={<RootTenantUpdatePage />}
            />
            <Route
              path="/root/tenant/:tid/start"
              element={<ToTenantRedirector />}
            />

            {/* Customer routes (WITH LAYOUT) */}
            <Route
              path="/c/dashboard"
              element={
                <Layout>
                  <CustomerDashboardPage />
                </Layout>
              }
            />
            <Route
              path="/c/help"
              element={
                <Layout>
                  <PlaceholderPage title="Customer Help" />
                </Layout>
              }
            />
            <Route
              path="/c/orders"
              element={
                <Layout>
                  <PlaceholderPage title="Customer Orders" />
                </Layout>
              }
            />
            <Route
              path="/c/order/:oid/full"
              element={
                <Layout>
                  <PlaceholderPage title="Customer Order Detail (Full)" />
                </Layout>
              }
            />
            <Route
              path="/c/order/:oid"
              element={
                <Layout>
                  <PlaceholderPage title="Customer Order Detail" />
                </Layout>
              }
            />
            <Route
              path="/c/financials"
              element={
                <Layout>
                  <PlaceholderPage title="Customer Financials" />
                </Layout>
              }
            />
            <Route
              path="/c/financial/:oid"
              element={
                <Layout>
                  <PlaceholderPage title="Customer Financial Detail" />
                </Layout>
              }
            />
            <Route
              path="/c/financial/:oid/invoice"
              element={
                <Layout>
                  <PlaceholderPage title="Customer Invoice" />
                </Layout>
              }
            />
            <Route
              path="/c/financial/:oid/invoice/generate/step-4"
              element={
                <Layout>
                  <PlaceholderPage title="Generate Invoice - Step 4" />
                </Layout>
              }
            />
            <Route
              path="/c/financial/:oid/invoice/generate/step-3"
              element={
                <Layout>
                  <PlaceholderPage title="Generate Invoice - Step 3" />
                </Layout>
              }
            />
            <Route
              path="/c/financial/:oid/invoice/generate/step-2"
              element={
                <Layout>
                  <PlaceholderPage title="Generate Invoice - Step 2" />
                </Layout>
              }
            />
            <Route
              path="/c/financial/:oid/invoice/generate/step-1"
              element={
                <Layout>
                  <PlaceholderPage title="Generate Invoice - Step 1" />
                </Layout>
              }
            />
            <Route
              path="/c/associates"
              element={
                <Layout>
                  <PlaceholderPage title="Client's Associates" />
                </Layout>
              }
            />
            <Route
              path="/c/associate/:cid"
              element={
                <Layout>
                  <PlaceholderPage title="Client's Associate Detail" />
                </Layout>
              }
            />
            <Route
              path="/c/associate/:cid/orders"
              element={
                <Layout>
                  <PlaceholderPage title="Client's Associate Orders" />
                </Layout>
              }
            />

            {/* Associate routes (WITH LAYOUT) */}
            <Route
              path="/a/dashboard"
              element={
                <Layout>
                  <AssociateDashboardPage />
                </Layout>
              }
            />
            <Route
              path="/a/orders"
              element={
                <Layout>
                  <PlaceholderPage title="Associate Orders" />
                </Layout>
              }
            />
            <Route
              path="/a/order/:oid/full"
              element={
                <Layout>
                  <PlaceholderPage title="Associate Order Detail (Full)" />
                </Layout>
              }
            />
            <Route
              path="/a/order/:oid"
              element={
                <Layout>
                  <PlaceholderPage title="Associate Order Detail" />
                </Layout>
              }
            />
            <Route
              path="/a/financials"
              element={
                <Layout>
                  <PlaceholderPage title="Associate Financials" />
                </Layout>
              }
            />
            <Route
              path="/a/financial/:oid"
              element={
                <Layout>
                  <PlaceholderPage title="Associate Financial Detail" />
                </Layout>
              }
            />
            <Route
              path="/a/financial/:oid/invoice"
              element={
                <Layout>
                  <PlaceholderPage title="Associate Invoice" />
                </Layout>
              }
            />
            <Route
              path="/a/financial/:oid/invoice/generate/step-4"
              element={
                <Layout>
                  <PlaceholderPage title="Generate Invoice - Step 4" />
                </Layout>
              }
            />
            <Route
              path="/a/financial/:oid/invoice/generate/step-3"
              element={
                <Layout>
                  <PlaceholderPage title="Generate Invoice - Step 3" />
                </Layout>
              }
            />
            <Route
              path="/a/financial/:oid/invoice/generate/step-2"
              element={
                <Layout>
                  <PlaceholderPage title="Generate Invoice - Step 2" />
                </Layout>
              }
            />
            <Route
              path="/a/financial/:oid/invoice/generate/step-1"
              element={
                <Layout>
                  <PlaceholderPage title="Generate Invoice - Step 1" />
                </Layout>
              }
            />
            <Route
              path="/a/clients"
              element={
                <Layout>
                  <PlaceholderPage title="Associate's Clients" />
                </Layout>
              }
            />
            <Route
              path="/a/client/:cid"
              element={
                <Layout>
                  <PlaceholderPage title="Associate's Client Detail" />
                </Layout>
              }
            />
            <Route
              path="/a/client/:cid/orders"
              element={
                <Layout>
                  <PlaceholderPage title="Associate's Client Orders" />
                </Layout>
              }
            />
            <Route
              path="/a/help"
              element={
                <Layout>
                  <PlaceholderPage title="Associate Help" />
                </Layout>
              }
            />

            {/* Job Seeker routes (WITH LAYOUT) */}
            <Route
              path="/js/dashboard"
              element={
                <Layout>
                  <JobSeekerDashboardPage />
                </Layout>
              }
            />
            <Route
              path="/js/help"
              element={
                <Layout>
                  <PlaceholderPage title="Job Seeker Help" />
                </Layout>
              }
            />

            {/* Staff / Admin routes (WITH LAYOUT) */}
            <Route
              path="/admin/dashboard"
              element={
                <Layout>
                  <AdminDashboardPage />
                </Layout>
              }
            />
            <Route
              path="/admin/help"
              element={
                <Layout>
                  <PlaceholderPage title="Admin Help" />
                </Layout>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <Layout>
                  <PlaceholderPage
                    title="Reports"
                    description="Reporting system"
                  />
                </Layout>
              }
            />
            <Route
              path="/admin/report/1"
              element={
                <Layout>
                  <PlaceholderPage title="Report 1" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/2"
              element={
                <Layout>
                  <PlaceholderPage title="Report 2" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/3"
              element={
                <Layout>
                  <PlaceholderPage title="Report 3" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/4"
              element={
                <Layout>
                  <PlaceholderPage title="Report 4" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/5"
              element={
                <Layout>
                  <PlaceholderPage title="Report 5" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/6"
              element={
                <Layout>
                  <PlaceholderPage title="Report 6" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/7"
              element={
                <Layout>
                  <PlaceholderPage title="Report 7" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/8"
              element={
                <Layout>
                  <PlaceholderPage title="Report 8" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/9"
              element={
                <Layout>
                  <PlaceholderPage title="Report 9" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/10"
              element={
                <Layout>
                  <PlaceholderPage title="Report 10" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/11"
              element={
                <Layout>
                  <PlaceholderPage title="Report 11" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/12"
              element={
                <Layout>
                  <PlaceholderPage title="Report 12" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/13"
              element={
                <Layout>
                  <PlaceholderPage title="Report 13" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/15"
              element={
                <Layout>
                  <PlaceholderPage title="Report 15" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/16"
              element={
                <Layout>
                  <PlaceholderPage title="Report 16" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/17"
              element={
                <Layout>
                  <PlaceholderPage title="Report 17" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/19"
              element={
                <Layout>
                  <PlaceholderPage title="Report 19" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/20"
              element={
                <Layout>
                  <PlaceholderPage title="Report 20" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/21"
              element={
                <Layout>
                  <PlaceholderPage title="Report 21" />
                </Layout>
              }
            />
            <Route
              path="/admin/report/22"
              element={
                <Layout>
                  <PlaceholderPage title="Report 22" />
                </Layout>
              }
            />
            <Route
              path="/admin/skill-sets"
              element={
                <Layout>
                  <AdminSkillSetAssociateSearchCriteriaPage />
                </Layout>
              }
            />
            <Route
              path="/admin/skill-sets/search-results"
              element={
                <Layout>
                  <AdminSkillSetAssociateSearchResultPage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <Layout>
                  <AdminStaffListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/search"
              element={
                <Layout>
                  <AdminStaffSearchCriteriaPage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/search-result"
              element={
                <Layout>
                  <AdminStaffSearchResultPage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/add/step-1-search"
              element={
                <Layout>
                  <AdminStaffAddStep1PartAPage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/add/step-1-results"
              element={
                <Layout>
                  <AdminStaffAddStep1PartBPage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/add/step-2"
              element={
                <Layout>
                  <AdminStaffAddStep2Page />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/add/step-3"
              element={
                <Layout>
                  <AdminStaffAddStep3Page />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/add/step-4"
              element={
                <Layout>
                  <AdminStaffAddStep4Page />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/add/step-5"
              element={
                <Layout>
                  <AdminStaffAddStep5Page />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/add/step-6"
              element={
                <Layout>
                  <AdminStaffAddStep6Page />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/add/step-7"
              element={
                <Layout>
                  <AdminStaffAddStep7Page />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid"
              element={
                <Layout>
                  <AdminStaffDetailLitePage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/detail"
              element={
                <Layout>
                  <AdminStaffDetailFullPage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/edit"
              element={
                <Layout>
                  <AdminStaffUpdatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/comments"
              element={
                <Layout>
                  <AdminStaffDetailCommentListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/attachments"
              element={
                <Layout>
                  <AdminStaffDetailAttachmentListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/attachments/add"
              element={
                <Layout>
                  <AdminStaffDetailAttachmentAddPage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/attachment/:atid"
              element={
                <Layout>
                  <AdminStaffDetailAttachmentDetailPage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/attachment/:atid/edit"
              element={
                <Layout>
                  <AdminStaffDetailAttachmentUpdatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/more"
              element={
                <Layout>
                  <AdminStaffDetailMorePage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/avatar"
              element={
                <Layout>
                  <AdminStaffDetailMoreAvatarPage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/archive"
              element={
                <Layout>
                  <AdminStaffDetailMoreArchivePage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/unarchive"
              element={
                <Layout>
                  <AdminStaffDetailMoreUnarchivePage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/permadelete"
              element={
                <Layout>
                  <AdminStaffDetailMoreDeletePage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/upgrade"
              element={
                <Layout>
                  <AdminStaffDetailMoreUpgradePage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/downgrade"
              element={
                <Layout>
                  <AdminStaffDetailMoreDowngradePage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:sid/2fa"
              element={
                <Layout>
                  <AdminStaffDetailMore2FAPage />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/change-password"
              element={
                <Layout>
                  <AdminStaffDetailMoreChangePasswordPage />
                </Layout>
              }
            />
            <Route
              path="/admin/associates"
              element={
                <Layout>
                  <AdminAssociateListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/search"
              element={
                <Layout>
                  <AdminAssociateSearchCriteriaPage />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/search-result"
              element={
                <Layout>
                  <AdminAssociateSearchResultPage />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/add/step-1-search"
              element={
                <Layout>
                  <AdminAssociateAddStep1PartAPage />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/add/step-1-results"
              element={
                <Layout>
                  <AdminAssociateAddStep1PartBPage />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/add/step-2"
              element={
                <Layout>
                  <AdminAssociateAddStep2Page />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/add/step-3"
              element={
                <Layout>
                  <AdminAssociateAddStep3Page />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/add/step-4"
              element={
                <Layout>
                  <AdminAssociateAddStep4Page />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/add/step-5"
              element={
                <Layout>
                  <AdminAssociateAddStep5Page />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/add/step-6"
              element={
                <Layout>
                  <AdminAssociateAddStep6Page />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/add/step-7"
              element={
                <Layout>
                  <AdminAssociateAddStep7Page />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid"
              element={
                <Layout>
                  <AdminAssociateDetailLitePage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/detail"
              element={
                <Layout>
                  <AdminAssociateDetailFullPage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/orders"
              element={
                <Layout>
                  <AdminAssociateDetailOrderListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/comments"
              element={
                <Layout>
                  <AdminAssociateDetailCommentListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/more"
              element={
                <Layout>
                  <AdminAssociateDetailMorePage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/attachments"
              element={
                <Layout>
                  <AdminAssociateDetailAttachmentListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/attachments/add"
              element={
                <Layout>
                  <AdminAssociateDetailAttachmentAddPage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/attachment/:atid"
              element={
                <Layout>
                  <AdminAssociateDetailAttachmentDetailPage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/attachment/:atid/edit"
              element={
                <Layout>
                  <AdminAssociateDetailAttachmentUpdatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/edit"
              element={
                <Layout>
                  <AdminAssociateUpdatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/change-2fa"
              element={
                <Layout>
                  <AdminAssociateDetailMore2FAPage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/change-password"
              element={
                <Layout>
                  <AdminAssociateDetailMoreChangePasswordPage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/avatar"
              element={
                <Layout>
                  <AdminAssociateDetailMoreAvatarPage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/permadelete"
              element={
                <Layout>
                  <AdminAssociateDetailMoreDeletePage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/archive"
              element={
                <Layout>
                  <AdminAssociateDetailMoreArchivePage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/unarchive"
              element={
                <Layout>
                  <AdminAssociateDetailMoreUnarchivePage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/upgrade"
              element={
                <Layout>
                  <AdminAssociateDetailMoreUpgradePage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/downgrade"
              element={
                <Layout>
                  <AdminAssociateDetailMoreDowngradePage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/ban"
              element={
                <Layout>
                  <AdminAssociateDetailMoreBanPage />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/unban"
              element={
                <Layout>
                  <AdminAssociateDetailMoreUnbanPage />
                </Layout>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <Layout>
                  <AdminCustomerListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/customers/search"
              element={
                <Layout>
                  <AdminCustomerSearchCriteriaPage />
                </Layout>
              }
            />
            <Route
              path="/admin/customers/search-result"
              element={
                <Layout>
                  <AdminCustomerSearchResultPage />
                </Layout>
              }
            />
            <Route
              path="/admin/customers/add/step-1-search"
              element={
                <Layout>
                  <AdminCustomerAddStep1PartAPage />
                </Layout>
              }
            />
            <Route
              path="/admin/customers/add/step-1-results"
              element={
                <Layout>
                  <AdminCustomerAddStep1PartBPage />
                </Layout>
              }
            />
            <Route
              path="/admin/customers/add/step-2"
              element={
                <Layout>
                  <AdminCustomerAddStep2Page />
                </Layout>
              }
            />
            <Route
              path="/admin/customers/add/step-3"
              element={
                <Layout>
                  <AdminCustomerAddStep3Page />
                </Layout>
              }
            />
            <Route
              path="/admin/customers/add/step-4"
              element={
                <Layout>
                  <AdminCustomerAddStep4Page />
                </Layout>
              }
            />
            <Route
              path="/admin/customers/add/step-5"
              element={
                <Layout>
                  <AdminCustomerAddStep5Page />
                </Layout>
              }
            />
            <Route
              path="/admin/customers/add/step-6"
              element={
                <Layout>
                  <AdminCustomerAddStep6Page />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid"
              element={
                <Layout>
                  <AdminCustomerDetailLitePage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/detail"
              element={
                <Layout>
                  <AdminCustomerDetailFullPage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/edit"
              element={
                <Layout>
                  <AdminCustomerUpdatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/orders"
              element={
                <Layout>
                  <AdminCustomerDetailOrderListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/comments"
              element={
                <Layout>
                  <AdminCustomerDetailCommentListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/attachments"
              element={
                <Layout>
                  <AdminCustomerDetailAttachmentListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/attachments/add"
              element={
                <Layout>
                  <AdminCustomerDetailAttachmentAddPage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/attachment/:aid"
              element={
                <Layout>
                  <AdminCustomerDetailAttachmentDetailPage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/attachment/:aid/edit"
              element={
                <Layout>
                  <AdminCustomerDetailAttachmentUpdatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/more"
              element={
                <Layout>
                  <AdminCustomerDetailMorePage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/avatar"
              element={
                <Layout>
                  <AdminCustomerDetailMoreAvatarPage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/permadelete"
              element={
                <Layout>
                  <AdminCustomerDetailMoreDeletePage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/archive"
              element={
                <Layout>
                  <AdminCustomerDetailMoreArchivePage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/unarchive"
              element={
                <Layout>
                  <AdminCustomerDetailMoreUnarchivePage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/upgrade"
              element={
                <Layout>
                  <AdminCustomerDetailMoreUpgradePage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/downgrade"
              element={
                <Layout>
                  <AdminCustomerDetailMoreDowngradePage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/change-2fa"
              element={
                <Layout>
                  <AdminCustomerDetailMore2FAPage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/change-password"
              element={
                <Layout>
                  <AdminCustomerDetailMoreChangePasswordPage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/ban"
              element={
                <Layout>
                  <AdminCustomerDetailMoreBanPage />
                </Layout>
              }
            />
            <Route
              path="/admin/customer/:cid/unban"
              element={
                <Layout>
                  <AdminCustomerDetailMoreUnbanPage />
                </Layout>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <Layout>
                  <AdminOrderListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/orders/search"
              element={
                <Layout>
                  <AdminOrderSearchCriteriaPage />
                </Layout>
              }
            />
            <Route
              path="/admin/orders/search-result"
              element={
                <Layout>
                  <AdminOrderSearchResultPage />
                </Layout>
              }
            />
            <Route
              path="/admin/orders/add/step-1-search"
              element={
                <Layout>
                  <AdminOrderAddStep1PartAPage />
                </Layout>
              }
            />
            <Route
              path="/admin/orders/add/step-1-results"
              element={
                <Layout>
                  <AdminOrderAddStep1PartBPage />
                </Layout>
              }
            />
            <Route
              path="/admin/orders/add/step-2"
              element={
                <Layout>
                  <AdminOrderAddStep2Page />
                </Layout>
              }
            />
            <Route
              path="/admin/orders/add/step-2-from-launchpad"
              element={
                <Layout>
                  <AdminOrderAddStep2Page />
                </Layout>
              }
            />
            <Route
              path="/admin/orders/add/step-3"
              element={
                <Layout>
                  <AdminOrderAddStep3Page />
                </Layout>
              }
            />
            <Route
              path="/admin/orders/add/step-4"
              element={
                <Layout>
                  <AdminOrderAddStep4Page />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid"
              element={
                <Layout>
                  <AdminOrderDetailLitePage />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/full"
              element={
                <Layout>
                  <AdminOrderDetailFullPage />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/activity-sheets"
              element={
                <Layout>
                  <AdminOrderDetailActivitySheetListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/tasks"
              element={
                <Layout>
                  <AdminOrderDetailMoreTaskListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/comments"
              element={
                <Layout>
                  <AdminOrderDetailCommentListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/attachments"
              element={
                <Layout>
                  <AdminOrderDetailAttachmentListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/attachments/add"
              element={
                <Layout>
                  <AdminOrderDetailAttachmentAddPage />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/attachment/:aid"
              element={
                <Layout>
                  <AdminOrderDetailAttachmentDetailPage />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/attachment/:aid/edit"
              element={
                <Layout>
                  <AdminOrderDetailAttachmentUpdatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/update"
              element={
                <Layout>
                  <AdminOrderUpdatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/edit"
              element={
                <Layout>
                  <AdminOrderUpdatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more"
              element={
                <Layout>
                  <AdminOrderDetailMorePage />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/delete"
              element={
                <Layout>
                  <AdminOrderDetailMoreDeletePage />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/unassign"
              element={
                <Layout>
                  <AdminOrderDetailMoreUnassignedPage />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/close"
              element={
                <Layout>
                  <AdminOrderDetailMoreClosePage />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/postpone"
              element={
                <Layout>
                  <AdminOrderDetailMorePostponePage />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/transfer/step-1"
              element={
                <Layout>
                  <AdminOrderDetailMoreTransferStep1Page />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/transfer/step-2"
              element={
                <Layout>
                  <AdminOrderDetailMoreTransferStep2Page />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/transfer/step-3"
              element={
                <Layout>
                  <AdminOrderDetailMoreTransferStep3Page />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/transfer/step-4"
              element={
                <Layout>
                  <AdminOrderDetailMoreTransferStep4Page />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/transfer/step-5"
              element={
                <Layout>
                  <AdminOrderDetailMoreTransferStep5Page />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/incidents"
              element={
                <Layout>
                  <AdminOrderDetailMoreIncidentListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/incidents/create"
              element={
                <Layout>
                  <AdminOrderDetailMoreIncidentAddPage />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/incident/:oiid"
              element={
                <Layout>
                  <AdminOrderDetailMoreIncidentDetailPage />
                </Layout>
              }
            />
            <Route
              path="/admin/incidents"
              element={
                <Layout>
                  <AdminOrderIncidentListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/incidents/create"
              element={
                <Layout>
                  <AdminOrderIncidentAddPage />
                </Layout>
              }
            />
            <Route
              path="/admin/incident/:oiid"
              element={
                <Layout>
                  <AdminOrderIncidentDetailPage />
                </Layout>
              }
            />
            <Route
              path="/admin/job-history"
              element={
                <Layout>
                  <AdminJobHistoryLaunchpad />
                </Layout>
              }
            />
            <Route
              path="/admin/job-history/my-job-history"
              element={
                <Layout>
                  <AdminMyJobHistoryListView />
                </Layout>
              }
            />
            <Route
              path="/admin/job-history/team-job-history"
              element={
                <Layout>
                  <AdminTeamJobHistoryListView />
                </Layout>
              }
            />
            <Route
              path="/admin/all-comments"
              element={
                <Layout>
                  <PlaceholderPage
                    title="Comments"
                    description="Comment management system"
                  />
                </Layout>
              }
            />
            <Route
              path="/admin/tasks"
              element={
                <Layout>
                  <AdminTaskItemListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/close"
              element={
                <Layout>
                  <AdminTaskItemCloseOperationPage />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/postpone"
              element={
                <Layout>
                  <AdminTaskItemPostponeOperationPage />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/survey/step-1"
              element={
                <Layout>
                  <AdminTaskItemSurveyStep1Page />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/survey/step-2"
              element={
                <Layout>
                  <AdminTaskItemSurveyStep2Page />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/survey/step-3"
              element={
                <Layout>
                  <AdminTaskItemSurveyStep3Page />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/order-completion/step-1"
              element={
                <Layout>
                  <AdminTaskItemOrderCompletionStep1Page />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/order-completion/step-2"
              element={
                <Layout>
                  <AdminTaskItemOrderCompletionStep2Page />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/order-completion/step-3"
              element={
                <Layout>
                  <AdminTaskItemOrderCompletionStep3Page />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/order-completion/step-4"
              element={
                <Layout>
                  <AdminTaskItemOrderCompletionStep4Page />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/order-completion/step-5"
              element={
                <Layout>
                  <AdminTaskItemOrderCompletionStep5Page />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/assign-associate/step-1"
              element={
                <Layout>
                  <AdminTaskItemAssignAssociateStep1Page />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/assign-associate/step-2"
              element={
                <Layout>
                  <AdminTaskItemAssignAssociateStep2Page />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/assign-associate/step-3"
              element={
                <Layout>
                  <AdminTaskItemAssignAssociateStep3Page />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/assign-associate/step-4"
              element={
                <Layout>
                  <AdminTaskItemAssignAssociateStep4Page />
                </Layout>
              }
            />
            <Route
              path="/admin/financials"
              element={
                <Layout>
                  <AdminFinancialListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/financial/:oid"
              element={
                <Layout>
                  <AdminFinancialDetailPage />
                </Layout>
              }
            />
            <Route
              path="/admin/financial/:oid/edit"
              element={
                <Layout>
                  <AdminFinancialUpdatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/financial/:oid/invoice"
              element={
                <Layout>
                  <AdminFinancialInvoiceDetailPage />
                </Layout>
              }
            />
            <Route
              path="/admin/financial/:oid/invoice/generate/step-1"
              element={
                <Layout>
                  <AdminFinancialGenerateInvoiceStep1Page />
                </Layout>
              }
            />
            <Route
              path="/admin/financial/:oid/invoice/generate/step-2"
              element={
                <Layout>
                  <AdminFinancialGenerateInvoiceStep2Page />
                </Layout>
              }
            />
            <Route
              path="/admin/financial/:oid/invoice/generate/step-3"
              element={
                <Layout>
                  <AdminFinancialGenerateInvoiceStep3Page />
                </Layout>
              }
            />
            <Route
              path="/admin/financial/:oid/invoice/generate/step-4"
              element={
                <Layout>
                  <AdminFinancialGenerateInvoiceStep4Page />
                </Layout>
              }
            />
            <Route
              path="/admin/financial/:oid/more"
              element={
                <Layout>
                  <AdminFinancialDetailMorePage />
                </Layout>
              }
            />
            <Route
              path="/admin/financial/:oid/more/clone"
              element={
                <Layout>
                  <AdminFinancialDetailMoreClonePage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <Layout>
                  <SettingDashboardPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/bulletins"
              element={
                <Layout>
                  <SettingBulletinListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/bulletin/create"
              element={
                <Layout>
                  <SettingBulletinCreatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/bulletin/:id/detail"
              element={
                <Layout>
                  <SettingBulletinDetailPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/bulletin/:id/update"
              element={
                <Layout>
                  <SettingBulletinUpdatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/skill-sets"
              element={
                <Layout>
                  <SettingSkillSetListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/skill-set/create"
              element={
                <Layout>
                  <SettingSkillSetCreatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/skill-set/:id/detail"
              element={
                <Layout>
                  <SettingSkillSetDetailPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/skill-set/:id/update"
              element={
                <Layout>
                  <SettingSkillSetUpdatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/tags"
              element={
                <Layout>
                  <SettingTagListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/tag/create"
              element={
                <Layout>
                  <SettingTagCreatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/tag/:id/detail"
              element={
                <Layout>
                  <SettingTagDetailPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/tag/:id/update"
              element={
                <Layout>
                  <SettingTagUpdatePage />
                </Layout>
              }
            />

            {/* Associate Away Log Routes */}
            <Route
              path="/admin/settings/associate-away-logs"
              element={
                <Layout>
                  <SettingAssociateAwayLogListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/associate-away-log/create"
              element={
                <Layout>
                  <SettingAssociateAwayLogCreatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/associate-away-log/:id/detail"
              element={
                <Layout>
                  <SettingAssociateAwayLogDetailPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/associate-away-log/:id/update"
              element={
                <Layout>
                  <SettingAssociateAwayLogUpdatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/associate-away-log/:id/delete"
              element={
                <Layout>
                  <SettingAssociateAwayLogDeletePage />
                </Layout>
              }
            />

            <Route
              path="/admin/settings/insurance-requirements"
              element={
                <Layout>
                  <SettingInsuranceRequirementListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/insurance-requirement/create"
              element={
                <Layout>
                  <SettingInsuranceRequirementCreatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/insurance-requirement/:id/detail"
              element={
                <Layout>
                  <SettingInsuranceRequirementDetailPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/insurance-requirement/:id/update"
              element={
                <Layout>
                  <SettingInsuranceRequirementUpdatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/service-fees"
              element={
                <Layout>
                  <SettingServiceFeeListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/service-fees/create"
              element={
                <Layout>
                  <SettingServiceFeeCreatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/service-fee/:id/detail"
              element={
                <Layout>
                  <SettingServiceFeeDetailPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/service-fee/:id/update"
              element={
                <Layout>
                  <SettingServiceFeeUpdatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/service-fee/:id/delete"
              element={
                <Layout>
                  <SettingServiceFeeDeletePage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/vehicle-types"
              element={
                <Layout>
                  <SettingVehicleTypeListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/vehicle-type/create"
              element={
                <Layout>
                  <SettingVehicleTypeCreatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/vehicle-type/:id/detail"
              element={
                <Layout>
                  <SettingVehicleTypeDetailPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/vehicle-type/:id/update"
              element={
                <Layout>
                  <SettingVehicleTypeUpdatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/how-hear-about-us-items"
              element={
                <Layout>
                  <SettingHowHearAboutUsItemListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/how-hear-about-us-item/create"
              element={
                <Layout>
                  <SettingHowHearAboutUsItemCreatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/how-hear-about-us-item/:id/detail"
              element={
                <Layout>
                  <SettingHowHearAboutUsItemDetailPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/how-hear-about-us-item/:id/update"
              element={
                <Layout>
                  <SettingHowHearAboutUsItemUpdatePage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/noc/search"
              element={
                <Layout>
                  <SettingNOCSearchPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/noc/search-result"
              element={
                <Layout>
                  <SettingNOCSearchResultPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/naics/search"
              element={
                <Layout>
                  <SettingNAICSSearchPage />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/naics/search-result"
              element={
                <Layout>
                  <SettingNAICSSearchResultPage />
                </Layout>
              }
            />

            {/* Account routes (WITH LAYOUT) */}
            <Route
              path="/account"
              element={
                <Layout>
                  <PlaceholderPage title="My Profile" />
                </Layout>
              }
            />
            <Route
              path="/account/edit"
              element={
                <Layout>
                  <PlaceholderPage title="Edit My Profile" />
                </Layout>
              }
            />
            <Route
              path="/account/2fa"
              element={
                <Layout>
                  <PlaceholderPage title="My 2FA Settings" />
                </Layout>
              }
            />
            <Route
              path="/account/2fa/setup/step-1"
              element={
                <Layout>
                  <PlaceholderPage title="Setup 2FA - Step 1" />
                </Layout>
              }
            />
            <Route
              path="/account/2fa/setup/step-2"
              element={
                <Layout>
                  <PlaceholderPage title="Setup 2FA - Step 2" />
                </Layout>
              }
            />
            <Route
              path="/account/2fa/setup/step-3"
              element={
                <Layout>
                  <PlaceholderPage title="Setup 2FA - Step 3" />
                </Layout>
              }
            />
            <Route
              path="/account/2fa/backup-code"
              element={
                <Layout>
                  <PlaceholderPage title="My 2FA Backup Codes" />
                </Layout>
              }
            />
            <Route
              path="/account/more"
              element={
                <Layout>
                  <PlaceholderPage title="More Account Actions" />
                </Layout>
              }
            />
            <Route
              path="/account/more/change-password"
              element={
                <Layout>
                  <PlaceholderPage title="Change My Password" />
                </Layout>
              }
            />

            {/* Help routes (WITH LAYOUT) */}
            <Route
              path="/help"
              element={
                <Layout>
                  <PlaceholderPage
                    title="Help"
                    description="Help and support"
                  />
                </Layout>
              }
            />

            {/* Common pages */}
            <Route path="/dashboard" element={<DashboardRedirector />} />

            {/* Error routes (NO LAYOUT) */}
            <Route path="/501" element={<ServerErrorPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </div>
      </Router>
    </ServiceProvider>
  );
}

export default AppRouter;
