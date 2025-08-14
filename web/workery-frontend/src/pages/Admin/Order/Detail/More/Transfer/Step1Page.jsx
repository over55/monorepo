// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Transfer/Step1Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  // useDashboardManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  Input,
  TextArea,
  Select,
} from "../../../../../../components/UI";

function AdminOrderDetailMoreTransferStep1Page() {
  // const dashboardManager = useDashboardManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  // const [dashboard, setDashboard] = useState({});

  // Modal states
  // const [showBulletinModal, setShowBulletinModal] = useState(false);

  // const onUnauthorized = () => {
  //   navigate("/login?unauthorized=true");
  // };

  // const fetchDashboard = async () => {
  //   setFetching(true);
  //   setErrors({});

  //   try {
  //     const dashboardData = await dashboardManager.getDashboard(onUnauthorized);
  //     setDashboard(dashboardData);
  //     console.log("AdminDashboard: Dashboard data loaded successfully");
  //   } catch (error) {
  //     console.error("AdminDashboard: Failed to fetch dashboard:", error);
  //     setErrors({ fetch: error.message || "Failed to load dashboard data" });
  //     window.scrollTo(0, 0);
  //   } finally {
  //     setFetching(false);
  //   }
  // };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      // fetchDashboard();
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (isFetching) {
    return <Loading message="Loading ..." />;
  }

  const styles = {};

  return (
    <div style={globalStyles.container}>
      <h1>Welcome to AdminOrderDetailMoreTransferStep1Page</h1>
    </div>
  );
}

export default AdminOrderDetailMoreTransferStep1Page;
