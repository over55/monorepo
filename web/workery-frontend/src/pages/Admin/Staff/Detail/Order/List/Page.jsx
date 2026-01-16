// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/Order/List/Page.jsx
// @uix-page: StaffOrderListPage
// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb, UIXThemeProvider, useUIXTheme)
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import {
  useDashboardManager,
  useAuthManager,
} from "../../../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Spinner,
  Breadcrumb,
  Modal,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../components/UIX";

function AdminStaffDetailOrderListPage() {
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Memoized unauthorized handler
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  return (
    <>
      <h1>Welcome to AdminStaffDetailOrderListPage</h1>
      {/* TODO: Implement */}
    </>
  );
}

// Wrapper with UIXThemeProvider
function AdminStaffDetailOrderListPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminStaffDetailOrderListPage />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailOrderListPageWithProvider;
