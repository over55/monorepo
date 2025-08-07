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

            {/* Admin routes (WITH LAYOUT) */}
            <Route
              path="/admin/dashboard"
              element={
                <Layout>
                  <AdminDashboardPage />
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
              path="/admin/skill-sets"
              element={
                <Layout>
                  <PlaceholderPage
                    title="Skill Sets"
                    description="Skill set management system"
                  />
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
              path="/admin/settings"
              element={
                <Layout>
                  <PlaceholderPage
                    title="Settings"
                    description="System settings"
                  />
                </Layout>
              }
            />

            {/* Associate routes (WITH LAYOUT) */}
            <Route
              path="/a/dashboard"
              element={
                <Layout>
                  <PlaceholderPage
                    title="Associate Dashboard"
                    description="Dashboard for associates"
                  />
                </Layout>
              }
            />

            {/* Customer routes (WITH LAYOUT) */}
            <Route
              path="/c/dashboard"
              element={
                <Layout>
                  <PlaceholderPage
                    title="Customer Dashboard"
                    description="Dashboard for customers"
                  />
                </Layout>
              }
            />

            {/* Job Seeker routes (WITH LAYOUT) */}
            <Route
              path="/js/dashboard"
              element={
                <Layout>
                  <PlaceholderPage
                    title="Job Seeker Dashboard"
                    description="Dashboard for job seekers"
                  />
                </Layout>
              }
            />

            {/* Account route (WITH LAYOUT) */}
            <Route
              path="/account"
              element={
                <Layout>
                  <PlaceholderPage
                    title="My Profile"
                    description="User profile management"
                  />
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

            {/* Catch-all route for unknown paths */}
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </div>
      </Router>
    </ServiceProvider>
  );
}

export default AppRouter;
