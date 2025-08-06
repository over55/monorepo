// File Path: monorepo/web/workery-frontend/src/pages/Root/Dashboard/Page.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager, useTenantManager } from "../../../services/Services";

function RootDashboard() {
  ////
  //// Services.
  ////

  const authManager = useAuthManager();
  const tenantManager = useTenantManager();
  const navigate = useNavigate();

  ////
  //// Component states.
  ////

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  ////
  //// Event handling.
  ////

  const handleLogout = async () => {
    try {
      console.log("RootDashboard: Initiating logout...");
      await authManager.logout();
      console.log("RootDashboard: Logout successful, redirecting to login");
      navigate("/login");
    } catch (error) {
      console.error("RootDashboard: Logout failed:", error);
      // Still redirect to login even if logout API fails
      navigate("/login");
    }
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      // Start the page at the top
      window.scrollTo(0, 0);

      // Check authentication status
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

  ////
  //// Component rendering.
  ////

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h1>Loading Dashboard...</h1>
      </div>
    );
  }

  // Show unauthorized state (shouldn't reach here due to redirect, but just in case)
  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h1>Unauthorized Access</h1>
        <p>
          Please <Link to="/login">login</Link> to access this page.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <section>
        {/* Breadcrumbs */}
        <nav
          aria-label="breadcrumbs"
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li>
              <Link
                to="/root/dashboard"
                aria-current="page"
                style={{ textDecoration: "none" }}
              >
                📊 Root Dashboard
              </Link>
            </li>
          </ul>
        </nav>

        {/* Main Content Box */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "20px",
            backgroundColor: "white",
            marginBottom: "20px",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: "30px" }}>
            <h1 style={{ margin: 0, fontSize: "24px" }}>📊 Root Dashboard</h1>
          </div>

          {/* Organizations Hero Section */}
          <section
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "40px",
              borderRadius: "4px",
              textAlign: "center",
            }}
          >
            <div>
              <h2 style={{ fontSize: "28px", marginBottom: "15px" }}>
                📋 Organizations
              </h2>
              <p style={{ fontSize: "18px", marginBottom: "20px" }}>
                Manage all the organizations in your system:
              </p>
              <Link
                to="/root/tenants"
                style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  backgroundColor: "white",
                  color: "#007bff",
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontWeight: "bold",
                }}
              >
                View Organizations →
              </Link>
            </div>
          </section>
        </div>

        {/* Bottom Page Logout Link */}
        <div style={{ textAlign: "right", color: "#666", marginTop: "20px" }}>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Logout →
          </button>
        </div>

        {/* Debug info in development */}
        {import.meta.env.DEV && (
          <div
            style={{
              marginTop: "40px",
              padding: "20px",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            <h4>Debug Info (Development Only):</h4>
            <ul>
              <li>Authenticated: {isAuthenticated ? "Yes" : "No"}</li>
              <li>Auth Manager Available: {authManager ? "Yes" : "No"}</li>
              <li>Tenant Manager Available: {tenantManager ? "Yes" : "No"}</li>
              <li>Current URL: {window.location.pathname}</li>
            </ul>

            <h5>Available Actions:</h5>
            <ul>
              <li>
                <Link to="/root/tenants">View Tenants List</Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "none",
                    border: "1px solid #ccc",
                    padding: "4px 8px",
                    margin: "0 10px",
                  }}
                >
                  Test Logout
                </button>
              </li>
            </ul>

            <h5>Authentication State:</h5>
            <pre
              style={{
                fontSize: "10px",
                backgroundColor: "#fff",
                padding: "10px",
                borderRadius: "4px",
                overflow: "auto",
              }}
            >
              {JSON.stringify(authManager.getAuthState(), null, 2)}
            </pre>

            <h5>Role Constants Check:</h5>
            <p>
              Check that login redirects are working correctly. Executive role
              should redirect to /root/tenants.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default RootDashboard;
