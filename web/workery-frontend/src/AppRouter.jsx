// File Path: src/AppRouter.jsx - UPDATED VERSION
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { ServiceProvider } from "./services/Services";
import Layout from "./components/Layout/Layout";

// Front-facing pages
import IndexPage from "./pages/Anonymous/Index/Page";
import LoginPage from "./pages/Anonymous/Login/Page";

// Root/Executive pages
import RootDashboardPage from "./pages/Root/Dashboard/Page";
import RootTenantListPage from "./pages/Root/Tenant/List/Page";
import RootTenantDetailPage from "./pages/Root/Tenant/Detail/Page";
import RootTenantUpdatePage from "./pages/Root/Tenant/Update/Page";
import ToTenantRedirector from "./pages/Root/ToTenant/Redirector";

// Admin pages (Management/Frontline)
import AdminDashboardPage from "./pages/Admin/Dashboard/Page";

// Settings pages
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

// Associate pages
import AssociateDashboardPage from "./pages/Associate/Dashboard/Page";

// Customer pages
import CustomerDashboardPage from "./pages/Customer/Dashboard/Page";

// Job Seeker pages
import JobSeekerDashboardPage from "./pages/JobSeeker/Dashboard/Page";

// 2FA pages
import TwoFAStep1Page from "./pages/Anonymous/TwoFA/Step1Page";
import TwoFAStep2Page from "./pages/Anonymous/TwoFA/Step2Page";
import TwoFAStep3Page from "./pages/Anonymous/TwoFA/Step3Page";
import TwoFAValidationPage from "./pages/Anonymous/TwoFA/ValidationPage";
import TwoFABackupCodeGeneratePage from "./pages/Anonymous/TwoFA/BackupCodeGeneratePage";
import TwoFABackupCodeRecoveryPage from "./pages/Anonymous/TwoFA/BackupCodeRecoveryPage";

// Error pages
import NotFoundPage from "./pages/Error/NotFoundPage";
import ServerErrorPage from "./pages/Error/ServerErrorPage";

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

// Main App component
function AppRouter() {
  return (
    <ServiceProvider>
      <Router>
        <div style={styles.app}>
          <Routes>
            {/* Front-facing pages (NO LAYOUT) */}
            <Route path="/" element={<IndexPage />} />
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
              path="/privacy"
              element={<PlaceholderPage title="Privacy Policy" />}
            />

            {/* 2FA pages (NO LAYOUT) */}
            <Route path="/login/2fa/step-1" element={<TwoFAStep1Page />} />
            <Route path="/login/2fa/step-2" element={<TwoFAStep2Page />} />
            <Route path="/login/2fa/step-3" element={<TwoFAStep3Page />} />
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
                  <PlaceholderPage title="Skill Sets Search" />
                </Layout>
              }
            />
            <Route
              path="/admin/skill-sets/search-results"
              element={
                <Layout>
                  <PlaceholderPage title="Skill Sets Search Results" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <Layout>
                  <PlaceholderPage
                    title="Staff"
                    description="Staff management system"
                  />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/search"
              element={
                <Layout>
                  <PlaceholderPage title="Staff Search" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/search-result"
              element={
                <Layout>
                  <PlaceholderPage title="Staff Search Result" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/add/step-1-search"
              element={
                <Layout>
                  <PlaceholderPage title="Add Staff - Step 1" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/add/step-1-results"
              element={
                <Layout>
                  <PlaceholderPage title="Add Staff - Step 1 Results" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/add/step-2"
              element={
                <Layout>
                  <PlaceholderPage title="Add Staff - Step 2" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/add/step-3"
              element={
                <Layout>
                  <PlaceholderPage title="Add Staff - Step 3" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/add/step-4"
              element={
                <Layout>
                  <PlaceholderPage title="Add Staff - Step 4" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/add/step-5"
              element={
                <Layout>
                  <PlaceholderPage title="Add Staff - Step 5" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/add/step-6"
              element={
                <Layout>
                  <PlaceholderPage title="Add Staff - Step 6" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/add/step-7"
              element={
                <Layout>
                  <PlaceholderPage title="Add Staff - Step 7" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid"
              element={
                <Layout>
                  <PlaceholderPage title="Staff Detail" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/detail"
              element={
                <Layout>
                  <PlaceholderPage title="Staff Detail (Full)" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/edit"
              element={
                <Layout>
                  <PlaceholderPage title="Edit Staff" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/comments"
              element={
                <Layout>
                  <PlaceholderPage title="Staff Comments" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/attachments"
              element={
                <Layout>
                  <PlaceholderPage title="Staff Attachments" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/attachments/add"
              element={
                <Layout>
                  <PlaceholderPage title="Add Staff Attachment" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/attachment/:atid"
              element={
                <Layout>
                  <PlaceholderPage title="Staff Attachment Detail" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/attachment/:atid/edit"
              element={
                <Layout>
                  <PlaceholderPage title="Edit Staff Attachment" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/more"
              element={
                <Layout>
                  <PlaceholderPage title="Staff More Actions" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/avatar"
              element={
                <Layout>
                  <PlaceholderPage title="Staff Avatar" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/archive"
              element={
                <Layout>
                  <PlaceholderPage title="Archive Staff" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/unarchive"
              element={
                <Layout>
                  <PlaceholderPage title="Unarchive Staff" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/permadelete"
              element={
                <Layout>
                  <PlaceholderPage title="Delete Staff" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/upgrade"
              element={
                <Layout>
                  <PlaceholderPage title="Upgrade Staff" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/downgrade"
              element={
                <Layout>
                  <PlaceholderPage title="Downgrade Staff" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:sid/2fa"
              element={
                <Layout>
                  <PlaceholderPage title="Toggle Staff 2FA" />
                </Layout>
              }
            />
            <Route
              path="/admin/staff/:aid/change-password"
              element={
                <Layout>
                  <PlaceholderPage title="Change Staff Password" />
                </Layout>
              }
            />
            <Route
              path="/admin/associates"
              element={
                <Layout>
                  <PlaceholderPage
                    title="Associates"
                    description="Associate management system"
                  />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/search"
              element={
                <Layout>
                  <PlaceholderPage title="Associate Search" />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/search-result"
              element={
                <Layout>
                  <PlaceholderPage title="Associate Search Result" />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/add/step-1-search"
              element={
                <Layout>
                  <PlaceholderPage title="Add Associate - Step 1" />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/add/step-1-results"
              element={
                <Layout>
                  <PlaceholderPage title="Add Associate - Step 1 Results" />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/add/step-2"
              element={
                <Layout>
                  <PlaceholderPage title="Add Associate - Step 2" />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/add/step-3"
              element={
                <Layout>
                  <PlaceholderPage title="Add Associate - Step 3" />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/add/step-4"
              element={
                <Layout>
                  <PlaceholderPage title="Add Associate - Step 4" />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/add/step-5"
              element={
                <Layout>
                  <PlaceholderPage title="Add Associate - Step 5" />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/add/step-6"
              element={
                <Layout>
                  <PlaceholderPage title="Add Associate - Step 6" />
                </Layout>
              }
            />
            <Route
              path="/admin/associates/add/step-7"
              element={
                <Layout>
                  <PlaceholderPage title="Add Associate - Step 7" />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid"
              element={
                <Layout>
                  <PlaceholderPage title="Associate Detail" />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/detail"
              element={
                <Layout>
                  <PlaceholderPage title="Associate Detail (Full)" />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/orders"
              element={
                <Layout>
                  <PlaceholderPage title="Associate Orders" />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/comments"
              element={
                <Layout>
                  <PlaceholderPage title="Associate Comments" />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/more"
              element={
                <Layout>
                  <PlaceholderPage title="Associate More Actions" />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/attachments"
              element={
                <Layout>
                  <PlaceholderPage title="Associate Attachments" />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/attachments/add"
              element={
                <Layout>
                  <PlaceholderPage title="Add Associate Attachment" />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/attachment/:atid"
              element={
                <Layout>
                  <PlaceholderPage title="Associate Attachment Detail" />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/attachment/:atid/edit"
              element={
                <Layout>
                  <PlaceholderPage title="Edit Associate Attachment" />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/edit"
              element={
                <Layout>
                  <PlaceholderPage title="Edit Associate" />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/change-2fa"
              element={
                <Layout>
                  <PlaceholderPage title="Toggle Associate 2FA" />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/change-password"
              element={
                <Layout>
                  <PlaceholderPage title="Change Associate Password" />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/avatar"
              element={
                <Layout>
                  <PlaceholderPage title="Associate Avatar" />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/permadelete"
              element={
                <Layout>
                  <PlaceholderPage title="Delete Associate" />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/archive"
              element={
                <Layout>
                  <PlaceholderPage title="Archive Associate" />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/unarchive"
              element={
                <Layout>
                  <PlaceholderPage title="Unarchive Associate" />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/upgrade"
              element={
                <Layout>
                  <PlaceholderPage title="Upgrade Associate" />
                </Layout>
              }
            />
            <Route
              path="/admin/associate/:aid/downgrade"
              element={
                <Layout>
                  <PlaceholderPage title="Downgrade Associate" />
                </Layout>
              }
            />
            <Route
              path="/admin/clients"
              element={
                <Layout>
                  <PlaceholderPage
                    title="Clients"
                    description="Client management system"
                  />
                </Layout>
              }
            />
            <Route
              path="/admin/clients/search"
              element={
                <Layout>
                  <PlaceholderPage title="Client Search" />
                </Layout>
              }
            />
            <Route
              path="/admin/clients/search-result"
              element={
                <Layout>
                  <PlaceholderPage title="Client Search Results" />
                </Layout>
              }
            />
            <Route
              path="/admin/clients/add/step-1-search"
              element={
                <Layout>
                  <PlaceholderPage title="Add Client - Step 1" />
                </Layout>
              }
            />
            <Route
              path="/admin/clients/add/step-1-results"
              element={
                <Layout>
                  <PlaceholderPage title="Add Client - Step 1 Results" />
                </Layout>
              }
            />
            <Route
              path="/admin/clients/add/step-2"
              element={
                <Layout>
                  <PlaceholderPage title="Add Client - Step 2" />
                </Layout>
              }
            />
            <Route
              path="/admin/clients/add/step-3"
              element={
                <Layout>
                  <PlaceholderPage title="Add Client - Step 3" />
                </Layout>
              }
            />
            <Route
              path="/admin/clients/add/step-4"
              element={
                <Layout>
                  <PlaceholderPage title="Add Client - Step 4" />
                </Layout>
              }
            />
            <Route
              path="/admin/clients/add/step-5"
              element={
                <Layout>
                  <PlaceholderPage title="Add Client - Step 5" />
                </Layout>
              }
            />
            <Route
              path="/admin/clients/add/step-6"
              element={
                <Layout>
                  <PlaceholderPage title="Add Client - Step 6" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid"
              element={
                <Layout>
                  <PlaceholderPage title="Client Detail" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/detail"
              element={
                <Layout>
                  <PlaceholderPage title="Client Detail (Full)" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/edit"
              element={
                <Layout>
                  <PlaceholderPage title="Edit Client" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/orders"
              element={
                <Layout>
                  <PlaceholderPage title="Client Orders" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/comments"
              element={
                <Layout>
                  <PlaceholderPage title="Client Comments" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/attachments"
              element={
                <Layout>
                  <PlaceholderPage title="Client Attachments" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/attachments/add"
              element={
                <Layout>
                  <PlaceholderPage title="Add Client Attachment" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/attachment/:aid"
              element={
                <Layout>
                  <PlaceholderPage title="Client Attachment Detail" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/attachment/:aid/edit"
              element={
                <Layout>
                  <PlaceholderPage title="Edit Client Attachment" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/more"
              element={
                <Layout>
                  <PlaceholderPage title="Client More Actions" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/avatar"
              element={
                <Layout>
                  <PlaceholderPage title="Client Avatar" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/permadelete"
              element={
                <Layout>
                  <PlaceholderPage title="Delete Client" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/archive"
              element={
                <Layout>
                  <PlaceholderPage title="Archive Client" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/unarchive"
              element={
                <Layout>
                  <PlaceholderPage title="Unarchive Client" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/upgrade"
              element={
                <Layout>
                  <PlaceholderPage title="Upgrade Client" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/downgrade"
              element={
                <Layout>
                  <PlaceholderPage title="Downgrade Client" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/change-2fa"
              element={
                <Layout>
                  <PlaceholderPage title="Toggle Client 2FA" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/change-password"
              element={
                <Layout>
                  <PlaceholderPage title="Change Client Password" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/ban"
              element={
                <Layout>
                  <PlaceholderPage title="Ban Client" />
                </Layout>
              }
            />
            <Route
              path="/admin/client/:cid/unban"
              element={
                <Layout>
                  <PlaceholderPage title="Unban Client" />
                </Layout>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <Layout>
                  <PlaceholderPage
                    title="Work Orders"
                    description="Work order management system"
                  />
                </Layout>
              }
            />
            <Route
              path="/admin/orders/search"
              element={
                <Layout>
                  <PlaceholderPage title="Order Search" />
                </Layout>
              }
            />
            <Route
              path="/admin/orders/search-result"
              element={
                <Layout>
                  <PlaceholderPage title="Order Search Result" />
                </Layout>
              }
            />
            <Route
              path="/admin/orders/add/step-1-search"
              element={
                <Layout>
                  <PlaceholderPage title="Add Order - Step 1" />
                </Layout>
              }
            />
            <Route
              path="/admin/orders/add/step-1-results"
              element={
                <Layout>
                  <PlaceholderPage title="Add Order - Step 1 Results" />
                </Layout>
              }
            />
            <Route
              path="/admin/orders/add/step-2"
              element={
                <Layout>
                  <PlaceholderPage title="Add Order - Step 2" />
                </Layout>
              }
            />
            <Route
              path="/admin/orders/add/step-2-from-launchpad"
              element={
                <Layout>
                  <PlaceholderPage title="Add Order" />
                </Layout>
              }
            />
            <Route
              path="/admin/orders/add/step-3"
              element={
                <Layout>
                  <PlaceholderPage title="Add Order - Step 3" />
                </Layout>
              }
            />
            <Route
              path="/admin/orders/add/step-4"
              element={
                <Layout>
                  <PlaceholderPage title="Add Order - Step 4" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid"
              element={
                <Layout>
                  <PlaceholderPage title="Order Detail" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/full"
              element={
                <Layout>
                  <PlaceholderPage title="Order Detail (Full)" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/activity-sheets"
              element={
                <Layout>
                  <PlaceholderPage title="Order Activity Sheets" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/tasks"
              element={
                <Layout>
                  <PlaceholderPage title="Order Tasks" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/comments"
              element={
                <Layout>
                  <PlaceholderPage title="Order Comments" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/attachments"
              element={
                <Layout>
                  <PlaceholderPage title="Order Attachments" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/attachments/add"
              element={
                <Layout>
                  <PlaceholderPage title="Add Order Attachment" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/attachment/:aid"
              element={
                <Layout>
                  <PlaceholderPage title="Order Attachment Detail" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/attachment/:aid/edit"
              element={
                <Layout>
                  <PlaceholderPage title="Edit Order Attachment" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/update"
              element={
                <Layout>
                  <PlaceholderPage title="Update Order" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/edit"
              element={
                <Layout>
                  <PlaceholderPage title="Edit Order" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more"
              element={
                <Layout>
                  <PlaceholderPage title="Order More Actions" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/delete"
              element={
                <Layout>
                  <PlaceholderPage title="Delete Order" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/unassign"
              element={
                <Layout>
                  <PlaceholderPage title="Unassign Order" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/close"
              element={
                <Layout>
                  <PlaceholderPage title="Close Order" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/postpone"
              element={
                <Layout>
                  <PlaceholderPage title="Postpone Order" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/transfer/step-1"
              element={
                <Layout>
                  <PlaceholderPage title="Transfer Order - Step 1" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/transfer/step-2"
              element={
                <Layout>
                  <PlaceholderPage title="Transfer Order - Step 2" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/transfer/step-3"
              element={
                <Layout>
                  <PlaceholderPage title="Transfer Order - Step 3" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/transfer/step-4"
              element={
                <Layout>
                  <PlaceholderPage title="Transfer Order - Step 4" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/transfer/step-5"
              element={
                <Layout>
                  <PlaceholderPage title="Transfer Order - Step 5" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/incidents"
              element={
                <Layout>
                  <PlaceholderPage title="Order Incidents" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/incidents/create"
              element={
                <Layout>
                  <PlaceholderPage title="Create Order Incident" />
                </Layout>
              }
            />
            <Route
              path="/admin/order/:oid/more/incident/:oiid"
              element={
                <Layout>
                  <PlaceholderPage title="Order Incident Detail" />
                </Layout>
              }
            />
            <Route
              path="/admin/incidents"
              element={
                <Layout>
                  <PlaceholderPage
                    title="Incidents"
                    description="Incident management system"
                  />
                </Layout>
              }
            />
            <Route
              path="/admin/incidents/create"
              element={
                <Layout>
                  <PlaceholderPage title="Create Incident" />
                </Layout>
              }
            />
            <Route
              path="/admin/incident/:oid/:oiid"
              element={
                <Layout>
                  <PlaceholderPage title="Incident Detail" />
                </Layout>
              }
            />
            <Route
              path="/admin/job-history"
              element={
                <Layout>
                  <PlaceholderPage
                    title="Job History"
                    description="Job history tracking system"
                  />
                </Layout>
              }
            />
            <Route
              path="/admin/job-history/my-job-history"
              element={
                <Layout>
                  <PlaceholderPage title="My Job History" />
                </Layout>
              }
            />
            <Route
              path="/admin/job-history/team-job-history"
              element={
                <Layout>
                  <PlaceholderPage title="Team Job History" />
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
                  <PlaceholderPage
                    title="Tasks"
                    description="Task management system"
                  />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/close"
              element={
                <Layout>
                  <PlaceholderPage title="Close Task" />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/postpone"
              element={
                <Layout>
                  <PlaceholderPage title="Postpone Task" />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/survey/step-1"
              element={
                <Layout>
                  <PlaceholderPage title="Task Survey - Step 1" />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/survey/step-2"
              element={
                <Layout>
                  <PlaceholderPage title="Task Survey - Step 2" />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/survey/step-3"
              element={
                <Layout>
                  <PlaceholderPage title="Task Survey - Step 3" />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/order-completion/step-1"
              element={
                <Layout>
                  <PlaceholderPage title="Order Completion - Step 1" />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/order-completion/step-2"
              element={
                <Layout>
                  <PlaceholderPage title="Order Completion - Step 2" />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/order-completion/step-3"
              element={
                <Layout>
                  <PlaceholderPage title="Order Completion - Step 3" />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/order-completion/step-4"
              element={
                <Layout>
                  <PlaceholderPage title="Order Completion - Step 4" />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/order-completion/step-5"
              element={
                <Layout>
                  <PlaceholderPage title="Order Completion - Step 5" />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/assign-associate/step-1"
              element={
                <Layout>
                  <PlaceholderPage title="Assign Associate - Step 1" />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/assign-associate/step-2"
              element={
                <Layout>
                  <PlaceholderPage title="Assign Associate - Step 2" />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/assign-associate/step-3"
              element={
                <Layout>
                  <PlaceholderPage title="Assign Associate - Step 3" />
                </Layout>
              }
            />
            <Route
              path="/admin/task/:tid/assign-associate/step-4"
              element={
                <Layout>
                  <PlaceholderPage title="Assign Associate - Step 4" />
                </Layout>
              }
            />
            <Route
              path="/admin/financials"
              element={
                <Layout>
                  <PlaceholderPage
                    title="Financials"
                    description="Financial management system"
                  />
                </Layout>
              }
            />
            <Route
              path="/admin/financial/:oid"
              element={
                <Layout>
                  <PlaceholderPage title="Financial Detail" />
                </Layout>
              }
            />
            <Route
              path="/admin/financial/:oid/edit"
              element={
                <Layout>
                  <PlaceholderPage title="Edit Financial" />
                </Layout>
              }
            />
            <Route
              path="/admin/financial/:oid/invoice"
              element={
                <Layout>
                  <PlaceholderPage title="Financial Invoice" />
                </Layout>
              }
            />
            <Route
              path="/admin/financial/:oid/invoice/generate/step-1"
              element={
                <Layout>
                  <PlaceholderPage title="Generate Invoice - Step 1" />
                </Layout>
              }
            />
            <Route
              path="/admin/financial/:oid/invoice/generate/step-2"
              element={
                <Layout>
                  <PlaceholderPage title="Generate Invoice - Step 2" />
                </Layout>
              }
            />
            <Route
              path="/admin/financial/:oid/invoice/generate/step-3"
              element={
                <Layout>
                  <PlaceholderPage title="Generate Invoice - Step 3" />
                </Layout>
              }
            />
            <Route
              path="/admin/financial/:oid/invoice/generate/step-4"
              element={
                <Layout>
                  <PlaceholderPage title="Generate Invoice - Step 4" />
                </Layout>
              }
            />
            <Route
              path="/admin/financial/:oid/more"
              element={
                <Layout>
                  <PlaceholderPage title="Financial More Actions" />
                </Layout>
              }
            />
            <Route
              path="/admin/financial/:oid/more/clone"
              element={
                <Layout>
                  <PlaceholderPage title="Clone Financial" />
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
                  <PlaceholderPage title="Bulletins" />
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
            <Route
              path="/admin/settings/associate-away-logs"
              element={
                <Layout>
                  <PlaceholderPage title="Associate Away Logs" />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/insurance-requirements"
              element={
                <Layout>
                  <PlaceholderPage title="Insurance Requirements" />
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
              path="/admin/settings/inactive-clients"
              element={
                <Layout>
                  <PlaceholderPage title="Inactive Clients" />
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
                  <PlaceholderPage title="How Hear About Us Items" />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/noc/search"
              element={
                <Layout>
                  <PlaceholderPage title="NOC Search" />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/noc/search-result"
              element={
                <Layout>
                  <PlaceholderPage title="NOC Search Result" />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/naics/search"
              element={
                <Layout>
                  <PlaceholderPage title="NAICS Search" />
                </Layout>
              }
            />
            <Route
              path="/admin/settings/naics/search-result"
              element={
                <Layout>
                  <PlaceholderPage title="NAICS Search Result" />
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
