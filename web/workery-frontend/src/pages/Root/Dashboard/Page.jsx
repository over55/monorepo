// File Path: web/workery-frontend/src/pages/Root/Dashboard/Page.jsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager, useTenantManager } from "../../../services/Services";
import { theme, globalStyles } from "../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../components/UI";

function RootDashboardPage() {
  const authManager = useAuthManager();
  const tenantManager = useTenantManager();
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => {
    try {
      console.log("RootDashboard: Initiating logout...");
      await authManager.logout();
      console.log("RootDashboard: Logout successful, redirecting to login");
      navigate("/login");
    } catch (error) {
      console.error("RootDashboard: Logout failed:", error);
      navigate("/login");
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      const authenticated = authManager.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (!authenticated) {
        console.log(
          "RootDashboard: User not authenticated, redirecting to login",
        );
        navigate("/login?unauthorized=true");
      } else {
        console.log("RootDashboard: User authenticated, loading dashboard");
      }

      setIsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [authManager, navigate]);

  if (isLoading) {
    return <Loading message="Loading Dashboard..." />;
  }

  if (!isAuthenticated) {
    return (
      <div style={globalStyles.container}>
        <Alert type="error">
          Unauthorized Access. Please <Link to="/login">login</Link> to access
          this page.
        </Alert>
      </div>
    );
  }

  const styles = {
    heroSection: {
      backgroundColor: theme.colors.primary,
      color: "white",
      padding: "60px 40px",
      borderRadius: "8px",
      textAlign: "center",
    },
    heroTitle: {
      fontSize: "32px",
      marginBottom: "20px",
      fontWeight: "bold",
    },
    heroDescription: {
      fontSize: "18px",
      marginBottom: "30px",
      opacity: 0.95,
    },
    heroButton: {
      display: "inline-block",
      padding: "12px 30px",
      backgroundColor: "white",
      color: theme.colors.primary,
      textDecoration: "none",
      borderRadius: "4px",
      fontWeight: "bold",
      fontSize: "16px",
      transition: `all ${theme.transitions.fast}`,
    },
    bottomActions: {
      textAlign: "right",
      marginTop: "20px",
      paddingTop: "20px",
      borderTop: "1px solid #e0e0e0",
    },
  };

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={[{ label: "Root Dashboard", icon: "📊" }]} />

      <Card>
        <section style={styles.heroSection}>
          <h1 style={styles.heroTitle}>📋 Organizations</h1>
          <p style={styles.heroDescription}>
            Manage all the organizations in your system
          </p>
          <Link
            to="/root/tenants"
            style={styles.heroButton}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            View Organizations →
          </Link>
        </section>

        <div style={styles.bottomActions}>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: theme.colors.secondary,
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Logout →
          </button>
        </div>
      </Card>
    </div>
  );
}

export default RootDashboardPage;
