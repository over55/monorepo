// File Path: src/AppRouter.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { ServiceProvider } from "./services/Services";

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
            {/* Front-facing pages */}
            <Route path="/" element={<IndexPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* 2FA pages */}
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

            {/* Root/Executive routes */}
            <Route path="/root/dashboard" element={<RootDashboardPage />} />
            <Route
              path="/root/tenants"
              element={
                <PlaceholderPage
                  title="Tenants List"
                  description="List of all tenants/organizations in the system"
                />
              }
            />
            <Route
              path="/root/tenant/:tid"
              element={
                <PlaceholderPage
                  title="Tenant Details"
                  description="Detailed view of a specific tenant"
                />
              }
            />
            <Route
              path="/root/tenant/:tid/edit"
              element={
                <PlaceholderPage
                  title="Edit Tenant"
                  description="Edit tenant information"
                />
              }
            />
            <Route
              path="/root/tenant/:tid/start"
              element={<ToTenantRedirector />}
            />

            {/* Admin routes (Management/Frontline) */}
            <Route
              path="/admin/dashboard"
              element={
                <PlaceholderPage
                  title="Admin Dashboard"
                  description="Dashboard for management and frontline staff"
                />
              }
            />

            {/* Associate routes */}
            <Route
              path="/a/dashboard"
              element={
                <PlaceholderPage
                  title="Associate Dashboard"
                  description="Dashboard for associates"
                />
              }
            />

            {/* Customer routes */}
            <Route
              path="/c/dashboard"
              element={
                <PlaceholderPage
                  title="Customer Dashboard"
                  description="Dashboard for customers"
                />
              }
            />

            {/* Job Seeker routes */}
            <Route
              path="/js/dashboard"
              element={
                <PlaceholderPage
                  title="Job Seeker Dashboard"
                  description="Dashboard for job seekers"
                />
              }
            />

            {/* Error routes */}
            <Route
              path="/501"
              element={
                <PlaceholderPage
                  title="Server Error"
                  description="An internal server error has occurred."
                />
              }
            />
            <Route
              path="/404"
              element={
                <PlaceholderPage
                  title="Page Not Found"
                  description="The page you're looking for doesn't exist."
                />
              }
            />

            {/* Catch-all route for unknown paths */}
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </div>
      </Router>
    </ServiceProvider>
  );
}

export default AppRouter;
